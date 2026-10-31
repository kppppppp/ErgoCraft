import mongoose from 'mongoose';
import { DEFAULT_RESTRICTED_STATES } from '../utils/deliveryService.js';
import { DEFAULT_CHAIR_DISCOUNT_CONFIG } from '../services/pricingService.js';

const settingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'store_settings',
    },
    codEnabled: {
      type: Boolean,
      default: true,
    },
    deliveryRestrictions: {
      enabled: {
        type: Boolean,
        default: true,
      },
      restrictedStates: {
        type: [String],
        default: DEFAULT_RESTRICTED_STATES,
      },
    },
    chairDiscount: {
      enabled: {
        type: Boolean,
        default: DEFAULT_CHAIR_DISCOUNT_CONFIG.enabled,
      },
      tier1Threshold: {
        type: Number,
        default: DEFAULT_CHAIR_DISCOUNT_CONFIG.tier1Threshold,
      },
      tier1Percentage: {
        type: Number,
        default: DEFAULT_CHAIR_DISCOUNT_CONFIG.tier1Percentage,
      },
      tier2Threshold: {
        type: Number,
        default: DEFAULT_CHAIR_DISCOUNT_CONFIG.tier2Threshold,
      },
      tier2Percentage: {
        type: Number,
        default: DEFAULT_CHAIR_DISCOUNT_CONFIG.tier2Percentage,
      },
    },
    updatedBy: {
      type: String,
      default: 'system',
    },
  },
  {
    timestamps: true,
  }
);

export const Setting = mongoose.model('Setting', settingSchema);
