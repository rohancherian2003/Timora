import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calculator, Info, RotateCcw } from 'lucide-react';
import { calcRectangularCFT, calcRoundLogCFT, formatINR, } from '@timora/shared';
export function CalculatorPage({ lang = 'en' }) {
    const [activeTab, setActiveTab] = useState('rectangular');
    // Rectangular inputs
    const [lengthFt, setLengthFt] = useState(10);
    const [widthIn, setWidthIn] = useState(6);
    const [thicknessIn, setThicknessIn] = useState(2);
    const [pieces, setPieces] = useState(1);
    const [ratePerCft, setRatePerCft] = useState(2200);
    // Round log inputs
    const [logDiameterIn, setLogDiameterIn] = useState(14);
    const [logLengthFt, setLogLengthFt] = useState(12);
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
    // Round log calculation
    const roundResult = (() => {
        try {
            if (logDiameterIn <= 0 || logLengthFt <= 0)
                return null;
            return calcRoundLogCFT({
                diameter_in: logDiameterIn,
                length_ft: logLengthFt,
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
        setLogDiameterIn(14);
        setLogLengthFt(12);
        setLogRatePerCft(1800);
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto px-4 py-8 space-y-8", children: [_jsxs("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-8 bg-gradient-to-br from-[#faf6ee] via-[#f4ebe0] to-[#ecdcc8] rounded-3xl border border-[#ebd5bc] shadow-sm", children: [_jsxs("div", { children: [_jsxs("div", { className: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 text-[#854d0e] text-xs font-semibold backdrop-blur-sm border border-amber-600/30 mb-2", children: [_jsx(Calculator, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Kerala Timber Standard' : 'കേരള തടി അളവ് മാനദണ്ഡം' })] }), _jsx("h1", { className: "text-2xl sm:text-3xl font-extrabold font-serif text-[#2c160b] flex items-center gap-2.5", children: lang === 'en' ? 'Timber Volume & Price Calculator' : 'തടി അളവ് & വില കാൽക്കുലേറ്റർ' }), _jsx("p", { className: "text-xs sm:text-sm text-[#6b472e] mt-1 font-medium", children: lang === 'en'
                                    ? 'Kerala standard CFT measurements for sawn planks, beams, and round logs.'
                                    : 'കേരളത്തിലെ അംഗീകൃത രീതിയിലുള്ള തടി അളവുകളും CFT കണക്കുകൂട്ടലുകളും.' })] }), _jsxs("button", { onClick: resetValues, className: "flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-amber-300 bg-white/80 hover:bg-white text-[#78350f] shadow-xs transition", children: [_jsx(RotateCcw, { className: "w-3.5 h-3.5" }), lang === 'en' ? 'Reset' : 'റീസെറ്റ്'] })] }), _jsxs("div", { className: "flex rounded-2xl bg-amber-100/70 p-1.5 max-w-md border border-amber-200/80", children: [_jsx("button", { onClick: () => setActiveTab('rectangular'), className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${activeTab === 'rectangular'
                            ? 'bg-white text-[#78350f] shadow-xs ring-1 ring-amber-300'
                            : 'text-stone-600 hover:text-stone-900'}`, children: lang === 'en' ? 'Planks & Beams (Sawn)' : 'അറുത്ത തടികൾ (പലക / തൂൺ)' }), _jsx("button", { onClick: () => setActiveTab('round'), className: `flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition ${activeTab === 'round'
                            ? 'bg-white text-[#78350f] shadow-xs ring-1 ring-amber-300'
                            : 'text-stone-600 hover:text-stone-900'}`, children: lang === 'en' ? 'Round Logs' : 'തടി ഉരുപ്പടികൾ (ലോഗ്സ്)' })] }), activeTab === 'rectangular' ? (_jsxs("div", { className: "bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-8 space-y-6 shadow-xs", children: [_jsxs("div", { className: "p-3.5 bg-[#faf6ee] border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#78350f]", children: [_jsx(Info, { className: "w-4 h-4 text-[#b45309] mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("strong", { children: lang === 'en' ? 'Kerala CFT Formula: ' : 'കേരള CFT ഫോർമുല: ' }), _jsx("code", { children: "CFT = (Length in Feet \u00D7 Width in Inches \u00D7 Thickness in Inches \u00F7 144) \u00D7 Pieces" })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Length (Feet / അടി)' : 'നീളം (അടി)' }), _jsx("input", { type: "number", value: lengthFt || '', onChange: (e) => setLengthFt(Number(e.target.value)), min: 0.1, step: 0.1, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Width (Inches / ഇഞ്ച്)' : 'വീതി (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: widthIn || '', onChange: (e) => setWidthIn(Number(e.target.value)), min: 0.1, step: 0.1, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Thickness (Inches / ഇഞ്ച്)' : 'കനം (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: thicknessIn || '', onChange: (e) => setThicknessIn(Number(e.target.value)), min: 0.1, step: 0.1, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Number of Pieces' : 'കഷണങ്ങളുടെ എണ്ണം' }), _jsx("input", { type: "number", value: pieces || '', onChange: (e) => setPieces(Number(e.target.value)), min: 1, step: 1, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)' }), _jsx("input", { type: "number", value: ratePerCft || '', onChange: (e) => setRatePerCft(Number(e.target.value)), min: 0, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] })] }), rectResult && (_jsx("div", { className: "pt-6 border-t border-amber-100", children: _jsxs("div", { className: "bg-gradient-to-br from-[#faf6ee] to-[#f4ebe0] p-6 rounded-3xl border border-amber-300/80 flex flex-wrap items-center justify-between gap-6 shadow-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#854d0e] tracking-wider", children: lang === 'en' ? 'Calculated Timber Volume' : 'കണക്കാക്കിയ വ്യാപ്തി' }), _jsxs("div", { className: "text-3xl sm:text-4xl font-extrabold font-serif text-[#2c160b] mt-1", children: [rectResult.total_cft, " ", _jsx("span", { className: "text-base font-sans font-semibold", children: "CFT" })] }), _jsxs("div", { className: "text-xs text-[#6b472e] mt-1", children: [rectResult.cft_per_piece, " CFT / piece \u00B7 ", rectResult.total_cft_m3, " m\u00B3 (\u0D15\u0D4D\u0D2F\u0D41\u0D2C\u0D3F\u0D15\u0D4D \u0D2E\u0D40\u0D31\u0D4D\u0D31\u0D7C)"] })] }), rectResult.estimated_cost && (_jsxs("div", { className: "sm:text-right", children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#854d0e] tracking-wider", children: lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില' }), _jsx("div", { className: "text-3xl sm:text-4xl font-black text-[#b45309] mt-1", children: formatINR(rectResult.estimated_cost) })] }))] }) }))] })) : (_jsxs("div", { className: "bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-8 space-y-6 shadow-xs", children: [_jsxs("div", { className: "p-3.5 bg-[#faf6ee] border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-[#78350f]", children: [_jsx(Info, { className: "w-4 h-4 text-[#b45309] mt-0.5 flex-shrink-0" }), _jsxs("div", { children: [_jsx("strong", { children: lang === 'en' ? 'Hoppus Volume Formula (Approximate): ' : 'ഹോപ്പസ് ലോഗ് ഫോർമുല (ഏകദേശം): ' }), _jsx("code", { children: "CFT \u2248 (Diameter_in\u00B2 \u00D7 Length_ft) \u00F7 183.35" }), _jsx("p", { className: "mt-0.5 text-[11px] text-[#854d0e]", children: lang === 'en'
                                            ? 'Note: Round log measurements are approximate estimates due to natural taper and bark thickness.'
                                            : 'ശ്രദ്ധിക്കുക: ഉരുളൻ തടികളുടെ അളവ് തൊലിയുടെ കനവും സ്വാഭാവികമായ ചരിവും കാരണം ഏകദേശ അളവാണ്.' })] })] }), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-5", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Mid Diameter (Inches / ശരാശരി വണ്ണം)' : 'ശരാശരി വണ്ണം (ഇഞ്ച്)' }), _jsx("input", { type: "number", value: logDiameterIn || '', onChange: (e) => setLogDiameterIn(Number(e.target.value)), min: 1, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Length (Feet / നീളം)' : 'നീളം (അടി)' }), _jsx("input", { type: "number", value: logLengthFt || '', onChange: (e) => setLogLengthFt(Number(e.target.value)), min: 1, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs font-bold text-stone-700 mb-1.5", children: lang === 'en' ? 'Price per CFT (₹)' : 'ഒരു CFT യുടെ വില (₹)' }), _jsx("input", { type: "number", value: logRatePerCft || '', onChange: (e) => setLogRatePerCft(Number(e.target.value)), min: 0, className: "w-full px-3.5 py-2.5 border border-amber-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#b45309] focus:outline-none bg-stone-50/50" })] })] }), roundResult && (_jsx("div", { className: "pt-6 border-t border-amber-100", children: _jsxs("div", { className: "bg-gradient-to-br from-[#faf6ee] to-[#f4ebe0] p-6 rounded-3xl border border-amber-300/80 flex flex-wrap items-center justify-between gap-6 shadow-xs", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#854d0e] tracking-wider", children: lang === 'en' ? 'Approximate Log Volume' : 'ഏകദേശ വ്യാപ്തി' }), _jsxs("div", { className: "text-3xl sm:text-4xl font-extrabold font-serif text-[#2c160b] mt-1", children: [roundResult.total_cft, " ", _jsx("span", { className: "text-base font-sans font-semibold", children: "CFT" })] }), _jsxs("div", { className: "text-xs text-[#6b472e] mt-1", children: [roundResult.total_cft_m3, " m\u00B3 (\u0D15\u0D4D\u0D2F\u0D41\u0D2C\u0D3F\u0D15\u0D4D \u0D2E\u0D40\u0D31\u0D4D\u0D31\u0D7C)"] })] }), roundResult.estimated_cost && (_jsxs("div", { className: "sm:text-right", children: [_jsx("span", { className: "text-xs uppercase font-bold text-[#854d0e] tracking-wider", children: lang === 'en' ? 'Estimated Total Price' : 'ആകെ കണക്കാക്കിയ വില' }), _jsx("div", { className: "text-3xl sm:text-4xl font-black text-[#b45309] mt-1", children: formatINR(roundResult.estimated_cost) })] }))] }) }))] }))] }));
}
