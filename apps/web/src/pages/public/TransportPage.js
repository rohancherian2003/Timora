import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Truck, MapPin, Phone, ShieldCheck, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginAlertModal } from '../../components/LoginAlertModal';
const DEMO_TRANSPORTERS = [
    {
        id: 't1',
        name: 'Malabar Timber Carriers & Logistics',
        phone: '+919447100001',
        service_areas: ['Kozhikode', 'Malappuram', 'Kannur', 'Wayanad'],
        vehicle_types: 'Crane-Mounted Multi-Axle Trucks (ഹെവി ക്രെയിൻ ലോറികൾ)',
        capacity: '25 Tonnes / 600 CFT',
        notes: 'Specialists in heavy round log loading and inter-district forest transit with Form IV permits.',
        verified: true,
    },
    {
        id: 't2',
        name: 'Travancore Wood Movers',
        phone: '+919447200002',
        service_areas: ['Ernakulam', 'Kottayam', 'Alappuzha', 'Idukki'],
        vehicle_types: 'Covered Sawn Plank Carriers (അറുത്ത പലകകൾ സുരക്ഷിതമായി എത്തിക്കാൻ)',
        capacity: '15 Tonnes / 400 CFT',
        notes: 'Tarpaulin-covered flatbeds protecting seasoned furniture planks from weather and transit moisture.',
        verified: true,
    },
    {
        id: 't3',
        name: 'Highland Timber Freight Services',
        phone: '+919447300003',
        service_areas: ['Palakkad', 'Thrissur', 'Ernakulam'],
        vehicle_types: '10-Wheel Heavy Flatbed Trucks (കഴുക്കോലുകളും ബീമുകളും)',
        capacity: '30 Tonnes / 750 CFT',
        notes: 'Specialized for extra-long 20ft squared beams, rafters, and commercial saw mill dispatches.',
        verified: true,
    },
    {
        id: 't4',
        name: 'Pala-Kottayam Wood Express',
        phone: '+919447400004',
        service_areas: ['Kottayam', 'Pathanamthitta', 'Idukki'],
        vehicle_types: 'Medium 6-Wheel Tipper & Log Hauler',
        capacity: '10 Tonnes / 250 CFT',
        notes: 'Quick dispatches for rubberwood logs, local sawmills, and residential roof frame timber.',
        verified: true,
    },
];
export function TransportPage({ lang = 'en' }) {
    const { isAuthenticated } = useAuth();
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
    });
    const filtered = DEMO_TRANSPORTERS.filter((t) => {
        if (selectedDistrict === 'all')
            return true;
        return t.service_areas.some((area) => area.toLowerCase().includes(selectedDistrict.toLowerCase()));
    });
    const handleContactClick = (providerName, phone) => {
        if (!isAuthenticated) {
            setAlertModal({
                isOpen: true,
                providerName,
            });
            return;
        }
        window.location.href = `tel:${phone}`;
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsx("div", { className: "p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0]", children: _jsxs("div", { className: "max-w-3xl space-y-3", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30", children: [_jsx(Truck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Kerala Timber Haulage Network' : 'കേരള തടി ട്രാൻസ്പോർട്ട് നെറ്റ്‌വർക്ക്' })] }), _jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#4A3626]", children: lang === 'en' ? 'Timber Transit & Crane Carrier Lorries' : 'തടി കൊണ്ടുപോകുന്ന ലോറികൾ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium", children: lang === 'en'
                                ? 'Find verified crane-equipped lorries, heavy flatbeds, and covered carriers for safe raw timber transit across all 14 Kerala districts.'
                                : 'ഉരുണ്ട തടികൾ കയറ്റാൻ ഹൈഡ്രോളിക് ക്രെയിൻ ഉള്ള ഹെവി വാഹനങ്ങളും, പലകകൾ മഴ നനയാതെ എത്തിക്കാനുള്ള വാഹനങ്ങളും.' })] }) }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-300/80 shadow-xs flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: lang === 'en' ? 'Filter by District:' : 'ജില്ല തിരിച്ച്:' }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" }), _jsx("option", { value: "palakkad", children: "Palakkad (\u0D2A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" })] })] }), _jsxs("span", { className: "text-xs font-semibold text-stone-500", children: [filtered.length, " ", lang === 'en' ? 'Carriers Available' : 'ലോറികൾ ലഭ്യമാണ്'] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: filtered.map((t) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group", children: [_jsxs("div", { children: [_jsx("div", { className: "flex items-start justify-between gap-2", children: _jsxs("div", { children: [_jsx("h3", { className: "font-extrabold text-[#4A3626] text-lg group-hover:text-[#5B6147] transition font-serif", children: t.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("span", { className: "px-2.5 py-0.5 rounded-full bg-stone-100 text-[#4A3626] border border-stone-300 text-[10px] font-bold", children: t.capacity }), t.verified && (_jsxs("span", { className: "flex items-center gap-1 text-[11px] text-emerald-700 font-semibold", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Verified Hauler' : 'പരിശോധിച്ചുറപ്പിച്ചത്' })] }))] })] }) }), _jsx("div", { className: "mt-3 p-3 rounded-2xl bg-[#E7E1D6] border border-stone-300/80 text-xs font-bold text-[#4A3626]", children: t.vehicle_types }), _jsx("p", { className: "mt-3 text-xs text-stone-600 leading-relaxed font-normal", children: t.notes }), _jsxs("div", { className: "mt-4 pt-3 border-t border-stone-200", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-stone-400", children: lang === 'en' ? 'Active Transit Routes' : 'സർവീസ് റൂട്ടുകൾ' }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: t.service_areas.map((dist, i) => (_jsx("span", { className: "px-2.5 py-1 rounded-lg bg-[#fbf7f0] text-[#4A3626] border border-stone-300/60 text-xs font-semibold", children: dist }, i))) })] })] }), _jsxs("div", { className: "pt-4 border-t border-stone-200 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-[10px] font-bold text-stone-400 uppercase", children: lang === 'en' ? 'Direct Contact' : 'നേരിട്ടുള്ള ഫോൺ' }), _jsx("span", { className: "font-mono text-xs font-bold text-stone-900", children: isAuthenticated ? t.phone : '+91 9447••••••' })] }), _jsx("button", { type: "button", onClick: () => handleContactClick(t.name, t.phone), className: "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-xs transition", children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Call Carrier' : 'വിളിക്കുക' })] })) : (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "w-3.5 h-3.5 text-white/85" }), _jsx("span", { children: lang === 'en' ? 'Sign in to Contact' : 'ബന്ധപ്പെടാൻ ലോഗിൻ' })] })) })] })] }, t.id))) }), _jsx(LoginAlertModal, { isOpen: alertModal.isOpen, onClose: () => setAlertModal({ isOpen: false }), lang: lang, entityType: "transport", entityName: alertModal.providerName, returnUrl: "/transport" })] }));
}
