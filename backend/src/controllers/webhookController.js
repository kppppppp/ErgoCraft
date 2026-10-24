import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Product } from '../models/Product.js';
import { paymentService } from '../services/paymentService.js';
import { notifyConfirmedOrder } from '../services/orderNotificationService.js';
import { config } from '../config/env.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const handleRazorpayWebhook = async (req, res) => {
  if (!config.razorpay.webhookSecret) {
    return res.status(503).json({ success: false, message: 'Razorpay webhook secret is not configured' });
  }
  const validSignature = paymentService.verifyWebhookSignature(req.rawBody, req.headers['x-razorpay-signature']);
  if (!validSignature) return res.status(400).json({ success: false, message: 'Invalid webhook signature' });

  const { event, payload } = req.body || {};
  const entity = payload?.payment?.entity;
  if (!entity?.order_id || !entity?.id) return res.status(400).json({ success: false, message: 'Webhook payment details are incomplete' });
  const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
  if (!payment) return res.status(404).json({ success: false, message: 'Payment reference not found' });
  if (entity.amount !== Math.round(payment.amount * 100) || entity.currency !== payment.currency) {
    return res.status(400).json({ success: false, message: 'Webhook amount or currency does not match the payment record' });
  }
  const order = await Order.findById(payment.order);
  if (!order || order.paymentDetails?.orderId !== entity.order_id) {
    return res.status(404).json({ success: false, message: 'Matching order not found' });
  }

  if (event === 'payment.captured') {
    const capturedPayment = await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $ne: 'captured' }, 'webhookEvents.eventId': { $ne: entity.id } },
      { $set: { status: 'captured', razorpayPaymentId: entity.id }, $push: { webhookEvents: { eventId: entity.id, event, receivedAt: new Date() } } },
      { new: true }
    );
    const latestPayment = capturedPayment || await Payment.findById(payment._id);
    if (latestPayment?.status !== 'captured') {
      return res.status(409).json({ success: false, message: 'Payment could not transition to captured' });
    }

    const paidOrder = await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $ne: 'paid' }, 'paymentDetails.orderId': entity.order_id },
      {
        $set: { paymentStatus: 'paid', 'paymentDetails.paymentId': entity.id },
        $push: { statusHistory: { status: 'Payment Captured (Webhook)', timestamp: new Date(), updatedBy: 'Razorpay Webhook', note: `Auto-verified via event: ${event}` } },
      },
      { new: true }
    );
    if (paidOrder) {
      for (const item of paidOrder.items) {
        const updated = await Product.findOneAndUpdate({ _id: item.product, stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { new: true });
        if (!updated) console.error(`[Webhook] Captured order ${paidOrder.orderNumber} needs stock review for product ${item.product}.`);
      }
      void notifyConfirmedOrder(paidOrder._id);
    }
  } else if (event === 'payment.failed') {
    if (payment.webhookEvents.some((logged) => logged.eventId === entity.id && logged.event === event)) {
      return res.status(200).json(new ApiResponse(200, null, 'Already processed'));
    }
    await Payment.findOneAndUpdate(
      { _id: payment._id, status: { $ne: 'captured' }, 'webhookEvents.eventId': { $ne: entity.id } },
      { $set: { status: 'failed' }, $push: { webhookEvents: { eventId: entity.id, event, receivedAt: new Date() } } }
    );
    await Order.findOneAndUpdate(
      { _id: order._id, paymentStatus: { $nin: ['paid', 'refunded'] } },
      { $set: { paymentStatus: 'failed' }, $push: { statusHistory: { status: 'Payment Failed (Webhook)', timestamp: new Date(), updatedBy: 'Razorpay Webhook', note: entity.error_description || 'Payment failure' } } }
    );
  }
  return res.status(200).json(new ApiResponse(200, null, 'Webhook processed successfully'));
};
