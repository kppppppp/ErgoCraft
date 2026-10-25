import { Router } from 'express';
import {
  getCategories,
  getCategoryTree,
  getAllCategoriesAdmin,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} from '../controllers/categoryController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);

// Admin-only routes
router.get('/admin/all', authenticate, authorize('admin'), getAllCategoriesAdmin);
router.post('/', authenticate, authorize('admin'), createCategory);
router.put('/:id', authenticate, authorize('admin'), updateCategory);
router.patch('/:id/status', authenticate, authorize('admin'), updateCategoryStatus);
router.delete('/:id', authenticate, authorize('admin'), deleteCategory);

// Public single category by slug (placed after /tree and /admin/all to avoid matching those paths)
router.get('/:slug', getCategoryBySlug);

export default router;
