'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#13231D] text-[#F7F5F0] pt-16 pb-12 border-t border-white/10">
      {/* Brand Value Ribbon */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-12 border-b border-white/10">
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 text-[#78836A] flex items-center justify-center shrink-0 text-xs sm:text-sm font-semibold"><span aria-hidden="true">01</span></div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Browse catalogue</h4>
              <p className="text-[11px] sm:text-xs text-white/65 mt-1 leading-relaxed">Descriptions, genuine photographs & transparent pricing.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 text-[#78836A] flex items-center justify-center shrink-0 text-xs sm:text-sm font-semibold"><span aria-hidden="true">02</span></div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Checkout securely</h4>
              <p className="text-[11px] sm:text-xs text-white/65 mt-1 leading-relaxed">Razorpay encryption with UPI, NetBanking & No Cost EMI.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 text-[#78836A] flex items-center justify-center shrink-0 text-xs sm:text-sm font-semibold"><span aria-hidden="true">03</span></div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Follow your order</h4>
              <p className="text-[11px] sm:text-xs text-white/65 mt-1 leading-relaxed">Live status and dispatch tracking directly in your account.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/5 border border-white/10 text-[#78836A] flex items-center justify-center shrink-0 text-xs sm:text-sm font-semibold"><span aria-hidden="true">04</span></div>
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-white">Need help?</h4>
              <p className="text-[11px] sm:text-xs text-white/65 mt-1 leading-relaxed">Direct WhatsApp factory support for products & projects.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Navigation & Brand Column */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Corporate Contact */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block bg-white/95 rounded-xl px-4 py-2 hover:bg-white transition-colors" aria-label="ErgoCraft Seating Home">
              <Image
                src="/images/logo.png"
                alt="ErgoCraft Seating Pvt. Ltd. - Ergo Comfort, Expertly Crafted"
                width={185}
                height={60}
                className="w-44 h-auto object-contain"
              />
            </Link>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Furniture and seating for contemporary workspaces and homes.
            </p>

            <div className="pt-2 space-y-2.5 text-xs text-white/60">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#C5A880] shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/search?q=ergocraft+seating+pvt.+ltd.+bhiwandi+address&ludocid=3661903996944538718"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition leading-relaxed text-white/75"
                >
                  1st Floor Gala No, Harihar Compound, Building No, A/21, Mankoli - Anjurphata Rd, near Gajanan Petrol Pump, Dapode, Bhiwandi, Maharashtra 421302
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[#C5A880] shrink-0" />
                <a href="mailto:support@ergocraft.in" className="hover:text-white transition">
                  support@ergocraft.in
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[#C5A880] shrink-0" />
                <a href="tel:+919768001999" className="hover:text-white transition font-medium">
                  +91 97680 01999
                </a>
              </div>
            </div>
          </div>

          {/* Collections Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#78836A]">
              Collections
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/products?category=office-chairs" className="hover:text-white transition">
                  Office Chairs
                </Link>
              </li>
              <li>
                <Link href="/products?subcategory=mesh-chairs" className="hover:text-white transition">
                  Ergonomic Mesh Chairs
                </Link>
              </li>
              <li>
                <Link href="/products?subcategory=leatherette-chairs" className="hover:text-white transition">
                  Executive Leatherette
                </Link>
              </li>
              <li>
                <Link href="/products?subcategory=workstation-chairs" className="hover:text-white transition">
                  Workstation Cushion
                </Link>
              </li>
              <li>
                <Link href="/products?category=sofas" className="hover:text-white transition">
                  Handcrafted Sofas
                </Link>
              </li>
              <li>
                <Link href="/products?category=soft-seating" className="hover:text-white transition">
                  Lounge & Breakout Seating
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#78836A]">
              Customer Care
            </h4>
            <ul className="space-y-2 text-xs text-white/70">
              <li>
                <Link href="/account" className="hover:text-white transition">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition">
                  Complete Catalogue
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition">
                  My Account
                </Link>
              </li>
              <li>
                <a href="#corporate-solutions" className="hover:text-white transition">
                  Bulk Buy
                </a>
              </li>
              <li>
                <a href="mailto:support@ergocraft.in" className="hover:text-white transition">
                  Warranty Claim
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Support Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#78836A]">Customer Support</h4>
            <p className="text-xs text-white/65 leading-relaxed">Questions about a product, payment, or existing order?</p>
            <a href="mailto:support@ergocraft.in" className="inline-flex text-sm font-medium text-white hover:text-[#C6CFB9]">support@ergocraft.in</a>
          </div>
        </div>
      </div>

      {/* Legal & Copyright Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div>
          &copy; {new Date().getFullYear()} ErgoCraft Seating Pvt. Ltd. All rights reserved.
        </div>
        <Link href="/products" className="hover:text-white transition">Shop all seating</Link>
      </div>
    </footer>
  );
};
