import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, PackageCheck, FileText, Check, X, LifeBuoy, MessageSquare, CheckCircle2, Clock, Send } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getStoredTickets, resolveTicket } from '../../utils/ticketService';
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
export function AdminDashboard({ lang = 'en' }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('sellers');
    const [sellers, setSellers] = useState(DEMO_PENDING_SELLERS);
    const [listings, setListings] = useState(DEMO_PENDING_LISTINGS);
    const [tickets, setTickets] = useState(getStoredTickets());
    const [ticketFilter, setTicketFilter] = useState('all');
    const [message, setMessage] = useState(null);
    // Reply modal state for resolving tickets
    const [replyTicket, setReplyTicket] = useState(null);
    const [replyText, setReplyText] = useState('');
    useEffect(() => {
        const handleUpdate = () => {
            setTickets(getStoredTickets());
        };
        window.addEventListener('timora_tickets_updated', handleUpdate);
        return () => window.removeEventListener('timora_tickets_updated', handleUpdate);
    }, []);
    const openTicketsCount = tickets.filter((t) => t.status === 'open').length;
    const handleResolveTicket = (e) => {
        e.preventDefault();
        if (!replyTicket || !replyText.trim())
            return;
        resolveTicket(replyTicket.id, replyText.trim());
        setTickets(getStoredTickets());
        setMessage(lang === 'en'
            ? `Ticket ${replyTicket.id} resolved and solution reply sent to user dashboard!`
            : `ടിക്കറ്റ് ${replyTicket.id} പരിഹരിച്ച് ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിലേക്ക് അയച്ചു!`);
        setReplyTicket(null);
        setReplyText('');
    };
    const handleApproveSeller = (id) => {
        setSellers((prev) => prev.filter((s) => s.id !== id));
        setMessage(lang === 'en' ? 'Seller approved successfully!' : 'കച്ചവടക്കാരനെ വിജയകരമായി അംഗീകരിച്ചു!');
    };
    const handleRejectSeller = (id) => {
        setSellers((prev) => prev.filter((s) => s.id !== id));
        setMessage(lang === 'en' ? 'Seller registration rejected.' : 'കച്ചവടക്കാരന്റെ അപേക്ഷ നിരസിച്ചു.');
    };
    const handleApproveListing = (id) => {
        setListings((prev) => prev.filter((l) => l.id !== id));
        setMessage(lang === 'en' ? 'Timber listing approved and published to marketplace.' : 'തടി ലിസ്റ്റിംഗ് അംഗീകരിച്ച് വിപണിയിൽ പ്രസിദ്ധീകരിച്ചു.');
    };
    const handleRejectListing = (id) => {
        setListings((prev) => prev.filter((l) => l.id !== id));
        setMessage(lang === 'en' ? 'Listing rejected with recorded reason.' : 'ലിസ്റ്റിംഗ് കാരണം രേഖപ്പെടുത്തി നിരസിച്ചു.');
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30 mb-2", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ' })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626] flex items-center gap-2.5", children: lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium", children: lang === 'en'
                                    ? 'Approve timber merchant accounts, review actual stock photos, and inspect append-only audit trails.'
                                    : 'കച്ചവടക്കാരുടെ അക്കൗണ്ടുകൾ, തടികളുടെ ഫോട്ടോകൾ എന്നിവ പരിശോധിച്ച് അംഗീകരിക്കുക.' })] }), _jsx("span", { className: "px-3.5 py-1.5 rounded-xl bg-[#4A3626] text-stone-300 text-xs font-mono font-bold shadow-xs", children: "ADMIN CONSOLE" })] }), message && (_jsxs("div", { className: "p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center justify-between", children: [_jsx("span", { children: message }), _jsx("button", { onClick: () => setMessage(null), className: "text-stone-400 hover:text-stone-600", children: "\u2715" })] })), _jsxs("div", { className: "flex border-b border-stone-300/80 gap-6 text-sm font-semibold", children: [_jsxs("button", { onClick: () => setActiveTab('sellers'), className: `pb-3 flex items-center gap-2 border-b-2 transition ${activeTab === 'sellers'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(UserCheck, { className: "w-4 h-4" }), lang === 'en' ? 'Pending Sellers' : 'കച്ചവടക്കാരുടെ അപേക്ഷകൾ', " (", sellers.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('listings'), className: `pb-3 flex items-center gap-2 border-b-2 transition ${activeTab === 'listings'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(PackageCheck, { className: "w-4 h-4" }), lang === 'en' ? 'Listing Moderation Queue' : 'തടി അനുമതി ക്യൂ', " (", listings.length, ")"] }), _jsxs("button", { onClick: () => setActiveTab('tickets'), className: `pb-3 flex items-center gap-2 border-b-2 transition ${activeTab === 'tickets'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(LifeBuoy, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Support Tickets' : 'പരാതികൾ (Grievances)' }), openTicketsCount > 0 && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-stone-1000 text-stone-950 font-black text-[10px] animate-pulse", children: openTicketsCount }))] }), _jsxs("button", { onClick: () => setActiveTab('audit'), className: `pb-3 flex items-center gap-2 border-b-2 transition ${activeTab === 'audit'
                            ? 'border-[#5B6147] text-[#5B6147] font-bold'
                            : 'border-transparent text-stone-500 hover:text-stone-900'}`, children: [_jsx(FileText, { className: "w-4 h-4" }), lang === 'en' ? 'Audit Logs (Append-Only)' : 'ഓഡിറ്റ് ലോഗുകൾ'] })] }), activeTab === 'sellers' && (_jsx("div", { className: "space-y-4", children: sellers.length === 0 ? (_jsx("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-8 text-center text-xs text-stone-500", children: lang === 'en' ? 'No pending seller onboarding requests.' : 'പുതിയ അപേക്ഷകൾ ഒന്നും ബാക്കിയില്ല.' })) : (sellers.map((s) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: s.business_name }), _jsxs("div", { className: "text-xs text-stone-600 mt-1", children: ["Contact: ", s.name, " (", s.phone, ") \u00B7 ", s.locality, ", ", s.district] }), _jsxs("div", { className: "text-[11px] text-stone-400 mt-0.5", children: ["Applied: ", s.registered_at] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => handleApproveSeller(s.id), className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-sm transition", children: [_jsx(Check, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Approve Seller' : 'അംഗീകരിക്കുക'] }), _jsxs("button", { onClick: () => handleRejectSeller(s.id), className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition", children: [_jsx(X, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Reject' : 'നിരസിക്കുക'] })] })] }, s.id)))) })), activeTab === 'listings' && (_jsx("div", { className: "space-y-4", children: listings.length === 0 ? (_jsx("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-8 text-center text-xs text-stone-500", children: lang === 'en' ? 'All submitted timber stock has been moderated.' : 'എല്ലാ തടികളും പരിശോധിച്ചു കഴിഞ്ഞു.' })) : (listings.map((l) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[#5B6147]", children: [l.species, " \u00B7 ", l.image_count, " Photos Attached"] }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base mt-0.5", children: l.title }), _jsxs("div", { className: "text-xs text-stone-600 mt-1", children: ["Seller: ", l.seller_name, " \u00B7 ", l.quantity, " ", l.unit, " \u00B7 ", formatINR(l.price_per_cft), " / CFT"] }), _jsxs("div", { className: "text-[11px] text-stone-400 mt-0.5", children: ["Submitted: ", l.submitted_at] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => handleApproveListing(l.id), className: "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-sm transition", children: [_jsx(Check, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Approve & Publish' : 'അംഗീകരിച്ച് പ്രസിദ്ധീകരിക്കുക'] }), _jsxs("button", { onClick: () => handleRejectListing(l.id), className: "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition", children: [_jsx(X, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Reject with Reason' : 'കാരണം കാണിച്ച് നിരസിക്കുക'] })] })] }, l.id)))) })), activeTab === 'tickets' && (_jsxs("div", { className: "space-y-4", children: [_jsx("div", { className: "flex items-center justify-between flex-wrap gap-2", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs font-bold text-stone-700", children: lang === 'en' ? 'Filter Tickets:' : 'ഫിൽട്ടർ:' }), _jsx("div", { className: "flex items-center gap-1.5", children: ['all', 'open', 'resolved'].map((f) => (_jsx("button", { onClick: () => setTicketFilter(f), className: `px-3 py-1 rounded-xl text-xs font-bold transition capitalize ${ticketFilter === f
                                            ? 'bg-[#5B6147] text-white shadow-xs'
                                            : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'}`, children: f === 'all'
                                            ? lang === 'en'
                                                ? 'All Tickets'
                                                : 'എല്ലാം'
                                            : f === 'open'
                                                ? lang === 'en'
                                                    ? 'Open / Pending'
                                                    : 'പരിഹരിക്കാനുള്ളവ'
                                                : lang === 'en'
                                                    ? 'Resolved'
                                                    : 'പരിഹരിച്ചവ' }, f))) })] }) }), tickets.filter((t) => (ticketFilter === 'all' ? true : t.status === ticketFilter)).length === 0 ? (_jsx("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-8 text-center text-xs text-stone-500", children: lang === 'en' ? 'No tickets found in this filter.' : 'പരാതികൾ ഒന്നും ലഭ്യമല്ല.' })) : (tickets
                        .filter((t) => (ticketFilter === 'all' ? true : t.status === ticketFilter))
                        .map((t) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-200 text-[#4A3626] border border-stone-300", children: t.id }), _jsx("span", { className: "text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700", children: t.role === 'buyer'
                                                    ? 'Buyer / House Owner'
                                                    : t.role === 'seller'
                                                        ? 'Timber Merchant'
                                                        : t.role === 'carpenter'
                                                            ? 'Master Carpenter'
                                                            : 'Mill Owner' }), t.priority === 'urgent' && (_jsx("span", { className: "text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100 text-red-700 border border-red-200 animate-pulse", children: "Urgent" }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${t.status === 'resolved'
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                    : 'bg-stone-200 text-[#4A3626] border border-stone-300'}`, children: t.status === 'resolved' ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-600" }), _jsx("span", { children: lang === 'en' ? 'Resolved' : 'പരിഹരിച്ചു' })] })) : (_jsxs(_Fragment, { children: [_jsx(Clock, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Pending Action' : 'നടപടി കാത്തിരിക്കുന്നു' })] })) }), _jsx("span", { className: "text-[11px] text-stone-400 font-mono", children: t.createdAt })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-xs text-stone-500 font-semibold mb-0.5", children: [lang === 'en' ? 'Complainant:' : 'പരാതിക്കാരൻ:', ' ', _jsx("strong", { className: "text-stone-900", children: t.name }), " (\uD83D\uDCDE +91 ", t.phone, ")"] }), _jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: lang === 'en' ? t.category : t.categoryMl }), _jsxs("p", { className: "text-xs text-stone-700 mt-1.5 leading-relaxed bg-[#E7E1D6] p-3 rounded-xl border border-stone-300/60 font-medium", children: ["\"", t.description, "\""] })] }), t.status === 'resolved' && t.resolutionReply && (_jsxs("div", { className: "p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 space-y-1 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between text-emerald-900 font-bold", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { children: lang === 'en'
                                                            ? 'Admin Solution Reply (Sent to Dashboard):'
                                                            : 'അഡ്മിൻ നൽകിയ പരിഹാരം (ഡാഷ്‌ബോർഡിൽ അറിയിച്ചത്):' })] }), _jsx("span", { className: "text-[10px] text-emerald-700 font-normal", children: t.resolvedAt })] }), _jsxs("p", { className: "text-stone-800 text-xs italic pl-5", children: ["\"", t.resolutionReply, "\""] })] })), t.status === 'open' && (_jsx("div", { className: "pt-2 flex items-center justify-end", children: _jsxs("button", { onClick: () => {
                                        setReplyTicket(t);
                                        setReplyText(lang === 'en'
                                            ? 'Issue verified with merchant. Resolution initiated.'
                                            : 'അന്വേഷണത്തിൽ വ്യാപാരിയുമായി സംസാരിച്ചു. നടപടികൾ ആരംഭിച്ചു.');
                                    }, className: "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-sm transition", children: [_jsx(MessageSquare, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en'
                                                ? 'Resolve & Send Solution Reply'
                                                : 'പരിഹാരം അയക്കുക (Resolve & Reply)' })] }) }))] }, t.id))))] })), replyTicket && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 shadow-2xl max-w-lg w-full p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-100 pb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[#5B6147]", children: "Send Solution to User Dashboard" }), _jsxs("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: ["Ticket ", replyTicket.id, " \u00B7 ", replyTicket.name] })] }), _jsx("button", { onClick: () => setReplyTicket(null), className: "text-stone-400 hover:text-stone-700 font-bold p-1", children: "\u2715" })] }), _jsxs("div", { className: "p-3 bg-[#E7E1D6] rounded-xl border border-stone-300 text-xs text-stone-700", children: [_jsx("span", { className: "font-bold text-stone-900 block mb-0.5", children: "Issue:" }), _jsxs("p", { className: "italic", children: ["\"", replyTicket.description, "\""] })] }), _jsxs("form", { onSubmit: handleResolveTicket, className: "space-y-3 text-xs", children: [_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-stone-700 mb-1", children: lang === 'en'
                                                ? 'Resolution Solution Message (This will pop up on their dashboard):'
                                                : 'നൽകുന്ന പരിഹാര സന്ദേശം (ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിൽ നോട്ടിഫിക്കേഷനായി കാണിക്കും):' }), _jsx("textarea", { rows: 4, value: replyText, onChange: (e) => setReplyText(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300/80 bg-[#E7E1D6]/50 text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#5B6147]", required: true })] }), _jsxs("div", { className: "pt-2 flex items-center justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setReplyTicket(null), className: "px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-5 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-1.5 shadow-sm transition", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Send Solution & Mark Resolved" })] })] })] })] }) })), activeTab === 'audit' && (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-sm space-y-3 font-mono text-xs", children: [_jsxs("div", { className: "p-3 bg-[#E7E1D6] border border-stone-300/80 rounded-xl flex items-center justify-between", children: [_jsx("span", { className: "text-[#4A3626] font-bold", children: "[APPROVE_SELLER] Nilambur Wood Works (seller_profile)" }), _jsx("span", { className: "text-stone-400", children: "Actor: Admin (Super) \u00B7 2026-10-25 15:10" })] }), _jsxs("div", { className: "p-3 bg-[#E7E1D6] border border-stone-300/80 rounded-xl flex items-center justify-between", children: [_jsx("span", { className: "text-[#4A3626] font-bold", children: "[APPROVE_LISTING] First-Grade Nilambur Teak Planks (timber_listing)" }), _jsx("span", { className: "text-stone-400", children: "Actor: Admin (Super) \u00B7 2026-10-25 15:12" })] })] }))] }));
}
