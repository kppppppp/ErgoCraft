'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';
import { ProductCard } from '../../components/ProductCard';
import { FALLBACK_PRODUCTS } from '../../lib/fallbackProducts';
import type { Product, CategorySummary, ProductsResponse } from '../../lib/types';
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
  Tag,
  Layers,
} from 'lucide-react';

function formatSlug(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const PRICE_PRESETS = [
  { label: 'All Prices', min: '', max: '' },
  { label: 'Under ₹10,000', min: '0', max: '10000' },
  { label: '₹10,000 - ₹20,000', min: '10000', max: '20000' },
  { label: '₹20,000 - ₹40,000', min: '20000', max: '40000' },
  { label: 'Above ₹40,000', min: '40000', max: '' },
];

const MATERIAL_FILTER_OPTIONS = [
  { label: 'All Materials', value: '' },
  { label: 'Leatherette', value: 'Leatherette' },
  { label: 'Mesh', value: 'Mesh' },
  { label: 'Fabric / Cushion', value: 'Fabric' },
  { label: 'Velvet', value: 'Velvet' },
  { label: 'Solid Wood / Bentwood', value: 'Wood' },
];

const BACKREST_FILTER_OPTIONS = [
  { label: 'All Backrests', value: '' },
  { label: 'High Back', value: 'High Back' },
  { label: 'Medium Back', value: 'Medium Back' },
  { label: 'Low Back', value: 'Low Back' },
];

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL-driven query filters (single source of truth)
  const category = searchParams.get('category') || '';
  const subcategory = searchParams.get('subcategory') || '';
  const classification = searchParams.get('classification') || '';
  const material = searchParams.get('material') || '';
  const backrestHeight = searchParams.get('backrestHeight') || '';
  const search = searchParams.get('q') || '';
  const sort = searchParams.get('sort') || 'newest';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const inStockOnly = searchParams.get('inStock') === 'true';

  const [products, setProducts] = useState<Product[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategorySummary[]>([]);
  const [flatCategories, setFlatCategories] = useState<CategorySummary[]>([]);
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

  // Load Categories hierarchy from backend
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        let tree: CategorySummary[] = [];
        try {
          const res = await fetchApi<{ tree?: CategorySummary[]; categories?: CategorySummary[] }>(
            '/categories',
            { cache: 'no-store' }
          );
          tree = res.data?.categories || res.data?.tree || [];
        } catch {
          const res = await fetchApi<{ tree?: CategorySummary[]; categories?: CategorySummary[] }>(
            '/categories/tree',
            { cache: 'no-store' }
          );
          tree = res.data?.tree || res.data?.categories || [];
        }

        if (isMounted && tree.length > 0) {
          setCategoryTree(tree);

          // Flatten tree for easy slug lookups
          const flat: CategorySummary[] = [];
          const traverse = (nodes: CategorySummary[]) => {
            nodes.forEach((n) => {
              flat.push(n);
              if (n.children && n.children.length > 0) traverse(n.children);
              if (n.subcategories && n.subcategories.length > 0) traverse(n.subcategories);
            });
          };
          traverse(tree);
          setFlatCategories(flat);
        }
      } catch {
        // Fallback hierarchy if offline
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
        if (classification) q.set('classification', classification);
        if (material) q.set('material', material);
        if (backrestHeight) q.set('backrestHeight', backrestHeight);
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
        // Fallback client filtering if backend unreachable
        filterFallback();
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const filterFallback = () => {
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

      if (minPrice) result = result.filter((p) => p.sellingPrice >= Number(minPrice));
      if (maxPrice) result = result.filter((p) => p.sellingPrice <= Number(maxPrice));
      if (inStockOnly) result = result.filter((p) => p.stock > 0);

      setProducts(result);
      setTotalPages(Math.max(1, Math.ceil(result.length / 12)));
      setTotalCount(result.length);
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [category, subcategory, classification, material, backrestHeight, search, sort, minPrice, maxPrice, inStockOnly, pageParam]);

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

  // Lookup active category objects from tree/flatCategories
  const activeRootCategory = useMemo(() => {
    if (!category) return null;
    return categoryTree.find((c) => c.slug === category) || flatCategories.find((c) => c.slug === category);
  }, [category, categoryTree, flatCategories]);

  const activeSubcategory = useMemo(() => {
    if (!subcategory) return null;
    const subs = activeRootCategory?.children || activeRootCategory?.subcategories || [];
    return subs.find((s) => s.slug === subcategory) || flatCategories.find((c) => c.slug === subcategory);
  }, [subcategory, activeRootCategory, flatCategories]);

  const activeClassification = useMemo(() => {
    if (!classification) return null;
    const classes = activeSubcategory?.children || activeSubcategory?.subcategories || [];
    return classes.find((c) => c.slug === classification) || flatCategories.find((c) => c.slug === classification);
  }, [classification, activeSubcategory, flatCategories]);

  // Dynamic titles and subtitles
  let pageTitle = 'All Seating Catalogue';
  let pageSubtitle =
    'Engineered for 12+ hour postural alignment, synchronous spine mechanics, and high-performance durability. Direct from our Bhiwandi manufacturing facility.';

  if (activeClassification) {
    pageTitle = activeClassification.name;
    pageSubtitle =
      activeClassification.description ||
      `Explore premium ${activeClassification.name.toLowerCase()} seating engineered for durability and supreme executive relaxation.`;
  } else if (activeSubcategory) {
    pageTitle = activeSubcategory.name;
    pageSubtitle =
      activeSubcategory.description ||
      `Precision engineered ${activeSubcategory.name.toLowerCase()} for modern executive workspaces and high-performance teams.`;
  } else if (activeRootCategory) {
    pageTitle = activeRootCategory.name;
    pageSubtitle =
      activeRootCategory.description ||
      `Explore the complete ErgoCraft ${activeRootCategory.name.toLowerCase()} collection.`;
  } else if (search) {
    pageTitle = `Search: "${search}"`;
    pageSubtitle = `Showing available seating designs matching your search keyword.`;
  }

  // Determine pill tabs for Hero section
  const heroPillOptions = useMemo(() => {
    if (activeSubcategory && (activeSubcategory.children || activeSubcategory.subcategories)?.length) {
      const childList = activeSubcategory.children || activeSubcategory.subcategories || [];
      return [
        { name: `All ${activeSubcategory.name}`, classificationSlug: null },
        ...childList.map((c) => ({ name: c.name, classificationSlug: c.slug })),
      ];
    }
    if (activeRootCategory && (activeRootCategory.children || activeRootCategory.subcategories)?.length) {
      const childList = activeRootCategory.children || activeRootCategory.subcategories || [];
      return [
        { name: `All ${activeRootCategory.name}`, subcategorySlug: null },
        ...childList.map((c) => ({ name: c.name, subcategorySlug: c.slug })),
      ];
    }
    return [
      { name: 'All Seating', categorySlug: null },
      { name: 'Office Chairs', categorySlug: 'office-chairs' },
      { name: 'Sofas', categorySlug: 'sofas' },
      { name: 'Soft Seating', categorySlug: 'soft-seating' },
    ];
  }, [activeRootCategory, activeSubcategory]);

  const hasActiveFilters = Boolean(
    category || subcategory || classification || material || backrestHeight || search || inStockOnly || minPrice || maxPrice
  );

  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10 animate-fade-up">
      {/* 1. Dynamic Breadcrumbs Reflecting Exact 3-Level Hierarchy */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[#73756F]">
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
                !category && !subcategory && !classification && !search ? 'text-[#13231D] font-bold' : ''
              }`}
            >
              All Seating
            </Link>
          </li>

          {/* Level 1 Breadcrumb */}
          {category && (
            <>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li>
                <Link
                  href={`/products?category=${category}`}
                  className={`hover:text-[#78836A] transition-colors ${
                    !subcategory && !classification ? 'text-[#13231D] font-bold' : ''
                  }`}
                >
                  {activeRootCategory?.name || formatSlug(category)}
                </Link>
              </li>
            </>
          )}

          {/* Level 2 Breadcrumb */}
          {subcategory && (
            <>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li>
                <Link
                  href={`/products?category=${category}&subcategory=${subcategory}`}
                  className={`hover:text-[#78836A] transition-colors ${
                    !classification ? 'text-[#13231D] font-bold' : ''
                  }`}
                >
                  {activeSubcategory?.name || formatSlug(subcategory)}
                </Link>
              </li>
            </>
          )}

          {/* Level 3 Breadcrumb */}
          {classification && (
            <>
              <li>
                <ChevronRight size={12} className="text-gray-400" />
              </li>
              <li className="text-[#13231D] font-bold">
                {activeClassification?.name || formatSlug(classification)}
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
        <div className="relative z-10 max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-[#CBD5C0] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {classification
                ? 'Level 3 Specific Classification'
                : subcategory
                ? 'Level 2 Product Family'
                : category
                ? 'Level 1 Main Collection'
                : 'Direct Factory Catalogue'}
            </span>
          </div>

          <h1 className="font-serif-luxury text-3xl sm:text-5xl lg:text-6xl font-normal leading-[1.1] tracking-tight">
            {pageTitle}
          </h1>

          <p className="text-xs sm:text-sm lg:text-base text-[#D0D4CD] leading-relaxed max-w-2xl font-light">
            {pageSubtitle}
          </p>

          {/* Dynamic Subcategory & Classification Switcher Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {heroPillOptions.map((pill) => {
              let isPillActive = false;
              if ('classificationSlug' in pill) {
                isPillActive =
                  (pill.classificationSlug === null && !classification) ||
                  pill.classificationSlug === classification;
              } else if ('subcategorySlug' in pill) {
                isPillActive =
                  (pill.subcategorySlug === null && !subcategory) ||
                  pill.subcategorySlug === subcategory;
              } else if ('categorySlug' in pill) {
                isPillActive =
                  (pill.categorySlug === null && !category) ||
                  pill.categorySlug === category;
              }

              const handlePillClick = () => {
                if ('classificationSlug' in pill) {
                  updateUrlParams({ classification: pill.classificationSlug });
                } else if ('subcategorySlug' in pill) {
                  updateUrlParams({ subcategory: pill.subcategorySlug, classification: null });
                } else if ('categorySlug' in pill) {
                  updateUrlParams({
                    category: pill.categorySlug,
                    subcategory: null,
                    classification: null,
                  });
                }
              };

              return (
                <button
                  key={pill.name}
                  onClick={handlePillClick}
                  className={`px-4 py-2 rounded-full text-xs transition cursor-pointer ${
                    isPillActive
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
              <span>Pan-India Free Shipping</span>
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

      {/* 3. Controls Bar: Results Count, Sort, Search, Mobile Toggle */}
      <div className="border-b border-[#E8E5DE] pb-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-[#73756F]">
          <span className="font-semibold text-[#13231D]">
            {totalCount} {totalCount === 1 ? 'Design' : 'Designs'}
          </span>
          <span>•</span>
          <span className="font-medium text-gray-800">
            {activeClassification
              ? `${activeRootCategory?.name} → ${activeSubcategory?.name} → ${activeClassification.name}`
              : activeSubcategory
              ? `${activeRootCategory?.name} → ${activeSubcategory?.name}`
              : activeRootCategory
              ? activeRootCategory.name
              : 'All Seating'}
          </span>
        </div>

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
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-[#E8E2D9] bg-white text-xs focus:outline-none focus:border-[#78836A]"
            />
          </form>

          {/* Sort Selector */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => updateUrlParams({ sort: e.target.value })}
              className="px-3 py-2 rounded-xl border border-[#E8E2D9] bg-white text-xs text-[#242620] font-medium focus:outline-none focus:border-[#78836A] appearance-none pr-8 cursor-pointer shadow-2xs"
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

      {/* 4. Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pb-5 border-b border-[#E8E5DE] mb-8">
          <span className="text-[11px] font-semibold text-[#73756F] uppercase tracking-wider mr-1">
            Active Filters:
          </span>

          {category && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs text-[#242620] font-medium shadow-2xs">
              <span>Category: {activeRootCategory?.name || formatSlug(category)}</span>
              <button
                onClick={() =>
                  updateUrlParams({ category: null, subcategory: null, classification: null })
                }
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove category"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {subcategory && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs text-[#242620] font-medium shadow-2xs">
              <span>Family: {activeSubcategory?.name || formatSlug(subcategory)}</span>
              <button
                onClick={() => updateUrlParams({ subcategory: null, classification: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
                aria-label="Remove subcategory"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {classification && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold shadow-2xs">
              <span>Class: {activeClassification?.name || formatSlug(classification)}</span>
              <button
                onClick={() => updateUrlParams({ classification: null })}
                className="text-emerald-600 hover:text-emerald-800 cursor-pointer"
                aria-label="Remove classification"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {material && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs text-[#242620] font-medium shadow-2xs">
              <span>Material: {material}</span>
              <button
                onClick={() => updateUrlParams({ material: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {backrestHeight && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs text-[#242620] font-medium shadow-2xs">
              <span>Backrest: {backrestHeight}</span>
              <button
                onClick={() => updateUrlParams({ backrestHeight: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
              >
                <X size={13} />
              </button>
            </span>
          )}

          {(minPrice || maxPrice) && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs text-[#242620] font-medium shadow-2xs">
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
              >
                <X size={13} />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E8E2D9] text-xs text-[#242620] font-medium shadow-2xs">
              <span>In Stock Only</span>
              <button
                onClick={() => updateUrlParams({ inStock: null })}
                className="text-gray-400 hover:text-[#78836A] cursor-pointer"
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

      {/* 5. Main Body: Hierarchical Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden md:block bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-xs space-y-6 sticky top-28">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#13231D] flex items-center gap-2">
              <Filter size={14} className="text-[#78836A]" />
              <span>Hierarchical Taxonomy</span>
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

          {/* Hierarchical Categories & Classifications Accordion */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#13231D] uppercase tracking-wide">
              Product Categories
            </h4>
            <div className="space-y-1 text-xs">
              <button
                onClick={() =>
                  updateUrlParams({ category: null, subcategory: null, classification: null })
                }
                className={`w-full text-left py-1.5 px-2.5 rounded-lg transition cursor-pointer ${
                  !category
                    ? 'bg-[#13231D] text-white font-semibold'
                    : 'text-[#73756F] hover:bg-[#F7F5F0] hover:text-[#242620]'
                }`}
              >
                All Seating
              </button>

              {categoryTree.map((cat) => {
                const isCatSelected = category === cat.slug;
                const subs = cat.children || cat.subcategories || [];

                return (
                  <div key={cat._id} className="space-y-1">
                    <button
                      onClick={() =>
                        updateUrlParams({
                          category: cat.slug,
                          subcategory: null,
                          classification: null,
                        })
                      }
                      className={`w-full text-left py-1.5 px-2.5 rounded-lg transition cursor-pointer font-medium ${
                        isCatSelected && !subcategory
                          ? 'bg-[#13231D] text-white font-semibold'
                          : isCatSelected
                          ? 'text-[#78836A] font-bold bg-[#FAF8F5]'
                          : 'text-[#242620] hover:bg-[#F7F5F0]'
                      }`}
                    >
                      {cat.name}
                    </button>

                    {/* Level 2 Subcategories if parent selected */}
                    {isCatSelected && subs.length > 0 && (
                      <div className="pl-3 space-y-1 border-l-2 border-[#78836A]/40 ml-3 py-1">
                        {subs.map((sub) => {
                          const isSubSelected = subcategory === sub.slug;
                          const classifications = sub.children || sub.subcategories || [];

                          return (
                            <div key={sub._id} className="space-y-0.5">
                              <button
                                onClick={() =>
                                  updateUrlParams({
                                    subcategory: sub.slug,
                                    classification: null,
                                  })
                                }
                                className={`w-full text-left py-1 px-2 rounded-md text-[11px] transition cursor-pointer ${
                                  isSubSelected && !classification
                                    ? 'bg-[#78836A] text-white font-bold'
                                    : isSubSelected
                                    ? 'text-[#78836A] font-bold bg-[#F7F5F0]'
                                    : 'text-[#73756F] hover:text-[#242620]'
                                }`}
                              >
                                &bull; {sub.name}
                              </button>

                              {/* Level 3 Specific Classifications if subcategory selected */}
                              {isSubSelected && classifications.length > 0 && (
                                <div className="pl-3 space-y-0.5 border-l border-gray-300 ml-2 py-0.5">
                                  {classifications.map((item) => (
                                    <button
                                      key={item._id}
                                      onClick={() =>
                                        updateUrlParams({ classification: item.slug })
                                      }
                                      className={`w-full text-left py-0.5 px-2 rounded text-[10px] transition cursor-pointer ${
                                        classification === item.slug
                                          ? 'text-[#667151] font-bold bg-[#FAF8F5]'
                                          : 'text-gray-500 hover:text-gray-800'
                                      }`}
                                    >
                                      &minus; {item.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Furniture Attribute Filters */}
          <div className="pt-4 border-t border-[#E8E5DE] space-y-3">
            <h4 className="text-xs font-bold text-[#13231D] uppercase tracking-wide">
              Material Filter
            </h4>
            <div className="space-y-1 text-xs">
              {MATERIAL_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => updateUrlParams({ material: opt.value || null })}
                  className={`w-full text-left py-1 px-2 rounded-md transition cursor-pointer text-xs ${
                    material === opt.value
                      ? 'text-[#78836A] font-bold bg-[#F7F5F0]'
                      : 'text-[#73756F] hover:text-[#242620]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E8E5DE] space-y-3">
            <h4 className="text-xs font-bold text-[#13231D] uppercase tracking-wide">
              Backrest Height
            </h4>
            <div className="space-y-1 text-xs">
              {BACKREST_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => updateUrlParams({ backrestHeight: opt.value || null })}
                  className={`w-full text-left py-1 px-2 rounded-md transition cursor-pointer text-xs ${
                    backrestHeight === opt.value
                      ? 'text-[#78836A] font-bold bg-[#F7F5F0]'
                      : 'text-[#73756F] hover:text-[#242620]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
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
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] text-xs bg-[#F7F5F0] focus:outline-none focus:border-[#78836A]"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={customMax}
                  onChange={(e) => setCustomMax(e.target.value)}
                  className="w-1/2 px-2.5 py-1.5 rounded-lg border border-[#E8E2D9] text-xs bg-[#F7F5F0] focus:outline-none focus:border-[#78836A]"
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

        {/* Product Grid Area */}
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
                  No matching seating designs found
                </h3>
                <p className="text-xs text-[#73756F] leading-relaxed">
                  We couldn&apos;t find furniture matching your selected category classification or filters.
                  Try clearing subcategory or attribute boundaries to view related designs.
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
                  className="px-5 py-2.5 rounded-xl border border-[#E8E2D9] bg-white text-xs font-bold text-[#242620] tracking-wider uppercase hover:border-[#78836A] hover:text-[#78836A] transition cursor-pointer"
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
                className="p-2.5 rounded-xl border border-[#E8E2D9] bg-white text-gray-700 disabled:opacity-30 hover:bg-[#F7F5F0] cursor-pointer shadow-2xs"
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
                className="p-2.5 rounded-xl border border-[#E8E2D9] bg-white text-gray-700 disabled:opacity-30 hover:bg-[#F7F5F0] cursor-pointer shadow-2xs"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 6. Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-[#13231D]/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xs bg-white h-full p-6 overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
              <h3 className="text-sm font-bold text-[#13231D]">Filter Taxonomy</h3>
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
                    updateUrlParams({ category: null, subcategory: null, classification: null });
                    setMobileFilterOpen(false);
                  }}
                  className={`block w-full text-left py-2 px-2.5 rounded-lg ${
                    !category ? 'bg-[#13231D] text-white font-semibold' : 'text-[#242620]'
                  }`}
                >
                  All Seating
                </button>
                {categoryTree.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      updateUrlParams({ category: cat.slug, subcategory: null, classification: null });
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

            <div className="pt-4 border-t border-[#E8E2D9] space-y-2">
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
                className="flex-1 py-2.5 rounded-xl border border-[#E8E2D9] text-xs font-semibold text-gray-700 cursor-pointer"
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
