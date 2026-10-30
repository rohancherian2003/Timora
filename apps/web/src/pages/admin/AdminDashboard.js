import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, PackageCheck, FileText, Check, X, AlertTriangle, LifeBuoy, MessageSquare, CheckCircle2, Clock, Send, User, } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { getStoredTickets, resolveTicket } from '../../utils/ticketService';
import { EditProfileModal } from '../../components/EditProfileModal';
const INITIAL_PENDING_APPLICATIONS = [
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
export function AdminDashboard({ lang = 'en' }) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('business');
    const [businessFilter, setBusinessFilter] = useState('all');
    const [applications, setApplications] = useState(INITIAL_PENDING_APPLICATIONS);
    const [listings, setListings] = useState(DEMO_PENDING_LISTINGS);
    const [tickets, setTickets] = useState(getStoredTickets());
    const [ticketFilter, setTicketFilter] = useState('all');
    const [message, setMessage] = useState(null);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [auditLogs, setAuditLogs] = useState([
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
    const [actionModal, setActionModal] = useState(null);
    const [actionInput, setActionInput] = useState('');
    // Ticket reply modal state
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
    const addAudit = (action, target, note) => {
        const entry = {
            id: `aud-${Date.now()}`,
            action,
            target,
            actor: user?.name || 'Chief Moderator (Admin)',
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            note,
        };
        setAuditLogs([entry, ...auditLogs]);
    };
    const handleApproveApp = (app) => {
        setApplications(applications.filter((a) => a.id !== app.id));
        addAudit(`APPROVE_${app.role.toUpperCase()}`, `${app.businessName} (${app.name})`);
        setMessage(lang === 'en'
            ? `${app.businessName} has been approved and activated.`
            : `${app.businessName} അംഗീകരിക്കുകയും സജീവമാക്കുകയും ചെയ്തു.`);
    };
    const handleConfirmActionModal = (e) => {
        e.preventDefault();
        if (!actionModal || !actionInput.trim())
            return;
        const { type, app } = actionModal;
        setApplications(applications.filter((a) => a.id !== app.id));
        if (type === 'action_required') {
            addAudit(`REQUEST_INFO_${app.role.toUpperCase()}`, `${app.businessName}`, actionInput.trim());
            setMessage(lang === 'en'
                ? `Requested additional documents from ${app.name}.`
                : `${app.name} എന്ന വ്യാപാരിയോട് കൂടുതൽ രേഖകൾ ആവശ്യപ്പെട്ടു.`);
        }
        else {
            addAudit(`REJECT_${app.role.toUpperCase()}`, `${app.businessName}`, actionInput.trim());
            setMessage(lang === 'en'
                ? `Application rejected with recorded reason.`
                : `കാരണം രേഖപ്പെടുത്തി അപേക്ഷ നിരസിച്ചു.`);
        }
        setActionModal(null);
        setActionInput('');
    };
    const handleResolveTicket = (e) => {
        e.preventDefault();
        if (!replyTicket || !replyText.trim())
            return;
        resolveTicket(replyTicket.id, replyText.trim());
        setTickets(getStoredTickets());
        addAudit('RESOLVE_TICKET', `Ticket #${replyTicket.id}`, replyText.trim());
        setMessage(lang === 'en'
            ? `Ticket ${replyTicket.id} resolved and solution reply sent to user dashboard!`
            : `ടിക്കറ്റ് ${replyTicket.id} പരിഹരിച്ച് ഉപഭോക്താവിന്റെ ഡാഷ്‌ബോർഡിലേക്ക് അയച്ചു!`);
        setReplyTicket(null);
        setReplyText('');
    };
    const filteredApps = applications.filter((app) => {
        if (businessFilter === 'all')
            return true;
        return app.role === businessFilter;
    });
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 animate-fadeIn", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30 mb-2", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ' })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626]", children: lang === 'en' ? 'Kerala Timber Regulatory Cell' : 'കേരള തടി വ്യാപാര നിയന്ത്രണ സെൽ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium", children: lang === 'en'
                                    ? 'Multi-role verification, timber compliance, dispute resolution, and audit logging'
                                    : 'വ്യാപാരികളുടെ പരിശോധന, തടി ചട്ടങ്ങൾ, പരാതി പരിഹാരം, ഓഡിറ്റ് ലോഗുകൾ' })] }), _jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [_jsxs("button", { type: "button", onClick: () => setIsEditProfileOpen(true), className: "p-3 bg-white/90 hover:bg-white text-[#4A3626] font-bold text-xs rounded-2xl border border-stone-300 shadow-xs flex items-center gap-2 transition", children: [_jsx(User, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Edit Profile & Settings' : 'പ്രൊഫൈൽ എഡിറ്റ്' })] }), _jsxs("div", { className: "p-3 bg-white/80 rounded-2xl border border-stone-300 text-xs text-[#4A3626] font-semibold flex items-center gap-2 shadow-xs", children: [_jsx(Clock, { className: "w-4 h-4 text-amber-600" }), _jsxs("span", { children: [applications.length, " ", lang === 'en' ? 'Pending Applications' : 'അപേക്ഷകൾ കാത്തിരിക്കുന്നു'] })] })] })] }), message && (_jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between text-xs text-emerald-950 shadow-xs animate-fadeIn", children: [_jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-600 flex-shrink-0" }), _jsx("span", { children: message })] }), _jsx("button", { onClick: () => setMessage(null), className: "text-emerald-700 hover:text-emerald-950 font-bold", children: "\u2715" })] })), _jsxs("div", { className: "flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200", children: [_jsxs("button", { type: "button", onClick: () => setActiveTab('business'), className: `px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'business'
                            ? 'bg-[#5B6147] text-white shadow-xs'
                            : 'text-stone-600 hover:bg-[#E7E1D6]/60'}`, children: [_jsx(UserCheck, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Business Approvals' : 'അപേക്ഷകൾ' }), applications.length > 0 && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 text-[10px] font-bold", children: applications.length }))] }), _jsxs("button", { type: "button", onClick: () => setActiveTab('listings'), className: `px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'listings'
                            ? 'bg-[#5B6147] text-white shadow-xs'
                            : 'text-stone-600 hover:bg-[#E7E1D6]/60'}`, children: [_jsx(PackageCheck, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Timber Listings' : 'തടി ലിസ്റ്റിംഗുകൾ' }), listings.length > 0 && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold", children: listings.length }))] }), _jsxs("button", { type: "button", onClick: () => setActiveTab('tickets'), className: `px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'tickets'
                            ? 'bg-[#5B6147] text-white shadow-xs'
                            : 'text-stone-600 hover:bg-[#E7E1D6]/60'}`, children: [_jsx(LifeBuoy, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Support Grievances' : 'പരാതികൾ' }), openTicketsCount > 0 && (_jsx("span", { className: "px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold", children: openTicketsCount }))] }), _jsxs("button", { type: "button", onClick: () => setActiveTab('audit'), className: `px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${activeTab === 'audit'
                            ? 'bg-[#5B6147] text-white shadow-xs'
                            : 'text-stone-600 hover:bg-[#E7E1D6]/60'}`, children: [_jsx(FileText, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Audit Trail' : 'ഓഡിറ്റ് ലോഗ്' })] })] }), activeTab === 'business' && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center gap-2 overflow-x-auto pb-1 text-xs", children: [_jsx("span", { className: "text-stone-500 font-semibold", children: lang === 'en' ? 'Role Filter:' : 'വിഭാഗം:' }), [
                                { key: 'all', label: 'All Businesses' },
                                { key: 'seller', label: 'Individual Sellers' },
                                { key: 'mill', label: 'Timber Mills' },
                                { key: 'carpenter', label: 'Carpenters' },
                                { key: 'transport', label: 'Transport Lorries' },
                            ].map((f) => (_jsx("button", { type: "button", onClick: () => setBusinessFilter(f.key), className: `px-3 py-1.5 rounded-xl font-bold transition ${businessFilter === f.key
                                    ? 'bg-[#5B6147] text-white'
                                    : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-100'}`, children: f.label }, f.key)))] }), _jsx("div", { className: "bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs divide-y divide-stone-200", children: filteredApps.length === 0 ? (_jsx("div", { className: "p-8 text-center text-stone-500 text-xs", children: lang === 'en' ? 'No pending applications in this category.' : 'ഈ വിഭാഗത്തിൽ പരിശോധിക്കാനുള്ള അപേക്ഷകൾ ഇല്ല.' })) : (filteredApps.map((app) => (_jsxs("div", { className: "p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#E7E1D6]/30 transition", children: [_jsxs("div", { className: "space-y-1.5", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-serif font-bold text-base text-[#4A3626]", children: app.businessName }), _jsx("span", { className: "px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E7E1D6] text-[#4A3626] uppercase", children: app.role === 'mill' ? 'Timber Mill' : app.role }), _jsx("span", { className: "px-2 py-0.5 rounded-md text-[10px] font-mono bg-amber-100 text-amber-900 font-bold", children: "PENDING_APPROVAL" })] }), _jsxs("div", { className: "text-xs text-stone-600 flex items-center gap-3 flex-wrap", children: [_jsxs("span", { children: ["Owner/Applicant: ", _jsx("b", { children: app.name })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Phone: ", _jsx("b", { children: app.phone })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["District: ", _jsx("b", { children: app.district })] })] }), _jsx("p", { className: "text-xs text-stone-500 bg-stone-50 p-2 rounded-xl border border-stone-200", children: app.details })] }), _jsxs("div", { className: "flex items-center gap-2 flex-wrap md:flex-nowrap", children: [_jsxs("button", { type: "button", onClick: () => handleApproveApp(app), className: "px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition", children: [_jsx(Check, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Approve' : 'അംഗീകരിക്കുക' })] }), _jsxs("button", { type: "button", onClick: () => {
                                                setActionModal({ type: 'action_required', app });
                                                setActionInput('Please provide sawmill registration license number and GST certificate.');
                                            }, className: "px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs flex items-center gap-1 transition", children: [_jsx(AlertTriangle, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Request Info' : 'രേഖകൾ ചോദിക്കുക' })] }), _jsxs("button", { type: "button", onClick: () => {
                                                setActionModal({ type: 'reject', app });
                                                setActionInput('Invalid depot documents or incomplete phone verification.');
                                            }, className: "px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-bold text-xs flex items-center gap-1 transition", children: [_jsx(X, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Reject' : 'നിരസിക്കുക' })] })] })] }, app.id)))) })] })), activeTab === 'listings' && (_jsx("div", { className: "bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs divide-y divide-stone-200", children: listings.length === 0 ? (_jsx("div", { className: "p-8 text-center text-stone-500 text-xs", children: lang === 'en' ? 'No pending timber listings.' : 'പരിശോധിക്കാനുള്ള തടി ലിസ്റ്റിംഗുകൾ ഇല്ല.' })) : (listings.map((lst) => (_jsxs("div", { className: "p-5 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-serif font-bold text-base text-[#4A3626]", children: lst.title }), _jsxs("div", { className: "text-xs text-stone-500 mt-1 flex items-center gap-2", children: [_jsxs("span", { children: ["Seller: ", _jsx("b", { children: lst.seller_name })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Species: ", _jsx("b", { children: lst.species })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Volume: ", _jsxs("b", { children: [lst.quantity, " ", lst.unit] })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Rate: ", _jsxs("b", { children: [formatINR(lst.price_per_cft), "/CFT"] })] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => {
                                        setListings(listings.filter((l) => l.id !== lst.id));
                                        addAudit('APPROVE_LISTING', lst.title);
                                        setMessage(lang === 'en' ? 'Listing approved and live.' : 'ലിസ്റ്റിംഗ് അംഗീകരിച്ചു.');
                                    }, className: "px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs", children: [_jsx(Check, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Approve & Publish" })] }), _jsx("button", { onClick: () => {
                                        setListings(listings.filter((l) => l.id !== lst.id));
                                        addAudit('REJECT_LISTING', lst.title, 'Photo quality inadequate');
                                        setMessage(lang === 'en' ? 'Listing rejected.' : 'ലിസ്റ്റിംഗ് നിരസിച്ചു.');
                                    }, className: "px-3.5 py-2 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 font-bold text-xs", children: "Reject" })] })] }, lst.id)))) })), activeTab === 'tickets' && (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 overflow-hidden shadow-xs divide-y divide-stone-200", children: [_jsxs("div", { className: "p-4 bg-stone-50 flex items-center justify-between", children: [_jsx("span", { className: "font-serif font-bold text-sm text-[#4A3626]", children: lang === 'en' ? 'Grievance Redressal Queue' : 'ഉപഭോക്തൃ പരാതികൾ' }), _jsx("div", { className: "flex gap-1 text-xs", children: ['all', 'open', 'resolved'].map((filter) => (_jsx("button", { onClick: () => setTicketFilter(filter), className: `px-3 py-1 rounded-xl font-bold uppercase text-[10px] transition ${ticketFilter === filter
                                        ? 'bg-[#5B6147] text-white'
                                        : 'bg-white border text-stone-600'}`, children: filter }, filter))) })] }), tickets
                        .filter((t) => ticketFilter === 'all' || t.status === ticketFilter)
                        .map((t) => (_jsxs("div", { className: "p-5 flex flex-col md:flex-row md:items-center justify-between gap-4", children: [_jsxs("div", { className: "space-y-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono font-bold text-xs text-[#5B6147]", children: t.id }), _jsx("span", { className: "font-serif font-bold text-sm text-[#4A3626]", children: t.name }), _jsx("span", { className: `px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'open' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}`, children: t.status.toUpperCase() })] }), _jsxs("p", { className: "text-xs text-stone-600 italic", children: ["\"", t.description, "\""] })] }), t.status === 'open' && (_jsxs("button", { onClick: () => {
                                    setReplyTicket(t);
                                    setReplyText(lang === 'en'
                                        ? 'Thank you for contacting Timora. We have investigated your issue and updated your account status.'
                                        : 'ടിമോറയുമായി ബന്ധപ്പെട്ടതിന് നന്ദി. നിങ്ങളുടെ പ്രശ്നം പരിശോധിച്ച് പരിഹരിച്ചിട്ടുണ്ട്.');
                                }, className: "px-4 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs flex items-center gap-1 shadow-xs", children: [_jsx(MessageSquare, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Resolve & Reply" })] }))] }, t.id)))] })), activeTab === 'audit' && (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 p-6 shadow-xs space-y-3 font-mono text-xs", children: [_jsxs("div", { className: "flex items-center justify-between pb-2 border-b border-stone-200", children: [_jsx("span", { className: "font-serif font-bold text-sm text-[#4A3626]", children: lang === 'en' ? 'Append-Only Regulatory Audit Logs' : 'ഓഡിറ്റ് ലോഗുകൾ' }), _jsx("span", { className: "text-[11px] text-stone-500", children: "Immutable Records" })] }), _jsx("div", { className: "space-y-2", children: auditLogs.map((log) => (_jsxs("div", { className: "p-3 bg-[#E7E1D6]/40 border border-stone-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsxs("span", { className: "font-bold text-[#5B6147]", children: ["[", log.action, "]"] }), ' ', _jsx("span", { className: "text-[#4A3626] font-semibold", children: log.target }), log.note && _jsxs("div", { className: "text-[11px] text-stone-500 mt-0.5 italic", children: ["Note: \"", log.note, "\""] })] }), _jsxs("div", { className: "text-[10px] text-stone-400 sm:text-right", children: [_jsxs("div", { children: ["Actor: ", log.actor] }), _jsx("div", { children: log.timestamp })] })] }, log.id))) })] })), actionModal && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 shadow-2xl max-w-md w-full p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b pb-3", children: [_jsx("h3", { className: "font-serif font-bold text-[#4A3626] text-base", children: actionModal.type === 'action_required'
                                        ? (lang === 'en' ? 'Request Additional Info' : 'കൂടുതൽ വിവരങ്ങൾ ആവശ്യപ്പെടുക')
                                        : (lang === 'en' ? 'Reject Application' : 'അപേക്ഷ നിരസിക്കുക') }), _jsx("button", { onClick: () => setActionModal(null), className: "text-stone-400 hover:text-stone-700 font-bold", children: "\u2715" })] }), _jsx("p", { className: "text-xs text-stone-600", children: lang === 'en'
                                ? `Specify details for ${actionModal.app.businessName}:`
                                : `${actionModal.app.businessName} സംബന്ധിച്ച കുറിപ്പ് രേഖപ്പെടുത്തുക:` }), _jsxs("form", { onSubmit: handleConfirmActionModal, className: "space-y-3", children: [_jsx("textarea", { rows: 3, value: actionInput, onChange: (e) => setActionInput(e.target.value), className: "w-full p-3 border rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none", required: true }), _jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setActionModal(null), className: "px-4 py-2 rounded-xl bg-stone-200 text-stone-700 font-bold text-xs", children: "Cancel" }), _jsx("button", { type: "submit", className: `px-5 py-2 rounded-xl text-white font-bold text-xs shadow-xs ${actionModal.type === 'action_required'
                                                ? 'bg-amber-600 hover:bg-amber-700'
                                                : 'bg-rose-600 hover:bg-rose-700'}`, children: "Confirm & Notify User" })] })] })] }) })), replyTicket && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 shadow-2xl max-w-lg w-full p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b pb-3", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] font-bold uppercase tracking-wider text-[#5B6147]", children: "Send Solution to User Dashboard" }), _jsxs("h3", { className: "font-extrabold font-serif text-[#4A3626] text-base", children: ["Ticket ", replyTicket.id, " \u00B7 ", replyTicket.name] })] }), _jsx("button", { onClick: () => setReplyTicket(null), className: "text-stone-400 hover:text-stone-700 font-bold", children: "\u2715" })] }), _jsxs("form", { onSubmit: handleResolveTicket, className: "space-y-3 text-xs", children: [_jsx("textarea", { rows: 4, value: replyText, onChange: (e) => setReplyText(e.target.value), className: "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none", required: true }), _jsxs("div", { className: "pt-2 flex justify-end gap-2", children: [_jsx("button", { type: "button", onClick: () => setReplyTicket(null), className: "px-4 py-2 rounded-xl border text-stone-600 font-semibold", children: "Cancel" }), _jsxs("button", { type: "submit", className: "px-5 py-2 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-1.5 shadow-xs", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Send Solution & Resolve" })] })] })] })] }) })), _jsx(EditProfileModal, { isOpen: isEditProfileOpen, onClose: () => setIsEditProfileOpen(false), lang: lang })] }));
}
