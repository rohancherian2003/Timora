-- ─────────────────────────────────────────────────────────────────────────────
-- TIMORA DATABASE SCHEMA MIGRATION 001
-- PostgreSQL 14+ / Supabase / Neon compatible
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────
-- 1. REFERENCE CATALOG TABLES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timber_species (
  id       SERIAL PRIMARY KEY,
  name_en  TEXT NOT NULL,
  name_ml  TEXT NOT NULL,
  slug     TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS timber_types (
  id          SERIAL PRIMARY KEY,
  name_en     TEXT NOT NULL,
  name_ml     TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS kerala_districts (
  id       SERIAL PRIMARY KEY,
  name_en  TEXT NOT NULL,
  name_ml  TEXT NOT NULL
);

-- ─────────────────────────────────────────
-- 2. IDENTITY, AUTH & PROFILES
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS users (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone         TEXT UNIQUE NOT NULL,
  pin_hash      TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('buyer','seller','carpenter','admin')),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  district_id   INT REFERENCES kerala_districts(id),
  avatar_url    TEXT,
  language_pref TEXT DEFAULT 'en' CHECK (language_pref IN ('en','ml')),
  account_tier  TEXT DEFAULT 'free' CHECK (account_tier IN ('free','premium')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seller_profiles (
  user_id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  business_name    TEXT,
  district_id      INT REFERENCES kerala_districts(id),
  locality         TEXT,
  approval_status  TEXT DEFAULT 'pending'
                   CHECK (approval_status IN ('pending','approved','rejected','suspended')),
  approved_by      UUID REFERENCES users(id),
  approval_note    TEXT,
  approved_at      TIMESTAMPTZ,
  contact_count    INT DEFAULT 0,
  contact_reset    DATE DEFAULT CURRENT_DATE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carpenter_profiles (
  user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  specialization    TEXT[] DEFAULT '{}',
  experience_yrs    INT DEFAULT 0,
  portfolio_urls    TEXT[] DEFAULT '{}',
  district_id       INT REFERENCES kerala_districts(id),
  is_admin_verified BOOLEAN DEFAULT false,
  rating            NUMERIC(3,2) DEFAULT 0.00,
  rating_count      INT DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS otp_challenges (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone         TEXT NOT NULL,
  otp_hash      TEXT NOT NULL,
  purpose       TEXT NOT NULL CHECK (purpose IN ('register','login','forgot_pin','phone_change')),
  expires_at    TIMESTAMPTZ NOT NULL,
  attempts      INT DEFAULT 0,
  is_used       BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS login_history (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address TEXT,
  user_agent TEXT,
  success    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type  TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  reason      TEXT,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','processed','rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. TIMBER LISTINGS & MODERATION
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS timber_listings (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  species_id       INT NOT NULL REFERENCES timber_species(id),
  timber_type_id   INT NOT NULL REFERENCES timber_types(id),
  district_id      INT NOT NULL REFERENCES kerala_districts(id),
  locality         TEXT,
  quantity         NUMERIC NOT NULL CHECK (quantity >= 0),
  unit             TEXT NOT NULL CHECK (unit IN ('cft','pieces','kg','tonnes')),
  price_per_cft    NUMERIC NOT NULL CHECK (price_per_cft >= 0),
  pricing_mode     TEXT DEFAULT 'fixed' CHECK (pricing_mode IN ('fixed','negotiable')),
  length_ft        NUMERIC,
  width_in         NUMERIC,
  thickness_in     NUMERIC,
  diameter_in      NUMERIC,
  pieces           INT,
  is_dried         BOOLEAN,
  moisture_pct     NUMERIC,
  has_cracks       BOOLEAN,
  condition_notes  TEXT,
  description      TEXT,
  status           TEXT DEFAULT 'draft'
                   CHECK (status IN ('draft','pending_review','approved','rejected','hidden','out_of_stock','expired')),
  rejection_reason TEXT,
  approved_by      UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  view_count       INT DEFAULT 0,
  expires_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_approved_versions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  UUID NOT NULL REFERENCES timber_listings(id) ON DELETE CASCADE,
  snapshot    JSONB NOT NULL,
  approved_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_images (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  UUID NOT NULL REFERENCES timber_listings(id) ON DELETE CASCADE,
  storage_key TEXT NOT NULL,
  url         TEXT NOT NULL,
  is_primary  BOOLEAN DEFAULT false,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_review_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id  UUID NOT NULL REFERENCES timber_listings(id) ON DELETE CASCADE,
  reviewed_by UUID REFERENCES users(id),
  action      TEXT NOT NULL CHECK (action IN ('approved','rejected','hidden','unhidden')),
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES timber_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (buyer_id, listing_id)
);

CREATE TABLE IF NOT EXISTS buyer_timber_requests (
  id                    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id              UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  species_id            INT REFERENCES timber_species(id),
  timber_type_id        INT REFERENCES timber_types(id),
  quantity              NUMERIC,
  unit                  TEXT,
  dimensions            JSONB,
  preferred_district_id INT REFERENCES kerala_districts(id),
  budget                NUMERIC,
  notes                 TEXT,
  status                TEXT DEFAULT 'submitted'
                        CHECK (status IN ('submitted','under_review','shared_with_sellers','response_received','fulfilled','closed')),
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 4. ENQUIRIES, OFFERS & NEGOTIATION CHAT
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS enquiries (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id     UUID NOT NULL REFERENCES timber_listings(id) ON DELETE CASCADE,
  buyer_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity       NUMERIC NOT NULL CHECK (quantity > 0),
  proposed_price NUMERIC CHECK (proposed_price >= 0),
  message        TEXT,
  contact_phone  TEXT,
  status         TEXT DEFAULT 'open'
                 CHECK (status IN ('open','offer_made','accepted','rejected','ordered','closed')),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offers (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id   UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
  made_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity     NUMERIC NOT NULL CHECK (quantity > 0),
  price        NUMERIC NOT NULL CHECK (price >= 0),
  message      TEXT,
  expires_at   TIMESTAMPTZ,
  status       TEXT DEFAULT 'pending'
               CHECK (status IN ('pending','accepted','rejected','countered','expired','withdrawn')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  enquiry_id UUID UNIQUE REFERENCES enquiries(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body            TEXT NOT NULL,
  is_read         BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 5. ORDERS & INVENTORY TRACKING
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS orders (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id       UUID NOT NULL REFERENCES timber_listings(id),
  buyer_id         UUID NOT NULL REFERENCES users(id),
  seller_id        UUID NOT NULL REFERENCES users(id),
  enquiry_id       UUID REFERENCES enquiries(id),
  snapshot         JSONB NOT NULL,
  agreed_qty       NUMERIC NOT NULL CHECK (agreed_qty > 0),
  agreed_price     NUMERIC NOT NULL CHECK (agreed_price >= 0),
  status           TEXT DEFAULT 'awaiting_confirmation'
                   CHECK (status IN (
                     'awaiting_confirmation','confirmed','ready',
                     'in_progress','delivered_pending','completed',
                     'cancellation_requested','cancelled','disputed'
                   )),
  buyer_confirmed  BOOLEAN DEFAULT false,
  seller_confirmed BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_status_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status   TEXT NOT NULL,
  changed_by  UUID REFERENCES users(id),
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cancellation_requests (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES users(id),
  reason       TEXT NOT NULL,
  response     TEXT,
  status       TEXT DEFAULT 'pending'
               CHECK (status IN ('pending','approved','rejected','admin_review')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 6. DISPUTES, REVIEWS, REPORTS & BLOCKS
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS disputes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  raised_by   UUID NOT NULL REFERENCES users(id),
  explanation TEXT NOT NULL,
  admin_notes TEXT,
  decision    TEXT,
  status      TEXT DEFAULT 'open'
              CHECK (status IN ('open','under_review','resolved','closed')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reviewer_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT,
  is_moderated BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (order_id, reviewer_id)
);

CREATE TABLE IF NOT EXISTS reports (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user','listing','message','review')),
  target_id   UUID NOT NULL,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT DEFAULT 'pending'
              CHECK (status IN ('pending','reviewed','actioned','dismissed')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_blocks (
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- ─────────────────────────────────────────
-- 7. NOTIFICATIONS, SUPPORT, TRANSPORT, SUBSCRIPTIONS & AUDIT
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS notifications (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   TEXT NOT NULL,
  title_en   TEXT NOT NULL,
  title_ml   TEXT,
  body_en    TEXT,
  body_ml    TEXT,
  action_url TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id   UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  enquiries BOOLEAN DEFAULT true,
  offers    BOOLEAN DEFAULT true,
  orders    BOOLEAN DEFAULT true,
  wishlist  BOOLEAN DEFAULT true,
  support   BOOLEAN DEFAULT true,
  security  BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  reference   TEXT UNIQUE NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  status      TEXT DEFAULT 'open'
              CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id  UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_providers (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name          TEXT NOT NULL,
  contact       TEXT,
  service_areas TEXT[] DEFAULT '{}',
  notes         TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_quotes (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id   UUID NOT NULL REFERENCES transport_providers(id) ON DELETE CASCADE,
  from_district TEXT,
  to_district   TEXT,
  rate_per_ton  NUMERIC,
  notes         TEXT,
  quoted_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan        TEXT DEFAULT 'premium',
  starts_at   TIMESTAMPTZ NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  payment_ref TEXT,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  prev_state  JSONB,
  new_state   JSONB,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 8. INDEXES FOR HIGH-PERFORMANCE SEARCH & FILTERS
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_listings_species_status ON timber_listings(species_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_district_status ON timber_listings(district_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_type_status ON timber_listings(timber_type_id, status);
CREATE INDEX IF NOT EXISTS idx_listings_price ON timber_listings(price_per_cft);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON timber_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_buyer ON enquiries(buyer_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_seller ON enquiries(seller_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
