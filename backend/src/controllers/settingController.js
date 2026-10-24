import { Setting } from '../models/Setting.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getStoreSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne({ key: 'store_settings' });
  if (!setting) {
    setting = await Setting.create({ key: 'store_settings', codEnabled: true });
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        codEnabled: setting.codEnabled,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy,
      },
      'Store settings retrieved successfully'
    )
  );
});

export const updateStoreSettings = asyncHandler(async (req, res) => {
  const { codEnabled } = req.body;

  if (typeof codEnabled !== 'boolean') {
    throw new ApiError(400, 'Invalid settings payload: "codEnabled" must be a boolean');
  }

  const setting = await Setting.findOneAndUpdate(
    { key: 'store_settings' },
    {
      codEnabled,
      updatedBy: req.user.email || 'Admin',
    },
    { new: true, upsert: true }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      {
        codEnabled: setting.codEnabled,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy,
      },
      `Cash on Delivery (COD) has been ${setting.codEnabled ? 'enabled' : 'disabled'}`
    )
  );
});
