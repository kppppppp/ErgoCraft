'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchApi } from '../lib/api';
import {
  Upload,
  Trash2,
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Star,
  Loader2,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface CategoryNode {
  _id: string;
  name: string;
  slug: string;
  parent: string | { _id: string; name: string } | null;
  isActive: boolean;
}

export interface ProductFormData {
  _id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  category?: string | { _id: string; name?: string; slug?: string };
  subcategory?: string | { _id: string; name?: string; slug?: string } | null;
  classification?: string | { _id: string; name?: string; slug?: string } | null;
  mrp?: number;
  sellingPrice?: number;
  stock?: number;
  isBestseller?: boolean;
  isFeatured?: boolean;
  status?: string;
  description?: string;
  shortDescription?: string;
  images?: Array<{ url: string; altText?: string; isPrimary: boolean; publicId?: string }>;
  attributes?: {
    material?: string;
    backrestHeight?: string;
    colour?: string;
    armrests?: string;
    mechanism?: string;
    weightCapacity?: string;
    upholstery?: string;
    dimensions?: string;
  };
  specifications?: Array<{ key: string; value: string }>;
}

interface ProductFormProps {
  initialData?: ProductFormData;
  isEdit?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();

  // Categories list from API
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Form states: 1. Basic Details
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [status, setStatus] = useState('published');

  // Form states: 2. Category Cascade
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [classificationId, setClassificationId] = useState('');

  // Form states: 3. Pricing & Inventory
  const [mrp, setMrp] = useState<number | ''>('');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [stock, setStock] = useState<number | ''>(10);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Form states: 4. Product Attributes & Dimensions
  const [material, setMaterial] = useState('');
  const [backrestHeight, setBackrestHeight] = useState('');
  const [colour, setColour] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [armrests, setArmrests] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [weightCapacity, setWeightCapacity] = useState('');

  // Form states: 5. Product Images
  const [images, setImages] = useState<
    Array<{ url: string; altText?: string; isPrimary: boolean; publicId?: string }>
  >([]);
  const [urlInput, setUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load categories dynamically from backend
  useEffect(() => {
    let isMounted = true;
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetchApi<{ categories: CategoryNode[] }>('/categories/admin/all');
        if (isMounted) {
          setCategories(res.data?.categories || []);
        }
      } catch (err: unknown) {
        console.error('Failed to load categories', err);
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };
    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  // Pre-populate fields in Edit mode
  useEffect(() => {
    if (initialData) {
      if (initialData.name) setName(initialData.name);
      if (initialData.sku) setSku(initialData.sku);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.shortDescription) setShortDescription(initialData.shortDescription);
      if (initialData.status) setStatus(initialData.status);

      const cId =
        typeof initialData.category === 'object' && initialData.category
          ? (initialData.category as any)._id || ''
          : (initialData.category as string) || '';
      const sId =
        typeof initialData.subcategory === 'object' && initialData.subcategory
          ? (initialData.subcategory as any)._id || ''
          : (initialData.subcategory as string) || '';
      const clId =
        typeof initialData.classification === 'object' && initialData.classification
          ? (initialData.classification as any)._id || ''
          : (initialData.classification as string) || '';

      if (cId) setCategoryId(String(cId));
      if (sId) setSubcategoryId(String(sId));
      if (clId) setClassificationId(String(clId));

      if (initialData.mrp !== undefined) setMrp(initialData.mrp);
      if (initialData.sellingPrice !== undefined) setSellingPrice(initialData.sellingPrice);
      if (initialData.stock !== undefined) setStock(initialData.stock);
      if (initialData.isBestseller !== undefined) setIsBestseller(Boolean(initialData.isBestseller));
      if (initialData.isFeatured !== undefined) setIsFeatured(Boolean(initialData.isFeatured));

      if (initialData.images && Array.isArray(initialData.images)) {
        setImages(initialData.images);
      }

      if (initialData.attributes) {
        if (initialData.attributes.material) setMaterial(initialData.attributes.material);
        if (initialData.attributes.backrestHeight) setBackrestHeight(initialData.attributes.backrestHeight);
        if (initialData.attributes.colour) setColour(initialData.attributes.colour);
        if (initialData.attributes.dimensions) setDimensions(initialData.attributes.dimensions);
        if (initialData.attributes.armrests) setArmrests(initialData.attributes.armrests);
        if (initialData.attributes.mechanism) setMechanism(initialData.attributes.mechanism);
        if (initialData.attributes.weightCapacity) setWeightCapacity(initialData.attributes.weightCapacity);
      }
    }
  }, [initialData]);

  // Derived: Level 1 Main Categories (no parent)
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parent || (typeof c.parent === 'object' && !(c.parent as any)?._id));
  }, [categories]);

  // Derived: Level 2 Subcategories of selected Main Category
  const subcategories = useMemo(() => {
    if (!categoryId) return [];
    return categories.filter((c) => {
      const pId = typeof c.parent === 'object' && c.parent ? (c.parent as any)._id : c.parent;
      return String(pId) === String(categoryId);
    });
  }, [categories, categoryId]);

  // Derived: Level 3 Specific Categories of selected Subcategory
  const specificCategories = useMemo(() => {
    if (!subcategoryId) return [];
    return categories.filter((c) => {
      const pId = typeof c.parent === 'object' && c.parent ? (c.parent as any)._id : c.parent;
      return String(pId) === String(subcategoryId);
    });
  }, [categories, subcategoryId]);

  // Cascading change handlers
  const handleMainCategoryChange = (newCatId: string) => {
    setCategoryId(newCatId);
    setSubcategoryId('');
    setClassificationId('');
  };

  const handleSubcategoryChange = (newSubId: string) => {
    setSubcategoryId(newSubId);
    setClassificationId('');
  };

  const handleClassificationChange = (newClassId: string) => {
    setClassificationId(newClassId);
    const classDoc = categories.find((c) => String(c._id) === String(newClassId));
    if (classDoc) {
      if (classDoc.name.includes('High Back') && !backrestHeight) {
        setBackrestHeight('High Back');
      } else if (classDoc.name.includes('Medium Back') && !backrestHeight) {
        setBackrestHeight('Medium Back');
      }
    }
  };

  // Selected Category Breadcrumb
  const selectedPathString = useMemo(() => {
    const parts: string[] = [];
    const mainDoc = categories.find((c) => String(c._id) === String(categoryId));
    if (mainDoc) parts.push(mainDoc.name);

    const subDoc = categories.find((c) => String(c._id) === String(subcategoryId));
    if (subDoc) parts.push(subDoc.name);

    const specificDoc = categories.find((c) => String(c._id) === String(classificationId));
    if (specificDoc) parts.push(specificDoc.name);

    return parts.join(' → ');
  }, [categories, categoryId, subcategoryId, classificationId]);

  // Discount percentage calculation
  const discountPercent = useMemo(() => {
    const m = Number(mrp);
    const s = Number(sellingPrice);
    if (m > 0 && s > 0 && s <= m) {
      return Math.round(((m - s) / m) * 100);
    }
    return 0;
  }, [mrp, sellingPrice]);

  // Add Image via URL
  const handleAddImageUrl = () => {
    if (!urlInput.trim()) return;
    const url = urlInput.trim();
    setImages((prev) => [
      ...prev,
      { url, altText: name, isPrimary: prev.length === 0 },
    ]);
    setUrlInput('');
  };

  // Set Primary Image
  const handleSetPrimary = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  // Remove Image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  // Upload Images File Handler
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
          {
            url: res.data.url,
            publicId: res.data.publicId,
            altText: name,
            isPrimary: prev.length === 0,
          },
        ]);
      } else {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('images', file));

        const res = await fetchApi<{ images: Array<{ url: string; publicId: string }> }>(
          '/uploads/multiple',
          {
            method: 'POST',
            body: formData,
          }
        );

        const newImgs = (res.data.images || []).map((item, idx) => ({
          url: item.url,
          publicId: item.publicId,
          altText: name,
          isPrimary: images.length === 0 && idx === 0,
        }));

        setImages((prev) => [...prev, ...newImgs]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError('');
    setSuccessMessage('');

    if (!name.trim()) {
      setError('Please provide a product name.');
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      setError('Description must be at least 10 characters.');
      return;
    }

    if (!categoryId) {
      setError('Please select a main category.');
      return;
    }

    if (mrp === '' || Number(mrp) <= 0) {
      setError('Please enter a valid Actual Price (MRP).');
      return;
    }

    if (sellingPrice === '' || Number(sellingPrice) <= 0) {
      setError('Please enter a valid Discounted Price (Selling Price).');
      return;
    }

    if (Number(sellingPrice) > Number(mrp)) {
      setError('Discounted selling price cannot exceed the Actual MRP.');
      return;
    }

    if (images.length === 0) {
      setError('Please upload or provide at least one product image.');
      return;
    }

    setSubmitting(true);

    // Auto-generate slug and SKU if not provided
    const cleanSlug =
      initialData?.slug ||
      name
        .trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');

    const cleanSku =
      sku.trim() ||
      initialData?.sku ||
      `EC-${name.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase() || 'PRD'}-${Math.floor(
        100 + Math.random() * 900
      )}`;

    // Auto-derive backrest height if still empty
    let finalBackrest = backrestHeight.trim();
    if (!finalBackrest) {
      const nLower = name.toLowerCase();
      if (nLower.includes('high back')) finalBackrest = 'High Back';
      else if (nLower.includes('medium back') || nLower.includes('mid back')) finalBackrest = 'Medium Back';
    }

    const payload = {
      name: name.trim(),
      slug: cleanSlug,
      sku: cleanSku.toUpperCase(),
      category: categoryId,
      subcategory: subcategoryId || null,
      classification: classificationId || null,
      description: description.trim(),
      shortDescription: shortDescription.trim(),
      mrp: Number(mrp),
      sellingPrice: Number(sellingPrice),
      stock: stock === '' ? 10 : Number(stock),
      isBestseller,
      isFeatured,
      status,
      images,
      attributes: {
        material: material.trim(),
        backrestHeight: finalBackrest,
        colour: colour.trim(),
        dimensions: dimensions.trim(),
        armrests: armrests.trim(),
        mechanism: mechanism.trim(),
        weightCapacity: weightCapacity.trim(),
      },
    };

    try {
      if (isEdit && initialData?._id) {
        await fetchApi(`/products/${initialData._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setSuccessMessage('Product updated successfully!');
      } else {
        await fetchApi('/products', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setSuccessMessage('Product created successfully!');
      }

      setTimeout(() => {
        router.push('/products');
        router.refresh();
      }, 700);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save product');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="p-2 rounded-lg border border-[#E8E2D9] bg-white text-[#78716C] hover:text-[#1E1B18] transition"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#1E1B18]">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h1>
            <p className="text-xs text-[#78716C] mt-0.5">
              Fill in the verified fields below to publish or update your product catalogue.
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SECTION 1: Product Identification */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] border-b border-gray-100 pb-2">
          1. Product Identification
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ergocraft Apollo High Back Executive Chair"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              SKU Code
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. EC-APOL-001 (auto if empty)"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Full Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the ergonomic features, build quality, and comfort highlights..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Short Summary (Optional)
          </label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="1-line summary for product cards..."
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
          />
        </div>
      </div>

      {/* SECTION 2: Category Taxonomy (Cascading Dropdowns) */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] border-b border-gray-100 pb-2">
          2. Category Taxonomy
        </h2>

        {loadingCategories ? (
          <div className="flex items-center gap-2 text-xs text-gray-500 py-3">
            <Loader2 size={16} className="animate-spin text-[#667151]" />
            <span>Loading category taxonomy...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1: Main Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Main Category <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => handleMainCategoryChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
              >
                <option value="">Select Main Category</option>
                {mainCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 2: Subcategory */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Subcategory
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                disabled={!categoryId || subcategories.length === 0}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151] ${
                  !categoryId || subcategories.length === 0
                    ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 text-gray-800'
                }`}
              >
                <option value="">
                  {!categoryId
                    ? 'Select main category first'
                    : subcategories.length === 0
                    ? 'No subcategories'
                    : 'Select Subcategory (Optional)'}
                </option>
                {subcategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 3: Specific Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Specific Classification
              </label>
              <select
                value={classificationId}
                onChange={(e) => handleClassificationChange(e.target.value)}
                disabled={!subcategoryId || specificCategories.length === 0}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151] ${
                  !subcategoryId || specificCategories.length === 0
                    ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 text-gray-800'
                }`}
              >
                <option value="">
                  {!subcategoryId
                    ? 'Select subcategory first'
                    : specificCategories.length === 0
                    ? 'No specific classifications'
                    : 'Select Classification (Optional)'}
                </option>
                {specificCategories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Selected Breadcrumb Path */}
        {selectedPathString && (
          <div className="pt-2 text-xs flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <span className="font-semibold text-gray-800">Assigned Taxonomy Path:</span>
            <span className="font-medium text-[#667151]">{selectedPathString}</span>
          </div>
        )}
      </div>

      {/* SECTION 3: Attributes & Dimensions */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] border-b border-gray-100 pb-2 flex items-center gap-2">
          <Sliders size={16} className="text-[#667151]" />
          <span>3. Dimensions & Attributes</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Backrest Height
            </label>
            <select
              value={backrestHeight}
              onChange={(e) => setBackrestHeight(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            >
              <option value="">None / Not Applicable</option>
              <option value="High Back">High Back</option>
              <option value="Medium Back">Medium Back</option>
              <option value="Low Back">Low Back</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Material
            </label>
            <input
              type="text"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="e.g. Leatherette, Mesh, Fabric"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Colour
            </label>
            <input
              type="text"
              value={colour}
              onChange={(e) => setColour(e.target.value)}
              placeholder="e.g. Black, Beige Mushroom, Grey"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Overall Dimensions
            </label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 88 W x 36 D x 31 H in"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Mechanism
            </label>
            <input
              type="text"
              value={mechanism}
              onChange={(e) => setMechanism(e.target.value)}
              placeholder="e.g. Synchro-Tilt Multi-Lock"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Weight Capacity
            </label>
            <input
              type="text"
              value={weightCapacity}
              onChange={(e) => setWeightCapacity(e.target.value)}
              placeholder="e.g. 135 kg"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Pricing, Inventory & Status */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] border-b border-gray-100 pb-2">
          4. Pricing, Inventory & Status
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Actual Price (MRP ₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={mrp}
              onChange={(e) => setMrp(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 24999"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              {discountPercent > 0 && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              required
              value={sellingPrice}
              onChange={(e) =>
                setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))
              }
              placeholder="e.g. 19999"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Stock Quantity <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="e.g. 15"
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Publishing Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-6">
          <label className="relative flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBestseller}
              onChange={(e) => setIsBestseller(e.target.checked)}
              className="w-4 h-4 rounded text-[#667151] border-gray-300 focus:ring-[#667151]"
            />
            <span className="text-xs font-semibold text-gray-800">
              Mark as Bestseller
            </span>
          </label>

          <label className="relative flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded text-[#667151] border-gray-300 focus:ring-[#667151]"
            />
            <span className="text-xs font-semibold text-gray-800">
              Mark as Featured Collection
            </span>
          </label>
        </div>
      </div>

      {/* SECTION 5: Product Images */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-[#1E1B18] border-b border-gray-100 pb-2">
          5. Product Images
        </h2>

        {/* Upload Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="px-4 py-2.5 rounded-lg border-2 border-dashed border-[#667151]/40 hover:border-[#667151] text-[#667151] hover:bg-[#ECEFE6]/50 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition">
            <Upload size={16} />
            <span>{uploadingImage ? 'Uploading...' : 'Upload Image File(s)'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={uploadingImage}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <div className="flex items-center gap-2 flex-1">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Or paste an image URL here..."
              className="flex-1 px-3.5 py-2 rounded-lg border border-gray-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#667151]/30 focus:border-[#667151]"
            />
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3.5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Image Previews */}
        {images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative rounded-lg border border-gray-200 overflow-hidden group bg-gray-50 aspect-square"
              >
                <img
                  src={img.url}
                  alt={`Product preview ${idx + 1}`}
                  className="w-full h-full object-cover"
                />

                {img.isPrimary && (
                  <span className="absolute top-1.5 left-1.5 bg-[#667151] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    Primary
                  </span>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="p-1.5 rounded-full bg-white text-gray-700 hover:text-amber-500 transition cursor-pointer"
                      title="Set as primary thumbnail"
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1.5 rounded-full bg-white text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic pt-1">
            No images added yet. Upload files or paste a direct image URL.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E8E2D9]">
        <Link
          href="/products"
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={submitting}
          className="px-7 py-2.5 rounded-lg bg-[#667151] hover:bg-[#4D5A3D] text-white text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Saving Product...</span>
            </>
          ) : (
            <span>Save Product</span>
          )}
        </button>
      </div>
    </form>
  );
};
