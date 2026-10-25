'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { fetchApi } from '../../lib/api';
import {
  Plus,
  FolderTree,
  Edit2,
  Trash2,
  X,
  AlertCircle,
  Folder,
  CornerDownRight,
  Loader2,
  Check,
} from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent: { _id: string; name: string; slug: string } | string | null;
  productCount?: number;
  level?: number;
  children?: CategoryItem[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [name, setName] = useState('');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetchApi<{ categories: CategoryItem[] }>('/categories/admin/all');
      setCategories(res.data.categories || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Quick lookup map for category by id
  const categoryMap = useMemo(() => {
    const map = new Map<string, CategoryItem>();
    categories.forEach((cat) => map.set(cat._id, cat));
    return map;
  }, [categories]);

  // Compute full ancestry path for any category
  const getCategoryPath = (catId: string): string => {
    const path: string[] = [];
    let curr = categoryMap.get(catId);
    const visited = new Set<string>();

    while (curr && !visited.has(curr._id)) {
      visited.add(curr._id);
      path.unshift(curr.name);
      const pId = typeof curr.parent === 'object' && curr.parent ? curr.parent._id : curr.parent;
      curr = pId ? categoryMap.get(String(pId)) : undefined;
    }
    return path.join(' → ');
  };

  // Get descendant IDs to prevent cycle in parent selector
  const getDescendantIds = (catId: string): Set<string> => {
    const descendants = new Set<string>([catId]);
    const queue = [catId];
    while (queue.length > 0) {
      const curr = queue.shift()!;
      categories.forEach((c) => {
        const pId = typeof c.parent === 'object' && c.parent ? c.parent._id : c.parent;
        if (pId && String(pId) === String(curr) && !descendants.has(c._id)) {
          descendants.add(c._id);
          queue.push(c._id);
        }
      });
    }
    return descendants;
  };

  // Group categories into childrenMap
  const childrenMap = useMemo(() => {
    const map = new Map<string, CategoryItem[]>();
    categories.forEach((cat) => {
      const pId = typeof cat.parent === 'object' && cat.parent ? cat.parent._id : cat.parent;
      if (pId) {
        const key = String(pId);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(cat);
      }
    });
    // Sort alphabetically
    map.forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name)));
    return map;
  }, [categories]);

  // Root categories
  const rootCategories = useMemo(() => {
    return categories
      .filter((c) => !c.parent)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories]);

  // Eligible parent options for the dropdown (exclude current item and descendants)
  const eligibleParents = useMemo(() => {
    const forbidden = editingCategory ? getDescendantIds(editingCategory._id) : new Set<string>();
    return categories
      .filter((c) => !forbidden.has(c._id))
      .map((c) => ({
        _id: c._id,
        path: getCategoryPath(c._id),
      }))
      .sort((a, b) => a.path.localeCompare(b.path));
  }, [categories, editingCategory]);

  // Open modal to add category (either root or subcategory)
  const handleOpenAdd = (parentCatId: string = '') => {
    setEditingCategory(null);
    setName('');
    setSelectedParentId(parentCatId);
    setFormError('');
    setModalOpen(true);
  };

  // Open modal to edit existing category
  const handleOpenEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setName(cat.name);
    const pId = typeof cat.parent === 'object' && cat.parent ? cat.parent._id : cat.parent || '';
    setSelectedParentId(String(pId));
    setFormError('');
    setModalOpen(true);
  };

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a category name.');
      return;
    }

    setSubmitting(true);
    setFormError('');

    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-');

    const payload = {
      name: name.trim(),
      slug,
      parent: selectedParentId || null,
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
      await loadCategories();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError('');

    try {
      await fetchApi(`/categories/${deleteTarget._id}`, {
        method: 'DELETE',
      });
      setDeleteTarget(null);
      await loadCategories();
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#1E1B18]">Categories</h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            Organize products with simple main categories and subcategories.
          </p>
        </div>
        <button
          onClick={() => handleOpenAdd('')}
          className="px-4 py-2.5 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-xs shrink-0 cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button
            onClick={loadCategories}
            className="text-xs font-bold underline hover:no-underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-12 text-center shadow-xs">
          <Loader2 size={32} className="animate-spin text-[#667151] mx-auto mb-3" />
          <p className="text-xs text-[#78716C]">Loading categories hierarchy...</p>
        </div>
      ) : rootCategories.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-12 text-center shadow-xs">
          <FolderTree size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-base font-semibold text-[#1E1B18]">No categories found</h3>
          <p className="text-xs text-[#78716C] mt-1">
            Get started by creating your first main category (e.g. Office Chairs).
          </p>
          <button
            onClick={() => handleOpenAdd('')}
            className="mt-4 px-4 py-2 rounded-lg bg-[#667151] text-white text-xs font-semibold hover:bg-[#4D5A3D] transition cursor-pointer"
          >
            + Add First Category
          </button>
        </div>
      ) : (
        /* Category Nested Hierarchy Tree */
        <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-xs divide-y divide-[#E8E2D9] overflow-hidden">
          {rootCategories.map((root) => {
            const level2List = childrenMap.get(root._id) || [];
            return (
              <div key={root._id} className="p-4 sm:p-5 space-y-3">
                {/* Level 1: Root Category Row */}
                <div className="flex items-center justify-between gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2D9]/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder size={18} className="text-[#667151] shrink-0 fill-[#667151]/10" />
                    <span className="font-semibold text-sm sm:text-base text-[#1E1B18] truncate">
                      {root.name}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white border border-[#E8E2D9] text-[#78716C] shrink-0">
                      {root.productCount ?? 0} {root.productCount === 1 ? 'product' : 'products'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenAdd(root._id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#E8E2D9] text-[#667151] hover:bg-[#ECEFE6] transition flex items-center gap-1 cursor-pointer"
                      title="Add subcategory under this category"
                    >
                      <Plus size={13} />
                      <span className="hidden sm:inline">Add Subcategory</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(root)}
                      className="p-1.5 rounded-md text-gray-500 hover:text-[#667151] hover:bg-white transition cursor-pointer"
                      title="Edit category"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteError('');
                        setDeleteTarget(root);
                      }}
                      className="p-1.5 rounded-md text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Level 2 Subcategories */}
                {level2List.length > 0 && (
                  <div className="pl-4 sm:pl-8 space-y-2 border-l-2 border-[#E8E2D9] ml-4">
                    {level2List.map((sub) => {
                      const level3List = childrenMap.get(sub._id) || [];
                      return (
                        <div key={sub._id} className="space-y-2">
                          <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100/70 border border-gray-200/60 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <CornerDownRight size={14} className="text-gray-400 shrink-0" />
                              <span className="font-medium text-xs sm:text-sm text-[#1E1B18] truncate">
                                {sub.name}
                              </span>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[#78716C] shrink-0">
                                {sub.productCount ?? 0} {sub.productCount === 1 ? 'product' : 'products'}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                onClick={() => handleOpenAdd(sub._id)}
                                className="px-2 py-0.5 text-[11px] font-medium rounded bg-white border border-gray-300 text-[#667151] hover:bg-[#ECEFE6] transition flex items-center gap-1 cursor-pointer"
                                title="Add classification under this subcategory"
                              >
                                <Plus size={12} />
                                <span className="hidden sm:inline">Add Subcategory</span>
                              </button>
                              <button
                                onClick={() => handleOpenEdit(sub)}
                                className="p-1 rounded text-gray-400 hover:text-[#667151] hover:bg-white transition cursor-pointer"
                                title="Edit subcategory"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteError('');
                                  setDeleteTarget(sub);
                                }}
                                className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                title="Delete subcategory"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Level 3 Specific Classifications */}
                          {level3List.length > 0 && (
                            <div className="pl-4 sm:pl-8 space-y-1.5 border-l-2 border-dashed border-gray-200 ml-4">
                              {level3List.map((item) => (
                                <div
                                  key={item._id}
                                  className="flex items-center justify-between gap-3 p-2 rounded-md bg-white hover:bg-gray-50 border border-gray-200/80 transition-colors"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-gray-400 text-xs">└</span>
                                    <span className="text-xs font-normal text-gray-800 truncate">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 shrink-0">
                                      {item.productCount ?? 0}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={() => handleOpenEdit(item)}
                                      className="p-1 rounded text-gray-400 hover:text-[#667151] hover:bg-gray-100 transition cursor-pointer"
                                      title="Edit classification"
                                    >
                                      <Edit2 size={12} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDeleteError('');
                                        setDeleteTarget(item);
                                      }}
                                      className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                      title="Delete classification"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                </div>
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
      )}

      {/* Add / Edit Category Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#1E1B18]">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Field 1: Category Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Office Chairs, Leatherette, High Back"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
                  autoFocus
                />
              </div>

              {/* Field 2: Parent Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Parent Category <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <select
                  value={selectedParentId}
                  onChange={(e) => setSelectedParentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
                >
                  <option value="">None (Main Category)</option>
                  {eligibleParents.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.path}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1">
                  Leave empty to create a top-level category, or select a parent to create a subcategory.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#667151] text-white hover:bg-[#4D5A3D] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Category</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95 duration-100">
            <h3 className="text-base font-bold text-[#1E1B18]">Delete Category</h3>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-900">&quot;{deleteTarget.name}&quot;</span>?
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{deleteError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError('');
                }}
                disabled={deleting}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
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
