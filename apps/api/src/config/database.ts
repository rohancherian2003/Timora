import pg from 'pg';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

const connectionString = process.env.TEST_DATABASE_URL || env.DATABASE_URL;

// Automatically enable SSL if connecting to remote databases (e.g. Supabase, Neon, AWS)
// or if DATABASE_SSL is explicitly enabled, or if in production/serverless environments.
const isRemoteOrProduction =
  Boolean(env.DATABASE_SSL) ||
  env.NODE_ENV === 'production' ||
  process.env.VERCEL === '1' ||
  (connectionString && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'));

export let pool = new Pool({
  connectionString,
  ssl: isRemoteOrProduction ? { rejectUnauthorized: false } : false,
  max: process.env.VERCEL ? 5 : 20, // Lower pool size to prevent connection exhaustion in serverless lambdas
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000, // Increased from 5s to 10s to accommodate cold-start latency
});

export function setPoolForTesting(newPool: pg.Pool): void {
  pool = newPool;
}

pool.on('error', (err) => {
  logger.error({ err }, 'Unexpected PostgreSQL pool error');
});

export async function checkDbConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (err) {
    logger.error({ err }, 'Database connection check failed');
    return false;
  }
}

/**
 * Execute a query with automatic error logging.
 */
export async function query<T extends pg.QueryResultRow>(
  sql: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await pool.query<T>(sql, params);
    const duration = Date.now() - start;
    logger.debug({ sql: sql.slice(0, 80), duration, rows: result.rowCount }, 'query executed');
    return result;
  } catch (err) {
    logger.error({ err, sql: sql.slice(0, 80) }, 'query failed');
    throw err;
  }
}

/**
 * Run multiple queries in a transaction.
 * Rolls back automatically on error.
 */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}