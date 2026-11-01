import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Factory,
  MapPin,
  Phone,
  Star,
  CheckCircle,
  ShieldCheck,
  Search,
  MessageSquare,
  Sparkles,
  Send,
  Lock,
  LogIn,
  Layers,
  Wrench,
  Clock,
  UserCheck,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginAlertModal } from '../../components/LoginAlertModal';
import { BackButton } from '../../components/BackButton';

export interface TimberMillReview {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  commentMl: string;
}

export interface TimberMill {
  id: string;
  name: string;
  nameMl: string;
  ownerName: string;
  ownerNameMl: string;
  licenseNo: string;
  district: string;
  locality: string;
  phone: string;
  whatsapp: string;
  established: number;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  availableSpecies: string[];
  services: { en: string; ml: string }[];
  sawingRatePerCft: string;
  seasoningAvailable: boolean;
  reviews: TimberMillReview[];
}

export function TimberMillsPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user, isAuthenticated, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Directory Data & Loading State
  const [mills, setMills] = useState<TimberMill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { api } = await import('../../lib/api');
      const res = await api.get('/mills');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mapped: TimberMill[] = res.data.data.map((item: any) => ({
          id: String(item.id),
          name: item.name || '',
          nameMl: item.nameMl || item.name || '',
          ownerName: item.ownerName || '',
          ownerNameMl: item.ownerNameMl || item.ownerName || '',
          licenseNo: item.licenseNo || '',
          district: item.district || '',
          locality: item.locality || '',
          phone: item.phone || '',
          whatsapp: item.phone ? item.phone.replace(/[^0-9]/g, '') : '',
          established: item.established || 2010,
          rating: item.rating || 4.8,
          ratingCount: item.ratingCount || 12,
          isVerified: item.isVerified !== false,
          availableSpecies: Array.isArray(item.availableSpecies) && item.availableSpecies.length > 0
            ? item.availableSpecies
            : ['Nilambur Teak (തേക്ക്)', 'Anjili Wild Jack (ആഞ്ഞിലി)', 'African Mahogany (മഹാഗണി)', 'Rubberwood (റബർ)'],
          services: Array.isArray(item.services) && item.services.length > 0
            ? item.services
            : (Array.isArray(item.sawTypes) && item.sawTypes.length > 0
                ? item.sawTypes.map((st: string) => ({ en: st, ml: st }))
                : [
                    { en: 'Horizontal Bandsaw Heavy Log Resawing', ml: 'ഹൊറിസോണ്ടൽ ബാൻഡ്‌സോ തടി അറുക്കൽ' },
                    { en: 'Roof Truss & Rafter Precision Sizing', ml: 'മേൽക്കൂര കഴുക്കോൽ കൃത്യമായ അളവിൽ അറുക്കൽ' },
                  ]),
          sawingRatePerCft: item.sawingRatePerCft || '₹65 - ₹85 / CFT',
          seasoningAvailable: item.seasoningAvailable !== false,
          reviews: item.reviews || [],
        }));
        setMills(mapped);
      } else {
        setMills([]);
      }
    } catch (err: any) {
      console.error('Failed to load timber mills:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load timber mills directory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMills();
  }, [fetchMills, isAuthenticated]);

  // Login Alert Modal State
  const [loginAlertMill, setLoginAlertMill] = useState<TimberMill | null>(null);
  const [showAuthGate, setShowAuthGate] = useState(false);
  const [gateActionName, setGateActionName] = useState<string>('');

  // Quote Request Modal State (for authenticated users)
  const [quoteModalMill, setQuoteModalMill] = useState<TimberMill | null>(null);
  const [quoteSpecies, setQuoteSpecies] = useState<string>('Teak (തേക്ക്)');
  const [quoteService, setQuoteService] = useState<string>('Log Sawing (തടി അറുക്കൽ)');
  const [quoteCft, setQuoteCft] = useState<number>(150);
  const [quoteDeliveryLocation, setQuoteDeliveryLocation] = useState<string>('');
  const [quoteNote, setQuoteNote] = useState<string>('');
  const [quoteSubmitted, setQuoteSubmitted] = useState<boolean>(false);

  // Review Modal State
  const [reviewModalMill, setReviewModalMill] = useState<TimberMill | null>(null);
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewText, setReviewText] = useState<string>('');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Filter logic
  const filteredMills = mills.filter((mill) => {
    if (selectedDistrict !== 'all' && !mill.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    if (
      selectedSpecies !== 'all' &&
      !mill.availableSpecies.some((sp) => sp.toLowerCase().includes(selectedSpecies.toLowerCase()))
    ) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = mill.name.toLowerCase().includes(q) || mill.nameMl.toLowerCase().includes(q);
      const matchOwner = mill.ownerName.toLowerCase().includes(q) || mill.ownerNameMl.toLowerCase().includes(q);
      const matchLocality = mill.locality.toLowerCase().includes(q);
      const matchSpecies = mill.availableSpecies.some((sp) => sp.toLowerCase().includes(q));
      if (!matchName && !matchOwner && !matchLocality && !matchSpecies) {
        return false;
      }
    }
    return true;
  });

  // Action guard: Requires Login!
  const handleProtectedAction = (actionName: string, mill: TimberMill, callback: () => void) => {
    if (!isAuthenticated) {
      setLoginAlertMill(mill);
      return;
    }
    callback();
  };

  // Instant demo login helper for convenience
  const handleQuickDemoLogin = () => {
    loginAsDemo('buyer');
    setShowAuthGate(false);
  };

  const handleSendQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitted(true);
    setTimeout(() => {
      setQuoteSubmitted(false);
      setQuoteModalMill(null);
      setQuoteDeliveryLocation('');
      setQuoteNote('');
    }, 2400);
  };

  const handleSendReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalMill || !reviewText.trim()) return;

    const newRev: TimberMillReview = {
      id: `rev-mill-${Date.now()}`,
      author: user?.name || (lang === 'en' ? 'Verified Client' : 'ഉപഭോക്താവ്'),
      role: lang === 'en' ? 'Verified Client' : 'ഉപഭോക്താവ്',
      rating: reviewStars,
      date: lang === 'en' ? 'Just now' : 'ഇപ്പോൾ',
      comment: reviewText.trim(),
      commentMl: reviewText.trim(),
    };

    setMills((prev) =>
      prev.map((m) => {
        if (m.id === reviewModalMill.id) {
          const updatedReviews = [newRev, ...m.reviews];
          const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvg = parseFloat((totalStars / updatedReviews.length).toFixed(1));
          return {
            ...m,
            rating: newAvg,
            ratingCount: m.ratingCount + 1,
            reviews: updatedReviews,
          };
        }
        return m;
      })
    );

    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setReviewModalMill(null);
      setReviewText('');
    }, 1800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center">
        <BackButton fallbackPath="/marketplace" lang={lang} />
      </div>

      {/* 1. TOP HERO BANNER (WARM TIMBER PALETTE) */}
      <section className="relative p-6 sm:p-10 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0] overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-stone-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30">
            <Factory className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>
              {lang === 'en'
                ? 'Kerala Licensed Timber Sawmills & Sizing Yards'
                : 'കേരളത്തിലെ അംഗീകൃത തടി മില്ലുകൾ & സോയിംഗ് കേന്ദ്രങ്ങൾ'}
            </span>
          </div>

          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#4A3626]"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {lang === 'en' ? (
              <>
                Connect With Timber Mills <br />
                <span className="text-[#5B6147]">For House Construction & Sizing</span>
              </>
            ) : (
              <>
                വീടുപണിക്കും തടി ആവശ്യങ്ങൾക്കും <br />
                <span className="text-[#5B6147]">നേരിട്ട് തടി മില്ലുകളുമായി ബന്ധപ്പെടാം</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium">
            {lang === 'en'
              ? 'Find licensed sawmills across Ernakulam, Pathanamthitta, Kottayam, and all 14 Kerala districts. Check available wood species, verified customer reviews, sawing charges, and contact owners directly.'
              : 'എറണാകുളം, പത്തനംതിട്ട, കോട്ടയം ഉൾപ്പെടെയുള്ള 14 ജില്ലകളിലെ തടി മില്ലുകളുടെ വിവരങ്ങൾ, അവൈലബിൾ ആയ തടികൾ, ഉപഭോക്താക്കളുടെ റിവ്യൂസ് എന്നിവ കണ്ട് ഉടമസ്ഥരെ നേരിട്ട് ബന്ധപ്പെടുക.'}
          </p>

          {/* Value highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'Govt Licensed Mills' : 'അംഗീകൃത മില്ലുകൾ'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'Precision Bandsawing' : 'കൃത്യമായ അറുക്കൽ'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <Star className="w-4 h-4 text-stone-1000 fill-stone-1000 flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'House Owner Reviews' : 'യഥാർത്ഥ റിവ്യൂസ്'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/80 border border-stone-300/80 shadow-xs flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold text-stone-800 text-[11px]">
                {lang === 'en' ? 'Direct Owner Contact' : 'നേരിട്ട് വിളിക്കാം'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH CONTROLS */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-stone-300/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={
                lang === 'en'
                  ? 'Search mill name, locality, owner, or species...'
                  : 'മില്ലിന്റെ പേര്, സ്ഥലം, തടി ഇനം തിരയുക...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300/80 text-xs sm:text-sm font-semibold bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
            />
          </div>

          {/* District & Species Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
              <span className="text-xs font-bold text-stone-700">
                {lang === 'en' ? 'District:' : 'ജില്ല:'}
              </span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              >
                <option value="all">{lang === 'en' ? 'All Kerala Districts' : 'എല്ലാ ജില്ലകളും'}</option>
                <option value="Ernakulam">Ernakulam (എറണാകുളം - പെരുമ്പാവൂർ)</option>
                <option value="Pathanamthitta">Pathanamthitta (പത്തനംതിട്ട - അടൂർ/കോന്നി)</option>
                <option value="Kottayam">Kottayam (കോട്ടയം - പാലാ)</option>
                <option value="Thrissur">Thrissur (തൃശ്ശൂർ - ചാലക്കുടി)</option>
                <option value="Kozhikode">Kozhikode (കോഴിക്കോട് - കല്ലായി)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-stone-700">
                {lang === 'en' ? 'Wood Species:' : 'തടി ഇനം:'}
              </span>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
              >
                <option value="all">{lang === 'en' ? 'All Wood Species' : 'എല്ലാ തടികളും'}</option>
                <option value="Teak">Teak (തേക്ക്)</option>
                <option value="Anjili">Anjili (ആഞ്ഞിലി)</option>
                <option value="Mahogany">Mahogany (മഹാഗണി)</option>
                <option value="Rubberwood">Rubberwood (റബർ)</option>
                <option value="Jackfruit">Jackfruit (പ്ലാവ്)</option>
                <option value="Rosewood">Rosewood / Veetti (ഈട്ടി)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick District Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-stone-500 whitespace-nowrap">
            {lang === 'en' ? 'Popular Mill Clusters:' : 'പ്രധാന മില്ലുകൾ:'}
          </span>
          <button
            onClick={() => setSelectedDistrict('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'all'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {lang === 'en' ? 'All Kerala' : 'എല്ലാം'}
          </button>
          <button
            onClick={() => setSelectedDistrict('Ernakulam')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Ernakulam'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Ernakulam (പെരുമ്പാവൂർ)
          </button>
          <button
            onClick={() => setSelectedDistrict('Pathanamthitta')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Pathanamthitta'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Pathanamthitta (അടൂർ / കോന്നി)
          </button>
          <button
            onClick={() => setSelectedDistrict('Kottayam')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Kottayam'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Kottayam (പാലാ)
          </button>
          <button
            onClick={() => setSelectedDistrict('Thrissur')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Thrissur'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Thrissur (ചാലക്കുടി)
          </button>
          <button
            onClick={() => setSelectedDistrict('Kozhikode')}
            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition ${
              selectedDistrict === 'Kozhikode'
                ? 'bg-[#5B6147] text-white shadow-xs'
                : 'bg-[#E7E1D6] text-[#4A3626] border border-stone-300 hover:bg-stone-200'
            }`}
          >
            📍 Kozhikode (കല്ലായി)
          </button>
        </div>
      </div>

      {/* 3. TIMBER MILLS LISTING CARDS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold font-serif text-[#4A3626]">
            {filteredMills.length}{' '}
            {lang === 'en'
              ? 'Licensed Timber Mills Found'
              : 'അംഗീകൃത തടി മില്ലുകൾ ലഭ്യമാണ്'}
          </h2>
          {!isAuthenticated && (
            <span className="text-xs text-[#5B6147] font-bold flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-300">
              <Lock className="w-3 h-3" />
              {lang === 'en'
                ? 'Login required to contact mill owners'
                : 'മില്ലുകളെ ബന്ധപ്പെടാൻ ലോഗിൻ ചെയ്യുക'}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-pulse" data-testid="timber-mills-loading">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-stone-300/80 p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-3/4">
                    <div className="h-5 bg-stone-200 rounded-md w-1/3" />
                    <div className="h-6 bg-stone-200 rounded-md w-3/4" />
                    <div className="h-4 bg-stone-200 rounded-md w-1/2" />
                  </div>
                  <div className="h-8 w-12 bg-stone-200 rounded-xl" />
                </div>
                <div className="h-16 bg-stone-100 rounded-2xl" />
                <div className="h-10 bg-stone-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3" role="alert">
            <div className="flex items-center justify-center gap-2 text-red-700 font-bold">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>
                {lang === 'en'
                  ? 'Unable to load timber mills directory'
                  : 'തടി മില്ലുകളുടെ വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല'}
              </span>
            </div>
            <p className="text-xs text-red-600">{error}</p>
            <button
              onClick={() => fetchMills()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B6147] text-white text-xs font-bold hover:bg-[#3F452F] transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Retry' : 'വീണ്ടും ശ്രമിക്കുക'}</span>
            </button>
          </div>
        ) : filteredMills.length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center space-y-2">
            <Factory className="w-8 h-8 text-stone-400 mx-auto" />
            <h3 className="font-bold text-stone-700">
              {lang === 'en'
                ? 'No licensed timber mills match your criteria'
                : 'നിങ്ങൾ തിരഞ്ഞ മാനദണ്ഡങ്ങൾക്കൊത്ത മില്ലുകൾ കണ്ടെത്തിയില്ല'}
            </h3>
            <p className="text-xs text-stone-500">
              {lang === 'en'
                ? 'Try adjusting your district or timber species filter'
                : 'ജില്ലയോ തടിയുടെ ഇനമോ മാറ്റി വീണ്ടും ശ്രമിക്കുക'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMills.map((mill) => (
              <div
                key={mill.id}
                className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-md transition space-y-5 flex flex-col justify-between"
              >
                {/* Mill Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          {mill.licenseNo}
                        </span>
                        <span className="text-[11px] text-stone-500 font-semibold">
                          Est. {mill.established}
                        </span>
                      </div>

                      <h3 className="text-lg sm:text-xl font-extrabold font-serif text-[#4A3626] leading-snug">
                        {lang === 'en' ? mill.name : mill.nameMl}
                      </h3>

                      <div className="text-xs text-stone-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#5B6147] flex-shrink-0" />
                        <span className="font-medium">{mill.locality}</span>
                      </div>

                      <div className="text-xs text-[#4A3626] font-semibold flex items-center gap-1 pt-0.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#5B6147]" />
                        <span>
                          {lang === 'en' ? 'Proprietor / Owner:' : 'ഉടമസ്ഥൻ:'}{' '}
                          <strong>{lang === 'en' ? mill.ownerName : mill.ownerNameMl}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Rating Badge */}
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-200 text-[#4A3626] border border-stone-300/80 font-black text-sm">
                        <Star className="w-4 h-4 fill-stone-1000 text-stone-1000" />
                        <span>{mill.rating}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 mt-0.5">
                        {mill.ratingCount} {lang === 'en' ? 'reviews' : 'റിവ്യൂസ്'}
                      </span>
                    </div>
                  </div>

                  {/* Available Species Pills */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      {lang === 'en' ? 'Available Timber Species at Mill:' : 'ലഭ്യമായ തടികൾ:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {mill.availableSpecies.map((sp, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 rounded-lg bg-[#E7E1D6] text-[#4A3626] border border-stone-300/80 text-[11px] font-semibold"
                        >
                          🪵 {sp}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mill Services & Machinery */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      {lang === 'en' ? 'Services & Processing Facilities:' : 'സേവനങ്ങൾ:'}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs">
                      {mill.services.map((srv, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-stone-700">
                          <CheckCircle className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="text-[11px] leading-tight">
                            {lang === 'en' ? srv.en : srv.ml}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sawing Rate & Seasoning */}
                  <div className="p-3 rounded-2xl bg-[#E7E1D6] border border-stone-300/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-bold block">
                        {lang === 'en' ? 'Standard Sawing Charge' : 'അറുപ്പ് നിരക്ക്'}
                      </span>
                      <span className="font-extrabold text-[#4A3626] text-sm">
                        {mill.sawingRatePerCft}
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-500 text-[10px] uppercase font-bold block text-right">
                        {lang === 'en' ? 'Kiln Seasoning' : 'കിൽൻ സീസണിംഗ്'}
                      </span>
                      <span
                        className={`font-bold text-xs ${
                          mill.seasoningAvailable ? 'text-emerald-700' : 'text-stone-400'
                        }`}
                      >
                        {mill.seasoningAvailable
                          ? lang === 'en'
                            ? '✓ Available'
                            : '✓ ലഭ്യമാണ്'
                          : lang === 'en'
                          ? 'Not Available'
                          : 'ലഭ്യമല്ല'}
                      </span>
                    </div>
                  </div>

                  {/* Customer Reviews Spotlight */}
                  <div className="space-y-2 pt-2 border-t border-stone-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-[#5B6147]" />
                        {lang === 'en' ? 'Recent House Owner Reviews:' : 'ഉപഭോക്താക്കളുടെ അഭിപ്രായങ്ങൾ:'}
                      </span>
                      <button
                        onClick={() =>
                          handleProtectedAction('Write a Review', mill, () => {
                            setReviewModalMill(mill);
                          })
                        }
                        className="text-[11px] text-[#5B6147] hover:underline font-bold"
                      >
                        + {lang === 'en' ? 'Add Review' : 'റിവ്യൂ നൽകുക'}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {mill.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-800">{rev.author}</span>
                            <div className="flex items-center gap-1 text-stone-1000">
                              {'★'.repeat(Math.floor(rev.rating))}
                              <span className="text-[10px] text-stone-400 ml-1">{rev.date}</span>
                            </div>
                          </div>
                          <p className="text-stone-600 text-[11px] leading-relaxed italic">
                            "{lang === 'en' ? rev.comment : rev.commentMl}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Phone & Quote Modal (Protected with Login) */}
                <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {/* Contact Phone Button */}
                  <button
                    onClick={() =>
                      handleProtectedAction('Call Mill Owner', mill, () => {
                        window.location.href = `tel:${mill.phone}`;
                      })
                    }
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>
                      {isAuthenticated
                        ? lang === 'en'
                          ? `Call ${mill.phone}`
                          : `വിളിക്കുക: ${mill.phone}`
                        : lang === 'en'
                        ? 'Call Mill Owner (Login)'
                        : 'വിളിക്കാൻ ലോഗിൻ ചെയ്യുക'}
                    </span>
                  </button>

                  {/* Direct Quote Request Modal Trigger */}
                  <button
                    onClick={() =>
                      handleProtectedAction('Request Sizing Quote', mill, () => {
                        setQuoteModalMill(mill);
                      })
                    }
                    className="py-2.5 px-4 rounded-xl bg-white border border-stone-300 text-[#4A3626] hover:bg-[#E7E1D6] text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5 text-[#5B6147]" />
                    <span>
                      {lang === 'en' ? 'Get Sawing Quote' : 'കോട്ടേഷൻ ആവശ്യപ്പെടുക'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. AUTHENTICATION GATE MODAL (നിർബന്ധമായും ലോഗിൻ ചെയ്യണം എന്ന് ആവശ്യപ്പെടുന്നത്) */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-stone-200 text-[#4A3626] flex items-center justify-center font-bold">
                  <Lock className="w-4 h-4 text-[#5B6147]" />
                </div>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                  {lang === 'en' ? 'Buyer / House Owner Login Required' : 'ലോഗിൻ ആവശ്യമാണ്'}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthGate(false)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <p className="font-semibold text-stone-900 text-sm">
                {lang === 'en'
                  ? `Please sign in to ${gateActionName.toLowerCase()} and interact with timber mills.`
                  : `മില്ലുകളുമായി നേരിട്ട് സംസാരിക്കാനും കോട്ടേഷൻ ചോദിക്കാനും ദയവായി ലോഗിൻ ചെയ്യുക.`}
              </p>
              <p className="text-stone-500">
                {lang === 'en'
                  ? 'To prevent spam and protect timber sawmill owners, direct phone calls and price negotiation quotes are reserved for verified registered buyers and house builders.'
                  : 'തടി മില്ലുകളുടെ സുരക്ഷയ്ക്കും അനാവശ്യ കോളുകൾ തടയുന്നതിനുമായി രജിസ്റ്റർ ചെയ്ത ഉപഭോക്താക്കൾക്കും വീടുപണിയുന്നവർക്കും മാത്രമാണ് ഈ സേവനം ലഭ്യമാക്കിയിട്ടുള്ളത്.'}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <Link
                to="/login"
                className="w-full py-3 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
              >
                <LogIn className="w-4 h-4" />
                <span>{lang === 'en' ? 'Sign In As Buyer / House Owner' : 'ഉപഭോക്താവായി ലോഗിൻ ചെയ്യുക'}</span>
              </Link>

              <Link
                to="/register"
                className="w-full py-2.5 rounded-xl border border-stone-300 text-[#4A3626] hover:bg-stone-100 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <UserCheck className="w-4 h-4" />
                <span>{lang === 'en' ? 'Create Free Buyer Account' : 'സൗജന്യ അക്കൗണ്ട് ഉണ്ടാക്കുക'}</span>
              </Link>

              {/* 1-Click Quick Demo Login for instant testing */}
              <div className="pt-2 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  className="text-xs text-[#5B6147] hover:text-[#3F452F] font-bold underline decoration-stone-400 underline-offset-2"
                >
                  ⚡ {lang === 'en' ? 'Quick Demo Login (Suresh Kumar, Buyer)' : 'ടെസ്റ്റിംഗിനായി ഉടൻ ബയറായി ലോഗിൻ ചെയ്യുക'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. REQUEST SAWING / TIMBER QUOTE MODAL (FOR AUTHENTICATED BUYERS) */}
      {quoteModalMill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6147]">
                  {lang === 'en' ? 'Direct Sizing & Sawing Enquiry' : 'തടി അറുപ്പ് / കോട്ടേഷൻ'}
                </span>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                  {lang === 'en' ? quoteModalMill.name : quoteModalMill.nameMl}
                </h3>
              </div>
              <button
                onClick={() => setQuoteModalMill(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {quoteSubmitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-stone-900 text-base">
                  {lang === 'en' ? 'Quote Request Sent to Mill Owner!' : 'കോട്ടേഷൻ അപേക്ഷ മില്ലിലേക്ക് അയച്ചു!'}
                </h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  {lang === 'en'
                    ? `${quoteModalMill.ownerName} will review your requirement and call you at +91 ${user?.phone || ''} shortly.`
                    : `${quoteModalMill.ownerName} ഉടൻ തന്നെ താങ്കളുടെ ഫോണിൽ (+91 ${user?.phone || ''}) ബന്ധപ്പെടുന്നതായിരിക്കും.`}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendQuote} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Required Timber Species' : 'ആവശ്യമുള്ള തടി ഇനം'}
                  </label>
                  <select
                    value={quoteSpecies}
                    onChange={(e) => setQuoteSpecies(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                  >
                    {quoteModalMill.availableSpecies.map((sp, i) => (
                      <option key={i} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {lang === 'en' ? 'Service Needed' : 'ആവശ്യമുള്ള സേവനം'}
                    </label>
                    <select
                      value={quoteService}
                      onChange={(e) => setQuoteService(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                    >
                      <option value="Log Sawing (തടി അറുക്കൽ)">Log Sawing (തടി അറുക്കൽ)</option>
                      <option value="Roof Truss Sizing (കഴുക്കോൽ)">Roof Truss Sizing (കഴുക്കോൽ)</option>
                      <option value="Door Planks (വാതിൽ പലക)">Door Planks (വാതിൽ പലക)</option>
                      <option value="Kiln Seasoning (ഉണക്കൽ)">Kiln Seasoning (ഉണക്കൽ)</option>
                      <option value="Ready Timber Stock (തടി വാങ്ങാൻ)">Ready Timber Stock (തടി വാങ്ങാൻ)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      {lang === 'en' ? 'Approx. Quantity (CFT)' : 'അളവ് (CFT)'}
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={quoteCft}
                      onChange={(e) => setQuoteCft(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en'
                      ? 'House Construction Site / Delivery Town'
                      : 'വീട് പണിയുന്ന സ്ഥലം / ഡെലിവറി സ്ഥലം'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kakkanad, Ernakulam or Adoor, Pathanamthitta"
                    value={quoteDeliveryLocation}
                    onChange={(e) => setQuoteDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Special Specifications (Optional)' : 'പ്രത്യേക നിർദ്ദേശങ്ങൾ (ഓപ്ഷണൽ)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Need 4x3 inch rafters and 1-inch planks without bark"
                    value={quoteNote}
                    onChange={(e) => setQuoteNote(e.target.value)}
                    className="w-full px-3.5 py-2 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteModalMill(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 transition"
                  >
                    {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Submit Quote Request' : 'കോട്ടേഷൻ അയക്കുക'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 6. WRITE A REVIEW MODAL */}
      {reviewModalMill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                {lang === 'en' ? 'Review & Rate Mill' : 'മില്ലിന് റിവ്യൂ നൽകുക'}
              </h3>
              <button
                onClick={() => setReviewModalMill(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-stone-900 text-sm">
                  {lang === 'en' ? 'Thank You For Your Review!' : 'താങ്കളുടെ അഭിപ്രായത്തിന് നന്ദി!'}
                </h4>
              </div>
            ) : (
              <form onSubmit={handleSendReview} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Rating' : 'റേറ്റിംഗ്'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewStars(star)}
                        className={`text-2xl transition ${
                          star <= reviewStars ? 'text-stone-1000' : 'text-stone-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                    <span className="font-bold text-stone-700 ml-2">{reviewStars} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Your Experience / Feedback' : 'താങ്കളുടെ അനുഭവം'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Excellent sawing precision, minimal wastage, friendly owner..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300/80 rounded-xl bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
                    required
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewModalMill(null)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold"
                  >
                    {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold"
                  >
                    {lang === 'en' ? 'Post Review' : 'സമർപ്പിക്കുക'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Context-Aware Minimal Login Alert Modal */}
      <LoginAlertModal
        isOpen={!!loginAlertMill}
        onClose={() => setLoginAlertMill(null)}
        lang={lang}
        entityType="mill"
        entityName={loginAlertMill?.name}
        returnUrl="/mills"
      />
    </div>
  );
}
