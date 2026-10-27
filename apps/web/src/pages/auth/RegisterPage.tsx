import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2, Store, ShoppingBag, Hammer } from 'lucide-react';
import { validateIndianPhone, validatePin } from '@timora/shared';
import { useAuth, UserRole } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';

export function RegisterPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Name & Phone, 2: OTP, 3: Role & PIN
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'carpenter'>('buyer');
  const [businessName, setBusinessName] = useState('');
  const [districtId, setDistrictId] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'seller') navigate('/dashboard/seller', { replace: true });
      else if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard/buyer', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(lang === 'en' ? 'Enter full name.' : 'നിങ്ങളുടെ പേര് നൽകുക.');
      return;
    }
    const check = validateIndianPhone(phone);
    if (!check.valid) {
      setError(check.message || (lang === 'en' ? 'Valid 10-digit number required.' : 'സാധുവായ മൊബൈൽ നമ്പർ നൽകുക.'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 250);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length !== 6) {
      setError(lang === 'en' ? 'Enter 6-digit OTP code.' : '6-അക്ക OTP നൽകുക.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 250);
  };

  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const pinCheck = validatePin(pin);
    if (!pinCheck.valid) {
      setError(pinCheck.message || (lang === 'en' ? 'Enter valid 6-digit PIN.' : '6-അക്ക പിൻ നൽകുക.'));
      return;
    }
    if (pin !== pinConfirm) {
      setError(lang === 'en' ? 'PINs do not match.' : 'പിൻ കോഡുകൾ പൊരുത്തപ്പെടുന്നില്ല.');
      return;
    }

    setLoading(true);

    try {
      const authRole: UserRole = role === 'seller' ? 'seller' : 'buyer';
      await login(phone, pin, authRole);
      setSuccess(true);

      setTimeout(() => {
        if (authRole === 'seller') {
          navigate('/dashboard/seller', { replace: true });
        } else {
          navigate('/dashboard/buyer', { replace: true });
        }
      }, 700);
    } catch {
      setError(lang === 'en' ? 'Registration failed.' : 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-[#E7E1D6]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#8E7F6B]/30 p-6 sm:p-8 shadow-md space-y-5">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <BrandLogo size="md" lang={lang} className="justify-center" />
          <h1 className="text-xl font-extrabold font-serif text-[#4A3626] pt-2">
            {lang === 'en' ? 'Create Timora Account' : 'ടിമോറയിൽ പുതിയ അക്കൗണ്ട്'}
          </h1>
          <p className="text-xs text-[#7A5A3A]">
            {lang === 'en'
              ? 'Connect directly with timber yards, buyers, and sawmills.'
              : 'തടി വ്യാപാരികളുമായും മില്ലുകളുമായും നേരിട്ട് ബന്ധപ്പെടൂ.'}
          </p>
        </div>

        {/* Minimal Steps Indicator */}
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold">
          <span className={`px-2.5 py-0.5 rounded-full ${step >= 1 ? 'bg-[#5B6147] text-white' : 'bg-stone-100 text-stone-500'}`}>
            1. Details
          </span>
          <span className="text-[#8E7F6B]">›</span>
          <span className={`px-2.5 py-0.5 rounded-full ${step >= 2 ? 'bg-[#5B6147] text-white' : 'bg-stone-100 text-stone-500'}`}>
            2. OTP
          </span>
          <span className="text-[#8E7F6B]">›</span>
          <span className={`px-2.5 py-0.5 rounded-full ${step >= 3 ? 'bg-[#5B6147] text-white' : 'bg-stone-100 text-stone-500'}`}>
            3. PIN & Role
          </span>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-950">
              {lang === 'en' ? 'Account Created Successfully!' : 'അക്കൗണ്ട് വിജയകരമായി പൂർത്തിയായി!'}
            </h3>
            <p className="text-xs text-emerald-800">
              {lang === 'en' ? 'Entering your portal...' : 'പോർട്ടലിലേക്ക് പ്രവേശിക്കുന്നു...'}
            </p>
          </div>
        ) : (
          <>
            {/* Step 1 */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1">
                    {lang === 'en' ? 'Full Name' : 'പൂർണ്ണ നാമം'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'e.g. Suresh Kumar' : 'ഉദാ: സുരേഷ് കുമാർ'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1">
                    {lang === 'en' ? 'Mobile Number' : 'മൊബൈൽ നമ്പർ'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-[#8E7F6B]">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9847123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-11 pr-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs sm:text-sm font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{lang === 'en' ? 'Next: OTP' : 'അടുത്തത്: OTP'}</span>}
                </button>
              </form>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-3.5">
                <div className="p-2.5 bg-[#E7E1D6]/60 rounded-xl text-xs text-[#4A3626] text-center">
                  <span>Demo OTP: <b className="font-mono text-sm">123456</b></span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1 text-center">
                    {lang === 'en' ? 'Enter 6-Digit OTP' : '6-അക്ക OTP നൽകുക'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full py-2 rounded-xl border border-[#8E7F6B]/30 text-base font-mono font-bold tracking-widest text-center text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{lang === 'en' ? 'Verify OTP' : 'OTP സ്ഥിരീകരിക്കുക'}</span>}
                </button>
              </form>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#4A3626] mb-1.5">
                    {lang === 'en' ? 'Select Role' : 'റോൾ തിരഞ്ഞെടുക്കുക'}
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs font-bold text-center">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-2 rounded-xl border transition ${
                        role === 'buyer'
                          ? 'border-[#5B6147] bg-[#5B6147] text-white'
                          : 'border-[#8E7F6B]/30 bg-stone-50 text-[#4A3626]'
                      }`}
                    >
                      Buyer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-2 rounded-xl border transition ${
                        role === 'seller'
                          ? 'border-[#5B6147] bg-[#5B6147] text-white'
                          : 'border-[#8E7F6B]/30 bg-stone-50 text-[#4A3626]'
                      }`}
                    >
                      Seller Depot
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('carpenter')}
                      className={`p-2 rounded-xl border transition ${
                        role === 'carpenter'
                          ? 'border-[#5B6147] bg-[#5B6147] text-white'
                          : 'border-[#8E7F6B]/30 bg-stone-50 text-[#4A3626]'
                      }`}
                    >
                      Carpenter
                    </button>
                  </div>
                </div>

                {role === 'seller' && (
                  <div>
                    <label className="block text-xs font-bold text-[#4A3626] mb-1">
                      {lang === 'en' ? 'Timber Depot Name' : 'ഡിപ്പോ നാമം'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Nilambur Wood Mart"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#8E7F6B]/30 text-xs font-semibold text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-[#4A3626] mb-1">
                      {lang === 'en' ? '6-Digit PIN' : '6-അക്ക പിൻ'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full py-2 px-3 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#4A3626] mb-1">
                      {lang === 'en' ? 'Confirm PIN' : 'സ്ഥിരീകരിക്കുക'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••••"
                      className="w-full py-2 px-3 rounded-xl border border-[#8E7F6B]/30 text-sm font-mono font-bold text-center tracking-widest text-[#4A3626] focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'en' ? 'Complete Registration' : 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
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
