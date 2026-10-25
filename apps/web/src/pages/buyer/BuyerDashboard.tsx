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
      <div className="p-6 bg-gradient-to-r from-forest-900/10 via-stone-50 to-white rounded-3xl border border-forest-200/60 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-forest-700 text-white uppercase tracking-wider">
            {lang === 'en' ? 'Verified Buyer Account' : 'ഉപഭോക്തൃ പ്രൊഫൈൽ'}
          </span>
          <span className="text-xs text-stone-500 font-medium">+91 {user?.phone || '9847987654'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900">
          {lang === 'en' ? `Welcome, ${user?.name || 'Timber Buyer'}` : `സ്വാഗതം, ${user?.name || 'ഉപഭോക്താവ്'}`}
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          {lang === 'en'
            ? 'Track your ongoing timber orders, negotiate enquiries, and view saved stock.'
            : 'നിങ്ങളുടെ തടി ഓർഡറുകൾ, അന്വേഷണങ്ങൾ, സേവ് ചെയ്ത തടികൾ എന്നിവ ഇവിടെ കാണാം.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'orders'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          {lang === 'en' ? 'My Timber Orders' : 'എന്റെ ഓർഡറുകൾ'}
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'enquiries'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {lang === 'en' ? 'Active Enquiries' : 'അന്വേഷണങ്ങൾ'}
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'wishlist'
              ? 'border-forest-700 text-forest-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
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
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{order.listing_title}</h3>
                  <span className="text-xs text-slate-400 font-mono">({order.id})</span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {lang === 'en' ? 'Seller:' : 'വിൽക്കുന്നയാൾ:'} {order.seller_name} · {order.agreed_qty} {order.unit} · {formatINR(order.agreed_price)}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Ordered on {order.ordered_at}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {order.status === 'delivered_pending' ? (
                  <button className="px-4 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold shadow-sm transition">
                    {lang === 'en' ? 'Confirm Delivery Received' : 'ഡെലിവറി ലഭിച്ചതായി സ്ഥിരീകരിക്കുക'}
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" />
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
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm text-center py-12 space-y-3">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">
            {lang === 'en' ? 'No active price negotiations right now' : 'നിലവിൽ സജീവമായ ചർച്ചകൾ ഒന്നുമില്ല'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
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
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <span className="text-[10px] uppercase font-bold text-forest-700 tracking-wider">
                {item.species}
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
              <div className="text-xs text-slate-500">{item.district}</div>
              <div className="pt-2 font-black text-forest-900 text-base">
                {formatINR(item.price_per_cft)} / CFT
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
