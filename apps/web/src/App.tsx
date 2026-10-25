import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Calculator,
  Hammer,
  Globe,
  LayoutDashboard,
  Shield,
  ShoppingBag,
  Store,
  Truck,
  LogOut,
  User,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { BrandLogo } from './components/BrandLogo';
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

// Protected Route Guard
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If buyer tries to view seller or vice-versa, redirect to their role home
    if (user.role === 'seller') return <Navigate to="/dashboard/seller" replace />;
    if (user.role === 'buyer') return <Navigate to="/dashboard/buyer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

// Role-Aware Mobile Bottom Nav
function MobileBottomNav({ lang }: { lang: 'en' | 'ml' }) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, isAuthenticated } = useAuth();

  const isActive = (path: string) => {
    if (path === '/' && (currentPath === '/' || currentPath === '/marketplace')) return true;
    return currentPath === path;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-stone-200 px-2 py-1.5 flex items-center justify-around shadow-lg pb-safe">
      <Link
        to="/marketplace"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/') ? 'text-forest-800 font-bold' : 'text-stone-500'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Market' : 'മാർക്കറ്റ്'}</span>
      </Link>

      <Link
        to="/calculator"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/calculator') ? 'text-forest-800 font-bold' : 'text-stone-500'
        }`}
      >
        <Calculator className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Calculator' : 'കണക്ക്'}</span>
      </Link>

      <Link
        to="/carpenters"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/carpenters') ? 'text-forest-800 font-bold' : 'text-stone-500'
        }`}
      >
        <Hammer className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Carpenters' : 'തച്ചൻ'}</span>
      </Link>

      {/* Conditional 4th link based on Auth Role */}
      {isAuthenticated && user?.role === 'buyer' && (
        <Link
          to="/dashboard/buyer"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/dashboard/buyer') ? 'text-forest-800 font-bold' : 'text-stone-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Orders' : 'ഓർഡർ'}</span>
        </Link>
      )}

      {isAuthenticated && user?.role === 'seller' && (
        <Link
          to="/dashboard/seller"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/dashboard/seller') ? 'text-amber-800 font-bold' : 'text-stone-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Hub' : 'കച്ചവടം'}</span>
        </Link>
      )}

      {isAuthenticated && user?.role === 'admin' && (
        <Link
          to="/admin"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/admin') ? 'text-slate-900 font-bold' : 'text-stone-500'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Admin</span>
        </Link>
      )}

      {!isAuthenticated && (
        <Link
          to="/transport"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/transport') ? 'text-forest-800 font-bold' : 'text-stone-500'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Transport' : 'ലോറി'}</span>
        </Link>
      )}

      {/* 5th Action: Login or Account */}
      {isAuthenticated ? (
        <Link
          to={user?.role === 'seller' ? '/dashboard/seller' : user?.role === 'admin' ? '/admin' : '/dashboard/buyer'}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-forest-800"
        >
          <div className="w-5 h-5 rounded-full bg-forest-100 flex items-center justify-center text-[10px] font-bold text-forest-900 ring-1 ring-forest-600">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">{lang === 'en' ? 'Account' : 'പ്രൊഫൈൽ'}</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-forest-800 font-semibold"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}</span>
        </Link>
      )}
    </nav>
  );
}

// User Menu Component for Top Header
function UserNavMenu({ lang }: { lang: 'en' | 'ml' }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'seller':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 text-amber-900 border border-amber-300">
            {lang === 'en' ? 'Seller Depot' : 'കച്ചവടക്കാരൻ'}
          </span>
        );
      case 'admin':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-stone-800 text-white border border-stone-700">
            {lang === 'en' ? 'Super Admin' : 'അഡ്മിൻ'}
          </span>
        );
      case 'buyer':
      default:
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
            {lang === 'en' ? 'Timber Buyer' : 'ഉപഭോക്താവ്'}
          </span>
        );
    }
  };

  const getDashboardLink = () => {
    switch (user.role) {
      case 'seller':
        return '/dashboard/seller';
      case 'admin':
        return '/admin';
      case 'buyer':
      default:
        return '/dashboard/buyer';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 shadow-sm transition"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-forest-700 to-forest-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
          {user.name[0] || 'U'}
        </div>
        <div className="hidden lg:flex flex-col items-start text-left">
          <span className="text-xs font-bold text-stone-900 line-clamp-1">{user.name}</span>
          <span className="text-[10px] text-stone-500 font-medium leading-none">{user.phone}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-fadeIn space-y-2">
            <div className="p-2 border-b border-stone-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-stone-900">{user.name}</span>
                {getRoleBadge()}
              </div>
              {user.businessName && (
                <p className="text-[11px] text-stone-600 line-clamp-1">{user.businessName}</p>
              )}
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">+91 {user.phone}</p>
            </div>

            <div className="space-y-0.5">
              <Link
                to={getDashboardLink()}
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-stone-50 rounded-xl transition"
              >
                <LayoutDashboard className="w-4 h-4 text-forest-700" />
                <span>{lang === 'en' ? 'My Dashboard' : 'എന്റെ ഡാഷ്‌ബോർഡ്'}</span>
              </Link>

              {user.role === 'buyer' && (
                <Link
                  to="/dashboard/buyer"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-forest-900 hover:bg-stone-50 rounded-xl transition"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'en' ? 'Orders & Negotiations' : 'ഓർഡറുകൾ'}</span>
                </Link>
              )}

              {user.role === 'seller' && (
                <Link
                  to="/dashboard/seller"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-amber-900 hover:bg-amber-50/50 rounded-xl transition"
                >
                  <Store className="w-4 h-4 text-amber-700" />
                  <span>{lang === 'en' ? 'Depot Stock Manager' : 'സ്റ്റോക്ക് മാനേജർ'}</span>
                </Link>
              )}

              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
                >
                  <Shield className="w-4 h-4 text-stone-800" />
                  <span>{lang === 'en' ? 'Admin Moderation Console' : 'അഡ്മിൻ കൺസോൾ'}</span>
                </Link>
              )}
            </div>

            <div className="pt-1 border-t border-stone-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'en' ? 'Sign Out' : 'ലോഗ് ഔട്ട്'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Main Navigation Header
function AppHeader({ lang, toggleLanguage }: { lang: 'en' | 'ml'; toggleLanguage: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/marketplace' && (location.pathname === '/' || location.pathname === '/marketplace')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo with Gold/Emerald Seal */}
        <Link to="/" className="group flex items-center">
          <BrandLogo size="md" lang={lang} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600">
          <Link
            to="/marketplace"
            className={`transition pb-1 border-b-2 ${
              isCurrent('/marketplace')
                ? 'text-forest-800 border-forest-700 font-bold'
                : 'border-transparent hover:text-forest-700'
            }`}
          >
            {lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്'}
          </Link>

          <Link
            to="/calculator"
            className={`transition pb-1 border-b-2 flex items-center gap-1.5 ${
              isCurrent('/calculator')
                ? 'text-forest-800 border-forest-700 font-bold'
                : 'border-transparent hover:text-forest-700'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-forest-700" />
            <span>{lang === 'en' ? 'CFT Calculator' : 'തടി കാൽക്കുലേറ്റർ'}</span>
          </Link>

          <Link
            to="/carpenters"
            className={`transition pb-1 border-b-2 flex items-center gap-1.5 ${
              isCurrent('/carpenters')
                ? 'text-forest-800 border-forest-700 font-bold'
                : 'border-transparent hover:text-forest-700'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-stone-500" />
            <span>{lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}</span>
          </Link>

          <Link
            to="/transport"
            className={`transition pb-1 border-b-2 flex items-center gap-1.5 ${
              isCurrent('/transport')
                ? 'text-forest-800 border-forest-700 font-bold'
                : 'border-transparent hover:text-forest-700'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-stone-500" />
            <span>{lang === 'en' ? 'Transport' : 'ലോറികൾ'}</span>
          </Link>

          {/* SECURITY ISOLATION: Dashboard Links ONLY appear for Authenticated Users with matching roles! */}
          {isAuthenticated && user?.role === 'buyer' && (
            <Link
              to="/dashboard/buyer"
              className={`transition pb-1 border-b-2 flex items-center gap-1.5 ${
                isCurrent('/dashboard/buyer')
                  ? 'text-forest-800 border-forest-700 font-bold'
                  : 'border-transparent hover:text-forest-700 text-stone-700'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-forest-700" />
              <span>{lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'seller' && (
            <Link
              to="/dashboard/seller"
              className={`transition pb-1 border-b-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-50 text-amber-900 border ${
                isCurrent('/dashboard/seller') ? 'border-amber-500 font-bold' : 'border-amber-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'en' ? 'Seller Hub' : 'കച്ചവട ഹബ്'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`transition pb-1 border-b-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-900 border ${
                isCurrent('/admin') ? 'border-stone-500 font-bold' : 'border-stone-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-forest-700" />
              <span>{lang === 'en' ? 'Admin Console' : 'അഡ്മിൻ കൺസോൾ'}</span>
            </Link>
          )}
        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 text-forest-700" />
            <span>{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Auth State Control */}
          {isAuthenticated ? (
            <UserNavMenu lang={lang} />
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition"
              >
                {lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}
              </Link>
              <Link
                to="/register"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white shadow-sm hover:shadow transition"
              >
                {lang === 'en' ? 'Register' : 'രജിസ്റ്റർ'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export function App() {
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 font-sans pb-16 md:pb-0" lang={lang}>
          {/* Header */}
          <AppHeader lang={lang} toggleLanguage={toggleLanguage} />

          {/* Main Content Area */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MarketplacePage lang={lang} />} />
              <Route path="/marketplace" element={<MarketplacePage lang={lang} />} />
              <Route path="/listing/:id" element={<ListingDetailPage lang={lang} />} />
              <Route path="/listings/:id" element={<ListingDetailPage lang={lang} />} />
              <Route path="/calculator" element={<CalculatorPage lang={lang} />} />
              <Route path="/transport" element={<TransportPage lang={lang} />} />
              <Route path="/carpenters" element={<CarpenterDirectoryPage lang={lang} />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage lang={lang} />} />
              <Route path="/register" element={<RegisterPage lang={lang} />} />

              {/* Protected Role-Specific Dashboards */}
              <Route
                path="/dashboard/seller"
                element={
                  <ProtectedRoute allowedRoles={['seller']}>
                    <SellerDashboard lang={lang} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/buyer"
                element={
                  <ProtectedRoute allowedRoles={['buyer']}>
                    <BuyerDashboard lang={lang} />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard lang={lang} />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <BrandLogo size="md" variant="dark" lang={lang} />
                <p className="text-xs text-stone-400 leading-relaxed">
                  {lang === 'en'
                    ? "Kerala's dedicated B2B timber trading exchange connecting verified timber yards, sawmills, and buyers across 14 districts."
                    : 'കേരളത്തിലെ 14 ജില്ലകളിലെ തടി ഡിപ്പോകളെയും മില്ലുകളെയും ഉപഭോക്താക്കളെയും ബന്ധിപ്പിക്കുന്ന ഡിജിറ്റൽ തടി വിപണി.'}
                </p>
                <div className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? '100% Certified Raw Timber Focus' : 'തടി ഉൽപ്പന്നങ്ങൾ മാത്രം — ഫർണിച്ചർ ഇല്ല'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                  {lang === 'en' ? 'Timber Categories' : 'തടി വിഭാഗങ്ങൾ'}
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link to="/marketplace" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Round Logs (ഉരുണ്ട തടികൾ)' : 'ഉരുണ്ട തടികൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/marketplace" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Rough-sawn Planks (അറുത്ത പലകകൾ)' : 'അറുത്ത പലകകൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/marketplace" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Squared Beams (ചതുര കഴുക്കോലുകൾ)' : 'ചതുര കഴുക്കോലുകൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/marketplace" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Firewood & Boiler Logs (വിറക്)' : 'വിറക് തടികൾ'}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                  {lang === 'en' ? 'Quick Tools' : 'പ്രധാന സേവനങ്ങൾ'}
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link to="/calculator" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Kerala CFT Calculator (Hoppus Rule)' : 'ഹോപ്പസ് സി.എഫ്.ടി കാൽക്കുലേറ്റർ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/transport" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Timber Transit Lorries Directory' : 'തടി കൊണ്ടുപോകുന്ന ലോറികൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/carpenters" className="hover:text-amber-300 transition">
                      {lang === 'en' ? 'Kerala Master Carpenters' : 'വിദഗ്ദ്ധ ആശാരിമാർ'}
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                  {lang === 'en' ? 'Legal & Regulatory' : 'നിയമാവലി'}
                </h4>
                <p className="text-xs text-stone-400 mb-2">
                  {lang === 'en'
                    ? 'All timber traded adheres to Kerala Forest Produce Transit Rules, 1975 and Form IV / Form III transit passes.'
                    : 'എല്ലാ തടി ഇടപാടുകളും കേരള വനം ഉൽപ്പന്ന ട്രാൻസിറ്റ് ചട്ടങ്ങൾ പ്രകാരമാണ് നടക്കുന്നത്.'}
                </p>
                <div className="text-[11px] text-stone-500">
                  © {new Date().getFullYear()} Timora Exchange. All rights reserved.
                </div>
              </div>
            </div>
          </footer>

          {/* Role-Aware Mobile Bottom Nav */}
          <MobileBottomNav lang={lang} />
        </div>
      </Router>
    </AuthProvider>
  );
}
