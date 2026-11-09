import { describe, it, expect } from 'vitest';
import { formatUserProfileId, formatCleanPhone, formatTimberListingId } from './formatters.js';

describe('formatUserProfileId & formatCleanPhone Utility Suite', () => {
  describe('formatUserProfileId', () => {
    it('formats carpenter role to TMR-CRP-XXXX', () => {
      const user = {
        id: '701321e1-55ed-4867-b551-12c301a22470',
        role: 'carpenter',
        phone: '9847330001',
      };
      const formatted = formatUserProfileId(user);
      expect(formatted).toMatch(/^TMR-CRP-\d{4}$/);
      expect(formatted).toBe('TMR-CRP-2470');
    });

    it('formats buyer role to TMR-BYR-XXXX', () => {
      const user = {
        id: 'usr-buyer-01',
        role: 'buyer',
        phone: '9847987654',
      };
      const formatted = formatUserProfileId(user);
      expect(formatted).toBe('TMR-BYR-7654');
    });

    it('formats individual seller role to TMR-SLR-XXXX', () => {
      const user = {
        id: 'usr-seller-indiv',
        role: 'seller',
        sellerSubtype: 'individual',
        phone: '9847120001',
      };
      const formatted = formatUserProfileId(user);
      expect(formatted).toBe('TMR-SLR-0001');
    });

    it('formats timber mill owner role to TMR-MIL-XXXX', () => {
      const user = {
        id: 'usr-seller-mill',
        role: 'seller',
        sellerSubtype: 'mill_owner',
        phone: '9847120002',
      };
      const formatted = formatUserProfileId(user);
      expect(formatted).toBe('TMR-MIL-0002');
    });

    it('formats transport owner role to TMR-TRN-XXXX', () => {
      const user = {
        id: 'usr-transport-01',
        role: 'transport',
        phone: '9847440001',
      };
      const formatted = formatUserProfileId(user);
      expect(formatted).toBe('TMR-TRN-0001');
    });

    it('formats admin role to TMR-ADM-XXXX', () => {
      const user = {
        id: 'usr-admin-01',
        role: 'admin',
        phone: '9847000000',
      };
      const formatted = formatUserProfileId(user);
      expect(formatted).toBe('TMR-ADM-0001');
    });

    it('handles direct string arguments formatUserProfileId(role, id, phone, subtype)', () => {
      expect(formatUserProfileId('carpenter', '701321e1-55ed-4867-b551-12c301a22470')).toBe('TMR-CRP-2470');
      expect(formatUserProfileId('seller', undefined, '9847120002', 'mill_owner')).toBe('TMR-MIL-0002');
      expect(formatUserProfileId('admin', 'usr-admin-01', '9847000001')).toBe('TMR-ADM-0001');
    });

    it('gracefully handles missing or undefined user inputs with safe fallback', () => {
      expect(formatUserProfileId(null)).toBe('TMR-USR-0001');
      expect(formatUserProfileId(undefined)).toBe('TMR-USR-0001');
      expect(formatUserProfileId({})).toBe('TMR-USR-0001');
    });
  });

  describe('formatCleanPhone', () => {
    it('normalizes standard 10-digit number to strictly 10 digits without +91', () => {
      expect(formatCleanPhone('9847330001')).toBe('9847330001');
    });

    it('removes duplicate country codes (+91 +91...) to strictly 10 digits', () => {
      expect(formatCleanPhone('+91 +919847330001')).toBe('9847330001');
      expect(formatCleanPhone('+919847330001')).toBe('9847330001');
      expect(formatCleanPhone('+91 9847330001')).toBe('9847330001');
    });

    it('handles empty or null phone cleanly', () => {
      expect(formatCleanPhone('')).toBe('');
      expect(formatCleanPhone(null)).toBe('');
      expect(formatCleanPhone(undefined)).toBe('');
    });
  });

  describe('formatTimberListingId', () => {
    it('formats listing UUID into readable TMR-TMB-XXXX code', () => {
      const listing = { id: 'a7d2c8b3-55ed-4867-b551-12c301a22470' };
      expect(formatTimberListingId(listing)).toBe('TMR-TMB-2470');
      expect(formatTimberListingId('a7d2c8b3-55ed-4867-b551-12c301a22470')).toBe('TMR-TMB-2470');
    });

    it('preserves existing TMR-TMB-XXXX formatted code', () => {
      expect(formatTimberListingId('TMR-TMB-7F3A')).toBe('TMR-TMB-7F3A');
      expect(formatTimberListingId({ id: 'tmr-tmb-8899' })).toBe('TMR-TMB-8899');
    });

    it('falls back safely on missing, empty, or short IDs', () => {
      expect(formatTimberListingId(null)).toBe('TMR-TMB-0001');
      expect(formatTimberListingId(undefined)).toBe('TMR-TMB-0001');
      expect(formatTimberListingId('')).toBe('TMR-TMB-0001');
      expect(formatTimberListingId('42')).toBe('TMR-TMB-0042');
    });
  });
});
