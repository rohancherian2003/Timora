import React, { useState, useEffect, useRef } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';

export const DISALLOWED_SEARCH_CHARS_REGEX = /[<>{}[\]\\^`~;="]/;

export interface ValidatedSearchInputProps {
  id?: string;
  value?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  lang?: 'en' | 'ml';
  className?: string;
  inputClassName?: string;
  minChars?: number; // defaults to 3
  debounceMs?: number; // defaults to 350ms
  autoFocus?: boolean;
  disabled?: boolean;
  customValidator?: (val: string) => { isValid: boolean; message?: string } | null;
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export function ValidatedSearchInput({
  id,
  value: controlledValue,
  onSearch,
  placeholder,
  lang = 'en',
  className = '',
  inputClassName = '',
  minChars = 3,
  debounceMs = 350,
  autoFocus = false,
  disabled = false,
  customValidator,
  size = 'md',
  ariaLabel,
}: ValidatedSearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== internalValue) {
      setInternalValue(controlledValue);
      if (!controlledValue) {
        setErrorMessage(null);
        setHintMessage(null);
      }
    }
  }, [controlledValue]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInternalValue(rawVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 1. Check for illegal characters (< > { } [ ] \ ^ ` ~ ; = ")
    if (DISALLOWED_SEARCH_CHARS_REGEX.test(rawVal)) {
      setErrorMessage(
        lang === 'ml'
          ? 'അസാധുവായ ചിഹ്നങ്ങൾ (< > { } [ ] മുതലായവ) അനുവദനീയമല്ല.'
          : 'Invalid characters detected. Please avoid using < > { } [ ] symbols.'
      );
      setHintMessage(null);
      // Completely block search callback when invalid
      return;
    }

    // 2. Run custom validator if provided
    if (customValidator) {
      const customRes = customValidator(rawVal);
      if (customRes && !customRes.isValid) {
        setErrorMessage(customRes.message || (lang === 'ml' ? 'അസാധുവായ തിരയൽ' : 'Invalid search query'));
        setHintMessage(null);
        return;
      }
    }

    // Clear error if validation passed
    setErrorMessage(null);

    const trimmed = rawVal.trim();

    // 3. If empty, reset search immediately (0 characters)
    if (trimmed.length === 0) {
      setHintMessage(null);
      onSearch('');
      return;
    }

    // 4. Enforce 3-character minimum constraint: block API calls / state updates
    if (trimmed.length < minChars) {
      setHintMessage(
        lang === 'ml'
          ? `തിരയാൻ കുറഞ്ഞത് ${minChars} അക്ഷരങ്ങൾ നൽകുക`
          : `Type at least ${minChars} characters to search`
      );
      // Do NOT trigger onSearch
      return;
    }

    // 5. Valid query (>= minChars): Debounce for 350ms before initiating search
    setHintMessage(null);
    debounceTimerRef.current = setTimeout(() => {
      onSearch(trimmed);
    }, debounceMs);
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setInternalValue('');
    setErrorMessage(null);
    setHintMessage(null);
    onSearch('');
    inputRef.current?.focus();
  };

  // Sizing definitions
  const isLg = size === 'lg';
  const isSm = size === 'sm';
  const paddingClasses = isLg
    ? 'pl-12 pr-10 py-3.5 text-xs sm:text-sm rounded-2xl'
    : isSm
    ? 'pl-8 pr-7 py-1.5 text-xs rounded-lg'
    : 'pl-10 pr-9 py-2 text-xs sm:text-sm rounded-xl';

  const iconClasses = isLg
    ? 'w-5 h-5 left-4 top-3.5'
    : isSm
    ? 'w-3.5 h-3.5 left-2.5 top-2'
    : 'w-4 h-4 left-3.5 top-2.5';

  const clearBtnClasses = isLg
    ? 'right-3.5 top-3.5 p-0.5'
    : isSm
    ? 'right-2 top-1.5 p-0.5'
    : 'right-3 top-2 p-0.5';

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      <div className="relative group w-full">
        <Search
          className={`absolute text-[#8E7F6B] group-focus-within:text-[#5B6147] transition-colors pointer-events-none ${iconClasses}`}
        />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={internalValue}
          onChange={handleChange}
          placeholder={
            placeholder ||
            (lang === 'ml' ? 'തിരയുക (കുറഞ്ഞത് 3 അക്ഷരങ്ങൾ)...' : 'Search (min 3 characters)...')
          }
          disabled={disabled}
          autoFocus={autoFocus}
          aria-label={ariaLabel || placeholder || 'Search'}
          className={`w-full font-semibold transition-all border outline-none ${paddingClasses} ${
            errorMessage
              ? 'border-red-400 bg-red-50/40 text-red-950 placeholder-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-[#8E7F6B]/30 bg-white text-[#4A3626] placeholder-[#8E7F6B] focus:border-[#5B6147] focus:ring-2 focus:ring-[#5B6147]/15'
          } ${inputClassName}`}
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={`absolute text-[#8E7F6B] hover:text-[#4A3626] rounded-full hover:bg-stone-100 transition ${clearBtnClasses}`}
            title={lang === 'ml' ? 'തിരയൽ ഒഴിവാക്കുക' : 'Clear search'}
            aria-label="Clear search"
          >
            <X className={isLg ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
          </button>
        )}
      </div>

      {/* Inline Red Alert / Error Indicator */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium animate-fadeIn"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Helper / Character Count Hint */}
      {!errorMessage && hintMessage && (
        <p className="text-[11px] text-[#8E7F6B] px-1 animate-fadeIn flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0 inline-block" />
          {hintMessage}
        </p>
      )}
    </div>
  );
}
