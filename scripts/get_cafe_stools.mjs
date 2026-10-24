async function getCafeStools() {
  const pages = [
    'https://www.ergocraft.in/categories/bar-stool/2633289000000062023',
    'https://www.ergocraft.in/categories/cafe-chairs/2633289000000062027',
    'https://www.ergocraft.in/categories/fixed-chairs/2633289000000089002',
    'https://www.ergocraft.in/categories/dining-chairs/2633289000000062019',
  ];

  for (const p of pages) {
    const res = await fetch(p);
    const text = await res.text();
    console.log('=== PAGE:', p.split('/')[4]);
    // print all img elements
    const matches = text.match(/<img[^>]+>/gi) || [];
    for (const m of matches) {
      if (m.includes('product') || m.includes('Extract') || m.includes('Catalogue') || m.includes('jpg') || m.includes('png') || m.includes('webp')) {
        console.log(m);
      }
    }
  }
}
getCafeStools();
