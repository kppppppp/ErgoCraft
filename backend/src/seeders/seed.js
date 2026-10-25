import mongoose from 'mongoose';
import { connectDB, closeDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder] Clearing existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
    ]);

    // 1. Seed Users
    console.log('[Seeder] Seeding default Admin and Customer accounts...');
    await User.create({
      name: 'Ergocraft Administrator',
      email: 'admin@ergocraft.in',
      password: 'Admin@Ergocraft2026!',
      role: 'admin',
      phone: '+919326990672',
    });

    await User.create({
      name: 'Aditya Sharma',
      email: 'customer@ergocraft.in',
      password: 'Customer@Ergocraft2026!',
      role: 'customer',
      phone: '+919876543210',
      addresses: [
        {
          street: '402, Highline Residency, Bandra West',
          landmark: 'Near Linking Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    // 2. Categories Hierarchy (3 Levels)
    console.log('[Seeder] Seeding 3-Level Categories hierarchy...');
    const officeChairs = await Category.create({
      name: 'Office Chairs',
      slug: 'office-chairs',
      description: 'Precision engineered ergonomic seating for modern executive workspaces and high-performance teams.',
      image: {
        url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65?q=80&w=800&auto=format&fit=crop',
      },
      sortOrder: 1,
      isActive: true,
      showInNavbar: true,
    });

    const sofas = await Category.create({
      name: 'Sofas',
      slug: 'sofas',
      description: 'Handcrafted luxury sofas tailored for distinguished executive lounges and bespoke residential interiors.',
      image: {
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
      },
      sortOrder: 2,
      isActive: true,
      showInNavbar: true,
    });

    const softSeating = await Category.create({
      name: 'Soft Seating',
      slug: 'soft-seating',
      description: 'Sculptural lounge chairs, dining seating, and cafe stools fusing comfort with architectural form.',
      image: {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
      },
      sortOrder: 3,
      isActive: true,
      showInNavbar: true,
    });

    // Level 2: Under Office Chairs
    const leatheretteChairs = await Category.create({
      name: 'Leatherette Chairs',
      slug: 'leatherette-chairs',
      parent: officeChairs._id,
      description: 'Supple artisanal leatherette chairs with opulent executive styling.',
      sortOrder: 1,
      isActive: true,
      showInNavbar: true,
    });

    const meshChairs = await Category.create({
      name: 'Mesh Chairs',
      slug: 'mesh-chairs',
      parent: officeChairs._id,
      description: 'Breathable high-tensile mesh seating for all-day thermal comfort.',
      sortOrder: 2,
      isActive: true,
      showInNavbar: true,
    });

    const workstationChairs = await Category.create({
      name: 'Workstation Cushion Chairs',
      slug: 'workstation-chairs',
      parent: officeChairs._id,
      description: 'Dense molded cushion task seating built for endurance.',
      sortOrder: 3,
      isActive: true,
      showInNavbar: true,
    });

    // Level 3: Under Leatherette Chairs
    const leatheretteHighBack = await Category.create({
      name: 'Leatherette High Back',
      slug: 'leatherette-high-back',
      parent: leatheretteChairs._id,
      description: 'Full-support high-back leatherette chairs for commanding executive comfort.',
      sortOrder: 1,
      isActive: true,
      showInNavbar: true,
    });

    const leatheretteMediumBack = await Category.create({
      name: 'Leatherette Medium Back',
      slug: 'leatherette-medium-back',
      parent: leatheretteChairs._id,
      description: 'Ergonomic mid-back leatherette chairs for agile executive workspaces.',
      sortOrder: 2,
      isActive: true,
      showInNavbar: true,
    });

    const leatheretteCushion = await Category.create({
      name: 'Leatherette Cushion',
      slug: 'leatherette-cushion',
      parent: leatheretteChairs._id,
      description: 'Deep padded cushion leatherette chairs engineered for prolonged meetings.',
      sortOrder: 3,
      isActive: true,
      showInNavbar: true,
    });

    const leatheretteWorkstation = await Category.create({
      name: 'Leatherette Workstation Chairs',
      slug: 'leatherette-workstation-chairs',
      parent: leatheretteChairs._id,
      description: 'Tailored leatherette task chairs for executive team pods.',
      sortOrder: 4,
      isActive: true,
      showInNavbar: true,
    });

    // Level 3: Under Mesh Chairs
    const meshHighBack = await Category.create({
      name: 'Mesh High Back',
      slug: 'mesh-high-back',
      parent: meshChairs._id,
      description: 'Dynamic elastomeric high-back mesh seating with cervical headrest support.',
      sortOrder: 1,
      isActive: true,
      showInNavbar: true,
    });

    const meshMediumBack = await Category.create({
      name: 'Mesh Medium Back',
      slug: 'mesh-medium-back',
      parent: meshChairs._id,
      description: 'Low-profile breathable mid-back mesh chairs for collaborative workspaces.',
      sortOrder: 2,
      isActive: true,
      showInNavbar: true,
    });

    const meshStaff = await Category.create({
      name: 'Mesh Staff Chairs',
      slug: 'mesh-staff-chairs',
      parent: meshChairs._id,
      description: 'Resilient and agile mesh task chairs built for active teams.',
      sortOrder: 3,
      isActive: true,
      showInNavbar: true,
    });

    // Level 2: Under Sofas
    const threeSeater = await Category.create({
      name: '3-Seater Sofa',
      slug: '3-seater-sofa',
      parent: sofas._id,
      sortOrder: 1,
      isActive: true,
      showInNavbar: true,
    });

    const twoSeater = await Category.create({
      name: '2-Seater Sofa',
      slug: '2-seater-sofa',
      parent: sofas._id,
      sortOrder: 2,
      isActive: true,
      showInNavbar: true,
    });

    // Level 2: Under Soft Seating
    const loungeChairs = await Category.create({
      name: 'Lounge Chairs',
      slug: 'lounge-chairs',
      parent: softSeating._id,
      sortOrder: 1,
      isActive: true,
      showInNavbar: true,
    });

    const diningChairs = await Category.create({
      name: 'Dining Chairs',
      slug: 'dining-chairs',
      parent: softSeating._id,
      sortOrder: 2,
      isActive: true,
      showInNavbar: true,
    });

    const cafeChairs = await Category.create({
      name: 'Cafe Chairs',
      slug: 'cafe-chairs',
      parent: softSeating._id,
      sortOrder: 3,
      isActive: true,
      showInNavbar: true,
    });

    // 3. Products
    console.log('[Seeder] Seeding Products with 3-level classifications and attributes...');
    const products = [
      {
        name: 'Oscar High Back Ergonomic Mesh Chair',
        slug: 'oscar-high-back-mesh-chair',
        sku: 'EC-OCH-001',
        category: officeChairs._id,
        subcategory: meshChairs._id,
        classification: meshHighBack._id,
        attributes: {
          material: 'Mesh',
          backrestHeight: 'High Back',
          colour: 'Black',
          armrests: '3D PU Adjustable',
          mechanism: 'Synchro-Tilt Multi-Angle Lock',
          weightCapacity: '135 kg',
        },
        description:
          'The Oscar Series represents the zenith of active ergonomics. Engineered with German-calibrated dynamic lumbar support and breathable Italian elastomeric mesh, it adapts fluidly to your posture throughout intensive focus sessions. Features heavy-duty nylon base and multi-position locking.',
        shortDescription: 'Active lumbar ergonomics with breathable mesh and 3D armrests.',
        specifications: [
          { key: 'Backrest', value: 'High-tensile breathable Korean mesh with dynamic lumbar pad' },
          { key: 'Mechanism', value: 'Synchro-tilt multi-angle lockable mechanism (90° - 135°)' },
          { key: 'Armrests', value: '3D PU-padded height, depth and angle adjustable' },
          { key: 'Base', value: '350mm Heavy-duty nylon base with 60mm silent castors' },
          { key: 'Gas Lift', value: 'Class 4 BIFMA-certified hydraulic cylinder' },
          { key: 'Weight Capacity', value: 'Tested up to 135 kg' },
        ],
        mrp: 18499,
        sellingPrice: 12999,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65?q=80&w=1000&auto=format&fit=crop',
            altText: 'Oscar High Back Ergonomic Mesh Chair Front View',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=1000&auto=format&fit=crop',
            altText: 'Oscar Mesh Chair Side Angle In Modern Office',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
        stock: 24,
        isBestseller: true,
        isFeatured: true,
        status: 'published',
        warranty: '3 Years Comprehensive Warranty',
      },
      {
        name: 'Stanley Executive Leatherette High Back Chair',
        slug: 'stanley-executive-leatherette-chair',
        sku: 'EC-OCH-002',
        category: officeChairs._id,
        subcategory: leatheretteChairs._id,
        classification: leatheretteHighBack._id,
        attributes: {
          material: 'Leatherette',
          backrestHeight: 'High Back',
          colour: 'Dark Brown',
          armrests: 'Aluminium with Leatherette Cushion',
          mechanism: 'Knee-Tilt Multi-Position Lock',
          weightCapacity: '150 kg',
        },
        description:
          'Command your room with the Stanley Executive Chair. Hand-tailored in high-grade supple leatherette over double-density molded foam cushioning, paired with a solid die-cast polished aluminium base and aluminium handles for timeless distinction and supreme relaxation.',
        shortDescription: 'Opulent leatherette comfort with polished aluminium chassis.',
        specifications: [
          { key: 'Upholstery', value: 'Premium breathable automotive-grade faux leatherette' },
          { key: 'Cushioning', value: 'High-density 55kg/m³ cold-cured molded polyurethane foam' },
          { key: 'Armrests', value: 'Cast aluminium structure with cushioned leatherette top' },
          { key: 'Base', value: 'Die-cast polished aluminium base with chrome friction castors' },
          { key: 'Mechanism', value: 'Heavy multi-position knee-tilt locking mechanism' },
        ],
        mrp: 23999,
        sellingPrice: 16499,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?q=80&w=1000&auto=format&fit=crop',
            altText: 'Stanley Executive Chair Front View',
            isPrimary: true,
            sortOrder: 0,
          },
          {
            url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65?q=80&w=1000&auto=format&fit=crop',
            altText: 'Stanley Chair Angle View',
            isPrimary: false,
            sortOrder: 1,
          },
        ],
        stock: 15,
        isBestseller: true,
        isFeatured: true,
        status: 'published',
        warranty: '3 Years Comprehensive Warranty',
      },
      {
        name: 'Aero Workstation Cushion Task Chair',
        slug: 'aero-workstation-cushion-chair',
        sku: 'EC-OCH-003',
        category: officeChairs._id,
        subcategory: workstationChairs._id,
        classification: null,
        attributes: {
          material: 'Fabric Cushion',
          backrestHeight: 'Medium Back',
          colour: 'Grey',
          armrests: 'Fixed Ergonomic PP',
          mechanism: 'Center-Tilt Upright Lock',
          weightCapacity: '120 kg',
        },
        description:
          'Engineered for long team shifts and workstation clusters. The Aero chair delivers a waterfall seat edge design to reduce under-thigh pressure, paired with reinforced nylon lumbar framing and low-maintenance fabric seating.',
        shortDescription: 'Comfortable daily workstation chair with waterfall seat front.',
        specifications: [
          { key: 'Seat', value: 'Contoured molded foam with waterfall edge' },
          { key: 'Backrest', value: 'High-grade nylon mesh frame with built-in lumbar support' },
          { key: 'Tilt Mechanism', value: 'Center-tilt upright locking mechanism' },
          { key: 'Base', value: 'Reinforced 330mm glass-fiber nylon base' },
        ],
        mrp: 12999,
        sellingPrice: 8999,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?q=80&w=1000&auto=format&fit=crop',
            altText: 'Aero Workstation Task Chair',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        stock: 40,
        isBestseller: false,
        isFeatured: true,
        status: 'published',
        warranty: '2 Years Manufacturer Warranty',
      },
      {
        name: 'Chesterfield Royale 3-Seater Velvet Sofa',
        slug: 'chesterfield-royale-3-seater-sofa',
        sku: 'EC-SOF-001',
        category: sofas._id,
        subcategory: threeSeater._id,
        classification: null,
        attributes: {
          material: 'Velvet',
          colour: 'Royal Emerald',
          upholstery: 'Stain-resistant high-pile velvet',
          dimensions: '88" W x 36" D x 31" H',
        },
        description:
          'Imbued with heritage grandeur, the Chesterfield Royale 3-Seater is upholstered in jewel-toned stain-resistant velvet with deep diamond button tufting. Supported by a kiln-dried hardwood frame and solid walnut-finished legs, creating an exquisite centerpiece for executive suites.',
        shortDescription: 'Handcrafted diamond button tufted velvet executive sofa.',
        specifications: [
          { key: 'Frame', value: 'Solid kiln-dried Sal wood and marine-grade plywood' },
          { key: 'Upholstery', value: 'Stain-resistant high-pile luxury velvet' },
          { key: 'Cushioning', value: 'Super-soft 40-density foam with pocket spring core' },
          { key: 'Legs', value: 'Turned solid beechwood with antique bronze caps' },
          { key: 'Dimensions', value: '88" W x 36" D x 31" H' },
        ],
        mrp: 62000,
        sellingPrice: 45999,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop',
            altText: 'Chesterfield Royale Velvet Sofa Front View',
            isPrimary: true,
            sortOrder: 0,
          },
        ],
        stock: 6,
        isBestseller: true,
        isFeatured: true,
        status: 'published',
        warranty: '5 Years Structural Warranty',
      },
    ];

    for (const p of products) {
      await Product.create(p);
    }

    console.log(`[Seeder] Seeded ${products.length} products successfully with 3-level taxonomy!`);
  } catch (error) {
    console.error('[Seeder] Seeding failed:', error);
  } finally {
    await closeDB();
  }
};

seedData();
