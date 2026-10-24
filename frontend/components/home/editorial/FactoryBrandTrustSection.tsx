'use client';

import React from 'react';
import { Factory, ShieldCheck, Headphones, Award } from 'lucide-react';

export const FactoryBrandTrustSection: React.FC = () => {
  const PILLARS = [
    {
      icon: Factory,
      title: 'Bhiwandi Factory Direct',
      description: 'Manufactured and assembled directly at our Harihar Compound facility in Bhiwandi, eliminating middleman markups.',
    },
    {
      icon: ShieldCheck,
      title: 'Structural Quality Testing',
      description: 'BIFMA-calibrated hydraulic cylinders, solid kiln-dried wood framing, and reinforced nylon bases.',
    },
    {
      icon: Award,
      title: 'Contract & Residential Grade',
      description: 'Engineered for 10+ unit office fitouts, boutique hospitality projects, and distinguished private homes.',
    },
    {
      icon: Headphones,
      title: 'Direct WhatsApp Concierge',
      description: 'Speak directly with our factory specialists at +91 97680 01999 for customized fabrics, dimensions, and quotes.',
    },
  ];

  return (
    <section className="bg-[#FAF8F5] py-16 sm:py-20 border-b border-[#E7E2D6]">
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10">
        
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <p className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#78836A] mb-2">
            THE ERGOCRAFT ADVANTAGE
          </p>
          <h2 className="font-serif-luxury text-3xl sm:text-4xl font-normal text-[#1F251F] tracking-tight">
            Direct from the Makers in Bhiwandi.
          </h2>
          <p className="text-xs sm:text-sm text-[#6C7265] mt-2 font-light">
            Every piece is built with honest materials, transparent pricing, and direct manufacturer accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PILLARS.map((pillar) => {
            const IconComponent = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white rounded-2xl border border-[#E6E0D3] p-6 shadow-xs flex flex-col items-start transition-transform hover:-translate-y-1 duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-[#F4EFE6] text-[#78836A] flex items-center justify-center mb-4">
                  <IconComponent size={20} />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#1F251F] mb-1.5">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[#6C7265] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
