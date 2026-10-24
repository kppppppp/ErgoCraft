async function searchAllPages() {
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=100&page=${page}`);
    const data = await res.json();
    const products = data.payload?.products || [];
    if (products.length === 0) break;
    for (const p of products) {
      const name = p.name.toLowerCase();
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
        name.includes('training')
      ) {
        console.log(`[p.${page}] ${p.name} -> https://cdn2.zohoecommerce.com${p.images?.[0]?.url || p.image_url}?storefront_domain=www.ergocraft.in`);
      }
    }
  }
}
searchAllPages();
