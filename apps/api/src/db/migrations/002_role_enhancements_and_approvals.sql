-- ─────────────────────────────────────────────────────────────────────────────
-- TIMORA DATABASE SCHEMA MIGRATION 002
-- Role Enhancements, Seller Subtypes, Timber Mills, Transport Profiles & Approvals
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend user roles to include 'transport'
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('buyer', 'seller', 'carpenter', 'transport', 'admin'));

-- 2. Add seller_subtype and normalize approval statuses on seller_profiles
ALTER TABLE seller_profiles
  ADD COLUMN IF NOT EXISTS seller_subtype TEXT DEFAULT 'individual'
  CHECK (seller_subtype IN ('individual', 'mill_owner'));

-- 3. Timber Mills table (separates mill business identity from owner personal identity)
CREATE TABLE IF NOT EXISTS timber_mills (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mill_name          TEXT NOT NULL,
  license_no         TEXT,
  district_id        INT REFERENCES kerala_districts(id),
  locality           TEXT,
  daily_cft_capacity NUMERIC DEFAULT 0,
  saw_types          TEXT[] DEFAULT '{}',
  approval_status    TEXT DEFAULT 'PENDING_APPROVAL'
                     CHECK (approval_status IN ('PENDING_APPROVAL', 'APPROVED', 'ACTION_REQUIRED', 'REJECTED', 'SUSPENDED', 'pending', 'approved', 'rejected', 'suspended')),
  approval_note      TEXT,
  approved_by        UUID REFERENCES users(id),
  approved_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Carpenter profiles approval columns
ALTER TABLE carpenter_profiles
  ADD COLUMN IF NOT EXISTS business_name TEXT,
  ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'PENDING_APPROVAL'
  CHECK (approval_status IN ('PENDING_APPROVAL', 'APPROVED', 'ACTION_REQUIRED', 'REJECTED', 'SUSPENDED', 'pending', 'approved', 'rejected', 'suspended')),
  ADD COLUMN IF NOT EXISTS approval_note TEXT,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- 5. Transport Owner profiles table
CREATE TABLE IF NOT EXISTS transport_owner_profiles (
  id                 UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name      TEXT NOT NULL,
  vehicle_types      TEXT[] DEFAULT '{}',
  vehicle_count      INT DEFAULT 1,
  max_tonnage        NUMERIC DEFAULT 10.0,
  district_id        INT REFERENCES kerala_districts(id),
  service_districts  INT[] DEFAULT '{}',
  form_iv_cleared    BOOLEAN DEFAULT true,
  approval_status    TEXT DEFAULT 'PENDING_APPROVAL'
                     CHECK (approval_status IN ('PENDING_APPROVAL', 'APPROVED', 'ACTION_REQUIRED', 'REJECTED', 'SUSPENDED', 'pending', 'approved', 'rejected', 'suspended')),
  approval_note      TEXT,
  approved_by        UUID REFERENCES users(id),
  approved_at        TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for rapid lookups and public filtering
CREATE INDEX IF NOT EXISTS idx_timber_mills_owner ON timber_mills(owner_id);
CREATE INDEX IF NOT EXISTS idx_timber_mills_status ON timber_mills(approval_status);
CREATE INDEX IF NOT EXISTS idx_transport_owner_user ON transport_owner_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_transport_owner_status ON transport_owner_profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_seller_profiles_subtype ON seller_profiles(seller_subtype);
