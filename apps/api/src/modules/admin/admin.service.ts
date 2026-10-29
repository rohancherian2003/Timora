import { query, withTransaction } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AdminService {
  /**
   * Log an administrative action to the append-only audit trail
   */
  async logAudit(clientOrPool: { query: typeof query }, entry: {
    actorId: string;
    action: string;
    entityType: string;
    entityId: string;
    prevState?: unknown;
    newState?: unknown;
    reason?: string;
  }) {
    await clientOrPool.query(
      `INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, prev_state, new_state, reason)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.actorId,
        entry.action,
        entry.entityType,
        entry.entityId,
        entry.prevState ? JSON.stringify(entry.prevState) : null,
        entry.newState ? JSON.stringify(entry.newState) : null,
        entry.reason || null,
      ]
    );
  }

  /**
   * Get pending seller and business registration approvals
   */
  async getPendingSellers() {
    const res = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              up.name, d.name_en as district_name,
              sp.business_name, sp.locality, sp.seller_subtype,
              COALESCE(sp.approval_status, 'pending') as approval_status
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN kerala_districts d ON d.id = sp.district_id
       WHERE sp.approval_status IN ('pending', 'PENDING_APPROVAL')
       ORDER BY u.created_at ASC`
    );
    return res.rows;
  }

  /**
   * Get all pending business applications (Sellers, Mills, Carpenters, Transport)
   */
  async getPendingBusinessApplications() {
    const sellersRes = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              up.name, d.name_en as district_name,
              sp.business_name, sp.locality, sp.seller_subtype,
              'seller' as entity_type,
              COALESCE(sp.approval_status, 'PENDING_APPROVAL') as approval_status
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN kerala_districts d ON d.id = sp.district_id
       WHERE sp.approval_status IN ('pending', 'PENDING_APPROVAL')`
    );

    const carpentersRes = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              up.name, d.name_en as district_name,
              COALESCE(cp.business_name, up.name) as business_name, '' as locality,
              'carpenter' as entity_type,
              COALESCE(cp.approval_status, 'PENDING_APPROVAL') as approval_status
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       JOIN carpenter_profiles cp ON cp.user_id = u.id
       LEFT JOIN kerala_districts d ON d.id = cp.district_id
       WHERE cp.approval_status IN ('pending', 'PENDING_APPROVAL')`
    );

    const transportRes = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              up.name, d.name_en as district_name,
              tp.business_name, '' as locality,
              'transport' as entity_type,
              COALESCE(tp.approval_status, 'PENDING_APPROVAL') as approval_status
       FROM users u
       JOIN user_profiles up ON up.user_id = u.id
       JOIN transport_owner_profiles tp ON tp.user_id = u.id
       LEFT JOIN kerala_districts d ON d.id = tp.district_id
       WHERE tp.approval_status IN ('pending', 'PENDING_APPROVAL')`
    );

    return [
      ...sellersRes.rows,
      ...carpentersRes.rows,
      ...transportRes.rows,
    ];
  }

  /**
   * Universal business approval status action (Approve, Reject, Action Required, Suspend)
   */
  async updateBusinessStatus(
    adminId: string,
    params: {
      entityType: 'seller' | 'mill' | 'carpenter' | 'transport';
      entityId: string;
      status: 'APPROVED' | 'REJECTED' | 'ACTION_REQUIRED' | 'SUSPENDED';
      note?: string;
      reason?: string;
    }
  ) {
    const { entityType, entityId, status, note, reason } = params;

    return await withTransaction(async (client) => {
      let targetTable = 'seller_profiles';
      let idColumn = 'user_id';

      if (entityType === 'carpenter') targetTable = 'carpenter_profiles';
      else if (entityType === 'transport') targetTable = 'transport_owner_profiles';
      else if (entityType === 'mill') {
        targetTable = 'timber_mills';
        idColumn = 'id';
      }

      const prev = await client.query(
        `SELECT approval_status FROM ${targetTable} WHERE ${idColumn} = $1`,
        [entityId]
      );
      if (prev.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', `${entityType} record not found.`);
      }

      await client.query(
        `UPDATE ${targetTable}
         SET approval_status = $1, approved_by = $2, approval_note = $3, approved_at = NOW(), updated_at = NOW()
         WHERE ${idColumn} = $4`,
        [status, adminId, reason || note || null, entityId]
      );

      await this.logAudit(client, {
        actorId: adminId,
        action: `SET_STATUS_${status}_${entityType.toUpperCase()}`,
        entityType: targetTable,
        entityId,
        prevState: prev.rows[0],
        newState: { approval_status: status, note: reason || note },
        reason,
      });

      return {
        success: true,
        message: `${entityType} account status updated to ${status}.`,
      };
    });
  }

  /**
   * Approve a seller account
   */
  async approveSeller(adminId: string, sellerId: string, note?: string) {
    return await withTransaction(async (client) => {
      const prev = await client.query(
        `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
        [sellerId]
      );
      if (prev.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Seller profile not found.');

      await client.query(
        `UPDATE seller_profiles
         SET approval_status = 'approved', approved_by = $1, approval_note = $2, approved_at = NOW(), updated_at = NOW()
         WHERE user_id = $3`,
        [adminId, note || null, sellerId]
      );

      await this.logAudit(client, {
        actorId: adminId,
        action: 'APPROVE_SELLER',
        entityType: 'seller_profile',
        entityId: sellerId,
        prevState: prev.rows[0],
        newState: { approval_status: 'approved', note },
      });

      return { success: true, message: 'Seller approved successfully.' };
    });
  }

  /**
   * Reject a seller account
   */
  async rejectSeller(adminId: string, sellerId: string, reason: string) {
    return await withTransaction(async (client) => {
      const prev = await client.query(
        `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
        [sellerId]
      );
      if (prev.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Seller profile not found.');

      await client.query(
        `UPDATE seller_profiles
         SET approval_status = 'rejected', approved_by = $1, approval_note = $2, updated_at = NOW()
         WHERE user_id = $3`,
        [adminId, reason, sellerId]
      );

      await this.logAudit(client, {
        actorId: adminId,
        action: 'REJECT_SELLER',
        entityType: 'seller_profile',
        entityId: sellerId,
        prevState: prev.rows[0],
        newState: { approval_status: 'rejected' },
        reason,
      });

      return { success: true, message: 'Seller registration rejected.' };
    });
  }

  /**
   * Get pending listings awaiting review
   */
  async getPendingListings() {
    const res = await query(
      `SELECT l.*,
              s.name_en as species_name, t.name_en as type_name, d.name_en as district_name,
              up.name as seller_name, u.phone as seller_phone, sp.business_name,
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
       WHERE l.status = 'pending_review'
       GROUP BY l.id, s.id, t.id, d.id, up.name, u.phone, sp.business_name
       ORDER BY l.created_at ASC`
    );
    return res.rows;
  }

  /**
   * Approve a timber listing for public marketplace publication
   */
  async approveListing(adminId: string, listingId: string) {
    return await withTransaction(async (client) => {
      const listingRes = await client.query(
        `SELECT * FROM timber_listings WHERE id = $1`,
        [listingId]
      );
      const listing = listingRes.rows[0];
      if (!listing) throw new AppError(404, 'NOT_FOUND', 'Listing not found.');

      await client.query(
        `UPDATE timber_listings
         SET status = 'approved', approved_by = $1, approved_at = NOW(), rejection_reason = NULL, updated_at = NOW()
         WHERE id = $2`,
        [adminId, listingId]
      );

      // Save approved version snapshot
      await client.query(
        `INSERT INTO listing_approved_versions (listing_id, snapshot)
         VALUES ($1, $2)`,
        [listingId, JSON.stringify(listing)]
      );

      // Record in review history
      await client.query(
        `INSERT INTO listing_review_history (listing_id, reviewed_by, action)
         VALUES ($1, $2, 'approved')`,
        [listingId, adminId]
      );

      await this.logAudit(client, {
        actorId: adminId,
        action: 'APPROVE_LISTING',
        entityType: 'timber_listing',
        entityId: listingId,
        prevState: { status: listing.status },
        newState: { status: 'approved' },
      });

      return { success: true, message: 'Listing approved and published to marketplace.' };
    });
  }

  /**
   * Reject a timber listing with mandatory reason
   */
  async rejectListing(adminId: string, listingId: string, reason: string) {
    return await withTransaction(async (client) => {
      const listingRes = await client.query(
        `SELECT status FROM timber_listings WHERE id = $1`,
        [listingId]
      );
      if (listingRes.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Listing not found.');

      await client.query(
        `UPDATE timber_listings
         SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
         WHERE id = $2`,
        [reason, listingId]
      );

      await client.query(
        `INSERT INTO listing_review_history (listing_id, reviewed_by, action, reason)
         VALUES ($1, $2, 'rejected', $3)`,
        [listingId, adminId, reason]
      );

      await this.logAudit(client, {
        actorId: adminId,
        action: 'REJECT_LISTING',
        entityType: 'timber_listing',
        entityId: listingId,
        reason,
      });

      return { success: true, message: 'Listing rejected with recorded reason.' };
    });
  }

  /**
   * Read append-only audit logs
   */
  async getAuditLogs(limit = 50) {
    const res = await query(
      `SELECT a.*, u.phone as actor_phone, up.name as actor_name
       FROM admin_audit_logs a
       JOIN users u ON u.id = a.actor_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       ORDER BY a.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return res.rows;
  }
}

export const adminService = new AdminService();
