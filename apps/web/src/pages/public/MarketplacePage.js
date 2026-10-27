import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Tag, CheckCircle2, AlertTriangle, X, Activity, Factory, LifeBuoy, Calculator, Trees, Hammer, Truck, ArrowRight, } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { RaiseTicketModal } from '../../components/RaiseTicketModal';
// REAL CUT TIMBER PHOTOS (ഡിപ്പോ & മില്ലുകളിൽ നിന്നുള്ള തനി തടികൾ)
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
        seller_name: 'Nilambur Wood Mart & Depot',
        seller_verified: true,
        image_url: '/images/timber/teak-logs.png',
        dimensions: '14 ft Length × 42 in Girth',
        grade: 'A-Grade Heartwood',
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
    { key: 'all', label: 'All Raw Timber', ml: 'എല്ലാ തടികളും' },
    { key: 'Round Logs', label: 'Round Logs (ഉരുണ്ട തടി)', ml: 'ഉരുണ്ട തടികൾ' },
    { key: 'Rough-sawn Planks', label: 'Rough Planks (പലക)', ml: 'അറുത്ത പലകകൾ' },
    { key: 'Squared Beams', label: 'Squared Beams (ബീം)', ml: 'കഴുക്കോലുകൾ' },
    { key: 'Firewood', label: 'Firewood (വിറക്)', ml: 'വിറക്' },
];
const DISALLOWED_FURNITURE_KEYWORDS = [
    'plywood', 'ply', 'chair', 'table', 'bed', 'sofa', 'desk', 'door lock',
    'furniture', 'കട്ടിൽ', 'കസേര', 'മേശ', 'പ്ലൈവുഡ്', 'ഫർണിച്ചർ'
];
// LIVE YARD ACTIVITY TICKER ITEMS
const LIVE_MARKET_UPDATES = [
    { depot: 'Nilambur Depot', msg: '65 CFT First-Grade Teak Round Logs transit permit issued', ml: 'നിലമ്പൂർ: 65 CFT തേക്ക് ലോഗുകൾ പരിശോധിച്ചുറപ്പിച്ചു' },
    { depot: 'Perumbavoor Mills', msg: '120 CFT Wild Anjili logs loaded for Ernakulam transit', ml: 'പെരുമ്പാവൂർ: 120 CFT ആഞ്ഞിലി തടികൾ ലോഡ് ചെയ്തു' },
    { depot: 'Pala Timber Mart', msg: 'Mahogany 12ft squared beams booked for roofing joinery', ml: 'പാല: മഹാഗണി കഴുക്കോലുകൾ ബുക്കിംഗ് സ്വീകരിച്ചു' },
    { depot: 'Wayanad Division', msg: 'Rosewood (Veetti) certified logs listed with Form IV pass', ml: 'വയനാട്: ഈട്ടി ലോഗുകൾ ഫോറസ്റ്റ് പാസ്സ് സഹിതം ലഭ്യമാണ്' },
    { depot: 'Adoor Agro Depot', msg: '240 CFT Fresh Rubberwood logs ready for dispatch', ml: 'അടൂർ: 240 CFT റബർ തടികൾ വിൽപനയ്ക്ക് തയ്യാറായി' },
];
export function MarketplacePage({ lang = 'en' }) {
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);
    // Search Validation Alert
    const [validationAlert, setValidationAlert] = useState(null);
    // Handle Search Input with Validation
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        const lower = value.toLowerCase().trim();
        const matchedDisallowed = DISALLOWED_FURNITURE_KEYWORDS.find((kw) => lower.includes(kw));
        if (matchedDisallowed) {
            setValidationAlert({
                type: 'warning',
                title: lang === 'en' ? 'Raw Timber Only Platform' : 'റോ തടികൾ മാത്രമുള്ള വിപണി',
                message: lang === 'en'
                    ? 'Timora exclusively trades raw timber logs and rough-sawn lumber. Finished furniture and plywood are not listed. Search for Teak, Mahogany, Anjili, or Rubberwood instead.'
                    : 'ടിമോറയിൽ ഉരുണ്ട തടികളും അറുത്ത മരങ്ങളും മാത്രമാണ് വ്യാപാരം ചെയ്യുന്നത്. ഫർണിച്ചറോ പ്ലൈവുഡോ ലഭ്യമല്ല. തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ എന്നിവ തിരയുക.',
            });
            return;
        }
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
    return (_jsxs("div", { className: "min-h-screen bg-[#E7E1D6] text-[#4A3626] space-y-10 pb-20 relative", children: [_jsx("div", { className: "bg-[#d5cfc4]/70 border-b border-[#8E7F6B]/30 py-2.5 overflow-hidden ticker-track select-none", children: _jsx("div", { className: "flex animate-marquee items-center gap-8 whitespace-nowrap text-xs text-[#4A3626]", children: [...LIVE_MARKET_UPDATES, ...LIVE_MARKET_UPDATES].map((u, i) => (_jsxs("span", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "px-2 py-0.5 rounded-full bg-[#5B6147] text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs", children: [_jsx(Activity, { className: "w-2.5 h-2.5" }), u.depot] }), _jsx("span", { className: "text-[#4A3626] font-semibold", children: lang === 'en' ? u.msg : u.ml }), _jsx("span", { className: "text-[#8E7F6B]/70 text-sm mx-2", children: "\u2726" })] }, i))) }) }), _jsxs("section", { className: "max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6 pt-4 sm:pt-8", children: [_jsx("div", { className: "inline-block mx-auto", children: _jsxs("div", { className: "rounded-full bg-white/70 backdrop-blur-xs border border-[#8E7F6B]/30 px-6 py-2 shadow-xs flex items-center justify-center gap-3", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5B6147]" }), _jsxs("span", { className: "font-serif font-black tracking-[0.24em] text-[#4A3626] text-xs sm:text-sm uppercase select-none", style: { fontFamily: 'Georgia, Cambria, serif' }, children: ["TIMBER ", _jsx("span", { className: "text-[#5B6147] font-sans font-extrabold mx-2", children: "\u00B7" }), " PEOPLE ", _jsx("span", { className: "text-[#5B6147] font-sans font-extrabold mx-2", children: "\u00B7" }), " POSSIBILITIES"] }), _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-[#5B6147]" })] }) }), _jsxs("div", { className: "space-y-3 max-w-3xl mx-auto", children: [_jsx("h1", { className: "text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-[#4A3626]", style: { fontFamily: 'Georgia, Cambria, serif' }, children: lang === 'en' ? (_jsxs(_Fragment, { children: ["Buy, Sell & Source Raw Timber ", _jsx("br", {}), _jsx("span", { className: "text-[#5B6147]", children: "Direct From Kerala Sawmills" })] })) : (_jsxs(_Fragment, { children: ["\u0D35\u0D40\u0D1F\u0D41\u0D2A\u0D23\u0D3F\u0D15\u0D4D\u0D15\u0D41\u0D02 \u0D06\u0D35\u0D36\u0D4D\u0D2F\u0D19\u0D4D\u0D19\u0D7E\u0D15\u0D4D\u0D15\u0D41\u0D02 ", _jsx("br", {}), _jsx("span", { className: "text-[#5B6147]", children: "\u0D24\u0D1F\u0D3F \u0D28\u0D47\u0D30\u0D3F\u0D1F\u0D4D\u0D1F\u0D4D \u0D35\u0D3E\u0D19\u0D4D\u0D19\u0D3E\u0D28\u0D41\u0D02 \u0D35\u0D3F\u0D7D\u0D15\u0D4D\u0D15\u0D3E\u0D28\u0D41\u0D02" })] })) }), _jsx("p", { className: "text-sm sm:text-base text-[#7A5A3A] font-medium max-w-2xl mx-auto leading-relaxed", children: lang === 'en'
                                    ? 'Connecting house owners, buyers, carpenters, and licensed timber mills across Kerala with verified Forest Form IV passes and genuine Hoppus CFT pricing.'
                                    : 'കേരളത്തിലെ വീടുപണിയുന്നവർക്കും ആശാരിമാർക്കും തടി ഡിപ്പോകൾക്കും ഇടനിലക്കാരില്ലാതെ നേരിട്ട് വിൽക്കാനും വാങ്ങാനും.' })] }), _jsxs("div", { className: "max-w-2xl mx-auto relative", children: [_jsxs("div", { className: "relative flex items-center bg-white rounded-2xl shadow-md border border-[#8E7F6B]/30 p-1.5 sm:p-2 focus-within:ring-2 focus-within:ring-[#5B6147] transition", children: [_jsx(Search, { className: "w-5 h-5 text-[#8E7F6B] ml-3 flex-shrink-0" }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => handleSearchChange(e.target.value), placeholder: lang === 'en'
                                            ? 'Search Teak, Mahogany, Anjili, Rubberwood, Nilambur, Pala...'
                                            : 'തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ, നിലമ്പൂർ തിരയുക...', className: "w-full px-3 py-2 text-sm bg-transparent border-none text-[#4A3626] font-semibold focus:outline-none placeholder:text-[#8E7F6B]/70" }), searchQuery && (_jsx("button", { onClick: () => {
                                            setSearchQuery('');
                                            setValidationAlert(null);
                                        }, className: "p-1 text-[#8E7F6B] hover:text-[#4A3626]", children: _jsx(X, { className: "w-4 h-4" }) }))] }), validationAlert && (_jsxs("div", { className: "absolute left-0 right-0 top-full mt-2 z-30 p-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-[#8E7F6B]/40 shadow-xl text-left flex items-start gap-3 animate-fadeIn", children: [_jsx(AlertTriangle, { className: "w-4 h-4 text-[#7A5A3A] flex-shrink-0 mt-0.5" }), _jsxs("div", { className: "flex-1 text-xs text-[#4A3626]", children: [_jsx("span", { className: "font-bold block text-xs", children: validationAlert.title }), _jsx("p", { className: "mt-0.5 text-[#7A5A3A]", children: validationAlert.message }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("button", { onClick: () => {
                                                            setSelectedSpecies('teak');
                                                            setSearchQuery('Teak');
                                                            setValidationAlert(null);
                                                        }, className: "px-2.5 py-1 rounded-lg bg-[#5B6147] text-white text-[11px] font-bold", children: "\u0D24\u0D47\u0D15\u0D4D\u0D15\u0D4D (Teak)" }), _jsx("button", { onClick: () => {
                                                            setSelectedSpecies('mahogany');
                                                            setSearchQuery('Mahogany');
                                                            setValidationAlert(null);
                                                        }, className: "px-2.5 py-1 rounded-lg bg-[#5B6147] text-white text-[11px] font-bold", children: "\u0D2E\u0D39\u0D3E\u0D17\u0D23\u0D3F (Mahogany)" })] })] }), _jsx("button", { onClick: () => setValidationAlert(null), className: "text-[#8E7F6B] hover:text-[#4A3626]", children: _jsx(X, { className: "w-4 h-4" }) })] }))] }), _jsxs("div", { className: "flex items-center justify-center flex-wrap gap-2.5 pt-1", children: [_jsxs(Link, { to: "/mills", className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs", children: [_jsx(Factory, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Sawmills Directory' : 'തടി മില്ലുകൾ' })] }), _jsxs(Link, { to: "/calculator", className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs", children: [_jsx(Calculator, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Hoppus CFT Calc' : 'സി.എഫ്.ടി കണക്ക്' })] }), _jsxs(Link, { to: "/carpenters", className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs", children: [_jsx(Hammer, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Carpenters' : 'തച്ചൻമാർ' })] }), _jsxs(Link, { to: "/transport", className: "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-[#4A3626] border border-[#8E7F6B]/30 text-xs font-bold transition shadow-2xs", children: [_jsx(Truck, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Logistics' : 'തടി ലോറികൾ' })] })] })] }), _jsxs("section", { className: "max-w-6xl mx-auto px-4 sm:px-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-[#8E7F6B]/20 pb-3 gap-3 overflow-x-auto", children: [_jsx("div", { className: "flex items-center gap-2", children: TYPE_TABS.map((tab) => (_jsx("button", { onClick: () => setSelectedType(tab.key), className: `px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedType === tab.key
                                        ? 'bg-[#3F452F] text-white shadow-xs'
                                        : 'bg-white/80 text-[#7A5A3A] hover:bg-white border border-[#8E7F6B]/30'}`, children: lang === 'en' ? tab.label : tab.ml }, tab.key))) }), _jsxs("span", { className: "text-xs font-bold text-[#7A5A3A] whitespace-nowrap hidden sm:inline", children: [filtered.length, " ", lang === 'en' ? 'Lots Available' : 'തടികൾ ലഭ്യമാണ്'] })] }), _jsxs("div", { className: "bg-white/70 backdrop-blur-xs p-3.5 rounded-2xl border border-[#8E7F6B]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-1.5 flex-wrap", children: [_jsx("span", { className: "text-xs font-bold text-[#8E7F6B] uppercase tracking-wider mr-1", children: lang === 'en' ? 'Species:' : 'ഇനം:' }), SPECIES_PILLS.map((sp) => (_jsx("button", { onClick: () => setSelectedSpecies(sp.key), className: `px-3 py-1 rounded-lg text-xs font-semibold transition ${selectedSpecies === sp.key
                                            ? 'bg-[#5B6147] text-white font-bold shadow-2xs'
                                            : 'bg-white/90 text-[#4A3626] hover:bg-white border border-[#8E7F6B]/20'}`, children: lang === 'en' ? sp.label : sp.ml }, sp.key)))] }), _jsxs("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [_jsx(MapPin, { className: "w-4 h-4 text-[#5B6147] flex-shrink-0" }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-1.5 border border-[#8E7F6B]/30 rounded-xl text-[#4A3626] font-semibold text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#5B6147] w-full md:w-52", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "pathanamthitta", children: "Pathanamthitta (\u0D2A\u0D24\u0D4D\u0D24\u0D28\u0D02\u0D24\u0D3F\u0D1F\u0D4D\u0D1F)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "kollam", children: "Kollam (\u0D15\u0D4A\u0D32\u0D4D\u0D32\u0D02)" })] })] })] }), filtered.length === 0 ? (_jsxs("div", { className: "bg-white/80 rounded-3xl border border-[#8E7F6B]/30 p-10 text-center space-y-3", children: [_jsx(Trees, { className: "w-10 h-10 text-[#8E7F6B] mx-auto" }), _jsx("h3", { className: "text-base font-bold text-[#4A3626]", children: lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല' }), _jsx("p", { className: "text-xs text-[#7A5A3A]", children: lang === 'en' ? 'Try adjusting species or district filters.' : 'മറ്റു ജില്ലകളോ തടി ഇനങ്ങളോ തിരഞ്ഞെടുത്ത് വീണ്ടും തിരയുക.' }), _jsx("button", { onClick: () => {
                                    setSelectedSpecies('all');
                                    setSelectedType('all');
                                    setSelectedDistrict('all');
                                    setSearchQuery('');
                                    setValidationAlert(null);
                                }, className: "px-4 py-2 bg-[#5B6147] text-white rounded-xl text-xs font-bold hover:bg-[#3F452F] transition", children: lang === 'en' ? 'Reset Filters' : 'ഫിൽട്ടറുകൾ മാറ്റുക' })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((item) => (_jsxs("div", { className: "bg-white rounded-3xl border border-[#8E7F6B]/30 overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col group", children: [_jsxs("div", { className: "relative aspect-[16/10] bg-[#d5cfc4]/50 overflow-hidden", children: [_jsx("img", { src: item.image_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-102 transition duration-300" }), _jsx("div", { className: "absolute top-2.5 left-2.5 flex items-center gap-1.5", children: _jsxs("span", { className: "px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-[#4A3626] shadow-xs flex items-center gap-1", children: [_jsx(Tag, { className: "w-3 h-3 text-[#5B6147]" }), lang === 'en' ? item.species : item.species_ml] }) }), item.transit_pass && (_jsxs("div", { className: "absolute top-2.5 right-2.5 bg-emerald-700/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Form IV Pass' : 'പാസ്സ് ഉണ്ട്' })] })), _jsxs("div", { className: "absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-md", children: [item.quantity, " ", item.unit] })] }), _jsxs("div", { className: "p-4 flex-1 flex flex-col justify-between space-y-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-[#4A3626] text-sm line-clamp-1 group-hover:text-[#5B6147] transition", children: item.title }), _jsxs("p", { className: "text-xs text-[#7A5A3A] mt-1 flex items-center gap-1", children: [_jsx("span", { children: lang === 'en' ? item.type : item.type_ml }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: item.dimensions })] }), _jsxs("div", { className: "mt-2 pt-2 border-t border-[#8E7F6B]/20 flex items-center justify-between text-xs text-[#7A5A3A]", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { className: "line-clamp-1", children: item.locality })] }), _jsx("span", { className: "text-[11px] text-[#8E7F6B]", children: item.moisture })] })] }), _jsxs("div", { className: "pt-2 border-t border-[#8E7F6B]/20 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-[#8E7F6B] block", children: lang === 'en' ? 'Rate / CFT' : 'നിരക്ക് / CFT' }), _jsx("span", { className: "text-base font-extrabold text-[#4A3626]", children: formatINR(item.price_per_cft) })] }), _jsxs(Link, { to: `/listing/${item.id}`, className: "px-3.5 py-1.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold transition flex items-center gap-1 shadow-xs", children: [_jsx("span", { children: lang === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ' }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] })] })] }, item.id))) }))] }), _jsx("section", { className: "max-w-6xl mx-auto px-4 sm:px-6", children: _jsxs("div", { className: "bg-white/80 rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7E1D6] text-[#4A3626] text-[11px] font-bold mb-2", children: [_jsx(Factory, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Direct Sawmills' : 'തടി മില്ലുകൾ' })] }), _jsx("h2", { className: "text-xl sm:text-2xl font-bold font-serif text-[#4A3626]", children: lang === 'en' ? 'Licensed Sawmills Across Kerala' : 'കേരളത്തിലെ അംഗീകൃത തടി മില്ലുകൾ' })] }), _jsxs(Link, { to: "/mills", className: "inline-flex items-center gap-1.5 text-xs font-bold text-[#5B6147] hover:underline", children: [_jsx("span", { children: lang === 'en' ? 'View Full Mill Directory' : 'എല്ലാ മില്ലുകളും കാണുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "p-4 rounded-2xl bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 space-y-2", children: [_jsx("span", { className: "text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md", children: "KL-SAW-EKM-1048" }), _jsx("h4", { className: "font-bold text-[#4A3626] text-sm", children: "Perumbavoor Modern Sawmills" }), _jsx("p", { className: "text-xs text-[#7A5A3A]", children: "Kandanthara, Perumbavoor, Ernakulam" }), _jsx("p", { className: "text-[11px] text-[#8E7F6B]", children: "High-speed band saws, Anjili & Teak log slicing." })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 space-y-2", children: [_jsx("span", { className: "text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md", children: "KL-SAW-PTA-1982" }), _jsx("h4", { className: "font-bold text-[#4A3626] text-sm", children: "Adoor Central Timber Sawing Yard" }), _jsx("p", { className: "text-xs text-[#7A5A3A]", children: "Adoor Bypass, Pathanamthitta" }), _jsx("p", { className: "text-[11px] text-[#8E7F6B]", children: "Traditional house joinery timber & door beams." })] }), _jsxs("div", { className: "p-4 rounded-2xl bg-[#E7E1D6]/60 border border-[#8E7F6B]/30 space-y-2", children: [_jsx("span", { className: "text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md", children: "KL-SAW-PTA-2104" }), _jsx("h4", { className: "font-bold text-[#4A3626] text-sm", children: "Konni Forest Valley Plant" }), _jsx("p", { className: "text-xs text-[#7A5A3A]", children: "Konni Depot, Pathanamthitta" }), _jsx("p", { className: "text-[11px] text-[#8E7F6B]", children: "Kiln seasoning plant & Nilambur Teak logs." })] })] })] }) }), _jsx("div", { className: "fixed right-3 sm:right-6 bottom-20 md:bottom-8 z-40", children: _jsxs("button", { onClick: () => setIsRaiseTicketOpen(true), className: "group relative flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-[#5B6147] to-[#3F452F] text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20", title: lang === 'en' ? 'Raise a Support Ticket / Grievance' : 'പരാതി സമർപ്പിക്കുക (Raise a Ticket)', children: [_jsx(LifeBuoy, { className: "w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300 flex-shrink-0" }), _jsxs("div", { className: "flex flex-col items-start text-left leading-tight", children: [_jsx("span", { className: "text-[9px] text-[#d5cfc4] uppercase font-bold block", children: lang === 'en' ? 'Support' : 'സഹായം' }), _jsx("span", { className: "font-extrabold text-white text-xs", children: lang === 'en' ? 'Raise a Ticket' : 'റൈസ് എ ടിക്കറ്റ്' })] })] }) }), _jsx(RaiseTicketModal, { isOpen: isRaiseTicketOpen, onClose: () => setIsRaiseTicketOpen(false), lang: lang })] }));
}
