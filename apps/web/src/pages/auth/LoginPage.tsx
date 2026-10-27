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
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { validateIndianPhone } from '@timora/shared';
import { useAuth, UserRole } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';

export function LoginPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, loginAsDemo } = useAuth();

  const regState = location.state as { registered?: boolean; phone?: string; role?: UserRole } | null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(regState?.role || 'buyer');
  const [phone, setPhone] = useState(regState?.phone || '9847987654');
  const [pin, setPin] = useState(regState?.registered ? '' : '123456');
  const [showPin, setShowPin] = useState(false);
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(
    regState?.registered
      ? lang === 'en'
        ? 'Account created successfully! Please enter your PIN to sign in.'
        : 'അക്കൗണ്ട് വിജയകരമായി സൃഷ്ടിച്ചു! പ്രവേശിക്കാൻ നിങ്ങളുടെ പിൻ നൽകുക.'
      : null
  );
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

  const getDestination = (role: UserRole) => {
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

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDestination(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
    setSuccessBanner(null);
    if (role === 'seller') {
      setPhone('9847120001');
      setPin('123456');
    } else if (role === 'admin') {
      setPhone('9847000000');
      setPin('123456');
    } else {
      setPhone('9847987654');
      setPin('123456');
    }
  };

  const handleQuickDemo = (role: UserRole) => {
    setError(null);
    setLoading(true);
    loginAsDemo(role);
    const dest = getDestination(role);
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
      const res = await login(cleanPhone, pin, selectedRole);
      if (res.success && res.role) {
        navigate(getDestination(res.role), { replace: true });
      } else {
        setError(res.error || (lang === 'en' ? 'Authentication failed. Please verify credentials.' : 'ലോഗിൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ ശരിയാണോ എന്ന് പരിശോധിക്കുക.'));
        setLoading(false);
      }
    } catch {
      setError(lang === 'en' ? 'Unable to connect to service.' : 'സർവ്വറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല.');
      setLoading(false);
    }
  };

  // Forgot PIN Step 1: Request OTP
  const handleForgotStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const clean = forgotPhone.replace(/\D/g, '');
    const check = validateIndianPhone(clean);
    if (!check.valid) {
      setForgotError(lang === 'en' ? 'Enter a valid 10-digit mobile number.' : 'സാധുവായ 10-അക്ക നമ്പർ നൽകുക.');
      return;
    }
    setForgotStep(2);
  };

  // Forgot PIN Step 2: Verify & Reset
  const handleForgotStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotOtp !== '123456' && forgotOtp.length !== 6) {
      setForgotError(lang === 'en' ? 'Invalid OTP. Use demo OTP 123456.' : 'അസാധുവായ OTP. ഡെമോ OTP 123456 ഉപയോഗിക്കുക.');
      return;
    }

    if (forgotNewPin.length !== 6 || !/^\d{6}$/.test(forgotNewPin)) {
      setForgotError(lang === 'en' ? 'New PIN must be exactly 6 numeric digits.' : 'പുതിയ പിൻ കൃത്യം 6 അക്കങ്ങൾ ആയിരിക്കണം.');
      return;
    }

    if (forgotNewPin !== forgotConfirmPin) {
      setForgotError(lang === 'en' ? 'PINs do not match.' : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
      return;
    }

    setForgotSuccess(true);
    setTimeout(() => {
      setPin(forgotNewPin);
      setPhone(forgotPhone);
      setShowForgotModal(false);
      setForgotSuccess(false);
      setForgotStep(1);
      setSuccessBanner(
        lang === 'en'
          ? 'PIN reset successfully! You can now sign in with your new PIN.'
          : 'പിൻ വിജയകരമായി മാറ്റി! പുതിയ പിൻ ഉപയോഗിച്ച് ലോഗിൻ ചെയ്യാം.'
      );
    }, 1200);
  };

  return (
    <div className="min-h-[82vh] flex items-center justify-center px-4 py-8 bg-[#E7E1D6]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 shadow-md space-y-5">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-1">
          <BrandLogo size="md" lang={lang} />
          <h1 className="text-xl font-extrabold font-serif text-[#4A3626] pt-1">
            {lang === 'en' ? 'Sign In to Timora' : 'ടിമോറയിലേക്ക് പ്രവേശിക്കുക'}
          </h1>
          <p className="text-xs text-[#7A5A3A]">
            {lang === 'en'
              ? 'Select your role and sign in to access your portal.'
              : 'റോൾ തിരഞ്ഞെടുത്ത് അക്കൗണ്ടിലേക്ക് പ്രവേശിക്കുക.'}
          </p>
        </div>

        {/* Minimal Role Switcher */}
        <div className="grid grid-cols-3 p-1 rounded-2xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/20 gap-1 text-center">
          <button
            type="button"
            onClick={() => handleRoleChange('buyer')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              selectedRole === 'buyer'
                ? 'bg-white text-[#4A3626] shadow-xs'
                : 'text-[#7A5A3A] hover:text-[#4A3626]'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Buyer' : 'ബയർ'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('seller')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              selectedRole === 'seller'
                ? 'bg-white text-[#4A3626] shadow-xs'
                : 'text-[#7A5A3A] hover:text-[#4A3626]'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Seller' : 'സെല്ലർ'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleChange('admin')}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              selectedRole === 'admin'
                ? 'bg-white text-[#4A3626] shadow-xs'
                : 'text-[#7A5A3A] hover:text-[#4A3626]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#5B6147]" />
            <span>{lang === 'en' ? 'Admin' : 'അഡ്മിൻ'}</span>
          </button>
        </div>

        {/* Registration Success Banner */}
        {successBanner && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#4A3626] mb-1">
              {lang === 'en' ? 'Mobile Number' : 'മൊബൈൽ നമ്പർ'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#8E7F6B]" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                placeholder="10-digit mobile number"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#8E7F6B]/30 text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                required
              />
            </div>
            <span className="text-[10px] text-[#8E7F6B] mt-0.5 block">
              {lang === 'en' ? 'Format: 10 digits without +91' : '10-അക്ക മൊബൈൽ നമ്പർ'}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-[#4A3626]">
                {lang === 'en' ? 'Security PIN' : 'സുരക്ഷാ പിൻ'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotPhone(phone);
                  setForgotStep(1);
                  setForgotError(null);
                  setShowForgotModal(true);
                }}
                className="text-xs font-bold text-[#5B6147] hover:underline"
              >
                {lang === 'en' ? 'Forgot PIN?' : 'പിൻ മറന്നോ?'}
              </button>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[#8E7F6B]" />
              <input
                type={showPin ? 'text' : 'password'}
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value.replace(/\D/g, ''));
                  if (error) setError(null);
                }}
                placeholder="••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#8E7F6B]/30 text-base font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                required
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-2.5 text-[#8E7F6B] hover:text-[#4A3626] transition p-1"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <span className="text-[10px] text-[#8E7F6B] mt-0.5 block">
              {lang === 'en' ? '6-digit PIN (Demo: 123456)' : '6-അക്ക പിൻ (ഡെമോ: 123456)'}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{lang === 'en' ? 'Sign In' : 'ലോഗിൻ ചെയ്യുക'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Login */}
        <div className="pt-2 border-t border-[#8E7F6B]/20">
          <span className="text-[10px] uppercase font-bold text-[#8E7F6B] tracking-wider block text-center mb-2">
            {lang === 'en' ? 'Instant 1-Click Demo' : 'ഡെമോ ആക്സസ്'}
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              className="py-1.5 px-2 rounded-xl border border-[#8E7F6B]/30 bg-stone-50 hover:bg-stone-100 text-[#4A3626] text-[11px] font-bold text-center transition"
            >
              Buyer Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('seller')}
              className="py-1.5 px-2 rounded-xl border border-[#8E7F6B]/30 bg-stone-50 hover:bg-stone-100 text-[#4A3626] text-[11px] font-bold text-center transition"
            >
              Seller Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 rounded-xl border border-[#8E7F6B]/30 bg-stone-50 hover:bg-stone-100 text-[#4A3626] text-[11px] font-bold text-center transition"
            >
              Admin Demo
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center pt-1 text-xs text-[#7A5A3A]">
          {lang === 'en' ? "Don't have an account?" : 'അക്കൗണ്ട് ഇല്ലേ?'}{' '}
          <Link to="/register" className="font-bold text-[#5B6147] hover:underline">
            {lang === 'en' ? 'Register Now' : 'ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക'}
          </Link>
        </div>
      </div>

      {/* FORGOT PIN MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2C2218]/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-[#8E7F6B]/30 space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#8E7F6B]/20 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#5B6147]" />
                <h3 className="font-bold font-serif text-[#4A3626] text-base">
                  {lang === 'en' ? 'Reset Security PIN' : 'പിൻ റീസെറ്റ് ചെയ്യുക'}
                </h3>
              </div>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-[#8E7F6B] hover:text-[#4A3626] font-bold p-1 rounded-xl hover:bg-[#E7E1D6]/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-950 text-sm">
                  {lang === 'en' ? 'PIN Reset Successfully!' : 'പിൻ വിജയകരമായി മാറ്റി!'}
                </h4>
                <p className="text-xs text-emerald-800">
                  {lang === 'en' ? 'Updating your login form...' : 'ലോഗിൻ ഫോം അപ്ഡേറ്റ് ചെയ്യുന്നു...'}
                </p>
              </div>
            ) : forgotStep === 1 ? (
              <form onSubmit={handleForgotStep1} className="space-y-4">
                <p className="text-xs text-stone-600 leading-relaxed">
                  {lang === 'en'
                    ? 'Enter your registered mobile number to receive a 6-digit OTP code.'
                    : 'OTP കോഡ് ലഭിക്കാൻ നിങ്ങളുടെ രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ നൽകുക.'}
                </p>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {lang === 'en' ? 'Registered Phone Number' : 'രജിസ്റ്റർ ചെയ്ത ഫോൺ നമ്പർ'}
                  </label>
                  <input
                    type="tel"
                    maxLength={10}
                    value={forgotPhone}
                    onChange={(e) => setForgotPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9847123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-semibold focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>{lang === 'en' ? 'Send OTP Code' : 'OTP അയക്കുക'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotStep2} className="space-y-4">
                <div className="p-2.5 bg-stone-100 rounded-xl text-xs text-stone-700 text-center">
                  <span>Demo OTP: <b className="font-mono text-sm">123456</b></span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 text-center">
                    {lang === 'en' ? 'Enter 6-Digit OTP' : '6-അക്ക OTP നൽകുക'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-2 rounded-xl border border-stone-300 text-sm font-mono font-bold tracking-widest text-center focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'en' ? 'New 6-Digit PIN' : 'പുതിയ പിൻ'}
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotPin ? 'text' : 'password'}
                        maxLength={6}
                        value={forgotNewPin}
                        onChange={(e) => setForgotNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full py-2 pl-3 pr-8 rounded-xl border border-stone-300 text-sm font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPin(!showForgotPin)}
                        className="absolute right-2 top-2 text-stone-400 hover:text-stone-700"
                      >
                        {showForgotPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {lang === 'en' ? 'Confirm New PIN' : 'സ്ഥിരീകരിക്കുക'}
                    </label>
                    <div className="relative">
                      <input
                        type={showForgotPin ? 'text' : 'password'}
                        maxLength={6}
                        value={forgotConfirmPin}
                        onChange={(e) => setForgotConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full py-2 pl-3 pr-8 rounded-xl border border-stone-300 text-sm font-mono font-bold text-center tracking-widest focus:ring-2 focus:ring-[#5B6147] focus:outline-none"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPin(!showForgotPin)}
                        className="absolute right-2 top-2 text-stone-400 hover:text-stone-700"
                      >
                        {showForgotPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Update & Save PIN' : 'പിൻ മാറ്റുക'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
