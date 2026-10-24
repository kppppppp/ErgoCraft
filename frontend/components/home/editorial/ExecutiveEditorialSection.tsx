'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATALOGUE_INVENTORY } from '../../../lib/catalogueData';

export const ExecutiveEditorialSection: React.FC = () => {
  const reclinex = CATALOGUE_INVENTORY.reclinexAuto;
  const classic = CATALOGUE_INVENTORY.classicExecutive;

  return (
    <section className="bg-[#FAF8F5] py-20 sm:py-28 border-b border-[#EAE6DE] overflow-hidden">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#966C3B]" />
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#966C3B]">
              EDITION 01 • EXECUTIVE & LEATHERETTE
            </p>
          </div>
          <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-[#1D211C] leading-[1.06]">
            <span>Command</span>{' '}
            <span className="italic font-serif text-[#966C3B] font-light">the Room.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#666B60] font-light mt-4 leading-relaxed max-w-2xl">
            Make a confident impression with executive seating that brings presence and comfort to your workspace.
          </p>
        </div>

        {/* Asymmetrical Hero Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* Main Hero Card: ReclineX Auto (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-[#E7E2D8] p-5 sm:p-10 lg:p-12 shadow-sm flex flex-col justify-between relative overflow-hidden group">
            
            {/* Top Info Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 z-10 mb-4 sm:mb-6">
              <div>
                <span className="inline-block px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F5EFE6] text-[#966C3B] mb-1.5 sm:mb-2">
                  {reclinex.badge}
                </span>
                <h3 className="font-serif text-xl sm:text-3xl font-normal text-[#1F241E]">
                  {reclinex.name}
                </h3>
              </div>
              <div className="text-left xs:text-right">
                <span className="text-[10px] sm:text-xs font-mono text-[#8C9086] block">Catalogue Model</span>
                <span className="text-xs sm:text-sm font-semibold text-[#1F241E]">Pg. 02 • Leatherette Cat.</span>
              </div>
            </div>

            {/* Visual Center: Large Genuine Product Cutout */}
            <div className="relative my-3 sm:my-8 h-[240px] xs:h-[280px] sm:h-[440px] w-full flex items-center justify-center">
              <Image
                src={reclinex.image}
                alt={reclinex.name}
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Bottom Specs & Action */}
            <div className="pt-4 sm:pt-6 border-t border-[#F0EBE1] grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 z-10">
              {reclinex.specs.map((spec) => (
                <div key={spec.label} className="bg-[#FAF8F5] p-2.5 sm:p-3 rounded-xl border border-[#EFECE4]">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#8A8F83] block truncate">
                    {spec.label}
                  </span>
                  <span className="text-[11px] sm:text-xs font-medium text-[#20251F] mt-0.5 block leading-tight truncate">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Direct CTA Bar */}
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pt-3 sm:pt-4">
              <p className="text-xs sm:text-sm text-[#6C7166] max-w-md">
                Hand-tailored upholstery with high-resilience molded cushioning and multi-position knee-tilt lock.
              </p>
              <Link
                href={reclinex.href}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-[#1C2420] hover:bg-[#313C36] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-md shrink-0 group text-center"
              >
                <span>Explore Executive Chairs</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Secondary Spotlight Card: Classic Tufted Executive (4 Cols) */}
          <div className="lg:col-span-4 bg-[#F2EDE4] rounded-3xl border border-[#E2DCCE] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-white/70 text-[#78542B] mb-2">
                {classic.badge}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1F241E]">
                {classic.name}
              </h3>
              <p className="text-xs text-[#6F7368] mt-2 leading-relaxed">
                {classic.description}
              </p>

              {/* Genuine Product Image */}
              <div className="relative h-[240px] sm:h-[280px] w-full my-6 flex items-center justify-center">
                <Image
                  src={classic.image}
                  alt={classic.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-contain"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-2.5 pt-2">
                {classic.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2 text-xs text-[#333830]">
                    <CheckCircle2 size={14} className="text-[#966C3B] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#E0D9C8] mt-6">
              <Link
                href="/products?category=office-chairs&subcategory=leatherette-chairs"
                className="inline-flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-[#1F241E] hover:text-[#966C3B] transition group"
              >
                <span>Browse Leatherette Collection</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
