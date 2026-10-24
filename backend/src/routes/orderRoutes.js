import { Router } from 'express';
import {
  createPendingOrder,
  verifyPayment,
  getMyOrders,
  getOrderDetail,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  getDashboardStatsAdmin,
  sendAdminTestEmail,
  retryOrderEmailAdmin,
} from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Storefront checkout routes (strictly protected by authentication)
router.post('/create', authenticate, createPendingOrder);
router.post('/verify-payment', authenticate, verifyPayment);

// Customer account routes
router.get('/my-orders', authenticate, getMyOrders);
router.get('/:id', authenticate, getOrderDetail);

// Admin-only order routes
router.get('/admin/stats', authenticate, authorize('admin'), getDashboardStatsAdmin);
router.post('/admin/test-email', authenticate, authorize('admin'), sendAdminTestEmail);
router.post('/admin/:id/notifications/:type/retry', authenticate, authorize('admin'), retryOrderEmailAdmin);
router.get('/admin/all', authenticate, authorize('admin'), getAllOrdersAdmin);
router.patch('/admin/:id/status', authenticate, authorize('admin'), updateOrderStatusAdmin);

export default router;
