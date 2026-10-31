'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { fetchApi } from '../../lib/api';
import {
  ShoppingBag,
  LogOut,
  Truck,
  ExternalLink,
  ShieldCheck,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  X,
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

interface OrderItem {
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  subtotal: number;
  isChair?: boolean;
}

interface OrderData {
  _id: string;
  orderNumber: string;
  createdAt: string;
  paymentStatus: string;
  paymentDetails?: {
    provider?: string;
    paymentId?: string;
  };
  fulfilmentStatus: string;
  items: OrderItem[];
  shippingAddress: {
    fullName?: string;
    phone?: string;
    houseNumber?: string;
    street: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  tracking?: {
    courier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  pricing: {
    subtotal: number;
    chairSubtotal?: number;
    nonChairSubtotal?: number;
    chairDiscountPercentage?: number;
    chairDiscountAmount?: number;
    discount?: number;
    shippingCharges: number;
    total: number;
  };
}

interface DeliveryCheckResult {
  serviceable: boolean;
  message: string;
  error?: string;
  state?: string;
  postalCode?: string;
  isRestrictedState?: boolean;
}

function AccountContent() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Add Address Modal / Form State
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrHouse, setAddrHouse] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('Maharashtra');
  const [addrPostalCode, setAddrPostalCode] = useState('');
  const [deliveryCheck, setDeliveryCheck] = useState<DeliveryCheckResult | null>(null);

  const loadOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetchApi<{ orders: OrderData[] }>('/orders/my-orders');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (authLoading) return;
      if (!user) {
        router.push('/login?returnUrl=/account');
      } else {
        void loadOrders();
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [user, authLoading, router, loadOrders]);

  // Live serviceability check for address form
  useEffect(() => {
    if (!addrPostalCode || addrPostalCode.trim().length !== 6 || !addrState) {
      setDeliveryCheck(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetchApi<DeliveryCheckResult>('/settings/check-delivery', {
          method: 'POST',
          body: JSON.stringify({ state: addrState, postalCode: addrPostalCode.trim() }),
        });
        setDeliveryCheck(res.data);
      } catch (err: unknown) {
        setDeliveryCheck({
          serviceable: false,
          message: err instanceof Error ? err.message : 'Invalid delivery location',
        });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [addrState, addrPostalCode]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError('');

    if (!addrStreet.trim() || !addrCity.trim() || !addrState || !addrPostalCode.trim()) {
      setAddressError('Please fill in Street, City, State, and 6-digit PIN code.');
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetchApi<{ serviceable: boolean; message: string }>('/auth/addresses', {
        method: 'POST',
        body: JSON.stringify({
          fullName: addrName.trim() || user?.name,
          phone: addrPhone.trim() || user?.phone,
          houseNumber: addrHouse.trim(),
          street: addrStreet.trim(),
          landmark: addrLandmark.trim(),
          city: addrCity.trim(),
          state: addrState,
          postalCode: addrPostalCode.trim(),
          country: 'India',
        }),
      });

      await refreshUser();
      setShowAddAddress(false);
      setAddrName('');
      setAddrPhone('');
      setAddrHouse('');
      setAddrStreet('');
      setAddrLandmark('');
      setAddrCity('');
      setAddrState('Maharashtra');
      setAddrPostalCode('');
      setDeliveryCheck(null);

      if (!res.data.serviceable) {
        alert('Sorry! ErgoCraft currently does not offer delivery services to your location. Address saved to your account profile, but cannot be used for checkout.');
      }
    } catch (err: unknown) {
      setAddressError(err instanceof Error ? err.message : 'Failed to save address.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!confirm('Are you sure you want to delete this delivery address?')) return;
    try {
      await fetchApi(`/auth/addresses/${addrId}`, { method: 'DELETE' });
      await refreshUser();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete address.');
    }
  };

  if (authLoading || (!user && !orders.length)) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-3 border-[#78836A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider uppercase text-[#73756F]">
          Loading Your Account Portal...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Header Profile Strip */}
      <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 sm:p-8 mb-8 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#13231D] text-[#78836A] flex items-center justify-center font-serif text-2xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-widest uppercase text-[#78836A] block mb-0.5">
              Verified Ergocraft Member
            </span>
            <h1 className="text-xl sm:text-2xl font-serif-luxury font-bold text-[#13231D]">
              {user.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#73756F] mt-1">
              <span className="flex items-center gap-1">
                <Mail size={13} />
                <span>{user.email}</span>
              </span>
              {user.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={13} />
                  <span>{user.phone}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            await logout();
            router.push('/login');
          }}
          className="self-start sm:self-auto px-4 py-2.5 rounded-xl border border-[#E8E5DE] text-xs font-semibold text-[#73756F] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50 transition flex items-center gap-2 cursor-pointer"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Main Grid: Orders & Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Orders History (Span 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#13231D]">
                Your Order History
              </h2>
              <p className="text-xs text-[#73756F] mt-0.5">
                Real-time tracking, warranty bindings, and tax invoices.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#73756F] bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#E8E5DE]">
              {orders.length} Total Orders
            </span>
          </div>

          {loadingOrders ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-white rounded-2xl border border-[#E8E5DE] animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E5DE] p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF8F5] border border-[#E8E5DE] text-[#78836A] flex items-center justify-center mx-auto">
                <ShoppingBag size={26} />
              </div>
              <h3 className="text-base font-semibold text-[#13231D]">
                No Orders Placed Yet
              </h3>
              <p className="text-xs text-[#73756F] max-w-sm mx-auto">
                Explore our signature mesh office chairs, executive leatherette seating, and handcrafted contemporary sofas.
              </p>
              <div>
                <Link
                  href="/products"
                  className="px-6 py-2.5 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold uppercase tracking-wider transition inline-block shadow-xs"
                >
                  Explore Seating
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const isPaid = order.paymentStatus === 'paid';
                return (
                  <div
                    key={order._id}
                    className="bg-white rounded-2xl border border-[#E8E5DE] p-5 sm:p-6 transition hover:shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E8E5DE] gap-2 text-xs">
                      <div>
                        <span className="font-mono font-bold text-sm text-[#13231D]">
                          #{order.orderNumber}
                        </span>
                        <span className="text-[#73756F] ml-3">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {order.paymentDetails?.provider === 'cod' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                            Cash on Delivery
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          Payment: {order.paymentStatus}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize bg-gray-100 text-gray-700 border border-gray-200">
                          {order.fulfilmentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 text-xs">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1">
                          <div>
                            <span className="font-semibold text-[#13231D]">{item.name}</span>
                            <span className="text-[11px] text-[#73756F] font-mono ml-2">
                              SKU: {item.sku}
                            </span>
                            {item.isChair && (
                              <span className="text-[9px] font-bold uppercase ml-2 px-1.5 py-0.2 bg-[#FAF8F5] text-[#78836A] rounded border border-[#E8E5DE]">
                                Chair
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-[#73756F] mr-3">Qty: {item.quantity}</span>
                            <span className="font-bold text-[#13231D]">
                              ₹{item.subtotal.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Additional Chair Discount Indicator */}
                    {order.pricing.chairDiscountAmount ? (
                      <div className="p-2.5 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <Sparkles size={14} className="text-emerald-600" />
                          <span>Additional Chair Discount Applied ({order.pricing.chairDiscountPercentage}%)</span>
                        </span>
                        <span className="font-bold">-₹{order.pricing.chairDiscountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null}

                    {/* Courier Tracking Strip */}
                    {order.tracking?.trackingNumber && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E5DE] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[#13231D]">
                          <Truck size={14} className="text-[#78836A]" />
                          <span>
                            Courier: <strong>{order.tracking.courier || 'Express'}</strong> | Tracking #{' '}
                            <strong className="font-mono">{order.tracking.trackingNumber}</strong>
                          </span>
                        </div>
                        {order.tracking.trackingUrl && (
                          <a
                            href={order.tracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#78836A] font-semibold flex items-center gap-1 hover:underline"
                          >
                            <span>Live Tracking</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Footer Totals */}
                    <div className="pt-3 border-t border-[#E8E5DE] flex justify-between items-center text-xs">
                      <span className="text-[#73756F]">
                        Shipping Destination: {order.shippingAddress.city}, {order.shippingAddress.state}
                      </span>
                      <div className="text-sm font-bold text-[#13231D]">
                        Total: <span className="text-[#78836A]">₹{order.pricing.total.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Saved Addresses & Client Assurance (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Saved Addresses Card */}
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A] flex items-center gap-2">
                <MapPin size={15} />
                <span>Delivery Addresses ({user.addresses?.length || 0})</span>
              </h3>
              <button
                onClick={() => {
                  setShowAddAddress(!showAddAddress);
                  setAddressError('');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {showAddAddress ? <X size={13} /> : <Plus size={13} />}
                <span>{showAddAddress ? 'Cancel' : 'Add Address'}</span>
              </button>
            </div>

            {/* Add Address Form Drawer/Inline */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E8E5DE] space-y-3 text-xs">
                <h4 className="font-bold text-[#13231D] text-xs">Add New Delivery Address</h4>

                {addressError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{addressError}</span>
                  </div>
                )}

                {/* Serviceability indicator in form */}
                {deliveryCheck && (
                  <div
                    className={`p-2.5 rounded-lg text-[11px] font-semibold border flex items-center gap-2 ${
                      deliveryCheck.serviceable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {deliveryCheck.serviceable ? (
                      <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle size={14} className="text-rose-600 shrink-0" />
                    )}
                    <span>{deliveryCheck.message}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Full Name</label>
                    <input
                      type="text"
                      placeholder={user.name}
                      value={addrName}
                      onChange={(e) => setAddrName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Mobile Number</label>
                    <input
                      type="tel"
                      placeholder={user.phone || '9876543210'}
                      value={addrPhone}
                      onChange={(e) => setAddrPhone(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">House / Flat No.</label>
                    <input
                      type="text"
                      placeholder="e.g. 402"
                      value={addrHouse}
                      onChange={(e) => setAddrHouse(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Street / Locality *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Linking Road, Bandra"
                      value={addrStreet}
                      onChange={(e) => setAddrStreet(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mumbai"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Near Metro"
                      value={addrLandmark}
                      onChange={(e) => setAddrLandmark(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">State *</label>
                    <select
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white text-xs"
                    >
                      {ALL_INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-0.5">PIN Code (6 digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={addrPostalCode}
                      onChange={(e) => setAddrPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="e.g. 400050"
                      className="w-full px-2.5 py-1.5 font-mono rounded-lg border border-gray-200 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    className="px-4 py-1.5 rounded-lg bg-[#13231D] text-white font-semibold hover:bg-[#78836A] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingAddress ? <Loader2 size={13} className="animate-spin" /> : null}
                    <span>Save Address</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of saved addresses */}
            {user.addresses && user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((addr, idx) => {
                  // Restricted check: List of 16 default restricted states
                  const isRestricted = [
                    'jammu & kashmir',
                    'himachal pradesh',
                    'uttarakhand',
                    'uttar pradesh',
                    'bihar',
                    'jharkhand',
                    'west bengal',
                    'odisha',
                    'sikkim',
                    'arunachal pradesh',
                    'assam',
                    'manipur',
                    'meghalaya',
                    'mizoram',
                    'nagaland',
                    'tripura',
                  ].includes(addr.state.toLowerCase());

                  return (
                    <div
                      key={addr._id || idx}
                      className={`p-4 rounded-xl border text-xs space-y-2 relative ${
                        isRestricted
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'border-[#E8E5DE] bg-[#FAF8F5]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#13231D]">{addr.fullName || user.name}</span>
                          {addr.isDefault && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#78836A] text-white">
                              Default
                            </span>
                          )}
                        </div>
                        {addr._id && (
                          <button
                            onClick={() => handleDeleteAddress(addr._id!)}
                            className="text-gray-400 hover:text-rose-600 transition cursor-pointer p-1"
                            title="Delete address"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="text-[#73756F] space-y-0.5">
                        {addr.houseNumber && <p>{addr.houseNumber}, {addr.street}</p>}
                        {!addr.houseNumber && <p>{addr.street}</p>}
                        {addr.landmark && <p className="text-[11px]">Near {addr.landmark}</p>}
                        <p className="font-medium text-[#242620]">
                          {addr.city}, {addr.state} - {addr.postalCode}
                        </p>
                        {addr.phone && <p className="text-[11px]">Phone: {addr.phone}</p>}
                      </div>

                      {/* Delivery Status Badge */}
                      <div className="pt-2 border-t border-gray-200/60">
                        {isRestricted ? (
                          <div className="flex items-start gap-1.5 text-rose-800 text-[11px] font-medium">
                            <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                            <span>Sorry! ErgoCraft currently does not offer delivery services to your location.</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-800 text-[11px] font-medium">
                            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                            <span>Serviceable Delivery Location</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-[#73756F]">
                No delivery address saved yet. Click &quot;Add Address&quot; above to save your delivery location.
              </p>
            )}
          </div>

          {/* Ergocraft Guarantees */}
          <div className="bg-[#FAF8F5] rounded-2xl border border-[#E8E5DE] p-6 space-y-4 text-xs">
            <h3 className="font-bold uppercase tracking-wider text-[#13231D]">
              Ergocraft Client Assurance
            </h3>
            <div className="space-y-3 text-[#73756F]">
              <div className="flex items-start gap-2.5">
                <ShieldCheck size={16} className="text-[#78836A] shrink-0 mt-0.5" />
                <span>3-Year Comprehensive Manufacturer Warranty on mechanisms and hydraulic gas lifts.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Truck size={16} className="text-[#78836A] shrink-0 mt-0.5" />
                <span>Complimentary white-glove doorstep delivery on all orders nationwide.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
      <AccountContent />
    </Suspense>
  );
}
