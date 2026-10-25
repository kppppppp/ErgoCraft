import { Router } from 'express';
import {
  getProducts,
  getFeaturedAndBestsellers,
  getProductBySlug,
  getAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema } from '../validators/productValidator.js';

const router = Router();

// Public endpoints
router.get('/', getProducts);
router.get('/featured', getFeaturedAndBestsellers);

// Admin-only endpoints
router.get('/admin/all', authenticate, authorize('admin'), getAllProductsAdmin);
router.get('/admin/item/:id', authenticate, authorize('admin'), getProductBySlug);
router.post('/', authenticate, authorize('admin'), validate(createProductSchema), createProduct);
router.put('/:id', authenticate, authorize('admin'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);
router.get('/:slug', getProductBySlug);

export default router;
