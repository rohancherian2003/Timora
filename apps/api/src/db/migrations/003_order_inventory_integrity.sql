-- ─────────────────────────────────────────────────────────────────────────────
-- TIMORA DATABASE SCHEMA MIGRATION 003
-- Order & Inventory Integrity, Stock Restoration Tracking, and Offer Expiry
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add stock_restored column to orders table for idempotent restoration tracking
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS stock_restored BOOLEAN NOT NULL DEFAULT false;

-- 2. Backfill completed orders: Delivered timber cannot be restored to inventory
UPDATE orders 
  SET stock_restored = true 
  WHERE status = 'completed' AND stock_restored = false;

-- 3. Backfill historical cancelled orders to freeze past state and prevent
-- retroactive phantom inventory injections on orders settled prior to this patch.
UPDATE orders 
  SET stock_restored = true 
  WHERE status = 'cancelled' AND stock_restored = false;

-- 4. Extend offers status check to support 'ordered' status upon consumption
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;
ALTER TABLE offers ADD CONSTRAINT offers_status_check
  CHECK (status IN ('pending','accepted','rejected','countered','expired','withdrawn','ordered'));

-- 5. Index for inventory audit and idempotency checks
CREATE INDEX IF NOT EXISTS idx_orders_stock_restored ON orders(stock_restored);
CREATE INDEX IF NOT EXISTS idx_orders_listing_status ON orders(listing_id, status);
