import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { cloudinaryService } from '../services/cloudinaryService.js';

/**
 * Helper to recursively find all descendant category IDs for a given category
 */
async function getAllCategoryDescendantIds(categoryId) {
  const descendantIds = [];
  const queue = [categoryId];
  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await Category.find({ parent: currentId }).select('_id');
    for (const child of children) {
      descendantIds.push(child._id);
      queue.push(child._id);
    }
  }
  return descendantIds;
}

export const getProducts = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    subcategory,
    classification,
    material,
    backrestHeight,
    colour,
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

  // Hierarchy Category filter (includes all descendant categories)
  if (category) {
    let catDoc = null;
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      catDoc = await Category.findById(category);
    } else {
      catDoc = await Category.findOne({ slug: category });
    }

    if (catDoc) {
      const descendantIds = await getAllCategoryDescendantIds(catDoc._id);
      const allMatchingIds = [catDoc._id, ...descendantIds];
      query.$or = [
        { categories: { $in: allMatchingIds } },
        { category: { $in: allMatchingIds } },
        { subcategory: { $in: allMatchingIds } },
        { classification: { $in: allMatchingIds } },
      ];
    }
  }

  // Subcategory filter (Level 2 or specific)
  if (subcategory) {
    let subDoc = null;
    if (subcategory.match(/^[0-9a-fA-F]{24}$/)) {
      subDoc = await Category.findById(subcategory);
    } else {
      subDoc = await Category.findOne({ slug: subcategory });
    }

    if (subDoc) {
      const subDescendantIds = await getAllCategoryDescendantIds(subDoc._id);
      const allSubMatchingIds = [subDoc._id, ...subDescendantIds];
      query.$or = [
        { categories: { $in: allSubMatchingIds } },
        { category: { $in: allSubMatchingIds } },
        { subcategory: { $in: allSubMatchingIds } },
        { classification: { $in: allSubMatchingIds } },
      ];
    }
  }

  // Specific Classification filter (Level 3)
  if (classification) {
    let classDoc = null;
    if (classification.match(/^[0-9a-fA-F]{24}$/)) {
      classDoc = await Category.findById(classification);
    } else {
      classDoc = await Category.findOne({ slug: classification });
    }

    if (classDoc) {
      query.$or = [
        { categories: classDoc._id },
        { classification: classDoc._id },
      ];
    }
  }

  // Attribute filters
  if (material && material.trim()) {
    query['attributes.material'] = new RegExp(material.trim(), 'i');
  }

  if (backrestHeight && backrestHeight.trim()) {
    query['attributes.backrestHeight'] = new RegExp(backrestHeight.trim(), 'i');
  }

  if (colour && colour.trim()) {
    query['attributes.colour'] = new RegExp(colour.trim(), 'i');
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
      .populate('classification', 'name slug')
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
      .populate('subcategory', 'name slug')
      .populate('classification', 'name slug')
      .limit(8),
    Product.find({ isFeatured: true, status: 'published' })
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('classification', 'name slug')
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
  const param = req.params.slug || req.params.id;

  const query = param.match(/^[0-9a-fA-F]{24}$/)
    ? { $or: [{ _id: param }, { slug: param }] }
    : { slug: param };

  const product = await Product.findOne(query)
    .populate('category', 'name slug parent')
    .populate('subcategory', 'name slug parent')
    .populate('classification', 'name slug parent');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Fetch 4 related products from the same category or subcategory
  const relatedFilter = {
    _id: { $ne: product._id },
    status: 'published',
  };

  if (product.subcategory) {
    relatedFilter.categories = product.subcategory._id;
  } else if (product.category) {
    relatedFilter.categories = product.category._id;
  }

  const relatedProducts = await Product.find(relatedFilter)
    .populate('category', 'name slug parent')
    .populate('subcategory', 'name slug parent')
    .populate('classification', 'name slug parent')
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

  if (category) {
    if (category.match(/^[0-9a-fA-F]{24}$/)) {
      const descendantIds = await getAllCategoryDescendantIds(category);
      query.categories = { $in: [category, ...descendantIds] };
    } else {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        const descendantIds = await getAllCategoryDescendantIds(catDoc._id);
        query.categories = { $in: [catDoc._id, ...descendantIds] };
      }
    }
  }

  if (status) query.status = status;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const [products, totalCount] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('subcategory', 'name slug')
      .populate('classification', 'name slug')
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
    classification,
    description,
    shortDescription,
    specifications,
    attributes,
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

  // Validate category existence & parent relationships
  const catDoc = await Category.findById(category);
  if (!catDoc) {
    throw new ApiError(404, 'Selected primary category not found');
  }

  if (subcategory) {
    const subDoc = await Category.findById(subcategory);
    if (!subDoc) {
      throw new ApiError(404, 'Selected subcategory not found');
    }
    if (subDoc.parent && subDoc.parent.toString() !== catDoc._id.toString()) {
      throw new ApiError(400, `Subcategory '${subDoc.name}' does not belong to category '${catDoc.name}'`);
    }
  }

  if (classification) {
    const classDoc = await Category.findById(classification);
    if (!classDoc) {
      throw new ApiError(404, 'Selected classification not found');
    }
    if (subcategory && classDoc.parent && classDoc.parent.toString() !== subcategory.toString()) {
      throw new ApiError(400, `Classification '${classDoc.name}' does not belong to the selected subcategory`);
    }
  }

  const product = await Product.create({
    name,
    slug: generatedSlug,
    sku: sku.toUpperCase(),
    category,
    subcategory: subcategory || null,
    classification: classification || null,
    description,
    shortDescription,
    specifications: specifications || [],
    attributes: attributes || {},
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
  if (updates.slug && updates.slug.trim().toLowerCase() !== product.slug) {
    const cleanSlug = updates.slug.trim().toLowerCase();
    const existingSlug = await Product.findOne({ slug: cleanSlug, _id: { $ne: product._id } });
    if (existingSlug) {
      throw new ApiError(409, `Product with slug '${cleanSlug}' already exists`);
    }
    product.slug = cleanSlug;
  }

  // Validate SKU uniqueness if changed
  if (updates.sku && updates.sku.trim().toUpperCase() !== product.sku) {
    const cleanSku = updates.sku.trim().toUpperCase();
    const existingSku = await Product.findOne({ sku: cleanSku, _id: { $ne: product._id } });
    if (existingSku) {
      throw new ApiError(409, `Product with SKU '${cleanSku}' already exists`);
    }
    product.sku = cleanSku;
  }

  // Validate pricing rule
  const nextMrp = updates.mrp !== undefined && updates.mrp !== '' ? Number(updates.mrp) : product.mrp;
  const nextSellingPrice =
    updates.sellingPrice !== undefined && updates.sellingPrice !== ''
      ? Number(updates.sellingPrice)
      : product.sellingPrice;

  if (nextSellingPrice > nextMrp) {
    throw new ApiError(400, 'Selling price cannot exceed MRP');
  }
  product.mrp = nextMrp;
  product.sellingPrice = nextSellingPrice;

  // Validate category existence & parent relationships
  const targetCategory = updates.category !== undefined ? updates.category : product.category;
  const targetSubcategory = updates.subcategory !== undefined ? updates.subcategory : product.subcategory;
  const targetClassification =
    updates.classification !== undefined ? updates.classification : product.classification;

  let catDoc = null;
  if (targetCategory) {
    catDoc = await Category.findById(targetCategory);
    if (!catDoc) {
      throw new ApiError(404, 'Selected primary category not found');
    }
    product.category = catDoc._id;
  }

  if (targetSubcategory) {
    const subDoc = await Category.findById(targetSubcategory);
    if (!subDoc) {
      throw new ApiError(404, 'Selected subcategory not found');
    }
    if (subDoc.parent && catDoc && subDoc.parent.toString() !== catDoc._id.toString()) {
      throw new ApiError(400, `Subcategory '${subDoc.name}' does not belong to category '${catDoc.name}'`);
    }
    product.subcategory = subDoc._id;
  } else if (updates.subcategory === null || updates.subcategory === '') {
    product.subcategory = null;
  }

  if (targetClassification) {
    const classDoc = await Category.findById(targetClassification);
    if (!classDoc) {
      throw new ApiError(404, 'Selected classification not found');
    }
    if (targetSubcategory && classDoc.parent && classDoc.parent.toString() !== targetSubcategory.toString()) {
      throw new ApiError(400, `Classification '${classDoc.name}' does not belong to the selected subcategory`);
    }
    product.classification = classDoc._id;
  } else if (updates.classification === null || updates.classification === '') {
    product.classification = null;
  }

  // Update text & scalar fields safely
  if (updates.name !== undefined) product.name = updates.name.trim();
  if (updates.shortDescription !== undefined) product.shortDescription = updates.shortDescription.trim();
  if (updates.description !== undefined) product.description = updates.description.trim();
  if (updates.warranty !== undefined) product.warranty = updates.warranty.trim();
  if (updates.stock !== undefined && updates.stock !== '') product.stock = Math.max(0, Number(updates.stock));
  if (updates.isBestseller !== undefined) product.isBestseller = Boolean(updates.isBestseller);
  if (updates.isFeatured !== undefined) product.isFeatured = Boolean(updates.isFeatured);
  if (updates.status !== undefined) product.status = updates.status;

  if (updates.attributes && typeof updates.attributes === 'object') {
    product.attributes = {
      material: updates.attributes.material !== undefined ? updates.attributes.material : (product.attributes?.material || ''),
      backrestHeight: updates.attributes.backrestHeight !== undefined ? updates.attributes.backrestHeight : (product.attributes?.backrestHeight || ''),
      colour: updates.attributes.colour !== undefined ? updates.attributes.colour : (product.attributes?.colour || ''),
      armrests: updates.attributes.armrests !== undefined ? updates.attributes.armrests : (product.attributes?.armrests || ''),
      mechanism: updates.attributes.mechanism !== undefined ? updates.attributes.mechanism : (product.attributes?.mechanism || ''),
      weightCapacity: updates.attributes.weightCapacity !== undefined ? updates.attributes.weightCapacity : (product.attributes?.weightCapacity || ''),
      upholstery: updates.attributes.upholstery !== undefined ? updates.attributes.upholstery : (product.attributes?.upholstery || ''),
      dimensions: updates.attributes.dimensions !== undefined ? updates.attributes.dimensions : (product.attributes?.dimensions || ''),
    };
  }

  if (Array.isArray(updates.images)) {
    product.images = updates.images;
  }

  if (Array.isArray(updates.specifications)) {
    product.specifications = updates.specifications.filter((s) => s.key && s.value);
  }

  // Synchronize categories array
  const rawCatChain = [product.category, product.subcategory, product.classification].filter(Boolean);
  const seenIds = new Set();
  const uniqueChain = [];
  for (const cId of rawCatChain) {
    const str = cId.toString();
    if (!seenIds.has(str)) {
      seenIds.add(str);
      uniqueChain.push(cId);
    }
  }
  product.categories = uniqueChain;

  // Calculate discount percentage
  if (product.mrp > 0 && product.sellingPrice > 0) {
    product.discountPercentage = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);
  } else {
    product.discountPercentage = 0;
  }

  await product.save();

  const populatedProduct = await Product.findById(product._id)
    .populate('category', 'name slug parent')
    .populate('subcategory', 'name slug parent')
    .populate('classification', 'name slug parent');

  res.status(200).json(new ApiResponse(200, { product: populatedProduct }, 'Product updated successfully'));
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
