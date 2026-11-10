import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Factory,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  User,
  LifeBuoy,
  ShieldCheck,
  Package,
  Layers,
  FileText,
  Hammer,
  Truck,
  TrendingUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { formatINR, formatUserProfileId, formatCleanPhone } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';
import { api } from '../../lib/api';
import { getTicketsForUser, markTicketAsRead, SupportTicket } from '../../utils/ticketService';
import {
  translateWoodTitle,
  translateCutType,
  translateSpecies,
  translateUnit,
  translateTicketCategory,
} from '../../utils/i18n';

interface SawnBatch {
  id: string;
  title: string;
  species: string;
  cutType: string;
  dimensions: string;
  quantityCft: number;
  ratePerCft: number;
  status: 'available' | 'in_sawing' | 'dispatched';
}

const INITIAL_MILL_BATCHES: SawnBatch[] = [
  {
    id: 'mill-b1',
    title: 'Precision Sawn Anjili Joists & Rafters',
    species: 'Anjili (ആഞ്ഞിലി)',
    cutType: 'Squared Beams',
    dimensions: '4" x 3" x 14ft',
    quantityCft: 180,
    ratePerCft: 1450,
    status: 'available',
  },
  {
    id: 'mill-b2',
    title: 'Kiln Seasoned Nilambur Teak Planks',
    species: 'Teak (തേക്ക്)',
    cutType: 'Rough-sawn Planks',
    dimensions: '1.5" x 8" x 10ft',
    quantityCft: 95,
    ratePerCft: 2950,
    status: 'available',
  },
  {
    id: 'mill-b3',
    title: 'Mahogany Door Framing Scantlings',
    species: 'Mahogany (മഹാഗണി)',
    cutType: 'Squared Beams',
    dimensions: '5" x 3" x 12ft',
    quantityCft: 120,
    ratePerCft: 1800,
    status: 'in_sawing',
  },
];

export function TimberMillOwnerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const queryClient = useQueryClient();
  const { user, refreshUser } = useAuth();
  const [batches, setBatches] = useState<SawnBatch[]>(INITIAL_MILL_BATCHES);
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [updatingBatchId, setUpdatingBatchId] = useState<string | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getTicketsForUser(user?.phone, 'mill_owner')
  );

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getTicketsForUser(user?.phone, 'mill_owner'));
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, [user]);

  const [showAdminReply, setShowAdminReply] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`timora_dismissed_admin_reply_${user?.id || 'mill_owner'}`) !== 'true';
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
      localStorage.setItem(`timora_dismissed_admin_reply_${user?.id || 'mill_owner'}`, 'true');
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

  const handleToggleBatchStatus = async (batchId: string) => {
    setUpdatingBatchId(batchId);
    const target = batches.find((b) => b.id === batchId);
    const nextStatus = target?.status === 'available' ? 'in_sawing' : 'available';
    try {
      await api.patch(`/listings/${batchId}/stock`, {
        status: nextStatus === 'available' ? 'approved' : 'pending',
      });
    } catch (err) {
      console.warn('Fallback: updated mill batch stock status locally', err);
    } finally {
      setUpdatingBatchId(null);
    }
    setBatches((prev) =>
      prev.map((b) => (b.id === batchId ? { ...b, status: nextStatus as any } : b))
    );
  };

  useEffect(() => {
    if (refreshUser) refreshUser();
    const handleSync = () => {
      if (refreshUser) refreshUser();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'timora_last_approval_sync') {
        if (refreshUser) refreshUser();
      }
    };
    window.addEventListener('timora_profile_updated', handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('timora_profile_updated', handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshUser]);

  // Form fields
  const [title, setTitle] = useState('');
  const [species, setSpecies] = useState('Teak');
  const [cutType, setCutType] = useState('Rough-sawn Planks');
  const [dimensions, setDimensions] = useState('2" x 6" x 12ft');
  const [quantityCft, setQuantityCft] = useState(50);
  const [ratePerCft, setRatePerCft] = useState(2500);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBatch(true);
    const newBatch: SawnBatch = {
      id: `mill-b-${Date.now()}`,
      title: title.trim(),
      species,
      cutType,
      dimensions: dimensions.trim(),
      quantityCft,
      ratePerCft,
      status: 'available',
    };
    try {
      await api.post('/listings', {
        title: title.trim(),
        species_id: 1,
        timber_type_id: 2,
        district_id: 7,
        quantity: quantityCft,
        price_per_cft: ratePerCft,
        pricing_mode: 'fixed',
        unit: 'cft',
      });
    } catch {
      // Graceful offline fallback
    } finally {
      setIsSubmittingBatch(false);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-listings'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      window.dispatchEvent(new CustomEvent('timora_listings_updated'));
    }
    setBatches([newBatch, ...batches]);
    setTitle('');
    setShowAddBatch(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fadeIn">
      {/* VERIFICATION STATUS BANNER */}
      <VerificationStatusBanner
        status={user?.approvalStatus || 'APPROVED'}
        role="seller"
        entityName={user?.millName || user?.businessName}
        note={user?.approvalNote}
        lang={lang}
        onRaiseTicket={() => setIsRaiseModalOpen(true)}
      />

      {/* TOP HEADER: SEPARATING MILL IDENTITY FROM OWNER IDENTITY */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1">
              <Factory className="w-3 h-3" />
              <span>{lang === 'en' ? 'Licensed Kerala Timber Mill' : 'അംഗീകൃത തടി മിൽ'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/80 border border-stone-300 text-[11px] font-mono font-bold text-[#4A3626]">
              {formatUserProfileId(user)}
            </span>
            <span className="text-xs text-[#4A3626] font-mono font-medium">
              Lic: KL-SAW-EKM-1048
            </span>
          </div>

          {/* Mill Business Name */}
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {user?.millName || user?.businessName || 'Perumbavoor Modern Sawmills & Timber Depot'}
          </h1>

          {/* Distinct Owner Personal Identity */}
          <div className="text-xs sm:text-sm text-[#7A5A3A] font-medium flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#4A3626]">
              {lang === 'en' ? 'Proprietor / Owner: ' : 'ഉടമസ്ഥൻ: '}
              {user?.name || 'George Varghese'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{formatCleanPhone(user?.phone || '9847120002')}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{user?.district || 'Ernakulam (എറണാകുളം)'}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs sm:text-sm font-bold shadow-xs transition"
          >
            <User className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Edit Profile' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ'}</span>
          </button>

          <button
            type="button"
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
            type="button"
            onClick={() => {
              if (user?.approvalStatus?.toUpperCase() !== 'APPROVED') {
                alert(
                  lang === 'en'
                    ? 'Batch posting is restricted while sawmill verification is pending admin review.'
                    : 'സോമിൽ അഡ്മിൻ പരിശോധന പൂർത്തിയായി അംഗീകരിച്ച ശേഷം മാത്രമേ പുതിയ ബാച്ചുകൾ ചേർക്കാൻ സാധിക്കൂ.'
                );
                return;
              }
              setShowAddBatch(!showAddBatch);
            }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition ${
              user?.approvalStatus?.toUpperCase() === 'APPROVED'
                ? 'bg-[#5B6147] hover:bg-[#3F452F] text-white'
                : 'bg-stone-300 text-stone-600 cursor-not-allowed opacity-90'
            }`}
            title={user?.approvalStatus?.toUpperCase() !== 'APPROVED' ? (lang === 'en' ? 'Approval Required' : 'അംഗീകാരം ആവശ്യമാണ്') : undefined}
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'en' ? 'Post Sawn Timber Batch' : 'പുതിയ തടി ബാച്ച് ചേർക്കുക'}</span>
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
                  {lang === 'en' ? latestResolvedTicket.category : (latestResolvedTicket.categoryMl || translateTicketCategory(latestResolvedTicket.category, lang))}
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

      {/* MILL OPERATIONAL METRICS */}
      {(() => {
        const availableStockCft = batches
          .filter((b) => b.status === 'available')
          .reduce((sum, b) => sum + (Number(b.quantityCft) || 0), 0);
        const inSawingBatches = batches.filter((b) => b.status === 'in_sawing');
        const inSawingCft = inSawingBatches.reduce((sum, b) => sum + (Number(b.quantityCft) || 0), 0);
        const isApproved = user?.approvalStatus?.toUpperCase() === 'APPROVED';

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Daily Sawing Capacity' : 'പ്രതിദിന ശേഷി'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-serif text-[#4A3626]">
                {batches.length > 0 ? 350 : 0} <span className="text-xs font-normal text-stone-500">{lang === 'en' ? 'CFT/day' : 'സി.എഫ്.ടി/ദിവസം'}</span>
              </div>
              <p className="text-[10px] text-stone-500">
                {batches.length > 0 ? (lang === 'en' ? '2 Heavy Band Saws Active' : '2 ഹെവി ബാന്റ് സോ സജീവം') : (lang === 'en' ? 'No active saws' : 'ബാന്റ് സോ സജീവമല്ല')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Available Sawn Stock' : 'സ്റ്റോക്ക് തടികൾ'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-serif text-[#4A3626]">
                {availableStockCft} <span className="text-xs font-normal text-stone-500">{translateUnit('CFT', lang)}</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">
                {availableStockCft > 0 ? (lang === 'en' ? 'Ready for Dispatch' : 'അയക്കാൻ തയ്യാറായവ') : (lang === 'en' ? 'Out of stock' : 'സ്റ്റോക്ക് തീർന്നു')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Active Sawing Orders' : 'സജീവ ജോലികൾ'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-serif text-[#4A3626]">
                {inSawingBatches.length} <span className="text-xs font-normal text-stone-500">{lang === 'en' ? 'Orders' : 'ഓർഡറുകൾ'}</span>
              </div>
              <p className="text-[10px] text-amber-700 font-semibold">
                {inSawingCft > 0 ? (lang === 'en' ? `${inSawingCft} CFT in processing` : `${inSawingCft} സി.എഫ്.ടി പ്രോസസ്സിംഗിൽ`) : (lang === 'en' ? '0 CFT in processing' : 'പ്രോസസ്സിംഗിൽ ഇല്ല')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Form IV Clearance' : 'ഫോറസ്റ്റ് പാസ്സ്'}
              </span>
              <div className={`text-xl sm:text-2xl font-black font-serif flex items-center gap-1 ${isApproved ? 'text-emerald-700' : 'text-amber-700'}`}>
                <ShieldCheck className={`w-5 h-5 ${isApproved ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>{isApproved ? (lang === 'en' ? 'Active' : 'സജീവം') : (lang === 'en' ? 'Pending' : 'പരിശോധനയിൽ')}</span>
              </div>
              <p className="text-[10px] text-stone-500">
                {isApproved ? (lang === 'en' ? 'Transit Permits Enabled' : 'ട്രാൻസിറ്റ് പെർമിറ്റുകൾ ലഭ്യമാണ്') : (lang === 'en' ? 'Under Regulatory Review' : 'നിയന്ത്രണ പരിശോധനയിൽ')}
              </p>
            </div>
          </div>
        );
      })()}

      {/* ADD BATCH FORM */}
      {showAddBatch && (
        <div className="p-6 bg-white rounded-3xl border border-[#8E7F6B]/30 shadow-md space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="font-serif font-bold text-[#4A3626] text-base">
              {lang === 'en' ? 'List Sawn Timber or Squared Beams from Mill' : 'മില്ലിൽ നിന്നുള്ള തടി ലിസ്റ്റ് ചെയ്യുക'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddBatch(false)}
              aria-label={lang === 'en' ? 'Close dialog' : 'ഡയലോഗ് അടയ്ക്കുക'}
              className="text-stone-400 hover:text-stone-700 font-bold focus:outline-none focus:ring-2 focus:ring-[#5B6147] rounded-lg p-1 text-sm"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateBatch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Batch Title / Description' : 'തടി ബാച്ചിന്റെ പേര്'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1st Grade Teak Planks 2-inch thickness"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Timber Species' : 'തടി ഇനം'}
                </label>
                <select
                  value={species}
                  onChange={(e) => setSpecies(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold bg-white"
                >
                  <option value="Teak (തേക്ക്)">Teak (തേക്ക്)</option>
                  <option value="Anjili (ആഞ്ഞിലി)">Anjili (ആഞ്ഞിലി)</option>
                  <option value="Mahogany (മഹാഗണി)">Mahogany (മഹാഗണി)</option>
                  <option value="Rosewood (ഈട്ടി)">Rosewood (ഈട്ടി)</option>
                  <option value="Jackfruit (പ്ലാവ്)">Jackfruit (പ്ലാവ്)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Cut Type' : 'കട്ടിംഗ് വിഭാഗം'}
                </label>
                <select
                  value={cutType}
                  onChange={(e) => setCutType(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold bg-white"
                >
                  <option value="Rough-sawn Planks">Rough-sawn Planks (പലക)</option>
                  <option value="Squared Beams">Squared Beams (ബീം / കഴുക്കോൽ)</option>
                  <option value="Re-sawn Battens">Re-sawn Battens (റീപ്പർ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Dimensions (Thickness x Width x Length)' : 'അളവുകൾ'}
                </label>
                <input
                  type="text"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold"
                  placeholder='e.g. 2" x 6" x 12ft'
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Volume (CFT)' : 'അളവ് (CFT)'}
                </label>
                <input
                  type="number"
                  value={quantityCft}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    setQuantityCft(val === '' ? 0 : Number(val));
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={1}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {lang === 'en' ? 'Rate per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
                </label>
                <input
                  type="number"
                  value={ratePerCft}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^0+(?=\d)/, '');
                    setRatePerCft(val === '' ? 0 : Number(val));
                  }}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-xs sm:text-sm font-semibold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min={1}
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isSubmittingBatch}
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmittingBatch ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'en' ? 'Publishing...' : 'ചേർക്കുന്നു...'}</span>
                    </>
                  ) : (
                    <span>{lang === 'en' ? 'Save & Publish to Mill Catalog' : 'മില്ല് കാറ്റലോഗിൽ ചേർക്കുക'}</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* SAWN TIMBER INVENTORY LIST */}
      <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#5B6147]" />
            <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
              {lang === 'en' ? 'Sawn Timber & Planks Stock Inventory' : 'മില്ലിലെ അറുത്ത തടികൾ'}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#5B6147]">
            {batches.length} {lang === 'en' ? 'Batches Tracked' : 'ബാച്ചുകൾ'}
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#4A3626] text-sm sm:text-base">
                    {translateWoodTitle(batch.title, lang)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#E7E1D6] text-[#4A3626] text-[10px] font-bold">
                    {translateSpecies(batch.species, lang)}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-semibold">
                    {translateCutType(batch.cutType, lang)}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-3">
                  <span>{lang === 'en' ? 'Dim:' : 'അളവ്:'} <b>{batch.dimensions}</b></span>
                  <span>•</span>
                  <span>{lang === 'en' ? 'Batch:' : 'ബാച്ച്:'} <b className="font-mono">{batch.id}</b></span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-wrap">
                <div className="text-left sm:text-right">
                  <div className="font-mono font-bold text-sm text-[#4A3626]">
                    {batch.quantityCft} {translateUnit('CFT', lang)} @ {formatINR(batch.ratePerCft)}/{translateUnit('CFT', lang)}
                  </div>
                  <div className="text-[11px] text-[#7A5A3A] font-semibold">
                    {lang === 'en' ? 'Est:' : 'ആകെ:'} {formatINR(batch.quantityCft * batch.ratePerCft)}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    batch.status === 'available'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {batch.status === 'available'
                    ? (lang === 'en' ? 'In Stock' : 'ലഭ്യമാണ്')
                    : (lang === 'en' ? 'Sawing in Progress' : 'അറുക്കുന്നു')}
                </span>

                <button
                  type="button"
                  disabled={updatingBatchId === batch.id}
                  onClick={() => handleToggleBatchStatus(batch.id)}
                  className="px-2.5 py-1 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/60 text-[#4A3626] text-xs font-bold transition flex items-center gap-1 disabled:opacity-60"
                  title={lang === 'en' ? 'Update batch stock status' : 'സ്റ്റോക്ക് മാറ്റുക'}
                >
                  {updatingBatchId === batch.id ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#5B6147]" />
                  ) : (
                    <RefreshCw className="w-3 h-3 text-[#5B6147]" />
                  )}
                  <span>
                    {batch.status === 'available'
                      ? (lang === 'en' ? 'Mark Sawing' : 'അറുക്കാൻ മാറ്റുക')
                      : (lang === 'en' ? 'Mark In Stock' : 'സ്റ്റോക്കാക്കുക')}
                  </span>
                </button>
              </div>
            </div>
          ))}
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
    </div>
  );
}
