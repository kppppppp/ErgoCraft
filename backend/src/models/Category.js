import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide category name'],
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: [true, 'Please provide category slug'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showInNavbar: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for subcategories / children
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

// Virtual parentId alias for parent
categorySchema.virtual('parentId')
  .get(function () {
    return this.parent;
  })
  .set(function (val) {
    this.parent = val;
  });

categorySchema.index({ parent: 1, sortOrder: 1 });
categorySchema.index({ isActive: 1, showInNavbar: 1 });

export const Category = mongoose.model('Category', categorySchema);
