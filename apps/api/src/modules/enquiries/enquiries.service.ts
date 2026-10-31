import { query, withTransaction } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';

export class EnquiriesService {
  /**
   * Buyer initiates an enquiry on an approved timber listing
   */
  async createEnquiry(buyerId: string, data: {
    listing_id: string;
    quantity: number;
    proposed_price?: number;
    message: string;
    contact_phone?: string;
  }) {
    const listingRes = await query(
      `SELECT id, seller_id, status, quantity FROM timber_listings WHERE id = $1`,
      [data.listing_id]
    );

    const listing = listingRes.rows[0];
    if (!listing) throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    if (listing.status !== 'approved') {
      throw new AppError(400, 'LISTING_NOT_AVAILABLE', 'Enquiries can only be made on approved, active listings.');
    }

    if (listing.seller_id === buyerId) {
      throw new AppError(400, 'SELF_ENQUIRY', 'You cannot create an enquiry on your own listing.');
    }

    return await withTransaction(async (client) => {
      const enqRes = await client.query(
        `INSERT INTO enquiries (listing_id, buyer_id, seller_id, quantity, proposed_price, message, contact_phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          data.listing_id,
          buyerId,
          listing.seller_id,
          data.quantity,
          data.proposed_price || null,
          data.message,
          data.contact_phone || null,
        ]
      );
      const enquiry = enqRes.rows[0];

      // Create linked conversation
      const convRes = await client.query(
        `INSERT INTO conversations (enquiry_id) VALUES ($1) RETURNING id`,
        [enquiry.id]
      );
      const convId = convRes.rows[0].id;

      // Add the opening message
      await client.query(
        `INSERT INTO messages (conversation_id, sender_id, body)
         VALUES ($1, $2, $3)`,
        [convId, buyerId, data.message]
      );

      // Notify seller
      await client.query(
        `INSERT INTO notifications (user_id, category, title_en, title_ml, body_en, body_ml, action_url)
         VALUES ($1, 'enquiry', 'New Timber Enquiry Received', 'പുതിയ തടി അന്വേഷണം ലഭിച്ചു',
                 'A buyer enquired about your timber stock.', 'നിങ്ങളുടെ തടിയെക്കുറിച്ച് പുതിയൊരു അന്വേഷണം ലഭിച്ചിരിക്കുന്നു.',
                 $2)`,
        [listing.seller_id, `/dashboard/seller/enquiries/${enquiry.id}`]
      );

      return enquiry;
    });
  }

  /**
   * Retrieve enquiry with conversation messages & negotiation history
   */
  async getEnquiry(userId: string, enquiryId: string) {
    const enqRes = await query(
      `SELECT e.*,
              l.title as listing_title, l.price_per_cft as listing_price,
              s.name_en as species_name,
              bp.name as buyer_name, sp.name as seller_name,
              c.id as conversation_id
       FROM enquiries e
       JOIN timber_listings l ON l.id = e.listing_id
       JOIN timber_species s ON s.id = l.species_id
       LEFT JOIN user_profiles bp ON bp.user_id = e.buyer_id
       LEFT JOIN user_profiles sp ON sp.user_id = e.seller_id
       LEFT JOIN conversations c ON c.enquiry_id = e.id
       WHERE e.id = $1`,
      [enquiryId]
    );

    const enquiry = enqRes.rows[0];
    if (!enquiry) throw new AppError(404, 'NOT_FOUND', 'Enquiry not found.');

    if (enquiry.buyer_id !== userId && enquiry.seller_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not have permission to view this enquiry.');
    }

    const offersRes = await query(
      `SELECT o.*, up.name as made_by_name
       FROM offers o
       JOIN user_profiles up ON up.user_id = o.made_by
       WHERE o.enquiry_id = $1
       ORDER BY o.created_at ASC`,
      [enquiryId]
    );

    const messagesRes = await query(
      `SELECT m.*, up.name as sender_name
       FROM messages m
       JOIN user_profiles up ON up.user_id = m.sender_id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [enquiry.conversation_id]
    );

    return {
      enquiry,
      offers: offersRes.rows,
      messages: messagesRes.rows,
    };
  }

  /**
   * Create an offer or counteroffer
   */
  async makeOffer(userId: string, enquiryId: string, data: {
    quantity: number;
    price: number;
    message?: string;
    expires_in_hours?: number;
  }) {
    const enqRes = await query(
      `SELECT id, buyer_id, seller_id, status FROM enquiries WHERE id = $1`,
      [enquiryId]
    );
    const enquiry = enqRes.rows[0];
    if (!enquiry) throw new AppError(404, 'NOT_FOUND', 'Enquiry not found.');

    if (enquiry.buyer_id !== userId && enquiry.seller_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You are not a participant in this negotiation.');
    }

    if (['ordered', 'closed'].includes(enquiry.status)) {
      throw new AppError(400, 'NEGOTIATION_CLOSED', 'This enquiry is already closed or ordered.');
    }

    const expiresAt = new Date(Date.now() + (data.expires_in_hours || 48) * 3600 * 1000);

    return await withTransaction(async (client) => {
      // Mark any other pending offers on this enquiry as countered
      await client.query(
        `UPDATE offers SET status = 'countered'
         WHERE enquiry_id = $1 AND status = 'pending'`,
        [enquiryId]
      );

      const offerRes = await client.query(
        `INSERT INTO offers (enquiry_id, made_by, quantity, price, message, expires_at, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [enquiryId, userId, data.quantity, data.price, data.message || null, expiresAt]
      );

      await client.query(
        `UPDATE enquiries SET status = 'offer_made', updated_at = NOW() WHERE id = $1`,
        [enquiryId]
      );

      const targetUserId = userId === enquiry.buyer_id ? enquiry.seller_id : enquiry.buyer_id;

      await client.query(
        `INSERT INTO notifications (user_id, category, title_en, title_ml, body_en, body_ml, action_url)
         VALUES ($1, 'offer', 'New Price Offer Received', 'പുതിയ വില ഓഫർ ലഭിച്ചു',
                 'A new offer was proposed in your timber enquiry.', 'നിങ്ങളുടെ അന്വേഷണത്തിൽ പുതിയ ഓഫർ നൽകിയിരിക്കുന്നു.',
                 $2)`,
        [targetUserId, `/dashboard/enquiries/${enquiryId}`]
      );

      return offerRes.rows[0];
    });
  }

  /**
   * Accept an offer
   */
  async acceptOffer(userId: string, offerId: string) {
    return await withTransaction(async (client) => {
      const offerRes = await client.query(
        `SELECT o.*, e.buyer_id, e.seller_id
         FROM offers o
         JOIN enquiries e ON e.id = o.enquiry_id
         WHERE o.id = $1`,
        [offerId]
      );
      const offer = offerRes.rows[0];
      if (!offer) throw new AppError(404, 'NOT_FOUND', 'Offer not found.');

      if (offer.made_by === userId) {
        throw new AppError(400, 'SELF_ACCEPT', 'You cannot accept your own offer.');
      }

      const isParticipant = userId === offer.buyer_id || userId === offer.seller_id;
      if (!isParticipant) throw new AppError(403, 'FORBIDDEN', 'Unauthorized.');

      // Check offer expiry
      if (offer.expires_at && new Date(offer.expires_at).getTime() < Date.now()) {
        await client.query(
          `UPDATE offers SET status = 'expired' WHERE id = $1`,
          [offerId]
        );
        throw new AppError(400, 'OFFER_EXPIRED', 'This offer has expired and can no longer be accepted.');
      }

      if (offer.status !== 'pending') {
        throw new AppError(400, 'OFFER_NOT_PENDING', `Offer is currently '${offer.status}' and cannot be accepted.`);
      }

      await client.query(
        `UPDATE offers SET status = 'accepted' WHERE id = $1`,
        [offerId]
      );

      // Supercede any other pending offers for this enquiry
      await client.query(
        `UPDATE offers SET status = 'countered' WHERE enquiry_id = $1 AND id != $2 AND status = 'pending'`,
        [offer.enquiry_id, offerId]
      );

      await client.query(
        `UPDATE enquiries SET status = 'accepted', updated_at = NOW() WHERE id = $1`,
        [offer.enquiry_id]
      );

      return { success: true, message: 'Offer accepted. You can now confirm the order.' };
    });
  }

  /**
   * Post message to enquiry conversation
   */
  async sendMessage(userId: string, enquiryId: string, body: string) {
    const enqRes = await query(
      `SELECT e.buyer_id, e.seller_id, c.id as conversation_id
       FROM enquiries e
       JOIN conversations c ON c.enquiry_id = e.id
       WHERE e.id = $1`,
      [enquiryId]
    );

    const enquiry = enqRes.rows[0];
    if (!enquiry) throw new AppError(404, 'NOT_FOUND', 'Enquiry or conversation not found.');

    if (enquiry.buyer_id !== userId && enquiry.seller_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You cannot send messages in this conversation.');
    }

    const res = await query(
      `INSERT INTO messages (conversation_id, sender_id, body)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [enquiry.conversation_id, userId, body]
    );

    return res.rows[0];
  }
}

export const enquiriesService = new EnquiriesService();
