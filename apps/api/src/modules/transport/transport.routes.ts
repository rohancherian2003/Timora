import { Router } from 'express';
import { query } from '../../config/database.js';
import { optionalAuthenticate } from '../../middleware/auth.js';
import type { ApiSuccessResponse } from '@timora/shared';

export const transportRouter = Router();

function maskContact(contact: string | null | undefined): string | null {
  if (!contact) return null;
  const clean = contact.trim();
  if (clean.length <= 6) return '+91 9447••••••';
  return clean.slice(0, 7) + '••••••';
}

// Public: Get all active transport providers (with server-side contact privacy for guests)
transportRouter.get('/providers', optionalAuthenticate, async (req, res, next) => {
  try {
    const isGuest = !req.user;
    const result = await query(
      `SELECT id, name, contact, service_areas, notes
       FROM transport_providers
       WHERE is_active = true
       ORDER BY name ASC`
    );
    const rows = result.rows.map((row: any) => ({
      ...row,
      contact: isGuest ? maskContact(row.contact) : row.contact,
    }));
    const response: ApiSuccessResponse = { success: true, data: rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Public: Get transport quote benchmarks (with server-side contact privacy for guests)
transportRouter.get('/quotes', optionalAuthenticate, async (req, res, next) => {
  try {
    const isGuest = !req.user;
    const { from_district, to_district } = req.query;
    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (from_district) {
      conditions.push(`from_district ILIKE $${idx++}`);
      params.push(`%${from_district}%`);
    }
    if (to_district) {
      conditions.push(`to_district ILIKE $${idx++}`);
      params.push(`%${to_district}%`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const result = await query(
      `SELECT q.*, p.name as provider_name, p.contact as provider_contact
       FROM transport_quotes q
       JOIN transport_providers p ON p.id = q.provider_id
       ${where}
       ORDER BY q.quoted_at DESC`,
      params
    );

    const rows = result.rows.map((row: any) => ({
      ...row,
      provider_contact: isGuest ? maskContact(row.provider_contact) : row.provider_contact,
    }));

    const response: ApiSuccessResponse = { success: true, data: rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
