import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Trees, MapPin, Tag } from 'lucide-react';
import { formatINR } from '@timora/shared';
// Demo seed listings for UI rendering until live DB data is connected
const DEMO_LISTINGS = [
    {
        id: '1',
        title: 'First-Grade Nilambur Teak Planks',
        species: 'Teak (തേക്ക്)',
        type: 'Rough-sawn Planks',
        district: 'Malappuram (മലപ്പുറം)',
        locality: 'Nilambur',
        quantity: 45,
        unit: 'CFT',
        price_per_cft: 2800,
        seller_name: 'Nilambur Wood Works',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=600&q=80',
        dimensions: '10 ft × 8 in × 2 in',
    },
    {
        id: '2',
        title: 'Seasoned African Mahogany Squared Beams',
        species: 'Mahogany (മഹാഗണി)',
        type: 'Squared Beams',
        district: 'Kottayam (കോട്ടയം)',
        locality: 'Pala',
        quantity: 80,
        unit: 'CFT',
        price_per_cft: 1850,
        seller_name: 'Meenachil Timber Mart',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=600&q=80',
        dimensions: '12 ft × 6 in × 6 in',
    },
    {
        id: '3',
        title: 'Mature Anjili Wild Jack Round Logs',
        species: 'Anjili (ആഞ്ഞിലി)',
        type: 'Round Logs',
        district: 'Ernakulam (എറണാകുളം)',
        locality: 'Perumbavoor',
        quantity: 120,
        unit: 'CFT',
        price_per_cft: 1400,
        seller_name: 'Perumbavoor Saw Mills',
        seller_verified: true,
        image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80',
        dimensions: '14 in avg dia × 16 ft',
    },
    {
        id: '4',
        title: 'Treated Rubberwood Kiln-Dried Planks',
        species: 'Rubberwood (റബർ)',
        type: 'Rough-sawn Planks',
        district: 'Pathanamthitta (പത്തനംതിട്ട)',
        locality: 'Adoor',
        quantity: 200,
        unit: 'CFT',
        price_per_cft: 650,
        seller_name: 'Adoor Agro Timber',
        seller_verified: false,
        image_url: 'https://images.unsplash.com/photo-1520697830682-bbb6e85e2b0b?auto=format&fit=crop&w=600&q=80',
        dimensions: '8 ft × 4 in × 1.5 in',
    },
];
export function MarketplacePage({ lang = 'en' }) {
    const [selectedSpecies, setSelectedSpecies] = useState('all');
    const [selectedDistrict, setSelectedDistrict] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const filtered = DEMO_LISTINGS.filter((item) => {
        if (selectedSpecies !== 'all' && !item.species.toLowerCase().includes(selectedSpecies.toLowerCase())) {
            return false;
        }
        if (selectedDistrict !== 'all' && !item.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
            return false;
        }
        if (searchQuery && !item.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-col md:flex-row items-start md:items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2", children: [_jsx(Trees, { className: "w-7 h-7 text-forest-700" }), lang === 'en' ? 'Kerala Timber Marketplace' : 'കേരള തടി മാർക്കറ്റ്'] }), _jsx("p", { className: "text-sm text-slate-600 mt-1", children: lang === 'en'
                                    ? 'Browse verified raw timber listings across all 14 Kerala districts.'
                                    : 'കേരളത്തിലെ 14 ജില്ലകളിലെയും പരിശോധിച്ചുറപ്പിച്ച തടികൾ.' })] }), _jsxs("div", { className: "relative w-full md:w-80", children: [_jsx(Search, { className: "w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" }), _jsx("input", { type: "text", placeholder: lang === 'en' ? 'Search Teak, Mahogany...' : 'തടി തിരയുക...', value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white" })] })] }), _jsxs("div", { className: "bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-sm", children: [_jsxs("div", { className: "flex items-center gap-1.5 text-slate-500 font-semibold text-xs uppercase tracking-wider", children: [_jsx(Filter, { className: "w-4 h-4" }), lang === 'en' ? 'Filter by:' : 'ഫിൽട്ടർ:'] }), _jsxs("select", { value: selectedSpecies, onChange: (e) => setSelectedSpecies(e.target.value), className: "px-3 py-2 border rounded-lg text-slate-700 font-medium text-xs sm:text-sm bg-slate-50", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Species (എല്ലാ ഇനങ്ങളും)' : 'എല്ലാ ഇനങ്ങളും' }), _jsx("option", { value: "teak", children: "Teak (\u0D24\u0D47\u0D15\u0D4D\u0D15\u0D4D)" }), _jsx("option", { value: "mahogany", children: "Mahogany (\u0D2E\u0D39\u0D3E\u0D17\u0D23\u0D3F)" }), _jsx("option", { value: "anjili", children: "Anjili (\u0D06\u0D1E\u0D4D\u0D1E\u0D3F\u0D32\u0D3F)" }), _jsx("option", { value: "rubberwood", children: "Rubberwood (\u0D31\u0D2C\u0D7C)" }), _jsx("option", { value: "mango", children: "Mango Wood (\u0D2E\u0D3E\u0D35\u0D4D)" }), _jsx("option", { value: "jackfruit", children: "Jackfruit (\u0D2A\u0D4D\u0D32\u0D3E\u0D35\u0D4D)" }), _jsx("option", { value: "rosewood", children: "Rosewood (\u0D07\u0D1F\u0D2A\u0D4D\u0D2A\u0D3F\u0D32\u0D3F)" }), _jsx("option", { value: "coconut", children: "Coconut (\u0D24\u0D46\u0D19\u0D4D\u0D19\u0D4D)" })] }), _jsxs("select", { value: selectedDistrict, onChange: (e) => setSelectedDistrict(e.target.value), className: "px-3 py-2 border rounded-lg text-slate-700 font-medium text-xs sm:text-sm bg-slate-50", children: [_jsx("option", { value: "all", children: lang === 'en' ? 'All Kerala Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും' }), _jsx("option", { value: "kottayam", children: "Kottayam (\u0D15\u0D4B\u0D1F\u0D4D\u0D1F\u0D2F\u0D02)" }), _jsx("option", { value: "ernakulam", children: "Ernakulam (\u0D0E\u0D31\u0D23\u0D3E\u0D15\u0D41\u0D33\u0D02)" }), _jsx("option", { value: "malappuram", children: "Malappuram (\u0D2E\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D31\u0D02)" }), _jsx("option", { value: "thrissur", children: "Thrissur (\u0D24\u0D43\u0D36\u0D4D\u0D36\u0D42\u0D7C)" }), _jsx("option", { value: "kozhikode", children: "Kozhikode (\u0D15\u0D4B\u0D34\u0D3F\u0D15\u0D4D\u0D15\u0D4B\u0D1F\u0D4D)" }), _jsx("option", { value: "palakkad", children: "Palakkad (\u0D2A\u0D3E\u0D32\u0D15\u0D4D\u0D15\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "kollam", children: "Kollam (\u0D15\u0D4A\u0D32\u0D4D\u0D32\u0D02)" }), _jsx("option", { value: "thiruvananthapuram", children: "Thiruvananthapuram (\u0D24\u0D3F\u0D30\u0D41\u0D35\u0D28\u0D28\u0D4D\u0D24\u0D2A\u0D41\u0D30\u0D02)" }), _jsx("option", { value: "kannur", children: "Kannur (\u0D15\u0D23\u0D4D\u0D23\u0D42\u0D7C)" }), _jsx("option", { value: "wayanad", children: "Wayanad (\u0D35\u0D2F\u0D28\u0D3E\u0D1F\u0D4D)" }), _jsx("option", { value: "pathanamthitta", children: "Pathanamthitta (\u0D2A\u0D24\u0D4D\u0D24\u0D28\u0D02\u0D24\u0D3F\u0D1F\u0D4D\u0D1F)" }), _jsx("option", { value: "alappuzha", children: "Alappuzha (\u0D06\u0D32\u0D2A\u0D4D\u0D2A\u0D41\u0D34)" }), _jsx("option", { value: "idukki", children: "Idukki (\u0D07\u0D1F\u0D41\u0D15\u0D4D\u0D15\u0D3F)" }), _jsx("option", { value: "kasaragod", children: "Kasaragod (\u0D15\u0D3E\u0D38\u0D7C\u0D17\u0D4B\u0D21\u0D4D)" })] }), _jsxs("span", { className: "ml-auto text-xs font-semibold text-slate-500", children: [filtered.length, " ", lang === 'en' ? 'Listings Available' : 'തടികൾ ലഭ്യമാണ്'] })] }), _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", children: filtered.map((item) => (_jsxs(Link, { to: `/listings/${item.id}`, className: "bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer", children: [_jsxs("div", { className: "relative aspect-[4/3] bg-slate-100 overflow-hidden", children: [_jsx("img", { src: item.image_url, alt: item.title, className: "w-full h-full object-cover group-hover:scale-105 transition duration-300" }), _jsxs("div", { className: "absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-1", children: [_jsx(Tag, { className: "w-3 h-3 text-forest-700" }), item.species] })] }), _jsxs("div", { className: "p-4 flex-1 flex flex-col justify-between space-y-3", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-forest-700 transition", children: item.title }), _jsxs("p", { className: "text-xs text-slate-500 mt-0.5", children: [item.type, " \u00B7 ", item.dimensions] }), _jsxs("div", { className: "flex items-center gap-1 text-xs text-slate-600 mt-2", children: [_jsx(MapPin, { className: "w-3.5 h-3.5 text-forest-700" }), _jsx("span", { children: item.district })] })] }), _jsxs("div", { className: "pt-3 border-t border-slate-100 flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-slate-400", children: "Rate / CFT" }), _jsx("div", { className: "text-base font-extrabold text-forest-900", children: formatINR(item.price_per_cft) })] }), _jsx("span", { className: "px-3 py-1.5 rounded-lg bg-forest-700 group-hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition", children: lang === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ' })] })] })] }, item.id))) })] }));
}
