import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  Store,
  ShoppingBag,
  Hammer,
  Truck,
  Factory,
  User,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { validateIndianPhone, validatePin, validatePinConfirmation } from '@timora/shared';
import { useAuth, UserRole, SellerSubtype, UserProfile } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';
import { BackButton } from '../../components/BackButton';
import { api } from '../../lib/api';

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

export function RegisterPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Personal, 2: OTP, 3: Account Type & Security PIN
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [districtId, setDistrictId] = useState<number>(5); // Kottayam
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [showPin, setShowPin] = useState(false);

  // 4 Primary Roles: 'buyer' | 'seller' | 'carpenter' | 'transport'
  const [role, setRole] = useState<UserRole>('buyer');

  // Seller Subtype: 'individual' | 'mill_owner'
  const [sellerSubtype, setSellerSubtype] = useState<SellerSubtype>('individual');

  // Separate identities for business vs owner
  const [millName, setMillName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [vehicleTypes, setVehicleTypes] = useState('Timber Lorry');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'seller') {
        navigate(user.sellerSubtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller', { replace: true });
      } else if (user.role === 'carpenter') navigate('/dashboard/carpenter', { replace: true });
      else if (user.role === 'transport') navigate('/dashboard/transport', { replace: true });
      else if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard/buyer', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Step 1: Personal Details
  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 3) {
      setError(
        lang === 'en'
          ? 'Full Name must be at least 3 characters long.'
          : 'പേര് കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ ഉണ്ടായിരിക്കണം.'
      );
      return;
    }
    if (!/^[a-zA-Z\s.]+$/.test(trimmedName)) {
      setError(
        lang === 'en'
          ? 'Name should contain alphabetic characters only.'
          : 'പേരിൽ അക്ഷരങ്ങൾ മാത്രം നൽകുക.'
      );
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const phoneCheck = validateIndianPhone(cleanPhone);
    if (!phoneCheck.valid) {
      setError(
        phoneCheck.message ||
          (lang === 'en'
            ? 'Enter a valid 10-digit Indian mobile number.'
            : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.')
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 200);
  };

  // Step 2: OTP Verification (Demo flow preserved)
  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (otp !== '123456' && otp.length !== 6) {
      setError(
        lang === 'en'
          ? 'Invalid verification code. Demo-only verification code is 123456.'
          : 'അസാധുവായ OTP. ഡെമോ കോഡ് 123456 ആണ്.'
      );
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 200);
  };

  // Step 3: Role, Subtype, Business Fields & 6-Digit PIN
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Business Identity validation
    if (role === 'seller' && sellerSubtype === 'mill_owner') {
      if (!millName.trim() || millName.trim().length < 3) {
        setError(
          lang === 'en'
            ? 'Timber Sawmill name is required and must be distinct from owner name.'
            : 'തടി മില്ലിന്റെ പേര് നൽകേണ്ടതാണ്.'
        );
        return;
      }
    } else if (role === 'transport') {
      if (!businessName.trim() || businessName.trim().length < 3) {
        setError(
          lang === 'en'
            ? 'Transport / Logistics business name is required.'
            : 'ട്രാൻസ്പോർട്ട് സർവീസിന്റെ പേര് നൽകേണ്ടതാണ്.'
        );
        return;
      }
    }

    // PIN validation
    const pinCheck = validatePin(pin, true); // Allow demo pin
    if (!pinCheck.valid) {
      setError(
        pinCheck.message ||
          (lang === 'en'
            ? 'Security PIN must be exactly 6 numeric digits.'
            : 'സുരക്ഷാ പിൻ 6 അക്കങ്ങൾ ആയിരിക്കണം.')
      );
      return;
    }

    const pinMatchCheck = validatePinConfirmation(pin, pinConfirm);
    if (!pinMatchCheck.valid) {
      setError(
        lang === 'en'
          ? 'Security PIN and Confirmation PIN do not match.'
          : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.'
      );
      return;
    }

    setLoading(true);

    try {
      const selectedDistrict = KERALA_DISTRICTS.find((d) => d.id === districtId)?.name || 'Kottayam';
      const cleanPhone = phone.replace(/\D/g, '');
      const isBusinessRole = role !== 'buyer';

      const businessNameField =
        role === 'seller' && sellerSubtype === 'mill_owner'
          ? millName.trim()
          : (businessName.trim() || undefined);

      const payload = {
        phone: cleanPhone,
        pin,
        pin_confirm: pinConfirm,
        role,
        name: name.trim(),
        district_id: districtId,
        language_pref: lang,
        business_name: businessNameField,
      };

      try {
        const res = await api.post('/auth/register', payload);

        if (res.data?.success) {
          setSuccess(true);
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
          return;
        }
      } catch (apiErr: any) {
        // If the backend responded with an HTTP status error (e.g. 409 USER_EXISTS or 400 validation)
        if (apiErr.response) {
          const errMsg =
            apiErr.response.data?.error?.message ||
            apiErr.response.data?.message ||
            'Registration failed. Please check details.';
          setError(errMsg);
          setLoading(false);
          return;
        }

        // Only when backend is unreachable (offline demo fallback):
        const newUser: UserProfile = {
          id: `usr-${role}-${Date.now()}`,
          name: name.trim(),
          phone: cleanPhone,
          role,
          sellerSubtype: role === 'seller' ? sellerSubtype : undefined,
          businessName: businessNameField || `${name.trim()} Timber Enterprise`,
          millName: role === 'seller' && sellerSubtype === 'mill_owner' ? millName.trim() : undefined,
          district: selectedDistrict,
          approvalStatus: isBusinessRole ? 'PENDING_APPROVAL' : 'APPROVED',
        };

        try {
          const storedUsers = JSON.parse(localStorage.getItem('timora_registered_users') || '[]');
          storedUsers.push(newUser);
          localStorage.setItem('timora_registered_users', JSON.stringify(storedUsers));
        } catch {}

        setSuccess(true);
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
        return;
      }
    } catch (err: any) {
      setError(err?.message || (lang === 'en' ? 'Registration failed.' : 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#8E7F6B]/30 shadow-xl relative">
        <div className="flex items-center justify-between">
          <BackButton fallbackPath="/" lang={lang} />
        </div>

        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="inline-block transform hover:scale-105 transition-transform">
            <BrandLogo size="md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-serif text-[#4A3626] mt-2">
            {lang === 'en' ? 'Create Your Account' : 'പുതിയ അക്കൗണ്ട് സൃഷ്ടിക്കുക'}
          </h1>
          <p className="text-xs text-[#7A5A3A] font-medium">
            {lang === 'en' ? 'Direct timber trading across Kerala with Form IV compliance' : 'കേരളത്തിലെ വിശ്വസനീയമായ തടി വ്യാപാര ശൃംഖല'}
          </p>
        </div>

        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between px-2 pt-1">
          {[
            { num: 1, label: lang === 'en' ? 'Details' : 'വിവരങ്ങൾ' },
            { num: 2, label: lang === 'en' ? 'OTP' : 'ഒ.ടി.പി' },
            { num: 3, label: lang === 'en' ? 'Role & PIN' : 'റോളും പിന്നും' },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#5B6147] text-white shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-200 text-stone-500'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className="text-[10px] mt-1 font-semibold text-stone-600">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2 animate-fadeIn">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-950 font-serif">
              {role === 'buyer'
                ? (lang === 'en' ? 'Account Created Successfully!' : 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു!')
                : (lang === 'en' ? 'Registration Submitted for Review!' : 'അപേക്ഷ വിജയകരമായി സമർപ്പിച്ചു!')}
            </h3>
            <p className="text-xs text-emerald-800">
              {role === 'buyer'
                ? (lang === 'en' ? 'Redirecting to login...' : 'ലോഗിൻ പേജിലേക്ക് പോകുന്നു...')
                : (lang === 'en' ? 'Status: Pending Admin Review. Redirecting to login...' : 'പരിശോധനയിലാണ്. ലോഗിൻ പേജിലേക്ക് പോകുന്നു...')}
            </p>
          </div>
        ) : (
          <>
            {/* STEP 1: Full Name, Phone & District */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1">
                    {lang === 'en' ? 'Full Name / പേര്' : 'പൂർണ്ണ നാമം (പേര്)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-[#8E7F6B]" />
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1">
                    {lang === 'en' ? 'Mobile Number / ഫോൺ' : 'മൊബൈൽ നമ്പർ'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8E7F6B] font-mono">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9847123456"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ''));
                        if (error) setError(null);
                      }}
                      className="w-full py-2.5 pl-12 pr-3 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1">
                    {lang === 'en' ? 'District in Kerala' : 'ജില്ല'}
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#8E7F6B]" />
                    <select
                      value={districtId}
                      onChange={(e) => setDistrictId(Number(e.target.value))}
                      className="w-full py-2.5 pl-10 pr-3 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                    >
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{lang === 'en' ? 'Verifying...' : 'സ്ഥിരീകരിക്കുന്നു...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{lang === 'en' ? 'Verify Mobile Number' : 'മൊബൈൽ സ്ഥിരീകരിക്കുക'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 2: Demo OTP */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#8E7F6B]/35 text-center space-y-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E7E1D6] text-[11px] font-bold text-[#4A3626]">
                    <Sparkles className="w-3 h-3 text-[#5B6147]" />
                    <span>{lang === 'en' ? 'Demonstration Verification' : 'ഡെമോ വെരിഫിക്കേഷൻ'}</span>
                  </div>
                  <p className="text-xs text-[#7A5A3A]">
                    {lang === 'en'
                      ? 'No real SMS has been sent. For demo and evaluation purposes, use the fixed verification code below:'
                      : 'യഥാർത്ഥ SMS അയച്ചിട്ടില്ല. ഡെമോ ആവശ്യങ്ങൾക്കായി താഴെ കാണുന്ന നിശ്ചിത കോഡ് ഉപയോഗിക്കുക:'}
                  </p>
                  <div className="text-base font-mono font-black text-[#4A3626] bg-white py-1.5 px-3 rounded-xl border border-[#8E7F6B]/20 inline-block">
                    {lang === 'en' ? 'Demo OTP: ' : 'ഡെമോ OTP: '}
                    <span className="tracking-widest text-[#5B6147]">123456</span>
                  </div>
                  <p className="text-[10px] text-[#8E7F6B] italic">
                    {lang === 'en'
                      ? '(Simulated SMS verification for demonstration)'
                      : '(ഡെമോൺസ്ട്രേഷനായുള്ള സിമുലേറ്റഡ് വെരിഫിക്കേഷൻ)'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1 text-center">
                    {lang === 'en' ? 'Enter 6-Digit Code' : '6-അക്ക കോഡ് നൽകുക'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (error) setError(null);
                    }}
                    placeholder="123456"
                    className="w-full py-2.5 text-center font-mono font-bold tracking-widest text-lg rounded-xl border border-[#8E7F6B]/30 text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition"
                  >
                    {lang === 'en' ? 'Back' : 'തിരികെ'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'en' ? 'Confirming...' : 'സ്ഥിരീകരിക്കുന്നു...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'en' ? 'Confirm OTP' : 'സ്ഥിരീകരിക്കുക'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Role, Subtype, Business Details & PIN */}
            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-4">
                {/* 4 Account Types */}
                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-2">
                    {lang === 'en' ? 'Choose Your Account Type' : 'അക്കൗണ്ട് വിഭാഗം തിരഞ്ഞെടുക്കുക'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Buyer */}
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        role === 'buyer'
                          ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                          : 'border-[#8E7F6B]/30 hover:bg-stone-50'
                      }`}
                    >
                      <ShoppingBag className={`w-4 h-4 ${role === 'buyer' ? 'text-[#5B6147]' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-[#4A3626]">{lang === 'en' ? 'Buyer' : 'വാങ്ങുന്നയാൾ'}</div>
                        <div className="text-[10px] text-[#8E7F6B]">{lang === 'en' ? 'Instant Access' : 'ഉടനടി ലഭ്യമാണ്'}</div>
                      </div>
                    </button>

                    {/* Seller (Renamed from Seller Depot) */}
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        role === 'seller'
                          ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                          : 'border-[#8E7F6B]/30 hover:bg-stone-50'
                      }`}
                    >
                      <Store className={`w-4 h-4 ${role === 'seller' ? 'text-[#5B6147]' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-[#4A3626]">{lang === 'en' ? 'Seller' : 'തടി കച്ചവടം'}</div>
                        <div className="text-[10px] text-[#8E7F6B]">{lang === 'en' ? 'Grower or Mill' : 'മരം / മില്ലുകൾ'}</div>
                      </div>
                    </button>

                    {/* Carpenter */}
                    <button
                      type="button"
                      onClick={() => setRole('carpenter')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        role === 'carpenter'
                          ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                          : 'border-[#8E7F6B]/30 hover:bg-stone-50'
                      }`}
                    >
                      <Hammer className={`w-4 h-4 ${role === 'carpenter' ? 'text-[#5B6147]' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-[#4A3626]">{lang === 'en' ? 'Carpenter' : 'ആശാരി'}</div>
                        <div className="text-[10px] text-[#8E7F6B]">{lang === 'en' ? 'Wood Artisan' : 'വിദഗ്ദ്ധ തച്ചൻ'}</div>
                      </div>
                    </button>

                    {/* Transport Owner */}
                    <button
                      type="button"
                      onClick={() => setRole('transport')}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        role === 'transport'
                          ? 'border-[#5B6147] bg-[#E7E1D6]/70 ring-2 ring-[#5B6147]/20 shadow-xs'
                          : 'border-[#8E7F6B]/30 hover:bg-stone-50'
                      }`}
                    >
                      <Truck className={`w-4 h-4 ${role === 'transport' ? 'text-[#5B6147]' : 'text-stone-400'}`} />
                      <div>
                        <div className="text-xs font-bold text-[#4A3626]">{lang === 'en' ? 'Transport Owner' : 'വാഹന ഉടമ'}</div>
                        <div className="text-[10px] text-[#8E7F6B]">{lang === 'en' ? 'Timber Lorries' : 'തടി ലോറികൾ'}</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Seller Subtype Selection */}
                {role === 'seller' && (
                  <div className="p-3 bg-[#E7E1D6]/50 rounded-2xl border border-[#8E7F6B]/30 space-y-3">
                    <label className="block text-xs font-bold text-[#4A3626]">
                      {lang === 'en' ? 'Seller Business Category' : 'കച്ചവട വിഭാഗം തിരഞ്ഞെടുക്കുക'}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSellerSubtype('individual')}
                        className={`p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-1.5 ${
                          sellerSubtype === 'individual'
                            ? 'bg-[#5B6147] text-white border-[#5B6147]'
                            : 'bg-white text-[#4A3626] border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <User className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{lang === 'en' ? 'Individual Seller' : 'വ്യക്തിഗത കച്ചവടക്കാരൻ'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSellerSubtype('mill_owner')}
                        className={`p-2 rounded-xl text-left border text-xs font-bold transition flex items-center gap-1.5 ${
                          sellerSubtype === 'mill_owner'
                            ? 'bg-[#5B6147] text-white border-[#5B6147]'
                            : 'bg-white text-[#4A3626] border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <Factory className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{lang === 'en' ? 'Timber Mill Owner' : 'തടി മിൽ ഉടമ'}</span>
                      </button>
                    </div>

                    {/* Mill Details vs Owner Name */}
                    {sellerSubtype === 'mill_owner' && (
                      <div className="space-y-2 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-[#4A3626] mb-1">
                            {lang === 'en' ? 'Timber Mill / Sawmill Name' : 'തടി മില്ലിന്റെ പേര്'}
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Perumbavoor Modern Sawmills"
                            value={millName}
                            onChange={(e) => setMillName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white"
                            required
                          />
                        </div>
                        <p className="text-[10px] text-[#7A5A3A] italic">
                          {lang === 'en'
                            ? `Owner Personal Name: "${name}" is kept distinct from Mill Name.`
                            : `ഉടമയുടെ പേര്: "${name}" മില്ലിന്റെ പേരിൽ നിന്ന് പ്രത്യേകം സൂക്ഷിക്കുന്നു.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Transport Owner Specific Fields */}
                {role === 'transport' && (
                  <div className="p-3 bg-[#E7E1D6]/50 rounded-2xl border border-[#8E7F6B]/30 space-y-2">
                    <label className="block text-[11px] font-bold text-[#4A3626]">
                      {lang === 'en' ? 'Transport Business / Fleet Name' : 'ട്രാൻസ്പോർട്ട് സർവീസിന്റെ പേര്'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Malabar Timber Heavy Transit"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-white"
                      required
                    />
                  </div>
                )}

                {/* 6-Digit PIN & Confirmation */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#4A3626]">
                        {lang === 'en' ? '6-Digit PIN' : '6-അക്ക പിൻ'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="text-[10px] text-[#8E7F6B] hover:text-[#4A3626] flex items-center gap-0.5 font-semibold"
                      >
                        {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        <span>{showPin ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E7F6B]" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={6}
                        value={pin}
                        onChange={(e) => {
                          setPin(e.target.value.replace(/\D/g, ''));
                          if (error) setError(null);
                        }}
                        placeholder="••••••"
                        className="w-full py-2 pl-8 pr-2 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3626] mb-1">
                      {lang === 'en' ? 'Confirm PIN' : 'സ്ഥിരീകരിക്കുക'}
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E7F6B]" />
                      <input
                        type={showPin ? 'text' : 'password'}
                        maxLength={6}
                        value={pinConfirm}
                        onChange={(e) => {
                          setPinConfirm(e.target.value.replace(/\D/g, ''));
                          if (error) setError(null);
                        }}
                        placeholder="••••••"
                        className="w-full py-2 pl-8 pr-2 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="w-1/3 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition"
                  >
                    {lang === 'en' ? 'Back' : 'തിരികെ'}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{lang === 'en' ? 'Creating Account...' : 'അക്കൗണ്ട് ഉണ്ടാക്കുന്നു...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{lang === 'en' ? 'Create Account' : 'രജിസ്റ്റർ ചെയ്യുക'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-1 text-xs text-[#7A5A3A]">
          {lang === 'en' ? 'Already have an account?' : 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?'}{' '}
          <Link to="/login" className="font-bold text-[#5B6147] hover:underline">
            {lang === 'en' ? 'Sign In' : 'ലോഗിൻ ചെയ്യുക'}
          </Link>
        </div>
      </div>
    </div>
  );
}
