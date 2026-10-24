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
    <section className="bg-[#0C1512] text-white py-20 sm:py-28 border-b border-white/10 overflow-hidden relative">
      {/* Background Accent Gradients */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#78836A]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-[#C5A880]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
              <p className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#C5A880]">
                EDITION 02 • ACTIVE WORKSPACE ERGONOMICS
              </p>
            </div>
            <h2 className="font-serif-luxury text-4xl sm:text-5xl lg:text-[56px] font-normal tracking-tight text-white leading-[1.06]">
              <span>Made for</span>{' '}
              <span className="italic font-serif text-[#C5A880] font-light">the Long Game.</span>
            </h2>
            <p className="text-base sm:text-lg text-white/70 font-light mt-4 leading-relaxed max-w-2xl">
              For long workdays and focused sessions, explore mesh seating designed to bring thoughtful support to your workspace.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href={ergoluxe.href}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#78836A] hover:bg-[#5E6852] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase transition shadow-lg group"
            >
              <span>Discover Mesh Chairs</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 2-Column Mesh Architecture Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Main Focus: Ergoluxe High Back (7 Cols) */}
          <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col justify-between backdrop-blur-sm group hover:border-[#C5A880]/30 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#C5A880] bg-[#C5A880]/10 px-3 py-1 rounded-full border border-[#C5A880]/20">
                  {ergoluxe.badge}
                </span>
                <span className="text-xs font-mono text-white/50">Mesh Catalogue • Pg. 06</span>
              </div>

              <h3 className="font-serif text-2xl sm:text-3xl text-white font-normal">
                {ergoluxe.name}
              </h3>
              <p className="text-sm text-white/70 font-light mt-2 max-w-xl leading-relaxed">
                {ergoluxe.description}
              </p>
            </div>

            {/* Genuine High-Res Chair Silhouette */}
            <div className="relative my-8 h-[340px] sm:h-[420px] w-full flex items-center justify-center">
              <Image
                src={ergoluxe.image}
                alt={ergoluxe.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            {/* Verified Specifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
              {ergoluxe.specs.map((spec) => (
                <div key={spec.label} className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#C5A880] block">
                    {spec.label}
                  </span>
                  <span className="text-xs text-white/85 mt-0.5 block font-medium">
                    {spec.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Secondary Spotlight: Sitronix Performance Task (5 Cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#14231E] to-[#0E1814] border border-white/10 rounded-3xl p-6 sm:p-10 flex flex-col justify-between group hover:border-[#78836A]/40 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#78836A] bg-[#78836A]/15 px-3 py-1 rounded-full border border-[#78836A]/30">
                  {sitronix.badge}
                </span>
                <span className="text-xs font-mono text-white/50">Mesh Catalogue • Pg. 02</span>
              </div>

              <h3 className="font-serif text-2xl text-white font-normal">
                {sitronix.name}
              </h3>
              <p className="text-xs sm:text-sm text-white/70 font-light mt-2 leading-relaxed">
                {sitronix.description}
              </p>

              {/* Genuine Cutout */}
              <div className="relative my-6 h-[260px] sm:h-[300px] w-full flex items-center justify-center">
                <Image
                  src={sitronix.image}
                  alt={sitronix.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-contain"
                />
              </div>

              {/* Verified Features */}
              <ul className="space-y-3 pt-2">
                {sitronix.specs.map((spec) => (
                  <li key={spec.label} className="flex items-start gap-2.5 text-xs text-white/80">
                    <CheckCircle2 size={14} className="text-[#78836A] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-medium">{spec.label}:</strong> {spec.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
              <span className="text-xs font-mono text-white/60">BIFMA Tested Class 4</span>
              <Link
                href={sitronix.href}
                className="text-xs font-semibold uppercase tracking-wider text-[#C5A880] hover:text-white transition inline-flex items-center gap-1.5 group"
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
