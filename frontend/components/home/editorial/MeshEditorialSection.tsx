'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { CATALOGUE_INVENTORY } from '../../../lib/catalogueData';

export const MeshEditorialSection: React.FC = () => {
  const ergoluxe = CATALOGUE_INVENTORY.ergoluxeFlagship;
  const sitronix = CATALOGUE_INVENTORY.sitronixMesh;

  return (
    <section className="bg-[#EDE7DC] py-20 sm:py-28 border-b border-[#DED6C7] overflow-hidden relative">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#D4CBBF]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-2 sm:mb-3">
              <span className="w-2 h-2 rounded-full bg-[#826644]" />
              <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#826644]">
                EDITION 02 • ACTIVE WORKSPACE ERGONOMICS
              </p>
            </div>
            <h2 className="font-serif-luxury text-3xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-[#212620] leading-[1.06]">
              <span>Made for</span>{' '}
              <span className="italic font-serif text-[#826644] font-light">the Long Game.</span>
            </h2>
            <p className="text-sm sm:text-lg text-[#6C7164] font-light mt-2 sm:mt-4 leading-relaxed max-w-2xl">
              For long workdays and focused sessions, explore mesh seating designed to bring thoughtful support to your workspace.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <Link
              href={ergoluxe.href}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-[#202722] hover:bg-[#343F37] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-md group text-center"
            >
              <span>Discover Mesh Chairs</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 2-Column Mesh Architecture Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Main Focus: Ergoluxe High Back (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl sm:rounded-3xl border border-[#DED6C7] p-5 sm:p-10 shadow-xs flex flex-col justify-between group hover:border-[#826644]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-[#826644] bg-[#F4EFE6] px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-[#826644]/20">
                  {ergoluxe.badge}
                </span>
                <span className="text-[10px] sm:text-xs font-mono text-[#8C9086]">Mesh Catalogue • Pg. 06</span>
              </div>

              <h3 className="font-serif text-xl sm:text-3xl text-[#212620] font-normal">
                {ergoluxe.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#6C7164] font-light mt-1.5 sm:mt-2 max-w-xl leading-relaxed">
                {ergoluxe.description}
              </p>
            </div>

            {/* Genuine High-Res Chair Silhouette */}
            <div className="relative my-4 sm:my-8 h-[240px] xs:h-[280px] sm:h-[420px] w-full flex items-center justify-center">
              <Image
                src={ergoluxe.image}
                alt={ergoluxe.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Verified Specifications Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 pt-4 border-t border-[#F0EBE0]">
              {ergoluxe.specs.map((spec) => (
                <div key={spec.label} className="bg-[#FAF8F5] p-2.5 sm:p-3 rounded-xl border border-[#EFEBE3]">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-[#8C9086] block truncate">
                    {spec.label}
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#212620] mt-0.5 block font-medium truncate">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Spotlight: Sitronix Performance Task (5 Cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#DED6C7] p-6 sm:p-10 shadow-xs flex flex-col justify-between group hover:border-[#826644]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F4EFE6] text-[#6B5133] px-3 py-1 rounded-full border border-[#826644]/20">
                  {sitronix.badge}
                </span>
                <span className="text-xs font-mono text-[#8C9086]">Mesh Catalogue • Pg. 02</span>
              </div>

              <h3 className="font-serif text-2xl text-[#212620] font-normal">
                {sitronix.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#6C7164] font-light mt-2 leading-relaxed">
                {sitronix.description}
              </p>

              {/* Genuine Cutout */}
              <div className="relative my-6 h-[260px] sm:h-[300px] w-full flex items-center justify-center">
                <Image
                  src={sitronix.image}
                  alt={sitronix.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-3 pt-2">
                {sitronix.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2.5 text-xs text-[#2A2F28]">
                    <CheckCircle2 size={14} className="text-[#826644] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#212620] font-medium">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#F0EBE0] mt-6 flex items-center justify-between">
              <span className="text-xs font-mono text-[#8C9086]">BIFMA Tested Class 4</span>
              <Link
                href={sitronix.href}
                className="text-xs font-semibold uppercase tracking-wider text-[#826644] hover:text-[#212620] transition inline-flex items-center gap-1.5 group"
              >
                <span>View Mesh Line</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
