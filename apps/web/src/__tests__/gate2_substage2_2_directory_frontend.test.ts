import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Gate 2 Sub-Stage 2.2: Directory Integration & Contact Privacy (Frontend)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Production Bundle Hygiene & Mock Elimination', () => {
    it('verifies TimberMillsPage has eliminated hardcoded mock array DEMO_TIMBER_MILLS and private phone numbers', () => {
      const filePath = path.resolve(__dirname, '../pages/public/TimberMillsPage.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).not.toContain('DEMO_TIMBER_MILLS');
      expect(content).not.toContain('+919447101234');
      expect(content).not.toContain('+919447202345');
      expect(content).not.toContain('+919447303456');
      expect(content).not.toContain('+919447404567');
      expect(content).not.toContain('+919447505678');
      expect(content).not.toContain('+919447606789');
      expect(content).not.toContain('+919447707890');
      // Confirms loading skeleton and retry button are present
      expect(content).toContain('timber-mills-loading');
      expect(content).toContain('fetchMills');
    });

    it('verifies CarpenterDirectoryPage has eliminated INITIAL_CARPENTERS and mock phone numbers', () => {
      const filePath = path.resolve(__dirname, '../pages/carpenter/CarpenterDirectoryPage.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).not.toContain('INITIAL_CARPENTERS');
      expect(content).not.toContain('+919447300101');
      expect(content).not.toContain('+919447300102');
      expect(content).not.toContain('+919447300103');
      expect(content).not.toContain('+919447300104');
      // Confirms loading skeleton and retry button are present
      expect(content).toContain('carpenters-loading');
      expect(content).toContain('fetchCarpenters');
    });

    it('verifies TransportPage has eliminated INITIAL_TRANSPORTERS and mock phone numbers', () => {
      const filePath = path.resolve(__dirname, '../pages/public/TransportPage.tsx');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).not.toContain('INITIAL_TRANSPORTERS');
      expect(content).not.toContain('+919447100001');
      expect(content).not.toContain('+919447200002');
      expect(content).not.toContain('+919447300003');
      expect(content).not.toContain('+919447400004');
      // Confirms loading skeleton and retry button are present
      expect(content).toContain('transport-loading');
      expect(content).toContain('fetchProviders');
    });
  });

  describe('2. Server-Side Privacy Fallback Consistency', () => {
    it('verifies CarpenterDirectoryPage and TransportPage default to masked representation for guests', () => {
      const carpPath = path.resolve(__dirname, '../pages/carpenter/CarpenterDirectoryPage.tsx');
      const carpContent = fs.readFileSync(carpPath, 'utf-8');
      expect(carpContent).toContain('+91 9447••••••');

      const transPath = path.resolve(__dirname, '../pages/public/TransportPage.tsx');
      const transContent = fs.readFileSync(transPath, 'utf-8');
      expect(transContent).toContain('+91 9447••••••');
    });
  });
});
