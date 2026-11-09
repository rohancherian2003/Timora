-- Migration 006: Allow 'sold' listing status

ALTER TABLE timber_listings DROP CONSTRAINT IF EXISTS timber_listings_status_check;
ALTER TABLE timber_listings ADD CONSTRAINT timber_listings_status_check 
  CHECK (status IN ('draft','pending_review','approved','rejected','hidden','out_of_stock','expired','deleted','sold'));

