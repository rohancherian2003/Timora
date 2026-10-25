import React, { useState } from 'react';
import { Hammer, MapPin, Award, Phone, Star, CheckCircle, ShieldCheck } from 'lucide-react';

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

export function CarpenterDirectoryPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const filtered = DEMO_CARPENTERS.filter((c) => {
    if (selectedDistrict !== 'all' && !c.district.toLowerCase().includes(selectedDistrict.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] text-[#2c160b] rounded-3xl shadow-md border border-[#ebd5bc]">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#854d0e] text-xs font-semibold backdrop-blur-sm border border-amber-600/30">
            <Hammer className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Kerala Master Wood Craftsmen' : 'കേരളത്തിലെ പരമ്പരാഗത ആശാരിമാർ'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#2c160b]">
            {lang === 'en' ? 'Verified Carpenters & Joinery Masters' : 'വിദഗ്ദ്ധരായ ആശാരിമാർ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6b472e] leading-relaxed max-w-2xl font-medium">
            {lang === 'en'
              ? 'Connect directly with master carpenters experienced in roofing trusses, door frames, teak carvings, and traditional Kerala timber architecture.'
              : 'മേൽക്കൂര തട്ടിടൽ, കട്ടിളകൾ, വാതിലുകൾ, കൊത്തുപണികൾ എന്നിവയിൽ വർഷങ്ങളുടെ പ്രവൃത്തിപരിചയമുള്ള വിദഗ്ദ്ധ തച്ചന്മാർ.'}
          </p>
        </div>
      </div>

      {/* Filter by district */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#b45309]" />
          <span className="text-xs font-bold text-stone-700">
            {lang === 'en' ? 'Filter by District:' : 'ജില്ല തിരിച്ച്:'}
          </span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 border border-amber-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#faf6ee]/50 focus:ring-2 focus:ring-[#b45309] focus:outline-none"
          >
            <option value="all">{lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും'}</option>
            <option value="kottayam">Kottayam (കോട്ടയം)</option>
            <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
            <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
            <option value="kozhikode">Kozhikode (കോഴിക്കോട്)</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          {filtered.length} {lang === 'en' ? 'Carpenters Listed' : 'ആശാരിമാർ ലഭ്യമാണ്'}
        </span>
      </div>

      {/* Carpenter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs hover:border-amber-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-[#2c160b] text-lg group-hover:text-[#b45309] transition font-serif">
                    {c.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#b45309]" />
                    <span>{c.locality}, {c.district}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{c.rating}</span>
                  <span className="text-stone-400 font-normal">({c.rating_count})</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-[#faf6ee] text-[#78350f] border border-amber-200/60 text-xs font-bold">
                  {c.experience_yrs} {lang === 'en' ? 'Years Experience' : 'വർഷത്തെ പരിചയം'}
                </span>
                {c.is_verified && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Verified Carpenter' : 'വെരിഫൈഡ്'}</span>
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-amber-100">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  {lang === 'en' ? 'Specialized Woodwork' : 'പ്രത്യേക മേഖലകൾ'}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {c.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#fbf7f0] text-[#78350f] text-xs font-semibold border border-amber-200/60"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 text-xs text-stone-500">
                <span className="font-semibold text-stone-700">{lang === 'en' ? 'Timber Worked: ' : 'ഉപയോഗിക്കുന്ന തടി: '}</span>
                <span>{c.timber_pref}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-amber-100 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-stone-400 uppercase">
                  {lang === 'en' ? 'Phone' : 'ഫോൺ'}
                </span>
                <span className="font-mono text-xs font-bold text-stone-900">{c.phone}</span>
              </div>
              <a
                href={`tel:${c.phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Call Master Craftsman' : 'വിളിക്കുക'}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
