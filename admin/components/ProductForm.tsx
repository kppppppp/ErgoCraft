'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../lib/api';
import {
  Upload,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Image as ImageIcon,
  Star,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  parent: string | null;
  subcategories?: CategoryItem[];
}

export interface ProductFormData {
  _id: string;
  name?: string;
  slug?: string;
  sku?: string;
  category?: string | { _id: string };
  subcategory?: string | { _id: string } | null;
  mrp?: number;
  sellingPrice?: number;
  stock?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  status?: string;
  shortDescription?: string;
  description?: string;
  warranty?: string;
  images?: Array<{ url: string; altText?: string; isPrimary: boolean; publicId?: string }>;
  specifications?: Array<{ key: string; value: string }>;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit }) => {
  const router = useRouter();

  // Basic Information
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [sku, setSku] = useState(initialData?.sku || '');
  const [categoryId, setCategoryId] = useState(
    typeof initialData?.category === 'object' ? initialData.category?._id || '' : initialData?.category || ''
  );
  const [subcategoryId, setSubcategoryId] = useState(
    typeof initialData?.subcategory === 'object' ? initialData.subcategory?._id || '' : initialData?.subcategory || ''
  );

  // Pricing & Inventory
  const [mrp, setMrp] = useState<number | ''>(initialData?.mrp || '');
  const [sellingPrice, setSellingPrice] = useState<number | ''>(initialData?.sellingPrice || '');
  const [stock, setStock] = useState<number | ''>(initialData?.stock ?? 10);

  // Flags & Status
  const [isBestseller, setIsBestseller] = useState(initialData?.isBestseller || false);
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [status, setStatus] = useState(initialData?.status || 'published');

  // Descriptions
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [warranty, setWarranty] = useState(initialData?.warranty || '3 Years Manufacturer Warranty');

  // Images
  const [images, setImages] = useState<Array<{ url: string; altText?: string; isPrimary: boolean; publicId?: string }>>(
    initialData?.images || []
  );
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // Specifications
  const [specifications, setSpecifications] = useState<Array<{ key: string; value: string }>>(
    initialData?.specifications?.length
      ? initialData.specifications
      : [
          { key: 'Material', value: 'High-tensile mesh' },
          { key: 'Mechanism', value: 'Synchro-tilt locking' },
          { key: 'Base', value: 'Heavy-duty nylon base' },
        ]
  );

  // Categories list
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchApi<{ categories: CategoryItem[] }>('/categories');
        setCategories(res.data.categories);
        if (!categoryId && res.data.categories.length > 0) {
          setCategoryId(res.data.categories[0]._id);
        }
      } catch (err: unknown) {
        console.error('Failed to load categories', err);
      }
    };
    loadCategories();
  }, [categoryId]);

  // Auto-generate slug and SKU when typing name in create mode
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEdit) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);

      if (!sku) {
        const acronym = val
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 4);
        setSku(`EC-${acronym || 'PRD'}-${Math.floor(100 + Math.random() * 900)}`);
      }
    }
  };

  // Dynamic discount calculation
  const calculatedDiscount =
    typeof mrp === 'number' && typeof sellingPrice === 'number' && mrp > 0 && sellingPrice > 0
      ? Math.round(((mrp - sellingPrice) / mrp) * 100)
      : 0;

  // Selected Category's subcategories
  const selectedCategory = categories.find((c) => c._id === categoryId);
  const availableSubcategories = selectedCategory?.subcategories || [];

  // Image actions
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      { url: newImageUrl.trim(), altText: name, isPrimary: prev.length === 0 },
    ]);
    setNewImageUrl('');
  };

  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  // File upload to Cloudinary (supports multiple image selection)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setError('');

    try {
      if (files.length === 1) {
        const formData = new FormData();
        formData.append('image', files[0]);

        const res = await fetchApi<{ url: string; publicId: string }>('/uploads', {
          method: 'POST',
          body: formData,
        });

        setImages((prev) => [
          ...prev,
          { url: res.data.url, publicId: res.data.publicId, altText: name, isPrimary: prev.length === 0 },
        ]);
      } else {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });

        const res = await fetchApi<{ images: Array<{ url: string; publicId: string }> }>('/uploads/multiple', {
          method: 'POST',
          body: formData,
        });

        const newImgs = res.data.images.map((item, idx) => ({
          url: item.url,
          publicId: item.publicId,
          altText: name,
          isPrimary: images.length === 0 && idx === 0,
        }));

        setImages((prev) => [...prev, ...newImgs]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed. Try pasting an image URL instead.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Spec actions
  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    setSpecifications((prev) => {
      const updated = [...prev];
      updated[index][field] = val;
      return updated;
    });
  };

  const handleRemoveSpec = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Number(sellingPrice) > Number(mrp)) {
      setError('Selling price cannot exceed MRP.');
      return;
    }

    if (images.length === 0) {
      setError('Please provide at least one product image.');
      return;
    }

    setSubmitting(true);

    const payload = {
      name,
      slug,
      sku,
      category: categoryId,
      subcategory: subcategoryId || null,
      mrp: Number(mrp),
      sellingPrice: Number(sellingPrice),
      stock: Number(stock),
      isBestseller,
      isFeatured,
      status,
      shortDescription,
      description,
      warranty,
      images,
      specifications: specifications.filter((s) => s.key.trim() && s.value.trim()),
    };

    try {
      if (isEdit) {
        await fetchApi(`/products/${initialData?._id || ''}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      router.push('/products');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-lg border border-[#E8E2D9] bg-white text-[#78716C] hover:text-[#1E1B18] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-serif font-bold text-[#1E1B18]">
              {isEdit ? `Edit: ${name}` : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#78716C]">
              Configure pricing, specifications, imagery and storefront presentation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 rounded-lg border border-[#E8E2D9] text-xs font-semibold text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wide uppercase transition shadow-xs disabled:opacity-50 flex items-center gap-2 cursor-pointer"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check size={16} />
                <span>{isEdit ? 'Update Product' : 'Publish Product'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Basic Information */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667151]">
              1. Basic Information
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Oscar High Back Ergonomic Mesh Chair"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  SKU (Stock Keeping Unit) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g. EC-OCH-001"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  URL Slug <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase())}
                  placeholder="oscar-high-back-mesh-chair"
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Primary Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubcategoryId('');
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                  Subcategory (Optional)
                </label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  disabled={availableSubcategories.length === 0}
                  className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151] disabled:bg-gray-100"
                >
                  <option value="">None / General</option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub._id} value={sub._id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Media & Images */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667151]">
                2. Product Images
              </h2>
              <span className="text-xs text-[#78716C]">{images.length} images uploaded</span>
            </div>

            {/* Existing images list */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className={`relative rounded-lg overflow-hidden border-2 bg-gray-50 group aspect-square flex items-center justify-center ${
                      img.isPrimary ? 'border-[#667151] ring-2 ring-[#667151]/20' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText || 'Product preview'}
                      className="w-full h-full object-cover"
                    />

                    {img.isPrimary && (
                      <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-[#667151] text-white text-[10px] font-bold tracking-wider uppercase">
                        Primary
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {!img.isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(idx)}
                          title="Set as primary"
                          className="p-1.5 rounded-full bg-white text-[#667151] hover:bg-[#667151] hover:text-white transition"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        title="Delete image"
                        className="p-1.5 rounded-full bg-white text-rose-600 hover:bg-rose-600 hover:text-white transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Image Controls */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex gap-2">
                <input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Paste Image URL (https://...)"
                  className="flex-1 px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition"
                >
                  Add URL
                </button>
              </div>

              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  disabled={uploadingImage}
                  id="image-file-input"
                  className="hidden"
                />
                <label
                  htmlFor="image-file-input"
                  className="px-4 py-2 rounded-lg border border-dashed border-[#667151] text-[#667151] hover:bg-[#FAF8F5] text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Upload size={14} />
                  <span>{uploadingImage ? 'Uploading to Cloudinary...' : 'Upload Cloudinary Images (Single / Multi)'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Description & Specifications */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667151]">
              3. Description & Specifications
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                Short Highlight Sentence
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. Active lumbar ergonomics with breathable mesh and 3D armrests."
                className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                Full Editorial Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the craftsmanship, materials, ergonomic engineering, and lifestyle suitability..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
              />
            </div>

            {/* Specifications Key-Values */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-[#1E1B18]">Technical Specifications</label>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="text-xs text-[#667151] font-semibold flex items-center gap-1 hover:underline"
                >
                  <Plus size={14} />
                  <span>Add Spec Row</span>
                </button>
              </div>

              <div className="space-y-2">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Feature (e.g. Mechanism)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                      className="w-1/3 px-3 py-1.5 rounded-md border border-[#E8E2D9] text-xs font-medium focus:ring-1 focus:ring-[#667151]"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. Multi-position synchro-tilt)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-md border border-[#E8E2D9] text-xs focus:ring-1 focus:ring-[#667151]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(index)}
                      className="text-gray-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Pricing & Controls */}
        <div className="space-y-6">
          {/* Pricing & Stock */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667151]">
              Pricing & Stock
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                MRP (Maximum Retail Price ₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={mrp}
                onChange={(e) => setMrp(e.target.value ? Number(e.target.value) : '')}
                placeholder="18499"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="12999"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
              />
            </div>

            {/* Calculated Discount Preview */}
            <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] flex items-center justify-between text-xs">
              <span className="text-[#78716C]">Computed Discount:</span>
              <span className="font-bold text-emerald-700 font-mono text-sm">
                {calculatedDiscount}% OFF
              </span>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                Available Stock Units <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value ? Number(e.target.value) : '')}
                placeholder="20"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
              />
            </div>
          </div>

          {/* Visibility & Flags */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667151]">
              Visibility & Flags
            </h2>

            <div>
              <label className="block text-xs font-semibold text-[#1E1B18] mb-1">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]"
              >
                <option value="published">Published (Visible in Store)</option>
                <option value="draft">Draft (Hidden)</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBestseller}
                  onChange={(e) => setIsBestseller(e.target.checked)}
                  className="w-4 h-4 rounded text-[#667151] focus:ring-[#667151]"
                />
                <span className="text-sm font-medium text-[#1E1B18]">
                  Mark as Bestseller (Hero Showcase)
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#667151] focus:ring-[#667151]"
                />
                <span className="text-sm font-medium text-[#1E1B18]">
                  Featured in Homepage Grid
                </span>
              </label>
            </div>
          </div>

          {/* Warranty & Policies */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-3 shadow-xs">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667151]">
              Warranty Coverage
            </h2>
            <input
              type="text"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="3 Years Manufacturer Warranty"
              className="w-full px-3.5 py-2 rounded-lg border border-[#E8E2D9] text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
