import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    provider: {
      type: String,
      default: 'razorpay',
    },
    razorpayOrderId: {
      type: String,
      required: function () {
        return this.provider === 'razorpay';
      },
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed', 'refunded', 'pending'],
      default: 'created',
    },
    inventoryApplied: { type: Boolean, default: false },
    webhookEvents: [
      {
        eventId: String,
        event: String,
        receivedAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ order: 1 });

export const Payment = mongoose.model('Payment', paymentSchema);
