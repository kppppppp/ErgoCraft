async function fetchSpecificPages() {
  const urls = [
    { cat: 'fixed-chairs', url: 'https://www.ergocraft.in/categories/fixed-chairs/2633289000000089002' },
    { cat: 'dining-chairs', url: 'https://www.ergocraft.in/categories/dining-chairs/2633289000000062019' },
    { cat: 'cafe-chairs', url: 'https://www.ergocraft.in/categories/cafe-chairs/2633289000000062027' },
    { cat: 'bar-stool', url: 'https://www.ergocraft.in/categories/bar-stool/2633289000000062023' },
  ];

  for (const { cat, url } of urls) {
    const res = await fetch(url);
    const html = await res.text();
    const imgs = [...html.matchAll(/src=["']([^"']+\.(?:png|jpg|jpeg|webp)[^"']*)["']/gi)]
      .map(m => m[1])
      .filter(s => s.includes('cdn2.zohoecommerce.com') && !s.includes('logo') && !s.includes('8c8472'));
    console.log(cat, imgs.slice(0, 5));
  }
}
fetchSpecificPages();
