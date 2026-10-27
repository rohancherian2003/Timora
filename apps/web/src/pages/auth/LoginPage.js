import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, KeyRound, AlertCircle, ArrowRight, Shield, Store, ShoppingBag, Loader2 } from 'lucide-react';
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
    // If already logged in, redirect immediately to prevent landing on login page
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate(getDestination(user.role), { replace: true });
        }
    }, [isAuthenticated, user, navigate]);
    const handleRoleChange = (role) => {
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
    const handleQuickDemo = (role) => {
        setError(null);
        setLoading(true);
        loginAsDemo(role);
        const dest = getDestination(role);
        navigate(dest, { replace: true });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        const phoneCheck = validateIndianPhone(phone);
        if (!phoneCheck.valid) {
            setError(phoneCheck.message || (lang === 'en' ? 'Valid 10-digit number required.' : 'സാധുവായ 10-അക്ക നമ്പർ നൽകുക.'));
            return;
        }
        if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
            setError(lang === 'en' ? 'Enter 6-digit security PIN.' : '6-അക്ക പിൻ നൽകുക.');
            return;
        }
        setLoading(true);
        try {
            const res = await login(phone, pin, selectedRole);
            if (res.success && res.role) {
                navigate(getDestination(res.role), { replace: true });
            }
            else {
                setError(res.error || (lang === 'en' ? 'Authentication failed.' : 'ലോഗിൻ പരാജയപ്പെട്ടു.'));
                setLoading(false);
            }
        }
        catch {
            setError(lang === 'en' ? 'Unable to connect to service.' : 'സർവ്വറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല.');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center px-4 py-8 bg-[#E7E1D6]", children: _jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 shadow-md space-y-5", children: [_jsxs("div", { className: "flex flex-col items-center text-center space-y-1", children: [_jsx(BrandLogo, { size: "md", lang: lang }), _jsx("h1", { className: "text-xl font-extrabold font-serif text-[#4A3626] pt-2", children: lang === 'en' ? 'Sign In to Timora' : 'ടിമോറയിലേക്ക് പ്രവേശിക്കുക' }), _jsx("p", { className: "text-xs text-[#7A5A3A]", children: lang === 'en'
                                ? 'Select your role and sign in to access your portal.'
                                : 'റോൾ തിരഞ്ഞെടുത്ത് അക്കൗണ്ടിലേക്ക് പ്രവേശിക്കുക.' })] }), _jsxs("div", { className: "grid grid-cols-3 p-1 rounded-2xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/20 gap-1 text-center", children: [_jsxs("button", { type: "button", onClick: () => handleRoleChange('buyer'), className: `py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${selectedRole === 'buyer'
                                ? 'bg-white text-[#4A3626] shadow-xs'
                                : 'text-[#7A5A3A] hover:text-[#4A3626]'}`, children: [_jsx(ShoppingBag, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Buyer' : 'ബയർ' })] }), _jsxs("button", { type: "button", onClick: () => handleRoleChange('seller'), className: `py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${selectedRole === 'seller'
                                ? 'bg-white text-[#4A3626] shadow-xs'
                                : 'text-[#7A5A3A] hover:text-[#4A3626]'}`, children: [_jsx(Store, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Seller' : 'സെല്ലർ' })] }), _jsxs("button", { type: "button", onClick: () => handleRoleChange('admin'), className: `py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${selectedRole === 'admin'
                                ? 'bg-white text-[#4A3626] shadow-xs'
                                : 'text-[#7A5A3A] hover:text-[#4A3626]'}`, children: [_jsx(Shield, { className: "w-3.5 h-3.5 text-[#5B6147]" }), _jsx("span", { children: lang === 'en' ? 'Admin' : 'അഡ്മിൻ' })] })] }), error && (_jsxs("div", { className: "p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: error })] })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Phone Number' : 'ഫോൺ നമ്പർ' }), _jsxs("div", { className: "relative", children: [_jsx(Phone, { className: "w-4 h-4 absolute left-3.5 top-3 text-[#8E7F6B]" }), _jsx("input", { type: "tel", value: phone, onChange: (e) => setPhone(e.target.value), placeholder: "10-digit mobile number", className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#8E7F6B]/30 text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? 'Security PIN' : 'സുരക്ഷാ പിൻ' }), _jsx("span", { className: "text-[10px] text-[#8E7F6B]", children: lang === 'en' ? 'Demo: 123456' : 'ഡെമോ: 123456' })] }), _jsxs("div", { className: "relative", children: [_jsx(KeyRound, { className: "w-4 h-4 absolute left-3.5 top-3 text-[#8E7F6B]" }), _jsx("input", { type: "password", maxLength: 6, value: pin, onChange: (e) => setPin(e.target.value.replace(/\D/g, '')), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#8E7F6B]/30 text-base font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Sign In' : 'ലോഗിൻ ചെയ്യുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] }), _jsxs("div", { className: "pt-2 border-t border-[#8E7F6B]/20", children: [_jsx("span", { className: "text-[10px] uppercase font-bold text-[#8E7F6B] tracking-wider block text-center mb-2", children: lang === 'en' ? 'Instant 1-Click Demo' : 'ഡെമോ ആക്സസ്' }), _jsxs("div", { className: "grid grid-cols-3 gap-2", children: [_jsx("button", { type: "button", onClick: () => handleQuickDemo('buyer'), className: "py-1.5 px-2 rounded-xl border border-[#8E7F6B]/30 bg-stone-50 hover:bg-stone-100 text-[#4A3626] text-[11px] font-bold text-center transition", children: "Buyer Demo" }), _jsx("button", { type: "button", onClick: () => handleQuickDemo('seller'), className: "py-1.5 px-2 rounded-xl border border-[#8E7F6B]/30 bg-stone-50 hover:bg-stone-100 text-[#4A3626] text-[11px] font-bold text-center transition", children: "Seller Demo" }), _jsx("button", { type: "button", onClick: () => handleQuickDemo('admin'), className: "py-1.5 px-2 rounded-xl border border-[#8E7F6B]/30 bg-stone-50 hover:bg-stone-100 text-[#4A3626] text-[11px] font-bold text-center transition", children: "Admin Demo" })] })] }), _jsxs("div", { className: "text-center pt-1 text-xs text-[#7A5A3A]", children: [lang === 'en' ? "Don't have an account?" : 'അക്കൗണ്ട് ഇല്ലേ?', ' ', _jsx(Link, { to: "/register", className: "font-bold text-[#5B6147] hover:underline", children: lang === 'en' ? 'Register' : 'രജിസ്റ്റർ ചെയ്യുക' })] })] }) }));
}
