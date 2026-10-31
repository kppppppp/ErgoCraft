'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { fetchApi } from '../../lib/api';
import {
  Percent,
  Tag,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Sparkles,
  Calculator,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

interface ChairDiscountSettings {
  enabled: boolean;
  tier1Threshold: number;
  tier1Percentage: number;
  tier2Threshold: number;
  tier2Percentage: number;
}

const DEFAULT_DISCOUNT_CONFIG: ChairDiscountSettings = {
  enabled: true,
  tier1Threshold: 25000,
  tier1Percentage: 5,
  tier2Threshold: 50000,
  tier2Percentage: 7,
};

export default function DiscountManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ChairDiscountSettings>(DEFAULT_DISCOUNT_CONFIG);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Interactive Test Calculator state
  const [testChairValue, setTestChairValue] = useState<number>(30000);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ chairDiscount?: ChairDiscountSettings }>('/settings');
      if (res.data?.chairDiscount) {
        setConfig({
          enabled: res.data.chairDiscount.enabled ?? true,
          tier1Threshold: Number(res.data.chairDiscount.tier1Threshold) || 25000,
          tier1Percentage: Number(res.data.chairDiscount.tier1Percentage) || 5,
          tier2Threshold: Number(res.data.chairDiscount.tier2Threshold) || 50000,
          tier2Percentage: Number(res.data.chairDiscount.tier2Percentage) || 7,
        });
      }
    } catch (err: unknown) {
      console.error('Failed to load discount settings:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load discount configuration.',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateConfig = (): string | null => {
    if (config.tier1Threshold <= 0) {
      return 'Tier 1 threshold must be greater than ₹0.';
    }
    if (config.tier1Percentage <= 0 || config.tier1Percentage > 100) {
      return 'Tier 1 discount percentage must be between 1% and 100%.';
    }
    if (config.tier2Threshold <= config.tier1Threshold) {
      return `Tier 2 threshold (₹${config.tier2Threshold.toLocaleString('en-IN')}) must be strictly greater than Tier 1 threshold (₹${config.tier1Threshold.toLocaleString('en-IN')}).`;
    }
    if (config.tier2Percentage <= config.tier1Percentage || config.tier2Percentage > 100) {
      return `Tier 2 discount percentage (${config.tier2Percentage}%) must be higher than Tier 1 (${config.tier1Percentage}%) and at most 100%.`;
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateConfig();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await fetchApi('/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          chairDiscount: config,
        }),
      });
      setMessage({
        type: 'success',
        text: 'Automatic chair discount slabs saved successfully. Applied across all carts instantly.',
      });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save discount settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Reset discount slabs to ErgoCraft standard (Tier 1: ₹25k @ 5%, Tier 2: ₹50k @ 7%)?')) {
      setConfig({ ...DEFAULT_DISCOUNT_CONFIG });
    }
  };

  // Test Calculator logic
  const calculateTestDiscount = (val: number) => {
    if (!config.enabled || val <= 0) return { pct: 0, discount: 0, final: val };
    if (val >= config.tier2Threshold) {
      const discount = Math.round(val * (config.tier2Percentage / 100));
      return { pct: config.tier2Percentage, discount, final: val - discount };
    }
    if (val >= config.tier1Threshold) {
      const discount = Math.round(val * (config.tier1Percentage / 100));
      return { pct: config.tier1Percentage, discount, final: val - discount };
    }
    return { pct: 0, discount: 0, final: val };
  };

  const simResult = calculateTestDiscount(testChairValue);

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#667151] uppercase tracking-wider mb-1">
              <Percent size={16} />
              <span>Promotions & Slabs Engine</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1E1B18]">
              Automatic Chair Discount Management
            </h1>
            <p className="text-xs text-[#78716C] mt-1 max-w-xl">
              Configure automatic volume discounts on qualifying ergonomic chair purchases without requiring coupon codes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Reset to default thresholds (₹25,000 @ 5% & ₹50,000 @ 7%)"
            >
              <RotateCcw size={14} />
              <span>Defaults</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#667151] hover:bg-[#555E43] rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {message && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 border ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 size={32} className="animate-spin text-[#667151] mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading discount slabs...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Master Offer Toggle */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    config.enabled ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  <Sparkles size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B18] flex items-center gap-2">
                    <span>Automatic Chair Discount Offer Status</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        config.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {config.enabled ? 'ACTIVE (OFFER LIVE)' : 'DISABLED (OFF)'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1">
                    When enabled, qualifying chairs in cart automatically receive additional discounts upon meeting configured value slabs.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  config.enabled ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
                title="Toggle discount engine"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    config.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Slabs Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tier 1 Slab */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667151]">
                    <Tag size={15} />
                    <span>Tier 1 Slab</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                    {config.tier1Percentage}% Off
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Minimum Chair Cart Value (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="500"
                        value={config.tier1Threshold}
                        onChange={(e) =>
                          setConfig({ ...config, tier1Threshold: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full pl-8 pr-4 py-2 text-xs font-mono font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#667151]"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Default: ₹25,000</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Additional Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="0.5"
                        value={config.tier1Percentage}
                        onChange={(e) =>
                          setConfig({ ...config, tier1Percentage: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full pl-3 pr-8 py-2 text-xs font-mono font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#667151]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Default: 5%</p>
                  </div>
                </div>
              </div>

              {/* Tier 2 Slab */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#667151]">
                    <TrendingUp size={15} />
                    <span>Tier 2 Slab (Replaces Tier 1)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                    {config.tier2Percentage}% Off
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Minimum Chair Cart Value (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="500"
                        value={config.tier2Threshold}
                        onChange={(e) =>
                          setConfig({ ...config, tier2Threshold: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full pl-8 pr-4 py-2 text-xs font-mono font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#667151]"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Default: ₹50,000</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Additional Discount (%)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="0.5"
                        value={config.tier2Percentage}
                        onChange={(e) =>
                          setConfig({ ...config, tier2Percentage: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full pl-3 pr-8 py-2 text-xs font-mono font-semibold border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#667151]"
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1">Default: 7%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Interactive Simulator */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator size={18} className="text-[#667151]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1E1B18]">
                    Live Slab Test Calculator
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {[24999, 25000, 30000, 49999, 50000, 60000].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setTestChairValue(preset)}
                      className={`px-2 py-1 rounded text-[11px] font-mono font-semibold transition cursor-pointer ${
                        testChairValue === preset
                          ? 'bg-[#1E1B18] text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ₹{preset.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-white rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px]">Simulated Chair Subtotal</span>
                  <div className="mt-1 font-mono font-bold text-sm text-[#1E1B18]">
                    ₹{testChairValue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Applied Discount Tier</span>
                  <div className="mt-1 font-mono font-bold text-sm text-emerald-800">
                    {simResult.pct > 0 ? `${simResult.pct}% Additional Off` : 'None (Below Slab)'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Additional Discount Amount</span>
                  <div className="mt-1 font-mono font-bold text-sm text-emerald-800">
                    -₹{simResult.discount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px]">Final Payable for Chairs</span>
                  <div className="mt-1 font-mono font-bold text-sm text-[#667151]">
                    ₹{simResult.final.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-gray-500 space-y-1">
                <p>• ₹{config.tier1Threshold.toLocaleString('en-IN')} qualifies for {config.tier1Percentage}% additional discount.</p>
                <p>• ₹{config.tier2Threshold.toLocaleString('en-IN')} qualifies for {config.tier2Percentage}% additional discount (replaces {config.tier1Percentage}%).</p>
                <p>• Only eligible chair products receive this discount. Accessories, sofas, and unrelated items in the cart remain unaffected.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
