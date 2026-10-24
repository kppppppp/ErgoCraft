'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface CollectionCard {
  id: string;
  number: string;
  title: string;
  tag: string;
  image: string;
  href: string;
  alt: string;
  isBig: boolean;
}

const FEATURED_COLLECTIONS: CollectionCard[] = [
  {
    id: 'cafe-chairs',
    number: '01',
    title: 'Cafe Chairs',
    tag: 'BAR & DINING',
    image: '/images/categories/cafe-chair-studio.jpg',
    href: '/products?category=soft-seating&subcategory=cafe-chairs',
    alt: 'Modern Ergocraft Cafe Chairs in contemporary studio setting',
    isBig: true,
  },
  {
    id: 'dining-chair',
    number: '02',
    title: 'Dining Chairs',
    tag: 'STUDIO & HOME',
    image: '/images/categories/dining-chair-studio.jpg',
    href: '/products?category=soft-seating',
    alt: 'Ergocraft Dining Table and Chairs setup with sleek upholstery',
    isBig: false,
  },
  {
    id: 'sofas',
    number: '03',
    title: 'Handcrafted Sofas',
    tag: 'LIVING & SUITES',
    image: '/images/spaces-sofas.jpg',
    href: '/products?category=sofas',
    alt: 'Ergocraft Handcrafted Velvet and Hardwood Frame Sofas',
    isBig: true,
  },
  {
    id: 'soft-seating',
    number: '04',
    title: 'Soft Seating',
    tag: 'LOUNGE & ACCENT',
    image: '/images/categories/lounge-chair-velvet.jpg',
    href: '/products?category=soft-seating&subcategory=lounge-chairs',
    alt: 'Ergocraft Velvet Wingback and Contemporary Soft Seating',
    isBig: false,
  },
];

export const LatestCollectionsShowcase: React.FC = () => {
  return (
    <section className="bg-[#F8F6F0] py-16 sm:py-24 border-b border-[#E7E5DC]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Left Column: Heading, Subtitle & Button (Hero Typography Style) */}
          <div className="lg:col-span-3 xl:col-span-3 flex flex-col justify-center pr-0 lg:pr-2">
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#78836A] animate-pulse" />
              <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#70775D]">
                CURATED COLLECTIONS
              </p>
            </div>

            <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[50px] font-normal tracking-tight text-[#20251F] leading-[1.05]">
              <span className="block font-normal">Browse the</span>
              <span className="block italic font-serif text-[#78836A] font-light">
                latest collections.
              </span>
            </h2>

            <p className="text-sm sm:text-[15px] text-[#71736D] mt-3.5 mb-6 font-light leading-relaxed">
              Your Next Favorite Look Starts Here. Tailored silhouettes crafted with architectural balance.
            </p>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-full bg-[#B38747] hover:bg-[#9B7236] text-white text-xs sm:text-sm font-semibold tracking-wide shadow-md hover:shadow-lg transition-all duration-200 group"
              >
                <span>View All Collections</span>
                <ArrowRight
                  size={15}
                  className="ml-2 group-hover:translate-x-1.5 transition-transform"
                />
              </Link>
            </div>

            {/* Quick UX Micro-Trust Indicator */}
            <div className="mt-8 pt-6 border-t border-[#E8E5DE] hidden lg:block text-xs text-[#71736D] space-y-2">
              <p className="flex items-center gap-2 font-medium text-[#20251F]">
                <span className="text-[#B38747]">✓</span> 100% Solid Hardwood Frames
              </p>
              <p className="flex items-center gap-2 font-medium text-[#20251F]">
                <span className="text-[#B38747]">✓</span> High-Density Ergonomic Foam
              </p>
              <p className="flex items-center gap-2 font-medium text-[#20251F]">
                <span className="text-[#B38747]">✓</span> Custom Fabric & Swatch Options
              </p>
            </div>
          </div>

          {/* Right Column: Custom Asymmetric Grid (One Big, Small, Third Big, Fourth Small) */}
          <div className="lg:col-span-9 xl:col-span-9 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-end">
            {FEATURED_COLLECTIONS.map((col) => (
              <Link
                key={col.id}
                href={col.href}
                className={`group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xs hover:shadow-2xl transition-all duration-300 ring-1 ring-black/5 hover:-translate-y-1.5 flex flex-col justify-between ${
                  col.isBig
                    ? 'h-[360px] sm:h-[420px] lg:h-[450px]'
                    : 'h-[280px] sm:h-[320px] lg:h-[350px]'
                }`}
              >
                {/* Background Image */}
                <Image
                  src={col.image}
                  alt={col.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 320px"
                  className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />

                {/* Subtle Luxury Top & Bottom Gradient Vignettes */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25 pointer-events-none" />

                {/* Top Number & Tag */}
                <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between text-white/90">
                  <span className="font-mono text-[10px] font-bold text-[#E8D8C3] tracking-wider">
                    {col.number}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[9px] font-mono tracking-widest uppercase border border-white/15">
                    {col.tag}
                  </span>
                </div>

                {/* Floating white pill label at bottom center */}
                <div className="relative z-10 pb-4 sm:pb-5 px-3 flex justify-center">
                  <span className="inline-flex items-center justify-center px-4 sm:px-5 py-2 rounded-full bg-white/95 backdrop-blur-md text-[#1F241F] text-xs sm:text-[13px] font-semibold tracking-tight shadow-md group-hover:bg-[#13231D] group-hover:text-white transition-all duration-200">
                    {col.title}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
