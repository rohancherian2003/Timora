import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  lang?: 'en' | 'ml';
  variant?: 'light' | 'dark';
}

export function BrandLogo({
  className = '',
  size = 'md',
  showSubtitle = true,
  lang = 'en',
  variant = 'light',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`}>
      {/* Official Timora Carved Wooden 'T' Emblem with Green Leaves (from poster) */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-br from-amber-50 to-stone-100 p-1 flex items-center justify-center shadow-md shadow-stone-900/10 ring-1.5 ring-amber-700/30 flex-shrink-0 group-hover:scale-105 transition-transform overflow-hidden`}
      >
        <img
          src="/images/brand/timora-t-emblem-transparent.png"
          alt="Timora Carved 'T' Emblem"
          className="w-full h-full object-contain filter drop-shadow-xs"
          onError={(e) => {
            // Fallback to original image if needed
            (e.target as HTMLImageElement).src = '/images/brand/timora-t-emblem.png';
          }}
        />
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 leading-none">
          {/* TIMORA with leaf inside 'O' styling */}
          <span
            className={`${textSizes[size]} font-serif font-black tracking-wider ${
              isDark ? 'text-white' : 'text-[#2e170c]'
            }`}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            TIM<span className="text-[#15803d]">O</span>RA
          </span>
          <span className="text-[10px] font-bold text-amber-700">™</span>
        </div>
        {showSubtitle && (
          <span
            className={`block text-[8px] sm:text-[9.5px] font-bold uppercase tracking-widest ${
              isDark ? 'text-amber-300' : 'text-[#166534]'
            } mt-0.5`}
          >
            {lang === 'en' ? 'Smart Timber Marketplace' : 'സ്മാർട്ട് തടി വിപണി'}
          </span>
        )}
      </div>
    </div>
  );
}
