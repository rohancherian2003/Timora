import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Phone, KeyRound, AlertCircle, ArrowRight, Shield, Store, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { validateIndianPhone } from '@timora/shared';
import { useAuth, UserRole } from '../../context/AuthContext';
import { BrandLogo } from '../../components/BrandLogo';

export function LoginPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const navigate = useNavigate();
  const { user, isAuthenticated, login, loginAsDemo } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('buyer');
  const [phone, setPhone] = useState('9847987654');
  const [pin, setPin] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);

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

  // If already logged in, automatically redirect immediately to the respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getDestination(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Helper to switch default demo credentials based on role tab
  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setError(null);
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

  // 1-Click Instant Demo Login & Automatic Redirection
  const handleQuickDemo = (role: UserRole) => {
    setError(null);
    setLoading(true);
    setRedirecting(role);

    loginAsDemo(role);
    const destination = getDestination(role);
    setTimeout(() => {
      navigate(destination, { replace: true });
    }, 150);
  };

  // Regular Phone & PIN Login & Automatic Redirection
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.message || (lang === 'en' ? 'Please enter a valid 10-digit mobile number.' : 'സാധുവായ 10-അക്ക മൊബൈൽ നമ്പർ നൽകുക.'));
      return;
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError(lang === 'en' ? 'Please enter your 6-digit security PIN.' : 'ദയവായി നിങ്ങളുടെ 6-അക്ക സുരക്ഷാ പിൻ നൽകുക.');
      return;
    }

    setLoading(true);

    try {
      const res = await login(phone, pin, selectedRole);
      if (res.success && res.role) {
        setRedirecting(res.role);
        const targetPath = getDestination(res.role);
        setTimeout(() => {
          navigate(targetPath, { replace: true });
        }, 150);
      } else {
        setError(res.error || (lang === 'en' ? 'Authentication failed. Please verify credentials.' : 'ലോഗിൻ പരാജയപ്പെട്ടു. വിവരങ്ങൾ ശരിയാണോ എന്ന് പരിശോധിക്കുക.'));
        setLoading(false);
      }
    } catch {
      setError(lang === 'en' ? 'Unable to connect to service. Please try again.' : 'സർവ്വറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-amber-200/90 p-6 sm:p-8 shadow-xl shadow-amber-950/5 space-y-6">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-2">
          <BrandLogo size="lg" lang={lang} />
          <h1 className="text-xl sm:text-2xl font-extrabold font-serif text-[#2c160b] pt-2">
            {lang === 'en' ? 'Sign in to Timora' : 'ടിമോറ അക്കൗണ്ടിലേക്ക് പ്രവേശിക്കുക'}
          </h1>
          <p className="text-xs sm:text-sm text-[#6b472e] max-w-sm font-medium">
            {lang === 'en'
              ? 'Select your account type to securely access your dedicated timber portal.'
              : 'നിങ്ങളുടെ പ്രത്യേക തടി പോർട്ടൽ ആക്സസ് ചെയ്യാൻ അക്കൗണ്ട് തരം തിരഞ്ഞെടുക്കുക.'}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div>
          <label className="block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2 text-center">
            {lang === 'en' ? 'Select Your Account Role' : 'താങ്കളുടെ റോൾ തിരഞ്ഞെടുക്കുക'}
          </label>
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-[#faf6ee] rounded-2xl border border-amber-200/80">
            <button
              type="button"
              onClick={() => handleRoleTabChange('buyer')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'buyer'
                  ? 'bg-white text-[#b45309] shadow-xs ring-1 ring-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4 mb-1 text-emerald-700" />
              <span>{lang === 'en' ? 'Buyer' : 'ഉപഭോക്താവ്'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('seller')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'seller'
                  ? 'bg-white text-[#b45309] shadow-xs ring-1 ring-amber-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Store className="w-4 h-4 mb-1 text-amber-700" />
              <span>{lang === 'en' ? 'Seller Depot' : 'കച്ചവടക്കാരൻ'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-stone-900 shadow-xs ring-1 ring-stone-300'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Shield className="w-4 h-4 mb-1 text-stone-700" />
              <span>{lang === 'en' ? 'Admin' : 'അഡ്മിൻ'}</span>
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Instant Redirecting Notification Banner */}
        {redirecting && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-3 text-emerald-900 font-semibold text-xs sm:text-sm animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>
              {lang === 'en'
                ? `Logged in! Entering ${redirecting.toUpperCase()} Dashboard...`
                : `വിജയകരമായി ലോഗിൻ ചെയ്തു! ${redirecting} ഡാഷ്‌ബോർഡിലേക്ക് പ്രവേശിക്കുന്നു...`}
            </span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
              <span>{lang === 'en' ? 'Registered Mobile Number' : 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ'}</span>
              <span className="text-[10px] text-stone-400 font-normal">India (+91)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-sm font-bold text-stone-500">+91</span>
              <input
                type="tel"
                placeholder="9847123456"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-amber-200 text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none transition bg-stone-50/50"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-stone-700">
                {lang === 'en' ? '6-Digit Security PIN' : '6-അക്ക സുരക്ഷാ പിൻ (PIN)'}
              </label>
              <span className="text-[10px] text-[#b45309] font-medium">
                {lang === 'en' ? 'Default demo: 123456' : 'ഡെമോ പിൻ: 123456'}
              </span>
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-amber-200 text-sm tracking-widest text-center text-lg font-mono font-bold focus:ring-2 focus:ring-[#b45309] focus:outline-none transition bg-stone-50/50"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !!redirecting}
            className="w-full py-3 px-4 rounded-xl bg-[#b45309] hover:bg-[#92400e] text-white font-bold text-sm shadow-md shadow-amber-950/10 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{lang === 'en' ? 'Authenticating & Entering Dashboard...' : 'പരിശോധിച്ച് പ്രവേശിക്കുന്നു...'}</span>
              </>
            ) : (
              <>
                <span>
                  {lang === 'en'
                    ? `Sign In as ${selectedRole.toUpperCase()}`
                    : `${selectedRole} ആയി ലോഗിൻ ചെയ്യുക`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* One-Click Quick Demo Shortcuts */}
        <div className="pt-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-amber-100"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              {lang === 'en' ? 'Or One-Click Instant Access' : 'അല്ലെങ്കിൽ തൽക്ഷണ ഡെമോ ആക്സസ്'}
            </span>
            <div className="flex-grow border-t border-amber-100"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('seller')}
              disabled={loading || !!redirecting}
              className="py-2.5 px-3 rounded-xl border border-amber-300 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs"
            >
              <Store className="w-3.5 h-3.5 text-amber-700" />
              <span>{lang === 'en' ? 'Seller Depot' : 'സെല്ലർ ഡെമോ'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('buyer')}
              disabled={loading || !!redirecting}
              className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'en' ? 'Buyer Demo' : 'ബയർ ഡെമോ'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              disabled={loading || !!redirecting}
              className="py-2.5 px-3 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center justify-center gap-1.5 transition text-center shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-stone-700" />
              <span>{lang === 'en' ? 'Admin Demo' : 'അഡ്മിൻ ഡെമോ'}</span>
            </button>
          </div>
        </div>

        {/* Footer Link to Register */}
        <div className="text-center pt-2 border-t border-amber-100 text-xs text-stone-500">
          {lang === 'en' ? "Don't have an account yet?" : 'ടിമോറയിൽ അക്കൗണ്ട് ഇല്ലേ? '}{' '}
          <Link to="/register" className="font-bold text-[#b45309] hover:underline">
            {lang === 'en' ? 'Register New Account' : 'പുതിയ അക്കൗണ്ട് രജിസ്റ്റർ ചെയ്യുക'}
          </Link>
        </div>
      </div>
    </div>
  );
}
