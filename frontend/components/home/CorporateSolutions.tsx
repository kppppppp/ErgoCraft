'use client';

import React, { useState } from 'react';
import { CorporateQuoteModal } from '../CorporateQuoteModal';
import { Building2, CheckCircle2, Phone, Mail, ArrowRight } from 'lucide-react';

export const CorporateSolutions: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="corporate-solutions" className="py-14 sm:py-24 bg-white border-b border-[#E8E5DE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F7F5F0] rounded-2xl sm:rounded-3xl border border-[#E8E5DE] p-5 sm:p-12 lg:p-16 overflow-hidden relative">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#78836A]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: B2B Information */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-[#13231D]/5 border border-[#13231D]/10 text-[9px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.20em] sm:tracking-[0.22em] text-[#78836A]">
                <Building2 size={12} className="shrink-0" />
                <span className="truncate">ENTERPRISE & INSTITUTIONAL SEATING</span>
              </div>

              <h2 className="font-serif-luxury text-2xl xs:text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#13231D] leading-[1.08]">
                <span>Furnish Your Workplace</span>{' '}
                <span className="italic font-serif text-[#78836A] font-light">with Tailored Bulk Solutions.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#73756F] leading-relaxed max-w-xl">
                From startup office expansions to Fortune 500 headquarters, ErgoCraft partners with architects,
                interior designers, and procurement managers across India. Benefit from factory-direct tiered
                pricing, bespoke upholstery palettes, CAD space planning, and turnkey on-site assembly.
              </p>

              {/* B2B Value Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#242620]">
                  <CheckCircle2 size={15} className="text-[#78836A] shrink-0" />
                  <span>Corporate orders welcome</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#242620]">
                  <CheckCircle2 size={15} className="text-[#78836A] shrink-0" />
                  <span>Request a tailored quote</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#242620]">
                  <CheckCircle2 size={15} className="text-[#78836A] shrink-0" />
                  <span>Discuss product options with our team</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#242620]">
                  <CheckCircle2 size={15} className="text-[#78836A] shrink-0" />
                  <span>Confirm product terms before ordering</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="w-full sm:w-auto px-6 py-3 sm:px-7 sm:py-3.5 rounded-xl bg-[#13231D] text-white text-xs sm:text-sm font-semibold tracking-wider uppercase hover:bg-[#78836A] transition shadow-xs flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>Request Corporate Quote</span>
                  <ArrowRight size={15} />
                </button>

                <a
                  href="tel:+919768001999"
                  className="w-full sm:w-auto px-5 py-3 sm:px-6 sm:py-3.5 rounded-xl bg-white border border-[#E8E5DE] text-[#242620] text-xs sm:text-sm font-semibold tracking-wider uppercase hover:border-[#78836A] hover:text-[#78836A] transition shadow-2xs flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <Phone size={14} className="text-[#78836A] shrink-0" />
                  <span>Call B2B (+91 97680 01999)</span>
                </a>
              </div>
            </div>

            {/* Right Column: Visual Showcase Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E8E5DE] shadow-md relative bg-white">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=85&w=800&auto=format&fit=crop"
                  alt="Modern Corporate Office Fit-out"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#13231D]/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
                  <span className="text-[10px] font-mono uppercase text-[#78836A] font-bold">
                    Turnkey Corporate Projects
                  </span>
                  <p className="font-semibold text-white mt-0.5">
                    100+ Enterprise Installations Delivered Pan-India
                  </p>
                </div>
              </div>

              {/* Quick direct contact pill */}
              <div className="p-4 rounded-xl bg-white border border-[#E8E5DE] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#73756F]">
                  <Mail size={15} className="text-[#78836A]" />
                  <span>corporate@ergocraft.in</span>
                </div>
                <span className="font-semibold text-[#13231D]">Avg. Response: 4 hrs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Modal */}
      <CorporateQuoteModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};
