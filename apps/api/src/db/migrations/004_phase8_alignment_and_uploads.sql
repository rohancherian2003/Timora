-- TIMORA Migration 004: Phase 8 Alignment & Uploads
-- 1. Support Ticket Concurrency-Safe Sequence per Year
-- 2. Indexes for Review Queries and Listing Image Queries

-- Create ticket_sequences table for concurrency-safe yearly numbering
CREATE TABLE IF NOT EXISTS ticket_sequences (
  year        INT PRIMARY KEY,
  current_seq INT NOT NULL DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Initialize ticket_sequences from any existing tickets matching TKT-YYYY-NNNN format
INSERT INTO ticket_sequences (year, current_seq)
SELECT 
  EXTRACT(YEAR FROM created_at)::int AS year,
  COALESCE(MAX(SUBSTRING(reference FROM 'TKT-[0-9]{4}-([0-9]+)')::int), 0) AS current_seq
FROM support_tickets
WHERE reference ~ '^TKT-[0-9]{4}-[0-9]+$'
GROUP BY EXTRACT(YEAR FROM created_at)::int
ON CONFLICT (year) DO UPDATE
SET current_seq = GREATEST(ticket_sequences.current_seq, EXCLUDED.current_seq);

-- Performance & Integrity Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_reference ON support_tickets (reference);
CREATE INDEX IF NOT EXISTS idx_reviews_order_id ON reviews (order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee_id ON reviews (reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews (reviewer_id);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing_id ON listing_images (listing_id);
