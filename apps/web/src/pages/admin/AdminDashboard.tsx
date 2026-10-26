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
  Tag
} from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getStoredTickets, resolveTicket, SupportTicket } from '../../utils/ticketService';

const DEMO_PENDING_SELLERS = [
  {
    id: 'sel-1',
    name: 'M. V. Varghese',
    phone: '+919847120001',
    business_name: 'Varghese Timber Depot',
    district: 'Kottayam (കോട്ടയം)',
    locality: 'Ettumanoor',
    registered_at: '2026-10-25 14:30',
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

export function AdminDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'sellers' | 'listings' | 'tickets' | 'audit'>('sellers');
  const [sellers, setSellers] = useState(DEMO_PENDING_SELLERS);
  const [listings, setListings] = useState(DEMO_PENDING_LISTINGS);
  const [tickets, setTickets] = useState<SupportTicket[]>(getStoredTickets());
  const [ticketFilter, setTicketFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [message, setMessage] = useState<string | null>(null);

  // Reply modal state for resolving tickets
  const [replyTicket, setReplyTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getStoredTickets());
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, []);

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;

  const handleResolveTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyTicket || !replyText.trim()) return;

    resolveTicket(replyTicket.id, replyText.trim());
    setTickets(getStoredTickets());
    setMessage(
      lang === 'en'
        ? `Ticket ${replyTicket.id} resolved and solution reply sent to user dashboard!`
        : `ടിക്കറ്റ് ${replyTicket.id} പരിഹരിച്ച് ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിലേക്ക് അയച്ചു!`
    );
    setReplyTicket(null);
    setReplyText('');
  };

  const handleApproveSeller = (id: string) => {
    setSellers((prev) => prev.filter((s) => s.id !== id));
    setMessage(lang === 'en' ? 'Seller approved successfully!' : 'കച്ചവടക്കാരനെ വിജയകരമായി അംഗീകരിച്ചു!');
  };

  const handleRejectSeller = (id: string) => {
    setSellers((prev) => prev.filter((s) => s.id !== id));
    setMessage(lang === 'en' ? 'Seller registration rejected.' : 'കച്ചവടക്കാരന്റെ അപേക്ഷ നിരസിച്ചു.');
  };

  const handleApproveListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setMessage(lang === 'en' ? 'Timber listing approved and published to marketplace.' : 'തടി ലിസ്റ്റിംഗ് അംഗീകരിച്ച് വിപണിയിൽ പ്രസിദ്ധീകരിച്ചു.');
  };

  const handleRejectListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setMessage(lang === 'en' ? 'Listing rejected with recorded reason.' : 'ലിസ്റ്റിംഗ് കാരണം രേഖപ്പെടുത്തി നിരസിച്ചു.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] rounded-3xl border border-[#ebd5bc] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#854d0e] text-xs font-semibold backdrop-blur-sm border border-amber-600/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#2c160b] flex items-center gap-2.5">
            {lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6b472e] mt-1 font-medium">
            {lang === 'en'
              ? 'Approve timber merchant accounts, review actual stock photos, and inspect append-only audit trails.'
              : 'കച്ചവടക്കാരുടെ അക്കൗണ്ടുകൾ, തടികളുടെ ഫോട്ടോകൾ എന്നിവ പരിശോധിച്ച് അംഗീകരിക്കുക.'}
          </p>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl bg-[#2c160b] text-amber-200 text-xs font-mono font-bold shadow-xs">
          ADMIN CONSOLE
        </span>
      </div>

      {message && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-amber-200/80 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('sellers')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'sellers'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {lang === 'en' ? 'Pending Sellers' : 'കച്ചവടക്കാരുടെ അപേക്ഷകൾ'} ({sellers.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          {lang === 'en' ? 'Listing Moderation Queue' : 'തടി അനുമതി ക്യൂ'} ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'tickets'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>{lang === 'en' ? 'Support Tickets' : 'പരാതികൾ (Grievances)'}</span>
          {openTicketsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px] animate-pulse">
              {openTicketsCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          {lang === 'en' ? 'Audit Logs (Append-Only)' : 'ഓഡിറ്റ് ലോഗുകൾ'}
        </button>
      </div>

      {/* Sellers Queue */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          {sellers.length === 0 ? (
            <div className="bg-white rounded-3xl border border-amber-200/80 p-8 text-center text-xs text-stone-500">
              {lang === 'en' ? 'No pending seller onboarding requests.' : 'പുതിയ അപേക്ഷകൾ ഒന്നും ബാക്കിയില്ല.'}
            </div>
          ) : (
            sellers.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-extrabold font-serif text-[#2c160b] text-base">{s.business_name}</h3>
                  <div className="text-xs text-stone-600 mt-1">
                    Contact: {s.name} ({s.phone}) · {s.locality}, {s.district}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Applied: {s.registered_at}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveSeller(s.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Approve Seller' : 'അംഗീകരിക്കുക'}
                  </button>
                  <button
                    onClick={() => handleRejectSeller(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Reject' : 'നിരസിക്കുക'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Listings Queue */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-amber-200/80 p-8 text-center text-xs text-stone-500">
              {lang === 'en' ? 'All submitted timber stock has been moderated.' : 'എല്ലാ തടികളും പരിശോധിച്ചു കഴിഞ്ഞു.'}
            </div>
          ) : (
            listings.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309]">
                    {l.species} · {l.image_count} Photos Attached
                  </span>
                  <h3 className="font-extrabold font-serif text-[#2c160b] text-base mt-0.5">{l.title}</h3>
                  <div className="text-xs text-stone-600 mt-1">
                    Seller: {l.seller_name} · {l.quantity} {l.unit} · {formatINR(l.price_per_cft)} / CFT
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">Submitted: {l.submitted_at}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveListing(l.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Approve & Publish' : 'അംഗീകരിച്ച് പ്രസിദ്ധീകരിക്കുക'}
                  </button>
                  <button
                    onClick={() => handleRejectListing(l.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Reject with Reason' : 'കാരണം കാണിച്ച് നിരസിക്കുക'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Support Tickets Queue */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">
                {lang === 'en' ? 'Filter Tickets:' : 'ഫിൽട്ടർ:'}
              </span>
              <div className="flex items-center gap-1.5">
                {(['all', 'open', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTicketFilter(f)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition capitalize ${
                      ticketFilter === f
                        ? 'bg-[#b45309] text-white shadow-xs'
                        : 'bg-white border border-amber-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {f === 'all'
                      ? lang === 'en'
                        ? 'All Tickets'
                        : 'എല്ലാം'
                      : f === 'open'
                      ? lang === 'en'
                        ? 'Open / Pending'
                        : 'പരിഹരിക്കാനുള്ളവ'
                      : lang === 'en'
                      ? 'Resolved'
                      : 'പരിഹരിച്ചവ'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {tickets.filter((t) => (ticketFilter === 'all' ? true : t.status === ticketFilter)).length === 0 ? (
            <div className="bg-white rounded-3xl border border-amber-200/80 p-8 text-center text-xs text-stone-500">
              {lang === 'en' ? 'No tickets found in this filter.' : 'പരാതികൾ ഒന്നും ലഭ്യമല്ല.'}
            </div>
          ) : (
            tickets
              .filter((t) => (ticketFilter === 'all' ? true : t.status === ticketFilter))
              .map((t) => (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-100 text-[#78350f] border border-amber-300">
                        {t.id}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                        {t.role === 'buyer'
                          ? 'Buyer / House Owner'
                          : t.role === 'seller'
                          ? 'Timber Merchant'
                          : t.role === 'carpenter'
                          ? 'Master Carpenter'
                          : 'Mill Owner'}
                      </span>
                      {t.priority === 'urgent' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 animate-pulse">
                          Urgent
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${
                          t.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100 text-[#78350f] border border-amber-300'
                        }`}
                      >
                        {t.status === 'resolved' ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{lang === 'en' ? 'Resolved' : 'പരിഹരിച്ചു'}</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-[#b45309]" />
                            <span>{lang === 'en' ? 'Pending Action' : 'നടപടി കാത്തിരിക്കുന്നു'}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">{t.createdAt}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-500 font-semibold mb-0.5">
                      {lang === 'en' ? 'Complainant:' : 'പരാതിക്കാരൻ:'}{' '}
                      <strong className="text-stone-900">{t.name}</strong> (📞 +91 {t.phone})
                    </div>
                    <h3 className="font-extrabold font-serif text-[#2c160b] text-base">
                      {lang === 'en' ? t.category : t.categoryMl}
                    </h3>
                    <p className="text-xs text-stone-700 mt-1.5 leading-relaxed bg-[#faf6ee] p-3 rounded-xl border border-amber-200/60 font-medium">
                      "{t.description}"
                    </p>
                  </div>

                  {/* If Resolved, show Admin resolution reply */}
                  {t.status === 'resolved' && t.resolutionReply && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-emerald-900 font-bold">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>
                            {lang === 'en'
                              ? 'Admin Solution Reply (Sent to Dashboard):'
                              : 'അഡ്മിൻ നൽകിയ പരിഹാരം (ഡാഷ്‌ബോർഡിൽ അറിയിച്ചത്):'}
                          </span>
                        </span>
                        <span className="text-[10px] text-emerald-700 font-normal">
                          {t.resolvedAt}
                        </span>
                      </div>
                      <p className="text-stone-800 text-xs italic pl-5">
                        "{t.resolutionReply}"
                      </p>
                    </div>
                  )}

                  {/* If Open, show action button to resolve */}
                  {t.status === 'open' && (
                    <div className="pt-2 flex items-center justify-end">
                      <button
                        onClick={() => {
                          setReplyTicket(t);
                          setReplyText(
                            lang === 'en'
                              ? 'Issue verified with merchant. Resolution initiated.'
                              : 'അന്വേഷണത്തിൽ വ്യാപാരിയുമായി സംസാരിച്ചു. നടപടികൾ ആരംഭിച്ചു.'
                          );
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold shadow-sm transition"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>
                          {lang === 'en'
                            ? 'Resolve & Send Solution Reply'
                            : 'പരിഹാരം അയക്കുക (Resolve & Reply)'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* RESOLUTION REPLY MODAL */}
      {replyTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-amber-300/80 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#b45309]">
                  Send Solution to User Dashboard
                </span>
                <h3 className="font-extrabold font-serif text-[#2c160b] text-base">
                  Ticket {replyTicket.id} · {replyTicket.name}
                </h3>
              </div>
              <button
                onClick={() => setReplyTicket(null)}
                className="text-stone-400 hover:text-stone-700 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#faf6ee] rounded-xl border border-amber-200 text-xs text-stone-700">
              <span className="font-bold text-stone-900 block mb-0.5">Issue:</span>
              <p className="italic">"{replyTicket.description}"</p>
            </div>

            <form onSubmit={handleResolveTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === 'en'
                    ? 'Resolution Solution Message (This will pop up on their dashboard):'
                    : 'നൽകുന്ന പരിഹാര സന്ദേശം (ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിൽ നോട്ടിഫിക്കേഷനായി കാണിക്കും):'}
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300/80 bg-[#faf6ee]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#b45309]"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReplyTicket(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Solution & Mark Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-sm space-y-3 font-mono text-xs">
          <div className="p-3 bg-[#faf6ee] border border-amber-200/80 rounded-xl flex items-center justify-between">
            <span className="text-[#2c160b] font-bold">[APPROVE_SELLER] Nilambur Wood Works (seller_profile)</span>
            <span className="text-stone-400">Actor: Admin (Super) · 2026-10-25 15:10</span>
          </div>
          <div className="p-3 bg-[#faf6ee] border border-amber-200/80 rounded-xl flex items-center justify-between">
            <span className="text-[#2c160b] font-bold">[APPROVE_LISTING] First-Grade Nilambur Teak Planks (timber_listing)</span>
            <span className="text-stone-400">Actor: Admin (Super) · 2026-10-25 15:12</span>
          </div>
        </div>
      )}
    </div>
  );
}
