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

      // Pre-seed Quick Demo Accounts with default PIN '123456'
      logger.info('Bootstrapping Quick Demo Accounts...');
      const demoPin = '123456';
      const demoPinHash = await argon2.hash(demoPin, {
        memoryCost: env.ARGON2_MEMORY,
        timeCost: env.ARGON2_ITERATIONS,
        parallelism: env.ARGON2_PARALLELISM,
      });

      const demoUsers = [
        {
          phone: '+919847987654',
          role: 'buyer' as const,
          name: 'Suresh Kumar',
          district_id: 5,
        },
        {
          phone: '+919847120001',
          role: 'seller' as const,
          name: 'K. R. Madhavan',
          seller_subtype: 'individual' as const,
          district_id: 10,
          business_name: 'Madhavan Farmstead Timber',
        },
        {
          phone: '+919847120002',
          role: 'seller' as const,
          name: 'George Varghese',
          seller_subtype: 'mill_owner' as const,
          district_id: 7,
          business_name: 'Perumbavoor Modern Sawmills',
          mill_name: 'Perumbavoor Modern Sawmills & Timber Depot',
        },
        {
          phone: '+919847330001',
          role: 'carpenter' as const,
          name: 'Master Binu Achari',
          district_id: 4,
          business_name: 'Binu Traditional Timber Joinery & Carpentry',
        },
        {
          phone: '+919847440001',
          role: 'transport' as const,
          name: 'K. Sukumaran',
          district_id: 11,
          business_name: 'Malabar Timber Heavy Transit Haulage',
        },
        {
          phone: '+919847000000',
          role: 'admin' as const,
          name: 'Chief Moderator',
          district_id: 1,
        },
      ];

      for (const u of demoUsers) {
        const uRes = await client.query(
          `INSERT INTO users (phone, pin_hash, role)
           VALUES ($1, $2, $3)
           ON CONFLICT (phone) DO UPDATE SET role = $3, pin_hash = $2
           RETURNING id`,
          [u.phone, demoPinHash, u.role]
        );
        const uid = uRes.rows[0]?.id;
        if (!uid) continue;

        await client.query(
          `INSERT INTO user_profiles (user_id, name, district_id, language_pref)
           VALUES ($1, $2, $3, 'en')
           ON CONFLICT (user_id) DO UPDATE SET name = $2, district_id = $3`,
          [uid, u.name, u.district_id]
        );

        if (u.role === 'seller') {
          await client.query(
            `INSERT INTO seller_profiles (user_id, business_name, seller_subtype, district_id, approval_status)
             VALUES ($1, $2, $3, $4, 'approved')
             ON CONFLICT (user_id) DO UPDATE SET business_name = $2, seller_subtype = $3, approval_status = 'approved'`,
            [uid, u.business_name, u.seller_subtype || 'individual', u.district_id]
          );

          if (u.seller_subtype === 'mill_owner') {
            await client.query(
              `INSERT INTO timber_mills (owner_id, mill_name, district_id, approval_status)
               VALUES ($1, $2, $3, 'approved')
               ON CONFLICT DO NOTHING`,
              [uid, u.mill_name || u.business_name, u.district_id]
            );
          }
        } else if (u.role === 'carpenter') {
          await client.query(
            `INSERT INTO carpenter_profiles (user_id, business_name, district_id, approval_status)
             VALUES ($1, $2, $3, 'approved')
             ON CONFLICT (user_id) DO UPDATE SET business_name = $2, approval_status = 'approved'`,
            [uid, u.business_name, u.district_id]
          );
        } else if (u.role === 'transport') {
          await client.query(
            `DELETE FROM transport_owner_profiles WHERE user_id = $1`,
            [uid]
          );
          await client.query(
            `INSERT INTO transport_owner_profiles (user_id, business_name, district_id, vehicle_types, approval_status)
             VALUES ($1, $2, $3, $4, 'approved')`,
            [uid, u.business_name, u.district_id, ['Timber Lorry', 'Crane Truck']]
          );
        }
      }
      logger.info('✅ Quick Demo Accounts configured with PIN 123456.');

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
