'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2, UtensilsCrossed, Wine } from 'lucide-react';
import { CATALOGUE_INVENTORY } from '../../../lib/catalogueData';

export const DiningCafeEditorialSection: React.FC = () => {
  const ernest = CATALOGUE_INVENTORY.ernestDining;
  const barros = CATALOGUE_INVENTORY.barrosBarStool;

  return (
    <section className="bg-[#F6F4EE] py-20 sm:py-28 border-b border-[#E3DDD0] overflow-hidden">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#A87948]" />
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#A87948]">
              EDITION 05 • DINING & BAR SEATING
            </p>
          </div>
          <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-[#1F251F] leading-[1.06]">
            <span>Gather</span>{' '}
            <span className="italic font-serif text-[#A87948] font-light">Beautifully.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#676C61] font-light mt-4 leading-relaxed max-w-2xl">
            Thoughtful seating for dining spaces, cafés, and the moments that bring people together.
          </p>
        </div>

        {/* 2-Column Equal Architectural Duo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          
          {/* Card A: Real Dining Chair (Ernest) */}
          <div className="bg-white rounded-3xl border border-[#E3DDCF] p-6 sm:p-10 shadow-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F9F6F0] text-[#8C6030] px-3 py-1 rounded-full border border-[#A87948]/20">
                  <UtensilsCrossed size={12} />
                  <span>{ernest.badge}</span>
                </span>
                <span className="text-xs font-mono text-[#8C9086]">Dining Cat. • Pg. 11</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F251F]">
                {ernest.name}
              </h3>
              <p className="text-sm text-[#6A7064] font-light mt-2 leading-relaxed">
                {ernest.description}
              </p>

              {/* Genuine Product Cutout */}
              <div className="relative my-6 sm:my-8 h-[280px] sm:h-[340px] w-full flex items-center justify-center">
                <Image
                  src={ernest.image}
                  alt={ernest.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-2.5 pt-2 border-t border-[#F2ECE0]">
                {ernest.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2 text-xs text-[#2A2F27]">
                    <CheckCircle2 size={14} className="text-[#A87948] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#F0EAE0] mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-xs text-[#717669]">
                Suitable for residences, executive dining, and boutique hospitality.
              </span>
              <Link
                href={ernest.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1F251F] hover:bg-[#343D34] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-md shrink-0 group"
              >
                <span>Explore Dining Chairs</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card B: Real Bar Stool (Barros) */}
          <div className="bg-white rounded-3xl border border-[#E3DDCF] p-6 sm:p-10 shadow-xs flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F2F4F1] text-[#4F604D] px-3 py-1 rounded-full border border-[#4F604D]/20">
                  <Wine size={12} />
                  <span>{barros.badge}</span>
                </span>
                <span className="text-xs font-mono text-[#8C9086]">Dining Cat. • Pg. 13</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#1F251F]">
                {barros.name}
              </h3>
              <p className="text-sm text-[#6A7064] font-light mt-2 leading-relaxed">
                {barros.description}
              </p>

              {/* Genuine Product Cutout */}
              <div className="relative my-6 sm:my-8 h-[280px] sm:h-[340px] w-full flex items-center justify-center">
                <Image
                  src={barros.image}
                  alt={barros.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-2.5 pt-2 border-t border-[#F2ECE0]">
                {barros.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2 text-xs text-[#2A2F27]">
                    <CheckCircle2 size={14} className="text-[#4F604D] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#F0EAE0] mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <span className="text-xs text-[#717669]">
                Engineered for kitchen islands, high-top cafe tables, and bar counters.
              </span>
              <Link
                href={barros.href}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#78836A] hover:bg-[#5E6852] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-md shrink-0 group"
              >
                <span>Browse Bar Stools</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
