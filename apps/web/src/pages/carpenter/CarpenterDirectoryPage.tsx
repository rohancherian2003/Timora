import React, { useState } from 'react';
import { Hammer, MapPin, Award, Phone, Star, CheckCircle } from 'lucide-react';

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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Hammer className="w-7 h-7 text-forest-700" />
            {lang === 'en' ? 'Verified Carpenters Directory' : 'കേരളത്തിലെ ആശാരിമാർ (Carpenters)'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {lang === 'en'
              ? 'Find experienced traditional carpenters and timber craftsmen for your construction joinery.'
              : 'വാതിലുകൾ, ജനലുകൾ, മേൽക്കൂരകൾ എന്നിവ നിർമ്മിക്കുന്നതിനായുള്ള മികച്ച ആശാരിമാരെ കണ്ടെത്തൂ.'}
          </p>
        </div>

        {/* District Filter */}
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="px-3.5 py-2 border rounded-xl text-slate-700 font-medium text-xs sm:text-sm bg-white shadow-sm"
        >
          <option value="all">{lang === 'en' ? 'All Kerala Districts (എല്ലാ ജില്ലകളും)' : 'എല്ലാ ജില്ലകളും'}</option>
          <option value="kottayam">Kottayam (കോട്ടയം)</option>
          <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
          <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
          <option value="kozhikode">Kozhikode (കോഴിക്കോട്)</option>
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((carpenter) => (
          <div
            key={carpenter.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{carpenter.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-forest-700 flex-shrink-0" />
                    <span>{carpenter.locality}, {carpenter.district}</span>
                  </div>
                </div>

                {carpenter.is_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-[11px] font-semibold">
                    <CheckCircle className="w-3.5 h-3.5 text-forest-600" />
                    Verified
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-1 font-semibold text-amber-600">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{carpenter.rating}</span>
                  <span className="text-slate-400 font-normal">({carpenter.rating_count})</span>
                </div>
                <div>·</div>
                <div>
                  <strong>{carpenter.experience_yrs}</strong> {lang === 'en' ? 'years exp.' : 'വർഷത്തെ പരിചയം'}
                </div>
              </div>

              {/* Specializations */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {carpenter.specializations.map((spec, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">{carpenter.phone}</span>
              <a
                href={`tel:${carpenter.phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Contact' : 'വിളിക്കുക'}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
