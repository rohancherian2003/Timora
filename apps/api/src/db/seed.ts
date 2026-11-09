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

      // ─── Purge Test / Dummy Listings ──────────────────────────────────────────
      logger.info('Purging test / dummy listings...');
      await client.query(`
        DELETE FROM listing_images WHERE listing_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
        DELETE FROM admin_audit_logs WHERE entity_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
        DELETE FROM listing_review_history WHERE listing_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
        DELETE FROM listing_approved_versions WHERE listing_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
        DELETE FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%';
      `);

      // ─── Seed Default Authoritative Marketplace Timber Listings ───────────────
      logger.info('Seeding default authoritative marketplace timber listings...');

      // Lookup species IDs
      const speciesRows = (await client.query(`SELECT id, slug FROM timber_species`)).rows;
      const speciesMap = new Map(speciesRows.map((r: any) => [r.slug, r.id]));

      // Lookup timber types IDs
      const typeRows = (await client.query(`SELECT id, slug FROM timber_types`)).rows;
      const typeMap = new Map(typeRows.map((r: any) => [r.slug, r.id]));

      // Lookup demo seller IDs
      const madhavanRes = await client.query(`SELECT id FROM users WHERE phone = '+919847120001'`);
      const georgeRes = await client.query(`SELECT id FROM users WHERE phone = '+919847120002'`);
      const madhavanId = madhavanRes.rows[0]?.id || 'a0000000-0000-0000-0000-000000000001';
      const georgeId = georgeRes.rows[0]?.id || 'a0000000-0000-0000-0000-000000000002';
      const periyarMillOwnerId = 'a0000000-0000-0000-0000-000000000001';
      const chalakudyMillOwnerId = 'a0000000-0000-0000-0000-000000000002';

      const defaultListings = [
        {
          id: 'c0000000-0000-0000-0000-000000000001',
          seller_id: madhavanId,
          title: 'First-Grade Nilambur Teak Round Logs (A-Class Heartwood)',
          species_slug: 'teak',
          type_slug: 'round_log',
          district_id: 10, // Malappuram
          locality: 'Nilambur Forest Division',
          quantity: 65,
          unit: 'cft',
          price_per_cft: 2850,
          pricing_mode: 'fixed',
          length_ft: 14,
          diameter_in: 42,
          pieces: 18,
          is_dried: false,
          description: 'Mature Nilambur teak logs with verified Forest Form IV transit pass. Deep golden-brown color, dense heartwood, zero sapwood defects.',
          images: [
            { url: '/images/timber/teak-logs.png', is_primary: true },
            { url: '/images/timber/mahogany-logs.jpg', is_primary: false },
          ],
        },
        {
          id: 'c0000000-0000-0000-0000-000000000002',
          seller_id: georgeId,
          title: 'Seasoned African Mahogany Squared Beams & Heavy Logs',
          species_slug: 'mahogany',
          type_slug: 'squared_beam',
          district_id: 5, // Kottayam
          locality: 'Pala Timber Yard',
          quantity: 80,
          unit: 'cft',
          price_per_cft: 1850,
          pricing_mode: 'fixed',
          length_ft: 12,
          width_in: 6,
          thickness_in: 6,
          pieces: 25,
          is_dried: true,
          description: 'Perfect for residential roof purlins and rafters. Straight cuts with four squared sides, seasoned for 6 months with minimal moisture.',
          images: [
            { url: '/images/timber/mahogany-logs.jpg', is_primary: true },
            { url: '/images/timber/teak-logs.png', is_primary: false },
          ],
        },
        {
          id: 'c0000000-0000-0000-0000-000000000003',
          seller_id: periyarMillOwnerId,
          title: 'Old-Growth Wild Jack (Anjili) Heavy Round Tree Trunks',
          species_slug: 'anjili',
          type_slug: 'round_log',
          district_id: 7, // Ernakulam
          locality: 'Perumbavoor Sawmill Zone',
          quantity: 120,
          unit: 'cft',
          price_per_cft: 1400,
          pricing_mode: 'fixed',
          length_ft: 16,
          diameter_in: 48,
          pieces: 12,
          is_dried: false,
          description: 'Water-resistant, durable wild Anjili logs ideal for door frames, boat building, and structural pillars. High density wood.',
          images: [
            { url: '/images/timber/anjili-logs.jpg', is_primary: true },
            { url: '/images/timber/jackfruit-logs.jpg', is_primary: false },
          ],
        },
        {
          id: 'c0000000-0000-0000-0000-000000000004',
          seller_id: madhavanId,
          title: 'Estate Harvest Rubberwood Round Logs (Bulk Lot)',
          species_slug: 'rubberwood',
          type_slug: 'round_log',
          district_id: 3, // Pathanamthitta
          locality: 'Adoor Agro Timber Yard',
          quantity: 240,
          unit: 'cft',
          price_per_cft: 650,
          pricing_mode: 'fixed',
          length_ft: 10,
          diameter_in: 32,
          pieces: 45,
          is_dried: false,
          description: 'Uniform diameter plantation rubber logs suitable for chemical treatment plants and finger-jointed board manufacturing.',
          images: [
            { url: '/images/timber/rubberwood-logs.jpg', is_primary: true },
            { url: '/images/timber/firewood-logs.jpg', is_primary: false },
          ],
        },
        {
          id: 'c0000000-0000-0000-0000-000000000005',
          seller_id: chalakudyMillOwnerId,
          title: 'Heritage Jackfruit (Varikka Plavu) Heavy Balks & Planks',
          species_slug: 'jackfruit',
          type_slug: 'rough_sawn_plank',
          district_id: 8, // Thrissur
          locality: 'Wadakkanchery Depot',
          quantity: 65,
          unit: 'cft',
          price_per_cft: 2200,
          pricing_mode: 'fixed',
          length_ft: 9,
          width_in: 6,
          thickness_in: 3,
          pieces: 20,
          is_dried: true,
          description: 'Auspicious bright yellow heartwood from mature Varikka Plavu. Highly prized for traditional front door frames, temples, and prayer halls.',
          images: [
            { url: '/images/timber/jackfruit-logs.jpg', is_primary: true },
            { url: '/images/timber/teak-logs.png', is_primary: false },
          ],
        },
        {
          id: 'c0000000-0000-0000-0000-000000000006',
          seller_id: georgeId,
          title: 'Authentic Kerala Rosewood (Veetti) Premium Heavy Round Logs',
          species_slug: 'rosewood',
          type_slug: 'round_log',
          district_id: 12, // Wayanad
          locality: 'Mananthavady Depot',
          quantity: 35,
          unit: 'cft',
          price_per_cft: 4800,
          pricing_mode: 'fixed',
          length_ft: 12,
          diameter_in: 38,
          pieces: 6,
          is_dried: true,
          description: 'Government auction legal Rosewood logs with Form IV permits. Jet-black grain lines with purple undertones. Highest luxury grade.',
          images: [
            { url: '/images/timber/rosewood-logs.jpg', is_primary: true },
            { url: '/images/timber/teak-logs.png', is_primary: false },
          ],
        },
        {
          id: 'c0000000-0000-0000-0000-000000000007',
          seller_id: periyarMillOwnerId,
          title: 'Split Firewood & Heavy Industrial Boiler Timber Blocks',
          species_slug: 'rubberwood',
          type_slug: 'firewood',
          district_id: 2, // Kollam
          locality: 'Punalur Yard',
          quantity: 15,
          unit: 'tonnes',
          price_per_cft: 280,
          pricing_mode: 'fixed',
          pieces: 150,
          is_dried: true,
          description: 'Well-dried hardwood split logs ready for bakeries, tea factories, ayurvedic plants, and domestic stoves. High burning efficiency.',
          images: [
            { url: '/images/timber/split-firewood-1.jpg', is_primary: true },
            { url: '/images/timber/split-firewood-2.png', is_primary: false },
          ],
        },
      ];

      for (const item of defaultListings) {
        const speciesId = speciesMap.get(item.species_slug) || 1;
        const typeId = typeMap.get(item.type_slug) || 1;

        await client.query(
          `INSERT INTO timber_listings (
             id, seller_id, title, species_id, timber_type_id, district_id, locality,
             quantity, unit, price_per_cft, pricing_mode, length_ft, width_in,
             thickness_in, diameter_in, pieces, is_dried, description, status,
             approved_at, created_at, updated_at
           ) VALUES (
             $1, $2, $3, $4, $5, $6, $7,
             $8, $9, $10, $11, $12, $13,
             $14, $15, $16, $17, $18, 'approved',
             NOW(), NOW(), NOW()
           )
           ON CONFLICT (id) DO UPDATE SET
             seller_id = EXCLUDED.seller_id,
             title = EXCLUDED.title,
             species_id = EXCLUDED.species_id,
             timber_type_id = EXCLUDED.timber_type_id,
             district_id = EXCLUDED.district_id,
             locality = EXCLUDED.locality,
             quantity = EXCLUDED.quantity,
             unit = EXCLUDED.unit,
             price_per_cft = EXCLUDED.price_per_cft,
             pricing_mode = EXCLUDED.pricing_mode,
             length_ft = EXCLUDED.length_ft,
             width_in = EXCLUDED.width_in,
             thickness_in = EXCLUDED.thickness_in,
             diameter_in = EXCLUDED.diameter_in,
             pieces = EXCLUDED.pieces,
             is_dried = EXCLUDED.is_dried,
             description = EXCLUDED.description,
             status = 'approved',
             approved_at = NOW(),
             updated_at = NOW()`,
          [
            item.id,
            item.seller_id,
            item.title,
            speciesId,
            typeId,
            item.district_id,
            item.locality,
            item.quantity,
            item.unit,
            item.price_per_cft,
            item.pricing_mode,
            item.length_ft || null,
            item.width_in || null,
            item.thickness_in || null,
            item.diameter_in || null,
            item.pieces || null,
            item.is_dried,
            item.description,
          ]
        );

        // Delete existing images for this listing to avoid duplicates on re-seed
        await client.query(`DELETE FROM listing_images WHERE listing_id = $1`, [item.id]);

        for (let idx = 0; idx < item.images.length; idx++) {
          const img = item.images[idx]!;
          await client.query(
            `INSERT INTO listing_images (listing_id, storage_key, url, is_primary, sort_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [item.id, `seed_${item.id}_${idx}`, img.url, img.is_primary, idx]
          );
        }
      }

      logger.info('✅ Default authoritative marketplace listings restored successfully.');

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
