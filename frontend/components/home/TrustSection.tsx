'use client';

import React from 'react';
import { ShieldCheck, Truck, LockKeyhole, MessageCircle } from 'lucide-react';

const PILLARS = [
  {
    icon: ShieldCheck,
    title: '10-Year Factory Warranty',
    description: 'Comprehensive manufacturer guarantee on frames, tilt mechanisms, and Class-4 gas-lifts.',
  },
  {
    icon: Truck,
    title: 'Pan-India Free Delivery',
    description: 'Dispatched direct from our Bhiwandi manufacturing hub with transit insurance and protective crating.',
  },
  {
    icon: LockKeyhole,
    title: '100% Encrypted Checkout',
    description: 'Protected payments via Razorpay supporting UPI, all major cards, NetBanking, and flexible EMI.',
  },
  {
    icon: MessageCircle,
    title: 'Factory Direct Consultation',
    description: 'Connect directly with our seating specialists via WhatsApp (+91 97680 01999) for custom orders.',
  },
];

export const TrustSection: React.FC = () => (
  <section className="bg-[#F6F5F0] py-12 sm:py-16" aria-label="ErgoCraft Factory Assurances">
    <div className="mx-auto grid w-full max-w-[1720px] gap-6 border-y border-[#E8E5DE] px-4 sm:px-6 lg:px-10 py-8 sm:grid-cols-2 lg:grid-cols-4 sm:py-10">
      {PILLARS.map(({ icon: Icon, title, description }) => (
        <div key={title} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-[#E8E5DE] shadow-2xs">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF0E8] text-[#59644E]">
            <Icon size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-[#13231D]">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[#73756F]">{description}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);
