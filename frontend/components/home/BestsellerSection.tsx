'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '../ProductCard';
import { fetchApi } from '../../lib/api';
import { FALLBACK_PRODUCTS } from '../../lib/fallbackProducts';
import type { Product, ProductsResponse, FeaturedBestsellersResponse } from '../../lib/types';
import { ArrowRight, Sparkles } from 'lucide-react';

const TABS = [
  { id: 'all', label: 'All Bestsellers' },
  { id: 'office-chairs', label: 'Office Chairs' },
  { id: 'sofas', label: 'Luxury Sofas' },
  { id: 'soft-seating', label: 'Soft Seating' },
];

export const BestsellerSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadBestsellers = async () => {
      try {
        // Try getting featured bestsellers or products list
        const res = await fetchApi<FeaturedBestsellersResponse | ProductsResponse>(
          '/products?isBestseller=true&limit=12'
        );

        if (!isMounted) return;

        if ('products' in res.data && Array.isArray(res.data.products) && res.data.products.length > 0) {
          setProducts(res.data.products);
        } else if (
          'bestsellers' in res.data &&
          Array.isArray(res.data.bestsellers) &&
          res.data.bestsellers.length > 0
        ) {
          setProducts(res.data.bestsellers);
        } else {
          setProducts(FALLBACK_PRODUCTS);
        }
      } catch {
        // Graceful fallback to real seed catalogue
        if (isMounted) setProducts(FALLBACK_PRODUCTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadBestsellers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    const catSlug =
      typeof p.category === 'object' && p.category !== null
        ? p.category.slug
        : typeof p.category === 'string'
        ? p.category
        : '';
    return catSlug === activeTab;
  });

  return (
    <section className="bg-[#EFEEE8]/50 py-16 sm:py-20 border-y border-[#E8E5DE]">
      <div className="w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#70775D] mb-2">
              <Sparkles size={13} />
              <span>ERGO COMFORT, EXPERTLY CRAFTED</span>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[44px] font-normal tracking-tight text-[#20251F] leading-[1.08]">
              <span>Bestsellers &</span>{' '}
              <span className="italic font-serif text-[#78836A] font-light">Popular Seating.</span>
            </h2>
            <p className="text-sm text-[#73756F] font-light mt-2 max-w-xl">
              Engineered for sustained focus and luxurious comfort. Explore our most sought-after
              workplace and hospitality seating.
            </p>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-[#F7F5F0] p-1 sm:p-1.5 rounded-xl border border-[#E8E5DE] self-start md:self-auto w-full sm:w-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[11px] sm:text-xs font-semibold tracking-wider transition cursor-pointer flex-1 sm:flex-initial text-center ${
                  activeTab === tab.id
                    ? 'bg-[#13231D] text-white shadow-xs'
                    : 'text-[#73756F] hover:text-[#242620]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8E5DE] p-3 sm:p-4 space-y-3 sm:space-y-4">
                <div className="aspect-square bg-gray-200 rounded-xl" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Product Grid: 4 columns desktop, 3 tablet, 2 mobile */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {/* Empty state if no products matched filter */}
        {!loading && filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl border border-[#E8E5DE] p-12 text-center max-w-md mx-auto space-y-3">
            <h3 className="font-serif-luxury text-lg font-bold text-[#242620]">
              No seating currently available in this category
            </h3>
            <p className="text-xs text-[#73756F]">
              Browse our complete catalogue to view all published chairs, sofas, and soft seating.
            </p>
            <button
              onClick={() => setActiveTab('all')}
              className="px-5 py-2 rounded-lg bg-[#13231D] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#78836A] transition"
            >
              Reset Tab Filter
            </button>
          </div>
        )}

        {/* Bottom CTA to view all */}
        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white border border-[#E8E5DE] text-[#13231D] text-xs font-bold tracking-wider uppercase hover:border-[#78836A] hover:text-[#78836A] transition shadow-xs group"
          >
            <span>View All Products in Catalogue</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
};
