-- Migration 007: Add approval_status to timber_listings and is_dismissed to notifications

ALTER TABLE timber_listings ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending';
CREATE INDEX IF NOT EXISTS idx_timber_listings_approval_status ON timber_listings(approval_status);

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_dismissed BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_notifications_user_dismissed ON notifications(user_id, is_dismissed);

