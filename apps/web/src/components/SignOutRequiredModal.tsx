import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Loader2, AlertTriangle } from 'lucide-react';

interface SignOutRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  lang?: 'en' | 'ml';
}

export function SignOutRequiredModal({
  isOpen,
  onClose,
  onConfirm,
  lang = 'en',
}: SignOutRequiredModalProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsSigningOut(true);
      setError(null);
      await onConfirm();
    } catch (err: any) {
      setError(err?.message || (lang === 'en' ? 'Failed to sign out. Please try again.' : 'ലോഗ് ഔട്ട് പരാജയപ്പെട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക.'));
      setIsSigningOut(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="signout-required-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#2C2218]/70 backdrop-blur-xs animate-fadeIn"
      onClick={isSigningOut ? undefined : onClose}
    >
      <div
        className="bg-[#FDFBF7] rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-[#8E7F6B]/30 text-center space-y-4 my-auto relative transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Warning / Sign Out Icon Plate */}
        <div className="w-16 h-16 rounded-2xl bg-[#E7E1D6] border border-[#8E7F6B]/30 text-[#8B3A2B] flex items-center justify-center mx-auto shadow-inner">
          {isSigningOut ? (
            <Loader2 className="w-8 h-8 animate-spin text-[#5B6147]" />
          ) : (
            <LogOut className="w-8 h-8 text-[#8B3A2B]" />
          )}
        </div>

        {/* Text Header & Message */}
        <div className="space-y-2">
          <h3
            id="signout-required-title"
            className="font-serif font-extrabold text-[#4A3626] text-lg sm:text-xl"
          >
            {lang === 'en' ? 'Sign Out Required' : 'ലോഗ് ഔട്ട് ചെയ്യേണ്ടതുണ്ട്'}
          </h3>
          <p className="text-xs sm:text-sm text-[#6B5542] leading-relaxed">
            {lang === 'en'
              ? 'Please sign out before leaving your dashboard. Would you like to sign out now?'
              : 'ഡാഷ്‌ബോർഡിൽ നിന്ന് പുറത്തുകടക്കുന്നതിന് മുൻപ് ദയവായി ലോഗ് ഔട്ട് ചെയ്യുക. ഇപ്പോൾ ലോഗ് ഔട്ട് ചെയ്യണമോ?'}
          </p>
        </div>

        {/* Error message if logout fails */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Buttons / Progress */}
        {isSigningOut ? (
          <div className="pt-2 flex flex-col items-center gap-2">
            <div className="w-full bg-[#E7E1D6] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#5B6147] h-full rounded-full animate-pulse w-3/4" />
            </div>
            <span className="text-[11px] font-bold text-[#5B6147]">
              {lang === 'en' ? 'Signing out...' : 'ലോഗ് ഔട്ട് ചെയ്യുന്നു...'}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-[#8E7F6B]/40 hover:bg-[#E7E1D6]/60 text-[#4A3626] font-bold text-xs transition active:scale-95"
            >
              {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="py-2.5 px-4 rounded-xl bg-[#8B3A2B] hover:bg-[#722F22] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Sign Out' : 'ലോഗ് ഔട്ട്'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
