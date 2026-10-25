'use client';

import React, { Suspense } from 'react';
import { ProductForm } from '../../../components/ProductForm';

function NewProductContent() {
  return <ProductForm isEdit={false} />;
}

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-[#667151] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-[#78716C]">Loading product creator...</p>
        </div>
      }
    >
      <NewProductContent />
    </Suspense>
  );
}
