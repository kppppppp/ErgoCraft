'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const FinalCtaSection: React.FC = () => {
  return (
    <section className="bg-[#121E19] text-white py-20 sm:py-28 relative overflow-hidden">
      {/* Subtle Warm Gradient Radiance */}
      <div className="absolute inset-0 bg-radial from-[#78836A]/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
          <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#C5A880]">
            THE COMPLETE 2026 CATALOGUE
          </p>
        </div>

        <h2 className="font-serif-luxury text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-[1.08] mb-5 text-white">
          <span>Your Space.</span>{' '}
          <span className="italic font-serif text-[#C5A880] font-light">Your Seating.</span>
        </h2>

        <p className="text-base sm:text-lg text-white/75 font-light leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10">
          Explore the collection and find the right fit for your space. High-performance ergonomic workstations, handcrafted living room suites, and architectural cafe silhouettes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#78836A] hover:bg-[#5E6852] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-xl group"
          >
            <span>Browse All Seating</span>
            <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>

          <a
            href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20would%20like%20to%20request%20the%20complete%202026%20catalogue"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-medium tracking-wide border border-white/15 transition"
          >
            <span>Request Digital Catalogue</span>
          </a>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-white/50 font-mono">
          <span>Direct Bhiwandi Factory</span>
          <span>•</span>
          <span>Executive & Mesh Office Seating</span>
          <span>•</span>
          <span>Luxury Sofas & Recliners</span>
        </div>

      </div>
    </section>
  );
};
