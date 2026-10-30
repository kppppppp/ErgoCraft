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

const productAttributesSchema = new mongoose.Schema(
  {
    material: { type: String, trim: true, default: '' },
    backrestHeight: { type: String, trim: true, default: '' },
    colour: { type: String, trim: true, default: '' },
    armrests: { type: String, trim: true, default: '' },
    mechanism: { type: String, trim: true, default: '' },
    weightCapacity: { type: String, trim: true, default: '' },
    upholstery: { type: String, trim: true, default: '' },
    dimensions: { type: String, trim: true, default: '' },
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
    // Level 1: Main category (Office Chairs, Sofas, Soft Seating, etc.)
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category'],
    },
    // Level 2: Child category / product family / material (Leatherette Chairs, Mesh Chairs, 3-Seater Sofa, etc.)
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    // Level 3: Specific product classification (High Back, Medium Back, Cushion, Workstation, Staff, etc.)
    classification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    // All categories in the product hierarchy path for fast, indexed ancestor/descendant lookups
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
    },
    specifications: [specificationSchema],
    attributes: {
      type: productAttributesSchema,
      default: () => ({}),
    },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate discount percentage and sync categories array before saving
productSchema.pre('save', function (next) {
  if (this.mrp > 0 && this.sellingPrice > 0) {
    this.discountPercentage = Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
  } else {
    this.discountPercentage = 0;
  }

  // Sync categories array to contain all distinct category IDs in the hierarchy
  const rawCatIds = [this.category, this.subcategory, this.classification].filter(Boolean);
  const uniqueIds = [];
  const seen = new Set();
  for (const id of rawCatIds) {
    const idStr = id.toString();
    if (!seen.has(idStr)) {
      seen.add(idStr);
      uniqueIds.push(id);
    }
  }
  this.categories = uniqueIds;

  // Auto-sync backrestHeight from name or attributes if not set
  if (this.attributes && !this.attributes.backrestHeight) {
    const nameLower = (this.name || '').toLowerCase();
    if (nameLower.includes('high back') || nameLower.includes(' hb ') || nameLower.endsWith(' hb')) {
      this.attributes.backrestHeight = 'High Back';
    } else if (nameLower.includes('medium back') || nameLower.includes('mid back') || nameLower.includes(' mb ') || nameLower.endsWith(' mb')) {
      this.attributes.backrestHeight = 'Medium Back';
    } else if (nameLower.includes('low back') || nameLower.includes(' lb ') || nameLower.endsWith(' lb')) {
      this.attributes.backrestHeight = 'Low Back';
    }
  }

  next();
});

// Indexes for fast searching, filtering, and sorting
productSchema.index({ categories: 1, status: 1 });
productSchema.index({ category: 1, subcategory: 1, classification: 1, status: 1 });
productSchema.index({ isBestseller: 1, isFeatured: 1 });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ 'attributes.material': 1 });
productSchema.index({ 'attributes.backrestHeight': 1 });
productSchema.index({ 'attributes.colour': 1 });
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

export const Product = mongoose.model('Product', productSchema);
