import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/database.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  logger.info('🚀 Starting database migrations...');
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    const files = (await fs.readdir(migrationsDir))
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      logger.info(`Running migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('COMMIT');
        logger.info(`✅ Successfully executed ${file}`);
      } catch (err) {
        await client.query('ROLLBACK');
        logger.error({ err, file }, `❌ Migration failed: ${file}`);
        throw err;
      } finally {
        client.release();
      }
    }

    logger.info('🎉 All migrations completed successfully.');
  } catch (error) {
    logger.error({ error }, 'Migration process aborted');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
