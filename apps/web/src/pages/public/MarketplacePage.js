import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trees, MapPin, Tag, ShieldCheck, ArrowRight, Calculator, CheckCircle2, Award, AlertTriangle, X, HelpCircle } from 'lucide-react';
import { formatINR } from '@timora/shared';
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
        // Real cut heavy teak round logs stacked in depot with authentic growth rings and bark
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
        // Rough cut hardwood lumber and heavy structural beams stacked in sawmill
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
        // Giant felled raw tree trunk log lying at depot with natural thick bark
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
        // Felled rubber and hardwood plantation logs stacked outdoors
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
        // Solid thick timber trunks and rough cut balks at yard
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
        // Dark purple-brown Kerala rosewood round logs with prominent bark and grain
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
        // Stacked split firewood tree logs
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
export function MarketplacePage({ lang = 'en' }) {
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    // Validation Popup State
    const [validationAlert, setValidationAlert] = useState(null);
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
        // Clear alert if valid
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
    // Trigger alert if valid search yields 0 matches
    useEffect(() => {
        if (searchQuery.trim().length >= 3 && filtered.length === 0 && !validationAlert) {
            setValidationAlert({
                type: 'info',
                title: lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല',
                message: lang === 'en'
                    ? `No live timber listings matched "${searchQuery}". Try selecting one of the certified species below:`
                    : `"${searchQuery}" എന്ന പേരിൽ തടികൾ ലഭ്യമല്ല. താഴെ കാണുന്ന അംഗീകൃത ഇനങ്ങൾ തിരഞ്ഞെടുക്കുക:`,
            });
        }
    }, [searchQuery, filtered.length, validationAlert, lang]);
    return (_jsxs("div", { className: "space-y-8 pb-12", children: [validationAlert && (_jsx("div", { className: "fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-fadeIn", children: _jsxs("div", { className: `p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${validationAlert.type === 'warning'
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
                                            }, className: "px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white font-bold transition text-[11px]", children: "\u0D06\u0D1E\u0D4D\u0D1E\u0D3F\u0D32\u0D3F (Anjili)" })] })] }), _jsx("button", { onClick: () => setValidationAlert(null), className: "text-stone-400 hover:text-white p-1 rounded-lg transition", children: _jsx(X, { className: "w-4 h-4" }) })] }) })), _jsxs("section", { className: "relative bg-gradient-to-br from-[#122017] via-[#1a2c20] to-[#20150e] text-white overflow-hidden py-14 sm:py-20 border-b border-[#a16207]/30 shadow-inner", children: [_jsx("div", { className: "absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]" }), _jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-[#d97706]/10 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-0 w-96 h-96 bg-[#15803d]/15 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-[#d97706]/50 text-[#fde68a] text-xs font-semibold tracking-wide shadow-sm", children: [_jsx(Award, { className: "w-3.5 h-3.5 text-[#f59e0b]" }), _jsx("span", { children: lang === 'en'
                                            ? 'Kerala Forest Produce Transit Rules Compliant • 14 Districts Active'
                                            : 'കേരള ഫോറസ്റ്റ് ട്രാൻസിറ്റ് ചട്ടങ്ങൾ പാലിക്കുന്ന വിപണി' })] }), _jsxs("div", { className: "max-w-3xl space-y-3", children: [_jsx("h1", { className: "text-3xl sm:text-5xl font-black tracking-tight leading-tight text-[#f9f8f6]", children: lang === 'en' ? (_jsxs(_Fragment, { children: ["Kerala\u2019s Premier Raw ", _jsx("span", { className: "text-[#f59e0b] drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]", children: "Timber Exchange" })] })) : (_jsxs(_Fragment, { children: ["\u0D15\u0D47\u0D30\u0D33\u0D24\u0D4D\u0D24\u0D3F\u0D32\u0D46 \u0D35\u0D3F\u0D36\u0D4D\u0D35\u0D38\u0D28\u0D40\u0D2F\u0D2E\u0D3E\u0D2F ", _jsx("span", { className: "text-[#f59e0b] drop-shadow-[0_2px_12px_rgba(245,158,11,0.25)]", children: "\u0D24\u0D1F\u0D3F \u0D35\u0D3F\u0D2A\u0D23\u0D3F" })] })) }), _jsx("p", { className: "text-sm sm:text-base text-[#e2e8f0] font-normal leading-relaxed max-w-2xl", children: lang === 'en'
                                            ? 'Direct marketplace for authentic round logs and rough-sawn planks. Harvested Nilambur Teak, African Mahogany, Wild Jack (Anjili), and Rubberwood from verified sawmills. Strictly no plywood or furniture.'
                                            : 'അംഗീകൃത മില്ലുകളിൽ നിന്നും നേരിട്ട് തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ തടികൾ വാങ്ങാം. പക്കാ വെട്ടിയ ഉരുണ്ട തടികളും അറുത്ത പലകകളും മാത്രം.' })] }), _jsxs("div", { className: "max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/30 flex flex-col sm:flex-row gap-2", children: [_jsxs("div", { className: "relative flex-grow flex items-center", children: [_jsx(Search, { className: "w-5 h-5 text-stone-500 absolute left-3.5" }), _jsx("input", { type: "text", placeholder: lang === 'en'
                                                    ? 'Search real timber (e.g. Nilambur Teak, Anjili, Mahogany)...'
                                                    : 'തടിയുടെ പേര് തിരയുക (ഉദാ: തേക്ക്, മഹാഗണി, ആഞ്ഞിലി)...', value: searchQuery, onChange: (e) => handleSearchChange(e.target.value), className: "w-full pl-11 pr-10 py-2.5 rounded-xl bg-transparent text-stone-900 text-sm font-semibold focus:outline-none placeholder:text-stone-400 placeholder:font-normal" }), searchQuery && (_jsx("button", { type: "button", onClick: () => handleSearchChange(''), className: "absolute right-3 text-stone-400 hover:text-stone-700", children: _jsx(X, { className: "w-4 h-4" }) }))] }), _jsxs(Link, { to: "/calculator", className: "px-4 py-2.5 rounded-xl bg-[#d97706] hover:bg-[#b45309] text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm flex-shrink-0", children: [_jsx(Calculator, { className: "w-4 h-4 text-stone-950" }), _jsx("span", { children: lang === 'en' ? 'CFT Calculator' : 'തടി അളവ് കണക്കാക്കുക' })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 max-w-4xl text-xs", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#f59e0b] font-bold", children: "14" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Districts' : 'ജില്ലകൾ' }), _jsx("span", { className: "text-stone-300 text-[11px]", children: lang === 'en' ? 'Statewide Coverage' : 'കേരളത്തിലുടനീളം' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold", children: "0%" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Middleman Fee' : 'ഇടനിലക്കാരില്ല' }), _jsx("span", { className: "text-stone-300 text-[11px]", children: lang === 'en' ? 'Direct Mill Pricing' : 'നേരിട്ടുള്ള വില' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#f59e0b] font-bold", children: "100%" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Raw Timber Only' : 'തടി മാത്രം' }), _jsx("span", { className: "text-stone-300 text-[11px]", children: lang === 'en' ? 'No Plywood or Furniture' : 'ഫർണിച്ചർ ഇല്ല' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold", children: "CFT" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Hoppus Standard' : 'ഹോപ്പസ് റൂൾ' }), _jsx("span", { className: "text-stone-300 text-[11px]", children: lang === 'en' ? 'Verified Formula' : 'കൃത്യമായ അളവ്' })] })] })] })] })] }), _jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-200 pb-3 gap-2 overflow-x-auto", children: [_jsx("div", { className: "flex items-center gap-2", children: TYPE_TABS.map((tab) => (_jsx("button", { onClick: () => setSelectedType(tab.key), className: `px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedType === tab.key
                                        ? 'bg-forest-900 text-white shadow-sm'
                                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'}`, children: lang === 'en' ? tab.label : tab.ml }, tab.key))) }), _jsxs("span", { className: "text-xs font-bold text-stone-500 whitespace-nowrap hidden sm:inline", children: [filtered.length, " ", lang === 'en' ? 'Raw Lots Available' : 'തടികൾ ലഭ്യമാണ്'] })] }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "text-xs font-bold text-stone-400 uppercase tracking-wider mr-1", children: lang === 'en' ? 'Species:' : 'ഇനം:' }), SPECIES_PILLS.map((sp) => (_jsx("button", { onClick: () => setSelectedSpecies(sp.key), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedSpecies === sp.key
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                            : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`, children: lang === 'en' ? sp.label : sp.ml }, sp.key)))] }), _jsxs("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [_jsx(MapPin, { className: "w-4 h-4 text-forest-700 flex-shrink-0" }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-2 border border-stone-300 rounded-xl text-stone-800 font-semibold text-xs bg-stone-50 focus:ring-2 focus:ring-forest-600 focus:outline-none w-full md:w-56", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All 14 Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" }), _jsx("option", { value: "palakkad", children: "Palakkad (\u0D2A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "pathanamthitta", children: "Pathanamthitta (\u0D2A\u0D24\u0D4D\u0D24\u0D28\u0D02\u0D24\u0D3F\u0D1F\u0D4D\u0D1F)" }), _jsx("option", { value: "kollam", children: "Kollam (\u0D15\u0D4A\u0D32\u0D4D\u0D32\u0D02)" }), _jsx("option", { value: "thiruvananthapuram", children: "Thiruvananthapuram (\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D28\u0D28\u0D4D\u0D24\u0D2A\u0D41\u0D30\u0D02)" }), _jsx("option", { value: "kannur", children: "Kannur (\u0D15\u0D23\u0D4D\u0D23\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "alappuzha", children: "Alappuzha (\u0D06\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D34)" }), _jsx("option", { value: "idukki", children: "Idukki (\u0D07\u0D1F\u0D41\u0D15\u0D4D\u0D15\u0D3F)" }), _jsx("option", { value: "kasaragod", children: "Kasaragod (\u0D15\u0D3E\u0D38\u0D7C\u0D17\u0D4B\u0D21\u0D4D)" })] })] })] }), filtered.length === 0 ? (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4", children: [_jsx(Trees, { className: "w-12 h-12 text-stone-400 mx-auto" }), _jsx("h3", { className: "text-lg font-bold text-stone-800", children: lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല' }), _jsx("p", { className: "text-xs text-stone-500 max-w-md mx-auto", children: lang === 'en'
                                    ? 'Try clearing species or district filters to discover active timber lots across Kerala.'
                                    : 'മറ്റു ജില്ലകളോ തടി ഇനങ്ങളോ തിരഞ്ഞെടുത്ത് വീണ്ടും തിരയുക.' }), _jsx("button", { onClick: () => {
                                    setSelectedSpecies('all');
                                    setSelectedType('all');
                                    setSelectedDistrict('all');
                                    setSearchQuery('');
                                    setValidationAlert(null);
                                }, className: "px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900 transition", children: lang === 'en' ? 'Reset All Filters' : 'ഫിൽട്ടറുകൾ മാറ്റുക' })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((item) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-500/50 transition-all duration-300 flex flex-col group", children: [_jsxs("div", { className: "relative aspect-[16/10] bg-stone-100 overflow-hidden", children: [_jsx("img", { src: item.image_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-105 transition duration-500" }), _jsxs("div", { className: "absolute top-3 left-3 flex flex-wrap gap-1.5", children: [_jsxs("span", { className: "px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-forest-900 shadow-md backdrop-blur-sm flex items-center gap-1", children: [_jsx(Tag, { className: "w-3 h-3 text-amber-600" }), lang === 'en' ? item.species : item.species_ml] }), _jsx("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-900/80 text-white shadow-md backdrop-blur-sm", children: item.grade })] }), item.transit_pass && (_jsxs("div", { className: "absolute top-3 right-3 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Form IV Transit' : 'പാസ്സ് ഉണ്ട്' })] })), _jsxs("div", { className: "absolute bottom-2 right-2 bg-black/70 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs font-bold", children: [item.quantity, " ", item.unit] })] }), _jsxs("div", { className: "p-5 flex-1 flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-stone-900 text-base line-clamp-1 group-hover:text-forest-800 transition", children: item.title }), _jsxs("p", { className: "text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium", children: [_jsx("span", { className: "font-semibold text-stone-700", children: lang === 'en' ? item.type : item.type_ml }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: item.dimensions })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-forest-700 flex-shrink-0" }), _jsxs("span", { className: "line-clamp-1 font-medium", children: [item.locality, ", ", item.district.split(' ')[0]] })] }), _jsx("span", { className: "text-[11px] text-stone-400 font-medium", children: item.moisture })] }), _jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-xs text-stone-500", children: [_jsx("span", { className: "text-stone-400", children: lang === 'en' ? 'Depot:' : 'ഡിപ്പോ:' }), _jsx("span", { className: "font-semibold text-stone-800 line-clamp-1", children: item.seller_name }), item.seller_verified && (_jsx("span", { title: "Verified Yard", children: _jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-forest-700 flex-shrink-0" }) }))] })] }), _jsxs("div", { className: "pt-3 border-t border-stone-100 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-stone-400", children: lang === 'en' ? 'Verified Rate' : 'വില / സി.എഫ്.ടി' }), _jsxs("div", { className: "text-lg font-black text-forest-900 flex items-baseline gap-1", children: [formatINR(item.price_per_cft), _jsxs("span", { className: "text-[10px] text-stone-500 font-semibold", children: ["/ ", item.unit] })] })] }), _jsxs(Link, { to: `/listing/${item.id}`, className: "px-4 py-2 rounded-xl bg-forest-800 group-hover:bg-forest-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-1", children: [_jsx("span", { children: lang === 'en' ? 'View Timber' : 'വിശദാംശങ്ങൾ' }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] })] })] }, item.id))) }))] })] }));
}
