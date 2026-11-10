import { useEffect } from 'react';

// Reference counter to support multiple nested/stacked modals safely without losing base overflow state
let activeLocksCount = 0;
let originalOverflowStyle = '';

/**
 * Hook to lock background body scrolling when any modal or drawer is open.
 * Restores original overflow style upon modal unmount or close using ref-counting.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (activeLocksCount === 0) {
      originalOverflowStyle = document.body.style.overflow || '';
      document.body.style.overflow = 'hidden';
    }
    activeLocksCount++;

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1);
      if (activeLocksCount === 0) {
        document.body.style.overflow = originalOverflowStyle || '';
      }
    };
  }, [isLocked]);
}

/**
 * Force-releases all active body scroll locks and restores default scrolling.
 * Called on route changes and page unmounts to ensure users never get trapped in locked state.
 */
export function forceReleaseBodyScrollLock() {
  activeLocksCount = 0;
  if (typeof document !== 'undefined' && document.body) {
    document.body.style.overflow = '';
  }
}
