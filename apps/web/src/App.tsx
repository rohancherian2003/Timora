import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight,
  Factory,
  Menu,
  X
} from 'lucide-react';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { BrandLogo } from './components/BrandLogo';
import { OfflineBanner } from './components/OfflineBanner';

const MarketplacePage = React.lazy(() =>
  import('./pages/public/MarketplacePage').then((m) => ({ default: m.MarketplacePage }))
);
const ListingDetailPage = React.lazy(() =>
  import('./pages/public/ListingDetailPage').then((m) => ({ default: m.ListingDetailPage }))
);
const CalculatorPage = React.lazy(() =>
  import('./pages/public/CalculatorPage').then((m) => ({ default: m.CalculatorPage }))
);
const TransportPage = React.lazy(() =>
  import('./pages/public/TransportPage').then((m) => ({ default: m.TransportPage }))
);
const LoginPage = React.lazy(() =>
  import('./pages/auth/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = React.lazy(() =>
  import('./pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage }))
);
const CarpenterDirectoryPage = React.lazy(() =>
  import('./pages/carpenter/CarpenterDirectoryPage').then((m) => ({ default: m.CarpenterDirectoryPage }))
);
const TimberMillsPage = React.lazy(() =>
  import('./pages/public/TimberMillsPage').then((m) => ({ default: m.TimberMillsPage }))
);
const SellerDashboard = React.lazy(() =>
  import('./pages/seller/SellerDashboard').then((m) => ({ default: m.SellerDashboard }))
);
const TimberMillOwnerDashboard = React.lazy(() =>
  import('./pages/seller/TimberMillOwnerDashboard').then((m) => ({ default: m.TimberMillOwnerDashboard }))
);
const CarpenterDashboard = React.lazy(() =>
  import('./pages/carpenter/CarpenterDashboard').then((m) => ({ default: m.CarpenterDashboard }))
);
const TransportOwnerDashboard = React.lazy(() =>
  import('./pages/transport/TransportOwnerDashboard').then((m) => ({ default: m.TransportOwnerDashboard }))
);
const BuyerDashboard = React.lazy(() =>
  import('./pages/buyer/BuyerDashboard').then((m) => ({ default: m.BuyerDashboard }))
);
const AdminDashboard = React.lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);

import { SessionTimeoutModal } from './components/SessionTimeoutModal';
import { SignOutConfirmModal } from './components/SignOutConfirmModal';
import { SignOutRequiredModal } from './components/SignOutRequiredModal';
import { PageTransitionLoader } from './components/PageTransitionLoader';
import { EditProfileModal } from './components/EditProfileModal';

// Protected Route Guard with Browser Back-Button Confirmation Alert
function ProtectedRoute({
  children,
  allowedRoles,
  lang = 'en',
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  lang?: 'en' | 'ml';
}) {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showSignOutPrompt, setShowSignOutPrompt] = React.useState(false);
  const promptOpenRef = React.useRef(false);
  promptOpenRef.current = showSignOutPrompt;

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;

    // Establish history barrier entry on mount if not already present
    if (!window.history.state?.protectedDashboard) {
      window.history.pushState({ protectedDashboard: true }, '', window.location.href);
    }

    const handlePopState = () => {
      // Re-push current location immediately to prevent moving off dashboard
      window.history.pushState({ protectedDashboard: true }, '', window.location.href);

      // Prevent repeated Back presses from creating duplicate alerts or infinite loops
      if (promptOpenRef.current) return;

      // Show Sign Out Required confirmation modal
      setShowSignOutPrompt(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, user, location.pathname]);

  const handleSignOutConfirm = () => {
    logout();
    setShowSignOutPrompt(false);
    navigate('/', { replace: true });
  };

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to authoritative role home
    if (user.role === 'seller') {
      return <Navigate to={user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller'} replace />;
    }
    if (user.role === 'carpenter') return <Navigate to="/dashboard/carpenter" replace />;
    if (user.role === 'transport') return <Navigate to="/dashboard/transport" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'buyer') return <Navigate to="/dashboard/buyer" replace />;
  }

  return (
    <>
      {children}
      <SignOutRequiredModal
        isOpen={showSignOutPrompt}
        onClose={() => setShowSignOutPrompt(false)}
        onConfirm={handleSignOutConfirm}
        lang={lang}
      />
    </>
  );
}

// Guest-Only Route Guard (Prevents logged-in users from accessing Login/Register via URL or Browser Back button)
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (isAuthenticated && user) {
    if (user.role === 'seller') {
      return <Navigate to={user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller'} replace />;
    }
    if (user.role === 'carpenter') return <Navigate to="/dashboard/carpenter" replace />;
    if (user.role === 'transport') return <Navigate to="/dashboard/transport" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/dashboard/buyer" replace />;
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#E7E1D6]/95 backdrop-blur-md border-t border-stone-300/80 px-2 py-1.5 flex items-center justify-around shadow-lg pb-safe">
      <Link
        to="/marketplace"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Store className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Market' : 'മാർക്കറ്റ്'}</span>
      </Link>

      <Link
        to="/calculator"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/calculator') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Calculator className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Calculator' : 'കണക്ക്'}</span>
      </Link>

      <Link
        to="/carpenters"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/carpenters') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Hammer className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}</span>
      </Link>

      <Link
        to="/mills"
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
          isActive('/mills') || isActive('/timber-mills') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
        }`}
      >
        <Factory className="w-5 h-5" />
        <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Mills' : 'മില്ലുകൾ'}</span>
      </Link>

      {/* Conditional 4th link based on Auth Role */}
      {isAuthenticated && user?.role === 'buyer' && (
        <Link
          to="/dashboard/buyer"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/dashboard/buyer') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Orders' : 'ഓർഡർ'}</span>
        </Link>
      )}

      {isAuthenticated && user?.role === 'seller' && (
        <Link
          to={user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller'}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/dashboard/seller') || isActive('/dashboard/mill') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{user.sellerSubtype === 'mill_owner' ? (lang === 'en' ? 'Mill' : 'മിൽ') : (lang === 'en' ? 'Hub' : 'കച്ചവടം')}</span>
        </Link>
      )}

      {isAuthenticated && user?.role === 'carpenter' && (
        <Link
          to="/dashboard/carpenter"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/dashboard/carpenter') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Hammer className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Hub' : 'ആശാരി'}</span>
        </Link>
      )}

      {isAuthenticated && user?.role === 'transport' && (
        <Link
          to="/dashboard/transport"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/dashboard/transport') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Transit' : 'ലോറി'}</span>
        </Link>
      )}

      {isAuthenticated && user?.role === 'admin' && (
        <Link
          to="/admin"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
            isActive('/admin') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
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
            isActive('/transport') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'
          }`}
        >
          <Truck className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Transport' : 'ലോറി'}</span>
        </Link>
      )}

      {/* 5th Action: Login or Account */}
      {isAuthenticated ? (
        <Link
          to={
            user?.role === 'seller'
              ? (user?.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller')
              : user?.role === 'carpenter'
              ? '/dashboard/carpenter'
              : user?.role === 'transport'
              ? '/dashboard/transport'
              : user?.role === 'admin'
              ? '/admin'
              : '/dashboard/buyer'
          }
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#5B6147]"
        >
          <div className="w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold text-[#4A3626] ring-1 ring-stone-1000">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="text-[10px] mt-0.5 font-medium">{lang === 'en' ? 'Account' : 'പ്രൊഫൈൽ'}</span>
        </Link>
      ) : (
        <Link
          to="/login"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#5B6147] font-semibold"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}</span>
        </Link>
      )}
    </nav>
  );
}

// Directories Dropdown for Medium & Unmaximized Desktop Screens
function DirectoriesNavDropdown({
  lang,
  isCurrent,
}: {
  lang: 'en' | 'ml';
  isCurrent: (path: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isDirectoryActive =
    isCurrent('/carpenters') || isCurrent('/mills') || isCurrent('/timber-mills') || isCurrent('/transport');

  // Close dropdown on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} className="relative flex-shrink-0 w-auto">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-semibold rounded-full flex items-center gap-1.5 border ${
          isDirectoryActive
            ? 'text-[#4A3626] bg-[#E7E1D6]/80 border-[#5B6147] font-bold shadow-xs'
            : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100'
        }`}
      >
        <span>{lang === 'en' ? 'Directories' : 'സേവനങ്ങൾ'}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-fadeIn space-y-1">
          <Link
            to="/carpenters"
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
              isCurrent('/carpenters') ? 'bg-[#E7E1D6]/60 text-[#4A3626] font-bold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Hammer className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
            <div>
              <span className="block">{lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}</span>
              <span className="text-[10px] text-stone-400 block">{lang === 'en' ? 'Master Joiners & Craftsmen' : 'പരമ്പരാഗത ആശാരിമാർ'}</span>
            </div>
          </Link>

          <Link
            to="/mills"
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
              isCurrent('/mills') || isCurrent('/timber-mills') ? 'bg-[#E7E1D6]/60 text-[#4A3626] font-bold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Factory className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
            <div>
              <span className="block">{lang === 'en' ? 'Timber Mills' : 'തടി മില്ലുകൾ'}</span>
              <span className="text-[10px] text-stone-400 block">{lang === 'en' ? 'Sawmills & Sawn Timber' : 'അറുക്കൽ & പലകകൾ'}</span>
            </div>
          </Link>

          <Link
            to="/transport"
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition ${
              isCurrent('/transport') ? 'bg-[#E7E1D6]/60 text-[#4A3626] font-bold' : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Truck className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
            <div>
              <span className="block">{lang === 'en' ? 'Timber Transit' : 'ലോറികൾ'}</span>
              <span className="text-[10px] text-stone-400 block">{lang === 'en' ? 'Crane Carriers & Haulage' : 'തടി കൊണ്ടുപോകുന്ന വാഹനങ്ങൾ'}</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

// User Menu Component for Top Header
function UserNavMenu({ lang }: { lang: 'en' | 'ml' }) {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const handleConfirmLogout = () => {
    logout();
    setShowSignOutConfirm(false);
    setOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'seller') {
      return user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller';
    }
    if (user.role === 'carpenter') return '/dashboard/carpenter';
    if (user.role === 'transport') return '/dashboard/transport';
    if (user.role === 'admin') return '/admin';
    return '/dashboard/buyer';
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'seller':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-stone-200 text-[#4A3626] border border-stone-300">
            {user.sellerSubtype === 'mill_owner'
              ? (lang === 'en' ? 'Timber Mill Owner' : 'തടി മിൽ ഉടമ')
              : (lang === 'en' ? 'Individual Seller' : 'വ്യക്തിഗത കച്ചവടക്കാരൻ')}
          </span>
        );
      case 'carpenter':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-amber-100 text-amber-900 border border-amber-300">
            {lang === 'en' ? 'Master Carpenter' : 'വിദഗ്ദ്ധ ആശാരി'}
          </span>
        );
      case 'transport':
        return (
          <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-900 border border-blue-300">
            {lang === 'en' ? 'Transport Owner' : 'വാഹന ഉടമ'}
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
            {lang === 'en' ? 'Verified Buyer' : 'ഉപഭോക്താവ്'}
          </span>
        );
    }
  };
  const getDashboardLink = () => {
    return getDashboardPath();
  };

  return (
    <div className="relative flex-shrink-0 w-auto">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-full border border-stone-200 bg-white hover:bg-stone-50 shadow-xs transition flex-shrink-0 whitespace-nowrap w-auto"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#5B6147] to-[#4A3626] text-white flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
          {user.name[0] || 'U'}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left">
          <span className="text-xs font-bold text-stone-900 truncate max-w-[90px] sm:max-w-[105px] lg:max-w-[120px] xl:max-w-[150px]">
            {user.name}
          </span>
          <span className="text-[10px] text-stone-500 font-medium leading-none hidden xl:block">
            {user.phone}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
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
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-50 rounded-xl transition"
              >
                <LayoutDashboard className="w-4 h-4 text-[#5B6147]" />
                <span>{lang === 'en' ? 'My Dashboard' : 'എന്റെ ഡാഷ്‌ബോർഡ്'}</span>
              </Link>

              {user.role === 'buyer' && (
                <Link
                  to="/dashboard/buyer"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-50 rounded-xl transition"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>{lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ'}</span>
                </Link>
              )}

              {user.role === 'seller' && (
                <Link
                  to="/dashboard/seller"
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-100/50 rounded-xl transition"
                >
                  <Store className="w-4 h-4 text-[#3F452F]" />
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

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setShowEditProfile(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-50 rounded-xl transition text-left"
              >
                <User className="w-4 h-4 text-[#5B6147]" />
                <span>{lang === 'en' ? 'Edit Profile & Settings' : 'പ്രൊഫൈൽ ക്രമീകരണങ്ങൾ'}</span>
              </button>
            </div>

            <div className="pt-1 border-t border-stone-100">
              <button
                onClick={() => {
                  setOpen(false);
                  setShowSignOutConfirm(true);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
                <span>{lang === 'en' ? 'Sign Out' : 'ലോഗ് ഔട്ട്'}</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Sign Out Confirmation Modal with Loading State */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmLogout}
        lang={lang}
      />

      {/* Edit Profile Modal accessible from User Menu for all roles */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        lang={lang}
      />
    </div>
  );
}

// Main Navigation Header
function AppHeader({
  lang,
  toggleLanguage,
}: {
  lang: 'en' | 'ml';
  toggleLanguage: () => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const isCurrent = (path: string) => {
    if (path === '/marketplace' && (location.pathname === '/' || location.pathname === '/marketplace')) {
      return true;
    }
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs transition-colors w-full max-w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 lg:gap-3 xl:gap-4">
        {/* Brand Logo with clear right spacing */}
        <Link to="/" className="group flex items-center flex-shrink-0 mr-1 sm:mr-2">
          <BrandLogo size="md" lang={lang} />
        </Link>

        {/* Desktop Navigation Links - Compact single-line fitting on lg & xl viewports */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 text-xs xl:text-sm font-semibold text-stone-600 flex-shrink-0 w-auto">
          <Link
            to="/marketplace"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
              isCurrent('/marketplace')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100'
            }`}
          >
            <span className="whitespace-nowrap">{lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്'}</span>
          </Link>

          <Link
            to="/calculator"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
              isCurrent('/calculator')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
            <span className="whitespace-nowrap">{lang === 'en' ? 'CFT Calculator' : 'തടി കാൽക്കുലേറ്റർ'}</span>
          </Link>

          {/* Medium Screens (lg: 1024px - 1279px): Compact Directories Dropdown */}
          <div className="block xl:hidden flex-shrink-0 w-auto">
            <DirectoriesNavDropdown lang={lang} isCurrent={isCurrent} />
          </div>

          {/* Full Large Desktop Screens (>= 1280px): Expanded Direct Links */}
          <Link
            to="/carpenters"
            className={`hidden xl:flex whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold items-center gap-1.5 ${
              isCurrent('/carpenters')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span className="whitespace-nowrap">{lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}</span>
          </Link>

          <Link
            to="/transport"
            className={`hidden xl:flex whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold items-center gap-1.5 ${
              isCurrent('/transport')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span className="whitespace-nowrap">{lang === 'en' ? 'Transport' : 'ലോറികൾ'}</span>
          </Link>

          <Link
            to="/mills"
            className={`hidden xl:flex whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold items-center gap-1.5 ${
              isCurrent('/mills') || isCurrent('/timber-mills')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100'
            }`}
          >
            <Factory className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span className="whitespace-nowrap">{lang === 'en' ? 'Timber Mills' : 'തടി മില്ലുകൾ'}</span>
          </Link>

          {/* ROLE-SPECIFIC DASHBOARD PILL BUTTONS (Complete Unbroken Oval Border rounded-full, w-auto, flex-shrink-0) */}
          {isAuthenticated && user?.role === 'buyer' && (
            <Link
              to="/dashboard/buyer"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/buyer')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 text-stone-700 hover:text-[#5B6147] hover:bg-stone-100'
              }`}
              title={lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ'}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span className="whitespace-nowrap">{lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'seller' && (
            <Link
              to={user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller'}
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/seller') || isCurrent('/dashboard/mill')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 text-stone-700 hover:text-[#5B6147] hover:bg-stone-100'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
              <span className="whitespace-nowrap">
                {user.sellerSubtype === 'mill_owner'
                  ? (lang === 'en' ? 'Mill Hub' : 'മിൽ ഹബ്')
                  : (lang === 'en' ? 'Seller Hub' : 'കച്ചവട ഹബ്')}
              </span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'carpenter' && (
            <Link
              to="/dashboard/carpenter"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/carpenter')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 text-stone-700 hover:text-[#5B6147] hover:bg-stone-100'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
              <span className="whitespace-nowrap">{lang === 'en' ? 'Carpenter Hub' : 'ആശാരി ഹബ്'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'transport' && (
            <Link
              to="/dashboard/transport"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/transport')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 text-stone-700 hover:text-[#5B6147] hover:bg-stone-100'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
              <span className="whitespace-nowrap">{lang === 'en' ? 'Transit Hub' : 'ലോറി ഹബ്'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 xl:px-4 xl:py-2 rounded-full border text-xs xl:text-sm font-semibold flex items-center gap-1.5 ${
                isCurrent('/admin')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 text-stone-700 hover:text-[#5B6147] hover:bg-stone-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#4A3626] flex-shrink-0" />
              <span className="whitespace-nowrap">{lang === 'en' ? 'Admin Console' : 'അഡ്മിൻ കൺസോൾ'}</span>
            </Link>
          )}
        </nav>

        {/* Right Action Cluster: Language Switcher + User Navigation Menu (Notification Bell completely removed) */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 flex-shrink-0 ml-auto">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-bold rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 transition flex-shrink-0 whitespace-nowrap w-auto shadow-2xs"
            title="Toggle Language / ഭാഷ മാറ്റുക"
          >
            <Globe className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-[#3F452F] flex-shrink-0" />
            <span className="whitespace-nowrap leading-none">{lang === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* Auth State Control */}
          {isAuthenticated ? (
            <div className="flex items-center flex-shrink-0">
              <UserNavMenu lang={lang} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Link
                to="/login"
                className="px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-bold rounded-full text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition whitespace-nowrap w-auto"
              >
                {lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 xl:px-4 xl:py-2 text-xs xl:text-sm font-bold rounded-full bg-[#5B6147] hover:bg-[#3F452F] text-white shadow-xs transition whitespace-nowrap w-auto"
              >
                {lang === 'en' ? 'Register' : 'രജിസ്റ്റർ'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Responsive Sub-Navigation Pill Bar on Mobile & Tablet (< lg viewports) */}
      <div className="lg:hidden w-full border-t border-stone-200/80 bg-stone-50/95 backdrop-blur-md px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 w-max">
          <Link
            to="/marketplace"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              isCurrent('/marketplace')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-stone-200 bg-white text-stone-600 hover:text-[#5B6147]'
            }`}
          >
            <span>{lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്'}</span>
          </Link>

          <Link
            to="/calculator"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              isCurrent('/calculator')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-stone-200 bg-white text-stone-600 hover:text-[#5B6147]'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
            <span>{lang === 'en' ? 'CFT Calculator' : 'കാൽക്കുലേറ്റർ'}</span>
          </Link>

          <Link
            to="/carpenters"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              isCurrent('/carpenters')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-stone-200 bg-white text-stone-600 hover:text-[#5B6147]'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span>{lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ'}</span>
          </Link>

          <Link
            to="/transport"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              isCurrent('/transport')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-stone-200 bg-white text-stone-600 hover:text-[#5B6147]'
            }`}
          >
            <Truck className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span>{lang === 'en' ? 'Transport' : 'ലോറികൾ'}</span>
          </Link>

          <Link
            to="/mills"
            className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
              isCurrent('/mills') || isCurrent('/timber-mills')
                ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-stone-200 bg-white text-stone-600 hover:text-[#5B6147]'
            }`}
          >
            <Factory className="w-3.5 h-3.5 text-stone-500 flex-shrink-0" />
            <span>{lang === 'en' ? 'Timber Mills' : 'മില്ലുകൾ'}</span>
          </Link>

          {/* Role-Specific Dashboard Pill in Mobile/Tablet Sub-nav Bar */}
          {isAuthenticated && user?.role === 'buyer' && (
            <Link
              to="/dashboard/buyer"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/buyer')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:text-[#5B6147]'
              }`}
              title={lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ'}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700 flex-shrink-0" />
              <span>{lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'seller' && (
            <Link
              to={user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller'}
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/seller') || isCurrent('/dashboard/mill')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:text-[#5B6147]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
              <span>
                {user.sellerSubtype === 'mill_owner'
                  ? (lang === 'en' ? 'Mill Hub' : 'മിൽ ഹബ്')
                  : (lang === 'en' ? 'Seller Hub' : 'കച്ചവട ഹബ്')}
              </span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'carpenter' && (
            <Link
              to="/dashboard/carpenter"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/carpenter')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:text-[#5B6147]'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
              <span>{lang === 'en' ? 'Carpenter Hub' : 'ആശാരി ഹബ്'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'transport' && (
            <Link
              to="/dashboard/transport"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                isCurrent('/dashboard/transport')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                  : 'border-stone-200 bg-white text-stone-700 hover:text-[#5B6147]'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-[#3F452F] flex-shrink-0" />
              <span>{lang === 'en' ? 'Transit Hub' : 'ലോറി ഹബ്'}</span>
            </Link>
          )}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`whitespace-nowrap flex-shrink-0 w-auto transition px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                isCurrent('/admin')
                  ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
                : 'border-stone-200 bg-white text-stone-700 hover:text-[#5B6147]'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-[#4A3626] flex-shrink-0" />
              <span>{lang === 'en' ? 'Admin Console' : 'അഡ്മിൻ കൺസോൾ'}</span>
            </Link>
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
        {/* Sleek Route Transition Progress Bar */}
        <PageTransitionLoader />
        <div
          className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col font-sans pb-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:pb-0 bg-stone-50/50 text-stone-900"
          lang={lang}
        >
          {/* Offline Banner for Network Recovery */}
          <OfflineBanner lang={lang} />

          {/* Header */}
          <AppHeader
            lang={lang}
            toggleLanguage={toggleLanguage}
          />

          {/* Main Content Area */}
          <main className="w-full max-w-full overflow-x-hidden flex-grow">
            <React.Suspense fallback={<PageTransitionLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<MarketplacePage lang={lang} />} />
                <Route path="/marketplace" element={<MarketplacePage lang={lang} />} />
                <Route path="/listing/:id" element={<ListingDetailPage lang={lang} />} />
                <Route path="/listings/:id" element={<ListingDetailPage lang={lang} />} />
                <Route path="/calculator" element={<CalculatorPage lang={lang} />} />
                <Route path="/transport" element={<TransportPage lang={lang} />} />
                <Route path="/carpenters" element={<CarpenterDirectoryPage lang={lang} />} />
                <Route path="/mills" element={<TimberMillsPage lang={lang} />} />
                <Route path="/timber-mills" element={<TimberMillsPage lang={lang} />} />

                {/* Authentication Routes - Protected against back-navigation when already logged in */}
                <Route
                  path="/login"
                  element={
                    <GuestRoute>
                      <LoginPage lang={lang} />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <GuestRoute>
                      <RegisterPage lang={lang} />
                    </GuestRoute>
                  }
                />

                {/* Protected Role-Specific Dashboards */}
                <Route
                  path="/dashboard/seller"
                  element={
                    <ProtectedRoute allowedRoles={['seller']} lang={lang}>
                      <SellerDashboard lang={lang} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/mill"
                  element={
                    <ProtectedRoute allowedRoles={['seller']} lang={lang}>
                      <TimberMillOwnerDashboard lang={lang} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/carpenter"
                  element={
                    <ProtectedRoute allowedRoles={['carpenter']} lang={lang}>
                      <CarpenterDashboard lang={lang} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/transport"
                  element={
                    <ProtectedRoute allowedRoles={['transport']} lang={lang}>
                      <TransportOwnerDashboard lang={lang} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/buyer"
                  element={
                    <ProtectedRoute allowedRoles={['buyer']} lang={lang}>
                      <BuyerDashboard lang={lang} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']} lang={lang}>
                      <AdminDashboard lang={lang} />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </React.Suspense>
          </main>

          {/* Footer */}
          <footer className="w-full max-w-full overflow-x-hidden bg-stone-900 text-stone-400 py-12 border-t border-stone-800">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-3">
                <BrandLogo size="md" variant="dark" lang={lang} />
                <p className="text-xs text-stone-400 leading-relaxed">
                  {lang === 'en'
                    ? "Kerala's smart timber marketplace connecting verified timber yards, sawmills, and home builders across 14 districts."
                    : 'കേരളത്തിലെ 14 ജില്ലകളിലെ തടി ഡിപ്പോകളെയും മില്ലുകളെയും വീടുപണിയുന്നവരെയും ബന്ധിപ്പിക്കുന്ന സ്മാർട്ട് തടി വിപണി.'}
                </p>
                <div className="text-[11px] text-stone-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Smart Timber Marketplace • Direct Mill Pricing' : 'നേരിട്ടുള്ള തടി വ്യാപാരം — ഫർണിച്ചർ ഇല്ല'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
                  {lang === 'en' ? 'Timber Categories' : 'തടി വിഭാഗങ്ങൾ'}
                </h4>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link to="/marketplace" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Round Logs (ഉരുണ്ട തടികൾ)' : 'ഉരുണ്ട തടികൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/marketplace" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Rough-sawn Planks (അറുത്ത പലകകൾ)' : 'അറുത്ത പലകകൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/marketplace" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Squared Beams (ചതുര കഴുക്കോലുകൾ)' : 'ചതുര കഴുക്കോലുകൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/marketplace" className="hover:text-stone-300 transition">
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
                    <Link to="/calculator" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Kerala CFT Calculator (Hoppus Rule)' : 'ഹോപ്പസ് സി.എഫ്.ടി കാൽക്കുലേറ്റർ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/transport" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Timber Transit Lorries Directory' : 'തടി കൊണ്ടുപോകുന്ന ലോറികൾ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/carpenters" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Kerala Master Carpenters' : 'വിദഗ്ദ്ധ ആശാരിമാർ'}
                    </Link>
                  </li>
                  <li>
                    <Link to="/mills" className="hover:text-stone-300 transition">
                      {lang === 'en' ? 'Kerala Licensed Timber Sawmills' : 'കേരള തടി മില്ലുകൾ'}
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
                  © {new Date().getFullYear()} Timora Smart Timber Marketplace. All rights reserved.
                </div>
              </div>
            </div>
          </footer>

          {/* Role-Aware Mobile Bottom Nav */}
          <MobileBottomNav lang={lang} />

          {/* Session Timeout Inactivity Modal */}
          <SessionTimeoutModal lang={lang} />
        </div>
      </Router>
    </AuthProvider>
  );
}
