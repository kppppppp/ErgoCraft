import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Helper to build a recursive tree structure from a flat array of categories
 */
function buildTree(categories, parentId = null) {
  const result = [];
  const targetParentId = parentId ? parentId.toString() : null;

  for (const cat of categories) {
    let catParentId = null;
    if (cat.parent) {
      if (typeof cat.parent === 'object' && cat.parent !== null) {
        catParentId = cat.parent._id ? cat.parent._id.toString() : cat.parent.toString();
      } else {
        catParentId = cat.parent.toString();
      }
    }

    if (catParentId === targetParentId) {
      const children = buildTree(categories, cat._id);
      const catObj = cat.toObject ? cat.toObject() : { ...cat };
      catObj.children = children;
      catObj.subcategories = children; // Maintain backwards compatibility
      result.push(catObj);
    }
  }
  return result.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.name.localeCompare(b.name));
}

/**
 * Helper to check if a category is an ancestor of a given target parent ID (cycle prevention)
 */
async function wouldCreateCycle(categoryId, proposedParentId) {
  if (!proposedParentId) return false;
  if (categoryId.toString() === proposedParentId.toString()) return true;

  let current = await Category.findById(proposedParentId).select('parent');
  while (current && current.parent) {
    if (current.parent.toString() === categoryId.toString()) {
      return true;
    }
    current = await Category.findById(current.parent).select('parent');
  }
  return false;
}

/**
 * Helper to build breadcrumb ancestors list for a category
 */
async function getAncestors(categoryId) {
  const ancestors = [];
  let current = await Category.findById(categoryId).populate('parent');
  while (current && current.parent) {
    ancestors.unshift({
      _id: current.parent._id,
      name: current.parent.name,
      slug: current.parent.slug,
    });
    current = await Category.findById(current.parent._id).populate('parent');
  }
  return ancestors;
}

/**
 * Calculates product counts for each category accurately.
 * Includes both direct product assignments and descendant child category assignments
 * without double counting. Only counts active/published products (status !== 'archived').
 */
async function calculateCategoryProductCounts(categories) {
  const products = await Product.find({ status: { $ne: 'archived' } })
    .select('_id category subcategory classification categories')
    .lean();

  const childrenMap = new Map();
  for (const cat of categories) {
    const pId = cat.parent
      ? typeof cat.parent === 'object' && cat.parent !== null
        ? cat.parent._id
          ? cat.parent._id.toString()
          : cat.parent.toString()
        : cat.parent.toString()
      : null;
    if (pId) {
      if (!childrenMap.has(pId)) childrenMap.set(pId, []);
      childrenMap.get(pId).push(cat._id.toString());
    }
  }

  const getDescendantIds = (catIdStr) => {
    const ids = new Set([catIdStr]);
    const queue = [catIdStr];
    while (queue.length > 0) {
      const cur = queue.shift();
      const children = childrenMap.get(cur) || [];
      for (const childId of children) {
        if (!ids.has(childId)) {
          ids.add(childId);
          queue.push(childId);
        }
      }
    }
    return ids;
  };

  const countMap = new Map();
  for (const cat of categories) {
    const catIdStr = cat._id.toString();
    const targetIds = getDescendantIds(catIdStr);
    let count = 0;
    for (const p of products) {
      const pCatIds = [p.category, p.subcategory, p.classification, ...(p.categories || [])]
        .filter(Boolean)
        .map((id) => id.toString());
      if (pCatIds.some((id) => targetIds.has(id))) {
        count++;
      }
    }
    countMap.set(catIdStr, count);
  }

  return countMap;
}

/**
 * Public: Get active categories organized in a multi-level tree for navigation
 */
export const getCategories = asyncHandler(async (req, res) => {
  // Fetch all active categories in a single database query
  const allActiveCategories = await Category.find({ isActive: true })
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const countMap = await calculateCategoryProductCounts(allActiveCategories);
  const categoriesWithCounts = allActiveCategories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));

  const tree = buildTree(categoriesWithCounts, null);

  res.status(200).json(new ApiResponse(200, { categories: tree, tree }, 'Categories retrieved successfully'));
});

/**
 * Public / Admin: Full category tree hierarchy
 */
export const getCategoryTree = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  const filter = includeInactive === 'true' ? {} : { isActive: true };

  const allCategories = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();

  const countMap = await calculateCategoryProductCounts(allCategories);
  const categoriesWithCounts = allCategories.map((cat) => ({
    ...cat,
    productCount: countMap.get(cat._id.toString()) || 0,
  }));

  const tree = buildTree(categoriesWithCounts, null);

  res.status(200).json(new ApiResponse(200, { tree, categories: tree }, 'Category tree retrieved successfully'));
});

/**
 * Admin: Flat list of all categories with parent names, product counts, and computed levels
 */
export const getAllCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find()
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });

  const countMap = await calculateCategoryProductCounts(categories);

  // Calculate hierarchy level for each category (1 = Root, 2 = Child, 3 = Grandchild, etc.)
  const categoryMap = new Map(categories.map((c) => [c._id.toString(), c]));

  const getLevel = (cat) => {
    let level = 1;
    let curr = cat;
    const visited = new Set();
    while (curr && curr.parent) {
      const parentId = typeof curr.parent === 'object' ? curr.parent._id.toString() : curr.parent.toString();
      if (visited.has(parentId)) break;
      visited.add(parentId);
      curr = categoryMap.get(parentId);
      if (curr) level++;
    }
    return level;
  };

  const enriched = categories.map((cat) => {
    const catObj = cat.toObject();
    catObj.productCount = countMap.get(cat._id.toString()) || 0;
    catObj.level = getLevel(cat);
    return catObj;
  });

  // Build a tree and flatten hierarchically (DFS order) so children always appear directly under their parents
  const tree = buildTree(enriched, null);
  const hierarchicalFlat = [];
  const flattenDfs = (nodes) => {
    for (const node of nodes) {
      hierarchicalFlat.push(node);
      if (node.children && node.children.length > 0) {
        flattenDfs(node.children);
      }
    }
  };
  flattenDfs(tree);

  res.status(200).json(
    new ApiResponse(
      200,
      { categories: hierarchicalFlat, tree },
      'All categories retrieved for admin'
    )
  );
});

/**
 * Public: Get single category by slug with ancestors breadcrumb chain & direct children
 */
export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await Category.findOne({ slug, isActive: true });

  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const [ancestors, children] = await Promise.all([
    getAncestors(category._id),
    Category.find({ parent: category._id, isActive: true }).sort({ sortOrder: 1, name: 1 }),
  ]);

  const result = category.toObject();
  result.ancestors = ancestors;
  result.children = children;
  result.subcategories = children;

  res.status(200).json(new ApiResponse(200, { category: result }, 'Category retrieved successfully'));
});

/**
 * Admin: Create new category (Level 1, 2, or 3)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, parent, parentId, description, image, sortOrder, isActive, showInNavbar } = req.body;

  if (!name || !name.trim()) {
    throw new ApiError(400, 'Category name is required');
  }

  const resolvedParent = parent || parentId || null;

  // Validate parent exists if provided
  if (resolvedParent) {
    const parentDoc = await Category.findById(resolvedParent);
    if (!parentDoc) {
      throw new ApiError(404, 'Parent category not found');
    }
  }

  const generatedSlug =
    (slug && slug.trim()) ||
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

  const existing = await Category.findOne({ slug: generatedSlug });
  if (existing) {
    throw new ApiError(409, `Category with slug '${generatedSlug}' already exists`);
  }

  const category = await Category.create({
    name: name.trim(),
    slug: generatedSlug,
    parent: resolvedParent,
    description: description || '',
    image: image || { url: '', publicId: '' },
    sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    showInNavbar: showInNavbar !== undefined ? Boolean(showInNavbar) : true,
  });

  res.status(201).json(new ApiResponse(201, { category }, 'Category created successfully'));
});

/**
 * Admin: Update category
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, slug, parent, parentId, description, image, sortOrder, isActive, showInNavbar } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  const resolvedParent = parent !== undefined ? parent : parentId !== undefined ? parentId : undefined;

  // Prevent circular references
  if (resolvedParent !== undefined && resolvedParent !== null && resolvedParent !== '') {
    if (resolvedParent.toString() === id.toString()) {
      throw new ApiError(400, 'A category cannot be its own parent');
    }
    const isCycle = await wouldCreateCycle(id, resolvedParent);
    if (isCycle) {
      throw new ApiError(400, 'Cannot set parent: a category cannot be a descendant of itself');
    }
    const parentDoc = await Category.findById(resolvedParent);
    if (!parentDoc) {
      throw new ApiError(404, 'Selected parent category not found');
    }
    category.parent = resolvedParent;
  } else if (resolvedParent === null || resolvedParent === '') {
    category.parent = null;
  }

  // Validate slug uniqueness if changing
  if (slug && slug !== category.slug) {
    const existing = await Category.findOne({ slug });
    if (existing) {
      throw new ApiError(409, `Category with slug '${slug}' already exists`);
    }
    category.slug = slug;
  }

  if (name !== undefined) category.name = name.trim();
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (sortOrder !== undefined) category.sortOrder = Number(sortOrder) || 0;
  if (isActive !== undefined) category.isActive = Boolean(isActive);
  if (showInNavbar !== undefined) category.showInNavbar = Boolean(showInNavbar);

  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category updated successfully'));
});

/**
 * Admin: Quick toggle status (active, showInNavbar)
 */
export const updateCategoryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive, showInNavbar } = req.body;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (isActive !== undefined) category.isActive = Boolean(isActive);
  if (showInNavbar !== undefined) category.showInNavbar = Boolean(showInNavbar);

  await category.save();

  res.status(200).json(new ApiResponse(200, { category }, 'Category status updated successfully'));
});

/**
 * Admin: Safe deletion of category with children & product protections
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Check 1: Prevent deletion if this category has child categories
  const childCount = await Category.countDocuments({ parent: id });
  if (childCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete '${category.name}'. It contains ${childCount} child subcategories. Please reassign or delete the subcategories first.`
    );
  }

  // Check 2: Prevent deletion if products are assigned to this category
  const productCount = await Product.countDocuments({
    $or: [{ category: id }, { subcategory: id }, { classification: id }, { categories: id }],
  });

  if (productCount > 0) {
    throw new ApiError(
      400,
      `Cannot delete '${category.name}'. There are ${productCount} products assigned to this category. Please reassign or delete them first.`
    );
  }

  await Category.findByIdAndDelete(id);

  res.status(200).json(new ApiResponse(200, null, `Category '${category.name}' deleted successfully`));
});
