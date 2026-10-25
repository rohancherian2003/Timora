import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TIMORA_T_LOGO } from './logoBase64';
export function BrandLogo({ className = '', size = 'md', showSubtitle = true, lang = 'en', variant = 'light', }) {
    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };
    const textSizes = {
        sm: 'text-base',
        md: 'text-xl sm:text-2xl',
        lg: 'text-2xl sm:text-3xl',
    };
    const isDark = variant === 'dark';
    return (_jsxs("div", { className: `flex items-center gap-2.5 sm:gap-3 ${className}`, children: [_jsx("div", { className: `${iconSizes[size]} relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`, children: _jsx("img", { src: TIMORA_T_LOGO, alt: "Timora Logo", className: "w-full h-full object-contain filter drop-shadow-sm" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-baseline gap-1 leading-none", children: [_jsxs("span", { className: `${textSizes[size]} font-serif font-black tracking-wide ${isDark ? 'text-white' : 'text-[#2e170c]'}`, style: { fontFamily: 'Georgia, serif' }, children: ["TIM", _jsx("span", { className: "text-[#16a34a]", children: "O" }), "RA"] }), _jsx("span", { className: "text-[10px] font-bold text-amber-700", children: "\u2122" })] }), showSubtitle && (_jsx("span", { className: `block text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-amber-300' : 'text-[#166534]'} mt-0.5`, children: lang === 'en' ? 'Smart Timber Marketplace' : 'സ്മാർട്ട് ടിംബർ മാർക്കറ്റ് പ്ലേസ്' }))] })] }));
}
