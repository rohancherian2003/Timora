import React, { useState } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';
import {
  calcRectangularCFT,
  calcRoundLogCFT,
  cftToM3,
  m3ToCft,
  formatINR,
} from '@timora/shared';

export function CalculatorPage({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const [activeTab, setActiveTab] = useState<'rectangular' | 'round'>('rectangular');

  // Rectangular inputs
  const [lengthFt, setLengthFt] = useState<number>(10);
  const [widthIn, setWidthIn] = useState<number>(6);
  const [thicknessIn, setThicknessIn] = useState<number>(2);
  const [pieces, setPieces] = useState<number>(1);
  const [ratePerCft, setRatePerCft] = useState<number>(2200);

  // Round log inputs
  const [logDiameterIn, setLogDiameterIn] = useState<number>(14);
  const [logLengthFt, setLogLengthFt] = useState<number>(12);
  const [logRatePerCft, setLogRatePerCft] = useState<number>(1800);

  // Rectangular calculation
  const rectResult = (() => {
    try {
      if (lengthFt <= 0 || widthIn <= 0 || thicknessIn <= 0 || pieces <= 0) return null;
      return calcRectangularCFT({
        length_ft: lengthFt,
        width_in: widthIn,
        thickness_in: thicknessIn,
        pieces,
        price_per_cft: ratePerCft > 0 ? ratePerCft : undefined,
      });
    } catch {
      return null;
    }
  })();

  // Round log calculation
  const roundResult = (() => {
    try {
      if (logDiameterIn <= 0 || logLengthFt <= 0) return null;
      return calcRoundLogCFT({
        diameter_in: logDiameterIn,
        length_ft: logLengthFt,
        price_per_cft: logRatePerCft > 0 ? logRatePerCft : undefined,
      });
    } catch {
      return null;
    }
  })();

  const resetValues = () => {
    setLengthFt(10);
    setWidthIn(6);
    setThicknessIn(2);
    setPieces(1);
    setRatePerCft(2200);
    setLogDiameterIn(14);
    setLogLengthFt(12);
    setLogRatePerCft(1800);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
            <Calculator className="w-7 h-7 text-forest-700" />
            {lang === 'en' ? 'Timber Volume & Price Calculator' : 'തടി അളവ് & വില കാൽക്കുലേറ്റർ'}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {lang === 'en'
              ? 'Kerala standard CFT measurements for sawn planks, beams, and round logs.'
              : 'കേരളത്തിലെ അംഗീകൃത രീതിയിലുള്ള തടി അളവുകളും CFT കണക്കുകൂട്ടലുകളും.'}
          </p>
        </div>
        <button
          onClick={resetValues}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-600 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Reset' : 'റീസെറ്റ്'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-slate-200/70 p-1.5 max-w-md">
        <button
          onClick={() => setActiveTab('rectangular')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === 'rectangular'
              ? 'bg-white text-forest-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'en' ? 'Planks & Beams (Sawn)' : 'അറുത്ത തടികൾ (പലക / തൂൺ)'}
        </button>
        <button
          onClick={() => setActiveTab('round')}
          className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition ${
            activeTab === 'round'
              ? 'bg-white text-forest-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {lang === 'en' ? 'Round Logs' : 'തടി ഉരുപ്പടികൾ (ലോഗ്സ്)'}
        </button>
      </div>

      {/* Calculator Body */}
      {activeTab === 'rectangular' ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="p-3 bg-forest-50 border border-forest-200 rounded-xl flex items-start gap-2.5 text-xs text-forest-900">
            <Info className="w-4 h-4 text-forest-700 mt-0.5 flex-shrink-0" />
            <div>
              <strong>{lang === 'en' ? 'Kerala CFT Formula: ' : 'കേരള CFT ഫോർമുല: '}</strong>
              <code>CFT = (Length in Feet × Width in Inches × Thickness in Inches ÷ 144) × Pieces</code>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Length (Feet / അടി)' : 'നീളം (അടി)'}
              </label>
              <input
                type="number"
                value={lengthFt || ''}
                onChange={(e) => setLengthFt(Number(e.target.value))}
                min={0.1}
                step={0.1}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Width (Inches / ഇഞ്ച്)' : 'വീതി (ഇഞ്ച്)'}
              </label>
              <input
                type="number"
                value={widthIn || ''}
                onChange={(e) => setWidthIn(Number(e.target.value))}
                min={0.1}
                step={0.1}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Thickness (Inches / ഇഞ്ച്)' : 'കനം (ഇഞ്ച്)'}
              </label>
              <input
                type="number"
                value={thicknessIn || ''}
                onChange={(e) => setThicknessIn(Number(e.target.value))}
                min={0.1}
                step={0.1}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Number of Pieces' : 'കഷണങ്ങളുടെ എണ്ണം'}
              </label>
              <input
                type="number"
                value={pieces || ''}
                onChange={(e) => setPieces(Number(e.target.value))}
                min={1}
                step={1}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
              </label>
              <input
                type="number"
                value={ratePerCft || ''}
                onChange={(e) => setRatePerCft(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>
          </div>

          {rectResult && (
            <div className="pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-br from-forest-50 to-amber-50/40 p-6 rounded-2xl border border-forest-200 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase font-bold text-forest-800 tracking-wider">
                    {lang === 'en' ? 'Calculated Timber Volume' : 'കണക്കാക്കിയ വ്യാപ്തി'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-forest-900 mt-1">
                    {rectResult.total_cft} <span className="text-base font-semibold">CFT</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {rectResult.cft_per_piece} CFT / piece · {rectResult.total_cft_m3} m³ (ക്യുബിക് മീറ്റർ)
                  </div>
                </div>

                {rectResult.estimated_cost && (
                  <div className="sm:text-right">
                    <span className="text-xs uppercase font-bold text-forest-800 tracking-wider">
                      {lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില'}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-forest-900 mt-1">
                      {formatINR(rectResult.estimated_cost)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
            <div>
              <strong>{lang === 'en' ? 'Hoppus Volume Formula (Approximate): ' : 'ഹോപ്പസ് ലോഗ് ഫോർമുല (ഏകദേശം): '}</strong>
              <code>CFT ≈ (Diameter_in² × Length_ft) ÷ 183.35</code>
              <p className="mt-0.5 text-[11px] text-amber-800">
                {lang === 'en'
                  ? 'Note: Round log measurements are approximate estimates due to natural taper and bark thickness.'
                  : 'ശ്രദ്ധിക്കുക: ഉരുളൻ തടികളുടെ അളവ് തൊലിയുടെ കനവും സ്വാഭാവികമായ ചരിവും കാരണം ഏകദേശ അളവാണ്.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Mid Diameter (Inches / ശരാശരി വണ്ണം)' : 'ശരാശരി വണ്ണം (ഇഞ്ച്)'}
              </label>
              <input
                type="number"
                value={logDiameterIn || ''}
                onChange={(e) => setLogDiameterIn(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Length (Feet / നീളം)' : 'നീളം (അടി)'}
              </label>
              <input
                type="number"
                value={logLengthFt || ''}
                onChange={(e) => setLogLengthFt(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
              </label>
              <input
                type="number"
                value={logRatePerCft || ''}
                onChange={(e) => setLogRatePerCft(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-forest-600 focus:outline-none"
              />
            </div>
          </div>

          {roundResult && (
            <div className="pt-6 border-t border-slate-200">
              <div className="bg-gradient-to-br from-amber-50 to-forest-50/40 p-6 rounded-2xl border border-amber-200 flex flex-wrap items-center justify-between gap-6">
                <div>
                  <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                    {lang === 'en' ? 'Approximate Log Volume' : 'ഏകദേശ വ്യാപ്തി'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                    {roundResult.total_cft} <span className="text-base font-semibold">CFT</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    {roundResult.total_cft_m3} m³ (ക്യുബിക് മീറ്റർ)
                  </div>
                </div>

                {roundResult.estimated_cost && (
                  <div className="sm:text-right">
                    <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">
                      {lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില'}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1">
                      {formatINR(roundResult.estimated_cost)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
