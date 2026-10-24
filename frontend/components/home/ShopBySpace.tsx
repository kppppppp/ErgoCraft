'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SpaceItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  href: string;
  image: string;
  ctaText: string;
}

const SPACE_CATEGORIES: SpaceItem[] = [
  // Top 2 Big Cards
  {
    id: 'chairs',
    title: 'Chairs & Ergonomic Seating',
    subtitle: 'Calibrated active mesh workstation seating and executive leatherette high-backs engineered for peak productivity.',
    tag: 'CHAIRS & WORKSTATION',
    href: '/products?category=office-chairs',
    image: '/images/spaces-chairs.jpg',
    ctaText: 'Explore Chairs Catalogue',
  },
  {
    id: 'sofas',
    title: 'Handcrafted Luxury Sofas',
    subtitle: 'Kiln-dried hardwood frames, high-resilience foam cushioning, and bespoke upholstery tailored for living & corporate suites.',
    tag: 'SOFAS & LIVING',
    href: '/products?category=sofas',
    image: '/images/spaces-sofas.jpg',
    ctaText: 'Explore Sofas Collection',
  },
  // Bottom 3 Cards
  {
    id: 'soft-seating',
    title: 'Soft Seating & Accent Chairs',
    subtitle: 'Sculptural velvet armchairs, wingbacks, and breakout pods for contemporary lounges.',
    tag: 'SOFT SEATING',
    href: '/products?category=soft-seating&subcategory=lounge-chairs',
    image: '/images/spaces-soft-seating.jpg',
    ctaText: 'View Soft Seating',
  },
  {
    id: 'cafe-dining',
    title: 'Cafe & Bar Stools',
    subtitle: 'Architectural wireframe bistro stools, cafe chairs, and dining sets for hospitality spaces.',
    tag: 'CAFE & DINING',
    href: '/products?category=soft-seating&subcategory=cafe-chairs',
    image: '/images/spaces-cafe.jpg',
    ctaText: 'View Cafe & Stools',
  },
  {
    id: 'waiting-visitor',
    title: 'Waiting Lounge & Visitor Chairs',
    subtitle: 'Heavy-duty beam seating, cantilever visitor chairs, and reception waiting benches.',
    tag: 'WAITING & VISITOR',
    href: '/products?category=office-chairs&subcategory=workstation-chairs',
    image: '/images/spaces-waiting.jpg',
    ctaText: 'View Waiting Chairs',
  },
];

export const ShopBySpace: React.FC = () => {
  return (
    <section className="relative overflow-hidden w-full px-3 sm:px-6 lg:px-8 py-16 sm:py-24 bg-[#F5F4EC] border-b border-[#E7E5DC]">
      {/* Subtle Luxury Stippled Grain Texture Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-70 mix-blend-multiply"
        style={{
          backgroundImage: "url('/images/texture-grain-warm.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: '340px auto',
        }}
        aria-hidden="true"
      />

      {/* Header with Hero Typography Style */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <p className="mb-2 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#70775D]">
          SPATIAL VISUAL MERCHANDISING
        </p>
        <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-[46px] font-normal tracking-tight text-[#20251F] leading-[1.08]">
          <span>Shop by</span>{' '}
          <span className="italic font-serif text-[#78836A] font-light">Space & Purpose.</span>
        </h2>
        <p className="text-sm text-[#73756F] font-light mt-2 max-w-lg mx-auto">
          Tailored seating curated for the distinct ergonomic and aesthetic demands of every environment.
        </p>
      </div>

      {/* Full-Width 5 Grid: 2 Big on Top, 3 Below */}
      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-6 gap-4 sm:gap-6">
        {/* Top 2 Big Cards (md:col-span-3 each) */}
        {SPACE_CATEGORIES.slice(0, 2).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="md:col-span-3 group relative h-96 sm:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E5DE] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-10"
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111A15]/95 via-[#111A15]/40 to-transparent" />

            <div className="relative z-10 space-y-2.5 text-white max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[10px] font-mono tracking-widest uppercase text-[#E8D8C3] font-bold border border-white/20">
                {item.tag}
              </span>
              <h3 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-normal text-white leading-tight">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 line-clamp-2 font-light leading-relaxed">
                {item.subtitle}
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#C5A880] group-hover:text-white group-hover:translate-x-2 transition-all">
                <span>{item.ctaText}</span>
                <ArrowRight size={15} />
              </div>
            </div>
          </Link>
        ))}

        {/* Bottom 3 Cards (md:col-span-2 each) */}
        {SPACE_CATEGORIES.slice(2, 5).map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className="md:col-span-2 group relative h-80 sm:h-[380px] rounded-2xl sm:rounded-3xl overflow-hidden border border-[#E8E5DE] shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-end p-6 sm:p-8"
          >
            <img
              src={item.image}
              alt={item.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-106 transition-transform duration-700 ease-out"
              loading="lazy"
            />
            {/* Cinematic Gradient Vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111A15]/95 via-[#111A15]/40 to-transparent" />

            <div className="relative z-10 space-y-2 text-white">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[9px] font-mono tracking-widest uppercase text-[#E8D8C3] font-bold border border-white/20">
                {item.tag}
              </span>
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-normal text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-xs text-white/75 line-clamp-2 font-light leading-relaxed">
                {item.subtitle}
              </p>
              <div className="pt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#C5A880] group-hover:text-white group-hover:translate-x-1.5 transition-all">
                <span>{item.ctaText}</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

