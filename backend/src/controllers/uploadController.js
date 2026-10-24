import multer from 'multer';
import { cloudinaryService } from '../services/cloudinaryService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Memory storage for file buffering before Cloudinary upload
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

export const uploadImageHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'No image file uploaded');
  }

  const result = await cloudinaryService.uploadImage(req.file.buffer, 'ergocraft/products');

  res.status(200).json(
    new ApiResponse(
      200,
      {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
      },
      'Image uploaded successfully'
    )
  );
});

export const uploadMultipleImagesHandler = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, 'No image files uploaded');
  }

  if (req.files.length > 10) {
    throw new ApiError(400, 'Maximum 10 images can be uploaded simultaneously');
  }

  const uploadPromises = req.files.map((file) =>
    cloudinaryService.uploadImage(file.buffer, 'ergocraft/products')
  );

  const results = await Promise.all(uploadPromises);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        images: results.map((r) => ({
          url: r.url,
          publicId: r.publicId,
          width: r.width,
          height: r.height,
          format: r.format,
        })),
      },
      `${results.length} images uploaded successfully`
    )
  );
});

export const deleteImageHandler = asyncHandler(async (req, res) => {
  const { publicId } = req.body;

  if (!publicId) {
    throw new ApiError(400, 'publicId is required');
  }

  const result = await cloudinaryService.deleteImage(publicId);

  res.status(200).json(new ApiResponse(200, result, 'Image deleted successfully'));
});
