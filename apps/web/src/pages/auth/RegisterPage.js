import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Store, ShoppingBag, Hammer } from 'lucide-react';
import { validateIndianPhone, validatePin } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
export function RegisterPage({ lang = 'en' }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [step, setStep] = useState(1); // 1: Details & Phone, 2: OTP, 3: PIN & Role
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [role, setRole] = useState('buyer');
    const [businessName, setBusinessName] = useState('');
    const [districtId, setDistrictId] = useState(5); // default Kottayam
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const handleStep1 = (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError(lang === 'en' ? 'Please enter your full name.' : 'നിങ്ങളുടെ പേര് നൽകുക.');
            return;
        }
        const check = validateIndianPhone(phone);
        if (!check.valid) {
            setError(check.message || (lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'സാധുവായ മൊബൈൽ നമ്പർ നൽകുക.'));
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 400);
    };
    const handleStep2 = (e) => {
        e.preventDefault();
        setError(null);
        if (otp.length !== 6) {
            setError(lang === 'en' ? 'Please enter the 6-digit OTP code.' : '6-അക്ക OTP നൽകുക.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setStep(3);
        }, 400);
    };
    const handleStep3 = async (e) => {
        e.preventDefault();
        setError(null);
        const pinCheck = validatePin(pin);
        if (!pinCheck.valid) {
            setError(pinCheck.message || (lang === 'en' ? 'Please enter a valid 6-digit PIN.' : '6-അക്ക പിൻ നൽകുക.'));
            return;
        }
        if (pin !== pinConfirm) {
            setError(lang === 'en' ? 'PIN and confirmation do not match.' : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
            return;
        }
        setLoading(true);
        try {
            // Map 'carpenter' to 'buyer' or role in context
            const authRole = role === 'seller' ? 'seller' : 'buyer';
            await login(phone, pin, authRole);
            setSuccess(true);
            setTimeout(() => {
                if (authRole === 'seller') {
                    navigate('/dashboard/seller');
                }
                else {
                    navigate('/dashboard/buyer');
                }
            }, 1000);
        }
        catch {
            setError(lang === 'en' ? 'Registration failed. Please try again.' : 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.');
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8]", children: _jsxs("div", { className: "w-full max-w-lg bg-white rounded-3xl border border-amber-200/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx(BrandLogo, { size: "md", lang: lang, className: "justify-center" }), _jsx("h1", { className: "text-xl sm:text-2xl font-extrabold font-serif text-[#2c160b] pt-2", children: lang === 'en' ? 'Create Your Timora Account' : 'ടിമോറയിൽ പുതിയ അക്കൗണ്ട് തുറക്കൂ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#6b472e] max-w-sm mx-auto font-medium", children: lang === 'en'
                                ? 'Connect directly with certified timber yards, buyers, and sawmills across Kerala.'
                                : 'കേരളത്തിലെ വിശ്വസനീയമായ തടി വ്യാപാരികളുമായും ഉപഭോക്താക്കളുമായും നേരിട്ട് ബന്ധപ്പെടൂ.' })] }), _jsxs("div", { className: "flex items-center justify-between max-w-xs mx-auto text-xs font-bold pt-1", children: [_jsxs("span", { className: `px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-[#b45309] text-white' : 'bg-stone-200 text-stone-500'}`, children: ["1. ", lang === 'en' ? 'Phone' : 'നമ്പർ'] }), _jsx("span", { className: "text-amber-300", children: "\u2500\u2500" }), _jsx("span", { className: `px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-[#b45309] text-white' : 'bg-stone-200 text-stone-500'}`, children: "2. OTP" }), _jsx("span", { className: "text-amber-300", children: "\u2500\u2500" }), _jsxs("span", { className: `px-2.5 py-1 rounded-full ${step >= 3 ? 'bg-[#b45309] text-white' : 'bg-stone-200 text-stone-500'}`, children: ["3. ", lang === 'en' ? 'Role & PIN' : 'പിൻ'] })] }), error && (_jsxs("div", { className: "p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), success ? (_jsxs("div", { className: "p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 animate-fadeIn", children: [_jsx(CheckCircle2, { className: "w-10 h-10 text-emerald-600 mx-auto animate-bounce" }), _jsx("h3", { className: "text-base font-bold text-emerald-950", children: lang === 'en' ? 'Registration Successful!' : 'രജിസ്ട്രേഷൻ വിജയകരമായി പൂർത്തിയായി!' }), _jsx("p", { className: "text-xs text-emerald-800", children: lang === 'en' ? 'Redirecting directly to your personal dashboard...' : 'നിങ്ങളുടെ ഡാഷ്‌ബോർഡിലേക്ക് തിരിയുന്നു...' })] })) : (_jsxs(_Fragment, { children: [step === 1 && (_jsxs("form", { onSubmit: handleStep1, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-1.5", children: lang === 'en' ? 'Full Legal Name' : 'പൂർണ്ണ നാമം' }), _jsx("input", { type: "text", placeholder: lang === 'en' ? 'e.g. Suresh Kumar' : 'ഉദാ: സുരേഷ് കുമാർ', value: name, onChange: (e) => setName(e.target.value), className: "w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:ring-2 focus:ring-[#b45309] focus:outline-none", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-1.5", children: lang === 'en' ? '10-Digit Mobile Number' : '10-അക്ക മൊബൈൽ നമ്പർ' }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3.5 top-2.5 text-sm font-bold text-stone-500", children: "+91" }), _jsx("input", { type: "tel", placeholder: "9847123456", maxLength: 10, value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, '')), className: "w-full pl-12 pr-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:ring-2 focus:ring-[#b45309] focus:outline-none", required: true })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center justify-center gap-2", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Send OTP Verification' : 'OTP അയക്കുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })), step === 2 && (_jsxs("form", { onSubmit: handleStep2, className: "space-y-4", children: [_jsxs("div", { className: "p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed", children: [_jsx("span", { className: "font-bold", children: lang === 'en' ? 'Demo Sandbox OTP: ' : 'ഡെമോ OTP: ' }), _jsxs("span", { children: [lang === 'en' ? 'Use code ' : 'കോഡ് ', _jsx("b", { className: "font-mono text-sm", children: "123456" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-1.5", children: lang === 'en' ? 'Enter 6-Digit Verification Code' : '6-അക്ക OTP നൽകുക' }), _jsx("input", { type: "text", maxLength: 6, placeholder: "123456", value: otp, onChange: (e) => setOtp(e.target.value.replace(/\D/g, '')), className: "w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50", required: true })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center justify-center gap-2", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Verify & Continue' : 'OTP സ്ഥിരീകരിക്കുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })), step === 3 && (_jsxs("form", { onSubmit: handleStep3, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-2", children: lang === 'en' ? 'Choose Your Marketplace Role' : 'അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക' }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs font-bold", children: [_jsxs("button", { type: "button", onClick: () => setRole('buyer'), className: `p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${role === 'buyer'
                                                        ? 'border-[#b45309] bg-amber-50 text-amber-950 ring-2 ring-[#b45309] shadow-xs'
                                                        : 'border-amber-200/70 text-stone-600 hover:bg-[#faf6ee]'}`, children: [_jsx(ShoppingBag, { className: "w-4 h-4 text-emerald-700" }), _jsx("span", { children: lang === 'en' ? 'Timber Buyer' : 'ഉപഭോക്താവ്' })] }), _jsxs("button", { type: "button", onClick: () => setRole('seller'), className: `p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${role === 'seller'
                                                        ? 'border-[#b45309] bg-amber-100/70 text-amber-950 ring-2 ring-[#b45309] shadow-xs'
                                                        : 'border-amber-200/70 text-stone-600 hover:bg-[#faf6ee]'}`, children: [_jsx(Store, { className: "w-4 h-4 text-amber-700" }), _jsx("span", { children: lang === 'en' ? 'Timber Depot' : 'തടിക്കച്ചവടം' })] }), _jsxs("button", { type: "button", onClick: () => setRole('carpenter'), className: `p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${role === 'carpenter'
                                                        ? 'border-stone-700 bg-stone-100 text-stone-900 ring-2 ring-stone-700 shadow-xs'
                                                        : 'border-amber-200/70 text-stone-600 hover:bg-[#faf6ee]'}`, children: [_jsx(Hammer, { className: "w-4 h-4 text-stone-700" }), _jsx("span", { children: lang === 'en' ? 'Carpenter' : 'ആശാരി' })] })] })] }), role === 'seller' && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-1.5", children: lang === 'en' ? 'Depot or Sawmill Name' : 'തടി ഡിപ്പോ / വ്യാപാര സ്ഥാപനത്തിന്റെ പേര്' }), _jsx("input", { type: "text", placeholder: lang === 'en' ? 'e.g. Kottayam Timber Works' : 'ഉദാ: കോട്ടയം ടിംബർ വർക്സ്', value: businessName, onChange: (e) => setBusinessName(e.target.value), className: "w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50", required: true })] })), _jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-1.5", children: lang === 'en' ? '6-Digit PIN' : '6-അക്ക പിൻ' }), _jsx("input", { type: "password", maxLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: pin, onChange: (e) => setPin(e.target.value.replace(/\D/g, '')), className: "w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-stone-700 mb-1.5", children: lang === 'en' ? 'Confirm PIN' : 'പിൻ സ്ഥിരീകരിക്കുക' }), _jsx("input", { type: "password", maxLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: pinConfirm, onChange: (e) => setPinConfirm(e.target.value.replace(/\D/g, '')), className: "w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-3 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 transition flex items-center justify-center gap-2", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Complete Registration & Enter' : 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക' }), _jsx(CheckCircle2, { className: "w-4 h-4" })] })) })] }))] })), _jsxs("div", { className: "text-center pt-3 border-t border-amber-100 text-xs text-stone-500", children: [lang === 'en' ? 'Already have an account? ' : 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ? ', ' ', _jsx(Link, { to: "/login", className: "font-bold text-[#b45309] hover:underline", children: lang === 'en' ? 'Sign in here' : 'ഇവിടെ ലോഗിൻ ചെയ്യുക' })] })] }) }));
}
