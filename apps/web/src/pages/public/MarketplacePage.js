import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Trees, MapPin, Tag, ShieldCheck, ArrowRight, Calculator, CheckCircle2, Award } from 'lucide-react';
import { formatINR } from '@timora/shared';
const EXTENDED_LISTINGS = [
    {
        id: '1',
        title: 'First-Grade Nilambur Teak Planks (A-Class Heartwood)',
        species: 'Teak',
        species_ml: 'തേക്ക്',
        type: 'Rough-sawn Planks',
        type_ml: 'അറുത്ത പലകകൾ',
        district: 'Malappuram (മലപ്പുറം)',
        locality: 'Nilambur Division',
        quantity: 45,
        unit: 'CFT',
        price_per_cft: 2800,
        seller_name: 'Nilambur Wood Mart',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800&q=80',
        dimensions: '10 ft × 8 in × 2 in',
        grade: 'A-Grade Heartwood',
        transit_pass: true,
        moisture: 'Air-Dried (12%)',
    },
    {
        id: '2',
        title: 'Seasoned African Mahogany Squared Beams (Heavy Joinery)',
        species: 'Mahogany',
        species_ml: 'മഹാഗണി',
        type: 'Squared Beams',
        type_ml: 'ചതുര കഴുക്കോലുകൾ',
        district: 'Kottayam (കോട്ടയം)',
        locality: 'Pala Town',
        quantity: 80,
        unit: 'CFT',
        price_per_cft: 1850,
        seller_name: 'Meenachil Timber Mart',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80',
        dimensions: '12 ft × 6 in × 6 in',
        grade: 'Select Prime',
        transit_pass: true,
        moisture: 'Kiln Seasoned',
    },
    {
        id: '3',
        title: 'Old-Growth Wild Jack (Anjili) Heavy Round Logs',
        species: 'Anjili',
        species_ml: 'ആഞ്ഞിലി',
        type: 'Round Logs',
        type_ml: 'ഉരുണ്ട തടികൾ',
        district: 'Ernakulam (എറണാകുളം)',
        locality: 'Perumbavoor Industrial Area',
        quantity: 120,
        unit: 'CFT',
        price_per_cft: 1400,
        seller_name: 'Perumbavoor Saw Mills',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        dimensions: '16 ft Length × 48 in Mid-Girth',
        grade: 'Forest Grade I',
        transit_pass: true,
        moisture: 'Natural Green Log',
    },
    {
        id: '4',
        title: 'Treated Rubberwood Kiln-Dried Planks (Vacuum Impregnated)',
        species: 'Rubberwood',
        species_ml: 'റബർ',
        type: 'Rough-sawn Planks',
        type_ml: 'അറുത്ത പലകകൾ',
        district: 'Pathanamthitta (പത്തനംതിട്ട)',
        locality: 'Adoor Agro Depot',
        quantity: 200,
        unit: 'CFT',
        price_per_cft: 650,
        seller_name: 'Adoor Agro Timber',
        seller_verified: false,
        image_url: 'https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?auto=format&fit=crop&w=800&q=80',
        dimensions: '8 ft × 4 in × 1.5 in',
        grade: 'Commercial Grade',
        transit_pass: true,
        moisture: 'Kiln Dried (10%)',
    },
    {
        id: '5',
        title: 'Heritage Jackfruit Wood (Varikka Plavu) Door Frame Planks',
        species: 'Jackfruit',
        species_ml: 'പ്ലാവ്',
        type: 'Rough-sawn Planks',
        type_ml: 'അറുത്ത പലകകൾ',
        district: 'Thrissur (തൃശ്ശൂർ)',
        locality: 'Wadakkanchery',
        quantity: 65,
        unit: 'CFT',
        price_per_cft: 2200,
        seller_name: 'Central Kerala Timber Yards',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1541123437800-1bb1317badc2?auto=format&fit=crop&w=800&q=80',
        dimensions: '9 ft × 6 in × 3 in',
        grade: 'Heritage Heartwood',
        transit_pass: true,
        moisture: 'Naturally Seasoned',
    },
    {
        id: '6',
        title: 'High-Calorie Split Firewood & Boiler Timber Blocks',
        species: 'Rubberwood',
        species_ml: 'റബർ / വിറക്',
        type: 'Firewood',
        type_ml: 'വിറക് തടികൾ',
        district: 'Kollam (കൊല്ലം)',
        locality: 'Punalur Yard',
        quantity: 15,
        unit: 'Tonnes',
        price_per_cft: 280,
        seller_name: 'Punalur Wood Fuel Mart',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        dimensions: 'Split Logs (2 to 3 ft)',
        grade: 'Dry Boiler Ready',
        transit_pass: true,
        moisture: 'Sun Dried',
    },
];
const SPECIES_PILLS = [
    { key: 'all', label: 'All Species', ml: 'എല്ലാം' },
    { key: 'teak', label: 'Teak', ml: 'തേക്ക്' },
    { key: 'mahogany', label: 'Mahogany', ml: 'മഹാഗണി' },
    { key: 'anjili', label: 'Anjili', ml: 'ആഞ്ഞിലി' },
    { key: 'jackfruit', label: 'Jackfruit', ml: 'പ്ലാവ്' },
    { key: 'rubberwood', label: 'Rubberwood', ml: 'റബർ' },
];
const TYPE_TABS = [
    { key: 'all', label: 'All Timber Stock', ml: 'എല്ലാ തടികളും' },
    { key: 'Rough-sawn Planks', label: 'Rough Planks', ml: 'അറുത്ത പലകകൾ' },
    { key: 'Round Logs', label: 'Round Logs', ml: 'ഉരുണ്ട തടികൾ' },
    { key: 'Squared Beams', label: 'Squared Beams', ml: 'കഴുക്കോലുകൾ' },
    { key: 'Firewood', label: 'Firewood', ml: 'വിറക്' },
];
export function MarketplacePage({ lang = 'en' }) {
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
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
    return (_jsxs("div", { className: "space-y-8 pb-12", children: [_jsxs("section", { className: "relative bg-gradient-to-br from-forest-950 via-forest-900 to-stone-900 text-white overflow-hidden py-14 sm:py-20 border-b border-amber-900/30", children: [_jsx("div", { className: "absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px]" }), _jsx("div", { className: "absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" }), _jsx("div", { className: "absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6", children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/30 text-amber-300 text-xs font-semibold tracking-wide shadow-sm", children: [_jsx(Award, { className: "w-3.5 h-3.5 text-amber-400" }), _jsx("span", { children: lang === 'en'
                                            ? 'Kerala Forest Produce Transit Rules Compliant • 14 Districts Active'
                                            : 'കേരള ഫോറസ്റ്റ് ട്രാൻസിറ്റ് ചട്ടങ്ങൾ പാലിക്കുന്ന വിപണി' })] }), _jsxs("div", { className: "max-w-3xl space-y-3", children: [_jsx("h1", { className: "text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white", children: lang === 'en' ? (_jsxs(_Fragment, { children: ["Kerala\u2019s Premier Raw ", _jsx("span", { className: "text-amber-400", children: "Timber Exchange" })] })) : (_jsxs(_Fragment, { children: ["\u0D15\u0D47\u0D30\u0D33\u0D24\u0D4D\u0D24\u0D3F\u0D32\u0D46 \u0D35\u0D3F\u0D36\u0D4D\u0D35\u0D38\u0D28\u0D40\u0D2F\u0D2E\u0D3E\u0D2F ", _jsx("span", { className: "text-amber-400", children: "\u0D24\u0D1F\u0D3F \u0D35\u0D3F\u0D2A\u0D23\u0D3F" })] })) }), _jsx("p", { className: "text-sm sm:text-base text-stone-300 font-normal leading-relaxed max-w-2xl", children: lang === 'en'
                                            ? 'Source certified Teak, African Mahogany, Wild Jack (Anjili), and Rubberwood directly from vetted sawmills. Hoppus-calculated, transit-permitted raw timber only.'
                                            : 'അംഗീകൃത മില്ലുകളിൽ നിന്നും നേരിട്ട് തേക്ക്, മഹാഗണി, ആഞ്ഞിലി, റബർ തടികൾ വാങ്ങാം. കൃത്യമായ സി.എഫ്.ടി കണക്കുകൾ, ട്രാൻസിറ്റ് പാസ്സ് സഹിതം.' })] }), _jsxs("div", { className: "max-w-2xl bg-white/95 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/20 flex flex-col sm:flex-row gap-2", children: [_jsxs("div", { className: "relative flex-grow flex items-center", children: [_jsx(Search, { className: "w-5 h-5 text-stone-400 absolute left-3.5" }), _jsx("input", { type: "text", placeholder: lang === 'en'
                                                    ? 'Search by species, depot, or district (e.g. Nilambur Teak)...'
                                                    : 'തടി ഇനം, ഡിപ്പോ, അല്ലെങ്കിൽ ജില്ല തിരയുക...', value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-11 pr-4 py-2.5 rounded-xl bg-transparent text-stone-900 text-sm font-medium focus:outline-none placeholder:text-stone-400" })] }), _jsxs(Link, { to: "/calculator", className: "px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition shadow-sm flex-shrink-0", children: [_jsx(Calculator, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'CFT Calculator' : 'തടി അളവ് കണക്കാക്കുക' })] })] }), _jsxs("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 max-w-4xl text-xs", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 font-bold", children: "14" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Districts' : 'ജില്ലകൾ' }), _jsx("span", { className: "text-stone-400 text-[11px]", children: lang === 'en' ? 'Statewide Coverage' : 'കേരളത്തിലുടനീളം' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold", children: "0%" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Middleman Fee' : 'ഇടനിലക്കാരില്ല' }), _jsx("span", { className: "text-stone-400 text-[11px]", children: lang === 'en' ? 'Direct Mill Pricing' : 'നേരിട്ടുള്ള വില' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-400 font-bold", children: "100%" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Raw Timber Only' : 'തടി മാത്രം' }), _jsx("span", { className: "text-stone-400 text-[11px]", children: lang === 'en' ? 'No Plywood or Furniture' : 'ഫർണിച്ചർ ഇല്ല' })] })] }), _jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 font-bold", children: "CFT" }), _jsxs("div", { children: [_jsx("span", { className: "block font-bold text-white", children: lang === 'en' ? 'Hoppus Standard' : 'ഹോപ്പസ് റൂൾ' }), _jsx("span", { className: "text-stone-400 text-[11px]", children: lang === 'en' ? 'Verified Formula' : 'കൃത്യമായ അളവ്' })] })] })] })] })] }), _jsxs("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between border-b border-stone-200 pb-3 gap-2 overflow-x-auto", children: [_jsx("div", { className: "flex items-center gap-2", children: TYPE_TABS.map((tab) => (_jsx("button", { onClick: () => setSelectedType(tab.key), className: `px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedType === tab.key
                                        ? 'bg-forest-800 text-white shadow-sm'
                                        : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'}`, children: lang === 'en' ? tab.label : tab.ml }, tab.key))) }), _jsxs("span", { className: "text-xs font-bold text-stone-500 whitespace-nowrap hidden sm:inline", children: [filtered.length, " ", lang === 'en' ? 'Lots Available' : 'തടികൾ ലഭ്യമാണ്'] })] }), _jsxs("div", { className: "bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "text-xs font-bold text-stone-400 uppercase tracking-wider mr-1", children: lang === 'en' ? 'Species:' : 'ഇനം:' }), SPECIES_PILLS.map((sp) => (_jsx("button", { onClick: () => setSelectedSpecies(sp.key), className: `px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selectedSpecies === sp.key
                                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                                            : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200'}`, children: lang === 'en' ? sp.label : sp.ml }, sp.key)))] }), _jsxs("div", { className: "flex items-center gap-2 w-full md:w-auto", children: [_jsx(MapPin, { className: "w-4 h-4 text-forest-700 flex-shrink-0" }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-2 border border-stone-300 rounded-xl text-stone-800 font-semibold text-xs bg-stone-50 focus:ring-2 focus:ring-forest-600 focus:outline-none w-full md:w-56", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All 14 Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" }), _jsx("option", { value: "palakkad", children: "Palakkad (\u0D2A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "pathanamthitta", children: "Pathanamthitta (\u0D2A\u0D24\u0D4D\u0D24\u0D28\u0D02\u0D24\u0D3F\u0D1F\u0D4D\u0D1F)" }), _jsx("option", { value: "kollam", children: "Kollam (\u0D15\u0D4A\u0D32\u0D4D\u0D32\u0D02)" }), _jsx("option", { value: "thiruvananthapuram", children: "Thiruvananthapuram (\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D28\u0D28\u0D4D\u0D24\u0D2A\u0D41\u0D30\u0D02)" }), _jsx("option", { value: "kannur", children: "Kannur (\u0D15\u0D23\u0D4D\u0D23\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "alappuzha", children: "Alappuzha (\u0D06\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D34)" }), _jsx("option", { value: "idukki", children: "Idukki (\u0D07\u0D1F\u0D41\u0D15\u0D4D\u0D15\u0D3F)" }), _jsx("option", { value: "kasaragod", children: "Kasaragod (\u0D15\u0D3E\u0D38\u0D7C\u0D17\u0D4B\u0D21\u0D4D)" })] })] })] }), filtered.length === 0 ? (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4", children: [_jsx(Trees, { className: "w-12 h-12 text-stone-400 mx-auto" }), _jsx("h3", { className: "text-lg font-bold text-stone-800", children: lang === 'en' ? 'No Timber Stock Found' : 'തടികൾ ഒന്നും കണ്ടെത്തിയില്ല' }), _jsx("p", { className: "text-xs text-stone-500 max-w-md mx-auto", children: lang === 'en'
                                    ? 'Try clearing species or district filters to discover active timber lots across Kerala.'
                                    : 'മറ്റു ജില്ലകളോ തടി ഇനങ്ങളോ തിരഞ്ഞെടുത്ത് വീണ്ടും തിരയുക.' }), _jsx("button", { onClick: () => {
                                    setSelectedSpecies('all');
                                    setSelectedType('all');
                                    setSelectedDistrict('all');
                                    setSearchQuery('');
                                }, className: "px-4 py-2 bg-forest-800 text-white rounded-xl text-xs font-bold hover:bg-forest-900 transition", children: lang === 'en' ? 'Reset All Filters' : 'ഫിൽട്ടറുകൾ മാറ്റുക' })] })) : (_jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6", children: filtered.map((item) => (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-xl hover:border-amber-400/50 transition-all duration-300 flex flex-col group", children: [_jsxs("div", { className: "relative aspect-[16/10] bg-stone-100 overflow-hidden", children: [_jsx("img", { src: item.image_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-105 transition duration-500" }), _jsxs("div", { className: "absolute top-3 left-3 flex flex-wrap gap-1.5", children: [_jsxs("span", { className: "px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/95 text-forest-900 shadow-md backdrop-blur-sm flex items-center gap-1", children: [_jsx(Tag, { className: "w-3 h-3 text-amber-600" }), lang === 'en' ? item.species : item.species_ml] }), _jsx("span", { className: "px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-900/80 text-white shadow-md backdrop-blur-sm", children: item.grade })] }), item.transit_pass && (_jsxs("div", { className: "absolute top-3 right-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), _jsx("span", { children: lang === 'en' ? 'Form IV Transit' : 'പാസ്സ് ഉണ്ട്' })] })), _jsxs("div", { className: "absolute bottom-2 right-2 bg-black/60 text-white text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xs", children: [item.quantity, " ", item.unit] })] }), _jsxs("div", { className: "p-5 flex-1 flex flex-col justify-between space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-stone-900 text-base line-clamp-1 group-hover:text-forest-800 transition", children: item.title }), _jsxs("p", { className: "text-xs text-stone-500 mt-1 flex items-center gap-1.5 font-medium", children: [_jsx("span", { className: "font-semibold text-stone-700", children: lang === 'en' ? item.type : item.type_ml }), _jsx("span", { children: "\u2022" }), _jsx("span", { children: item.dimensions })] }), _jsxs("div", { className: "mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-forest-700 flex-shrink-0" }), _jsxs("span", { className: "line-clamp-1 font-medium", children: [item.locality, ", ", item.district.split(' ')[0]] })] }), _jsx("span", { className: "text-[11px] text-stone-400 font-medium", children: item.moisture })] }), _jsxs("div", { className: "mt-2 flex items-center gap-1.5 text-xs text-stone-500", children: [_jsx("span", { className: "text-stone-400", children: lang === 'en' ? 'Depot:' : 'ഡിപ്പോ:' }), _jsx("span", { className: "font-semibold text-stone-800 line-clamp-1", children: item.seller_name }), item.seller_verified && (_jsx("span", { title: "Verified Yard", children: _jsx(ShieldCheck, { className: "w-3.5 h-3.5 text-forest-700 flex-shrink-0" }) }))] })] }), _jsxs("div", { className: "pt-3 border-t border-stone-100 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-stone-400", children: lang === 'en' ? 'Verified Rate' : 'വില / സി.എഫ്.ടി' }), _jsxs("div", { className: "text-lg font-black text-forest-900 flex items-baseline gap-1", children: [formatINR(item.price_per_cft), _jsxs("span", { className: "text-[10px] text-stone-500 font-semibold", children: ["/ ", item.unit] })] })] }), _jsxs(Link, { to: `/listing/${item.id}`, className: "px-4 py-2 rounded-xl bg-forest-800 group-hover:bg-forest-900 text-white text-xs font-bold shadow-sm transition flex items-center gap-1", children: [_jsx("span", { children: lang === 'en' ? 'View Timber' : 'വിശദാംശങ്ങൾ' }), _jsx(ArrowRight, { className: "w-3.5 h-3.5" })] })] })] })] }, item.id))) }))] })] }));
}
