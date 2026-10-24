import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

class PaymentService {
  constructor() {
    this.isConfigured = Boolean(config.razorpay.keyId && config.razorpay.keySecret);

    if (this.isConfigured) {
      this.razorpay = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
    }
  }

  async createOrder({ amount, currency = 'INR', receipt, notes = {} }) {
    if (!this.isConfigured) {
      throw new ApiError(
        500,
        'Razorpay is not configured. Please ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are configured on the server.'
      );
    }

    // Amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(amount * 100);

    try {
      const order = await this.razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes,
      });
      return order;
    } catch (error) {
      console.error('[PaymentService] Razorpay order creation failed:', error);
      throw new ApiError(500, `Failed to create payment order: ${error.message}`);
    }
  }

  verifySignature({ orderId, paymentId, signature }) {
    if (!this.isConfigured || !signature || !/^[0-9a-f]{64}$/i.test(String(signature))) {
      return false;
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(body.toString())
      .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(String(signature), 'hex');
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  }

  async fetchPayment(paymentId) {
    if (!this.isConfigured) throw new ApiError(503, 'Razorpay payment verification is unavailable');
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch (error) {
      console.error('[PaymentService] Razorpay payment lookup failed:', error.message);
      throw new ApiError(502, 'Could not confirm payment status with Razorpay');
    }
  }

  verifyWebhookSignature(rawBody, signature) {
    if (!config.razorpay.webhookSecret || !Buffer.isBuffer(rawBody) || !/^[0-9a-f]{64}$/i.test(String(signature || ''))) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expected = Buffer.from(expectedSignature, 'hex');
    const received = Buffer.from(String(signature), 'hex');
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  }
}

export const paymentService = new PaymentService();
