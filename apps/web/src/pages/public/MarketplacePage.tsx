import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  X,
  HelpCircle,
  Activity,
  Factory,
  LifeBuoy,
  Calculator,
  Trees,
  Hammer,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '@timora/shared';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';

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

// REAL CUT TIMBER PHOTOS (ഡിപ്പോ & മില്ലുകളിൽ നിന്നുള്ള തനി തടികൾ)
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
    seller_name: 'Nilambur Wood Mart & Depot',
    seller_verified: true,
    image_url: '/images/timber/teak-logs.png',
    dimensions: '14 ft Length × 42 in Girth',
    grade: 'A-Grade Heartwood',
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
  { key: 'all', label: 'All Raw Timber', ml: 'എല്ലാ തടികളും' },
  { key: 'Round Logs', label: 'Round Logs (ഉരുണ്ട തടി)', ml: 'ഉരുണ്ട തടികൾ' },
  { key: 'Rough-sawn Planks', label: 'Rough Planks (പലക)', ml: 'അറുത്ത പലകകൾ' },
  { key: 'Squared Beams', label: 'Squared Beams (ബീം)', ml: 'കഴുക്കോലുകൾ' },
  { key: 'Firewood', label: 'Firewood (വിറക്)', ml: 'വിറക്' },
];

const DISALLOWED_FURNITURE_KEYWORDS = [
  'plywood', 'ply', 'chair', 'table', 'bed', 'sofa', 'desk', 'door lock',
  'furniture', 'കട്ടിൽ', 'കസേര', 'മേശ', 'പ്ലൈവുഡ്', 'ഫർണിച്ചർ'
];

// LIVE YARD ACTIVITY TICKER ITEMS
const LIVE_MARKET_UPDATES = [
  { depot: 'Nilambur Depot', msg: '65 CFT First-Grade Teak Round Logs transit permit issued', ml: 'നിലമ്പൂർ: 65 CFT തേക്ക് ലോഗുകൾ പരിശോധിച്ചുറപ്പിച്ചു' },
  { depot: 'Perumbavoor Mills', msg: '120 CFT Wild Anjili logs loaded for Ernakulam transit', ml: 'പെരുമ്പാവൂർ: 120 CFT ആഞ്ഞിലി തടികൾ ലോഡ് ചെയ്തു' },
  { depot: 'Pala Timber Mart', msg: 'Mahogany 12ft squared beams booked for roofing joinery', ml: 'പാല: മഹാഗണി കഴുക്കോലുകൾ ബുക്കിംഗ് സ്വീകരിച്ചു' },
  { depot: 'Wayanad Division', msg: 'Rosewood (Veetti) certified logs listed with Form IV pass', ml: 'വയനാട്: ഈട്ടി ലോഗുകൾ ഫോറസ്റ്റ് പാസ്സ് സഹിതം ലഭ്യമാണ്' },
  { depot: 'Adoor Agro Depot', msg: '240 CFT Fresh Rubberwood logs ready for dispatch', ml: 'അടൂർ: 240 CFT റബർ തടികൾ വിൽപനയ്ക്ക് തയ്യാറായി' },
];

export function MarketplacePage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);

  // Search Validation Alert
  const [validationAlert, setValidationAlert] = useState<{
    type: 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Handle Search Input with Validation
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const lower = value.toLowerCase().trim();

    const matchedDisallowed = DISALLOWED_FURNITURE_KEYWORDS.find((kw) => lower.includes(kw));
    if (matchedDisallowed) {
      setValidationAlert({
        type: 'warning',
        title: lang === 'en' ? 'Raw Timber Only Platform' : 'റോ തടികൾ മാത്രമുള്ള വിപണി',
        message:
          lang === 'en'
            ? 'Timora exclusively trades raw timber logs and rough-sawn lumber. Finished furniture and plywood are not listed. Search for Teak, Mahogany, Anjili, or Rubberwood instead.'
            : 'ടിമോറയിൽ ഉരുണ്ട തടികളും അറുത്ത മരങ്ങളും മാത്രമാണ് വ്യാപാരം ചെയ്യുന്നത്. ഫർണിച്ചറോ പ്ലൈവുഡോ ലഭ്യമല്ല. തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ എന്നിവ തിരയുക.',
      });
      return;
    }

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

  return (
    <div className="min-h-screen bg-[#E7E1D6] text-[#4A3626] space-y-10 pb-20 relative">
      
      {/* 1. CONTINUOUS AUTO-SCROLLING LIVE YARD TICKER */}
      <div className="bg-[#d5cfc4]/70 border-b border-[#8E7F6B]/30 py-2.5 overflow-hidden ticker-track select-none">
        <div className="flex animate-marquee items-center gap-8 whitespace-nowrap text-xs text-[#4A3626]">
          {[...LIVE_MARKET_UPDATES, ...LIVE_MARKET_UPDATES].map((u, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#5B6147] text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <Activity className="w-2.5 h-2.5" />
                {u.depot}
              </span>
              <span className="text-[#4A3626] font-semibold">{lang === 'en' ? u.msg : u.ml}</span>
              <span className="text-[#8E7F6B]/70 text-sm mx-2">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. MINIMAL & PURPOSE-DRIVEN HERO SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-4 sm:pt-8">
        
        {/* BRAND MOTTO PLAQUE (Clean, Minimal, Distinctive) */}
        <div className="inline-block mx-auto">
          <div className="rounded-full bg-white/70 backdrop-blur-xs border border-[#8E7F6B]/30 px-6 py-2 shadow-xs flex items-center justify-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B6147]" />
            <span
              className="font-serif font-black tracking-[0.24em] text-[#4A3626] text-xs sm:text-sm uppercase select-none"
              style={{ fontFamily: 'Georgia, Cambria, serif' }}
            >
              TIMBER <span className="text-[#5B6147] font-sans font-extrabold mx-2">·</span> PEOPLE <span className="text-[#5B6147] font-sans font-extrabold mx-2">·</span> POSSIBILITIES
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#5B6147]" />
          </div>
        </div>

        {/* Clear Headline */}
        <div className="space-y-3 max-w-3xl mx-auto">
          <h1
            className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#4A3626]"
            style={{ fontFamily: 'Georgia, Cambria, serif' }}
          >
            {lang === 'en' ? (
              <>
                Buy, Sell & Source Raw Timber <br />
                <span className="text-[#5B6147]">Direct From Kerala Sawmills</span>
              </>
            ) : (
              <>
                വീടുപണിക്കും ആവശ്യങ്ങൾക്കും <br />
                <span className="text-[#5B6147]">തടി നേരിട്ട് വാങ്ങാനും വിൽക്കാനും</span>
              </>
            )}
          </h1>
          <p className="text-sm sm:text-base text-[#7A5A3A] font-medium max-w-2xl mx-auto leading-relaxed">
            {lang === 'en'
              ? 'Connecting house owners, buyers, carpenters, and licensed timber mills across Kerala with verified Forest Form IV passes and genuine Hoppus CFT pricing.'
              : 'കേരളത്തിലെ വീടുപണിയുന്നവർക്കും ആശാരിമാർക്കും തടി ഡിപ്പോകൾക്കും ഇടനിലക്കാരില്ലാതെ നേരിട്ട് വിൽക്കാനും വാങ്ങാനും.'}
          </p>
        </div>

        {/* Minimal Search Bar with Validation */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative flex items-center bg-white rounded-2xl shadow-md border border-[#8E7F6B]/30 p-1.5 sm:p-2 focus-within:ring-2 focus-within:ring-[#5B6147] transition">
            <Search className="w-5 h-5 text-[#8E7F6B] ml-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search Teak, Mahogany, Anjili, Rubberwood, Nilambur, Pala...'
                  : 'തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ, നിലമ്പൂർ തിരയുക...'
              }
              className="w-full px-3 py-2 text-sm bg-transparent border-none text-[#4A3626] font-semibold focus:outline-none placeholder:text-[#8E7F6B]/70"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setValidationAlert(null);
                }}
                className="p-1 text-[#8E7F6B] hover:text-[#4A3626]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Validation Notice */}
          {validationAlert && (
            <div className="absolute left-0 right-0 top-full mt-2 z-30 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#8E7F6B]/40 shadow-xl text-left flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-[#7A5A3A] flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-xs text-[#4A3626]">
                <span className="font-bold block text-xs">{validationAlert.title}</span>
                <p className="mt-0.5 text-[#7A5A3A]">{validationAlert.message}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setSelectedSpecies('teak');
                      setSearchQuery('Teak');
                      setValidationAlert(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#5B6147] text-white text-[11px] font-bold"
                  >
                    തേക്ക് (Teak)
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSpecies('mahogany');
                      setSearchQuery('Mahogany');
                      setValidationAlert(null);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#5B6147] text-white text-[11px] font-bold"
                  >
                    മഹാഗണി (Mahogany)
                  </button>
                </div>
              </div>
              <button onClick={() => setValidationAlert(null)} className="text-[#8E7F6B] hover:text-[#4A3626]">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Quick Nav Badges: Mills, Carpenters, Calculator, Transport */}
        <div className="flex items-center justify-center flex-wrap gap-2.5 pt-1">
          <Link
            to="/mills"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs"
          >
            <Factory className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Sawmills Directory' : 'തടി മില്ലുകൾ'}</span>
          </Link>

          <Link
            to="/calculator"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs"
          >
            <Calculator className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Hoppus CFT Calc' : 'സി.എഫ്.ടി കണക്ക്'}</span>
          </Link>

          <Link
            to="/carpenters"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs"
          >
            <Hammer className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Carpenters' : 'തച്ചൻമാർ'}</span>
          </Link>

          <Link
            to="/transport"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs"
          >
            <Truck className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Logistics' : 'തടി ലോറികൾ'}</span>
          </Link>
        </div>
      </section>

      {/* 3. MINIMAL FILTER BAR & STOCK DISCOVERY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Type Filter Buttons */}
        <div className="flex items-center justify-between border-b border-[#8E7F6B]/20 pb-3 gap-3 overflow-x-auto">
          <div className="flex items-center gap-2">
            {TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedType === tab.key
                    ? 'bg-[#3F452F] text-white shadow-xs'
                    : 'bg-white/80 text-[#7A5A3A] hover:bg-white border border-[#8E7F6B]/30'
                }`}
              >
                {lang === 'en' ? tab.label : tab.ml}
              </button>
            ))}
          </div>

          <span className="text-xs font-bold text-[#7A5A3A] whitespace-nowrap hidden sm:inline">
            {filtered.length} {lang === 'en' ? 'Lots Available' : 'തടികൾ ലഭ്യമാണ്'}
          </span>
        </div>

        {/* Species & District Filter Pills */}
        <div className="bg-white/70 backdrop-blur-xs p-3.5 rounded-2xl border border-[#8E7F6B]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-[#8E7F6B] uppercase tracking-wider mr-1">
              {lang === 'en' ? 'Species:' : 'ഇനം:'}
            </span>
            {SPECIES_PILLS.map((sp) => (
              <button
                key={sp.key}
                onClick={() => setSelectedSpecies(sp.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedSpecies === sp.key
                    ? 'bg-[#5B6147] text-white font-bold shadow-2xs'
                    : 'bg-white/90 text-[#4A3626] hover:bg-white border border-[#8E7F6B]/20'
                }`}
              >
                {lang === 'en' ? sp.label : sp.ml}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <MapPin className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 border border-[#8E7F6B]/30 rounded-xl text-[#4A3626] font-semibold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6147] w-full md:w-52"
            >
              <option value="all">{lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും'}</option>
              <option value="malappuram">Malappuram (മലപ്പുറം)</option>
              <option value="kottayam">Kottayam (കോട്ടയം)</option>
              <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
              <option value="pathanamthitta">Pathanamthitta (പത്തനംതിട്ട)</option>
              <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
              <option value="wayanad">Wayanad (വയനാട്)</option>
              <option value="kollam">Kollam (കൊല്ലം)</option>
            </select>
          </div>
        </div>

        {/* LISTINGS GRID */}
        {filtered.length === 0 ? (
          <div className="bg-white/80 rounded-3xl border border-[#8E7F6B]/30 p-10 text-center space-y-3">
            <Trees className="w-10 h-10 text-[#8E7F6B] mx-auto" />
            <h3 className="text-base font-bold text-[#4A3626]">
              {lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല'}
            </h3>
            <p className="text-xs text-[#7A5A3A]">
              {lang === 'en' ? 'Try adjusting species or district filters.' : 'മറ്റു ജില്ലകളോ തടി ഇനങ്ങളോ തിരഞ്ഞെടുത്ത് വീണ്ടും തിരയുക.'}
            </p>
            <button
              onClick={() => {
                setSelectedSpecies('all');
                setSelectedType('all');
                setSelectedDistrict('all');
                setSearchQuery('');
                setValidationAlert(null);
              }}
              className="px-4 py-2 bg-[#5B6147] text-white rounded-xl text-xs font-bold hover:bg-[#3F452F] transition"
            >
              {lang === 'en' ? 'Reset Filters' : 'ഫിൽട്ടറുകൾ മാറ്റുക'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-[#8E7F6B]/30 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col group"
              >
                {/* Real Timber Photo */}
                <div className="relative aspect-[16/10] bg-[#d5cfc4]/50 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#4A3626] shadow-xs flex items-center gap-1">
                      <Tag className="w-3 h-3 text-[#5B6147]" />
                      {lang === 'en' ? item.species : item.species_ml}
                    </span>
                  </div>

                  {item.transit_pass && (
                    <div className="absolute top-2.5 right-2.5 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{lang === 'en' ? 'Form IV Pass' : 'പാസ്സ് ഉണ്ട്'}</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {item.quantity} {item.unit}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-[#4A3626] text-sm line-clamp-1 group-hover:text-[#5B6147] transition">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#7A5A3A] mt-1 flex items-center gap-1">
                      <span>{lang === 'en' ? item.type : item.type_ml}</span>
                      <span>•</span>
                      <span>{item.dimensions}</span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-[#8E7F6B]/20 flex items-center justify-between text-xs text-[#7A5A3A]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
                        <span className="line-clamp-1">{item.locality}</span>
                      </div>
                      <span className="text-[11px] text-[#8E7F6B]">{item.moisture}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#8E7F6B]/20 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8E7F6B] block">
                        {lang === 'en' ? 'Rate / CFT' : 'നിരക്ക് / CFT'}
                      </span>
                      <span className="text-base font-extrabold text-[#4A3626]">
                        {formatINR(item.price_per_cft)}
                      </span>
                    </div>

                    <Link
                      to={`/listing/${item.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                    >
                      <span>{lang === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. KERALA TIMBER MILLS SPOTLIGHT (Minimal Section) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white/80 rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7E1D6] text-[#4A3626] text-[11px] font-bold mb-2">
                <Factory className="w-3.5 h-3.5 text-[#5B6147]" />
                <span>{lang === 'en' ? 'Direct Sawmills' : 'തടി മില്ലുകൾ'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#4A3626]">
                {lang === 'en' ? 'Licensed Sawmills Across Kerala' : 'കേരളത്തിലെ അംഗീകൃത തടി മില്ലുകൾ'}
              </h2>
            </div>
            <Link
              to="/mills"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5B6147] hover:underline"
            >
              <span>{lang === 'en' ? 'View Full Mill Directory' : 'എല്ലാ മില്ലുകളും കാണുക'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                KL-SAW-EKM-1048
              </span>
              <h4 className="font-bold text-[#4A3626] text-sm">Perumbavoor Modern Sawmills</h4>
              <p className="text-xs text-[#7A5A3A]">Kandanthara, Perumbavoor, Ernakulam</p>
              <p className="text-[11px] text-[#8E7F6B]">High-speed band saws, Anjili & Teak log slicing.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                KL-SAW-PTA-1982
              </span>
              <h4 className="font-bold text-[#4A3626] text-sm">Adoor Central Timber Sawing Yard</h4>
              <p className="text-xs text-[#7A5A3A]">Adoor Bypass, Pathanamthitta</p>
              <p className="text-[11px] text-[#8E7F6B]">Traditional house joinery timber & door beams.</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 space-y-2">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                KL-SAW-PTA-2104
              </span>
              <h4 className="font-bold text-[#4A3626] text-sm">Konni Forest Valley Plant</h4>
              <p className="text-xs text-[#7A5A3A]">Konni Depot, Pathanamthitta</p>
              <p className="text-[11px] text-[#8E7F6B]">Kiln seasoning plant & Nilambur Teak logs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FLOATING RIGHT-SIDE "RAISE A TICKET" BUTTON */}
      <div className="fixed right-3 sm:right-6 bottom-20 md:bottom-8 z-40">
        <button
          onClick={() => setIsRaiseTicketOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-[#5B6147] to-[#3F452F] text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          title={lang === 'en' ? 'Raise a Support Ticket / Grievance' : 'പരാതി സമർപ്പിക്കുക (Raise a Ticket)'}
        >
          <LifeBuoy className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300 flex-shrink-0" />
          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-[9px] text-[#d5cfc4] uppercase font-bold block">
              {lang === 'en' ? 'Support' : 'സഹായം'}
            </span>
            <span className="font-extrabold text-white text-xs">
              {lang === 'en' ? 'Raise a Ticket' : 'റൈസ് എ ടിക്കറ്റ്'}
            </span>
          </div>
        </button>
      </div>

      {/* RAISE TICKET MODAL */}
      <RaiseTicketModal
        isOpen={isRaiseTicketOpen}
        onClose={() => setIsRaiseTicketOpen(false)}
        lang={lang}
      />
    </div>
  );
}
