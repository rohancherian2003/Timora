import React, { useState } from 'react';
import { Package, Plus, Clock, CheckCircle2, AlertCircle, ArrowUpRight, Store, MapPin, Phone } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';

export function SellerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [speciesId, setSpeciesId] = useState(1); // Teak
  const [typeId, setTypeId] = useState(2); // Planks
  const [districtId, setDistrictId] = useState(5); // Kottayam
  const [quantity, setQuantity] = useState(25);
  const [pricePerCft, setPricePerCft] = useState(2400);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowAddForm(false);
      setSubmitted(false);
      setTitle('');
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] rounded-3xl border border-[#ebd5bc] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b45309] text-white uppercase tracking-wider">
              {lang === 'en' ? 'Verified Timber Depot' : 'അംഗീകൃത തടി ഡിപ്പോ'}
            </span>
            <span className="text-xs text-[#78350f] font-mono font-medium">ID: {user?.id || 'usr-seller-01'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#2c160b]">
            {user?.businessName || user?.name || (lang === 'en' ? 'Seller Management Dashboard' : 'തടിക്കച്ചവട ഡാഷ്‌ബോർഡ്')}
          </h1>
          <p className="text-xs sm:text-sm text-[#6b472e] mt-1 flex items-center gap-2 font-medium">
            <span>{lang === 'en' ? 'Contact: +91' : 'ഫോൺ: +91'}{user?.phone || '9847120001'}</span>
            <span>•</span>
            <span>{user?.district || (lang === 'en' ? 'Kerala' : 'കേരളം')}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#b45309] hover:bg-[#92400e] text-white text-sm font-bold shadow-md shadow-amber-950/10 transition"
        >
          <Plus className="w-4 h-4" />
          {lang === 'en' ? 'Post New Timber Stock' : 'പുതിയ തടി ചേർക്കുക'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Live Active Stock' : 'ലഭ്യമായ സ്റ്റോക്ക്'}
            </span>
            <div className="text-2xl font-black text-[#2c160b] font-serif mt-1">
              125 <span className="text-sm font-sans font-semibold text-[#854d0e]">CFT</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#b45309] flex items-center justify-center border border-amber-200/60">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Awaiting Admin Review' : 'റിവ്യൂവിലുള്ളവ'}
            </span>
            <div className="text-2xl font-black text-[#b45309] font-serif mt-1">
              2 <span className="text-sm font-sans font-semibold text-stone-500">Listings</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#faf6ee] text-[#b45309] flex items-center justify-center border border-amber-200/60">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Active Enquiries' : 'ലഭിച്ച അന്വേഷണങ്ങൾ'}
            </span>
            <div className="text-2xl font-black text-[#2c160b] font-serif mt-1">
              5 <span className="text-sm font-sans font-semibold text-stone-500">Open</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* New Listing Modal / Form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-amber-300/80 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-extrabold font-serif text-[#2c160b]">
              {lang === 'en' ? 'Submit Timber Stock for Approval' : 'പുതിയ തടി അനുമതിക്കായി സമർപ്പിക്കുക'}
            </h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-xs text-stone-400 hover:text-stone-600 font-semibold"
            >
              ✕ Close
            </button>
          </div>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-900 space-y-1">
              <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-700" />
              <div className="font-bold text-sm">
                {lang === 'en' ? 'Submitted for Admin Review!' : 'അഡ്മിൻ അനുമതിക്കായി സമർപ്പിച്ചു!'}
              </div>
              <p className="text-xs text-emerald-700">
                {lang === 'en' ? 'Once approved, your stock will be visible to buyers.' : 'അംഗീകരിച്ചു കഴിഞ്ഞാൽ ഉടൻ ഉപഭോക്താക്കൾക്ക് ദൃശ്യമാകും.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {lang === 'en' ? 'Stock Title' : 'തടിയുടെ പേര് / വിവരണം'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. First-Grade Teak Planks 10ft"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Species' : 'തടി ഇനം'}
                  </label>
                  <select
                    value={speciesId}
                    onChange={(e) => setSpeciesId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value={1}>Teak (തേക്ക്)</option>
                    <option value={2}>Mahogany (മഹാഗണി)</option>
                    <option value={3}>Anjili (ആഞ്ഞിലി)</option>
                    <option value={4}>Rubberwood (റബർ)</option>
                    <option value={5}>Mango Wood (മാവ്)</option>
                    <option value={6}>Jackfruit (പ്ലാവ്)</option>
                    <option value={7}>Rosewood (ഇടപ്പിലി)</option>
                    <option value={8}>Coconut (തെങ്ങ്)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Timber Type' : 'തടി രൂപം'}
                  </label>
                  <select
                    value={typeId}
                    onChange={(e) => setTypeId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value={1}>Round Logs (ലോഗ്സ്)</option>
                    <option value={2}>Rough-sawn Planks (പലക)</option>
                    <option value={3}>Squared Beams (തൂൺ)</option>
                    <option value={4}>Firewood (വിറക്)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'District' : 'ജില്ല'}
                  </label>
                  <select
                    value={districtId}
                    onChange={(e) => setDistrictId(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border rounded-xl text-sm bg-white"
                  >
                    <option value={5}>Kottayam (കോട്ടയം)</option>
                    <option value={7}>Ernakulam (എറണാകുളം)</option>
                    <option value={8}>Thrissur (തൃശ്ശൂർ)</option>
                    <option value={10}>Malappuram (മലപ്പുറം)</option>
                    <option value={11}>Kozhikode (കോഴിക്കോട്)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Quantity (CFT)' : 'അളവ് (CFT)'}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                    min={1}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
                  </label>
                  <input
                    type="number"
                    value={pricePerCft}
                    onChange={(e) => setPricePerCft(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border rounded-xl text-sm"
                    min={1}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition"
              >
                {lang === 'en' ? 'Submit Listing for Approval' : 'അംഗീകാരത്തിനായി ലിസ്റ്റിംഗ് സമർപ്പിക്കുക'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Current Stock Table */}
      <div className="bg-white rounded-3xl border border-amber-200/80 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-amber-100 flex items-center justify-between">
          <h3 className="font-extrabold font-serif text-[#2c160b] text-base">
            {lang === 'en' ? 'My Timber Stock Inventory' : 'എന്റെ തടി സ്റ്റോക്കുകൾ'}
          </h3>
          <span className="text-xs text-[#854d0e] font-semibold">1 Active · 1 Pending Review</span>
        </div>

        <div className="divide-y divide-amber-100 text-xs sm:text-sm">
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf6ee]/50">
            <div>
              <div className="font-bold text-[#2c160b]">First-Grade Nilambur Teak Planks</div>
              <div className="text-xs text-stone-500 mt-0.5">Teak · Rough-sawn Planks · Kottayam</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-[#78350f]">45 CFT @ ₹2,800/CFT</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                Approved (ലൈവ്)
              </span>
            </div>
          </div>

          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf6ee]/50">
            <div>
              <div className="font-bold text-[#2c160b]">Aanjili Wild Jack Beams</div>
              <div className="text-xs text-stone-500 mt-0.5">Anjili · Squared Beams · Kottayam</div>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-stone-700">80 CFT @ ₹1,400/CFT</span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
                Pending Review (പരിശോധനയിൽ)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
