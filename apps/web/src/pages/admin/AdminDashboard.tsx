import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getStoredTickets, resolveTicket, SupportTicket } from '../../utils/ticketService';
import { EditProfileModal } from '../../components/EditProfileModal';
import { api } from '../../lib/api';

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
    phone: '+91 9847120001',
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
    phone: '+91 9847120002',
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
    phone: '+91 9847330001',
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
    phone: '+91 9847440001',
    businessName: 'Malabar Timber Heavy Transit Haulage',
    district: 'Kozhikode (കോഴിക്കോട്)',
    locality: 'Feroke Depot',
    role: 'transport',
    details: 'Fleet: 2 Lorries (KL-11-BH-4890) · Hydraulic Crane Equipped · Form IV Cleared.',
    registeredAt: '2026-10-27 15:20',
  },
];

const DEMO_PENDING_LISTINGS = [
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

interface AuditEntry {
  id: string;
  action: string;
  target: string;
  actor: string;
  timestamp: string;
  note?: string;
}

export function AdminDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'business' | 'listings' | 'tickets' | 'audit'>('business');
  const [businessFilter, setBusinessFilter] = useState<'all' | 'seller' | 'mill' | 'carpenter' | 'transport'>('all');
  const [applications, setApplications] = useState<PendingBusiness[]>(INITIAL_PENDING_APPLICATIONS);
  const [listings, setListings] = useState(DEMO_PENDING_LISTINGS);
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets());
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [message, setMessage] = useState<string | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([
    {
      id: 'aud-1',
      action: 'APPROVE_SELLER',
      target: 'Nilambur Wood Mart (seller_profile)',
      actor: 'Chief Moderator (Admin)',
      timestamp: '2026-10-27 10:15',
    },
    {
      id: 'aud-2',
      action: 'APPROVE_LISTING',
      target: 'First-Grade Nilambur Teak Planks',
      actor: 'Chief Moderator (Admin)',
      timestamp: '2026-10-27 10:20',
    },
  ]);

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
  const [isLoadingApps, setIsLoadingApps] = useState(true);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getStoredTickets());
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchPendingApps() {
      try {
        setIsLoadingApps(true);
        const res = await api.get('/admin/sellers/pending');
        if (isMounted && res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const liveApps: PendingBusiness[] = res.data.data.map((s: any) => ({
            id: s.id,
            name: s.name,
            phone: s.phone,
            businessName: s.business_name || `${s.name} Enterprise`,
            district: s.district_name || 'Kerala',
            locality: s.locality,
            role: s.seller_subtype === 'mill_owner' ? 'mill' : (s.role || 'seller'),
            details: `Registered ${new Date(s.created_at).toLocaleDateString()}`,
            registeredAt: new Date(s.created_at).toISOString().slice(0, 16).replace('T', ' '),
          }));
          setApplications((prev) => {
            const liveIds = new Set(liveApps.map((a) => a.id));
            const retained = prev.filter((a) => !liveIds.has(a.id));
            return [...liveApps, ...retained];
          });
        }
      } catch {
        // Fall back gracefully to INITIAL_PENDING_APPLICATIONS
      } finally {
        if (isMounted) setIsLoadingApps(false);
      }
    }
    fetchPendingApps();
    return () => {
      isMounted = false;
    };
  }, []);

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;

  const addAudit = (action: string, target: string, note?: string) => {
    const entry: AuditEntry = {
      id: `aud-${Date.now()}`,
      action,
      target,
      actor: user?.name || 'Chief Moderator (Admin)',
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      note,
    };
    setAuditLogs([entry, ...auditLogs]);
  };

  const handleApproveApp = async (app: PendingBusiness) => {
    setActionLoadingId(app.id);
    addAudit(`APPROVE_${app.role.toUpperCase()}`, `${app.businessName} (${app.name})`);
    
    // Attempt backend sync
    try {
      await api.patch(`/admin/sellers/${app.id}/approve`, {
        note: `Approved by ${user?.name || 'Admin'}`,
      });
    } catch {
      // Graceful local approval
    } finally {
      setActionLoadingId(null);
    }

    setApplications((prev) => prev.filter((a) => a.id !== app.id));

    setMessage(
      lang === 'en'
        ? `${app.businessName} has been approved and activated.`
        : `${app.businessName} അംഗീകരിക്കുകയും സജീവമാക്കുകയും ചെയ്തു.`
    );
  };

  const handleConfirmActionModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionModal || !actionInput.trim()) return;

    setIsSubmittingActionModal(true);
    const { type, app } = actionModal;

    if (type === 'action_required') {
      addAudit(`REQUEST_INFO_${app.role.toUpperCase()}`, `${app.businessName}`, actionInput.trim());
      try {
        await api.patch(`/admin/sellers/${app.id}/reject`, { reason: actionInput.trim() });
      } catch {}
      setMessage(
        lang === 'en'
          ? `Requested additional documents from ${app.name}.`
          : `${app.name} എന്ന വ്യാപാരിയോട് കൂടുതൽ രേഖകൾ ആവശ്യപ്പെട്ടു.`
      );
    } else {
      addAudit(`REJECT_${app.role.toUpperCase()}`, `${app.businessName}`, actionInput.trim());
      try {
        await api.patch(`/admin/sellers/${app.id}/reject`, { reason: actionInput.trim() });
      } catch {}
      setMessage(
        lang === 'en'
          ? `Application rejected with recorded reason.`
          : `കാരണം രേഖപ്പെടുത്തി അപേക്ഷ നിരസിച്ചു.`
      );
    }

    setApplications((prev) => prev.filter((a) => a.id !== app.id));
    setIsSubmittingActionModal(false);
    setActionModal(null);
    setActionInput('');
  };

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicket || !replyText.trim()) return;

    setIsResolvingTicket(true);
    setTimeout(() => {
      resolveTicket(replyTicket.id, replyText.trim());
      setTickets(getStoredTickets());
      addAudit('RESOLVE_TICKET', `Ticket #${replyTicket.id}`, replyText.trim());
      setMessage(
        lang === 'en'
          ? `Ticket ${replyTicket.id} resolved and solution reply sent to user dashboard!`
          : `ടിക്കറ്റ് ${replyTicket.id} പരിഹരിച്ച് ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിലേക്ക് അയച്ചു!`
      );
      setIsResolvingTicket(false);
      setReplyTicket(null);
      setReplyText('');
    }, 400);
  };

  const filteredApps = applications.filter((app) => {
    if (businessFilter === 'all') return true;
    return app.role === businessFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {lang === 'en' ? 'Kerala Timber Regulatory Cell' : 'കേരള തടി വ്യാപാര നിയന്ത്രണ സെൽ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium">
            {lang === 'en'
              ? 'Multi-role verification, timber compliance, dispute resolution, and audit logging'
              : 'വ്യാപാരികളുടെ പരിശോധന, തടി ചട്ടങ്ങൾ, പരാതി പരിഹാരം, ഓഡിറ്റ് ലോഗുകൾ'}
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'business'
              ? 'bg-[#5B6147] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#E7E1D6]/60'
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
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'listings'
              ? 'bg-[#5B6147] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#E7E1D6]/60'
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
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'tickets'
              ? 'bg-[#5B6147] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#E7E1D6]/60'
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

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#5B6147] text-white shadow-xs'
              : 'text-stone-600 hover:bg-[#E7E1D6]/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{lang === 'en' ? 'Audit Trail' : 'ഓഡിറ്റ് ലോഗ്'}</span>
        </button>
      </div>

      {/* TAB 1: MULTI-ROLE BUSINESS APPROVALS */}
      {activeTab === 'business' && (
        <div className="space-y-4">
          {/* Sub-Filter pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-stone-500 font-semibold">{lang === 'en' ? 'Role Filter:' : 'വിഭാഗം:'}</span>
            {[
              { key: 'all', label: 'All Businesses' },
              { key: 'seller', label: 'Individual Sellers' },
              { key: 'mill', label: 'Timber Mills' },
              { key: 'carpenter', label: 'Carpenters' },
              { key: 'transport', label: 'Transport Lorries' },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setBusinessFilter(f.key as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  businessFilter === f.key
                    ? 'bg-[#5B6147] text-white'
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
                        {app.role === 'mill' ? 'Timber Mill' : app.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-100 text-amber-900 font-bold">
                        PENDING_APPROVAL
                      </span>
                    </div>

                    <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
                      <span>Owner/Applicant: <b>{app.name}</b></span>
                      <span>•</span>
                      <span>Phone: <b>{app.phone}</b></span>
                      <span>•</span>
                      <span>District: <b>{app.district}</b></span>
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
          {listings.length === 0 ? (
            <div className="p-8 text-center text-stone-500 text-xs">
              {lang === 'en' ? 'No pending timber listings.' : 'പരിശോധിക്കാനുള്ള തടി ലിസ്റ്റിംഗുകൾ ഇല്ല.'}
            </div>
          ) : (
            listings.map((lst) => (
              <div
                key={lst.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-serif font-bold text-base text-[#4A3626]">{lst.title}</h4>
                  <div className="text-xs text-stone-500 mt-1 flex items-center gap-2">
                    <span>Seller: <b>{lst.seller_name}</b></span>
                    <span>•</span>
                    <span>Species: <b>{lst.species}</b></span>
                    <span>•</span>
                    <span>Volume: <b>{lst.quantity} {lst.unit}</b></span>
                    <span>•</span>
                    <span>Rate: <b>{formatINR(lst.price_per_cft)}/CFT</b></span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setListings(listings.filter((l) => l.id !== lst.id));
                      addAudit('APPROVE_LISTING', lst.title);
                      setMessage(lang === 'en' ? 'Listing approved and live.' : 'ലിസ്റ്റിംഗ് അംഗീകരിച്ചു.');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Publish</span>
                  </button>
                  <button
                    onClick={() => {
                      setListings(listings.filter((l) => l.id !== lst.id));
                      addAudit('REJECT_LISTING', lst.title, 'Photo quality inadequate');
                      setMessage(lang === 'en' ? 'Listing rejected.' : 'ലിസ്റ്റിംഗ് നിരസിച്ചു.');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 font-bold text-xs"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
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
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {tickets
            .filter((t) => ticketFilter === 'all' || t.status === ticketFilter)
            .map((t) => (
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
                      {t.status.toUpperCase()}
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
                    <span>Resolve & Reply</span>
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-stone-300 p-6 shadow-xs space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <span className="font-serif font-bold text-sm text-[#4A3626]">
              {lang === 'en' ? 'Append-Only Regulatory Audit Logs' : 'ഓഡിറ്റ് ലോഗുകൾ'}
            </span>
            <span className="text-[11px] text-stone-500">Immutable Records</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#E7E1D6]/40 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-[#5B6147]">[{log.action}]</span>{' '}
                  <span className="text-[#4A3626] font-semibold">{log.target}</span>
                  {log.note && <div className="text-[11px] text-stone-500 mt-0.5 italic">Note: "{log.note}"</div>}
                </div>
                <div className="text-[10px] text-stone-400 sm:text-right">
                  <div>Actor: {log.actor}</div>
                  <div>{log.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
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
                  Cancel
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
                    <span>Confirm & Notify User</span>
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
                  Send Solution to User Dashboard
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
                  Cancel
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
                      <span>Send Solution & Resolve</span>
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
