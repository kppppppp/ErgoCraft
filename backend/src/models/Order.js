import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, default: '' },
    unitPrice: { type: Number, required: true },
    mrp: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    updatedBy: { type: String, default: 'System' },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema({
  status: { type: String, enum: ['pending', 'sending', 'accepted', 'failed'], default: 'pending' },
  attempts: { type: Number, default: 0 },
  messageId: { type: String, default: '' },
  lastError: { type: String, default: '' },
  lastAttemptAt: Date,
  sendingAt: Date,
  acceptedAt: Date,
}, { _id: false });

const orderSchema = new mongoose.Schema(
  {
    idempotencyKey: { type: String, default: undefined },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },
    shippingAddress: {
      street: { type: String, required: true },
      landmark: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: 'India' },
    },
    items: [orderItemSchema],
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingCharges: { type: Number, required: true, default: 0, min: 0 },
      tax: { type: Number, required: true, default: 0, min: 0 },
      discount: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    fulfilmentStatus: {
      type: String,
      enum: ['processing', 'packed', 'shipped', 'delivered', 'cancelled'],
      default: 'processing',
    },
    paymentDetails: {
      provider: { type: String, default: 'razorpay' },
      orderId: { type: String },
      paymentId: { type: String },
      signature: { type: String },
    },
    tracking: {
      courier: { type: String, default: '' },
      trackingNumber: { type: String, default: '' },
      trackingUrl: { type: String, default: '' },
    },
    statusHistory: [statusHistorySchema],
    notifications: {
      customerOrder: { type: notificationSchema, default: () => ({}) },
      ownerOrder: { type: notificationSchema, default: () => ({}) },
      customerShipping: { type: notificationSchema, default: () => ({}) },
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index(
  { customer: 1, idempotencyKey: 1 },
  { unique: true, partialFilterExpression: { idempotencyKey: { $type: 'string' } } }
);
orderSchema.index({ paymentStatus: 1, fulfilmentStatus: 1 });

export const Order = mongoose.model('Order', orderSchema);
