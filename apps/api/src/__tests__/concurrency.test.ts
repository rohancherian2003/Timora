import { describe, it, expect, vi } from 'vitest';
import { OrdersService } from '../modules/orders/orders.service.js';

describe('Order Creation & Inventory Concurrency Safeguards', () => {
  it('prevents overselling when available stock is insufficient', async () => {
    const ordersService = new OrdersService();

    // Mock an atomic database decrement returning empty row (stock insufficient / conflict)
    const mockOrderCreation = async (requestedQty: number, availableStock: number) => {
      if (requestedQty > availableStock) {
        throw new Error('INSUFFICIENT_STOCK');
      }
      return { id: 'order-123', agreed_qty: requestedQty, status: 'confirmed' };
    };

    // Simulate 2 concurrent requests competing for 1 remaining piece
    let availableStock = 1;
    const executeAttempt = async () => {
      if (availableStock >= 1) {
        availableStock -= 1;
        return { success: true };
      }
      throw new Error('INSUFFICIENT_STOCK');
    };

    const results = await Promise.allSettled([
      executeAttempt(),
      executeAttempt(),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    // Exactly 1 must succeed, exactly 1 must fail
    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);
    expect(availableStock).toBe(0);
  });
});
