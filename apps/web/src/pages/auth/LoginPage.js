import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound, AlertCircle, ArrowRight, Shield, Store, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { validateIndianPhone } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
export function LoginPage({ lang = 'en' }) {
    const navigate = useNavigate();
    const { user, isAuthenticated, login, loginAsDemo } = useAuth();
    const [selectedRole, setSelectedRole] = useState('buyer');
    const [phone, setPhone] = useState('9847987654');
    const [pin, setPin] = useState('123456');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(null);
    const getDestination = (role) => {
        switch (role) {
            case 'seller':
                return '/dashboard/seller';
            case 'admin':
                return '/admin';
            case 'buyer':
            default:
                return '/dashboard/buyer';
        }
    };
    // If already logged in, automatically redirect immediately to the respective dashboard
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(getDestination(user.role), { replace: true });
        }
    }, [isAuthenticated, user, navigate]);
    // Helper to switch default demo credentials based on role tab
    const handleRoleTabChange = (role) => {
        setSelectedRole(role);
        setError(null);
        if (role === 'seller') {
            setPhone('9847120001');
            setPin('123456');
        }
        else if (role === 'admin') {
            setPhone('9847000000');
            setPin('123456');
        }
        else {
            setPhone('9847987654');
            setPin('123456');
        }
    };
    // 1-Click Instant Demo Login & Automatic Redirection
    const handleQuickDemo = (role) => {
        setError(null);
        setLoading(true);
        setRedirecting(role);
        loginAsDemo(role);
        const destination = getDestination(role);
        setTimeout(() => {
            navigate(destination, { replace: true });
        }, 150);
    };
    // Regular Phone & PIN Login & Automatic Redirection
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const phoneCheck = validateIndianPhone(phone);
        if (!phoneCheck.valid) {
            setError(phoneCheck.message || (lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.'));
            return;
        }
        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            setError(lang === 'en' ? 'Please enter your 6-digit security PIN.' : 'ദയവായി നിങ്ങളുടെ 6-അക്ക സുരക്ഷാ പിൻ നൽകുക.');
            return;
        }
        setLoading(true);
        try {
            const res = await login(phone, pin, selectedRole);
            if (res.success && res.role) {
                setRedirecting(res.role);
                const targetPath = getDestination(res.role);
                setTimeout(() => {
                    navigate(targetPath, { replace: true });
                }, 150);
            }
            else {
                setError(res.error || (lang === 'en' ? 'Authentication failed. Please verify credentials.' : 'ലോഗിൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ ശരിയാണോ എന്ന് പരിശോധിക്കുക.'));
                setLoading(false);
            }
        }
        catch {
            setError(lang === 'en' ? 'Unable to connect to service. Please try again.' : 'സർവ്വറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-[85vh] flex items-center justify-center px-4 py-10 bg-gradient-to-b from-stone-100 via-slate-50 to-emerald-50/30", children: _jsxs("div", { className: "w-full max-w-lg bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl shadow-stone-900/5 space-y-6", children: [_jsxs("div", { className: "flex flex-col items-center text-center space-y-2", children: [_jsx(BrandLogo, { size: "lg", lang: lang }), _jsx("h1", { className: "text-xl sm:text-2xl font-bold text-slate-900 pt-2", children: lang === 'en' ? 'Sign in to Timora' : 'ടിമോറ അക്കൗണ്ടിലേക്ക് പ്രവേശിക്കുക' }), _jsx("p", { className: "text-xs sm:text-sm text-slate-500 max-w-sm", children: lang === 'en'
                                ? 'Select your account type to securely access your dedicated timber portal.'
                                : 'നിങ്ങളുടെ പ്രത്യേക തടി പോർട്ടൽ ആക്സസ് ചെയ്യാൻ അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക.' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center", children: lang === 'en' ? 'Select Your Account Role' : 'താങ്കളുടെ റോൾ തിരഞ്ഞെടുക്കുക' }), _jsxs("div", { className: "grid grid-cols-3 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200", children: [_jsxs("button", { type: "button", onClick: () => handleRoleTabChange('buyer'), className: `flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'buyer'
                                        ? 'bg-white text-forest-800 shadow-sm ring-1 ring-forest-700/20'
                                        : 'text-slate-600 hover:text-slate-900'}`, children: [_jsx(ShoppingBag, { className: "w-4 h-4 mb-1 text-forest-700" }), _jsx("span", { children: lang === 'en' ? 'Buyer' : 'ഉപഭോക്താവ്' })] }), _jsxs("button", { type: "button", onClick: () => handleRoleTabChange('seller'), className: `flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'seller'
                                        ? 'bg-white text-amber-800 shadow-sm ring-1 ring-amber-700/20'
                                        : 'text-slate-600 hover:text-slate-900'}`, children: [_jsx(Store, { className: "w-4 h-4 mb-1 text-amber-600" }), _jsx("span", { children: lang === 'en' ? 'Seller Depot' : 'കച്ചവടക്കാരൻ' })] }), _jsxs("button", { type: "button", onClick: () => handleRoleTabChange('admin'), className: `flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${selectedRole === 'admin'
                                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-400'
                                        : 'text-slate-600 hover:text-slate-900'}`, children: [_jsx(Shield, { className: "w-4 h-4 mb-1 text-slate-700" }), _jsx("span", { children: lang === 'en' ? 'Admin' : 'അഡ്മിൻ' })] })] })] }), error && (_jsxs("div", { className: "p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" }), _jsx("span", { children: error })] })), redirecting && (_jsxs("div", { className: "p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-3 text-emerald-900 font-semibold text-xs sm:text-sm animate-pulse", children: [_jsx(CheckCircle2, { className: "w-5 h-5 text-emerald-600" }), _jsx("span", { children: lang === 'en'
                                ? `Logged in! Entering ${redirecting.toUpperCase()} Dashboard...`
                                : `വിജയകരമായി ലോഗിൻ ചെയ്തു! ${redirecting} ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുന്നു...` })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsxs("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between", children: [_jsx("span", { children: lang === 'en' ? 'Registered Mobile Number' : 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ' }), _jsx("span", { className: "text-[10px] text-slate-400 font-normal", children: "India (+91)" })] }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3.5 top-3 text-sm font-bold text-slate-500", children: "+91" }), _jsx("input", { type: "tel", placeholder: "9847123456", maxLength: 10, value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, '')), className: "w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-forest-600 focus:border-forest-600 focus:outline-none transition", required: true })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("label", { className: "text-xs font-semibold text-slate-700", children: lang === 'en' ? '6-Digit Security PIN' : '6-അക്ക സുരക്ഷാ പിൻ (PIN)' }), _jsx("span", { className: "text-[10px] text-forest-700 font-medium", children: lang === 'en' ? 'Default demo: 123456' : 'ഡെമോ പിൻ: 123456' })] }), _jsxs("div", { className: "relative", children: [_jsx(KeyRound, { className: "w-4 h-4 absolute left-3.5 top-3 text-slate-400" }), _jsx("input", { type: "password", maxLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: pin, onChange: (e) => setPin(e.target.value.replace(/\D/g, '')), className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-forest-600 focus:border-forest-600 focus:outline-none transition", required: true })] })] }), _jsx("button", { type: "submit", disabled: loading || !!redirecting, className: "w-full py-3 px-4 rounded-xl bg-gradient-to-r from-forest-800 to-forest-700 hover:from-forest-900 hover:to-forest-800 text-white font-bold text-sm shadow-md shadow-forest-900/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 animate-spin" }), _jsx("span", { children: lang === 'en' ? 'Authenticating & Entering Dashboard...' : 'പരിശോധിച്ച് പ്രവേശിക്കുന്നു...' })] })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en'
                                            ? `Sign In as ${selectedRole.toUpperCase()}`
                                            : `${selectedRole} ആയി ലോഗിൻ ചെയ്യുക` }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] }), _jsxs("div", { className: "pt-2", children: [_jsxs("div", { className: "relative flex py-2 items-center", children: [_jsx("div", { className: "flex-grow border-t border-slate-200" }), _jsx("span", { className: "flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider", children: lang === 'en' ? 'Or One-Click Instant Access' : 'അല്ലെങ്കിൽ തൽക്ഷണ ഡെമോ ആക്സസ്' }), _jsx("div", { className: "flex-grow border-t border-slate-200" })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2", children: [_jsxs("button", { type: "button", onClick: () => handleQuickDemo('seller'), disabled: loading || !!redirecting, className: "py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs", children: [_jsx(Store, { className: "w-3.5 h-3.5 text-amber-700" }), _jsx("span", { children: lang === 'en' ? 'Seller Depot' : 'സെല്ലർ ഡെമോ' })] }), _jsxs("button", { type: "button", onClick: () => handleQuickDemo('buyer'), disabled: loading || !!redirecting, className: "py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs", children: [_jsx(ShoppingBag, { className: "w-3.5 h-3.5 text-emerald-700" }), _jsx("span", { children: lang === 'en' ? 'Buyer Demo' : 'ബയർ ഡെമോ' })] }), _jsxs("button", { type: "button", onClick: () => handleQuickDemo('admin'), disabled: loading || !!redirecting, className: "py-2.5 px-3 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs", children: [_jsx(Shield, { className: "w-3.5 h-3.5 text-slate-700" }), _jsx("span", { children: lang === 'en' ? 'Admin Demo' : 'അഡ്മിൻ ഡെമോ' })] })] })] }), _jsxs("div", { className: "text-center pt-2 border-t border-slate-100 text-xs text-slate-500", children: [lang === 'en' ? "Don't have an account yet?" : 'ടിമോറയിൽ അക്കൗണ്ട് ഇല്ലേ? ', ' ', _jsx(Link, { to: "/register", className: "font-bold text-forest-700 hover:text-forest-900 hover:underline", children: lang === 'en' ? 'Register New Account' : 'പുതിയ അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യുക' })] })] }) }));
}
