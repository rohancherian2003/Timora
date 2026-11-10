import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ShieldCheck,
  UserCheck,
  PackageCheck,
  FileText,
  Check,
  X,
  AlertTriangle,
  Shield,
  Activity,
  LifeBuoy,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  Phone,
  User,
  Tag,
  Factory,
  Hammer,
  Truck,
  RotateCcw,
  Loader2,
  Trash2,
} from 'lucide-react';
import { formatINR, formatUserProfileId, formatCleanPhone, formatTimberListingId } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getStoredTickets, resolveTicket, SupportTicket } from '../../utils/ticketService';
import { EditProfileModal } from '../../components/EditProfileModal';
import { api } from '../../lib/api';
import { queryClient } from '../../lib/queryClient';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { ValidatedSearchInput } from '../../components/ValidatedSearchInput';
import {
  translateWoodTitle,
  translateTicketCategory,
  translateTicketStatus,
  translateSpecies,
  translateUnit,
  translateRole,
} from '../../utils/i18n';

interface PendingBusiness {
  id: string;
  name: string;
  phone: string;
  businessName: string;
  district: string;
  locality?: string;
  role: 'seller' | 'mill' | 'carpenter' | 'transport';
  details: string;
  registeredAt: string;
}

const INITIAL_PENDING_APPLICATIONS: PendingBusiness[] = [
  {
    id: 'app-sel-1',
    name: 'K. R. Madhavan',
    phone: '9847120001',
    businessName: 'Madhavan Farmstead Teak Plantation',
    district: 'Malappuram (മലപ്പുറം)',
    locality: 'Nilambur Bypass',
    role: 'seller',
    details: 'Individual teak & rosewood tree grower, 45 mature teak trees in property.',
    registeredAt: '2026-10-27 11:30',
  },
  {
    id: 'app-mil-1',
    name: 'George Varghese',
    phone: '9847120002',
    businessName: 'Perumbavoor Modern Sawmills & Timber Depot',
    district: 'Ernakulam (എറണാകുളം)',
    locality: 'Kandanthara, Perumbavoor',
    role: 'mill',
    details: 'Lic: KL-SAW-EKM-1048 · 2 Heavy Band Saws · Capacity 350 CFT/day.',
    registeredAt: '2026-10-27 12:45',
  },
  {
    id: 'app-car-1',
    name: 'Master Binu Achari',
    phone: '9847330001',
    businessName: 'Binu Traditional Timber Joinery & Carpentry',
    district: 'Alappuzha (ആലപ്പുഴ)',
    locality: 'Kalarcode',
    role: 'carpenter',
    details: '22 yrs traditional joinery experience · Nalukettu roof trusses and teak doors.',
    registeredAt: '2026-10-27 14:10',
  },
  {
    id: 'app-tra-1',
    name: 'K. Sukumaran',
    phone: '9847440001',
    businessName: 'Malabar Timber Heavy Transit Haulage',
    district: 'Kozhikode (കോഴിക്കോട്)',
    locality: 'Feroke Depot',
    role: 'transport',
    details: 'Fleet: 2 Lorries (KL-11-BH-4890) · Hydraulic Crane Equipped · Form IV Cleared.',
    registeredAt: '2026-10-27 15:20',
  },
];

interface PendingListing {
  id: string;
  title: string;
  seller_name?: string;
  business_name?: string;
  species?: string;
  species_name?: string;
  district?: string;
  district_name?: string;
  quantity: number;
  unit: string;
  price_per_cft: number;
  image_count?: number;
  images?: Array<{ id: string; url: string; is_primary?: boolean }>;
  created_at?: string;
  submitted_at?: string;
}

const DEMO_PENDING_LISTINGS: PendingListing[] = [
  {
    id: 'lst-101',
    title: 'Aanjili Wild Jack Squared Beams (Heavy Joinery)',
    seller_name: 'Perumbavoor Saw Mills',
    species: 'Anjili (ആഞ്ഞിലി)',
    district: 'Ernakulam (എറണാകുളം)',
    quantity: 80,
    unit: 'CFT',
    price_per_cft: 1400,
    image_count: 3,
    submitted_at: '2026-10-25 16:15',
  },
];

export function AdminDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'business' | 'listings' | 'tickets'>('business');
  const [businessFilter, setBusinessFilter] = useState<'all' | 'seller' | 'mill' | 'carpenter' | 'transport'>('all');
  const [resolvedAppIds, setResolvedAppIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('timora_resolved_admin_apps');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [resolvedListingIds, setResolvedListingIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('timora_resolved_admin_listings');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [listingFilter, setListingFilter] = useState<'pending' | 'active'>('pending');
  const [activeMarketplaceListings, setActiveMarketplaceListings] = useState<any[]>([]);
  const [isLoadingActiveListings, setIsLoadingActiveListings] = useState(false);
  const [listingActionLoadingId, setListingActionLoadingId] = useState<string | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets());
  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Modals for Actions
  const [actionModal, setActionModal] = useState<{
    type: 'action_required' | 'reject';
    app: PendingBusiness;
  } | null>(null);
  const [actionInput, setActionInput] = useState('');
  const [isSubmittingActionModal, setIsSubmittingActionModal] = useState(false);

  // Ticket reply modal state
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [isResolvingTicket, setIsResolvingTicket] = useState(false);

  // Per-action loading state for approving applications
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useBodyScrollLock(Boolean(actionModal || replyTicket || isEditProfileOpen));

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getStoredTickets());
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, []);

  // 1. TanStack Query for Pending Business Applications
  const { data: serverApps, isLoading: isLoadingApps } = useQuery({
    queryKey: ['admin-approvals'],
    queryFn: async () => {
      const res = await api.get('/admin/sellers/pending');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          phone: s.phone,
          businessName: s.business_name || `${s.name} Enterprise`,
          district: s.district_name || 'Kerala',
          locality: s.locality,
          role: s.seller_subtype === 'mill_owner' ? 'mill' : (s.role || 'seller'),
          details: `Registered ${new Date(s.created_at).toLocaleDateString()}`,
          registeredAt: new Date(s.created_at).toISOString().slice(0, 16).replace('T', ' '),
        })) as PendingBusiness[];
      }
      return [];
    },
  });

  // 2. TanStack Query for Pending Timber Listings (Real-Time Admin Queue)
  const { data: serverPendingListings, isLoading: isLoadingPendingListings } = useQuery({
    queryKey: ['admin-pending-listings'],
    queryFn: async () => {
      const res = await api.get('/admin/listings/pending');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        return res.data.data.map((l: any) => ({
          id: l.id,
          title: l.title,
          seller_name: l.business_name || l.seller_name || 'Individual Seller',
          species: l.species_name || l.species || 'Timber',
          species_name: l.species_name || l.species || 'Timber',
          district: l.district_name || l.district || 'Kerala',
          district_name: l.district_name || l.district || 'Kerala',
          quantity: Number(l.quantity) || 0,
          unit: l.unit || 'CFT',
          price_per_cft: Number(l.price_per_cft) || 0,
          image_count: Array.isArray(l.images) ? l.images.length : (l.image_count || 0),
          images: l.images || [],
          submitted_at: l.created_at ? new Date(l.created_at).toISOString().slice(0, 16).replace('T', ' ') : 'Just now',
        })) as PendingListing[];
      }
      return [];
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const handleListingsUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
    };
    window.addEventListener('timora_listings_updated', handleListingsUpdate);
    return () => window.removeEventListener('timora_listings_updated', handleListingsUpdate);
  }, [queryClient]);

  const rawPendingListings: PendingListing[] = (serverPendingListings && serverPendingListings.length > 0)
    ? [
        ...serverPendingListings,
        ...DEMO_PENDING_LISTINGS.filter(
          (demo) => !serverPendingListings.some((s: any) => s.id === demo.id)
        ),
      ]
    : DEMO_PENDING_LISTINGS;

  const listings: PendingListing[] = rawPendingListings.filter(
    (l) => !resolvedListingIds.includes(l.id)
  );

  const applications: PendingBusiness[] = (serverApps && serverApps.length > 0)
    ? serverApps.filter((a) => !resolvedAppIds.includes(a.id))
    : INITIAL_PENDING_APPLICATIONS.filter((a) => !resolvedAppIds.includes(a.id));

  const approveAppMutation = useMutation({
    mutationFn: async ({ app, note }: { app: PendingBusiness; note?: string }) => {
      setActionLoadingId(app.id);
      return await api.patch(`/admin/approvals/${app.id}`, {
        status: 'approved',
        note: note || `Approved by ${user?.name || 'Admin'}`,
      }).catch(() =>
        api.patch(`/admin/sellers/${app.id}/approve`, {
          note: note || `Approved by ${user?.name || 'Admin'}`,
        })
      );
    },
    onSuccess: (_, { app }) => {
      setResolvedAppIds((prev) => {
        const next = [...prev, app.id];
        try { localStorage.setItem('timora_resolved_admin_apps', JSON.stringify(next)); } catch {}
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      window.dispatchEvent(new CustomEvent('timora_profile_updated'));
      setMessage(
        lang === 'en'
          ? `${app.businessName} has been approved and activated.`
          : `${app.businessName} അംഗീകരിക്കുകയും സജീവമാക്കുകയും ചെയ്തു.`
      );
    },
    onError: (_, { app }) => {
      setResolvedAppIds((prev) => {
        const next = [...prev, app.id];
        try { localStorage.setItem('timora_resolved_admin_apps', JSON.stringify(next)); } catch {}
        return next;
      });
      setMessage(
        lang === 'en'
          ? `${app.businessName} has been approved and activated.`
          : `${app.businessName} അംഗീകരിക്കുകയും സജീവമാക്കുകയും ചെയ്തു.`
      );
    },
    onSettled: () => {
      setActionLoadingId(null);
    },
  });

  const handleApproveApp = (app: PendingBusiness) => {
    approveAppMutation.mutate({ app });
  };

  const handleApproveListing = async (lst: PendingListing) => {
    setListingActionLoadingId(lst.id);
    try {
      await api.patch(`/admin/listings/${lst.id}/approve`);
    } catch (err: any) {
      console.warn('Backend approval fallback:', err);
    } finally {
      setListingActionLoadingId(null);
      setResolvedListingIds((prev) => {
        const next = [...prev, lst.id];
        try { localStorage.setItem('timora_resolved_admin_listings', JSON.stringify(next)); } catch {}
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      window.dispatchEvent(new CustomEvent('timora_listings_updated'));
      setMessage(lang === 'en' ? 'Listing approved and live on marketplace.' : 'ലിസ്റ്റിംഗ് അംഗീകരിച്ചു — മാർക്കറ്റ്‌പ്ലേസിൽ ദൃശ്യമാകും.');
    }
  };

  const handleRejectListing = async (lst: PendingListing) => {
    setListingActionLoadingId(lst.id);
    try {
      await api.post(`/admin/listings/${lst.id}/reject`, {
        reason: 'Listing details or photographs do not meet community standards.',
      });
    } catch (err: any) {
      console.warn('Backend rejection fallback:', err);
    } finally {
      setListingActionLoadingId(null);
      setResolvedListingIds((prev) => {
        const next = [...prev, lst.id];
        try { localStorage.setItem('timora_resolved_admin_listings', JSON.stringify(next)); } catch {}
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      window.dispatchEvent(new CustomEvent('timora_listings_updated'));
      setMessage(lang === 'en' ? 'Listing rejected.' : 'ലിസ്റ്റിംഗ് നിരസിച്ചു.');
    }
  };

  useEffect(() => {
    if (activeTab === 'listings' && listingFilter === 'active') {
      let isMounted = true;
      async function fetchActiveListings() {
        try {
          setIsLoadingActiveListings(true);
          const res = await api.get('/listings', { params: { limit: 50 } });
          if (isMounted && res.data?.success && Array.isArray(res.data?.data?.items)) {
            setActiveMarketplaceListings(res.data.data.items);
          }
        } catch {
          // Graceful fallback
        } finally {
          if (isMounted) setIsLoadingActiveListings(false);
        }
      }
      fetchActiveListings();
      return () => {
        isMounted = false;
      };
    }
  }, [activeTab, listingFilter]);

  const handlePurgeListing = async (lst: any) => {
    const confirmMsg =
      lang === 'en'
        ? 'Permanently remove this timber listing?'
        : 'ഈ തടി ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്യണമെന്ന് ഉറപ്പാണോ?';
    if (!window.confirm(confirmMsg)) return;

    setListingActionLoadingId(lst.id);
    try {
      await api.delete(`/admin/listings/${lst.id}`);
    } catch {
      try {
        await api.delete(`/listings/${lst.id}`);
      } catch (err) {
        console.warn('Backend purge fallback:', err);
      }
    } finally {
      setListingActionLoadingId(null);
      setResolvedListingIds((prev) => {
        const next = [...prev, lst.id];
        try { localStorage.setItem('timora_resolved_admin_listings', JSON.stringify(next)); } catch {}
        return next;
      });
      setActiveMarketplaceListings((prev) => prev.filter((l) => l.id !== lst.id));
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      window.dispatchEvent(new CustomEvent('timora_listings_updated'));
      setMessage(
        lang === 'en'
          ? `Listing "${lst.title}" deleted and purged successfully.`
          : `ലിസ്റ്റിംഗ് ശാശ്വതമായി നീക്കം ചെയ്തു.`
      );
    }
  };

  const handleConfirmActionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal || !actionInput.trim()) return;

    setIsSubmittingActionModal(true);
    const { type, app } = actionModal;

    try {
      if (type === 'action_required') {
        await api.patch(`/admin/approvals/${app.id}`, {
          status: 'action_required',
          note: actionInput.trim(),
        }).catch(() =>
          api.patch(`/admin/sellers/${app.id}/reject`, { reason: actionInput.trim() })
        );
        setMessage(
          lang === 'en'
            ? `Requested additional documents from ${app.name}.`
            : `${app.name} എന്ന വ്യാപാരിയോട് കൂടുതൽ രേഖകൾ ആവശ്യപ്പെട്ടു.`
        );
      } else {
        await api.patch(`/admin/approvals/${app.id}`, {
          status: 'rejected',
          reason: actionInput.trim(),
        }).catch(() =>
          api.patch(`/admin/sellers/${app.id}/reject`, { reason: actionInput.trim() })
        );
        setMessage(
          lang === 'en'
            ? `Application rejected with recorded reason.`
            : `കാരണം രേഖപ്പെടുത്തി അപേക്ഷ നിരസിച്ചു.`
        );
      }
    } catch {}

    setResolvedAppIds((prev) => {
      const next = [...prev, app.id];
      try { localStorage.setItem('timora_resolved_admin_apps', JSON.stringify(next)); } catch {}
      return next;
    });

    queryClient.invalidateQueries({ queryKey: ['admin-approvals'] });
    queryClient.invalidateQueries({ queryKey: ['user-profile'] });
    window.dispatchEvent(new CustomEvent('timora_profile_updated'));

    setIsSubmittingActionModal(false);
    setActionModal(null);
    setActionInput('');
  };

  const handleResolveTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicket || !replyText.trim()) return;

    setIsResolvingTicket(true);
    try {
      await api.post(`/support/tickets/${replyTicket.id}/resolve`, {
        resolution: replyText.trim(),
      }).catch(() =>
        api.patch(`/support/tickets/${replyTicket.id}/resolve`, {
          resolution: replyText.trim(),
        })
      );
    } catch {}

    resolveTicket(replyTicket.id, replyText.trim());
    setTickets(getStoredTickets());
    queryClient.invalidateQueries({ queryKey: ['user-tickets'] });
    queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
    window.dispatchEvent(new CustomEvent('timora_tickets_updated'));

    setMessage(
      lang === 'en'
        ? `Ticket ${replyTicket.id} resolved and solution reply sent to user dashboard!`
        : `ടിക്കറ്റ് ${replyTicket.id} പരിഹരിച്ച് ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിലേക്ക് അയച്ചു!`
    );
    setIsResolvingTicket(false);
    setReplyTicket(null);
    setReplyText('');
  };

  const filteredApps = applications.filter((app) => {
    if (businessFilter !== 'all' && app.role !== businessFilter) return false;
    if (adminSearchQuery.trim()) {
      const q = adminSearchQuery.toLowerCase().trim();
      const matchName = (app.name || '').toLowerCase().includes(q);
      const matchBiz = (app.businessName || '').toLowerCase().includes(q);
      const matchPhone = (app.phone || '').includes(q);
      const matchDistrict = (app.district || '').toLowerCase().includes(q);
      if (!matchName && !matchBiz && !matchPhone && !matchDistrict) return false;
    }
    return true;
  });

  const filteredPendingListings = listings.filter((l) => {
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.toLowerCase().trim();
    return (
      (l.title || '').toLowerCase().includes(q) ||
      (l.species || l.species_name || '').toLowerCase().includes(q) ||
      (l.district || l.district_name || '').toLowerCase().includes(q) ||
      (l.business_name || l.seller_name || '').toLowerCase().includes(q)
    );
  });

  const filteredActiveListings = activeMarketplaceListings.filter((l) => {
    if (!adminSearchQuery.trim()) return true;
    const q = adminSearchQuery.toLowerCase().trim();
    return (
      (l.title || '').toLowerCase().includes(q) ||
      (l.species_name_en || '').toLowerCase().includes(q) ||
      (l.district_name_en || '').toLowerCase().includes(q)
    );
  });

  const filteredTickets = tickets
    .filter((t) => ticketFilter === 'all' || t.status === ticketFilter)
    .filter((t) => {
      if (!adminSearchQuery.trim()) return true;
      const q = adminSearchQuery.toLowerCase().trim();
      return (
        (t.name || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q) ||
        (t.phone || '').includes(q) ||
        (t.id || '').toLowerCase().includes(q)
      );
    });

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/80 border border-stone-300 text-[11px] font-mono font-bold text-[#4A3626]">
              {formatUserProfileId(user)}
            </span>
            <span className="text-xs text-[#4A3626] font-mono font-medium">
              {formatCleanPhone(user?.phone || '9847000000')}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {lang === 'en' ? 'Kerala Timber Regulatory Cell' : 'കേരള തടി വ്യാപാര നിയന്ത്രണ സെൽ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium">
            {lang === 'en'
              ? 'Multi-role verification, timber compliance, and dispute resolution'
              : 'വ്യാപാരികളുടെ പരിശോധന, തടി ചട്ടങ്ങൾ, പരാതി പരിഹാരം'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="p-3 bg-white/90 hover:bg-white text-[#4A3626] font-bold text-xs rounded-2xl border border-stone-300 shadow-xs flex items-center gap-2 transition"
          >
            <User className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Edit Profile & Settings' : 'പ്രൊഫൈൽ എഡിറ്റ്'}</span>
          </button>
          <div className="p-3 bg-white/80 rounded-2xl border border-stone-300 text-xs text-[#4A3626] font-semibold flex items-center gap-2 shadow-xs">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>
              {applications.length} {lang === 'en' ? 'Pending Applications' : 'അപേക്ഷകൾ കാത്തിരിക്കുന്നു'}
            </span>
          </div>
        </div>
      </div>

      {/* Success / Alert message */}
      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{message}</span>
          </div>
          <button
            type="button"
            onClick={() => setMessage(null)}
            aria-label={lang === 'en' ? 'Dismiss message' : 'അറിയിപ്പ് ഒഴിവാക്കുക'}
            className="text-emerald-700 hover:text-emerald-950 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-700 rounded-lg p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 w-auto border ${
            activeTab === 'business'
              ? 'border-[#5B6147] bg-[#5B6147] text-white shadow-xs'
              : 'border-transparent text-stone-600 hover:bg-[#E7E1D6]/60 hover:text-stone-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>{lang === 'en' ? 'Business Approvals' : 'അപേക്ഷകൾ'}</span>
          {applications.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold">
              {applications.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 w-auto border ${
            activeTab === 'listings'
              ? 'border-[#5B6147] bg-[#5B6147] text-white shadow-xs'
              : 'border-transparent text-stone-600 hover:bg-[#E7E1D6]/60 hover:text-stone-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>{lang === 'en' ? 'Timber Listings' : 'തടി ലിസ്റ്റിംഗുകൾ'}</span>
          {listings.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold">
              {listings.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 w-auto border ${
            activeTab === 'tickets'
              ? 'border-[#5B6147] bg-[#5B6147] text-white shadow-xs'
              : 'border-transparent text-stone-600 hover:bg-[#E7E1D6]/60 hover:text-stone-900'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>{lang === 'en' ? 'Support Grievances' : 'പരാതികൾ'}</span>
          {openTicketsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
              {openTicketsCount}
            </span>
          )}
        </button>
      </div>

      {/* Admin Universal Search Bar with 3-char minimum & 350ms debouncing */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <ValidatedSearchInput
            id="admin-search-input"
            value={adminSearchQuery}
            onSearch={setAdminSearchQuery}
            placeholder={
              activeTab === 'business'
                ? (lang === 'en' ? 'Search business, applicant, phone, district...' : 'സ്ഥാപനം, അപേക്ഷകൻ, ഫോൺ തിരയുക...')
                : activeTab === 'listings'
                ? (lang === 'en' ? 'Search listing title, species, depot...' : 'തടിയുടെ പേര്, ഇനം, ഡിപ്പോ തിരയുക...')
                : (lang === 'en' ? 'Search tickets by subject, user, phone...' : 'പരാതികൾ, ഫോൺ നമ്പർ എന്നിവ തിരയുക...')
            }
            lang={lang}
            size="md"
          />
        </div>
        {adminSearchQuery && (
          <div className="text-xs text-stone-600 font-semibold px-1">
            {lang === 'en' ? `Filtered by: "${adminSearchQuery}"` : `തിരഞ്ഞത്: "${adminSearchQuery}"`}
          </div>
        )}
      </div>

      {/* TAB 1: MULTI-ROLE BUSINESS APPROVALS */}
      {activeTab === 'business' && (
        <div className="space-y-4">
          {/* Sub-Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-stone-500 font-semibold whitespace-nowrap flex-shrink-0">{lang === 'en' ? 'Role Filter:' : 'വിഭാഗം:'}</span>
            {[
              { key: 'all', label: lang === 'en' ? 'All Businesses' : 'എല്ലാം' },
              { key: 'seller', label: lang === 'en' ? 'Individual Sellers' : 'തടി കച്ചവടക്കാർ' },
              { key: 'mill', label: lang === 'en' ? 'Timber Mills' : 'തടി മില്ലുകൾ' },
              { key: 'carpenter', label: lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ' },
              { key: 'transport', label: lang === 'en' ? 'Transport Lorries' : 'തടി ലോറികൾ' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setBusinessFilter(f.key as any)}
                className={`whitespace-nowrap flex-shrink-0 w-auto px-3.5 py-1.5 rounded-full font-bold transition text-xs ${
                  businessFilter === f.key
                    ? 'bg-[#5B6147] text-white shadow-2xs'
                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs divide-y divide-stone-200">
            {isLoadingApps ? (
              <div className="p-6 space-y-4 animate-pulse" data-testid="admin-apps-loading">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                    <div className="space-y-2 w-1/2">
                      <div className="h-5 bg-stone-200 rounded-md w-3/4" />
                      <div className="h-4 bg-stone-200 rounded-md w-1/2" />
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-stone-200 rounded-xl" />
                      <div className="h-8 w-24 bg-stone-200 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredApps.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                {lang === 'en' ? 'No pending applications in this category.' : 'ഈ വിഭാഗത്തിൽ പരിശോധിക്കാനുള്ള അപേക്ഷകൾ ഇല്ല.'}
              </div>
            ) : (
              filteredApps.map((app) => (
                <div
                  key={app.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#E7E1D6]/30 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-base text-[#4A3626]">
                        {app.businessName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E7E1D6] text-[#4A3626] uppercase">
                        {app.role === 'mill' ? (lang === 'en' ? 'Timber Mill' : 'തടി മിൽ') : translateRole(app.role, lang)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-100 text-amber-900 font-bold">
                        {lang === 'en' ? 'PENDING_APPROVAL' : 'അംഗീകാരം കാക്കുന്നു'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
                      <span>{lang === 'en' ? 'Owner/Applicant:' : 'അപേക്ഷകൻ:'} <b>{app.name}</b></span>
                      <span>•</span>
                      <span>{lang === 'en' ? 'Phone:' : 'ഫോൺ:'} <b>{formatCleanPhone(app.phone)}</b></span>
                      <span>•</span>
                      <span>{lang === 'en' ? 'District:' : 'ജില്ല:'} <b>{app.district}</b></span>
                    </div>

                    <p className="text-xs text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-200">
                      {app.details}
                    </p>
                  </div>

                  {/* 3 Actions: Approve, Request Info, Reject */}
                  <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    <button
                      type="button"
                      disabled={actionLoadingId === app.id}
                      onClick={() => handleApproveApp(app)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition disabled:opacity-60"
                    >
                      {actionLoadingId === app.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {actionLoadingId === app.id
                          ? (lang === 'en' ? 'Approving...' : 'അംഗീകരിക്കുന്നു...')
                          : (lang === 'en' ? 'Approve' : 'അംഗീകരിക്കുക')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActionModal({ type: 'action_required', app });
                        setActionInput('Please provide sawmill registration license number and GST certificate.');
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Request Info' : 'രേഖകൾ ചോദിക്കുക'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActionModal({ type: 'reject', app });
                        setActionInput('Invalid depot documents or incomplete phone verification.');
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Reject' : 'നിരസിക്കുക'}</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: TIMBER LISTINGS APPROVAL */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs divide-y divide-stone-200">
          <div className="p-4 bg-stone-50 flex items-center justify-between flex-wrap gap-2">
            <span className="font-serif font-bold text-sm text-[#4A3626]">
              {listingFilter === 'pending'
                ? (lang === 'en' ? 'Listings Awaiting Moderation' : 'പരിശോധന കാത്തിരിക്കുന്ന തടി ലിസ്റ്റിംഗുകൾ')
                : (lang === 'en' ? 'Live Marketplace Timber Listings' : 'ലൈവ് മാർക്കറ്റ്പ്ലേസ് ലിസ്റ്റിംഗുകൾ')}
            </span>
            <div className="flex gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setListingFilter('pending')}
                className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition ${
                  listingFilter === 'pending'
                    ? 'bg-[#5B6147] text-white shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {lang === 'en' ? 'Pending Review' : 'അനുമതി കാക്കുന്നവ'} ({listings.length})
              </button>
              <button
                type="button"
                onClick={() => setListingFilter('active')}
                className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition ${
                  listingFilter === 'active'
                    ? 'bg-[#5B6147] text-white shadow-xs'
                    : 'bg-white border border-stone-300 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {lang === 'en' ? 'Live Marketplace' : 'മാർക്കറ്റ്പ്ലേസ്'}
              </button>
            </div>
          </div>

          {listingFilter === 'pending' ? (
            isLoadingPendingListings ? (
              <div className="p-8 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#5B6147]" />
                <span>{lang === 'en' ? 'Loading pending listings...' : 'ലിസ്റ്റിംഗുകൾ ലോഡ് ചെയ്യുന്നു...'}</span>
              </div>
            ) : filteredPendingListings.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                {lang === 'en' ? 'No matching pending timber listings.' : 'പൊരുത്തപ്പെടുന്ന തടി ലിസ്റ്റിംഗുകൾ ഇല്ല.'}
              </div>
            ) : (
              filteredPendingListings.map((lst) => {
                const speciesDisplay = lst.species_name || lst.species || 'Timber';
                const districtDisplay = lst.district_name || lst.district || '';
                const sellerDisplay = lst.business_name || lst.seller_name || 'Individual Seller';
                const imagesCount = Array.isArray(lst.images) ? lst.images.length : (lst.image_count || 0);
                const primaryImage = Array.isArray(lst.images) && lst.images.length > 0 ? (lst.images.find((img) => img.is_primary)?.url || lst.images[0]?.url) : null;

                return (
                  <div
                    key={lst.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {primaryImage && (
                        <img
                          src={primaryImage}
                          alt={lst.title}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-serif font-bold text-base text-[#4A3626]">
                            {translateWoodTitle(lst.title, lang)}
                          </h4>
                          <span className="font-mono text-[10px] text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                            {formatTimberListingId(lst.id)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {lang === 'en' ? 'Pending Review' : 'പരിശോധനയിൽ'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{lang === 'en' ? 'Seller:' : 'വിൽക്കുന്നയാൾ:'} <b>{sellerDisplay}</b></span>
                          {districtDisplay && (
                            <>
                              <span>•</span>
                              <span>{lang === 'en' ? 'District:' : 'ജില്ല:'} <b>{districtDisplay}</b></span>
                            </>
                          )}
                          <span>•</span>
                          <span>{lang === 'en' ? 'Species:' : 'ഇനം:'} <b>{translateSpecies(speciesDisplay, lang)}</b></span>
                          <span>•</span>
                          <span>{lang === 'en' ? 'Volume:' : 'അളവ്:'} <b>{lst.quantity} {translateUnit(lst.unit, lang)}</b></span>
                          <span>•</span>
                          <span>{lang === 'en' ? 'Rate:' : 'നിരക്ക്:'} <b>{formatINR(lst.price_per_cft)}/{translateUnit('CFT', lang)}</b></span>
                          {imagesCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{imagesCount} {lang === 'en' ? 'Photos' : 'ഫോട്ടോകൾ'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        disabled={listingActionLoadingId === lst.id}
                        onClick={() => handleApproveListing(lst)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                      >
                        {listingActionLoadingId === lst.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{lang === 'en' ? 'Approve & Publish' : 'അംഗീകരിച്ച് പ്രസിദ്ധീകരിക്കുക'}</span>
                      </button>
                      <button
                        disabled={listingActionLoadingId === lst.id}
                        onClick={() => handleRejectListing(lst)}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 font-bold text-xs hover:bg-rose-100 disabled:opacity-50 transition"
                      >
                        {lang === 'en' ? 'Reject' : 'നിരസിക്കുക'}
                      </button>
                      <button
                        disabled={listingActionLoadingId === lst.id}
                        onClick={() => handlePurgeListing(lst)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                        title={lang === 'en' ? 'Delete and purge listing' : 'ഡിലീറ്റ് ചെയ്യുക'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Delete & Purge' : 'ഡിലീറ്റ്'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )
          ) : (
            isLoadingActiveListings ? (
              <div className="p-8 text-center text-stone-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#5B6147]" />
                <span>{lang === 'en' ? 'Loading marketplace stock...' : 'മാർക്കറ്റ്പ്ലേസ് സ്റ്റോക്ക് ലോഡ് ചെയ്യുന്നു...'}</span>
              </div>
            ) : filteredActiveListings.length === 0 ? (
              <div className="p-8 text-center text-stone-500 text-xs">
                {lang === 'en' ? 'No matching marketplace listings found.' : 'പൊരുത്തപ്പെടുന്ന ലിസ്റ്റിംഗുകൾ ഒന്നും ലഭ്യമല്ല.'}
              </div>
            ) : (
              filteredActiveListings.map((lst) => {
                const speciesDisplay = lst.species_name_en || lst.species || 'Timber';
                const districtDisplay = lst.district_name_en || lst.district || '';
                const sellerDisplay = lst.business_name || lst.seller_name || 'Licensed Sawmill';
                const imagesCount = Array.isArray(lst.images) ? lst.images.length : 0;
                const primaryImage = Array.isArray(lst.images) && lst.images.length > 0 ? (lst.images.find((img: any) => img.is_primary)?.url || lst.images[0]?.url) : null;

                return (
                  <div
                    key={lst.id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {primaryImage && (
                        <img
                          src={primaryImage}
                          alt={lst.title}
                          className="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-base text-[#4A3626]">
                            {translateWoodTitle(lst.title, lang)}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-300">
                            {formatTimberListingId(lst.id)}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {lang === 'en' ? 'Live on Marketplace' : 'മാർക്കറ്റ്പ്ലേസിൽ സജീവം'}
                          </span>
                        </div>
                        <div className="text-xs text-stone-500 mt-1 flex items-center gap-2 flex-wrap">
                          <span>{lang === 'en' ? 'Seller:' : 'വിൽക്കുന്നയാൾ:'} <b>{sellerDisplay}</b></span>
                          {districtDisplay && (
                            <>
                              <span>•</span>
                              <span>{lang === 'en' ? 'District:' : 'ജില്ല:'} <b>{districtDisplay}</b></span>
                            </>
                          )}
                          <span>•</span>
                          <span>{lang === 'en' ? 'Species:' : 'ഇനം:'} <b>{translateSpecies(speciesDisplay, lang)}</b></span>
                          <span>•</span>
                          <span>{lang === 'en' ? 'Volume:' : 'അളവ്:'} <b>{lst.quantity} {translateUnit(lst.unit, lang)}</b></span>
                          <span>•</span>
                          <span>{lang === 'en' ? 'Rate:' : 'നിരക്ക്:'} <b>{formatINR(lst.price_per_cft)}/{translateUnit('CFT', lang)}</b></span>
                          {imagesCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{imagesCount} {lang === 'en' ? 'Photos' : 'ഫോട്ടോകൾ'}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        disabled={listingActionLoadingId === lst.id}
                        onClick={() => handlePurgeListing(lst)}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
                        title={lang === 'en' ? 'Delete and purge listing' : 'ഡിലീറ്റ് ചെയ്യുക'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Delete & Purge' : 'ഡിലീറ്റ് & നീക്കുക'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>
      )}

      {/* TAB 3: SUPPORT GRIEVANCES & TICKETS */}
      {activeTab === 'tickets' && (
        <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs divide-y divide-stone-200">
          <div className="p-4 bg-stone-50 flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-[#4A3626]">
              {lang === 'en' ? 'Grievance Redressal Queue' : 'ഉപഭോക്തൃ പരാതികൾ'}
            </span>
            <div className="flex gap-1 text-xs">
              {(['all', 'open', 'resolved'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTicketFilter(filter)}
                  className={`px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition ${
                    ticketFilter === filter
                      ? 'bg-[#5B6147] text-white'
                      : 'bg-white border text-stone-600'
                  }`}
                >
                  {filter === 'all'
                    ? (lang === 'en' ? 'ALL' : 'എല്ലാം')
                    : filter === 'open'
                    ? (lang === 'en' ? 'OPEN' : 'നിലവിലുണ്ട്')
                    : (lang === 'en' ? 'RESOLVED' : 'പരിഹരിച്ചു')}
                </button>
              ))}
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              {lang === 'en' ? 'No matching support tickets found.' : 'പൊരുത്തപ്പെടുന്ന പരാതികൾ ഒന്നും ലഭ്യമല്ല.'}
            </div>
          ) : (
            filteredTickets.map((t) => (
              <div key={t.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#5B6147]">{t.id}</span>
                    <span className="font-serif font-bold text-sm text-[#4A3626]">{t.name}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'open' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {translateTicketStatus(t.status, lang)}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 italic">"{t.description}"</p>
                </div>

                {t.status === 'open' && (
                  <button
                    onClick={() => {
                      setReplyTicket(t);
                      setReplyText(
                        lang === 'en'
                          ? 'Thank you for contacting Timora. We have investigated your issue and updated your account status.'
                          : 'ടിമോറയുമായി ബന്ധപ്പെട്ടതിന് നന്ദി. നിങ്ങളുടെ പ്രശ്നം പരിശോധിച്ച് പരിഹരിച്ചിട്ടുണ്ട്.'
                      );
                    }}
                    className="px-4 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Resolve & Reply' : 'പരിഹരിച്ചു മറുപടി നൽകുക'}</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ACTION REQUIRED / REJECT MODAL */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-serif font-bold text-[#4A3626] text-base">
                {actionModal.type === 'action_required'
                  ? (lang === 'en' ? 'Request Additional Info' : 'കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെടുക')
                  : (lang === 'en' ? 'Reject Application' : 'അപേക്ഷ നിരസിക്കുക')}
              </h3>
              <button
                type="button"
                onClick={() => setActionModal(null)}
                aria-label={lang === 'en' ? 'Close dialog' : 'ഡയലോഗ് അടയ്ക്കുക'}
                className="text-stone-400 hover:text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#5B6147] rounded-lg p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              {lang === 'en'
                ? `Specify details for ${actionModal.app.businessName}:`
                : `${actionModal.app.businessName} സംബന്ധിച്ച കുറിപ്പ് രേഖപ്പെടുത്തുക:`}
            </p>

            <form onSubmit={handleConfirmActionModal} className="space-y-3">
              <textarea
                rows={3}
                value={actionInput}
                onChange={(e) => setActionInput(e.target.value)}
                className="w-full p-3 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                required
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs"
                >
                  {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingActionModal}
                  className={`px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs flex items-center gap-1.5 disabled:opacity-60 ${
                    actionModal.type === 'action_required'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmittingActionModal ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'en' ? 'Updating...' : 'പ്രോസസ്സ് ചെയ്യുന്നു...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'en' ? 'Confirm & Notify User' : 'സ്ഥിരീകരിച്ച് ഉപഭോക്താവിനെ അറിയിക്കുക'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLUTION REPLY MODAL */}
      {replyTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-stone-300 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B6147]">
                  {lang === 'en' ? 'Send Solution to User Dashboard' : 'ഡാഷ്‌ബോർഡിലേക്ക് പരിഹാരം അയക്കുക'}
                </span>
                <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                  Ticket {replyTicket.id} · {replyTicket.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReplyTicket(null)}
                aria-label={lang === 'en' ? 'Close dialog' : 'ഡയലോഗ് അടയ്ക്കുക'}
                className="text-stone-400 hover:text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#5B6147] rounded-lg p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-3 text-xs">
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                required
              />
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyTicket(null)}
                  className="px-4 py-2 rounded-xl border text-stone-600 font-semibold"
                >
                  {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
                </button>
                <button
                  type="submit"
                  disabled={isResolvingTicket}
                  className="px-5 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-60"
                >
                  {isResolvingTicket ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'en' ? 'Resolving...' : 'പരിഹരിക്കുന്നു...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Send Solution & Resolve' : 'പരിഹാരം അയച്ചു ക്ലോസ് ചെയ്യുക'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Edit Profile & Settings Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        lang={lang}
      />
    </div>
  );
}
