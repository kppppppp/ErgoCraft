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
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  shippingCharges: number;
  cartTotal: number;
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
  shippingCharges: 0,
  cartTotal: 0,
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
  useEffect(() => { cartRef.current = cart; }, [cart]);

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
          method: 'POST', body: JSON.stringify({ items: cartRef.current }),
        });
        if (!active) return;
        syncedUserId.current = userId;
        localStorage.removeItem('ergocraft_cart');
        setCart(result.data.items || []);
      } catch (error) {
        console.error('[Cart] Failed to merge guest cart with account cart:', error);
      }
    };
    merge();
    return () => { active = false; };
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
      // Ignore write errors (e.g. storage quota)
    }
  }, [cart, user]);

  const addToCart = (product: Product, quantity = 1) => {
    const primaryImg = product.images?.find((img) => img.isPrimary) || product.images?.[0];
    const imgUrl = primaryImg?.url || '';

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        const nextQty = Math.min(existing.quantity + quantity, product.stock || 99);
        return prev.map((item) =>
          item.productId === product._id ? { ...item, quantity: nextQty } : item
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
  // 100% Free Pan-India Delivery on all orders (₹0)
  const shippingCharges = 0;
  const cartTotal = cartSubtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        shippingCharges,
        cartTotal,
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
