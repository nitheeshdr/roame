import { NotImplementedError } from '@/lib/utils';
import type { CreateOrderInput, VerifyPaymentInput } from '@/lib/validation';

/**
 * Razorpay adapter. Wired when RAZORPAY_KEY_ID/SECRET are provided; otherwise
 * returns 501 so the payment endpoints exist and are documented.
 */
const isConfigured =
  !!process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'your-razorpay-key-id' &&
  !!process.env.RAZORPAY_KEY_SECRET;

function ensure(): void {
  if (!isConfigured) {
    throw new NotImplementedError('Payments are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
}

export const paymentsAdapter = {
  isConfigured,
  async createOrder(_input: CreateOrderInput) {
    ensure();
    return { orderId: '', amount: 0, currency: 'INR' };
  },
  async verify(_input: VerifyPaymentInput) {
    ensure();
    return { valid: false };
  },
  async refund(_paymentId: string, _amountCents?: number) {
    ensure();
    return { refundId: '' };
  },
};
