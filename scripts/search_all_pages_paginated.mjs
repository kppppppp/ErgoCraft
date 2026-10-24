async function searchAllPages() {
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 10) {
    const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=50&page_number=${page}`);
    const data = await res.json();
    const products = data.payload?.products || [];
    hasMore = data.payload?.pagination?.has_more_page;
    console.log(`Page ${page}: ${products.length} products`);

    for (const p of products) {
      const name = p.name.toLowerCase();
      const img = p.images?.[0]?.url || p.image_url;
      // print interesting ones
      if (
        name.includes('visitor') ||
        name.includes('cantilever') ||
        name.includes('sofa') ||
        name.includes('lounge') ||
        name.includes('cafe') ||
        name.includes('bar') ||
        name.includes('dining') ||
        name.includes('stool') ||
        name.includes('fixed') ||
        name.includes('training') ||
        name.includes('reception') ||
        name.includes('guest') ||
        name.includes('accent') ||
        name.includes('bistro')
      ) {
        console.log(`  MATCH: [${p.name}] -> https://cdn2.zohoecommerce.com${img}?storefront_domain=www.ergocraft.in`);
      }
    }
    page++;
  }
}
searchAllPages();
