'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { fetchApi } from '../../../../lib/api';
import { ProductForm, type ProductFormData } from '../../../../components/ProductForm';

function EditProductContent() {
  const params = useParams();
  const id = params?.id as string;
  const [product, setProduct] = useState<ProductFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const loadProduct = async () => {
      try {
        const res = await fetchApi<{ product: ProductFormData }>(`/products/${id}`);
        setProduct(res.data.product);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-[#667151] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-[#78716C]">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 bg-white rounded-xl border border-rose-200 text-center">
        <p className="text-rose-600 font-semibold mb-1">Failed to load product</p>
        <p className="text-xs text-gray-500">{error}</p>
      </div>
    );
  }

  return <ProductForm initialData={product} isEdit={true} />;
}

export default function EditProductPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-500">Loading editor...</div>}>
      <EditProductContent />
    </Suspense>
  );
}
