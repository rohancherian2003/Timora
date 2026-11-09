import React, { useState, useEffect } from 'react';
import { ArrowUp, LifeBuoy } from 'lucide-react';
import { RaiseTicketModal } from './RaiseTicketModal';

interface GlobalFloatingActionsProps {
  lang?: 'en' | 'ml';
}

export function GlobalFloatingActions({ lang = 'en' }: GlobalFloatingActionsProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isRaiseTicketOpen, setIsRaiseTicketOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const handleExternalOpen = () => setIsRaiseTicketOpen(true);
    window.addEventListener('timora:open_raise_ticket', handleExternalOpen);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('timora:open_raise_ticket', handleExternalOpen);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <div
        className="fixed right-3 sm:right-6 bottom-20 md:bottom-8 z-40 flex flex-col items-end gap-2.5 pointer-events-none"
        aria-label="Floating Actions"
      >
        {/* Scroll to Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          className={`pointer-events-auto h-11 w-11 rounded-2xl bg-white/95 backdrop-blur-xs border border-stone-300 hover:border-[#5B6147] text-[#4A3626] hover:text-[#5B6147] hover:bg-[#E7E1D6]/50 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group ${
            showScrollTop
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-3 scale-90 pointer-events-none'
          }`}
          title={lang === 'en' ? 'Scroll to top' : 'മുകളിലേക്ക് പോകുക'}
          aria-label={lang === 'en' ? 'Scroll to top' : 'മുകളിലേക്ക് പോകുക'}
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-200" />
        </button>

        {/* Raise a Ticket / Support Button */}
        <button
          type="button"
          onClick={() => setIsRaiseTicketOpen(true)}
          className="pointer-events-auto group relative flex items-center gap-2 h-11 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-[#5B6147] to-[#3F452F] text-white font-bold text-xs shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          title={lang === 'en' ? 'Raise a Support Ticket' : 'പരാതി നൽകുക (Support)'}
          aria-label={lang === 'en' ? 'Raise a Support Ticket' : 'പരാതി നൽകുക (Support)'}
        >
          <LifeBuoy className="w-4 h-4 text-white group-hover:rotate-45 transition-transform duration-300 flex-shrink-0" />
          <div className="flex flex-col items-start text-left leading-tight">
            <span className="text-[9px] text-[#d5cfc4] uppercase font-bold block">
              {lang === 'en' ? 'Support' : 'സഹായം'}
            </span>
            <span className="font-extrabold text-white text-xs whitespace-nowrap">
              {lang === 'en' ? 'Raise a Ticket' : 'പരാതി നൽകുക'}
            </span>
          </div>
        </button>
      </div>

      <RaiseTicketModal
        isOpen={isRaiseTicketOpen}
        onClose={() => setIsRaiseTicketOpen(false)}
        lang={lang}
      />
    </>
  );
}

