import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LifeBuoy, X, Send, CheckCircle2, AlertCircle, Clock, Phone, User, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createTicket } from '../utils/ticketService';
const CATEGORIES = [
    {
        key: 'quality',
        en: 'Timber Quality & CFT Measurement Issue',
        ml: 'തടിയുടെ ഗുണനിലവാരം & സി.എഫ്.ടി അളവ് പ്രശ്നം',
    },
    {
        key: 'mill_delay',
        en: 'Sawmill / Sizing Delivery Delay',
        ml: 'തടി അറുക്കൽ / ഡെലിവറി കാലതാമസം',
    },
    {
        key: 'payment',
        en: 'Payment & Advance Escrow Dispute',
        ml: 'പണമിടപാട് / അഡ്വാൻസ് തർക്കം',
    },
    {
        key: 'transit_pass',
        en: 'Forest Form IV Transit Pass Assistance',
        ml: 'ഫോറസ്റ്റ് ട്രാൻസിറ്റ് പാസ്സ് സംബന്ധിച്ച്',
    },
    {
        key: 'other',
        en: 'General Platform Support & Help',
        ml: 'മറ്റു പരാതികൾ / പൊതുവായ സഹായം',
    },
];
export function RaiseTicketModal({ isOpen, onClose, lang = 'en' }) {
    const { user } = useAuth();
    const getInitialRole = () => {
        if (!user)
            return 'buyer';
        if (user.role === 'seller') {
            return user.sellerSubtype === 'mill_owner' ? 'mill_owner' : 'seller';
        }
        if (user.role === 'carpenter')
            return 'carpenter';
        if (user.role === 'transport')
            return 'transport';
        return 'buyer';
    };
    const [role, setRole] = useState(getInitialRole());
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    useEffect(() => {
        if (user) {
            setRole(getInitialRole());
            if (user.name)
                setName(user.name);
            if (user.phone)
                setPhone(user.phone);
        }
    }, [user]);
    const [categoryKey, setCategoryKey] = useState('quality');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('normal');
    // Strict Validation Error State
    const [errors, setErrors] = useState({});
    // Success state with created ticket details
    const [submittedTicket, setSubmittedTicket] = useState(null);
    if (!isOpen)
        return null;
    const validate = () => {
        const newErrors = {};
        // Name validation
        const trimmedName = name.trim();
        if (!trimmedName) {
            newErrors.name = lang === 'en' ? 'Full Name is required' : 'പേര് നൽകേണ്ടതാണ്';
        }
        else if (trimmedName.length < 3) {
            newErrors.name = lang === 'en' ? 'Name must be at least 3 characters' : 'പേര് കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ വേണം';
        }
        // Phone validation
        const cleanPhone = phone.replace(/\D/g, '');
        if (!cleanPhone) {
            newErrors.phone = lang === 'en' ? 'Phone number is required' : 'ഫോൺ നമ്പർ നൽകേണ്ടതാണ്';
        }
        else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
            newErrors.phone = lang === 'en'
                ? 'Enter a valid 10-digit Indian mobile number (starting 6-9)'
                : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക (6-9 ൽ ആരംഭിക്കുന്നത്)';
        }
        // Description validation
        const trimmedDesc = description.trim();
        if (!trimmedDesc) {
            newErrors.description = lang === 'en' ? 'Please describe your problem' : 'പ്രശ്നം വിശദീകരിക്കേണ്ടതാണ്';
        }
        else if (trimmedDesc.length < 15) {
            newErrors.description = lang === 'en'
                ? `Please enter at least 15 characters (${trimmedDesc.length}/15)`
                : `കുറഞ്ഞത് 15 അക്ഷരങ്ങളെങ്കിലും നൽകുക (${trimmedDesc.length}/15)`;
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate())
            return;
        const matchedCat = CATEGORIES.find((c) => c.key === categoryKey) || CATEGORIES[0];
        const ticket = createTicket({
            name: name.trim(),
            phone: phone.replace(/\D/g, ''),
            role,
            category: matchedCat.en,
            categoryMl: matchedCat.ml,
            description: description.trim(),
            priority,
        });
        setSubmittedTicket(ticket);
        setErrors({});
    };
    const handleResetAndClose = () => {
        setSubmittedTicket(null);
        setDescription('');
        setErrors({});
        onClose();
    };
    const modalContent = (_jsx("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center bg-[#2C2218]/70 backdrop-blur-xs p-3 sm:p-4 animate-fadeIn overflow-y-auto", onClick: handleResetAndClose, children: _jsxs("div", { className: "bg-[#FDFBF7] rounded-3xl border-2 border-[#8E7F6B]/30 shadow-2xl max-w-lg w-full p-5 sm:p-7 space-y-4 max-h-[92vh] overflow-y-auto my-auto relative transform transition-all", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#8E7F6B]/20 pb-3", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-10 h-10 rounded-2xl bg-[#E7E1D6] text-[#5B6147] border border-[#8E7F6B]/30 flex items-center justify-center font-bold shadow-xs", children: _jsx(LifeBuoy, { className: "w-5 h-5" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-extrabold font-serif text-[#4A3626] text-lg sm:text-xl", children: lang === 'en' ? 'Raise a Support Ticket' : 'പരാതി നൽകുക (Raise a Ticket)' }), _jsx("span", { className: "text-[11px] text-[#7A5A3A] font-semibold block", children: lang === 'en'
                                                ? 'Official Timora Kerala Timber Grievance Cell'
                                                : 'ടിമോറ തടി വിപണി പരാതി പരിഹാര കേന്ദ്രം' })] })] }), _jsx("button", { onClick: handleResetAndClose, className: "text-[#8E7F6B] hover:text-[#4A3626] p-1.5 rounded-xl hover:bg-[#E7E1D6]/50 transition", title: "Close", children: _jsx(X, { className: "w-5 h-5" }) })] }), submittedTicket ? (_jsxs("div", { className: "py-4 space-y-5 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center mx-auto shadow-inner", children: _jsx(CheckCircle2, { className: "w-10 h-10 text-emerald-700" }) }), _jsxs("div", { className: "space-y-1.5", children: [_jsxs("span", { className: "px-3 py-1 rounded-full bg-[#E7E1D6] text-[#4A3626] border border-[#8E7F6B]/30 font-mono text-xs font-bold inline-block", children: ["Ticket ID: ", submittedTicket.id] }), _jsx("h4", { className: "font-extrabold font-serif text-[#4A3626] text-lg", children: lang === 'en' ? 'Ticket Submitted to Admin!' : 'പരാതി അഡ്മിന് ലഭിച്ചിട്ടുണ്ട്!' })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/30 text-left space-y-2.5", children: [_jsxs("div", { className: "flex items-center gap-2 text-[#4A3626] text-xs font-bold", children: [_jsx(Clock, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en'
                                                ? 'Expected Resolution: Within 2 Business Days'
                                                : '2 ദിവസത്തിനുള്ളിൽ പരിഹാരം ഉറപ്പ്' })] }), _jsx("p", { className: "text-xs text-[#523F2F] leading-relaxed font-medium", children: lang === 'en'
                                        ? 'Our Super Admin cell will review your issue, inspect the timber depot/mill logs, and post a resolution reply directly to your Dashboard notifications.'
                                        : 'അഡ്മിൻ ഈ പരാതി പരിശോധിച്ച്, ബന്ധപ്പെട്ട തടി വ്യാപാരിയുമായോ മില്ലുമായോ സംസാരിച്ച് 2 ദിവസത്തിനുള്ളിൽ ഇതിനുള്ള പരിഹാരം (Resolution Reply) താങ്കളുടെ ഡാഷ്‌ബോർഡിൽ അറിയിക്കുന്നതായിരിക്കും!' }), _jsxs("div", { className: "text-[11px] text-[#7A5A3A] pt-1.5 border-t border-[#8E7F6B]/20 flex items-center justify-between font-semibold", children: [_jsxs("span", { children: ["Contact: +91 ", submittedTicket.phone] }), _jsx("span", { children: submittedTicket.createdAt })] })] }), _jsx("div", { className: "pt-2", children: _jsx("button", { onClick: handleResetAndClose, className: "w-full py-3 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm shadow-md transition", children: lang === 'en' ? 'Close & Track Status' : 'ശരി, ട്രാക്ക് ചെയ്യുക' }) })] })) : (
                /* Ticket Form */
                _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4 text-xs", noValidate: true, children: [user ? (_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1.5", children: lang === 'en' ? 'Submitting As (Verified Role):' : 'അക്കൗണ്ട് റോൾ:' }), _jsxs("div", { className: "p-3 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-700 flex-shrink-0" }), _jsx("span", { className: "font-bold text-[#4A3626] text-xs capitalize", children: role === 'mill_owner'
                                                        ? (lang === 'en' ? 'Timber Mill Owner' : 'ടിംബർ മില്ല് ഉടമ')
                                                        : role === 'seller'
                                                            ? (lang === 'en' ? 'Individual Timber Seller' : 'വ്യക്തിഗത തടി വ്യാപാരി')
                                                            : role === 'carpenter'
                                                                ? (lang === 'en' ? 'Carpenter' : 'ആശാരി')
                                                                : role === 'transport'
                                                                    ? (lang === 'en' ? 'Transport Owner' : 'തടി ലോറി ഉടമ')
                                                                    : (lang === 'en' ? 'Buyer' : 'ഉപഭോക്താവ്') })] }), _jsxs("span", { className: "flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800", children: [_jsx(Lock, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Locked' : 'സ്ഥിരീകരിച്ചത്' })] })] })] })) : (_jsxs("div", { children: [_jsx("label", { className: "block font-bold text-[#4A3626] mb-1.5", children: lang === 'en' ? 'I am a (Select your role):' : 'ഞാൻ ഒരു:' }), _jsx("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-2", children: [
                                        { key: 'buyer', en: 'Buyer', ml: 'ഉപഭോക്താവ്' },
                                        { key: 'seller', en: 'Indiv. Seller', ml: 'തടി വ്യാപാരി' },
                                        { key: 'mill_owner', en: 'Mill Owner', ml: 'മില്ല് ഉടമ' },
                                        { key: 'carpenter', en: 'Carpenter', ml: 'ആശാരി' },
                                        { key: 'transport', en: 'Transport', ml: 'ലോറി ഉടമ' },
                                    ].map((item) => (_jsx("button", { type: "button", onClick: () => setRole(item.key), className: `py-2 px-1.5 rounded-xl text-center font-bold text-[11px] border transition ${role === item.key
                                            ? 'bg-[#5B6147] text-white border-[#5B6147] shadow-xs'
                                            : 'bg-white text-[#4A3626] border-[#8E7F6B]/30 hover:bg-[#E7E1D6]/40'}`, children: lang === 'en' ? item.en : item.ml }, item.key))) })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsxs("label", { className: "block font-bold text-[#4A3626] mb-1", children: [lang === 'en' ? 'Your Full Name' : 'താങ്കളുടെ പേര്', " ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-3.5 h-3.5 text-[#8E7F6B] absolute left-3 top-3" }), _jsx("input", { type: "text", placeholder: "e.g. Suresh Kumar", value: name, onChange: (e) => {
                                                        setName(e.target.value);
                                                        if (errors.name)
                                                            setErrors((prev) => ({ ...prev, name: undefined }));
                                                    }, className: `w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold text-[#4A3626] bg-white focus:outline-none focus:ring-2 ${errors.name
                                                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                                                        : 'border-[#8E7F6B]/30 focus:ring-[#5B6147] focus:border-[#5B6147]'}` })] }), errors.name && (_jsxs("div", { className: "flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1", children: [_jsx(AlertCircle, { className: "w-3 h-3 flex-shrink-0" }), _jsx("span", { children: errors.name })] }))] }), _jsxs("div", { children: [_jsxs("label", { className: "block font-bold text-[#4A3626] mb-1", children: [lang === 'en' ? 'Phone Number' : 'ഫോൺ നമ്പർ', " ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "w-3.5 h-3.5 text-[#8E7F6B] absolute left-3 top-3" }), _jsx("input", { type: "tel", maxLength: 10, placeholder: "9847123456", value: phone, onChange: (e) => {
                                                        const val = e.target.value.replace(/\D/g, '');
                                                        setPhone(val);
                                                        if (errors.phone)
                                                            setErrors((prev) => ({ ...prev, phone: undefined }));
                                                    }, className: `w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold text-[#4A3626] bg-white focus:outline-none focus:ring-2 ${errors.phone
                                                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                                                        : 'border-[#8E7F6B]/30 focus:ring-[#5B6147] focus:border-[#5B6147]'}` })] }), errors.phone && (_jsxs("div", { className: "flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1", children: [_jsx(AlertCircle, { className: "w-3 h-3 flex-shrink-0" }), _jsx("span", { children: errors.phone })] }))] })] }), _jsxs("div", { children: [_jsxs("label", { className: "block font-bold text-[#4A3626] mb-1", children: [lang === 'en' ? 'Issue Category' : 'പരാതിയുടെ വിഷയം', " ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsx("select", { value: categoryKey, onChange: (e) => setCategoryKey(e.target.value), className: "w-full px-3 py-2.5 rounded-xl border border-[#8E7F6B]/30 bg-white text-xs sm:text-sm text-[#4A3626] font-semibold focus:outline-none focus:ring-2 focus:ring-[#5B6147]", children: CATEGORIES.map((cat) => (_jsx("option", { value: cat.key, children: lang === 'en' ? cat.en : cat.ml }, cat.key))) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsxs("label", { className: "font-bold text-[#4A3626]", children: [lang === 'en' ? 'Problem / Issue Description' : 'എന്താണ് പ്രശ്നം / പരാതി', " ", _jsx("span", { className: "text-red-500", children: "*" })] }), _jsxs("span", { className: "text-[10px] font-mono text-[#8E7F6B]", children: [description.length, "/1000"] })] }), _jsx("textarea", { rows: 4, maxLength: 1000, placeholder: lang === 'en'
                                        ? 'Describe what happened in detail (e.g. CFT measurement mismatch, quality defect, sawmill delay, unreturned advance)...'
                                        : 'പ്രശ്നത്തെക്കുറിച്ച് വിശദമായി എഴുതുക (ഉദാ: തടിയുടെ അളവിൽ വന്ന വ്യത്യാസം, തടിക്ക് കേടുപാടുകൾ, മിൽ കാലതാമസം)...', value: description, onChange: (e) => {
                                        setDescription(e.target.value);
                                        if (errors.description)
                                            setErrors((prev) => ({ ...prev, description: undefined }));
                                    }, className: `w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-medium text-[#4A3626] bg-white focus:outline-none focus:ring-2 ${errors.description
                                        ? 'border-red-500 focus:ring-red-400 bg-red-50/20'
                                        : 'border-[#8E7F6B]/30 focus:ring-[#5B6147] focus:border-[#5B6147]'}` }), errors.description && (_jsxs("div", { className: "flex items-center gap-1 text-[11px] font-semibold text-red-600 mt-1", children: [_jsx(AlertCircle, { className: "w-3 h-3 flex-shrink-0" }), _jsx("span", { children: errors.description })] }))] }), _jsxs("div", { className: "flex items-center justify-between pt-1", children: [_jsx("span", { className: "font-bold text-[#4A3626] text-xs", children: lang === 'en' ? 'Urgency Level:' : 'പ്രാധാന്യം:' }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { type: "button", onClick: () => setPriority('normal'), className: `px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${priority === 'normal'
                                                ? 'bg-[#E7E1D6] text-[#4A3626] border-[#8E7F6B]/40 shadow-xs'
                                                : 'bg-white text-[#7A5A3A] border-[#8E7F6B]/20 hover:bg-[#E7E1D6]/30'}`, children: lang === 'en' ? 'Normal' : 'സാധാരണ' }), _jsxs("button", { type: "button", onClick: () => setPriority('urgent'), className: `px-3 py-1.5 rounded-xl text-[11px] font-bold border transition ${priority === 'urgent'
                                                ? 'bg-[#8B3A2B] text-white border-[#8B3A2B] shadow-xs'
                                                : 'bg-white text-[#8B3A2B] border-[#8B3A2B]/30 hover:bg-[#8B3A2B]/10'}`, children: ["\u26A1 ", lang === 'en' ? 'Urgent' : 'അടിയന്തിരം'] })] })] }), _jsxs("div", { className: "pt-3 border-t border-[#8E7F6B]/20 flex items-center justify-end gap-2.5", children: [_jsx("button", { type: "button", onClick: handleResetAndClose, className: "px-4 py-2.5 rounded-xl border border-[#8E7F6B]/40 text-[#4A3626] font-bold hover:bg-[#E7E1D6]/40 transition", children: lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക' }), _jsxs("button", { type: "submit", className: "px-6 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold flex items-center gap-2 shadow-md shadow-amber-950/10 transition", children: [_jsx(Send, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Submit to Admin' : 'അഡ്മിന് അയക്കുക' })] })] })] }))] }) }));
    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent;
}
