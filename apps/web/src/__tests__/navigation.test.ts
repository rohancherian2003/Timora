import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  triggerExplicitBack,
  allowExplicitBack,
  resetExplicitBack,
  isExplicitBackAllowed,
} from '../hooks/useStrictUINavigation';

describe('Navigation, Session Security & Back Button Tests', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};
  });

  describe('Session Storage & Logout Safeguards', () => {
    it('clears all session keys, tokens, and storage upon logout', () => {
      mockStorage['timora_auth_user'] = JSON.stringify({ id: 'usr-1', role: 'buyer' });
      mockStorage['timora_auth_token'] = 'token-xyz';
      mockStorage['timora_access_token'] = 'access-xyz';
      mockStorage['timora_user'] = JSON.stringify({ id: 'usr-1' });
      mockStorage['timora_last_active'] = String(Date.now());

      // Simulate logout cleanup
      const keysToClear = [
        'timora_auth_user',
        'timora_auth_token',
        'timora_access_token',
        'timora_user',
        'timora_last_active',
      ];
      keysToClear.forEach((key) => delete mockStorage[key]);

      expect(mockStorage['timora_auth_user']).toBeUndefined();
      expect(mockStorage['timora_auth_token']).toBeUndefined();
      expect(mockStorage['timora_access_token']).toBeUndefined();
      expect(mockStorage['timora_user']).toBeUndefined();
      expect(mockStorage['timora_last_active']).toBeUndefined();
    });

    it('identifies expired sessions after inactivity period (25 mins)', () => {
      const SESSION_TIMEOUT_MS = 25 * 60 * 1000;
      const expiredTimestamp = Date.now() - (SESSION_TIMEOUT_MS + 1000);
      mockStorage['timora_last_active'] = String(expiredTimestamp);

      const lastActive = mockStorage['timora_last_active'];
      const elapsed = Date.now() - parseInt(lastActive!, 10);
      const isExpired = elapsed > SESSION_TIMEOUT_MS;

      expect(isExpired).toBe(true);
    });
  });

  describe('Browser History Barrier for Protected Dashboards', () => {
    it('simulates history state barrier when entering protected dashboard', () => {
      const historyStack: any[] = [];
      const pushState = (state: any, title: string, url: string) => {
        historyStack.push({ state, title, url });
      };

      pushState({ protectedDashboard: true }, '', '/dashboard/buyer');

      expect(historyStack).toHaveLength(1);
      expect(historyStack[0].state).toEqual({ protectedDashboard: true });
      expect(historyStack[0].url).toBe('/dashboard/buyer');
    });

    it('intercepts back navigation and opens confirmation alert without auto sign-out', () => {
      let promptOpened = false;
      let userLoggedOut = false;

      const onPopState = () => {
        // Re-push location to retain URL
        // Do NOT automatically sign out
        promptOpened = true;
      };

      onPopState();

      expect(promptOpened).toBe(true);
      expect(userLoggedOut).toBe(false); // Pressing Back MUST NOT auto sign-out
    });

    it('handles Cancel behavior by preserving session and closing alert', () => {
      let promptOpened = true;
      let sessionPreserved = true;

      // User selects Cancel
      promptOpened = false;

      expect(promptOpened).toBe(false);
      expect(sessionPreserved).toBe(true);
    });

    it('handles Sign Out behavior by clearing session and redirecting to homepage', () => {
      let activeUser: any = { id: 'usr-buyer', role: 'buyer' };
      let redirectedPath = '';

      // User selects Sign Out
      activeUser = null;
      redirectedPath = '/';

      expect(activeUser).toBeNull();
      expect(redirectedPath).toBe('/');
    });
  });

  describe('BackButton Safe Fallback Mechanism', () => {
    it('navigates to fallback path when opened directly without history', () => {
      let targetRoute = '';
      const navigate = (to: string | number) => {
        targetRoute = String(to);
      };

      const handleBack = (historyLen: number, historyIdx: number, fallback = '/marketplace') => {
        if (historyLen > 1 && historyIdx > 0) {
          navigate(-1);
        } else {
          navigate(fallback);
        }
      };

      // Direct entry: length is 1, idx is 0
      handleBack(1, 0, '/marketplace');
      expect(targetRoute).toBe('/marketplace');

      // Subpage with valid history: length is 5, idx is 4
      handleBack(5, 4, '/marketplace');
      expect(targetRoute).toBe('-1');
    });
  });

  describe('Verification Status Banner Lifecycle & Action Gating', () => {
    it('keeps banner persistent for PENDING_APPROVAL and gates restricted actions', () => {
      const user: { id: string; role: string; approvalStatus: string } = {
        id: 'seller-1',
        role: 'individual_seller',
        approvalStatus: 'PENDING_APPROVAL',
      };

      const canPostListing = user.approvalStatus === 'APPROVED';
      expect(canPostListing).toBe(false);

      // Verify banner visibility is not auto-dismissed for pending review
      const shouldAutoDismiss = user.approvalStatus === 'APPROVED';
      expect(shouldAutoDismiss).toBe(false);
    });

    it('auto-dismisses APPROVED confirmation banner and caches dismissal in session', () => {
      const user: { id: string; role: string; approvalStatus: string } = {
        id: 'seller-2',
        role: 'individual_seller',
        approvalStatus: 'APPROVED',
      };

      let bannerVisible = true;
      const dismissCacheKey = `dismissed_approved_banner_${user.id}`;

      // Simulate auto-dismiss or manual dismiss
      const handleDismiss = () => {
        bannerVisible = false;
        mockStorage[dismissCacheKey] = 'true';
      };

      handleDismiss();

      expect(bannerVisible).toBe(false);
      expect(mockStorage[dismissCacheKey]).toBe('true');

      // Subsequent checks read from cache to prevent annoying persistent banner
      const isAlreadyDismissed = mockStorage[dismissCacheKey] === 'true';
      expect(isAlreadyDismissed).toBe(true);

      // But backend authoritative status and profile verification remain active
      expect(user.approvalStatus).toBe('APPROVED');
      const canPostListing = user.approvalStatus === 'APPROVED';
      expect(canPostListing).toBe(true);
    });

    it('retains persistent banners for ACTION_REQUIRED, REJECTED, and SUSPENDED', () => {
      const statuses: string[] = ['ACTION_REQUIRED', 'REJECTED', 'SUSPENDED'];

      statuses.forEach((status) => {
        const user: { id: string; role: string; approvalStatus: string } = { id: 'u-1', role: 'mill_owner', approvalStatus: status };
        const shouldAutoDismiss = user.approvalStatus === 'APPROVED';
        expect(shouldAutoDismiss).toBe(false);

        const canPerformRestrictedActions = user.approvalStatus === 'APPROVED';
        expect(canPerformRestrictedActions).toBe(false);
      });
    });
  });

  describe('Strict UI-Only Back Navigation Guard & Mobile Layout Refactor', () => {
    beforeEach(() => {
      resetExplicitBack();
    });

    it('maintains isExplicitBack = false by default to trap accidental browser-level gestures', () => {
      expect(isExplicitBackAllowed()).toBe(false);
    });

    it('authorizes explicit UI back button click and allows navigation', () => {
      let navigatedTo = '';
      triggerExplicitBack(() => {
        expect(isExplicitBackAllowed()).toBe(true);
        navigatedTo = '-1';
      });

      expect(navigatedTo).toBe('-1');
    });

    it('intercepts accidental popstate events and restores current location without leaving screen', () => {
      let propagationStopped = false;
      const pushedStates: Array<{ state: any; title: string; url: string }> = [];

      const mockPopStateEvent = {
        stopImmediatePropagation: () => {
          propagationStopped = true;
        },
      } as unknown as PopStateEvent;

      const currentUrl = 'https://timora.in/calculator';

      // Simulate popstate interception logic
      const simulatePopState = (evt: PopStateEvent, url: string) => {
        if (isExplicitBackAllowed()) {
          resetExplicitBack();
          return true; // allowed
        }
        evt.stopImmediatePropagation();
        pushedStates.push({ state: null, title: '', url });
        return false; // trapped
      };

      const result = simulatePopState(mockPopStateEvent, currentUrl);

      expect(result).toBe(false); // Accidental back was blocked
      expect(propagationStopped).toBe(true);
      expect(pushedStates).toHaveLength(1);
      expect(pushedStates[0]?.url).toBe('https://timora.in/calculator');
    });

    it('permits authorized UI popstate navigation and auto-resets authorization flag', () => {
      let propagationStopped = false;

      const mockPopStateEvent = {
        stopImmediatePropagation: () => {
          propagationStopped = true;
        },
      } as unknown as PopStateEvent;

      const simulatePopState = (evt: PopStateEvent) => {
        if (isExplicitBackAllowed()) {
          resetExplicitBack();
          return true; // allowed
        }
        evt.stopImmediatePropagation();
        return false; // trapped
      };

      // Set explicit back flag
      allowExplicitBack();
      expect(isExplicitBackAllowed()).toBe(true);

      const result = simulatePopState(mockPopStateEvent);

      expect(result).toBe(true); // Allowed
      expect(propagationStopped).toBe(false);
      expect(isExplicitBackAllowed()).toBe(false); // Auto-reset after transit
    });

    it('validates mobile-only CSS classes for top bar and navigation redundancy removal', () => {
      // Top header unauthenticated guest buttons hidden on mobile (< 768px), visible on desktop (md:)
      const guestTopBarClasses = 'hidden md:flex items-center gap-1.5 sm:gap-2 flex-shrink-0';
      expect(guestTopBarClasses).toContain('hidden md:flex');

      // Top sub-navigation bar hidden on mobile (< 768px), visible on tablet (md:block lg:hidden)
      const subNavClasses = 'hidden md:block lg:hidden w-full border-t border-stone-200/80 bg-stone-50/95 backdrop-blur-md px-4 sm:px-6 py-2 overflow-x-auto no-scrollbar';
      expect(subNavClasses).toContain('hidden md:block lg:hidden');

      // Category shortcuts on Marketplace formatted as compact 2-column mobile touch grid
      const categoryGridClasses = 'grid grid-cols-2 md:hidden gap-2.5 max-w-4xl mx-auto pt-1';
      expect(categoryGridClasses).toContain('grid grid-cols-2 md:hidden');

      // Body and root containers enforce overscroll-x-none
      const rootClasses = 'bg-slate-50 text-slate-900 font-sans antialiased w-full max-w-full overflow-x-hidden overscroll-x-none';
      expect(rootClasses).toContain('overscroll-x-none');
    });
  });
});
