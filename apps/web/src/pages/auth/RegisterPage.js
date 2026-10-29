import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Store, ShoppingBag, Hammer, Truck, Factory, User, KeyRound, Eye, EyeOff, MapPin, } from 'lucide-react';
import { validateIndianPhone, validatePin, validatePinConfirmation } from '@timora/shared';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { BackButton } from '../../components/BackButton';
const KERALA_DISTRICTS = [
    { id: 1, name: 'Thiruvananthapuram (തിരുവനന്തപുരം)' },
    { id: 2, name: 'Kollam (കൊല്ലം)' },
    { id: 3, name: 'Pathanamthitta (പത്തനംതിട്ട)' },
    { id: 4, name: 'Alappuzha (ആലപ്പുഴ)' },
    { id: 5, name: 'Kottayam (കോട്ടയം)' },
    { id: 6, name: 'Idukki (ഇടുക്കി)' },
    { id: 7, name: 'Ernakulam (എറണാകുളം)' },
    { id: 8, name: 'Thrissur (തൃശ്ശൂർ)' },
    { id: 9, name: 'Palakkad (പാലക്കാട്)' },
    { id: 10, name: 'Malappuram (മലപ്പുറം)' },
    { id: 11, name: 'Kozhikode (കോഴിക്കോട്)' },
    { id: 12, name: 'Wayanad (വയനാട്)' },
    { id: 13, name: 'Kannur (കണ്ണൂർ)' },
    { id: 14, name: 'Kasaragod (കാസർഗോഡ്)' },
];
export function RegisterPage({ lang = 'en' }) {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [step, setStep] = useState(1); // 1: Personal, 2: OTP, 3: Account Type & Security PIN
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [districtId, setDistrictId] = useState(5); // Kottayam
    const [otp, setOtp] = useState('');
    const [pin, setPin] = useState('');
    const [pinConfirm, setPinConfirm] = useState('');
    const [showPin, setShowPin] = useState(false);
    // 4 Primary Roles: 'buyer' | 'seller' | 'carpenter' | 'transport'
    const [role, setRole] = useState('buyer');
    // Seller Subtype: 'individual' | 'mill_owner'
    const [sellerSubtype, setSellerSubtype] = useState('individual');
    // Separate identities for business vs owner
    const [millName, setMillName] = useState('');
    const [businessName, setBusinessName] = useState('');
    const [vehicleTypes, setVehicleTypes] = useState('Timber Lorry');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    // If already authenticated, redirect
    useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'seller') {
                navigate(user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller', { replace: true });
            }
            else if (user.role === 'carpenter')
                navigate('/dashboard/carpenter', { replace: true });
            else if (user.role === 'transport')
                navigate('/dashboard/transport', { replace: true });
            else if (user.role === 'admin')
                navigate('/admin', { replace: true });
            else
                navigate('/dashboard/buyer', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);
    // Step 1: Personal Details
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
        }, 200);
    };
    // Step 2: OTP Verification (Demo flow preserved)
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
        }, 200);
    };
    // Step 3: Role, Subtype, Business Fields & 6-Digit PIN
    const handleStep3 = async (e) => {
        e.preventDefault();
        setError(null);
        // Business Identity validation
        if (role === 'seller' && sellerSubtype === 'mill_owner') {
            if (!millName.trim() || millName.trim().length < 3) {
                setError(lang === 'en'
                    ? 'Timber Sawmill name is required and must be distinct from owner name.'
                    : 'തടി മില്ലിന്റെ പേര് നൽകേണ്ടതാണ്.');
                return;
            }
        }
        else if (role === 'transport') {
            if (!businessName.trim() || businessName.trim().length < 3) {
                setError(lang === 'en'
                    ? 'Transport / Logistics business name is required.'
                    : 'ട്രാൻസ്പോർട്ട് സർവീസിന്റെ പേര് നൽകേണ്ടതാണ്.');
                return;
            }
        }
        // PIN validation
        const pinCheck = validatePin(pin, true); // Allow demo pin
        if (!pinCheck.valid) {
            setError(pinCheck.message ||
                (lang === 'en'
                    ? 'Security PIN must be exactly 6 numeric digits.'
                    : 'സുരക്ഷാ പിൻ 6 അക്കങ്ങൾ ആയിരിക്കണം.'));
            return;
        }
        const pinMatchCheck = validatePinConfirmation(pin, pinConfirm);
        if (!pinMatchCheck.valid) {
            setError(lang === 'en'
                ? 'Security PIN and Confirmation PIN do not match.'
                : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
            return;
        }
        setLoading(true);
        try {
            const selectedDistrict = KERALA_DISTRICTS.find((d) => d.id === districtId)?.name || 'Kottayam';
            const cleanPhone = phone.replace(/\D/g, '');
            const isBusinessRole = role !== 'buyer';
            // Persist newly registered user to local storage for testing
            const newUser = {
                id: `usr-${role}-${Date.now()}`,
                name: name.trim(),
                phone: cleanPhone,
                role,
                sellerSubtype: role === 'seller' ? sellerSubtype : undefined,
                businessName: role === 'seller' && sellerSubtype === 'mill_owner'
                    ? millName.trim()
                    : (businessName.trim() || `${name.trim()} Timber Enterprise`),
                millName: role === 'seller' && sellerSubtype === 'mill_owner' ? millName.trim() : undefined,
                district: selectedDistrict,
                approvalStatus: isBusinessRole ? 'PENDING_APPROVAL' : 'APPROVED',
            };
            try {
                const storedUsers = JSON.parse(localStorage.getItem('timora_registered_users') || '[]');
                storedUsers.push(newUser);
                localStorage.setItem('timora_registered_users', JSON.stringify(storedUsers));
            }
            catch {
                // ignore
            }
            setSuccess(true);
            // Clean redirect to Login Page with Pending Approval state
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        registered: true,
                        pendingApproval: isBusinessRole,
                        phone: cleanPhone,
                        role,
                        subtype: role === 'seller' ? sellerSubtype : undefined,
                    },
                });
            }, 700);
        }
        catch (err) {
            setError(err?.message || (lang === 'en' ? 'Registration failed.' : 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.'));
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-[82vh] flex items-center justify-center px-4 py-8 bg-[#FAF8F5]", children: _jsxs("div", { className: "max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#8E7F6B]/30 shadow-xl relative", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsx(BackButton, { fallbackPath: "/", lang: lang }) }), _jsxs("div", { className: "text-center space-y-1", children: [_jsx("div", { className: "inline-block transform hover:scale-105 transition-transform", children: _jsx(BrandLogo, { size: "md" }) }), _jsx("h1", { className: "text-xl sm:text-2xl font-extrabold font-serif text-[#4A3626] mt-2", children: lang === 'en' ? 'Create Your Account' : 'പുതിയ അക്കൗണ്ട് സൃഷ്ടിക്കുക' }), _jsx("p", { className: "text-xs text-[#7A5A3A] font-medium", children: lang === 'en' ? 'Direct timber trading across Kerala with Form IV compliance' : 'കേരളത്തിലെ വിശ്വസനീയമായ തടി വ്യാപാര ശൃംഖല' })] }), _jsx("div", { className: "flex items-center justify-between px-2 pt-1", children: [
                        { num: 1, label: lang === 'en' ? 'Details' : 'വിവരങ്ങൾ' },
                        { num: 2, label: lang === 'en' ? 'OTP' : 'ഒ.ടി.പി' },
                        { num: 3, label: lang === 'en' ? 'Role & PIN' : 'റോളും പിന്നും' },
                    ].map((s) => (_jsxs("div", { className: "flex flex-col items-center", children: [_jsx("div", { className: `w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s.num
                                    ? 'bg-[#5B6147] text-white shadow-xs'
                                    : step > s.num
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-stone-200 text-stone-500'}`, children: step > s.num ? '✓' : s.num }), _jsx("span", { className: "text-[10px] mt-1 font-semibold text-stone-600", children: s.label })] }, s.num))) }), error && (_jsxs("div", { className: "p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake", children: [_jsx(AlertCircle, { className: "w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" }), _jsx("span", { className: "font-semibold leading-relaxed", children: error })] })), success ? (_jsxs("div", { className: "p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-fadeIn", children: [_jsx(CheckCircle2, { className: "w-8 h-8 text-emerald-600 mx-auto" }), _jsx("h3", { className: "text-sm font-bold text-emerald-950 font-serif", children: role === 'buyer'
                                ? (lang === 'en' ? 'Account Created Successfully!' : 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു!')
                                : (lang === 'en' ? 'Registration Submitted for Review!' : 'അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു!') }), _jsx("p", { className: "text-xs text-emerald-800", children: role === 'buyer'
                                ? (lang === 'en' ? 'Redirecting to login...' : 'ലോഗിൻ പേജിലേക്ക് പോകുന്നു...')
                                : (lang === 'en' ? 'Status: Pending Admin Review. Redirecting to login...' : 'പരിശോധനയിലാണ്. ലോഗിൻ പേജിലേക്ക് പോകുന്നു...') })] })) : (_jsxs(_Fragment, { children: [step === 1 && (_jsxs("form", { onSubmit: handleStep1, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Full Name / പേര്' : 'പൂർണ്ണ നാമം (പേര്)' }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-4 h-4 absolute left-3 top-2.5 text-[#8E7F6B]" }), _jsx("input", { type: "text", placeholder: "e.g. Suresh Kumar", value: name, onChange: (e) => {
                                                        setName(e.target.value);
                                                        if (error)
                                                            setError(null);
                                                    }, className: "w-full py-2.5 pl-10 pr-3 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Mobile Number / ഫോൺ' : 'മൊബൈൽ നമ്പർ' }), _jsxs("div", { className: "relative", children: [_jsx("span", { className: "absolute left-3 top-2.5 text-xs font-bold text-[#8E7F6B] font-mono", children: "+91" }), _jsx("input", { type: "tel", maxLength: 10, placeholder: "9847123456", value: phone, onChange: (e) => {
                                                        setPhone(e.target.value.replace(/\D/g, ''));
                                                        if (error)
                                                            setError(null);
                                                    }, className: "w-full py-2.5 pl-12 pr-3 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'District in Kerala' : 'ജില്ല' }), _jsxs("div", { className: "relative", children: [_jsx(MapPin, { className: "w-4 h-4 absolute left-3 top-2.5 text-[#8E7F6B]" }), _jsx("select", { value: districtId, onChange: (e) => setDistrictId(Number(e.target.value)), className: "w-full py-2.5 pl-10 pr-3 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", children: KERALA_DISTRICTS.map((d) => (_jsx("option", { value: d.id, children: d.name }, d.id))) })] })] }), _jsx("button", { type: "submit", disabled: loading, className: "w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Verify Mobile Number' : 'മൊബൈൽ സ്ഥിരീകരിക്കുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })), step === 2 && (_jsxs("form", { onSubmit: handleStep2, className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-[#E7E1D6]/80 rounded-2xl border border-[#8E7F6B]/30 text-center space-y-1", children: [_jsx("span", { className: "text-xs text-[#7A5A3A] block", children: lang === 'en'
                                                ? `OTP sent to +91 ${phone} (Demo Mode)`
                                                : `+91 ${phone} എന്ന നമ്പറിലേക്ക് OTP അയച്ചിരിക്കുന്നു` }), _jsxs("div", { className: "text-sm font-mono font-black text-[#4A3626]", children: ["Demo OTP: ", _jsx("span", { className: "underline tracking-widest text-[#5B6147]", children: "123456" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1 text-center", children: lang === 'en' ? 'Enter 6-Digit Code' : '6-അക്ക കോഡ് നൽകുക' }), _jsx("input", { type: "text", maxLength: 6, value: otp, onChange: (e) => {
                                                setOtp(e.target.value.replace(/\D/g, ''));
                                                if (error)
                                                    setError(null);
                                            }, placeholder: "123456", className: "w-full py-2.5 text-center font-mono font-bold tracking-widest text-lg rounded-xl border border-[#8E7F6B]/30 text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { type: "button", onClick: () => setStep(1), className: "w-1/3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition", children: lang === 'en' ? 'Back' : 'തിരികെ' }), _jsx("button", { type: "submit", disabled: loading, className: "w-2/3 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Confirm OTP' : 'സ്ഥിരീകരിക്കുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })] })), step === 3 && (_jsxs("form", { onSubmit: handleStep3, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-2", children: lang === 'en' ? 'Choose Your Account Type' : 'അക്കൗണ്ട് വിഭാഗം തിരഞ്ഞെടുക്കുക' }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setRole('buyer'), className: `p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${role === 'buyer'
                                                        ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                                                        : 'border-[#8E7F6B]/30 hover:bg-stone-50'}`, children: [_jsx(ShoppingBag, { className: `w-4 h-4 ${role === 'buyer' ? 'text-[#5B6147]' : 'text-stone-400'}` }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? 'Buyer' : 'വാങ്ങുന്നയാൾ' }), _jsx("div", { className: "text-[10px] text-[#8E7F6B]", children: lang === 'en' ? 'Instant Access' : 'ഉടനടി ലഭ്യമാണ്' })] })] }), _jsxs("button", { type: "button", onClick: () => setRole('seller'), className: `p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${role === 'seller'
                                                        ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                                                        : 'border-[#8E7F6B]/30 hover:bg-stone-50'}`, children: [_jsx(Store, { className: `w-4 h-4 ${role === 'seller' ? 'text-[#5B6147]' : 'text-stone-400'}` }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? 'Seller' : 'തടി കച്ചവടം' }), _jsx("div", { className: "text-[10px] text-[#8E7F6B]", children: lang === 'en' ? 'Grower or Mill' : 'മരം / മില്ലുകൾ' })] })] }), _jsxs("button", { type: "button", onClick: () => setRole('carpenter'), className: `p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${role === 'carpenter'
                                                        ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                                                        : 'border-[#8E7F6B]/30 hover:bg-stone-50'}`, children: [_jsx(Hammer, { className: `w-4 h-4 ${role === 'carpenter' ? 'text-[#5B6147]' : 'text-stone-400'}` }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? 'Carpenter' : 'ആശാരി' }), _jsx("div", { className: "text-[10px] text-[#8E7F6B]", children: lang === 'en' ? 'Wood Artisan' : 'വിദഗ്ദ്ധ തച്ചൻ' })] })] }), _jsxs("button", { type: "button", onClick: () => setRole('transport'), className: `p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${role === 'transport'
                                                        ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                                                        : 'border-[#8E7F6B]/30 hover:bg-stone-50'}`, children: [_jsx(Truck, { className: `w-4 h-4 ${role === 'transport' ? 'text-[#5B6147]' : 'text-stone-400'}` }), _jsxs("div", { children: [_jsx("div", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? 'Transport Owner' : 'വാഹന ഉടമ' }), _jsx("div", { className: "text-[10px] text-[#8E7F6B]", children: lang === 'en' ? 'Timber Lorries' : 'തടി ലോറികൾ' })] })] })] })] }), role === 'seller' && (_jsxs("div", { className: "p-3 bg-[#E7E1D6]/50 rounded-2xl border border-[#8E7F6B]/30 space-y-3", children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626]", children: lang === 'en' ? 'Seller Business Category' : 'കച്ചവട വിഭാഗം തിരഞ്ഞെടുക്കുക' }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs("button", { type: "button", onClick: () => setSellerSubtype('individual'), className: `p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-1.5 ${sellerSubtype === 'individual'
                                                        ? 'bg-[#5B6147] text-white border-[#5B6147]'
                                                        : 'bg-white text-[#4A3626] border-stone-300 hover:bg-stone-100'}`, children: [_jsx(User, { className: "w-3.5 h-3.5 flex-shrink-0" }), _jsx("span", { className: "truncate", children: lang === 'en' ? 'Individual Seller' : 'വ്യക്തിഗത കച്ചവടക്കാരൻ' })] }), _jsxs("button", { type: "button", onClick: () => setSellerSubtype('mill_owner'), className: `p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-1.5 ${sellerSubtype === 'mill_owner'
                                                        ? 'bg-[#5B6147] text-white border-[#5B6147]'
                                                        : 'bg-white text-[#4A3626] border-stone-300 hover:bg-stone-100'}`, children: [_jsx(Factory, { className: "w-3.5 h-3.5 flex-shrink-0" }), _jsx("span", { className: "truncate", children: lang === 'en' ? 'Timber Mill Owner' : 'തടി മിൽ ഉടമ' })] })] }), sellerSubtype === 'mill_owner' && (_jsxs("div", { className: "space-y-2 pt-1", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-[11px] font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Timber Mill / Sawmill Name' : 'തടി മില്ലിന്റെ പേര്' }), _jsx("input", { type: "text", placeholder: "e.g. Perumbavoor Modern Sawmills", value: millName, onChange: (e) => setMillName(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white", required: true })] }), _jsx("p", { className: "text-[10px] text-[#7A5A3A] italic", children: lang === 'en'
                                                        ? `Owner Personal Name: "${name}" is kept distinct from Mill Name.`
                                                        : `ഉടമയുടെ പേര്: "${name}" മില്ലിന്റെ പേരിൽ നിന്ന് പ്രത്യേകം സൂക്ഷിക്കുന്നു.` })] }))] })), role === 'transport' && (_jsxs("div", { className: "p-3 bg-[#E7E1D6]/50 rounded-2xl border border-[#8E7F6B]/30 space-y-2", children: [_jsx("label", { className: "block text-[11px] font-bold text-[#4A3626]", children: lang === 'en' ? 'Transport Business / Fleet Name' : 'ട്രാൻസ്പോർട്ട് സർവീസിന്റെ പേര്' }), _jsx("input", { type: "text", placeholder: "e.g. Malabar Timber Heavy Transit", value: businessName, onChange: (e) => setBusinessName(e.target.value), className: "w-full px-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white", required: true })] })), _jsxs("div", { className: "grid grid-cols-2 gap-2 pt-1", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center justify-between mb-1", children: [_jsx("label", { className: "text-xs font-bold text-[#4A3626]", children: lang === 'en' ? '6-Digit PIN' : '6-അക്ക പിൻ' }), _jsxs("button", { type: "button", onClick: () => setShowPin(!showPin), className: "text-[10px] text-[#8E7F6B] hover:text-[#4A3626] flex items-center gap-0.5 font-semibold", children: [showPin ? _jsx(EyeOff, { className: "w-3 h-3" }) : _jsx(Eye, { className: "w-3 h-3" }), _jsx("span", { children: showPin ? 'Hide' : 'Show' })] })] }), _jsxs("div", { className: "relative", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E7F6B]" }), _jsx("input", { type: showPin ? 'text' : 'password', maxLength: 6, value: pin, onChange: (e) => {
                                                                setPin(e.target.value.replace(/\D/g, ''));
                                                                if (error)
                                                                    setError(null);
                                                            }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full py-2 pl-8 pr-2 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-[#4A3626] mb-1", children: lang === 'en' ? 'Confirm PIN' : 'സ്ഥിരീകരിക്കുക' }), _jsxs("div", { className: "relative", children: [_jsx(KeyRound, { className: "w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E7F6B]" }), _jsx("input", { type: showPin ? 'text' : 'password', maxLength: 6, value: pinConfirm, onChange: (e) => {
                                                                setPinConfirm(e.target.value.replace(/\D/g, ''));
                                                                if (error)
                                                                    setError(null);
                                                            }, placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full py-2 pl-8 pr-2 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50", required: true })] })] })] }), _jsxs("div", { className: "flex gap-2 pt-2", children: [_jsx("button", { type: "button", onClick: () => setStep(2), className: "w-1/3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition", children: lang === 'en' ? 'Back' : 'തിരികെ' }), _jsx("button", { type: "submit", disabled: loading, className: "w-2/3 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs", children: loading ? (_jsx(Loader2, { className: "w-4 h-4 animate-spin" })) : (_jsxs(_Fragment, { children: [_jsx("span", { children: lang === 'en' ? 'Create Account' : 'രജിസ്റ്റർ ചെയ്യുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] })) })] })] }))] })), _jsxs("div", { className: "text-center pt-1 text-xs text-[#7A5A3A]", children: [lang === 'en' ? 'Already have an account?' : 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?', ' ', _jsx(Link, { to: "/login", className: "font-bold text-[#5B6147] hover:underline", children: lang === 'en' ? 'Sign In' : 'ലോഗിൻ ചെയ്യുക' })] })] }) }));
}
