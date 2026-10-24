'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATALOGUE_INVENTORY } from '../../../lib/catalogueData';

export const SofaEditorialSection: React.FC = () => {
  const bonjour = CATALOGUE_INVENTORY.bonjourSofa;
  const enrich = CATALOGUE_INVENTORY.enrichRecliner;

  return (
    <section className="bg-[#F7F5F0] py-20 sm:py-28 border-b border-[#E5E0D5]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-[#826644]" />
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#826644]">
              EDITION 03 • HANDCRAFTED SOFAS & RECLINERS
            </p>
          </div>
          <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-[#212620] leading-[1.06]">
            <span>Come Home</span>{' '}
            <span className="italic font-serif text-[#826644] font-light">to Comfort.</span>
          </h2>
          <p className="text-base sm:text-lg text-[#686E61] font-light mt-4 leading-relaxed max-w-2xl">
            Discover sofas and recliners that bring character, comfort, and considered design into your living space.
          </p>
        </div>

        {/* 2-Card Sofa & Recliner Architecture */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Main Hero Card: Bonjour 3-Seater Sofa (8 Cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl sm:rounded-3xl border border-[#E3DDCF] p-5 sm:p-10 shadow-xs flex flex-col justify-between group">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F4EFE6] text-[#826644] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#826644]/20">
                  {bonjour.badge}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-[#8C9086]">Sofa Catalogue • Pg. 19</span>
              </div>

              <h3 className="font-serif text-xl sm:text-3xl font-normal text-[#212620]">
                {bonjour.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#6C7164] font-light mt-1.5 sm:mt-2 max-w-2xl leading-relaxed">
                {bonjour.description}
              </p>

              {/* Large Genuine Sofa Photography */}
              <div className="relative my-4 sm:my-8 h-[200px] xs:h-[240px] sm:h-[400px] w-full rounded-2xl overflow-hidden bg-[#FAF8F5]">
                <Image
                  src={bonjour.image}
                  alt={bonjour.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            </div>

            {/* Verified Specifications Grid & CTA */}
            <div className="pt-4 sm:pt-6 border-t border-[#F0EBE0]">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 mb-5 sm:mb-6">
                {bonjour.specs.map((spec) => (
                  <div key={spec.label} className="bg-[#FAF8F5] p-2.5 sm:p-3 rounded-xl border border-[#EFEBE3]">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#8C9086] block truncate">
                      {spec.label}
                    </span>
                    <span className="text-[11px] sm:text-xs font-medium text-[#212620] mt-0.5 block truncate">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <span className="text-[11px] sm:text-xs text-[#717669]">
                  Available in bespoke 1-Seater, 2-Seater, and 3-Seater room configurations.
                </span>
                <Link
                  href={bonjour.href}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-[#202722] hover:bg-[#343F37] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-md shrink-0 group text-center"
                >
                  <span>Explore Sofas & Recliners</span>
                  <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Secondary Spotlight: Enrich Motorized Recliner (4 Cols) */}
          <div className="lg:col-span-4 bg-[#EDE7DC] rounded-3xl border border-[#DED6C7] p-6 sm:p-8 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-white/80 text-[#6B5133] px-3 py-1 rounded-full border border-black/5">
                  {enrich.badge}
                </span>
                <span className="text-xs font-mono text-[#7B8074]">Sofa Cat. • Pg. 25</span>
              </div>

              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#212620]">
                {enrich.name}
              </h3>
              <p className="text-xs text-[#6C7164] mt-2 leading-relaxed">
                {enrich.description}
              </p>

              {/* Genuine Product Studio Presentation */}
              <div className="relative my-6 h-[220px] sm:h-[260px] w-full rounded-2xl overflow-hidden bg-[#E2DBD0] border border-[#D4CBBF] shadow-xs">
                <Image
                  src={enrich.image}
                  alt={enrich.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 30vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-2.5 pt-2">
                {enrich.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2 text-xs text-[#2A2F28]">
                    <CheckCircle2 size={14} className="text-[#826644] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#D9D1C0] mt-6">
              <Link
                href="/products?category=sofas"
                className="inline-flex items-center justify-between w-full text-xs font-semibold uppercase tracking-wider text-[#212620] hover:text-[#826644] transition group"
              >
                <span>View Recliner Options</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
