import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsxs("div", { className: `flex items-center gap-2.5 sm:gap-3 ${className}`, children: [_jsx("div", { className: `${iconSizes[size]} relative rounded-2xl bg-gradient-to-br from-amber-50 to-stone-100 p-1 flex items-center justify-center shadow-md shadow-stone-900/10 ring-1.5 ring-amber-700/30 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden`, children: _jsx("img", { src: "/images/brand/timora-t-emblem-transparent.png", alt: "Timora Carved 'T' Emblem", className: "w-full h-full object-contain filter drop-shadow-xs", onError: (e) => {
                        // Fallback to original image if needed
                        e.target.src = '/images/brand/timora-t-emblem.png';
                    } }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-baseline gap-1.5 leading-none", children: [_jsxs("span", { className: `${textSizes[size]} font-serif font-black tracking-wider ${isDark ? 'text-white' : 'text-[#2e170c]'}`, style: { fontFamily: 'Georgia, serif' }, children: ["TIM", _jsx("span", { className: "text-[#15803d]", children: "O" }), "RA"] }), _jsx("span", { className: "text-[10px] font-bold text-amber-700", children: "\u2122" })] }), showSubtitle && (_jsx("span", { className: `block text-[8px] sm:text-[9.5px] font-bold uppercase tracking-widest ${isDark ? 'text-amber-300' : 'text-[#166534]'} mt-0.5`, children: lang === 'en' ? 'Smart Timber Marketplace' : 'സ്മാർട്ട് തടി വിപണി' }))] })] }));
}
