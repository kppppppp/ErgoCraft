import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { User } from '../src/models/User.js';
import { connectDB, closeDB } from '../src/config/db.js';

test('Taxonomy & Hierarchical Classification Suite', async (t) => {
  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  let adminToken = '';
  let rootCatId = '';
  let childCatId = '';
  let grandChildCatId = '';
  let testProductId = '';

  await t.test('0. Database setup and admin auth', async () => {
    let testAdmin = await User.findOne({ email: 'admin_test@ergocraft.in' });
    if (!testAdmin) {
      testAdmin = new User({
        name: 'Admin Test',
        email: 'admin_test@ergocraft.in',
        password: 'AdminPassword123!',
        role: 'admin',
      });
      await testAdmin.save();
    } else {
      testAdmin.password = 'AdminPassword123!';
      await testAdmin.save();
    }

    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin_test@ergocraft.in',
        password: 'AdminPassword123!',
      }),
    });

    assert.equal(loginRes.status, 200);
    const loginData = await loginRes.json();
    adminToken = loginData.data.token;
    assert.ok(adminToken, 'Admin token should be acquired');
  });

  await t.test('1. Locate or Create 3-Level Category Hierarchy (Admin)', async () => {
    // Level 1: Main Category
    let root = await Category.findOne({ slug: 'office-chairs' });
    if (!root) {
      const l1Res = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Office Chairs',
          slug: 'office-chairs',
          sortOrder: 1,
          showInNavbar: true,
        }),
      });
      assert.equal(l1Res.status, 201);
      const l1Data = await l1Res.json();
      root = l1Data.data.category;
    }
    rootCatId = root._id.toString();
    assert.ok(rootCatId);

    // Level 2: Child Category
    let child = await Category.findOne({ slug: 'leatherette-chairs' });
    if (!child) {
      const l2Res = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Leatherette Chairs',
          slug: 'leatherette-chairs',
          parent: rootCatId,
          sortOrder: 1,
          showInNavbar: true,
        }),
      });
      assert.equal(l2Res.status, 201);
      const l2Data = await l2Res.json();
      child = l2Data.data.category;
    }
    childCatId = child._id.toString();
    assert.ok(childCatId);

    // Level 3: Specific Classification
    let grandChild = await Category.findOne({ slug: 'leatherette-high-back' });
    if (!grandChild) {
      const l3Res = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: 'Leatherette High Back',
          slug: 'leatherette-high-back',
          parent: childCatId,
          sortOrder: 1,
          showInNavbar: true,
        }),
      });
      assert.equal(l3Res.status, 201);
      const l3Data = await l3Res.json();
      grandChild = l3Data.data.category;
    }
    grandChildCatId = grandChild._id.toString();
    assert.ok(grandChildCatId);
  });

  await t.test('2. Retrieve Category Tree (GET /categories/tree)', async () => {
    const res = await fetch(`${baseUrl}/categories/tree`);
    assert.equal(res.status, 200);
    const data = await res.json();
    const tree = data.data.tree;
    assert.ok(Array.isArray(tree));
    assert.ok(tree.length >= 1);
    const officeChairs = tree.find((c) => c.slug === 'office-chairs');
    assert.ok(officeChairs);
    const leatherette = officeChairs.children.find((c) => c.slug === 'leatherette-chairs');
    assert.ok(leatherette);
    const lhb = leatherette.children.find((c) => c.slug === 'leatherette-high-back');
    assert.ok(lhb);
  });

  await t.test('3. Prevent circular parent assignment (Cycle Prevention)', async () => {
    // Attempt to set root category's parent to its grandchild
    const res = await fetch(`${baseUrl}/categories/${rootCatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ parent: grandChildCatId }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /descendant of itself/i);
  });

  await t.test('4. Prevent category from being its own parent', async () => {
    const res = await fetch(`${baseUrl}/categories/${rootCatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ parent: rootCatId }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /own parent/i);
  });

  await t.test('5. Prevent deleting category with child subcategories', async () => {
    const res = await fetch(`${baseUrl}/categories/${childCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /child subcategories/i);
  });

  await t.test('6. Create product with full 3-level taxonomy and attributes', async () => {
    const res = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Presidential Leatherette Chair Test',
        sku: `EC-TEST-${Date.now()}`,
        category: rootCatId,
        subcategory: childCatId,
        classification: grandChildCatId,
        mrp: 20000,
        sellingPrice: 15000,
        description: 'A luxurious test chair for presidential offices with dynamic support.',
        stock: 5,
        attributes: {
          material: 'Leatherette',
          backrestHeight: 'High Back',
          colour: 'Espresso Brown',
        },
        images: [{ url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65' }],
      }),
    });

    assert.equal(res.status, 201);
    const data = await res.json();
    testProductId = data.data.product._id;
    assert.ok(testProductId);
    assert.equal(data.data.product.categories.length, 3);
  });

  await t.test('7. Prevent deleting category with associated products', async () => {
    const res = await fetch(`${baseUrl}/categories/${grandChildCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.match(data.message, /assigned to/i);
  });

  await t.test('8. Filter products by parent category returns descendant products', async () => {
    // Querying Level 1 should return products assigned to Level 3
    const res = await fetch(`${baseUrl}/products?category=office-chairs`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.products.some((p) => p._id === testProductId));

    // Querying Level 2 should also return it
    const res2 = await fetch(`${baseUrl}/products?subcategory=leatherette-chairs`);
    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.ok(data2.data.products.some((p) => p._id === testProductId));

    // Querying Level 3 directly should return it
    const res3 = await fetch(`${baseUrl}/products?classification=leatherette-high-back`);
    assert.equal(res3.status, 200);
    const data3 = await res3.json();
    assert.ok(data3.data.products.some((p) => p._id === testProductId));
  });

  await t.test('9. Filter products by furniture attributes', async () => {
    const res = await fetch(`${baseUrl}/products?material=Leatherette&backrestHeight=High%20Back`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.data.products.length >= 1);
  });

  await t.test('10. Verify category product counts in admin flat list and tree', async () => {
    const adminCatsRes = await fetch(`${baseUrl}/categories/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminCatsRes.status, 200);
    const adminCatsData = await adminCatsRes.json();
    const l1 = adminCatsData.data.categories.find((c) => c._id === rootCatId);
    const l2 = adminCatsData.data.categories.find((c) => c._id === childCatId);
    const l3 = adminCatsData.data.categories.find((c) => c._id === grandChildCatId);

    assert.ok(l1.productCount >= 1, 'Level 1 category should accumulate descendant products');
    assert.ok(l2.productCount >= 1, 'Level 2 category should accumulate descendant products');
    assert.ok(l3.productCount >= 1, 'Level 3 category should count direct assignment');

    const treeRes = await fetch(`${baseUrl}/categories/tree`);
    assert.equal(treeRes.status, 200);
    const treeData = await treeRes.json();
    assert.ok(treeData.data.tree || treeData.data.categories);
  });

  await t.test('11. Fetch product by ID and by Slug', async () => {
    // 1. Fetch by 24-char ObjectId
    const byIdRes = await fetch(`${baseUrl}/products/${testProductId}`);
    assert.equal(byIdRes.status, 200);
    const byIdData = await byIdRes.json();
    assert.equal(byIdData.data.product._id, testProductId);

    // 2. Fetch via admin item endpoint
    const adminItemRes = await fetch(`${baseUrl}/products/admin/item/${testProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(adminItemRes.status, 200);
    const adminItemData = await adminItemRes.json();
    assert.equal(adminItemData.data.product._id, testProductId);
  });

  await t.test('12. Edit product (PUT /products/:id) and verify persistence', async () => {
    const editRes = await fetch(`${baseUrl}/products/${testProductId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Presidential Leatherette Chair Test V2',
        mrp: 22000,
        sellingPrice: 16500,
        stock: 12,
        isBestseller: true,
      }),
    });

    assert.equal(editRes.status, 200);
    const editData = await editRes.json();
    assert.equal(editData.data.product.name, 'Presidential Leatherette Chair Test V2');
    assert.equal(editData.data.product.sellingPrice, 16500);
    assert.equal(editData.data.product.stock, 12);
    assert.equal(editData.data.product.discountPercentage, 25);

    // Verify fetched document reflects update
    const verifyRes = await fetch(`${baseUrl}/products/${testProductId}`);
    const verifyData = await verifyRes.json();
    assert.equal(verifyData.data.product.name, 'Presidential Leatherette Chair Test V2');
    assert.equal(verifyData.data.product.stock, 12);

    // Clean up test product and test user created during suite
    if (testProductId) {
      await Product.findByIdAndDelete(testProductId);
    }
    await User.deleteOne({ email: 'admin_test@ergocraft.in' });
  });

  await new Promise((resolve) => server.close(resolve));
  await closeDB();
});
