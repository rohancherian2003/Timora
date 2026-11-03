import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Store,
  MapPin,
  Phone,
  LifeBuoy,
  ShieldCheck,
  MessageSquare,
  Trees,
  User,
  Upload,
  Image as ImageIcon,
  Trash2,
  Camera,
  X,
  Loader2,
} from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { getTicketsForUser, markTicketAsRead, SupportTicket } from '../../utils/ticketService';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';
import { api } from '../../lib/api';

export function SellerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user, refreshUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getTicketsForUser(user?.phone, 'seller')
  );

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, [refreshUser]);
  const [title, setTitle] = useState('');
  const [speciesId, setSpeciesId] = useState(1); // Teak
  const [typeId, setTypeId] = useState(2); // Planks
  const [districtId, setDistrictId] = useState(5); // Kottayam
  const [quantity, setQuantity] = useState(25);
  const [pricePerCft, setPricePerCft] = useState(2400);
  const [submitted, setSubmitted] = useState(false);
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [listingError, setListingError] = useState<string | null>(null);
  const [isSubmittingListing, setIsSubmittingListing] = useState(false);
  const [managingPhotosListing, setManagingPhotosListing] = useState<any | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (selectedImages.length + files.length > 8) {
      setImageError(
        lang === 'en'
          ? 'Maximum 8 photographs allowed per timber listing.'
          : 'ഒരു ലിസ്റ്റിംഗിൽ പരമാവധി 8 ഫോട്ടോകൾ മാത്രമേ അനുവദിക്കൂ.'
      );
      return;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setImageError(
          lang === 'en'
            ? `"${file.name}" is not supported. Only JPEG, PNG, and WebP are allowed.`
            : `"${file.name}" സ്വീകാര്യമല്ല. JPEG, PNG, WebP ഫോർമാറ്റുകൾ മാത്രം തിരഞ്ഞെടുക്കുക.`
        );
        return;
      }
      if (file.size > maxSizeBytes) {
        setImageError(
          lang === 'en'
            ? `"${file.name}" exceeds the 10MB file limit.`
            : `"${file.name}" 10MB ൽ കൂടുതലാണ്.`
        );
        return;
      }
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setSelectedImages((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveImage = (index: number) => {
    const url = imagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSinglePhoto = async (listingId: string, file: File) => {
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.post(`/listings/${listingId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const listRes = await api.get('/listings/seller/me');
      if (listRes.data?.success && Array.isArray(listRes.data?.data)) {
        setSellerListings(listRes.data.data);
        const updated = listRes.data.data.find((l: any) => l.id === listingId);
        if (updated) setManagingPhotosListing(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async (listingId: string, imageId: string) => {
    if (!window.confirm(lang === 'en' ? 'Remove this photograph?' : 'ഈ ഫോട്ടോ നീക്കം ചെയ്യണോ?')) return;
    try {
      await api.delete(`/listings/${listingId}/images/${imageId}`);
      const listRes = await api.get('/listings/seller/me');
      if (listRes.data?.success && Array.isArray(listRes.data?.data)) {
        setSellerListings(listRes.data.data);
        const updated = listRes.data.data.find((l: any) => l.id === listingId);
        if (updated) setManagingPhotosListing(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.message || 'Failed to delete photo.');
    }
  };

  const handleReplacePhoto = async (listingId: string, imageId: string, file: File) => {
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      await api.put(`/listings/${listingId}/images/${imageId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const listRes = await api.get('/listings/seller/me');
      if (listRes.data?.success && Array.isArray(listRes.data?.data)) {
        setSellerListings(listRes.data.data);
        const updated = listRes.data.data.find((l: any) => l.id === listingId);
        if (updated) setManagingPhotosListing(updated);
      }
    } catch (err: any) {
      alert(err?.response?.data?.error?.message || err?.message || 'Failed to replace photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function fetchMyListings() {
      try {
        setIsLoadingListings(true);
        const res = await api.get('/listings/seller/me');
        if (isMounted && res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          setSellerListings(res.data.data);
        }
      } catch {
        // Fall back gracefully to demo stock
      } finally {
        if (isMounted) setIsLoadingListings(false);
      }
    }
    fetchMyListings();
    return () => {
      isMounted = false;
    };
  }, [user?.id, submitted]);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getTicketsForUser(user?.phone, 'seller'));
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, [user]);

  const latestResolvedTicket = tickets.find((t) => t.status === 'resolved' && t.resolutionReply);

  const unreadTicketsCount = tickets.filter(
    (t) => !t.isRead && (t.status === 'resolved' || Boolean(t.resolutionReply))
  ).length;

  useEffect(() => {
    if (latestResolvedTicket && !latestResolvedTicket.isRead) {
      markTicketAsRead(latestResolvedTicket.id);
      api.patch(`/support/tickets/${latestResolvedTicket.id}/read`).catch(() => {});
    }
  }, [latestResolvedTicket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingListing(true);
    setListingError(null);
    setImageError(null);

    try {
      const res = await api.post('/listings', {
        title: title.trim(),
        species_id: speciesId,
        timber_type_id: typeId,
        district_id: districtId,
        quantity,
        price_per_cft: pricePerCft,
        pricing_mode: 'fixed',
        unit: 'cft',
      });

      const listingId = res.data?.data?.id;

      // Upload selected photographs to backend storage
      if (listingId && selectedImages.length > 0) {
        for (const file of selectedImages) {
          const formData = new FormData();
          formData.append('image', file);
          try {
            await api.post(`/listings/${listingId}/images`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
          } catch (uploadErr) {
            console.error('Failed to upload image:', uploadErr);
          }
        }
      }

      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedImages([]);
      setImagePreviews([]);

      setSubmitted(true);
      setIsSubmittingListing(false);

      // Refresh listings
      try {
        const listRes = await api.get('/listings/seller/me');
        if (listRes.data?.success && Array.isArray(listRes.data?.data)) {
          setSellerListings(listRes.data.data);
        }
      } catch {}

      setTimeout(() => {
        setShowAddForm(false);
        setSubmitted(false);
        setTitle('');
      }, 1500);
    } catch (err: any) {
      setIsSubmittingListing(false);
      setListingError(
        err?.response?.data?.message ||
        err?.response?.data?.error?.message ||
        err?.message ||
        (lang === 'en' ? 'Failed to submit listing.' : 'ലിസ്റ്റിംഗ് സമർപ്പിക്കാൻ സാധിച്ചില്ല.')
      );
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fadeIn">
      {/* VERIFICATION STATUS BANNER */}
      <VerificationStatusBanner
        status={user?.approvalStatus || 'APPROVED'}
        role="seller"
        entityName={user?.businessName || user?.name}
        note={user?.approvalNote}
        lang={lang}
        onRaiseTicket={() => setIsRaiseModalOpen(true)}
      />

      {/* Top Welcome - Individual Timber Seller */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{lang === 'en' ? 'Individual Timber Seller' : 'വ്യക്തിഗത തടി കച്ചവടക്കാരൻ'}</span>
            </span>
            <span className="text-xs text-[#4A3626] font-mono font-medium">ID: {user?.id || 'usr-seller-indiv'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {user?.name || (lang === 'en' ? 'Seller Management Dashboard' : 'തടിക്കച്ചവട ഡാഷ്‌ബോർഡ്')}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] mt-1 flex items-center gap-2 font-medium">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>+91 {user?.phone || '9847120001'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{user?.district || 'Malappuram (മലപ്പുറം)'}</span>
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <User className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Edit Profile' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ'}</span>
          </button>

          <button
            onClick={() => setIsRaiseModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <LifeBuoy className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Support Desk' : 'സഹായം'}</span>
            {unreadTicketsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
                {unreadTicketsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (user?.approvalStatus !== 'APPROVED') {
                alert(
                  lang === 'en'
                    ? 'Listing creation is restricted while your business verification is pending admin review.'
                    : 'അക്കൗണ്ട് അഡ്മിൻ പരിശോധന പൂർത്തിയായി അംഗീകരിച്ച ശേഷം മാത്രമേ തടി ലോഗുകൾ ചേർക്കാൻ സാധിക്കൂ.'
                );
                return;
              }
              setShowAddForm(!showAddForm);
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition ${
              user?.approvalStatus === 'APPROVED'
                ? 'bg-[#5B6147] hover:bg-[#3F452F] text-white'
                : 'bg-stone-300 text-stone-600 cursor-not-allowed opacity-90'
            }`}
            title={user?.approvalStatus !== 'APPROVED' ? (lang === 'en' ? 'Approval Required' : 'അംഗീകാരം ആവശ്യമാണ്') : undefined}
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Post Timber Logs' : 'തടി ലോഗുകൾ ചേർക്കുക'}</span>
          </button>
        </div>
      </div>

      {/* IN-DASHBOARD NOTIFICATION FEED */}
      <DashboardNotificationsFeed lang={lang} />

      {/* RESOLVED TICKET NOTIFICATION POP-UP BANNER */}
      {latestResolvedTicket && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-[#E7E1D6] to-stone-100 border-2 border-emerald-400 shadow-md animate-fadeIn space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase tracking-wider">
                    {lang === 'en' ? 'Admin Solution Reply' : 'അഡ്മിൻ നൽകിയ പരിഹാരം'}
                  </span>
                  <span className="font-mono text-xs font-bold text-stone-600">
                    {latestResolvedTicket.id}
                  </span>
                </div>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base mt-0.5">
                  {lang === 'en' ? latestResolvedTicket.category : latestResolvedTicket.categoryMl}
                </h3>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs text-xs space-y-1">
            <div className="flex items-center justify-between text-stone-500 text-[11px] font-semibold">
              <span>{lang === 'en' ? 'Resolved by Timora Admin Cell' : 'ടിമോറ അഡ്മിൻ മറുപടി:'}</span>
              <span className="font-mono">{latestResolvedTicket.resolvedAt}</span>
            </div>
            <p className="text-stone-900 text-xs sm:text-sm font-medium leading-relaxed">
              "{lang === 'en'
                ? (latestResolvedTicket.resolutionReply || latestResolvedTicket.resolutionReplyMl)
                : (latestResolvedTicket.resolutionReplyMl || latestResolvedTicket.resolutionReply)}"
            </p>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-stone-300/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Live Active Stock' : 'ലഭ്യമായ സ്റ്റോക്ക്'}
            </span>
            <div className="text-2xl font-black text-[#4A3626] font-serif mt-1">
              125 <span className="text-sm font-sans font-semibold text-[#5B6147]">CFT</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-stone-100 text-[#5B6147] flex items-center justify-center border border-stone-300/60">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-300/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Awaiting Admin Review' : 'റിവ്യൂവിലുള്ളവ'}
            </span>
            <div className="text-2xl font-black text-[#5B6147] font-serif mt-1">
              2 <span className="text-sm font-sans font-semibold text-stone-500">Listings</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#E7E1D6] text-[#5B6147] flex items-center justify-center border border-stone-300/60">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-300/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Active Enquiries' : 'ലഭിച്ച അന്വേഷണങ്ങൾ'}
            </span>
            <div className="text-2xl font-black text-[#4A3626] font-serif mt-1">
              5 <span className="text-sm font-sans font-semibold text-stone-500">Open</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* New Listing Modal / Form */}
      {showAddForm && (
        <div className="bg-[#FDFBF7] rounded-3xl border-2 border-[#8E7F6B]/30 p-6 sm:p-8 shadow-md space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#8E7F6B]/20 pb-4">
            <h2 className="text-lg font-extrabold font-serif text-[#4A3626]">
              {lang === 'en' ? 'Submit Timber Stock for Approval' : 'പുതിയ തടി അനുമതിക്കായി സമർപ്പിക്കുക'}
            </h2>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              aria-label={lang === 'en' ? 'Close form' : 'ഫോം അടയ്ക്കുക'}
              className="text-xs text-[#8E7F6B] hover:text-[#4A3626] font-bold px-2 py-1 rounded-lg hover:bg-[#E7E1D6]/50 transition focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
            >
              ✕ Close
            </button>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-900 space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-700" />
              <div className="font-bold text-sm">
                {lang === 'en' ? 'Submitted for Admin Review!' : 'അഡ്മിൻ അനുമതിക്കായി സമർപ്പിച്ചു!'}
              </div>
              <p className="text-xs text-emerald-700">
                {lang === 'en' ? 'Once approved, your stock will be visible to buyers.' : 'അംഗീകരിച്ചു കഴിഞ്ഞാൽ ഉടൻ ഉപഭോക്താക്കൾക്ക് ദൃശ്യമാകും.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Stock Title' : 'തടിയുടെ പേര് / വിവരണം'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. First-Grade Teak Planks 10ft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Species' : 'തടി ഇനം'}
                  </label>
                  <select
                    value={speciesId}
                    onChange={(e) => setSpeciesId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value={1}>Teak (തേക്ക്)</option>
                    <option value={2}>Mahogany (മഹാഗണി)</option>
                    <option value={3}>Anjili (ആഞ്ഞിലി)</option>
                    <option value={4}>Rubberwood (റബർ)</option>
                    <option value={5}>Mango Wood (മാവ്)</option>
                    <option value={6}>Jackfruit (പ്ലാവ്)</option>
                    <option value={7}>Rosewood (ഇടപ്പിലി)</option>
                    <option value={8}>Coconut (തെങ്ങ്)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Timber Type' : 'തടി രൂപം'}
                  </label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value={1}>Round Logs (ലോഗ്സ്)</option>
                    <option value={2}>Rough-sawn Planks (പലക)</option>
                    <option value={3}>Squared Beams (തൂൺ)</option>
                    <option value={4}>Firewood (വിറക്)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'District' : 'ജില്ല'}
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value={5}>Kottayam (കോട്ടയം)</option>
                    <option value={7}>Ernakulam (എറണാകുളം)</option>
                    <option value={8}>Thrissur (തൃശ്ശൂർ)</option>
                    <option value={10}>Malappuram (മലപ്പുറം)</option>
                    <option value={11}>Kozhikode (കോഴിക്കോട്)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Quantity (CFT)' : 'അളവ് (CFT)'}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
                  </label>
                  <input
                    type="number"
                    value={pricePerCft}
                    onChange={(e) => setPricePerCft(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Timber Photographs Upload Area */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-semibold text-stone-700">
                  {lang === 'en' ? 'Timber Photographs (Max 8)' : 'തടിയുടെ ഫോട്ടോകൾ (പരമാവധി 8)'}
                </label>

                {imageError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{imageError}</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 items-center">
                  {imagePreviews.map((previewUrl, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-2xl border border-stone-300 overflow-hidden group shadow-xs">
                      <img src={previewUrl} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-black text-white rounded-full transition"
                        title={lang === 'en' ? 'Remove' : 'നീക്കം ചെയ്യുക'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#5B6147]/90 text-white text-[9px] text-center font-bold py-0.5">
                          {lang === 'en' ? 'Primary' : 'പ്രധാനം'}
                        </span>
                      )}
                    </div>
                  ))}

                  {selectedImages.length < 8 && (
                    <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#8E7F6B]/40 hover:border-[#5B6147] flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-[#E7E1D6]/30 transition group">
                      <Camera className="w-6 h-6 text-[#8E7F6B] group-hover:text-[#5B6147] transition" />
                      <span className="text-[10px] font-semibold text-stone-500 mt-1">
                        {lang === 'en' ? 'Add Photo' : 'ചേർക്കുക'}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-[11px] text-stone-400">
                  {lang === 'en'
                    ? 'Upload clear photos of cross-cut end grains, side grain, and logs/planks (JPEG, PNG, WebP up to 10MB).'
                    : 'തടിയുടെ വ്യക്തമായ ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക (JPEG, PNG, WebP, പരമാവധി 10MB).'}
                </p>
              </div>

              {listingError && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{listingError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingListing}
                className="w-full py-3 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center justify-center gap-2"
              >
                {isSubmittingListing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'en' ? 'Uploading & Submitting...' : 'സമർപ്പിക്കുന്നു...'}</span>
                  </>
                ) : (
                  <span>{lang === 'en' ? 'Submit Listing for Approval' : 'അംഗീകാരത്തിനായി ലിസ്റ്റിംഗ് സമർപ്പിക്കുക'}</span>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Current Stock Table */}
      <div className="bg-white rounded-3xl border border-stone-300/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
            {lang === 'en' ? 'My Timber Stock Inventory' : 'എന്റെ തടി സ്റ്റോക്കുകൾ'}
          </h3>
          <span className="text-xs text-[#5B6147] font-semibold">1 Active · 1 Pending Review</span>
        </div>

        <div className="divide-y divide-stone-200 text-xs sm:text-sm">
          {isLoadingListings ? (
            <div className="p-4 space-y-3 animate-pulse" data-testid="seller-listings-loading">
              {[1, 2].map((n) => (
                <div key={n} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="w-12 h-12 rounded-xl bg-stone-200 flex-shrink-0" />
                    <div className="space-y-1.5 w-full">
                      <div className="h-4 bg-stone-200 rounded w-3/4" />
                      <div className="h-3 bg-stone-100 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-6 w-24 bg-stone-200 rounded-full" />
                </div>
              ))}
            </div>
          ) : sellerListings.length > 0 ? (
            sellerListings.map((item) => {
              const primaryImg = Array.isArray(item.images)
                ? item.images.find((img: any) => img.is_primary)?.url || item.images[0]?.url
                : null;
              const photoCount = Array.isArray(item.images) ? item.images.length : 0;

              return (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#E7E1D6]/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {primaryImg ? (
                        <img src={primaryImg} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Trees className="w-6 h-6 text-stone-300" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-[#4A3626] flex items-center gap-2">
                        <span>{item.title}</span>
                        {photoCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono font-medium flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5 text-[#5B6147]" />
                            {photoCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {item.species_name_en || 'Timber'} · {item.type_name_en || 'Planks'} · {item.district_name_en || 'Kerala'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                    <span className="font-mono font-bold text-[#4A3626]">
                      {item.quantity} CFT @ ₹{Number(item.price_per_cft).toLocaleString('en-IN')}/CFT
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-[#4A3626] border border-stone-300'
                    }`}>
                      {item.status === 'approved' ? (lang === 'en' ? 'Approved (Live)' : 'ലൈവ്') : (lang === 'en' ? 'Pending Review' : 'പരിശോധനയിൽ')}
                    </span>
                    <button
                      onClick={() => setManagingPhotosListing(item)}
                      className="px-2.5 py-1 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/50 text-[#4A3626] text-xs font-semibold transition flex items-center gap-1"
                      title={lang === 'en' ? 'Manage photographs' : 'ഫോട്ടോകൾ'}
                    >
                      <Camera className="w-3.5 h-3.5 text-[#5B6147]" />
                      <span>{lang === 'en' ? 'Photos' : 'ചിത്രങ്ങൾ'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <>
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#E7E1D6]/50">
                <div>
                  <div className="font-bold text-[#4A3626]">First-Grade Nilambur Teak Planks</div>
                  <div className="text-xs text-stone-500 mt-0.5">Teak · Rough-sawn Planks · Kottayam</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-[#4A3626]">45 CFT @ ₹2,800/CFT</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    Approved (ലൈവ്)
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#E7E1D6]/50">
                <div>
                  <div className="font-bold text-[#4A3626]">Aanjili Wild Jack Beams</div>
                  <div className="text-xs text-stone-500 mt-0.5">Anjili · Squared Beams · Kottayam</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-stone-700">80 CFT @ ₹1,400/CFT</span>
                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-[#4A3626] border border-stone-300 text-xs font-semibold">
                    Pending Review (പരിശോധനയിൽ)
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <RaiseTicketModal
        isOpen={isRaiseModalOpen}
        onClose={() => setIsRaiseModalOpen(false)}
        lang={lang}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        lang={lang}
      />

      {/* Photo Management Modal for Existing Listings */}
      {managingPhotosListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-300 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                  {lang === 'en' ? 'Manage Timber Photographs' : 'ഫോട്ടോകൾ മാറ്റുക'}
                </h3>
                <p className="text-xs text-[#7A5A3A] font-medium line-clamp-1">
                  {managingPhotosListing.title}
                </p>
              </div>
              <button
                onClick={() => setManagingPhotosListing(null)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.isArray(managingPhotosListing.images) &&
                  managingPhotosListing.images.map((img: any) => (
                    <div key={img.id} className="relative aspect-square rounded-2xl border border-stone-200 overflow-hidden shadow-xs group">
                      <img src={img.url} alt="Timber photograph" className="w-full h-full object-cover" />
                      <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <label
                          className="p-1 bg-black/70 hover:bg-[#5B6147] text-white rounded-full transition cursor-pointer"
                          title={lang === 'en' ? 'Replace photo' : 'മാറ്റുക'}
                        >
                          <Upload className="w-3 h-3" />
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isUploadingPhoto}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleReplacePhoto(managingPhotosListing.id, img.id, file);
                              e.target.value = '';
                            }}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => handleDeletePhoto(managingPhotosListing.id, img.id)}
                          className="p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition"
                          title={lang === 'en' ? 'Delete photo' : 'നീക്കം ചെയ്യുക'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      {img.is_primary && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#5B6147]/90 text-white text-[9px] text-center font-bold py-0.5">
                          {lang === 'en' ? 'Primary' : 'പ്രധാനം'}
                        </span>
                      )}
                    </div>
                  ))}

                {(!Array.isArray(managingPhotosListing.images) || managingPhotosListing.images.length < 8) && (
                  <label className="aspect-square rounded-2xl border-2 border-dashed border-[#8E7F6B]/40 hover:border-[#5B6147] flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-[#E7E1D6]/30 transition group">
                    <Camera className="w-6 h-6 text-[#8E7F6B] group-hover:text-[#5B6147] transition" />
                    <span className="text-[10px] font-semibold text-stone-500 mt-1">
                      {isUploadingPhoto
                        ? (lang === 'en' ? 'Uploading...' : 'അപ്‌ലോഡ്...')
                        : (lang === 'en' ? 'Add Photo' : 'ചേർക്കുക')}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isUploadingPhoto}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadSinglePhoto(managingPhotosListing.id, file);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-stone-500 pt-2 border-t border-stone-200">
                <span>
                  {lang === 'en'
                    ? `${Array.isArray(managingPhotosListing.images) ? managingPhotosListing.images.length : 0} of 8 photos uploaded`
                    : `8 ൽ ${Array.isArray(managingPhotosListing.images) ? managingPhotosListing.images.length : 0} ഫോട്ടോകൾ`}
                </span>
                <button
                  onClick={() => setManagingPhotosListing(null)}
                  className="px-4 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition"
                >
                  {lang === 'en' ? 'Done' : 'ശരി'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
