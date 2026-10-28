'use client';

import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { ShopByCategory } from '../components/home/ShopByCategory';
import { BestsellerSection } from '../components/home/BestsellerSection';

// Catalogue-driven editorial sections
import { ExecutiveEditorialSection } from '../components/home/editorial/ExecutiveEditorialSection';
import { MeshEditorialSection } from '../components/home/editorial/MeshEditorialSection';
import { SofaEditorialSection } from '../components/home/editorial/SofaEditorialSection';
import { LoungeEditorialSection } from '../components/home/editorial/LoungeEditorialSection';
import { DiningCafeEditorialSection } from '../components/home/editorial/DiningCafeEditorialSection';
import { FactoryBrandTrustSection } from '../components/home/editorial/FactoryBrandTrustSection';
import { FinalCtaSection } from '../components/home/editorial/FinalCtaSection';

// Supporting store sections
import { CorporateSolutions } from '../components/home/CorporateSolutions';
import { GoogleReviewsSection } from '../components/home/GoogleReviewsSection';
import { FaqSection } from '../components/home/FaqSection';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Protected Furniture Hero with Quick Phone/Support Actions */}
      <HeroSection />

      {/* 2. Redesigned Explore Seating Collection & Trust Strip */}
      <ShopByCategory />

      {/* 3. Protected Bestsellers & Popular Seating with Filter Tabs */}
      <BestsellerSection />

      {/* --- NEW 2026 CATALOGUE EDITORIAL SECTIONS IMMEDIATELY AFTER BESTSELLERS --- */}
      {/* 5. Executive & Leatherette Chairs — "Command the Room." */}
      <ExecutiveEditorialSection />

      {/* 6. Mesh & Ergonomic Chairs — "Made for the Long Game." */}
      <MeshEditorialSection />

      {/* 7. Sofas & Recliners — "Come Home to Comfort." */}
      <SofaEditorialSection />

      {/* 8. Lounge & Soft Seating — "Make Room to Unwind." */}
      <LoungeEditorialSection />

      {/* 9. Dining, Café & Bar Seating — "Gather Beautifully." */}
      <DiningCafeEditorialSection />

      {/* 10. Bulk Buy & Bulk B2B Procurement */}
      <CorporateSolutions />

      {/* 11. Verified Factory Google Reviews & Bhiwandi Experience */}
      <GoogleReviewsSection />

      {/* 12. Verified Brand & Direct Manufacturer Trust Strip */}
      <FactoryBrandTrustSection />

      {/* 13. Assurances, Warranty & Customer FAQ */}
      <FaqSection />

      {/* 14. Final Closing CTA — "Your Space. Your Seating." */}
      <FinalCtaSection />
    </div>
  );
}

