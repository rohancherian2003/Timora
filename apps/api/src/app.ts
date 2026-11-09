import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { checkDbConnection } from './config/database.js';
import { apiRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { listingsRouter } from './modules/listings/listings.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { enquiriesRouter } from './modules/enquiries/enquiries.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { disputesRouter } from './modules/disputes/disputes.routes.js';
import { transportRouter } from './modules/transport/transport.routes.js';
import { supportRouter } from './modules/support/support.routes.js';
import { millsRouter, carpentersRouter } from './modules/directory/directory.routes.js';
import { query } from './config/database.js';

export function createApp(): express.Application {
  const app = express();
  app.set('trust proxy', 1);

  // Security headers & CORS
  app.use(helmet());

  // Explicit front-end custom domain origins
  const customDomainOrigins = [
    'https://timorah.me',
    'https://www.timorah.me',
  ];

  const envOrigins = (env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const allowedOrigins = Array.from(new Set([...customDomainOrigins, ...envOrigins]));

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow server-to-server, curl, Postman, mobile requests (no origin header)
      if (!origin) return callback(null, true);

      // Explicitly allow custom domains (https://timorah.me, https://www.timorah.me) and env origins
      if (
        customDomainOrigins.includes(origin) ||
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Dynamically allow all Vercel domains (production & preview URLs)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      // Allow local development
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // General rate limiter
  app.use(apiRateLimiter);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'Timora API Server',
      version: '1.0.0',
      status: 'online',
      message: 'Timora Timber Marketplace REST API is operational',
      endpoints: {
        health: '/health',
        api: '/api/v1',
        species: '/api/v1/species',
        districts: '/api/v1/districts',
        listings: '/api/v1/listings',
      },
    });
  });

  // Health check endpoint (does not leak sensitive credentials)
  app.get('/health', async (_req, res) => {
    const isDbConnected = await checkDbConnection();
    res.status(isDbConnected ? 200 : 503).json({
      status: isDbConnected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: isDbConnected ? 'connected' : 'disconnected',
        server: 'online',
      },
    });
  });

  // Base API endpoint
  app.get('/api', (_req, res) => {
    res.json({
      name: 'Timora API',
      version: '1.0.0',
      status: 'active',
      v1: '/api/v1',
    });
  });

  // Base API v1 root
  app.get('/api/v1', (_req, res) => {
    res.json({
      name: 'Timora API',
      version: '1.0.0',
      description: 'Smart Timber Marketplace REST API',
      status: 'active',
    });
  });

  // Authentication & Profile routes
  app.use('/api/v1/auth', authRouter);

  // Timber Listings routes
  app.use('/api/v1/listings', listingsRouter);

  // Enquiries & Negotiation routes
  app.use('/api/v1/enquiries', enquiriesRouter);

  // Orders routes
  app.use('/api/v1/orders', ordersRouter);

  // Disputes & Reviews routes
  app.use('/api/v1', disputesRouter);

  // Transport Directory routes
  app.use('/api/v1/transport', transportRouter);

  // Sawmills and Carpenters Directory routes
  app.use('/api/v1/mills', millsRouter);
  app.use('/api/v1/directory/mills', millsRouter);
  app.use('/api/v1/carpenters', carpentersRouter);
  app.use('/api/v1/directory/carpenters', carpentersRouter);

  // Support & Notification routes (supports both legacy /api/v1/* and frontend /api/v1/support/*)
  app.use('/api/v1', supportRouter);
  app.use('/api/v1/support', supportRouter);

  // Super Admin routes
  app.use('/api/v1/admin', adminRouter);

  // Reference Catalog Endpoints
  app.get('/api/v1/species', async (_req, res, next) => {
    try {
      const result = await query('SELECT id, name_en, name_ml, slug FROM timber_species ORDER BY id ASC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/v1/timber-types', async (_req, res, next) => {
    try {
      const result = await query('SELECT id, name_en, name_ml, slug, description FROM timber_types ORDER BY id ASC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/v1/districts', async (_req, res, next) => {
    try {
      const result = await query('SELECT id, name_en, name_ml FROM kerala_districts ORDER BY id ASC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // Direct route aliases for subdomain routing flexibility (e.g. api.timorah.me/*)
  app.use('/auth', authRouter);
  app.use('/listings', listingsRouter);
  app.use('/enquiries', enquiriesRouter);
  app.use('/orders', ordersRouter);
  app.use('/transport', transportRouter);
  app.use('/mills', millsRouter);
  app.use('/carpenters', carpentersRouter);
  app.use('/support', supportRouter);
  app.use('/admin', adminRouter);
  app.get('/species', async (_req, res, next) => {
    try {
      const result = await query('SELECT id, name_en, name_ml, slug FROM timber_species ORDER BY id ASC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  });
  app.get('/timber-types', async (_req, res, next) => {
    try {
      const result = await query('SELECT id, name_en, name_ml, slug, description FROM timber_types ORDER BY id ASC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  });
  app.get('/districts', async (_req, res, next) => {
    try {
      const result = await query('SELECT id, name_en, name_ml FROM kerala_districts ORDER BY id ASC');
      res.json({ success: true, data: result.rows });
    } catch (err) {
      next(err);
    }
  });

  // Error handling middleware (must be registered last)
  app.use(errorHandler);

  return app;
}
