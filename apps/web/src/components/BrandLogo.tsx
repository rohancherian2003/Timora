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
  showSubtitle = false,
  variant = 'light',
}: BrandLogoProps) {
  const iconSizes = {
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12 sm:w-14 sm:h-14',
  };

  const textSizes = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-2xl sm:text-3xl',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-2 sm:gap-2.5 select-none ${className}`}>
      {/* Official Carved Wooden 'T' Icon */}
      <div
        className={`${iconSizes[size]} relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <img
          src={TIMORA_T_LOGO}
          alt="Timora Logo"
          className="w-full h-full object-contain filter drop-shadow-xs"
        />
      </div>

      {/* Clean Brand Name with TM placed neatly directly on top right */}
      <div className="relative inline-flex items-baseline leading-none">
        <span
          className={`${textSizes[size]} font-serif font-black tracking-wider ${
            isDark ? 'text-stone-100' : 'text-[#4A3626]'
          }`}
          style={{ fontFamily: 'Georgia, serif' }}
        >
          TIM<span className="text-[#5B6147]">O</span>RA
        </span>
        <span className="text-[8px] sm:text-[9px] font-bold text-[#8A8F6E] -top-1.5 relative ml-0.5 select-none font-sans">
          ™
        </span>
      </div>
    </div>
  );
}
