import React from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Clock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function SessionTimeoutModal({ lang = 'en' }: { lang?: 'en' | 'ml' }) {
  const { isSessionTimedOut, dismissTimeoutModal } = useAuth();
  const navigate = useNavigate();

  if (!isSessionTimedOut) return null;

  const handleGoToLogin = () => {
    dismissTimeoutModal();
    navigate('/login', { replace: true });
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#2C2218]/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-[#FDFBF7] rounded-3xl border-2 border-[#8E7F6B]/30 shadow-2xl max-w-md w-full p-6 sm:p-7 space-y-5 text-center my-auto">
        <div className="w-16 h-16 rounded-2xl bg-[#E7E1D6] text-[#5B6147] border border-[#8E7F6B]/30 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-8 h-8 text-[#5B6147]" />
        </div>

        <div className="space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-[#E7E1D6] text-[#4A3626] font-bold text-[11px] uppercase tracking-wider inline-block">
            {lang === 'en' ? 'Session Timeout' : 'സെഷൻ കാലാവധി കഴിഞ്ഞു'}
          </span>
          <h3 className="font-serif font-extrabold text-[#4A3626] text-xl">
            {lang === 'en' ? 'Inactivity Timeout' : 'സുരക്ഷാ മുൻകരുതൽ'}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-[#7A5A3A] leading-relaxed">
          {lang === 'en'
            ? 'Your session was automatically closed after 15 minutes of inactivity to protect your account. Please sign in again to continue.'
            : 'നിങ്ങളുടെ അക്കൗണ്ടിന്റെ സുരക്ഷ മുൻനിർത്തി 15 മിനിറ്റ് നിഷ്ക്രിയമായിരുന്നതിനാൽ സെഷൻ അവസാനിച്ചു. തുടരാൻ ദയവായി വീണ്ടും ലോഗിൻ ചെയ്യുക.'}
        </p>

        <div className="pt-2">
          <button
            onClick={handleGoToLogin}
            className="w-full py-3 rounded-2xl bg-[#5B6147] hover:bg-[#3F452F] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            <LogIn className="w-4 h-4" />
            <span>{lang === 'en' ? 'Sign In Again' : 'വീണ്ടും ലോഗിൻ ചെയ്യുക'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
