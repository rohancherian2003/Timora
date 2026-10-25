import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BrandLogo({ className = '', size = 'md', showSubtitle = true, lang = 'en', variant = 'light', }) {
    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-14 h-14',
    };
    const textSizes = {
        sm: 'text-lg',
        md: 'text-xl sm:text-2xl',
        lg: 'text-3xl sm:text-4xl',
    };
    const isDark = variant === 'dark';
    return (_jsxs("div", { className: `flex items-center gap-3 ${className}`, children: [_jsx("div", { className: `${iconSizes[size]} relative rounded-2xl bg-gradient-to-br from-emerald-800 via-forest-800 to-forest-950 p-2 flex items-center justify-center shadow-md shadow-forest-950/20 ring-1 ring-white/20 flex-shrink-0 group-hover:scale-105 transition-transform`, children: _jsxs("svg", { viewBox: "0 0 48 48", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "w-full h-full text-amber-400", children: [_jsx("circle", { cx: "24", cy: "24", r: "21", stroke: "currentColor", strokeWidth: "1.5", strokeOpacity: "0.35", strokeDasharray: "3 2" }), _jsx("circle", { cx: "24", cy: "24", r: "16", stroke: "currentColor", strokeWidth: "2", strokeOpacity: "0.6" }), _jsx("circle", { cx: "24", cy: "24", r: "11", stroke: "currentColor", strokeWidth: "2", strokeOpacity: "0.8" }), _jsx("circle", { cx: "24", cy: "24", r: "6", fill: "currentColor", fillOpacity: "0.9" }), _jsx("path", { d: "M24 6L29 15H26L31 24H27L32 32H16L21 24H17L22 15H19L24 6Z", fill: "#34d399", fillOpacity: "0.75" })] }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-baseline gap-1.5 leading-none", children: [_jsx("span", { className: `${textSizes[size]} font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`, style: { fontFamily: 'system-ui, -apple-system, sans-serif' }, children: "TIMORA" }), _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" })] }), showSubtitle && (_jsx("span", { className: `block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-amber-300' : 'text-forest-700'} mt-0.5`, children: lang === 'en' ? 'Kerala Timber Exchange' : 'കേരള തടി വ്യാപാര ശൃംഖല' }))] })] }));
}
