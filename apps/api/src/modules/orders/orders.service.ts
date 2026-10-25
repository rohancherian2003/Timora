import { query, withTransaction } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';

export class OrdersService {
  /**
   * Atomic Order Creation with Concurrency Protection
   * Ensures stock never becomes negative and concurrent orders cannot oversell.
   */
  async createOrder(buyerId: string, data: {
    listing_id: string;
    enquiry_id?: string;
    agreed_qty: number;
    agreed_price: number;
  }) {
    return await withTransaction(async (client) => {
      // 1. Atomically decrement stock with conditional check
      const decrementRes = await client.query(
        `UPDATE timber_listings
         SET quantity = quantity - $1,
             status = CASE WHEN quantity - $1 <= 0 THEN 'out_of_stock' ELSE status END,
             updated_at = NOW()
         WHERE id = $2 AND quantity >= $1 AND status = 'approved'
         RETURNING *`,
        [data.agreed_qty, data.listing_id]
      );

      // If no row updated, either listing not approved or stock insufficient (preventing overselling)
      if (decrementRes.rows.length === 0) {
        throw new AppError(
          409,
          'INSUFFICIENT_STOCK',
          'Insufficient stock available or listing is no longer active. The order could not be completed.'
        );
      }

      const listing = decrementRes.rows[0];

      if (listing.seller_id === buyerId) {
        throw new AppError(400, 'SELF_ORDER', 'You cannot purchase your own timber listing.');
      }

      // 2. Fetch species and district names for immutable snapshot
      const metaRes = await client.query(
        `SELECT s.name_en as species_name, t.name_en as timber_type, d.name_en as district_name,
                sp.business_name, up.name as seller_name
         FROM timber_listings l
         JOIN timber_species s ON s.id = l.species_id
         JOIN timber_types t ON t.id = l.timber_type_id
         JOIN kerala_districts d ON d.id = l.district_id
         JOIN users u ON u.id = l.seller_id
         LEFT JOIN user_profiles up ON up.user_id = u.id
         LEFT JOIN seller_profiles sp ON sp.user_id = u.id
         WHERE l.id = $1`,
        [data.listing_id]
      );
      const meta = metaRes.rows[0];

      // 3. Construct immutable snapshot
      const snapshot = {
        listing_id: listing.id,
        title: listing.title,
        species: meta?.species_name,
        timber_type: meta?.timber_type,
        district: meta?.district_name,
        seller_name: meta?.seller_name,
        business_name: meta?.business_name,
        unit: listing.unit,
        price_per_cft: listing.price_per_cft,
        agreed_qty: data.agreed_qty,
        agreed_price: data.agreed_price,
        dimensions: {
          length_ft: listing.length_ft,
          width_in: listing.width_in,
          thickness_in: listing.thickness_in,
          pieces: listing.pieces,
        },
        ordered_at: new Date().toISOString(),
      };

      // 4. Create order record
      const orderRes = await client.query(
        `INSERT INTO orders (
           listing_id, buyer_id, seller_id, enquiry_id, snapshot, agreed_qty, agreed_price, status
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'confirmed')
         RETURNING *`,
        [
          data.listing_id,
          buyerId,
          listing.seller_id,
          data.enquiry_id || null,
          JSON.stringify(snapshot),
          data.agreed_qty,
          data.agreed_price,
        ]
      );
      const order = orderRes.rows[0];

      // 5. Record order status history
      await client.query(
        `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
         VALUES ($1, 'awaiting_confirmation', 'confirmed', $2, 'Order confirmed after mutual agreement and stock reservation.')`,
        [order.id, buyerId]
      );

      // 6. Update enquiry status if enquiry_id provided
      if (data.enquiry_id) {
        await client.query(
          `UPDATE enquiries SET status = 'ordered', updated_at = NOW() WHERE id = $1`,
          [data.enquiry_id]
        );
      }

      // 7. Notify seller
      await client.query(
        `INSERT INTO notifications (user_id, category, title_en, title_ml, body_en, body_ml, action_url)
         VALUES ($1, 'order', 'New Timber Order Confirmed', 'പുതിയ തടി ഓർഡർ ലഭിച്ചു',
                 'A buyer confirmed an order for your timber.', 'നിങ്ങളുടെ തടിക്ക് പുതിയൊരു ഓർഡർ സ്ഥിരീകരിച്ചിരിക്കുന്നു.',
                 $2)`,
        [listing.seller_id, `/dashboard/seller/orders/${order.id}`]
      );

      return order;
    });
  }

  /**
   * Mutual Delivery Confirmation
   * Order only completes when BOTH buyer and seller confirm delivery.
   */
  async confirmDelivery(userId: string, orderId: string) {
    return await withTransaction(async (client) => {
      const orderRes = await client.query(
        `SELECT * FROM orders WHERE id = $1`,
        [orderId]
      );
      const order = orderRes.rows[0];
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found.');

      const isBuyer = order.buyer_id === userId;
      const isSeller = order.seller_id === userId;
      if (!isBuyer && !isSeller) {
        throw new AppError(403, 'FORBIDDEN', 'You are not an authorized party for this order.');
      }

      const updates: string[] = [];
      if (isBuyer) updates.push('buyer_confirmed = true');
      if (isSeller) updates.push('seller_confirmed = true');

      const nextBuyerConfirmed = isBuyer ? true : order.buyer_confirmed;
      const nextSellerConfirmed = isSeller ? true : order.seller_confirmed;

      const bothConfirmed = nextBuyerConfirmed && nextSellerConfirmed;
      if (bothConfirmed) {
        updates.push("status = 'completed'");
      } else {
        updates.push("status = 'delivered_pending'");
      }

      updates.push('updated_at = NOW()');

      const updatedRes = await client.query(
        `UPDATE orders
         SET ${updates.join(', ')}
         WHERE id = $1
         RETURNING *`,
        [orderId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          order.status,
          bothConfirmed ? 'completed' : 'delivered_pending',
          userId,
          isBuyer ? 'Buyer confirmed successful delivery' : 'Seller confirmed delivery dispatch',
        ]
      );

      return {
        order: updatedRes.rows[0],
        bothConfirmed,
        message: bothConfirmed
          ? 'Order marked as completed! Both parties have confirmed delivery.'
          : 'Delivery confirmation recorded. Waiting for confirmation from the other party.',
      };
    });
  }

  /**
   * Request Cancellation
   */
  async requestCancellation(userId: string, orderId: string, reason: string) {
    return await withTransaction(async (client) => {
      const orderRes = await client.query(
        `SELECT * FROM orders WHERE id = $1`,
        [orderId]
      );
      const order = orderRes.rows[0];
      if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found.');

      if (order.buyer_id !== userId && order.seller_id !== userId) {
        throw new AppError(403, 'FORBIDDEN', 'Unauthorized.');
      }

      if (order.status === 'completed') {
        throw new AppError(400, 'ORDER_COMPLETED', 'Completed orders cannot be cancelled.');
      }

      await client.query(
        `INSERT INTO cancellation_requests (order_id, requested_by, reason)
         VALUES ($1, $2, $3)`,
        [orderId, userId, reason]
      );

      await client.query(
        `UPDATE orders SET status = 'cancellation_requested', updated_at = NOW() WHERE id = $1`,
        [orderId]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
         VALUES ($1, $2, 'cancellation_requested', $3, $4)`,
        [orderId, order.status, userId, `Cancellation requested: ${reason}`]
      );

      return { success: true, message: 'Cancellation request submitted.' };
    });
  }

  /**
   * List user's orders (buyer or seller)
   */
  async getUserOrders(userId: string) {
    const res = await query(
      `SELECT o.*,
              bp.name as buyer_name, sp.name as seller_name,
              l.title as listing_title
       FROM orders o
       JOIN timber_listings l ON l.id = o.listing_id
       LEFT JOIN user_profiles bp ON bp.user_id = o.buyer_id
       LEFT JOIN user_profiles sp ON sp.user_id = o.seller_id
       WHERE o.buyer_id = $1 OR o.seller_id = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );

    return res.rows;
  }
}

export const ordersService = new OrdersService();
