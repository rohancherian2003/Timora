import React, { useState } from 'react';
import { Truck, MapPin, Phone, ShieldCheck, ArrowRight, CheckCircle2, Clock, Navigation } from 'lucide-react';

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

export function TransportPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');

  const filtered = DEMO_TRANSPORTERS.filter((t) => {
    if (selectedDistrict === 'all') return true;
    return t.service_areas.some((area) => area.toLowerCase().includes(selectedDistrict.toLowerCase()));
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] text-[#4A3626] rounded-3xl shadow-md border border-[#c4bdb0]">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30">
            <Truck className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Kerala Timber Haulage Network' : 'കേരള തടി ട്രാൻസ്പോർട്ട് നെറ്റ്‌വർക്ക്'}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif text-[#4A3626]">
            {lang === 'en' ? 'Timber Transit & Crane Carrier Lorries' : 'തടി കൊണ്ടുപോകുന്ന ലോറികൾ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] leading-relaxed max-w-2xl font-medium">
            {lang === 'en'
              ? 'Find verified crane-equipped lorries, heavy flatbeds, and covered carriers for safe raw timber transit across all 14 Kerala districts.'
              : 'ഉരുണ്ട തടികൾ കയറ്റാൻ ഹൈഡ്രോളിക് ക്രെയിൻ ഉള്ള ഹെവി വാഹനങ്ങളും, പലകകൾ മഴ നനയാതെ എത്തിക്കാനുള്ള വാഹനങ്ങളും.'}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-300/80 shadow-xs flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#5B6147]" />
          <span className="text-xs font-bold text-stone-700">
            {lang === 'en' ? 'Filter by District:' : 'ജില്ല തിരിച്ച്:'}
          </span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 border border-stone-300/80 rounded-xl text-stone-800 font-semibold text-xs bg-[#E7E1D6]/50 focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
          >
            <option value="all">{lang === 'en' ? 'All Districts' : 'എല്ലാ ജില്ലകളും'}</option>
            <option value="kottayam">Kottayam (കോട്ടയം)</option>
            <option value="malappuram">Malappuram (മലപ്പുറം)</option>
            <option value="ernakulam">Ernakulam (എറണാകുളം)</option>
            <option value="kozhikode">Kozhikode (കോഴിക്കോട്)</option>
            <option value="palakkad">Palakkad (പാലക്കാട്)</option>
            <option value="thrissur">Thrissur (തൃശ്ശൂർ)</option>
            <option value="wayanad">Wayanad (വയനാട്)</option>
          </select>
        </div>

        <span className="text-xs font-semibold text-stone-500">
          {filtered.length} {lang === 'en' ? 'Carriers Available' : 'ലോറികൾ ലഭ്യമാണ്'}
        </span>
      </div>

      {/* Transporter Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-3xl border border-stone-300/80 p-6 shadow-xs hover:border-stone-400 hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-[#4A3626] text-lg group-hover:text-[#5B6147] transition font-serif">
                    {t.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-[#4A3626] border border-stone-300 text-[10px] font-bold">
                      {t.capacity}
                    </span>
                    {t.verified && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{lang === 'en' ? 'Verified Hauler' : 'പരിശോധിച്ചുറപ്പിച്ചത്'}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 p-3 rounded-2xl bg-[#E7E1D6] border border-stone-300/80 text-xs font-bold text-[#4A3626]">
                {t.vehicle_types}
              </div>

              <p className="mt-3 text-xs text-stone-600 leading-relaxed font-normal">
                {t.notes}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-200">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  {lang === 'en' ? 'Active Transit Routes' : 'സർവീസ് റൂട്ടുകൾ'}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {t.service_areas.map((dist, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#fbf7f0] text-[#4A3626] border border-stone-300/60 text-xs font-semibold"
                    >
                      {dist}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-stone-400 uppercase">
                  {lang === 'en' ? 'Direct Contact' : 'നേരിട്ടുള്ള ഫോൺ'}
                </span>
                <span className="font-mono text-xs font-bold text-stone-900">{t.phone}</span>
              </div>
              <a
                href={`tel:${t.phone}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white text-xs font-bold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Call Carrier' : 'വിളിക്കുക'}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
