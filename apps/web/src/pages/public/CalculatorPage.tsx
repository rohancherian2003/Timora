import React, { useState } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';
import { BackButton } from '../../components/BackButton';
import {
  calcRectangularCFT,
  calcKeralaHoppusGirthCFT,
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

  // Round log inputs (Kerala Hoppus Standard Quarter-Girth)
  const [logGirthIn, setLogGirthIn] = useState<number>(48);
  const [logLengthFt, setLogLengthFt] = useState<number>(12);
  const [logPieces, setLogPieces] = useState<number>(1);
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

  // Round log calculation (Quarter-Girth Hoppus)
  const roundResult = (() => {
    try {
      if (logGirthIn <= 0 || logLengthFt <= 0 || logPieces <= 0) return null;
      return calcKeralaHoppusGirthCFT({
        girth_in: logGirthIn,
        length_ft: logLengthFt,
        pieces: logPieces,
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
    setLogGirthIn(48);
    setLogLengthFt(12);
    setLogPieces(1);
    setLogRatePerCft(1800);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 animate-fadeIn">
      <div className="flex items-center">
        <BackButton fallbackPath="/marketplace" lang={lang} />
      </div>

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30 mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Kerala Timber Standard' : 'കേരള തടി അളവ് മാനദണ്ഡം'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626] flex items-center gap-2.5">
            {lang === 'en' ? 'Timber Volume & Price Calculator' : 'തടി അളവ് & വില കാൽക്കുലേറ്റർ'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium">
            {lang === 'en'
              ? 'Kerala standard CFT measurements for sawn planks, beams, and round logs.'
              : 'കേരളത്തിലെ അംഗീകൃത രീതിയിലുള്ള തടി അളവുകളും CFT കണക്കുകൂട്ടലുകളും.'}
          </p>
        </div>
        <button
          onClick={resetValues}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-white/80 hover:bg-white text-[#4A3626] shadow-xs transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {lang === 'en' ? 'Reset' : 'റീസെറ്റ്'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-stone-200/70 p-1.5 max-w-md border border-stone-300/80">
        <button
          onClick={() => setActiveTab('rectangular')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
            activeTab === 'rectangular'
              ? 'bg-white text-[#4A3626] shadow-xs ring-1 ring-stone-300'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {lang === 'en' ? 'Planks & Beams (Sawn)' : 'അറുത്ത തടികൾ (പലക / തൂൺ)'}
        </button>
        <button
          onClick={() => setActiveTab('round')}
          className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${
            activeTab === 'round'
              ? 'bg-white text-[#4A3626] shadow-xs ring-1 ring-stone-300'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          {lang === 'en' ? 'Round Logs' : 'തടി ഉരുപ്പടികൾ (ലോഗ്സ്)'}
        </button>
      </div>

      {/* Calculator Body */}
      {activeTab === 'rectangular' ? (
        <div className="bg-white rounded-3xl border border-stone-300/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="p-3.5 bg-[#E7E1D6] border border-stone-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#4A3626]">
            <Info className="w-4 h-4 text-[#5B6147] mt-0.5 flex-shrink-0" />
            <div>
              <strong>{lang === 'en' ? 'Kerala CFT Formula: ' : 'കേരള CFT ഫോർമുല: '}</strong>
              <code>CFT = (Length in Feet × Width in Inches × Thickness in Inches ÷ 144) × Pieces</code>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Length (Feet / അടി)' : 'നീളം (അടി)'}
              </label>
              <input
                type="number"
                value={lengthFt || ''}
                onChange={(e) => setLengthFt(Number(e.target.value))}
                min={0.1}
                step={0.1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Width (Inches / ഇഞ്ച്)' : 'വീതി (ഇഞ്ച്)'}
              </label>
              <input
                type="number"
                value={widthIn || ''}
                onChange={(e) => setWidthIn(Number(e.target.value))}
                min={0.1}
                step={0.1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Thickness (Inches / ഇഞ്ച്)' : 'കനം (ഇഞ്ച്)'}
              </label>
              <input
                type="number"
                value={thicknessIn || ''}
                onChange={(e) => setThicknessIn(Number(e.target.value))}
                min={0.1}
                step={0.1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Number of Pieces' : 'കഷണങ്ങളുടെ എണ്ണം'}
              </label>
              <input
                type="number"
                value={pieces || ''}
                onChange={(e) => setPieces(Number(e.target.value))}
                min={1}
                step={1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
              </label>
              <input
                type="number"
                value={ratePerCft || ''}
                onChange={(e) => setRatePerCft(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>
          </div>

          {rectResult && (
            <div className="pt-6 border-t border-stone-200">
              <div className="bg-gradient-to-br from-[#E7E1D6] to-[#d5cfc4] p-6 rounded-3xl border border-stone-300/80 flex flex-wrap items-center justify-between gap-6 shadow-xs">
                <div>
                  <span className="text-xs uppercase font-bold text-[#5B6147] tracking-wider">
                    {lang === 'en' ? 'Calculated Timber Volume' : 'കണക്കാക്കിയ വ്യാപ്തി'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-serif text-[#4A3626] mt-1">
                    {rectResult.total_cft} <span className="text-base font-sans font-semibold">CFT</span>
                  </div>
                  <div className="text-xs text-[#7A5A3A] mt-1">
                    {rectResult.cft_per_piece} CFT / piece · {rectResult.total_cft_m3} m³ (ക്യുബിക് മീറ്റർ)
                  </div>
                </div>

                {rectResult.estimated_cost && (
                  <div className="sm:text-right">
                    <span className="text-xs uppercase font-bold text-[#5B6147] tracking-wider">
                      {lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില'}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-[#5B6147] mt-1">
                      {formatINR(rectResult.estimated_cost)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-stone-300/80 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="p-3.5 bg-[#E7E1D6] border border-stone-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#4A3626]">
            <Info className="w-4 h-4 text-[#5B6147] mt-0.5 flex-shrink-0" />
            <div>
              <strong>{lang === 'en' ? 'Kerala Hoppus Standard Quarter-Girth Formula: ' : 'കേരള ഹോപ്പസ് ക്വാർട്ടർ-ഗിർത്ത് ഫോർമുല: '}</strong>
              <code className="bg-white px-2 py-0.5 rounded-md font-mono text-emerald-800 font-bold ml-1">
                CFT = ((Girth / 4)²) × (Length / 144)
              </code>
              <p className="mt-1 text-[11px] text-[#5B6147]">
                {lang === 'en'
                  ? 'Official formula used in Kerala forest depots and raw timber markets. Girth is measured at midpoint in inches.'
                  : 'കേരളത്തിലെ ഫോറസ്റ്റ് ഡിപ്പോകളിലും തടി ചന്തകളിലും അംഗീകരിച്ച ഔദ്യോഗിക ഫോർമുല. മധ്യഭാഗത്തെ ചുറ്റളവാണ് (Girth) അളക്കുന്നത്.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Mid Girth (Inches / ചുറ്റളവ്)' : 'ചുറ്റളവ് / വണ്ണം (ഇഞ്ച്)'}
              </label>
              <input
                type="number"
                value={logGirthIn || ''}
                onChange={(e) => setLogGirthIn(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Length (Feet / നീളം)' : 'നീളം (അടി)'}
              </label>
              <input
                type="number"
                value={logLengthFt || ''}
                onChange={(e) => setLogLengthFt(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Logs Count (എണ്ണം)' : 'തടികളുടെ എണ്ണം'}
              </label>
              <input
                type="number"
                value={logPieces || ''}
                onChange={(e) => setLogPieces(Number(e.target.value))}
                min={1}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                {lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)'}
              </label>
              <input
                type="number"
                value={logRatePerCft || ''}
                onChange={(e) => setLogRatePerCft(Number(e.target.value))}
                min={0}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50"
              />
            </div>
          </div>

          {roundResult && (
            <div className="pt-6 border-t border-stone-200">
              <div className="bg-gradient-to-br from-[#E7E1D6] to-[#d5cfc4] p-6 rounded-3xl border border-stone-300/80 flex flex-wrap items-center justify-between gap-6 shadow-xs">
                <div>
                  <span className="text-xs uppercase font-bold text-[#5B6147] tracking-wider">
                    {lang === 'en' ? 'Calculated Round Log Volume' : 'കണക്കാക്കിയ തടി വ്യാപ്തി'}
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold font-serif text-[#4A3626] mt-1">
                    {roundResult.total_cft} <span className="text-base font-sans font-semibold">CFT</span>
                  </div>
                  <div className="text-xs text-[#7A5A3A] mt-1">
                    {roundResult.cft_per_piece} CFT / log · {roundResult.total_cft_m3} m³ (ക്യുബിക് മീറ്റർ)
                  </div>
                </div>

                {roundResult.estimated_cost && (
                  <div className="sm:text-right">
                    <span className="text-xs uppercase font-bold text-[#5B6147] tracking-wider">
                      {lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില'}
                    </span>
                    <div className="text-3xl sm:text-4xl font-black text-[#5B6147] mt-1">
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
