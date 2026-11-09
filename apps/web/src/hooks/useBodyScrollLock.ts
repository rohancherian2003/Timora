import { useEffect } from 'react';

/**
 * Hook to lock background body scrolling when any modal or drawer is open.
 * Restores original overflow style upon modal unmount or close.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isLocked]);
}

