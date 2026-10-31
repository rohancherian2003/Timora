export interface TimberListingItem {
  id: string;
  title: string;
  title_ml?: string;
  species: string;
  species_ml: string;
  type: string;
  type_ml: string;
  district: string;
  locality: string;
  locality_ml?: string;
  quantity: number;
  unit: string;
  price_per_cft: number;
  seller_name: string;
  seller_phone: string;
  seller_verified: boolean;
  image_url: string;
  additional_images?: string[];
  dimensions: string;
  pieces?: number;
  grade: string;
  transit_pass: boolean;
  moisture: string;
  moisture_level?: string;
  condition_notes?: string;
  condition_notes_ml?: string;
  description?: string;
  description_ml?: string;
  seller_id?: string;
  phone?: string;
}

export const TIMBER_LISTINGS: TimberListingItem[] = [
  {
    id: '1',
    title: 'First-Grade Nilambur Teak Round Logs (A-Class Heartwood)',
    title_ml: 'നിലമ്പൂർ ഒന്നാംതരം തേക്ക് ഉരുണ്ട തടികൾ (ഹാർട്ട്‌വുഡ്)',
    species: 'Teak',
    species_ml: 'തേക്ക്',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Malappuram (മലപ്പുറം)',
    locality: 'Nilambur Forest Division',
    locality_ml: 'നിലമ്പൂർ ഫോറസ്റ്റ് ഡിവിഷൻ',
    quantity: 65,
    unit: 'CFT',
    price_per_cft: 2850,
    seller_name: 'Nilambur Wood Mart & Depot',
    seller_phone: '+919847120001',
    seller_verified: true,
    image_url: '/images/timber/teak-logs.png',
    additional_images: ['/images/timber/teak-logs.png', '/images/timber/mahogany-logs.jpg'],
    dimensions: '14 ft Length × 42 in Girth',
    pieces: 18,
    grade: 'A-Grade Heartwood',
    transit_pass: true,
    moisture: 'Air-Dried Round Log',
    condition_notes: 'Mature Nilambur teak logs with verified Forest Form IV transit pass. Deep golden-brown color, dense heartwood, zero sapwood defects.',
    condition_notes_ml: 'ഫോറസ്റ്റ് ഫോം IV പാസ്സ് സഹിതം ലഭ്യമായ ഒന്നാംതരം നിലമ്പൂർ തേക്ക്. കാതൽ ഉറപ്പുള്ളതും ഉയർന്ന നിലവാരമുള്ളതുമായ ഉരുണ്ട തടികൾ.',
  },
  {
    id: '2',
    title: 'Seasoned African Mahogany Squared Beams & Heavy Logs',
    title_ml: 'ഉണങ്ങിയ മഹാഗണി ചതുര കഴുക്കോലുകൾ & ബീമുകൾ',
    species: 'Mahogany',
    species_ml: 'മഹാഗണി',
    type: 'Squared Beams',
    type_ml: 'ചതുര കഴുക്കോലുകൾ',
    district: 'Kottayam (കോട്ടയം)',
    locality: 'Pala Timber Yard',
    locality_ml: 'പാലാ ടിംബർ യാർഡ്',
    quantity: 80,
    unit: 'CFT',
    price_per_cft: 1850,
    seller_name: 'Meenachil Timber Mart & Sawmill',
    seller_phone: '+919847230002',
    seller_verified: true,
    image_url: '/images/timber/mahogany-logs.jpg',
    additional_images: ['/images/timber/mahogany-logs.jpg', '/images/timber/teak-logs.png'],
    dimensions: '12 ft × 6 in × 6 in',
    pieces: 25,
    grade: 'Select Prime Sawn',
    transit_pass: true,
    moisture: 'Naturally Seasoned',
    condition_notes: 'Perfect for residential roof purlins and rafters. Straight cuts with four squared sides, seasoned for 6 months with minimal moisture.',
    condition_notes_ml: 'വീടിന്റെ മേൽക്കൂര ആവശ്യങ്ങൾക്കും ഫ്രെയിമുകൾക്കും അനുയോജ്യമായ ചതുര മഹാഗണി ബീമുകൾ. 6 മാസം നന്നായി ഉണക്കിയത്.',
  },
  {
    id: '3',
    title: 'Old-Growth Wild Jack (Anjili) Heavy Round Tree Trunks',
    title_ml: 'നാടൻ ആഞ്ഞിലി തടികൾ (വള്ളം, കട്ടിള നിർമ്മാണത്തിന്)',
    species: 'Anjili',
    species_ml: 'ആഞ്ഞിലി',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Ernakulam (എറണാകുളം)',
    locality: 'Perumbavoor Sawmill Zone',
    locality_ml: 'പെരുമ്പാവൂർ സോമിൽ സോൺ',
    quantity: 120,
    unit: 'CFT',
    price_per_cft: 1400,
    seller_name: 'Perumbavoor Raw Saw Mills',
    seller_phone: '+919847340003',
    seller_verified: true,
    image_url: '/images/timber/anjili-logs.jpg',
    additional_images: ['/images/timber/anjili-logs.jpg', '/images/timber/jackfruit-logs.jpg'],
    dimensions: '16 ft Length × 48 in Mid-Girth',
    pieces: 12,
    grade: 'Forest Grade I (Heavy)',
    transit_pass: true,
    moisture: 'Green Log Harvest',
    condition_notes: 'Water-resistant, durable wild Anjili logs ideal for door frames, boat building, and structural pillars. High density wood.',
    condition_notes_ml: 'വെള്ളം തട്ടിയാലും കേടുപാടുകൾ വരാത്ത ഒന്നാംതരം നാടൻ ആഞ്ഞിലി തടികൾ. കട്ടിള, ജനൽ, തൂൺ പണികൾക്ക് ഏറ്റവും അനുയോജ്യം.',
  },
  {
    id: '4',
    title: 'Estate Harvest Rubberwood Round Logs (Bulk Lot)',
    title_ml: 'എസ്റ്റേറ്റ് റബർ തടികൾ (ഫർണിച്ചർ ബോർഡ് ആവശ്യങ്ങൾക്ക്)',
    species: 'Rubberwood',
    species_ml: 'റബർ',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Pathanamthitta (പത്തനംതിട്ട)',
    locality: 'Adoor Agro Timber Yard',
    locality_ml: 'അടൂർ അഗ്രോ ടിംബർ യാർഡ്',
    quantity: 240,
    unit: 'CFT',
    price_per_cft: 650,
    seller_name: 'Adoor Plantation Wood Depot',
    seller_phone: '+919847450004',
    seller_verified: false,
    image_url: '/images/timber/rubberwood-logs.jpg',
    additional_images: ['/images/timber/rubberwood-logs.jpg', '/images/timber/firewood-logs.jpg'],
    dimensions: '10 ft × 32 in Avg Girth',
    pieces: 45,
    grade: 'Commercial Saw Log',
    transit_pass: true,
    moisture: 'Fresh Felled',
    condition_notes: 'Uniform diameter plantation rubber logs suitable for chemical treatment plants and finger-jointed board manufacturing.',
    condition_notes_ml: 'ബോർഡ് ഫാക്ടറികൾക്കും ട്രീറ്റ്‌മെന്റ് പ്ലാന്റുകൾക്കും ആവശ്യമായ ഫ്രഷ് റബർ ലോഗുകൾ. ബൾക്ക് ക്വാണ്ടിറ്റി ലഭ്യമാണ്.',
  },
  {
    id: '5',
    title: 'Heritage Jackfruit (Varikka Plavu) Heavy Balks & Planks',
    title_ml: 'പഴയ വരിക്കപ്ലാവ് തടി (കട്ടിള, പൂജാമുറി, വാതിൽ)',
    species: 'Jackfruit',
    species_ml: 'പ്ലാവ്',
    type: 'Rough-sawn Planks',
    type_ml: 'അറുത്ത പലകകൾ',
    district: 'Thrissur (തൃശ്ശൂർ)',
    locality: 'Wadakkanchery Depot',
    locality_ml: 'വടക്കാഞ്ചേരി ഡിപ്പോ',
    quantity: 65,
    unit: 'CFT',
    price_per_cft: 2200,
    seller_name: 'Central Kerala Timber Yards',
    seller_phone: '+919847560005',
    seller_verified: true,
    image_url: '/images/timber/jackfruit-logs.jpg',
    additional_images: ['/images/timber/jackfruit-logs.jpg', '/images/timber/teak-logs.png'],
    dimensions: '9 ft × 6 in × 3 in',
    pieces: 20,
    grade: 'Heritage Yellow Heartwood',
    transit_pass: true,
    moisture: 'Naturally Seasoned',
    condition_notes: 'Auspicious bright yellow heartwood from mature Varikka Plavu. Highly prized for traditional front door frames, temples, and prayer halls.',
    condition_notes_ml: 'പൂജാമുറികൾക്കും വീടിന്റെ പ്രധാന വാതിലുകൾക്കും ശ്രേഷ്ഠമായ സ്വർണ്ണനിറമുള്ള വരിക്കപ്ലാവ് തടി. ചിതല് പിടിക്കാത്ത ഈട്.',
  },
  {
    id: '6',
    title: 'Authentic Kerala Rosewood (Veetti) Premium Heavy Round Logs',
    title_ml: 'ഒറിജിനൽ കേരള ഈട്ടി / റോസ്വുഡ് (വീട്ടി) തടികൾ',
    species: 'Rosewood',
    species_ml: 'ഈട്ടി / റോസ്വുഡ്',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Wayanad (വയനാട്)',
    locality: 'Mananthavady Depot',
    locality_ml: 'മാനന്തവാടി ഡിപ്പോ',
    quantity: 35,
    unit: 'CFT',
    price_per_cft: 4800,
    seller_name: 'Malabar Heritage Hardwoods',
    seller_phone: '+919847670006',
    seller_verified: true,
    image_url: '/images/timber/rosewood-logs.jpg',
    additional_images: ['/images/timber/rosewood-logs.jpg', '/images/timber/teak-logs.png'],
    dimensions: '12 ft Length × 38 in Girth',
    pieces: 6,
    grade: 'Super Grade Heartwood (Veetti)',
    transit_pass: true,
    moisture: 'Air-Dried Seasoned',
    condition_notes: 'Government auction legal Rosewood logs with Form IV permits. Jet-black grain lines with purple undertones. Highest luxury grade.',
    condition_notes_ml: 'നിയമപരമായ ഫോറസ്റ്റ് പാസ്സ് സഹിതമുള്ള ഒന്നാംതരം മലബാർ ഈട്ടി. റോയൽ ഫർണിച്ചറുകൾക്കും കരകൗശല നിർമ്മിതിക്കും ഉപയോഗിക്കാം.',
  },
  {
    id: '7',
    title: 'Split Firewood & Heavy Industrial Boiler Timber Blocks',
    title_ml: 'വിറക് തടികൾ & ഇൻഡസ്ട്രിയൽ ബോയിലർ ബ്ലോക്കുകൾ',
    species: 'Rubberwood',
    species_ml: 'റബർ / വിറക്',
    type: 'Firewood',
    type_ml: 'വിറക് തടികൾ',
    district: 'Kollam (കൊല്ലം)',
    locality: 'Punalur Yard',
    locality_ml: 'പുനലൂർ യാർഡ്',
    quantity: 15,
    unit: 'Tonnes',
    price_per_cft: 280,
    seller_name: 'Punalur Wood Fuel Depot',
    seller_phone: '+919847780007',
    seller_verified: true,
    image_url: '/images/timber/split-firewood-1.jpg',
    additional_images: ['/images/timber/split-firewood-1.jpg', '/images/timber/split-firewood-2.png'],
    dimensions: 'Split Logs (2 to 3 ft)',
    pieces: 150,
    grade: 'High-Calorie Split Timber',
    transit_pass: true,
    moisture: 'Sun Dried',
    condition_notes: 'Well-dried hardwood split logs ready for bakeries, tea factories, ayurvedic plants, and domestic stoves. High burning efficiency.',
    condition_notes_ml: 'ബേക്കറികൾക്കും ഫാക്ടറികൾക്കും ഉചിതമായ നല്ല ഉണങ്ങിയ വിറക് തടികൾ. പുക കുറവും കൂടുതൽ ചൂടും നൽകുന്നു.',
  },
];

export function getTimberListingById(id: string | undefined): TimberListingItem {
  if (!id) return TIMBER_LISTINGS[0]!;
  const found = TIMBER_LISTINGS.find((item) => item.id === String(id));
  return found || TIMBER_LISTINGS[0]!;
}

export function mapApiListingToItem(row: any): TimberListingItem {
  const images: Array<{ id: string; url: string; is_primary?: boolean }> = Array.isArray(row.images)
    ? row.images
    : (typeof row.images === 'string' ? JSON.parse(row.images || '[]') : []);

  const primaryImg = images.find((img) => img.is_primary)?.url || images[0]?.url || '/images/timber/teak-logs.png';
  const additionalImgs = images.map((img) => img.url).filter(Boolean);

  let dimensions = 'Standard Kerala Sawn';
  if (row.length_ft && row.width_in && row.thickness_in) {
    dimensions = `${row.length_ft} ft × ${row.width_in} in × ${row.thickness_in} in`;
  } else if (row.length_ft && row.diameter_in) {
    dimensions = `${row.length_ft} ft Length × ${row.diameter_in} in Diameter`;
  }

  const districtDisplay = row.district_name_en
    ? `${row.district_name_en}${row.district_name_ml ? ` (${row.district_name_ml})` : ''}`
    : (row.district || 'Kerala');

  return {
    id: String(row.id),
    title: row.title || 'Timber Listing',
    title_ml: row.title_ml || row.title,
    species: row.species_name_en || row.species || 'Teak',
    species_ml: row.species_name_ml || row.species_ml || 'തേക്ക്',
    type: row.type_name_en || row.type || 'Round Logs',
    type_ml: row.type_name_ml || row.type_ml || 'ഉരുണ്ട തടികൾ',
    district: districtDisplay,
    locality: row.locality || 'Kerala Depot',
    locality_ml: row.locality_ml || row.locality || 'കേരള ഡിപ്പോ',
    quantity: parseFloat(String(row.quantity || 0)),
    unit: row.unit ? row.unit.toUpperCase() : 'CFT',
    price_per_cft: parseFloat(String(row.price_per_cft || 0)),
    seller_name: row.business_name || row.seller_name || 'Timber Depot',
    seller_phone: row.seller_phone || '',
    seller_verified: row.seller_verified === 'approved' || row.seller_verified === 'APPROVED' || row.seller_verified === true,
    image_url: primaryImg,
    additional_images: additionalImgs.length > 0 ? additionalImgs : [primaryImg],
    dimensions,
    pieces: row.pieces ? parseInt(String(row.pieces), 10) : undefined,
    grade: row.grade || (row.is_dried ? 'Air-Dried Selected' : 'Standard Timber'),
    transit_pass: true,
    moisture: row.moisture_pct ? `${row.moisture_pct}% Moisture` : (row.is_dried ? 'Seasoned / Dried' : 'Natural Log'),
    condition_notes: row.condition_notes || row.description || 'Verified timber stock from licensed Kerala seller.',
    condition_notes_ml: row.condition_notes_ml || 'കേരള അംഗീകൃത തടി ഡിപ്പോയിൽ നിന്നുള്ള സ്റ്റോക്ക്.',
    description: row.description,
    seller_id: row.seller_id,
  };
}
