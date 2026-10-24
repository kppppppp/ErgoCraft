import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Payment } from '../models/Payment.js';
import { Setting } from '../models/Setting.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { paymentService } from '../services/paymentService.js';
import { emailService } from '../services/emailService.js';
import { notifyConfirmedOrder, retryOrderNotification } from '../services/orderNotificationService.js';
import { config } from '../config/env.js';

// Helper to generate unique order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `EC-${dateStr}-${randomStr}`;
};

export const createPendingOrder = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, 'Authentication required: You must be logged in to place an order.');
  }

  const { items, customerDetails, shippingAddress, paymentMethod = 'razorpay' } = req.body;
  const idempotencyKey = req.get('Idempotency-Key')?.trim();
  if (idempotencyKey && idempotencyKey.length > 120) throw new ApiError(400, 'Invalid checkout request key');
  if (idempotencyKey) {
    const previousOrder = await Order.findOne({ customer: req.user._id, idempotencyKey });
    if (previousOrder) {
      if (previousOrder.paymentDetails?.provider === 'cod') {
        return res.status(200).json(new ApiResponse(200, { orderId: previousOrder._id, orderNumber: previousOrder.orderNumber, paymentMethod: 'cod', pricing: previousOrder.pricing, order: previousOrder }, 'Existing order returned'));
      }
      const payment = await Payment.findOne({ order: previousOrder._id });
      if (payment?.razorpayOrderId) {
        return res.status(200).json(new ApiResponse(200, { orderId: previousOrder._id, orderNumber: previousOrder.orderNumber, paymentMethod: 'razorpay', razorpayOrderId: payment.razorpayOrderId, amount: Math.round(payment.amount * 100), currency: payment.currency, key: process.env.RAZORPAY_KEY_ID || '', pricing: previousOrder.pricing }, 'Existing payment order returned'));
      }
      throw new ApiError(409, 'A checkout with this request key is still being prepared. Retry shortly.');
    }
  }

  if (!items || !items.length) {
    throw new ApiError(400, 'Order must contain at least one item');
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
    throw new ApiError(400, 'Please provide a valid shipping address (street, city, state, postal code)');
  }

  // Bind to authenticated user identity
  const resolvedCustomerDetails = {
    name: customerDetails?.name?.trim() || req.user.name,
    email: req.user.email, // Bound to authenticated account
    phone: customerDetails?.phone?.trim() || req.user.phone || '',
  };

  // Strictly revalidate every item, price, and stock against MongoDB
  let calculatedSubtotal = 0;
  const validatedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || product.status !== 'published') {
      throw new ApiError(400, `Product "${item.name || item.productId}" is unavailable or discontinued`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient inventory for "${product.name}". Only ${product.stock} units available.`
      );
    }

    const itemSubtotal = product.sellingPrice * item.quantity;
    calculatedSubtotal += itemSubtotal;

    const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];

    validatedItems.push({
      product: product._id,
      name: product.name,
      sku: product.sku,
      image: primaryImg?.url || '',
      unitPrice: product.sellingPrice,
      mrp: product.mrp,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  // Shipping policy: 100% Free Pan-India Delivery on all orders (₹0)
  const shippingCharges = 0;
  const tax = 0; // Prices are all-inclusive of GST
  const discount = 0;
  const finalTotal = calculatedSubtotal + shippingCharges + tax - discount;

  const orderNumber = generateOrderNumber();

  // Handle Cash on Delivery (COD)
  if (paymentMethod === 'cod') {
    const setting = await Setting.findOne({ key: 'store_settings' });
    const isCodEnabled = setting ? setting.codEnabled : true;
    if (!isCodEnabled) {
      throw new ApiError(400, 'Cash on Delivery (COD) is currently disabled by store administration.');
    }

    // Atomically decrement stock
    for (const item of validatedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!updatedProduct) {
        throw new ApiError(
          400,
          `Insufficient stock available for "${item.name}". Please adjust quantity.`
        );
      }
    }

    // Save Confirmed COD Order
    const order = await Order.create({
      idempotencyKey,
      orderNumber,
      customer: req.user._id,
      customerDetails: resolvedCustomerDetails,
      shippingAddress,
      items: validatedItems,
      pricing: {
        subtotal: calculatedSubtotal,
        shippingCharges,
        tax,
        discount,
        total: finalTotal,
      },
      paymentStatus: 'pending',
      fulfilmentStatus: 'processing',
      paymentDetails: {
        provider: 'cod',
      },
      statusHistory: [
        {
          status: 'Order Placed (Cash on Delivery)',
          timestamp: new Date(),
          updatedBy: req.user.email,
          note: 'Customer selected Cash on Delivery. Payment due upon arrival.',
        },
      ],
    });

    // Record initial Payment
    await Payment.create({
      order: order._id,
      orderNumber: order.orderNumber,
      provider: 'cod',
      amount: finalTotal,
      currency: 'INR',
      status: 'pending',
      metadata: {
        paymentMethod: 'Cash on Delivery',
        collectedAtDelivery: true,
      },
    });

    void notifyConfirmedOrder(order._id);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          orderId: order._id,
          orderNumber: order.orderNumber,
          paymentMethod: 'cod',
          pricing: order.pricing,
          order,
        },
        'Cash on Delivery order placed successfully'
      )
    );
  }

  // Handle Online Payment via Razorpay
  const razorpayOrder = await paymentService.createOrder({
    amount: finalTotal,
    receipt: orderNumber,
    notes: {
      customerName: resolvedCustomerDetails.name,
      customerEmail: resolvedCustomerDetails.email,
    },
  });

  // Save Pending Order bound to authenticated user
  const order = await Order.create({
    idempotencyKey,
    orderNumber,
    customer: req.user._id,
    customerDetails: resolvedCustomerDetails,
    shippingAddress,
    items: validatedItems,
    pricing: {
      subtotal: calculatedSubtotal,
      shippingCharges,
      tax,
      discount,
      total: finalTotal,
    },
    paymentStatus: 'pending',
    fulfilmentStatus: 'processing',
    paymentDetails: {
      provider: 'razorpay',
      orderId: razorpayOrder.id,
    },
    statusHistory: [
      {
        status: 'Order Placed (Payment Pending)',
        timestamp: new Date(),
        updatedBy: req.user.email,
        note: 'Order initiated via Razorpay',
      },
    ],
  });

  // Record initial Payment
  await Payment.create({
    order: order._id,
    orderNumber: order.orderNumber,
    provider: 'razorpay',
    razorpayOrderId: razorpayOrder.id,
    amount: finalTotal,
    currency: 'INR',
    status: 'created',
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        orderId: order._id,
        orderNumber: order.orderNumber,
        paymentMethod: 'razorpay',
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID || '',
        pricing: order.pricing,
      },
      'Order initiated successfully'
    )
  );
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Authorization check: User must own the order or be an administrator
  if (req.user.role !== 'admin' && order.customer?.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Forbidden: You are not authorized to verify payment for this order.');
  }

  if (order.paymentStatus === 'paid') {
    return res.status(200).json(new ApiResponse(200, { order }, 'Order is already marked as paid'));
  }

  if (!razorpay_order_id || order.paymentDetails?.orderId !== razorpay_order_id) {
    throw new ApiError(400, 'Payment reference does not match this order');
  }
  const paymentRecord = await Payment.findOne({ razorpayOrderId: razorpay_order_id, order: order._id });
  if (!paymentRecord || paymentRecord.amount !== order.pricing.total || paymentRecord.currency !== 'INR') {
    throw new ApiError(400, 'Payment amount, currency, or order reference is invalid');
  }
  if (paymentRecord.razorpayPaymentId && paymentRecord.razorpayPaymentId !== razorpay_payment_id) {
    throw new ApiError(409, 'A different Razorpay payment is already recorded for this order');
  }

  // Verify HMAC-SHA256 signature
  const isValid = paymentService.verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!isValid) {
    order.paymentStatus = 'failed';
    order.statusHistory.push({
      status: 'Payment Verification Failed',
      timestamp: new Date(),
      updatedBy: req.user.email || 'System',
      note: 'HMAC signature mismatch',
    });
    await order.save();
    throw new ApiError(400, 'Invalid payment signature. Verification failed.');
  }

  if (config.env !== 'test') {
    const gatewayPayment = await paymentService.fetchPayment(razorpay_payment_id);
    if (gatewayPayment.order_id !== razorpay_order_id || gatewayPayment.amount !== Math.round(order.pricing.total * 100) || gatewayPayment.currency !== 'INR') {
      throw new ApiError(400, 'Razorpay payment details do not match this order');
    }
    if (gatewayPayment.status !== 'captured') {
      throw new ApiError(409, `Razorpay payment is ${gatewayPayment.status}; the order remains unpaid until capture`);
    }
  }

  const updatedPayment = await Payment.findOneAndUpdate(
    { _id: paymentRecord._id, status: { $in: ['created', 'authorized', 'failed', 'captured'] } },
    { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'captured' },
    { new: true }
  );
  if (!updatedPayment) throw new ApiError(409, 'The payment record changed during verification; retry the order status check.');

  // Claim the unpaid-to-paid transition atomically so a webhook and browser
  // callback cannot both apply inventory changes for the same payment.
  const paidOrder = await Order.findOneAndUpdate(
    { _id: order._id, paymentStatus: { $ne: 'paid' }, 'paymentDetails.orderId': razorpay_order_id },
    {
      $set: {
        paymentStatus: 'paid',
        'paymentDetails.provider': 'razorpay',
        'paymentDetails.paymentId': razorpay_payment_id,
        'paymentDetails.signature': razorpay_signature,
      },
      $push: {
        statusHistory: {
          status: 'Payment Received & Verified',
          timestamp: new Date(),
          updatedBy: 'Razorpay Verification',
          note: `Transaction ID: ${razorpay_payment_id}`,
        },
      },
    },
    { new: true }
  );
  if (!paidOrder) {
    const latestOrder = await Order.findById(order._id);
    if (latestOrder?.paymentStatus === 'paid') {
      return res.status(200).json(new ApiResponse(200, { order: latestOrder }, 'Order is already marked as paid'));
    }
    throw new ApiError(409, 'Order payment state changed during verification; refresh the order and retry.');
  }

  // Atomically decrement stock
  for (const item of paidOrder.items) {
    const updatedProduct = await Product.findOneAndUpdate({ _id: item.product, stock: { $gte: item.quantity } }, {
      $inc: { stock: -item.quantity },
    });
    if (!updatedProduct) console.error(`[Payment] Captured order ${paidOrder.orderNumber} needs stock review for product ${item.product}.`);
  }

  void notifyConfirmedOrder(paidOrder._id);

  res.status(200).json(new ApiResponse(200, { order: paidOrder }, 'Payment verified successfully'));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { orders }, 'Orders retrieved successfully'));
});

export const getOrderDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id.toUpperCase() }],
  }).populate('items.product', 'name slug images');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Enforce customer ownership (unless admin)
  if (req.user.role !== 'admin') {
    if (!order.customer || order.customer.toString() !== req.user._id.toString()) {
      throw new ApiError(403, 'You are not authorized to view this order');
    }
  }

  res.status(200).json(new ApiResponse(200, { order }, 'Order retrieved successfully'));
});

export const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  const { q, paymentStatus, fulfilmentStatus, page = 1, limit = 20 } = req.query;

  const query = {};
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    query.$or = [
      { orderNumber: searchRegex },
      { 'customerDetails.name': searchRegex },
      { 'customerDetails.email': searchRegex },
    ];
  }
  if (paymentStatus) query.paymentStatus = paymentStatus;
  if (fulfilmentStatus) query.fulfilmentStatus = fulfilmentStatus;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [orders, totalCount] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Order.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        orders,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          currentPage: pageNum,
          limit: limitNum,
        },
      },
      'Admin orders retrieved'
    )
  );
});

export const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fulfilmentStatus, paymentStatus, courier, trackingNumber, trackingUrl, note } = req.body;

  const order = await Order.findById(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const previousFulfilment = order.fulfilmentStatus;
  const isCod = order.paymentDetails?.provider === 'cod';

  if (paymentStatus && paymentStatus !== order.paymentStatus) {
    if (!isCod) throw new ApiError(400, 'Online payment status is controlled by verified Razorpay callbacks.');
    if (!['pending', 'paid'].includes(paymentStatus)) throw new ApiError(400, 'COD payment can only remain pending or be marked paid after collection.');
  }

  // Validate state transitions: Online orders must be confirmed paid prior to dispatch or delivery
  if (!isCod && fulfilmentStatus && ['shipped', 'delivered'].includes(fulfilmentStatus)) {
    const targetPaymentStatus = paymentStatus || order.paymentStatus;
    if (targetPaymentStatus !== 'paid') {
      throw new ApiError(
        400,
        `Cannot transition fulfilment to '${fulfilmentStatus}' while payment status is '${targetPaymentStatus}'. Online orders must be confirmed paid prior to dispatch or delivery.`
      );
    }
  }

  if (fulfilmentStatus) order.fulfilmentStatus = fulfilmentStatus;
  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    // If COD order was received and paid, mark Payment as captured
    if (isCod && paymentStatus === 'paid') {
      const capturedPayment = await Payment.findOneAndUpdate(
        { order: order._id, provider: 'cod' },
        { status: 'captured' },
        { new: true }
      );
      if (!capturedPayment) throw new ApiError(500, 'COD order was not updated because its payment record is missing');
    }
  }

  if (courier !== undefined) order.tracking.courier = courier;
  if (trackingNumber !== undefined) order.tracking.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) order.tracking.trackingUrl = trackingUrl;

  order.statusHistory.push({
    status: `Fulfilment: ${order.fulfilmentStatus} | Payment: ${order.paymentStatus}`,
    timestamp: new Date(),
    updatedBy: req.user.email,
    note: note || `Updated by admin (${req.user.name})`,
  });

  const savedOrder = await order.save();
  if (!savedOrder) throw new ApiError(500, 'Order status update was not saved');

  // Send shipping notification if transitioned to 'shipped'
  if (fulfilmentStatus === 'shipped' && previousFulfilment !== 'shipped') {
    order.notifications.customerShipping.status = 'pending';
    await order.save();
    void retryOrderNotification(order._id, 'shipping');
  }

  const persistedOrder = await Order.findById(order._id);
  res.status(200).json(new ApiResponse(200, { order: persistedOrder }, 'Order status updated successfully'));
});

export const getDashboardStatsAdmin = asyncHandler(async (req, res) => {
  const [totalOrders, paidOrders, pendingOrders, totalProducts, lowStockProducts, revenueResult] =
    await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentStatus: 'paid' }),
      Order.countDocuments({ paymentStatus: 'pending' }),
      Product.countDocuments({ status: 'published' }),
      Product.countDocuments({ stock: { $lte: 3 }, status: 'published' }),
      Order.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$pricing.total' } } },
      ]),
    ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  // Recent 5 orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalOrders,
        paidOrders,
        pendingOrders,
        totalProducts,
        lowStockProducts,
        totalRevenue,
        recentOrders,
      },
      'Dashboard stats retrieved'
    )
  );
});

export const sendAdminTestEmail = asyncHandler(async (req, res) => {
  const to = String(req.body?.to || '').trim();
  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    throw new ApiError(400, 'Provide a valid recipient email in the "to" field');
  }
  const result = await emailService.sendEmail({
    to,
    subject: 'Ergocraft Brevo delivery test',
    textContent: 'This is a test email from the Ergocraft transactional email service.',
    htmlContent: '<p>This is a test email from the Ergocraft transactional email service.</p>',
  });
  if (!result.success) return res.status(result.statusCode || 502).json({ success: false, message: 'Brevo rejected or could not send the test email', brevo: result });
  res.status(200).json({ success: true, message: 'Brevo accepted the test email', brevo: result });
});

export const retryOrderEmailAdmin = asyncHandler(async (req, res) => {
  const { id, type } = req.params;
  if (!['customer', 'owner', 'shipping'].includes(type)) throw new ApiError(400, 'Unknown notification type');
  const result = await retryOrderNotification(id, type);
  if (result.status === 'missing') throw new ApiError(404, 'Order not found');
  if (result.status === 'accepted') return res.status(200).json(new ApiResponse(200, { notification: result }, 'Brevo accepted the notification'));
  if (result.skipped) return res.status(409).json(new ApiResponse(409, { notification: result }, 'Notification was already accepted or is not retryable'));
  return res.status(result.status === 'not_confirmed' || result.status === 'not_ready' ? 409 : 502)
    .json(new ApiResponse(result.status === 'not_confirmed' || result.status === 'not_ready' ? 409 : 502, { notification: result }, result.reason || 'Notification retry failed'));
});
