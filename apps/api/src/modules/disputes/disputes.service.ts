import { query, withTransaction } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';

export class DisputesService {
  /**
   * File a dispute for an order
   */
  async createDispute(userId: string, data: { order_id: string; explanation: string }) {
    const orderRes = await query(
      `SELECT id, buyer_id, seller_id, status FROM orders WHERE id = $1`,
      [data.order_id]
    );

    const order = orderRes.rows[0];
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found.');

    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You can only raise disputes on your own orders.');
    }

    return await withTransaction(async (client) => {
      const disputeRes = await client.query(
        `INSERT INTO disputes (order_id, raised_by, explanation, status)
         VALUES ($1, $2, $3, 'open')
         RETURNING *`,
        [data.order_id, userId, data.explanation]
      );

      await client.query(
        `UPDATE orders SET status = 'disputed', updated_at = NOW() WHERE id = $1`,
        [data.order_id]
      );

      await client.query(
        `INSERT INTO order_status_history (order_id, from_status, to_status, changed_by, note)
         VALUES ($1, $2, 'disputed', $3, $4)`,
        [data.order_id, order.status, userId, `Dispute opened: ${data.explanation}`]
      );

      return disputeRes.rows[0];
    });
  }

  /**
   * Admin resolves a dispute
   */
  async resolveDispute(adminId: string, disputeId: string, data: {
    decision: string;
    admin_notes?: string;
    status: 'resolved' | 'closed';
  }) {
    return await withTransaction(async (client) => {
      const disRes = await client.query(
        `SELECT d.*, o.id as order_id, o.status as order_status
         FROM disputes d
         JOIN orders o ON o.id = d.order_id
         WHERE d.id = $1`,
        [disputeId]
      );

      const dispute = disRes.rows[0];
      if (!dispute) throw new AppError(404, 'NOT_FOUND', 'Dispute not found.');

      await client.query(
        `UPDATE disputes
         SET decision = $1, admin_notes = $2, status = $3, updated_at = NOW()
         WHERE id = $4`,
        [data.decision, data.admin_notes || null, data.status, disputeId]
      );

      await client.query(
        `INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, reason)
         VALUES ($1, 'RESOLVE_DISPUTE', 'dispute', $2, $3)`,
        [adminId, disputeId, data.decision]
      );

      return { success: true, message: 'Dispute decision recorded.' };
    });
  }

  /**
   * Post-Order Verified Review Submission
   * Enforces rule: Reviews are only permitted AFTER order completion by mutual delivery confirmation!
   * Exactly 1 review per eligible party per completed order.
   */
  async createReview(reviewerId: string, data: { order_id: string; rating: number; body?: string }) {
    const orderRes = await query(
      `SELECT id, buyer_id, seller_id, status FROM orders WHERE id = $1`,
      [data.order_id]
    );

    const order = orderRes.rows[0];
    if (!order) throw new AppError(404, 'NOT_FOUND', 'Order not found.');

    if (order.status !== 'completed') {
      throw new AppError(
        400,
        'ORDER_NOT_COMPLETED',
        'Reviews can only be submitted after both parties have confirmed delivery and the order is marked completed.'
      );
    }

    const isBuyer = order.buyer_id === reviewerId;
    const isSeller = order.seller_id === reviewerId;
    if (!isBuyer && !isSeller) {
      throw new AppError(403, 'FORBIDDEN', 'You can only review orders you participated in.');
    }

    const revieweeId = isBuyer ? order.seller_id : order.buyer_id;

    // Check duplicate review
    const existing = await query(
      `SELECT id FROM reviews WHERE order_id = $1 AND reviewer_id = $2`,
      [data.order_id, reviewerId]
    );
    if (existing.rows.length > 0) {
      throw new AppError(409, 'DUPLICATE_REVIEW', 'You have already submitted a review for this completed order.');
    }

    const res = await query(
      `INSERT INTO reviews (order_id, reviewer_id, reviewee_id, rating, body)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [data.order_id, reviewerId, revieweeId, data.rating, data.body || null]
    );

    const insertedReview = res.rows[0];

    // Recalculate average rating and count for reviewee
    const statsRes = await query(
      `SELECT AVG(rating)::numeric(3,2) as avg_rating, COUNT(*)::int as total_count
       FROM reviews
       WHERE reviewee_id = $1`,
      [revieweeId]
    );

    const stats = statsRes.rows[0];
    if (stats) {
      const avgRating = parseFloat(stats.avg_rating) || data.rating;
      const count = parseInt(stats.total_count, 10) || 1;

      // Update carpenter_profiles if reviewee is a carpenter
      await query(
        `UPDATE carpenter_profiles 
         SET rating = $1, rating_count = $2, updated_at = NOW() 
         WHERE user_id = $3`,
        [avgRating, count, revieweeId]
      );
    }

    return insertedReview;
  }

  /**
   * Get verified public reviews and calculated ratings for an entity / user
   */
  async getReviewsForEntity(entityId: string) {
    const reviewsRes = await query(
      `SELECT r.id, r.rating, r.body, r.created_at,
              u.role as reviewer_role,
              COALESCE(up.name, 'Verified Buyer') as author_name
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       LEFT JOIN user_profiles up ON up.user_id = r.reviewer_id
       WHERE (r.reviewee_id = $1 OR r.order_id::text = $1)
         AND r.is_moderated = false
       ORDER BY r.created_at DESC`,
      [entityId]
    );

    const statsRes = await query(
      `SELECT COALESCE(AVG(rating)::numeric(3,2), 0.00) as avg_rating, COUNT(*)::int as total_count
       FROM reviews
       WHERE (reviewee_id = $1 OR order_id::text = $1)
         AND is_moderated = false`,
      [entityId]
    );

    const stats = statsRes.rows[0];
    return {
      reviews: reviewsRes.rows.map((r) => ({
        id: r.id,
        author: r.author_name,
        role: r.reviewer_role === 'buyer' ? 'Verified Buyer' : 'Verified Trade Partner',
        rating: Number(r.rating),
        date: new Date(r.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        comment: r.body || 'Verified quality timber transaction.',
        isVerified: true,
      })),
      averageRating: stats ? Number(stats.avg_rating) : 0,
      totalCount: stats ? Number(stats.total_count) : 0,
    };
  }

  /**
   * Submit report against a user, listing, message, or review
   */
  async submitReport(reporterId: string, data: {
    target_type: 'user' | 'listing' | 'message' | 'review';
    target_id: string;
    reason: string;
    details?: string;
  }) {
    const res = await query(
      `INSERT INTO reports (reporter_id, target_type, target_id, reason, details)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [reporterId, data.target_type, data.target_id, data.reason, data.details || null]
    );

    return res.rows[0];
  }
}

export const disputesService = new DisputesService();
