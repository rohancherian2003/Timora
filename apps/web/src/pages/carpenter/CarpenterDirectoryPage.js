import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Hammer, MapPin, Phone, Star, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginAlertModal } from '../../components/LoginAlertModal';
const DEMO_CARPENTERS = [
    {
        id: 'c1',
        name: 'K. R. Mohanan Achari',
        district: 'Kottayam (കോട്ടയം)',
        locality: 'Changanassery',
        experience_yrs: 28,
        specializations: ['Traditional Wooden Doors (വാതിലുകൾ)', 'Roof Truss Framing (മേൽക്കൂര തട്ടിടൽ)', 'Window Casements'],
        rating: 4.9,
        rating_count: 34,
        is_verified: true,
        phone: '+919447300101',
        timber_pref: 'Nilambur Teak & Anjili',
    },
    {
        id: 'c2',
        name: 'Babu Master Wood Joinery',
        district: 'Thrissur (തൃശ്ശൂർ)',
        locality: 'Irinjalakuda',
        experience_yrs: 22,
        specializations: ['Teak Carving & Door Frames', 'Structural Timber Beams'],
        rating: 4.8,
        rating_count: 27,
        is_verified: true,
        phone: '+919447300102',
        timber_pref: 'African Mahogany & Teak',
    },
    {
        id: 'c3',
        name: 'Santhosh Kumar',
        district: 'Ernakulam (എറണാകുളം)',
        locality: 'Muvattupuzha',
        experience_yrs: 15,
        specializations: ['Wooden Ceilings & Paneling', 'Door Fitting & Finishing'],
        rating: 4.7,
        rating_count: 19,
        is_verified: true,
        phone: '+919447300103',
        timber_pref: 'Rubberwood & Anjili',
    },
    {
        id: 'c4',
        name: 'Vijayan & Sons Carpentry',
        district: 'Kozhikode (കോഴിക്കോട്)',
        locality: 'Vadakara',
        experience_yrs: 30,
        specializations: ['Temple & Heritage Woodwork', 'Traditional Nilambur Teak Joinery'],
        rating: 5.0,
        rating_count: 42,
        is_verified: true,
        phone: '+919447300104',
        timber_pref: 'Heritage Teak & Rosewood',
    },
];
export function CarpenterDirectoryPage({ lang = 'en' }) {
    const { isAuthenticated } = useAuth();
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
    });
    const filtered = DEMO_CARPENTERS.filter((c) => {
        if (selectedDistrict !== 'all' && !c.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
            return false;
        }
        return true;
    });
    const handleContactClick = (carpenterName, phone) => {
        if (!isAuthenticated) {
            setAlertModal({
                isOpen: true,
                carpenterName,
            });
            return;
        }
        window.location.href = `tel:${phone}`;
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsx("div", { className: "p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0]", children: _jsxs("div", { className: "max-w-3xl space-y-3", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30", children: [_jsx(Hammer, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Kerala Master Wood Craftsmen' : 'കേരളത്തിലെ പരമ്പരാഗത ആശാരിമാർ' })] }), _jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#4A3626]", children: lang === 'en' ? 'Verified Carpenters & Joinery Masters' : 'വിദഗ്ദ്ധരായ ആശാരിമാർ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium", children: lang === 'en'
                                ? 'Connect directly with master carpenters experienced in roofing trusses, door frames, teak carvings, and traditional Kerala timber architecture.'
                                : 'മേൽക്കൂര തട്ടിടൽ, കട്ടിളകൾ, വാതിലുകൾ, കൊത്തുപണികൾ എന്നിവയിൽ വർഷങ്ങളുടെ പ്രവൃത്തിപരിചയമുള്ള വിദഗ്ദ്ധ തച്ചന്മാർ.' })] }) }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-300/80 shadow-xs flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: lang === 'en' ? 'Filter by District:' : 'ജില്ല തിരിച്ച്:' }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" })] })] }), _jsxs("span", { className: "text-xs font-semibold text-stone-500", children: [filtered.length, " ", lang === 'en' ? 'Carpenters Listed' : 'ആശാരിമാർ ലഭ്യമാണ്'] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: filtered.map((c) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-start justify-between gap-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-extrabold text-[#4A3626] text-lg group-hover:text-[#5B6147] transition font-serif", children: c.name }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-stone-600 mt-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsxs("span", { children: [c.locality, ", ", c.district] })] })] }), _jsxs("div", { className: "flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 text-[#4A3626] border border-stone-300 text-xs font-bold", children: [_jsx(Star, { className: "w-3.5 h-3.5 fill-stone-1000 text-stone-1000" }), _jsx("span", { children: c.rating }), _jsxs("span", { className: "text-stone-400 font-normal", children: ["(", c.rating_count, ")"] })] })] }), _jsxs("div", { className: "mt-3 flex items-center gap-2", children: [_jsxs("span", { className: "px-2.5 py-1 rounded-lg bg-[#E7E1D6] text-[#4A3626] border border-stone-300/60 text-xs font-bold", children: [c.experience_yrs, " ", lang === 'en' ? 'Years Experience' : 'വർഷത്തെ പരിചയം'] }), c.is_verified && (_jsxs("span", { className: "flex items-center gap-1 text-[11px] text-emerald-700 font-semibold", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Verified Carpenter' : 'വെരിഫൈഡ്' })] }))] }), _jsxs("div", { className: "mt-4 pt-3 border-t border-stone-200", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-stone-400", children: lang === 'en' ? 'Specialized Woodwork' : 'പ്രത്യേക മേഖലകൾ' }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: c.specializations.map((spec, i) => (_jsx("span", { className: "px-2.5 py-1 rounded-lg bg-[#fbf7f0] text-[#4A3626] text-xs font-semibold border border-stone-300/60", children: spec }, i))) })] }), _jsxs("div", { className: "mt-3 text-xs text-stone-500", children: [_jsx("span", { className: "font-semibold text-stone-700", children: lang === 'en' ? 'Timber Worked: ' : 'ഉപയോഗിക്കുന്ന തടി: ' }), _jsx("span", { children: c.timber_pref })] })] }), _jsxs("div", { className: "pt-4 border-t border-stone-200 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-[10px] font-bold text-stone-400 uppercase", children: lang === 'en' ? 'Contact' : 'ഫോൺ' }), _jsx("span", { className: "font-mono text-xs font-bold text-stone-900", children: isAuthenticated ? c.phone : '+91 9447••••••' })] }), _jsx("button", { type: "button", onClick: () => handleContactClick(c.name, c.phone), className: "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-xs transition", children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Call Master Craftsman' : 'വിളിക്കുക' })] })) : (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "w-3.5 h-3.5 text-white/80" }), _jsx("span", { children: lang === 'en' ? 'Sign in to Contact' : 'ബന്ധപ്പെടാൻ ലോഗിൻ' })] })) })] })] }, c.id))) }), _jsx(LoginAlertModal, { isOpen: alertModal.isOpen, onClose: () => setAlertModal({ isOpen: false }), lang: lang, entityType: "carpenter", entityName: alertModal.carpenterName, returnUrl: "/carpenters" })] }));
}
