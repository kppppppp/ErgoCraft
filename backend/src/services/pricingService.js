// Shared pricing and automatic chair discount service for ErgoCraft

export const DEFAULT_CHAIR_DISCOUNT_CONFIG = {
  enabled: true,
  tier1Threshold: 25000,
  tier1Percentage: 5,
  tier2Threshold: 50000,
  tier2Percentage: 7,
};

/**
 * Checks whether a given product qualifies as an eligible chair product.
 *
 * @param {object} product - Mongoose Product document or object with category, name, slug
 * @param {Map<string, object>} [categoriesMap] - Optional map of categoryId -> Category document
 */
export const isChairProduct = (product, categoriesMap = null) => {
  if (!product) return false;

  const name = String(product.name || '').toLowerCase();
  const slug = String(product.slug || '').toLowerCase();

  // Explicit non-chairs (sofas, benches, poufs, tables, accessories)
  if (
    name.includes('sofa') ||
    slug.includes('sofa') ||
    name.includes('bench') ||
    slug.includes('bench') ||
    name.includes('pouf') ||
    slug.includes('pouf') ||
    name.includes('table') ||
    slug.includes('table')
  ) {
    return false;
  }

  // Helper to extract slug & name from category reference (populated object or ID lookup)
  const extractCatInfo = (catRef) => {
    if (!catRef) return { slug: '', name: '' };
    if (typeof catRef === 'object' && catRef.name && catRef.slug) {
      return {
        slug: String(catRef.slug || '').toLowerCase(),
        name: String(catRef.name || '').toLowerCase(),
      };
    }
    const catId = String(catRef._id || catRef);
    if (categoriesMap && categoriesMap.has(catId)) {
      const found = categoriesMap.get(catId);
      return {
        slug: String(found.slug || '').toLowerCase(),
        name: String(found.name || '').toLowerCase(),
      };
    }
    return { slug: '', name: '' };
  };

  const cat = extractCatInfo(product.category);
  const subcat = extractCatInfo(product.subcategory);
  const classification = extractCatInfo(product.classification);

  // Check top-level category
  if (cat.slug === 'office-chairs' || cat.name.includes('chair')) {
    return true;
  }

  // Check subcategory
  const chairSubcats = [
    'leatherette-chairs',
    'mesh-chairs',
    'workstation-chairs',
    'lounge-chairs',
    'dining-chairs',
    'cafe-chairs',
  ];
  if (
    chairSubcats.includes(subcat.slug) ||
    subcat.name.includes('chair') ||
    subcat.slug.includes('chair')
  ) {
    return true;
  }

  // Check classification
  if (classification.name.includes('chair') || classification.slug.includes('chair')) {
    return true;
  }

  // If product name or slug explicitly has 'chair'
  if (name.includes('chair') || slug.includes('chair')) {
    return true;
  }

  return false;
};

/**
 * Calculates pricing, eligible chair discounts, and breakdown.
 *
 * @param {Array} items - List of items with { product: ProductDoc, quantity: number } or similar
 * @param {object} [discountConfig] - Store settings discount configuration
 */
export const calculateCartPricing = (items = [], discountConfig = {}) => {
  const config = {
    enabled: discountConfig.enabled !== false,
    tier1Threshold: Number(discountConfig.tier1Threshold) || DEFAULT_CHAIR_DISCOUNT_CONFIG.tier1Threshold,
    tier1Percentage: Number(discountConfig.tier1Percentage) || DEFAULT_CHAIR_DISCOUNT_CONFIG.tier1Percentage,
    tier2Threshold: Number(discountConfig.tier2Threshold) || DEFAULT_CHAIR_DISCOUNT_CONFIG.tier2Threshold,
    tier2Percentage: Number(discountConfig.tier2Percentage) || DEFAULT_CHAIR_DISCOUNT_CONFIG.tier2Percentage,
  };

  let subtotal = 0;
  let chairSubtotal = 0;
  let nonChairSubtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const product = item.product || item;
    const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
    const unitPrice = Number(product.sellingPrice ?? item.unitPrice ?? 0);
    const mrp = Number(product.mrp ?? item.mrp ?? unitPrice);
    const itemSubtotal = unitPrice * quantity;

    const isChair = isChairProduct(product);

    if (isChair) {
      chairSubtotal += itemSubtotal;
    } else {
      nonChairSubtotal += itemSubtotal;
    }

    subtotal += itemSubtotal;

    processedItems.push({
      productId: product._id ? String(product._id) : String(product.productId || ''),
      name: product.name,
      sku: product.sku,
      unitPrice,
      mrp,
      quantity,
      subtotal: itemSubtotal,
      isChair,
    });
  }

  // Calculate discount tier on chairSubtotal
  let chairDiscountPercentage = 0;
  let chairDiscountAmount = 0;
  let bannerMessage = '';
  let progressMessage = '';

  if (config.enabled && chairSubtotal > 0) {
    if (chairSubtotal >= config.tier2Threshold) {
      chairDiscountPercentage = config.tier2Percentage;
      chairDiscountAmount = Math.round(chairSubtotal * (chairDiscountPercentage / 100));
      bannerMessage = `Congratulations! You unlocked an additional ${chairDiscountPercentage}% discount on your chair purchase.`;
    } else if (chairSubtotal >= config.tier1Threshold) {
      chairDiscountPercentage = config.tier1Percentage;
      chairDiscountAmount = Math.round(chairSubtotal * (chairDiscountPercentage / 100));
      bannerMessage = `Congratulations! You unlocked an additional ${chairDiscountPercentage}% discount on your chair purchase.`;
      const neededForTier2 = config.tier2Threshold - chairSubtotal;
      progressMessage = `Add ₹${neededForTier2.toLocaleString('en-IN')} more in eligible chairs to unlock an additional ${config.tier2Percentage}% discount.`;
    } else {
      const neededForTier1 = config.tier1Threshold - chairSubtotal;
      progressMessage = `Add ₹${neededForTier1.toLocaleString('en-IN')} more in eligible chairs to unlock an additional ${config.tier1Percentage}% discount.`;
    }
  }

  const discount = chairDiscountAmount;
  const shippingCharges = 0; // Pan-India free delivery
  const tax = 0; // Inclusive of GST
  const finalChairAmount = chairSubtotal - chairDiscountAmount;
  const total = subtotal - discount;

  return {
    subtotal,
    chairSubtotal,
    nonChairSubtotal,
    chairDiscountPercentage,
    chairDiscountAmount,
    finalChairAmount,
    discount,
    shippingCharges,
    tax,
    total,
    items: processedItems,
    config,
    bannerMessage,
    progressMessage,
  };
};
