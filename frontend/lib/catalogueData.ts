export interface CatalogueProduct {
  id: string;
  name: string;
  catalogueName: string;
  sourcePdfPage: number;
  category: string;
  subcategory: string;
  categorySlug: string;
  subcategorySlug: string;
  priceCatalogue?: string;
  specs: { label: string; value: string }[];
  image: string;
  description: string;
  badge?: string;
  href: string;
}

export const CATALOGUE_INVENTORY: Record<string, CatalogueProduct> = {
  // 1. Executive & Leatherette
  reclinexAuto: {
    id: 'reclinex-auto',
    name: 'ReclineX Auto Executive Chair',
    catalogueName: 'Ergocraft Updated 2026 Leatherette & Fabric Chairs Catalogue',
    sourcePdfPage: 2,
    category: 'Office Chairs',
    subcategory: 'Leatherette & Executive Chairs',
    categorySlug: 'office-chairs',
    subcategorySlug: 'leatherette-chairs',
    priceCatalogue: '₹66,000',
    specs: [
      { label: 'Upholstery', value: 'Italian Soft Genuine Leather' },
      { label: 'Mechanism', value: 'Automatic Recline with Knee-Tilt Lock' },
      { label: 'Base', value: 'Die-cast Polished Aluminium Alloy' },
      { label: 'Armrests', value: 'Aluminium Structure with Padded Leather Top' },
    ],
    image: '/images/cleaned/executive/reclinex-auto.png',
    description: 'Precision Italian genuine leather high-back executive seating with automated recline response and solid aluminium chassis.',
    badge: 'FLAGSHIP EXECUTIVE',
    href: '/products?category=office-chairs&subcategory=leatherette-chairs',
  },
  classicExecutive: {
    id: 'classic-executive',
    name: 'Classic Tufted Executive Chair',
    catalogueName: 'Ergocraft Updated 2026 Leatherette & Fabric Chairs Catalogue',
    sourcePdfPage: 18,
    category: 'Office Chairs',
    subcategory: 'Leatherette & Executive Chairs',
    categorySlug: 'office-chairs',
    subcategorySlug: 'leatherette-chairs',
    specs: [
      { label: 'Framework', value: 'Kiln-Dried Solid Hardwood Internal Core' },
      { label: 'Design', value: 'Plush Diamond Button-Tufted Back' },
      { label: 'Base', value: 'Reinforced Chrome Alloy with Heavy Castors' },
    ],
    image: '/images/cleaned/executive/classic-executive.png',
    description: 'Heritage-inspired button-tufted executive chair with handcrafted leatherette and ergonomic lumbar contour.',
    badge: 'HERITAGE SUITE',
    href: '/products?category=office-chairs&subcategory=leatherette-chairs',
  },

  // 2. Mesh & Ergonomic
  ergoluxeFlagship: {
    id: 'ergoluxe-flagship',
    name: 'Ergoluxe Dynamic High-Back Mesh Chair',
    catalogueName: 'Ergocraft Updated 2026 Mesh Office Chairs Catalogue',
    sourcePdfPage: 6,
    category: 'Office Chairs',
    subcategory: 'Mesh Chairs',
    categorySlug: 'office-chairs',
    subcategorySlug: 'mesh-chairs',
    priceCatalogue: '₹44,000',
    specs: [
      { label: 'Mesh', value: 'High-Tensile Korean Elastomeric Wire Mesh' },
      { label: 'Armrests', value: '4D Multi-Directional Adjustable PU Pads' },
      { label: 'Lumbar', value: 'Independent Dynamic Spine Alignment Matrix' },
      { label: 'Mechanism', value: 'Synchro-Tilt with Multi-Angle Safety Lock' },
    ],
    image: '/images/cleaned/mesh/ergoluxe-flagship.png',
    description: 'Ergonomic high-back workspace chair engineered with calibrated elastomeric wire mesh for full-day postural focus.',
    badge: 'ERGONOMIC BENCHMARK',
    href: '/products?category=office-chairs&subcategory=mesh-chairs',
  },
  sitronixMesh: {
    id: 'sitronix-mesh',
    name: 'Sitronix Performance Mesh Chair',
    catalogueName: 'Ergocraft Updated 2026 Mesh Office Chairs Catalogue',
    sourcePdfPage: 2,
    category: 'Office Chairs',
    subcategory: 'Mesh Chairs',
    categorySlug: 'office-chairs',
    subcategorySlug: 'mesh-chairs',
    priceCatalogue: '₹35,000',
    specs: [
      { label: 'Structure', value: 'Reinforced Glass-Fiber Nylon Framework' },
      { label: 'Seat', value: 'Breathable High-Density Cold-Molded Cushion' },
      { label: 'Headrest', value: '2D Articulated Cervical Spine Support' },
    ],
    image: '/images/cleaned/mesh/sitronix-mesh.png',
    description: 'High-performance task seating with articulated cervical headrest and adaptive thoracic mesh ventilation.',
    badge: 'EXECUTIVE TASK',
    href: '/products?category=office-chairs&subcategory=mesh-chairs',
  },

  // 3. Sofas & Recliners
  bonjourSofa: {
    id: 'bonjour-sofa',
    name: 'Bonjour Contemporary 3-Seater Sofa',
    catalogueName: 'Updated Ergocraft Sofa & Recliner Series Catalogue',
    sourcePdfPage: 19,
    category: 'Sofas',
    subcategory: '3-Seater Sofa',
    categorySlug: 'sofas',
    subcategorySlug: '3-seater-sofa',
    specs: [
      { label: 'Frame', value: 'Bhiwandi Hand-Carved Sagwan Hardwood' },
      { label: 'Foam', value: 'High-Resilience 40-Density Layered Core' },
      { label: 'Suspension', value: 'Industrial High-Tensile Seat Belts & Coil Springs' },
      { label: 'Upholstery', value: 'Stain-Treated Architectural Woven Textile' },
    ],
    image: '/images/cleaned/sofas/bonjour-luxury-sofa.jpg',
    description: 'Curated 3-seater living room silhouette built upon kiln-dried Sagwan solid wood and 40-density layered cushioning.',
    badge: 'HANDCRAFTED LIVING',
    href: '/products?category=sofas',
  },
  enrichRecliner: {
    id: 'enrich-recliner',
    name: 'Enrich Motorized Recliner',
    catalogueName: 'Updated Ergocraft Sofa & Recliner Series Catalogue',
    sourcePdfPage: 25,
    category: 'Sofas',
    subcategory: 'Recliners',
    categorySlug: 'sofas',
    subcategorySlug: '2-seater-sofa',
    specs: [
      { label: 'Mechanism', value: 'Electric Motorized Recline, Rocker & 360° Rotate' },
      { label: 'Structure', value: 'Reinforced Solid Wood & Carbon Steel Frame' },
      { label: 'Cushioning', value: 'Ergonomic Body-Contour Pocket Spring System' },
    ],
    image: '/images/cleaned/sofas/enrich-motorized-recliner.jpg',
    description: 'Motorized luxury recliner featuring seamless power recline, gentle glide rocking, and full 360-degree rotation.',
    badge: 'MOTORIZED RECLINER',
    href: '/products?category=sofas',
  },

  // 4. Lounge & Soft Seating
  spruceLounge: {
    id: 'spruce-lounge',
    name: 'Spruce Bent-Plywood Lounge & Ottoman',
    catalogueName: 'Updated Ergocraft Lounge Chairs, Ottomans & Poufs Catalogue 2026',
    sourcePdfPage: 2,
    category: 'Soft Seating',
    subcategory: 'Lounge Chairs',
    categorySlug: 'soft-seating',
    subcategorySlug: 'lounge-chairs',
    priceCatalogue: '₹29,500',
    specs: [
      { label: 'Backrest', value: 'Multi-Bend Heat-Compressed Plywood Shell' },
      { label: 'Cushioning', value: 'High-Resilience Cold-Cured Molded Foam' },
      { label: 'Ottoman', value: 'Matching Sculptural Ergonomic Footrest Included' },
    ],
    image: '/images/cleaned/lounge/spruce-lounge-chair.jpg',
    description: 'Architectural lounge armchair paired with matching ottoman, crafted with multi-bend plywood shells and tailored upholstery.',
    badge: 'ICONIC LOUNGE',
    href: '/products?category=soft-seating&subcategory=lounge-chairs',
  },
  roseAccent: {
    id: 'rose-accent',
    name: 'Rose Sculptural Accent Armchair',
    catalogueName: 'Updated Ergocraft Lounge Chairs, Ottomans & Poufs Catalogue 2026',
    sourcePdfPage: 5,
    category: 'Soft Seating',
    subcategory: 'Lounge Chairs',
    categorySlug: 'soft-seating',
    subcategorySlug: 'lounge-chairs',
    priceCatalogue: '₹23,500',
    specs: [
      { label: 'Structure', value: 'Molded Bent Plywood Organic Silhouette' },
      { label: 'Seating', value: 'Continuous Ergonomic Curved Foam Wrap' },
      { label: 'Legs', value: 'Architectural Matte Black Powder-Coated Metal' },
    ],
    image: '/images/cleaned/lounge/rose-accent-chair.png',
    description: 'Sculptural reading and breakout lounge armchair with fluid organic contours and architectural metal base.',
    badge: 'SCULPTURAL ACCENT',
    href: '/products?category=soft-seating&subcategory=lounge-chairs',
  },

  // 5. Dining & Café Chairs, Bar Stools
  ernestDining: {
    id: 'ernest-dining',
    name: 'Ernest Solid Wood Dining Chair',
    catalogueName: 'Updated Ergocraft Dining & Cafe chairs, Bar stools Catalogue 2026',
    sourcePdfPage: 11,
    category: 'Soft Seating',
    subcategory: 'Dining Chairs',
    categorySlug: 'soft-seating',
    subcategorySlug: 'dining-chairs',
    priceCatalogue: '₹9,900',
    specs: [
      { label: 'Frame', value: 'Solid Hardwood in Matte Melamine Polish' },
      { label: 'Upholstery', value: 'Curved Padded Ergonomic Back & Seat' },
      { label: 'Joinery', value: 'Mortise & Tenon Commercial Durability' },
    ],
    image: '/images/cleaned/dining/ernest-dining-chair.png',
    description: 'Refined solid wood dining chair featuring tailored upholstery, organic curves, and reinforced contract-grade joinery.',
    badge: 'DINING CHAIR',
    href: '/products?category=soft-seating&subcategory=dining-chairs',
  },
  barrosBarStool: {
    id: 'barros-bar-stool',
    name: 'Barros Architectural Bar Stool',
    catalogueName: 'Updated Ergocraft Dining & Cafe chairs, Bar stools Catalogue 2026',
    sourcePdfPage: 13,
    category: 'Soft Seating',
    subcategory: 'Cafe & Bar Stools',
    categorySlug: 'soft-seating',
    subcategorySlug: 'cafe-chairs',
    priceCatalogue: '₹5,200',
    specs: [
      { label: 'Frame', value: 'Heavy Carbon Steel Rod with Integrated Footrest' },
      { label: 'Finish', value: 'Matte Black Industrial Powder Coating' },
      { label: 'Seat', value: 'Padded Contour Seating with High-Density Foam' },
    ],
    image: '/images/cleaned/stools/barros-bar-stool.png',
    description: 'High-counter bar stool with architectural steel wireframe, 360-degree footrest ring, and cushioned swivel seat.',
    badge: 'BAR STOOL',
    href: '/products?category=soft-seating&subcategory=cafe-chairs',
  },
};
