'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../lib/api';
import {
  TrendingUp,
  ShoppingBag,
  Armchair,
  AlertTriangle,
  ArrowRight,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface DashboardStats {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalRevenue: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    customerDetails: { name: string; email: string };
    pricing: { total: number };
    paymentStatus: string;
    fulfilmentStatus: string;
    createdAt: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchApi<DashboardStats>('/orders/admin/stats');
        setStats(res.data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard metrics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 rounded-xl bg-white border border-[#E8E2D9] text-center">
        <p className="text-rose-600 mb-2 font-medium">Unable to load metrics</p>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#667151] text-white text-xs font-semibold rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1B18]">Operations Overview</h1>
          <p className="text-sm text-[#78716C] mt-1">
            Real-time performance metrics and recent transaction activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/products/new"
            className="px-4 py-2.5 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-xs"
          >
            <Armchair size={16} />
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue */}
        <div className="p-6 rounded-xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-sm text-[#78716C] mb-3">
            <span className="font-semibold uppercase tracking-wider text-xs">Total Revenue</span>
            <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] text-[#667151] flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-[#1E1B18]">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-[#78716C] mt-2 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>From {stats.paidOrders} verified paid orders</span>
          </p>
        </div>

        {/* Orders */}
        <div className="p-6 rounded-xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-sm text-[#78716C] mb-3">
            <span className="font-semibold uppercase tracking-wider text-xs">Total Orders</span>
            <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] text-[#667151] flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-[#1E1B18]">
            {stats.totalOrders}
          </div>
          <p className="text-xs text-[#78716C] mt-2 flex items-center gap-1.5">
            <Clock size={14} className="text-amber-600" />
            <span>{stats.pendingOrders} pending payment or processing</span>
          </p>
        </div>

        {/* Catalogue */}
        <div className="p-6 rounded-xl bg-white border border-[#E8E2D9] shadow-xs">
          <div className="flex items-center justify-between text-sm text-[#78716C] mb-3">
            <span className="font-semibold uppercase tracking-wider text-xs">Active Products</span>
            <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] text-[#667151] flex items-center justify-center">
              <Armchair size={20} />
            </div>
          </div>
          <div className="text-3xl font-bold font-serif text-[#1E1B18]">
            {stats.totalProducts}
          </div>
          <p className="text-xs text-[#78716C] mt-2 flex items-center gap-1.5">
            {stats.lowStockProducts > 0 ? (
              <>
                <AlertTriangle size={14} className="text-rose-600" />
                <span className="text-rose-600 font-medium">
                  {stats.lowStockProducts} products with low stock (&le;3)
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>All product inventories healthy</span>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E8E2D9] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1E1B18]">Recent Customer Orders</h2>
            <p className="text-xs text-[#78716C]">The latest transactions placed through the storefront.</p>
          </div>
          <Link
            href="/orders"
            className="text-xs font-semibold text-[#667151] hover:text-[#4D5A3D] flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-[#78716C]">
            <Package size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No customer orders placed yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#78716C] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-5">Order #</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Amount</th>
                  <th className="py-3 px-5">Payment</th>
                  <th className="py-3 px-5">Fulfilment</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#1E1B18]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-[#1E1B18]">{order.customerDetails.name}</div>
                      <div className="text-xs text-[#78716C]">{order.customerDetails.email}</div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-[#78716C]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#1E1B18]">
                      ₹{order.pricing.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : order.paymentStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700 border border-gray-200">
                        {order.fulfilmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        href={`/orders?id=${order._id}`}
                        className="text-xs font-medium text-[#667151] hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
