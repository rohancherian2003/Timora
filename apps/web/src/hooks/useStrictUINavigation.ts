import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global authorization flag for explicit UI-initiated back navigation.
 * Strict back navigation guard blocks browser-level back clicks, mouse back buttons,
 * and mobile swipe gestures unless explicitly triggered by an authorized in-app UI control.
 */
let isExplicitBack = false;
let resetTimer: ReturnType<typeof setTimeout> | null = null;

export function allowExplicitBack(): void {
  isExplicitBack = true;
  if (resetTimer) clearTimeout(resetTimer);
  resetTimer = setTimeout(() => {
    isExplicitBack = false;
  }, 300);
}

export function resetExplicitBack(): void {
  isExplicitBack = false;
  if (resetTimer) {
    clearTimeout(resetTimer);
    resetTimer = null;
  }
}

export function isExplicitBackAllowed(): boolean {
  return isExplicitBack;
}

/**
 * Execute an authorized UI back navigation callback without triggering the navigation lock.
 */
export function triggerExplicitBack(navigateFn: () => void): void {
  allowExplicitBack();
  try {
    navigateFn();
  } catch (err) {
    resetExplicitBack();
    throw err;
  }
}

/**
 * Hook to enforce strict UI-only back navigation across the entire application.
 * Intercepts popstate events to keep the user locked on the active screen unless
 * an explicit UI back button click authorized the navigation.
 */
export function useStrictUINavigation() {
  const location = useLocation();
  const currentUrlRef = useRef<string>(
    typeof window !== 'undefined' ? window.location.href : ''
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Track active page URL
    currentUrlRef.current = window.location.href;

    const handlePopState = (event: PopStateEvent) => {
      if (isExplicitBackAllowed()) {
        // Authorized by in-app UI BackButton - allow popstate navigation
        resetExplicitBack();
        return;
      }

      // Accidental browser-level back navigation, swipe gesture, or mouse back-click:
      // Stop propagation so router does not unmount or navigate off the active screen
      if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
      }

      // Immediately re-push the active location to lock user on current screen
      try {
        window.history.pushState(null, '', currentUrlRef.current);
      } catch {
        // Fallback if pushState fails in restricted sandbox
      }

      // Notify any active protected route listeners (e.g., SignOutRequiredModal)
      try {
        window.dispatchEvent(new CustomEvent('timora:unauthorized_back'));
      } catch {
        // Ignore custom event dispatch errors in headless environments
      }
    };

    // Attach capturing popstate listener to intercept before standard router listeners
    window.addEventListener('popstate', handlePopState, true);

    return () => {
      window.removeEventListener('popstate', handlePopState, true);
    };
  }, [location.pathname, location.search, location.hash]);
}
