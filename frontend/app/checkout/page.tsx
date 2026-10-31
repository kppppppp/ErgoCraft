'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../../lib/cart';
import { useAuth } from '../../lib/auth';
import { fetchApi } from '../../lib/api';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Banknote,
  Sparkles,
  MapPin,
  Truck,
  Loader2,
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

interface CreateOrderResponse {
  orderId: string;
  orderNumber: string;
  paymentMethod?: string;
  razorpayOrderId?: string;
  amount?: number;
  currency?: string;
  key?: string;
  order?: ConfirmedOrder;
}

interface ConfirmedOrderItem {
  name: string;
  quantity: number;
  subtotal: number;
}

interface ConfirmedOrder {
  _id: string;
  orderNumber: string;
  paymentStatus: string;
  paymentDetails?: { provider?: string; paymentId?: string };
  items: ConfirmedOrderItem[];
  pricing: {
    subtotal: number;
    chairSubtotal?: number;
    nonChairSubtotal?: number;
    chairDiscountPercentage?: number;
    chairDiscountAmount?: number;
    discount?: number;
    total: number;
  };
  shippingAddress: {
    fullName?: string;
    phone?: string;
    houseNumber?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
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

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface VerifyPaymentResponse {
  order: ConfirmedOrder;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayConstructor {
  new (options: unknown): RazorpayInstance;
}

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    cart,
    cartSubtotal,
    chairSubtotal,
    nonChairSubtotal,
    chairDiscountPercentage,
    chairDiscountAmount,
    finalChairAmount,
    shippingCharges,
    cartTotal,
    clearCart,
  } = useCart();

  // Customer Contact
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Shipping Address Fields
  const [houseNumber, setHouseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [postalCode, setPostalCode] = useState('');

  // Delivery Serviceability State
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryCheckResult | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [codAvailable, setCodAvailable] = useState<boolean>(true);
  const checkoutKeyRef = useRef<string | null>(null);

  // Sync authenticated user profile data
  useEffect(() => {
    const profileTimer = window.setTimeout(() => {
      if (!user) return;
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find((a) => a.isDefault) || user.addresses[0];
        setName(defaultAddr.fullName || user.name || '');
        setPhone(defaultAddr.phone || user.phone || '');
        setHouseNumber(defaultAddr.houseNumber || '');
        setStreet(defaultAddr.street || '');
        setLandmark(defaultAddr.landmark || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || 'Maharashtra');
        setPostalCode(defaultAddr.postalCode || '');
      }
    }, 0);
    return () => window.clearTimeout(profileTimer);
  }, [user]);

  // Check store settings for COD availability
  useEffect(() => {
    fetchApi<{ codEnabled: boolean }>('/settings')
      .then((res) => {
        if (res.data && typeof res.data.codEnabled === 'boolean') {
          setCodAvailable(res.data.codEnabled);
          if (!res.data.codEnabled) {
            setPaymentMethod('razorpay');
          }
        }
      })
      .catch(() => {});
  }, []);

  // Validate delivery serviceability when state or PIN code changes
  useEffect(() => {
    if (!postalCode || postalCode.trim().length !== 6 || !state) {
      setDeliveryStatus(null);
      return;
    }

    const timer = setTimeout(async () => {
      setCheckingDelivery(true);
      try {
        const res = await fetchApi<DeliveryCheckResult>('/settings/check-delivery', {
          method: 'POST',
          body: JSON.stringify({ state, postalCode: postalCode.trim() }),
        });
        setDeliveryStatus(res.data);
      } catch (err: unknown) {
        setDeliveryStatus({
          serviceable: false,
          message: err instanceof Error ? err.message : 'Invalid delivery location',
        });
      } finally {
        setCheckingDelivery(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [state, postalCode]);

  // Load Razorpay checkout script on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 1. Loading state while verifying customer session
  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="w-10 h-10 border-3 border-[#78836A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs font-semibold tracking-wider uppercase text-[#73756F]">
          Verifying Customer Authentication...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Gate
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto border border-amber-200">
          <Lock size={28} />
        </div>
        <h2 className="text-xl font-serif-luxury font-bold text-[#13231D]">
          Customer Sign-In Required
        </h2>
        <p className="text-xs text-[#73756F] leading-relaxed">
          To maintain luxury manufacturing records, 3-year warranty bindings, and tax invoices, ErgoCraft requires customer authentication before placing an order.
        </p>
        <div className="pt-2">
          <Link
            href="/login?returnUrl=/checkout"
            className="w-full py-3 px-6 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold uppercase tracking-wider transition inline-block shadow-xs"
          >
            Sign In to Complete Order
          </Link>
        </div>
      </div>
    );
  }

  // 3. Empty cart gate
  if (cart.length === 0 && !confirmedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] text-[#78836A] flex items-center justify-center mx-auto border border-[#E8E5DE]">
          <ShoppingBag size={28} />
        </div>
        <h2 className="text-xl font-serif-luxury font-bold text-[#13231D]">
          Your Shopping Bag is Empty
        </h2>
        <p className="text-xs text-[#73756F] mb-6">
          Add ergonomic seating products to your bag before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="px-6 py-3 rounded-xl bg-[#13231D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#78836A] transition inline-block"
        >
          Explore Catalogue
        </Link>
      </div>
    );
  }

  // 4. Order Confirmed Success Screen
  if (confirmedOrder) {
    const isCod = confirmedOrder.paymentDetails?.provider === 'cod';

    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
          <CheckCircle2 size={36} />
        </div>
        <div>
          <span className="text-[11px] font-bold text-[#78836A] uppercase tracking-widest block mb-1">
            {isCod ? 'Order Placed (Cash on Delivery)' : 'Order Confirmed & Payment Verified'}
          </span>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#13231D]">
            Thank You for Your Order!
          </h1>
          <p className="text-xs text-[#73756F] mt-2 max-w-md mx-auto leading-relaxed">
            We have dispatched an order confirmation to{' '}
            <strong className="text-[#242620]">{user?.email || email}</strong>.
            Your handcrafted ergonomic seating is now being prepared for shipment.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 text-left space-y-4 shadow-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#E8E5DE] text-xs">
            <span className="font-mono font-bold text-[#13231D]">
              Order Number: #{confirmedOrder.orderNumber}
            </span>
            {isCod ? (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold uppercase text-[10px] border border-amber-200">
                Cash on Delivery (Pay at Doorstep)
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold uppercase text-[10px] border border-emerald-200">
                Verified Paid via Razorpay
              </span>
            )}
          </div>

          {isCod && (
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <Banknote size={16} className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Doorstep Payment:</strong> Please have{' '}
                <strong>₹{confirmedOrder.pricing.total.toLocaleString('en-IN')}</strong> ready in cash or UPI QR scan upon courier delivery.
              </span>
            </div>
          )}

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-[#13231D] uppercase">Ordered Items:</h4>
            {confirmedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center py-1">
                <span className="text-[#242620]">
                  {item.name} &times; <strong>{item.quantity}</strong>
                </span>
                <span className="font-bold text-[#13231D]">
                  ₹{item.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown with Chair Discount */}
          <div className="pt-3 border-t border-[#E8E5DE] space-y-1.5 text-xs text-[#73756F]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#242620]">
                ₹{confirmedOrder.pricing.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {confirmedOrder.pricing.chairDiscountAmount ? (
              <div className="flex justify-between text-emerald-800 font-semibold">
                <span>
                  Additional Chair Discount ({confirmedOrder.pricing.chairDiscountPercentage}%):
                </span>
                <span>-₹{confirmedOrder.pricing.chairDiscountAmount.toLocaleString('en-IN')}</span>
              </div>
            ) : null}
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-emerald-800 font-bold">FREE</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E8E5DE] flex justify-between text-sm font-bold text-[#13231D]">
            <span>{isCod ? 'Payable upon Delivery' : 'Total Amount Paid'}</span>
            <span className="text-[#78836A]">
              ₹{confirmedOrder.pricing.total.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-2 text-xs text-[#73756F] border-t border-[#E8E5DE]">
            <p>
              <strong className="text-[#242620]">Shipping Destination:</strong>{' '}
              {confirmedOrder.shippingAddress.houseNumber ? `${confirmedOrder.shippingAddress.houseNumber}, ` : ''}
              {confirmedOrder.shippingAddress.street}, {confirmedOrder.shippingAddress.city},{' '}
              {confirmedOrder.shippingAddress.state} - {confirmedOrder.shippingAddress.postalCode}
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#13231D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#78836A] transition"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E8E5DE] bg-white text-[#242620] text-xs font-bold uppercase tracking-wider hover:bg-[#F7F5F0] transition"
          >
            View in My Orders
          </Link>
        </div>
      </div>
    );
  }

  // 5. Checkout submission and Razorpay payment flow
  const isDeliveryBlocked = deliveryStatus ? !deliveryStatus.serviceable : false;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !phone.trim() || !street.trim() || !city.trim() || !state.trim() || !postalCode.trim()) {
      setError('Please complete all required shipping and contact details.');
      return;
    }

    if (isDeliveryBlocked) {
      setError(deliveryStatus?.message || 'Sorry! ErgoCraft currently does not offer delivery services to your location.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create Pending Order on backend with authenticated user & chosen payment method
      const orderPayload = {
        items: cart.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        customerDetails: { name: name.trim(), email: user.email, phone: phone.trim() },
        shippingAddress: {
          fullName: name.trim(),
          phone: phone.trim(),
          houseNumber: houseNumber.trim(),
          street: street.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: 'India',
        },
        paymentMethod,
      };

      const createRes = await fetchApi<CreateOrderResponse>('/orders/create', {
        method: 'POST',
        headers: {
          'Idempotency-Key':
            checkoutKeyRef.current ||
            (checkoutKeyRef.current =
              typeof window !== 'undefined'
                ? sessionStorage.getItem('ergocraft_checkout_request_key') || crypto.randomUUID()
                : crypto.randomUUID()),
        },
        body: JSON.stringify(orderPayload),
      });

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ergocraft_checkout_request_key', checkoutKeyRef.current || '');
      }

      const orderData = createRes.data;

      // Handle Cash on Delivery (COD) Direct Confirmation
      if (paymentMethod === 'cod') {
        let persistedOrder = orderData.order;
        if (!persistedOrder) {
          const orderResponse = await fetchApi<{ order: ConfirmedOrder }>(`/orders/${orderData.orderId}`);
          persistedOrder = orderResponse.data.order;
        }
        if (!persistedOrder) {
          throw new Error('The order was created, but its saved details could not be loaded. Please check My Account before retrying.');
        }
        clearCart();
        checkoutKeyRef.current = null;
        if (typeof window !== 'undefined') sessionStorage.removeItem('ergocraft_checkout_request_key');
        setConfirmedOrder(persistedOrder);
        setSubmitting(false);
        return;
      }

      // 2. Ensure Razorpay checkout script is loaded
      if (typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay payment gateway failed to load. Please refresh and try again.');
      }

      // 3. Open Real Razorpay modal
      const options = {
        key: orderData.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_TtKzIokXKQXVZ3',
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Ergocraft Seating Pvt. Ltd.',
        description: `Order #${orderData.orderNumber}`,
        image: '/images/logo.png',
        order_id: orderData.razorpayOrderId,
        handler: async function (response: RazorpaySuccessResponse) {
          try {
            const verifyRes = await fetchApi<VerifyPaymentResponse>('/orders/verify-payment', {
              method: 'POST',
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            clearCart();
            checkoutKeyRef.current = null;
            if (typeof window !== 'undefined') sessionStorage.removeItem('ergocraft_checkout_request_key');
            setConfirmedOrder(verifyRes.data.order);
          } catch (verifyErr: unknown) {
            setError(
              verifyErr instanceof Error
                ? verifyErr.message
                : 'Payment was captured but verification timed out. Our team is finalizing your order.'
            );
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: name.trim(),
          email: user.email,
          contact: phone.trim(),
        },
        theme: {
          color: '#13231D',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order creation failed. Please try again.';
      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Checkout Header */}
      <div className="border-b border-[#E8E5DE] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif-luxury text-3xl font-bold text-[#13231D]">
            Secure Checkout
          </h1>
          <p className="text-xs text-[#73756F] mt-1">
            Complete your delivery details for expedited dispatch.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#73756F] bg-[#FAF8F5] px-3.5 py-2 rounded-xl border border-[#E8E5DE]">
          <ShieldCheck size={16} className="text-emerald-700" />
          <span>
            Authenticated Account: <strong className="text-[#13231D]">{user.email}</strong>
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form: Customer & Shipping Details (Span 7) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Customer Details */}
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A]">
              1. Customer Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#242620] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242620] mb-1">
                  Mobile Number (for Courier SMS) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#242620] mb-1">
                  Email Address (Verified Account) *
                </label>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A] flex items-center gap-2">
                <MapPin size={15} />
                <span>2. Delivery Address</span>
              </h3>
              {checkingDelivery && (
                <span className="text-[11px] text-[#78836A] flex items-center gap-1 font-medium">
                  <Loader2 size={12} className="animate-spin" />
                  Checking serviceability...
                </span>
              )}
            </div>

            {/* Delivery Serviceability Feedback Alert */}
            {deliveryStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  deliveryStatus.serviceable
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                {deliveryStatus.serviceable ? (
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold block">{deliveryStatus.message}</span>
                  {!deliveryStatus.serviceable && (
                    <span className="text-[11px] text-rose-700 block mt-0.5">
                      Please enter a serviceable delivery address to complete your purchase.
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    House / Building No.
                  </label>
                  <input
                    type="text"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    placeholder="e.g. Flat 402, B-Wing"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Street / Locality *
                  </label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. Highline Residency, Linking Road"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    Landmark (Optional)
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="e.g. Near Linking Road"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    State (Indian State / UT) *
                  </label>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                  >
                    <option value="">Select Indian State...</option>
                    {ALL_INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#242620] mb-1">
                    PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[1-9][0-9]{5}"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 400050"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-[#E8E5DE] bg-[#F7F5F0]/50 text-[#242620] focus:outline-none focus:border-[#78836A] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Select Payment Method */}
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A]">
                3. Choose Payment Mode
              </h3>
              <span className="text-[10px] text-[#73756F]">Step 3 of 3</span>
            </div>

            <div className="space-y-3">
              {/* Online Payment via Razorpay */}
              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition cursor-pointer ${
                  paymentMethod === 'razorpay'
                    ? 'border-[#78836A] bg-[#FAF8F5]'
                    : 'border-[#E8E5DE] hover:border-gray-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="mt-0.5 accent-[#78836A]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-[#78836A]" />
                      <span className="text-xs font-bold text-[#13231D]">
                        Online Payment (UPI, Cards, NetBanking)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Instant Confirmation
                    </span>
                  </div>
                  <p className="text-[11px] text-[#73756F] mt-1">
                    Powered by Razorpay Secure Gateway. Pay seamlessly via GPay, PhonePe, Paytm, Debit/Credit Cards.
                  </p>
                </div>
              </label>

              {/* Cash on Delivery (COD) Option */}
              <label
                onClick={() => {
                  if (codAvailable) setPaymentMethod('cod');
                }}
                className={`flex items-start gap-3.5 p-4 rounded-xl border transition ${
                  !codAvailable
                    ? 'opacity-60 bg-gray-50 border-gray-200 cursor-not-allowed'
                    : paymentMethod === 'cod'
                    ? 'border-[#78836A] bg-[#FAF8F5] cursor-pointer'
                    : 'border-[#E8E5DE] hover:border-gray-300 bg-white cursor-pointer'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  disabled={!codAvailable}
                  checked={paymentMethod === 'cod'}
                  onChange={() => {
                    if (codAvailable) setPaymentMethod('cod');
                  }}
                  className="mt-0.5 accent-[#78836A]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Banknote size={16} className="text-[#78836A]" />
                      <span className="text-xs font-bold text-[#13231D]">Cash on Delivery</span>
                    </div>
                    {codAvailable ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        COD Available
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        Admin Disabled
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#73756F] mt-1">
                    {codAvailable
                      ? 'Pay with cash or scan delivery agent’s UPI QR upon arrival at your doorstep.'
                      : 'Cash on Delivery is temporarily unavailable. Please pay online.'}
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Summary: Order Totals & Payment (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-6 space-y-4 shadow-xs sticky top-28">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#78836A]">
              Order Summary ({cart.length} unique items)
            </h3>

            {/* Items mini list */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1 divide-y divide-[#E8E5DE]">
              {cart.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 pt-3 first:pt-0">
                  <div className="w-12 h-12 rounded-xl bg-[#F7F5F0] border border-[#E8E5DE] overflow-hidden shrink-0 flex items-center justify-center">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag size={20} className="text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-[#242620] truncate">{item.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#73756F]">Qty: {item.quantity}</span>
                      {item.isChair && (
                        <span className="text-[9px] font-bold uppercase text-[#78836A]">
                          Chair Offer
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#13231D]">
                    ₹{(item.sellingPrice * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {/* Transparent Price Calculations */}
            <div className="pt-4 border-t border-[#E8E5DE] space-y-2 text-xs text-[#73756F]">
              {chairSubtotal > 0 && (
                <>
                  <div className="flex justify-between">
                    <span>Chair Subtotal</span>
                    <span className="font-semibold text-[#242620]">
                      ₹{chairSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-[#A8A29E]">
                    <span>Existing Product Discounts</span>
                    <span>Already reflected in prices</span>
                  </div>

                  {chairDiscountAmount > 0 && (
                    <>
                      <div className="flex justify-between text-emerald-800 font-semibold">
                        <span className="flex items-center gap-1">
                          <Sparkles size={12} />
                          <span>Additional Chair Discount ({chairDiscountPercentage}%)</span>
                        </span>
                        <span>-₹{chairDiscountAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[#13231D] font-medium text-[11px] pb-1">
                        <span>Final Chair Amount</span>
                        <span>₹{finalChairAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {nonChairSubtotal > 0 && (
                <div className="flex justify-between pt-1 border-t border-dashed border-[#E8E5DE]">
                  <span>Other Products (Sofas / Accessories)</span>
                  <span className="font-semibold text-[#242620]">
                    ₹{nonChairSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-1">
                <span>Shipping Charges</span>
                <span className="text-emerald-800 font-bold">FREE (Complimentary)</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax</span>
                <span className="text-emerald-800 font-medium">Included in product price</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#E8E5DE] text-base font-bold text-[#13231D]">
                <span>Total Payable</span>
                <span className="text-[#78836A]">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Blocked Delivery Banner above Submit Button */}
            {isDeliveryBlocked && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <span>
                  Delivery is unavailable to {state}. Please choose a serviceable address to place order.
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || isDeliveryBlocked}
              className="w-full py-4 px-4 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : isDeliveryBlocked ? (
                <span>Delivery Unavailable for Address</span>
              ) : paymentMethod === 'cod' ? (
                <>
                  <Banknote size={16} />
                  <span>Confirm COD Order (₹{cartTotal.toLocaleString('en-IN')})</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Pay ₹{cartTotal.toLocaleString('en-IN')} via Razorpay</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[10px] text-[#73756F] space-y-1">
              {paymentMethod === 'cod' ? (
                <p className="flex items-center justify-center gap-1.5 font-medium text-amber-800">
                  <Banknote size={13} className="text-[#78836A]" />
                  <span>Cash on Delivery: Payment will be collected at doorstep</span>
                </p>
              ) : (
                <p className="flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck size={13} className="text-emerald-700" />
                  <span>100% Encrypted Payment via Razorpay Test Gateway</span>
                </p>
              )}
              <p>Pan-India Free Doorstep Delivery &bull; 3-Year Comprehensive Warranty</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
