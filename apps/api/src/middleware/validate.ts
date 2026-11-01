import type { Request, Response, NextFunction } from 'express';
import { ZodError, type AnyZodObject } from 'zod';
import { AppError } from './errorHandler.js';

export function validate(schema: AnyZodObject, statusCode?: number) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.query !== undefined) req.query = parsed.query;
      if (parsed.params !== undefined) req.params = parsed.params;
      next();
    } catch (error) {
      if (statusCode && error instanceof ZodError) {
        const fields: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const key = issue.path.join('.') || 'root';
          if (!fields[key]) fields[key] = [];
          fields[key]!.push(issue.message);
        }
        return next(new AppError(statusCode, 'VALIDATION_ERROR', 'Request validation failed.', fields));
      }
      next(error);
    }
  };
}
