import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_INDIAN_STATES,
  DEFAULT_RESTRICTED_STATES,
  normalizeState,
  validatePinCode,
  verifyPinAndState,
  checkDeliveryServiceability,
} from '../src/utils/deliveryService.js';
import {
  isChairProduct,
  calculateCartPricing,
  DEFAULT_CHAIR_DISCOUNT_CONFIG,
} from '../src/services/pricingService.js';
import { app } from '../src/app.js';
import { connectDB, closeDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Category } from '../src/models/Category.js';
import { Product } from '../src/models/Product.js';
import { Order } from '../src/models/Order.js';
import { Setting } from '../src/models/Setting.js';

test('FEATURE 1 & FEATURE 2: Delivery Restrictions & Automatic Chair Discount Suite', async (t) => {
  // =========================================================================
  // PART A: DELIVERY SERVICEABILITY UNIT TESTS
  // =========================================================================

  await t.test('1. Delivery - Normalization & Abbreviations', () => {
    assert.equal(normalizeState('UP'), 'Uttar Pradesh');
    assert.equal(normalizeState('u.p.'), 'Uttar Pradesh');
    assert.equal(normalizeState('uttar pradesh'), 'Uttar Pradesh');
    assert.equal(normalizeState('WB'), 'West Bengal');
    assert.equal(normalizeState('w.b.'), 'West Bengal');
    assert.equal(normalizeState('west bengal'), 'West Bengal');
    assert.equal(normalizeState('J&K'), 'Jammu & Kashmir');
    assert.equal(normalizeState('jammu and kashmir'), 'Jammu & Kashmir');
    assert.equal(normalizeState('UK'), 'Uttarakhand');
    assert.equal(normalizeState('uttaranchal'), 'Uttarakhand');
    assert.equal(normalizeState('MH'), 'Maharashtra');
    assert.equal(normalizeState('maharashtra'), 'Maharashtra');
    assert.equal(normalizeState('KA'), 'Karnataka');
    assert.equal(normalizeState('karnataka'), 'Karnataka');
    assert.equal(normalizeState('DL'), 'Delhi');
    assert.equal(normalizeState('new delhi'), 'Delhi');
    assert.equal(normalizeState('orissa'), 'Odisha');
    assert.equal(normalizeState('pondicherry'), 'Puducherry');
    assert.equal(normalizeState('invalid_country_xyz'), null);
  });

  await t.test('2. Delivery - PIN Code Format Validation', () => {
    assert.equal(validatePinCode('400050'), true);
    assert.equal(validatePinCode(400050), true);
    assert.equal(validatePinCode('110001'), true);
    assert.equal(validatePinCode('700001'), true);

    // Invalid format
    assert.equal(validatePinCode(''), false);
    assert.equal(validatePinCode('40005'), false); // 5 digits
    assert.equal(validatePinCode('4000050'), false); // 7 digits
    assert.equal(validatePinCode('40005A'), false); // letters
    assert.equal(validatePinCode('012345'), false); // starts with 0
    assert.equal(validatePinCode(null), false);
  });

  await t.test('3. Delivery - PIN Code and State Consistency & Mismatch Rejection', () => {
    // Valid pairs
    assert.equal(verifyPinAndState('400050', 'Maharashtra').valid, true);
    assert.equal(verifyPinAndState('411001', 'MH').valid, true);
    assert.equal(verifyPinAndState('560001', 'Karnataka').valid, true);
    assert.equal(verifyPinAndState('110001', 'Delhi').valid, true);
    assert.equal(verifyPinAndState('600001', 'Tamil Nadu').valid, true);
    assert.equal(verifyPinAndState('380001', 'Gujarat').valid, true);

    // Mismatches must be rejected
    const mhDelhiMismatch = verifyPinAndState('110001', 'Maharashtra');
    assert.equal(mhDelhiMismatch.valid, false);
    assert.match(mhDelhiMismatch.message, /does not belong to Maharashtra/i);

    const mhUpMismatch = verifyPinAndState('201301', 'Maharashtra');
    assert.equal(mhUpMismatch.valid, false);

    const kaWbMismatch = verifyPinAndState('700001', 'Karnataka');
    assert.equal(kaWbMismatch.valid, false);

    const dlMhMismatch = verifyPinAndState('400001', 'Delhi');
    assert.equal(dlMhMismatch.valid, false);
  });

  await t.test('4. Delivery - All 16 Restricted States Blocked with Exact Message', () => {
    const restrictedStatePinPairs = [
      { state: 'Jammu & Kashmir', pin: '190001' },
      { state: 'Himachal Pradesh', pin: '171001' },
      { state: 'Uttarakhand', pin: '248001' },
      { state: 'Uttar Pradesh', pin: '201301' },
      { state: 'Bihar', pin: '800001' },
      { state: 'Jharkhand', pin: '834001' },
      { state: 'West Bengal', pin: '700001' },
      { state: 'Odisha', pin: '751001' },
      { state: 'Sikkim', pin: '737101' },
      { state: 'Arunachal Pradesh', pin: '791111' },
      { state: 'Assam', pin: '781001' },
      { state: 'Manipur', pin: '795001' },
      { state: 'Meghalaya', pin: '793001' },
      { state: 'Mizoram', pin: '796001' },
      { state: 'Nagaland', pin: '797001' },
      { state: 'Tripura', pin: '799001' },
    ];

    assert.equal(DEFAULT_RESTRICTED_STATES.length, 16);

    for (const pair of restrictedStatePinPairs) {
      const result = checkDeliveryServiceability(pair.state, pair.pin);
      assert.equal(
        result.serviceable,
        false,
        `Expected ${pair.state} (${pair.pin}) to be unserviceable`
      );
      assert.equal(
        result.message,
        'Sorry! ErgoCraft currently does not offer delivery services to your location.',
        `Mismatch in restriction message for ${pair.state}`
      );
    }
  });

  await t.test('5. Delivery - Serviceable States Allowed (Maharashtra, Karnataka, Gujarat, etc.)', () => {
    const serviceablePairs = [
      { state: 'Maharashtra', pin: '400050' },
      { state: 'Maharashtra', pin: '411001' },
      { state: 'Karnataka', pin: '560001' },
      { state: 'Gujarat', pin: '380001' },
      { state: 'Tamil Nadu', pin: '600001' },
      { state: 'Delhi', pin: '110001' },
      { state: 'Telangana', pin: '500001' },
      { state: 'Kerala', pin: '682001' },
      { state: 'Rajasthan', pin: '302001' },
    ];

    for (const pair of serviceablePairs) {
      const result = checkDeliveryServiceability(pair.state, pair.pin);
      assert.equal(
        result.serviceable,
        true,
        `Expected ${pair.state} (${pair.pin}) to be serviceable`
      );
    }
  });

  await t.test('6. Delivery - Disabled Restrictions Allows Pan-India Delivery', () => {
    const upResult = checkDeliveryServiceability('Uttar Pradesh', '201301', {
      restrictionsEnabled: false,
    });
    assert.equal(upResult.serviceable, true);

    const wbResult = checkDeliveryServiceability('West Bengal', '700001', {
      restrictionsEnabled: false,
    });
    assert.equal(wbResult.serviceable, true);
  });

  // =========================================================================
  // PART B: AUTOMATIC CHAIR DISCOUNT UNIT TESTS
  // =========================================================================

  await t.test('7. Discounts - Product Chair Eligibility Detection', () => {
    // Office chairs (eligible)
    assert.equal(
      isChairProduct({
        name: 'Oscar High Back Ergonomic Mesh Chair',
        slug: 'oscar-high-back-mesh-chair',
        category: { name: 'Office Chairs', slug: 'office-chairs' },
        subcategory: { name: 'Mesh Chairs', slug: 'mesh-chairs' },
      }),
      true
    );

    assert.equal(
      isChairProduct({
        name: 'ReclineX Executive Chair',
        slug: 'reclinex-executive-chair',
        category: { name: 'Office Chairs', slug: 'office-chairs' },
      }),
      true
    );

    // Soft seating chairs (eligible)
    assert.equal(
      isChairProduct({
        name: 'Cruise Lounge chair',
        slug: 'cruise-lounge-chair',
        category: { name: 'Soft Seating', slug: 'soft-seating' },
        subcategory: { name: 'Lounge Chairs', slug: 'lounge-chairs' },
      }),
      true
    );

    // Sofas (NOT eligible)
    assert.equal(
      isChairProduct({
        name: 'Crimson 3 seater sofa',
        slug: 'crimson-3-seater-sofa',
        category: { name: 'Sofas', slug: 'sofas' },
        subcategory: { name: '3-Seater', slug: '3-seater' },
      }),
      false
    );

    assert.equal(
      isChairProduct({
        name: 'Regal L-type sofa',
        slug: 'regal-l-type-sofa',
        category: { name: 'Sofas', slug: 'sofas' },
      }),
      false
    );

    // Benches / Poufs (NOT eligible)
    assert.equal(
      isChairProduct({
        name: 'Flyde Bench',
        slug: 'flyde-bench',
        category: { name: 'Soft Seating', slug: 'soft-seating' },
        subcategory: { name: 'poufs & bench', slug: 'poufs-bench' },
      }),
      false
    );
  });

  await t.test('8. Discounts - Slab Calculations (₹24,999, ₹25,000, ₹30,000, ₹49,999, ₹50,000, ₹60,000)', () => {
    const chairItem = (price) => ({
      name: 'Ergonomic Task Chair',
      sellingPrice: price,
      mrp: price + 5000,
      quantity: 1,
      category: { name: 'Office Chairs', slug: 'office-chairs' },
    });

    // Case 1: ₹24,999 -> 0% discount
    const p24k = calculateCartPricing([chairItem(24999)]);
    assert.equal(p24k.chairSubtotal, 24999);
    assert.equal(p24k.chairDiscountPercentage, 0);
    assert.equal(p24k.chairDiscountAmount, 0);
    assert.equal(p24k.total, 24999);
    assert.match(p24k.progressMessage, /Add ₹1 more in eligible chairs to unlock an additional 5% discount/);

    // Case 2: ₹25,000 qualifies for 5% -> ₹1,250 discount, final ₹23,750
    const p25k = calculateCartPricing([chairItem(25000)]);
    assert.equal(p25k.chairSubtotal, 25000);
    assert.equal(p25k.chairDiscountPercentage, 5);
    assert.equal(p25k.chairDiscountAmount, 1250);
    assert.equal(p25k.finalChairAmount, 23750);
    assert.equal(p25k.total, 23750);
    assert.match(p25k.bannerMessage, /Congratulations! You unlocked an additional 5% discount/);
    assert.match(p25k.progressMessage, /Add ₹25,000 more in eligible chairs to unlock an additional 7% discount/);

    // Case 3: ₹30,000 qualifies for 5% -> ₹1,500 discount, final ₹28,500 (Example from prompt)
    const p30k = calculateCartPricing([chairItem(30000)]);
    assert.equal(p30k.chairSubtotal, 30000);
    assert.equal(p30k.chairDiscountPercentage, 5);
    assert.equal(p30k.chairDiscountAmount, 1500);
    assert.equal(p30k.finalChairAmount, 28500);
    assert.equal(p30k.total, 28500);

    // Case 4: ₹49,999 qualifies for 5% -> ₹2,500 discount (round of 2499.95)
    const p49k = calculateCartPricing([chairItem(49999)]);
    assert.equal(p49k.chairSubtotal, 49999);
    assert.equal(p49k.chairDiscountPercentage, 5);
    assert.equal(p49k.chairDiscountAmount, 2500);
    assert.equal(p49k.total, 47499);

    // Case 5: ₹50,000 qualifies for 7% (REPLACES 5%) -> ₹3,500 discount, final ₹46,500
    const p50k = calculateCartPricing([chairItem(50000)]);
    assert.equal(p50k.chairSubtotal, 50000);
    assert.equal(p50k.chairDiscountPercentage, 7);
    assert.equal(p50k.chairDiscountAmount, 3500);
    assert.equal(p50k.finalChairAmount, 46500);
    assert.equal(p50k.total, 46500);
    assert.match(p50k.bannerMessage, /Congratulations! You unlocked an additional 7% discount/);

    // Case 6: ₹60,000 qualifies for 7% -> ₹4,200 discount, final ₹55,800 (Example from prompt)
    const p60k = calculateCartPricing([chairItem(60000)]);
    assert.equal(p60k.chairSubtotal, 60000);
    assert.equal(p60k.chairDiscountPercentage, 7);
    assert.equal(p60k.chairDiscountAmount, 4200);
    assert.equal(p60k.finalChairAmount, 55800);
    assert.equal(p60k.total, 55800);
  });

  await t.test('9. Discounts - Mixed Cart (Chairs + Sofas/Accessories)', () => {
    const mixedItems = [
      {
        name: 'Executive Ergonomic Chair',
        sellingPrice: 15000,
        mrp: 20000,
        quantity: 2, // Total chairs = ₹30,000 -> qualifies for 5%
        category: { name: 'Office Chairs', slug: 'office-chairs' },
      },
      {
        name: 'Crimson 3-Seater Sofa',
        sellingPrice: 40000,
        mrp: 50000,
        quantity: 1, // Non-chair item
        category: { name: 'Sofas', slug: 'sofas' },
      },
    ];

    const pricing = calculateCartPricing(mixedItems);
    assert.equal(pricing.subtotal, 70000);
    assert.equal(pricing.chairSubtotal, 30000);
    assert.equal(pricing.nonChairSubtotal, 40000);

    // 5% applied ONLY to ₹30,000 chair subtotal = ₹1,500
    assert.equal(pricing.chairDiscountPercentage, 5);
    assert.equal(pricing.chairDiscountAmount, 1500);
    assert.equal(pricing.discount, 1500);
    assert.equal(pricing.finalChairAmount, 28500);

    // Final total = ₹70,000 - ₹1,500 = ₹68,500
    assert.equal(pricing.total, 68500);
  });

  await t.test('10. Discounts - Disabled Offer applies 0% Discount', () => {
    const chairItems = [
      {
        name: 'Executive Chair',
        sellingPrice: 60000,
        mrp: 80000,
        quantity: 1,
        category: { name: 'Office Chairs', slug: 'office-chairs' },
      },
    ];

    const pricing = calculateCartPricing(chairItems, { enabled: false });
    assert.equal(pricing.chairSubtotal, 60000);
    assert.equal(pricing.chairDiscountPercentage, 0);
    assert.equal(pricing.chairDiscountAmount, 0);
    assert.equal(pricing.total, 60000);
  });

  // =========================================================================
  // PART C: END-TO-END HTTP API TESTS
  // =========================================================================

  await connectDB();
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  let adminToken = '';
  let customerToken = '';
  let customerUser = null;
  let seededChair = null;
  let seededSofa = null;

  await t.test('11. HTTP Setup - Admin, Customer, and Catalog Products', async () => {
    // Ensure Admin
    await User.deleteMany({ email: /test-delivery/ });
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
    const adminLoginData = await adminLoginRes.json();
    adminToken = adminLoginData.data.token;

    // Register Customer
    const testEmail = `test-delivery-${Date.now()}@ergocraft.test`;
    const custRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kunal Patil',
        email: testEmail,
        password: 'Password123!',
        phone: '+919876543210',
      }),
    });
    const custData = await custRes.json();
    assert.equal(custRes.status, 201);
    customerToken = custData.data.token;
    customerUser = custData.data.user;

    // Seed Categories
    let chairCat = await Category.findOne({ slug: 'office-chairs' });
    if (!chairCat) {
      chairCat = await Category.create({
        name: 'Office Chairs',
        slug: 'office-chairs',
        sortOrder: 1,
      });
    }

    let sofaCat = await Category.findOne({ slug: 'sofas' });
    if (!sofaCat) {
      sofaCat = await Category.create({
        name: 'Sofas',
        slug: 'sofas',
        sortOrder: 2,
      });
    }

    // Ensure COD is enabled in store settings
    await Setting.findOneAndUpdate(
      { key: 'store_settings' },
      { codEnabled: true, 'deliveryRestrictions.enabled': true, 'chairDiscount.enabled': true },
      { upsert: true }
    );

    // Seed Products
    seededChair = await Product.create({
      name: 'Ergocraft Titanium Mesh Chair',
      slug: `titanium-mesh-chair-${Date.now()}`,
      sku: `EC-CHR-${Date.now()}`,
      category: chairCat._id,
      mrp: 35000,
      sellingPrice: 30000,
      stock: 50,
      status: 'published',
      description: 'High performance ergonomic chair',
    });

    seededSofa = await Product.create({
      name: 'Ergocraft Velvet 3-Seater Sofa',
      slug: `velvet-sofa-${Date.now()}`,
      sku: `EC-SOF-${Date.now()}`,
      category: sofaCat._id,
      mrp: 50000,
      sellingPrice: 40000,
      stock: 20,
      status: 'published',
      description: 'Luxury sofa',
    });
  });

  await t.test('12. HTTP API - Public Delivery Check Endpoint', async () => {
    // Restricted state
    const resRestricted = await fetch(`${baseUrl}/settings/check-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'Uttar Pradesh', postalCode: '201301' }),
    });
    const dataRestricted = await resRestricted.json();
    assert.equal(resRestricted.status, 200);
    assert.equal(dataRestricted.data.serviceable, false);
    assert.equal(
      dataRestricted.data.message,
      'Sorry! ErgoCraft currently does not offer delivery services to your location.'
    );

    // Serviceable state
    const resOk = await fetch(`${baseUrl}/settings/check-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'Maharashtra', postalCode: '400050' }),
    });
    const dataOk = await resOk.json();
    assert.equal(resOk.status, 200);
    assert.equal(dataOk.data.serviceable, true);

    // Mismatched state and PIN
    const resMismatch = await fetch(`${baseUrl}/settings/check-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state: 'Maharashtra', postalCode: '110001' }),
    });
    const dataMismatch = await resMismatch.json();
    assert.equal(resMismatch.status, 200);
    assert.equal(dataMismatch.data.serviceable, false);
    assert.match(dataMismatch.data.message, /does not belong to Maharashtra/i);
  });

  await t.test('13. HTTP API - Address Management (Add, Update, Delete)', async () => {
    // Add address in serviceable state
    const addRes = await fetch(`${baseUrl}/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Kunal Patil',
        phone: '9876543210',
        houseNumber: '402',
        street: 'Linking Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400050',
      }),
    });
    const addData = await addRes.json();
    assert.equal(addRes.status, 201);
    assert.equal(addData.data.serviceable, true);
    assert.equal(addData.data.addresses.length, 1);
    const addressId = addData.data.address._id;

    // Add address in restricted state: allowed to maintain in account, but reports unserviceable
    const addRestrictedRes = await fetch(`${baseUrl}/auth/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        fullName: 'Kunal Relative',
        phone: '9876543210',
        houseNumber: '12',
        street: 'Hazratganj',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        postalCode: '226001',
      }),
    });
    const addRestrictedData = await addRestrictedRes.json();
    assert.equal(addRestrictedRes.status, 201);
    assert.equal(addRestrictedData.data.serviceable, false);
    assert.equal(
      addRestrictedData.message,
      'Sorry! ErgoCraft currently does not offer delivery services to your location.'
    );

    // Delete address
    const delRes = await fetch(`${baseUrl}/auth/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(delRes.status, 200);
  });

  await t.test('14. HTTP API - Order Creation Blocked for Restricted States (COD & Prepaid)', async () => {
    // 1. Attempt COD order to Uttar Pradesh
    const codBlockedRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: seededChair._id, quantity: 1 }],
        paymentMethod: 'cod',
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '9876543210',
          street: 'Sector 62',
          city: 'Noida',
          state: 'Uttar Pradesh',
          postalCode: '201301',
        },
      }),
    });
    const codBlockedData = await codBlockedRes.json();
    assert.equal(codBlockedRes.status, 400);
    assert.equal(
      codBlockedData.message,
      'Sorry! ErgoCraft currently does not offer delivery services to your location.'
    );

    // 2. Attempt Razorpay prepaid order to West Bengal
    const prepaidBlockedRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: seededChair._id, quantity: 1 }],
        paymentMethod: 'razorpay',
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '9876543210',
          street: 'Park Street',
          city: 'Kolkata',
          state: 'West Bengal',
          postalCode: '700001',
        },
      }),
    });
    const prepaidBlockedData = await prepaidBlockedRes.json();
    assert.equal(prepaidBlockedRes.status, 400);
    assert.equal(
      prepaidBlockedData.message,
      'Sorry! ErgoCraft currently does not offer delivery services to your location.'
    );
  });

  await t.test('15. HTTP API - Order Creation Success with Automatic Chair Discount', async () => {
    // Order 2 chairs @ ₹30,000 = ₹60,000 -> qualifies for 7% (₹4,200 discount)
    // Payable = ₹55,800
    const orderRes = await fetch(`${baseUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: seededChair._id, quantity: 2 }],
        paymentMethod: 'cod',
        shippingAddress: {
          fullName: 'Kunal Patil',
          phone: '9876543210',
          street: '402 Highline Residency',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
        },
      }),
    });
    const orderData = await orderRes.json();
    assert.equal(orderRes.status, 201, `Order creation failed: ${orderData.message}`);
    assert.equal(orderData.data.pricing.subtotal, 60000);
    assert.equal(orderData.data.pricing.chairSubtotal, 60000);
    assert.equal(orderData.data.pricing.chairDiscountPercentage, 7);
    assert.equal(orderData.data.pricing.chairDiscountAmount, 4200);
    assert.equal(orderData.data.pricing.total, 55800);

    // Verify stored order in MongoDB
    const savedOrder = await Order.findById(orderData.data.orderId);
    assert.ok(savedOrder);
    assert.equal(savedOrder.pricing.total, 55800);
    assert.equal(savedOrder.pricing.chairDiscountAmount, 4200);
    assert.equal(savedOrder.pricing.chairDiscountPercentage, 7);
    assert.equal(savedOrder.shippingAddress.state, 'Maharashtra');
  });

  await t.test('16. HTTP API - Admin Settings Management & Slabs Validation', async () => {
    // 1. Fetch settings
    const getRes = await fetch(`${baseUrl}/settings`);
    const getData = await getRes.json();
    assert.equal(getRes.status, 200);
    assert.ok(getData.data.deliveryRestrictions);
    assert.ok(getData.data.chairDiscount);

    // 2. Reject invalid discount slabs (e.g. tier 2 threshold <= tier 1 threshold)
    const invalidRes = await fetch(`${baseUrl}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        chairDiscount: {
          tier1Threshold: 30000,
          tier2Threshold: 20000, // Invalid!
        },
      }),
    });
    assert.equal(invalidRes.status, 400);

    // 3. Update delivery restricted states (add a state, remove a state)
    const updateRes = await fetch(`${baseUrl}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        deliveryRestrictions: {
          enabled: true,
          restrictedStates: ['Uttar Pradesh', 'Bihar', 'West Bengal'],
        },
      }),
    });
    const updateData = await updateRes.json();
    assert.equal(updateRes.status, 200);
    assert.equal(updateData.data.deliveryRestrictions.restrictedStates.length, 3);

    // Reset back to standard 16 states
    await fetch(`${baseUrl}/settings`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        deliveryRestrictions: {
          enabled: true,
          restrictedStates: DEFAULT_RESTRICTED_STATES,
        },
        chairDiscount: DEFAULT_CHAIR_DISCOUNT_CONFIG,
      }),
    });
    // Clean up test products and customer user
    if (seededChair?._id) await Product.findByIdAndDelete(seededChair._id);
    if (seededSofa?._id) await Product.findByIdAndDelete(seededSofa._id);
    await User.deleteMany({ email: /test-delivery/ });
  });

  server.close();
  await closeDB();
});
