import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';
import { connectDB, closeDB } from '../src/config/db.js';
import autoSeed from '../src/seeders/autoSeed.js';

test('Admin Product Management & Taxonomy Regression Test Suite', async (t) => {
  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  let adminToken = '';
  let officeChairsCat = null;
  let softSeatingCat = null;
  let leatheretteSub = null;
  let loungeSub = null;
  let meshHighBackClass = null;

  await t.test('1. Setup Database with autoSeed & Admin Auth', async () => {
    await autoSeed();

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ergocraft.in',
        password: 'Admin@Ergocraft2026!',
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    adminToken = loginData.data.token;
    assert.ok(adminToken, 'Admin JWT token acquired');

    officeChairsCat = await Category.findOne({ slug: 'office-chairs' });
    softSeatingCat = await Category.findOne({ slug: 'soft-seating' });
    leatheretteSub = await Category.findOne({ slug: 'leatherette-chairs' });
    loungeSub = await Category.findOne({ slug: 'lounge-chairs' });
    meshHighBackClass = await Category.findOne({ slug: 'mesh-high-back' });

    assert.ok(officeChairsCat, 'Office Chairs category must exist');
    assert.ok(softSeatingCat, 'Soft Seating category must exist');
    assert.ok(leatheretteSub, 'Leatherette Chairs subcategory must exist');
    assert.ok(loungeSub, 'Lounge Chairs subcategory must exist');

    // Create additional products to ensure catalogue has > 25 products for pagination verification
    const extraProducts = [];
    for (let i = 1; i <= 25; i++) {
      extraProducts.push({
        name: `Ergonomic Executive Chair Batch ${i}`,
        slug: `ergo-exec-chair-batch-${i}-${Date.now()}`,
        sku: `EC-BATCH-${i}-${Date.now()}`,
        category: officeChairsCat._id,
        subcategory: leatheretteSub._id,
        description: `High performance ergonomic chair batch ${i} for executive seating tests.`,
        mrp: 20000,
        sellingPrice: 16000,
        stock: 15,
        status: 'published',
        attributes: {
          material: 'Leatherette',
          backrestHeight: i % 2 === 0 ? 'High Back' : 'Medium Back',
          colour: 'Black',
          dimensions: '26" W x 26" D x 45" H',
        },
        images: [{ url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65', isPrimary: true }],
      });
    }
    await Product.insertMany(extraProducts);
  });

  await t.test('2. Fix Missing Products: Pagination & Full Catalogue Access', async () => {
    const totalInDb = await Product.countDocuments();
    assert.ok(totalInDb > 25, `Total products in DB should exceed 25 (found ${totalInDb})`);

    // Page 1 with limit 10
    const page1Res = await fetch(`${baseUrl}/products/admin/all?page=1&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(page1Res.status, 200);
    const page1Data = await page1Res.json();
    assert.equal(page1Data.data.products.length, 10);
    assert.equal(page1Data.data.pagination.totalCount, totalInDb);
    assert.equal(page1Data.data.pagination.currentPage, 1);
    assert.equal(page1Data.data.pagination.limit, 10);
    assert.equal(page1Data.data.pagination.totalPages, Math.ceil(totalInDb / 10));

    const page1Ids = new Set(page1Data.data.products.map((p) => p._id));

    // Page 2 with limit 10
    const page2Res = await fetch(`${baseUrl}/products/admin/all?page=2&limit=10`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(page2Res.status, 200);
    const page2Data = await page2Res.json();
    assert.equal(page2Data.data.products.length, 10);
    assert.equal(page2Data.data.pagination.currentPage, 2);

    // Verify NO DUPLICATES between page 1 and page 2
    for (const p of page2Data.data.products) {
      assert.ok(!page1Ids.has(p._id), `Product ${p._id} appeared on both page 1 and page 2`);
    }

    // Configurable limit = 25
    const limit25Res = await fetch(`${baseUrl}/products/admin/all?page=1&limit=25`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(limit25Res.status, 200);
    const limit25Data = await limit25Res.json();
    assert.equal(limit25Data.data.products.length, 25);
  });

  await t.test('3. Fix Product Category Classification & Dropdown Ordering', async () => {
    const catsRes = await fetch(`${baseUrl}/categories/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(catsRes.status, 200);
    const catsData = await catsRes.json();
    const categories = catsData.data.categories;

    assert.ok(Array.isArray(categories));
    assert.ok(categories.length >= 10);

    // Find indices of Root categories and subcategories
    const officeChairsIdx = categories.findIndex((c) => c.slug === 'office-chairs');
    const softSeatingIdx = categories.findIndex((c) => c.slug === 'soft-seating');
    const loungeChairsIdx = categories.findIndex((c) => c.slug === 'lounge-chairs');
    const leatheretteChairsIdx = categories.findIndex((c) => c.slug === 'leatherette-chairs');

    assert.ok(officeChairsIdx !== -1, 'Office Chairs must exist in categories');
    assert.ok(softSeatingIdx !== -1, 'Soft Seating must exist in categories');
    assert.ok(loungeChairsIdx !== -1, 'Lounge Chairs must exist in categories');

    // Strict parent placement:
    // Lounge Chairs MUST appear AFTER Soft Seating in hierarchical traversal
    assert.ok(
      loungeChairsIdx > softSeatingIdx,
      `Lounge Chairs (idx ${loungeChairsIdx}) must appear after Soft Seating (idx ${softSeatingIdx})`
    );

    // Leatherette Chairs must appear AFTER Office Chairs and BEFORE Soft Seating
    assert.ok(
      leatheretteChairsIdx > officeChairsIdx && leatheretteChairsIdx < softSeatingIdx,
      `Leatherette Chairs must appear under Office Chairs`
    );

    // Soft Seating subcategories parent must explicitly be Soft Seating
    const loungeCat = categories.find((c) => c.slug === 'lounge-chairs');
    const parentId = typeof loungeCat.parent === 'object' ? loungeCat.parent._id : loungeCat.parent;
    assert.equal(String(parentId), String(softSeatingCat._id));
  });

  await t.test('4. Fix Height & Dimension Filtering in Public & Admin Catalogue', async () => {
    // 4.1 Filter public catalogue by backrestHeight=High Back
    const hbRes = await fetch(`${baseUrl}/products?backrestHeight=High%20Back&limit=50`);
    assert.equal(hbRes.status, 200);
    const hbData = await hbRes.json();
    assert.ok(
      hbData.data.products.length >= 10,
      `High Back filter should return at least 10 products, got ${hbData.data.products.length}`
    );

    for (const p of hbData.data.products) {
      const isHbAttr = p.attributes?.backrestHeight === 'High Back';
      const isHbClass = p.classification?.name?.includes('High Back');
      const isHbName = p.name.toLowerCase().includes('high back');
      assert.ok(
        isHbAttr || isHbClass || isHbName,
        `Product ${p.name} returned for High Back filter must match High Back`
      );
    }

    // 4.2 Filter public catalogue by backrestHeight=Medium Back
    const mbRes = await fetch(`${baseUrl}/products?backrestHeight=Medium%20Back&limit=50`);
    assert.equal(mbRes.status, 200);
    const mbData = await mbRes.json();
    assert.ok(
      mbData.data.products.length >= 10,
      `Medium Back filter should return at least 10 products, got ${mbData.data.products.length}`
    );
  });

  await t.test('5. Multi-criteria Filtering & Search in Admin Panel', async () => {
    // Filter admin products by Office Chairs + Leatherette Chairs
    const ocLeathRes = await fetch(
      `${baseUrl}/products/admin/all?category=${officeChairsCat._id}&subcategory=${leatheretteSub._id}&limit=50`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.equal(ocLeathRes.status, 200);
    const ocLeathData = await ocLeathRes.json();
    assert.ok(ocLeathData.data.products.length > 0);
    for (const p of ocLeathData.data.products) {
      assert.equal(p.category.name, 'Office Chairs');
      assert.equal(p.subcategory.name, 'Leatherette Chairs');
    }

    // Combined Search + Category Filter
    const searchRes = await fetch(
      `${baseUrl}/products/admin/all?q=Batch%201&category=${officeChairsCat._id}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    assert.equal(searchRes.status, 200);
    const searchData = await searchRes.json();
    assert.ok(searchData.data.products.length > 0);
    for (const p of searchData.data.products) {
      assert.ok(p.name.includes('Batch 1'));
      assert.equal(p.category.name, 'Office Chairs');
    }
  });

  await t.test('6. Complete Product Lifecycle: Creation, Validation, Editing & Deletion', async () => {
    // 6.1 Validation: Selling price cannot exceed MRP
    const invalidPriceRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Invalid Price Chair',
        sku: `EC-TEST-INV-${Date.now()}`,
        category: officeChairsCat._id.toString(),
        description: 'Test chair description with more than 10 characters',
        mrp: 10000,
        sellingPrice: 15000, // Invalid!
        images: [{ url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65' }],
      }),
    });
    assert.equal(invalidPriceRes.status, 400);

    // 6.2 Create valid product with Soft Seating category
    const uniqueSku = `EC-TEST-SS-${Date.now()}`;
    const createRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Nordic Velvet Accent Armchair',
        sku: uniqueSku,
        category: softSeatingCat._id.toString(),
        subcategory: loungeSub._id.toString(),
        description: 'Luxurious velvet armchair handcrafted for executive reception and quiet contemplation.',
        mrp: 28000,
        sellingPrice: 22000,
        stock: 8,
        status: 'published',
        isBestseller: true,
        attributes: {
          material: 'Velvet',
          colour: 'Emerald Green',
          dimensions: '32" W x 30" D x 34" H',
        },
        images: [
          {
            url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7',
            isPrimary: true,
          },
        ],
      }),
    });

    assert.equal(createRes.status, 201);
    const createdData = await createRes.json();
    const createdId = createdData.data.product._id;
    assert.ok(createdId);
    assert.equal(createdData.data.product.category, softSeatingCat._id.toString());
    assert.equal(createdData.data.product.subcategory, loungeSub._id.toString());
    assert.equal(createdData.data.product.attributes.dimensions, '32" W x 30" D x 34" H');

    // 6.3 Edit Product via PUT /products/:id
    const editRes = await fetch(`${baseUrl}/products/${createdId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Nordic Velvet Accent Armchair - Updated Luxury Edition',
        sellingPrice: 19999,
        stock: 12,
        attributes: {
          material: 'Premium Velvet & Brass Legs',
          colour: 'Midnight Navy',
          dimensions: '34" W x 32" D x 35" H',
        },
      }),
    });

    assert.equal(editRes.status, 200);
    const updatedData = await editRes.json();
    assert.equal(updatedData.data.product.sellingPrice, 19999);
    assert.equal(updatedData.data.product.stock, 12);
    assert.equal(updatedData.data.product.attributes.colour, 'Midnight Navy');
    assert.equal(updatedData.data.product.attributes.dimensions, '34" W x 32" D x 35" H');
    assert.equal(updatedData.data.product.category.name, 'Soft Seating');

    // 6.4 Delete Product
    const delRes = await fetch(`${baseUrl}/products/${createdId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(delRes.status, 200);

    // Verify product no longer exists
    const checkDeleted = await Product.findById(createdId);
    assert.equal(checkDeleted, null);
  });

  server.close();
  await closeDB();
});
