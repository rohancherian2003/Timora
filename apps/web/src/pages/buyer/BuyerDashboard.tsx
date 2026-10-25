import React, { useState } from 'react';
import { ShoppingBag, MessageSquare, Heart, Clock, CheckCircle2, ChevronRight, Trees, User, MapPin } from 'lucide-react';
import { formatINR } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';

const DEMO_BUYER_ORDERS = [
  {
    id: 'ord-101',
    listing_title: 'First-Grade Nilambur Teak Planks',
    species: 'Teak (തേക്ക്)',
    seller_name: 'Nilambur Wood Works',
    agreed_qty: 15,
    unit: 'CFT',
    agreed_price: 42000,
    status: 'delivered_pending', // waiting for buyer confirmation
    ordered_at: '2026-10-24',
  },
  {
    id: 'ord-102',
    listing_title: 'Anjili Wild Jack Sawn Beams',
    species: 'Anjili (ആഞ്ഞിലി)',
    seller_name: 'Perumbavoor Saw Mills',
    agreed_qty: 30,
    unit: 'CFT',
    agreed_price: 42000,
    status: 'completed',
    ordered_at: '2026-10-18',
  },
];

const DEMO_SAVED_LISTINGS = [
  {
    id: 'fav-1',
    title: 'Seasoned African Mahogany Squared Beams',
    price_per_cft: 1850,
    district: 'Kottayam (കോട്ടയം)',
    species: 'Mahogany (മഹാഗണി)',
  },
];

export function BuyerDashboard({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'enquiries' | 'wishlist'>('orders');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Bar */}
      <div className="p-6 sm:p-8 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] rounded-3xl border border-[#ebd5bc] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#b45309] text-white uppercase tracking-wider">
            {lang === 'en' ? 'Verified Buyer Account' : 'ഉപഭോക്തൃ പ്രൊഫൈൽ'}
          </span>
          <span className="text-xs text-[#78350f] font-mono font-medium">+91 {user?.phone || '9847987654'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#2c160b]">
          {lang === 'en' ? `Welcome, ${user?.name || 'Timber Buyer'}` : `സ്വാഗതം, ${user?.name || 'ഉപഭോക്താവ്'}`}
        </h1>
        <p className="text-xs sm:text-sm text-[#6b472e] mt-1 font-medium">
          {lang === 'en'
            ? 'Track your ongoing timber orders, negotiate enquiries, and view saved stock.'
            : 'നിങ്ങളുടെ തടി ഓർഡറുകൾ, അന്വേഷണങ്ങൾ, സേവ് ചെയ്ത തടികൾ എന്നിവ ഇവിടെ കാണാം.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-amber-200/80 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {lang === 'en' ? 'My Timber Orders' : 'എന്റെ ഓർഡറുകൾ'}
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {lang === 'en' ? 'Active Enquiries' : 'അന്വേഷണങ്ങൾ'}
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'wishlist'
              ? 'border-[#b45309] text-[#b45309] font-bold'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Heart className="w-4 h-4" />
          {lang === 'en' ? 'Saved Wishlist' : 'സേവ് ചെയ്തവ'}
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {DEMO_BUYER_ORDERS.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-xs hover:border-amber-400 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold font-serif text-[#2c160b] text-base">{order.listing_title}</h3>
                  <span className="text-xs text-stone-400 font-mono">({order.id})</span>
                </div>
                <div className="text-xs text-stone-600 mt-1 font-medium">
                  {lang === 'en' ? 'Seller:' : 'വിൽക്കുന്നയാൾ:'} {order.seller_name} · {order.agreed_qty} {order.unit} · {formatINR(order.agreed_price)}
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">
                  Ordered on {order.ordered_at}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {order.status === 'delivered_pending' ? (
                  <button className="px-4 py-2.5 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold shadow-sm transition">
                    {lang === 'en' ? 'Confirm Delivery Received' : 'ഡെലിവറി ലഭിച്ചതായി സ്ഥിരീകരിക്കുക'}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {lang === 'en' ? 'Completed & Delivered' : 'പൂർത്തിയായി'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Enquiries Tab */}
      {activeTab === 'enquiries' && (
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 shadow-sm text-center py-12 space-y-3">
          <MessageSquare className="w-8 h-8 text-amber-300 mx-auto" />
          <h3 className="font-bold text-[#6b472e] text-sm">
            {lang === 'en' ? 'No active price negotiations right now' : 'നിലവിൽ സജീവമായ ചർച്ചകൾ ഒന്നുമില്ല'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {lang === 'en'
              ? 'Visit the marketplace to discover timber stock and enquire with merchants directly.'
              : 'മാർക്കറ്റ് സന്ദർശിച്ച് തടികളെക്കുറിച്ച് കച്ചവടക്കാരുമായി നേരിട്ട് ബന്ധപ്പെടുക.'}
          </p>
        </div>
      )}

      {/* Wishlist Tab */}
      {activeTab === 'wishlist' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {DEMO_SAVED_LISTINGS.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-amber-200/80 shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-[#b45309] tracking-wider">
                {item.species}
              </span>
              <h4 className="font-serif font-bold text-[#2c160b] text-sm">{item.title}</h4>
              <div className="text-xs text-stone-500">{item.district}</div>
              <div className="pt-2 font-black text-[#78350f] text-base">
                {formatINR(item.price_per_cft)} / CFT
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
