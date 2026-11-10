import React, { useState, useEffect } from 'react';
import {
  Hammer,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  User,
  LifeBuoy,
  ShieldCheck,
  Star,
  Award,
  Layers,
  MessageSquare,
  Wrench,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { formatUserProfileId, formatCleanPhone } from '@timora/shared';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';
import { api } from '../../lib/api';
import { getTicketsForUser, markTicketAsRead, SupportTicket } from '../../utils/ticketService';

interface CarpentryEnquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  workType: string;
  timberSpecies: string;
  location: string;
  status: 'new' | 'quoted' | 'in_progress' | 'completed';
  date: string;
}

const DEMO_CARPENTRY_ENQUIRIES: CarpentryEnquiry[] = [
  {
    id: 'enq-c1',
    clientName: 'Mathew Joseph',
    clientPhone: '9847221100',
    workType: 'Traditional Kerala Nalukettu Roof Truss Joinery',
    timberSpecies: 'Anjili & Teak',
    location: 'Changanassery, Kottayam',
    status: 'new',
    date: '2026-10-27',
  },
  {
    id: 'enq-c2',
    clientName: 'Sujith P. K.',
    clientPhone: '9447118833',
    workType: 'Solid Teak Front Door Carving & Seasoning',
    timberSpecies: 'First-Grade Nilambur Teak',
    location: 'Alappuzha Town',
    status: 'in_progress',
    date: '2026-10-22',
  },
];

export function CarpenterDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user, refreshUser } = useAuth();
  const [enquiries, setEnquiries] = useState<CarpentryEnquiry[]>(DEMO_CARPENTRY_ENQUIRIES);
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [updatingEnquiryId, setUpdatingEnquiryId] = useState<string | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getTicketsForUser(user?.phone, 'carpenter')
  );

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getTicketsForUser(user?.phone, 'carpenter'));
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, [user]);

  const [showAdminReply, setShowAdminReply] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`timora_dismissed_admin_reply_${user?.id || 'carpenter'}`) !== 'true';
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
      localStorage.setItem(`timora_dismissed_admin_reply_${user?.id || 'carpenter'}`, 'true');
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

  const handleUpdateEnquiryStatus = async (enquiryId: string, status: 'in_progress' | 'completed') => {
    setUpdatingEnquiryId(enquiryId);
    try {
      await api.patch(`/enquiries/${enquiryId}/status`, { status });
    } catch (err) {
      console.warn('Fallback: updated carpentry enquiry status locally', err);
    } finally {
      setUpdatingEnquiryId(null);
    }
    setEnquiries((prev) =>
      prev.map((e) => (e.id === enquiryId ? { ...e, status } : e))
    );
  };

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, [refreshUser]);
  const [specializations, setSpecializations] = useState([
    'Traditional Kerala Temple & Nalukettu Joinery',
    'Heavy Timber Roof Trusses (കഴുക്കോൽ പണി)',
    'Teak Front Doors & Intricate Wood Carving',
    'Kiln Seasoning & Moisture Testing',
  ]);
  const [newSpec, setNewSpec] = useState('');

  const handleAddSpec = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpec.trim()) return;
    setSpecializations([...specializations, newSpec.trim()]);
    setNewSpec('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-7 animate-fadeIn">
      {/* VERIFICATION STATUS BANNER */}
      <VerificationStatusBanner
        status={user?.approvalStatus || 'APPROVED'}
        role="carpenter"
        entityName={user?.name}
        note={user?.approvalNote}
        lang={lang}
        onRaiseTicket={() => setIsRaiseModalOpen(true)}
      />

      {/* HEADER CARD */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1">
              <Hammer className="w-3 h-3" />
              <span>{lang === 'en' ? 'Verified Master Carpenter' : 'അംഗീകൃത വിദഗ്ദ്ധ ആശാരി'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/80 border border-stone-300 text-[11px] font-mono font-bold text-[#4A3626]">
              {formatUserProfileId(user)}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>4.9 / 5.0 ({lang === 'en' ? '28 reviews' : '28 അഭിപ്രായങ്ങൾ'})</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {user?.name || 'Master Binu Achari'}
          </h1>

          <div className="text-xs sm:text-sm text-[#7A5A3A] font-medium flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{formatCleanPhone(user?.phone || '9847330001')}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{user?.district || 'Alappuzha (ആലപ്പുഴ)'}</span>
            </span>
            <span>•</span>
            <span className="text-[#4A3626] font-semibold">
              {lang === 'en' ? '22 Years Traditional Experience' : '22 വർഷത്തെ പാരമ്പര്യം'}
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

      {/* METRICS */}
      {(() => {
        const activeEnquiriesCount = enquiries.filter((e) => e.status !== 'completed').length;
        const completedWorksCount = enquiries.filter((e) => e.status === 'completed').length;
        const distinctDistricts = Array.from(new Set([user?.district, ...enquiries.map((e) => e.location)].filter(Boolean)));
        const serviceDistrictsCount = distinctDistricts.length > 0 ? distinctDistricts.length : (user?.district ? 1 : 0);
        const isListed = user?.approvalStatus?.toUpperCase() === 'APPROVED';

        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Active Client Inquiries' : 'സജീവ അന്വേഷണങ്ങൾ'}
              </span>
              <div className="text-2xl font-black font-serif text-[#4A3626]">
                {activeEnquiriesCount}{' '}
                <span className="text-xs font-normal text-stone-500">{lang === 'en' ? 'Active' : 'സജീവം'}</span>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">
                {activeEnquiriesCount > 0
                  ? (lang === 'en' ? `${activeEnquiriesCount} Active currently` : `${activeEnquiriesCount} സജീവ അന്വേഷണങ്ങൾ`)
                  : (lang === 'en' ? 'No new inquiries' : 'പുതിയ അന്വേഷണങ്ങൾ ഇല്ല')}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Service Districts' : 'സേവന മേഖലകൾ'}
              </span>
              <div className="text-2xl font-black font-serif text-[#4A3626]">
                {serviceDistrictsCount}{' '}
                <span className="text-xs font-normal text-stone-500">{lang === 'en' ? 'Districts' : 'ജില്ലകൾ'}</span>
              </div>
              <p className="text-[10px] text-stone-500 truncate" title={distinctDistricts.join(', ') || user?.district}>
                {distinctDistricts.length > 0 ? distinctDistricts.join(', ') : (user?.district || (lang === 'en' ? 'Kerala' : 'കേരളം'))}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Completed Works' : 'പൂർത്തിയാക്കിയവ'}
              </span>
              <div className="text-2xl font-black font-serif text-[#4A3626]">
                {completedWorksCount}{' '}
                <span className="text-xs font-normal text-stone-500">{lang === 'en' ? 'Projects' : 'പ്രോജക്ടുകൾ'}</span>
              </div>
              <p className="text-[10px] text-stone-500">
                {lang === 'en' ? 'Verified by Timber Owners' : 'തടി ഉടമകൾ സാക്ഷ്യപ്പെടുത്തിയത്'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
                {lang === 'en' ? 'Directory Status' : 'ഡയറക്ടറി സ്റ്റാറ്റസ്'}
              </span>
              <div className={`text-2xl font-black font-serif flex items-center gap-1 ${isListed ? 'text-emerald-700' : 'text-amber-700'}`}>
                <ShieldCheck className={`w-5 h-5 ${isListed ? 'text-emerald-600' : 'text-amber-600'}`} />
                <span>{isListed ? (lang === 'en' ? 'Listed' : 'ലിസ്റ്റ് ചെയ്തു') : (lang === 'en' ? 'Under Review' : 'പരിശോധനയിൽ')}</span>
              </div>
              <p className="text-[10px] text-stone-500">
                {isListed
                  ? (lang === 'en' ? 'Public Profile Active' : 'പ്രൊഫൈൽ സജീവം')
                  : (lang === 'en' ? 'Verification Pending' : 'അംഗീകാരം കാക്കുന്നു')}
              </p>
            </div>
          </div>
        );
      })()}

      {/* SPECIALIZATIONS & SKILLS */}
      <div className="p-6 bg-white rounded-3xl border border-stone-300 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
            {lang === 'en' ? 'Carpentry & Joinery Specializations' : 'തടിപ്പണി വൈദഗ്ധ്യങ്ങൾ'}
          </h3>
          <span className="text-xs text-stone-500">
            {lang === 'en' ? 'Visible on public artisan directory' : 'പൊതു ഡയറക്ടറിയിൽ ലഭ്യമാണ്'}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {specializations.map((spec, i) => {
            const specTranslations: Record<string, string> = {
              'Traditional Kerala Temple & Nalukettu Joinery': 'പരമ്പരാഗത നാലുകെട്ട്, അമ്പല നിർമ്മാണം',
              'Heavy Timber Roof Trusses (കഴുക്കോൽ പണി)': 'മേൽക്കൂര കഴുക്കോൽ പണി',
              'Teak Front Doors & Intricate Wood Carving': 'തേക്ക് കൊത്തുപണി മുൻവാതിലുകൾ',
              'Kiln Seasoning & Moisture Testing': 'തടി ഉണക്കലും ഈർപ്പ പരിശോധനയും',
            };
            return (
              <span
                key={i}
                className="px-3 py-1.5 rounded-xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/30 text-xs font-bold text-[#4A3626]"
              >
                {lang === 'ml' && specTranslations[spec] ? specTranslations[spec] : spec}
              </span>
            );
          })}
        </div>

        <form onSubmit={handleAddSpec} className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder={lang === 'en' ? 'Add skill or joinery specialization...' : 'പുതിയ വൈദഗ്ധ്യം ചേർക്കുക...'}
            value={newSpec}
            onChange={(e) => setNewSpec(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-xl text-xs font-semibold"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs rounded-xl shadow-xs transition"
          >
            {lang === 'en' ? 'Add Skill' : 'ചേർക്കുക'}
          </button>
        </form>
      </div>

      {/* INBOUND CLIENT INQUIRIES */}
      <div className="bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#5B6147]" />
            <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
              {lang === 'en' ? 'Incoming Carpentry Work Enquiries' : 'ലഭിച്ച അന്വേഷണങ്ങൾ'}
            </h3>
          </div>
          <span className="text-xs font-bold text-[#5B6147]">
            {enquiries.length} {lang === 'en' ? 'Client Requests' : 'എണ്ണം'}
          </span>
        </div>

        <div className="divide-y divide-stone-200">
          {enquiries.map((enq) => {
            const workTypeMl: Record<string, string> = {
              'Traditional Kerala Nalukettu Roof Truss Joinery': 'പരമ്പരാഗത നാലുകെട്ട് മേൽക്കൂര നിർമ്മാണം',
              'Solid Teak Front Door Carving & Seasoning': 'തേക്ക് തടി വാതിൽ കൊത്തുപണികൾ',
            };
            const timberMl: Record<string, string> = {
              'Anjili & Teak': 'ആഞ്ഞിലി, തേക്ക്',
              'First-Grade Nilambur Teak': 'ഒന്നാം തരം നിലമ്പൂർ തേക്ക്',
            };
            const locationMl: Record<string, string> = {
              'Changanassery, Kottayam': 'ചങ്ങനാശ്ശേരി, കോട്ടയം',
              'Alappuzha Town': 'ആലപ്പുഴ ടൗൺ',
            };

            return (
              <div
                key={enq.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#4A3626] text-sm sm:text-base">
                      {lang === 'ml' && workTypeMl[enq.workType] ? workTypeMl[enq.workType] : enq.workType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#E7E1D6] text-[#4A3626] text-[10px] font-bold">
                      {lang === 'en' ? 'Timber' : 'തടി'}: {lang === 'ml' && timberMl[enq.timberSpecies] ? timberMl[enq.timberSpecies] : enq.timberSpecies}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-3">
                    <span>{lang === 'en' ? 'Client' : 'ഉപഭോക്താവ്'}: <b>{enq.clientName}</b></span>
                    <span>•</span>
                    <span>{lang === 'en' ? 'Location' : 'സ്ഥലം'}: {lang === 'ml' && locationMl[enq.location] ? locationMl[enq.location] : enq.location}</span>
                    <span>•</span>
                    <span>{lang === 'en' ? 'Date' : 'തീയതി'}: {enq.date}</span>
                  </div>
                </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    enq.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : enq.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {enq.status === 'completed'
                    ? (lang === 'en' ? 'Completed & Done' : 'പൂർത്തിയായി')
                    : enq.status === 'in_progress'
                    ? (lang === 'en' ? 'In Progress' : 'പുരോഗമിക്കുന്നു')
                    : (lang === 'en' ? 'New Request' : 'പുതിയത്')}
                </span>

                {enq.status === 'in_progress' && (
                  <button
                    type="button"
                    disabled={updatingEnquiryId === enq.id}
                    onClick={() => handleUpdateEnquiryStatus(enq.id, 'completed')}
                    className="px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-60"
                  >
                    {updatingEnquiryId === enq.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'en' ? 'Updating...' : 'പൂർത്തിയാക്കുന്നു...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Mark Done' : 'പൂർത്തിയായി'}</span>
                      </>
                    )}
                  </button>
                )}

                {enq.status === 'new' && (
                  <button
                    type="button"
                    disabled={updatingEnquiryId === enq.id}
                    onClick={() => handleUpdateEnquiryStatus(enq.id, 'in_progress')}
                    className="px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs shadow-xs transition flex items-center gap-1 disabled:opacity-60"
                  >
                    {updatingEnquiryId === enq.id ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{lang === 'en' ? 'Accepting...' : 'സ്വീകരിക്കുന്നു...'}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Accept Work' : 'പണി സ്വീകരിക്കുക'}</span>
                      </>
                    )}
                  </button>
                )}

                <a
                  href={`tel:${enq.clientPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#4A3626] font-bold text-xs transition flex items-center gap-1 border border-stone-300"
                >
                  <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
                  <span>{lang === 'en' ? 'Call' : 'വിളിക്കുക'}</span>
                </a>
              </div>
            </div>
          );
        })}
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
