import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { createPortal } from 'react-dom';
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
    const modalContent = (_jsx("div", { className: "fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2C2218]/70 backdrop-blur-xs animate-fadeIn", children: _jsxs("div", { className: "bg-[#FDFBF7] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border-2 border-[#8E7F6B]/30 text-center space-y-4 my-auto relative transform transition-all", onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "w-16 h-16 rounded-2xl bg-[#E7E1D6] border border-[#8E7F6B]/30 text-[#8B3A2B] flex items-center justify-center mx-auto shadow-inner", children: isSigningOut ? (_jsx(Loader2, { className: "w-8 h-8 animate-spin text-[#5B6147]" })) : (_jsx(LogOut, { className: "w-8 h-8 text-[#8B3A2B]" })) }), _jsxs("div", { className: "space-y-1.5", children: [_jsx("h3", { className: "font-serif font-extrabold text-[#4A3626] text-lg sm:text-xl", children: isSigningOut
                                ? lang === 'en'
                                    ? 'Signing Out...'
                                    : 'ലോഗ് ഔട്ട് ചെയ്യുന്നു...'
                                : lang === 'en'
                                    ? 'Sign Out of Timora?'
                                    : 'ലോഗ് ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?' }), _jsx("p", { className: "text-xs text-[#6B5542] leading-relaxed", children: isSigningOut
                                ? lang === 'en'
                                    ? 'Clearing active session and securing your portal. Please wait...'
                                    : 'സെഷൻ അവസാനിപ്പിച്ച് ലോഗ് ഔട്ട് ചെയ്യുന്നു. ദയവായി കാത്തിരിക്കുക...'
                                : lang === 'en'
                                    ? 'Are you sure you want to end your current session? You will need your mobile number and 6-digit PIN to sign back in.'
                                    : 'നിങ്ങളുടെ നിലവിലെ സെഷൻ അവസാനിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ? തിരികെ പ്രവേശിക്കാൻ മൊബൈൽ നമ്പറും 6-അക്ക പിന്നും ആവശ്യമാണ്.' })] }), isSigningOut ? (_jsxs("div", { className: "pt-2 flex flex-col items-center gap-2", children: [_jsx("div", { className: "w-full bg-[#E7E1D6] rounded-full h-1.5 overflow-hidden", children: _jsx("div", { className: "bg-[#5B6147] h-full rounded-full animate-pulse w-3/4" }) }), _jsx("span", { className: "text-[11px] font-bold text-[#5B6147]", children: lang === 'en' ? 'Securing session...' : 'സുരക്ഷിതമായി ലോഗ് ഔട്ട് ചെയ്യുന്നു...' })] })) : (_jsxs("div", { className: "grid grid-cols-2 gap-2.5 pt-2", children: [_jsx("button", { type: "button", onClick: onClose, className: "py-2.5 px-4 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/60 text-[#4A3626] font-bold text-xs transition", children: lang === 'en' ? 'Cancel' : 'വേണ്ട' }), _jsxs("button", { type: "button", onClick: handleConfirm, className: "py-2.5 px-4 rounded-xl bg-[#8B3A2B] hover:bg-[#722F22] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5", children: [_jsx(LogOut, { className: "w-3.5 h-3.5" }), _jsx("span", { children: lang === 'en' ? 'Yes, Sign Out' : 'ലോഗ് ഔട്ട്' })] })] }))] }) }));
    return typeof document !== 'undefined'
        ? createPortal(modalContent, document.body)
        : modalContent;
}
