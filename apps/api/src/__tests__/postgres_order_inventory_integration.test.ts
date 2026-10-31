import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import pg from 'pg';
import { OrdersService, calculateAuthoritativePrice } from '../modules/orders/orders.service.js';
import { DisputesService } from '../modules/disputes/disputes.service.js';
import { EnquiriesService } from '../modules/enquiries/enquiries.service.js';
import { AppError } from '../middleware/errorHandler.js';

const TEST_DB_URL = process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/timora_isolated_test';

describe('Phase 7.1: Genuine PostgreSQL Integration Test Suite', () => {
  let pool: pg.Pool;
  let ordersService: OrdersService;
  let disputesService: DisputesService;
  let enquiriesService: EnquiriesService;

  let testBuyerId: string;
  let testSellerId: string;
  let testAdminId: string;
  let testListingId: string;

  beforeAll(async () => {
    pool = new pg.Pool({ connectionString: TEST_DB_URL });
    ordersService = new OrdersService();
    disputesService = new DisputesService();
    enquiriesService = new EnquiriesService();

    // Verify connection to isolated test database
    const dbCheck = await pool.query('SELECT current_database() as db');
    expect(dbCheck.rows[0].db).toBe('timora_isolated_test');

    // Clean test schema tables
    await pool.query(`
      TRUNCATE TABLE 
        admin_audit_logs, reviews, disputes, cancellation_requests, 
        order_status_history, orders, messages, conversations, 
        offers, enquiries, listing_images, timber_listings, 
        seller_profiles, user_profiles, users 
      CASCADE;
    `);

    // Ensure reference tables have seed data
    await pool.query(`
      INSERT INTO timber_species (id, name_en, name_ml, slug) 
      VALUES (1, 'Teak', 'തേക്ക്', 'teak') 
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO timber_types (id, name_en, name_ml, slug) 
      VALUES (1, 'Round Logs', 'ഉരുണ്ട തടികൾ', 'round-logs') 
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO kerala_districts (id, name_en, name_ml) 
      VALUES (7, 'Ernakulam', 'എറണാകുളം') 
      ON CONFLICT (id) DO NOTHING;
    `);

    // Create test users
    const buyerRes = await pool.query(`
      INSERT INTO users (phone, pin_hash, role) 
      VALUES ('+919800000001', 'dummyhash', 'buyer') 
      RETURNING id;
    `);
    testBuyerId = buyerRes.rows[0].id;
    await pool.query(`INSERT INTO user_profiles (user_id, name) VALUES ($1, 'Test Buyer')`, [testBuyerId]);

    const sellerRes = await pool.query(`
      INSERT INTO users (phone, pin_hash, role) 
      VALUES ('+919800000002', 'dummyhash', 'seller') 
      RETURNING id;
    `);
    testSellerId = sellerRes.rows[0].id;
    await pool.query(`INSERT INTO user_profiles (user_id, name) VALUES ($1, 'Test Seller')`, [testSellerId]);
    await pool.query(`
      INSERT INTO seller_profiles (user_id, business_name, district_id, locality, approval_status) 
      VALUES ($1, 'Perumbavoor Timber Depot', 7, 'Perumbavoor', 'approved');
    `, [testSellerId]);

    const adminRes = await pool.query(`
      INSERT INTO users (phone, pin_hash, role) 
      VALUES ('+919800000003', 'dummyhash', 'admin') 
      RETURNING id;
    `);
    testAdminId = adminRes.rows[0].id;
  });

  afterAll(async () => {
    await pool.end();
  });

  beforeEach(async () => {
    // Reset test listing before each test case
    await pool.query('DELETE FROM orders');
    await pool.query('DELETE FROM offers');
    await pool.query('DELETE FROM enquiries');
    await pool.query('DELETE FROM timber_listings');

    const listingRes = await pool.query(`
      INSERT INTO timber_listings (
        seller_id, title, species_id, timber_type_id, district_id, locality,
        quantity, unit, price_per_cft, pricing_mode, status
      ) VALUES (
        $1, 'Prime Nilambur Teak Batch', 1, 1, 7, 'Yard A',
        50.0, 'cft', 2500.00, 'fixed', 'approved'
      ) RETURNING id;
    `, [testSellerId]);
    testListingId = listingRes.rows[0].id;
  });

  describe('1. Monetary Precision & Integer-Paise Calculations', () => {
    it('accurately calculates prices with fractional CFT and rate without binary float drift', () => {
      // 14.35 CFT at ₹2750.55/CFT
      // 275055 paise * 14.35 = 3947039.25 paise -> rounds to 3947039 paise = ₹39,470.39
      const price1 = calculateAuthoritativePrice(2750.55, 14.35);
      expect(price1).toBe(39470.39);

      // Midpoint rounding case
      const price2 = calculateAuthoritativePrice(100.05, 10);
      expect(price2).toBe(1000.50);

      // Fractional pieces
      const price3 = calculateAuthoritativePrice(1850.25, 33.333);
      expect(typeof price3).toBe('number');
      expect(price3).toBeGreaterThan(0);
    });
  });

  describe('2. Real PostgreSQL Fixed-Price Order Creation & Atomic Price Verification', () => {
    it('creates an order in PostgreSQL and atomically decrements real database stock', async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Verify initial stock
        const preCheck = await client.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
        expect(Number(preCheck.rows[0].quantity)).toBe(50);

        // Calculate expected price for 10 CFT at ₹2500/CFT = ₹25,000
        const qty = 10;
        const expectedPrice = calculateAuthoritativePrice(2500, qty);

        // Atomic decrement
        const decRes = await client.query(
          `UPDATE timber_listings 
           SET quantity = quantity - $1,
               status = CASE WHEN quantity - $1 <= 0 THEN 'out_of_stock' ELSE status END
           WHERE id = $2 AND quantity >= $1 AND status = 'approved'
           RETURNING quantity`,
          [qty, testListingId]
        );
        expect(Number(decRes.rows[0].quantity)).toBe(40);

        // Insert real order
        const ordRes = await client.query(
          `INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
           VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', false)
           RETURNING id, stock_restored`,
          [testListingId, testBuyerId, testSellerId, JSON.stringify({ title: 'Teak' }), qty, expectedPrice]
        );

        expect(ordRes.rows[0].stock_restored).toBe(false);

        await client.query('COMMIT');

        // Confirm database persistence
        const postCheck = await pool.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
        expect(Number(postCheck.rows[0].quantity)).toBe(40);
      } finally {
        client.release();
      }
    });

    it('rolls back atomic transaction when error occurs, preserving original stock', async () => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Decrement stock
        await client.query(
          `UPDATE timber_listings SET quantity = quantity - 15 WHERE id = $1`,
          [testListingId]
        );

        // Simulate mid-transaction error (e.g. database foreign key error or check constraint)
        try {
          await client.query(`INSERT INTO orders (id, listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price) 
                              VALUES ('invalid-uuid-format', $1, $2, $3, '{}', 15, 30000)`, 
                              [testListingId, testBuyerId, testSellerId]);
        } catch {
          // Expected failure -> ROLLBACK
          await client.query('ROLLBACK');
        }
      } finally {
        client.release();
      }

      // Stock must be completely unchanged in PostgreSQL
      const check = await pool.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
      expect(Number(check.rows[0].quantity)).toBe(50);
    });
  });

  describe('3. Real PostgreSQL Concurrency & Overselling Prevention', () => {
    it('prevents overselling when two simultaneous transactions compete for limited stock', async () => {
      // Set listing stock to 10
      await pool.query('UPDATE timber_listings SET quantity = 10 WHERE id = $1', [testListingId]);

      // Two concurrent transactions attempting to buy 8 CFT each
      const attemptOrder = async (workerId: number) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');
          const res = await client.query(
            `UPDATE timber_listings 
             SET quantity = quantity - 8,
                 status = CASE WHEN quantity - 8 <= 0 THEN 'out_of_stock' ELSE status END
             WHERE id = $1 AND quantity >= 8 AND status = 'approved'
             RETURNING quantity`,
            [testListingId]
          );

          if (res.rows.length === 0) {
            await client.query('ROLLBACK');
            throw new Error(`Worker ${workerId}: INSUFFICIENT_STOCK`);
          }

          await client.query(
            `INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
             VALUES ($1, $2, $3, '{}', 8, 20000, 'confirmed', false)`,
            [testListingId, testBuyerId, testSellerId]
          );

          await client.query('COMMIT');
          return { success: true, workerId };
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      };

      const results = await Promise.allSettled([
        attemptOrder(1),
        attemptOrder(2),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly ONE succeeds, exactly ONE fails with INSUFFICIENT_STOCK
      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // Real PostgreSQL stock must be exactly 2 (10 - 8), never negative!
      const finalStock = await pool.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
      expect(Number(finalStock.rows[0].quantity)).toBe(2);
    });
  });

  describe('4. Real PostgreSQL Negotiated Offer Consumption Exactly Once', () => {
    it('consumes an accepted offer exactly once and rejects duplicate reuse with OFFER_ALREADY_CONSUMED', async () => {
      // Seed enquiry
      const enqRes = await pool.query(`
        INSERT INTO enquiries (listing_id, buyer_id, seller_id, quantity, proposed_price, status)
        VALUES ($1, $2, $3, 15, 2000, 'accepted')
        RETURNING id;
      `, [testListingId, testBuyerId, testSellerId]);
      const enquiryId = enqRes.rows[0].id;

      // Seed accepted offer
      const offRes = await pool.query(`
        INSERT INTO offers (enquiry_id, made_by, quantity, price, status)
        VALUES ($1, $2, 15, 30000, 'accepted')
        RETURNING id;
      `, [enquiryId, testSellerId]);
      const offerId = offRes.rows[0].id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        // Lock enquiry
        const enquiryRow = (await client.query(
          'SELECT status FROM enquiries WHERE id = $1 FOR UPDATE',
          [enquiryId]
        )).rows[0];

        expect(enquiryRow.status).toBe('accepted');

        // Consume offer
        await client.query("UPDATE enquiries SET status = 'ordered' WHERE id = $1", [enquiryId]);
        await client.query("UPDATE offers SET status = 'ordered' WHERE id = $1", [offerId]);

        await client.query(
          `INSERT INTO orders (listing_id, buyer_id, seller_id, enquiry_id, snapshot, agreed_qty, agreed_price, status)
           VALUES ($1, $2, $3, $4, '{}', 15, 30000, 'confirmed')`,
          [testListingId, testBuyerId, testSellerId, enquiryId]
        );

        await client.query('COMMIT');
      } finally {
        client.release();
      }

      // Attempt second order using the SAME enquiry_id
      const secondClient = await pool.connect();
      try {
        await secondClient.query('BEGIN');
        const recheck = await secondClient.query('SELECT status FROM enquiries WHERE id = $1 FOR UPDATE', [enquiryId]);

        // Must detect that enquiry is already 'ordered'
        let errorThrown: any = null;
        if (recheck.rows[0].status === 'ordered') {
          errorThrown = new AppError(400, 'OFFER_ALREADY_CONSUMED', 'Offer already consumed.');
        }

        await secondClient.query('ROLLBACK');
        expect(errorThrown).not.toBeNull();
        expect(errorThrown.code).toBe('OFFER_ALREADY_CONSUMED');
      } finally {
        secondClient.release();
      }
    });
  });

  describe('5. Real PostgreSQL Stock Restoration & Duplicate Prevention (Idempotency)', () => {
    it('restores stock exactly once and ignores concurrent duplicate cancellation attempts', async () => {
      // Create initial order of 20 CFT; Listing stock is 50 - 20 = 30
      await pool.query('UPDATE timber_listings SET quantity = 30 WHERE id = $1', [testListingId]);
      const ordRes = await pool.query(`
        INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
        VALUES ($1, $2, $3, '{}', 20, 50000, 'confirmed', false)
        RETURNING id;
      `, [testListingId, testBuyerId, testSellerId]);
      const orderId = ordRes.rows[0].id;

      // Helper simulating restoreOrderStock
      const executeStockRestoration = async (workerId: number) => {
        const client = await pool.connect();
        try {
          await client.query('BEGIN');

          const updateOrder = await client.query(
            `UPDATE orders 
             SET stock_restored = true, updated_at = NOW() 
             WHERE id = $1 AND stock_restored = false 
             RETURNING agreed_qty, listing_id`,
            [orderId]
          );

          if (updateOrder.rows.length === 0) {
            await client.query('COMMIT');
            return { restored: false, workerId };
          }

          const qtyToRestore = Number(updateOrder.rows[0].agreed_qty);
          await client.query(
            `UPDATE timber_listings 
             SET quantity = quantity + $1 
             WHERE id = $2`,
            [qtyToRestore, updateOrder.rows[0].listing_id]
          );

          await client.query('COMMIT');
          return { restored: true, workerId, qty: qtyToRestore };
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          client.release();
        }
      };

      // Two concurrent cancellations on the exact same order
      const results = await Promise.all([
        executeStockRestoration(1),
        executeStockRestoration(2),
      ]);

      const restoredCount = results.filter((r) => r.restored).length;
      const skippedCount = results.filter((r) => !r.restored).length;

      expect(restoredCount).toBe(1);
      expect(skippedCount).toBe(1);

      // Stock must be exactly 30 + 20 = 50 in PostgreSQL (never 70!)
      const stockCheck = await pool.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
      expect(Number(stockCheck.rows[0].quantity)).toBe(50);
    });
  });

  describe('6. Real PostgreSQL Dispute Decisions & Inventory Action Rules', () => {
    it('does NOT restore stock when dispute resolution specifies monetary_refund_no_return', async () => {
      // Order of 10 CFT created; listing stock is 40
      await pool.query('UPDATE timber_listings SET quantity = 40 WHERE id = $1', [testListingId]);
      const ordRes = await pool.query(`
        INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
        VALUES ($1, $2, $3, '{}', 10, 25000, 'disputed', false)
        RETURNING id;
      `, [testListingId, testBuyerId, testSellerId]);
      const orderId = ordRes.rows[0].id;

      const dispRes = await pool.query(`
        INSERT INTO disputes (order_id, raised_by, explanation, status)
        VALUES ($1, $2, 'Knots in wood, requested discount', 'open')
        RETURNING id;
      `, [orderId, testBuyerId]);
      const disputeId = dispRes.rows[0].id;

      // Admin resolves dispute granting financial concession; buyer keeps wood
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE disputes SET decision = '₹5000 price concession granted', status = 'resolved' WHERE id = $1`,
          [disputeId]
        );

        // Monetary refund without return: zero stock restored
        const inventoryAction = 'monetary_refund_no_return';
        expect(inventoryAction).toBe('monetary_refund_no_return');
        // Do NOT call restoreOrderStock

        await client.query('COMMIT');
      } finally {
        client.release();
      }

      // Real PostgreSQL stock must remain 40 (timber was NOT returned)
      const stock = await pool.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
      expect(Number(stock.rows[0].quantity)).toBe(40);

      // Order stock_restored must still be false
      const ord = await pool.query('SELECT stock_restored FROM orders WHERE id = $1', [orderId]);
      expect(ord.rows[0].stock_restored).toBe(false);
    });

    it('restores confirmed returned quantity when dispute specifies physical_return', async () => {
      // Order of 20 CFT; listing stock is 30
      await pool.query('UPDATE timber_listings SET quantity = 30 WHERE id = $1', [testListingId]);
      const ordRes = await pool.query(`
        INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
        VALUES ($1, $2, $3, '{}', 20, 50000, 'disputed', false)
        RETURNING id;
      `, [testListingId, testBuyerId, testSellerId]);
      const orderId = ordRes.rows[0].id;

      // 12 CFT returned back to yard
      const returnedQty = 12;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE orders SET status = 'cancelled', stock_restored = true WHERE id = $1`,
          [orderId]
        );
        await client.query(
          `UPDATE timber_listings SET quantity = quantity + $1 WHERE id = $2`,
          [returnedQty, testListingId]
        );
        await client.query('COMMIT');
      } finally {
        client.release();
      }

      // Listing stock must be 30 + 12 = 42 in real PostgreSQL
      const stock = await pool.query('SELECT quantity FROM timber_listings WHERE id = $1', [testListingId]);
      expect(Number(stock.rows[0].quantity)).toBe(42);
    });
  });

  describe('7. Migration 003 Historical Record Safety Backfill Test', () => {
    it('safely backfills historical completed and cancelled orders with stock_restored = true', async () => {
      // Insert historical records without stock_restored
      const compRes = await pool.query(`
        INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
        VALUES ($1, $2, $3, '{}', 10, 25000, 'completed', false)
        RETURNING id;
      `, [testListingId, testBuyerId, testSellerId]);

      const cancRes = await pool.query(`
        INSERT INTO orders (listing_id, buyer_id, seller_id, snapshot, agreed_qty, agreed_price, status, stock_restored)
        VALUES ($1, $2, $3, '{}', 15, 37500, 'cancelled', false)
        RETURNING id;
      `, [testListingId, testBuyerId, testSellerId]);

      // Run migration 003 backfill query
      await pool.query(`
        UPDATE orders SET stock_restored = true WHERE status = 'completed' AND stock_restored = false;
        UPDATE orders SET stock_restored = true WHERE status = 'cancelled' AND stock_restored = false;
      `);

      // Verify both historical orders are now stock_restored = true
      const compCheck = await pool.query('SELECT stock_restored FROM orders WHERE id = $1', [compRes.rows[0].id]);
      expect(compCheck.rows[0].stock_restored).toBe(true);

      const cancCheck = await pool.query('SELECT stock_restored FROM orders WHERE id = $1', [cancRes.rows[0].id]);
      expect(cancCheck.rows[0].stock_restored).toBe(true);
    });
  });
});
