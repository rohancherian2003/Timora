-- ─────────────────────────────────────────────────────────────────────────────
-- TIMORA SEED DATA
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. TIMBER SPECIES (8 Kerala species with Malayalam names)
INSERT INTO timber_species (name_en, name_ml, slug) VALUES
  ('Teak',       'തേക്ക്',    'teak'),
  ('Mahogany',   'മഹാഗണി',  'mahogany'),
  ('Anjili',     'ആഞ്ഞിലി',  'anjili'),
  ('Rubberwood', 'റബർ',      'rubberwood'),
  ('Mango Wood', 'മാവ്',     'mango'),
  ('Jackfruit',  'പ്ലാവ്',   'jackfruit'),
  ('Rosewood',   'ഇടപ്പിലി', 'rosewood'),
  ('Coconut',    'തെങ്ങ്',   'coconut')
ON CONFLICT (slug) DO NOTHING;

-- 2. TIMBER TYPES
INSERT INTO timber_types (name_en, name_ml, slug, description) VALUES
  ('Round Logs',        'വൃത്ത ലോഗ്',        'round_log',        'Natural cylindrical unhewn logs direct from timber yards'),
  ('Rough-sawn Planks', 'ഉരുണ്ട പലക',       'rough_sawn_plank', 'Directly sawn timber planks suitable for joinery and framing'),
  ('Squared Beams',     'ചതുരത്തൂൺ',         'squared_beam',     'Four-side squared heavy timber beams for construction and roofing'),
  ('Firewood',          'വിറക്',             'firewood',         'Quantity/weight-based timber fuel pieces')
ON CONFLICT (slug) DO NOTHING;

-- 3. KERALA DISTRICTS (All 14 districts)
INSERT INTO kerala_districts (id, name_en, name_ml) VALUES
  (1,  'Thiruvananthapuram', 'തിരുവനന്തപുരം'),
  (2,  'Kollam',             'കൊല്ലം'),
  (3,  'Pathanamthitta',     'പത്തനംതിട്ട'),
  (4,  'Alappuzha',          'ആലപ്പുഴ'),
  (5,  'Kottayam',           'കോട്ടയം'),
  (6,  'Idukki',             'ഇടുക്കി'),
  (7,  'Ernakulam',          'എറണാകുളം'),
  (8,  'Thrissur',           'തൃശ്ശൂർ'),
  (9,  'Palakkad',           'പാലക്കാട്'),
  (10, 'Malappuram',         'മലപ്പുറം'),
  (11, 'Kozhikode',          'കോഴിക്കോട്'),
  (12, 'Wayanad',            'വയനാട്'),
  (13, 'Kannur',             'കണ്ണൂർ'),
  (14, 'Kasaragod',          'കാസർഗോഡ്')
ON CONFLICT (id) DO UPDATE SET name_en = EXCLUDED.name_en, name_ml = EXCLUDED.name_ml;

-- 4. TRANSPORT PROVIDERS (Reference directory for timber logistics in Kerala)
INSERT INTO transport_providers (name, contact, service_areas, notes) VALUES
  ('Malabar Timber Carriers', '+919447100001', ARRAY['Kozhikode', 'Malappuram', 'Kannur', 'Wayanad'], 'Heavy crane-mounted trucks for long timber logs'),
  ('Travancore Logistics & Wood Movers', '+919447200002', ARRAY['Ernakulam', 'Kottayam', 'Alappuzha', 'Idukki'], 'Equipped with permits for inter-district raw timber transit'),
  ('Highland Timber Transport', '+919447300003', ARRAY['Palakkad', 'Thrissur', 'Ernakulam'], 'Specialized in bulk sawn planks and squared beams')
ON CONFLICT DO NOTHING;

-- 5. REFERENCE VERIFIED SAWMILLS
INSERT INTO users (id, phone, pin_hash, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', '+919447101234', '$argon2id$v=19$m=65536,t=3,p=4$FPcOG1mYtdFdHwm3qHDlPA$OHQl/4mm7sqaDB531T9bgPHaB72ejmc6Osz18t+33Ck', 'seller'),
  ('a0000000-0000-0000-0000-000000000002', '+919447606789', '$argon2id$v=19$m=65536,t=3,p=4$FPcOG1mYtdFdHwm3qHDlPA$OHQl/4mm7sqaDB531T9bgPHaB72ejmc6Osz18t+33Ck', 'seller')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO user_profiles (user_id, name) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Mathew Varghese & Brothers'),
  ('a0000000-0000-0000-0000-000000000002', 'V. S. Jayaprakash')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO seller_profiles (user_id, business_name, district_id, locality, approval_status, seller_subtype) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Periyar Sawmills & Wood Processing Industries', 7, 'Perumbavoor Timber Zone', 'approved', 'mill_owner'),
  ('a0000000-0000-0000-0000-000000000002', 'Chalakudy River Basin Sawmill & Timber Depot', 8, 'Chalakudy Main Road', 'approved', 'mill_owner')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO timber_mills (id, owner_id, mill_name, license_no, district_id, locality, daily_cft_capacity, saw_types, approval_status) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Periyar Sawmills & Wood Processing Industries', 'KL-SAW-EKM-4402/2012', 7, 'Perumbavoor Timber Zone', 450, ARRAY['Horizontal Bandsaw', 'Multi-rip Saws', 'Plank Thickness Planer'], 'approved'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'Chalakudy River Basin Sawmill & Timber Depot', 'KL-SAW-TSR-2890/2003', 8, 'Chalakudy Main Road', 300, ARRAY['Vertical Log Bandsaw', 'Circular Edgers'], 'approved')
ON CONFLICT DO NOTHING;

-- 6. REFERENCE VERIFIED CARPENTERS
INSERT INTO users (id, phone, pin_hash, role) VALUES
  ('a0000000-0000-0000-0000-000000000003', '+919447300101', '$argon2id$v=19$m=65536,t=3,p=4$FPcOG1mYtdFdHwm3qHDlPA$OHQl/4mm7sqaDB531T9bgPHaB72ejmc6Osz18t+33Ck', 'carpenter'),
  ('a0000000-0000-0000-0000-000000000004', '+919447300102', '$argon2id$v=19$m=65536,t=3,p=4$FPcOG1mYtdFdHwm3qHDlPA$OHQl/4mm7sqaDB531T9bgPHaB72ejmc6Osz18t+33Ck', 'carpenter')
ON CONFLICT (phone) DO NOTHING;

INSERT INTO user_profiles (user_id, name) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'K. R. Mohanan Achari'),
  ('a0000000-0000-0000-0000-000000000004', 'Babu Master Wood Joinery')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO carpenter_profiles (user_id, business_name, specialization, experience_yrs, district_id, is_admin_verified, rating, rating_count, approval_status) VALUES
  ('a0000000-0000-0000-0000-000000000003', 'Mohanan Traditional Woodworks', ARRAY['Traditional Wooden Doors', 'Roof Truss Framing', 'Window Casements'], 28, 5, true, 4.9, 34, 'approved'),
  ('a0000000-0000-0000-0000-000000000004', 'Babu Master Wood Joinery', ARRAY['Teak Carving & Door Frames', 'Structural Timber Beams'], 22, 8, true, 4.8, 27, 'approved')
ON CONFLICT (user_id) DO NOTHING;
