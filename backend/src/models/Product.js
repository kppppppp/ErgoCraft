import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    altText: { type: String, default: '' },
    isPrimary: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      required: [true, 'Please provide product slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide product SKU'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    shortDescription: {
      type: String,
      trim: true,
    },
    specifications: [specificationSchema],
    mrp: {
      type: Number,
      required: [true, 'Please provide MRP'],
      min: [0, 'MRP must be positive'],
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Please provide selling price'],
      min: [0, 'Selling price must be positive'],
      validate: {
        validator: function (val) {
          return val <= this.mrp;
        },
        message: 'Selling price cannot exceed MRP ({VALUE} > {this.mrp})',
      },
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      default: 10,
      min: [0, 'Stock cannot be negative'],
    },
    isBestseller: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
    },
    warranty: {
      type: String,
      default: '3 Years Manufacturer Warranty',
    },
    shippingDetails: {
      estimatedDays: { type: Number, default: 5 },
      freeShipping: { type: Boolean, default: true },
      shippingCharge: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Calculate discount percentage before saving
productSchema.pre('save', function (next) {
  if (this.mrp > 0 && this.sellingPrice > 0) {
    this.discountPercentage = Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
  } else {
    this.discountPercentage = 0;
  }
  next();
});

// Indexes for fast searching, filtering, and sorting
productSchema.index({ category: 1, subcategory: 1, status: 1 });
productSchema.index({ isBestseller: 1, isFeatured: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

export const Product = mongoose.model('Product', productSchema);
