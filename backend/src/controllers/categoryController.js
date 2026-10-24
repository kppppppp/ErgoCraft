import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCategories = asyncHandler(async (req, res) => {
  // Return top-level categories with subcategories populated
  const categories = await Category.find({ parent: null, isActive: true })
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      options: { sort: { sortOrder: 1, name: 1 } },
    })
    .sort({ sortOrder: 1, name: 1 });

  res.status(200).json(new ApiResponse(200, { categories }, 'Categories retrieved successfully'));
});

export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate('parent', 'name slug')
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, { categories }, 'All categories retrieved for admin'));
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true }).populate('subcategories');

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(new ApiResponse(200, { category }, 'Category retrieved successfully'));
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, parent, description, image, sortOrder, isActive } = req.body;

  const generatedSlug =
    slug ||
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const existing = await Category.findOne({ slug: generatedSlug });
  if (existing) {
    throw new ApiError(409, 'Category with this slug already exists');
  }

  const category = await Category.create({
    name,
    slug: generatedSlug,
    parent: parent || null,
    description,
    image,
    sortOrder: sortOrder || 0,
    isActive: isActive !== undefined ? isActive : true,
  });

  res.status(201).json(new ApiResponse(201, { category }, 'Category created successfully'));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, parent, description, image, sortOrder, isActive } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (slug && slug !== category.slug) {
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new ApiError(409, 'Category with this slug already exists');
    }
    category.slug = slug;
  }

  if (name) category.name = name;
  if (parent !== undefined) category.parent = parent || null;
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (sortOrder !== undefined) category.sortOrder = sortOrder;
  if (isActive !== undefined) category.isActive = isActive;

  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category updated successfully'));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const productCount = await Product.countDocuments({
    $or: [{ category: id }, { subcategory: id }],
  });

  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete category. There are ${productCount} products associated with it. Please reassign or delete them first.`
    );
  }

  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  res.status(200).json(new ApiResponse(200, null, 'Category deleted successfully'));
});
