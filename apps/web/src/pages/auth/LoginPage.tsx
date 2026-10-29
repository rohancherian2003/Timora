import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Phone,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Shield,
  Store,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Hammer,
  Truck,
  Factory,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { validateIndianPhone } from '@timora/shared';
import { useAuth, UserRole, SellerSubtype, DEMO_PROFILES } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';

export function LoginPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, loginAsDemo } = useAuth();

  const regState = location.state as {
    registered?: boolean;
    pendingApproval?: boolean;
    phone?: string;
    role?: UserRole;
    subtype?: SellerSubtype;
    returnTo?: string;
  } | null;

  const [phone, setPhone] = useState(regState?.phone || '9847987654');
  const [pin, setPin] = useState(regState?.registered ? '' : '123456');
  const [showPin, setShowPin] = useState(false);
  const [isDemoSectionOpen, setIsDemoSectionOpen] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(() => {
    if (regState?.pendingApproval) {
      return lang === 'en'
        ? 'Account registered successfully! Verification status is Pending Admin Review. You may sign in to access your dashboard.'
        : 'അക്കൗണ്ട് രജിസ്ട്രേഷൻ വിജയകരമായി! പരിശോധന പൂർത്തിയാകുന്നതുവരെ കാത്തിരിക്കുക. ഡാഷ്‌ബോർഡിൽ പ്രവേശിക്കാൻ പിൻ നൽകുക.';
    }
    if (regState?.registered) {
      return lang === 'en'
        ? 'Account created successfully! Please enter your 6-digit PIN to sign in.'
        : 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു! പ്രവേശിക്കാൻ നിങ്ങളുടെ പിൻ നൽകുക.';
    }
    return null;
  });
  const [loading, setLoading] = useState(false);

  // Forgot PIN Modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotPhone, setForgotPhone] = useState(phone);
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPin, setForgotNewPin] = useState('');
  const [forgotConfirmPin, setForgotConfirmPin] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const getDestination = (role: UserRole, subtype?: SellerSubtype) => {
    // If a returnUrl was specified during a guest attempt, prioritize it!
    if (regState?.returnTo && regState.returnTo !== '/login' && regState.returnTo !== '/register') {
      return regState.returnTo;
    }

    switch (role) {
      case 'seller':
        return subtype === 'mill_owner' ? '/dashboard/mill' : '/dashboard/seller';
      case 'carpenter':
        return '/dashboard/carpenter';
      case 'transport':
        return '/dashboard/transport';
      case 'admin':
        return '/admin';
      case 'buyer':
      default:
        return '/dashboard/buyer';
    }
  };

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDestination(user.role, user.sellerSubtype), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleQuickDemo = (role: UserRole, subtype?: SellerSubtype) => {
    setError(null);
    setLoading(true);
    loginAsDemo(role, subtype);
    const dest = getDestination(role, subtype);
    navigate(dest, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessBanner(null);

    // Field-level strict validation
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      setError(lang === 'en' ? 'Phone number is required.' : 'ഫോൺ നമ്പർ നൽകേണ്ടതാണ്.');
      return;
    }
    const phoneCheck = validateIndianPhone(cleanPhone);
    if (!phoneCheck.valid) {
      setError(
        phoneCheck.message ||
          (lang === 'en'
            ? 'Enter a valid 10-digit Indian mobile number (e.g. 9847123456).'
            : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക (ഉദാ: 9847123456).')
      );
      return;
    }

    if (!pin) {
      setError(lang === 'en' ? 'Security PIN is required.' : 'സുരക്ഷാ പിൻ നൽകേണ്ടതാണ്.');
      return;
    }
    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError(
        lang === 'en'
          ? 'Security PIN must be exactly 6 numeric digits.'
          : 'സുരക്ഷാ പിൻ കൃത്യം 6 അക്കങ്ങൾ ആയിരിക്കണം.'
      );
      return;
    }

    setLoading(true);

    try {
      const res = await login(cleanPhone, pin);
      if (res.success && res.role) {
        navigate(getDestination(res.role, res.subtype), { replace: true });
      } else {
        setError(res.error || (lang === 'en' ? 'Authentication failed. Please verify credentials.' : 'ലോഗിൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ പരിശോധിക്കുക.'));
      }
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || (lang === 'en' ? 'Unable to authenticate. Check connection.' : 'ലോഗിൻ സാധ്യമായില്ല. കണക്ഷൻ പരിശോധിക്കുക.'));
    } finally {
      setLoading(false);
    }
  };

  // Forgot PIN Step 1
  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const clean = forgotPhone.replace(/\D/g, '');
    const check = validateIndianPhone(clean);
    if (!check.valid) {
      setForgotError(lang === 'en' ? 'Enter a valid 10-digit Indian mobile number.' : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.');
      return;
    }
    setForgotStep(2);
  };

  // Forgot PIN Step 2
  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotOtp !== '123456' && forgotOtp.length !== 6) {
      setForgotError(lang === 'en' ? 'Invalid OTP. Demo OTP is 123456.' : 'അസാധുവായ OTP. ഡെമോ OTP 123456 ആണ്.');
      return;
    }

    if (!/^\d{6}$/.test(forgotNewPin)) {
      setForgotError(lang === 'en' ? 'New PIN must be 6 digits.' : 'പുതിയ പിൻ 6 അക്കങ്ങൾ ആയിരിക്കണം.');
      return;
    }

    if (forgotNewPin !== forgotConfirmPin) {
      setForgotError(lang === 'en' ? 'PIN codes do not match.' : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
      return;
    }

    setForgotSuccess(true);
    setPin(forgotNewPin);
    setPhone(forgotPhone);
    setTimeout(() => {
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotStep(1);
      setSuccessBanner(
        lang === 'en'
          ? 'PIN updated successfully! You can now sign in with your new PIN.'
          : 'പിൻ വിജയകരമായി മാറ്റി! പുതിയ പിൻ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യുക.'
      );
    }, 1200);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8 bg-[#FAF8F5]">
      <div className="max-w-md w-full space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#8E7F6B]/30 shadow-xl">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="inline-block transform hover:scale-105 transition-transform">
            <BrandLogo size="md" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-serif text-[#4A3626] mt-2">
            {lang === 'en' ? 'Welcome Back to Timora' : 'ടിമോറയിലേക്ക് സ്വാഗതം'}
          </h1>
          <p className="text-xs text-[#7A5A3A] font-medium">
            {lang === 'en'
              ? 'Kerala\'s Smart Raw Timber Trading Marketplace'
              : 'കേരളത്തിലെ നേരിട്ടുള്ള തടി വ്യാപാര വിപണി'}
          </p>
        </div>

        {/* DECISION 1: QUICK DEMO ACCOUNTS SWITCHER (Collapsible) */}
        <div className="rounded-2xl border border-[#8E7F6B]/35 bg-[#FAF8F5] overflow-hidden transition-all">
          <button
            type="button"
            onClick={() => setIsDemoSectionOpen(!isDemoSectionOpen)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-[#E7E1D6]/40 transition text-xs font-bold text-[#4A3626]"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#5B6147]" />
              <span>{lang === 'en' ? 'Quick Demo Accounts (Evaluation & Presentation)' : 'ഡെമോ അക്കൗണ്ടുകൾ (വിലയിരുത്തലിനായി)'}</span>
            </div>
            {isDemoSectionOpen ? (
              <ChevronUp className="w-4 h-4 text-[#8E7F6B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#8E7F6B]" />
            )}
          </button>

          {isDemoSectionOpen && (
            <div className="p-3 pt-1 border-t border-[#8E7F6B]/20 space-y-2 bg-white/70">
              <p className="text-[11px] text-[#7A5A3A]">
                {lang === 'en'
                  ? 'Click any role to log in instantly with an approved pre-seeded demo account:'
                  : 'താഴെ പറയുന്ന ഏത് റോളിലും ഒറ്റ ക്ലിക്കിൽ ലോഗിൻ ചെയ്യാവുന്നതാണ്:'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Buyer */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('buyer')}
                  className="p-2 rounded-xl bg-[#E7E1D6]/70 hover:bg-[#E7E1D6] border border-[#8E7F6B]/30 text-left transition flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#4A3626] text-[11px] truncate">Buyer</div>
                    <div className="text-[10px] text-[#8E7F6B] truncate">Suresh Kumar</div>
                  </div>
                </button>

                {/* Individual Timber Seller */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('seller', 'individual')}
                  className="p-2 rounded-xl bg-[#E7E1D6]/70 hover:bg-[#E7E1D6] border border-[#8E7F6B]/30 text-left transition flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#4A3626] text-[11px] truncate">Individual Seller</div>
                    <div className="text-[10px] text-[#8E7F6B] truncate">K. R. Madhavan</div>
                  </div>
                </button>

                {/* Timber Mill Owner */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('seller', 'mill_owner')}
                  className="p-2 rounded-xl bg-[#E7E1D6]/70 hover:bg-[#E7E1D6] border border-[#8E7F6B]/30 text-left transition flex items-center gap-2"
                >
                  <Factory className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#4A3626] text-[11px] truncate">Mill Owner</div>
                    <div className="text-[10px] text-[#8E7F6B] truncate">Perumbavoor Sawmill</div>
                  </div>
                </button>

                {/* Carpenter */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('carpenter')}
                  className="p-2 rounded-xl bg-[#E7E1D6]/70 hover:bg-[#E7E1D6] border border-[#8E7F6B]/30 text-left transition flex items-center gap-2"
                >
                  <Hammer className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#4A3626] text-[11px] truncate">Carpenter</div>
                    <div className="text-[10px] text-[#8E7F6B] truncate">Master Binu Achari</div>
                  </div>
                </button>

                {/* Transport Owner */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('transport')}
                  className="p-2 rounded-xl bg-[#E7E1D6]/70 hover:bg-[#E7E1D6] border border-[#8E7F6B]/30 text-left transition flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#4A3626] text-[11px] truncate">Transport Owner</div>
                    <div className="text-[10px] text-[#8E7F6B] truncate">Malabar Haulage</div>
                  </div>
                </button>

                {/* Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickDemo('admin')}
                  className="p-2 rounded-xl bg-stone-200 hover:bg-stone-300 border border-stone-300 text-left transition flex items-center gap-2"
                >
                  <Shield className="w-4 h-4 text-[#4A3626] flex-shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-[#4A3626] text-[11px] truncate">Admin Cell</div>
                    <div className="text-[10px] text-[#8E7F6B] truncate">Chief Moderator</div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{successBanner}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A3626] mb-1">
              {lang === 'en' ? 'Registered Mobile Number' : 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ'}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-[#8E7F6B] font-mono">
                +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                placeholder="9847123456"
                className="w-full py-2.5 pl-12 pr-4 rounded-xl border border-[#8E7F6B]/30 text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#4A3626]">
                {lang === 'en' ? '6-Digit Security PIN' : '6-അക്ക സുരക്ഷാ പിൻ'}
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] text-[#5B6147] hover:underline font-semibold"
              >
                {lang === 'en' ? 'Forgot PIN?' : 'പിൻ മറന്നോ?'}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-[#8E7F6B]" />
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                placeholder="••••••"
                className="w-full py-2.5 pl-10 pr-10 rounded-xl border border-[#8E7F6B]/30 text-base font-mono font-bold tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-[#8E7F6B] hover:text-[#4A3626] p-0.5"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{lang === 'en' ? 'Sign In to Dashboard' : 'ഡാഷ്‌ബോർഡിൽ പ്രവേശിക്കുക'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Registration Link */}
        <div className="text-center pt-2 text-xs text-[#7A5A3A]">
          {lang === 'en' ? 'Do not have an account?' : 'ഇതുവരെ അക്കൗണ്ട് ഇല്ലേ?'}{' '}
          <Link to="/register" className="font-bold text-[#5B6147] hover:underline">
            {lang === 'en' ? 'Create Account' : 'പുതിയ അക്കൗണ്ട് തുടങ്ങുക'}
          </Link>
        </div>
      </div>

      {/* Forgot PIN Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-stone-300 shadow-2xl relative">
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotError(null);
              }}
              className="absolute right-4 top-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-serif font-bold text-[#4A3626] text-lg">
                {lang === 'en' ? 'Reset Security PIN' : 'പിൻ മാറ്റുക'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'en'
                  ? 'Verify your registered mobile number using demo OTP.'
                  : 'ഡെമോ OTP ഉപയോഗിച്ച് പുതിയ പിൻ സെറ്റ് ചെയ്യുക.'}
              </p>
            </div>

            {forgotError && (
              <div className="p-2.5 bg-rose-50 text-rose-800 text-xs rounded-xl flex items-center gap-2 font-medium">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl text-center space-y-1 font-bold text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <span>{lang === 'en' ? 'PIN updated successfully!' : 'പിൻ വിജയകരമായി മാറ്റി!'}</span>
              </div>
            ) : forgotStep === 1 ? (
              <form onSubmit={handleForgotStep1} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'en' ? 'Mobile Number' : 'മൊബൈൽ നമ്പർ'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9847123456"
                    className="w-full py-2 px-3 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition"
                >
                  {lang === 'en' ? 'Send Demo OTP' : 'ഡെമോ OTP അയക്കുക'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotStep2} className="space-y-3">
                <div className="p-2 bg-stone-100 rounded-xl text-center text-xs text-stone-700">
                  <span>Demo OTP: <b className="font-mono text-sm">123456</b></span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'en' ? 'Enter 6-Digit OTP' : '6-അക്ക OTP നൽകുക'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-2 rounded-xl border border-stone-300 text-center font-mono font-bold tracking-widest text-sm focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'en' ? 'New PIN' : 'പുതിയ പിൻ'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={forgotNewPin}
                      onChange={(e) => setForgotNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full py-2 rounded-xl border border-stone-300 text-center font-mono font-bold text-sm focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'en' ? 'Confirm PIN' : 'സ്ഥിരീകരിക്കുക'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={forgotConfirmPin}
                      onChange={(e) => setForgotConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full py-2 rounded-xl border border-stone-300 text-center font-mono font-bold text-sm focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs transition"
                >
                  {lang === 'en' ? 'Update & Save PIN' : 'പിൻ മാറ്റുക'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
