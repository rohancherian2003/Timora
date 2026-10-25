import React, { useState } from 'react';
import { Truck, MapPin, Phone, ShieldCheck, ArrowRight } from 'lucide-react';

const DEMO_TRANSPORTERS = [
  {
    id: 't1',
    name: 'Malabar Timber Carriers & Logistics',
    phone: '+919447100001',
    service_areas: ['Kozhikode', 'Malappuram', 'Kannur', 'Wayanad'],
    vehicle_types: 'Crane-Mounted Multi-Axle Trucks (ലോഗ്സ് കയറ്റാൻ ക്രെയിൻ ഉള്ളവ)',
    notes: 'Specialists in heavy round log transit and timber yard inter-district hauling.',
  },
  {
    id: 't2',
    name: 'Travancore Wood Movers',
    phone: '+919447200002',
    service_areas: ['Ernakulam', 'Kottayam', 'Alappuzha', 'Idukki'],
    vehicle_types: 'Covered Sawn Plank Carriers (അറുത്ത പലകകൾ സുരക്ഷിതമായി എത്തിക്കാൻ)',
    notes: 'Equipped with transit permits for inter-district raw timber transit.',
  },
  {
    id: 't3',
    name: 'Highland Timber Freight Services',
    phone: '+919447300003',
    service_areas: ['Palakkad', 'Thrissur', 'Ernakulam'],
    vehicle_types: '10-Wheel Heavy Flatbed Trucks',
    notes: 'Bulk transportation for squared construction beams and roofing rafters.',
  },
];

export function TransportPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
          <Truck className="w-8 h-8 text-forest-700" />
          {lang === 'en' ? 'Kerala Timber Transport Directory' : 'തടി ട്രാൻസ്പോർട്ട് ഡയറക്ടറി'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          {lang === 'en'
            ? 'Verified timber haulage trucks and crane carriers for transporting logs and sawn planks across Kerala.'
            : 'തടികളും പലകകളും കൊണ്ടുപോകുന്നതിനുള്ള ക്രെയിൻ ഘടിപ്പിച്ച ഹെവി വാഹനങ്ങൾ.'}
        </p>
      </div>

      {/* Transporter Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DEMO_TRANSPORTERS.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">{t.name}</h3>
                <span className="p-1 rounded-lg bg-forest-50 text-forest-700">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>

              <div className="mt-2 text-xs font-semibold text-forest-800">
                {t.vehicle_types}
              </div>

              <div className="mt-3 text-xs text-slate-600 leading-relaxed">
                {t.notes}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'en' ? 'Service Districts' : 'സർവീസ് ഏരിയകൾ'}
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {t.service_areas.map((dist, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                      {dist}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-500">{t.phone}</span>
              <a
                href={`tel:${t.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition"
              >
                <Phone className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Call Carrier' : 'വിളിക്കുക'}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
