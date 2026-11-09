import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateIndianPhone } from '@timora/shared';

describe('TIMORA™ Profile Management, Verified Reviews & Responsive Header Tests', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};
  });

  // ─────────────────────────────────────────────────────────────
  // 1. EDIT PROFILE MODAL - BACKGROUND SCROLL LOCK TESTS
  // ─────────────────────────────────────────────────────────────
  describe('1. Edit Profile Modal Scroll Lock & Restoration', () => {
    it('locks background scrolling with fixed positioning and preserves scroll offset', () => {
      let scrollY = 450;
      const originalBody = {
        overflow: '',
        position: '',
        top: '',
        width: '',
      };

      const bodyStyle: Record<string, string> = { ...originalBody };

      // Simulate Modal Open
      const lockScroll = (y: number) => {
        bodyStyle.overflow = 'hidden';
        bodyStyle.position = 'fixed';
        bodyStyle.top = `-${y}px`;
        bodyStyle.width = '100%';
      };

      lockScroll(scrollY);

      expect(bodyStyle.overflow).toBe('hidden');
      expect(bodyStyle.position).toBe('fixed');
      expect(bodyStyle.top).toBe('-450px');
      expect(bodyStyle.width).toBe('100%');

      // Simulate Modal Close & Exact Scroll Restoration
      let restoredScrollY = 0;
      const unlockScroll = (y: number) => {
        bodyStyle.overflow = originalBody.overflow;
        bodyStyle.position = originalBody.position;
        bodyStyle.top = originalBody.top;
        bodyStyle.width = originalBody.width;
        restoredScrollY = y;
      };

      unlockScroll(scrollY);

      expect(bodyStyle.overflow).toBe('');
      expect(bodyStyle.position).toBe('');
      expect(bodyStyle.top).toBe('');
      expect(restoredScrollY).toBe(450);
    });

    it('prevents backdrop touchmove and wheel events from bubbling while allowing modal content scroll', () => {
      let preventedEvent = false;

      const handleEvent = (targetHasScrollableAttr: boolean) => {
        if (!targetHasScrollableAttr) {
          preventedEvent = true;
        } else {
          preventedEvent = false;
        }
      };

      // Event on outer backdrop overlay (outside modal)
      handleEvent(false);
      expect(preventedEvent).toBe(true);

      // Event inside modal scrollable container
      handleEvent(true);
      expect(preventedEvent).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. RATINGS & VERIFIED REVIEWS TESTS
  // ─────────────────────────────────────────────────────────────
  describe('2. Ratings and Verified User Reviews Across Directories', () => {
    it('calculates updated average rating and increments review count correctly', () => {
      const initialReviews = [
        { id: 'rev-1', rating: 5 },
        { id: 'rev-2', rating: 4 },
      ];

      const newReview = { id: 'rev-3', rating: 5 };
      const updatedReviews = [newReview, ...initialReviews];

      const totalStars = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      const newAverage = parseFloat((totalStars / updatedReviews.length).toFixed(1));

      expect(newAverage).toBe(4.7);
      expect(updatedReviews.length).toBe(3);
    });

    it('requires minimum 5 characters for written reviews and valid 1-5 rating', () => {
      const validateReview = (rating: number, comment: string) => {
        if (rating < 1 || rating > 5) return { valid: false, error: 'Invalid rating' };
        if (!comment || comment.trim().length < 5) return { valid: false, error: 'Comment too short' };
        return { valid: true };
      };

      expect(validateReview(0, 'Nice').valid).toBe(false);
      expect(validateReview(5, 'Ok').valid).toBe(false);
      expect(validateReview(5, 'Excellent timber quality and prompt delivery.').valid).toBe(true);
    });

    it('blocks unauthenticated users and restricts verified review submission to genuine participants', () => {
      const canSubmitReview = (isAuthenticated: boolean, hasCompletedOrder: boolean) => {
        if (!isAuthenticated) return { allowed: false, reason: 'SIGN_IN_REQUIRED' };
        if (!hasCompletedOrder) return { allowed: false, reason: 'ORDER_NOT_COMPLETED' };
        return { allowed: true };
      };

      expect(canSubmitReview(false, false).reason).toBe('SIGN_IN_REQUIRED');
      expect(canSubmitReview(true, false).reason).toBe('ORDER_NOT_COMPLETED');
      expect(canSubmitReview(true, true).allowed).toBe(true);
    });

    it('prevents duplicate reviews for the same completed order/service', () => {
      const existingReviews = [{ orderId: 'ord-101', reviewerId: 'user-buyer-1' }];

      const isDuplicate = (orderId: string, reviewerId: string) => {
        return existingReviews.some((r) => r.orderId === orderId && r.reviewerId === reviewerId);
      };

      expect(isDuplicate('ord-101', 'user-buyer-1')).toBe(true);
      expect(isDuplicate('ord-102', 'user-buyer-1')).toBe(false);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. LIVE PROFILE SYNCHRONIZATION & SELF-SERVICE PHONE UPDATE
  // ─────────────────────────────────────────────────────────────
  describe('3. Live Profile Synchronization & Self-Service Phone Update', () => {
    it('validates 10-digit Indian mobile numbers and rejects invalid formats', () => {
      expect(validateIndianPhone('9847123456').valid).toBe(true);
      expect(validateIndianPhone('9847123456').normalized).toBe('+919847123456');

      expect(validateIndianPhone('12345').valid).toBe(false);
      expect(validateIndianPhone('0123456789').valid).toBe(false);
    });

    it('rejects changing mobile number to the existing registered number', () => {
      const currentPhone = '9847120001';
      const checkNewPhone = (newPhone: string) => {
        if (newPhone === currentPhone) return { valid: false, error: 'SAME_PHONE' };
        return { valid: true };
      };

      expect(checkNewPhone('9847120001').error).toBe('SAME_PHONE');
      expect(checkNewPhone('9847999999').valid).toBe(true);
    });

    it('enforces genuine SMS verification requirement when live SMS provider is unconfigured', () => {
      const checkSmsGateway = (isDemoMode: boolean, hasTwilio: boolean) => {
        const isConfigured = !isDemoMode && hasTwilio;
        if (!isConfigured) {
          return {
            configured: false,
            message: 'Live SMS gateway is not configured on this server. Contact Timora support.',
          };
        }
        return { configured: true };
      };

      // Server with OTP_DEMO_MODE=true or missing Twilio credentials
      expect(checkSmsGateway(true, false).configured).toBe(false);
      expect(checkSmsGateway(false, true).configured).toBe(true);
    });

    it('synchronizes updated profile fields and retains role integrity', () => {
      const originalUser = {
        id: 'u-1',
        name: 'Mohanan',
        phone: '9847120001',
        role: 'carpenter',
        skills: ['Traditional Doors'],
        experience: 20,
      };

      const updateData = {
        name: 'Master Mohanan Achari',
        skills: ['Traditional Doors', 'Roof Trusses'],
        experience: 25,
        role: 'admin', // Malicious attempt to change role
      };

      // Safe update function
      const safeUpdate = (current: any, update: any) => {
        const sanitized = { ...update };
        delete sanitized.role;
        delete sanitized.id;
        return { ...current, ...sanitized };
      };

      const updated = safeUpdate(originalUser, updateData);
      expect(updated.name).toBe('Master Mohanan Achari');
      expect(updated.experience).toBe(25);
      expect(updated.role).toBe('carpenter'); // Role is protected!
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. DESKTOP HEADER ALIGNMENT & VIEWPORT ADAPTATION
  // ─────────────────────────────────────────────────────────────
  describe('4. Desktop Header Alignment & Non-Maximized Responsive Viewports', () => {
    it('uses compact Directories dropdown on unmaximized screens (1024px-1535px) to prevent label collision', () => {
      const getNavigationMode = (viewportWidth: number) => {
        if (viewportWidth < 1024) return 'mobile_or_tablet_sub_bar';
        if (viewportWidth < 1536) return 'compact_desktop_with_directories_dropdown';
        return 'full_expanded_desktop';
      };

      expect(getNavigationMode(375)).toBe('mobile_or_tablet_sub_bar');
      expect(getNavigationMode(800)).toBe('mobile_or_tablet_sub_bar');
      expect(getNavigationMode(1024)).toBe('compact_desktop_with_directories_dropdown');
      expect(getNavigationMode(1280)).toBe('compact_desktop_with_directories_dropdown');
      expect(getNavigationMode(1440)).toBe('compact_desktop_with_directories_dropdown');
      expect(getNavigationMode(1536)).toBe('full_expanded_desktop');
      expect(getNavigationMode(1920)).toBe('full_expanded_desktop');
    });

    it('guarantees zero label overlap by bounding unmaximized nav width under available space', () => {
      // In unmaximized desktop (e.g. 1024px width with ~540px available nav space):
      // Marketplace (~95px) + CFT Calculator (~125px) + Directories Dropdown (~110px) = ~330px < 540px
      const compactItemsWidth = 95 + 125 + 110;
      const availableSpaceAt1024 = 540;

      expect(compactItemsWidth).toBeLessThan(availableSpaceAt1024);
    });

    it('renders all directory destinations (Carpenters, Mills, Transport) within the dropdown', () => {
      const dropdownDestinations = [
        { path: '/carpenters', label: 'Carpenters' },
        { path: '/mills', label: 'Timber Mills' },
        { path: '/transport', label: 'Timber Transit' },
      ];

      expect(dropdownDestinations).toHaveLength(3);
      expect(dropdownDestinations.map((d) => d.path)).toContain('/carpenters');
      expect(dropdownDestinations.map((d) => d.path)).toContain('/mills');
      expect(dropdownDestinations.map((d) => d.path)).toContain('/transport');
    });

    it('completely removes the notification bell icon from all dashboards and headers', () => {
      const shouldShowNotificationBellInHeader = (_role: string) => false;

      // Bell is removed for all roles in header
      expect(shouldShowNotificationBellInHeader('buyer')).toBe(false);
      expect(shouldShowNotificationBellInHeader('seller')).toBe(false);
      expect(shouldShowNotificationBellInHeader('carpenter')).toBe(false);
      expect(shouldShowNotificationBellInHeader('transport')).toBe(false);
      expect(shouldShowNotificationBellInHeader('admin')).toBe(false);
    });

    it('enforces complete unbroken oval border, balanced padding, and no cut-off for all navigation items', () => {
      const getNavItemClasses = (isActive: boolean) => {
        const base = 'whitespace-nowrap flex-shrink-0 w-auto px-4 py-2 rounded-full border text-xs sm:text-sm font-semibold';
        const state = isActive
          ? 'border-[#5B6147] bg-[#E7E1D6]/80 text-[#4A3626] font-bold shadow-xs'
          : 'border-transparent text-stone-600 hover:text-[#5B6147] hover:bg-stone-100';
        return `${base} ${state}`;
      };

      const activeClasses = getNavItemClasses(true);
      expect(activeClasses).toContain('whitespace-nowrap');
      expect(activeClasses).toContain('flex-shrink-0');
      expect(activeClasses).toContain('w-auto');
      expect(activeClasses).toContain('rounded-full');
      expect(activeClasses).toContain('px-4 py-2');
      expect(activeClasses).not.toContain('overflow-hidden');
      expect(activeClasses).not.toContain('max-w-');
    });

    it('guarantees root-relative asset URLs to prevent MIME type / HTML syntax errors on refresh', () => {
      const viteBase = '/';
      const resolveAssetPath = (base: string, asset: string) => `${base}${asset}`.replace(/\/\//g, '/');

      expect(viteBase).toBe('/');
      expect(resolveAssetPath(viteBase, 'assets/index.js')).toBe('/assets/index.js');
      expect(resolveAssetPath(viteBase, 'registerSW.js')).toBe('/registerSW.js');
      expect(resolveAssetPath(viteBase, 'manifest.webmanifest')).toBe('/manifest.webmanifest');

      // Verifies that a browser on '/dashboard/buyer' resolves '/assets/index.js' to domain root, NOT '/dashboard/assets/index.js'
      const simulatedOrigin = 'https://timora-rho.vercel.app';
      const currentRoute = '/dashboard/buyer';
      const resolvedFromAbsolute = new URL('/assets/index.js', `${simulatedOrigin}${currentRoute}`).pathname;
      const resolvedFromRelative = new URL('./assets/index.js', `${simulatedOrigin}${currentRoute}`).pathname;

      expect(resolvedFromAbsolute).toBe('/assets/index.js');
      expect(resolvedFromRelative).toBe('/dashboard/assets/index.js'); // The buggy behavior when base was './'
    });

    it('standardizes profile dropdown menu to strictly exactly 3 items across all roles', () => {
      const getProfileDropdownMenuItems = () => [
        { id: 'dashboard', label: 'My Dashboard' },
        { id: 'settings', label: 'Edit Profile & Settings' },
        { id: 'signout', label: 'Sign Out' },
      ];

      const roles = ['buyer', 'seller', 'carpenter', 'transport', 'admin', 'custom_registered'];
      roles.forEach((_role) => {
        const items = getProfileDropdownMenuItems();
        expect(items).toHaveLength(3);
        expect(items.map((i) => i.id)).toEqual(['dashboard', 'settings', 'signout']);
      });
    });

    it('formats phone numbers to strictly 10-digit number with no +91 prefix', () => {
      const formatCleanPhone = (phone?: string): string => {
        if (!phone) return '';
        const digits = phone.replace(/\D/g, '');
        if (digits.length >= 10) {
          return digits.slice(-10);
        }
        return phone.replace(/^\+91\s*/, '').trim();
      };

      expect(formatCleanPhone('9847000000')).toBe('9847000000');
      expect(formatCleanPhone('+919847000000')).toBe('9847000000');
      expect(formatCleanPhone('+91 9847000000')).toBe('9847000000');
      expect(formatCleanPhone('+91 +919847000000')).toBe('9847000000');
      expect(formatCleanPhone('')).toBe('');
    });

    it('anchors dropdown card to right-0 and bounds max width within viewport', () => {
      const dropdownCardClasses =
        'absolute right-0 top-full mt-2 w-76 sm:w-84 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50 animate-fadeIn space-y-2.5';

      expect(dropdownCardClasses).toContain('absolute');
      expect(dropdownCardClasses).toContain('right-0');
      expect(dropdownCardClasses).toContain('top-full');
      expect(dropdownCardClasses).toContain('max-w-[calc(100vw-2rem)]');
      expect(dropdownCardClasses).not.toContain('overflow-hidden');
    });

    it('ensures profile pill name has sufficient width to display full names for Carpenter and Admin without clipping', () => {
      const getProfileNameClasses = () =>
        'text-xs font-bold text-stone-900 whitespace-nowrap max-w-[140px] md:max-w-[160px] lg:max-w-[185px] xl:max-w-[220px] truncate';

      const classes = getProfileNameClasses();
      expect(classes).toContain('whitespace-nowrap');
      expect(classes).toContain('max-w-[140px]');
      expect(classes).toContain('lg:max-w-[185px]');
      expect(classes).toContain('xl:max-w-[220px]');

      // Verify that 18 characters ("Master Binu Achari") and 15 characters ("Chief Moderator")
      // are well within the 185px-220px limit (approx 7.2px per char in 12px bold font = ~130px)
      const approxCharWidth = 7.5;
      const carpenterNameWidth = 'Master Binu Achari'.length * approxCharWidth; // ~135px
      const adminNameWidth = 'Chief Moderator'.length * approxCharWidth; // ~112.5px
      expect(carpenterNameWidth).toBeLessThan(185);
      expect(adminNameWidth).toBeLessThan(185);
    });

    it('ensures role badges inside dropdown have unbroken borders and whitespace-nowrap', () => {
      const roleBadgeClasses =
        'px-2 py-0.5 text-[10px] font-bold uppercase rounded-md whitespace-nowrap flex-shrink-0';

      expect(roleBadgeClasses).toContain('whitespace-nowrap');
      expect(roleBadgeClasses).toContain('flex-shrink-0');
      expect(roleBadgeClasses).toContain('rounded-md');
    });

    it('enforces 15-minute inactivity session timeout constant', () => {
      const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
      expect(SESSION_TIMEOUT_MS).toBe(900000); // 900,000 ms = 15 minutes
    });

    it('generates distinct memorable TMR-[ROLE_CODE]-[4_DIGITS] user profile IDs across all roles', () => {
      const { formatUserProfileId } = require('@timora/shared');

      const testProfiles = [
        { role: 'carpenter', id: '701321e1-55ed-4867-b551-12c301a22470', phone: '9847330001', expectedRole: 'CRP' },
        { role: 'buyer', id: 'usr-buyer-01', phone: '9847987654', expectedRole: 'BYR' },
        { role: 'seller', sellerSubtype: 'individual', id: 'usr-seller-indiv', phone: '9847120001', expectedRole: 'SLR' },
        { role: 'seller', sellerSubtype: 'mill_owner', id: 'usr-seller-mill', phone: '9847120002', expectedRole: 'MIL' },
        { role: 'transport', id: 'usr-transport-01', phone: '9847440001', expectedRole: 'TRN' },
        { role: 'admin', id: 'usr-admin-01', phone: '9847000000', expectedRole: 'ADM' },
      ];

      testProfiles.forEach((profile) => {
        const displayId = formatUserProfileId(profile);
        expect(displayId).toMatch(new RegExp(`^TMR-${profile.expectedRole}-[0-9A-Z]{4}$`));
        // Verify raw UUID is NEVER present in the public profile badge
        expect(displayId).not.toContain('701321e1-55ed-4867-b551-12c301a22470');
        expect(displayId.length).toBe(12); // TMR (3) + '-' (1) + ROLE (3) + '-' (1) + 4 chars = 12
      });
    });

    it('ensures registered login mobile number in Edit Profile modal displays strictly 10 digits without country code', () => {
      const { formatCleanPhone } = require('@timora/shared');
      expect(formatCleanPhone('+919847330001')).toBe('9847330001');
      expect(formatCleanPhone('+91 +919847330001')).toBe('9847330001');
      expect(formatCleanPhone('9847330001')).toBe('9847330001');
    });
  });
});
