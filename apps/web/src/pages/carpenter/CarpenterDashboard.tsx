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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';

interface CarpentryEnquiry {
  id: string;
  clientName: string;
  clientPhone: string;
  workType: string;
  timberSpecies: string;
  location: string;
  status: 'new' | 'quoted' | 'in_progress';
  date: string;
}

const DEMO_CARPENTRY_ENQUIRIES: CarpentryEnquiry[] = [
  {
    id: 'enq-c1',
    clientName: 'Mathew Joseph',
    clientPhone: '+91 9847221100',
    workType: 'Traditional Kerala Nalukettu Roof Truss Joinery',
    timberSpecies: 'Anjili & Teak',
    location: 'Changanassery, Kottayam',
    status: 'new',
    date: '2026-10-27',
  },
  {
    id: 'enq-c2',
    clientName: 'Sujith P. K.',
    clientPhone: '+91 9447118833',
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
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider flex items-center gap-1">
              <Hammer className="w-3 h-3" />
              <span>{lang === 'en' ? 'Verified Master Carpenter' : 'അംഗീകൃത വിദഗ്ദ്ധ ആശാരി'}</span>
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>4.9 / 5.0 (28 reviews)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {user?.name || 'Master Binu Achari'}
          </h1>

          <div className="text-xs sm:text-sm text-[#7A5A3A] font-medium flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>+91 {user?.phone || '9847330001'}</span>
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
          </button>
        </div>
      </div>

      {/* IN-DASHBOARD NOTIFICATION FEED */}
      <DashboardNotificationsFeed lang={lang} />

      {/* METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Active Client Inquiries' : 'ലഭിച്ച അന്വേഷണങ്ങൾ'}
          </span>
          <div className="text-2xl font-black font-serif text-[#4A3626]">
            {enquiries.length} <span className="text-xs font-normal text-stone-500">Active</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-semibold">1 New this week</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Service Districts' : 'സേവന മേഖലകൾ'}
          </span>
          <div className="text-2xl font-black font-serif text-[#4A3626]">
            4 <span className="text-xs font-normal text-stone-500">Districts</span>
          </div>
          <p className="text-[10px] text-stone-500">Alappuzha, Kottayam, Pathanamthitta, Ernakulam</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Completed Works' : 'പൂർത്തിയാക്കിയവ'}
          </span>
          <div className="text-2xl font-black font-serif text-[#4A3626]">
            84 <span className="text-xs font-normal text-stone-500">Projects</span>
          </div>
          <p className="text-[10px] text-stone-500">Verified by Timber Owners</p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#8E7F6B]/30 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-[#8E7F6B] uppercase tracking-wider block">
            {lang === 'en' ? 'Directory Status' : 'ഡയറക്ടറി സ്റ്റാറ്റസ്'}
          </span>
          <div className="text-2xl font-black font-serif text-emerald-700 flex items-center gap-1">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>Listed</span>
          </div>
          <p className="text-[10px] text-stone-500">Public Profile Active</p>
        </div>
      </div>

      {/* SPECIALIZATIONS & SKILLS */}
      <div className="p-6 bg-white rounded-3xl border border-stone-300 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
            {lang === 'en' ? 'Carpentry & Joinery Specializations' : 'തടിപ്പണി വൈദഗ്ധ്യങ്ങൾ'}
          </h3>
          <span className="text-xs text-stone-500">Visible on public artisan directory</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {specializations.map((spec, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/30 text-xs font-bold text-[#4A3626]"
            >
              {spec}
            </span>
          ))}
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
          {enquiries.map((enq) => (
            <div
              key={enq.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E7E1D6]/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#4A3626] text-sm sm:text-base">
                    {enq.workType}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#E7E1D6] text-[#4A3626] text-[10px] font-bold">
                    Timber: {enq.timberSpecies}
                  </span>
                </div>
                <div className="text-xs text-stone-500 flex items-center gap-3">
                  <span>Client: <b>{enq.clientName}</b></span>
                  <span>•</span>
                  <span>Location: {enq.location}</span>
                  <span>•</span>
                  <span>Date: {enq.date}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    enq.status === 'new'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {enq.status === 'new'
                    ? (lang === 'en' ? 'New Request' : 'പുതിയത്')
                    : (lang === 'en' ? 'In Progress' : 'പുരോഗമിക്കുന്നു')}
                </span>
                <a
                  href={`tel:${enq.clientPhone}`}
                  className="px-3 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Call' : 'വിളിക്കുക'}</span>
                </a>
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
