import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Trees, MapPin, Tag, ShieldCheck } from 'lucide-react';
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

export function MarketplacePage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Trees className="w-7 h-7 text-forest-700" />
            {lang === 'en' ? 'Kerala Timber Marketplace' : 'കേരള തടി മാർക്കറ്റ്'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {lang === 'en'
              ? 'Browse verified raw timber listings across all 14 Kerala districts.'
              : 'കേരളത്തിലെ 14 ജില്ലകളിലെയും പരിശോധിച്ചുറപ്പിച്ച തടികൾ.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder={lang === 'en' ? 'Search Teak, Mahogany...' : 'തടി തിരയുക...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-forest-600 bg-white"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-xs uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          {lang === 'en' ? 'Filter by:' : 'ഫിൽട്ടർ:'}
        </div>

        {/* Species Filter */}
        <select
          value={selectedSpecies}
          onChange={(e) => setSelectedSpecies(e.target.value)}
          className="px-3 py-2 border rounded-lg text-slate-700 font-medium text-xs sm:text-sm bg-slate-50"
        >
          <option value="all">{lang === 'en' ? 'All Species (എല്ലാ ഇനങ്ങളും)' : 'എല്ലാ ഇനങ്ങളും'}</option>
          <option value="teak">Teak (തേക്ക്)</option>
          <option value="mahogany">Mahogany (മഹാഗണി)</option>
          <option value="anjili">Anjili (ആഞ്ഞിലി)</option>
          <option value="rubberwood">Rubberwood (റബർ)</option>
          <option value="mango">Mango Wood (മാവ്)</option>
          <option value="jackfruit">Jackfruit (പ്ലാവ്)</option>
          <option value="rosewood">Rosewood (ഇടപ്പിലി)</option>
          <option value="coconut">Coconut (തെങ്ങ്)</option>
        </select>

        {/* District Filter */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-3 py-2 border rounded-lg text-slate-700 font-medium text-xs sm:text-sm bg-slate-50"
        >
          <option value="all">{lang === 'en' ? 'All Kerala Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും'}</option>
          <option value="kottayam">Kottayam (കോട്ടയം)</option>
          <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
          <option value="malappuram">Malappuram (മലപ്പുറം)</option>
          <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
          <option value="kozhikode">Kozhikode (കോഴിക്കോട്)</option>
          <option value="palakkad">Palakkad (പാലക്കാട്)</option>
          <option value="kollam">Kollam (കൊല്ലം)</option>
          <option value="thiruvananthapuram">Thiruvananthapuram (തിരുവനന്തപുരം)</option>
          <option value="kannur">Kannur (കണ്ണൂർ)</option>
          <option value="wayanad">Wayanad (വയനാട്)</option>
          <option value="pathanamthitta">Pathanamthitta (പത്തനംതിട്ട)</option>
          <option value="alappuzha">Alappuzha (ആലപ്പുഴ)</option>
          <option value="idukki">Idukki (ഇടുക്കി)</option>
          <option value="kasaragod">Kasaragod (കാസർഗോഡ്)</option>
        </select>

        <span className="ml-auto text-xs font-semibold text-slate-500">
          {filtered.length} {lang === 'en' ? 'Listings Available' : 'തടികൾ ലഭ്യമാണ്'}
        </span>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((item) => (
          <Link
            to={`/listings/${item.id}`}
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-800 shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3 text-forest-700" />
                {item.species}
              </div>
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-forest-700 transition">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.type} · {item.dimensions}</p>

                <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-forest-700" />
                  <span>{item.district}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Rate / CFT</span>
                  <div className="text-base font-extrabold text-forest-900">
                    {formatINR(item.price_per_cft)}
                  </div>
                </div>

                <span className="px-3 py-1.5 rounded-lg bg-forest-700 group-hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition">
                  {lang === 'en' ? 'View Details' : 'വിശദാംശങ്ങൾ'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
