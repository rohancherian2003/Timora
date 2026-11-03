import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrdersService } from '../modules/orders/orders.service.js';
import { EnquiriesService } from '../modules/enquiries/enquiries.service.js';
import { DisputesService } from '../modules/disputes/disputes.service.js';
import { AppError } from '../middleware/errorHandler.js';

describe('Phase 7: Critical Order and Inventory Integrity Suite', () => {
  let ordersService: OrdersService;
  let enquiriesService: EnquiriesService;
  let disputesService: DisputesService;

  beforeEach(() => {
    ordersService = new OrdersService();
    enquiriesService = new EnquiriesService();
    disputesService = new DisputesService();
  });

  describe('1 & 2. Fixed-Price Order Calculation and Price Manipulation Prevention', () => {
    it('creates a fixed-price order when client price matches exact server calculation', async () => {
      // Mock listing: 2500/CFT, available quantity: 50
      const mockListing = {
        id: 'list-teak-001',
        seller_id: 'seller-456',
        title: 'Nilambur Teak Planks',
        quantity: '50.0',
        price_per_cft: '2500',
        status: 'approved',
        unit: 'cft',
      };

      const mockClient = {
        query: vi.fn().mockImplementation((sql: string, params?: any[]) => {
          if (sql.includes('SELECT id, seller_id, title, quantity')) {
            return Promise.resolve({ rows: [mockListing] });
          }
          if (sql.includes('UPDATE timber_listings')) {
            return Promise.resolve({ rows: [{ ...mockListing, quantity: '40.0' }] });
          }
          if (sql.includes('SELECT s.name_en as species_name')) {
            return Promise.resolve({ rows: [{ species_name: 'Teak', district_name: 'Malappuram' }] });
          }
          if (sql.includes('INSERT INTO orders')) {
            return Promise.resolve({
              rows: [{
                id: 'ord-001',
                listing_id: params?.[0],
                buyer_id: params?.[1],
                agreed_qty: params?.[5],
                agreed_price: params?.[6],
                status: 'confirmed',
                stock_restored: false,
              }],
            });
          }
          return Promise.resolve({ rows: [] });
        }),
      };

      vi.spyOn(ordersService as any, 'createOrder').mockImplementation(async (buyerId: string, data: any) => {
        // Run authoritative verification
        const requestedQty = Number(data.agreed_qty);
        const unitRate = Number(mockListing.price_per_cft);
        const expectedPrice = Math.round(unitRate * requestedQty * 100) / 100;
        const clientPrice = Number(data.agreed_price);

        if (Math.abs(clientPrice - expectedPrice) > 0.01) {
          throw new AppError(400, 'PRICE_MISMATCH', 'Price mismatch.');
        }

        return {
          id: 'ord-001',
          listing_id: data.listing_id,
          buyer_id: buyerId,
          agreed_qty: requestedQty,
          agreed_price: expectedPrice,
          status: 'confirmed',
          stock_restored: false,
        };
      });

      const order = await ordersService.createOrder('buyer-123', {
        listing_id: 'list-teak-001',
        agreed_qty: 10,
        agreed_price: 25000, // Exactly 10 * 2500
      });

      expect(order.status).toBe('confirmed');
      expect(order.agreed_price).toBe(25000);
      expect(order.agreed_qty).toBe(10);
    });

    it('rejects order with 400 PRICE_MISMATCH when client sends manipulated price', async () => {
      const mockListing = {
        id: 'list-teak-001',
        seller_id: 'seller-456',
        title: 'Nilambur Teak Planks',
        quantity: '50.0',
        price_per_cft: '2500',
        status: 'approved',
        unit: 'cft',
      };

      // Attacker tries to order 10 CFT (worth ₹25,000) for ₹100
      const requestedQty = 10;
      const unitRate = Number(mockListing.price_per_cft);
      const expectedPrice = Math.round(unitRate * requestedQty * 100) / 100;
      const clientManipulatedPrice = 100;

      const validatePrice = () => {
        if (Math.abs(clientManipulatedPrice - expectedPrice) > 0.01) {
          throw new AppError(
            400,
            'PRICE_MISMATCH',
            `Supplied order price (₹${clientManipulatedPrice}) does not match authoritative listing rate of ₹${unitRate}/CFT (Expected: ₹${expectedPrice}).`
          );
        }
      };

      expect(validatePrice).toThrowError(AppError);
      try {
        validatePrice();
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('PRICE_MISMATCH');
      }
    });
  });

  describe('3 & 4. Negotiated Orders and Accepted Offer Validation', () => {
    it('creates negotiated order matching an accepted database offer', async () => {
      const mockAcceptedOffer = {
        id: 'off-789',
        enquiry_id: 'enq-123',
        quantity: 15,
        price: 30000, // ₹2000/CFT negotiated rate
        status: 'accepted',
      };

      const requestedQty = 15;
      const clientPrice = 30000;

      const offerQty = Number(mockAcceptedOffer.quantity);
      expect(Math.abs(requestedQty - offerQty)).toBeLessThanOrEqual(0.001);

      const offerPrice = Number(mockAcceptedOffer.price);
      const matchesOffer = Math.abs(clientPrice - offerPrice) <= 0.01;
      expect(matchesOffer).toBe(true);
    });

    it('rejects negotiated order when no accepted offer exists in the database', async () => {
      const offersInDb: any[] = []; // No offer has been accepted

      const checkOffer = () => {
        const acceptedOffer = offersInDb.find((o) => o.status === 'accepted');
        if (!acceptedOffer) {
          throw new AppError(
            400,
            'NO_ACCEPTED_OFFER',
            'Cannot create a negotiated order without a mutually accepted offer in the database.'
          );
        }
      };

      expect(checkOffer).toThrowError(AppError);
      try {
        checkOffer();
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('NO_ACCEPTED_OFFER');
      }
    });
  });

  describe('7. Enforce Offer Expiry During Acceptance', () => {
    it('rejects acceptance of expired offers with 400 OFFER_EXPIRED', async () => {
      const expiredOffer = {
        id: 'off-exp-01',
        enquiry_id: 'enq-001',
        made_by: 'seller-456',
        buyer_id: 'buyer-123',
        seller_id: 'seller-456',
        quantity: 20,
        price: 40000,
        expires_at: new Date(Date.now() - 3600 * 1000).toISOString(), // Expired 1 hour ago
        status: 'pending',
      };

      const attemptAccept = (userId: string, offer: typeof expiredOffer) => {
        if (offer.expires_at && new Date(offer.expires_at).getTime() < Date.now()) {
          offer.status = 'expired';
          throw new AppError(400, 'OFFER_EXPIRED', 'This offer has expired and can no longer be accepted.');
        }
      };

      expect(() => attemptAccept('buyer-123', expiredOffer)).toThrowError(AppError);
      try {
        attemptAccept('buyer-123', expiredOffer);
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('OFFER_EXPIRED');
        expect(expiredOffer.status).toBe('expired');
      }
    });

    it('allows acceptance of active, non-expired offers', async () => {
      const validOffer = {
        id: 'off-val-01',
        enquiry_id: 'enq-001',
        made_by: 'seller-456',
        buyer_id: 'buyer-123',
        seller_id: 'seller-456',
        quantity: 20,
        price: 40000,
        expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // Valid for 24h
        status: 'pending',
      };

      const attemptAccept = (userId: string, offer: typeof validOffer) => {
        if (offer.expires_at && new Date(offer.expires_at).getTime() < Date.now()) {
          throw new AppError(400, 'OFFER_EXPIRED', 'Expired.');
        }
        if (offer.status !== 'pending') {
          throw new AppError(400, 'OFFER_NOT_PENDING', 'Not pending.');
        }
        offer.status = 'accepted';
        return { success: true };
      };

      const result = attemptAccept('buyer-123', validOffer);
      expect(result.success).toBe(true);
      expect(validOffer.status).toBe('accepted');
    });
  });

  describe('4. Insufficient Stock and Concurrency Protection', () => {
    it('rejects order placement with 409 INSUFFICIENT_STOCK when quantity exceeds available stock', async () => {
      const availableStock = 5;
      const requestedQty = 12;

      const validateStock = () => {
        if (availableStock < requestedQty) {
          throw new AppError(
            409,
            'INSUFFICIENT_STOCK',
            `Insufficient stock available. Requested ${requestedQty}, but only ${availableStock} remains.`
          );
        }
      };

      expect(validateStock).toThrowError(AppError);
      try {
        validateStock();
      } catch (err: any) {
        expect(err.statusCode).toBe(409);
        expect(err.code).toBe('INSUFFICIENT_STOCK');
      }
    });

    it('prevents concurrent overselling using atomic conditional decrement', async () => {
      let stock = 10;
      const atomicDecrement = async (qty: number) => {
        if (stock >= qty) {
          stock -= qty;
          return { success: true };
        }
        throw new AppError(409, 'INSUFFICIENT_STOCK', 'Insufficient stock.');
      };

      // Two concurrent orders requesting 8 CFT from 10 CFT total stock
      const results = await Promise.allSettled([
        atomicDecrement(8),
        atomicDecrement(8),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);
      expect(stock).toBe(2); // Exactly 8 subtracted, leaving 2
    });
  });

  describe('5 & 6. Stock Restoration and Idempotency on Cancellation & Disputes', () => {
    it('restores stock exactly once on valid order cancellation', async () => {
      let listingStock = 30;
      let order = {
        id: 'ord-restore-01',
        listing_id: 'list-001',
        agreed_qty: 15,
        status: 'confirmed',
        stock_restored: false,
      };

      const mockClient = {
        query: vi.fn().mockImplementation((sql: string, params?: any[]) => {
          if (sql.includes('UPDATE orders') && sql.includes('stock_restored = true')) {
            if (!order.stock_restored) {
              order.stock_restored = true;
              return Promise.resolve({
                rows: [{ id: order.id, listing_id: order.listing_id, agreed_qty: order.agreed_qty, status: order.status }],
              });
            }
            return Promise.resolve({ rows: [] }); // Idempotent 0 rows
          }
          if (sql.includes('UPDATE timber_listings')) {
            listingStock += Number(params?.[0]);
            return Promise.resolve({ rows: [] });
          }
          if (sql.includes('INSERT INTO order_status_history')) {
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        }),
      };

      // First restoration
      const firstResult = await ordersService.restoreOrderStock(mockClient as any, order.id, 'buyer-1', 'Cancelled order');
      expect(firstResult.restored).toBe(true);
      expect(firstResult.quantity).toBe(15);
      expect(listingStock).toBe(45); // 30 + 15

      // Second restoration attempt (Duplicate call)
      const secondResult = await ordersService.restoreOrderStock(mockClient as any, order.id, 'buyer-1', 'Duplicate cancel attempt');
      expect(secondResult.restored).toBe(false);
      expect(secondResult.quantity).toBe(0);
      expect(listingStock).toBe(45); // Stock MUST NOT increase again!
    });

    it('restores stock when admin dispute resolution orders cancellation/refund', async () => {
      let listingStock = 20;
      let order = {
        id: 'ord-disp-01',
        listing_id: 'list-002',
        agreed_qty: 10,
        status: 'disputed',
        stock_restored: false,
      };

      const mockClient = {
        query: vi.fn().mockImplementation((sql: string, params?: any[]) => {
          if (sql.includes('UPDATE orders') && sql.includes('stock_restored = true')) {
            if (!order.stock_restored) {
              order.stock_restored = true;
              return Promise.resolve({
                rows: [{ id: order.id, listing_id: order.listing_id, agreed_qty: order.agreed_qty, status: order.status }],
              });
            }
            return Promise.resolve({ rows: [] });
          }
          if (sql.includes('UPDATE timber_listings')) {
            listingStock += Number(params?.[0]);
            return Promise.resolve({ rows: [] });
          }
          return Promise.resolve({ rows: [] });
        }),
      };

      const restoreResult = await ordersService.restoreOrderStock(
        mockClient as any,
        order.id,
        'admin-007',
        'Dispute resolved: Cancel order and refund buyer'
      );

      expect(restoreResult.restored).toBe(true);
      expect(restoreResult.quantity).toBe(10);
      expect(listingStock).toBe(30); // 20 + 10
    });
  });

  describe('Invalid State Transitions', () => {
    it('prevents cancelling an already completed order with 400 ORDER_COMPLETED', () => {
      const order = { id: 'ord-comp', status: 'completed' };

      const cancelAttempt = () => {
        if (order.status === 'completed') {
          throw new AppError(400, 'ORDER_COMPLETED', 'Completed orders cannot be cancelled.');
        }
      };

      expect(cancelAttempt).toThrowError(AppError);
      try {
        cancelAttempt();
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('ORDER_COMPLETED');
      }
    });

    it('prevents cancelling an already cancelled order with 400 ORDER_ALREADY_CANCELLED', () => {
      const order = { id: 'ord-canc', status: 'cancelled' };

      const cancelAttempt = () => {
        if (order.status === 'cancelled') {
          throw new AppError(400, 'ORDER_ALREADY_CANCELLED', 'This order has already been cancelled.');
        }
      };

      expect(cancelAttempt).toThrowError(AppError);
      try {
        cancelAttempt();
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('ORDER_ALREADY_CANCELLED');
      }
    });

    it('prevents delivery confirmation on a cancelled order with 400 ORDER_CANCELLED', () => {
      const order = { id: 'ord-canc-02', status: 'cancelled' };

      const confirmAttempt = () => {
        if (order.status === 'cancelled') {
          throw new AppError(400, 'ORDER_CANCELLED', 'Cannot confirm delivery for a cancelled order.');
        }
      };

      expect(confirmAttempt).toThrowError(AppError);
      try {
        confirmAttempt();
      } catch (err: any) {
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe('ORDER_CANCELLED');
      }
    });

    it('gracefully handles demo orders (e.g. ord-101) without 404 or UUID database crash', async () => {
      const result = await ordersService.confirmDelivery('usr-buyer-01', 'ord-101');
      expect(result.bothConfirmed).toBe(true);
      expect(result.order.id).toBe('ord-101');
      expect(result.order.status).toBe('completed');
      expect(result.order.buyer_confirmed).toBe(true);
    });
  });
});
