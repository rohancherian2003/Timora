import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Trees,
  MapPin,
  Tag,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Calculator,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Layers,
  Award,
  AlertTriangle,
  X,
  HelpCircle
} from 'lucide-react';
import { formatINR } from '@timora/shared';

export interface TimberListingItem {
  id: string;
  title: string;
  species: string;
  species_ml: string;
  type: string;
  type_ml: string;
  district: string;
  locality: string;
  quantity: number;
  unit: string;
  price_per_cft: number;
  seller_name: string;
  seller_verified: boolean;
  image_url: string;
  dimensions: string;
  grade: string;
  transit_pass: boolean;
  moisture: string;
}

// AUTHENTIC RAW TIMBER PHOTOS (തടി മില്ലിലും ഡിപ്പോയിലും വെട്ടിയിട്ടിരിക്കുന്ന പക്കാ തടിയുടെ ഫോട്ടോകൾ)
const EXTENDED_LISTINGS: TimberListingItem[] = [
  {
    id: '1',
    title: 'First-Grade Nilambur Teak Round Logs (A-Class Heartwood)',
    species: 'Teak',
    species_ml: 'തേക്ക്',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Malappuram (മലപ്പുറം)',
    locality: 'Nilambur Forest Depot',
    quantity: 65,
    unit: 'CFT',
    price_per_cft: 2850,
    seller_name: 'Nilambur Government Approved Wood Mart',
    seller_verified: true,
    // Real cut heavy teak round logs stacked in depot with authentic growth rings and bark
    image_url: '/images/timber/teak-logs.png',
    dimensions: '14 ft Length × 42 in Girth',
    grade: 'A-Grade Nilambur Heartwood',
    transit_pass: true,
    moisture: 'Air-Dried Round Log',
  },
  {
    id: '2',
    title: 'Seasoned African Mahogany Squared Beams & Heavy Logs',
    species: 'Mahogany',
    species_ml: 'മഹാഗണി',
    type: 'Squared Beams',
    type_ml: 'ചതുര കഴുക്കോലുകൾ',
    district: 'Kottayam (കോട്ടയം)',
    locality: 'Pala Timber Yard',
    quantity: 80,
    unit: 'CFT',
    price_per_cft: 1850,
    seller_name: 'Meenachil Timber Mart & Sawmill',
    seller_verified: true,
    // Rough cut hardwood lumber and heavy structural beams stacked in sawmill
    image_url: '/images/timber/mahogany-logs.jpg',
    dimensions: '12 ft × 6 in × 6 in',
    grade: 'Select Prime Sawn',
    transit_pass: true,
    moisture: 'Naturally Seasoned',
  },
  {
    id: '3',
    title: 'Old-Growth Wild Jack (Anjili) Heavy Round Tree Trunks',
    species: 'Anjili',
    species_ml: 'ആഞ്ഞിലി',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Ernakulam (എറണാകുളം)',
    locality: 'Perumbavoor Sawmill Zone',
    quantity: 120,
    unit: 'CFT',
    price_per_cft: 1400,
    seller_name: 'Perumbavoor Raw Saw Mills',
    seller_verified: true,
    // Giant felled raw tree trunk log lying at depot with natural thick bark
    image_url: '/images/timber/anjili-logs.jpg',
    dimensions: '16 ft Length × 48 in Mid-Girth',
    grade: 'Forest Grade I (Heavy)',
    transit_pass: true,
    moisture: 'Green Log Harvest',
  },
  {
    id: '4',
    title: 'Estate Harvest Rubberwood Round Logs (Bulk Lot)',
    species: 'Rubberwood',
    species_ml: 'റബർ',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Pathanamthitta (പത്തനംതിട്ട)',
    locality: 'Adoor Agro Timber Yard',
    quantity: 240,
    unit: 'CFT',
    price_per_cft: 650,
    seller_name: 'Adoor Plantation Wood Depot',
    seller_verified: false,
    // Felled rubber and hardwood plantation logs stacked outdoors
    image_url: '/images/timber/rubberwood-logs.jpg',
    dimensions: '10 ft × 32 in Avg Girth',
    grade: 'Commercial Saw Log',
    transit_pass: true,
    moisture: 'Fresh Felled',
  },
  {
    id: '5',
    title: 'Heritage Jackfruit (Varikka Plavu) Heavy Balks & Planks',
    species: 'Jackfruit',
    species_ml: 'പ്ലാവ്',
    type: 'Rough-sawn Planks',
    type_ml: 'അറുത്ത പലകകൾ',
    district: 'Thrissur (തൃശ്ശൂർ)',
    locality: 'Wadakkanchery Depot',
    quantity: 65,
    unit: 'CFT',
    price_per_cft: 2200,
    seller_name: 'Central Kerala Timber Yards',
    seller_verified: true,
    // Solid thick timber trunks and rough cut balks at yard
    image_url: '/images/timber/jackfruit-logs.jpg',
    dimensions: '9 ft × 6 in × 3 in',
    grade: 'Heritage Yellow Heartwood',
    transit_pass: true,
    moisture: 'Naturally Seasoned',
  },
  {
    id: '6',
    title: 'Authentic Kerala Rosewood (Veetti) Premium Heavy Round Logs',
    species: 'Rosewood',
    species_ml: 'ഈട്ടി / റോസ്വുഡ്',
    type: 'Round Logs',
    type_ml: 'ഉരുണ്ട തടികൾ',
    district: 'Wayanad (വയനാട്)',
    locality: 'Mananthavady Depot',
    quantity: 35,
    unit: 'CFT',
    price_per_cft: 4800,
    seller_name: 'Malabar Heritage Hardwoods',
    seller_verified: true,
    // Dark purple-brown Kerala rosewood round logs with prominent bark and grain
    image_url: '/images/timber/rosewood-logs.jpg',
    dimensions: '12 ft Length × 38 in Girth',
    grade: 'Super Grade Heartwood (Veetti)',
    transit_pass: true,
    moisture: 'Air-Dried Seasoned',
  },
  {
    id: '7',
    title: 'Split Firewood & Heavy Industrial Boiler Timber Blocks',
    species: 'Rubberwood',
    species_ml: 'റബർ / വിറക്',
    type: 'Firewood',
    type_ml: 'വിറക് തടികൾ',
    district: 'Kollam (കൊല്ലം)',
    locality: 'Punalur Yard',
    quantity: 15,
    unit: 'Tonnes',
    price_per_cft: 280,
    seller_name: 'Punalur Wood Fuel Depot',
    seller_verified: true,
    // Stacked split firewood tree logs
    image_url: '/images/timber/firewood-logs.jpg',
    dimensions: 'Split Logs (2 to 3 ft)',
    grade: 'High-Calorie Split Timber',
    transit_pass: true,
    moisture: 'Sun Dried',
  },
];

const SPECIES_PILLS = [
  { key: 'all', label: 'All Species', ml: 'എല്ലാം' },
  { key: 'teak', label: 'Teak', ml: 'തേക്ക്' },
  { key: 'mahogany', label: 'Mahogany', ml: 'മഹാഗണി' },
  { key: 'rosewood', label: 'Rosewood', ml: 'ഈട്ടി' },
  { key: 'anjili', label: 'Anjili', ml: 'ആഞ്ഞിലി' },
  { key: 'jackfruit', label: 'Jackfruit', ml: 'പ്ലാവ്' },
  { key: 'rubberwood', label: 'Rubberwood', ml: 'റബർ' },
];

const TYPE_TABS = [
  { key: 'all', label: 'All Raw Timber Stock', ml: 'എല്ലാ തടികളും' },
  { key: 'Round Logs', label: 'Round Logs (ഉരുണ്ട തടി)', ml: 'ഉരുണ്ട തടികൾ' },
  { key: 'Rough-sawn Planks', label: 'Rough Planks (പലക)', ml: 'അറുത്ത പലകകൾ' },
  { key: 'Squared Beams', label: 'Squared Beams (ബീം)', ml: 'കഴുക്കോലുകൾ' },
  { key: 'Firewood', label: 'Firewood (വിറക്)', ml: 'വിറക്' },
];

const DISALLOWED_FURNITURE_KEYWORDS = [
  'plywood', 'ply', 'chair', 'table', 'bed', 'sofa', 'desk', 'door lock',
  'furniture', 'കട്ടിൽ', 'കസേര', 'മേശ', 'പ്ലൈവുഡ്', 'ഫർണിച്ചർ'
];

export function MarketplacePage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Validation Popup State
  const [validationAlert, setValidationAlert] = useState<{
    type: 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Handle Search Input with Validation
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    const lower = value.toLowerCase().trim();

    // 1. Check for disallowed furniture keywords
    const matchedDisallowed = DISALLOWED_FURNITURE_KEYWORDS.find((kw) => lower.includes(kw));
    if (matchedDisallowed) {
      setValidationAlert({
        type: 'warning',
        title: lang === 'en' ? 'Raw Timber Only Platform' : 'റോ തടികൾ മാത്രമുള്ള വിപണി',
        message:
          lang === 'en'
            ? 'Timora exclusively trades raw timber logs and rough-sawn lumber. Finished furniture, doors, and plywood are not listed. Search for Teak, Mahogany, Anjili, or Rubberwood instead.'
            : 'ടിമോറയിൽ ഉരുണ്ട തടികളും അറുത്ത മരങ്ങളും മാത്രമാണ് വ്യാപാരം ചെയ്യുന്നത്. ഫർണിച്ചറോ പ്ലൈവുഡോ ലഭ്യമല്ല. തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ എന്നിവ തിരയുക.',
      });
      return;
    }

    // 2. Check for invalid symbols
    if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
      setValidationAlert({
        type: 'warning',
        title: lang === 'en' ? 'Invalid Search Character' : 'അസാധുവായ അക്ഷരങ്ങൾ',
        message:
          lang === 'en'
            ? 'Please use standard timber species names like Teak, Mahogany, or Anjili.'
            : 'ദയവായി തടി ഇനങ്ങളുടെ പേര് മാത്രം നൽകുക (ഉദാ: തേക്ക്, മഹാഗണി, ആഞ്ഞിലി).',
      });
      return;
    }

    // Clear alert if valid
    if (validationAlert) {
      setValidationAlert(null);
    }
  };

  const filtered = EXTENDED_LISTINGS.filter((item) => {
    if (selectedSpecies !== 'all' && !item.species.toLowerCase().includes(selectedSpecies.toLowerCase())) {
      return false;
    }
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    if (selectedDistrict !== 'all' && !item.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    if (
      searchQuery &&
      !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.locality.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.species.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Trigger alert if valid search yields 0 matches
  useEffect(() => {
    if (searchQuery.trim().length >= 3 && filtered.length === 0 && !validationAlert) {
      setValidationAlert({
        type: 'info',
        title: lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല',
        message:
          lang === 'en'
            ? `No live timber listings matched "${searchQuery}". Try selecting one of the certified species below:`
            : `"${searchQuery}" എന്ന പേരിൽ തടികൾ ലഭ്യമല്ല. താഴെ കാണുന്ന അംഗീകൃത ഇനങ്ങൾ തിരഞ്ഞെടുക്കുക:`,
      });
    }
  }, [searchQuery, filtered.length, validationAlert, lang]);

  return (
    <div className="space-y-8 pb-12">
      
      {/* FLOATING POPUP NOTIFICATION FOR SEARCH VALIDATION */}
      {validationAlert && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-fadeIn">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              validationAlert.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                : 'bg-stone-900/90 border-stone-600 text-stone-100'
            }`}
          >
            {validationAlert.type === 'warning' ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            ) : (
              <HelpCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-xs">
              <div className="font-bold text-sm text-white mb-0.5">{validationAlert.title}</div>
              <p className="leading-relaxed opacity-90">{validationAlert.message}</p>
              
              {/* Quick suggestions on 0 results */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                <button
                  onClick={() => {
                    setSelectedSpecies('teak');
                    setSearchQuery('Teak');
                    setValidationAlert(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]"
                >
                  തേക്ക് (Teak)
                </button>
                <button
                  onClick={() => {
                    setSelectedSpecies('mahogany');
                    setSearchQuery('Mahogany');
                    setValidationAlert(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]"
                >
                  മഹാഗണി (Mahogany)
                </button>
                <button
                  onClick={() => {
                    setSelectedSpecies('anjili');
                    setSearchQuery('Anjili');
                    setValidationAlert(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]"
                >
                  ആഞ്ഞിലി (Anjili)
                </button>
              </div>
            </div>
            <button
              onClick={() => setValidationAlert(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* REFINED TIMBER HERO BANNER WITH HARMONIZED COLORS & CRISP CONTRAST */}
      <section className="relative bg-gradient-to-br from-[#122017] via-[#1a2c20] to-[#20150e] text-white overflow-hidden py-14 sm:py-20 border-b border-[#a16207]/30 shadow-inner">
        {/* Subtle wood texture background overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d97706]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#15803d]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6">
          {/* Top Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#d97706]/50 text-[#fde68a] text-xs font-semibold tracking-wide shadow-sm">
            <Award className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>
              {lang === 'en'
                ? 'Kerala Forest Produce Transit Rules Compliant • 14 Districts Active'
                : 'കേരള ഫോറസ്റ്റ് ട്രാൻസിറ്റ് ചട്ടങ്ങൾ പാലിക്കുന്ന വിപണി'}
            </span>
          </div>

          {/* Heading with Harmonized Font Colors matching the dark wood background */}
          <div className="max-w-3xl space-y-3">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[#f9f8f6]">
              {lang === 'en' ? (
                <>
                  Kerala’s Premier Raw <span className="text-[#f59e0b] drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]">Timber Exchange</span>
                </>
              ) : (
                <>
                  കേരളത്തിലെ വിശ്വസനീയമായ <span className="text-[#f59e0b] drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]">തടി വിപണി</span>
                </>
              )}
            </h1>
            <p className="text-sm sm:text-base text-[#e2e8f0] font-normal leading-relaxed max-w-2xl">
              {lang === 'en'
                ? 'Direct marketplace for authentic round logs and rough-sawn planks. Harvested Nilambur Teak, African Mahogany, Wild Jack (Anjili), and Rubberwood from verified sawmills. Strictly no plywood or furniture.'
                : 'അംഗീകൃത മില്ലുകളിൽ നിന്നും നേരിട്ട് തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ തടികൾ വാങ്ങാം. പക്കാ വെട്ടിയ ഉരുണ്ട തടികളും അറുത്ത പലകകളും മാത്രം.'}
            </p>
          </div>

          {/* Search Box with Interactive Validation Feedback */}
          <div className="max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/30 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow flex items-center">
              <Search className="w-5 h-5 text-stone-500 absolute left-3.5" />
              <input
                type="text"
                placeholder={
                  lang === 'en'
                    ? 'Search real timber (e.g. Nilambur Teak, Anjili, Mahogany)...'
                    : 'തടിയുടെ പേര് തിരയുക (ഉദാ: തേക്ക്, മഹാഗണി, ആഞ്ഞിലി)...'
                }
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-transparent text-stone-900 text-sm font-semibold focus:outline-none placeholder:text-stone-400 placeholder:font-normal"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 text-stone-400 hover:text-stone-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Link
              to="/calculator"
              className="px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm flex-shrink-0"
            >
              <Calculator className="w-4 h-4 text-stone-950" />
              <span>{lang === 'en' ? 'CFT Calculator' : 'തടി അളവ് കണക്കാക്കുക'}</span>
            </Link>
          </div>

          {/* Metrics Counters Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 max-w-4xl text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#f59e0b] font-bold">
                14
              </div>
              <div>
                <span className="block font-bold text-white">{lang === 'en' ? 'Districts' : 'ജില്ലകൾ'}</span>
                <span className="text-stone-300 text-[11px]">{lang === 'en' ? 'Statewide Coverage' : 'കേരളത്തിലുടനീളം'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold">
                0%
              </div>
              <div>
                <span className="block font-bold text-white">{lang === 'en' ? 'Middleman Fee' : 'ഇടനിലക്കാരില്ല'}</span>
                <span className="text-stone-300 text-[11px]">{lang === 'en' ? 'Direct Mill Pricing' : 'നേരിട്ടുള്ള വില'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#f59e0b] font-bold">
                100%
              </div>
              <div>
                <span className="block font-bold text-white">{lang === 'en' ? 'Raw Timber Only' : 'തടി മാത്രം'}</span>
                <span className="text-stone-300 text-[11px]">{lang === 'en' ? 'No Plywood or Furniture' : 'ഫർണിച്ചർ ഇല്ല'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold">
                CFT
              </div>
              <div>
                <span className="block font-bold text-white">{lang === 'en' ? 'Hoppus Standard' : 'ഹോപ്പസ് റൂൾ'}</span>
                <span className="text-stone-300 text-[11px]">{lang === 'en' ? 'Verified Formula' : 'കൃത്യമായ അളവ്'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER & DISCOVERY SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Timber Type Filter Tabs */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-3 gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === tab.key
                    ? 'bg-forest-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {lang === 'en' ? tab.label : tab.ml}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-stone-500 whitespace-nowrap hidden sm:inline">
            {filtered.length} {lang === 'en' ? 'Raw Lots Available' : 'തടികൾ ലഭ്യമാണ്'}
          </span>
        </div>

        {/* Secondary Filter Bar: Species Pills + District Select */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Quick Species Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider mr-1">
              {lang === 'en' ? 'Species:' : 'ഇനം:'}
            </span>
            {SPECIES_PILLS.map((sp) => (
              <button
                key={sp.key}
                onClick={() => setSelectedSpecies(sp.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  selectedSpecies === sp.key
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                    : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {lang === 'en' ? sp.label : sp.ml}
              </button>
            ))}
          </div>

          {/* District Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-forest-700 flex-shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-xl text-stone-800 font-semibold text-xs bg-stone-50 focus:ring-2 focus:ring-forest-600 focus:outline-none w-full md:w-56"
            >
              <option value="all">{lang === 'en' ? 'All 14 Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും'}</option>
              <option value="kottayam">Kottayam (കോട്ടയം)</option>
              <option value="malappuram">Malappuram (മലപ്പുറം)</option>
              <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
              <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
              <option value="kozhikode">Kozhikode (കോഴിക്കോട്)</option>
              <option value="palakkad">Palakkad (പാലക്കാട്)</option>
              <option value="pathanamthitta">Pathanamthitta (പത്തനംതിട്ട)</option>
              <option value="kollam">Kollam (കൊല്ലം)</option>
              <option value="thiruvananthapuram">Thiruvananthapuram (തിരുവനന്തപുരം)</option>
              <option value="kannur">Kannur (കണ്ണൂർ)</option>
              <option value="wayanad">Wayanad (വയനാട്)</option>
              <option value="alappuzha">Alappuzha (ആലപ്പുഴ)</option>
              <option value="idukki">Idukki (ഇടുക്കി)</option>
              <option value="kasaragod">Kasaragod (കാസർഗോഡ്)</option>
            </select>
          </div>
        </div>

        {/* LISTINGS GRID WITH AUTHENTIC CUT TIMBER IMAGES */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4">
            <Trees className="w-12 h-12 text-stone-400 mx-auto" />
            <h3 className="text-lg font-bold text-stone-800">
              {lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല'}
            </h3>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              {lang === 'en'
                ? 'Try clearing species or district filters to discover active timber lots across Kerala.'
                : 'മറ്റു ജില്ലകളോ തടി ഇനങ്ങളോ തിരഞ്ഞെടുത്ത് വീണ്ടും തിരയുക.'}
            </p>
            <button
              onClick={() => {
                setSelectedSpecies('all');
                setSelectedType('all');
                setSelectedDistrict('all');
                setSearchQuery('');
                setValidationAlert(null);
              }}
              className="px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900 transition"
            >
              {lang === 'en' ? 'Reset All Filters' : 'ഫിൽട്ടറുകൾ മാറ്റുക'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col group"
              >
                {/* Real Timber Photography Section */}
                <div className="relative aspect-[16/10] bg-stone-100 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-forest-900 shadow-md backdrop-blur-sm flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-600" />
                      {lang === 'en' ? item.species : item.species_ml}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-900/80 text-white shadow-md backdrop-blur-sm">
                      {item.grade}
                    </span>
                  </div>

                  {item.transit_pass && (
                    <div className="absolute top-3 right-3 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{lang === 'en' ? 'Form IV Transit' : 'പാസ്സ് ഉണ്ട്'}</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black/70 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs font-bold">
                    {item.quantity} {item.unit}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base line-clamp-1 group-hover:text-forest-800 transition">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium">
                      <span className="font-semibold text-stone-700">{lang === 'en' ? item.type : item.type_ml}</span>
                      <span>•</span>
                      <span>{item.dimensions}</span>
                    </p>

                    <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                        <span className="line-clamp-1 font-medium">{item.locality}, {item.district.split(' ')[0]}</span>
                      </div>
                      <span className="text-[11px] text-stone-400 font-medium">{item.moisture}</span>
                    </div>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-stone-500">
                      <span className="text-stone-400">{lang === 'en' ? 'Depot:' : 'ഡിപ്പോ:'}</span>
                      <span className="font-semibold text-stone-800 line-clamp-1">{item.seller_name}</span>
                      {item.seller_verified && (
                        <span title="Verified Yard">
                          <ShieldCheck className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-400">
                        {lang === 'en' ? 'Verified Rate' : 'വില / സി.എഫ്.ടി'}
                      </span>
                      <div className="text-lg font-black text-forest-900 flex items-baseline gap-1">
                        {formatINR(item.price_per_cft)}
                        <span className="text-[10px] text-stone-500 font-semibold">/ {item.unit}</span>
                      </div>
                    </div>

                    <Link
                      to={`/listing/${item.id}`}
                      className="px-4 py-2 rounded-xl bg-forest-800 group-hover:bg-forest-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-1"
                    >
                      <span>{lang === 'en' ? 'View Timber' : 'വിശദാംശങ്ങൾ'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
