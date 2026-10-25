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
