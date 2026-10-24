import { Order } from '../models/Order.js';
import { config } from '../config/env.js';
import { emailService } from './emailService.js';

const DELIVERABLE_TYPES = {
  customer: { field: 'customerOrder', send: (order) => emailService.sendOrderConfirmationEmail(order), recipient: (order) => order.customerDetails?.email },
  owner: { field: 'ownerOrder', send: (order) => emailService.sendOwnerOrderNotificationEmail(order, config.orderNotificationEmail), recipient: () => config.orderNotificationEmail },
  shipping: { field: 'customerShipping', send: (order) => emailService.sendShippingConfirmationEmail(order), recipient: (order) => order.customerDetails?.email },
};

async function deliver(orderId, type, manualRetry = false) {
  const definition = DELIVERABLE_TYPES[type];
  if (!definition) throw new Error('Unsupported order notification type');
  const field = `notifications.${definition.field}`;
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const order = await Order.findOneAndUpdate(
    {
      _id: orderId,
      $or: [
        { [`${field}.status`]: { $in: ['pending', 'failed'] } },
        { [`${field}.status`]: 'sending', [`${field}.sendingAt`]: { $lte: cutoff } },
      ],
      ...(!manualRetry ? { [`${field}.attempts`]: { $lt: 5 } } : {}),
    },
    {
      $set: { [`${field}.status`]: 'sending', [`${field}.sendingAt`]: new Date(), [`${field}.lastAttemptAt`]: new Date(), [`${field}.lastError`]: '' },
      $inc: { [`${field}.attempts`]: 1 },
    },
    { new: true }
  );
  if (!order) {
    const existing = await Order.findById(orderId).select(`+${field}`);
    return { status: existing?.notifications?.[definition.field]?.status || 'missing', skipped: true };
  }

  const recipient = definition.recipient(order);
  if (!recipient) {
    await Order.updateOne({ _id: orderId }, { $set: { [`${field}.status`]: 'failed', [`${field}.lastError`]: 'Recipient is not configured' } });
    console.error(`[OrderNotifications] ${type} recipient is not configured for order ${order.orderNumber}.`);
    return { status: 'failed', reason: 'Recipient is not configured' };
  }

  try {
    const result = await definition.send(order);
    if (!result.success) {
      const errorCode = result.statusCode ? `Brevo HTTP ${result.statusCode}` : String(result.error || 'Brevo request failed').slice(0, 180);
      await Order.updateOne({ _id: orderId }, { $set: { [`${field}.status`]: 'failed', [`${field}.lastError`]: errorCode } });
      return { status: 'failed', error: errorCode };
    }
    await Order.updateOne({ _id: orderId }, { $set: { [`${field}.status`]: 'accepted', [`${field}.messageId`]: result.messageId || '', [`${field}.acceptedAt`]: new Date(), [`${field}.lastError`]: '' }, $unset: { [`${field}.sendingAt`]: 1 } });
    return { status: 'accepted', messageId: result.messageId };
  } catch (error) {
    console.error(`[OrderNotifications] ${type} send failed for order ${order.orderNumber}:`, error.message);
    await Order.updateOne({ _id: orderId }, { $set: { [`${field}.status`]: 'failed', [`${field}.lastError`]: String(error.message || 'Send failed').slice(0, 180) }, $unset: { [`${field}.sendingAt`]: 1 } });
    return { status: 'failed' };
  }
}

export async function notifyConfirmedOrder(orderId) {
  try {
    const order = await Order.findById(orderId);
    if (!order || (order.paymentDetails?.provider !== 'cod' && order.paymentStatus !== 'paid')) return;
    await Promise.all([deliver(order._id, 'customer'), deliver(order._id, 'owner')]);
  } catch (error) {
    console.error('[OrderNotifications] Could not dispatch confirmed order notifications:', error.message);
  }
}

export async function retryOrderNotification(orderId, type) {
  const order = await Order.findById(orderId);
  if (!order) return { status: 'missing' };
  if (order.paymentDetails?.provider !== 'cod' && order.paymentStatus !== 'paid') {
    return { status: 'not_confirmed', reason: 'Notifications are sent only for paid orders (or confirmed COD orders).' };
  }
  if (type === 'shipping' && order.fulfilmentStatus !== 'shipped') {
    return { status: 'not_ready', reason: 'Shipping notices are available after the order is marked shipped.' };
  }
  return deliver(order._id, type, true);
}

export async function retryDueOrderNotifications() {
  const cutoff = new Date(Date.now() - 5 * 60 * 1000);
  const orders = await Order.find({
    $and: [
      { $or: [{ paymentStatus: 'paid' }, { 'paymentDetails.provider': 'cod' }] },
      { $or: [
      { 'notifications.customerOrder.status': 'pending' },
      { 'notifications.ownerOrder.status': 'pending' },
      { 'notifications.customerOrder.status': 'failed', 'notifications.customerOrder.attempts': { $lt: 5 }, 'notifications.customerOrder.lastAttemptAt': { $lte: cutoff } },
      { 'notifications.ownerOrder.status': 'failed', 'notifications.ownerOrder.attempts': { $lt: 5 }, 'notifications.ownerOrder.lastAttemptAt': { $lte: cutoff } },
      { 'notifications.customerOrder.status': 'sending', 'notifications.customerOrder.sendingAt': { $lte: cutoff } },
      { 'notifications.ownerOrder.status': 'sending', 'notifications.ownerOrder.sendingAt': { $lte: cutoff } },
      { fulfilmentStatus: 'shipped', $or: [
        { 'notifications.customerShipping.status': 'pending' },
        { 'notifications.customerShipping.status': 'failed', 'notifications.customerShipping.attempts': { $lt: 5 }, 'notifications.customerShipping.lastAttemptAt': { $lte: cutoff } },
        { 'notifications.customerShipping.status': 'sending', 'notifications.customerShipping.sendingAt': { $lte: cutoff } },
      ] },
      ] },
    ],
  }).select('_id').limit(25);
  await Promise.all(orders.map(async ({ _id }) => {
    for (const type of ['customer', 'owner', 'shipping']) {
      try { await deliver(_id, type); } catch (error) { console.error('[OrderNotifications] Retry worker error:', error.message); }
    }
  }));
}
