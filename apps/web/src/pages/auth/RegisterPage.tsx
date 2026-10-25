import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Loader2, Store, ShoppingBag, Hammer } from 'lucide-react';
import { validateIndianPhone, validatePin } from '@timora/shared';
import { useAuth, UserRole } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';

export function RegisterPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Details & Phone, 2: OTP, 3: PIN & Role
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller' | 'carpenter'>('buyer');
  const [businessName, setBusinessName] = useState('');
  const [districtId, setDistrictId] = useState<number>(5); // default Kottayam
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleStep1 = (e: React.FormEvent) => {
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

  const handleStep2 = (e: React.FormEvent) => {
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

  const handleStep3 = async (e: React.FormEvent) => {
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
      const authRole: UserRole = role === 'seller' ? 'seller' : 'buyer';
      await login(phone, pin, authRole);
      setSuccess(true);

      setTimeout(() => {
        if (authRole === 'seller') {
          navigate('/dashboard/seller');
        } else {
          navigate('/dashboard/buyer');
        }
      }, 1000);
    } catch {
      setError(lang === 'en' ? 'Registration failed. Please try again.' : 'രജിസ്ട്രേഷൻ പരാജയപ്പെട്ടു.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-stone-100 via-slate-50 to-emerald-50/30">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xl shadow-stone-900/5 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <BrandLogo size="md" lang={lang} className="justify-center" />
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 pt-2">
            {lang === 'en' ? 'Create Your Timora Account' : 'ടിമോറയിൽ പുതിയ അക്കൗണ്ട് തുറക്കൂ'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
            {lang === 'en'
              ? 'Connect directly with certified timber yards, buyers, and sawmills across Kerala.'
              : 'കേരളത്തിലെ വിശ്വസനീയമായ തടി വ്യാപാരികളുമായും ഉപഭോക്താക്കളുമായും നേരിട്ട് ബന്ധപ്പെടൂ.'}
          </p>
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-between max-w-xs mx-auto text-xs font-bold pt-1">
          <span className={`px-2.5 py-1 rounded-full ${step >= 1 ? 'bg-forest-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
            1. {lang === 'en' ? 'Phone' : 'നമ്പർ'}
          </span>
          <span className="text-stone-300">──</span>
          <span className={`px-2.5 py-1 rounded-full ${step >= 2 ? 'bg-forest-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
            2. OTP
          </span>
          <span className="text-stone-300">──</span>
          <span className={`px-2.5 py-1 rounded-full ${step >= 3 ? 'bg-forest-800 text-white' : 'bg-stone-200 text-stone-500'}`}>
            3. {lang === 'en' ? 'Role & PIN' : 'പിൻ'}
          </span>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl text-center space-y-3 animate-fadeIn">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-emerald-950">
              {lang === 'en' ? 'Registration Successful!' : 'രജിസ്ട്രേഷൻ വിജയകരമായി പൂർത്തിയായി!'}
            </h3>
            <p className="text-xs text-emerald-800">
              {lang === 'en' ? 'Redirecting directly to your personal dashboard...' : 'നിങ്ങളുടെ ഡാഷ്‌ബോർഡിലേക്ക് തിരിയുന്നു...'}
            </p>
          </div>
        ) : (
          <>
            {/* Step 1: Name and Phone */}
            {step === 1 && (
              <form onSubmit={handleStep1} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Full Legal Name' : 'പൂർണ്ണ നാമം'}
                  </label>
                  <input
                    type="text"
                    placeholder={lang === 'en' ? 'e.g. Suresh Kumar' : 'ഉദാ: സുരേഷ് കുമാർ'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? '10-Digit Mobile Number' : '10-അക്ക മൊബൈൽ നമ്പർ'}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-bold text-slate-500">+91</span>
                    <input
                      type="tel"
                      placeholder="9847123456"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'en' ? 'Send OTP Verification' : 'OTP അയക്കുക'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleStep2} className="space-y-4">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">
                    {lang === 'en' ? 'Demo Sandbox OTP: ' : 'ഡെമോ OTP: '}
                  </span>
                  <span>{lang === 'en' ? 'Use code ' : 'കോഡ് '}<b className="font-mono text-sm">123456</b></span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {lang === 'en' ? 'Enter 6-Digit Verification Code' : '6-അക്ക OTP നൽകുക'}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'en' ? 'Verify & Continue' : 'OTP സ്ഥിരീകരിക്കുക'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Step 3: Role and PIN */}
            {step === 3 && (
              <form onSubmit={handleStep3} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    {lang === 'en' ? 'Choose Your Marketplace Role' : 'അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക'}
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        role === 'buyer'
                          ? 'border-forest-700 bg-forest-50 text-forest-900 ring-2 ring-forest-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-forest-700" />
                      <span>{lang === 'en' ? 'Timber Buyer' : 'ഉപഭോക്താവ്'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        role === 'seller'
                          ? 'border-amber-600 bg-amber-50 text-amber-900 ring-2 ring-amber-600 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4 text-amber-600" />
                      <span>{lang === 'en' ? 'Timber Depot' : 'തടിക്കച്ചവടം'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('carpenter')}
                      className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                        role === 'carpenter'
                          ? 'border-stone-700 bg-stone-100 text-stone-900 ring-2 ring-stone-700 shadow-sm'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Hammer className="w-4 h-4 text-stone-700" />
                      <span>{lang === 'en' ? 'Carpenter' : 'ആശാരി'}</span>
                    </button>
                  </div>
                </div>

                {role === 'seller' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Depot or Sawmill Name' : 'തടി ഡിപ്പോ / വ്യാപാര സ്ഥാപനത്തിന്റെ പേര്'}
                    </label>
                    <input
                      type="text"
                      placeholder={lang === 'en' ? 'e.g. Kottayam Timber Works' : 'ഉദാ: കോട്ടയം ടിംബർ വർക്സ്'}
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'en' ? '6-Digit PIN' : '6-അക്ക പിൻ'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••••"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      {lang === 'en' ? 'Confirm PIN' : 'പിൻ സ്ഥിരീകരിക്കുക'}
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="••••••"
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-forest-800 hover:bg-forest-900 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>{lang === 'en' ? 'Complete Registration & Enter' : 'രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുക'}</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          {lang === 'en' ? 'Already have an account? ' : 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ? '}{' '}
          <Link to="/login" className="font-bold text-forest-700 hover:text-forest-900 hover:underline">
            {lang === 'en' ? 'Sign in here' : 'ഇവിടെ ലോഗിൻ ചെയ്യുക'}
          </Link>
        </div>
      </div>
    </div>
  );
}
