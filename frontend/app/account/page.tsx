'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';
import { fetchApi } from '../../lib/api';
import {
  ShoppingBag,
  LogOut,
  Package,
  Truck,
  Clock,
  ExternalLink,
  ShieldCheck,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface OrderItem {
  name: string;
  sku: string;
  image?: string;
  quantity: number;
  subtotal: number;
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
    shippingCharges: number;
    total: number;
  };
}

function AccountContent() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

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
        {/* Left: Orders History (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#13231D]">
                Your Order History
              </h2>
              <p className="text-xs text-[#73756F] mt-0.5">
                Real-time tracking and tax invoices for your ergonomic furniture purchases.
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

        {/* Right: Account & Support (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Saved Addresses Card */}
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A] flex items-center gap-2">
              <MapPin size={15} />
              <span>Default Shipping Address</span>
            </h3>

            {user.addresses && user.addresses.length > 0 ? (
              <div className="text-xs text-[#242620] space-y-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-[#73756F]">{user.addresses[0].street}</p>
                {user.addresses[0].landmark && (
                  <p className="text-[#73756F]">Near {user.addresses[0].landmark}</p>
                )}
                <p className="text-[#73756F]">
                  {user.addresses[0].city}, {user.addresses[0].state} - {user.addresses[0].postalCode}
                </p>
                <p className="text-[#73756F]">India</p>
              </div>
            ) : (
              <p className="text-xs text-[#73756F]">
                No delivery address saved yet. Addresses are saved automatically upon your first checkout.
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
