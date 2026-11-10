import { query, withTransaction } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { deleteListingImage } from '../../utils/storage.js';
import { notificationsService } from '../notifications/notifications.service.js';

function deduplicateListingImages(listing: any) {
  if (!listing) return listing;
  if (Array.isArray(listing.images)) {
    const seen = new Set<string>();
    listing.images = listing.images.filter((img: any) => {
      const key = img?.url || img?.id;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  return listing;
}

export class ListingsService {
  /**
   * Search and filter approved timber listings (public)
   */
  async searchListings(filters: {
    species_id?: number;
    timber_type_id?: number;
    district_id?: number;
    min_price?: number;
    max_price?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, parseInt(String(filters.page || 1), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(filters.limit || 8), 10) || 8));
    const offset = (page - 1) * limit;

    const conditions: string[] = [
      "l.status IN ('approved', 'sold')",
      "(sp.approval_status = 'approved' OR sp.approval_status = 'APPROVED')",
    ];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters.species_id) {
      conditions.push(`l.species_id = $${paramIndex++}`);
      params.push(filters.species_id);
    }
    if (filters.timber_type_id) {
      conditions.push(`l.timber_type_id = $${paramIndex++}`);
      params.push(filters.timber_type_id);
    }
    if (filters.district_id) {
      conditions.push(`l.district_id = $${paramIndex++}`);
      params.push(filters.district_id);
    }
    if (filters.min_price != null) {
      conditions.push(`l.price_per_cft >= $${paramIndex++}`);
      params.push(filters.min_price);
    }
    if (filters.max_price != null) {
      conditions.push(`l.price_per_cft <= $${paramIndex++}`);
      params.push(filters.max_price);
    }
    if (filters.search) {
      conditions.push(`(l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`);
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    const countRes = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT l.id)
       FROM timber_listings l
       JOIN users u ON u.id = l.seller_id
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await query(
      `SELECT l.*,
              s.name_en as species_name_en, s.name_ml as species_name_ml, s.slug as species_slug,
              t.name_en as type_name_en, t.name_ml as type_name_ml, t.slug as type_slug,
              d.name_en as district_name_en, d.name_ml as district_name_ml,
              sp.business_name, sp.approval_status as seller_verified,
              up.name as seller_name,
              COALESCE(
                json_agg(
                  json_build_object('id', img.id, 'url', img.url, 'is_primary', img.is_primary)
                ) FILTER (WHERE img.id IS NOT NULL), '[]'
              ) as images
       FROM timber_listings l
       JOIN timber_species s ON s.id = l.species_id
       JOIN timber_types t ON t.id = l.timber_type_id
       JOIN kerala_districts d ON d.id = l.district_id
       JOIN users u ON u.id = l.seller_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN listing_images img ON img.listing_id = l.id
       WHERE ${whereClause}
       GROUP BY l.id, s.id, t.id, d.id, sp.business_name, sp.approval_status, up.name
       ORDER BY l.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    const listings = dataRes.rows.map(deduplicateListingImages);
    return {
      listings,
      items: listings,
      total,
      totalItems: total,
      page,
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get listing by ID (increments view count)
   */
  async getListingById(id: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) {
      throw new AppError(404, 'NOT_FOUND', 'Timber listing not found.');
    }

    await query(`UPDATE timber_listings SET view_count = view_count + 1 WHERE id = $1`, [id]);

    const res = await query(
      `SELECT l.*,
              s.name_en as species_name_en, s.name_ml as species_name_ml,
              t.name_en as type_name_en, t.name_ml as type_name_ml,
              d.name_en as district_name_en, d.name_ml as district_name_ml,
              sp.business_name, sp.approval_status as seller_status,
              up.name as seller_name, u.phone as seller_phone,
              COALESCE(
                json_agg(
                  json_build_object('id', img.id, 'url', img.url, 'is_primary', img.is_primary)
                ) FILTER (WHERE img.id IS NOT NULL), '[]'
              ) as images
       FROM timber_listings l
       JOIN timber_species s ON s.id = l.species_id
       JOIN timber_types t ON t.id = l.timber_type_id
       JOIN kerala_districts d ON d.id = l.district_id
       JOIN users u ON u.id = l.seller_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN listing_images img ON img.listing_id = l.id
       WHERE l.id = $1
       GROUP BY l.id, s.id, t.id, d.id, sp.business_name, sp.approval_status, up.name, u.phone`,
      [id]
    );

    const listing = res.rows[0];
    if (!listing || listing.status === 'deleted') {
      throw new AppError(404, 'NOT_FOUND', 'Timber listing not found.');
    }

    return deduplicateListingImages(listing);
  }

  /**
   * Create new listing (Seller only - requires approved seller status)
   */
  async createListing(sellerId: string, data: Record<string, unknown>) {
    // Check seller approval status
    const sellerCheck = await query(
      `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
      [sellerId]
    );

    const status = sellerCheck.rows[0]?.approval_status?.toLowerCase();
    if (status && status !== 'approved') {
      throw new AppError(
        403,
        'SELLER_NOT_APPROVED',
        'Your seller account is awaiting Admin approval. Unapproved sellers cannot create marketplace listings.'
      );
    }

    let res;
    try {
      res = await query(
        `INSERT INTO timber_listings (
           seller_id, title, species_id, timber_type_id, district_id, locality,
           quantity, unit, price_per_cft, pricing_mode, length_ft, width_in,
           thickness_in, diameter_in, pieces, is_dried, moisture_pct, has_cracks,
           condition_notes, description, status, approval_status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending_review', 'pending'
         ) RETURNING *`,
        [
          sellerId,
          data.title,
          data.species_id,
          data.timber_type_id,
          data.district_id,
          data.locality || null,
          data.quantity,
          data.unit || 'cft',
          data.price_per_cft,
          data.pricing_mode || 'fixed',
          data.length_ft || null,
          data.width_in || null,
          data.thickness_in || null,
          data.diameter_in || null,
          data.pieces || null,
          data.is_dried || null,
          data.moisture_pct || null,
          data.has_cracks || null,
          data.condition_notes || null,
          data.description || null,
        ]
      );
    } catch {
      // Fallback if approval_status column does not exist yet
      res = await query(
        `INSERT INTO timber_listings (
           seller_id, title, species_id, timber_type_id, district_id, locality,
           quantity, unit, price_per_cft, pricing_mode, length_ft, width_in,
           thickness_in, diameter_in, pieces, is_dried, moisture_pct, has_cracks,
           condition_notes, description, status
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, 'pending_review'
         ) RETURNING *`,
        [
          sellerId,
          data.title,
          data.species_id,
          data.timber_type_id,
          data.district_id,
          data.locality || null,
          data.quantity,
          data.unit || 'cft',
          data.price_per_cft,
          data.pricing_mode || 'fixed',
          data.length_ft || null,
          data.width_in || null,
          data.thickness_in || null,
          data.diameter_in || null,
          data.pieces || null,
          data.is_dried || null,
          data.moisture_pct || null,
          data.has_cracks || null,
          data.condition_notes || null,
          data.description || null,
        ]
      );
    }

    const createdListing = res.rows[0];

    // Emit in-dashboard notification to all Super Admin users
    try {
      const adminUsers = await query(
        `SELECT id FROM users WHERE role IN ('admin', 'super_admin')`
      );
      for (const admin of adminUsers.rows) {
        notificationsService.dispatch({
          userId: admin.id,
          category: 'listing',
          title_en: 'New Timber Listing Submitted for Review',
          title_ml: 'പുതിയ തടി ലിസ്റ്റിംഗ് അവലോകനത്തിനായി സമർപ്പിച്ചു',
          body_en: `New timber stock "${data.title}" submitted by seller. Awaiting Admin Approval.`,
          body_ml: `വിൽപ്പനക്കാരൻ "${data.title}" എന്ന പുതിയ ലിസ്റ്റിംഗ് സമർപ്പിച്ചു. അഡ്മിൻ അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു.`,
          action_url: '/admin',
        }).catch(() => {});
      }
    } catch (notifErr) {
      console.warn('Could not dispatch admin listing notification:', notifErr);
    }

    return createdListing;
  }

  /**
   * Update stock & price directly (does not require full re-review)
   */
  async updateStock(sellerId: string, listingId: string, quantity: number, pricePerCft?: number) {
    const listing = await query(
      `SELECT id, seller_id FROM timber_listings WHERE id = $1`,
      [listingId]
    );

    if (listing.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }

    if (listing.rows[0]?.seller_id !== sellerId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this listing.');
    }

    const updates: string[] = ['quantity = $1'];
    const params: unknown[] = [quantity];
    let idx = 2;

    if (pricePerCft != null) {
      updates.push(`price_per_cft = $${idx++}`);
      params.push(pricePerCft);
    }

    params.push(listingId);

    const res = await query(
      `UPDATE timber_listings
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${idx}
       RETURNING id, title, quantity, price_per_cft, status, updated_at`,
      params
    );

    return res.rows[0];
  }

  /**
   * Submit draft or rejected listing for Admin approval
   */
  async submitForReview(sellerId: string, listingId: string) {
    const listingRes = await query(
      `SELECT l.id, l.seller_id, l.status,
              (SELECT COUNT(*) FROM listing_images WHERE listing_id = l.id) as image_count
       FROM timber_listings l
       WHERE l.id = $1`,
      [listingId]
    );

    const listing = listingRes.rows[0];
    if (!listing) {
      throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }

    if (listing.seller_id !== sellerId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this listing.');
    }

    if (!['draft', 'rejected'].includes(listing.status)) {
      throw new AppError(400, 'INVALID_STATE', `Listing in '${listing.status}' state cannot be submitted for review.`);
    }

    const imageCount = parseInt(listing.image_count, 10);
    if (imageCount < 1) {
      throw new AppError(400, 'IMAGE_REQUIRED', 'At least one actual photograph of the timber stock is required for submission.');
    }

    const updated = await query(
      `UPDATE timber_listings
       SET status = 'pending_review', rejection_reason = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, status, updated_at`,
      [listingId]
    );

    return updated.rows[0];
  }

  /**
   * Add image to listing
   */
  async addListingImage(
    sellerId: string,
    listingId: string,
    image: { storageKey: string; publicUrl: string }
  ) {
    const listing = await query(
      `SELECT seller_id FROM timber_listings WHERE id = $1`,
      [listingId]
    );

    if (listing.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }

    if (listing.rows[0]?.seller_id !== sellerId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this listing.');
    }

    // Check maximum images (8)
    const countRes = await query<{ count: string }>(
      `SELECT COUNT(*) FROM listing_images WHERE listing_id = $1`,
      [listingId]
    );
    if (parseInt(countRes.rows[0]?.count || '0', 10) >= 8) {
      throw new AppError(400, 'MAX_IMAGES', 'Maximum 8 photographs allowed per timber listing.');
    }

    const isPrimary = parseInt(countRes.rows[0]?.count || '0', 10) === 0;

    const res = await query(
      `INSERT INTO listing_images (listing_id, storage_key, url, is_primary)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [listingId, image.storageKey, image.publicUrl, isPrimary]
    );

    return res.rows[0];
  }

  /**
   * Remove image from listing
   */
  async removeListingImage(sellerId: string, listingId: string, imageId: string) {
    const res = await query(
      `DELETE FROM listing_images
       WHERE id = $1 AND listing_id = $2
         AND listing_id IN (SELECT id FROM timber_listings WHERE seller_id = $3)
       RETURNING storage_key`,
      [imageId, listingId, sellerId]
    );

    if (res.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Image not found or you are not authorized to delete it.');
    }

    return res.rows[0];
  }

  /**
   * Replace existing listing image
   */
  async replaceListingImage(
    sellerId: string,
    listingId: string,
    imageId: string,
    newImage: { storageKey: string; publicUrl: string }
  ) {
    const listing = await query(
      `SELECT seller_id FROM timber_listings WHERE id = $1`,
      [listingId]
    );

    if (listing.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
    }

    if (listing.rows[0]?.seller_id !== sellerId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this listing.');
    }

    const existing = await query(
      `SELECT id, storage_key, is_primary FROM listing_images WHERE id = $1 AND listing_id = $2`,
      [imageId, listingId]
    );

    if (existing.rows.length === 0) {
      throw new AppError(404, 'NOT_FOUND', 'Image not found on this listing.');
    }

    const oldStorageKey = existing.rows[0]?.storage_key;

    const res = await query(
      `UPDATE listing_images
       SET storage_key = $1, url = $2
       WHERE id = $3 AND listing_id = $4
       RETURNING *`,
      [newImage.storageKey, newImage.publicUrl, imageId, listingId]
    );

    return {
      ...res.rows[0],
      old_storage_key: oldStorageKey,
    };
  }

  /**
   * Retrieve all listings belonging to a seller (excluding deleted)
   */
  async getSellerListings(sellerId: string) {
    const res = await query(
      `SELECT l.*,
              s.name_en as species_name_en, s.name_ml as species_name_ml,
              t.name_en as type_name_en, t.name_ml as type_name_ml,
              d.name_en as district_name_en, d.name_ml as district_name_ml,
              COALESCE(
                json_agg(
                  json_build_object('id', img.id, 'url', img.url, 'is_primary', img.is_primary)
                ) FILTER (WHERE img.id IS NOT NULL), '[]'
              ) as images
       FROM timber_listings l
       JOIN timber_species s ON s.id = l.species_id
       JOIN timber_types t ON t.id = l.timber_type_id
       JOIN kerala_districts d ON d.id = l.district_id
       LEFT JOIN listing_images img ON img.listing_id = l.id
       WHERE l.seller_id = $1 AND l.status != 'deleted'
       GROUP BY l.id, s.id, t.id, d.id
       ORDER BY l.created_at DESC`,
      [sellerId]
    );

    return res.rows.map(deduplicateListingImages);
  }

  /**
   * Delete / remove a timber listing (Seller owner or Super Admin only)
   */
  async deleteListing(userId: string, userRole: string, listingId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId);
    if (!isUuid) {
      throw new AppError(404, 'NOT_FOUND', 'Timber listing not found.');
    }

    const listingRes = await query(
      `SELECT id, seller_id, status, title FROM timber_listings WHERE id = $1`,
      [listingId]
    );

    const listing = listingRes.rows[0];
    if (!listing || listing.status === 'deleted') {
      throw new AppError(404, 'NOT_FOUND', 'Timber listing not found.');
    }
    const isOwner = listing.seller_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError(403, 'FORBIDDEN', 'You are not authorized to delete this timber listing.');
    }

    const updateRes = await query(
      `UPDATE timber_listings
       SET status = 'deleted', updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, status, updated_at`,
      [listingId]
    );

    // Clean up associated images in DB and storage
    const imgRes = await query<{ storage_key: string }>(
      `DELETE FROM listing_images WHERE listing_id = $1 RETURNING storage_key`,
      [listingId]
    ).catch(() => ({ rows: [] }));
    if (imgRes && imgRes.rows) {
      for (const row of imgRes.rows) {
        if (row.storage_key) {
          deleteListingImage(row.storage_key).catch(() => {});
        }
      }
    }

    // Record review history event
    await query(
      `INSERT INTO listing_review_history (listing_id, reviewed_by, action, reason)
       VALUES ($1, $2, 'deleted', $3)`,
      [listingId, userId, isAdmin ? 'Purged by Super Admin' : 'Deleted by Seller']
    ).catch(() => {});

    // If deleted by admin, record audit log
    if (isAdmin) {
      await query(
        `INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, reason)
         VALUES ($1, 'DELETE_LISTING', 'timber_listing', $2, $3)`,
        [userId, listingId, `Timber listing "${listing.title}" purged by admin`]
      ).catch(() => {});
    }

    return updateRes.rows[0];
  }

  /**
   * Mark a timber listing as sold (Seller owner or Super Admin)
   */
  async markAsSold(userId: string, userRole: string, listingId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId);
    if (!isUuid) {
      throw new AppError(404, 'NOT_FOUND', 'Timber listing not found.');
    }

    const listingRes = await query(
      `SELECT id, seller_id, status, title FROM timber_listings WHERE id = $1`,
      [listingId]
    );

    const listing = listingRes.rows[0];
    if (!listing || listing.status === 'deleted') {
      throw new AppError(404, 'NOT_FOUND', 'Timber listing not found.');
    }

    const isOwner = listing.seller_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError(403, 'FORBIDDEN', 'You are not authorized to mark this listing as sold.');
    }

    const updateRes = await query(
      `UPDATE timber_listings
       SET status = 'sold', updated_at = NOW()
       WHERE id = $1
       RETURNING id, title, status, quantity, price_per_cft, updated_at`,
      [listingId]
    );

    return updateRes.rows[0];
  }
}

export const listingsService = new ListingsService();
