'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Product } from './types';
import { useAuth } from './auth';
import { fetchApi } from './api';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  slug: string;
  sellingPrice: number;
  mrp: number;
  image: string;
  quantity: number;
  maxStock: number;
  isChair?: boolean;
}

export interface ChairDiscountConfig {
  enabled: boolean;
  tier1Threshold: number;
  tier1Percentage: number;
  tier2Threshold: number;
  tier2Percentage: number;
}

const DEFAULT_DISCOUNT_CONFIG: ChairDiscountConfig = {
  enabled: true,
  tier1Threshold: 25000,
  tier1Percentage: 5,
  tier2Threshold: 50000,
  tier2Percentage: 7,
};

export const checkIsChair = (p: {
  name?: string;
  slug?: string;
  category?: unknown;
  subcategory?: unknown;
}): boolean => {
  const name = String(p.name || '').toLowerCase();
  const slug = String(p.slug || '').toLowerCase();

  // Explicit non-chairs
  if (
    name.includes('sofa') ||
    slug.includes('sofa') ||
    name.includes('bench') ||
    slug.includes('bench') ||
    name.includes('pouf') ||
    slug.includes('pouf') ||
    name.includes('table') ||
    slug.includes('table')
  ) {
    return false;
  }

  const catObj = typeof p.category === 'object' && p.category !== null ? (p.category as { slug?: string; name?: string }) : null;
  const subcatObj = typeof p.subcategory === 'object' && p.subcategory !== null ? (p.subcategory as { slug?: string; name?: string }) : null;

  const catSlug = catObj?.slug ? String(catObj.slug).toLowerCase() : (typeof p.category === 'string' ? p.category.toLowerCase() : '');
  const catName = catObj?.name ? String(catObj.name).toLowerCase() : '';
  const subcatSlug = subcatObj?.slug ? String(subcatObj.slug).toLowerCase() : (typeof p.subcategory === 'string' ? p.subcategory.toLowerCase() : '');
  const subcatName = subcatObj?.name ? String(subcatObj.name).toLowerCase() : '';

  if (catSlug === 'office-chairs' || catName.includes('chair') || catSlug.includes('chair')) return true;
  if (subcatName.includes('chair') || subcatSlug.includes('chair')) return true;
  if (name.includes('chair') || slug.includes('chair')) return true;

  return false;
};

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  chairSubtotal: number;
  nonChairSubtotal: number;
  chairDiscountPercentage: number;
  chairDiscountAmount: number;
  finalChairAmount: number;
  shippingCharges: number;
  cartTotal: number;
  bannerMessage: string;
  progressMessage: string;
  discountConfig: ChairDiscountConfig;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  cartCount: 0,
  cartSubtotal: 0,
  chairSubtotal: 0,
  nonChairSubtotal: 0,
  chairDiscountPercentage: 0,
  chairDiscountAmount: 0,
  finalChairAmount: 0,
  shippingCharges: 0,
  cartTotal: 0,
  bannerMessage: '',
  progressMessage: '',
  discountConfig: DEFAULT_DISCOUNT_CONFIG,
  isOpen: false,
  openCart: () => {},
  closeCart: () => {},
  addToCart: () => {},
  updateQuantity: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const [discountConfig, setDiscountConfig] = useState<ChairDiscountConfig>(DEFAULT_DISCOUNT_CONFIG);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ergocraft_cart');
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isOpen, setIsOpen] = useState(false);
  const syncedUserId = useRef<string | null>(null);
  const cartRef = useRef(cart);
  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  // Fetch live discount settings from backend
  useEffect(() => {
    fetchApi<{ chairDiscount?: Partial<ChairDiscountConfig> }>('/settings')
      .then((res) => {
        if (res.data?.chairDiscount) {
          setDiscountConfig({
            enabled: res.data.chairDiscount.enabled ?? true,
            tier1Threshold: Number(res.data.chairDiscount.tier1Threshold) || DEFAULT_DISCOUNT_CONFIG.tier1Threshold,
            tier1Percentage: Number(res.data.chairDiscount.tier1Percentage) || DEFAULT_DISCOUNT_CONFIG.tier1Percentage,
            tier2Threshold: Number(res.data.chairDiscount.tier2Threshold) || DEFAULT_DISCOUNT_CONFIG.tier2Threshold,
            tier2Percentage: Number(res.data.chairDiscount.tier2Percentage) || DEFAULT_DISCOUNT_CONFIG.tier2Percentage,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      const hadAccountCart = syncedUserId.current !== null;
      syncedUserId.current = null;
      if (hadAccountCart) setCart([]);
      return;
    }
    const userId = String(user.id);
    if (syncedUserId.current === userId) return;
    let active = true;
    const merge = async () => {
      try {
        const result = await fetchApi<{ items: CartItem[] }>('/auth/cart/merge', {
          method: 'POST',
          body: JSON.stringify({ items: cartRef.current }),
        });
        if (!active) return;
        syncedUserId.current = userId;
        localStorage.removeItem('ergocraft_cart');
        const mergedItems = (result.data.items || []).map((it) => ({
          ...it,
          isChair: it.isChair !== undefined ? it.isChair : checkIsChair(it),
        }));
        setCart(mergedItems);
      } catch (error) {
        console.error('[Cart] Failed to merge guest cart with account cart:', error);
      }
    };
    merge();
    return () => {
      active = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || syncedUserId.current !== String(user.id)) return;
    fetchApi('/auth/cart', { method: 'PUT', body: JSON.stringify({ items: cart }) }).catch((error) => {
      console.error('[Cart] Failed to save account cart:', error);
    });
  }, [cart, user]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.removeItem('ergocraft_cart');
      } else {
        localStorage.setItem('ergocraft_cart', JSON.stringify(cart));
      }
    } catch {
      // Ignore write errors
    }
  }, [cart, user]);

  const addToCart = (product: Product, quantity = 1) => {
    const primaryImg = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const imgUrl = primaryImg?.url || '';
    const isChair = checkIsChair(product);

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock || 99);
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: nextQty, isChair } : item
        );
      } else {
        return [
          ...prev,
          {
            productId: product._id,
            name: product.name,
            sku: product.sku,
            slug: product.slug,
            sellingPrice: product.sellingPrice,
            mrp: product.mrp,
            image: imgUrl,
            quantity: Math.min(quantity, product.stock || 99),
            maxStock: product.stock || 99,
            isChair,
          },
        ];
      }
    });

    setIsOpen(true);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.maxStock) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.sellingPrice * item.quantity, 0);

  // Calculate qualifying chair subtotal separately
  let chairSubtotal = 0;
  let nonChairSubtotal = 0;

  for (const item of cart) {
    const isChair = item.isChair !== undefined ? item.isChair : checkIsChair(item);
    const itemSubtotal = item.sellingPrice * item.quantity;
    if (isChair) {
      chairSubtotal += itemSubtotal;
    } else {
      nonChairSubtotal += itemSubtotal;
    }
  }

  // Calculate discount tier
  let chairDiscountPercentage = 0;
  let chairDiscountAmount = 0;
  let bannerMessage = '';
  let progressMessage = '';

  if (discountConfig.enabled && chairSubtotal > 0) {
    if (chairSubtotal >= discountConfig.tier2Threshold) {
      chairDiscountPercentage = discountConfig.tier2Percentage;
      chairDiscountAmount = Math.round(chairSubtotal * (chairDiscountPercentage / 100));
      bannerMessage = `Congratulations! You unlocked an additional ${chairDiscountPercentage}% discount on your chair purchase.`;
    } else if (chairSubtotal >= discountConfig.tier1Threshold) {
      chairDiscountPercentage = discountConfig.tier1Percentage;
      chairDiscountAmount = Math.round(chairSubtotal * (chairDiscountPercentage / 100));
      bannerMessage = `Congratulations! You unlocked an additional ${chairDiscountPercentage}% discount on your chair purchase.`;
      const needed = discountConfig.tier2Threshold - chairSubtotal;
      progressMessage = `Add ₹${needed.toLocaleString('en-IN')} more in eligible chairs to unlock an additional ${discountConfig.tier2Percentage}% discount.`;
    } else {
      const needed = discountConfig.tier1Threshold - chairSubtotal;
      progressMessage = `Add ₹${needed.toLocaleString('en-IN')} more in eligible chairs to unlock an additional ${discountConfig.tier1Percentage}% discount.`;
    }
  }

  const finalChairAmount = chairSubtotal - chairDiscountAmount;
  // 100% Free Pan-India Delivery on all orders (₹0)
  const shippingCharges = 0;
  const cartTotal = cartSubtotal - chairDiscountAmount;

  return (
    <CartContext.Provider
      value={{
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
        discountConfig,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
