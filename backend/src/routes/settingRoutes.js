import express from 'express';
import {
  getStoreSettings,
  updateStoreSettings,
  checkDelivery,
} from '../controllers/settingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Public: allows storefront & checkout to check settings (COD, Delivery, Discounts)
router.get('/', getStoreSettings);

// Public: check delivery serviceability for a state and PIN code
router.post('/check-delivery', checkDelivery);

// Admin-only: update store settings (COD, Delivery Restrictions, Chair Discounts)
router.patch('/', authenticate, authorize('admin'), updateStoreSettings);

export default router;
