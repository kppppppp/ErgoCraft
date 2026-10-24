'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchApi } from '../../lib/api';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Star,
  Sparkles,
  AlertCircle,
  Package,
} from 'lucide-react';

interface ProductItem {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  category: { _id: string; name: string };
  subcategory?: { _id: string; name: string };
  mrp: number;
  sellingPrice: number;
  discountPercentage: number;
  stock: number;
  isBestseller: boolean;
  isFeatured: boolean;
  status: string;
  images: Array<{ url: string; isPrimary: boolean }>;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set('q', search);
      if (selectedCategory) queryParams.set('category', selectedCategory);
      if (selectedStatus) queryParams.set('status', selectedStatus);

      const [prodsRes, catsRes] = await Promise.all([
        fetchApi<{ products: ProductItem[] }>(`/products/admin/all?${queryParams.toString()}`),
        fetchApi<{ categories: Array<{ _id: string; name: string }> }>('/categories'),
      ]);

      setProducts(prodsRes.data.products);
      setCategories(catsRes.data.categories);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadProducts(), 0);
    return () => window.clearTimeout(timer);
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProducts();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await fetchApi(`/products/${deleteId}`, { method: 'DELETE' });
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1B18]">Product Inventory</h1>
          <p className="text-sm text-[#78716C] mt-1">
            Manage catalogue, pricing, specifications, and storefront publication.
          </p>
        </div>
        <Link
          href="/products/new"
          className="px-4 py-2.5 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-xs shrink-0"
        >
          <Plus size={16} />
          <span>Add Product</span>
        </Link>
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
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-[#E8E2D9] text-xs focus:outline-none focus:ring-1 focus:ring-[#667151]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-lg border border-[#E8E2D9] text-xs bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#667151]"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#667151] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-[#78716C]">Loading product catalogue...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-[#78716C]">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No products match your criteria</p>
            <p className="text-xs text-gray-400 mt-1">Try clearing filters or add a new product.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#78716C] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-5">Product</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Price (INR)</th>
                  <th className="py-3 px-5">Stock</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Tags</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {products.map((p) => {
                  const primaryImg = p.images.find((i) => i.isPrimary) || p.images[0];
                  return (
                    <tr key={p._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <img
                                src={primaryImg.url}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package size={20} className="text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1E1B18] line-clamp-1">{p.name}</div>
                            <span className="font-mono text-[11px] text-[#78716C]">{p.sku}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span className="text-xs font-medium text-gray-700">
                          {p.category?.name || 'Unassigned'}
                        </span>
                        {p.subcategory && (
                          <span className="block text-[11px] text-gray-400">
                            {p.subcategory.name}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="font-semibold text-[#1E1B18]">
                          ₹{p.sellingPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                          <span className="line-through">₹{p.mrp.toLocaleString('en-IN')}</span>
                          <span className="text-emerald-700 font-semibold font-mono">
                            {p.discountPercentage}% off
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            p.stock > 5
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : p.stock > 0
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {p.stock > 0 ? `${p.stock} units` : 'Out of Stock'}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                            p.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'draft'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-1.5">
                          {p.isBestseller && (
                            <span
                              title="Bestseller"
                              className="p-1 rounded bg-amber-50 text-amber-600 border border-amber-200"
                            >
                              <Star size={13} className="fill-amber-500 text-amber-500" />
                            </span>
                          )}
                          {p.isFeatured && (
                            <span
                              title="Featured"
                              className="p-1 rounded bg-[#ECEFE6] text-[#667151] border border-[#667151]/30"
                            >
                              <Sparkles size={13} />
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/products/${p._id}/edit`}
                            className="p-1.5 rounded text-gray-500 hover:text-[#667151] hover:bg-gray-100 transition"
                            title="Edit Product"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteId(p._id)}
                            className="p-1.5 rounded text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-semibold text-[#1E1B18]">Delete Product</h3>
            <p className="text-sm text-[#78716C]">
              Are you sure you want to delete this product? All image assets associated with it in Cloudinary will be removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 cursor-pointer"
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
