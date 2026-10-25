import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Hammer, MapPin, Phone, Star, CheckCircle } from 'lucide-react';
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
    },
];
export function CarpenterDirectoryPage({ lang = 'en' }) {
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const filtered = DEMO_CARPENTERS.filter((c) => {
        if (selectedDistrict !== 'all' && !c.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
            return false;
        }
        return true;
    });
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5", children: [_jsx(Hammer, { className: "w-7 h-7 text-forest-700" }), lang === 'en' ? 'Verified Carpenters Directory' : 'കേരളത്തിലെ ആശാരിമാർ (Carpenters)'] }), _jsx("p", { className: "text-sm text-slate-600 mt-1", children: lang === 'en'
                                    ? 'Find experienced traditional carpenters and timber craftsmen for your construction joinery.'
                                    : 'വാതിലുകൾ, ജനലുകൾ, മേൽക്കൂരകൾ എന്നിവ നിർമ്മിക്കുന്നതിനായുള്ള മികച്ച ആശാരിമാരെ കണ്ടെത്തൂ.' })] }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3.5 py-2 border rounded-xl text-slate-700 font-medium text-xs sm:text-sm bg-white shadow-sm", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Kerala Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((carpenter) => (_jsxs("div", { className: "bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 text-base", children: carpenter.name }), _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-slate-500 mt-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-forest-700 flex-shrink-0" }), _jsxs("span", { children: [carpenter.locality, ", ", carpenter.district] })] })] }), carpenter.is_verified && (_jsxs("span", { className: "inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-[11px] font-semibold", children: [_jsx(CheckCircle, { className: "w-3.5 h-3.5 text-forest-600" }), "Verified"] }))] }), _jsxs("div", { className: "flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600", children: [_jsxs("div", { className: "flex items-center gap-1 font-semibold text-amber-600", children: [_jsx(Star, { className: "w-4 h-4 fill-amber-400 text-amber-400" }), _jsx("span", { children: carpenter.rating }), _jsxs("span", { className: "text-slate-400 font-normal", children: ["(", carpenter.rating_count, ")"] })] }), _jsx("div", { children: "\u00B7" }), _jsxs("div", { children: [_jsx("strong", { children: carpenter.experience_yrs }), " ", lang === 'en' ? 'years exp.' : 'വർഷത്തെ പരിചയം'] })] }), _jsx("div", { className: "mt-3 flex flex-wrap gap-1.5", children: carpenter.specializations.map((spec, i) => (_jsx("span", { className: "px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium", children: spec }, i))) })] }), _jsxs("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between", children: [_jsx("span", { className: "text-xs text-slate-400 font-mono", children: carpenter.phone }), _jsxs("a", { href: `tel:${carpenter.phone}`, className: "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition", children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Contact' : 'വിളിക്കുക'] })] })] }, carpenter.id))) })] }));
}
