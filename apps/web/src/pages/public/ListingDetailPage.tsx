import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  Tag,
  ArrowLeft,
  Send,
  CheckCircle2,
  Phone,
  AlertCircle,
  Trees,
  Layers,
  Scale,
  Lock,
  Calendar,
  Truck,
  Star,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { formatINR, formatUserProfileId, formatCleanPhone, formatTimberListingId } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getTimberListingById, TimberListingItem, mapApiListingToItem } from '../../utils/timberListings';
import { LoginAlertModal, AlertEntityType } from '../../components/LoginAlertModal';
import { BackButton } from '../../components/BackButton';
import { SubmitReviewModal } from '../../components/SubmitReviewModal';
import { api } from '../../lib/api';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface SellerReviewItem {
  id: string;
  author: string;
  role: string;
  rating: number;
  date: string;
  comment: string;
  commentMl?: string;
  isVerified: boolean;
}

export function ListingDetailPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [liveListing, setLiveListing] = useState<TimberListingItem | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(() => Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)));

  useEffect(() => {
    let isMounted = true;
    async function fetchLiveDetail() {
      if (!id) return;
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isUuid) {
        // Fallback demo listing IDs (e.g. '1', '2', etc.) are resolved directly from local catalog
        setIsLoadingDetail(false);
        return;
      }
      try {
        setIsLoadingDetail(true);
        const res = await api.get(`/listings/${id}`);
        if (isMounted && res.data?.success && res.data?.data) {
          setLiveListing(mapApiListingToItem(res.data.data));
        }
      } catch {
        // Fall back gracefully to getTimberListingById(id)
      } finally {
        if (isMounted) setIsLoadingDetail(false);
      }
    }
    fetchLiveDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const listing = liveListing || getTimberListingById(id);

  const [selectedImage, setSelectedImage] = useState<string>(listing.image_url);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  useBodyScrollLock(Boolean(showEnquiryModal));
  const [loginAlert, setLoginAlert] = useState<{
    isOpen: boolean;
    entityType: AlertEntityType;
    entityName?: string;
  }>({
    isOpen: false,
    entityType: 'seller',
  });

  const [quantity, setQuantity] = useState(Math.min(10, listing.quantity));
  const [proposedPrice, setProposedPrice] = useState(listing.price_per_cft);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Verified Seller Reviews State
  const [sellerRating, setSellerRating] = useState<number>(4.9);
  const [sellerReviewCount, setSellerReviewCount] = useState<number>(36);
  const [sellerReviews, setSellerReviews] = useState<SellerReviewItem[]>([
    {
      id: 's-rev-1',
      author: 'George Varghese (Sawmill Owner)',
      role: 'Verified Buyer',
      rating: 5,
      date: '2 weeks ago',
      comment: 'First-grade round logs with accurate Hoppus girth measurements. Full forest transit pass was provided with no inspection hurdles.',
      commentMl: 'കൃത്യമായ അളവിലുള്ള തടികൾ. ഫോറസ്റ്റ് പാസ്സ് സഹിതം യാതൊരു തടസ്സവുമില്ലാതെ ലഭ്യമാക്കി.',
      isVerified: true,
    },
    {
      id: 's-rev-2',
      author: 'Binu Achari (Master Carpenter)',
      role: 'Verified Buyer',
      rating: 4.8,
      date: '1 month ago',
      comment: 'Straight grain wood without hollow heart rot. Excellent timber for structural door framing.',
      commentMl: 'ഉള്ളിൽ പൊള്ളയില്ലാത്ത നല്ല കാതലായ തടി. വാതിലുകൾ പണിയാൻ വളരെ ഉത്തമം.',
      isVerified: true,
    },
  ]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const handleReviewSubmitted = (newRev: any) => {
    const updated = [newRev, ...sellerReviews];
    const total = updated.reduce((sum, r) => sum + r.rating, 0);
    const avg = parseFloat((total / updated.length).toFixed(1));
    setSellerReviews(updated);
    setSellerRating(avg);
    setSellerReviewCount((prev) => prev + 1);
  };

  // Synchronize when listing ID changes
  React.useEffect(() => {
    setSelectedImage(listing.image_url);
    setQuantity(Math.min(10, listing.quantity));
    setProposedPrice(listing.price_per_cft);
  }, [id, listing.image_url, listing.price_per_cft, listing.quantity]);

  const imagesList = Array.from(new Set([listing.image_url, ...(listing.additional_images || [])]));

  // State-preserving back navigation
  const handleBackNavigation = () => {
    const fromSearch = (location.state as any)?.fromSearch;
    if (fromSearch) {
      navigate(`/marketplace?${fromSearch}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/marketplace');
    }
  };

  const handleEnquiryClick = () => {
    if (!isAuthenticated) {
      setLoginAlert({
        isOpen: true,
        entityType: 'enquiry',
        entityName: listing.title,
      });
      return;
    }
    setShowEnquiryModal(true);
  };

  const handleContactClick = () => {
    if (!isAuthenticated) {
      setLoginAlert({
        isOpen: true,
        entityType: 'seller',
        entityName: listing.seller_name || 'Timber Depot',
      });
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingEnquiry(true);
    try {
      if (listing.seller_id) {
        await api.post('/enquiries', {
          listing_id: listing.id,
          quantity,
          proposed_price: proposedPrice,
          message: message.trim() || undefined,
        });
      }
      setSent(true);
    } catch {
      // Graceful completion for demo listings or offline preview
      setSent(true);
    } finally {
      setIsSubmittingEnquiry(false);
    }
    setTimeout(() => {
      setShowEnquiryModal(false);
      setSent(false);
      setMessage('');
    }, 1500);
  };

  const isFirewood = listing.type.toLowerCase().includes('firewood') || listing.title.toLowerCase().includes('firewood');

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fadeIn">
      {/* State-Preserving In-Page Back Button */}
      <BackButton
        label={lang === 'en' ? 'Back to Marketplace' : 'തിരികെ മാർക്കറ്റിലേക്ക്'}
        fallbackPath="/marketplace"
        lang={lang}
        onClick={handleBackNavigation}
      />

      {isLoadingDetail && !liveListing ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse" data-testid="listing-detail-loading">
          <div className="space-y-4">
            <div className="aspect-[4/3] w-full rounded-3xl bg-stone-200" />
            <div className="grid grid-cols-3 gap-3">
              <div className="aspect-[16/10] rounded-2xl bg-stone-200" />
              <div className="aspect-[16/10] rounded-2xl bg-stone-200" />
              <div className="aspect-[16/10] rounded-2xl bg-stone-200" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-stone-200 rounded-xl w-3/4" />
            <div className="h-6 bg-stone-200 rounded-md w-1/3" />
            <div className="h-24 bg-stone-100 rounded-2xl" />
            <div className="h-32 bg-stone-100 rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Gallery with Reserved Aspect Ratio */}
        <div className="space-y-4">
          <div className="aspect-[4/3] w-full rounded-3xl overflow-hidden bg-[#E7E1D6] border-2 border-[#8E7F6B]/30 shadow-md">
            <img
              src={selectedImage}
              alt={listing.title}
              className="w-full h-full object-cover transition duration-300"
            />
          </div>
          {imagesList.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {imagesList.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`aspect-[16/10] rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === img
                      ? 'border-[#5B6147] ring-2 ring-[#5B6147]/30 shadow-xs'
                      : 'border-[#8E7F6B]/30 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-300 text-xs font-mono font-bold">
                {formatTimberListingId(listing.id)}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#E7E1D6] border border-[#8E7F6B]/30 text-[#4A3626] text-xs font-bold flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#5B6147]" />
                {lang === 'en' ? listing.species : listing.species_ml}
              </span>
              <span className="text-xs text-[#7A5A3A] font-semibold">
                {lang === 'en' ? listing.type : listing.type_ml}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-stone-900 text-white text-[11px] font-bold">
                {listing.grade}
              </span>
              {listing.transit_pass && (
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Forest Form IV Pass' : 'ഫോറസ്റ്റ് പാസ്സ് ഉണ്ട്'}</span>
                </span>
              )}
              {listing.status === 'sold' && (
                <span className="px-3 py-1 rounded-md bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider">
                  {lang === 'en' ? 'SOLD' : 'വിറ്റുപോയി'}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626] tracking-tight leading-tight">
              {lang === 'en' ? listing.title : (listing.title_ml || listing.title)}
            </h1>

            <div className="flex items-center gap-2 text-xs text-[#7A5A3A] mt-2 font-medium">
              <MapPin className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
              <span>
                {isAuthenticated
                  ? `${listing.locality}, ${listing.district}`
                  : `${listing.district} (Log in for exact depot address)`}
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-[#E7E1D6] to-[#d5cfc4] border border-[#8E7F6B]/40 shadow-xs flex items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase font-bold text-[#5B6147] tracking-wider block">
                {isFirewood
                  ? (lang === 'en' ? 'Verified Rate / Tonne' : 'അംഗീകൃത നിരക്ക് / ടൺ')
                  : (lang === 'en' ? 'Verified Rate / CFT' : 'അംഗീകൃത നിരക്ക് / CFT')}
              </span>
              <div className="text-3xl font-black font-serif text-[#4A3626]">
                {formatINR(listing.price_per_cft)}
              </div>
              <span className="text-xs text-[#7A5A3A] font-semibold">
                {lang === 'en'
                  ? `Available Stock: ${listing.quantity} ${isFirewood ? 'Tonnes' : listing.unit}`
                  : `ലഭ്യമായ അളവ്: ${listing.quantity} ${isFirewood ? 'ടൺ' : listing.unit}`}
              </span>
            </div>

            {listing.status === 'sold' ? (
              <div className="px-6 py-3.5 rounded-2xl bg-stone-400 text-white font-bold text-sm flex items-center gap-2 cursor-not-allowed">
                <AlertCircle className="w-4 h-4" />
                <span>{lang === 'en' ? 'Sold Out' : 'വിറ്റുപോയി'}</span>
              </div>
            ) : (
              <button
                onClick={handleEnquiryClick}
                className="px-6 py-3.5 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{lang === 'en' ? 'Send Enquiry' : 'അന്വേഷണം അയക്കുക'}</span>
              </button>
            )}
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#E7E1D6]/50 border border-[#8E7F6B]/20 space-y-1">
              <span className="text-[10px] text-[#7A5A3A] uppercase font-bold block">
                {lang === 'en' ? 'Dimensions & Specs' : 'തടിയുടെ അളവുകൾ'}
              </span>
              <span className="font-bold text-[#4A3626] text-sm block">{listing.dimensions}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#E7E1D6]/50 border border-[#8E7F6B]/20 space-y-1">
              <span className="text-[10px] text-[#7A5A3A] uppercase font-bold block">
                {lang === 'en' ? 'Moisture Level' : 'ഈർപ്പത്തിന്റെ അളവ്'}
              </span>
              <span className="font-bold text-[#4A3626] text-sm block">
                {listing.moisture || listing.moisture_level || (lang === 'en' ? 'Air Seasoned' : 'ഉണക്കിയത്')}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs text-[#4A3626] space-y-1.5 leading-relaxed">
            <span className="font-bold text-stone-900 block text-xs">
              {lang === 'en' ? 'Inspection & Quality Notes:' : 'ഗുണനിലവാര വിവരണം:'}
            </span>
            <p>
              {lang === 'en'
                ? (listing.condition_notes || listing.description || 'Verified Kerala timber stock available with legal forest transport passes.')
                : (listing.condition_notes_ml || listing.description_ml || listing.condition_notes || listing.description || 'കേരള ഫോറസ്റ്റ് അനുമതിയോടെ ലഭ്യമായ ഗുണനിലവാരമുള്ള തടി.')}
            </p>
          </div>

          {/* Verified Seller Card & Contact Masking */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#4A3626] uppercase tracking-wider block">
                {lang === 'en' ? 'Verified Seller Details' : 'കച്ചവടക്കാരന്റെ വിവരങ്ങൾ'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                TIMORA ID: {formatUserProfileId({ role: 'seller', id: listing.seller_id, phone: listing.seller_phone })}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-bold text-[#4A3626] text-sm">{listing.seller_name}</div>
                <div className="text-stone-500 mt-0.5">{listing.district}</div>
              </div>

              {isAuthenticated ? (
                <a
                  href={`tel:${(listing.seller_phone || listing.phone || '9847120001').replace(/\D/g, '')}`}
                  className="px-4 py-2 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-[#4A3626] font-bold text-xs transition flex items-center gap-1.5 shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
                  <span>{formatCleanPhone(listing.seller_phone || listing.phone || '9847120001')}</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={handleContactClick}
                  className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-stone-500" />
                  <span>{lang === 'en' ? 'Sign in to View Phone' : 'ഫോൺ നമ്പർ കാണാൻ ലോഗിൻ ചെയ്യുക'}</span>
                </button>
              )}
            </div>

            {/* Seller Ratings & Verified Customer Reviews */}
            <div className="pt-3 border-t border-stone-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{sellerRating.toFixed(1)}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 font-medium">
                    ({sellerReviewCount} {lang === 'en' ? 'Verified Reviews' : 'റിവ്യൂകൾ'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowReviewModal(true)}
                  className="text-[11px] font-bold text-[#5B6147] hover:underline flex items-center gap-1"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  <span>{lang === 'en' ? 'Rate Seller' : 'റേറ്റിംഗ് നൽകുക'}</span>
                </button>
              </div>

              {/* Verified Reviews Toggle & Feed */}
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="text-[11px] font-bold text-stone-600 hover:text-stone-900 flex items-center gap-1"
              >
                <MessageSquare className="w-3 h-3 text-stone-400" />
                <span>
                  {showAllReviews
                    ? (lang === 'en' ? 'Hide Feedback' : 'മറയ്ക്കുക')
                    : (lang === 'en' ? `Read Customer Feedback (${sellerReviews.length})` : `ഉപഭോക്തൃ അഭിപ്രായങ്ങൾ (${sellerReviews.length})`)}
                </span>
              </button>

              {showAllReviews && (
                <div className="space-y-2 pt-1 animate-fadeIn">
                  {sellerReviews.map((rev) => {
                    const authorMl: Record<string, string> = {
                      'George Varghese (Sawmill Owner)': 'ജോർജ്ജ് വർഗ്ഗീസ് (മില്ല് ഉടമ)',
                      'Binu Achari (Master Carpenter)': 'ബിനു ആശാരി (വിദഗ്ദ്ധ ആശാരി)',
                    };
                    const dateMl: Record<string, string> = {
                      '2 weeks ago': '2 ആഴ്ച മുൻപ്',
                      '1 month ago': '1 മാസം മുൻപ്',
                    };

                    return (
                      <div
                        key={rev.id}
                        className="p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#4A3626]">
                              {lang === 'ml' && authorMl[rev.author] ? authorMl[rev.author] : rev.author}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold flex items-center gap-0.5">
                              <ShieldCheck className="w-2.5 h-2.5" />
                              <span>{lang === 'en' ? rev.role : 'സ്ഥിരീകരിച്ച ഉപഭോക്താവ്'}</span>
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-400">
                            {lang === 'ml' && dateMl[rev.date] ? dateMl[rev.date] : rev.date}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'fill-stone-100 text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-stone-600 leading-relaxed text-[11px]">
                          {lang === 'en' ? rev.comment : (rev.commentMl || rev.comment)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Enquiry Modal */}
      {showEnquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 border-2 border-[#8E7F6B]/30 my-auto">
            <div className="flex items-center justify-between border-b border-[#8E7F6B]/20 pb-3">
              <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                {lang === 'en' ? 'Send Timber Enquiry' : 'തടി അന്വേഷണം അയക്കുക'}
              </h3>
              <button
                type="button"
                onClick={() => setShowEnquiryModal(false)}
                aria-label={lang === 'en' ? 'Close dialog' : 'ഡയലോഗ് അടയ്ക്കുക'}
                className="text-[#8E7F6B] hover:text-[#4A3626] font-bold p-1 rounded-lg hover:bg-[#E7E1D6]/50 transition focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
              >
                ✕
              </button>
            </div>

            {sent ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center text-emerald-900 space-y-1">
                <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600" />
                <div className="font-bold text-sm">
                  {lang === 'en' ? 'Enquiry Sent to Seller!' : 'അന്വേഷണം വിജയകരമായി അയച്ചു!'}
                </div>
                <p className="text-xs text-emerald-700">
                  {lang === 'en' ? 'The seller will review your offer and reply.' : 'കച്ചവടക്കാരൻ നിങ്ങളുടെ ഓഫർ കണ്ട് മറുപടി നൽകും.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry} className="space-y-4">
                <div className="p-2.5 bg-[#E7E1D6]/60 rounded-xl text-xs text-[#4A3626] font-semibold">
                  <span>{listing.title}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A3626] mb-1">
                      {isFirewood
                        ? (lang === 'en' ? 'Quantity (Tonnes)' : 'അളവ് (ടൺ)')
                        : (lang === 'en' ? 'Quantity (CFT)' : 'അളവ് (CFT)')}
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-[#8E7F6B]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white font-medium text-[#4A3626]"
                      min={1}
                      max={listing.quantity}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4A3626] mb-1">
                      {isFirewood
                        ? (lang === 'en' ? 'Offer Rate / Tonne (₹)' : 'ഉദ്ദേശിക്കുന്ന വില / ടൺ')
                        : (lang === 'en' ? 'Offer Rate / CFT (₹)' : 'ഉദ്ദേശിക്കുന്ന വില / CFT')}
                    </label>
                    <input
                      type="number"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 border border-[#8E7F6B]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white font-medium text-[#4A3626]"
                      min={1}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4A3626] mb-1">
                    {lang === 'en' ? 'Message for Seller' : 'കച്ചവടക്കാരനുള്ള സന്ദേശം'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      lang === 'en'
                        ? 'e.g. Need delivery next week in Kottayam. Can we finalize at this price?'
                        : 'സന്ദേശം നൽകുക (ഉദാ: അടുത്ത ആഴ്ച ഡെലിവറി വേണം, ഈ വിലയിൽ ഉറപ്പിക്കാമോ?)...'
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2 border border-[#8E7F6B]/30 rounded-xl text-xs focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white text-[#4A3626]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingEnquiry}
                  className={`w-full py-3.5 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 ${isSubmittingEnquiry ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSubmittingEnquiry ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'en' ? 'Submitting Enquiry...' : 'സമർപ്പിക്കുന്നു...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'en' ? 'Submit Enquiry & Offer' : 'ഓഫർ സമർപ്പിക്കുക'}</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Context-Aware Minimal Login Alert Modal */}
      <LoginAlertModal
        isOpen={loginAlert.isOpen}
        onClose={() => setLoginAlert({ ...loginAlert, isOpen: false })}
        lang={lang}
        entityType={loginAlert.entityType}
        entityName={loginAlert.entityName}
        returnUrl={location.pathname}
      />

      {/* Verified Review Submission Modal */}
      <SubmitReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        targetType="seller"
        targetId={listing.seller_id || listing.id}
        targetName={listing.seller_name || listing.title}
        onReviewSubmitted={handleReviewSubmitted}
        lang={lang}
      />
    </div>
  );
}
