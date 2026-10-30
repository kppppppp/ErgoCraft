import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoUri =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/ergocraft';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 8000 });
  console.log('Connected to MongoDB.');

  const db = mongoose.connection.db;
  const categoriesColl = db.collection('categories');
  const productsColl = db.collection('products');

  // Step 1: Backup
  const backupDir = path.resolve(__dirname, '../../scripts/backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const existingCategories = await categoriesColl.find({}).toArray();
  const existingProducts = await productsColl.find({}).toArray();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `backup-consistency-${timestamp}.json`);
  fs.writeFileSync(
    backupFile,
    JSON.stringify({ categories: existingCategories, products: existingProducts }, null, 2)
  );
  console.log(`[Backup] Saved ${existingCategories.length} categories and ${existingProducts.length} products to ${backupFile}`);

  // Find relevant categories
  const meshHB = await categoriesColl.findOne({ slug: 'mesh-high-back' });
  const poufsBench = await categoriesColl.findOne({ slug: 'poufs-bench' });
  const softSeating = await categoriesColl.findOne({ slug: 'soft-seating' });

  let updatedCount = 0;

  for (const p of existingProducts) {
    const name = p.name || '';
    const nameLower = name.toLowerCase();
    const attrs = p.attributes || {};
    let subcategory = p.subcategory;
    let classification = p.classification;
    let needsUpdate = false;

    // Check if this is a bench in soft seating with missing subcategory
    if (String(p.category) === String(softSeating?._id) && !subcategory && nameLower.includes('bench') && poufsBench) {
      subcategory = poufsBench._id;
      needsUpdate = true;
      console.log(`  ~ Assigning 'poufs & bench' subcategory to: ${name}`);
    }

    // Check Tulip High Back Chair
    if (name.includes('Tulip') && !classification && meshHB) {
      classification = meshHB._id;
      needsUpdate = true;
      console.log(`  ~ Assigning 'Mesh High Back' classification to: ${name}`);
    }

    // Check High Back chairs
    const isHB =
      (classification && String(classification) === String(meshHB?._id)) ||
      nameLower.includes('high back') ||
      nameLower.includes(' hb ') ||
      nameLower.endsWith(' hb');

    const isMB =
      nameLower.includes('medium back') ||
      nameLower.includes('mid back') ||
      nameLower.includes(' mb ') ||
      nameLower.endsWith(' mb');

    // Only update chair products
    if (p.category && String(p.category) !== String(softSeating?._id)) {
      if (isHB && attrs.backrestHeight !== 'High Back') {
        attrs.backrestHeight = 'High Back';
        needsUpdate = true;
      } else if (isMB && attrs.backrestHeight !== 'Medium Back') {
        attrs.backrestHeight = 'Medium Back';
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      // Re-sync categories hierarchy array
      const catChain = [p.category, subcategory, classification].filter(Boolean);
      const uniqueChain = [];
      const seen = new Set();
      for (const c of catChain) {
        const cStr = String(c);
        if (!seen.has(cStr)) {
          seen.add(cStr);
          uniqueChain.push(c);
        }
      }

      await productsColl.updateOne(
        { _id: p._id },
        {
          $set: {
            subcategory,
            classification,
            categories: uniqueChain,
            attributes: attrs,
            updatedAt: new Date(),
          },
        }
      );
      updatedCount++;
    }
  }

  console.log(`\nUpdated ${updatedCount} products for data consistency.`);
  await mongoose.connection.close();
  console.log('Done.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
