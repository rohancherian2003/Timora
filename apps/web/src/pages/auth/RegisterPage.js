import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { validateIndianPhone, validatePin } from '@timora/shared';
export function RegisterPage({ lang = 'en' }) {
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
    const handleStep1 = (e) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError(lang === 'en' ? 'Please enter your name.' : 'നിങ്ങളുടെ പേര് നൽകുക.');
            return;
        }
        const check = validateIndianPhone(phone);
        if (!check.valid) {
            setError(check.message || 'Please enter a valid 10-digit mobile number.');
            return;
        }
        setStep(2);
    };
    const handleStep2 = (e) => {
        e.preventDefault();
        setError(null);
        if (otp.length !== 6) {
            setError(lang === 'en' ? 'Please enter the 6-digit OTP code.' : '6-അക്ക OTP നൽകുക.');
            return;
        }
        setStep(3);
    };
    const handleStep3 = (e) => {
        e.preventDefault();
        setError(null);
        const pinCheck = validatePin(pin);
        if (!pinCheck.valid) {
            setError(pinCheck.message || 'Please enter a valid 6-digit PIN.');
            return;
        }
        if (pin !== pinConfirm) {
            setError(lang === 'en' ? 'PIN and confirmation do not match.' : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
            return;
        }
        alert(lang === 'en' ? 'Registration complete! Welcome to Timora.' : 'രജിസ്ട്രേഷൻ വിജയകരമായി പൂർത്തിയായി!');
    };
    return (_jsx("div", { className: "min-h-[85vh] flex items-center justify-center px-4 py-12", children: _jsxs("div", { className: "w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6", children: [_jsxs("div", { className: "text-center space-y-2", children: [_jsx("div", { className: "w-12 h-12 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto text-forest-800", children: _jsx(UserPlus, { className: "w-6 h-6" }) }), _jsx("h1", { className: "text-2xl font-bold text-slate-900", children: lang === 'en' ? 'Join Timora Marketplace' : 'ടിമോറയിൽ ചേരുക' }), _jsx("p", { className: "text-xs text-slate-500", children: lang === 'en'
                                ? 'Connect directly with timber merchants, carpenters, and buyers in Kerala.'
                                : 'കേരളത്തിലെ തടിക്കച്ചവടക്കാർ, ആശാരിമാർ, വീട് പണിയുന്നവർ എന്നിവരുമായി ബന്ധപ്പെടൂ.' })] }), _jsxs("div", { className: "flex items-center justify-between max-w-xs mx-auto text-xs font-semibold", children: [_jsx("span", { className: step >= 1 ? 'text-forest-700' : 'text-slate-400', children: "1. Phone" }), _jsx("span", { className: "text-slate-300", children: "\u2192" }), _jsx("span", { className: step >= 2 ? 'text-forest-700' : 'text-slate-400', children: "2. OTP" }), _jsx("span", { className: "text-slate-300", children: "\u2192" }), _jsx("span", { className: step >= 3 ? 'text-forest-700' : 'text-slate-400', children: "3. PIN & Role" })] }), error && (_jsxs("div", { className: "p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0 mt-0.5" }), _jsx("span", { children: error })] })), step === 1 && (_jsxs("form", { onSubmit: handleStep1, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Full Name' : 'പൂർണ്ണ നാമം' }), _jsx("input", { type: "text", placeholder: lang === 'en' ? 'e.g. Suresh Kumar' : 'ഉദാ: സുരേഷ് കുമാർ', value: name, onChange: (e) => setName(e.target.value), className: "w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Mobile Number' : 'മൊബൈൽ നമ്പർ' }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400", children: "+91" }), _jsx("input", { type: "tel", placeholder: "9847123456", maxLength: 10, value: phone, onChange: (e) => setPhone(e.target.value.replace(/\D/g, '')), className: "w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none", required: true })] })] }), _jsxs("button", { type: "submit", className: "w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2", children: [lang === 'en' ? 'Send OTP Code' : 'OTP അയക്കുക', _jsx(ArrowRight, { className: "w-4 h-4" })] })] })), step === 2 && (_jsxs("form", { onSubmit: handleStep2, className: "space-y-4", children: [_jsx("div", { className: "p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900", children: lang === 'en'
                                ? `Demo Mode: OTP for +91${phone} is 123456.`
                                : `ഡെമോ മോഡ്: +91${phone} നമ്പറിലേക്കുള്ള OTP 123456 ആണ്.` }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Enter 6-Digit OTP' : '6-അക്ക OTP നൽകുക' }), _jsx("input", { type: "text", maxLength: 6, placeholder: "123456", value: otp, onChange: (e) => setOtp(e.target.value.replace(/\D/g, '')), className: "w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none", required: true })] }), _jsxs("button", { type: "submit", className: "w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2", children: [lang === 'en' ? 'Verify OTP' : 'OTP പരിശോധിക്കുക', _jsx(ArrowRight, { className: "w-4 h-4" })] })] })), step === 3 && (_jsxs("form", { onSubmit: handleStep3, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Select Your Account Type' : 'അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക' }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-xs font-semibold", children: [_jsx("button", { type: "button", onClick: () => setRole('buyer'), className: `p-3 rounded-xl border text-center transition ${role === 'buyer'
                                                ? 'border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700'
                                                : 'border-slate-200 text-slate-600'}`, children: lang === 'en' ? 'Buyer / House Owner' : 'തടി വാങ്ങുന്നവർ' }), _jsx("button", { type: "button", onClick: () => setRole('seller'), className: `p-3 rounded-xl border text-center transition ${role === 'seller'
                                                ? 'border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700'
                                                : 'border-slate-200 text-slate-600'}`, children: lang === 'en' ? 'Timber Seller' : 'തടിക്കച്ചവടക്കാർ' }), _jsx("button", { type: "button", onClick: () => setRole('carpenter'), className: `p-3 rounded-xl border text-center transition ${role === 'carpenter'
                                                ? 'border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700'
                                                : 'border-slate-200 text-slate-600'}`, children: lang === 'en' ? 'Carpenter' : 'തച്ചൻ (ആശാരി)' })] })] }), role === 'seller' && (_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Timber Business / Yard Name' : 'തടി ഡിപ്പോ / വ്യാപാര സ്ഥാപനത്തിന്റെ പേര്' }), _jsx("input", { type: "text", placeholder: "e.g. Kerala Wood Depot", value: businessName, onChange: (e) => setBusinessName(e.target.value), className: "w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none" })] })), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Create 6-Digit PIN' : '6-അക്ക പിൻ നിർമ്മിക്കുക' }), _jsx("input", { type: "password", maxLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: pin, onChange: (e) => setPin(e.target.value.replace(/\D/g, '')), className: "w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-semibold text-slate-700 mb-1.5", children: lang === 'en' ? 'Confirm 6-Digit PIN' : 'പിൻ സ്ഥിരീകരിക്കുക' }), _jsx("input", { type: "password", maxLength: 6, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", value: pinConfirm, onChange: (e) => setPinConfirm(e.target.value.replace(/\D/g, '')), className: "w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none", required: true })] }), _jsxs("button", { type: "submit", className: "w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2", children: [lang === 'en' ? 'Complete Registration' : 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക', _jsx(CheckCircle2, { className: "w-4 h-4" })] })] })), _jsxs("div", { className: "text-center pt-4 border-t border-slate-100 text-xs text-slate-500", children: [lang === 'en' ? 'Already have an account? ' : 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ? ', ' ', _jsx(Link, { to: "/login", className: "font-semibold text-forest-700 hover:underline", children: lang === 'en' ? 'Sign in' : 'ലോഗിൻ ചെയ്യുക' })] })] }) }));
}
