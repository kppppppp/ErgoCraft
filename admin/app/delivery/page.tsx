'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/AdminLayout';
import { fetchApi } from '../../lib/api';
import {
  Truck,
  ShieldAlert,
  ShieldCheck,
  Plus,
  X,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Search,
  MapPin,
} from 'lucide-react';

const ALL_INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu & Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

const DEFAULT_RESTRICTED_STATES = [
  'Jammu & Kashmir',
  'Himachal Pradesh',
  'Uttarakhand',
  'Uttar Pradesh',
  'Bihar',
  'Jharkhand',
  'West Bengal',
  'Odisha',
  'Sikkim',
  'Arunachal Pradesh',
  'Assam',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Tripura',
];

interface DeliverySettings {
  enabled: boolean;
  restrictedStates: string[];
}

export default function DeliveryManagementPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [restrictedStates, setRestrictedStates] = useState<string[]>(DEFAULT_RESTRICTED_STATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ deliveryRestrictions?: DeliverySettings }>('/settings');
      if (res.data?.deliveryRestrictions) {
        setEnabled(res.data.deliveryRestrictions.enabled ?? true);
        setRestrictedStates(res.data.deliveryRestrictions.restrictedStates || DEFAULT_RESTRICTED_STATES);
      }
    } catch (err: unknown) {
      console.error('Failed to load delivery settings:', err);
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load delivery configuration.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await fetchApi('/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          deliveryRestrictions: {
            enabled,
            restrictedStates,
          },
        }),
      });
      setMessage({
        type: 'success',
        text: 'Delivery restrictions updated successfully. Live storefront checkout updated immediately.',
      });
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save delivery settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  const addState = (state: string) => {
    if (!state) return;
    if (!restrictedStates.includes(state)) {
      setRestrictedStates([...restrictedStates, state].sort());
    }
    setSelectedToAdd('');
  };

  const removeState = (state: string) => {
    setRestrictedStates(restrictedStates.filter((s) => s !== state));
  };

  const resetToDefaults = () => {
    if (confirm('Reset restricted delivery locations to ErgoCraft standard 16 states?')) {
      setRestrictedStates([...DEFAULT_RESTRICTED_STATES]);
      setEnabled(true);
    }
  };

  const availableToAdd = ALL_INDIAN_STATES.filter(
    (s) => !restrictedStates.includes(s)
  ).sort();

  const filteredRestricted = restrictedStates.filter((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#667151] uppercase tracking-wider mb-1">
              <Truck size={16} />
              <span>Logistics & Regional Serviceability</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-[#1E1B18]">
              Delivery Management
            </h1>
            <p className="text-xs text-[#78716C] mt-1 max-w-xl">
              Configure serviceable shipping zones, block unserviceable states, and enforce location checks across checkout and order APIs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetToDefaults}
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Reset to default 16 restricted states"
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
            <p className="text-xs text-gray-500">Loading delivery rules...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Master Toggle Card */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`p-3 rounded-xl shrink-0 ${
                    enabled ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {enabled ? <ShieldAlert size={22} /> : <ShieldCheck size={22} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B18] flex items-center gap-2">
                    <span>Enforce State Delivery Restrictions</span>
                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full ${
                        enabled ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {enabled ? 'ACTIVE (RESTRICTING)' : 'OFF (PAN-INDIA OPEN)'}
                    </span>
                  </h3>
                  <p className="text-xs text-[#78716C] mt-1">
                    When active, customers entering shipping addresses in restricted states will be blocked from placing prepaid or COD orders with the required message.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors cursor-pointer ${
                  enabled ? 'bg-[#667151]' : 'bg-gray-300'
                }`}
                title="Toggle delivery restrictions"
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Restricted States Management */}
            <div className="bg-white rounded-2xl border border-[#E8E2D9] p-6 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-[#1E1B18] flex items-center gap-2">
                    <MapPin size={16} className="text-[#667151]" />
                    <span>Restricted Indian States ({restrictedStates.length})</span>
                  </h3>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    Orders destined to these states will be blocked across checkout and payment gateways.
                  </p>
                </div>

                {/* Quick Add Dropdown */}
                {availableToAdd.length > 0 && (
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedToAdd}
                      onChange={(e) => setSelectedToAdd(e.target.value)}
                      className="text-xs border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
                    >
                      <option value="">Select state to restrict...</option>
                      {availableToAdd.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => addState(selectedToAdd)}
                      disabled={!selectedToAdd}
                      className="px-3 py-2 rounded-xl bg-[#1E1B18] text-white text-xs font-semibold flex items-center gap-1 hover:bg-[#322E29] transition disabled:opacity-40 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Restrict</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filter restricted states..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#667151]"
                />
              </div>

              {/* State Badges Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {filteredRestricted.map((state) => (
                  <div
                    key={state}
                    className="flex items-center justify-between p-3 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-50 transition text-xs group"
                  >
                    <span className="font-semibold text-rose-900 truncate mr-2">{state}</span>
                    <button
                      onClick={() => removeState(state)}
                      className="text-rose-400 hover:text-rose-700 p-1 rounded-md hover:bg-rose-100 transition cursor-pointer"
                      title={`Remove restriction for ${state}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {filteredRestricted.length === 0 && (
                <div className="p-8 text-center text-xs text-gray-500 border border-dashed rounded-xl">
                  {searchQuery ? `No restricted states matching "${searchQuery}".` : 'No restricted states configured.'}
                </div>
              )}
            </div>

            {/* Customer Facing Feedback Preview Card */}
            <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E2D9] p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1E1B18] flex items-center gap-2">
                <span>Customer Error Message Display</span>
              </h4>
              <p className="text-xs text-[#78716C]">
                When an address in any of the restricted states above is submitted, storefront checkout will block order creation and display:
              </p>
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
                <AlertTriangle size={15} className="text-rose-600 shrink-0" />
                <span>Sorry! ErgoCraft currently does not offer delivery services to your location.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
