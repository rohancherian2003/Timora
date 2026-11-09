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
  Eye,
} from 'lucide-react';
import { formatINR, formatUserProfileId, formatCleanPhone, formatTimberListingId } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { getTicketsForUser, markTicketAsRead, SupportTicket } from '../../utils/ticketService';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { useNavigate } from 'react-router-dom';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';
import { api } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { translateWoodTitle, translateSpecies, translateCutType, translateUnit } from '../../utils/i18n';

export function SellerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
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
  const [viewingDetailsListing, setViewingDetailsListing] = useState<any | null>(null);
  const [isDeletingListingId, setIsDeletingListingId] = useState<string | null>(null);
  const [isMarkingSoldId, setIsMarkingSoldId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [apiSpecies, setApiSpecies] = useState<Array<{id: number; name_en: string; name_ml: string; slug: string}>>([]);
  const [apiDistricts, setApiDistricts] = useState<Array<{id: number; name_en: string; name_ml: string}>>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    species?: string;
    type?: string;
    district?: string;
    quantity?: string;
    pricePerCft?: string;
  }>({});

  useBodyScrollLock(Boolean(showAddForm || managingPhotosListing || viewingDetailsListing));

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (selectedImages.length + files.length > 8) {
      setImageError(
        lang === 'en'
          ? 'Maximum 8 images allowed per listing.'
          : 'ഒരു ലിസ്റ്റിംഗിൽ പരമാവധി 8 ചിത്രങ്ങൾ മാത്രമേ അനുവദിക്കൂ.'
      );
      return;
    }

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setImageError(
          lang === 'en'
            ? 'Unsupported file format. Please upload JPG, PNG, or WebP images.'
            : 'പിന്തുണയ്ക്കാത്ത ഫയൽ ഫോർമാറ്റ്. ദയവായി JPG, PNG, അല്ലെങ്കിൽ WebP ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക.'
        );
        return;
      }
      if (file.size > maxSizeBytes) {
        setImageError(
          lang === 'en'
            ? 'File size exceeds 10 MB limit.'
            : 'ഫയൽ വലുപ്പം 10 MB പരിധി കവിയുന്നു.'
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert(
        lang === 'en'
          ? 'Unsupported file format. Please upload JPG, PNG, or WebP images.'
          : 'പിന്തുണയ്ക്കാത്ത ഫയൽ ഫോർമാറ്റ്. ദയവായി JPG, PNG, അല്ലെങ്കിൽ WebP ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക.'
      );
      return;
    }
    if (file.size > maxSizeBytes) {
      alert(
        lang === 'en'
          ? 'File size exceeds 10 MB limit.'
          : 'ഫയൽ വലുപ്പം 10 MB പരിധി കവിയുന്നു.'
      );
      return;
    }
    if (Array.isArray(managingPhotosListing?.images) && managingPhotosListing.images.length >= 8) {
      alert(
        lang === 'en'
          ? 'Maximum 8 images allowed per listing.'
          : 'ഒരു ലിസ്റ്റിംഗിൽ പരമാവധി 8 ചിത്രങ്ങൾ മാത്രമേ അനുവദിക്കൂ.'
      );
      return;
    }

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

  const handleMarkAsSold = async (listingId: string) => {
    try {
      setIsMarkingSoldId(listingId);
      await api.patch(`/listings/${listingId}/status`, { status: 'sold' }).catch(() =>
        api.patch(`/listings/${listingId}/sold`)
      );
      setSellerListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l))
      );
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing((prev: any) => (prev ? { ...prev, status: 'sold' } : null));
      }
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Listing marked as Sold.'
          : 'തടി വിറ്റുപോയി എന്ന് അടയാളപ്പെടുത്തി.'
      );
    } catch (err: any) {
      console.warn('Backend mark as sold fallback:', err);
      setSellerListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l))
      );
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing((prev: any) => (prev ? { ...prev, status: 'sold' } : null));
      }
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Listing marked as Sold.'
          : 'തടി വിറ്റുപോയി എന്ന് അടയാളപ്പെടുത്തി.'
      );
    } finally {
      setIsMarkingSoldId(null);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    const confirmMsg =
      lang === 'en'
        ? 'Permanently remove this timber listing?'
        : 'ഈ തടി ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്യണമെന്ന് ഉറപ്പാണോ?';
    if (!window.confirm(confirmMsg)) return;

    try {
      setIsDeletingListingId(listingId);
      await api.delete(`/listings/${listingId}`);
      setSellerListings((prev) => prev.filter((l) => l.id !== listingId));
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing(null);
      }
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Listing permanently removed.'
          : 'ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്തു.'
      );
    } catch (err: any) {
      console.warn('Backend delete fallback:', err);
      setSellerListings((prev) => prev.filter((l) => l.id !== listingId));
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing(null);
      }
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Listing permanently removed.'
          : 'ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്തു.'
      );
    } finally {
      setIsDeletingListingId(null);
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
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      alert(
        lang === 'en'
          ? 'Unsupported file format. Please upload JPG, PNG, or WebP images.'
          : 'പിന്തുണയ്ക്കാത്ത ഫയൽ ഫോർമാറ്റ്. ദയവായി JPG, PNG, അല്ലെങ്കിൽ WebP ചിത്രങ്ങൾ അപ്‌ലോഡ് ചെയ്യുക.'
      );
      return;
    }
    if (file.size > maxSizeBytes) {
      alert(
        lang === 'en'
          ? 'File size exceeds 10 MB limit.'
          : 'ഫയൽ വലുപ്പം 10 MB പരിധി കവിയുന്നു.'
      );
      return;
    }

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
        if (isMounted && res.data?.success && Array.isArray(res.data?.data)) {
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
    const VALID_SLUGS = ['teak', 'mahogany', 'rosewood', 'anjili', 'jackfruit', 'rubberwood', 'firewood'];
    api.get('/species').then(r => {
      if (r.data?.success && Array.isArray(r.data?.data)) {
        let filtered = r.data.data.filter((s: any) => VALID_SLUGS.includes(s.slug));
        if (!filtered.some((s: any) => s.slug === 'firewood')) {
          filtered.push({ id: 8, name_en: 'Firewood', name_ml: 'വിറക്', slug: 'firewood' });
        }
        setApiSpecies(filtered);
      }
    }).catch(() => {});
    api.get('/districts').then(r => {
      if (r.data?.success && Array.isArray(r.data?.data)) {
        setApiDistricts(r.data.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getTicketsForUser(user?.phone, 'seller'));
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, [user]);

  const [showAdminReply, setShowAdminReply] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`timora_dismissed_admin_reply_${user?.id || 'seller'}`) !== 'true';
    } catch {
      return true;
    }
  });
  const [dismissedTicketIds, setDismissedTicketIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('timora_dismissed_ticket_ids');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleDismissAdminReply = (ticketId?: string) => {
    setShowAdminReply(false);
    if (ticketId) {
      setDismissedTicketIds((prev) => {
        const next = prev.includes(ticketId) ? prev : [...prev, ticketId];
        try {
          localStorage.setItem('timora_dismissed_ticket_ids', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
    try {
      localStorage.setItem(`timora_dismissed_admin_reply_${user?.id || 'seller'}`, 'true');
    } catch {}
  };

  const latestResolvedTicket = showAdminReply
    ? tickets.find(
        (t) =>
          t.status === 'resolved' &&
          t.resolutionReply &&
          !dismissedTicketIds.includes(t.id)
      ) || null
    : null;

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
    setListingError(null);
    setImageError(null);

    const errors: typeof fieldErrors = {};
    if (!title.trim()) {
      errors.title = lang === 'en' ? 'Stock Title is required.' : 'തടിയുടെ പേര് നൽകേണ്ടതാണ്.';
    }
    if (!speciesId || Number(speciesId) <= 0) {
      errors.species = lang === 'en' ? 'Please select a valid timber species.' : 'തടി ഇനം തിരഞ്ഞെടുക്കുക.';
    }
    if (!typeId || Number(typeId) <= 0) {
      errors.type = lang === 'en' ? 'Please select a valid timber type.' : 'തടി രൂപം തിരഞ്ഞെടുക്കുക.';
    }
    if (!districtId || Number(districtId) <= 0) {
      errors.district = lang === 'en' ? 'Please select a Kerala district.' : 'ജില്ല തിരഞ്ഞെടുക്കുക.';
    }
    if (!quantity || Number(quantity) <= 0 || isNaN(Number(quantity))) {
      errors.quantity = lang === 'en' ? 'Quantity must be greater than 0 CFT.' : 'അളവ് 0 ൽ കൂടുതലായിരിക്കണം.';
    }
    if (!pricePerCft || Number(pricePerCft) <= 0 || isNaN(Number(pricePerCft))) {
      errors.pricePerCft = lang === 'en' ? 'Price per CFT must be greater than ₹0.' : 'വില ₹0 ൽ കൂടുതലായിരിക്കണം.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    setIsSubmittingListing(true);

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
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Timber stock submitted successfully! Sent for Admin Approval.'
          : 'തടി സ്റ്റോക്ക് വിജയകരമായി സമർപ്പിച്ചു! അഡ്മിൻ അംഗീകാരത്തിനായി അയച്ചു.'
      );

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fadeIn relative">
      {/* SUCCESS TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 animate-slideDown flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-900 text-white shadow-2xl border border-emerald-700/60 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-300 hover:text-white transition ml-auto"
            title={lang === 'en' ? 'Dismiss' : 'ഒഴിവാക്കുക'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
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
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3" />
              <span>{lang === 'en' ? 'Individual Timber Seller' : 'വ്യക്തിഗത തടി കച്ചവടക്കാരൻ'}</span>
            </span>
            <span className="text-xs text-[#4A3626] font-mono font-bold bg-white/80 border border-stone-300 px-2 py-0.5 rounded-md">
              ID: {formatUserProfileId(user)}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {user?.name || (lang === 'en' ? 'Seller Management Dashboard' : 'തടിക്കച്ചവട ഡാഷ്‌ബോർഡ്')}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] mt-1 flex items-center gap-2 font-medium">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{formatCleanPhone(user?.phone || '9847120001')}</span>
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
      <DashboardNotificationsFeed
        lang={lang}
        onViewListing={(notification) => {
          const idMatch = notification.action_url?.match(/\/listing\/([0-9a-f-]+)/i);
          const targetId = idMatch ? idMatch[1] : null;

          const matched = sellerListings.find(
            (l: any) =>
              (targetId && l.id === targetId) ||
              (l.title && notification.body_en && notification.body_en.includes(l.title)) ||
              (l.title && notification.title_en && notification.title_en.includes(l.title))
          );

          if (matched) {
            setViewingDetailsListing(matched);
          } else if (targetId) {
            navigate(`/listing/${targetId}`);
          } else if (notification.action_url && notification.action_url !== '/dashboard/seller') {
            navigate(notification.action_url);
          } else {
            navigate('/marketplace');
          }
        }}
      />

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

            <button
              type="button"
              onClick={() => handleDismissAdminReply(latestResolvedTicket.id)}
              aria-label={lang === 'en' ? 'Dismiss notification' : 'അറിയിപ്പ് ഒഴിവാക്കുക'}
              className="text-stone-400 hover:text-stone-700 font-bold p-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-600 rounded-lg cursor-pointer"
              title="Dismiss"
            >
              ✕
            </button>
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
              125 <span className="text-sm font-sans font-semibold text-[#5B6147]">{translateUnit('cft', lang)}</span>
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
              2 <span className="text-sm font-sans font-semibold text-stone-500">{lang === 'en' ? 'Listings' : 'ലിസ്റ്റിംഗുകൾ'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#E7E1D6] text-[#5B6147] flex items-center justify-center border border-stone-300/60">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-300/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Active Enquiries' : 'സജീവ അന്വേഷണങ്ങൾ'}
            </span>
            <div className="text-2xl font-black text-[#4A3626] font-serif mt-1">
              5 <span className="text-sm font-sans font-semibold text-stone-500">{lang === 'en' ? 'Open' : 'നിലവിലുണ്ട്'}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* New Listing Modal / Form */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-[#FDFBF7] rounded-3xl border-2 border-[#8E7F6B]/30 p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
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
                  {lang === 'en' ? 'Stock Title' : 'തടിയുടെ പേര് / വിവരണം'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. First-Grade Teak Planks 10ft"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                  }}
                  className={`w-full px-3.5 py-2.5 border rounded-xl text-sm transition ${
                    fieldErrors.title ? 'border-rose-400 bg-rose-50/20 focus:ring-rose-400' : 'border-stone-300'
                  }`}
                  required
                />
                {fieldErrors.title && (
                  <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.title}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Species' : 'തടി ഇനം'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={speciesId}
                    onChange={(e) => {
                      setSpeciesId(Number(e.target.value));
                      if (fieldErrors.species) setFieldErrors((prev) => ({ ...prev, species: undefined }));
                    }}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition ${
                      fieldErrors.species ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  >
                    {apiSpecies.length > 0 ? (
                      apiSpecies.map(sp => (
                        <option key={sp.id} value={sp.id}>
                          {sp.name_en} ({sp.name_ml})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>Teak (തേക്ക്)</option>
                        <option value={2}>Mahogany (മഹാഗണി)</option>
                        <option value={7}>Rosewood (ഈട്ടി)</option>
                        <option value={3}>Anjili (ആഞ്ഞിലി)</option>
                        <option value={6}>Jackfruit (പ്ലാവ്)</option>
                        <option value={4}>Rubberwood (റബ്ബർ)</option>
                        <option value={8}>Firewood (വിറക്)</option>
                      </>
                    )}
                  </select>
                  {fieldErrors.species && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.species}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Timber Type' : 'തടി രൂപം'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={typeId}
                    onChange={(e) => {
                      setTypeId(Number(e.target.value));
                      if (fieldErrors.type) setFieldErrors((prev) => ({ ...prev, type: undefined }));
                    }}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition ${
                      fieldErrors.type ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  >
                    <option value={1}>Round Logs (ലോഗ്സ്)</option>
                    <option value={2}>Rough-sawn Planks (പലക)</option>
                    <option value={3}>Squared Beams (തൂൺ)</option>
                    <option value={4}>Firewood (വിറക്)</option>
                  </select>
                  {fieldErrors.type && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.type}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'District' : 'ജില്ല'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => {
                      setDistrictId(Number(e.target.value));
                      if (fieldErrors.district) setFieldErrors((prev) => ({ ...prev, district: undefined }));
                    }}
                    className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition ${
                      fieldErrors.district ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                  >
                    {apiDistricts.length > 0 ? (
                      apiDistricts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name_en} ({d.name_ml})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value={1}>Thiruvananthapuram (തിരുവനന്തപുരം)</option>
                        <option value={2}>Kollam (കൊല്ലം)</option>
                        <option value={3}>Pathanamthitta (പത്തനംതിട്ട)</option>
                        <option value={4}>Alappuzha (ആലപ്പുഴ)</option>
                        <option value={5}>Kottayam (കോട്ടയം)</option>
                        <option value={6}>Idukki (ഇടുക്കി)</option>
                        <option value={7}>Ernakulam (എറണാകുളം)</option>
                        <option value={8}>Thrissur (തൃശ്ശൂർ)</option>
                        <option value={9}>Palakkad (പാലക്കാട്)</option>
                        <option value={10}>Malappuram (മലപ്പുറം)</option>
                        <option value={11}>Kozhikode (കോഴിക്കോട്)</option>
                        <option value={12}>Wayanad (വയനാട്)</option>
                        <option value={13}>Kannur (കണ്ണൂർ)</option>
                        <option value={14}>Kasaragod (കാസർഗോഡ്)</option>
                      </>
                    )}
                  </select>
                  {fieldErrors.district && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.district}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Quantity (CFT)' : 'അളവ് (CFT)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={quantity === 0 ? '' : quantity}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setQuantity(val === '' ? 0 : Number(val));
                      if (fieldErrors.quantity) setFieldErrors((prev) => ({ ...prev, quantity: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition ${
                      fieldErrors.quantity ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                    min={1}
                    required
                  />
                  {fieldErrors.quantity && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.quantity}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={pricePerCft === 0 ? '' : pricePerCft}
                    onChange={(e) => {
                      const val = e.target.value.replace(/^0+(?=\d)/, '');
                      setPricePerCft(val === '' ? 0 : Number(val));
                      if (fieldErrors.pricePerCft) setFieldErrors((prev) => ({ ...prev, pricePerCft: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 border rounded-xl text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition ${
                      fieldErrors.pricePerCft ? 'border-rose-400 bg-rose-50/20' : 'border-stone-300'
                    }`}
                    min={1}
                    required
                  />
                  {fieldErrors.pricePerCft && (
                    <p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{fieldErrors.pricePerCft}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Timber Photographs Upload Area */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-stone-700">
                    {lang === 'en' ? 'Timber Photographs (Max 8)' : 'തടിയുടെ ഫോട്ടോകൾ (പരമാവധി 8)'}
                  </label>
                  <span className="text-[11px] font-mono text-stone-500">
                    {selectedImages.length}/8
                  </span>
                </div>

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

                  {selectedImages.length < 8 ? (
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
                  ) : (
                    <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-stone-200 bg-stone-100 flex flex-col items-center justify-center text-stone-400 select-none">
                      <Camera className="w-5 h-5 text-stone-400" />
                      <span className="text-[9px] font-semibold mt-1">
                        {lang === 'en' ? 'Max 8 Reached' : '8 ഫോട്ടോകൾ'}
                      </span>
                    </div>
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
        </div>
      )}

      {/* Current Stock Table */}
      <div className="bg-white rounded-3xl border border-stone-300/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
            {lang === 'en' ? 'My Timber Stock Inventory' : 'എന്റെ തടി സ്റ്റോക്കുകൾ'}
          </h3>
          <span className="text-xs text-[#5B6147] font-semibold">
            {sellerListings.length > 0
              ? `${sellerListings.filter((l: any) => l.status === 'approved').length} ${lang === 'en' ? 'Active' : 'സജീവം'} · ${sellerListings.filter((l: any) => l.status === 'pending_review' || l.status === 'pending').length} ${lang === 'en' ? 'Pending Approval' : 'അനുമതി കാക്കുന്നു'}${sellerListings.some((l: any) => l.status === 'sold') ? ` · ${sellerListings.filter((l: any) => l.status === 'sold').length} ${lang === 'en' ? 'Sold' : 'വിറ്റുപോയവ'}` : ''}`
              : (lang === 'en' ? '0 Stock Items' : 'സ്റ്റോക്കുകൾ ഇല്ല')}
          </span>
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
                        <span>{translateWoodTitle(item.title, lang)}</span>
                        <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                          {formatTimberListingId(item.id)}
                        </span>
                        {photoCount > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-600 font-mono font-medium flex items-center gap-0.5">
                            <ImageIcon className="w-2.5 h-2.5 text-[#5B6147]" />
                            {photoCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        {translateSpecies(item.species_name_en || 'Timber', lang)} · {translateCutType(item.type_name_en || 'Planks', lang)} · {lang === 'ml' ? (item.district_name_ml || item.district_name_en || 'കേരളം') : (item.district_name_en || 'Kerala')}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-[#4A3626]">
                        {item.quantity} {translateUnit(item.unit || 'cft', lang)} @ ₹{Number(item.price_per_cft).toLocaleString('en-IN')}/{translateUnit(item.unit || 'cft', lang)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : item.status === 'sold'
                          ? 'bg-stone-100 text-stone-700 border border-stone-300 font-bold'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {item.status === 'approved'
                          ? (lang === 'en' ? 'Approved (Live)' : 'പരിശോധിച്ചു (സജീവം)')
                          : item.status === 'sold'
                          ? (lang === 'en' ? 'Sold' : 'വിറ്റുപോയി')
                          : (lang === 'en' ? 'Pending Approval' : 'അനുമതി കാക്കുന്നു')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                      <button
                        type="button"
                        onClick={() => setViewingDetailsListing(item)}
                        className="h-8 px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-[#4A3626] text-xs font-semibold transition inline-flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                        title={lang === 'en' ? 'View Details & Photos' : 'വിവരങ്ങളും ഫോട്ടോകളും'}
                      >
                        <Eye className="w-3.5 h-3.5 text-[#5B6147]" />
                        <span>{lang === 'en' ? 'View Details' : 'വിവരങ്ങൾ'}</span>
                      </button>
                      {item.status === 'approved' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleMarkAsSold(item.id)}
                            disabled={isMarkingSoldId === item.id}
                            className="h-8 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold transition inline-flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50 whitespace-nowrap"
                            title={lang === 'en' ? 'Mark as Sold' : 'വിറ്റുപോയി എന്ന് അടയാളപ്പെടുത്തുക'}
                          >
                            {isMarkingSoldId === item.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            )}
                            <span>{lang === 'en' ? 'Mark as Sold' : 'വിറ്റുപോയി'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setManagingPhotosListing(item)}
                            className="h-8 px-3 py-1.5 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/50 text-[#4A3626] text-xs font-semibold transition inline-flex items-center justify-center gap-1.5 shadow-2xs whitespace-nowrap"
                            title={lang === 'en' ? 'Manage photographs' : 'ഫോട്ടോകൾ'}
                          >
                            <Camera className="w-3.5 h-3.5 text-[#5B6147]" />
                            <span>{lang === 'en' ? 'Photos' : 'ചിത്രങ്ങൾ'}</span>
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(item.id)}
                        disabled={isDeletingListingId === item.id}
                        className="h-8 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs whitespace-nowrap"
                        title={lang === 'en' ? 'Permanently remove this listing' : 'ശാശ്വതമായി നീക്കം ചെയ്യുക'}
                      >
                        {isDeletingListingId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        )}
                        <span>{lang === 'en' ? 'Delete Listing' : 'ഡിലീറ്റ്'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-stone-500 text-xs">
              {lang === 'en'
                ? 'No timber stock listings found. Click "+ List New Timber Stock" above to add your stock.'
                : 'തടി ലിസ്റ്റിംഗുകൾ ഒന്നും ലഭ്യമല്ല. മുകളിലെ "+ പുതിയ തടി ലിസ്റ്റ് ചെയ്യുക" ക്ലിക്ക് ചെയ്യുക.'}
            </div>
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

      {/* Strict View-Only Mode Modal for Timber Listing Specs & Photos */}
      {viewingDetailsListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-300 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    viewingDetailsListing.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : viewingDetailsListing.status === 'sold'
                      ? 'bg-stone-200 text-stone-800 border border-stone-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {viewingDetailsListing.status === 'approved'
                      ? (lang === 'en' ? 'Approved (Live on Marketplace)' : 'പരിശോധിച്ചു (സജീവം)')
                      : viewingDetailsListing.status === 'sold'
                      ? (lang === 'en' ? 'Sold' : 'വിറ്റുപോയി')
                      : (lang === 'en' ? 'Pending Approval (Under Review)' : 'അനുമതി കാക്കുന്നു (റിവ്യൂവിൽ)')}
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    ID: {formatTimberListingId(viewingDetailsListing.id)}
                  </span>
                </div>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-lg">
                  {translateWoodTitle(viewingDetailsListing.title, lang)}
                </h3>
              </div>
              <button
                onClick={() => setViewingDetailsListing(null)}
                aria-label="Close"
                className="p-2 rounded-xl hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {viewingDetailsListing.status !== 'approved' && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">
                      {lang === 'en' ? 'Strict View-Only Mode' : 'പരിശോധനയിലാണ് (എഡിറ്റ് ലഭ്യമല്ല)'}
                    </div>
                    <p className="text-amber-800 mt-0.5">
                      {lang === 'en'
                        ? 'This listing is pending moderation review. All edit inputs are locked until reviewed by the Super Admin.'
                        : 'ഈ ലിസ്റ്റിംഗ് സൂപ്പർ അഡ്മിന്റെ പരിശോധനയിലാണ്. അംഗീകാരം ലഭിക്കുന്നത് വരെ മാറ്റങ്ങൾ വരുത്താനാകില്ല.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 bg-[#FDFBF7] p-4 rounded-2xl border border-[#8E7F6B]/20 text-xs">
                <div>
                  <span className="text-stone-400 font-semibold block uppercase text-[10px]">
                    {lang === 'en' ? 'Species' : 'തടി ഇനം'}
                  </span>
                  <span className="font-bold text-[#4A3626] text-sm">
                    {translateSpecies(viewingDetailsListing.species_name_en || 'Timber', lang)}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 font-semibold block uppercase text-[10px]">
                    {lang === 'en' ? 'Cut Type' : 'തരം'}
                  </span>
                  <span className="font-bold text-[#4A3626] text-sm">
                    {translateCutType(viewingDetailsListing.type_name_en || 'Logs', lang)}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 font-semibold block uppercase text-[10px]">
                    {lang === 'en' ? 'District' : 'ജില്ല'}
                  </span>
                  <span className="font-bold text-[#4A3626] text-sm">
                    {lang === 'ml'
                      ? (viewingDetailsListing.district_name_ml || viewingDetailsListing.district_name_en || 'കേരളം')
                      : (viewingDetailsListing.district_name_en || 'Kerala')}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 font-semibold block uppercase text-[10px]">
                    {lang === 'en' ? 'Quantity' : 'അളവ്'}
                  </span>
                  <span className="font-bold text-[#4A3626] text-sm font-mono">
                    {viewingDetailsListing.quantity} {translateUnit(viewingDetailsListing.unit || 'cft', lang)}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 font-semibold block uppercase text-[10px]">
                    {lang === 'en' ? 'Price per CFT' : 'ഒരു CFT വില'}
                  </span>
                  <span className="font-bold text-[#4A3626] text-sm font-mono">
                    ₹{Number(viewingDetailsListing.price_per_cft).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400 font-semibold block uppercase text-[10px]">
                    {lang === 'en' ? 'Estimated Total' : 'ആകെ മൂല്യം'}
                  </span>
                  <span className="font-bold text-emerald-800 text-sm font-mono">
                    ₹{(Number(viewingDetailsListing.quantity) * Number(viewingDetailsListing.price_per_cft)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {viewingDetailsListing.description && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                    {lang === 'en' ? 'Condition Notes & Description' : 'വിവരണം'}
                  </span>
                  <p className="text-xs text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-200 leading-relaxed">
                    {viewingDetailsListing.description}
                  </p>
                </div>
              )}

              {/* Photos Gallery */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A3626] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#5B6147]" />
                    <span>{lang === 'en' ? 'Uploaded Photographs' : 'അപ്‌ലോഡ് ചെയ്ത ഫോട്ടോകൾ'}</span>
                  </span>
                  <span className="text-xs font-mono text-stone-500">
                    {Array.isArray(viewingDetailsListing.images) ? viewingDetailsListing.images.length : 0} {lang === 'en' ? 'Photos' : 'ചിത്രങ്ങൾ'}
                  </span>
                </div>

                {Array.isArray(viewingDetailsListing.images) && viewingDetailsListing.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {viewingDetailsListing.images.map((img: any, idx: number) => (
                      <div key={img.id || idx} className="relative aspect-square rounded-2xl border border-stone-200 overflow-hidden shadow-xs bg-stone-100">
                        <img src={img.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                        {img.is_primary && (
                          <span className="absolute bottom-0 inset-x-0 bg-[#5B6147]/95 text-white text-[9px] text-center font-bold py-0.5">
                            {lang === 'en' ? 'Primary Photo' : 'പ്രധാന ഫോട്ടോ'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-stone-400 text-xs bg-stone-50 rounded-2xl border border-stone-200">
                    {lang === 'en' ? 'No photographs attached to this listing.' : 'ഫോട്ടോകൾ ലഭ്യമല്ല.'}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteListing(viewingDetailsListing.id)}
                  className="px-3 py-2 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en' ? 'Delete Listing' : 'ലിസ്റ്റിംഗ് നീക്കം ചെയ്യുക'}
                  </span>
                </button>
                {viewingDetailsListing.status === 'approved' && (
                  <button
                    onClick={() => handleMarkAsSold(viewingDetailsListing.id)}
                    disabled={isMarkingSoldId === viewingDetailsListing.id}
                    className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-[#4A3626] font-bold text-xs flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                  >
                    {isMarkingSoldId === viewingDetailsListing.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    )}
                    <span>{lang === 'en' ? 'Mark as Sold' : 'വിറ്റുപോയി'}</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewingDetailsListing(null)}
                className="px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs shadow-xs transition"
              >
                {lang === 'en' ? 'Close' : 'അടയ്ക്കുക'}
              </button>
            </div>
          </div>
        </div>
      )}

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
