'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import { FALLBACK_PRODUCTS } from '../../lib/fallbackProducts';
import type { Product, CategorySummary, ProductsResponse, CategoriesResponse } from '../../lib/types';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Package,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Home,
  RotateCcw,
  Truck,
  ShieldCheck,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react';

function formatSlug(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

interface CategoryHeroData {
  badge: string;
  title: string;
  italicWord: string;
  subtitle: string;
  pillSubcategories: { name: string; slug: string | null }[];
}

const CATEGORY_HERO_CONFIG: Record<string, CategoryHeroData> = {
  'office-chairs': {
    badge: 'Precision Ergonomics',
    title: 'High-Performance',
    italicWord: 'Office Chairs',
    subtitle:
      'Engineered for 12+ hour postural alignment, synchronous spine mechanics, breathable Italian mesh, and active lumbar support. Direct from our Bhiwandi manufacturing facility.',
    pillSubcategories: [
      { name: 'All Chairs', slug: null },
      { name: 'Mesh Chairs', slug: 'mesh-chairs' },
      { name: 'Leatherette Chairs', slug: 'leatherette-chairs' },
      { name: 'Workstation Chairs', slug: 'workstation-chairs' },
    ],
  },
  sofas: {
    badge: 'Artisanal Upholstery',
    title: 'Handcrafted',
    italicWord: 'Luxury Sofas',
    subtitle:
      'Kiln-dried solid hardwood joinery, high-resilience foam layered with pocket springs, and rich commercial-grade fabrics tailored for modern homes and executive lounges.',
    pillSubcategories: [
      { name: 'All Sofas', slug: null },
      { name: '3-Seater Sofas', slug: '3-seater-sofa' },
      { name: '2-Seater Sofas', slug: '2-seater-sofa' },
    ],
  },
  'soft-seating': {
    badge: 'Contemporary Architecture',
    title: 'Modern Sculptural',
    italicWord: 'Soft Seating',
    subtitle:
      'Organic silhouettes, acoustic breakout chairs, dining perches, and cafe seating crafted to bring refined warmth and relaxed posture to modern interiors.',
    pillSubcategories: [
      { name: 'All Soft Seating', slug: null },
      { name: 'Lounge Chairs', slug: 'lounge-chairs' },
      { name: 'Dining Chairs', slug: 'dining-chairs' },
      { name: 'Cafe Chairs', slug: 'cafe-chairs' },
    ],
  },
};

const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₹10,000', min: '0', max: '10000' },
  { label: '₹10,000 - ₹20,000', min: '10000', max: '20000' },
  { label: '₹20,000 - ₹40,000', min: '20000', max: '40000' },
  { label: 'Above ₹40,000', min: '40000', max: '' },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL-driven query filters (single source of truth)
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [customMin, setCustomMin] = useState(minPrice);
  const [customMax, setCustomMax] = useState(maxPrice);
  const [searchInput, setSearchInput] = useState(search);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Helper to push updated search params
  const updateUrlParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Reset page to 1 on any filter change unless page itself was updated
    if (!('page' in updates)) {
      params.delete('page');
    }
    const queryString = params.toString();
    router.push(`/products${queryString ? `?${queryString}` : ''}`);
  };

  // Load Categories hierarchy once
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetchApi<CategoriesResponse>('/categories');
        if (isMounted && res.data?.categories) {
          setCategories(res.data.categories);
        }
      } catch {
        // Fallback default category hierarchy
        if (isMounted) {
          setCategories([
            {
              _id: 'cat-01',
              name: 'Office Chairs',
              slug: 'office-chairs',
              subcategories: [
                { _id: 'sub-01', name: 'Mesh Chairs', slug: 'mesh-chairs' },
                { _id: 'sub-02', name: 'Leatherette Chairs', slug: 'leatherette-chairs' },
                { _id: 'sub-03', name: 'Workstation Chairs', slug: 'workstation-chairs' },
              ],
            },
            {
              _id: 'cat-02',
              name: 'Sofas',
              slug: 'sofas',
              subcategories: [
                { _id: 'sub-04', name: '3-Seater Sofa', slug: '3-seater-sofa' },
                { _id: 'sub-05', name: '2-Seater Sofa', slug: '2-seater-sofa' },
              ],
            },
            {
              _id: 'cat-03',
              name: 'Soft Seating',
              slug: 'soft-seating',
              subcategories: [
                { _id: 'sub-06', name: 'Lounge Chairs', slug: 'lounge-chairs' },
                { _id: 'sub-07', name: 'Dining Chairs', slug: 'dining-chairs' },
                { _id: 'sub-08', name: 'Cafe Chairs', slug: 'cafe-chairs' },
              ],
            },
          ]);
        }
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Products based on current filters
  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (search) q.set('q', search);
        if (category) q.set('category', category);
        if (subcategory) q.set('subcategory', subcategory);
        if (sort) q.set('sort', sort);
        if (minPrice) q.set('minPrice', minPrice);
        if (maxPrice) q.set('maxPrice', maxPrice);
        if (inStockOnly) q.set('inStock', 'true');
        q.set('page', String(pageParam));
        q.set('limit', '12');

        const res = await fetchApi<ProductsResponse>(`/products?${q.toString()}`);
        if (!isMounted) return;

        if (res.data?.products) {
          setProducts(res.data.products);
          setTotalPages(res.data.pagination?.totalPages || 1);
          setTotalCount(res.data.pagination?.totalCount || res.data.products.length);
        } else {
          setProducts([]);
          setTotalPages(1);
          setTotalCount(0);
        }
      } catch {
        if (!isMounted) return;
        setProducts([]);
        setTotalPages(1);
        setTotalCount(0);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const filterFallbackData = () => {
      let result = [...FALLBACK_PRODUCTS];

      if (category) {
        result = result.filter((p) => {
          const cSlug = typeof p.category === 'object' ? p.category.slug : p.category;
          return cSlug === category;
        });
      }

      if (subcategory) {
        result = result.filter((p) => {
          const sSlug = typeof p.subcategory === 'object' && p.subcategory ? p.subcategory.slug : p.subcategory;
          return sSlug === subcategory;
        });
      }

      if (search) {
        const qLower = search.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(qLower) ||
            p.description.toLowerCase().includes(qLower) ||
            p.sku.toLowerCase().includes(qLower)
        );
      }

      if (minPrice) {
        result = result.filter((p) => p.sellingPrice >= Number(minPrice));
      }

      if (maxPrice) {
        result = result.filter((p) => p.sellingPrice <= Number(maxPrice));
      }

      if (inStockOnly) {
        result = result.filter((p) => p.stock > 0);
      }

      // Sort
      if (sort === 'price_asc') {
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
      } else if (sort === 'price_desc') {
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
      } else if (sort === 'popular') {
        result.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
      } else if (sort === 'discount') {
        result.sort((a, b) => b.discountPercentage - a.discountPercentage);
      }

      setProducts(result);
      setTotalPages(Math.max(1, Math.ceil(result.length / 12)));
      setTotalCount(result.length);
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [category, subcategory, search, sort, minPrice, maxPrice, inStockOnly, pageParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchInput.trim() });
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ minPrice: customMin, maxPrice: customMax });
  };

  const clearAllFilters = () => {
    setSearchInput('');
    setCustomMin('');
    setCustomMax('');
    router.push('/products');
  };

  // Find active category & subcategory objects
  const activeCategoryDoc = useMemo(
    () => categories.find((c) => c.slug === category),
    [categories, category]
  );

  const activeSubcategoryDoc = useMemo(() => {
    if (activeCategoryDoc?.subcategories) {
      const match = activeCategoryDoc.subcategories.find((s) => s.slug === subcategory);
      if (match) return match;
    }
    return categories.flatMap((c) => c.subcategories || []).find((s) => s.slug === subcategory);
  }, [categories, activeCategoryDoc, subcategory]);

  let pageTitle = 'All Seating Catalogue';
  let pageDesc = 'Browse our complete range of ergonomic office chairs, executive seating, handcrafted sofas, and breakout lounge furniture.';

  if (activeSubcategoryDoc) {
    pageTitle = activeSubcategoryDoc.name;
    pageDesc = `Explore premium ${activeSubcategoryDoc.name.toLowerCase()} engineered for ergonomics, durability, and contemporary style.`;
  } else if (subcategory) {
    pageTitle = formatSlug(subcategory);
  } else if (activeCategoryDoc) {
    pageTitle = activeCategoryDoc.name;
    pageDesc = activeCategoryDoc.description || `Browse ErgoCraft ${activeCategoryDoc.name.toLowerCase()} collection.`;
  } else if (category) {
    pageTitle = formatSlug(category);
  }

  if (search) {
    pageTitle = `Search Results for "${search}"`;
    pageDesc = `Showing available seating matching your search term.`;
  }

  const hasActiveFilters = Boolean(
    category || subcategory || search || inStockOnly || minPrice || maxPrice
  );

  const heroConfig = category ? CATEGORY_HERO_CONFIG[category] : null;
  const pillOptions = heroConfig?.pillSubcategories || [
    { name: 'All Seating', slug: null },
    { name: 'Office Chairs', slug: 'office-chairs' },
    { name: 'Sofas', slug: 'sofas' },
    { name: 'Soft Seating', slug: 'soft-seating' },
  ];

  const handlePillClick = (slug: string | null) => {
    if (category) {
      updateUrlParams({ subcategory: slug });
    } else {
      updateUrlParams({ category: slug, subcategory: null });
    }
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 animate-fade-up">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-1.5 text-xs text-[#73756F]">
          <li>
            <Link href="/" className="hover:text-[#78836A] flex items-center gap-1 transition-colors">
              <Home size={13} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <ChevronRight size={12} className="text-gray-400" />
          </li>
          <li>
            <Link
              href="/products"
              className={`hover:text-[#78836A] transition-colors ${
                !category && !subcategory && !search ? 'text-[#13231D] font-bold' : ''
              }`}
            >
              All Seating
            </Link>
          </li>

          {category && (
            <>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li>
                <Link
                  href={`/products?category=${category}`}
                  className={`hover:text-[#78836A] transition-colors ${
                    !subcategory ? 'text-[#13231D] font-bold' : ''
                  }`}
                >
                  {activeCategoryDoc?.name || formatSlug(category)}
                </Link>
              </li>
            </>
          )}

          {subcategory && (
            <>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li className="text-[#13231D] font-bold">
                {activeSubcategoryDoc?.name || formatSlug(subcategory)}
              </li>
            </>
          )}

          {search && (
            <>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li className="text-[#78836A] font-medium italic">
                &ldquo;{search}&rdquo;
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* 2. Editorial Category Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#13231D] via-[#172C24] to-[#0E1A15] text-white p-6 sm:p-10 lg:p-12 mb-8 shadow-sm">
        {/* Subtle decorative grain background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay bg-repeat"
          style={{ backgroundImage: `url('/images/texture-grain-warm.png')`, backgroundSize: '240px 240px' }}
        />
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-[#CBD5C0] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {heroConfig ? heroConfig.badge : 'Direct Factory Collection'}
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight">
            {heroConfig ? (
              <>
                {heroConfig.title} <span className="italic font-light text-[#D5DFC7]">{heroConfig.italicWord}</span>
              </>
            ) : search ? (
              <>
                Search Results for <span className="italic font-light text-[#D5DFC7]">&ldquo;{search}&rdquo;</span>
              </>
            ) : (
              <>
                The Complete <span className="italic font-light text-[#D5DFC7]">Seating Collection</span>
              </>
            )}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-[#D0D4CD] leading-relaxed max-w-2xl font-light">
            {heroConfig ? heroConfig.subtitle : pageDesc}
          </p>

          {/* Quick Subcategory / Category Switcher Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {pillOptions.map((pill) => {
              const isActive = category
                ? (pill.slug === null && !subcategory) || pill.slug === subcategory
                : (pill.slug === null && !category) || pill.slug === category;
              return (
                <button
                  key={pill.name}
                  onClick={() => handlePillClick(pill.slug)}
                  className={`px-4 py-2 rounded-full text-xs transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#13231D] font-bold shadow-sm'
                      : 'bg-white/10 hover:bg-white/20 text-white/90 border border-white/15 font-medium'
                  }`}
                >
                  {pill.name}
                </button>
              );
            })}
          </div>

          {/* Factory Trust Strip */}
          <div className="pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-[#CBD5C0]">
            <div className="flex items-center gap-2">
              <Truck size={14} className="text-[#A3B396] shrink-0" />
              <span>Pan-India Free Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#A3B396] shrink-0" />
              <span>10-Year Factory Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[#A3B396] shrink-0" />
              <span>Direct Bhiwandi Hub Dispatch</span>
            </div>
            <a
              href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20am%20looking%20for%20seating%20recommendations"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-emerald-300 font-semibold transition"
            >
              <MessageCircle size={14} className="text-emerald-400 shrink-0" />
              <span>WhatsApp: +91 97680 01999</span>
            </a>
          </div>
        </div>
      </div>

      {/* 3. Page Controls Bar */}
      <div className="border-b border-[#E8E5DE] pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#73756F]">
          <span className="font-semibold text-[#13231D]">
            {totalCount} {totalCount === 1 ? 'Design' : 'Designs'}
          </span>
          <span>•</span>
          <span>
            {activeSubcategoryDoc
              ? activeSubcategoryDoc.name
              : activeCategoryDoc
              ? activeCategoryDoc.name
              : 'All Seating'}
          </span>
        </div>

        {/* Top Controls: Search, Filter Toggle, Sort Selector */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden px-3.5 py-2.5 rounded-xl border border-[#E8E5DE] bg-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal size={14} />
            <span>Filters</span>
          </button>

          {/* Quick Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search chairs, sofas..."
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs focus:outline-none focus:border-[#78836A]"
            />
          </form>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateUrlParams({ sort: e.target.value })}
              className="px-3 py-2 rounded-xl border border-[#E8E5DE] bg-white text-xs text-[#242620] font-medium focus:outline-none focus:border-[#78836A] appearance-none pr-8 cursor-pointer shadow-2xs"
            >
              <option value="newest">Sort: Newest</option>
              <option value="popular">Sort: Popular / Bestsellers</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
            </select>
            <ArrowUpDown
              size={12}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#73756F] pointer-events-none"
            />
          </div>
        </div>
      </div>

      {/* 3. Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-[#E8E5DE] mb-8">
          <span className="text-[11px] font-semibold text-[#73756F] uppercase tracking-wider mr-1">
            Active Filters:
          </span>

          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E5DE] text-xs text-[#242620] font-medium shadow-2xs">
              <span>Category: {activeCategoryDoc?.name || formatSlug(category)}</span>
              <button
                onClick={() => updateUrlParams({ category: null, subcategory: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove category"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {subcategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E5DE] text-xs text-[#242620] font-medium shadow-2xs">
              <span>Subcategory: {activeSubcategoryDoc?.name || formatSlug(subcategory)}</span>
              <button
                onClick={() => updateUrlParams({ subcategory: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove subcategory"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {search && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E5DE] text-xs text-[#242620] font-medium shadow-2xs">
              <span>&ldquo;{search}&rdquo;</span>
              <button
                onClick={() => {
                  setSearchInput('');
                  updateUrlParams({ q: null });
                }}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove search"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E5DE] text-xs text-[#242620] font-medium shadow-2xs">
              <span>
                ₹{minPrice || 0} — {maxPrice ? `₹${maxPrice}` : 'Above'}
              </span>
              <button
                onClick={() => {
                  setCustomMin('');
                  setCustomMax('');
                  updateUrlParams({ minPrice: null, maxPrice: null });
                }}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove price filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E5DE] text-xs text-[#242620] font-medium shadow-2xs">
              <span>In Stock Only</span>
              <button
                onClick={() => updateUrlParams({ inStock: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove in-stock filter"
              >
                <X size={13} />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-[#78836A] hover:text-[#59644E] font-semibold underline underline-offset-4 ml-2 cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={12} />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* 4. Main Body: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block bg-white p-6 rounded-2xl border border-[#E8E5DE] shadow-xs space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#13231D] flex items-center gap-2">
              <Filter size={14} className="text-[#78836A]" />
              <span>Filter Catalogue</span>
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-[11px] text-[#78836A] hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Categories & Subcategories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#13231D] uppercase tracking-wide">
              Categories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() => updateUrlParams({ category: null, subcategory: null })}
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition cursor-pointer ${
                  !category
                    ? 'bg-[#13231D] text-white font-semibold'
                    : 'text-[#73756F] hover:bg-[#F7F5F0] hover:text-[#242620]'
                }`}
              >
                All Seating
              </button>

              {categories.map((cat) => (
                <div key={cat._id} className="space-y-1">
                  <button
                    onClick={() => updateUrlParams({ category: cat.slug, subcategory: null })}
                    className={`w-full text-left py-1.5 px-2.5 rounded-lg transition cursor-pointer ${
                      category === cat.slug
                        ? 'bg-[#13231D] text-white font-semibold'
                        : 'text-[#242620] hover:bg-[#F7F5F0]'
                    }`}
                  >
                    {cat.name}
                  </button>

                  {/* Subcategories (if parent category active) */}
                  {category === cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pl-3 space-y-0.5 border-l-2 border-[#78836A]/40 ml-3 py-1">
                      {cat.subcategories.map((sub) => (
                        <button
                          key={sub._id}
                          onClick={() => updateUrlParams({ subcategory: sub.slug })}
                          className={`w-full text-left py-1 px-2 rounded-md text-[11px] transition cursor-pointer ${
                            subcategory === sub.slug
                              ? 'text-[#78836A] font-bold bg-[#F7F5F0]'
                              : 'text-[#73756F] hover:text-[#242620]'
                          }`}
                        >
                          &bull; {sub.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Price Range Filter Presets & Inputs */}
          <div className="pt-4 border-t border-[#E8E5DE] space-y-3">
            <h4 className="text-xs font-bold text-[#13231D] uppercase tracking-wide">
              Price Range
            </h4>
            <div className="space-y-1 text-xs">
              {PRICE_PRESETS.map((preset) => {
                const isSelected = minPrice === preset.min && maxPrice === preset.max;
                return (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setCustomMin(preset.min);
                      setCustomMax(preset.max);
                      updateUrlParams({ minPrice: preset.min, maxPrice: preset.max });
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-md transition cursor-pointer ${
                      isSelected
                        ? 'text-[#78836A] font-bold bg-[#F7F5F0]'
                        : 'text-[#73756F] hover:text-[#242620]'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Range Inputs */}
            <form onSubmit={handlePriceApply} className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={customMin}
                  onChange={(e) => setCustomMin(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-[#E8E5DE] text-xs bg-[#F7F5F0] focus:outline-none focus:border-[#78836A]"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-[#E8E5DE] text-xs bg-[#F7F5F0] focus:outline-none focus:border-[#78836A]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-[#13231D] text-white text-[11px] font-semibold uppercase tracking-wider hover:bg-[#78836A] transition cursor-pointer"
              >
                Apply Range
              </button>
            </form>
          </div>

          {/* Availability */}
          <div className="pt-4 border-t border-[#E8E5DE] space-y-2">
            <h4 className="text-xs font-bold text-[#13231D] uppercase tracking-wide">
              Stock Status
            </h4>
            <label className="flex items-center gap-2.5 text-xs text-[#242620] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateUrlParams({ inStock: e.target.checked ? 'true' : null })}
                className="rounded text-[#78836A] focus:ring-[#78836A]"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area (3-4 Columns Desktop, 2 Columns Tablet/Mobile) */}
        <div className="md:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-[#E8E5DE] p-4 space-y-3 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-xl" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Clean Empty State */
            <div className="p-12 sm:p-16 text-center bg-white rounded-3xl border border-[#E8E5DE] shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#F7F5F0] border border-[#E8E5DE] text-[#78836A] flex items-center justify-center mx-auto">
                <Package size={32} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="font-serif-luxury text-xl font-bold text-[#13231D]">
                  No matching seating found
                </h3>
                <p className="text-xs text-[#73756F] leading-relaxed">
                  We couldn&apos;t find chairs matching the selected filters. Try removing subcategory,
                  query, or price boundaries to view the rest of our collection.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 rounded-xl bg-[#13231D] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#78836A] transition cursor-pointer shadow-xs"
                >
                  Clear All Filters
                </button>
                <Link
                  href="/products?category=office-chairs"
                  className="px-5 py-2.5 rounded-xl border border-[#E8E5DE] bg-white text-xs font-bold text-[#242620] tracking-wider uppercase hover:border-[#78836A] hover:text-[#78836A] transition cursor-pointer"
                >
                  Explore Office Chairs
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t border-[#E8E5DE]">
              <button
                onClick={() => updateUrlParams({ page: String(Math.max(1, pageParam - 1)) })}
                disabled={pageParam <= 1}
                className="p-2.5 rounded-xl border border-[#E8E5DE] bg-white text-gray-700 disabled:opacity-30 hover:bg-[#F7F5F0] cursor-pointer shadow-2xs"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold text-[#242620] px-4">
                Page {pageParam} of {totalPages}
              </span>
              <button
                onClick={() => updateUrlParams({ page: String(Math.min(totalPages, pageParam + 1)) })}
                disabled={pageParam >= totalPages}
                className="p-2.5 rounded-xl border border-[#E8E5DE] bg-white text-gray-700 disabled:opacity-30 hover:bg-[#F7F5F0] cursor-pointer shadow-2xs"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#13231D]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]">
              <h3 className="text-sm font-bold text-[#13231D]">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#13231D] uppercase">Categories</h4>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    updateUrlParams({ category: null, subcategory: null });
                    setMobileFilterOpen(false);
                  }}
                  className={`block w-full text-left py-2 px-2.5 rounded-lg ${
                    !category ? 'bg-[#13231D] text-white font-semibold' : 'text-[#242620]'
                  }`}
                >
                  All Seating
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      updateUrlParams({ category: cat.slug, subcategory: null });
                      setMobileFilterOpen(false);
                    }}
                    className={`block w-full text-left py-2 px-2.5 rounded-lg ${
                      category === cat.slug ? 'bg-[#13231D] text-white font-semibold' : 'text-[#242620]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E5DE] space-y-2">
              <h4 className="text-xs font-bold text-[#13231D] uppercase">Stock Status</h4>
              <label className="flex items-center gap-2 text-xs text-[#242620]">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateUrlParams({ inStock: e.target.checked ? 'true' : null })}
                  className="rounded text-[#78836A]"
                />
                <span>In Stock Only</span>
              </label>
            </div>

            <div className="pt-4 flex gap-2">
              <button
                onClick={() => {
                  clearAllFilters();
                  setMobileFilterOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl border border-[#E8E5DE] text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#13231D] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-12 text-center text-xs text-[#73756F]">
          Loading ErgoCraft catalogue...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
