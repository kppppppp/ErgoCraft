'use client';

import React, { useEffect, useState } from 'react';
import { fetchApi } from '../../lib/api';
import { Plus, FolderTree, Edit2, Trash2, X, AlertCircle } from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent: { _id: string; name: string } | null;
  description?: string;
  sortOrder: number;
  isActive: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parent, setParent] = useState('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number | ''>(0);
  const [submitting, setSubmitting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetchApi<{ categories: CategoryItem[] }>('/categories/admin/all');
      setCategories(res.data.categories);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCategories(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setParent('');
    setDescription('');
    setSortOrder(0);
    setError('');
    setModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParent(cat.parent?._id || '');
    setDescription(cat.description || '');
    setSortOrder(cat.sortOrder);
    setError('');
    setModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const payload = {
      name,
      slug,
      parent: parent || null,
      description,
      sortOrder: Number(sortOrder) || 0,
    };

    try {
      if (editingCategory) {
        await fetchApi(`/categories/${editingCategory._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/categories', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setModalOpen(false);
      loadCategories();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await fetchApi(`/categories/${id}`, { method: 'DELETE' });
      loadCategories();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  // Top level categories for parent selector
  const topLevelCategories = categories.filter((c) => !c.parent);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1B18]">Categories & Hierarchy</h1>
          <p className="text-sm text-[#78716C] mt-1">
            Organize seating groups, sub-types, and navigational menus.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>New Category</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-[#667151] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-[#78716C]">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-[#78716C]">
            <FolderTree size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No categories configured yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF8F5] text-xs font-semibold uppercase tracking-wider text-[#78716C] border-b border-[#E8E2D9]">
                <tr>
                  <th className="py-3 px-5">Category Name</th>
                  <th className="py-3 px-5">Slug</th>
                  <th className="py-3 px-5">Hierarchy (Parent)</th>
                  <th className="py-3 px-5">Sort Order</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D9]">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-[#1E1B18]">
                      {c.parent && <span className="text-gray-300 mr-2">&mdash;</span>}
                      {c.name}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-gray-500">{c.slug}</td>
                    <td className="py-3.5 px-5">
                      {c.parent ? (
                        <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                          {c.parent.name}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded bg-[#ECEFE6] text-[#667151] text-xs font-semibold uppercase tracking-wider">
                          Top Level
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-gray-600 font-mono">{c.sortOrder}</td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 rounded text-gray-500 hover:text-[#667151] hover:bg-gray-100 cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1.5 rounded text-gray-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-semibold text-[#1E1B18]">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Mesh Chairs"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="mesh-chairs"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Parent Category (Leave empty for top-level)
                </label>
                <select
                  value={parent}
                  onChange={(e) => setParent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]"
                >
                  <option value="">None (Top-Level Category)</option>
                  {topLevelCategories
                    .filter((c) => !editingCategory || c._id !== editingCategory._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category editorial summary..."
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#667151] text-white hover:bg-[#4D5A3D] transition cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
