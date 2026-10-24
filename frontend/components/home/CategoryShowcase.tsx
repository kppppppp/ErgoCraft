'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  tag: string;
  subtitle: string;
  href: string;
  image: string;
  countLabel: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'executive-chairs',
    name: 'Executive Chairs',
    tag: 'Executive Prestige',
    subtitle: 'Supple leatherette upholstery, high-density molded foam & polished aluminium chassis.',
    href: '/products?category=office-chairs&subcategory=leatherette-chairs',
    image: '/images/cat-executive.png',
    countLabel: 'From ₹14,999',
  },
  {
    id: 'mesh-chairs',
    name: 'Mesh Chairs',
    tag: 'All-Day Ergonomics',
    subtitle: 'High-tensile breathable elastomeric mesh with dynamic calibrated active lumbar support.',
    href: '/products?category=office-chairs&subcategory=mesh-chairs',
    image: '/images/cat-workstation.png',
    countLabel: 'From ₹8,999',
  },
  {
    id: 'workstation-chairs',
    name: 'Workstation Chairs',
    tag: 'Team Productivity',
    subtitle: 'Waterfall seat edges, mid-back support, and heavy-duty nylon bases for team desks.',
    href: '/products?category=office-chairs&subcategory=workstation-chairs',
    image: '/images/cat-visitor.png',
    countLabel: 'From ₹6,499',
  },
  {
    id: 'sofas',
    name: 'Sofas',
    tag: 'Living & Executive',
    subtitle: 'Handcrafted 2-seater, 3-seater & modular sofas built with kiln-dried solid hardwood.',
    href: '/products?category=sofas',
    image: '/images/hero-sofa.webp',
    countLabel: 'From ₹28,999',
  },
  {
    id: 'lounge-soft-seating',
    name: 'Lounge / Soft Seating',
    tag: 'Breakout Zones',
    subtitle: 'Wingback chairs, velvet accent armchairs, and luxury boutique reception seating.',
    href: '/products?category=soft-seating&subcategory=lounge-chairs',
    image: '/hero-img/soft_sitting.png',
    countLabel: 'From ₹18,499',
  },
  {
    id: 'cafe-chairs',
    name: 'Cafe Chairs',
    tag: 'Cafe & Bistro',
    subtitle: 'Modern bistro seating, architectural wireframe chairs, and cafe bar stools.',
    href: '/products?category=soft-seating&subcategory=cafe-chairs',
    image: '/hero-img/bar_stool.png',
    countLabel: 'From ₹7,999',
  },
];

export const CategoryShowcase: React.FC = () => {
  return (
    <section id="shop-by-category" className="bg-white pt-8 pb-12 sm:pt-10 sm:pb-16 border-b border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#78836A] block mb-1">
              Explore By Category
            </span>
            <h2 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#13231D]">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-[#73756F] mt-1 max-w-xl">
              Engineered seating designed for high-focus work, executive prestige, and modern hospitality.
            </p>
          </div>

          <Link
            href="/products"
            className="text-xs font-bold text-[#13231D] hover:text-[#78836A] uppercase tracking-wider flex items-center gap-1 group self-start sm:self-auto cursor-pointer"
          >
            <span>View All Categories</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group bg-[#FAF9F6] rounded-2xl border border-[#E8E5DE] overflow-hidden hover:border-[#78836A]/60 hover:shadow-lg transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Product Visual Area */}
              <div className="relative w-full h-52 sm:h-60 bg-white border-b border-[#E8E5DE] flex items-center justify-center p-4 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-contain p-3 group-hover:scale-104 transition-transform duration-500 ease-out"
                />

                {/* Tag Pill */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md bg-[#FAF9F6] border border-[#E8E5DE] text-[10px] font-bold uppercase tracking-wider text-[#13231D]">
                    {cat.tag}
                  </span>
                </div>

                {/* Price / Subtitle indicator */}
                <div className="absolute bottom-3 right-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#13231D]/80 backdrop-blur-xs text-[10px] font-semibold text-white">
                    {cat.countLabel}
                  </span>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-2.5">
                <div>
                  <h3 className="font-semibold text-base sm:text-lg text-[#13231D] group-hover:text-[#78836A] transition-colors leading-snug">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#575953] leading-relaxed mt-1 line-clamp-2">
                    {cat.subtitle}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E5DE]/60 flex items-center justify-between text-xs font-semibold text-[#13231D] group-hover:text-[#78836A] transition-colors">
                  <span>Explore Products</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
