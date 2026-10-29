import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
export function BackButton({ label, fallbackPath = '/marketplace', lang = 'en', className = '', }) {
    const navigate = useNavigate();
    const handleBack = () => {
        // If browser history has more than 1 entry and index > 0, navigate(-1)
        if (window.history.length > 1 && window.history.state?.idx > 0) {
            navigate(-1);
        }
        else {
            navigate(fallbackPath);
        }
    };
    const defaultLabel = lang === 'en' ? 'Back' : 'തിരികെ';
    return (_jsxs("button", { type: "button", onClick: handleBack, "aria-label": label || defaultLabel, className: `inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white border border-stone-200 text-[#4A3626] hover:bg-[#FAF8F5] hover:border-[#8E7F6B]/40 active:scale-95 transition shadow-2xs text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#5B6147] flex-shrink-0 ${className}`, children: [_jsx(ArrowLeft, { className: "w-3.5 h-3.5 text-[#5B6147] -translate-x-0.5" }), _jsx("span", { children: label || defaultLabel })] }));
}
