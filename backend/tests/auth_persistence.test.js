import test from 'node:test';
import assert from 'node:assert/strict';
import { app } from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { paymentService } from '../src/services/paymentService.js';
import { config } from '../src/config/env.js';
import crypto from 'node:crypto';

test('Registration, logout, login, session restoration, and cart persistence', async () => {
  await connectDB();
  const server = app.listen(0);
  const baseUrl = `http://127.0.0.1:${server.address().port}/api/v1`;
  const email = `auth.regression.${Date.now()}@example.com`;
  let userId;
  try {
    const registration = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Session Test', email: ` ${email.toUpperCase()} `, password: 'StablePassword123!' }),
    });
    assert.equal(registration.status, 201);
    const registered = (await registration.json()).data;
    userId = registered.user.id;
    assert.equal(registered.user.email, email);
    assert.ok(registered.token);
    const userDoc = await User.findById(userId).select('+password');
    assert.ok(userDoc);
    assert.notEqual(userDoc.password, 'StablePassword123!');
    assert.equal(await userDoc.comparePassword('StablePassword123!'), true);

    const duplicate = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Second User', email: email.toUpperCase(), password: 'StablePassword123!' }),
    });
    assert.equal(duplicate.status, 409);

    const cartResponse = await fetch(`${baseUrl}/auth/cart/merge`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${registered.token}` },
      body: JSON.stringify({ items: [
        { productId: 'chair-1', name: 'Task Chair', sellingPrice: 100, mrp: 120, quantity: 2, maxStock: 5 },
        { productId: 'chair-1', name: 'Task Chair', sellingPrice: 100, mrp: 120, quantity: 2, maxStock: 5 },
        { productId: 'sofa-2', name: 'Sofa', sellingPrice: 500, mrp: 600, quantity: 1, maxStock: 3 },
      ] }),
    });
    assert.equal(cartResponse.status, 200);
    const mergedCart = (await cartResponse.json()).data.items;
    assert.equal(mergedCart.length, 2);
    assert.equal(mergedCart.find((item) => item.productId === 'chair-1').quantity, 4);

    const logout = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST', headers: { Authorization: `Bearer ${registered.token}` },
    });
    assert.equal(logout.status, 200);
    const expiredSession = await fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${registered.token}` } });
    assert.equal(expiredSession.status, 401);

    const login = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ` ${email.toUpperCase()} `, password: 'StablePassword123!' }),
    });
    assert.equal(login.status, 200);
    const loggedIn = (await login.json()).data;
    const restoredSession = await fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${loggedIn.token}` } });
    assert.equal(restoredSession.status, 200);
    const persistedCartResponse = await fetch(`${baseUrl}/auth/cart/merge`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${loggedIn.token}` },
      body: JSON.stringify({ items: [] }),
    });
    const persistedCart = (await persistedCartResponse.json()).data.items;
    assert.equal(persistedCart.find((item) => item.productId === 'chair-1').quantity, 4);
  } finally {
    if (userId) await User.findByIdAndDelete(userId);
    await new Promise((resolve) => server.close(resolve));
    await closeDB();
  }
});

test('Razorpay HMAC validation accepts a genuine digest and rejects malformed/forged values', () => {
  const orderId = 'order_test_reference';
  const paymentId = 'pay_test_reference';
  const signature = crypto.createHmac('sha256', config.razorpay.keySecret).update(`${orderId}|${paymentId}`).digest('hex');
  assert.equal(paymentService.verifySignature({ orderId, paymentId, signature }), Boolean(config.razorpay.keySecret));
  assert.equal(paymentService.verifySignature({ orderId, paymentId, signature: 'forged' }), false);
});
