import { Router } from 'express';
import {
  upload,
  uploadImageHandler,
  uploadMultipleImagesHandler,
  deleteImageHandler,
} from '../controllers/uploadController.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/rbac.js';

const router = Router();

// Only authenticated Admins can upload or delete media
router.post('/', authenticate, authorize('admin'), upload.single('image'), uploadImageHandler);
router.post('/multiple', authenticate, authorize('admin'), upload.array('images', 10), uploadMultipleImagesHandler);
router.delete('/', authenticate, authorize('admin'), deleteImageHandler);

export default router;
