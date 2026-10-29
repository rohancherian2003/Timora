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
} from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { VerificationStatusBanner } from '../../components/VerificationStatusBanner';
import { getTicketsForUser, SupportTicket } from '../../utils/ticketService';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';

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

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getTicketsForUser(user?.phone, 'seller'));
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, [user]);

  const latestResolvedTicket = tickets.find((t) => t.status === 'resolved' && t.resolutionReply);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowAddForm(false);
      setSubmitted(false);
      setTitle('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn">
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
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#8E7F6B] hover:text-[#4A3626] font-bold px-2 py-1 rounded-lg hover:bg-[#E7E1D6]/50 transition"
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

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition"
              >
                {lang === 'en' ? 'Submit Listing for Approval' : 'അംഗീകാരത്തിനായി ലിസ്റ്റിംഗ് സമർപ്പിക്കുക'}
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
