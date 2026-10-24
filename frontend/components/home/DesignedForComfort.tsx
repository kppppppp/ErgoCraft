'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, ShieldCheck, Cpu, RefreshCw, ArrowRight } from 'lucide-react';

const ERGONOMIC_FEATURES = [
  {
    icon: RefreshCw,
    title: 'Synchronous Dynamic Tilt & 3D Lumbar',
    description:
      'Multi-locking synchro-tilt mechanism aligns dynamically with your spine’s natural curvature, relieving lower back disc pressure across 12+ hour workdays.',
  },
  {
    icon: Cpu,
    title: 'Class-4 Certified Hydraulic Gas-Lift',
    description:
      'Engineered for 150 kg payload and 100,000+ elevation cycles. BIFMA certified for rock-solid stability and zero gradual sinking.',
  },
  {
    icon: Layers,
    title: 'High-Tensile Breathable Mesh Matrix',
    description:
      'Hydrophobic Korean and Italian weave engineered to facilitate maximum airflow, preventing heat retention and fatigue throughout extended desk work.',
  },
  {
    icon: ShieldCheck,
    title: 'High-Resilience 55 kg/m³ Molded Cushioning',
    description:
      'Contoured cold-cured foam distributes weight evenly across pressure points. Backed by our 10-year factory structural guarantee.',
  },
];

export const DesignedForComfort: React.FC = () => {
  return (
    <section className="bg-[#13231D] text-[#F7F5F0] py-16 sm:py-24 border-y border-white/10 relative overflow-hidden">
      {/* Textured grain backdrop */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-overlay bg-repeat"
        style={{ backgroundImage: `url('/images/texture-grain-warm.png')`, backgroundSize: '240px 240px' }}
      />
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Visual feature imagery */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-white/15 shadow-2xl bg-[#0C1713]">
              <img
                src="/images/hero-chair.jpg"
                alt="ErgoCraft Ergonomic Mesh Engineering"
                className="w-full h-full object-contain p-6 bg-[#F6F5F0]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#13231D]/90 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/15 text-xs space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#CBD5C0]">
                  Factory Certified Ergonomics
                </span>
                <p className="font-semibold text-white">
                  Tested and calibrated in our Bhiwandi manufacturing facility for demanding corporate environments.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Feature list */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#CBD5C0] block mb-2">
                PRECISION ERGONOMICS & BIO-MECHANICS
              </span>
              <h2 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-[1.08]">
                <span>Engineered for 12+ hours</span>{' '}
                <span className="italic font-serif text-[#D5DFC7] font-light">of effortless posture.</span>
              </h2>
              <p className="text-sm text-white/70 mt-3 max-w-xl leading-relaxed font-light">
                Every ErgoCraft chair is engineered from the ground up to minimize spinal compression and encourage active circulation. Direct from our Bhiwandi factory with 10-year assurance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {ERGONOMIC_FEATURES.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-[#78836A]/50 transition-all space-y-2.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#78836A]/20 text-[#CBD5C0] flex items-center justify-center">
                      <IconComponent size={20} />
                    </div>
                    <h3 className="font-semibold text-sm text-white">{feat.title}</h3>
                    <p className="text-xs text-white/70 leading-relaxed">{feat.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/products?category=office-chairs"
                className="px-6 py-3.5 rounded-xl bg-[#78836A] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#59644E] transition shadow-xs flex items-center gap-2 group cursor-pointer"
              >
                <span>Explore Ergonomic Chairs</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/919768001999?text=Hi%20ErgoCraft,%20I%20would%20like%20guidance%20on%20choosing%20the%20best%20ergonomic%20chair"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 rounded-xl border border-white/20 hover:border-white text-xs font-semibold uppercase tracking-wider text-white transition flex items-center gap-2"
              >
                <span>Consult Factory Ergonomist</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
