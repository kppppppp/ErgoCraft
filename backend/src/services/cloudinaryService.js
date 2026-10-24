import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';
import fs from 'fs';
import path from 'path';

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

class CloudinaryService {
  constructor() {
    this.isConfigured = Boolean(
      config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret
    );
  }

  async uploadImage(fileBuffer, folder = 'ergocraft/products') {
    if (!this.isConfigured) {
      throw new Error(
        'Cloudinary is not configured. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in the environment.'
      );
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1200, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  async deleteImage(publicId) {
    if (!this.isConfigured) {
      throw new Error('Cloudinary is not configured on the server.');
    }
    if (!publicId) {
      return { result: 'not_found' };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`[CloudinaryService] Deleted asset ${publicId}:`, result);
      return result;
    } catch (error) {
      console.error(`[CloudinaryService] Failed to delete asset ${publicId}:`, error.message);
      return { result: 'error', error: error.message };
    }
  }
}

export const cloudinaryService = new CloudinaryService();
