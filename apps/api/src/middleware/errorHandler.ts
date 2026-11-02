import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import type { ApiErrorResponse } from '@timora/shared';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly fields?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // AppError — expected business errors
  if (err instanceof AppError) {
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.fields ? { fields: err.fields } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // Zod validation errors from request parsing
  if (err instanceof ZodError) {
    const fields: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.join('.') || 'root';
      if (!fields[key]) fields[key] = [];
      fields[key]!.push(issue.message);
    }
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed.',
        fields,
      },
    };
    res.status(422).json(body);
    return;
  }

  // PostgreSQL unique-constraint violations
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23505'
  ) {
    const body: ApiErrorResponse = {
      success: false,
      error: { code: 'CONFLICT', message: 'A record with this value already exists.' },
    };
    res.status(409).json(body);
    return;
  }

  // PostgreSQL foreign-key constraint violations (e.g. invalid district_id, species_id, or timber_type_id)
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '23503'
  ) {
    const pgErr = err as { detail?: string };
    const body: ApiErrorResponse = {
      success: false,
      error: {
        code: 'INVALID_REFERENCE',
        message: 'A referenced entity (e.g. species, district, or timber type) does not exist.',
        ...(pgErr.detail ? { fields: { reference: [pgErr.detail] } } : {}),
      },
    };
    res.status(400).json(body);
    return;
  }

  // PostgreSQL invalid input syntax (e.g. invalid UUID format '22P02')
  if (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === '22P02'
  ) {
    const body: ApiErrorResponse = {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Resource not found.' },
    };
    res.status(404).json(body);
    return;
  }

  // Unknown / unexpected errors — log full details, return generic message
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  const body: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      // Never expose stack traces, SQL, or secrets in production
      message:
        process.env['NODE_ENV'] === 'production'
          ? 'An unexpected error occurred. Please try again later.'
          : (err instanceof Error ? err.message : 'Unknown error'),
    },
  };
  res.status(500).json(body);
}
