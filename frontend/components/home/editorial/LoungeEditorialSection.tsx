'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATALOGUE_INVENTORY } from '../../../lib/catalogueData';

export const LoungeEditorialSection: React.FC = () => {
  const spruce = CATALOGUE_INVENTORY.spruceLounge;
  const rose = CATALOGUE_INVENTORY.roseAccent;

  return (
    <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#E7E2D6] overflow-hidden">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#758169]" />
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#758169]">
              EDITION 04 • LOUNGE & SOFT SEATING
            </p>
          </div>
          <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-[#1E241E] leading-[1.06]">
            <span>Make Room</span>{' '}
            <span className="italic font-serif text-[#758169] font-light">to Unwind.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#656A5F] font-light mt-4 leading-relaxed max-w-2xl">
            Add a considered finishing touch with lounge seating and soft accents designed to bring character to your space.
          </p>
        </div>

        {/* 2-Column Sculptural Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Focus: Spruce Bent Plywood Lounge & Ottoman (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E4DFD3] p-6 sm:p-10 shadow-xs flex flex-col justify-between group">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2EFE8] text-[#556149] px-3 py-1 rounded-full border border-[#758169]/20">
                  {spruce.badge}
                </span>
                <span className="text-xs font-mono text-[#898E82]">Lounge Cat. • Pg. 02</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1E241E]">
                {spruce.name}
              </h3>
              <p className="text-sm text-[#666B60] font-light mt-2 max-w-xl leading-relaxed">
                {spruce.description}
              </p>

              {/* Genuine Cutout of Chair with Ottoman */}
              <div className="relative my-6 sm:my-8 h-[280px] sm:h-[360px] w-full flex items-center justify-center">
                <div className="absolute inset-0 bg-radial from-[#758169]/10 via-transparent to-transparent rounded-full blur-xl pointer-events-none" />
                <Image
                  src={spruce.image}
                  alt={spruce.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Specs & Link */}
            <div className="pt-6 border-t border-[#EDE8DE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#898E82] block">
                  CRAFT SPECIFICATION
                </span>
                <span className="text-xs font-medium text-[#1E241E] block">
                  Bent compressed plywood shell with cold-cured resilient foam.
                </span>
              </div>

              <Link
                href={spruce.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1C231F] hover:bg-[#323D37] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-md shrink-0 group"
              >
                <span>Explore Lounge Seating</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Secondary Spotlight: Rose Accent Chair (5 Cols) */}
          <div className="lg:col-span-5 bg-[#F3EDE2] rounded-3xl border border-[#E2D9CB] p-6 sm:p-10 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/70 text-[#606E54] px-3 py-1 rounded-full border border-black/5">
                  {rose.badge}
                </span>
                <span className="text-xs font-mono text-[#7B8074]">Lounge Cat. • Pg. 05</span>
              </div>

              <h3 className="font-serif text-2xl font-normal text-[#1E241E]">
                {rose.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#676C61] mt-2 leading-relaxed">
                {rose.description}
              </p>

              {/* Genuine Cutout */}
              <div className="relative my-6 h-[240px] sm:h-[280px] w-full flex items-center justify-center">
                <Image
                  src={rose.image}
                  alt={rose.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-2.5 pt-2">
                {rose.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2 text-xs text-[#2A2F28]">
                    <CheckCircle2 size={14} className="text-[#758169] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#DFD5C4] mt-6">
              <Link
                href="/products?category=soft-seating&subcategory=lounge-chairs"
                className="inline-flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-[#1E241E] hover:text-[#758169] transition group"
              >
                <span>Browse Accent Armchairs</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
