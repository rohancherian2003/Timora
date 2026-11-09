import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  MapPin,
  Tag,
  CheckCircle2,
  AlertTriangle,
  X,
  SlidersHorizontal,
  RotateCcw,
  Factory,
  LifeBuoy,
  Calculator,
  Trees,
  Hammer,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { formatINR, formatTimberListingId } from '@timora/shared';
import { TIMBER_LISTINGS, TimberListingItem, mapApiListingToItem } from '../../utils/timberListings';
import { api } from '../../lib/api';

const SPECIES_PILLS = [
  { key: 'all', label: 'All Species', ml: 'എല്ലാ ഇനങ്ങളും' },
  { key: 'teak', label: 'Teak', ml: 'തേക്ക്' },
  { key: 'mahogany', label: 'Mahogany', ml: 'മഹാഗണി' },
  { key: 'rosewood', label: 'Rosewood', ml: 'ഈട്ടി' },
  { key: 'anjili', label: 'Anjili', ml: 'ആഞ്ഞിലി' },
  { key: 'jackfruit', label: 'Jackfruit', ml: 'പ്ലാവ്' },
  { key: 'rubberwood', label: 'Rubberwood', ml: 'റബർ' },
  { key: 'firewood', label: 'Firewood', ml: 'വിറക്' },
];

const TYPE_TABS = [
  { key: 'all', label: 'All Types', ml: 'എല്ലാ രൂപങ്ങളും' },
  { key: 'Round Logs', label: 'Round Logs', ml: 'ഉരുണ്ട തടി' },
  { key: 'Rough-sawn Planks', label: 'Rough Planks', ml: 'അറുത്ത പലകകൾ' },
  { key: 'Squared Beams', label: 'Squared Beams', ml: 'കഴുക്കോലുകൾ' },
  { key: 'Firewood', label: 'Firewood', ml: 'വിറക്' },
];

const KERALA_DISTRICTS = [
  { key: 'all', label: 'All 14 Districts', ml: 'എല്ലാ ജില്ലകളും' },
  { key: 'Thiruvananthapuram', label: 'Thiruvananthapuram', ml: 'തിരുവനന്തപുരം' },
  { key: 'Kollam', label: 'Kollam', ml: 'കൊല്ലം' },
  { key: 'Pathanamthitta', label: 'Pathanamthitta', ml: 'പത്തനംതിട്ട' },
  { key: 'Alappuzha', label: 'Alappuzha', ml: 'ആലപ്പുഴ' },
  { key: 'Kottayam', label: 'Kottayam', ml: 'കോട്ടയം' },
  { key: 'Idukki', label: 'Idukki', ml: 'ഇടുക്കി' },
  { key: 'Ernakulam', label: 'Ernakulam', ml: 'എറണാകുളം' },
  { key: 'Thrissur', label: 'Thrissur', ml: 'തൃശ്ശൂർ' },
  { key: 'Palakkad', label: 'Palakkad', ml: 'പാലക്കാട്' },
  { key: 'Malappuram', label: 'Malappuram', ml: 'മലപ്പുറം' },
  { key: 'Kozhikode', label: 'Kozhikode', ml: 'കോഴിക്കോട്' },
  { key: 'Wayanad', label: 'Wayanad', ml: 'വയനാട്' },
  { key: 'Kannur', label: 'Kannur', ml: 'കണ്ണൂർ' },
  { key: 'Kasaragod', label: 'Kasaragod', ml: 'കാസർഗോഡ്' },
];

const DISALLOWED_FURNITURE_KEYWORDS = [
  'plywood', 'ply', 'chair', 'table', 'bed', 'sofa', 'desk', 'door lock',
  'furniture', 'കട്ടിൽ', 'കസേര', 'മേശ', 'പ്ലൈവുഡ്', 'ഫർണിച്ചർ',
];

export function MarketplacePage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State derived from URL query parameters to guarantee state preservation
  const selectedSpecies = searchParams.get('species') || 'all';
  const selectedType = searchParams.get('type') || 'all';
  const selectedDistrict = searchParams.get('district') || 'all';
  const searchQuery = searchParams.get('q') || '';

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [liveListings, setLiveListings] = useState<TimberListingItem[] | null>(null);
  const [isLoadingLive, setIsLoadingLive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;
  const [validationAlert, setValidationAlert] = useState<{
    type: 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSpecies, selectedType, selectedDistrict, searchQuery]);

  // TanStack Query for live marketplace listings with automatic revalidation
  const { data: queryListings, isLoading: isQueryLoading } = useQuery({
    queryKey: ['listings', searchQuery],
    queryFn: async () => {
      const res = await api.get('/listings', {
        params: {
          search: searchQuery.trim() || undefined,
          limit: 100,
        },
      });
      const rawList = res.data?.listings || res.data?.data?.listings || res.data?.data?.items;
      if (res.data?.success && Array.isArray(rawList)) {
        return rawList.map(mapApiListingToItem);
      }
      return null;
    },
  });

  // Fallback Live Listings Fetcher
  useEffect(() => {
    let isMounted = true;
    const debounceTimer = setTimeout(async () => {
      try {
        setIsLoadingLive(true);
        const res = await api.get('/listings', {
          params: {
            search: searchQuery.trim() || undefined,
            limit: 100,
          },
        });
        const rawList = res.data?.listings || res.data?.data?.listings || res.data?.data?.items;
        if (isMounted && res.data?.success && Array.isArray(rawList) && rawList.length > 0) {
          const mapped = rawList.map(mapApiListingToItem);
          setLiveListings(mapped);
        }
      } catch {
        // Gracefully preserve fallback TIMBER_LISTINGS
      } finally {
        if (isMounted) setIsLoadingLive(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [searchQuery]);

  // Update query params helper
  const updateFilter = (key: string, value: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const handleClearAllFilters = () => {
    setSearchParams({}, { replace: true });
    setValidationAlert(null);
  };

  const hasActiveFilters =
    selectedSpecies !== 'all' ||
    selectedType !== 'all' ||
    selectedDistrict !== 'all' ||
    searchQuery.trim().length > 0;

  // Search input handler with Raw Timber keyword validation
  const handleSearchChange = (value: string) => {
    updateFilter('q', value);
    const lower = value.toLowerCase().trim();

    const matchedDisallowed = DISALLOWED_FURNITURE_KEYWORDS.find((kw) => lower.includes(kw));
    if (matchedDisallowed) {
      setValidationAlert({
        type: 'warning',
        title: lang === 'en' ? 'Raw Timber Only Platform' : 'റോ തടികൾ മാത്രമുള്ള വിപണി',
        message:
          lang === 'en'
            ? 'Timora exclusively trades raw timber logs and rough-sawn lumber. Finished furniture is not listed. Search for Teak, Mahogany, Anjili, or Rubberwood instead.'
            : 'ടിമോറയിൽ ഉരുണ്ട തടികളും അറുത്ത മരങ്ങളും മാത്രമാണ് വ്യാപാരം ചെയ്യുന്നത്. ഫർണിച്ചറോ പ്ലൈവുഡോ ലഭ്യമല്ല. തേക്ക്, മഹാഗണി, ആഞ്ഞിലി എന്നിവ തിരയുക.',
      });
      return;
    }

    if (validationAlert) {
      setValidationAlert(null);
    }
  };

  // Filter listings across authoritative live items or cached directory
  const sourceListings = (queryListings && queryListings.length > 0)
    ? queryListings
    : (liveListings && liveListings.length > 0)
    ? liveListings
    : TIMBER_LISTINGS;
  const filteredListings = sourceListings.filter((item) => {
    if (selectedSpecies !== 'all') {
      if (selectedSpecies === 'firewood') {
        if (!item.type.toLowerCase().includes('firewood') && !item.title.toLowerCase().includes('firewood')) {
          return false;
        }
      } else if (!item.species.toLowerCase().includes(selectedSpecies.toLowerCase())) {
        return false;
      }
    }
    if (selectedType !== 'all' && item.type !== selectedType) {
      return false;
    }
    if (selectedDistrict !== 'all' && !item.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSpecies = item.species.toLowerCase().includes(q);
      const matchDistrict = item.district.toLowerCase().includes(q);
      const matchLocality = item.locality.toLowerCase().includes(q);
      if (!matchTitle && !matchSpecies && !matchDistrict && !matchLocality) {
        return false;
      }
    }
    return true;
  });

  const totalItems = filteredListings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const paginatedListings = filteredListings.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    const el = document.getElementById('timber-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToCatalog = () => {
    const el = document.getElementById('timber-catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16">
      {/* 1. REFINED MINIMAL HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E7E1D6]/80 via-[#FAF8F5] to-white border-b border-[#8E7F6B]/20 pt-6 pb-8 sm:pt-8 sm:pb-10">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Main Headline & Supporting Copy */}
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7E1D6] border border-[#8E7F6B]/30 text-[#4A3626] text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{lang === 'en' ? 'Direct Depot & Sawmill Sourcing' : 'നേരിട്ടുള്ള തടി വ്യാപാരം'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-serif text-[#4A3626] tracking-tight leading-tight">
              {lang === 'en' ? "Kerala’s Timber Marketplace" : 'കേരളത്തിന്റെ തടി വിതരണ കേന്ദ്രം'}
            </h1>

            <p className="text-xs sm:text-sm text-[#7A5A3A] font-medium leading-relaxed max-w-xl mx-auto">
              {lang === 'en'
                ? 'Discover quality timber. Connect with sellers and mills across Kerala.'
                : 'ഗുണമേന്മയുള്ള തടികൾ കണ്ടെത്തൂ. കേരളത്തിലുടനീളമുള്ള വ്യാപാരികളുമായും മില്ലുകളുമായും നേരിട്ട് ബന്ധപ്പെടൂ.'}
            </p>
          </div>

          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
              <Search className="w-5 h-5 absolute left-4 top-3.5 text-[#8E7F6B] group-focus-within:text-[#5B6147] transition-colors" />
              <input
                type="text"
                placeholder={
                  lang === 'en'
                    ? 'Search Teak round logs, Anjili beams, Mahogany, or Kottayam depot...'
                    : 'തേക്ക്, ആഞ്ഞിലി, മഹാഗണി, അല്ലെങ്കിൽ ജില്ല നൽകി തിരയുക...'
                }
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl border-2 border-[#8E7F6B]/30 bg-white text-xs sm:text-sm font-semibold text-[#4A3626] placeholder-[#8E7F6B] shadow-sm focus:border-[#5B6147] focus:ring-4 focus:ring-[#5B6147]/15 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => updateFilter('q', '')}
                  className="absolute right-3.5 top-3.5 text-[#8E7F6B] hover:text-[#4A3626] p-0.5 rounded-full hover:bg-stone-100 transition"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Validation Alert */}
            {validationAlert && (
              <div className="mt-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start gap-2 animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">{validationAlert.title}</div>
                  <div className="text-[11px] leading-relaxed text-amber-800">{validationAlert.message}</div>
                </div>
              </div>
            )}
          </div>

          {/* 5 ESSENTIAL MARKETPLACE SHORTCUT TILES (Compact 2-column mobile touch grid, desktop uses header navigation) */}
          <div className="grid grid-cols-2 md:hidden gap-2.5 max-w-4xl mx-auto pt-1">
            {/* 1. Browse Timber */}
            <button
              type="button"
              onClick={scrollToCatalog}
              className="p-3 rounded-2xl bg-white hover:bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 text-left transition flex items-center gap-2.5 shadow-2xs group"
            >
              <div className="p-2 rounded-xl bg-[#E7E1D6] group-hover:bg-[#5B6147] group-hover:text-white transition text-[#5B6147] flex-shrink-0">
                <Trees className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-[#4A3626] truncate">
                  {lang === 'en' ? 'Browse Timber' : 'തടികൾ'}
                </div>
                <div className="text-[10px] text-[#8E7F6B] truncate">
                  {lang === 'en' ? '7 Active Batches' : 'ലഭ്യമായവ'}
                </div>
              </div>
            </button>

            {/* 2. Timber Mills */}
            <Link
              to="/mills"
              className="p-3 rounded-2xl bg-white hover:bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 text-left transition flex items-center gap-2.5 shadow-2xs group"
            >
              <div className="p-2 rounded-xl bg-[#E7E1D6] group-hover:bg-[#5B6147] group-hover:text-white transition text-[#5B6147] flex-shrink-0">
                <Factory className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-[#4A3626] truncate">
                  {lang === 'en' ? 'Timber Mills' : 'തടി മില്ലുകൾ'}
                </div>
                <div className="text-[10px] text-[#8E7F6B] truncate">
                  {lang === 'en' ? 'Licensed Sawmills' : 'മില്ലുകൾ'}
                </div>
              </div>
            </Link>

            {/* 3. Master Carpenters */}
            <Link
              to="/carpenters"
              className="p-3 rounded-2xl bg-white hover:bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 text-left transition flex items-center gap-2.5 shadow-2xs group"
            >
              <div className="p-2 rounded-xl bg-[#E7E1D6] group-hover:bg-[#5B6147] group-hover:text-white transition text-[#5B6147] flex-shrink-0">
                <Hammer className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-[#4A3626] truncate">
                  {lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}
                </div>
                <div className="text-[10px] text-[#8E7F6B] truncate">
                  {lang === 'en' ? 'Master Artisans' : 'വിദഗ്ദ്ധ ആശാരിമാർ'}
                </div>
              </div>
            </Link>

            {/* 4. Timber Transport */}
            <Link
              to="/transport"
              className="p-3 rounded-2xl bg-white hover:bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 text-left transition flex items-center gap-2.5 shadow-2xs group"
            >
              <div className="p-2 rounded-xl bg-[#E7E1D6] group-hover:bg-[#5B6147] group-hover:text-white transition text-[#5B6147] flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-[#4A3626] truncate">
                  {lang === 'en' ? 'Transport' : 'തടി ലോറികൾ'}
                </div>
                <div className="text-[10px] text-[#8E7F6B] truncate">
                  {lang === 'en' ? 'Form IV Transit' : 'ട്രാൻസിറ്റ്'}
                </div>
              </div>
            </Link>

            {/* 5. CFT Calculator */}
            <Link
              to="/calculator"
              className="p-3 rounded-2xl bg-white hover:bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 text-left transition flex items-center gap-2.5 shadow-2xs group col-span-2"
            >
              <div className="p-2 rounded-xl bg-[#E7E1D6] group-hover:bg-[#5B6147] group-hover:text-white transition text-[#5B6147] flex-shrink-0">
                <Calculator className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="font-bold text-xs text-[#4A3626] truncate">
                  {lang === 'en' ? 'CFT Calculator' : 'കാൽക്കുലേറ്റർ'}
                </div>
                <div className="text-[10px] text-[#8E7F6B] truncate">
                  {lang === 'en' ? 'Kerala Hoppus' : 'ഹോപ്പസ് റൂൾ'}
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. REFINED FILTER BAR & CATALOG CONTAINER */}
      <section id="timber-catalog" className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {/* Compact Primary Species Filter Row */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5 flex-nowrap">
            {SPECIES_PILLS.map((pill) => {
              const isActive = selectedSpecies === pill.key;
              return (
                <button
                  key={pill.key}
                  type="button"
                  onClick={() => updateFilter('species', pill.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#5B6147] text-white shadow-xs'
                      : 'bg-white text-stone-700 hover:bg-[#E7E1D6]/60 border border-[#8E7F6B]/30'
                  }`}
                >
                  <Tag className={`w-3 h-3 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                  <span>{lang === 'en' ? pill.label : pill.ml}</span>
                </button>
              );
            })}
          </div>

          {/* Toggle Secondary Filter Drawer */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${
                isFilterDrawerOpen || selectedType !== 'all' || selectedDistrict !== 'all'
                  ? 'bg-[#E7E1D6] border-[#5B6147] text-[#4A3626]'
                  : 'bg-white border-stone-300 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5B6147]" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Filters' : 'ഫിൽട്ടറുകൾ'}</span>
              {(selectedType !== 'all' || selectedDistrict !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-[#5B6147]" />
              )}
              {isFilterDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="p-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition"
                title={lang === 'en' ? 'Reset all filters' : 'ഫിൽട്ടറുകൾ ഒഴിവാക്കുക'}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Secondary Filter Drawer (District & Form/Type) */}
        {isFilterDrawerOpen && (
          <div className="p-4 bg-white rounded-3xl border border-[#8E7F6B]/30 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 animate-scaleUp">
            {/* Timber Form / Cut Type */}
            <div>
              <label className="block text-xs font-bold text-[#4A3626] mb-1.5">
                {lang === 'en' ? 'Cut / Log Type' : 'തടിയുടെ രൂപം'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_TABS.map((tab) => {
                  const isActive = selectedType === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => updateFilter('type', tab.key)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-[#4A3626] text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {lang === 'en' ? tab.label : tab.ml}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Kerala District Selector */}
            <div>
              <label className="block text-xs font-bold text-[#4A3626] mb-1.5">
                {lang === 'en' ? 'Kerala District Location' : 'ജില്ല'}
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#8E7F6B]" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => updateFilter('district', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50"
                >
                  {KERALA_DISTRICTS.map((dist) => (
                    <option key={dist.key} value={dist.key}>
                      {lang === 'en' ? dist.label : dist.ml}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Results Summary */}
        <div className="flex items-center justify-between text-xs text-[#7A5A3A] px-1 font-medium">
          <span className="flex items-center gap-1.5">
            {isLoadingLive && <Loader2 className="w-3.5 h-3.5 text-[#5B6147] animate-spin" />}
            {lang === 'en'
              ? `Showing ${filteredListings.length} verified timber lots`
              : `${filteredListings.length} തടി ലോറ്റുകൾ ലഭ്യമാണ്`}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-[#5B6147] hover:underline font-bold text-[11px]"
            >
              {lang === 'en' ? 'Clear All Filters' : 'ഫിൽട്ടറുകൾ റദ്ദാക്കുക'}
            </button>
          )}
        </div>

        {/* 3. TIMBER CARDS GRID WITH 6-POINT VISUAL HIERARCHY */}
        {isLoadingLive && !liveListings ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse" data-testid="marketplace-loading">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl border border-[#8E7F6B]/30 overflow-hidden flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="aspect-[4/3] w-full bg-stone-200" />
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex gap-2">
                      <div className="h-5 bg-stone-200 rounded-full w-20" />
                      <div className="h-5 bg-stone-200 rounded-md w-28" />
                    </div>
                    <div className="h-6 bg-stone-200 rounded-md w-3/4" />
                    <div className="h-4 bg-stone-200 rounded-md w-1/2" />
                    <div className="h-8 bg-stone-100 rounded-xl" />
                  </div>
                </div>
                <div className="p-4 sm:p-5 pt-0">
                  <div className="h-10 bg-stone-200 rounded-xl w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-300 space-y-3">
            <Trees className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif font-bold text-base text-[#4A3626]">
              {lang === 'en' ? 'No timber listings match your criteria' : 'ലിസ്റ്റിംഗുകൾ കണ്ടെത്തിയില്ല'}
            </h3>
            <p className="text-xs text-stone-500">
              {lang === 'en'
                ? 'Try broadening your search query or selecting "All Species".'
                : 'തിരയൽ വാക്ക് മാറ്റുകയോ "എല്ലാ ഇനങ്ങളും" തിരഞ്ഞെടുക്കുകയോ ചെയ്യുക.'}
            </p>
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="px-4 py-2 rounded-xl bg-[#5B6147] text-white font-bold text-xs"
            >
              {lang === 'en' ? 'Reset Filters' : 'ഫിൽട്ടറുകൾ ഒഴിവാക്കുക'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedListings.map((item, index) => {
              const isFirewood = item.type.toLowerCase().includes('firewood') || item.title.toLowerCase().includes('firewood');

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-3xl border border-[#8E7F6B]/30 hover:border-[#5B6147]/60 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                >
                  {/* Card Content Top */}
                  <div>
                    {/* 1. Timber Image with Reserved Aspect Ratio (Prevents CLS) */}
                    <div className="relative aspect-[4/3] w-full bg-[#E7E1D6] overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        className="w-full h-full object-cover transform group-hover:scale-[1.03] transition-transform duration-300"
                      />

                      {/* Transit Pass Badge */}
                      {item.transit_pass && (
                        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-emerald-950/85 text-emerald-300 text-[10px] font-bold backdrop-blur-xs flex items-center gap-1 shadow-xs">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>{lang === 'en' ? 'Form IV Pass' : 'ഫോറസ്റ്റ് പാസ്സ്'}</span>
                        </div>
                      )}

                      {/* Grade Badge */}
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-stone-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                        {item.grade}
                      </div>

                      {/* SOLD Overlay Badge */}
                      {item.status === 'sold' && (
                        <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center">
                          <span className="px-4 py-2 rounded-xl bg-rose-600/95 text-white text-sm font-extrabold uppercase tracking-wider backdrop-blur-xs shadow-md">
                            {lang === 'en' ? 'SOLD' : 'വിറ്റുപോയി'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5 space-y-3">
                      {/* 2. Species Pill & Form */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#E7E1D6] text-[#4A3626] text-[11px] font-bold">
                          {lang === 'en' ? item.species : item.species_ml}
                        </span>
                        <span className="text-[11px] text-[#8E7F6B] font-medium">
                          {lang === 'en' ? item.type : item.type_ml}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200">
                          {formatTimberListingId(item.id)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif font-extrabold text-base text-[#4A3626] leading-snug line-clamp-2">
                        {lang === 'en' ? item.title : (item.title_ml || item.title)}
                      </h3>

                      {/* Location (District & Locality) */}
                      <div className="flex items-center gap-1.5 text-xs text-[#7A5A3A]">
                        <MapPin className="w-3.5 h-3.5 text-[#5B6147] flex-shrink-0" />
                        <span className="truncate">
                          {lang === 'en'
                            ? `${item.locality}, ${item.district}`
                            : `${item.locality_ml || item.locality}, ${item.district}`}
                        </span>
                      </div>

                      {/* 3. Essential Dimensions & Stock */}
                      <div className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-[#4A3626] grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-[#8E7F6B] uppercase font-bold block">
                            {lang === 'en' ? 'Stock Volume' : 'ലഭ്യമായ അളവ്'}
                          </span>
                          <span className="font-bold">
                            {item.quantity} {isFirewood ? (lang === 'en' ? 'Tonnes' : 'ടൺ') : (lang === 'en' ? item.unit : (item.unit?.toLowerCase() === 'cft' ? 'സി.എഫ്.ടി' : item.unit))}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8E7F6B] uppercase font-bold block">
                            {lang === 'en' ? 'Specs / Moisture' : 'ഈർപ്പം / അളവ്'}
                          </span>
                          <span className="font-bold truncate block">
                            {item.moisture_level ? `${item.moisture_level} Moisture` : (item.moisture || item.dimensions)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: 4. Price & 5. Action */}
                  <div className="p-4 sm:p-5 pt-0 flex items-center justify-between border-t border-stone-100 gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E7F6B] block">
                        {isFirewood
                          ? (lang === 'en' ? 'Price / Tonne' : 'ഒരു ടൺ വില')
                          : (lang === 'en' ? 'Rate / CFT' : 'ഒരു CFT യുടെ വില')}
                      </span>
                      <div className="text-xl font-black font-serif text-[#4A3626]">
                        {formatINR(item.price_per_cft)}
                      </div>
                    </div>

                    <Link
                      to={`/listing/${item.id}`}
                      state={{ fromSearch: searchParams.toString() }}
                      className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-xs transition flex items-center gap-1.5 ${
                        item.status === 'sold'
                          ? 'bg-stone-400 text-white cursor-default'
                          : 'bg-[#5B6147] hover:bg-[#3F452F] text-white'
                      }`}
                    >
                      <span>{lang === 'en' ? (item.status === 'sold' ? 'View Sold Item' : 'View Details') : (item.status === 'sold' ? 'വിവരങ്ങൾ കാണുക' : 'വിശദാംശങ്ങൾ')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 pb-2 border-t border-stone-200">
              <div className="text-xs text-stone-500 font-medium">
                {lang === 'en'
                  ? `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} timber listings`
                  : `${totalItems} ലിസ്റ്റിംഗുകളിൽ ${startIndex + 1} മുതൽ ${endIndex} വരെ കാണിക്കുന്നു`}
              </div>

              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-[#4A3626] bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Previous' : 'മുമ്പത്തെ'}</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = pageNum === validCurrentPage;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                        isActive
                          ? 'bg-[#5B6147] text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-[#4A3626] bg-white hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-2xs"
                >
                  <span>{lang === 'en' ? 'Next' : 'അടുത്തത്'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>

      {/* 4. KERALA TIMBER MILLS SPOTLIGHT */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 space-y-6">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#8E7F6B]/30 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                KL-SAW-EKM-1048
              </span>
              <h4 className="font-bold text-[#4A3626] text-sm">
                {lang === 'en' ? 'Perumbavoor Modern Sawmills' : 'പെരുമ്പാവൂർ മോഡേൺ സോമില്ല്'}
              </h4>
              <p className="text-stone-500">
                {lang === 'en' ? 'Kandanthara, Perumbavoor, Ernakulam' : 'കണ്ടന്തറ, പെരുമ്പാവൂർ, എറണാകുളം'}
              </p>
              <p className="text-[11px] text-[#7A5A3A]">
                {lang === 'en'
                  ? 'High-speed band saws, Anjili & Teak log slicing.'
                  : 'ഹൈ സ്പീഡ് ബാന്റ് സോ, ആഞ്ഞിലി, തേക്ക് തടി അറുക്കൽ.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#8E7F6B]/30 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                KL-SAW-PTA-1982
              </span>
              <h4 className="font-bold text-[#4A3626] text-sm">
                {lang === 'en' ? 'Adoor Central Timber Yard' : 'അടൂർ സെൻട്രൽ ടിമ്പർ യാർഡ്'}
              </h4>
              <p className="text-stone-500">
                {lang === 'en' ? 'Adoor Bypass, Pathanamthitta' : 'അടൂർ ബൈപാസ്, പത്തനംതിട്ട'}
              </p>
              <p className="text-[11px] text-[#7A5A3A]">
                {lang === 'en'
                  ? 'Traditional joinery timber & squared door beams.'
                  : 'പരമ്പരാഗത കഴുക്കോലുകൾ, കട്ടിള തടികൾ.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#8E7F6B]/30 space-y-1.5">
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                KL-SAW-PTA-2104
              </span>
              <h4 className="font-bold text-[#4A3626] text-sm">
                {lang === 'en' ? 'Konni Forest Valley Plant' : 'കോന്നി ഫോറസ്റ്റ് വാലി പ്ലാന്റ്'}
              </h4>
              <p className="text-stone-500">
                {lang === 'en' ? 'Konni Depot, Pathanamthitta' : 'കോന്നി ഡിപ്പോ, പത്തനംതിട്ട'}
              </p>
              <p className="text-[11px] text-[#7A5A3A]">
                {lang === 'en'
                  ? 'Kiln seasoning plant & Nilambur Teak logs.'
                  : 'തടി ഉണക്കൽ പ്ലാന്റ് & നിലമ്പൂർ തേക്ക്.'}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
