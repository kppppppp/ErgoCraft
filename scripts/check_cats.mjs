async function checkHtml() {
  const pages = [
    'https://www.ergocraft.in/categories/fixed-chairs/2633289000000089002',
    'https://www.ergocraft.in/categories/training-chairs/2633289000000089006',
    'https://www.ergocraft.in/categories/dining-chairs/2633289000000062019',
    'https://www.ergocraft.in/categories/cafe-chairs/2633289000000062027',
    'https://www.ergocraft.in/categories/bar-stool/2633289000000062023',
    'https://www.ergocraft.in/categories/tandem-seating/2633289000000089010',
  ];

  for (const page of pages) {
    const res = await fetch(page);
    const html = await res.text();
    const imgs = Array.from(html.matchAll(/<img[^>]+(?:src|data-src)="([^"]+)"/gi)).map(m => m[1]);
    console.log(page.split('/')[4], 'Length:', html.length, 'Images count:', imgs.length);
    if (imgs.length > 0) {
      console.log('Sample images:', imgs.slice(0, 3));
    }
  }
}
checkHtml();
