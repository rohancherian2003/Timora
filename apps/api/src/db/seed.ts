import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import argon2 from 'argon2';
import { pool } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  logger.info('🌱 Starting database seed...');
  try {
    const seedPath = path.join(__dirname, 'seed.sql');
    const sql = await fs.readFile(seedPath, 'utf8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);

      // Bootstrap Super Admin if specified
      if (env.SUPER_ADMIN_PHONE) {
        logger.info(`Bootstrapping Super Admin for phone ${env.SUPER_ADMIN_PHONE}...`);
        // Default seed PIN is '987654' unless custom configured
        const adminPin = '987654';
        const pinHash = await argon2.hash(adminPin, {
          memoryCost: env.ARGON2_MEMORY,
          timeCost: env.ARGON2_ITERATIONS,
          parallelism: env.ARGON2_PARALLELISM,
        });

        const userRes = await client.query(
          `INSERT INTO users (phone, pin_hash, role)
           VALUES ($1, $2, 'admin')
           ON CONFLICT (phone) DO UPDATE SET role = 'admin', pin_hash = $2
           RETURNING id`,
          [env.SUPER_ADMIN_PHONE, pinHash]
        );

        const adminId = userRes.rows[0]?.id;
        if (adminId) {
          await client.query(
            `INSERT INTO user_profiles (user_id, name, language_pref)
             VALUES ($1, 'Timora Super Admin', 'en')
             ON CONFLICT (user_id) DO UPDATE SET name = 'Timora Super Admin'`,
            [adminId]
          );
        }
        logger.info(`✅ Super Admin configured. Phone: ${env.SUPER_ADMIN_PHONE}`);
      }

      await client.query('COMMIT');
      logger.info('🎉 Seed completed successfully.');
    } catch (err) {
      await client.query('ROLLBACK');
      logger.error({ err }, '❌ Seeding failed');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    logger.error({ error }, 'Seed process aborted');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed();
