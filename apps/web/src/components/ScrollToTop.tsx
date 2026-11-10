import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { forceReleaseBodyScrollLock } from '../hooks/useBodyScrollLock';

/**
 * Global ScrollToTop component for React Router.
 * Automatically resets scroll position to top on route transitions and page refreshes,
 * while releasing any stale body locks left behind by unmounted modals.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Force release any residual body scroll locks from previous modals or transitions
    forceReleaseBodyScrollLock();

    // 2. Perform instant scroll to top on window, document, and layout containers
    try {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' as ScrollBehavior,
      });
    } catch {
      window.scrollTo(0, 0);
    }

    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.scrollTop = 0;
    }

    const containerEl = document.getElementById('main-app-container');
    if (containerEl) {
      containerEl.scrollTop = 0;
    }
  }, [pathname, search]);

  useEffect(() => {
    // Disable automatic browser scroll restoration on refresh so pages always open cleanly from the top
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return null;
}

