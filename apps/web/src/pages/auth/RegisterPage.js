import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Store, ShoppingBag, Hammer, User, KeyRound, Eye, EyeOff } from 'lucide-react';
import { validateIndianPhone, validatePin } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
export function RegisterPage({ lang = 'en' }) {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1); // 1: Details, 2: OTP, 3: Role & PIN
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [role, setRole] = useState('buyer');
    const [businessName, setBusinessName] = useState('');
    const [districtId, setDistrictId] = useState(5);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    // If already authenticated, redirect immediately
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'seller')
                navigate('/dashboard/seller', { replace: true });
            else if (user.role === 'admin')
                navigate('/admin', { replace: true });
            else
                navigate('/dashboard/buyer', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);
    // Step 1 Validation
    const handleStep1 = (e) => {
        e.preventDefault();
        setError(null);
        const trimmedName = name.trim();
        if (!trimmedName || trimmedName.length < 3) {
            setError(lang === 'en'
                ? 'Full Name must be at least 3 characters long.'
                : 'പേര് കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം.');
            return;
        }
        if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) {
            setError(lang === 'en'
                ? 'Name should contain alphabetic characters only.'
                : 'പേരിൽ അക്ഷരങ്ങൾ മാത്രം നൽകുക.');
            return;
        }
        const cleanPhone = phone.replace(/\D/g, '');
        const phoneCheck = validateIndianPhone(cleanPhone);
        if (!phoneCheck.valid) {
            setError(phoneCheck.message ||
                (lang === 'en'
                    ? 'Enter a valid 10-digit Indian mobile number.'
                    : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 250);
    };
    // Step 2 Validation (OTP)
    const handleStep2 = (e) => {
        e.preventDefault();
        setError(null);
        if (otp !== '123456' && otp.length !== 6) {
            setError(lang === 'en'
                ? 'Invalid verification code. Use demo code 123456.'
                : 'അസാധുവായ OTP. ഡെമോ കോഡ് 123456 ഉപയോഗിക്കുക.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(3);
        }, 250);
    };
    // Step 3 Validation (Role & PIN) -> Redirect to Login Page
    const handleStep3 = async (e) => {
        e.preventDefault();
        setError(null);
        if (role === 'seller' && (!businessName.trim() || businessName.trim().length < 3)) {
            setError(lang === 'en'
                ? 'Depot or Sawmill business name is required.'
                : 'ഡിപ്പോ അല്ലെങ്കിൽ സ്ഥാപനത്തിന്റെ പേര് നൽകുക.');
            return;
        }
        const pinCheck = validatePin(pin);
        if (!pinCheck.valid) {
            setError(pinCheck.message ||
                (lang === 'en'
                    ? 'Security PIN must be 6 numeric digits.'
                    : 'സുരക്ഷാ പിൻ 6 അക്കങ്ങൾ ആയിരിക്കണം.'));
            return;
        }
        if (pin !== pinConfirm) {
            setError(lang === 'en'
                ? 'Security PIN and Confirmation PIN do not match.'
                : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
            return;
        }
        setLoading(true);
        try {
            const authRole = role === 'seller' ? 'seller' : 'buyer';
            setSuccess(true);
            // Clean redirect to Login Page as requested!
            setTimeout(() => {
                navigate('/login', {
                    replace: true,
                    state: {
                        registered: true,
                        phone: phone.replace(/\D/g, ''),
                        role: authRole,
                    },
                });
            }, 1000);
        }
        catch {
            setError(lang === 'en' ? 'Registration failed.' : 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-[82vh] flex items-center justify-center px-4 py-8 bg-[#E7E1D6]", children: _jsxs("div", { className: "w-full max-w-md bg-white rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 shadow-md space-y-5", children: [_jsxs("div", { className: "text-center space-y-1", children: [_jsx(BrandLogo, { size: "md", lang: lang, className: "justify-center" }), _jsx("h1", { className: "text-xl font-extrabold font-serif text-[#4A3626] pt-1", children: lang === 'en' ? 'Create Timora Account' : 'ടിമോറയിൽ പുതിയ അക്കൗണ്ട്' }), _jsx("p", { className: "text-xs text-[#7A5A3A]", children: lang === 'en'
                                ? 'Connect directly with timber yards, buyers, and sawmills.'
                                : 'തടി വ്യാപാരികളുമായും മില്ലുകളുമായും നേരിട്ട് ബന്ധപ്പെടൂ.' })] }), _jsxs("div", { className: "flex items-center justify-center gap-2 text-[11px] font-bold", children: [_jsx("span", { className: `px-2.5 py-0.5 rounded-full ${step >= 1 ? 'bg-[#5B6147] text-white' : 'bg-stone-100 text-stone-500'}`, children: "1. Details" }), _jsx("span", { className: "text-[#8E7F6B]", children: "\u203A" }), _jsx("span", { className: `px-2.5 py-0.5 rounded-full ${step >= 2 ? 'bg-[#5B6147] text-white' : 'bg-stone-100 text-stone-500'}`, children: "2. OTP" }), _jsx("span", { className: "text-[#8E7F6B]", children: "\u203A" }), _jsx("span", { className: `px-2.5 py-0.5 rounded-full ${step >= 3 ? 'bg-[#5B6147] text-white' : 'bg-stone-100 text-stone-500'}`, children: "3. PIN & Role" })] }), error && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-fadeIn", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: error })] })), success ? (_jsxs("div", { className: "p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-fadeIn", children: [_jsx(CheckCircle2, { className: "w-10 h-10 text-emerald-600 mx-auto" }), _jsx("h3", { className: "text-sm font-bold text-emerald-950", children: lang === 'en' ? 'Registration Successful!' : 'രജിസ്ട്രേഷൻ പൂർത്തിയായി!' }), _jsx("p", { className: "text-xs text-emerald-800", children: lang === 'en'
                                ? 'Redirecting to Sign In page to verify credentials...'
                                : 'ലോഗിൻ പേജിലേക്ക് തിരിയുന്നു...' })] })) : (_jsxs(_Fragment, { children: [step === 1 && (_jsxs("form", { onSubmit: handleStep1, className: "space-y-3.5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Full Legal Name' : 'പൂർണ്ണ നാമം' }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-4 h-4 absolute left-3 top-2.5 text-[#8E7F6B]" }), _jsx("input", { type: "text", placeholder: lang === 'en' ? 'e.g. Suresh Kumar' : 'ഉദാ: സുരേഷ് കുമാർ', value: name, onChange: (e) => {
                                                        setName(e.target.value);
                                                        if (error)
                                                            setError(null);
                                                    }, className: "w-full pl-9 pr-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] }), _jsx("span", { className: "text-[10px] text-[#8E7F6B] mt-0.5 block", children: lang === 'en' ? 'Minimum 3 characters' : 'കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ' })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? '10-Digit Mobile Number' : 'മൊബൈൽ നമ്പർ' }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-2 text-xs font-bold text-[#8E7F6B]", children: "+91" }), _jsx("input", { type: "tel", maxLength: 10, placeholder: "9847123456", value: phone, onChange: (e) => {
                                                        setPhone(e.target.value.replace(/\D/g, ''));
                                                        if (error)
                                                            setError(null);
                                                    }, className: "w-full pl-11 pr-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] }), _jsx("span", { className: "text-[10px] text-[#8E7F6B] mt-0.5 block", children: lang === 'en' ? 'Standard 10-digit Indian phone number' : '10-അക്ക മൊബൈൽ നമ്പർ' })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Next: OTP Verification' : 'അടുത്തത്: OTP' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })), step === 2 && (_jsxs("form", { onSubmit: handleStep2, className: "space-y-3.5", children: [_jsx("div", { className: "p-2.5 bg-[#E7E1D6]/60 rounded-xl text-xs text-[#4A3626] text-center", children: _jsxs("span", { children: ["Demo Sandbox OTP: ", _jsx("b", { className: "font-mono text-sm", children: "123456" })] }) }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1 text-center", children: lang === 'en' ? 'Enter 6-Digit OTP' : '6-അക്ക OTP നൽകുക' }), _jsx("input", { type: "text", maxLength: 6, value: otp, onChange: (e) => {
                                                setOtp(e.target.value.replace(/\D/g, ''));
                                                if (error)
                                                    setError(null);
                                            }, placeholder: "123456", className: "w-full py-2 rounded-xl border border-[#8E7F6B]/30 text-base font-mono font-bold tracking-widest text-center text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Verify OTP Code' : 'OTP സ്ഥിരീകരിക്കുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })), step === 3 && (_jsxs("form", { onSubmit: handleStep3, className: "space-y-3.5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1.5", children: lang === 'en' ? 'Select Marketplace Account Role' : 'റോൾ തിരഞ്ഞെടുക്കുക' }), _jsxs("div", { className: "grid grid-cols-3 gap-1.5 text-xs font-bold text-center", children: [_jsxs("button", { type: "button", onClick: () => setRole('buyer'), className: `p-2 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${role === 'buyer'
                                                        ? 'border-[#5B6147] bg-[#5B6147] text-white'
                                                        : 'border-[#8E7F6B]/30 bg-stone-50 text-[#4A3626]'}`, children: [_jsx(ShoppingBag, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Buyer' : 'ബയർ' })] }), _jsxs("button", { type: "button", onClick: () => setRole('seller'), className: `p-2 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${role === 'seller'
                                                        ? 'border-[#5B6147] bg-[#5B6147] text-white'
                                                        : 'border-[#8E7F6B]/30 bg-stone-50 text-[#4A3626]'}`, children: [_jsx(Store, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Seller Depot' : 'സെല്ലർ' })] }), _jsxs("button", { type: "button", onClick: () => setRole('carpenter'), className: `p-2 rounded-xl border transition flex flex-col items-center justify-center gap-1 ${role === 'carpenter'
                                                        ? 'border-[#5B6147] bg-[#5B6147] text-white'
                                                        : 'border-[#8E7F6B]/30 bg-stone-50 text-[#4A3626]'}`, children: [_jsx(Hammer, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Carpenter' : 'ആശാരി' })] })] })] }), role === 'seller' && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Timber Depot or Sawmill Name' : 'ഡിപ്പോ നാമം' }), _jsx("input", { type: "text", placeholder: "e.g. Nilambur Wood Mart", value: businessName, onChange: (e) => setBusinessName(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? '6-Digit PIN' : '6-അക്ക പിൻ' }), _jsxs("button", { type: "button", onClick: () => setShowPin(!showPin), className: "text-[11px] text-[#8E7F6B] hover:text-[#4A3626] flex items-center gap-1 font-semibold", title: showPin ? 'Hide PIN' : 'Show PIN', children: [showPin ? _jsx(EyeOff, { className: "w-3 h-3" }) : _jsx(Eye, { className: "w-3 h-3" }), _jsx("span", { children: showPin ? (lang === 'en' ? 'Hide' : 'മറയ്ക്കുക') : (lang === 'en' ? 'Show' : 'കാണിക്കുക') })] })] }), _jsxs("div", { className: "relative", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E7F6B]" }), _jsx("input", { type: showPin ? 'text' : 'password', maxLength: 6, value: pin, onChange: (e) => {
                                                                setPin(e.target.value.replace(/\D/g, ''));
                                                                if (error)
                                                                    setError(null);
                                                            }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full py-2 pl-8 pr-2 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Confirm PIN' : 'സ്ഥിരീകരിക്കുക' }), _jsxs("div", { className: "relative", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E7F6B]" }), _jsx("input", { type: showPin ? 'text' : 'password', maxLength: 6, value: pinConfirm, onChange: (e) => {
                                                                setPinConfirm(e.target.value.replace(/\D/g, ''));
                                                                if (error)
                                                                    setError(null);
                                                            }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full py-2 pl-8 pr-2 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Create Account & Continue to Login' : 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] }))] })), _jsxs("div", { className: "text-center pt-1 text-xs text-[#7A5A3A]", children: [lang === 'en' ? 'Already have an account?' : 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?', ' ', _jsx(Link, { to: "/login", className: "font-bold text-[#5B6147] hover:underline", children: lang === 'en' ? 'Sign In' : 'ലോഗിൻ ചെയ്യുക' })] })] }) }));
}
