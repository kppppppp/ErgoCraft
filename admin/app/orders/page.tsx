'use client';

import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import {
  Search,
  ShoppingBag,
  Truck,
  CheckCircle2,
  AlertCircle,
  Eye,
  X,
  Send,
} from 'lucide-react';

interface OrderItem {
  _id: string;
  orderNumber: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    sku: string;
    image: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>;
  pricing: {
    subtotal: number;
    shippingCharges: number;
    tax: number;
    total: number;
  };
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentDetails?: {
    provider?: string;
    orderId?: string;
    paymentId?: string;
  };
  fulfilmentStatus: 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  tracking?: {
    courier?: string;
    trackingNumber?: string;
    trackingUrl?: string;
  };
  statusHistory: Array<{
    status: string;
    timestamp: string;
    updatedBy: string;
    note: string;
  }>;
  notifications?: {
    customerOrder?: { status: string; lastError?: string };
    ownerOrder?: { status: string; lastError?: string };
    customerShipping?: { status: string; lastError?: string };
  };
  createdAt: string;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get('id');

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [fulfilmentStatus, setFulfilmentStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Status transition states
  const [newFulfilment, setNewFulfilment] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [courier, setCourier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [modalMsg, setModalMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [retryingNotification, setRetryingNotification] = useState('');

  // Modal lifecycle & concurrency control
  const modalAbortControllerRef = useRef<AbortController | null>(null);
  const activeOrderIdRef = useRef<string | null>(null);
  const initialOrderHandledRef = useRef(false);

  const handleCloseModal = useCallback(() => {
    // 1. Immediately abort any in-flight requests for this modal
    if (modalAbortControllerRef.current) {
      modalAbortControllerRef.current.abort();
      modalAbortControllerRef.current = null;
    }
    // 2. Mark no order active so background promises discard results
    activeOrderIdRef.current = null;

    // 3. Immediately reset UI modal state
    setSelectedOrder(null);
    setUpdating(false);
    setRetryingNotification('');
    setModalMsg(null);

    // 4. Clean up ?id= query param from URL if present without triggering page reload
    if (typeof window !== 'undefined' && window.location.search.includes('id=')) {
      const url = new URL(window.location.href);
      url.searchParams.delete('id');
      const newRelative = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
      window.history.replaceState(null, '', newRelative);
    }
  }, []);

  const openDetailModal = useCallback((order: OrderItem) => {
    // Abort prior in-flight request if any
    if (modalAbortControllerRef.current) {
      modalAbortControllerRef.current.abort();
    }
    modalAbortControllerRef.current = new AbortController();
    activeOrderIdRef.current = order._id;

    setSelectedOrder(order);
    setNewFulfilment(order.fulfilmentStatus);
    setNewPaymentStatus(order.paymentStatus);
    setCourier(order.tracking?.courier || '');
    setTrackingNumber(order.tracking?.trackingNumber || '');
    setTrackingUrl(order.tracking?.trackingUrl || '');
    setAdminNote('');
    setModalMsg(null);
    setUpdating(false);
    setRetryingNotification('');
  }, []);

  // Escape key handler to dismiss modal immediately
  useEffect(() => {
    if (!selectedOrder) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedOrder, handleCloseModal]);

  // Prevent background page from scrolling while modal is active
  useEffect(() => {
    if (selectedOrder) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedOrder]);

  // Cleanup abort controller on component unmount
  useEffect(() => {
    return () => {
      modalAbortControllerRef.current?.abort();
    };
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search) q.set('q', search);
      if (paymentStatus) q.set('paymentStatus', paymentStatus);
      if (fulfilmentStatus) q.set('fulfilmentStatus', fulfilmentStatus);

      const res = await fetchApi<{ orders: OrderItem[] }>(`/orders/admin/all?${q.toString()}`);
      setOrders(res.data.orders);

      if (initialOrderId && !initialOrderHandledRef.current) {
        const found = res.data.orders.find((o) => o._id === initialOrderId);
        if (found) {
          initialOrderHandledRef.current = true;
          openDetailModal(found);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [search, paymentStatus, fulfilmentStatus, initialOrderId, openDetailModal]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadOrders(), 0);
    return () => window.clearTimeout(timer);
  }, [loadOrders]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const currentOrderId = selectedOrder._id;

    if (modalAbortControllerRef.current) {
      modalAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    modalAbortControllerRef.current = controller;

    setUpdating(true);
    setModalMsg(null);
    try {
      const res = await fetchApi<{ order: OrderItem }>(
        `/orders/admin/${currentOrderId}/status`,
        {
          method: 'PATCH',
          signal: controller.signal,
          body: JSON.stringify({
            fulfilmentStatus: newFulfilment,
            paymentStatus: newPaymentStatus,
            courier,
            trackingNumber,
            trackingUrl,
            note: adminNote,
          }),
        }
      );

      // Always update the order in the background list table
      setOrders((prev) => prev.map((o) => (o._id === res.data.order._id ? res.data.order : o)));

      // If modal was closed or switched to another order while in flight, discard modal updates
      if (activeOrderIdRef.current !== currentOrderId) {
        return;
      }

      setSelectedOrder(res.data.order);
      setModalMsg({ type: 'success', text: 'Order status & shipment details updated successfully!' });
    } catch (err: unknown) {
      if (controller.signal.aborted || (err as { name?: string })?.name === 'AbortError') {
        return;
      }
      if (activeOrderIdRef.current !== currentOrderId) {
        return;
      }
      setModalMsg({ type: 'error', text: err instanceof Error ? err.message : 'Failed to update order status' });
    } finally {
      if (activeOrderIdRef.current === currentOrderId) {
        setUpdating(false);
      }
    }
  };

  const retryNotification = async (type: 'customer' | 'owner' | 'shipping') => {
    if (!selectedOrder) return;
    const currentOrderId = selectedOrder._id;

    if (modalAbortControllerRef.current) {
      modalAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    modalAbortControllerRef.current = controller;

    setRetryingNotification(type);
    setModalMsg(null);
    try {
      await fetchApi(`/orders/admin/${currentOrderId}/notifications/${type}/retry`, {
        method: 'POST',
        signal: controller.signal,
      });

      if (activeOrderIdRef.current !== currentOrderId) return;

      const refreshed = await fetchApi<{ order: OrderItem }>(`/orders/${currentOrderId}`, {
        signal: controller.signal,
      });

      const order = refreshed.data.order;
      setOrders((current) => current.map((item) => item._id === order._id ? order : item));

      if (activeOrderIdRef.current !== currentOrderId) return;

      setSelectedOrder(order);
      setModalMsg({ type: 'success', text: 'Email service accepted the notification.' });
    } catch (err: unknown) {
      if (controller.signal.aborted || (err as { name?: string })?.name === 'AbortError') {
        return;
      }
      if (activeOrderIdRef.current !== currentOrderId) return;
      setModalMsg({ type: 'error', text: err instanceof Error ? err.message : 'Notification retry failed' });
    } finally {
      if (activeOrderIdRef.current === currentOrderId) {
        setRetryingNotification('');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#1E1B18]">Order Management</h1>
        <p className="text-sm text-[#78716C] mt-1">
          Monitor transactions, verify payment captures, and manage shipping fulfilment.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Order # or customer..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-none focus:ring-1 focus:ring-[#667151]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={fulfilmentStatus}
            onChange={(e) => setFulfilmentStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
          >
            <option value="">All Fulfilments</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#667151] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-[#78716C]">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-[#78716C]">
            <ShoppingBag size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No customer orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#78716C] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-5">Order #</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Items</th>
                  <th className="py-3 px-5">Total</th>
                  <th className="py-3 px-5">Payment</th>
                  <th className="py-3 px-5">Fulfilment</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {orders.map((o) => (
                  <tr key={o._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-[#1E1B18]">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-[#78716C]">
                      {new Date(o.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-[#1E1B18]">{o.customerDetails.name}</div>
                      <div className="text-xs text-[#78716C]">{o.customerDetails.email}</div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600">
                      {o.items.reduce((acc, curr) => acc + curr.quantity, 0)} units
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-[#1E1B18]">
                      ₹{o.pricing.total.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            o.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : o.paymentStatus === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {o.paymentStatus}
                        </span>
                        <span className="text-[10px] font-semibold">
                          {o.paymentDetails?.provider === 'cod' ? (
                            <span className="text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                              COD
                            </span>
                          ) : (
                            <span className="text-blue-700">Razorpay</span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-gray-100 text-gray-700 border border-gray-200">
                        {o.fulfilmentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => openDetailModal(o)}
                        className="px-3 py-1.5 rounded-md bg-[#FAF8F5] border border-[#E8E2D9] text-[#667151] hover:bg-[#667151] hover:text-white text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ml-auto"
                      >
                        <Eye size={13} />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="order-modal-title"
          onClick={handleCloseModal}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-hidden cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-3xl w-full max-h-[calc(100dvh-2rem)] flex flex-col shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 cursor-default relative overflow-hidden"
          >
            {/* Header (Pinned / Sticky at Top) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0 z-10">
              <div>
                <h3 id="order-modal-title" className="text-lg font-serif font-bold text-[#1E1B18]">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-xs text-[#78716C]">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString('en-IN')}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                aria-label="Close order details"
                className="text-gray-400 hover:text-gray-700 active:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#667151]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Region */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
              {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#FAF8F5] p-4 rounded-lg border border-[#E8E2D9] text-xs">
              <div>
                <h4 className="font-semibold uppercase tracking-wider text-[#667151] mb-1.5">
                  Customer Information
                </h4>
                <p className="font-semibold text-sm text-[#1E1B18] mb-0.5">
                  {selectedOrder.customerDetails.name}
                </p>
                <p className="text-gray-600">Email: {selectedOrder.customerDetails.email}</p>
                <p className="text-gray-600">Phone: {selectedOrder.customerDetails.phone}</p>
              </div>

              <div>
                <h4 className="font-semibold uppercase tracking-wider text-[#667151] mb-1.5">
                  Delivery Destination
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedOrder.shippingAddress.street}
                  <br />
                  {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} -{' '}
                  {selectedOrder.shippingAddress.postalCode}
                  <br />
                  {selectedOrder.shippingAddress.country}
                </p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-2">
                Purchased Seating ({selectedOrder.items.length} unique products)
              </h4>
              <div className="border border-[#E8E2D9] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-gray-500 border-b border-[#E8E2D9]">
                    <tr>
                      <th className="py-2.5 px-4">Item</th>
                      <th className="py-2.5 px-4 text-center">Qty</th>
                      <th className="py-2.5 px-4 text-right">Unit Price</th>
                      <th className="py-2.5 px-4 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E2D9]">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-2.5 px-4">
                          <div className="font-semibold text-gray-800">{item.name}</div>
                          <span className="font-mono text-[10px] text-gray-400">{item.sku}</span>
                        </td>
                        <td className="py-2.5 px-4 text-center font-semibold">{item.quantity}</td>
                        <td className="py-2.5 px-4 text-right text-gray-600">
                          ₹{item.unitPrice.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-4 text-right font-semibold text-gray-900">
                          ₹{item.subtotal.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#FAF8F5] font-semibold border-t border-[#E8E2D9]">
                    <tr>
                      <td colSpan={3} className="py-2 px-4 text-right text-gray-500">
                        Subtotal:
                      </td>
                      <td className="py-2 px-4 text-right text-gray-800">
                        ₹{selectedOrder.pricing.subtotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="py-2 px-4 text-right text-gray-500">
                        Shipping:
                      </td>
                      <td className="py-2 px-4 text-right text-gray-800">
                        {selectedOrder.pricing.shippingCharges === 0
                          ? 'FREE'
                          : `₹${selectedOrder.pricing.shippingCharges}`}
                      </td>
                    </tr>
                    <tr className="text-sm bg-white border-t border-[#E8E2D9]">
                      <td colSpan={3} className="py-3 px-4 text-right font-bold text-[#1E1B18]">
                        Total Amount:
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#667151]">
                        ₹{selectedOrder.pricing.total.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Fulfilment & Shipping Updater */}
            <form
              onSubmit={handleUpdateStatus}
              className="p-4 bg-white border border-[#E8E2D9] rounded-lg space-y-4"
            >
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#667151]">
                Update Shipment & Fulfilment Status
              </h4>

              {modalMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    modalMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {modalMsg.type === 'success' ? (
                    <CheckCircle2 size={15} className="shrink-0" />
                  ) : (
                    <AlertCircle size={15} className="shrink-0" />
                  )}
                  <span>{modalMsg.text}</span>
                </div>
              )}

              {selectedOrder.paymentDetails?.provider === 'cod' && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-800 leading-relaxed">
                  <strong>Cash on Delivery (COD) Order:</strong> Total amount due at doorstep is{' '}
                  <strong className="text-amber-950 font-bold">
                    ₹{selectedOrder.pricing.total.toLocaleString('en-IN')}
                  </strong>
                  . Once payment is received from courier or customer, update Payment Status below to{' '}
                  <strong>Paid</strong>.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fulfilment Stage
                  </label>
                  <select
                    value={newFulfilment}
                    onChange={(e) => setNewFulfilment(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-[#E8E2D9] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#667151]"
                  >
                    <option value="processing">Processing</option>
                    <option value="packed">Packed</option>
                    <option value="shipped">Shipped (Triggers Customer Email)</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Payment Status ({selectedOrder.paymentDetails?.provider === 'cod' ? 'COD' : 'Online'})
                  </label>
                  <select
                    value={newPaymentStatus}
                    onChange={(e) => setNewPaymentStatus(e.target.value)}
                    disabled={selectedOrder.paymentDetails?.provider !== 'cod'}
                    className="w-full px-3 py-2 rounded-md border border-[#E8E2D9] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#667151]"
                  >
                    <option value="pending">Pending (Awaiting Payment / Delivery)</option>
                    <option value="paid">Paid (Collected / Verified)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Courier Partner
                  </label>
                  <input
                    type="text"
                    value={courier}
                    onChange={(e) => setCourier(e.target.value)}
                    placeholder="e.g. Blue Dart, Delhivery"
                    className="w-full px-3 py-2 rounded-md border border-[#E8E2D9] text-xs focus:ring-1 focus:ring-[#667151]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Tracking AWB / Reference
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. BLD98765432"
                    className="w-full px-3 py-2 rounded-md border border-[#E8E2D9] text-xs font-mono focus:ring-1 focus:ring-[#667151]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tracking URL
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://track.courier.com/..."
                  className="w-full px-3 py-2 rounded-md border border-[#E8E2D9] text-xs focus:ring-1 focus:ring-[#667151]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Internal Audit Note
                </label>
                <input
                  type="text"
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Handed over to courier driver at Thane dispatch hub"
                  className="w-full px-3 py-2 rounded-md border border-[#E8E2D9] text-xs focus:ring-1 focus:ring-[#667151]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 rounded-md bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wide uppercase transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Truck size={14} />
                  <span>{updating ? 'Updating...' : 'Save Fulfilment Status'}</span>
                </button>
              </div>
            </form>

            <section className="p-4 border border-[#E8E2D9] rounded-lg space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#667151]">Order emails</h4>
              {([
                ['customer', 'Customer confirmation', selectedOrder.notifications?.customerOrder],
                ['owner', 'Store notification', selectedOrder.notifications?.ownerOrder],
                ['shipping', 'Shipping update', selectedOrder.notifications?.customerShipping],
              ] as const).map(([type, label, notification]) => (
                <div key={type} className="flex flex-wrap items-center justify-between gap-2 text-xs border-t border-gray-100 pt-2">
                  <span>{label}: <strong className="capitalize">{notification?.status || 'pending'}</strong>
                    {notification?.lastError ? <span className="text-rose-700"> — {notification.lastError}</span> : null}
                  </span>
                  <button type="button" onClick={() => retryNotification(type)} disabled={Boolean(retryingNotification) || (type === 'shipping' && selectedOrder.fulfilmentStatus !== 'shipped')}
                    className="inline-flex items-center gap-1 rounded border border-[#E8E2D9] px-2.5 py-1.5 font-medium text-[#59644E] disabled:opacity-50">
                    <Send size={12} /> {retryingNotification === type ? 'Sending…' : 'Retry email'}
                  </button>
                </div>
              ))}
            </section>

            {/* Audit Trail / Status History */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-2">
                Order Activity & Status Audit Trail
              </h4>
              <div className="space-y-2">
                {selectedOrder.statusHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-gray-50 border border-gray-200 text-xs flex items-start justify-between"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">{item.status}</span>
                      {item.note && <p className="text-gray-500 mt-0.5">{item.note}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4 text-[11px] text-gray-400">
                      <div>{new Date(item.timestamp).toLocaleString('en-IN')}</div>
                      <div className="font-medium text-gray-600">{item.updatedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-gray-500">Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}

