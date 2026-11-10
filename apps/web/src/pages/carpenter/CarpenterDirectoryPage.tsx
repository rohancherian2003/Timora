import React, { useState, useEffect, useCallback } from 'react';
import {
  Hammer,
  MapPin,
  Award,
  Phone,
  Star,
  CheckCircle,
  ShieldCheck,
  Lock,
  MessageSquare,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginAlertModal } from '../../components/LoginAlertModal';
import { BackButton } from '../../components/BackButton';
import { SubmitReviewModal } from '../../components/SubmitReviewModal';
import { api } from '../../lib/api';
import { ValidatedSearchInput } from '../../components/ValidatedSearchInput';

export interface CarpenterReview {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  commentMl?: string;
  isVerified: boolean;
}

export interface CarpenterItem {
  id: string;
  name: string;
  district: string;
  locality: string;
  experience_yrs: number;
  specializations: string[];
  rating: number;
  rating_count: number;
  is_verified: boolean;
  phone: string;
  timber_pref: string;
  reviews: CarpenterReview[];
}

export function CarpenterDirectoryPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { isAuthenticated } = useAuth();
  const [carpenters, setCarpenters] = useState<CarpenterItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const fetchCarpenters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/carpenters');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        const mapped: CarpenterItem[] = res.data.data.map((item: any) => ({
          id: String(item.id),
          name: item.name || item.personalName || 'Master Carpenter',
          district: item.district || 'Kerala',
          locality: item.locality || '',
          experience_yrs: Number(item.experience_yrs) || 10,
          specializations: Array.isArray(item.specializations) && item.specializations.length > 0
            ? item.specializations
            : ['Traditional Wooden Doors (വാതിലുകൾ)', 'Roof Truss Framing (മേൽക്കൂര തട്ടിടൽ)'],
          rating: Number(item.rating) || 5.0,
          rating_count: Number(item.rating_count) || 0,
          is_verified: item.is_verified !== false,
          phone: item.phone || '',
          timber_pref: item.timber_pref || 'Nilambur Teak & Anjili',
          reviews: item.reviews || [],
        }));
        setCarpenters(mapped);
      } else {
        setCarpenters([]);
      }
    } catch (err: any) {
      console.error('Failed to load carpenters directory:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load carpenters directory');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarpenters();
  }, [fetchCarpenters, isAuthenticated]);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; carpenterName?: string }>({
    isOpen: false,
  });

  const [reviewModal, setReviewModal] = useState<{
    isOpen: boolean;
    carpenterId?: string;
    carpenterName?: string;
  }>({
    isOpen: false,
  });

  const [searchQuery, setSearchQuery] = useState('');

  const filtered = carpenters.filter((c) => {
    if (selectedDistrict !== 'all' && !c.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (c.name || '').toLowerCase().includes(q);
      const matchDist = (c.district || '').toLowerCase().includes(q);
      const matchLoc = (c.locality || '').toLowerCase().includes(q);
      const matchSpecs = (c.specializations || []).some((s: string) => s.toLowerCase().includes(q));
      if (!matchName && !matchDist && !matchLoc && !matchSpecs) return false;
    }
    return true;
  });

  const toggleReviews = (id: string) => {
    setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContactClick = (carpenterName: string, phone: string) => {
    if (!isAuthenticated) {
      setAlertModal({
        isOpen: true,
        carpenterName,
      });
      return;
    }
    window.location.href = `tel:${phone}`;
  };

  const handleReviewSubmitted = (carpenterId: string, newReview: CarpenterReview) => {
    setCarpenters((prev) =>
      prev.map((c) => {
        if (c.id === carpenterId) {
          const updatedReviews = [newReview, ...c.reviews];
          const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
          const newAvg = parseFloat((totalRating / updatedReviews.length).toFixed(1));
          return {
            ...c,
            rating: newAvg,
            rating_count: c.rating_count + 1,
            reviews: updatedReviews,
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div className="flex items-center">
        <BackButton fallbackPath="/marketplace" lang={lang} />
      </div>

      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0]">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30">
            <Hammer className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Kerala Master Wood Craftsmen' : 'കേരളത്തിലെ പരമ്പരാഗത ആശാരിമാർ'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#4A3626]">
            {lang === 'en' ? 'Verified Carpenters & Joinery Masters' : 'വിദഗ്ദ്ധരായ ആശാരിമാർ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium">
            {lang === 'en'
              ? 'Connect directly with master carpenters experienced in roofing trusses, door frames, teak carvings, and traditional Kerala timber architecture.'
              : 'മേൽക്കൂര തട്ടിടൽ, കട്ടിളകൾ, വാതിലുകൾ, കൊത്തുപണികൾ എന്നിവയിൽ വർഷങ്ങളുടെ പ്രവൃത്തിപരിചയമുള്ള വിദഗ്ദ്ധ ആശാരിമാർ.'}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-300/80 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-xs">
          <ValidatedSearchInput
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder={lang === 'en' ? 'Search carpenters or specialties...' : 'ആശാരിയുടെ പേര്, ജോലി തിരയുക...'}
            lang={lang}
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#5B6147]" />
            <span className="text-xs font-bold text-stone-700">
              {lang === 'en' ? 'District:' : 'ജില്ല:'}
            </span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
            >
              <option value="all">{lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും'}</option>
              <option value="kottayam">Kottayam (കോട്ടയം)</option>
              <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
              <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
              <option value="kozhikode">Kozhikode (കോഴിക്കോട്)</option>
            </select>
          </div>

          <span className="text-xs font-semibold text-stone-500">
            {filtered.length} {lang === 'en' ? 'Carpenters Listed' : 'ആശാരിമാർ ലഭ്യമാണ്'}
          </span>
        </div>
      </div>

      {/* Carpenter Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse" data-testid="carpenters-loading">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-3xl border border-stone-300/80 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 w-3/4">
                  <div className="h-6 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-4 bg-stone-200 rounded-md w-1/2" />
                </div>
                <div className="h-8 w-14 bg-stone-200 rounded-xl" />
              </div>
              <div className="h-10 bg-stone-100 rounded-xl" />
              <div className="h-14 bg-stone-100 rounded-2xl" />
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
                ? 'Unable to load carpenter directory'
                : 'ആശാരിമാരുടെ വിവരങ്ങൾ ലഭ്യമാക്കാൻ സാധിച്ചില്ല'}
            </span>
          </div>
          <p className="text-xs text-red-600">{error}</p>
          <button
            onClick={() => fetchCarpenters()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B6147] text-white text-xs font-bold hover:bg-[#3F452F] transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Retry' : 'വീണ്ടും ശ്രമിക്കുക'}</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center space-y-2">
          <Hammer className="w-8 h-8 text-stone-400 mx-auto" />
          <h3 className="font-bold text-stone-700">
            {lang === 'en'
              ? 'No verified carpenters found in this district'
              : 'ഈ ജില്ലയിൽ ആശാരിമാർ ലഭ്യമായിട്ടില്ല'}
          </h3>
          <p className="text-xs text-stone-500">
            {lang === 'en'
              ? 'Try selecting All Districts to see master carpenters across Kerala'
              : 'മറ്റു ജില്ലകളിലെ വിദഗ്ദ്ധരായ ആശാരിമാരെ കാണാൻ എല്ലാ ജില്ലകളും തെരഞ്ഞെടുക്കുക'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-[#4A3626] text-lg group-hover:text-[#5B6147] transition font-serif">
                      {c.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
                      <span>{c.locality ? `${c.locality}, ` : ''}{c.district}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-[#4A3626] border border-stone-300 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-stone-1000 text-stone-1000" />
                    <span>{c.rating}</span>
                    <span className="text-stone-400 font-normal">({c.rating_count})</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#E7E1D6] text-[#4A3626] border border-stone-300/60 text-xs font-bold">
                    {c.experience_yrs} {lang === 'en' ? 'Years Experience' : 'വർഷത്തെ പരിചയം'}
                  </span>
                  {c.is_verified && (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Verified Carpenter' : 'വെരിഫൈഡ്'}</span>
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200">
                  <span className="text-[10px] uppercase font-bold text-stone-400">
                    {lang === 'en' ? 'Specialized Woodwork' : 'പ്രത്യേക മേഖലകൾ'}
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {c.specializations.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-[#fbf7f0] text-[#4A3626] text-xs font-semibold border border-stone-300/60"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 text-xs text-stone-500">
                  <span className="font-semibold text-stone-700">{lang === 'en' ? 'Timber Worked: ' : 'ഉപയോഗിക്കുന്ന തടി: '}</span>
                  <span>{c.timber_pref}</span>
                </div>

                {/* Verified Client Reviews Section */}
                <div className="mt-4 pt-3 border-t border-stone-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleReviews(c.id)}
                      className="text-xs font-bold text-[#5B6147] hover:underline flex items-center gap-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>
                        {expandedReviews[c.id]
                          ? (lang === 'en' ? 'Hide Verified Reviews' : 'റിവ്യൂകൾ മറയ്ക്കുക')
                          : (lang === 'en' ? `View ${c.reviews.length} Verified Reviews` : `റിവ്യൂകൾ കാണുക (${c.reviews.length})`)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setReviewModal({
                          isOpen: true,
                          carpenterId: c.id,
                          carpenterName: c.name,
                        })
                      }
                      className="text-[11px] font-bold text-[#4A3626] hover:text-[#5B6147] transition flex items-center gap-1"
                    >
                      <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
                      <span>{lang === 'en' ? 'Rate & Review' : 'റേറ്റിംഗ് നൽകുക'}</span>
                    </button>
                  </div>

                  {/* Expanded Reviews Accordion */}
                  {expandedReviews[c.id] && (
                    <div className="mt-3 space-y-2.5 animate-fadeIn">
                      {c.reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-[#4A3626]">{rev.author}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center gap-0.5">
                                <ShieldCheck className="w-2.5 h-2.5" />
                                <span>{rev.role}</span>
                              </span>
                            </div>
                            <span className="text-[10px] text-stone-400 font-medium">{rev.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'fill-stone-100 text-stone-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-stone-600 leading-relaxed text-[11px] font-normal">
                            {lang === 'en' ? rev.comment : (rev.commentMl || rev.comment)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase">
                    {lang === 'en' ? 'Contact' : 'ഫോൺ'}
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-900">
                    {c.phone || '+91 9447••••••'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleContactClick(c.name, c.phone)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-xs transition"
                >
                  {isAuthenticated ? (
                    <>
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Call Master Craftsman' : 'വിളിക്കുക'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-white/80" />
                      <span>{lang === 'en' ? 'Sign in to Contact' : 'ബന്ധപ്പെടാൻ ലോഗിൻ'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Context-Aware Minimal Login Alert Modal */}
      <LoginAlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false })}
        lang={lang}
        entityType="carpenter"
        entityName={alertModal.carpenterName}
        returnUrl="/carpenters"
      />

      {/* Verified Review Submission Modal */}
      <SubmitReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ isOpen: false })}
        targetType="carpenter"
        targetId={reviewModal.carpenterId || ''}
        targetName={reviewModal.carpenterName || ''}
        onReviewSubmitted={(newRev) => {
          if (reviewModal.carpenterId) {
            handleReviewSubmitted(reviewModal.carpenterId, newRev);
          }
        }}
        lang={lang}
      />
    </div>
  );
}
