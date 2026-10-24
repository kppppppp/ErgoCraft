async function findAllProductImages() {
  const res = await fetch('https://www.ergocraft.in/');
  const html = await res.text();
  const regex = /https:\/\/cdn2\.zohoecommerce\.com\/product-images\/[^"'? ]+\?storefront_domain=www\.ergocraft\.in/gi;
  const matches = new Set(html.match(regex) || []);
  console.log('Found on homepage:', Array.from(matches));

  // Let's also check a few category listing pages
  const catPages = [
    'https://www.ergocraft.in/categories/fixed-chairs/2633289000000089002',
    'https://www.ergocraft.in/categories/training-chairs/2633289000000089006',
    'https://www.ergocraft.in/categories/dining-chairs/2633289000000062019',
    'https://www.ergocraft.in/categories/cafe-chairs/2633289000000062027',
    'https://www.ergocraft.in/categories/bar-stool/2633289000000062023',
    'https://www.ergocraft.in/categories/mesh-high-back-chairs/2633289000000060076',
  ];

  for (const page of catPages) {
    const r = await fetch(page);
    const h = await r.text();
    const m = h.match(regex) || [];
    console.log(page.split('/')[4], Array.from(new Set(m)));
  }
}

findAllProductImages();
