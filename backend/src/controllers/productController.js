import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cloudinaryService } from '../services/cloudinaryService.js';

export const getProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    subcategory,
    minPrice,
    maxPrice,
    isBestseller,
    isFeatured,
    inStock,
    sort = 'newest',
    page = 1,
    limit = 12,
  } = req.query;

  const query = { status: 'published' };

  // Text search
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    query.$or = [{ name: searchRegex }, { description: searchRegex }, { sku: searchRegex }];
  }

  // Category filter
  if (category) {
    // If slug provided, find category ID
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      query.category = category;
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        // Also include subcategories of this parent
        const subCats = await Category.find({ parent: catDoc._id });
        const catIds = [catDoc._id, ...subCats.map((s) => s._id)];
        query.category = { $in: catIds };
      }
    }
  }

  // Subcategory filter
  if (subcategory) {
    if (subcategory.match(/^[0-9a-fA-F]{24}$/)) {
      query.subcategory = subcategory;
    } else {
      const subDoc = await Category.findOne({ slug: subcategory });
      if (subDoc) query.subcategory = subDoc._id;
    }
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    query.sellingPrice = {};
    if (minPrice !== undefined && !isNaN(Number(minPrice))) {
      query.sellingPrice.$gte = Number(minPrice);
    }
    if (maxPrice !== undefined && !isNaN(Number(maxPrice))) {
      query.sellingPrice.$lte = Number(maxPrice);
    }
  }

  // Bestseller / Featured flags
  if (isBestseller === 'true' || isBestseller === true) {
    query.isBestseller = true;
  }
  if (isFeatured === 'true' || isFeatured === true) {
    query.isFeatured = true;
  }

  // In-stock filter
  if (inStock === 'true' || inStock === true) {
    query.stock = { $gt: 0 };
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'price_asc') sortOption = { sellingPrice: 1 };
  if (sort === 'price_desc') sortOption = { sellingPrice: -1 };
  if (sort === 'discount') sortOption = { discountPercentage: -1 };
  if (sort === 'popular') sortOption = { isBestseller: -1, isFeatured: -1, createdAt: -1 };

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, totalCount] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          currentPage: pageNum,
          limit: limitNum,
        },
      },
      'Products retrieved successfully'
    )
  );
});

export const getFeaturedAndBestsellers = asyncHandler(async (req, res) => {
  const [bestsellers, featured] = await Promise.all([
    Product.find({ isBestseller: true, status: 'published' })
      .populate('category', 'name slug')
      .limit(8),
    Product.find({ isFeatured: true, status: 'published' })
      .populate('category', 'name slug')
      .limit(8),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { bestsellers, featured },
      'Featured and bestseller products retrieved'
    )
  );
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.findOne({ slug, status: { $ne: 'archived' } })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Fetch 4 related products from the same category
  const relatedProducts = await Product.find({
    category: product.category?._id,
    _id: { $ne: product._id },
    status: 'published',
  })
    .populate('category', 'name slug')
    .limit(4);

  res.status(200).json(
    new ApiResponse(200, { product, relatedProducts }, 'Product details retrieved successfully')
  );
});

export const getAllProductsAdmin = asyncHandler(async (req, res) => {
  const { q, category, status, page = 1, limit = 20 } = req.query;

  const query = {};
  if (q && q.trim()) {
    const searchRegex = new RegExp(q.trim(), 'i');
    query.$or = [{ name: searchRegex }, { sku: searchRegex }];
  }
  if (category) query.category = category;
  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, totalCount] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        products,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limitNum),
          currentPage: pageNum,
          limit: limitNum,
        },
      },
      'Admin products list retrieved'
    )
  );
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    slug,
    sku,
    category,
    subcategory,
    description,
    shortDescription,
    specifications,
    mrp,
    sellingPrice,
    images,
    stock,
    isBestseller,
    isFeatured,
    status,
    warranty,
    shippingDetails,
  } = req.body;

  const generatedSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const existingSlug = await Product.findOne({ slug: generatedSlug });
  if (existingSlug) {
    throw new ApiError(409, `Product with slug '${generatedSlug}' already exists`);
  }

  const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
  if (existingSku) {
    throw new ApiError(409, `Product with SKU '${sku.toUpperCase()}' already exists`);
  }

  if (Number(sellingPrice) > Number(mrp)) {
    throw new ApiError(400, 'Selling price cannot exceed MRP');
  }

  const product = await Product.create({
    name,
    slug: generatedSlug,
    sku: sku.toUpperCase(),
    category,
    subcategory: subcategory || null,
    description,
    shortDescription,
    specifications: specifications || [],
    mrp: Number(mrp),
    sellingPrice: Number(sellingPrice),
    images: images || [],
    stock: stock !== undefined ? Number(stock) : 10,
    isBestseller: Boolean(isBestseller),
    isFeatured: Boolean(isFeatured),
    status: status || 'published',
    warranty: warranty || '3 Years Manufacturer Warranty',
    shippingDetails: shippingDetails || { estimatedDays: 5, freeShipping: true },
  });

  res.status(201).json(new ApiResponse(201, { product }, 'Product created successfully'));
});

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Validate slug uniqueness if changed
  if (updates.slug && updates.slug !== product.slug) {
    const existingSlug = await Product.findOne({ slug: updates.slug });
    if (existingSlug) {
      throw new ApiError(409, `Product with slug '${updates.slug}' already exists`);
    }
  }

  // Validate SKU uniqueness if changed
  if (updates.sku && updates.sku.toUpperCase() !== product.sku) {
    const existingSku = await Product.findOne({ sku: updates.sku.toUpperCase() });
    if (existingSku) {
      throw new ApiError(409, `Product with SKU '${updates.sku.toUpperCase()}' already exists`);
    }
    updates.sku = updates.sku.toUpperCase();
  }

  // Validate pricing rule
  const nextMrp = updates.mrp !== undefined ? Number(updates.mrp) : product.mrp;
  const nextSellingPrice =
    updates.sellingPrice !== undefined ? Number(updates.sellingPrice) : product.sellingPrice;

  if (nextSellingPrice > nextMrp) {
    throw new ApiError(400, 'Selling price cannot exceed MRP');
  }

  // Apply updates
  Object.assign(product, updates);
  await product.save();

  res.status(200).json(new ApiResponse(200, { product }, 'Product updated successfully'));
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Clean up any Cloudinary hosted images
  if (product.images && product.images.length > 0) {
    for (const img of product.images) {
      if (img.publicId) {
        await cloudinaryService.deleteImage(img.publicId);
      }
    }
  }

  await Product.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, null, 'Product deleted successfully'));
});
