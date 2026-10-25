import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Trees, Calculator, ShieldCheck, UserCheck, Phone, Globe } from 'lucide-react';
import { calcRectangularCFT, formatINR } from '@timora/shared';

export function App() {
  const [lang, setLang] = useState<'en' | 'ml'>('en');

  // Quick calculator demo state
  const [lengthFt, setLengthFt] = useState(10);
  const [widthIn, setWidthIn] = useState(6);
  const [thicknessIn, setThicknessIn] = useState(2);
  const [pieces, setPieces] = useState(1);
  const [pricePerCft, setPricePerCft] = useState(2200);

  const calcResult = (() => {
    try {
      return calcRectangularCFT({
        length_ft: lengthFt,
        width_in: widthIn,
        thickness_in: thicknessIn,
        pieces: pieces,
        price_per_cft: pricePerCft,
      });
    } catch {
      return null;
    }
  })();

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
              <Link to="/" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'Marketplace' : 'മാർക്കറ്റ്'}
              </Link>
              <Link to="/calculator" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'CFT Calculator' : 'തടി കാൽക്കുലേറ്റർ'}
              </Link>
              <Link to="/carpenters" className="hover:text-forest-700 transition">
                {lang === 'en' ? 'Carpenters' : 'തച്ചന്മാർ (Carpenters)'}
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
            <Route
              path="/"
              element={
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
                  {/* Hero Section */}
                  <section className="text-center max-w-3xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-50 border border-forest-200 text-forest-800 text-xs font-semibold">
                      <ShieldCheck className="w-4 h-4 text-forest-600" />
                      {lang === 'en'
                        ? '100% Raw Timber Only · Kerala Direct Sourcing'
                        : 'യഥാർത്ഥ തടികൾ മാത്രം · കേരളത്തിൽ നേരിട്ട്'}
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {lang === 'en' ? (
                        <>
                          Buy & Sell Premium Timber in <span className="text-forest-700">Kerala</span>
                        </>
                      ) : (
                        <>
                          കേരളത്തിലെ ഏറ്റവും മികച്ച <span className="text-forest-700">തടി വിപണി</span>
                        </>
                      )}
                    </h1>
                    <p className="text-lg text-slate-600">
                      {lang === 'en'
                        ? 'Direct connection between verified timber merchants, home owners, and carpenters. Zero furniture, pure raw timber.'
                        : 'തടിക്കച്ചവടക്കാർ, വീട് പണിയുന്നവർ, ആശാരിമാർ എന്നിവർക്കായി നേരിട്ടുള്ള പ്ലാറ്റ്‌ഫോം.'}
                    </p>
                  </section>

                  {/* Interactive Timber Calculator Section */}
                  <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-900">
                        <Calculator className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">
                          {lang === 'en' ? 'Kerala Timber Volume Calculator' : 'കേരള തടി അളവ് കാൽക്കുലേറ്റർ'}
                        </h2>
                        <p className="text-xs text-slate-500">
                          Formula: CFT = (Length_ft × Width_in × Thickness_in ÷ 144) × Pieces
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {lang === 'en' ? 'Length (Feet)' : 'നീളം (അടി)'}
                        </label>
                        <input
                          type="number"
                          value={lengthFt}
                          onChange={(e) => setLengthFt(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {lang === 'en' ? 'Width (Inches)' : 'വീതി (ഇഞ്ച്)'}
                        </label>
                        <input
                          type="number"
                          value={widthIn}
                          onChange={(e) => setWidthIn(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {lang === 'en' ? 'Thickness (Inches)' : 'കനം (ഇഞ്ച്)'}
                        </label>
                        <input
                          type="number"
                          value={thicknessIn}
                          onChange={(e) => setThicknessIn(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {lang === 'en' ? 'Pieces' : 'എണ്ണം'}
                        </label>
                        <input
                          type="number"
                          value={pieces}
                          onChange={(e) => setPieces(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          min={1}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {lang === 'en' ? 'Rate (₹ / CFT)' : 'വില (₹ / CFT)'}
                        </label>
                        <input
                          type="number"
                          value={pricePerCft}
                          onChange={(e) => setPricePerCft(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          min={1}
                        />
                      </div>
                    </div>

                    {calcResult && (
                      <div className="mt-6 p-4 rounded-xl bg-forest-50 border border-forest-200 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-xs uppercase font-bold text-forest-800 tracking-wider">
                            {lang === 'en' ? 'Total Volume' : 'ആകെ വ്യാപ്തി'}
                          </span>
                          <div className="text-2xl font-black text-forest-900">
                            {calcResult.total_cft} <span className="text-sm font-semibold">CFT</span>{' '}
                            <span className="text-xs font-normal text-slate-500">
                              ({calcResult.total_cft_m3} m³)
                            </span>
                          </div>
                        </div>

                        {calcResult.estimated_cost && (
                          <div className="text-right">
                            <span className="text-xs uppercase font-bold text-forest-800 tracking-wider">
                              {lang === 'en' ? 'Estimated Total' : 'ആകെ വില'}
                            </span>
                            <div className="text-2xl font-black text-forest-900">
                              {formatINR(calcResult.estimated_cost)}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                </div>
              }
            />
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
