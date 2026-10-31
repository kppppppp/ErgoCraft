import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { Payment } from '../src/models/Payment.js';
import { Setting } from '../src/models/Setting.js';

test('Cash on Delivery (COD) & Admin Settings Suite', async (t) => {
  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  let adminToken = '';
  let customerToken = '';
  let testProductId = '';
  let createdCodOrderId = '';

  const testCustomerEmail = `cod.test.${Date.now()}@ergocraft.in`;

  await t.test('1. Setup Admin and Customer accounts, seeded product', async () => {
    // 1. Ensure Admin exists
    let admin = await User.findOne({ email: 'admin@ergocraft.in' });
    if (!admin) {
      admin = await User.create({
        name: 'Ergocraft Administrator',
        email: 'admin@ergocraft.in',
        password: 'Admin@Ergocraft2026!',
        role: 'admin',
        phone: '+919326990672',
      });
    }

    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ergocraft.in', password: 'Admin@Ergocraft2026!' }),
    });
    const adminLoginBody = await adminLoginRes.json();
    assert.equal(adminLoginRes.status, 200);
    adminToken = adminLoginBody.data.token;

    // 2. Register Customer
    const custRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'COD Tester',
        email: testCustomerEmail,
        password: 'Password123!',
        phone: '+919876543210',
      }),
    });
    const custBody = await custRes.json();
    assert.equal(custRes.status, 201);
    customerToken = custBody.data.token;

    // 3. Seed product
    let cat = await Category.findOne({ slug: 'cod-chairs' });
    if (!cat) {
      cat = await Category.create({ name: 'COD Chairs', slug: 'cod-chairs' });
    }

    const prod = await Product.create({
      name: 'ErgoCOD Task Chair',
      slug: `ergocod-task-chair-${Date.now()}`,
      sku: `SKU-COD-${Date.now()}`,
      category: cat._id,
      description: 'Chair for testing COD flow',
      mrp: 14999,
      sellingPrice: 8999,
      stock: 10,
      images: [{ url: 'https://example.com/cod-chair.jpg', isPrimary: true }],
    });
    testProductId = prod._id.toString();

    // 4. Reset store settings to COD enabled: true
    await Setting.findOneAndUpdate(
      { key: 'store_settings' },
      { codEnabled: true },
      { upsert: true, new: true }
    );
  });

  await t.test('2. GET /settings returns public COD availability', async () => {
    const res = await fetch(`${baseUrl}/settings`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.codEnabled, true);
  });

  await t.test('3. Place order with Cash on Delivery (paymentMethod: "cod")', async () => {
    const initialProduct = await Product.findById(testProductId);
    const initialStock = initialProduct.stock;

    const res = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: testProductId, quantity: 2 }],
        paymentMethod: 'cod',
        customerDetails: {
          name: 'COD Tester',
          email: testCustomerEmail,
          phone: '+919876543210',
        },
        shippingAddress: {
          street: '100 Gateway Boulevard',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
        },
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.paymentMethod, 'cod');
    assert.equal(body.data.pricing.total, 8999 * 2);
    assert.equal(body.data.pricing.shippingCharges, 0);

    createdCodOrderId = body.data.orderId;
    assert.ok(createdCodOrderId);

    // Verify DB order state
    const orderInDb = await Order.findById(createdCodOrderId);
    assert.equal(orderInDb.paymentStatus, 'pending');
    assert.equal(orderInDb.fulfilmentStatus, 'processing');
    assert.equal(orderInDb.paymentDetails.provider, 'cod');

    let notifiedOrder = orderInDb;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      notifiedOrder = await Order.findById(createdCodOrderId);
      if (notifiedOrder.notifications.ownerOrder.status === 'accepted' && notifiedOrder.notifications.customerOrder.status === 'accepted') break;
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    assert.equal(notifiedOrder.notifications.ownerOrder.status, 'accepted');
    assert.equal(notifiedOrder.notifications.customerOrder.status, 'accepted');
    assert.ok(globalThis.__testEmails.some((message) => message.to === 'test-owner@example.test'));

    // Verify inventory decremented atomically
    const updatedProduct = await Product.findById(testProductId);
    assert.equal(updatedProduct.stock, initialStock - 2);

    // Verify Payment record created
    const paymentInDb = await Payment.findOne({ order: createdCodOrderId });
    assert.ok(paymentInDb);
    assert.equal(paymentInDb.provider, 'cod');
    assert.equal(paymentInDb.status, 'pending');
  });

  await t.test('4. Admin can update COD order fulfilment to shipped without prior payment', async () => {
    const res = await fetch(`${baseUrl}/orders/admin/${createdCodOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fulfilmentStatus: 'shipped',
        courier: 'Blue Dart Express',
        trackingNumber: 'BLD12345678',
        trackingUrl: 'https://track.bluedart.com',
        note: 'Handed to driver for doorstep COD delivery',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.order.fulfilmentStatus, 'shipped');
    assert.equal(body.data.order.paymentStatus, 'pending');
  });

  await t.test('5. Admin updates COD order to delivered and marks paymentStatus to paid', async () => {
    const res = await fetch(`${baseUrl}/orders/admin/${createdCodOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        fulfilmentStatus: 'delivered',
        paymentStatus: 'paid',
        note: 'Cash collected by delivery agent and deposited',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.order.fulfilmentStatus, 'delivered');
    assert.equal(body.data.order.paymentStatus, 'paid');

    // Verify Payment record updated to captured
    const paymentInDb = await Payment.findOne({ order: createdCodOrderId });
    assert.equal(paymentInDb.status, 'captured');
  });

  await t.test('6. Admin toggles COD OFF via PATCH /settings', async () => {
    // Unauthenticated rejection
    const unauthRes = await fetch(`${baseUrl}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codEnabled: false }),
    });
    assert.equal(unauthRes.status, 401);

    // Authenticated admin toggle
    const toggleRes = await fetch(`${baseUrl}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ codEnabled: false }),
    });
    assert.equal(toggleRes.status, 200);
    const toggleBody = await toggleRes.json();
    assert.equal(toggleBody.data.codEnabled, false);

    // Verify public settings reflects disabled COD
    const publicRes = await fetch(`${baseUrl}/settings`);
    const publicBody = await publicRes.json();
    assert.equal(publicBody.data.codEnabled, false);
  });

  await t.test('7. Customer attempt to place COD order while disabled is rejected (400)', async () => {
    const res = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: testProductId, quantity: 1 }],
        paymentMethod: 'cod',
        customerDetails: {
          name: 'COD Tester',
          email: testCustomerEmail,
          phone: '+919876543210',
        },
        shippingAddress: {
          street: '100 Gateway Boulevard',
          city: 'Pune',
          state: 'Maharashtra',
          postalCode: '411001',
        },
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Cash on Delivery \(COD\) is currently disabled/);
  });

  await t.test('8. Admin toggles COD back ON via PATCH /settings', async () => {
    const toggleRes = await fetch(`${baseUrl}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ codEnabled: true }),
    });
    assert.equal(toggleRes.status, 200);
    const toggleBody = await toggleRes.json();
    assert.equal(toggleBody.data.codEnabled, true);

    const publicRes = await fetch(`${baseUrl}/settings`);
    const publicBody = await publicRes.json();
    assert.equal(publicBody.data.codEnabled, true);
  });

  t.after(async () => {
    if (testProductId) await Product.findByIdAndDelete(testProductId);
    await Product.deleteMany({ name: { $regex: 'ErgoCOD', $options: 'i' } });
    await Category.deleteMany({ slug: { $in: ['cod-chairs', 'cod-test-chairs'] } });
    await User.deleteMany({ email: { $regex: 'cod.test' } });
    server.close();
    await closeDB();
  });
});
