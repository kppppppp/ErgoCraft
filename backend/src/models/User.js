import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const addressSchema = new mongoose.Schema({
  fullName: { type: String, trim: true },
  phone: { type: String, trim: true },
  houseNumber: { type: String, trim: true },
  street: { type: String, required: true },
  landmark: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'India' },
  isDefault: { type: Boolean, default: false },
});

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true }, name: { type: String, required: true },
  sku: { type: String, default: '' }, slug: { type: String, default: '' },
  sellingPrice: { type: Number, required: true }, mrp: { type: Number, default: 0 },
  image: { type: String, default: '' }, quantity: { type: Number, required: true, min: 1 },
  maxStock: { type: Number, default: 99 },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    phone: {
      type: String,
      trim: true,
    },
    addresses: [addressSchema],
    cart: { type: [cartItemSchema], default: [] },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokenVersion: { type: Number, default: 0 },
    passwordResetTokenHash: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to passwordResetTokenHash field
  this.passwordResetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes TTL

  return resetToken;
};

export const User = mongoose.model('User', userSchema);
