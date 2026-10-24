import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';

test('Full Backend API Integration Suite', async (t) => {
  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  let customerToken = '';
  let adminToken = '';
  let seededProductId = '';
  let seededProductSlug = '';
  let createdOrderId = '';
  let razorpayOrderId = '';

  await t.test('1. Database setup and seeding for tests', async () => {
    await Promise.all([
      User.deleteMany({ email: { $ne: 'admin@ergocraft.in' } }),
      Category.deleteMany({ slug: 'office-chairs' }),
      Product.deleteMany({ sku: 'EC-TEST-001' }),
      Order.deleteMany({ 'customerDetails.email': 'jane.doe@example.com' }),
    ]);

    const existingAdmin = await User.findOne({ email: 'admin@ergocraft.in' });
    if (!existingAdmin) {
      await User.create({
        name: 'Ergocraft Administrator',
        email: 'admin@ergocraft.in',
        password: 'Admin@Ergocraft2026!',
        role: 'admin',
        phone: '+919326990672',
      });
    }

    const cat = await Category.create({
      name: 'Office Chairs',
      slug: 'office-chairs',
    });

    const prod = await Product.create({
      name: 'Oscar Test Chair',
      slug: 'oscar-test-chair',
      sku: 'EC-TEST-001',
      category: cat._id,
      description: 'High performance ergonomic task chair.',
      mrp: 15000,
      sellingPrice: 10000,
      stock: 20,
      isBestseller: true,
      images: [{ url: 'https://example.com/chair.jpg', isPrimary: true }],
    });

    seededProductId = prod._id.toString();
    seededProductSlug = prod.slug;

    assert.ok(seededProductId);
    assert.equal(prod.discountPercentage, 33);
  });

  await t.test('2. Register new customer account', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: 'Password123!',
        phone: '9876543210',
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'jane.doe@example.com');
    assert.equal(body.data.user.role, 'customer');
    assert.ok(body.data.token);
    customerToken = body.data.token;
  });

  await t.test('3. Login with customer credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'jane.doe@example.com',
        password: 'Password123!',
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.name, 'Jane Doe');
  });

  await t.test('4. Fetch Current User (GET /auth/me)', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.data.user.email, 'jane.doe@example.com');
  });

  await t.test('5. Public Category listing (GET /categories)', async () => {
    const res = await fetch(`${baseUrl}/categories`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.categories.length >= 1);
  });

  await t.test('6. Public Product listing & filtering (GET /products)', async () => {
    const res = await fetch(`${baseUrl}/products?category=office-chairs&isBestseller=true`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.products.length >= 1);
    assert.equal(body.data.products[0].sku, 'EC-TEST-001');
  });

  await t.test('7. Product Details by slug (GET /products/:slug)', async () => {
    const res = await fetch(`${baseUrl}/products/${seededProductSlug}`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.product.name, 'Oscar Test Chair');
  });

  await t.test('7a. Checkout CORS preflight allows the idempotency request header', async () => {
    const res = await fetch(`${baseUrl}/orders/create`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,idempotency-key',
      },
    });

    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
    assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    const allowedHeaders = res.headers.get('access-control-allow-headers')?.toLowerCase() || '';
    assert.match(allowedHeaders, /content-type/);
    assert.match(allowedHeaders, /idempotency-key/);
    assert.match(allowedHeaders, /authorization/);
  });

  await t.test('8. Enforce login before purchase (Unauthenticated checkout rejection)', async () => {
    const unauthRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: seededProductId, quantity: 1 }],
        customerDetails: { name: 'Guest User', email: 'guest@example.com', phone: '9876543210' },
        shippingAddress: { street: '123 Marine Drive', city: 'Mumbai', state: 'MH', postalCode: '400020' },
      }),
    });

    assert.equal(unauthRes.status, 401);
    const unauthBody = await unauthRes.json();
    assert.equal(unauthBody.success, false);
  });

  await t.test('9. Create pending order with authenticated user and server-side price validation', async () => {
    const res = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': 'api-suite-cod-checkout-1',
      },
      body: JSON.stringify({
        items: [{ productId: seededProductId, quantity: 2 }],
        customerDetails: {
          name: 'Jane Doe',
          email: 'jane.doe@example.com',
          phone: '9876543210',
        },
        paymentMethod: 'cod',
        shippingAddress: {
          street: '123 Marine Drive',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400020',
        },
      }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.orderNumber.startsWith('EC-'));
    assert.equal(body.data.pricing.subtotal, 20000); // 2 * 10000
    assert.equal(body.data.pricing.shippingCharges, 0); // Unconditional 100% Free Shipping
    assert.equal(body.data.pricing.total, 20000); // Free shipping on all orders

    createdOrderId = body.data.orderId;
    razorpayOrderId = body.data.razorpayOrderId;

    const retryRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
        'Idempotency-Key': 'api-suite-cod-checkout-1',
      },
      body: JSON.stringify({
        items: [{ productId: seededProductId, quantity: 2 }],
        customerDetails: { name: 'Jane Doe', email: 'jane.doe@example.com', phone: '9876543210' },
        paymentMethod: 'cod',
        shippingAddress: { street: '123 Marine Drive', city: 'Mumbai', state: 'Maharashtra', postalCode: '400020' },
      }),
    });
    assert.equal(retryRes.status, 200, 'A repeated checkout request should return its original order');
    const retryBody = await retryRes.json();
    assert.equal(retryBody.data.orderId, createdOrderId);
    assert.equal(await Order.countDocuments({ idempotencyKey: 'api-suite-cod-checkout-1' }), 1);
  });

  await t.test('10. Reject forged payment signature (HMAC Verification)', async () => {
    const forgedRes = await fetch(`${baseUrl}/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: 'pay_test_forged',
        razorpay_signature: 'invalid_signature_attempt',
      }),
    });

    assert.equal(forgedRes.status, 400);
    const forgedBody = await forgedRes.json();
    assert.equal(forgedBody.success, false);
  });

  await t.test('11. COD orders cannot be marked paid by a Razorpay callback', async () => {
    const res = await fetch(`${baseUrl}/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: 'order_unrelated',
        razorpay_payment_id: 'pay_unrelated',
        razorpay_signature: 'a'.repeat(64),
      }),
    });

    assert.equal(res.status, 400);
    const persistedOrder = await Order.findById(createdOrderId);
    assert.equal(persistedOrder.paymentStatus, 'pending');
    const updatedProd = await Product.findById(seededProductId);
    assert.equal(updatedProd.stock, 18);
  });

  server.close();
  await closeDB();
});
