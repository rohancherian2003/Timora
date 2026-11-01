import { Router } from 'express';
import { query } from '../../config/database.js';
import { optionalAuthenticate } from '../../middleware/auth.js';
import type { ApiSuccessResponse } from '@timora/shared';

export const millsRouter = Router();
export const carpentersRouter = Router();

/**
 * Mask phone numbers for unauthenticated guests:
 * Retains country/area prefix (e.g. "+91 9447") and masks remaining digits.
 */
function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const clean = phone.trim();
  if (clean.length <= 6) return '+91 9447••••••';
  return clean.slice(0, 7) + '••••••';
}

// ─────────────────────────────────────────────────────────────
// Timber Mills Directory (Public with Guest Contact Masking)
// ─────────────────────────────────────────────────────────────
millsRouter.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const isGuest = !req.user;
    const { district_id, search } = req.query;
    const conditions: string[] = [
      `tm.approval_status IN ('approved', 'APPROVED')`,
    ];
    const params: unknown[] = [];
    let idx = 1;

    if (district_id && district_id !== 'all') {
      const parsedDistrict = parseInt(String(district_id), 10);
      if (!isNaN(parsedDistrict)) {
        conditions.push(`tm.district_id = $${idx++}`);
        params.push(parsedDistrict);
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push(
        `(tm.mill_name ILIKE $${idx} OR COALESCE(tm.locality, '') ILIKE $${idx} OR COALESCE(up.name, '') ILIKE $${idx})`
      );
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT tm.id,
              tm.mill_name,
              tm.license_no,
              tm.locality,
              tm.daily_cft_capacity,
              tm.saw_types,
              tm.approval_status,
              tm.created_at,
              kd.id as district_id,
              kd.name_en as district_name_en,
              kd.name_ml as district_name_ml,
              COALESCE(up.name, '') as owner_name,
              u.phone
       FROM timber_mills tm
       JOIN users u ON u.id = tm.owner_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN kerala_districts kd ON kd.id = tm.district_id
       WHERE ${whereClause}
       ORDER BY tm.created_at DESC`,
      params
    );

    const mills = result.rows.map((row: any) => ({
      id: row.id,
      name: row.mill_name,
      ownerName: row.owner_name,
      licenseNo: row.license_no || '',
      district: row.district_name_en ? `${row.district_name_en} (${row.district_name_ml})` : 'Kerala',
      districtId: row.district_id,
      locality: row.locality || '',
      dailyCftCapacity: Number(row.daily_cft_capacity) || 0,
      sawTypes: row.saw_types || [],
      isVerified: ['approved', 'APPROVED'].includes(row.approval_status),
      phone: isGuest ? maskPhone(row.phone) : row.phone,
    }));

    const response: ApiSuccessResponse = { success: true, data: mills };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────
// Carpenter Directory (Public with Guest Contact Masking)
// ─────────────────────────────────────────────────────────────
carpentersRouter.get('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const isGuest = !req.user;
    const { district_id, search } = req.query;
    const conditions: string[] = [
      `(cp.approval_status IN ('approved', 'APPROVED') OR cp.is_admin_verified = true)`,
    ];
    const params: unknown[] = [];
    let idx = 1;

    if (district_id && district_id !== 'all') {
      const parsedDistrict = parseInt(String(district_id), 10);
      if (!isNaN(parsedDistrict)) {
        conditions.push(`cp.district_id = $${idx++}`);
        params.push(parsedDistrict);
      }
    }

    if (search && typeof search === 'string' && search.trim()) {
      conditions.push(
        `(COALESCE(cp.business_name, '') ILIKE $${idx} OR COALESCE(up.name, '') ILIKE $${idx} OR array_to_string(cp.specialization, ' ') ILIKE $${idx})`
      );
      params.push(`%${search.trim()}%`);
      idx++;
    }

    const whereClause = conditions.join(' AND ');

    const result = await query(
      `SELECT cp.user_id as id,
              COALESCE(cp.business_name, up.name, 'Master Carpenter') as name,
              COALESCE(up.name, '') as personal_name,
              cp.business_name,
              cp.specialization,
              cp.experience_yrs,
              cp.rating,
              cp.rating_count,
              cp.is_admin_verified,
              cp.approval_status,
              kd.id as district_id,
              kd.name_en as district_name_en,
              kd.name_ml as district_name_ml,
              u.phone
       FROM carpenter_profiles cp
       JOIN users u ON u.id = cp.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN kerala_districts kd ON kd.id = cp.district_id
       WHERE ${whereClause}
       ORDER BY cp.rating DESC, cp.experience_yrs DESC`,
      params
    );

    const carpenters = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      personalName: row.personal_name,
      businessName: row.business_name || '',
      district: row.district_name_en ? `${row.district_name_en} (${row.district_name_ml})` : 'Kerala',
      districtId: row.district_id,
      locality: '',
      experience_yrs: Number(row.experience_yrs) || 0,
      specializations: Array.isArray(row.specialization) ? row.specialization : (row.specialization ? [row.specialization] : []),
      rating: parseFloat(row.rating) || 5.0,
      rating_count: parseInt(row.rating_count, 10) || 0,
      is_verified: row.is_admin_verified || ['approved', 'APPROVED'].includes(row.approval_status),
      phone: isGuest ? maskPhone(row.phone) : row.phone,
    }));

    const response: ApiSuccessResponse = { success: true, data: carpenters };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
