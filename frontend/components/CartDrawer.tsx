'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '../lib/cart';
import { useAuth } from '../lib/auth';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Truck,
  Lock,
  Sparkles,
  Tag,
  CheckCircle2,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { user } = useAuth();
  const {
    cart,
    cartCount,
    cartSubtotal,
    chairSubtotal,
    nonChairSubtotal,
    chairDiscountPercentage,
    chairDiscountAmount,
    finalChairAmount,
    shippingCharges,
    cartTotal,
    bannerMessage,
    progressMessage,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#13231D]/60 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col transition-transform duration-300">
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#E8E5DE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag size={20} className="text-[#78836A]" />
            <h2 className="text-base font-semibold text-[#13231D]">Your Shopping Bag</h2>
            <span className="text-xs text-[#73756F]">({cartCount} items)</span>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-full text-[#73756F] hover:text-[#242620] hover:bg-[#EFEEE8] transition cursor-pointer"
            aria-label="Close cart drawer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Announcement */}
        <div className="bg-[#F7F5F0] p-3 border-b border-[#E8E5DE] text-xs">
          <div className="flex items-center gap-2 text-[#242620] font-medium">
            <Truck size={14} className="text-[#78836A] shrink-0" />
            <span className="text-emerald-800 font-semibold text-[11px]">
              Complimentary Pan-India Free Delivery on All Orders
            </span>
          </div>
        </div>

        {/* Automatic Chair Discount Indicators */}
        {cart.length > 0 && (bannerMessage || progressMessage) && (
          <div className="border-b border-[#E8E5DE]">
            {bannerMessage && (
              <div className="bg-emerald-50/90 border-b border-emerald-100 p-3 px-4 flex items-center gap-2 text-xs text-emerald-900 font-semibold">
                <Sparkles size={15} className="text-emerald-600 shrink-0" />
                <span>{bannerMessage}</span>
              </div>
            )}
            {progressMessage && (
              <div className="bg-[#FAF8F5] p-2.5 px-4 flex items-center gap-2 text-[11px] text-[#73756F]">
                <Tag size={13} className="text-[#78836A] shrink-0" />
                <span>{progressMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E8E5DE]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F5F0] border border-[#E8E5DE] text-[#78836A] flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={32} />
              </div>
              <p className="text-base font-semibold text-[#13231D] mb-1">Your bag is empty</p>
              <p className="text-xs text-[#73756F] mb-6 max-w-xs">
                Explore our collection of ergonomic office chairs, handcrafted sofas, and lounge seating.
              </p>
              <button
                onClick={closeCart}
                className="px-6 py-2.5 rounded-xl bg-[#13231D] text-white text-xs font-semibold tracking-wider uppercase hover:bg-[#78836A] transition cursor-pointer shadow-xs"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="py-4 flex gap-4 first:pt-0">
                <div className="w-20 h-20 bg-[#F7F5F0] rounded-xl border border-[#E8E5DE] overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag size={24} className="text-gray-300" />
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#242620] line-clamp-1 leading-snug">
                        {item.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="font-mono text-[10px] text-[#73756F]">{item.sku}</p>
                      {item.isChair && (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 bg-[#FAF8F5] text-[#78836A] rounded border border-[#E8E5DE]">
                          Chair Offer Eligible
                        </span>
                      )}
                    </div>
                    <div className="mt-1 font-bold text-sm text-[#13231D]">
                      ₹{item.sellingPrice.toLocaleString('en-IN')}
                      {item.mrp > item.sellingPrice && (
                        <span className="text-[11px] text-gray-400 line-through ml-2 font-normal">
                          ₹{item.mrp.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#E8E5DE] rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-[#F7F5F0] text-gray-600 transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        className="p-1 hover:bg-[#F7F5F0] text-gray-600 disabled:opacity-30 transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-gray-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
                      title="Remove from bag"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer with Transparent Breakdown */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-[#E8E5DE] bg-[#F7F5F0] space-y-3">
            <div className="space-y-1.5 text-xs text-[#73756F]">
              {/* Chair Subtotal Breakdown */}
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
                      <div className="flex justify-between text-xs text-[#13231D] font-medium pb-1">
                        <span>Final Chair Amount</span>
                        <span>₹{finalChairAmount.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* Other Products Subtotal (Sofas / Accessories) */}
              {nonChairSubtotal > 0 && (
                <div className="flex justify-between pt-1 border-t border-dashed border-[#E8E5DE]">
                  <span>Other Products (Sofas / Accessories)</span>
                  <span className="font-semibold text-[#242620]">
                    ₹{nonChairSubtotal.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="flex justify-between pt-1">
                <span>Estimated Shipping</span>
                <span className="text-emerald-800 font-bold">FREE</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-[#E8E5DE] text-sm font-bold text-[#13231D]">
                <span>Estimated Total</span>
                <span className="text-[#78836A]">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <Link
              href={user ? '/checkout' : '/login?returnUrl=/checkout'}
              onClick={closeCart}
              className="w-full py-3.5 px-4 rounded-xl bg-[#13231D] hover:bg-[#78836A] text-white text-xs font-bold tracking-wider uppercase transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              {user ? <ArrowRight size={16} /> : <Lock size={15} />}
              <span>{user ? 'Proceed to Checkout' : 'Sign In & Checkout'}</span>
            </Link>

            <p className="text-[10px] text-center text-[#73756F]">
              {user
                ? 'All prices include GST • 100% Secure Razorpay Payment'
                : 'Account login is strictly required to place an order'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
