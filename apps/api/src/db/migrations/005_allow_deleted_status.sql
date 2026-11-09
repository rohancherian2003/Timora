-- Migration 005: Allow 'deleted' listing status and purge test listings

-- 1. Update status check constraint on timber_listings
ALTER TABLE timber_listings DROP CONSTRAINT IF EXISTS timber_listings_status_check;
ALTER TABLE timber_listings ADD CONSTRAINT timber_listings_status_check 
  CHECK (status IN ('draft','pending_review','approved','rejected','hidden','out_of_stock','expired','deleted'));

-- 2. Update action check constraint on listing_review_history
ALTER TABLE listing_review_history DROP CONSTRAINT IF EXISTS listing_review_history_action_check;
ALTER TABLE listing_review_history ADD CONSTRAINT listing_review_history_action_check
  CHECK (action IN ('approved','rejected','hidden','unhidden','deleted','purged'));

-- 3. Cleanup/Purge dummy or test listing 'Anjili Timber 20ft'
DELETE FROM listing_images WHERE listing_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
DELETE FROM admin_audit_logs WHERE entity_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
DELETE FROM listing_review_history WHERE listing_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
DELETE FROM listing_approved_versions WHERE listing_id IN (SELECT id FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%');
DELETE FROM timber_listings WHERE title ILIKE '%Anjili Timber 20ft%' OR title ILIKE '%test%';
