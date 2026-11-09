import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Loader2 } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang?: 'en' | 'ml';
}

export function SignOutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  lang = 'en',
}: SignOutConfirmModalProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setIsSigningOut(true);
    // 1.8-second loading state before terminating session
    setTimeout(() => {
      setIsSigningOut(false);
      onConfirm();
    }, 1800);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2C2218]/70 backdrop-blur-xs animate-fadeIn">
      {/* Modal Dialog Card - Beautiful Warm Kerala Timber Palette */}
      <div
        className="bg-[#FDFBF7] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border-2 border-[#8E7F6B]/30 text-center space-y-4 my-auto relative transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Brand Plate / Icon */}
        <div className="w-16 h-16 rounded-2xl bg-[#E7E1D6] border border-[#8E7F6B]/30 text-[#8B3A2B] flex items-center justify-center mx-auto shadow-inner">
          {isSigningOut ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#5B6147]" />
          ) : (
            <LogOut className="w-8 h-8 text-[#8B3A2B]" />
          )}
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h3 className="font-serif font-extrabold text-[#4A3626] text-lg sm:text-xl">
            {isSigningOut
              ? lang === 'en'
                ? 'Signing Out...'
                : 'ലോഗ് ഔട്ട് ചെയ്യുന്നു...'
              : lang === 'en'
              ? 'Sign Out of Timora?'
              : 'ലോഗ് ഔട്ട് ചെയ്യണമെന്ന് ഉറപ്പാണോ?'}
          </h3>
          <p className="text-xs text-[#6B5542] leading-relaxed">
            {isSigningOut
              ? lang === 'en'
                ? 'Clearing active session and securing your portal. Please wait...'
                : 'സെഷൻ അവസാനിപ്പിച്ച് ലോഗ് ഔട്ട് ചെയ്യുന്നു. ദയവായി കാത്തിരിക്കുക...'
              : lang === 'en'
              ? 'Are you sure you want to end your current session? You will need your mobile number and 6-digit PIN to sign back in.'
              : 'നിങ്ങളുടെ നിലവിലെ സെഷൻ അവസാനിപ്പിക്കാൻ ആഗ്രഹിക്കുന്നുണ്ടോ? തിരികെ പ്രവേശിക്കാൻ മൊബൈൽ നമ്പറും 6-അക്ക പിന്നും ആവശ്യമാണ്.'}
          </p>
        </div>

        {/* Buttons / Loading Indicator */}
        {isSigningOut ? (
          <div className="pt-2 flex flex-col items-center gap-2">
            <div className="w-full bg-[#E7E1D6] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#5B6147] h-full rounded-full animate-pulse w-3/4"></div>
            </div>
            <span className="text-[11px] font-bold text-[#5B6147]">
              {lang === 'en' ? 'Securing session...' : 'സുരക്ഷിതമായി ലോഗ് ഔട്ട് ചെയ്യുന്നു...'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/60 text-[#4A3626] font-bold text-xs transition"
            >
              {lang === 'en' ? 'Cancel' : 'വേണ്ട'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="py-2.5 px-4 rounded-xl bg-[#8B3A2B] hover:bg-[#722F22] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Yes, Sign Out' : 'ലോഗ് ഔട്ട്'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
