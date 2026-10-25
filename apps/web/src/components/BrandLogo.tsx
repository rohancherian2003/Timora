import React from 'react';
import { TIMORA_T_LOGO } from './logoBase64';

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
      {/* Official Carved Wooden 'T' with Green Leaves from the Founder's Poster */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <img
          src={TIMORA_T_LOGO}
          alt="Timora Logo"
          className="w-full h-full object-contain filter drop-shadow-sm"
        />
      </div>

      <div>
        <div className="flex items-baseline gap-1 leading-none">
          <span
            className={`${textSizes[size]} font-serif font-black tracking-wide ${
              isDark ? 'text-white' : 'text-[#2e170c]'
            }`}
            style={{ fontFamily: 'Georgia, serif' }}
          >
            TIM<span className="text-[#16a34a]">O</span>RA
          </span>
          <span className="text-[10px] font-bold text-amber-700">™</span>
        </div>
        {showSubtitle && (
          <span
            className={`block text-[8.5px] sm:text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'text-amber-300' : 'text-[#166534]'
            } mt-0.5`}
          >
            {lang === 'en' ? 'Smart Timber Marketplace' : 'സ്മാർട്ട് ടിംബർ മാർക്കറ്റ് പ്ലേസ്'}
          </span>
        )}
      </div>
    </div>
  );
}
