import { Setting } from '../models/Setting.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  checkDeliveryServiceability,
  normalizeState,
  DEFAULT_RESTRICTED_STATES,
} from '../utils/deliveryService.js';
import { DEFAULT_CHAIR_DISCOUNT_CONFIG } from '../services/pricingService.js';

/**
 * Retrieves store settings (COD, Delivery Restrictions, Chair Discounts).
 */
export const getStoreSettings = asyncHandler(async (req, res) => {
  let setting = await Setting.findOne({ key: 'store_settings' });
  if (!setting) {
    setting = await Setting.create({
      key: 'store_settings',
      codEnabled: true,
      deliveryRestrictions: {
        enabled: true,
        restrictedStates: DEFAULT_RESTRICTED_STATES,
      },
      chairDiscount: DEFAULT_CHAIR_DISCOUNT_CONFIG,
    });
  }

  // Ensure default structures are present if loaded from legacy documents
  const deliveryRestrictions = {
    enabled: setting.deliveryRestrictions?.enabled ?? true,
    restrictedStates: setting.deliveryRestrictions?.restrictedStates?.length
      ? setting.deliveryRestrictions.restrictedStates
      : DEFAULT_RESTRICTED_STATES,
  };

  const chairDiscount = {
    enabled: setting.chairDiscount?.enabled ?? DEFAULT_CHAIR_DISCOUNT_CONFIG.enabled,
    tier1Threshold: setting.chairDiscount?.tier1Threshold ?? DEFAULT_CHAIR_DISCOUNT_CONFIG.tier1Threshold,
    tier1Percentage: setting.chairDiscount?.tier1Percentage ?? DEFAULT_CHAIR_DISCOUNT_CONFIG.tier1Percentage,
    tier2Threshold: setting.chairDiscount?.tier2Threshold ?? DEFAULT_CHAIR_DISCOUNT_CONFIG.tier2Threshold,
    tier2Percentage: setting.chairDiscount?.tier2Percentage ?? DEFAULT_CHAIR_DISCOUNT_CONFIG.tier2Percentage,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      {
        codEnabled: setting.codEnabled,
        deliveryRestrictions,
        chairDiscount,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy,
      },
      'Store settings retrieved successfully'
    )
  );
});

/**
 * Updates store settings (COD, Delivery Restrictions, Chair Discounts).
 */
export const updateStoreSettings = asyncHandler(async (req, res) => {
  const { codEnabled, deliveryRestrictions, chairDiscount } = req.body;

  let setting = await Setting.findOne({ key: 'store_settings' });
  if (!setting) {
    setting = new Setting({ key: 'store_settings' });
  }

  // Update COD if provided
  if (codEnabled !== undefined) {
    if (typeof codEnabled !== 'boolean') {
      throw new ApiError(400, 'Invalid settings payload: "codEnabled" must be a boolean');
    }
    setting.codEnabled = codEnabled;
  }

  // Update Delivery Restrictions if provided
  if (deliveryRestrictions !== undefined) {
    if (typeof deliveryRestrictions !== 'object' || deliveryRestrictions === null) {
      throw new ApiError(400, 'Invalid deliveryRestrictions payload');
    }

    if (deliveryRestrictions.enabled !== undefined) {
      if (typeof deliveryRestrictions.enabled !== 'boolean') {
        throw new ApiError(400, '"deliveryRestrictions.enabled" must be a boolean');
      }
      setting.deliveryRestrictions.enabled = deliveryRestrictions.enabled;
    }

    if (deliveryRestrictions.restrictedStates !== undefined) {
      if (!Array.isArray(deliveryRestrictions.restrictedStates)) {
        throw new ApiError(400, '"deliveryRestrictions.restrictedStates" must be an array of state names');
      }

      // Normalize all state names
      const cleaned = deliveryRestrictions.restrictedStates
        .map((s) => normalizeState(s) || String(s).trim())
        .filter(Boolean);

      // Remove duplicates
      setting.deliveryRestrictions.restrictedStates = [...new Set(cleaned)];
    }
  }

  // Update Chair Discounts if provided
  if (chairDiscount !== undefined) {
    if (typeof chairDiscount !== 'object' || chairDiscount === null) {
      throw new ApiError(400, 'Invalid chairDiscount payload');
    }

    const currentChair = setting.chairDiscount || DEFAULT_CHAIR_DISCOUNT_CONFIG;
    const nextEnabled = chairDiscount.enabled !== undefined ? Boolean(chairDiscount.enabled) : currentChair.enabled;
    const nextT1Th = chairDiscount.tier1Threshold !== undefined ? Number(chairDiscount.tier1Threshold) : currentChair.tier1Threshold;
    const nextT1Pct = chairDiscount.tier1Percentage !== undefined ? Number(chairDiscount.tier1Percentage) : currentChair.tier1Percentage;
    const nextT2Th = chairDiscount.tier2Threshold !== undefined ? Number(chairDiscount.tier2Threshold) : currentChair.tier2Threshold;
    const nextT2Pct = chairDiscount.tier2Percentage !== undefined ? Number(chairDiscount.tier2Percentage) : currentChair.tier2Percentage;

    if (isNaN(nextT1Th) || nextT1Th <= 0) {
      throw new ApiError(400, 'Tier 1 threshold must be a positive number');
    }
    if (isNaN(nextT1Pct) || nextT1Pct < 0 || nextT1Pct > 100) {
      throw new ApiError(400, 'Tier 1 discount percentage must be between 0 and 100');
    }
    if (isNaN(nextT2Th) || nextT2Th <= nextT1Th) {
      throw new ApiError(400, `Tier 2 threshold (₹${nextT2Th}) must be greater than Tier 1 threshold (₹${nextT1Th})`);
    }
    if (isNaN(nextT2Pct) || nextT2Pct <= nextT1Pct || nextT2Pct > 100) {
      throw new ApiError(400, `Tier 2 discount percentage (${nextT2Pct}%) must be greater than Tier 1 (${nextT1Pct}%) and at most 100%`);
    }

    setting.chairDiscount = {
      enabled: nextEnabled,
      tier1Threshold: nextT1Th,
      tier1Percentage: nextT1Pct,
      tier2Threshold: nextT2Th,
      tier2Percentage: nextT2Pct,
    };
  }

  setting.updatedBy = req.user?.email || 'Admin';
  await setting.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        codEnabled: setting.codEnabled,
        deliveryRestrictions: setting.deliveryRestrictions,
        chairDiscount: setting.chairDiscount,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updatedBy,
      },
      'Store settings updated successfully'
    )
  );
});

/**
 * Public endpoint to check delivery serviceability for a state and PIN code.
 */
export const checkDelivery = asyncHandler(async (req, res) => {
  const { state, postalCode, pincode } = req.body;
  const pin = postalCode || pincode;

  if (!state || !pin) {
    throw new ApiError(400, 'Please provide both state and 6-digit postal code');
  }

  const setting = await Setting.findOne({ key: 'store_settings' });
  const restrictionsEnabled = setting?.deliveryRestrictions?.enabled ?? true;
  const restrictedStates = setting?.deliveryRestrictions?.restrictedStates ?? DEFAULT_RESTRICTED_STATES;

  const result = checkDeliveryServiceability(state, pin, {
    restrictedStates,
    restrictionsEnabled,
  });

  res.status(200).json(new ApiResponse(200, result, result.message));
});
