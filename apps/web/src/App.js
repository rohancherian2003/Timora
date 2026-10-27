import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Calculator, Hammer, Globe, LayoutDashboard, Shield, ShoppingBag, Store, Truck, LogOut, User, ChevronDown, Sparkles, Factory } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandLogo } from './components/BrandLogo';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { ListingDetailPage } from './pages/public/ListingDetailPage';
import { CalculatorPage } from './pages/public/CalculatorPage';
import { TransportPage } from './pages/public/TransportPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CarpenterDirectoryPage } from './pages/carpenter/CarpenterDirectoryPage';
import { TimberMillsPage } from './pages/public/TimberMillsPage';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SessionTimeoutModal } from './components/SessionTimeoutModal';
// Protected Route Guard
function ProtectedRoute({ children, allowedRoles, }) {
    const { user, isAuthenticated } = useAuth();
    if (!isAuthenticated || !user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If buyer tries to view seller or vice-versa, redirect to their role home
        if (user.role === 'seller')
            return _jsx(Navigate, { to: "/dashboard/seller", replace: true });
        if (user.role === 'buyer')
            return _jsx(Navigate, { to: "/dashboard/buyer", replace: true });
        if (user.role === 'admin')
            return _jsx(Navigate, { to: "/admin", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
// Guest-Only Route Guard (Prevents logged-in users from accessing Login/Register via URL or Browser Back button)
function GuestRoute({ children }) {
    const { user, isAuthenticated } = useAuth();
    if (isAuthenticated && user) {
        if (user.role === 'seller')
            return _jsx(Navigate, { to: "/dashboard/seller", replace: true });
        if (user.role === 'buyer')
            return _jsx(Navigate, { to: "/dashboard/buyer", replace: true });
        if (user.role === 'admin')
            return _jsx(Navigate, { to: "/admin", replace: true });
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(_Fragment, { children: children });
}
// Role-Aware Mobile Bottom Nav
function MobileBottomNav({ lang }) {
    const location = useLocation();
    const currentPath = location.pathname;
    const { user, isAuthenticated } = useAuth();
    const isActive = (path) => {
        if (path === '/' && (currentPath === '/' || currentPath === '/marketplace'))
            return true;
        return currentPath === path;
    };
    return (_jsxs("nav", { className: "md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#E7E1D6]/95 backdrop-blur-md border-t border-stone-300/80 px-2 py-1.5 flex items-center justify-around shadow-lg pb-safe", children: [_jsxs(Link, { to: "/marketplace", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(Store, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Market' : 'മാർക്കറ്റ്' })] }), _jsxs(Link, { to: "/calculator", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/calculator') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(Calculator, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Calculator' : 'കണക്ക്' })] }), _jsxs(Link, { to: "/carpenters", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/carpenters') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(Hammer, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Carpenters' : 'തച്ചൻ' })] }), _jsxs(Link, { to: "/mills", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/mills') || isActive('/timber-mills') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(Factory, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Mills' : 'മില്ലുകൾ' })] }), isAuthenticated && user?.role === 'buyer' && (_jsxs(Link, { to: "/dashboard/buyer", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/dashboard/buyer') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(ShoppingBag, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Orders' : 'ഓർഡർ' })] })), isAuthenticated && user?.role === 'seller' && (_jsxs(Link, { to: "/dashboard/seller", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/dashboard/seller') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(LayoutDashboard, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Hub' : 'കച്ചവടം' })] })), isAuthenticated && user?.role === 'admin' && (_jsxs(Link, { to: "/admin", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/admin') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(Shield, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: "Admin" })] })), !isAuthenticated && (_jsxs(Link, { to: "/transport", className: `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${isActive('/transport') ? 'text-[#5B6147] font-bold' : 'text-stone-500 hover:text-stone-800'}`, children: [_jsx(Truck, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Transport' : 'ലോറി' })] })), isAuthenticated ? (_jsxs(Link, { to: user?.role === 'seller' ? '/dashboard/seller' : user?.role === 'admin' ? '/admin' : '/dashboard/buyer', className: "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#5B6147]", children: [_jsx("div", { className: "w-5 h-5 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold text-[#4A3626] ring-1 ring-stone-1000", children: user?.name?.[0] || 'U' }), _jsx("span", { className: "text-[10px] mt-0.5 font-medium", children: lang === 'en' ? 'Account' : 'പ്രൊഫൈൽ' })] })) : (_jsxs(Link, { to: "/login", className: "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#5B6147] font-semibold", children: [_jsx(User, { className: "w-5 h-5" }), _jsx("span", { className: "text-[10px] mt-0.5", children: lang === 'en' ? 'Sign In' : 'ലോഗിൻ' })] }))] }));
}
// User Menu Component for Top Header
function UserNavMenu({ lang }) {
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    if (!user)
        return null;
    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/');
    };
    const getRoleBadge = () => {
        switch (user.role) {
            case 'seller':
                return (_jsx("span", { className: "px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-stone-200 text-[#4A3626] border border-stone-300", children: lang === 'en' ? 'Seller Depot' : 'കച്ചവടക്കാരൻ' }));
            case 'admin':
                return (_jsx("span", { className: "px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-stone-800 text-white border border-stone-700", children: lang === 'en' ? 'Super Admin' : 'അഡ്മിൻ' }));
            case 'buyer':
            default:
                return (_jsx("span", { className: "px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300", children: lang === 'en' ? 'Timber Buyer' : 'ഉപഭോക്താവ്' }));
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
    return (_jsxs("div", { className: "relative", children: [_jsxs("button", { onClick: () => setOpen(!open), className: "flex items-center gap-2 py-1.5 px-3 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 shadow-sm transition", children: [_jsx("div", { className: "w-7 h-7 rounded-lg bg-gradient-to-br from-[#5B6147] to-[#4A3626] text-white flex items-center justify-center text-xs font-bold shadow-xs", children: user.name[0] || 'U' }), _jsxs("div", { className: "hidden lg:flex flex-col items-start text-left", children: [_jsx("span", { className: "text-xs font-bold text-stone-900 line-clamp-1", children: user.name }), _jsx("span", { className: "text-[10px] text-stone-500 font-medium leading-none", children: user.phone })] }), _jsx(ChevronDown, { className: `w-3.5 h-3.5 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}` })] }), open && (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 z-40", onClick: () => setOpen(false) }), _jsxs("div", { className: "absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-fadeIn space-y-2", children: [_jsxs("div", { className: "p-2 border-b border-stone-100", children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("span", { className: "text-xs font-bold text-stone-900", children: user.name }), getRoleBadge()] }), user.businessName && (_jsx("p", { className: "text-[11px] text-stone-600 line-clamp-1", children: user.businessName })), _jsxs("p", { className: "text-[11px] text-stone-400 font-mono mt-0.5", children: ["+91 ", user.phone] })] }), _jsxs("div", { className: "space-y-0.5", children: [_jsxs(Link, { to: getDashboardLink(), onClick: () => setOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-50 rounded-xl transition", children: [_jsx(LayoutDashboard, { className: "w-4 h-4 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'My Dashboard' : 'എന്റെ ഡാഷ്‌ബോർഡ്' })] }), user.role === 'buyer' && (_jsxs(Link, { to: "/dashboard/buyer", onClick: () => setOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-50 rounded-xl transition", children: [_jsx(ShoppingBag, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { children: lang === 'en' ? 'Orders & Negotiations' : 'ഓർഡറുകൾ' })] })), user.role === 'seller' && (_jsxs(Link, { to: "/dashboard/seller", onClick: () => setOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-[#4A3626] hover:bg-stone-100/50 rounded-xl transition", children: [_jsx(Store, { className: "w-4 h-4 text-[#3F452F]" }), _jsx("span", { children: lang === 'en' ? 'Depot Stock Manager' : 'സ്റ്റോക്ക് മാനേജർ' })] })), user.role === 'admin' && (_jsxs(Link, { to: "/admin", onClick: () => setOpen(false), className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition", children: [_jsx(Shield, { className: "w-4 h-4 text-stone-800" }), _jsx("span", { children: lang === 'en' ? 'Admin Moderation Console' : 'അഡ്മിൻ കൺസോൾ' })] }))] }), _jsx("div", { className: "pt-1 border-t border-stone-100", children: _jsxs("button", { onClick: handleLogout, className: "w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Sign Out' : 'ലോഗ് ഔട്ട്' })] }) })] })] }))] }));
}
// Main Navigation Header
function AppHeader({ lang, toggleLanguage }) {
    const { user, isAuthenticated } = useAuth();
    const location = useLocation();
    const isCurrent = (path) => {
        if (path === '/marketplace' && (location.pathname === '/' || location.pathname === '/marketplace')) {
            return true;
        }
        return location.pathname === path;
    };
    return (_jsx("header", { className: "sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between", children: [_jsx(Link, { to: "/", className: "group flex items-center", children: _jsx(BrandLogo, { size: "md", lang: lang }) }), _jsxs("nav", { className: "hidden md:flex items-center gap-6 text-sm font-semibold text-stone-600", children: [_jsx(Link, { to: "/marketplace", className: `transition pb-1 border-b-2 ${isCurrent('/marketplace')
                                ? 'text-[#5B6147] border-[#5B6147] font-bold'
                                : 'border-transparent hover:text-[#5B6147]'}`, children: lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്' }), _jsxs(Link, { to: "/calculator", className: `transition pb-1 border-b-2 flex items-center gap-1.5 ${isCurrent('/calculator')
                                ? 'text-[#5B6147] border-[#5B6147] font-bold'
                                : 'border-transparent hover:text-[#5B6147]'}`, children: [_jsx(Calculator, { className: "w-3.5 h-3.5 text-[#3F452F]" }), _jsx("span", { children: lang === 'en' ? 'CFT Calculator' : 'തടി കാൽക്കുലേറ്റർ' })] }), _jsxs(Link, { to: "/carpenters", className: `transition pb-1 border-b-2 flex items-center gap-1.5 ${isCurrent('/carpenters')
                                ? 'text-[#5B6147] border-[#5B6147] font-bold'
                                : 'border-transparent hover:text-[#5B6147]'}`, children: [_jsx(Hammer, { className: "w-3.5 h-3.5 text-stone-500" }), _jsx("span", { children: lang === 'en' ? 'Carpenters' : 'ആശാരിമാർ' })] }), _jsxs(Link, { to: "/transport", className: `transition pb-1 border-b-2 flex items-center gap-1.5 ${isCurrent('/transport')
                                ? 'text-[#5B6147] border-[#5B6147] font-bold'
                                : 'border-transparent hover:text-[#5B6147]'}`, children: [_jsx(Truck, { className: "w-3.5 h-3.5 text-stone-500" }), _jsx("span", { children: lang === 'en' ? 'Transport' : 'ലോറികൾ' })] }), _jsxs(Link, { to: "/mills", className: `transition pb-1 border-b-2 flex items-center gap-1.5 ${isCurrent('/mills') || isCurrent('/timber-mills')
                                ? 'text-[#5B6147] border-[#5B6147] font-bold'
                                : 'border-transparent hover:text-[#5B6147]'}`, children: [_jsx(Factory, { className: "w-3.5 h-3.5 text-stone-500" }), _jsx("span", { children: lang === 'en' ? 'Timber Mills' : 'തടി മില്ലുകൾ' })] }), isAuthenticated && user?.role === 'buyer' && (_jsxs(Link, { to: "/dashboard/buyer", className: `transition pb-1 border-b-2 flex items-center gap-1.5 ${isCurrent('/dashboard/buyer')
                                ? 'text-[#5B6147] border-[#5B6147] font-bold'
                                : 'border-transparent hover:text-[#5B6147] text-stone-700'}`, children: [_jsx(ShoppingBag, { className: "w-3.5 h-3.5 text-emerald-700" }), _jsx("span", { children: lang === 'en' ? 'My Orders' : 'എന്റെ ഓർഡറുകൾ' })] })), isAuthenticated && user?.role === 'seller' && (_jsxs(Link, { to: "/dashboard/seller", className: `transition pb-1 border-b-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-[#4A3626] border ${isCurrent('/dashboard/seller') ? 'border-[#5B6147] font-bold' : 'border-stone-300'}`, children: [_jsx(LayoutDashboard, { className: "w-3.5 h-3.5 text-[#3F452F]" }), _jsx("span", { children: lang === 'en' ? 'Seller Hub' : 'കച്ചവട ഹബ്' })] })), isAuthenticated && user?.role === 'admin' && (_jsxs(Link, { to: "/admin", className: `transition pb-1 border-b-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-stone-900 border ${isCurrent('/admin') ? 'border-stone-500 font-bold' : 'border-stone-300'}`, children: [_jsx(Shield, { className: "w-3.5 h-3.5 text-[#4A3626]" }), _jsx("span", { children: lang === 'en' ? 'Admin Console' : 'അഡ്മിൻ കൺസോൾ' })] }))] }), _jsxs("div", { className: "flex items-center gap-2.5 sm:gap-3", children: [_jsxs("button", { onClick: toggleLanguage, className: "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition", title: "Toggle Language / \u0D2D\u0D3E\u0D37 \u0D2E\u0D3E\u0D31\u0D4D\u0D31\u0D41\u0D15", children: [_jsx(Globe, { className: "w-3.5 h-3.5 text-[#3F452F]" }), _jsx("span", { children: lang === 'en' ? 'മലയാളം' : 'English' })] }), isAuthenticated ? (_jsx(UserNavMenu, { lang: lang })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Link, { to: "/login", className: "px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100/60 transition", children: lang === 'en' ? 'Sign In' : 'ലോഗിൻ' }), _jsx(Link, { to: "/register", className: "px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white shadow-sm hover:shadow transition", children: lang === 'en' ? 'Register' : 'രജിസ്റ്റർ' })] }))] })] }) }));
}
export function App() {
    const [lang, setLang] = useState('en');
    const toggleLanguage = () => {
        setLang((prev) => (prev === 'en' ? 'ml' : 'en'));
    };
    return (_jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs("div", { className: "min-h-screen flex flex-col bg-stone-50/50 text-stone-900 font-sans pb-16 md:pb-0", lang: lang, children: [_jsx(AppHeader, { lang: lang, toggleLanguage: toggleLanguage }), _jsx("main", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(MarketplacePage, { lang: lang }) }), _jsx(Route, { path: "/marketplace", element: _jsx(MarketplacePage, { lang: lang }) }), _jsx(Route, { path: "/listing/:id", element: _jsx(ListingDetailPage, { lang: lang }) }), _jsx(Route, { path: "/listings/:id", element: _jsx(ListingDetailPage, { lang: lang }) }), _jsx(Route, { path: "/calculator", element: _jsx(CalculatorPage, { lang: lang }) }), _jsx(Route, { path: "/transport", element: _jsx(TransportPage, { lang: lang }) }), _jsx(Route, { path: "/carpenters", element: _jsx(CarpenterDirectoryPage, { lang: lang }) }), _jsx(Route, { path: "/mills", element: _jsx(TimberMillsPage, { lang: lang }) }), _jsx(Route, { path: "/timber-mills", element: _jsx(TimberMillsPage, { lang: lang }) }), _jsx(Route, { path: "/login", element: _jsx(GuestRoute, { children: _jsx(LoginPage, { lang: lang }) }) }), _jsx(Route, { path: "/register", element: _jsx(GuestRoute, { children: _jsx(RegisterPage, { lang: lang }) }) }), _jsx(Route, { path: "/dashboard/seller", element: _jsx(ProtectedRoute, { allowedRoles: ['seller'], children: _jsx(SellerDashboard, { lang: lang }) }) }), _jsx(Route, { path: "/dashboard/buyer", element: _jsx(ProtectedRoute, { allowedRoles: ['buyer'], children: _jsx(BuyerDashboard, { lang: lang }) }) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { allowedRoles: ['admin'], children: _jsx(AdminDashboard, { lang: lang }) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }), _jsx("footer", { className: "bg-stone-900 text-stone-400 py-12 border-t border-stone-800", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8", children: [_jsxs("div", { className: "space-y-3", children: [_jsx(BrandLogo, { size: "md", variant: "dark", lang: lang }), _jsx("p", { className: "text-xs text-stone-400 leading-relaxed", children: lang === 'en'
                                                ? "Kerala's smart timber marketplace connecting verified timber yards, sawmills, and home builders across 14 districts."
                                                : 'കേരളത്തിലെ 14 ജില്ലകളിലെ തടി ഡിപ്പോകളെയും മില്ലുകളെയും വീടുപണിയുന്നവരെയും ബന്ധിപ്പിക്കുന്ന സ്മാർട്ട് തടി വിപണി.' }), _jsxs("div", { className: "text-[11px] text-stone-400 font-semibold flex items-center gap-1.5", children: [_jsx(Sparkles, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Smart Timber Marketplace • Direct Mill Pricing' : 'നേരിട്ടുള്ള തടി വ്യാപാരം — ഫർണിച്ചർ ഇല്ല' })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-white mb-3", children: lang === 'en' ? 'Timber Categories' : 'തടി വിഭാഗങ്ങൾ' }), _jsxs("ul", { className: "space-y-2 text-xs", children: [_jsx("li", { children: _jsx(Link, { to: "/marketplace", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Round Logs (ഉരുണ്ട തടികൾ)' : 'ഉരുണ്ട തടികൾ' }) }), _jsx("li", { children: _jsx(Link, { to: "/marketplace", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Rough-sawn Planks (അറുത്ത പലകകൾ)' : 'അറുത്ത പലകകൾ' }) }), _jsx("li", { children: _jsx(Link, { to: "/marketplace", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Squared Beams (ചതുര കഴുക്കോലുകൾ)' : 'ചതുര കഴുക്കോലുകൾ' }) }), _jsx("li", { children: _jsx(Link, { to: "/marketplace", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Firewood & Boiler Logs (വിറക്)' : 'വിറക് തടികൾ' }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-white mb-3", children: lang === 'en' ? 'Quick Tools' : 'പ്രധാന സേവനങ്ങൾ' }), _jsxs("ul", { className: "space-y-2 text-xs", children: [_jsx("li", { children: _jsx(Link, { to: "/calculator", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Kerala CFT Calculator (Hoppus Rule)' : 'ഹോപ്പസ് സി.എഫ്.ടി കാൽക്കുലേറ്റർ' }) }), _jsx("li", { children: _jsx(Link, { to: "/transport", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Timber Transit Lorries Directory' : 'തടി കൊണ്ടുപോകുന്ന ലോറികൾ' }) }), _jsx("li", { children: _jsx(Link, { to: "/carpenters", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Kerala Master Carpenters' : 'വിദഗ്ദ്ധ ആശാരിമാർ' }) }), _jsx("li", { children: _jsx(Link, { to: "/mills", className: "hover:text-stone-300 transition", children: lang === 'en' ? 'Kerala Licensed Timber Sawmills' : 'കേരള തടി മില്ലുകൾ' }) })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "text-xs font-bold uppercase tracking-wider text-white mb-3", children: lang === 'en' ? 'Legal & Regulatory' : 'നിയമാവലി' }), _jsx("p", { className: "text-xs text-stone-400 mb-2", children: lang === 'en'
                                                ? 'All timber traded adheres to Kerala Forest Produce Transit Rules, 1975 and Form IV / Form III transit passes.'
                                                : 'എല്ലാ തടി ഇടപാടുകളും കേരള വനം ഉൽപ്പന്ന ട്രാൻസിറ്റ് ചട്ടങ്ങൾ പ്രകാരമാണ് നടക്കുന്നത്.' }), _jsxs("div", { className: "text-[11px] text-stone-500", children: ["\u00A9 ", new Date().getFullYear(), " Timora Smart Timber Marketplace. All rights reserved."] })] })] }) }), _jsx(MobileBottomNav, { lang: lang }), _jsx(SessionTimeoutModal, { lang: lang })] }) }) }));
}
