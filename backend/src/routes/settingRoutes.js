import express from 'express';
import { getStoreSettings, updateStoreSettings } from '../controllers/settingController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = express.Router();

// Public: allows storefront & checkout to check payment methods available
router.get('/', getStoreSettings);

// Admin-only: toggle COD status
router.patch('/', authenticate, authorize('admin'), updateStoreSettings);

export default router;
