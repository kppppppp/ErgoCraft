async function scrapeCategoryProducts() {
  const catUrls = [
    { cat: 'fixed-chairs', url: 'https://www.ergocraft.in/categories/fixed-chairs/2633289000000089002' },
    { cat: 'dining-chairs', url: 'https://www.ergocraft.in/categories/dining-chairs/2633289000000062019' },
    { cat: 'cafe-chairs', url: 'https://www.ergocraft.in/categories/cafe-chairs/2633289000000062027' },
    { cat: 'bar-stool', url: 'https://www.ergocraft.in/categories/bar-stool/2633289000000062023' },
    { cat: 'lounge-chairs', url: 'https://www.ergocraft.in/categories/lounge-chairs/2633289000000062015' },
    { cat: 'leatherette-chairs', url: 'https://www.ergocraft.in/categories/leatherette-chairs/2633289000000049017' },
  ];

  for (const item of catUrls) {
    try {
      const res = await fetch(item.url);
      const html = await res.text();
      // Match all images
      const imgRegex = /https:\/\/cdn2\.zohoecommerce\.com\/product-images\/[^"'\s<>]+(?:\.png|\.jpg|\.jpeg|\.webp)(?:\/[^"'\s<>]+)?/gi;
      const matches = Array.from(new Set(html.match(imgRegex) || []));
      console.log(`=== ${item.cat} === (${matches.length} images)`);
      matches.slice(0, 5).forEach(m => console.log('  ', m));
    } catch (e) {
      console.error('Error fetching', item.cat, e.message);
    }
  }
}

scrapeCategoryProducts();
