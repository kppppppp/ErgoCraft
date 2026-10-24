'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export interface PrimaryCollection {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  href: string;
  image: string;
  imageAlt: string;
  catalogueRef: string;
  sourceModel: string;
  scopeSummary: string;
}

export const PRIMARY_COLLECTIONS: PrimaryCollection[] = [
  {
    id: 'office-seating',
    name: 'Office Seating',
    tag: 'WORKSPACES & EXECUTIVE',
    subtitle: 'High-performance ergonomic mesh, Italian leatherette executive seating, and team workstation chairs.',
    href: '/products?category=office-chairs',
    image: '/images/cleaned/executive/reclinex-auto.png',
    imageAlt: 'Ergocraft ReclineX Auto High Back Executive Office Chair',
    catalogueRef: 'Leatherette Cat. • Pg. 02',
    sourceModel: 'ReclineX Auto Executive Chair',
    scopeSummary: 'Executive • Mesh Ergonomics • Workstations',
  },
  {
    id: 'sofas-recliners',
    name: 'Sofas & Recliners',
    tag: 'LIVING & EXECUTIVE SUITES',
    subtitle: 'Handcrafted solid hardwood sofas, motorized zero-gravity recliners, and bespoke modular configurations.',
    href: '/products?category=sofas',
    image: '/images/cleaned/sofas/wilfred-sofa.png',
    imageAlt: 'Ergocraft Wilfred Solid Hardwood Handcrafted 3-Seater Sofa',
    catalogueRef: 'Sofa Cat. • Pg. 07',
    sourceModel: 'Wilfred Handcrafted Sofa',
    scopeSummary: '3-Seaters • Sectionals • Motorized Recliners',
  },
  {
    id: 'lounge-seating',
    name: 'Lounge Seating',
    tag: 'LOUNGE & ACCENT',
    subtitle: 'Sculptural bent-plywood reading chairs, soft poufs, and luxury reception breakout seating.',
    href: '/products?category=soft-seating&subcategory=lounge-chairs',
    image: '/images/cleaned/lounge/rose-accent-chair.png',
    imageAlt: 'Ergocraft Rose Sculptural Accent Lounge Armchair',
    catalogueRef: 'Lounge Cat. • Pg. 05',
    sourceModel: 'Rose Sculptural Accent Chair',
    scopeSummary: 'Accent Armchairs • Ottomans • Breakout Seating',
  },
  {
    id: 'dining-cafe',
    name: 'Dining & Café',
    tag: 'DINING & COUNTER SEATING',
    subtitle: 'Solid wood dining chairs, architectural bistro perches, and 750mm commercial counter stools.',
    href: '/products?category=soft-seating&subcategory=dining-chairs',
    image: '/images/cleaned/dining/ernest-dining-chair.png',
    imageAlt: 'Ergocraft Ernest Curved Solid Wood Dining Chair',
    catalogueRef: 'Dining Cat. • Pg. 11',
    sourceModel: 'Ernest Solid Wood Dining Chair',
    scopeSummary: 'Solid Wood Dining • Cafe Seating • Bar Stools',
  },
];

export const ShopByCategory: React.FC = () => {
  return (
    <section
      id="explore-seating-collection"
      aria-labelledby="explore-seating-title"
      className="relative overflow-hidden border-y border-[#E7E5DC] bg-[#FAF8F5] pt-14 sm:pt-20 pb-12 sm:pb-16"
    >
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-2.5">
              <span className="w-2 h-2 rounded-full bg-[#78836A]" />
              <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#70775D]">
                EXPLORE THE COLLECTION
              </p>
            </div>
            
            <h2
              id="explore-seating-title"
              className="font-serif-luxury text-3xl sm:text-4xl lg:text-[46px] font-normal tracking-tight text-[#1F251F] leading-[1.08]"
            >
              <span>Seating for</span>{' '}
              <span className="italic font-serif text-[#78836A] font-light">Every Space.</span>
            </h2>
            
            <p className="text-xs sm:text-sm md:text-[15px] text-[#6C7164] font-light mt-2.5 max-w-2xl leading-relaxed">
              From focused workdays to relaxed living, discover seating designed around the way you work, gather and unwind.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#525C46] hover:text-[#252C22] uppercase tracking-wider transition-colors self-start md:self-auto group shrink-0 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#78836A] rounded-lg px-2 py-1"
          >
            <span>View Complete Catalogue</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-200" aria-hidden="true" />
          </Link>
        </div>

        {/* 4 Polished Primary Collection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-stretch">
          {PRIMARY_COLLECTIONS.map((col) => (
            <Link
              key={col.id}
              href={col.href}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-[#E7E2D6] hover:border-[#78836A]/50 p-4 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#78836A]"
              aria-label={`${col.name}: ${col.subtitle}`}
            >
              <div>
                {/* Card Tag & Catalogue Reference */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-[#78836A] bg-[#F3F5F1] px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-[#78836A]/15">
                    {col.tag}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-[#8C9084] shrink-0">
                    {col.catalogueRef}
                  </span>
                </div>

                {/* Primary Category Title */}
                <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1F251F] group-hover:text-[#2E362F] transition-colors mt-2 sm:mt-3">
                  {col.name}
                </h3>

                {/* Short Supporting Line */}
                <p className="text-xs text-[#6C7164] font-light leading-relaxed mt-1.5 sm:mt-2 line-clamp-2">
                  {col.subtitle}
                </p>

                {/* Large Relevant Real Product Photograph */}
                <div className="relative w-full h-[190px] xs:h-[210px] sm:h-[240px] my-4 sm:my-5 rounded-2xl bg-[#FAF8F5] border border-[#F0ECE3] flex items-center justify-center p-3 sm:p-4 overflow-hidden group-hover:bg-[#F6F4ED] transition-colors duration-300">
                  <Image
                    src={col.image}
                    alt={col.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-contain p-2 sm:p-3 group-hover:scale-106 transition-transform duration-500 ease-out"
                  />
                </div>

                {/* Scope pill row */}
                <p className="text-[10px] sm:text-[11px] font-mono text-[#7D8275] tracking-wide">
                  {col.scopeSummary}
                </p>
              </div>

              {/* Bottom CTA with directional affordance */}
              <div className="pt-3.5 sm:pt-4 mt-3 sm:mt-4 border-t border-[#EFECE3] flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#1F251F] group-hover:text-[#78836A] transition-colors">
                <span>Explore Collection</span>
                <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform duration-200" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>

        {/* Horizontal Trust Strip */}
        <div className="relative z-10 mt-10 sm:mt-16 pt-6 sm:pt-10 border-t border-[#E5E3D8] w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-6 items-center">
            {/* 1. Commercial */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border border-[#E7E2D6] sm:border-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#DDD9CE] flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#78836A] transition-colors">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#20251F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-[#1F241F] truncate">
                  COMMERCIAL
                </p>
                <p className="text-[10px] sm:text-xs text-[#71736D] leading-tight font-medium truncate">
                  Grade Furniture
                </p>
              </div>
            </div>

            {/* 2. Durable */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border border-[#E7E2D6] sm:border-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#DDD9CE] flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#78836A] transition-colors">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#20251F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3" />
                  <path d="M2 11a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-7z" />
                  <path d="M4 14h16" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-[#1F241F] truncate">
                  DURABLE
                </p>
                <p className="text-[10px] sm:text-xs text-[#71736D] leading-tight font-medium truncate">
                  Premium Materials
                </p>
              </div>
            </div>

            {/* 3. Factory Direct */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border border-[#E7E2D6] sm:border-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#DDD9CE] flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#78836A] transition-colors">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#20251F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-[#1F241F] truncate">
                  FACTORY DIRECT
                </p>
                <p className="text-[10px] sm:text-xs text-[#71736D] leading-tight font-medium truncate">
                  No Middlemen Markups
                </p>
              </div>
            </div>

            {/* 4. 3-Year Warranty */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border border-[#E7E2D6] sm:border-0">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#DDD9CE] flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#78836A] transition-colors">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#20251F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-[#1F241F] truncate">
                  3-YEAR WARRANTY
                </p>
                <p className="text-[10px] sm:text-xs text-[#71736D] leading-tight font-medium truncate">
                  BIFMA Structural Grade
                </p>
              </div>
            </div>

            {/* 5. Pan India */}
            <div className="flex items-center gap-2.5 sm:gap-3.5 group col-span-2 md:col-span-1 bg-white/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none border border-[#E7E2D6] sm:border-0 justify-center sm:justify-start">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white border border-[#DDD9CE] flex items-center justify-center shrink-0 shadow-xs group-hover:border-[#78836A] transition-colors">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-[#20251F]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                  <path d="M15 18H9" />
                  <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                  <circle cx="17" cy="18.5" r="2.5" />
                  <circle cx="7" cy="18.5" r="2.5" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] sm:text-[13px] font-bold uppercase tracking-wider text-[#1F241F] truncate">
                  PAN INDIA
                </p>
                <p className="text-[10px] sm:text-xs text-[#71736D] leading-tight font-medium truncate">
                  Direct Factory Delivery
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
