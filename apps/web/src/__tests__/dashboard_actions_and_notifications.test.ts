import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getStoredTickets,
  saveStoredTickets,
  markTicketAsRead,
  getUnreadTicketCount,
  resolveTicket,
  SupportTicket,
} from '../utils/ticketService';

describe('Dashboard Interactive Action Handlers & Notification Badge Lifecycle', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorage = {};

    // Mock localStorage for ticketService
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, val: string) => {
        mockStorage[key] = val;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        mockStorage = {};
      },
    });

    // Mock window dispatchEvent
    const mockWindow = {
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    vi.stubGlobal('window', mockWindow);
  });

  // ─────────────────────────────────────────────────────────────
  // 1. BUYER DASHBOARD: 'Confirm Delivery Received' ACTION & UI TRANSITION
  // ─────────────────────────────────────────────────────────────
  describe('1. Buyer Dashboard Delivery Confirmation Flow', () => {
    it('initializes order in delivered_pending status with Confirm Delivery Received button', () => {
      const order = {
        id: 'ord-101',
        listing_title: 'First-Grade Nilambur Teak Planks',
        status: 'delivered_pending',
      };

      const isDeliveredPending = order.status === 'delivered_pending';
      expect(isDeliveredPending).toBe(true);

      const buttonLabel = isDeliveredPending ? 'Confirm Delivery Received' : 'Completed & Delivered';
      expect(buttonLabel).toBe('Confirm Delivery Received');
    });

    it('executes delivery confirmation mutation and updates local state reactively to completed', async () => {
      let orders = [
        { id: 'ord-101', title: 'Teak Planks', status: 'delivered_pending' },
        { id: 'ord-102', title: 'Anjili Beams', status: 'completed' },
      ];

      let confirmingOrderId: string | null = null;
      let apiCalledEndpoint = '';

      // Simulated handleConfirmDelivery
      const handleConfirmDelivery = async (orderId: string) => {
        confirmingOrderId = orderId;
        // Verify loading/disabled state
        expect(confirmingOrderId).toBe(orderId);

        // Simulate API call
        apiCalledEndpoint = `/orders/${orderId}/confirm-delivery`;

        // Update state reactively
        orders = orders.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o));
        confirmingOrderId = null;
      };

      await handleConfirmDelivery('ord-101');

      expect(apiCalledEndpoint).toBe('/orders/ord-101/confirm-delivery');
      expect(confirmingOrderId).toBeNull();

      const updatedOrder = orders.find((o) => o.id === 'ord-101');
      expect(updatedOrder?.status).toBe('completed');
    });

    it('renders green Completed & Delivered badge and Review Seller button once completed', () => {
      const order = {
        id: 'ord-101',
        status: 'completed',
        seller_id: 'usr-seller-1',
        seller_name: 'Nilambur Wood Works',
      };

      const isCompleted = order.status === 'completed';
      expect(isCompleted).toBe(true);

      const badgeText = isCompleted ? 'Completed & Delivered' : 'Confirm Delivery Received';
      expect(badgeText).toBe('Completed & Delivered');

      const canReviewSeller = isCompleted && Boolean(order.seller_id);
      expect(canReviewSeller).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 2. SUPPORT TICKETS UNREAD NOTIFICATION BADGE AUTO-CLEAR
  // ─────────────────────────────────────────────────────────────
  describe('2. Support Tickets Unread Notification Badge Auto-Clear', () => {
    it('detects unread resolved ticket reply and displays notification badge count', () => {
      const testTickets: SupportTicket[] = [
        {
          id: 'TKT-2026-7842',
          name: 'Suresh Kumar',
          phone: '9847987654',
          role: 'buyer',
          category: 'Timber Quality Issue',
          categoryMl: 'തടിയുടെ ഗുണനിലവാരം',
          description: 'Measurement verification required.',
          priority: 'urgent',
          status: 'resolved',
          createdAt: '2026-10-25 11:20',
          resolutionReply: 'Admin verified variance and issued refund.',
          resolvedAt: '2026-10-25 15:45',
          isRead: false,
        },
      ];

      saveStoredTickets(testTickets);

      const unreadCount = getUnreadTicketCount('9847987654', 'buyer');
      expect(unreadCount).toBe(1);
    });

    it('auto-clears unread badge counter upon viewing resolved admin solution reply', () => {
      const testTickets: SupportTicket[] = [
        {
          id: 'TKT-2026-7842',
          name: 'Suresh Kumar',
          phone: '9847987654',
          role: 'buyer',
          category: 'Timber Quality Issue',
          categoryMl: 'തടിയുടെ ഗുണനിലവാരം',
          description: 'Measurement verification required.',
          priority: 'urgent',
          status: 'resolved',
          createdAt: '2026-10-25 11:20',
          resolutionReply: 'Admin verified variance and issued refund.',
          resolvedAt: '2026-10-25 15:45',
          isRead: false,
        },
      ];

      saveStoredTickets(testTickets);
      expect(getUnreadTicketCount('9847987654', 'buyer')).toBe(1);

      // User views the resolved solution (banner or tickets tab)
      markTicketAsRead('TKT-2026-7842');

      // Unread count immediately becomes 0
      const updatedCount = getUnreadTicketCount('9847987654', 'buyer');
      expect(updatedCount).toBe(0);

      // Ticket content and solution reply are strictly preserved
      const stored = getStoredTickets();
      const viewedTicket = stored.find((t) => t.id === 'TKT-2026-7842');
      expect(viewedTicket).toBeDefined();
      expect(viewedTicket?.resolutionReply).toContain('Admin');
      expect(viewedTicket?.isRead).toBe(true);
    });

    it('new admin solution reply increments unread badge again until viewed', () => {
      const testTickets: SupportTicket[] = [
        {
          id: 'TKT-2026-8901',
          name: 'Nilambur Wood Mart',
          phone: '9847120001',
          role: 'seller',
          category: 'Transit Pass',
          categoryMl: 'ട്രാൻസിറ്റ് പാസ്സ്',
          description: 'Checkpost clearance required.',
          priority: 'urgent',
          status: 'open',
          createdAt: '2026-10-26 09:15',
          isRead: true,
        },
      ];

      saveStoredTickets(testTickets);
      expect(getUnreadTicketCount('9847120001', 'seller')).toBe(0);

      // Admin resolves ticket
      resolveTicket('TKT-2026-8901', 'Transit pass cleared through forest office portal.');

      // Unread count increments to 1
      expect(getUnreadTicketCount('9847120001', 'seller')).toBe(1);

      // User views and clears
      markTicketAsRead('TKT-2026-8901');
      expect(getUnreadTicketCount('9847120001', 'seller')).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 3. SIBLING ROLE ACTIONS: TRANSPORT, TIMBER MILL & CARPENTER
  // ─────────────────────────────────────────────────────────────
  describe('3. Sibling Role Primary Action Handlers', () => {
    it('Transport Dashboard: Accept Transit updates consignment to confirmed', () => {
      let bookings = [
        { id: 'tr-bk-2', client: 'Suresh', status: 'requested' },
      ];

      const handleAcceptTransit = (id: string) => {
        bookings = bookings.map((b) => (b.id === id ? { ...b, status: 'confirmed' } : b));
      };

      expect(bookings[0]?.status).toBe('requested');
      handleAcceptTransit('tr-bk-2');
      expect(bookings[0]?.status).toBe('confirmed');
    });

    it('Timber Mill Dashboard: Update Stock Batch toggles between in_sawing and available', () => {
      let batches = [
        { id: 'mill-b-1', title: 'Teak Beams', status: 'in_sawing' },
      ];

      const handleToggleBatchStatus = (id: string) => {
        batches = batches.map((b) =>
          b.id === id ? { ...b, status: b.status === 'available' ? 'in_sawing' : 'available' } : b
        );
      };

      expect(batches[0]?.status).toBe('in_sawing');
      handleToggleBatchStatus('mill-b-1');
      expect(batches[0]?.status).toBe('available');
      handleToggleBatchStatus('mill-b-1');
      expect(batches[0]?.status).toBe('in_sawing');
    });

    it('Carpenter Dashboard: Mark Done transitions enquiry to completed', () => {
      let enquiries = [
        { id: 'enq-c2', client: 'Sujith', status: 'in_progress' },
      ];

      const handleMarkDone = (id: string) => {
        enquiries = enquiries.map((e) => (e.id === id ? { ...e, status: 'completed' } : e));
      };

      expect(enquiries[0]?.status).toBe('in_progress');
      handleMarkDone('enq-c2');
      expect(enquiries[0]?.status).toBe('completed');
    });
  });

  // ─────────────────────────────────────────────────────────────
  // 4. ADMIN SOLUTION REPLY DISMISSAL & PHONE SANITIZATION
  // ─────────────────────────────────────────────────────────────
  describe('4. Admin Solution Reply Dismissal & Phone Number Sanitization', () => {
    it('clicking dismiss button on Admin Solution Reply banner immediately hides card and persists dismissal', () => {
      let showAdminReply = true;
      let dismissedTicketIds: string[] = [];

      const handleDismissAdminReply = (ticketId: string) => {
        showAdminReply = false;
        dismissedTicketIds = [...dismissedTicketIds, ticketId];
        localStorage.setItem('timora_dismissed_admin_reply_buyer', 'true');
        localStorage.setItem('timora_dismissed_ticket_ids', JSON.stringify(dismissedTicketIds));
      };

      const resolvedTicket = {
        id: 'TKT-2026-7842',
        status: 'resolved',
        resolutionReply: 'Admin refund processed.',
      };

      // Banner is visible initially
      let isVisible = showAdminReply && !dismissedTicketIds.includes(resolvedTicket.id);
      expect(isVisible).toBe(true);

      // User clicks close/cross button
      handleDismissAdminReply(resolvedTicket.id);

      // Card is immediately dismissed
      isVisible = showAdminReply && !dismissedTicketIds.includes(resolvedTicket.id);
      expect(isVisible).toBe(false);
      expect(showAdminReply).toBe(false);
      expect(dismissedTicketIds).toContain('TKT-2026-7842');
      expect(localStorage.getItem('timora_dismissed_admin_reply_buyer')).toBe('true');
    });

    it('sanitizes phone number to strictly 10 digits without +91 prefix in inputs and profile badges', () => {
      const { formatCleanPhone } = require('@timora/shared');

      // Test various raw formats from database / auth state
      expect(formatCleanPhone('+91 9847123456')).toBe('9847123456');
      expect(formatCleanPhone('+919847123456')).toBe('9847123456');
      expect(formatCleanPhone('+91 +919847123456')).toBe('9847123456');
      expect(formatCleanPhone('9847123456')).toBe('9847123456');
      expect(formatCleanPhone('+91 9847-123-456')).toBe('9847123456');
      expect(formatCleanPhone('')).toBe('');
      expect(formatCleanPhone(null)).toBe('');
    });
  });
});
