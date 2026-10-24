async function findCutouts() {
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=50&page_number=${page}`);
    const data = await res.json();
    const products = data.payload?.products || [];
    for (const p of products) {
      const img = p.images?.[0]?.url || p.image_url || '';
      if (img.includes('removebg') || img.includes('.png')) {
        console.log(`[p.${page}] ${p.name} -> https://cdn2.zohoecommerce.com${img}?storefront_domain=www.ergocraft.in`);
      }
    }
  }
}
findCutouts();
