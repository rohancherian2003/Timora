import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Phone, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { validateIndianPhone, validatePin } from '@timora/shared';

export function LoginPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const phoneCheck = validateIndianPhone(phone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.message || 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
      setError('Please enter your 6-digit security PIN.');
      return;
    }

    setLoading(true);
    // Simulate login API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-forest-100 rounded-2xl flex items-center justify-center mx-auto text-forest-800">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {lang === 'en' ? 'Sign in to Timora' : 'ടിമോറയിലേക്ക് പ്രവേശിക്കുക'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'en'
              ? 'Enter your registered 10-digit mobile number and 6-digit PIN.'
              : 'നിങ്ങളുടെ രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പറും 6-അക്ക പിന്നും നൽകുക.'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 bg-forest-50 border border-forest-200 rounded-xl text-center space-y-2 text-forest-900">
            <div className="text-sm font-bold">
              {lang === 'en' ? 'Welcome back!' : 'സ്വാഗതം!'}
            </div>
            <p className="text-xs text-forest-700">
              {lang === 'en' ? 'Logged in successfully. Redirecting to dashboard...' : 'വിജയകരമായി ലോഗിൻ ചെയ്തു. ഡാഷ്‌ബോർഡിലേക്ക് തിരിയുന്നു...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Mobile Number' : 'മൊബൈൽ നമ്പർ'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">+91</span>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? '6-Digit Security PIN' : '6-അക്ക പിൻ (PIN)'}
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="••••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm tracking-widest text-center text-lg font-bold focus:ring-2 focus:ring-forest-600 focus:outline-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-forest-700 hover:bg-forest-800 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2"
            >
              {loading
                ? (lang === 'en' ? 'Signing in...' : 'ലോഗിൻ ചെയ്യുന്നു...')
                : (lang === 'en' ? 'Sign In' : 'ലോഗിൻ ചെയ്യുക')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500">
          {lang === 'en' ? "Don't have an account?" : 'അക്കൗണ്ട് ഇല്ലേ? '}{' '}
          <Link to="/register" className="font-semibold text-forest-700 hover:underline">
            {lang === 'en' ? 'Register now' : 'ഇപ്പോൾ രജിസ്റ്റർ ചെയ്യുക'}
          </Link>
        </div>
      </div>
    </div>
  );
}
