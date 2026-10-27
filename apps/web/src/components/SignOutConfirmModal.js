import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { LogOut, Loader2 } from 'lucide-react';
export function SignOutConfirmModal({ isOpen, onClose, onConfirm, lang = 'en', }) {
    const [isSigningOut, setIsSigningOut] = useState(false);
    if (!isOpen)
        return null;
    const handleConfirm = () => {
        setIsSigningOut(true);
        // 1.8-second loading state before terminating session
        setTimeout(() => {
            setIsSigningOut(false);
            onConfirm();
        }, 1800);
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn", children: _jsxs("div", { className: "bg-white dark:bg-[#1f1b18] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-[#8E7F6B]/40 text-center space-y-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center mx-auto shadow-inner", children: isSigningOut ? (_jsx(Loader2, { className: "w-8 h-8 animate-spin text-[#5B6147]" })) : (_jsx(LogOut, { className: "w-8 h-8 text-red-600" })) }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("h3", { className: "font-serif font-extrabold text-[#4A3626] dark:text-stone-100 text-lg sm:text-xl", children: isSigningOut
                                ? lang === 'en'
                                    ? 'Signing Out...'
                                    : 'ലോഗ് ഔട്ട് ചെയ്യുന്നു...'
                                : lang === 'en'
                                    ? 'Sign Out of Timora?'
                                    : 'ലോഗ് ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?' }), _jsx("p", { className: "text-xs text-[#7A5A3A] dark:text-stone-400 leading-relaxed", children: isSigningOut
                                ? lang === 'en'
                                    ? 'Clearing active session and securing your portal. Please wait...'
                                    : 'സെഷൻ അവസാനിപ്പിച്ച് ലോഗ് ഔട്ട് ചെയ്യുന്നു. ദയവായി കാത്തിരിക്കുക...'
                                : lang === 'en'
                                    ? 'Are you sure you want to end your current session? You will need your mobile number and 6-digit PIN to sign back in.'
                                    : 'നിങ്ങളുടെ നിലവിലെ സെഷൻ അവസാനിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ? തിരികെ പ്രവേശിക്കാൻ 6-അക്ക പിൻ ആവശ്യമാണ്.' })] }), !isSigningOut && (_jsxs("div", { className: "grid grid-cols-2 gap-2.5 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "py-2.5 px-4 rounded-xl border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs transition", children: lang === 'en' ? 'Cancel' : 'വേണ്ട' }), _jsxs("button", { type: "button", onClick: handleConfirm, className: "py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-900/10 transition flex items-center justify-center gap-1.5", children: [_jsx(LogOut, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Yes, Sign Out' : 'ലോഗ് ഔട്ട് ചെയ്യുക' })] })] }))] }) }));
}
