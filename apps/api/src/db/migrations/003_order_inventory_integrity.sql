-- ─────────────────────────────────────────────────────────────────────────────
-- TIMORA DATABASE SCHEMA MIGRATION 003
-- Order & Inventory Integrity, Stock Restoration Tracking, and Offer Expiry
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Add stock_restored column to orders table for idempotent restoration tracking
ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS stock_restored BOOLEAN NOT NULL DEFAULT false;

-- 2. Index for inventory audit and idempotency checks
CREATE INDEX IF NOT EXISTS idx_orders_stock_restored ON orders(stock_restored);
CREATE INDEX IF NOT EXISTS idx_orders_listing_status ON orders(listing_id, status);
