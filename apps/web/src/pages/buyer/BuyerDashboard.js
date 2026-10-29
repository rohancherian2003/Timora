import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ShoppingBag, MessageSquare, Heart, Clock, CheckCircle2, User, LifeBuoy, ShieldCheck, Plus } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getTicketsForUser } from '../../utils/ticketService';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
import { EditProfileModal } from '../../components/EditProfileModal';
import { DashboardNotificationsFeed } from '../../components/DashboardNotificationsFeed';
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
export function BuyerDashboard({ lang = 'en' }) {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState('orders');
    const [tickets, setTickets] = useState(() => getTicketsForUser(user?.phone, 'buyer'));
    const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [dismissedResolvedId, setDismissedResolvedId] = useState(null);
    useEffect(() => {
        if (refreshUser)
            refreshUser();
    }, [refreshUser]);
    useEffect(() => {
        const handleUpdate = () => {
            setTickets(getTicketsForUser(user?.phone, 'buyer'));
        };
        window.addEventListener('timora_tickets_updated', handleUpdate);
        return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
    }, [user]);
    // Find latest resolved ticket to show as notification popup/banner
    const latestResolvedTicket = tickets.find((t) => t.status === 'resolved' && t.resolutionReply && t.id !== dismissedResolvedId);
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5B6147] text-white uppercase tracking-wider", children: lang === 'en' ? 'Verified Buyer Account' : 'ഉപഭോക്തൃ പ്രൊഫൈൽ' }), _jsxs("span", { className: "text-xs text-[#4A3626] font-mono font-medium", children: ["+91 ", user?.phone || '9847987654'] })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]", children: lang === 'en' ? `Welcome, ${user?.name || 'Timber Buyer'}` : `സ്വാഗതം, ${user?.name || 'ഉപഭോക്താവ്'}` }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium", children: lang === 'en'
                                    ? 'Track your ongoing timber orders, negotiate enquiries, and view saved stock.'
                                    : 'നിങ്ങളുടെ തടി ഓർഡറുകൾ, അന്വേഷണങ്ങൾ, സേവ് ചെയ്ത തടികൾ എന്നിവ ഇവിടെ കാണാം.' })] }), _jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [_jsxs("button", { onClick: () => setIsEditProfileOpen(true), className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs font-bold shadow-xs transition flex-shrink-0", children: [_jsx(User, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Edit Profile' : 'പ്രൊഫൈൽ മാറ്റങ്ങൾ' })] }), _jsxs("button", { onClick: () => setIsRaiseModalOpen(true), className: "inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-stone-300 text-[#4A3626] hover:bg-stone-100 text-xs font-bold shadow-xs transition flex-shrink-0", children: [_jsx(LifeBuoy, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Raise a Ticket' : 'പരാതി നൽകുക (Support)' })] })] })] }), _jsx(DashboardNotificationsFeed, { lang: lang }), latestResolvedTicket && (_jsxs("div", { className: "p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-[#E7E1D6] to-stone-100 border-2 border-emerald-400 shadow-md animate-fadeIn space-y-3", children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold flex-shrink-0", children: _jsx(ShieldCheck, { className: "w-6 h-6 text-emerald-600" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 font-bold text-[10px] uppercase tracking-wider", children: lang === 'en' ? 'Admin Solution Reply' : 'അഡ്മിൻ നൽകിയ പരിഹാരം' }), _jsx("span", { className: "font-mono text-xs font-bold text-stone-600", children: latestResolvedTicket.id })] }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base mt-0.5", children: lang === 'en' ? latestResolvedTicket.category : latestResolvedTicket.categoryMl })] })] }), _jsx("button", { onClick: () => setDismissedResolvedId(latestResolvedTicket.id), className: "text-stone-400 hover:text-stone-700 font-bold p-1 text-xs", title: "Dismiss", children: "\u2715" })] }), _jsxs("div", { className: "p-3.5 rounded-2xl bg-white border border-emerald-200 shadow-xs text-xs space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between text-stone-500 text-[11px] font-semibold", children: [_jsx("span", { children: lang === 'en' ? 'Resolved by Timora Admin Cell' : 'ടിമോറ അഡ്മിൻ മറുപടി:' }), _jsx("span", { className: "font-mono", children: latestResolvedTicket.resolvedAt })] }), _jsxs("p", { className: "text-stone-900 text-xs sm:text-sm font-medium leading-relaxed", children: ["\"", lang === 'en'
                                        ? (latestResolvedTicket.resolutionReply || latestResolvedTicket.resolutionReplyMl)
                                        : (latestResolvedTicket.resolutionReplyMl || latestResolvedTicket.resolutionReply), "\""] })] })] })), _jsxs("div", { className: "flex border-b border-stone-300/80 gap-6 text-sm font-semibold overflow-x-auto", children: [_jsxs("button", { onClick: () => setActiveTab('orders'), className: `pb-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${activeTab === 'orders'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(ShoppingBag, { className: "w-4 h-4" }), lang === 'en' ? 'My Timber Orders' : 'എന്റെ ഓർഡറുകൾ'] }), _jsxs("button", { onClick: () => setActiveTab('enquiries'), className: `pb-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${activeTab === 'enquiries'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(MessageSquare, { className: "w-4 h-4" }), lang === 'en' ? 'Active Enquiries' : 'അന്വേഷണങ്ങൾ'] }), _jsxs("button", { onClick: () => setActiveTab('wishlist'), className: `pb-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${activeTab === 'wishlist'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(Heart, { className: "w-4 h-4" }), lang === 'en' ? 'Saved Wishlist' : 'സേവ് ചെയ്തവ'] }), _jsxs("button", { onClick: () => setActiveTab('tickets'), className: `pb-3 flex items-center gap-2 border-b-2 transition whitespace-nowrap ${activeTab === 'tickets'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(LifeBuoy, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Support Tickets' : 'എന്റെ പരാതികൾ' }), tickets.length > 0 && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-stone-200 text-[#4A3626] text-[10px] font-bold border border-stone-300", children: tickets.length }))] })] }), activeTab === 'orders' && (_jsx("div", { className: "space-y-4", children: DEMO_BUYER_ORDERS.map((order) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: order.listing_title }), _jsxs("span", { className: "text-xs text-stone-400 font-mono", children: ["(", order.id, ")"] })] }), _jsxs("div", { className: "text-xs text-stone-600 mt-1 font-medium", children: [lang === 'en' ? 'Seller:' : 'വിൽക്കുന്നയാൾ:', " ", order.seller_name, " \u00B7 ", order.agreed_qty, " ", order.unit, " \u00B7 ", formatINR(order.agreed_price)] }), _jsxs("div", { className: "text-[11px] text-stone-400 mt-0.5", children: ["Ordered on ", order.ordered_at] })] }), _jsx("div", { className: "flex items-center gap-3", children: order.status === 'delivered_pending' ? (_jsx("button", { className: "px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-sm transition", children: lang === 'en' ? 'Confirm Delivery Received' : 'ഡെലിവറി ലഭിച്ചതായി സ്ഥിരീകരിക്കുക' })) : (_jsxs("span", { className: "inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-600" }), lang === 'en' ? 'Completed & Delivered' : 'പൂർത്തിയായി'] })) })] }, order.id))) })), activeTab === 'enquiries' && (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-sm text-center py-12 space-y-3", children: [_jsx(MessageSquare, { className: "w-8 h-8 text-stone-300 mx-auto" }), _jsx("h3", { className: "font-bold text-[#7A5A3A] text-sm", children: lang === 'en' ? 'No active price negotiations right now' : 'നിലവിൽ സജീവമായ ചർച്ചകൾ ഒന്നുമില്ല' }), _jsx("p", { className: "text-xs text-stone-500 max-w-sm mx-auto", children: lang === 'en'
                            ? 'Visit the marketplace to discover timber stock and enquire with merchants directly.'
                            : 'മാർക്കറ്റ് സന്ദർശിച്ച് തടികളെക്കുറിച്ച് കച്ചവടക്കാരുമായി നേരിട്ട് ബന്ധപ്പെടുക.' })] })), activeTab === 'wishlist' && (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4", children: DEMO_SAVED_LISTINGS.map((item) => (_jsxs("div", { className: "bg-white p-5 rounded-3xl border border-stone-300/80 shadow-sm space-y-2", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-[#5B6147] tracking-wider", children: item.species }), _jsx("h4", { className: "font-serif font-bold text-[#4A3626] text-sm", children: item.title }), _jsx("div", { className: "text-xs text-stone-500", children: item.district }), _jsxs("div", { className: "pt-2 font-black text-[#4A3626] text-base", children: [formatINR(item.price_per_cft), " / CFT"] })] }, item.id))) })), activeTab === 'tickets' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? 'My Grievance & Support Tickets' : 'എന്റെ പരാതികൾ' }), _jsxs("button", { onClick: () => setIsRaiseModalOpen(true), className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold transition shadow-xs", children: [_jsx(Plus, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'New Ticket' : 'പുതിയ പരാതി' })] })] }), tickets.length === 0 ? (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-8 text-center text-xs text-stone-500 space-y-2", children: [_jsx(LifeBuoy, { className: "w-8 h-8 text-stone-300 mx-auto" }), _jsx("p", { className: "font-bold text-stone-700", children: lang === 'en' ? 'No tickets filed yet.' : 'പരാതികൾ ഒന്നും സമർപ്പിച്ചിട്ടില്ല.' }), _jsx("p", { className: "text-stone-400", children: lang === 'en'
                                    ? 'Have an issue with timber quality, measurement, or delivery? Raise a ticket anytime.'
                                    : 'തടിയുടെ അളവ്, ഗുണനിലവാരം, ഡെലിവറി എന്നിവയിൽ പരാതിയുണ്ടെങ്കിൽ ഇവിടെ അറിയിക്കാം.' })] })) : (tickets.map((t) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-2.5", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-stone-200 text-[#4A3626]", children: t.id }), _jsx("span", { className: "text-xs font-bold text-stone-800", children: lang === 'en' ? t.category : t.categoryMl })] }), _jsx("span", { className: `text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${t.status === 'resolved'
                                            ? 'bg-emerald-100 text-emerald-800'
                                            : 'bg-stone-200 text-[#4A3626]'}`, children: t.status === 'resolved' ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-3 h-3 text-emerald-600" }), _jsx("span", { children: lang === 'en' ? 'Resolved' : 'പരിഹരിച്ചു' })] })) : (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "w-3 h-3 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Pending Review (2 days)' : 'പരിശോധനയിൽ' })] })) })] }), _jsxs("p", { className: "text-xs text-stone-600 leading-relaxed font-medium", children: ["\"", lang === 'en' ? t.description : (t.descriptionMl || t.description), "\""] }), t.status === 'resolved' && (t.resolutionReply || t.resolutionReplyMl) && (_jsxs("div", { className: "p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between font-bold text-emerald-900 text-[11px]", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-emerald-600" }), _jsx("span", { children: lang === 'en'
                                                            ? 'Admin Solution Reply:'
                                                            : 'അഡ്മിൻ നൽകിയ പരിഹാരം (സൊല്യൂഷൻ):' })] }), _jsx("span", { className: "font-mono text-stone-400", children: t.resolvedAt })] }), _jsxs("p", { className: "text-stone-800 text-xs italic pl-4 font-medium", children: ["\"", lang === 'en'
                                                ? (t.resolutionReply || t.resolutionReplyMl)
                                                : (t.resolutionReplyMl || t.resolutionReply), "\""] })] }))] }, t.id))))] })), _jsx(RaiseTicketModal, { isOpen: isRaiseModalOpen, onClose: () => setIsRaiseModalOpen(false), lang: lang }), _jsx(EditProfileModal, { isOpen: isEditProfileOpen, onClose: () => setIsEditProfileOpen(false), lang: lang })] }));
}
