import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TIMORA_T_LOGO } from './logoBase64';
export function BrandLogo({ className = '', size = 'md', showSubtitle = false, variant = 'light', }) {
    const iconSizes = {
        sm: 'w-7 h-7 sm:w-8 sm:h-8',
        md: 'w-9 h-9 sm:w-10 sm:h-10',
        lg: 'w-12 h-12 sm:w-14 sm:h-14',
    };
    const textSizes = {
        sm: 'text-base sm:text-lg',
        md: 'text-xl sm:text-2xl',
        lg: 'text-2xl sm:text-3xl',
    };
    const isDark = variant === 'dark';
    return (_jsxs("div", { className: `flex items-center gap-2 sm:gap-2.5 select-none ${className}`, children: [_jsx("div", { className: `${iconSizes[size]} relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`, children: _jsx("img", { src: TIMORA_T_LOGO, alt: "Timora Logo", className: "w-full h-full object-contain filter drop-shadow-xs" }) }), _jsxs("div", { className: "flex items-center leading-none", children: [_jsxs("span", { className: `${textSizes[size]} font-serif font-black tracking-wider ${isDark ? 'text-stone-100' : 'text-[#4A3626]'}`, style: { fontFamily: 'Georgia, serif' }, children: ["TIM", _jsx("span", { className: "text-[#5B6147]", children: "O" }), "RA"] }), _jsx("span", { className: "text-[10px] font-bold text-[#8A8F6E] ml-0.5", children: "\u2122" })] })] }));
}
