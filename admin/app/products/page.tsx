'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../lib/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Package,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Star,
  X,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
  level?: number;
  parent?: string | { _id: string; name: string; slug: string } | null;
  productCount?: number;
}

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: { _id: string; name: string; slug: string };
  subcategory?: { _id: string; name: string; slug: string };
  classification?: { _id: string; name: string; slug: string };
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  status: string;
  isBestseller?: boolean;
  images: Array<{ url: string; isPrimary: boolean }>;
  attributes?: {
    material?: string;
    backrestHeight?: string;
    colour?: string;
    dimensions?: string;
  };
}

interface PaginationMeta {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Search state
  const [search, setSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Deletion modal state
  const [deleteProduct, setDeleteProduct] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load all categories once on mount
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      try {
        const res = await fetchApi<{ categories: CategoryOption[] }>('/categories/admin/all');
        if (isMounted) {
          setCategories(res.data?.categories || []);
        }
      } catch (err: unknown) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Level 1 Root Categories (parent == null or undefined)
  const rootCategories = useMemo(() => {
    return categories.filter((c) => !c.parent || (typeof c.parent === 'object' && !c.parent?._id));
  }, [categories]);

  // Level 2 Subcategories for the currently selected root category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    return categories.filter((c) => {
      if (!c.parent) return false;
      const parentId = typeof c.parent === 'object' ? c.parent?._id : c.parent;
      return String(parentId) === String(selectedCategory);
    });
  }, [categories, selectedCategory]);

  // Fetch products with full query params
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (appliedSearch.trim()) queryParams.set('q', appliedSearch.trim());
      if (selectedCategory) queryParams.set('category', selectedCategory);
      if (selectedSubcategory) queryParams.set('subcategory', selectedSubcategory);
      if (selectedStatus && selectedStatus !== 'all') queryParams.set('status', selectedStatus);
      queryParams.set('page', String(page));
      queryParams.set('limit', String(limit));

      const res = await fetchApi<{
        products: ProductItem[];
        pagination: PaginationMeta;
      }>(`/products/admin/all?${queryParams.toString()}`);

      if (res.data) {
        setProducts(res.data.products || []);
        if (res.data.pagination) {
          setTotalCount(res.data.pagination.totalCount || 0);
          setTotalPages(res.data.pagination.totalPages || 1);
        } else {
          setTotalCount(res.data.products?.length || 0);
          setTotalPages(1);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, selectedCategory, selectedSubcategory, selectedStatus, page, limit]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search);
    setPage(1);
  };

  const handleClearSearch = () => {
    setSearch('');
    setAppliedSearch('');
    setPage(1);
  };

  // Handle Category Change (Cascading: clear subcategory)
  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory('');
    setPage(1);
  };

  const handleSubcategoryChange = (subId: string) => {
    setSelectedSubcategory(subId);
    setPage(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleClearAllFilters = () => {
    setSearch('');
    setAppliedSearch('');
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedStatus('all');
    setPage(1);
  };

  const hasActiveFilters = Boolean(
    appliedSearch || selectedCategory || selectedSubcategory || (selectedStatus && selectedStatus !== 'all')
  );

  // Handle Product Deletion
  const handleDelete = async () => {
    if (!deleteProduct) return;
    setDeleting(true);
    try {
      await fetchApi(`/products/${deleteProduct._id}`, { method: 'DELETE' });
      setDeleteProduct(null);
      // If we deleted the only item on the current page (and not on page 1), go back 1 page
      if (products.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        loadProducts();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Computed display range
  const startRange = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endRange = Math.min(page * limit, totalCount);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#1E1B18]">Products</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#667151] border border-[#E8E2D9]">
              {totalCount} {totalCount === 1 ? 'Product' : 'Products Total'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Manage your store furniture catalogue, categories, pricing, and live inventory.
          </p>
        </div>
        <Link
          href="/products/new"
          className="px-4 py-2.5 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer w-fit"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadProducts}
            className="text-xs font-bold underline hover:no-underline cursor-pointer shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E8E2D9] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* 1. Search Box (Span 4) */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, SKU..."
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-none focus:ring-1 focus:ring-[#667151] bg-[#FAF8F5]/50"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {/* 2. Main Category Filter (Span 3) */}
          <div className="lg:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
            >
              <option value="">All Categories (Root)</option>
              {rootCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.productCount ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Cascading Subcategory Filter (Span 3) */}
          <div className="lg:col-span-3">
            <select
              value={selectedSubcategory}
              onChange={(e) => handleSubcategoryChange(e.target.value)}
              disabled={!selectedCategory || availableSubcategories.length === 0}
              className={`w-full px-3 py-2 rounded-lg border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#667151] ${
                !selectedCategory || availableSubcategories.length === 0
                  ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'border-[#E8E2D9] text-gray-700'
              }`}
            >
              <option value="">
                {!selectedCategory
                  ? 'Select category first'
                  : availableSubcategories.length === 0
                  ? 'No subcategories'
                  : 'All Subcategories'}
              </option>
              {availableSubcategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name} ({sub.productCount ?? 0})
                </option>
              ))}
            </select>
          </div>

          {/* 4. Status Filter (Span 2) */}
          <div className="lg:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-100 text-xs">
          <div className="text-gray-500">
            {loading ? (
              <span>Loading catalogue...</span>
            ) : totalCount > 0 ? (
              <span>
                Showing <strong className="text-gray-800">{startRange}</strong>–
                <strong className="text-gray-800">{endRange}</strong> of{' '}
                <strong className="text-[#667151]">{totalCount}</strong> matching products
              </span>
            ) : (
              <span className="text-gray-400">0 products match the selected criteria</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Per-page selector */}
            <div className="flex items-center gap-1.5 text-gray-500">
              <span className="text-[11px]">Show:</span>
              <select
                value={limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="px-2 py-1 rounded border border-[#E8E2D9] bg-white text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="text-xs text-[#667151] hover:text-[#4D5A3D] font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Product Table Container */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 size={32} className="animate-spin text-[#667151] mx-auto mb-3" />
            <p className="text-xs font-medium text-[#78716C]">Loading products from MongoDB Atlas...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-[#78716C] space-y-3">
            <Package size={44} className="mx-auto text-gray-300" />
            <div>
              <p className="text-sm font-semibold text-gray-800">No products found</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {hasActiveFilters
                  ? 'No products match your search keyword or selected category filter.'
                  : 'Your catalogue is empty. Get started by adding a product.'}
              </p>
            </div>
            {hasActiveFilters ? (
              <button
                onClick={handleClearAllFilters}
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
              >
                Clear all filters
              </button>
            ) : (
              <Link
                href="/products/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold transition"
              >
                <Plus size={14} />
                <span>Create first product</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[760px]">
              <thead className="bg-[#FAF8F5] text-[11px] font-semibold uppercase tracking-wider text-[#78716C] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-4 w-16">Image</th>
                  <th className="py-3 px-4">Product Name & SKU</th>
                  <th className="py-3 px-4">Category Classification</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {products.map((p) => {
                  const primaryImg = p.images?.find((i) => i.isPrimary) || p.images?.[0];
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                      {/* 1. Thumbnail Image */}
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          {primaryImg?.url ? (
                            <img
                              src={primaryImg.url}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Package size={18} className="text-gray-400" />
                          )}
                        </div>
                      </td>

                      {/* 2. Product Name & SKU */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-[#1E1B18] line-clamp-1" title={p.name}>
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-[#78716C]">{p.sku}</span>
                          {p.isBestseller && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Star size={10} className="fill-amber-500 text-amber-500" />
                              Bestseller
                            </span>
                          )}
                          {p.attributes?.backrestHeight && (
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {p.attributes.backrestHeight}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 3. Category Path (Strict Parent -> Subcategory -> Classification) */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap items-center gap-1 text-xs">
                          <span className="font-medium text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                            {p.category?.name || 'Unassigned'}
                          </span>
                          {p.subcategory && (
                            <>
                              <ChevronRight size={11} className="text-gray-400 shrink-0" />
                              <span className="text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                {p.subcategory.name}
                              </span>
                            </>
                          )}
                          {p.classification && (
                            <>
                              <ChevronRight size={11} className="text-gray-400 shrink-0" />
                              <span className="font-medium text-[#667151] bg-[#ECEFE6] px-2 py-0.5 rounded border border-[#667151]/20">
                                {p.classification.name}
                              </span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* 4. Price & Discount */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-semibold text-[#1E1B18]">
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </div>
                        {p.mrp > p.sellingPrice && (
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                            <span className="line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                            <span className="text-emerald-700 font-semibold font-mono">
                              {p.discountPercentage}% off
                            </span>
                          </div>
                        )}
                      </td>

                      {/* 5. Stock Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.stock > 5
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.stock > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                        </span>
                      </td>

                      {/* 6. Publishing Status Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            p.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {p.status || 'published'}
                        </span>
                      </td>

                      {/* 7. Actions: Edit & Delete */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/products/${p._id}/edit`}
                            className="p-1.5 rounded text-gray-500 hover:text-[#667151] hover:bg-gray-100 transition"
                            title="Edit Product"
                          >
                            <Edit2 size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteProduct(p)}
                            className="p-1.5 rounded text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server-Side Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#E8E2D9] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-gray-600">
              Page <strong className="text-gray-900">{page}</strong> of{' '}
              <strong className="text-gray-900">{totalPages}</strong> (
              {totalCount} total items)
            </div>

            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft size={15} />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((pNum) => {
                  // Show current, first, last, and window around current
                  return (
                    pNum === 1 ||
                    pNum === totalPages ||
                    Math.abs(pNum - page) <= 2
                  );
                })
                .map((pNum, idx, arr) => {
                  const showEllipsisBefore = idx > 0 && pNum - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={pNum}>
                      {showEllipsisBefore && (
                        <span className="px-1 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => setPage(pNum)}
                        className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                          page === pNum
                            ? 'bg-[#667151] text-white shadow-xs'
                            : 'border border-[#E8E2D9] bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    </React.Fragment>
                  );
                })}

              {/* Next Page */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-[#E8E2D9] bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Last Page"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-semibold text-[#1E1B18]">Delete Product</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-gray-900 font-semibold">{deleteProduct.name}</strong> (
              <span className="font-mono">{deleteProduct.sku}</span>)?
              This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteProduct(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
