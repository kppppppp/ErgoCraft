import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment from .env in backend directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/ergocraft';

async function runMigration() {
  console.log('====================================================');
  console.log('   ERGOCRAFT PRODUCT TAXONOMY MIGRATION');
  console.log('====================================================');
  console.log('Connecting to MongoDB Atlas...');

  const conn = await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log(`Connected successfully: ${conn.connection.host}`);

  const db = conn.connection.db;
  const categoriesColl = db.collection('categories');
  const productsColl = db.collection('products');

  // Step 1: Backup existing data
  const backupDir = path.resolve(__dirname, '../scripts/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const existingCategories = await categoriesColl.find({}).toArray();
  const existingProducts = await productsColl.find({}).toArray();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify({ categories: existingCategories, products: existingProducts }, null, 2)
  );
  console.log(`[Backup] Saved ${existingCategories.length} categories and ${existingProducts.length} products to:`);
  console.log(`         ${backupFile}\n`);

  // Step 2: Ensure Root and Level 2 Categories
  console.log('[Taxonomy] Ensuring Level 1 (Main) and Level 2 Categories...');

  async function getOrCreateCategory(query, doc) {
    let cat = await categoriesColl.findOne(query);
    if (!cat) {
      const now = new Date();
      const insertDoc = {
        ...doc,
        sortOrder: doc.sortOrder || 0,
        isActive: doc.isActive !== undefined ? doc.isActive : true,
        showInNavbar: doc.showInNavbar !== undefined ? doc.showInNavbar : true,
        createdAt: now,
        updatedAt: now,
      };
      const res = await categoriesColl.insertOne(insertDoc);
      cat = await categoriesColl.findOne({ _id: res.insertedId });
      console.log(`  + Created: ${cat.name} (${cat.slug})`);
    } else {
      // Ensure showInNavbar and isActive fields exist
      const updateFields = {};
      if (cat.showInNavbar === undefined) updateFields.showInNavbar = true;
      if (cat.isActive === undefined) updateFields.isActive = true;
      if (doc.parent !== undefined && String(cat.parent) !== String(doc.parent)) {
        updateFields.parent = doc.parent;
      }
      if (Object.keys(updateFields).length > 0) {
        await categoriesColl.updateOne({ _id: cat._id }, { $set: updateFields });
        cat = await categoriesColl.findOne({ _id: cat._id });
        console.log(`  ~ Updated: ${cat.name} (${cat.slug})`);
      }
    }
    return cat;
  }

  // Root Categories
  const officeChairs = await getOrCreateCategory(
    { slug: 'office-chairs' },
    {
      name: 'Office Chairs',
      slug: 'office-chairs',
      parent: null,
      description: 'Precision engineered ergonomic seating for modern executive workspaces and high-performance teams.',
      sortOrder: 1,
      image: { url: '/images/hero-chair.jpg' },
    }
  );

  const sofas = await getOrCreateCategory(
    { slug: 'sofas' },
    {
      name: 'Sofas',
      slug: 'sofas',
      parent: null,
      description: 'Handcrafted luxury sofas tailored for distinguished executive lounges and bespoke residential interiors.',
      sortOrder: 2,
      image: { url: '/images/hero-sofa.webp' },
    }
  );

  const softSeating = await getOrCreateCategory(
    { slug: 'soft-seating' },
    {
      name: 'Soft Seating',
      slug: 'soft-seating',
      parent: null,
      description: 'Sculptural lounge chairs, dining seating, and cafe stools fusing comfort with architectural form.',
      sortOrder: 3,
      image: { url: '/hero-img/soft_sitting.png' },
    }
  );

  // Level 2 under Office Chairs
  const leatheretteChairs = await getOrCreateCategory(
    { slug: 'leatherette-chairs' },
    {
      name: 'Leatherette Chairs',
      slug: 'leatherette-chairs',
      parent: officeChairs._id,
      description: 'Supple artisanal leatherette chairs with opulent executive styling.',
      sortOrder: 1,
      image: { url: '/images/cat-executive.png' },
    }
  );

  const meshChairs = await getOrCreateCategory(
    { slug: 'mesh-chairs' },
    {
      name: 'Mesh Chairs',
      slug: 'mesh-chairs',
      parent: officeChairs._id,
      description: 'Breathable high-tensile mesh seating for all-day thermal comfort.',
      sortOrder: 2,
      image: { url: '/images/categories/mesh-chair-polo.png' },
    }
  );

  const workstationChairs = await getOrCreateCategory(
    { slug: 'workstation-chairs' },
    {
      name: 'Workstation Cushion Chairs',
      slug: 'workstation-chairs',
      parent: officeChairs._id,
      description: 'Dense molded cushion task seating built for endurance.',
      sortOrder: 3,
      image: { url: '/images/categories/workstation-chairs.png' },
    }
  );

  // Step 3: Level 3 under Leatherette Chairs
  console.log('\n[Taxonomy] Ensuring Level 3 Specific Classifications under Leatherette Chairs...');
  const leatheretteHighBack = await getOrCreateCategory(
    { slug: 'leatherette-high-back' },
    {
      name: 'Leatherette High Back',
      slug: 'leatherette-high-back',
      parent: leatheretteChairs._id,
      description: 'Full-support high-back leatherette chairs for commanding executive comfort.',
      sortOrder: 1,
      image: { url: '/images/categories/stanley-hb-grey.png' },
    }
  );

  const leatheretteMediumBack = await getOrCreateCategory(
    { slug: 'leatherette-medium-back' },
    {
      name: 'Leatherette Medium Back',
      slug: 'leatherette-medium-back',
      parent: leatheretteChairs._id,
      description: 'Ergonomic mid-back leatherette chairs for agile executive workspaces.',
      sortOrder: 2,
      image: { url: '/images/categories/leno-grey-mb.png' },
    }
  );

  const leatheretteCushion = await getOrCreateCategory(
    { slug: 'leatherette-cushion' },
    {
      name: 'Leatherette Cushion',
      slug: 'leatherette-cushion',
      parent: leatheretteChairs._id,
      description: 'Deep padded cushion leatherette chairs engineered for prolonged meetings.',
      sortOrder: 3,
      image: { url: '/images/categories/leatherette-chairs.jpg' },
    }
  );

  const leatheretteWorkstation = await getOrCreateCategory(
    { slug: 'leatherette-workstation-chairs' },
    {
      name: 'Leatherette Workstation Chairs',
      slug: 'leatherette-workstation-chairs',
      parent: leatheretteChairs._id,
      description: 'Tailored leatherette task chairs for executive team pods.',
      sortOrder: 4,
      image: { url: '/images/cat-workstation.png' },
    }
  );

  // Step 4: Level 3 under Mesh Chairs
  console.log('\n[Taxonomy] Ensuring Level 3 Specific Classifications under Mesh Chairs...');
  const meshHighBack = await getOrCreateCategory(
    { slug: 'mesh-high-back' },
    {
      name: 'Mesh High Back',
      slug: 'mesh-high-back',
      parent: meshChairs._id,
      description: 'Dynamic elastomeric high-back mesh seating with cervical headrest support.',
      sortOrder: 1,
      image: { url: '/images/hero-chair.jpg' },
    }
  );

  const meshMediumBack = await getOrCreateCategory(
    { slug: 'mesh-medium-back' },
    {
      name: 'Mesh Medium Back',
      slug: 'mesh-medium-back',
      parent: meshChairs._id,
      description: 'Low-profile breathable mid-back mesh chairs for collaborative workspaces.',
      sortOrder: 2,
      image: { url: '/images/categories/oscar-mb.png' },
    }
  );

  const meshStaff = await getOrCreateCategory(
    { slug: 'mesh-staff-chairs' },
    {
      name: 'Mesh Staff Chairs',
      slug: 'mesh-staff-chairs',
      parent: meshChairs._id,
      description: 'Resilient and agile mesh task chairs built for active teams.',
      sortOrder: 3,
      image: { url: '/images/categories/mesh-chair-zee.jpg' },
    }
  );

  // Level 2 under Sofas
  console.log('\n[Taxonomy] Ensuring Sofas & Soft Seating Subcategories...');
  await getOrCreateCategory(
    { slug: '3-seater-sofa' },
    {
      name: '3-Seater Sofa',
      slug: '3-seater-sofa',
      parent: sofas._id,
      sortOrder: 1,
      image: { url: '/images/categories/woodland-sofa.png' },
    }
  );

  await getOrCreateCategory(
    { slug: '2-seater-sofa' },
    {
      name: '2-Seater Sofa',
      slug: '2-seater-sofa',
      parent: sofas._id,
      sortOrder: 2,
      image: { url: '/images/categories/stokes-sofa.png' },
    }
  );

  // Level 2 under Soft Seating
  await getOrCreateCategory(
    { slug: 'lounge-chairs' },
    {
      name: 'Lounge Chairs',
      slug: 'lounge-chairs',
      parent: softSeating._id,
      sortOrder: 1,
      image: { url: '/images/categories/lounge-chair-velvet.jpg' },
    }
  );

  await getOrCreateCategory(
    { slug: 'dining-chairs' },
    {
      name: 'Dining Chairs',
      slug: 'dining-chairs',
      parent: softSeating._id,
      sortOrder: 2,
      image: { url: '/images/categories/dining-chair-ergo.png' },
    }
  );

  await getOrCreateCategory(
    { slug: 'cafe-chairs' },
    {
      name: 'Cafe Chairs',
      slug: 'cafe-chairs',
      parent: softSeating._id,
      sortOrder: 3,
      image: { url: '/images/categories/cafe-stool-ergo.png' },
    }
  );

  // Step 5: Migrate and Align Existing Products
  console.log('\n[Products] Migrating and aligning existing products to 3-level taxonomy...');

  const allProducts = await productsColl.find({}).toArray();

  for (const prod of allProducts) {
    const nameLower = prod.name.toLowerCase();
    let classificationId = prod.classification || null;
    let categoryId = prod.category;
    let subcategoryId = prod.subcategory;
    const attributes = prod.attributes || {};

    // Check specific known products
    if (nameLower.includes('apollo') || (nameLower.includes('high back') && nameLower.includes('leatherette'))) {
      categoryId = officeChairs._id;
      subcategoryId = leatheretteChairs._id;
      classificationId = leatheretteHighBack._id;
      attributes.material = attributes.material || 'Leatherette';
      attributes.backrestHeight = attributes.backrestHeight || 'High Back';
      attributes.colour = attributes.colour || 'Beige Mushroom';
      attributes.mechanism = attributes.mechanism || 'Centre tilt multi-position locking';
      attributes.armrests = attributes.armrests || 'PP silver handles with cushion padding';
    } else if (nameLower.includes('cube') || nameLower.includes('medium back')) {
      categoryId = officeChairs._id;
      subcategoryId = leatheretteChairs._id;
      classificationId = leatheretteMediumBack._id;
      attributes.material = attributes.material || 'Fabric & Cushion';
      attributes.backrestHeight = attributes.backrestHeight || 'Medium Back';
      attributes.colour = attributes.colour || 'Maroon';
      attributes.mechanism = attributes.mechanism || 'Push back mechanism';
      attributes.armrests = attributes.armrests || 'T shaped PP handles';
    } else if (nameLower.includes('oscar') || (nameLower.includes('mesh') && nameLower.includes('high back'))) {
      categoryId = officeChairs._id;
      subcategoryId = meshChairs._id;
      classificationId = meshHighBack._id;
      attributes.material = attributes.material || 'Mesh';
      attributes.backrestHeight = attributes.backrestHeight || 'High Back';
    }

    // Build unique categories hierarchy array
    const catArray = [categoryId, subcategoryId, classificationId].filter(Boolean);
    const uniqueCatArray = [];
    const seen = new Set();
    for (const c of catArray) {
      const cStr = String(c);
      if (!seen.has(cStr)) {
        seen.add(cStr);
        uniqueCatArray.push(c);
      }
    }

    await productsColl.updateOne(
      { _id: prod._id },
      {
        $set: {
          category: categoryId,
          subcategory: subcategoryId,
          classification: classificationId,
          categories: uniqueCatArray,
          attributes,
          updatedAt: new Date(),
        },
      }
    );

    console.log(`  ✓ Updated Product: '${prod.name}'`);
    console.log(`    Hierarchy: Office Chairs -> Leatherette Chairs -> ${classificationId ? 'High/Medium Back' : 'General'}`);
    console.log(`    Categories IDs: [${uniqueCatArray.join(', ')}]`);
  }

  // Verification
  console.log('\n====================================================');
  console.log('                 VERIFICATION REPORT');
  console.log('====================================================');
  const totalCategories = await categoriesColl.countDocuments({});
  const totalProducts = await productsColl.countDocuments({});
  console.log(`Total Categories in DB: ${totalCategories}`);
  console.log(`Total Products in DB:   ${totalProducts}`);

  const sampleProducts = await productsColl.find({}).toArray();
  for (const sp of sampleProducts) {
    console.log(`\n• Product: ${sp.name} (${sp.sku})`);
    console.log(`  Category ID:       ${sp.category}`);
    console.log(`  Subcategory ID:    ${sp.subcategory}`);
    console.log(`  Classification ID: ${sp.classification}`);
    console.log(`  Hierarchy Array:   [${(sp.categories || []).join(', ')}]`);
    console.log(`  Attributes:        ${JSON.stringify(sp.attributes)}`);
  }

  console.log('\nTaxonomy migration completed successfully!');
  await mongoose.connection.close();
}

runMigration().catch((err) => {
  console.error('\nMigration failed with error:', err);
  process.exit(1);
});
