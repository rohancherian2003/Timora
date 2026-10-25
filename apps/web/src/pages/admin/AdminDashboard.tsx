import React, { useState } from 'react';
import { ShieldCheck, UserCheck, PackageCheck, FileText, Check, X, AlertTriangle } from 'lucide-react';
import { formatINR } from '@timora/shared';

const DEMO_PENDING_SELLERS = [
  {
    id: 'sel-1',
    name: 'M. V. Varghese',
    phone: '+919847120001',
    business_name: 'Varghese Timber Depot',
    district: 'Kottayam (കോട്ടയം)',
    locality: 'Ettumanoor',
    registered_at: '2026-10-25 14:30',
  },
];

const DEMO_PENDING_LISTINGS = [
  {
    id: 'lst-101',
    title: 'Aanjili Wild Jack Squared Beams (Heavy Joinery)',
    seller_name: 'Perumbavoor Saw Mills',
    species: 'Anjili (ആഞ്ഞിലി)',
    district: 'Ernakulam (എറണാകുളം)',
    quantity: 80,
    unit: 'CFT',
    price_per_cft: 1400,
    image_count: 3,
    submitted_at: '2026-10-25 16:15',
  },
];

export function AdminDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [activeTab, setActiveTab] = useState<'sellers' | 'listings' | 'audit'>('sellers');
  const [sellers, setSellers] = useState(DEMO_PENDING_SELLERS);
  const [listings, setListings] = useState(DEMO_PENDING_LISTINGS);
  const [message, setMessage] = useState<string | null>(null);

  const handleApproveSeller = (id: string) => {
    setSellers((prev) => prev.filter((s) => s.id !== id));
    setMessage(lang === 'en' ? 'Seller approved successfully!' : 'കച്ചവടക്കാരനെ വിജയകരമായി അംഗീകരിച്ചു!');
  };

  const handleRejectSeller = (id: string) => {
    setSellers((prev) => prev.filter((s) => s.id !== id));
    setMessage(lang === 'en' ? 'Seller registration rejected.' : 'കച്ചവടക്കാരന്റെ അപേക്ഷ നിരസിച്ചു.');
  };

  const handleApproveListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setMessage(lang === 'en' ? 'Timber listing approved and published to marketplace.' : 'തടി ലിസ്റ്റിംഗ് അംഗീകരിച്ച് വിപണിയിൽ പ്രസിദ്ധീകരിച്ചു.');
  };

  const handleRejectListing = (id: string) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    setMessage(lang === 'en' ? 'Listing rejected with recorded reason.' : 'ലിസ്റ്റിംഗ് കാരണം രേഖപ്പെടുത്തി നിരസിച്ചു.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="w-8 h-8 text-forest-700" />
            {lang === 'en' ? 'Super Admin Moderation Suite' : 'സൂപ്പർ അഡ്മിൻ കൺട്രോൾ പാനൽ'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {lang === 'en'
              ? 'Approve timber merchant accounts, review actual stock photos, and inspect append-only audit trails.'
              : 'കച്ചവടക്കാരുടെ അക്കൗണ്ടുകൾ, തടികളുടെ ഫോട്ടോകൾ എന്നിവ പരിശോധിച്ച് അംഗീകരിക്കുക.'}
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-mono font-bold">
          ADMIN CONSOLE
        </span>
      </div>

      {message && (
        <div className="p-3 bg-forest-50 border border-forest-200 text-forest-900 rounded-xl text-xs font-semibold flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('sellers')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'sellers'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          {lang === 'en' ? 'Pending Sellers' : 'കച്ചവടക്കാരുടെ അപേക്ഷകൾ'} ({sellers.length})
        </button>

        <button
          onClick={() => setActiveTab('listings')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'listings'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          {lang === 'en' ? 'Listing Moderation Queue' : 'തടി അനുമതി ക്യൂ'} ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'audit'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          {lang === 'en' ? 'Audit Logs (Append-Only)' : 'ഓഡിറ്റ് ലോഗുകൾ'}
        </button>
      </div>

      {/* Sellers Queue */}
      {activeTab === 'sellers' && (
        <div className="space-y-4">
          {sellers.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              {lang === 'en' ? 'No pending seller onboarding requests.' : 'പുതിയ അപേക്ഷകൾ ഒന്നും ബാക്കിയില്ല.'}
            </div>
          ) : (
            sellers.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{s.business_name}</h3>
                  <div className="text-xs text-slate-600 mt-1">
                    Contact: {s.name} ({s.phone}) · {s.locality}, {s.district}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Applied: {s.registered_at}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveSeller(s.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Approve Seller' : 'അംഗീകരിക്കുക'}
                  </button>
                  <button
                    onClick={() => handleRejectSeller(s.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Reject' : 'നിരസിക്കുക'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Listings Queue */}
      {activeTab === 'listings' && (
        <div className="space-y-4">
          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              {lang === 'en' ? 'All submitted timber stock has been moderated.' : 'എല്ലാ തടികളും പരിശോധിച്ചു കഴിഞ്ഞു.'}
            </div>
          ) : (
            listings.map((l) => (
              <div
                key={l.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700">
                    {l.species} · {l.image_count} Photos Attached
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-0.5">{l.title}</h3>
                  <div className="text-xs text-slate-600 mt-1">
                    Seller: {l.seller_name} · {l.quantity} {l.unit} · {formatINR(l.price_per_cft)} / CFT
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Submitted: {l.submitted_at}</div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveListing(l.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Approve & Publish' : 'അംഗീകരിച്ച് പ്രസിദ്ധീകരിക്കുക'}
                  </button>
                  <button
                    onClick={() => handleRejectListing(l.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Reject with Reason' : 'കാരണം കാണിച്ച് നിരസിക്കുക'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3 font-mono text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-slate-800 font-bold">[APPROVE_SELLER] Nilambur Wood Works (seller_profile)</span>
            <span className="text-slate-400">Actor: Admin (Super) · 2026-10-25 15:10</span>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <span className="text-slate-800 font-bold">[APPROVE_LISTING] First-Grade Nilambur Teak Planks (timber_listing)</span>
            <span className="text-slate-400">Actor: Admin (Super) · 2026-10-25 15:12</span>
          </div>
        </div>
      )}
    </div>
  );
}
