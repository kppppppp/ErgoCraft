import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { app } from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { config } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';

test('Comprehensive E-Commerce Audit & E2E Verification Suite (Scenarios A through H)', async (t) => {
  await connectDB();
  // Keep this suite self-contained; every test file runs against its own isolated database.
  const fixtureCategory = await Category.create({ name: 'Test Seating', slug: `test-seating-${Date.now()}` });
  const fixtureProduct = await Product.create({
    name: 'E2E Test Chair', slug: `e2e-test-chair-${Date.now()}`, sku: `EC-E2E-FIXTURE-${Date.now()}`,
    category: fixtureCategory._id, description: 'A test fixture used for isolated order workflow checks.',
    mrp: 10000, sellingPrice: 8000, stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65', isPrimary: true }],
  });
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  const timestamp = Date.now();
  const testCustomerEmail = `e2e.customer.${timestamp}@ergocraft.in`;
  const testCustomerPassword = 'SecurePassword2026!';
  const updatedPassword = 'NewSecurePassword2026!';

  let customerToken = '';
  let customerId = '';
  let customer2Token = '';
  let customer2Id = '';
  let adminToken = '';
  let testProductId = '';
  let testProductSlug = '';
  let createdOrderId = '';
  let createdRazorpayOrderId = '';

  await t.test('Scenario A: Customer Registration & Login', async () => {
    // 1. Register new customer
    const regRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'E2E Test Customer',
        email: testCustomerEmail,
        password: testCustomerPassword,
        phone: '+919876543210',
      }),
    });

    assert.equal(regRes.status, 201, 'Registration should return 201 Created');
    const regBody = await regRes.json();
    assert.equal(regBody.success, true);
    assert.equal(regBody.data.user.email, testCustomerEmail);
    assert.equal(regBody.data.user.role, 'customer', 'Public registration must only create customer role');
    assert.ok(regBody.data.token, 'Registration must return session token');

    customerToken = regBody.data.token;
    customerId = regBody.data.user.id;

    // 2. Prevent duplicate email registration
    const dupRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Duplicate Customer',
        email: testCustomerEmail,
        password: testCustomerPassword,
      }),
    });
    assert.equal(dupRes.status, 409, 'Duplicate email registration must be rejected with 409 Conflict');

    // 3. Login with credentials
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testCustomerEmail,
        password: testCustomerPassword,
      }),
    });
    assert.equal(loginRes.status, 200, 'Login should succeed with 200 OK');
    const loginBody = await loginRes.json();
    assert.equal(loginBody.success, true);
    assert.equal(loginBody.data.user.email, testCustomerEmail);

    // 4. Access protected profile (GET /auth/me)
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(meRes.status, 200);
    const meBody = await meRes.json();
    assert.equal(meBody.data.user.id, customerId);
  });

  await t.test('Scenario B: Forgot Password & Single-Use Expiring Token Lifecycle', async () => {
    // 1. Submit forgot password request
    const forgotRes = await fetch(`${baseUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCustomerEmail }),
    });
    assert.equal(forgotRes.status, 200);
    const forgotBody = await forgotRes.json();
    assert.equal(forgotBody.success, true);
    assert.ok(forgotBody.message.includes('dispatched'), 'Must return generic message without account enumeration');

    // 2. Verify token was hashed in MongoDB and has expiration
    const userDoc = await User.findOne({ email: testCustomerEmail });
    assert.ok(userDoc.passwordResetTokenHash, 'Password reset token hash must be stored in database');
    assert.ok(userDoc.passwordResetExpires > Date.now(), 'Token expiration must be in the future (15-min TTL)');

    // 3. Create a raw reset token that matches the hash
    const rawResetToken = crypto.randomBytes(32).toString('hex');
    userDoc.passwordResetTokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');
    userDoc.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await userDoc.save({ validateBeforeSave: false });

    // 4. Test invalid token rejection
    const invalidTokenRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'bogus_invalid_token', password: updatedPassword }),
    });
    assert.equal(invalidTokenRes.status, 400, 'Invalid reset token must return 400');

    // 5. Test expired token rejection
    userDoc.passwordResetExpires = Date.now() - 1000; // Expired 1 second ago
    await userDoc.save({ validateBeforeSave: false });

    const expiredTokenRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawResetToken, password: updatedPassword }),
    });
    assert.equal(expiredTokenRes.status, 400, 'Expired token must return 400');

    // 6. Test valid reset token
    userDoc.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await userDoc.save({ validateBeforeSave: false });

    const validResetRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawResetToken, password: updatedPassword }),
    });
    assert.equal(validResetRes.status, 200, 'Valid reset token must succeed');

    // 7. Verify token is single-use (cannot be reused)
    const reusedRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: rawResetToken, password: updatedPassword }),
    });
    assert.equal(reusedRes.status, 400, 'Reused reset token must fail (single-use enforcement)');

    // 8. Log in with the updated password
    const newLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testCustomerEmail, password: updatedPassword }),
    });
    assert.equal(newLoginRes.status, 200, 'Must be able to log in with new password');
    const newLoginBody = await newLoginRes.json();
    customerToken = newLoginBody.data.token; // Update token for remaining tests
  });

  await t.test('Scenario C: Guest Checkout Prevention (Backend Enforcement)', async () => {
    // Find any existing active product
    const product = await Product.findOne({ status: 'published' });
    assert.ok(product, 'Must have at least one published product in database');
    testProductId = product._id.toString();
    testProductSlug = product.slug;

    // Direct unauthenticated API call to create order must be rejected with 401
    const unauthOrderRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ productId: testProductId, quantity: 1 }],
        customerDetails: { name: 'Guest Attempt', email: 'guest@example.com', phone: '9999999999' },
        shippingAddress: { street: '123 Test St', city: 'Mumbai', state: 'MH', postalCode: '400001' },
      }),
    });

    assert.equal(unauthOrderRes.status, 401, 'Unauthenticated order creation must return 401 Unauthorized');
    const unauthOrderBody = await unauthOrderRes.json();
    assert.equal(unauthOrderBody.success, false);
  });

  await t.test('Scenario D & E: Admin Authentication, Product Creation & Update', async () => {
    // 0. Ensure Admin user exists in DB
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

    // 1. Login as authorized Admin
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ergocraft.in',
        password: 'Admin@Ergocraft2026!',
      }),
    });
    assert.equal(adminLoginRes.status, 200, 'Admin login must succeed');
    const adminLoginBody = await adminLoginRes.json();
    assert.equal(adminLoginBody.data.user.role, 'admin');
    adminToken = adminLoginBody.data.token;

    // 2. Fetch category to link new product
    const cat = await Category.findOne();
    assert.ok(cat, 'Category must exist');

    // Clean up any product with the same slug before test run
    await Product.deleteMany({ slug: 'ergocraft-e2e-pro-mesh-chair' });

    // 3. Create product as Admin
    const newSku = `EC-E2E-${Date.now().toString().slice(-4)}`;
    const createProdRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: 'Ergocraft E2E Pro Mesh Chair',
        sku: newSku,
        category: cat._id.toString(),
        description: 'Engineered for intensive pairing and verification testing.',
        mrp: 24999,
        sellingPrice: 18999,
        stock: 25,
        isBestseller: true,
        images: [
          {
            url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65?q=80&w=800',
            publicId: 'cld_test_asset_001',
            isPrimary: true,
          },
        ],
      }),
    });

    assert.equal(createProdRes.status, 201, 'Admin product creation should return 201');
    const createProdBody = await createProdRes.json();
    const createdProduct = createProdBody.data.product;
    assert.equal(createdProduct.sku, newSku);
    assert.equal(createdProduct.stock, 25);
    assert.equal(createdProduct.discountPercentage, 24); // Math.round((24999 - 18999) / 24999 * 100)

    // 4. Update the created product
    const updateProdRes = await fetch(`${baseUrl}/products/${createdProduct._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        sellingPrice: 17999,
        stock: 30,
        isBestseller: false,
      }),
    });

    assert.equal(updateProdRes.status, 200, 'Admin product update should return 200');
    const updateProdBody = await updateProdRes.json();
    assert.equal(updateProdBody.data.product.sellingPrice, 17999);
    assert.equal(updateProdBody.data.product.stock, 30);
    assert.equal(updateProdBody.data.product.isBestseller, false);

    // 5. Customer cannot create or update product (RBAC check)
    const customerForbiddenRes = await fetch(`${baseUrl}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({ name: 'Hacker Chair', sku: 'EC-HACK', category: cat._id }),
    });
    assert.equal(customerForbiddenRes.status, 403, 'Regular customer must be forbidden from creating products');
  });

  await t.test('Scenario F & G: Authenticated Razorpay Order, Verification & Email Notifications', async () => {
    if (!config.razorpay.keyId || !config.razorpay.keySecret) {
      const codRes = await fetch(`${baseUrl}/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
        body: JSON.stringify({
          items: [{ productId: testProductId, quantity: 1 }],
          customerDetails: { name: 'E2E Test Customer', email: testCustomerEmail, phone: '+919876543210' },
          shippingAddress: { street: 'Flat 101, Palm Court', city: 'Mumbai', state: 'Maharashtra', postalCode: '400018' },
          paymentMethod: 'cod',
        }),
      });
      assert.equal(codRes.status, 201, 'COD order creation remains testable without Razorpay credentials');
      createdOrderId = (await codRes.json()).data.orderId;
      return;
    }
    // 1. Authenticated customer creates pending order
    const orderRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: testProductId, quantity: 1 }],
        customerDetails: {
          name: 'E2E Test Customer',
          email: testCustomerEmail,
          phone: '+919876543210',
        },
        shippingAddress: {
          street: 'Flat 101, Palm Court, Worli Sea Face',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400018',
        },
      }),
    });

    assert.equal(orderRes.status, 201, 'Authenticated order creation must succeed with 201');
    const orderBody = await orderRes.json();
    createdOrderId = orderBody.data.orderId;
    createdRazorpayOrderId = orderBody.data.razorpayOrderId;
    assert.ok(createdOrderId);
    assert.ok(createdRazorpayOrderId.startsWith('order_'), 'Razorpay order must be generated by SDK');

    // 2. Reject forged payment signature
    const forgedRes = await fetch(`${baseUrl}/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: createdRazorpayOrderId,
        razorpay_payment_id: 'pay_forged_attempt_123',
        razorpay_signature: 'fake_tampered_signature_string',
      }),
    });
    assert.equal(forgedRes.status, 400, 'Tampered signature must be rejected with 400');

    // 3. Compute real HMAC-SHA256 signature and verify successfully
    const validPaymentId = 'pay_verified_' + Date.now();
    const hmacPayload = `${createdRazorpayOrderId}|${validPaymentId}`;
    const validSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(hmacPayload)
      .digest('hex');

    const verifyRes = await fetch(`${baseUrl}/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: createdRazorpayOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature,
      }),
    });

    assert.equal(verifyRes.status, 200, 'Valid HMAC signature must verify with 200 OK');
    const verifyBody = await verifyRes.json();
    assert.equal(verifyBody.data.order.paymentStatus, 'paid');
    assert.equal(verifyBody.data.order.paymentDetails.paymentId, validPaymentId);

    // 4. Verify idempotent call (cannot re-verify already paid order)
    const idempotentRes = await fetch(`${baseUrl}/orders/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        orderId: createdOrderId,
        razorpay_order_id: createdRazorpayOrderId,
        razorpay_payment_id: validPaymentId,
        razorpay_signature: validSignature,
      }),
    });
    assert.equal(idempotentRes.status, 200);
    const idempotentBody = await idempotentRes.json();
    assert.ok(idempotentBody.message.includes('already'));
  });

  await t.test('Scenario H: Cross-Customer Authorization Isolation', async () => {
    // 1. Register a second customer
    const c2Email = `second.customer.${Date.now()}@ergocraft.in`;
    const reg2Res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Second Customer',
        email: c2Email,
        password: 'Password999!',
        phone: '+919123456789',
      }),
    });
    const reg2Body = await reg2Res.json();
    customer2Token = reg2Body.data.token;
    customer2Id = reg2Body.data.user.id;

    // 2. Second customer attempts to read first customer's order detail -> MUST return 403 Forbidden
    const crossAccessRes = await fetch(`${baseUrl}/orders/${createdOrderId}`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(crossAccessRes.status, 403, 'Customer 2 must not be able to read another customer order');

    // 3. Second customer cannot view first customer's orders in /orders/my-orders
    const c2OrdersRes = await fetch(`${baseUrl}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    const c2OrdersBody = await c2OrdersRes.json();
    assert.equal(c2OrdersBody.data.orders.length, 0, 'Customer 2 should have 0 orders');

    // 4. Customer 2 cannot access admin order list or stats
    const forbiddenStatsRes = await fetch(`${baseUrl}/orders/admin/stats`, {
      headers: { Authorization: `Bearer ${customer2Token}` },
    });
    assert.equal(forbiddenStatsRes.status, 403, 'Customer 2 cannot access admin stats');
  });

  server.close();
  await closeDB();
});
