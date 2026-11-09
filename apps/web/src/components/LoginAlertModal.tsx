import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, X, ArrowRight, UserPlus } from 'lucide-react';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

export type AlertEntityType = 'seller' | 'mill' | 'carpenter' | 'transport' | 'enquiry';

interface LoginAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ml';
  entityType?: AlertEntityType;
  entityName?: string;
  returnUrl?: string;
}

export function LoginAlertModal({
  isOpen,
  onClose,
  lang = 'en',
  entityType = 'seller',
  entityName,
  returnUrl,
}: LoginAlertModalProps) {
  const navigate = useNavigate();

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useBodyScrollLock(isOpen);

  if (!isOpen) return null;

  const getEntityMessage = () => {
    switch (entityType) {
      case 'mill':
        return {
          title: lang === 'en' ? 'Sign in required' : 'ലോഗിൻ ആവശ്യമാണ്',
          desc: lang === 'en'
            ? `Please sign in to contact ${entityName || 'this timber mill'}.`
            : `${entityName || 'ഈ തടി മില്ലുമായി'} ബന്ധപ്പെടാൻ ദയവായി ലോഗിൻ ചെയ്യുക.`,
        };
      case 'carpenter':
        return {
          title: lang === 'en' ? 'Sign in required' : 'ലോഗിൻ ആവശ്യമാണ്',
          desc: lang === 'en'
            ? `Please sign in to send an enquiry to ${entityName || 'this carpenter'}.`
            : `${entityName || 'ഈ ആശാരിക്ക്'} അന്വേഷണം അയക്കാൻ ദയവായി ലോഗിൻ ചെയ്യുക.`,
        };
      case 'transport':
        return {
          title: lang === 'en' ? 'Sign in required' : 'ലോഗിൻ ആവശ്യമാണ്',
          desc: lang === 'en'
            ? `Please sign in to view ${entityName ? `${entityName}'s` : 'this transport provider\'s'} contact details.`
            : `${entityName || 'ഈ തടി ട്രാൻസ്പോർട്ട് സർവീസിന്റെ'} കോൺടാക്റ്റ് വിവരങ്ങൾ കാണാൻ ലോഗിൻ ചെയ്യുക.`,
        };
      case 'enquiry':
        return {
          title: lang === 'en' ? 'Sign in required' : 'ലോഗിൻ ആവശ്യമാണ്',
          desc: lang === 'en'
            ? 'Please sign in to submit a price enquiry for this timber batch.'
            : 'ഈ തടി ബാച്ചിന് വില അന്വേഷണം സമർപ്പിക്കാൻ ദയവായി ലോഗിൻ ചെയ്യുക.',
        };
      case 'seller':
      default:
        return {
          title: lang === 'en' ? 'Sign in required' : 'ലോഗിൻ ആവശ്യമാണ്',
          desc: lang === 'en'
            ? `Please sign in to view ${entityName ? `${entityName}'s` : 'this seller\'s'} contact details.`
            : `${entityName || 'ഈ തടിക്കച്ചവടക്കാരന്റെ'} കോൺടാക്റ്റ് വിവരങ്ങൾ കാണാൻ ലോഗിൻ ചെയ്യുക.`,
        };
    }
  };

  const { title, desc } = getEntityMessage();

  const handleSignIn = () => {
    onClose();
    navigate('/login', {
      state: {
        returnTo: returnUrl || window.location.pathname,
      },
    });
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-alert-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm sm:max-w-md bg-[#FAF8F5] rounded-3xl border-2 border-[#8E7F6B]/30 shadow-2xl p-6 sm:p-7 space-y-5 text-left transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Icon */}
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'en' ? 'Close dialog' : 'ഡയലോഗ് അടയ്ക്കുക'}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-2xl bg-[#E7E1D6] text-[#5B6147] border border-[#8E7F6B]/30 shadow-xs flex-shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1 pr-6">
            <h3 id="login-alert-title" className="text-lg font-bold font-serif text-[#4A3626] leading-tight">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[#7A5A3A] leading-relaxed">
              {desc}
            </p>
          </div>
        </div>

        {/* Security & Access Notice */}
        <div className="p-3 rounded-2xl bg-[#E7E1D6]/70 border border-[#8E7F6B]/25 flex items-center gap-2.5 text-[11px] text-[#4A3626]">
          <Shield className="w-4 h-4 text-[#5B6147] flex-shrink-0" />
          <span>
            {lang === 'en'
              ? 'TIMORA safeguards verified seller and artisan contact information.'
              : 'സ്ഥിരീകരിച്ച വ്യാപാരികളുടെ വിവരങ്ങൾ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു.'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs sm:text-sm transition focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              {lang === 'en' ? 'Cancel' : 'റദ്ദാക്കുക'}
            </button>
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full py-2.5 rounded-xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center justify-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-[#5B6147]"
            >
              <span>{lang === 'en' ? 'Sign In' : 'ലോഗിൻ'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleRegister}
              className="inline-flex items-center gap-1.5 text-xs text-[#7A5A3A] hover:text-[#4A3626] font-semibold underline underline-offset-2 transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#5B6147]" />
              <span>{lang === 'en' ? 'New to Timora? Create an account' : 'പുതിയ ആളാണോ? അക്കൗണ്ട് ഉണ്ടാക്കുക'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
