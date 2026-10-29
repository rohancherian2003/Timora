import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';
import { BackButton } from '../../components/BackButton';
import { calcRectangularCFT, calcKeralaHoppusGirthCFT, formatINR, } from '@timora/shared';
export function CalculatorPage({ lang = 'en' }) {
    const [activeTab, setActiveTab] = useState('rectangular');
    // Rectangular inputs
    const [lengthFt, setLengthFt] = useState(10);
    const [widthIn, setWidthIn] = useState(6);
    const [thicknessIn, setThicknessIn] = useState(2);
    const [pieces, setPieces] = useState(1);
    const [ratePerCft, setRatePerCft] = useState(2200);
    // Round log inputs (Kerala Hoppus Standard Quarter-Girth)
    const [logGirthIn, setLogGirthIn] = useState(48);
    const [logLengthFt, setLogLengthFt] = useState(12);
    const [logPieces, setLogPieces] = useState(1);
    const [logRatePerCft, setLogRatePerCft] = useState(1800);
    // Rectangular calculation
    const rectResult = (() => {
        try {
            if (lengthFt <= 0 || widthIn <= 0 || thicknessIn <= 0 || pieces <= 0)
                return null;
            return calcRectangularCFT({
                length_ft: lengthFt,
                width_in: widthIn,
                thickness_in: thicknessIn,
                pieces,
                price_per_cft: ratePerCft > 0 ? ratePerCft : undefined,
            });
        }
        catch {
            return null;
        }
    })();
    // Round log calculation (Quarter-Girth Hoppus)
    const roundResult = (() => {
        try {
            if (logGirthIn <= 0 || logLengthFt <= 0 || logPieces <= 0)
                return null;
            return calcKeralaHoppusGirthCFT({
                girth_in: logGirthIn,
                length_ft: logLengthFt,
                pieces: logPieces,
                price_per_cft: logRatePerCft > 0 ? logRatePerCft : undefined,
            });
        }
        catch {
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
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8 space-y-6", children: [_jsx("div", { className: "flex items-center", children: _jsx(BackButton, { fallbackPath: "/marketplace", lang: lang }) }), _jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#E7E1D6] via-[#d5cfc4] to-[#c4bdb0] rounded-3xl border border-[#c4bdb0] shadow-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#5B6147] text-xs font-semibold backdrop-blur-sm border border-[#5B6147]/30 mb-2", children: [_jsx(Calculator, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Kerala Timber Standard' : 'കേരള തടി അളവ് മാനദണ്ഡം' })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold font-serif text-[#4A3626] flex items-center gap-2.5", children: lang === 'en' ? 'Timber Volume & Price Calculator' : 'തടി അളവ് & വില കാൽക്കുലേറ്റർ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] mt-1 font-medium", children: lang === 'en'
                                    ? 'Kerala standard CFT measurements for sawn planks, beams, and round logs.'
                                    : 'കേരളത്തിലെ അംഗീകൃത രീതിയിലുള്ള തടി അളവുകളും CFT കണക്കുകൂട്ടലുകളും.' })] }), _jsxs("button", { onClick: resetValues, className: "flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-stone-300 bg-white/80 hover:bg-white text-[#4A3626] shadow-xs transition", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Reset' : 'റീസെറ്റ്'] })] }), _jsxs("div", { className: "flex rounded-2xl bg-stone-200/70 p-1.5 max-w-md border border-stone-300/80", children: [_jsx("button", { onClick: () => setActiveTab('rectangular'), className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${activeTab === 'rectangular'
                            ? 'bg-white text-[#4A3626] shadow-xs ring-1 ring-stone-300'
                            : 'text-stone-600 hover:text-stone-900'}`, children: lang === 'en' ? 'Planks & Beams (Sawn)' : 'അറുത്ത തടികൾ (പലക / തൂൺ)' }), _jsx("button", { onClick: () => setActiveTab('round'), className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${activeTab === 'round'
                            ? 'bg-white text-[#4A3626] shadow-xs ring-1 ring-stone-300'
                            : 'text-stone-600 hover:text-stone-900'}`, children: lang === 'en' ? 'Round Logs' : 'തടി ഉരുപ്പടികൾ (ലോഗ്സ്)' })] }), activeTab === 'rectangular' ? (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 sm:p-8 space-y-6 shadow-xs", children: [_jsxs("div", { className: "p-3.5 bg-[#E7E1D6] border border-stone-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#4A3626]", children: [_jsx(Info, { className: "w-4 h-4 text-[#5B6147] mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("strong", { children: lang === 'en' ? 'Kerala CFT Formula: ' : 'കേരള CFT ഫോർമുല: ' }), _jsx("code", { children: "CFT = (Length in Feet \u00D7 Width in Inches \u00D7 Thickness in Inches \u00F7 144) \u00D7 Pieces" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Length (Feet / അടി)' : 'നീളം (അടി)' }), _jsx("input", { type: "number", value: lengthFt || '', onChange: (e) => setLengthFt(Number(e.target.value)), min: 0.1, step: 0.1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Width (Inches / ഇഞ്ച്)' : 'വീതി (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: widthIn || '', onChange: (e) => setWidthIn(Number(e.target.value)), min: 0.1, step: 0.1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Thickness (Inches / ഇഞ്ച്)' : 'കനം (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: thicknessIn || '', onChange: (e) => setThicknessIn(Number(e.target.value)), min: 0.1, step: 0.1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Number of Pieces' : 'കഷണങ്ങളുടെ എണ്ണം' }), _jsx("input", { type: "number", value: pieces || '', onChange: (e) => setPieces(Number(e.target.value)), min: 1, step: 1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)' }), _jsx("input", { type: "number", value: ratePerCft || '', onChange: (e) => setRatePerCft(Number(e.target.value)), min: 0, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] })] }), rectResult && (_jsx("div", { className: "pt-6 border-t border-stone-200", children: _jsxs("div", { className: "bg-gradient-to-br from-[#E7E1D6] to-[#d5cfc4] p-6 rounded-3xl border border-stone-300/80 flex flex-wrap items-center justify-between gap-6 shadow-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#5B6147] tracking-wider", children: lang === 'en' ? 'Calculated Timber Volume' : 'കണക്കാക്കിയ വ്യാപ്തി' }), _jsxs("div", { className: "text-3xl sm:text-4xl font-extrabold font-serif text-[#4A3626] mt-1", children: [rectResult.total_cft, " ", _jsx("span", { className: "text-base font-sans font-semibold", children: "CFT" })] }), _jsxs("div", { className: "text-xs text-[#7A5A3A] mt-1", children: [rectResult.cft_per_piece, " CFT / piece \u00B7 ", rectResult.total_cft_m3, " m\u00B3 (\u0D15\u0D4D\u0D2F\u0D41\u0D2C\u0D3F\u0D15\u0D4D \u0D2E\u0D40\u0D31\u0D4D\u0D31\u0D7C)"] })] }), rectResult.estimated_cost && (_jsxs("div", { className: "sm:text-right", children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#5B6147] tracking-wider", children: lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില' }), _jsx("div", { className: "text-3xl sm:text-4xl font-black text-[#5B6147] mt-1", children: formatINR(rectResult.estimated_cost) })] }))] }) }))] })) : (_jsxs("div", { className: "bg-white rounded-3xl border border-stone-300/80 p-6 sm:p-8 space-y-6 shadow-xs", children: [_jsxs("div", { className: "p-3.5 bg-[#E7E1D6] border border-stone-300/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#4A3626]", children: [_jsx(Info, { className: "w-4 h-4 text-[#5B6147] mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("strong", { children: lang === 'en' ? 'Kerala Hoppus Standard Quarter-Girth Formula: ' : 'കേരള ഹോപ്പസ് ക്വാർട്ടർ-ഗിർത്ത് ഫോർമുല: ' }), _jsx("code", { className: "bg-white px-2 py-0.5 rounded-md font-mono text-emerald-800 font-bold ml-1", children: "CFT = ((Girth / 4)\u00B2) \u00D7 (Length / 144)" }), _jsx("p", { className: "mt-1 text-[11px] text-[#5B6147]", children: lang === 'en'
                                            ? 'Official formula used in Kerala forest depots and raw timber markets. Girth is measured at midpoint in inches.'
                                            : 'കേരളത്തിലെ ഫോറസ്റ്റ് ഡിപ്പോകളിലും തടി ചന്തകളിലും അംഗീകരിച്ച ഔദ്യോഗിക ഫോർമുല. മധ്യഭാഗത്തെ ചുറ്റളവാണ് (Girth) അളക്കുന്നത്.' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Mid Girth (Inches / ചുറ്റളവ്)' : 'ചുറ്റളവ് / വണ്ണം (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: logGirthIn || '', onChange: (e) => setLogGirthIn(Number(e.target.value)), min: 1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Length (Feet / നീളം)' : 'നീളം (അടി)' }), _jsx("input", { type: "number", value: logLengthFt || '', onChange: (e) => setLogLengthFt(Number(e.target.value)), min: 1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Logs Count (എണ്ണം)' : 'തടികളുടെ എണ്ണം' }), _jsx("input", { type: "number", value: logPieces || '', onChange: (e) => setLogPieces(Number(e.target.value)), min: 1, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)' }), _jsx("input", { type: "number", value: logRatePerCft || '', onChange: (e) => setLogRatePerCft(Number(e.target.value)), min: 0, className: "w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#5B6147] focus:outline-none bg-stone-50/50" })] })] }), roundResult && (_jsx("div", { className: "pt-6 border-t border-stone-200", children: _jsxs("div", { className: "bg-gradient-to-br from-[#E7E1D6] to-[#d5cfc4] p-6 rounded-3xl border border-stone-300/80 flex flex-wrap items-center justify-between gap-6 shadow-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#5B6147] tracking-wider", children: lang === 'en' ? 'Calculated Round Log Volume' : 'കണക്കാക്കിയ തടി വ്യാപ്തി' }), _jsxs("div", { className: "text-3xl sm:text-4xl font-extrabold font-serif text-[#4A3626] mt-1", children: [roundResult.total_cft, " ", _jsx("span", { className: "text-base font-sans font-semibold", children: "CFT" })] }), _jsxs("div", { className: "text-xs text-[#7A5A3A] mt-1", children: [roundResult.cft_per_piece, " CFT / log \u00B7 ", roundResult.total_cft_m3, " m\u00B3 (\u0D15\u0D4D\u0D2F\u0D41\u0D2C\u0D3F\u0D15\u0D4D \u0D2E\u0D40\u0D31\u0D4D\u0D31\u0D7C)"] })] }), roundResult.estimated_cost && (_jsxs("div", { className: "sm:text-right", children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#5B6147] tracking-wider", children: lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില' }), _jsx("div", { className: "text-3xl sm:text-4xl font-black text-[#5B6147] mt-1", children: formatINR(roundResult.estimated_cost) })] }))] }) }))] }))] }));
}
