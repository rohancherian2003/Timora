import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  MessageSquare,
  Heart,
  Clock,
  CheckCircle2,
  ChevronRight,
  Trees,
  User,
  MapPin,
  LifeBuoy,
  ShieldCheck,
  AlertCircle,
  Plus,
  Star,
  Loader2,
} from 'lucide-react';
import { formatINR, formatUserProfileId, formatCleanPhone } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getTicketsForUser, markTicketAsRead, SupportTicket } from '../../utils/ticketService';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { SubmitReviewModal } from '../../components/SubmitReviewModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';
import { api } from '../../lib/api';
import {
  translateWoodTitle,
  translateTicketCategory,
  translateTicketStatus,
  translateSpecies,
  translateUnit,
} from '../../utils/i18n';
import { ValidatedSearchInput } from '../../components/ValidatedSearchInput';

const DEMO_BUYER_ORDERS = [
  {
    id: 'ord-101',
    listing_title: 'First-Grade Nilambur Teak Planks',
    species: 'Teak (തേക്ക്)',
    seller_name: 'Nilambur Wood Works',
    agreed_qty: 15,
    unit: 'CFT',
    agreed_price: 42000,
    status: 'delivered_pending', // waiting for buyer confirmation
    ordered_at: '2026-10-24',
  },
  {
    id: 'ord-102',
    listing_title: 'Anjili Wild Jack Sawn Beams',
    species: 'Anjili (ആഞ്ഞിലി)',
    seller_name: 'Perumbavoor Saw Mills',
    agreed_qty: 30,
    unit: 'CFT',
    agreed_price: 42000,
    status: 'completed',
    ordered_at: '2026-10-18',
  },
];

const DEMO_SAVED_LISTINGS = [
  {
    id: 'fav-1',
    title: 'Seasoned African Mahogany Squared Beams',
    price_per_cft: 1850,
    district: 'Kottayam (കോട്ടയം)',
    species: 'Mahogany (മഹാഗണി)',
  },
];

export function BuyerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'enquiries' | 'wishlist' | 'tickets'>('orders');
  const [tickets, setTickets] = useState<SupportTicket[]>(() =>
    getTicketsForUser(user?.phone, 'buyer')
  );
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showAdminReply, setShowAdminReply] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`timora_dismissed_admin_reply_${user?.id || 'buyer'}`) !== 'true';
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
  const [liveOrders, setLiveOrders] = useState<any[]>(DEMO_BUYER_ORDERS);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [confirmingOrderId, setConfirmingOrderId] = useState<string | null>(null);
  const [selectedReviewOrder, setSelectedReviewOrder] = useState<{
    id: string;
    sellerId: string;
    sellerName: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchOrders() {
      try {
        setIsLoadingOrders(true);
        const res = await api.get('/orders');
        if (isMounted && res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const mapped = res.data.data.map((o: any) => ({
            id: o.id,
            listing_title: o.snapshot?.title || 'Timber Batch',
            species: o.snapshot?.species || 'Teak',
            seller_name: o.snapshot?.seller_name || o.snapshot?.business_name || 'Timber Depot',
            agreed_qty: o.agreed_qty,
            unit: o.snapshot?.unit || 'CFT',
            agreed_price: o.agreed_price,
            status: o.status,
            ordered_at: o.created_at ? new Date(o.created_at).toISOString().slice(0, 10) : '2026-10-24',
          }));
          setLiveOrders(mapped);
        }
      } catch {
        // Fall back gracefully to DEMO_BUYER_ORDERS
      } finally {
        if (isMounted) setIsLoadingOrders(false);
      }
    }
    fetchOrders();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleConfirmDelivery = async (orderId: string) => {
    setConfirmingOrderId(orderId);
    try {
      await api.patch(`/orders/${orderId}/confirm-delivery`);
    } catch (err) {
      console.warn('Fallback: confirmed order delivery locally', err);
    } finally {
      setConfirmingOrderId(null);
    }
    setLiveOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
    );
  };

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleUpdate = () => {
      setTickets(getTicketsForUser(user?.phone, 'buyer'));
    };
    window.addEventListener('timora_tickets_updated', handleUpdate);
    return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
  }, [user]);

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
      localStorage.setItem(`timora_dismissed_admin_reply_${user?.id || 'buyer'}`, 'true');
    } catch {}
  };

  // Find latest resolved ticket to show as notification popup/banner
  const latestResolvedTicket = showAdminReply
    ? tickets.find(
        (t) =>
          t.status === 'resolved' &&
          t.resolutionReply &&
          !dismissedTicketIds.includes(t.id)
      ) || null
    : null;

  // Unread resolved tickets counter for notification badge
  const unreadTicketsCount = tickets.filter(
    (t) => !t.isRead && (t.status === 'resolved' || Boolean(t.resolutionReply))
  ).length;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredLiveOrders = liveOrders.filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (order.listing_title || '').toLowerCase().includes(q) ||
      (order.species_name || '').toLowerCase().includes(q) ||
      (order.seller_name || '').toLowerCase().includes(q) ||
      (order.id || '').toLowerCase().includes(q)
    );
  });

  // Auto-clear unread notification badge once user views the resolved reply
  useEffect(() => {
    if (activeTab === 'tickets' || latestResolvedTicket) {
      const unreadTickets = tickets.filter(
        (t) => !t.isRead && (t.status === 'resolved' || Boolean(t.resolutionReply))
      );
      if (unreadTickets.length > 0) {
        unreadTickets.forEach(async (t) => {
          markTicketAsRead(t.id);
          try {
            await api.patch(`/support/tickets/${t.id}/read`);
          } catch {
            // Silently handled in local fallback
          }
        });
      }
    }
  }, [activeTab, latestResolvedTicket, tickets]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Welcome Bar */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider">
              {lang === 'en' ? 'Verified Buyer Account' : 'ഉപഭോക്തൃ പ്രൊഫൈൽ'}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/80 border border-stone-300 text-[11px] font-mono font-bold text-[#4A3626]">
              {formatUserProfileId(user)}
            </span>
            <span className="text-xs text-[#4A3626] font-mono font-medium">{formatCleanPhone(user?.phone || '9847987654')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]">
            {lang === 'en' ? `Welcome, ${user?.name || 'Timber Buyer'}` : `സ്വാഗതം, ${user?.name || 'ഉപഭോക്താവ്'}`}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium">
            {lang === 'en'
              ? 'Track your ongoing timber orders, negotiate enquiries, and view saved stock.'
              : 'നിങ്ങളുടെ തടി ഓർഡറുകൾ, അന്വേഷണങ്ങൾ, സേവ് ചെയ്ത തടികൾ എന്നിവ ഇവിടെ കാണാം.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs font-bold shadow-xs transition flex-shrink-0"
          >
            <User className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Edit Profile' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ'}</span>
          </button>

          <button
            onClick={() => setIsRaiseModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs font-bold shadow-xs transition flex-shrink-0"
          >
            <LifeBuoy className="w-4 h-4 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Raise a Ticket' : 'പരാതി നൽകുക (Support)'}</span>
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

      {/* Tabs */}
      <div className="flex border-b border-stone-300/80 gap-2.5 sm:gap-3 text-sm font-semibold overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 border transition whitespace-nowrap flex-shrink-0 w-auto ${
            activeTab === 'orders'
              ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
              : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{lang === 'en' ? 'My Timber Orders' : 'എന്റെ ഓർഡറുകൾ'}</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 border transition whitespace-nowrap flex-shrink-0 w-auto ${
            activeTab === 'enquiries'
              ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
              : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{lang === 'en' ? 'Active Enquiries' : 'അന്വേഷണങ്ങൾ'}</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 border transition whitespace-nowrap flex-shrink-0 w-auto ${
            activeTab === 'wishlist'
              ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
              : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>{lang === 'en' ? 'Saved Wishlist' : 'സേവ് ചെയ്തവ'}</span>
        </button>

        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-4 py-2 rounded-full flex items-center gap-2 border transition whitespace-nowrap flex-shrink-0 w-auto ${
            activeTab === 'tickets'
              ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
              : 'border-transparent text-stone-500 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          <span>{lang === 'en' ? 'Support Tickets' : 'എന്റെ പരാതികൾ'}</span>
          {unreadTicketsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-300">
              {unreadTicketsCount}
            </span>
          )}
        </button>
      </div>

      {/* Universal Search for Orders & Enquiries with 3-char minimum & 350ms debouncing */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <ValidatedSearchInput
            id="buyer-search-input"
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder={
              activeTab === 'orders'
                ? (lang === 'en' ? 'Search orders by wood, yard, order ID...' : 'ഓർഡറുകൾ, തടി ഇനം, ഐഡി തിരയുക...')
                : activeTab === 'enquiries'
                ? (lang === 'en' ? 'Search enquiries...' : 'അന്വേഷണങ്ങൾ തിരയുക...')
                : (lang === 'en' ? 'Search wishlist...' : 'തടികൾ തിരയുക...')
            }
            lang={lang}
            size="md"
          />
        </div>
        {searchQuery && (
          <div className="text-xs text-stone-600 font-semibold px-1">
            {lang === 'en' ? `Filtered by: "${searchQuery}"` : `തിരഞ്ഞത്: "${searchQuery}"`}
          </div>
        )}
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {isLoadingOrders ? (
            <div className="space-y-4 animate-pulse" data-testid="orders-loading">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 w-2/3">
                    <div className="h-5 bg-stone-200 rounded-md w-3/4" />
                    <div className="h-4 bg-stone-200 rounded-md w-1/2" />
                    <div className="h-3 bg-stone-100 rounded-md w-1/4" />
                  </div>
                  <div className="h-9 w-36 bg-stone-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredLiveOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-300/80 p-8 text-center text-xs text-stone-500">
              {lang === 'en' ? 'No matching timber orders found.' : 'പൊരുത്തപ്പെടുന്ന തടി ഓർഡറുകൾ ഒന്നും ലഭ്യമല്ല.'}
            </div>
          ) : (
            filteredLiveOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
                      {translateWoodTitle(order.listing_title, lang)}
                    </h3>
                    <span className="text-xs text-stone-400 font-mono">({order.id})</span>
                  </div>
                  <div className="text-xs text-stone-600 mt-1 font-medium">
                    {lang === 'en' ? 'Seller:' : 'വിൽക്കുന്നയാൾ:'} {order.seller_name} · {order.agreed_qty} {translateUnit(order.unit, lang)} · {formatINR(order.agreed_price)}
                  </div>
                  <div className="text-[11px] text-stone-400 mt-0.5">
                    {lang === 'en' ? `Ordered on ${order.ordered_at}` : `ഓർഡർ ചെയ്ത തീയതി: ${order.ordered_at}`}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {order.status === 'delivered_pending' ? (
                    <button
                      disabled={confirmingOrderId === order.id}
                      onClick={() => handleConfirmDelivery(order.id)}
                      className="px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {confirmingOrderId === order.id ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>{lang === 'en' ? 'Confirming...' : 'സ്ഥിരീകരിക്കുന്നു...'}</span>
                        </>
                      ) : (
                        <span>{lang === 'en' ? 'Confirm Delivery Received' : 'ഡെലിവറി ലഭിച്ചതായി സ്ഥിരീകരിക്കുക'}</span>
                      )}
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        {lang === 'en' ? 'Completed & Delivered' : 'പൂർത്തിയായി'}
                      </span>
                      <button
                        onClick={() =>
                          setSelectedReviewOrder({
                            id: order.id,
                            sellerId: order.seller_id || '',
                            sellerName: order.seller_name || 'Timber Merchant',
                          })
                        }
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/50 text-[#4A3626] text-xs font-bold transition"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        <span>{lang === 'en' ? 'Review Seller' : 'റിവ്യൂ'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Enquiries Tab */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-sm text-center py-12 space-y-3">
          <MessageSquare className="w-8 h-8 text-stone-300 mx-auto" />
          <h3 className="font-bold text-[#7A5A3A] text-sm">
            {lang === 'en' ? 'No active price negotiations right now' : 'നിലവിൽ സജീവമായ ചർച്ചകൾ ഒന്നുമില്ല'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {lang === 'en'
              ? 'Visit the marketplace to discover timber stock and enquire with merchants directly.'
              : 'മാർക്കറ്റ് സന്ദർശിച്ച് തടികളെക്കുറിച്ച് കച്ചവടക്കാരുമായി നേരിട്ട് ബന്ധപ്പെടുക.'}
          </p>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DEMO_SAVED_LISTINGS.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-stone-300/80 shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#5B6147] tracking-wider">
                {translateSpecies(item.species, lang)}
              </span>
              <h4 className="font-serif font-bold text-[#4A3626] text-sm">
                {translateWoodTitle(item.title, lang)}
              </h4>
              <div className="text-xs text-stone-500">{item.district}</div>
              <div className="pt-2 font-black text-[#4A3626] text-base">
                {formatINR(item.price_per_cft)} / {translateUnit('CFT', lang)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Support Tickets Tab */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold font-serif text-[#4A3626] text-base">
              {lang === 'en' ? 'My Grievance & Support Tickets' : 'എന്റെ പരാതികൾ'}
            </h3>
            <button
              onClick={() => setIsRaiseModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'New Ticket' : 'പുതിയ പരാതി'}</span>
            </button>
          </div>

          {tickets.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-300/80 p-8 text-center text-xs text-stone-500 space-y-2">
              <LifeBuoy className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="font-bold text-stone-700">
                {lang === 'en' ? 'No tickets filed yet.' : 'പരാതികൾ ഒന്നും സമർപ്പിച്ചിട്ടില്ല.'}
              </p>
              <p className="text-stone-400">
                {lang === 'en'
                  ? 'Have an issue with timber quality, measurement, or delivery? Raise a ticket anytime.'
                  : 'തടിയുടെ അളവ്, ഗുണനിലവാരം, ഡെലിവറി എന്നിവയിൽ പരാതിയുണ്ടെങ്കിൽ ഇവിടെ അറിയിക്കാം.'}
              </p>
            </div>
          ) : (
            tickets.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-200 text-[#4A3626]">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-stone-800">
                      {lang === 'en' ? t.category : (t.categoryMl || translateTicketCategory(t.category, lang))}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                      t.status === 'resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-200 text-[#4A3626]'
                    }`}
                  >
                    {t.status === 'resolved' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{lang === 'en' ? 'Resolved' : 'പരിഹരിച്ചു'}</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-[#5B6147]" />
                        <span>{lang === 'en' ? 'Pending Review (2 days)' : 'പരിശോധനയിൽ'}</span>
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-medium">
                  "{lang === 'en' ? t.description : (t.descriptionMl || t.description)}"
                </p>

                {/* Resolution message reply from admin */}
                {t.status === 'resolved' && (t.resolutionReply || t.resolutionReplyMl) && (
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-emerald-900 text-[11px]">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {lang === 'en'
                            ? 'Admin Solution Reply:'
                            : 'അഡ്മിൻ നൽകിയ പരിഹാരം (സൊല്യൂഷൻ):'}
                        </span>
                      </span>
                      <span className="font-mono text-stone-400">{t.resolvedAt}</span>
                    </div>
                    <p className="text-stone-800 text-xs italic pl-4 font-medium">
                      "{lang === 'en'
                        ? (t.resolutionReply || t.resolutionReplyMl)
                        : (t.resolutionReplyMl || t.resolutionReply)}"
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal */}
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

      {selectedReviewOrder && (
        <SubmitReviewModal
          isOpen={Boolean(selectedReviewOrder)}
          onClose={() => setSelectedReviewOrder(null)}
          orderId={selectedReviewOrder.id}
          targetType="seller"
          targetId={selectedReviewOrder.sellerId}
          targetName={selectedReviewOrder.sellerName}
          lang={lang}
        />
      )}
    </div>
  );
}
