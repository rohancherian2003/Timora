import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Trees, Calculator, ShieldCheck, Globe } from 'lucide-react';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { CalculatorPage } from './pages/public/CalculatorPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

export function App() {
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ml' : 'en'));
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-slate-50" lang={lang}>
        {/* Navigation Bar */}
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-forest-700 flex items-center justify-center text-white shadow-sm">
                <Trees className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-slate-900">TIMORA</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-forest-700">
                  {lang === 'en' ? 'Timber Marketplace' : 'തടി മാർക്കറ്റ്'}
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/marketplace" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്'}
              </Link>
              <Link to="/calculator" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'CFT Calculator' : 'തടി കാൽക്കുലേറ്റർ'}
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition"
              >
                <Globe className="w-3.5 h-3.5" />
                {lang === 'en' ? 'മലയാളം' : 'English'}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-forest-700 hover:bg-forest-800 text-white shadow-sm transition"
              >
                {lang === 'en' ? 'Sign In / Register' : 'ലോഗിൻ / രജിസ്റ്റർ'}
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<MarketplacePage lang={lang} />} />
            <Route path="/marketplace" element={<MarketplacePage lang={lang} />} />
            <Route path="/calculator" element={<CalculatorPage lang={lang} />} />
            <Route path="/login" element={<LoginPage lang={lang} />} />
            <Route path="/register" element={<RegisterPage lang={lang} />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Timora — Smart Timber Marketplace Kerala. All rights reserved.
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
