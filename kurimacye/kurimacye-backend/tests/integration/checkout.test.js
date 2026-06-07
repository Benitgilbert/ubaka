import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../server.js';
import prisma from '../../prisma.js';

describe('Checkout Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/checkout/order', () => {
    const validCheckoutData = {
      shippingAddress: {
        fullName: 'John Doe',
        email: 'john@example.com',
        phone: '0788123456',
        addressLine1: 'Street 123',
        city: 'Kigali',
        country: 'Rwanda',
      },
      paymentMethod: 'mtn_momo',
    };

    it('should create an order successfully from a valid cart', async () => {
      // Mock cart data
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            product: {
              id: 'prod-1',
              name: 'Test Product',
              price: 1000,
              stock: 10,
              visibility: 'public',
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.order.create).mockResolvedValue({
        id: 'order-123',
        publicId: 'ABC-123',
        grandTotal: 2000,
        status: 'pending',
      });
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/checkout/order')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab') // Simulate session token
        .send(validCheckoutData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe('order-123');
      expect(prisma.order.create).toHaveBeenCalled();
      expect(prisma.product.updateMany).toHaveBeenCalled();
      expect(prisma.cartItem.deleteMany).toHaveBeenCalled();
    });

    it('should return 400 if cart is empty', async () => {
      vi.mocked(prisma.cart.findUnique).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/checkout/order')
        .set('x-cart-session', 'empty-cart')
        .send(validCheckoutData);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Cart is empty');
    });

    it('should return 400 if product is out of stock', async () => {
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            productId: 'prod-1',
            quantity: 100,
            product: {
              id: 'prod-1',
              name: 'Test Product',
              price: 1000,
              stock: 10,
              visibility: 'public',
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 0 }); // Simulate update failed due to WHERE stock >= quantity

      const response = await request(app)
        .post('/api/checkout/order')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab')
        .send(validCheckoutData);

      expect(response.status).toBe(400);
      expect(response.body.error.message).toContain('Insufficient stock');
    });

    it('should split order into parent and child orders when cart contains multiple vendors', async () => {
      // Mock cart with items from two different vendors
      const mockCart = {
        id: 'cart-123',
        items: [
          {
            productId: 'prod-1',
            quantity: 1,
            product: {
              id: 'prod-1',
              name: 'Seller A Product',
              price: 1000,
              stock: 10,
              visibility: 'public',
              sellerId: 'seller-a',
            },
          },
          {
            productId: 'prod-2',
            quantity: 2,
            product: {
              id: 'prod-2',
              name: 'Seller B Product',
              price: 2000,
              stock: 5,
              visibility: 'public',
              sellerId: 'seller-b',
            },
          },
        ],
      };

      vi.mocked(prisma.cart.findUnique).mockResolvedValue(mockCart);
      vi.mocked(prisma.order.create).mockImplementation(async ({ data }) => {
        // Return a mock order object with appropriate properties
        return {
          id: data.parentId ? 'child-order' : 'parent-order',
          publicId: data.publicId,
          grandTotal: data.grandTotal,
          status: 'pending',
        };
      });
      vi.mocked(prisma.product.updateMany).mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/checkout/order')
        .set('x-cart-session', '12345678-1234-1234-1234-1234567890ab')
        .send(validCheckoutData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.orderId).toBe('parent-order');
      
      // prisma.order.create should be called 3 times:
      // 1st: Parent order (sellerId = null, parentId = null)
      // 2nd: Seller A child order (sellerId = seller-a, parentId = parent-order.id)
      // 3rd: Seller B child order (sellerId = seller-b, parentId = parent-order.id)
      expect(prisma.order.create).toHaveBeenCalledTimes(3);

      const parentCall = vi.mocked(prisma.order.create).mock.calls[0][0];
      const child1Call = vi.mocked(prisma.order.create).mock.calls[1][0];
      const child2Call = vi.mocked(prisma.order.create).mock.calls[2][0];

      // Parent validation
      expect(parentCall.data.parentId).toBeNull();
      expect(parentCall.data.sellerId).toBeNull();
      expect(parentCall.data.grandTotal).toBe(5000); // 1000 * 1 + 2000 * 2

      // Child 1 validation
      expect(child1Call.data.parentId).toBe('parent-order');
      expect(child1Call.data.sellerId).toBe('seller-a');
      expect(child1Call.data.grandTotal).toBe(1000);

      // Child 2 validation
      expect(child2Call.data.parentId).toBe('parent-order');
      expect(child2Call.data.sellerId).toBe('seller-b');
      expect(child2Call.data.grandTotal).toBe(4000);
    });
  });
});
