async function inspectProductPages() {
  const pages = [
    'https://www.ergocraft.in/categories/leatherette-chairs/2633289000000049017',
    'https://www.ergocraft.in/categories/mesh-executive-chairs/2633289000000060020',
    'https://www.ergocraft.in/categories/workstation-chairs/2633289000000046005',
    'https://www.ergocraft.in/categories/fixed-chairs/2633289000000089002',
    'https://www.ergocraft.in/categories/sofa/2633289000000062007',
    'https://www.ergocraft.in/categories/lounge-chairs/2633289000000062015',
    'https://www.ergocraft.in/categories/dining-chairs/2633289000000062019',
    'https://www.ergocraft.in/categories/cafe-chairs/2633289000000062027',
  ];

  for (const url of pages) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const catName = url.split('/')[4];
      const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
        .map(m => m[1])
        .filter(src => src.includes('cdn2.zohoecommerce.com') && !src.includes('logo') && !src.includes('-1-'));
      console.log(`=== ${catName} ===`);
      console.log(imgMatches.slice(0, 3));
    } catch(e) {
      console.error(e.message);
    }
  }
}
inspectProductPages();
