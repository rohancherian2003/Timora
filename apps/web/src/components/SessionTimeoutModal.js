import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { Clock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export function SessionTimeoutModal({ lang = 'en' }) {
    const { isSessionTimedOut, dismissTimeoutModal } = useAuth();
    const navigate = useNavigate();
    if (!isSessionTimedOut)
        return null;
    const handleGoToLogin = () => {
        dismissTimeoutModal();
        navigate('/login', { replace: true });
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn", children: _jsxs("div", { className: "bg-[#E7E1D6] rounded-3xl border border-[#8E7F6B]/40 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 text-center", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-[#d5cfc4] text-[#3F452F] flex items-center justify-center mx-auto shadow-inner", children: _jsx(Clock, { className: "w-9 h-9 text-[#7A5A3A]" }) }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("span", { className: "px-3 py-1 rounded-full bg-white/70 text-[#4A3626] font-bold text-[11px] uppercase tracking-wider inline-block", children: lang === 'en' ? 'Session Timeout' : 'സെഷൻ കാലാവധി കഴിഞ്ഞു' }), _jsx("h3", { className: "font-serif font-extrabold text-[#4A3626] text-xl", children: lang === 'en' ? 'Inactivity Timeout' : 'സുരക്ഷാ മുൻകരുതൽ' })] }), _jsx("p", { className: "text-xs sm:text-sm text-[#7A5A3A] leading-relaxed", children: lang === 'en'
                        ? 'Your session was automatically closed after 25 minutes of inactivity to protect your account. Please sign in again to continue.'
                        : 'നിങ്ങളുടെ അക്കൗണ്ടിന്റെ സുരക്ഷ മുൻനിർത്തി 25 മിനിറ്റ് നിഷ്ക്രിയമായിരുന്നതിനാൽ സെഷൻ അവസാനിച്ചു. തുടരാൻ ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.' }), _jsx("div", { className: "pt-2", children: _jsxs("button", { onClick: handleGoToLogin, className: "w-full py-3 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition", children: [_jsx(LogIn, { className: "w-4 h-4" }), _jsx("span", { children: lang === 'en' ? 'Sign In Again' : 'വീണ്ടും ലോഗിൻ ചെയ്യുക' }), _jsx(ArrowRight, { className: "w-4 h-4" })] }) })] }) }));
}
