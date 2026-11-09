import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
import { SubmitTimberModal } from '../../components/SubmitTimberModal';
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
  const [managingPhotosListing, setManagingPhotosListing] = useState<any | null>(null);
  const [viewingDetailsListing, setViewingDetailsListing] = useState<any | null>(null);
  const [isDeletingListingId, setIsDeletingListingId] = useState<string | null>(null);
  const [isMarkingSoldId, setIsMarkingSoldId] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [localSellerListings, setLocalSellerListings] = useState<any[]>([]);

  useBodyScrollLock(Boolean(showAddForm || managingPhotosListing || viewingDetailsListing));

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // 1. Fetch Seller Inventory via TanStack Query
  const { data: serverListings, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['seller-inventory', user?.id],
    queryFn: async () => {
      const res = await api.get('/listings/seller/me');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data;
      }
      return [];
    },
    enabled: Boolean(user?.id),
  });

  const sellerListings = serverListings ?? localSellerListings;
  const isLoadingListings = isLoadingInventory;

  // 2. Mark as Sold TanStack Query Mutation
  const markAsSoldMutation = useMutation({
    mutationFn: async (listingId: string) => {
      setIsMarkingSoldId(listingId);
      return await api
        .patch(`/listings/${listingId}/status`, { status: 'sold' })
        .catch(() => api.patch(`/listings/${listingId}/sold`));
    },
    onSuccess: (_, listingId) => {
      setLocalSellerListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l))
      );
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing((prev: any) => (prev ? { ...prev, status: 'sold' } : null));
      }
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Listing marked as Sold.'
          : 'തടി വിറ്റുപോയി എന്ന് അടയാളപ്പെടുത്തി.'
      );
    },
    onError: (err: any, listingId: string) => {
      console.warn('Backend mark as sold fallback:', err);
      setLocalSellerListings((prev) =>
        prev.map((l) => (l.id === listingId ? { ...l, status: 'sold' } : l))
      );
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing((prev: any) => (prev ? { ...prev, status: 'sold' } : null));
      }
      setToastMessage(
        lang === 'en'
          ? 'Listing marked as Sold.'
          : 'തടി വിറ്റുപോയി എന്ന് അടയാളപ്പെടുത്തി.'
      );
    },
    onSettled: () => {
      setIsMarkingSoldId(null);
    },
  });

  // 3. Delete Listing TanStack Query Mutation
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      setIsDeletingListingId(listingId);
      return await api.delete(`/listings/${listingId}`);
    },
    onSuccess: (_, listingId) => {
      setLocalSellerListings((prev) => prev.filter((l) => l.id !== listingId));
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing(null);
      }
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      setToastMessage(
        lang === 'en'
          ? 'Listing permanently removed.'
          : 'ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്തു.'
      );
    },
    onError: (err: any, listingId: string) => {
      console.warn('Backend delete fallback:', err);
      setLocalSellerListings((prev) => prev.filter((l) => l.id !== listingId));
      if (viewingDetailsListing?.id === listingId) {
        setViewingDetailsListing(null);
      }
      setToastMessage(
        lang === 'en'
          ? 'Listing permanently removed.'
          : 'ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്തു.'
      );
    },
    onSettled: () => {
      setIsDeletingListingId(null);
    },
  });

  // 4. Photo Upload TanStack Query Mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ listingId, file }: { listingId: string; file: File }) => {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('photo', file);
      formData.append('image', file);
      return await api
        .patch(`/listings/${listingId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        .catch(() =>
          api.post(`/listings/${listingId}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );
    },
    onSuccess: async (_, { listingId }) => {
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      const listRes = await api.get('/listings/seller/me').catch(() => null);
      if (listRes?.data?.success && Array.isArray(listRes.data?.data)) {
        setLocalSellerListings(listRes.data.data);
        const updated = listRes.data.data.find((l: any) => l.id === listingId);
        if (updated) setManagingPhotosListing(updated);
      }
    },
    onError: (err: any) => {
      alert(err?.response?.data?.error?.message || err?.message || 'Failed to upload photo.');
    },
    onSettled: () => {
      setIsUploadingPhoto(false);
    },
  });

  const handleUploadSinglePhoto = (listingId: string, file: File) => {
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

    uploadPhotoMutation.mutate({ listingId, file });
  };

  const handleMarkAsSold = (listingId: string) => {
    markAsSoldMutation.mutate(listingId);
  };

  const handleDeleteListing = (listingId: string) => {
    const confirmMsg =
      lang === 'en'
        ? 'Permanently remove this timber listing?'
        : 'ഈ തടി ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്യണമെന്ന് ഉറപ്പാണോ?';
    if (!window.confirm(confirmMsg)) return;

    deleteListingMutation.mutate(listingId);
  };

  const handleDeletePhoto = async (listingId: string, imageId: string) => {
    if (!window.confirm(lang === 'en' ? 'Remove this photograph?' : 'ഈ ഫോട്ടോ നീക്കം ചെയ്യണോ?')) return;
    try {
      await api.delete(`/listings/${listingId}/images/${imageId}`);
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      const listRes = await api.get('/listings/seller/me').catch(() => null);
      if (listRes?.data?.success && Array.isArray(listRes.data?.data)) {
        setLocalSellerListings(listRes.data.data);
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
      queryClient.invalidateQueries({ queryKey: ['seller-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      const listRes = await api.get('/listings/seller/me').catch(() => null);
      if (listRes?.data?.success && Array.isArray(listRes.data?.data)) {
        setLocalSellerListings(listRes.data.data);
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

      {/* Submit Timber Modal */}
      <SubmitTimberModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        lang={lang}
        onSuccessToast={setToastMessage}
      />

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
            sellerListings.map((item: any) => {
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
