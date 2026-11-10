import { query, withTransaction } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { notificationsService } from '../notifications/notifications.service.js';

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
    return this.getPendingBusinessApplications();
  }

  /**
   * Get all pending business applications (Sellers, Mills, Carpenters, Transport)
   */
  async getPendingBusinessApplications() {
    const sellersRes = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              COALESCE(up.name, '') as name, d.name_en as district_name,
              COALESCE(tm.mill_name, sp.business_name, up.name, '') as business_name,
              COALESCE(tm.locality, sp.locality, '') as locality,
              sp.seller_subtype,
              'seller' as entity_type,
              COALESCE(sp.approval_status, tm.approval_status, 'PENDING_APPROVAL') as approval_status
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN seller_profiles sp ON sp.user_id = u.id
       LEFT JOIN timber_mills tm ON tm.owner_id = u.id
       LEFT JOIN kerala_districts d ON d.id = COALESCE(tm.district_id, sp.district_id, up.district_id)
       WHERE sp.approval_status IN ('pending', 'PENDING_APPROVAL')
          OR tm.approval_status IN ('pending', 'PENDING_APPROVAL')`
    );

    const carpentersRes = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              COALESCE(up.name, '') as name, d.name_en as district_name,
              COALESCE(cp.business_name, up.name, '') as business_name, '' as locality,
              NULL::text as seller_subtype,
              'carpenter' as entity_type,
              COALESCE(cp.approval_status, 'PENDING_APPROVAL') as approval_status
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN carpenter_profiles cp ON cp.user_id = u.id
       LEFT JOIN kerala_districts d ON d.id = COALESCE(cp.district_id, up.district_id)
       WHERE cp.approval_status IN ('pending', 'PENDING_APPROVAL')`
    );

    const transportRes = await query(
      `SELECT u.id, u.phone, u.role, u.created_at,
              COALESCE(up.name, '') as name, d.name_en as district_name,
              COALESCE(tp.business_name, up.name, '') as business_name, '' as locality,
              NULL::text as seller_subtype,
              'transport' as entity_type,
              COALESCE(tp.approval_status, 'PENDING_APPROVAL') as approval_status
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       JOIN transport_owner_profiles tp ON tp.user_id = u.id
       LEFT JOIN kerala_districts d ON d.id = COALESCE(tp.district_id, up.district_id)
       WHERE tp.approval_status IN ('pending', 'PENDING_APPROVAL')`
    );

    const all = [
      ...sellersRes.rows,
      ...carpentersRes.rows,
      ...transportRes.rows,
    ];

    all.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    return all;
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

      // Dispatch in-dashboard notification to user
      const targetUserId = entityType === 'mill'
        ? (await client.query('SELECT owner_id FROM timber_mills WHERE id = $1', [entityId])).rows[0]?.owner_id
        : entityId;

      if (targetUserId) {
        notificationsService.dispatch({
          userId: targetUserId,
          category: 'verification',
          title_en: `Business Verification: ${status}`,
          title_ml: `അക്കൗണ്ട് പരിശോധനാ ഫലം: ${status === 'APPROVED' ? 'അംഗീകരിച്ചു' : 'പരിശോധനയിൽ'}`,
          body_en: reason || note || `Your Timora account status is now ${status}.`,
          body_ml: reason || note || `നിങ്ങളുടെ ടിമോറ അക്കൗണ്ട് സ്റ്റാറ്റസ് ${status} ആയി അപ്ഡേറ്റ് ചെയ്തിട്ടുണ്ട്.`,
          action_url: `/dashboard/${entityType === 'mill' ? 'mill' : entityType}`,
        }).catch(() => {});
      }

      return {
        success: true,
        message: `${entityType} account status updated to ${status}.`,
      };
    });
  }

  /**
   * Approve a business account (Seller, Mill, Carpenter, Transport)
   */
  async approveSeller(adminId: string, sellerId: string, note?: string) {
    return await withTransaction(async (client) => {
      // 1. Look up user to check role, or check if ID is a timber mill ID or demo ID
      let resolvedUserId = sellerId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId);
      let userRes = { rows: [] as any[] };

      if (isUuid) {
        userRes = await client.query(
          `SELECT id, role FROM users WHERE id = $1`,
          [resolvedUserId]
        );
        if (userRes.rows.length === 0) {
          const millRes = await client.query(
            `SELECT owner_id FROM timber_mills WHERE id = $1`,
            [sellerId]
          );
          if (millRes.rows.length > 0) {
            resolvedUserId = millRes.rows[0].owner_id;
            userRes = await client.query(
              `SELECT id, role FROM users WHERE id = $1`,
              [resolvedUserId]
            );
          }
        }
      }

      // If not found by direct UUID, resolve by demo mapping or phone
      if (userRes.rows.length === 0) {
        const demoPhoneMap: Record<string, string> = {
          'app-sel-1': '+919847120001',
          'app-mil-1': '+919847120002',
          'app-car-1': '+919847330001',
          'app-tra-1': '+919847440001',
        };
        const targetPhone = demoPhoneMap[sellerId] || sellerId;
        const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
        userRes = await client.query(
          `SELECT id, role FROM users WHERE phone = $1 OR phone LIKE $2`,
          [targetPhone, `%${cleanDigits}`]
        );
        if (userRes.rows.length > 0) {
          resolvedUserId = userRes.rows[0].id;
        }
      }

      if (userRes.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'User record not found.');
      }

      const user = userRes.rows[0];
      const role = user.role;

      if (role === 'seller') {
        const prev = await client.query(
          `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
          [resolvedUserId]
        );
        if (prev.rows.length === 0) {
          throw new AppError(404, 'NOT_FOUND', 'Seller profile not found.');
        }

        await client.query(
          `UPDATE seller_profiles
           SET approval_status = 'approved', approved_by = $1, approval_note = $2, approved_at = NOW(), updated_at = NOW()
           WHERE user_id = $3`,
          [adminId, note || null, resolvedUserId]
        );

        // Also update timber_mills if associated with this seller
        await client.query(
          `UPDATE timber_mills
           SET approval_status = 'approved', approved_by = $1, approval_note = $2, approved_at = NOW(), updated_at = NOW()
           WHERE owner_id = $3`,
          [adminId, note || null, resolvedUserId]
        );

        await this.logAudit(client, {
          actorId: adminId,
          action: 'APPROVE_SELLER',
          entityType: 'seller_profile',
          entityId: resolvedUserId,
          prevState: prev.rows[0],
          newState: { approval_status: 'approved', note },
        });

        // In-dashboard notification to seller
        notificationsService.dispatch({
          userId: resolvedUserId,
          category: 'verification',
          title_en: 'Seller Account Approved',
          title_ml: 'കച്ചവട അക്കൗണ്ട് അംഗീകരിച്ചു',
          body_en: note || 'Your seller registration has been approved. You can now post timber listings.',
          body_ml: note || 'നിങ്ങളുടെ വിൽപ്പന അക്കൗണ്ട് അംഗീകരിച്ചു. ഇനി തടി ലിസ്റ്റിംഗുകൾ ചേർക്കാം.',
          action_url: '/dashboard/seller',
        }).catch(() => {});

        return { success: true, message: 'Seller approved successfully.' };
      } else if (role === 'carpenter') {
        const prev = await client.query(
          `SELECT approval_status FROM carpenter_profiles WHERE user_id = $1`,
          [resolvedUserId]
        );
        if (prev.rows.length === 0) {
          throw new AppError(404, 'NOT_FOUND', 'Carpenter profile not found.');
        }

        await client.query(
          `UPDATE carpenter_profiles
           SET approval_status = 'approved', is_admin_verified = true, approved_by = $1, approval_note = $2, approved_at = NOW(), updated_at = NOW()
           WHERE user_id = $3`,
          [adminId, note || null, resolvedUserId]
        );

        await this.logAudit(client, {
          actorId: adminId,
          action: 'APPROVE_CARPENTER',
          entityType: 'carpenter_profile',
          entityId: resolvedUserId,
          prevState: prev.rows[0],
          newState: { approval_status: 'approved', note },
        });

        // In-dashboard notification to carpenter
        notificationsService.dispatch({
          userId: resolvedUserId,
          category: 'verification',
          title_en: 'Carpenter Account Approved',
          title_ml: 'ആശാരി അക്കൗണ്ട് അംഗീകരിച്ചു',
          body_en: note || 'Your carpenter registration has been approved. You can now showcase your portfolio and receive work orders.',
          body_ml: note || 'നിങ്ങളുടെ ആശാരി അക്കൗണ്ട് അംഗീകരിച്ചു. ഇനി ജോലികൾ സ്വീകരിക്കാം.',
          action_url: '/dashboard/carpenter',
        }).catch(() => {});

        return { success: true, message: 'Carpenter approved successfully.' };
      } else if (role === 'transport') {
        const prev = await client.query(
          `SELECT approval_status FROM transport_owner_profiles WHERE user_id = $1`,
          [resolvedUserId]
        );
        if (prev.rows.length === 0) {
          throw new AppError(404, 'NOT_FOUND', 'Transport owner profile not found.');
        }

        await client.query(
          `UPDATE transport_owner_profiles
           SET approval_status = 'approved', approved_by = $1, approval_note = $2, approved_at = NOW(), updated_at = NOW()
           WHERE user_id = $3`,
          [adminId, note || null, resolvedUserId]
        );

        await this.logAudit(client, {
          actorId: adminId,
          action: 'APPROVE_TRANSPORT',
          entityType: 'transport_owner_profile',
          entityId: resolvedUserId,
          prevState: prev.rows[0],
          newState: { approval_status: 'approved', note },
        });

        // In-dashboard notification to transport owner
        notificationsService.dispatch({
          userId: resolvedUserId,
          category: 'verification',
          title_en: 'Transport Partner Account Approved',
          title_ml: 'ട്രാൻസ്പോർട്ട് അക്കൗണ്ട് അംഗീകരിച്ചു',
          body_en: note || 'Your transport partner registration has been approved. You can now view and bid on transit jobs.',
          body_ml: note || 'നിങ്ങളുടെ ട്രാൻസ്പോർട്ട് അക്കൗണ്ട് അംഗീകരിച്ചു. ഇനി ട്രിപ്പുകൾ ഏറ്റെടുക്കാം.',
          action_url: '/dashboard/transport',
        }).catch(() => {});

        return { success: true, message: 'Transport owner approved successfully.' };
      } else {
        throw new AppError(400, 'INVALID_ROLE', `User with role "${role}" is not a pending business account.`);
      }
    });
  }

  /**
   * Reject a business account (Seller, Mill, Carpenter, Transport)
   */
  async rejectSeller(adminId: string, sellerId: string, reason: string) {
    return await withTransaction(async (client) => {
      // 1. Look up user to check role, or check if ID is a timber mill ID or demo ID
      let resolvedUserId = sellerId;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sellerId);
      let userRes = { rows: [] as any[] };

      if (isUuid) {
        userRes = await client.query(
          `SELECT id, role FROM users WHERE id = $1`,
          [resolvedUserId]
        );
        if (userRes.rows.length === 0) {
          const millRes = await client.query(
            `SELECT owner_id FROM timber_mills WHERE id = $1`,
            [sellerId]
          );
          if (millRes.rows.length > 0) {
            resolvedUserId = millRes.rows[0].owner_id;
            userRes = await client.query(
              `SELECT id, role FROM users WHERE id = $1`,
              [resolvedUserId]
            );
          }
        }
      }

      // If not found by direct UUID, resolve by demo mapping or phone
      if (userRes.rows.length === 0) {
        const demoPhoneMap: Record<string, string> = {
          'app-sel-1': '+919847120001',
          'app-mil-1': '+919847120002',
          'app-car-1': '+919847330001',
          'app-tra-1': '+919847440001',
        };
        const targetPhone = demoPhoneMap[sellerId] || sellerId;
        const cleanDigits = targetPhone.replace(/\D/g, '').slice(-10);
        userRes = await client.query(
          `SELECT id, role FROM users WHERE phone = $1 OR phone LIKE $2`,
          [targetPhone, `%${cleanDigits}`]
        );
        if (userRes.rows.length > 0) {
          resolvedUserId = userRes.rows[0].id;
        }
      }

      if (userRes.rows.length === 0) {
        throw new AppError(404, 'NOT_FOUND', 'User record not found.');
      }

      const user = userRes.rows[0];
      const role = user.role;

      if (role === 'seller') {
        const prev = await client.query(
          `SELECT approval_status FROM seller_profiles WHERE user_id = $1`,
          [resolvedUserId]
        );
        if (prev.rows.length === 0) {
          throw new AppError(404, 'NOT_FOUND', 'Seller profile not found.');
        }

        await client.query(
          `UPDATE seller_profiles
           SET approval_status = 'rejected', approved_by = $1, approval_note = $2, updated_at = NOW()
           WHERE user_id = $3`,
          [adminId, reason, resolvedUserId]
        );

        // Also update timber_mills if associated with this seller
        await client.query(
          `UPDATE timber_mills
           SET approval_status = 'rejected', approved_by = $1, approval_note = $2, updated_at = NOW()
           WHERE owner_id = $3`,
          [adminId, reason, resolvedUserId]
        );

        await this.logAudit(client, {
          actorId: adminId,
          action: 'REJECT_SELLER',
          entityType: 'seller_profile',
          entityId: resolvedUserId,
          prevState: prev.rows[0],
          newState: { approval_status: 'rejected' },
          reason,
        });

        // In-dashboard notification to seller
        notificationsService.dispatch({
          userId: resolvedUserId,
          category: 'verification',
          title_en: 'Seller Registration Not Approved',
          title_ml: 'കച്ചവട അപേക്ഷ നിരസിച്ചു',
          body_en: `Your seller registration was rejected. Reason: ${reason}`,
          body_ml: `നിങ്ങളുടെ അപേക്ഷ നിരസിക്കപ്പെട്ടു. കാരണം: ${reason}`,
          action_url: '/dashboard/seller',
        }).catch(() => {});

        return { success: true, message: 'Seller registration rejected.' };
      } else if (role === 'carpenter') {
        const prev = await client.query(
          `SELECT approval_status FROM carpenter_profiles WHERE user_id = $1`,
          [resolvedUserId]
        );
        if (prev.rows.length === 0) {
          throw new AppError(404, 'NOT_FOUND', 'Carpenter profile not found.');
        }

        await client.query(
          `UPDATE carpenter_profiles
           SET approval_status = 'rejected', is_admin_verified = false, approved_by = $1, approval_note = $2, updated_at = NOW()
           WHERE user_id = $3`,
          [adminId, reason, resolvedUserId]
        );

        await this.logAudit(client, {
          actorId: adminId,
          action: 'REJECT_CARPENTER',
          entityType: 'carpenter_profile',
          entityId: resolvedUserId,
          prevState: prev.rows[0],
          newState: { approval_status: 'rejected' },
          reason,
        });

        // In-dashboard notification to carpenter
        notificationsService.dispatch({
          userId: resolvedUserId,
          category: 'verification',
          title_en: 'Carpenter Registration Not Approved',
          title_ml: 'ആശാരി അപേക്ഷ നിരസിച്ചു',
          body_en: `Your carpenter registration was rejected. Reason: ${reason}`,
          body_ml: `നിങ്ങളുടെ അപേക്ഷ നിരസിക്കപ്പെട്ടു. കാരണം: ${reason}`,
          action_url: '/dashboard/carpenter',
        }).catch(() => {});

        return { success: true, message: 'Carpenter registration rejected.' };
      } else if (role === 'transport') {
        const prev = await client.query(
          `SELECT approval_status FROM transport_owner_profiles WHERE user_id = $1`,
          [resolvedUserId]
        );
        if (prev.rows.length === 0) {
          throw new AppError(404, 'NOT_FOUND', 'Transport owner profile not found.');
        }

        await client.query(
          `UPDATE transport_owner_profiles
           SET approval_status = 'rejected', approved_by = $1, approval_note = $2, updated_at = NOW()
           WHERE user_id = $3`,
          [adminId, reason, resolvedUserId]
        );

        await this.logAudit(client, {
          actorId: adminId,
          action: 'REJECT_TRANSPORT',
          entityType: 'transport_owner_profile',
          entityId: resolvedUserId,
          prevState: prev.rows[0],
          newState: { approval_status: 'rejected' },
          reason,
        });

        // In-dashboard notification to transport owner
        notificationsService.dispatch({
          userId: resolvedUserId,
          category: 'verification',
          title_en: 'Transport Partner Registration Not Approved',
          title_ml: 'ട്രാൻസ്പോർട്ട് അപേക്ഷ നിരസിച്ചു',
          body_en: `Your transport partner registration was rejected. Reason: ${reason}`,
          body_ml: `നിങ്ങളുടെ അപേക്ഷ നിരസിക്കപ്പെട്ടു. കാരണം: ${reason}`,
          action_url: '/dashboard/transport',
        }).catch(() => {});

        return { success: true, message: 'Transport owner registration rejected.' };
      } else {
        throw new AppError(400, 'INVALID_ROLE', `User with role "${role}" is not a pending business account.`);
      }
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

      // In-dashboard notification to seller
      if (listing.seller_id) {
        notificationsService.dispatch({
          userId: listing.seller_id,
          category: 'listing',
          title_en: 'Timber Listing Approved',
          title_ml: 'തടി ലിസ്റ്റിംഗ് അംഗീകരിച്ചു',
          body_en: `Your timber listing "${listing.title || 'Timber Listing'}" has been approved and published to the marketplace.`,
          body_ml: `നിങ്ങളുടെ തടി ലിസ്റ്റിംഗ് "${listing.title || 'തടി ലിസ്റ്റിംഗ്'}" അംഗീകരിച്ച് മാർക്കറ്റിൽ പ്രസിദ്ധീകരിച്ചു.`,
          action_url: `/listing/${listingId}`,
        }).catch(() => {});
      }

      return { success: true, message: 'Listing approved and published to marketplace.' };
    });
  }

  /**
   * Reject a timber listing with mandatory reason
   */
  async rejectListing(adminId: string, listingId: string, reason: string) {
    return await withTransaction(async (client) => {
      const listingRes = await client.query(
        `SELECT status, seller_id, title FROM timber_listings WHERE id = $1`,
        [listingId]
      );
      if (listingRes.rows.length === 0) throw new AppError(404, 'NOT_FOUND', 'Listing not found.');
      const listing = listingRes.rows[0];

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

      // In-dashboard notification to seller
      if (listing.seller_id) {
        notificationsService.dispatch({
          userId: listing.seller_id,
          category: 'listing',
          title_en: 'Timber Listing Rejected',
          title_ml: 'തടി ലിസ്റ്റിംഗ് നിരസിച്ചു',
          body_en: `Your timber listing was rejected. Reason: ${reason}`,
          body_ml: `നിങ്ങളുടെ തടി ലിസ്റ്റിംഗ് നിരസിച്ചു. കാരണം: ${reason}`,
          action_url: `/listing/${listingId}`,
        }).catch(() => {});
      }

      return { success: true, message: 'Listing rejected with recorded reason.' };
    });
  }
}

export const adminService = new AdminService();
