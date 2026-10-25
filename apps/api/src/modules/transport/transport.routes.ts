import { Router } from 'express';
import { query } from '../../config/database.js';
import type { ApiSuccessResponse } from '@timora/shared';

export const transportRouter = Router();

// Public: Get all active transport providers
transportRouter.get('/providers', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, contact, service_areas, notes
       FROM transport_providers
       WHERE is_active = true
       ORDER BY name ASC`
    );
    const response: ApiSuccessResponse = { success: true, data: result.rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

// Public: Get transport quote benchmarks
transportRouter.get('/quotes', async (req, res, next) => {
  try {
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

    const response: ApiSuccessResponse = { success: true, data: result.rows };
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});
