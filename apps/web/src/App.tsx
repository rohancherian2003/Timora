import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Trees, Calculator, Hammer, Globe, LayoutDashboard, Shield, ShoppingBag, Store, Truck } from 'lucide-react';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { ListingDetailPage } from './pages/public/ListingDetailPage';
import { CalculatorPage } from './pages/public/CalculatorPage';
import { TransportPage } from './pages/public/TransportPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CarpenterDirectoryPage } from './pages/carpenter/CarpenterDirectoryPage';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

function MobileBottomNav({ lang }: { lang: 'en' | 'ml' }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/' && (currentPath === '/' || currentPath === '/marketplace')) return true;
    return currentPath === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg pb-safe">
      <Link
        to="/marketplace"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/') ? 'text-forest-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Market' : 'മാർക്കറ്റ്'}</span>
      </Link>

      <Link
        to="/calculator"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/calculator') ? 'text-forest-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Calculator className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Calculator' : 'കണക്ക്'}</span>
      </Link>

      <Link
        to="/carpenters"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/carpenters') ? 'text-forest-700 font-bold' : 'text-slate-500'
        }`}
      >
        <Hammer className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Carpenters' : 'തച്ചൻ'}</span>
      </Link>

      <Link
        to="/dashboard/buyer"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/dashboard/buyer') ? 'text-forest-700 font-bold' : 'text-slate-500'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Orders' : 'ഓർഡർ'}</span>
      </Link>

      <Link
        to="/dashboard/seller"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/dashboard/seller') ? 'text-forest-700 font-bold' : 'text-slate-500'
        }`}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Seller' : 'കച്ചവടം'}</span>
      </Link>
    </nav>
  );
}

export function App() {
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50 pb-16 md:pb-0" lang={lang}>
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm">
                <Trees className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">TIMORA</span>
                <span className="block text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-forest-700">
                  {lang === 'en' ? 'Timber Marketplace' : 'തടി മാർക്കറ്റ്'}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link to="/marketplace" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്'}
              </Link>
              <Link to="/calculator" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'CFT Calculator' : 'തടി കാൽക്കുലേറ്റർ'}
              </Link>
              <Link to="/carpenters" className="hover:text-forest-700 transition flex items-center gap-1.5">
                <Hammer className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}
              </Link>
              <Link to="/transport" className="hover:text-forest-700 transition flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Transport' : 'ലോറികൾ'}
              </Link>
              <Link to="/dashboard/buyer" className="hover:text-forest-700 transition flex items-center gap-1.5 text-slate-700">
                <ShoppingBag className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Orders' : 'ഓർഡറുകൾ'}
              </Link>
              <Link to="/dashboard/seller" className="hover:text-forest-700 transition flex items-center gap-1.5 text-forest-800 font-semibold">
                <LayoutDashboard className="w-3.5 h-3.5" />
                {lang === 'en' ? 'Seller Hub' : 'കച്ചവട ഹബ്'}
              </Link>
              <Link to="/admin" className="hover:text-slate-900 transition flex items-center gap-1 text-slate-400 font-mono text-xs">
                <Shield className="w-3 h-3 text-forest-700" />
                Admin
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'മലയാളം' : 'EN'}</span>
              </button>
              <Link
                to="/login"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg bg-forest-700 hover:bg-forest-800 text-white shadow-sm transition"
              >
                {lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<MarketplacePage lang={lang} />} />
            <Route path="/marketplace" element={<MarketplacePage lang={lang} />} />
            <Route path="/listings/:id" element={<ListingDetailPage lang={lang} />} />
            <Route path="/calculator" element={<CalculatorPage lang={lang} />} />
            <Route path="/transport" element={<TransportPage lang={lang} />} />
            <Route path="/carpenters" element={<CarpenterDirectoryPage lang={lang} />} />
            <Route path="/dashboard/seller" element={<SellerDashboard lang={lang} />} />
            <Route path="/dashboard/buyer" element={<BuyerDashboard lang={lang} />} />
            <Route path="/admin" element={<AdminDashboard lang={lang} />} />
            <Route path="/login" element={<LoginPage lang={lang} />} />
            <Route path="/register" element={<RegisterPage lang={lang} />} />
          </Routes>
        </main>

        {/* App-Style Mobile Bottom Navigation Bar */}
        <MobileBottomNav lang={lang} />

        {/* Desktop Footer */}
        <footer className="hidden md:block border-t border-slate-200 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Timora — Smart Timber Marketplace Kerala. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
