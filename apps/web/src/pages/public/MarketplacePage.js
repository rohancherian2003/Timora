import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trees, MapPin, Tag, ShieldCheck, ArrowRight, Calculator, CheckCircle2, ChevronUp, AlertTriangle, X, HelpCircle, Activity, Factory } from 'lucide-react';
import { formatINR, calcRoundLogCFT } from '@timora/shared';
// AUTHENTIC RAW TIMBER PHOTOS (തടി മില്ലിലും ഡിപ്പോയിലും വെട്ടിയിട്ടിരിക്കുന്ന പക്കാ തടിയുടെ ഫോട്ടോകൾ)
const EXTENDED_LISTINGS = [
    {
        id: '1',
        title: 'First-Grade Nilambur Teak Round Logs (A-Class Heartwood)',
        species: 'Teak',
        species_ml: 'തേക്ക്',
        type: 'Round Logs',
        type_ml: 'ഉരുണ്ട തടികൾ',
        district: 'Malappuram (മലപ്പുറം)',
        locality: 'Nilambur Forest Depot',
        quantity: 65,
        unit: 'CFT',
        price_per_cft: 2850,
        seller_name: 'Nilambur Government Approved Wood Mart',
        seller_verified: true,
        image_url: '/images/timber/teak-logs.png',
        dimensions: '14 ft Length × 42 in Girth',
        grade: 'A-Grade Nilambur Heartwood',
        transit_pass: true,
        moisture: 'Air-Dried Round Log',
    },
    {
        id: '2',
        title: 'Seasoned African Mahogany Squared Beams & Heavy Logs',
        species: 'Mahogany',
        species_ml: 'മഹാഗണി',
        type: 'Squared Beams',
        type_ml: 'ചതുര കഴുക്കോലുകൾ',
        district: 'Kottayam (കോട്ടയം)',
        locality: 'Pala Timber Yard',
        quantity: 80,
        unit: 'CFT',
        price_per_cft: 1850,
        seller_name: 'Meenachil Timber Mart & Sawmill',
        seller_verified: true,
        image_url: '/images/timber/mahogany-logs.jpg',
        dimensions: '12 ft × 6 in × 6 in',
        grade: 'Select Prime Sawn',
        transit_pass: true,
        moisture: 'Naturally Seasoned',
    },
    {
        id: '3',
        title: 'Old-Growth Wild Jack (Anjili) Heavy Round Tree Trunks',
        species: 'Anjili',
        species_ml: 'ആഞ്ഞിലി',
        type: 'Round Logs',
        type_ml: 'ഉരുണ്ട തടികൾ',
        district: 'Ernakulam (എറണാകുളം)',
        locality: 'Perumbavoor Sawmill Zone',
        quantity: 120,
        unit: 'CFT',
        price_per_cft: 1400,
        seller_name: 'Perumbavoor Raw Saw Mills',
        seller_verified: true,
        image_url: '/images/timber/anjili-logs.jpg',
        dimensions: '16 ft Length × 48 in Mid-Girth',
        grade: 'Forest Grade I (Heavy)',
        transit_pass: true,
        moisture: 'Green Log Harvest',
    },
    {
        id: '4',
        title: 'Estate Harvest Rubberwood Round Logs (Bulk Lot)',
        species: 'Rubberwood',
        species_ml: 'റബർ',
        type: 'Round Logs',
        type_ml: 'ഉരുണ്ട തടികൾ',
        district: 'Pathanamthitta (പത്തനംതിട്ട)',
        locality: 'Adoor Agro Timber Yard',
        quantity: 240,
        unit: 'CFT',
        price_per_cft: 650,
        seller_name: 'Adoor Plantation Wood Depot',
        seller_verified: false,
        image_url: '/images/timber/rubberwood-logs.jpg',
        dimensions: '10 ft × 32 in Avg Girth',
        grade: 'Commercial Saw Log',
        transit_pass: true,
        moisture: 'Fresh Felled',
    },
    {
        id: '5',
        title: 'Heritage Jackfruit (Varikka Plavu) Heavy Balks & Planks',
        species: 'Jackfruit',
        species_ml: 'പ്ലാവ്',
        type: 'Rough-sawn Planks',
        type_ml: 'അറുത്ത പലകകൾ',
        district: 'Thrissur (തൃശ്ശൂർ)',
        locality: 'Wadakkanchery Depot',
        quantity: 65,
        unit: 'CFT',
        price_per_cft: 2200,
        seller_name: 'Central Kerala Timber Yards',
        seller_verified: true,
        image_url: '/images/timber/jackfruit-logs.jpg',
        dimensions: '9 ft × 6 in × 3 in',
        grade: 'Heritage Yellow Heartwood',
        transit_pass: true,
        moisture: 'Naturally Seasoned',
    },
    {
        id: '6',
        title: 'Authentic Kerala Rosewood (Veetti) Premium Heavy Round Logs',
        species: 'Rosewood',
        species_ml: 'ഈട്ടി / റോസ്വുഡ്',
        type: 'Round Logs',
        type_ml: 'ഉരുണ്ട തടികൾ',
        district: 'Wayanad (വയനാട്)',
        locality: 'Mananthavady Depot',
        quantity: 35,
        unit: 'CFT',
        price_per_cft: 4800,
        seller_name: 'Malabar Heritage Hardwoods',
        seller_verified: true,
        image_url: '/images/timber/rosewood-logs.jpg',
        dimensions: '12 ft Length × 38 in Girth',
        grade: 'Super Grade Heartwood (Veetti)',
        transit_pass: true,
        moisture: 'Air-Dried Seasoned',
    },
    {
        id: '7',
        title: 'Split Firewood & Heavy Industrial Boiler Timber Blocks',
        species: 'Rubberwood',
        species_ml: 'റബർ / വിറക്',
        type: 'Firewood',
        type_ml: 'വിറക് തടികൾ',
        district: 'Kollam (കൊല്ലം)',
        locality: 'Punalur Yard',
        quantity: 15,
        unit: 'Tonnes',
        price_per_cft: 280,
        seller_name: 'Punalur Wood Fuel Depot',
        seller_verified: true,
        image_url: '/images/timber/firewood-logs.jpg',
        dimensions: 'Split Logs (2 to 3 ft)',
        grade: 'High-Calorie Split Timber',
        transit_pass: true,
        moisture: 'Sun Dried',
    },
];
const SPECIES_PILLS = [
    { key: 'all', label: 'All Species', ml: 'എല്ലാം' },
    { key: 'teak', label: 'Teak', ml: 'തേക്ക്' },
    { key: 'mahogany', label: 'Mahogany', ml: 'മഹാഗണി' },
    { key: 'rosewood', label: 'Rosewood', ml: 'ഈട്ടി' },
    { key: 'anjili', label: 'Anjili', ml: 'ആഞ്ഞിലി' },
    { key: 'jackfruit', label: 'Jackfruit', ml: 'പ്ലാവ്' },
    { key: 'rubberwood', label: 'Rubberwood', ml: 'റബർ' },
];
const TYPE_TABS = [
    { key: 'all', label: 'All Raw Timber Stock', ml: 'എല്ലാ തടികളും' },
    { key: 'Round Logs', label: 'Round Logs (ഉരുണ്ട തടി)', ml: 'ഉരുണ്ട തടികൾ' },
    { key: 'Rough-sawn Planks', label: 'Rough Planks (പലക)', ml: 'അറുത്ത പലകകൾ' },
    { key: 'Squared Beams', label: 'Squared Beams (ബീം)', ml: 'കഴുക്കോലുകൾ' },
    { key: 'Firewood', label: 'Firewood (വിറക്)', ml: 'വിറക്' },
];
const DISALLOWED_FURNITURE_KEYWORDS = [
    'plywood', 'ply', 'chair', 'table', 'bed', 'sofa', 'desk', 'door lock',
    'furniture', 'കട്ടിൽ', 'കസേര', 'മേശ', 'പ്ലൈവുഡ്', 'ഫർണിച്ചർ'
];
// LIVE YARD ACTIVITY TICKER
const LIVE_MARKET_UPDATES = [
    { depot: 'Nilambur Forest Depot', msg: '65 CFT First-Grade Teak Round Logs verified & transit permit issued', ml: 'നിലമ്പൂർ: 65 CFT തേക്ക് ലോഗുകൾ പരിശോധിച്ചുറപ്പിച്ചു' },
    { depot: 'Perumbavoor Sawmills', msg: '120 CFT Old-Growth Anjili logs loaded for Kochi transit', ml: 'പെരുമ്പാവൂർ: 120 CFT ആഞ്ഞിലി തടികൾ ലോഡ് ചെയ്തു' },
    { depot: 'Pala Timber Mart', msg: 'Mahogany 12ft squared beams booked for roofing joinery', ml: 'പാല: മഹാഗണി കഴുക്കോലുകൾ ബുക്കിംഗ് സ്വീകരിച്ചു' },
    { depot: 'Wayanad Division', msg: 'Rosewood (Veetti) certified logs listed with Form IV pass', ml: 'വയനാട്: ഈട്ടി ലോഗുകൾ ഫോറസ്റ്റ് പാസ്സ് സഹിതം ലഭ്യമാണ്' },
];
export function MarketplacePage({ lang = 'en' }) {
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // SCROLL-DRIVEN DYNAMIC UI STATE
    const [scrollY, setScrollY] = useState(0);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [scrollDirection, setScrollDirection] = useState('down');
    const [isScrolledPastHero, setIsScrolledPastHero] = useState(false);
    const [quickCalcOpen, setQuickCalcOpen] = useState(false);
    // Quick Calculator Local Inputs
    const [calcGirth, setCalcGirth] = useState(36);
    const [calcLen, setCalcLen] = useState(12);
    const [calcRate, setCalcRate] = useState(2400);
    // Validation Popup State
    const [validationAlert, setValidationAlert] = useState(null);
    // Scroll listener to update dynamic UI on the fly
    useEffect(() => {
        let lastY = window.pageYOffset;
        const handleScroll = () => {
            const currentY = window.pageYOffset;
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalScroll > 0 ? (currentY / totalScroll) * 100 : 0;
            setScrollY(currentY);
            setScrollProgress(progress);
            setScrollDirection(currentY > lastY ? 'down' : 'up');
            setIsScrolledPastHero(currentY > 320);
            lastY = currentY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    // Quick CFT Calculation
    const quickCftResult = (() => {
        try {
            if (calcGirth <= 0 || calcLen <= 0)
                return null;
            return calcRoundLogCFT({
                diameter_in: calcGirth,
                length_ft: calcLen,
                price_per_cft: calcRate,
            });
        }
        catch {
            return null;
        }
    })();
    // Handle Search Input with Validation
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        const lower = value.toLowerCase().trim();
        // 1. Check for disallowed furniture keywords
        const matchedDisallowed = DISALLOWED_FURNITURE_KEYWORDS.find((kw) => lower.includes(kw));
        if (matchedDisallowed) {
            setValidationAlert({
                type: 'warning',
                title: lang === 'en' ? 'Raw Timber Only Platform' : 'റോ തടികൾ മാത്രമുള്ള വിപണി',
                message: lang === 'en'
                    ? 'Timora exclusively trades raw timber logs and rough-sawn lumber. Finished furniture, doors, and plywood are not listed. Search for Teak, Mahogany, Anjili, or Rubberwood instead.'
                    : 'ടിമോറയിൽ ഉരുണ്ട തടികളും അറുത്ത മരങ്ങളും മാത്രമാണ് വ്യാപാരം ചെയ്യുന്നത്. ഫർണിച്ചറോ പ്ലൈവുഡോ ലഭ്യമല്ല. തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ എന്നിവ തിരയുക.',
            });
            return;
        }
        // 2. Check for invalid symbols
        if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]+/.test(value)) {
            setValidationAlert({
                type: 'warning',
                title: lang === 'en' ? 'Invalid Search Character' : 'അസാധുവായ അക്ഷരങ്ങൾ',
                message: lang === 'en'
                    ? 'Please use standard timber species names like Teak, Mahogany, or Anjili.'
                    : 'ദയവായി തടി ഇനങ്ങളുടെ പേര് മാത്രം നൽകുക (ഉദാ: തേക്ക്, മഹാഗണി, ആഞ്ഞിലി).',
            });
            return;
        }
        if (validationAlert) {
            setValidationAlert(null);
        }
    };
    const filtered = EXTENDED_LISTINGS.filter((item) => {
        if (selectedSpecies !== 'all' && !item.species.toLowerCase().includes(selectedSpecies.toLowerCase())) {
            return false;
        }
        if (selectedType !== 'all' && item.type !== selectedType) {
            return false;
        }
        if (selectedDistrict !== 'all' && !item.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
            return false;
        }
        if (searchQuery &&
            !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.locality.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !item.species.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });
    return (_jsxs("div", { className: "space-y-8 pb-16 relative", children: [_jsx("div", { className: "fixed top-0 left-0 right-0 z-50 h-1 bg-stone-200/50 pointer-events-none", children: _jsx("div", { className: "h-full bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 transition-all duration-75", style: { width: `${scrollProgress}%` } }) }), _jsx("div", { className: `fixed top-18 left-0 right-0 z-40 transition-all duration-400 pointer-events-none px-4 sm:px-6 lg:px-8 ${isScrolledPastHero
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-6 pointer-events-none'}`, children: _jsxs("div", { className: "max-w-6xl mx-auto bg-stone-900/90 backdrop-blur-md text-white rounded-2xl shadow-xl border border-amber-500/30 p-2 sm:p-2.5 flex items-center justify-between gap-3 pointer-events-auto", children: [_jsxs("div", { className: "flex items-center gap-2.5 flex-shrink-0", children: [_jsxs("span", { className: "flex h-2.5 w-2.5 relative", children: [_jsx("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" }), _jsx("span", { className: "relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" })] }), _jsxs("div", { className: "hidden sm:block", children: [_jsx("span", { className: "text-[10px] text-amber-400 uppercase font-black tracking-wider block leading-none", children: lang === 'en' ? 'Live Kerala Stock' : 'തത്സമയ സ്റ്റോക്ക്' }), _jsxs("span", { className: "text-xs font-bold text-white leading-none", children: [filtered.length, " ", lang === 'en' ? 'Lots Available' : 'തടികൾ ലഭ്യമാണ്'] })] })] }), _jsx("div", { className: "flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5", children: SPECIES_PILLS.map((sp) => (_jsx("button", { onClick: () => setSelectedSpecies(sp.key), className: `px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedSpecies === sp.key
                                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                                    : 'bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white'}`, children: lang === 'en' ? sp.label : sp.ml }, sp.key))) }), _jsxs("div", { className: "flex items-center gap-2 flex-shrink-0", children: [_jsxs(Link, { to: "/mills", className: "px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition", children: [_jsx(Factory, { className: "w-3.5 h-3.5 text-amber-400" }), _jsx("span", { className: "hidden sm:inline", children: lang === 'en' ? 'Mills' : 'മില്ലുകൾ' })] }), _jsxs("button", { onClick: () => setQuickCalcOpen(!quickCalcOpen), className: "px-3 py-1.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs", children: [_jsx(Calculator, { className: "w-3.5 h-3.5 text-amber-300" }), _jsx("span", { className: "hidden sm:inline", children: lang === 'en' ? 'Quick CFT' : 'സി.എഫ്.ടി' })] }), _jsx("button", { onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }), className: "w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition", title: lang === 'en' ? 'Scroll to Top' : 'മുകളിലേക്ക് പോവുക', children: _jsx(ChevronUp, { className: "w-4 h-4" }) })] })] }) }), quickCalcOpen && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-white rounded-3xl border border-stone-300 shadow-2xl max-w-md w-full p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between border-b pb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calculator, { className: "w-5 h-5 text-[#b45309]" }), _jsx("h3", { className: "font-bold text-stone-900 text-base", children: lang === 'en' ? 'Instant Timber CFT Calculator' : 'തൽക്ഷണ തടി കാൽക്കുലേറ്റർ' })] }), _jsx("button", { onClick: () => setQuickCalcOpen(false), className: "text-stone-400 hover:text-stone-700 font-bold p-1", children: "\u2715" })] }), _jsx("p", { className: "text-xs text-stone-500", children: lang === 'en'
                                ? 'Hoppus Rule Kerala standard calculation: (Girth/4)² × Length / 144'
                                : 'കേരള അംഗീകൃത ഹോപ്പസ് രീതിയിലുള്ള തടി അളവ് കണക്കാക്കൽ.' }), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-bold text-stone-600 mb-1", children: lang === 'en' ? 'Mid Girth (Inches)' : 'തടിയുടെ വണ്ണം (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: calcGirth, onChange: (e) => setCalcGirth(Number(e.target.value)), className: "w-full px-3 py-2 border rounded-xl text-sm font-bold" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-bold text-stone-600 mb-1", children: lang === 'en' ? 'Length (Feet)' : 'നീളം (അടി)' }), _jsx("input", { type: "number", value: calcLen, onChange: (e) => setCalcLen(Number(e.target.value)), className: "w-full px-3 py-2 border rounded-xl text-sm font-bold" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-bold text-stone-600 mb-1", children: lang === 'en' ? 'Rate / CFT (₹)' : 'വില / സി.എഫ്.ടി (₹)' }), _jsx("input", { type: "number", value: calcRate, onChange: (e) => setCalcRate(Number(e.target.value)), className: "w-full px-3 py-2 border rounded-xl text-sm font-bold" })] }), quickCftResult && (_jsxs("div", { className: "p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-amber-800 block", children: lang === 'en' ? 'Calculated Volume' : 'കണക്കാക്കിയ വ്യാപ്തം' }), _jsxs("span", { className: "text-xl font-black text-amber-950", children: [quickCftResult.total_cft, " ", _jsx("span", { className: "text-xs", children: "CFT" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-amber-800 block", children: lang === 'en' ? 'Total Cost' : 'ആകെ തുക' }), _jsx("span", { className: "text-xl font-black text-[#78350f]", children: formatINR(quickCftResult.estimated_cost || 0) })] })] })), _jsx("button", { onClick: () => setQuickCalcOpen(false), className: "w-full py-2.5 rounded-xl bg-[#b45309] text-white font-bold text-xs hover:bg-[#92400e] transition", children: lang === 'en' ? 'Continue Browsing Stock' : 'തിരച്ചിൽ തുടരുക' })] }) })), validationAlert && (_jsx("div", { className: "fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-fadeIn", children: _jsxs("div", { className: `p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${validationAlert.type === 'warning'
                        ? 'bg-amber-950/90 border-amber-500/50 text-amber-100'
                        : 'bg-stone-900/90 border-stone-600 text-stone-100'}`, children: [validationAlert.type === 'warning' ? (_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" })) : (_jsx(HelpCircle, { className: "w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" })), _jsxs("div", { className: "flex-1 text-xs", children: [_jsx("div", { className: "font-bold text-sm text-white mb-0.5", children: validationAlert.title }), _jsx("p", { className: "leading-relaxed opacity-90", children: validationAlert.message }), _jsxs("div", { className: "flex flex-wrap gap-1.5 mt-2.5", children: [_jsx("button", { onClick: () => {
                                                setSelectedSpecies('teak');
                                                setSearchQuery('Teak');
                                                setValidationAlert(null);
                                            }, className: "px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]", children: "\u0D24\u0D47\u0D15\u0D4D\u0D15\u0D4D (Teak)" }), _jsx("button", { onClick: () => {
                                                setSelectedSpecies('mahogany');
                                                setSearchQuery('Mahogany');
                                                setValidationAlert(null);
                                            }, className: "px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]", children: "\u0D2E\u0D39\u0D3E\u0D17\u0D23\u0D3F (Mahogany)" }), _jsx("button", { onClick: () => {
                                                setSelectedSpecies('anjili');
                                                setSearchQuery('Anjili');
                                                setValidationAlert(null);
                                            }, className: "px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]", children: "\u0D06\u0D1E\u0D4D\u0D1E\u0D3F\u0D32\u0D3F (Anjili)" })] })] }), _jsx("button", { onClick: () => setValidationAlert(null), className: "text-stone-400 hover:text-white p-1 rounded-lg transition", children: _jsx(X, { className: "w-4 h-4" }) })] }) })), _jsx("div", { className: "bg-amber-950/20 border-y border-amber-900/20 py-2 overflow-hidden", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 flex items-center gap-3 text-xs", children: [_jsxs("span", { className: "px-2 py-0.5 rounded-md bg-amber-600 text-stone-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1 flex-shrink-0", children: [_jsx(Activity, { className: "w-3 h-3 animate-pulse" }), lang === 'en' ? 'Live Ticker' : 'തത്സമയം'] }), _jsx("div", { className: "flex items-center gap-6 overflow-x-auto whitespace-nowrap text-stone-700 font-medium", children: LIVE_MARKET_UPDATES.map((u, i) => (_jsxs("span", { className: "flex items-center gap-1.5 flex-shrink-0", children: [_jsxs("span", { className: "font-bold text-[#92400e]", children: [u.depot, ":"] }), _jsx("span", { children: lang === 'en' ? u.msg : u.ml }), _jsx("span", { className: "text-stone-300 ml-3", children: "\u2022" })] }, i))) })] }) }), _jsxs("section", { className: "relative bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] text-stone-900 overflow-hidden py-12 sm:py-16 border-b border-[#c2843b]/40 shadow-xs", children: [_jsx("div", { className: "absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#b45309_1.2px,transparent_1.2px)] [background-size:24px_24px]" }), _jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-600/30 text-[#854d0e] text-xs font-bold tracking-wide shadow-xs", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-600" }), _jsx("span", { children: lang === 'en'
                                            ? 'Smart Timber Marketplace • Timber. People. Possibilities.'
                                            : 'കേരളത്തിലെ സ്മാർട്ട് തടി വിപണി • വീടുപണിക്കും മില്ലുകൾക്കും' })] }), _jsxs("div", { className: "max-w-3xl space-y-3", children: [_jsx("h1", { className: "text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#2c160b]", style: { fontFamily: 'Georgia, serif' }, children: lang === 'en' ? (_jsxs(_Fragment, { children: ["Buy, Sell & Source Raw Timber ", _jsx("br", {}), _jsx("span", { className: "text-[#b45309] underline decoration-amber-400/60 decoration-wavy decoration-2", children: "Direct From Kerala Sawmills" })] })) : (_jsxs(_Fragment, { children: ["\u0D35\u0D40\u0D1F\u0D41\u0D2A\u0D23\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D02 \u0D06\u0D35\u0D36\u0D4D\u0D2F\u0D19\u0D4D\u0D19\u0D7E\u0D15\u0D4D\u0D15\u0D41\u0D02 ", _jsx("br", {}), _jsx("span", { className: "text-[#b45309]", children: "\u0D24\u0D1F\u0D3F \u0D28\u0D47\u0D30\u0D3F\u0D1F\u0D4D\u0D1F\u0D4D \u0D35\u0D3E\u0D19\u0D4D\u0D19\u0D3E\u0D28\u0D41\u0D02 \u0D35\u0D3F\u0D7D\u0D15\u0D4D\u0D15\u0D3E\u0D28\u0D41\u0D02" })] })) }), _jsx("p", { className: "text-sm sm:text-base text-stone-700 font-medium leading-relaxed max-w-2xl", children: lang === 'en'
                                            ? 'Connecting timber buyers, house owners, and licensed sawmills across 14 Kerala districts. Genuine Nilambur Teak, Mahogany, Anjili & Rubberwood — zero middlemen, verified transit passes.'
                                            : 'കേരളത്തിലെ 14 ജില്ലകളിലെ തടി ഡിപ്പോകളും വീടുപണിയുന്നവരും തമ്മിൽ നേരിട്ട് ബന്ധപ്പെടുന്നു. അംഗീകൃത തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ തടികൾ — കൃത്യമായ സി.എഫ്.ടി അളവുകളോടെ.' })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl pt-1", children: [_jsxs("div", { className: "p-3 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs flex items-center gap-2.5", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-amber-100/90 text-amber-900 flex items-center justify-center font-bold flex-shrink-0 text-base", children: "\uD83E\uDEB5" }), _jsxs("div", { className: "text-xs", children: [_jsx("span", { className: "font-extrabold text-stone-900 block leading-tight", children: lang === 'en' ? 'Buy Raw Timber' : 'തടി വാങ്ങാം' }), _jsx("span", { className: "text-[10px] text-stone-600", children: lang === 'en' ? 'Logs & Beams' : 'ലോഗ്സ് & പലക' })] })] }), _jsxs("div", { className: "p-3 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs flex items-center gap-2.5", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-emerald-100/90 text-emerald-900 flex items-center justify-center font-bold flex-shrink-0 text-base", children: "\uD83D\uDCC4" }), _jsxs("div", { className: "text-xs", children: [_jsx("span", { className: "font-extrabold text-stone-900 block leading-tight", children: lang === 'en' ? 'Compare Quotes' : 'വിലകൾ അറിയാം' }), _jsx("span", { className: "text-[10px] text-stone-600", children: lang === 'en' ? 'Direct CFT Rates' : 'സി.എഫ്.ടി നിരക്ക്' })] })] }), _jsxs(Link, { to: "/carpenters", className: "p-3 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs flex items-center gap-2.5 hover:border-amber-400 hover:bg-amber-50/40 transition group", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-amber-100/90 text-amber-900 flex items-center justify-center font-bold flex-shrink-0 text-base", children: "\uD83D\uDD28" }), _jsxs("div", { className: "text-xs", children: [_jsx("span", { className: "font-extrabold text-stone-900 block leading-tight group-hover:text-[#b45309] transition", children: lang === 'en' ? 'Master Carpenters' : 'വിദഗ്ദ്ധ ആശാരിമാർ' }), _jsx("span", { className: "text-[10px] text-stone-600", children: lang === 'en' ? 'Roofing & Joinery' : 'മേൽക്കൂര & വാതിലുകൾ' })] })] }), _jsxs(Link, { to: "/mills", className: "p-3 rounded-2xl bg-white/80 border border-amber-200/80 shadow-xs flex items-center gap-2.5 hover:border-amber-400 hover:bg-amber-50/40 transition group", children: [_jsx("div", { className: "w-9 h-9 rounded-xl bg-amber-100/90 text-amber-900 flex items-center justify-center font-bold flex-shrink-0 text-base", children: "\uD83C\uDFED" }), _jsxs("div", { className: "text-xs", children: [_jsx("span", { className: "font-extrabold text-stone-900 block leading-tight group-hover:text-[#b45309] transition", children: lang === 'en' ? 'Timber Mills' : 'തടി മില്ലുകൾ' }), _jsx("span", { className: "text-[10px] text-stone-600", children: lang === 'en' ? 'Sawing & Sizing' : 'അറുക്കൽ & സീസണിംഗ്' })] })] })] }), _jsxs("div", { className: "max-w-2xl bg-white rounded-2xl p-2 shadow-lg border border-amber-300/80 flex flex-col sm:flex-row gap-2", children: [_jsxs("div", { className: "relative flex-grow flex items-center", children: [_jsx(Search, { className: "w-5 h-5 text-stone-500 absolute left-3.5" }), _jsx("input", { type: "text", placeholder: lang === 'en'
                                                    ? 'Search timber for your home (e.g. Nilambur Teak, Anjili, Mahogany)...'
                                                    : 'വീടുപണിക്കുള്ള തടി തിരയുക (ഉദാ: തേക്ക്, മഹാഗണി, ആഞ്ഞിലി)...', value: searchQuery, onChange: (e) => handleSearchChange(e.target.value), className: "w-full pl-11 pr-10 py-2.5 rounded-xl bg-transparent text-stone-900 text-sm font-semibold focus:outline-none placeholder:text-stone-400 placeholder:font-normal" }), searchQuery && (_jsx("button", { type: "button", onClick: () => handleSearchChange(''), className: "absolute right-3 text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-4 h-4" }) }))] }), _jsxs("button", { onClick: () => setQuickCalcOpen(true), className: "px-5 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm flex-shrink-0", children: [_jsx(Calculator, { className: "w-4 h-4 text-amber-200" }), _jsx("span", { children: lang === 'en' ? 'Quick Calculate' : 'തടി അളവ് കണക്കാക്കുക' })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-amber-900/10 max-w-4xl text-xs", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold", children: "14" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-stone-900", children: lang === 'en' ? 'Districts' : 'ജില്ലകൾ' }), _jsx("span", { className: "text-stone-600 text-[11px]", children: lang === 'en' ? 'Statewide Coverage' : 'കേരളത്തിലുടനീളം' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold", children: "0%" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-stone-900", children: lang === 'en' ? 'Middleman Fee' : 'ഇടനിലക്കാരില്ല' }), _jsx("span", { className: "text-stone-600 text-[11px]", children: lang === 'en' ? 'Direct Mill Pricing' : 'നേരിട്ടുള്ള വില' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold", children: "100%" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-stone-900", children: lang === 'en' ? 'Raw Timber Only' : 'തടി മാത്രം' }), _jsx("span", { className: "text-stone-600 text-[11px]", children: lang === 'en' ? 'No Plywood or Furniture' : 'ഫർണിച്ചർ ഇല്ല' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold", children: "CFT" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-stone-900", children: lang === 'en' ? 'Hoppus Standard' : 'ഹോപ്പസ് റൂൾ' }), _jsx("span", { className: "text-stone-600 text-[11px]", children: lang === 'en' ? 'Verified Formula' : 'കൃത്യമായ അളവ്' })] })] })] })] })] }), _jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-200 pb-3 gap-2 overflow-x-auto", children: [_jsx("div", { className: "flex items-center gap-2", children: TYPE_TABS.map((tab) => (_jsx("button", { onClick: () => setSelectedType(tab.key), className: `px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedType === tab.key
                                        ? 'bg-[#b45309] text-white shadow-sm'
                                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'}`, children: lang === 'en' ? tab.label : tab.ml }, tab.key))) }), _jsxs("span", { className: "text-xs font-bold text-stone-500 whitespace-nowrap hidden sm:inline", children: [filtered.length, " ", lang === 'en' ? 'Raw Lots Available' : 'തടികൾ ലഭ്യമാണ്'] })] }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "text-xs font-bold text-stone-400 uppercase tracking-wider mr-1", children: lang === 'en' ? 'Species:' : 'ഇനം:' }), SPECIES_PILLS.map((sp) => (_jsx("button", { onClick: () => setSelectedSpecies(sp.key), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedSpecies === sp.key
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                            : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`, children: lang === 'en' ? sp.label : sp.ml }, sp.key)))] }), _jsxs("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [_jsx(MapPin, { className: "w-4 h-4 text-[#b45309] flex-shrink-0" }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-2 border border-stone-300 rounded-xl text-stone-800 font-semibold text-xs bg-stone-50 focus:ring-2 focus:ring-[#b45309] focus:outline-none w-full md:w-56", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All 14 Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" }), _jsx("option", { value: "palakkad", children: "Palakkad (\u0D2A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "pathanamthitta", children: "Pathanamthitta (\u0D2A\u0D24\u0D4D\u0D24\u0D28\u0D02\u0D24\u0D3F\u0D1F\u0D4D\u0D1F)" }), _jsx("option", { value: "kollam", children: "Kollam (\u0D15\u0D4A\u0D32\u0D4D\u0D32\u0D02)" }), _jsx("option", { value: "thiruvananthapuram", children: "Thiruvananthapuram (\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D28\u0D28\u0D4D\u0D24\u0D2A\u0D41\u0D30\u0D02)" }), _jsx("option", { value: "kannur", children: "Kannur (\u0D15\u0D23\u0D4D\u0D23\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "alappuzha", children: "Alappuzha (\u0D06\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D34)" }), _jsx("option", { value: "idukki", children: "Idukki (\u0D07\u0D1F\u0D41\u0D15\u0D4D\u0D15\u0D3F)" }), _jsx("option", { value: "kasaragod", children: "Kasaragod (\u0D15\u0D3E\u0D38\u0D7C\u0D17\u0D4B\u0D21\u0D4D)" })] })] })] }), filtered.length === 0 ? (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4", children: [_jsx(Trees, { className: "w-12 h-12 text-stone-400 mx-auto" }), _jsx("h3", { className: "text-lg font-bold text-stone-800", children: lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല' }), _jsx("p", { className: "text-xs text-stone-500 max-w-md mx-auto", children: lang === 'en'
                                    ? 'Try clearing species or district filters to discover active timber lots across Kerala.'
                                    : 'മറ്റു ജില്ലകളോ തടി ഇനങ്ങളോ തിരഞ്ഞെടുത്ത് വീണ്ടും തിരയുക.' }), _jsx("button", { onClick: () => {
                                    setSelectedSpecies('all');
                                    setSelectedType('all');
                                    setSelectedDistrict('all');
                                    setSearchQuery('');
                                    setValidationAlert(null);
                                }, className: "px-4 py-2 bg-[#b45309] text-white rounded-xl text-xs font-bold hover:bg-[#92400e] transition", children: lang === 'en' ? 'Reset All Filters' : 'ഫിൽട്ടറുകൾ മാറ്റുക' })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((item) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-2xl hover:border-amber-500/50 hover:-translate-y-1 transition-all duration-300 flex flex-col group", children: [_jsxs("div", { className: "relative aspect-[16/10] bg-stone-100 overflow-hidden", children: [_jsx("img", { src: item.image_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-105 transition duration-500" }), _jsxs("div", { className: "absolute top-3 left-3 flex flex-wrap gap-1.5", children: [_jsxs("span", { className: "px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#78350f] shadow-md backdrop-blur-sm flex items-center gap-1", children: [_jsx(Tag, { className: "w-3 h-3 text-amber-600" }), lang === 'en' ? item.species : item.species_ml] }), _jsx("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-900/80 text-white shadow-md backdrop-blur-sm", children: item.grade })] }), item.transit_pass && (_jsxs("div", { className: "absolute top-3 right-3 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Form IV Transit' : 'പാസ്സ് ഉണ്ട്' })] })), _jsxs("div", { className: "absolute bottom-2 right-2 bg-black/70 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs font-bold", children: [item.quantity, " ", item.unit] })] }), _jsxs("div", { className: "p-5 flex-1 flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-stone-900 text-base line-clamp-1 group-hover:text-[#92400e] transition", children: item.title }), _jsxs("p", { className: "text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium", children: [_jsx("span", { className: "font-semibold text-stone-700", children: lang === 'en' ? item.type : item.type_ml }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: item.dimensions })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#b45309] flex-shrink-0" }), _jsxs("span", { className: "line-clamp-1 font-medium", children: [item.locality, ", ", item.district.split(' ')[0]] })] }), _jsx("span", { className: "text-[11px] text-stone-400 font-medium", children: item.moisture })] }), _jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-xs text-stone-500", children: [_jsx("span", { className: "text-stone-400", children: lang === 'en' ? 'Depot:' : 'ഡിപ്പോ:' }), _jsx("span", { className: "font-semibold text-stone-800 line-clamp-1", children: item.seller_name }), item.seller_verified && (_jsx("span", { title: "Verified Yard", children: _jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-[#b45309] flex-shrink-0" }) }))] })] }), _jsxs("div", { className: "pt-3 border-t border-stone-100 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-stone-400", children: lang === 'en' ? 'Verified Rate' : 'വില / സി.എഫ്.ടി' }), _jsxs("div", { className: "text-lg font-black text-[#78350f] flex items-baseline gap-1", children: [formatINR(item.price_per_cft), _jsxs("span", { className: "text-[10px] text-stone-500 font-semibold", children: ["/ ", item.unit] })] })] }), _jsxs(Link, { to: `/listing/${item.id}`, className: "px-4 py-2 rounded-xl bg-[#b45309] group-hover:bg-[#92400e] text-white text-xs font-bold shadow-sm transition flex items-center gap-1", children: [_jsx("span", { children: lang === 'en' ? 'View Timber' : 'വിശദാംശങ്ങൾ' }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] })] })] }, item.id))) }))] }), _jsx("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4", children: _jsxs("div", { className: "p-6 sm:p-8 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] rounded-3xl border border-[#ebd5bc] shadow-sm space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end justify-between gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#854d0e] text-xs font-semibold backdrop-blur-sm border border-amber-600/30", children: [_jsx(Factory, { className: "w-3.5 h-3.5 text-[#b45309]" }), _jsx("span", { children: lang === 'en' ? 'Direct Mill Network' : 'തടി മിൽ നെറ്റ്‌വർക്ക്' })] }), _jsx("h2", { className: "text-2xl sm:text-3xl font-extrabold text-[#2c160b]", style: { fontFamily: 'Georgia, serif' }, children: lang === 'en' ? (_jsxs(_Fragment, { children: ["Connect With Licensed Sawmills ", _jsx("br", {}), _jsx("span", { className: "text-[#b45309]", children: "For House Roofing & Precision Sizing" })] })) : (_jsxs(_Fragment, { children: ["\u0D35\u0D40\u0D1F\u0D41\u0D2A\u0D23\u0D3F\u0D15\u0D4D\u0D15\u0D4D \u0D24\u0D1F\u0D3F \u0D05\u0D31\u0D41\u0D15\u0D4D\u0D15\u0D3E\u0D28\u0D41\u0D02 ", _jsx("br", {}), _jsx("span", { className: "text-[#b45309]", children: "\u0D05\u0D33\u0D35\u0D41\u0D15\u0D7E \u0D28\u0D7D\u0D15\u0D3E\u0D28\u0D41\u0D02 \u0D24\u0D1F\u0D3F \u0D2E\u0D3F\u0D32\u0D4D\u0D32\u0D41\u0D15\u0D7E" })] })) }), _jsx("p", { className: "text-xs sm:text-sm text-[#6b472e] max-w-xl font-medium", children: lang === 'en'
                                                ? 'Get your raw logs sawed into exact rafters, purlins, and door planks. Verified sawmills with horizontal bandsaws, kiln seasoning, and zero wood wastage.'
                                                : 'എറണാകുളം, പത്തനംതിട്ട, കോട്ടയം ഉൾപ്പെടെയുള്ള ജില്ലകളിലെ തടി മില്ലുകളുടെ റേറ്റിംഗും അവൈലബിൾ തടികളും കണ്ട് ഉടമസ്ഥരെ നേരിട്ട് ബന്ധപ്പെടാം.' })] }), _jsxs(Link, { to: "/mills", className: "inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-950/10 transition flex-shrink-0", children: [_jsx("span", { children: lang === 'en' ? 'Browse All Timber Mills' : 'എല്ലാ തടി മില്ലുകളും കാണുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-2", children: [_jsxs("div", { className: "p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold", children: "KL-SAW-EKM-4402" }), _jsx("span", { className: "text-xs font-bold text-amber-600 flex items-center gap-1", children: "\u2605 4.9 (64)" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-extrabold font-serif text-[#2c160b] text-base", children: lang === 'en' ? 'Periyar Sawmills' : 'പെരിയാർ സോമിൽ' }), _jsxs("div", { className: "text-xs text-stone-500 flex items-center gap-1 mt-0.5", children: [_jsx(MapPin, { className: "w-3 h-3 text-[#b45309]" }), _jsx("span", { children: "Perumbavoor, Ernakulam" })] })] }), _jsx("p", { className: "text-[11px] text-stone-600 line-clamp-2", children: lang === 'en'
                                                ? 'Heavy bandsaw resawing, roof truss sizing, Teak & Anjili specialist.'
                                                : 'ഹൊറിസോണ്ടൽ ബാൻഡ്‌സോ, മേൽക്കൂര തട്ടിടൽ പലകകൾ, തേക്ക് & ആഞ്ഞിലി.' }), _jsxs("div", { className: "pt-2 border-t border-stone-100 flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-bold text-[#78350f]", children: "\u20B965 - \u20B980 / CFT" }), _jsx(Link, { to: "/mills", className: "text-[#b45309] font-bold hover:underline", children: lang === 'en' ? 'Details →' : 'വിവരങ്ങൾ →' })] })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold", children: "KL-SAW-PTA-1820" }), _jsx("span", { className: "text-xs font-bold text-amber-600 flex items-center gap-1", children: "\u2605 4.8 (47)" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-extrabold font-serif text-[#2c160b] text-base", children: lang === 'en' ? 'Pathanamthitta Central Sawmill' : 'പത്തനംതിട്ട സെൻട്രൽ മിൽസ്' }), _jsxs("div", { className: "text-xs text-stone-500 flex items-center gap-1 mt-0.5", children: [_jsx(MapPin, { className: "w-3 h-3 text-[#b45309]" }), _jsx("span", { children: "Adoor Bypass, Pathanamthitta" })] })] }), _jsx("p", { className: "text-[11px] text-stone-600 line-clamp-2", children: lang === 'en'
                                                ? 'Traditional house joinery timber, teak log girth sorting & door beams.'
                                                : 'പരമ്പരാഗത വീടുകൾക്കുള്ള തടി അറുക്കൽ, കട്ടിള & ജനൽ ബീമുകൾ.' }), _jsxs("div", { className: "pt-2 border-t border-stone-100 flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-bold text-[#78350f]", children: "\u20B970 - \u20B985 / CFT" }), _jsx(Link, { to: "/mills", className: "text-[#b45309] font-bold hover:underline", children: lang === 'en' ? 'Details →' : 'വിവരങ്ങൾ →' })] })] }), _jsxs("div", { className: "p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-bold", children: "KL-SAW-PTA-2104" }), _jsx("span", { className: "text-xs font-bold text-amber-600 flex items-center gap-1", children: "\u2605 4.9 (38)" })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-extrabold font-serif text-[#2c160b] text-base", children: lang === 'en' ? 'Konni Forest Valley Plant' : 'കോന്നി ഫോറസ്റ്റ് വാലി പ്ലാന്റ്' }), _jsxs("div", { className: "text-xs text-stone-500 flex items-center gap-1 mt-0.5", children: [_jsx(MapPin, { className: "w-3 h-3 text-[#b45309]" }), _jsx("span", { children: "Konni Depot, Pathanamthitta" })] })] }), _jsx("p", { className: "text-[11px] text-stone-600 line-clamp-2", children: lang === 'en'
                                                ? 'Kiln seasoning plant, moisture reduction, Nilambur & Konni Teak logs.'
                                                : 'കിൽൻ സീസണിംഗ് സൗകര്യം, കോന്നി തേക്ക്, ഫോറസ്റ്റ് ലേലം തടികൾ.' }), _jsxs("div", { className: "pt-2 border-t border-stone-100 flex items-center justify-between text-xs", children: [_jsx("span", { className: "font-bold text-[#78350f]", children: "\u20B975 - \u20B990 / CFT" }), _jsx(Link, { to: "/mills", className: "text-[#b45309] font-bold hover:underline", children: lang === 'en' ? 'Details →' : 'വിവരങ്ങൾ →' })] })] })] })] }) })] }));
}
