import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Truck, MapPin, Phone, ShieldCheck, Lock, Star, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LoginAlertModal } from '../../components/LoginAlertModal';
import { BackButton } from '../../components/BackButton';
import { SubmitReviewModal } from '../../components/SubmitReviewModal';
const INITIAL_TRANSPORTERS = [
    {
        id: 't1',
        name: 'Malabar Timber Carriers & Logistics',
        phone: '+919447100001',
        service_areas: ['Kozhikode', 'Malappuram', 'Kannur', 'Wayanad'],
        vehicle_types: 'Crane-Mounted Multi-Axle Trucks (ഹെവി ക്രെയിൻ ലോറികൾ)',
        capacity: '25 Tonnes / 600 CFT',
        notes: 'Specialists in heavy round log loading and inter-district forest transit with Form IV permits.',
        verified: true,
        rating: 4.9,
        rating_count: 38,
        reviews: [
            {
                id: 'rev-t1-1',
                author: 'K. R. Madhavan (Depot Owner)',
                role: 'Verified Seller',
                rating: 5,
                date: '1 week ago',
                comment: 'Transported 550 CFT of Nilambur Teak logs from Nilambur depot to Kottayam sawmill with full Form IV forest pass clearances. The crane loading was seamless.',
                commentMl: 'നിലമ്പൂർ ഡിപ്പോയിൽ നിന്ന് കോട്ടയത്തേക്ക് 550 CFT തേക്ക് ക്രെയിൻ ഉപയോഗിച്ച് സുരക്ഷിതമായി എത്തിച്ചു. കൃത്യസമയത്ത് ഡെലിവറി.',
                isVerified: true,
            },
            {
                id: 'rev-t1-2',
                author: 'Suresh Kumar',
                role: 'Verified Buyer',
                rating: 4.8,
                date: '3 weeks ago',
                comment: 'Careful handling of seasoned roof rafters. Tarpaulin cover kept everything dry despite heavy monsoon rain.',
                commentMl: 'മഴയത്ത് തടി നനയാതെ ടാർപോളിൻ ഇട്ട് വളരെ ശ്രദ്ധയോടെ വീട്ടുപടിക്കൽ എത്തിച്ചു.',
                isVerified: true,
            },
        ],
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
        rating: 4.8,
        rating_count: 29,
        reviews: [
            {
                id: 'rev-t2-1',
                author: 'George Varghese (Sawmill Owner)',
                role: 'Timber Mill Owner',
                rating: 5,
                date: '2 weeks ago',
                comment: 'On-time delivery of 12ft sawn planks without edge chipping. Reliable driver with genuine forest transit experience.',
                commentMl: 'അറുത്ത പലകകൾ യാതൊരു പോറലുമില്ലാതെ സമയത്തിന് സൈറ്റിൽ എത്തിച്ചു. നല്ല ഡ്രൈവിംഗ്.',
                isVerified: true,
            },
        ],
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
        rating: 4.7,
        rating_count: 22,
        reviews: [
            {
                id: 'rev-t3-1',
                author: 'Master Binu Achari',
                role: 'Master Carpenter',
                rating: 4.7,
                date: '1 month ago',
                comment: 'Extra-long 22ft temple beams transported safely without vibration bend. Top-tier heavy flatbed logistics.',
                commentMl: 'ക്ഷേത്ര മേൽക്കൂരയ്ക്കുള്ള വലിയ കഴുക്കോലുകൾ സുരക്ഷിതമായി എത്തിച്ചു.',
                isVerified: true,
            },
        ],
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
        rating: 4.9,
        rating_count: 31,
        reviews: [
            {
                id: 'rev-t4-1',
                author: 'Saji Mathew',
                role: 'Verified Buyer',
                rating: 5,
                date: '5 days ago',
                comment: 'Quick and fair transit charges for rubberwood hauling to the processing unit.',
                commentMl: 'റബർ തടി അറുക്കൽ മില്ലിലേക്ക് കൊണ്ടുപോകാൻ വളരെ വേഗത്തിൽ വാഹനം തന്നു.',
                isVerified: true,
            },
        ],
    },
];
export function TransportPage({ lang = 'en' }) {
    const { isAuthenticated } = useAuth();
    const [transporters, setTransporters] = useState(INITIAL_TRANSPORTERS);
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [expandedReviews, setExpandedReviews] = useState({});
    const [alertModal, setAlertModal] = useState({
        isOpen: false,
    });
    const [reviewModal, setReviewModal] = useState({
        isOpen: false,
    });
    const filtered = transporters.filter((t) => {
        if (selectedDistrict === 'all')
            return true;
        return t.service_areas.some((area) => area.toLowerCase().includes(selectedDistrict.toLowerCase()));
    });
    const toggleReviews = (id) => {
        setExpandedReviews((prev) => ({ ...prev, [id]: !prev[id] }));
    };
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
    const handleReviewSubmitted = (providerId, newReview) => {
        setTransporters((prev) => prev.map((t) => {
            if (t.id === providerId) {
                const updatedReviews = [newReview, ...t.reviews];
                const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
                const newAvg = parseFloat((totalRating / updatedReviews.length).toFixed(1));
                return {
                    ...t,
                    rating: newAvg,
                    rating_count: t.rating_count + 1,
                    reviews: updatedReviews,
                };
            }
            return t;
        }));
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6", children: [_jsx("div", { className: "flex items-center", children: _jsx(BackButton, { fallbackPath: "/marketplace", lang: lang }) }), _jsx("div", { className: "p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0]", children: _jsxs("div", { className: "max-w-3xl space-y-3", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30", children: [_jsx(Truck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Kerala Timber Haulage Network' : 'കേരള തടി ട്രാൻസ്പോർട്ട് നെറ്റ്‌വർക്ക്' })] }), _jsx("h1", { className: "text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#4A3626]", children: lang === 'en' ? 'Timber Transit & Crane Carrier Lorries' : 'തടി കൊണ്ടുപോകുന്ന ലോറികൾ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium", children: lang === 'en'
                                ? 'Find verified crane-equipped lorries, heavy flatbeds, and covered carriers for safe raw timber transit across all 14 Kerala districts.'
                                : 'ഉരുണ്ട തടികൾ കയറ്റാൻ ഹൈഡ്രോളിക് ക്രെയിൻ ഉള്ള ഹെവി വാഹനങ്ങളും, പലകകൾ മഴ നനയാതെ എത്തിക്കാനുള്ള വാഹനങ്ങളും.' })] }) }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-300/80 shadow-xs flex items-center justify-between gap-4 flex-wrap", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(MapPin, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { className: "text-xs font-bold text-stone-700", children: lang === 'en' ? 'Filter by District:' : 'ജില്ല തിരിച്ച്:' }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" }), _jsx("option", { value: "palakkad", children: "Palakkad (\u0D2A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" })] })] }), _jsxs("span", { className: "text-xs font-semibold text-stone-500", children: [filtered.length, " ", lang === 'en' ? 'Carriers Available' : 'ലോറികൾ ലഭ്യമാണ്'] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: filtered.map((t) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-start justify-between gap-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-extrabold text-[#4A3626] text-lg group-hover:text-[#5B6147] transition font-serif", children: t.name }), _jsxs("div", { className: "flex items-center gap-2 mt-1", children: [_jsx("span", { className: "px-2.5 py-0.5 rounded-full bg-stone-100 text-[#4A3626] border border-stone-300 text-[10px] font-bold", children: t.capacity }), t.verified && (_jsxs("span", { className: "flex items-center gap-1 text-[11px] text-emerald-700 font-semibold", children: [_jsx(ShieldCheck, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Verified Hauler' : 'പരിശോധിച്ചുറപ്പിച്ചത്' })] }))] })] }), _jsxs("div", { className: "flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex-shrink-0", children: [_jsx(Star, { className: "w-3.5 h-3.5 fill-amber-400 text-amber-500" }), _jsx("span", { children: t.rating.toFixed(1) }), _jsxs("span", { className: "text-amber-700/70 font-normal", children: ["(", t.rating_count, ")"] })] })] }), _jsx("div", { className: "mt-3 p-3 rounded-2xl bg-[#E7E1D6] border border-stone-300/80 text-xs font-bold text-[#4A3626]", children: t.vehicle_types }), _jsx("p", { className: "mt-3 text-xs text-stone-600 leading-relaxed font-normal", children: t.notes }), _jsxs("div", { className: "mt-4 pt-3 border-t border-stone-200", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-stone-400", children: lang === 'en' ? 'Active Transit Routes' : 'സർവീസ് റൂട്ടുകൾ' }), _jsx("div", { className: "flex flex-wrap gap-1.5 mt-2", children: t.service_areas.map((dist, i) => (_jsx("span", { className: "px-2.5 py-1 rounded-lg bg-[#fbf7f0] text-[#4A3626] border border-stone-300/60 text-xs font-semibold", children: dist }, i))) })] }), _jsxs("div", { className: "mt-4 pt-3 border-t border-stone-200", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("button", { type: "button", onClick: () => toggleReviews(t.id), className: "text-xs font-bold text-[#5B6147] hover:underline flex items-center gap-1.5", children: [_jsx(MessageSquare, { className: "w-3.5 h-3.5" }), _jsx("span", { children: expandedReviews[t.id]
                                                                ? (lang === 'en' ? 'Hide Verified Reviews' : 'റിവ്യൂകൾ മറയ്ക്കുക')
                                                                : (lang === 'en' ? `View ${t.reviews.length} Verified Reviews` : `റിവ്യൂകൾ കാണുക (${t.reviews.length})`) })] }), _jsxs("button", { type: "button", onClick: () => setReviewModal({
                                                        isOpen: true,
                                                        providerId: t.id,
                                                        providerName: t.name,
                                                    }), className: "text-[11px] font-bold text-[#4A3626] hover:text-[#5B6147] transition flex items-center gap-1", children: [_jsx(Star, { className: "w-3 h-3 text-amber-500 fill-amber-400" }), _jsx("span", { children: lang === 'en' ? 'Rate & Review' : 'റേറ്റിംഗ് നൽകുക' })] })] }), expandedReviews[t.id] && (_jsx("div", { className: "mt-3 space-y-2.5 animate-fadeIn", children: t.reviews.map((rev) => (_jsxs("div", { className: "p-3 rounded-2xl bg-[#FAF8F5] border border-stone-200 text-xs space-y-1", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "font-bold text-[#4A3626]", children: rev.author }), _jsxs("span", { className: "px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center gap-0.5", children: [_jsx(ShieldCheck, { className: "w-2.5 h-2.5" }), _jsx("span", { children: rev.role })] })] }), _jsx("span", { className: "text-[10px] text-stone-400 font-medium", children: rev.date })] }), _jsx("div", { className: "flex items-center gap-1", children: [1, 2, 3, 4, 5].map((s) => (_jsx(Star, { className: `w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-500' : 'fill-stone-100 text-stone-300'}` }, s))) }), _jsx("p", { className: "text-stone-600 leading-relaxed text-[11px] font-normal", children: lang === 'en' ? rev.comment : (rev.commentMl || rev.comment) })] }, rev.id))) }))] })] }), _jsxs("div", { className: "pt-4 border-t border-stone-200 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "block text-[10px] font-bold text-stone-400 uppercase", children: lang === 'en' ? 'Direct Contact' : 'നേരിട്ടുള്ള ഫോൺ' }), _jsx("span", { className: "font-mono text-xs font-bold text-stone-900", children: isAuthenticated ? t.phone : '+91 9447••••••' })] }), _jsx("button", { type: "button", onClick: () => handleContactClick(t.name, t.phone), className: "inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-xs transition", children: isAuthenticated ? (_jsxs(_Fragment, { children: [_jsx(Phone, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Call Carrier' : 'വിളിക്കുക' })] })) : (_jsxs(_Fragment, { children: [_jsx(Lock, { className: "w-3.5 h-3.5 text-white/85" }), _jsx("span", { children: lang === 'en' ? 'Sign in to Contact' : 'ബന്ധപ്പെടാൻ ലോഗിൻ' })] })) })] })] }, t.id))) }), _jsx(LoginAlertModal, { isOpen: alertModal.isOpen, onClose: () => setAlertModal({ isOpen: false }), lang: lang, entityType: "transport", entityName: alertModal.providerName, returnUrl: "/transport" }), _jsx(SubmitReviewModal, { isOpen: reviewModal.isOpen, onClose: () => setReviewModal({ isOpen: false }), targetType: "transport", targetId: reviewModal.providerId || '', targetName: reviewModal.providerName || '', onReviewSubmitted: (newRev) => {
                    if (reviewModal.providerId) {
                        handleReviewSubmitted(reviewModal.providerId, newRev);
                    }
                }, lang: lang })] }));
}
