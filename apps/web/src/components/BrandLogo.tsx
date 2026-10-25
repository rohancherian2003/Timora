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
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl sm:text-2xl',
    lg: 'text-3xl sm:text-4xl',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Authentic Timber Log Cross-Section (വെട്ടിയ തടിയുടെ ലോഗ് ലോഗോ) */}
      <div
        className={`${iconSizes[size]} relative rounded-2xl bg-gradient-to-br from-[#451e11] via-[#2d140b] to-[#1a0c06] p-1.5 flex items-center justify-center shadow-md shadow-stone-950/25 ring-2 ring-[#b45309]/40 flex-shrink-0 group-hover:scale-105 transition-transform`}
      >
        <svg
          viewBox="0 0 54 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Outer Bark Rim (മരത്തൊലി) */}
          <circle cx="27" cy="27" r="25" fill="#38170c" stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="27" cy="27" r="23.5" stroke="#a16207" strokeWidth="1" strokeDasharray="3 1.5" opacity="0.6" />

          {/* Sapwood Outer Band (തടിയുടെ വെള്ള) */}
          <circle cx="27" cy="27" r="21" fill="#78350f" fillOpacity="0.4" stroke="#d97706" strokeWidth="1.2" strokeOpacity="0.7" />

          {/* Concentric Annual Growth Rings (വാർഷിക വളയങ്ങൾ - Teak / Rosewood rings) */}
          <circle cx="27" cy="27" r="17" stroke="#f59e0b" strokeWidth="1.2" strokeOpacity="0.65" strokeDasharray="4 2" />
          <circle cx="27" cy="27" r="13" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.8" />
          <circle cx="27" cy="27" r="9" stroke="#fde68a" strokeWidth="1.2" strokeOpacity="0.85" strokeDasharray="2 1.5" />
          
          {/* Heartwood Core / Pith (തടിയുടെ കാതൽ) */}
          <circle cx="27" cy="27" r="5" fill="#f59e0b" />
          <circle cx="27" cy="27" r="2" fill="#78350f" />

          {/* Radial Medullary Rays (തടിയുടെ റേഡിയൽ വിള്ളലുകളും ലൈനുകളും) */}
          <path d="M27 6L27 12M27 42L27 48M6 27L12 27M42 27L48 27" stroke="#fef3c7" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.4" />
          <path d="M12 12L16 16M38 38L42 42M42 12L38 16M12 42L16 38" stroke="#fef3c7" strokeWidth="0.8" strokeLinecap="round" strokeOpacity="0.3" />

          {/* Two Cut Timber Logs stacked icon overlay */}
          <path
            d="M20 20C20 18.5 23 18.5 27 18.5C31 18.5 34 18.5 34 20M20 34C20 35.5 23 35.5 27 35.5C31 35.5 34 35.5 34 34"
            stroke="#ffffff"
            strokeWidth="1.2"
            strokeOpacity="0.5"
          />
        </svg>
      </div>

      <div>
        <div className="flex items-baseline gap-1.5 leading-none">
          <span
            className={`${textSizes[size]} font-black tracking-tight ${
              isDark ? 'text-white' : 'text-stone-900'
            }`}
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
          >
            TIMORA
          </span>
          <span className="w-2 h-2 rounded-full bg-[#d97706] shadow-sm flex-shrink-0" />
        </div>
        {showSubtitle && (
          <span
            className={`block text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${
              isDark ? 'text-amber-300' : 'text-[#854d0e]'
            } mt-0.5`}
          >
            {lang === 'en' ? 'Kerala Raw Timber Exchange' : 'കേരള തടി വ്യാപാര ശൃംഖല'}
          </span>
        )}
      </div>
    </div>
  );
}
