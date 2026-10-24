import fs from 'fs';

const singleSeaters = [
  { name: 'texas-1seater.png', url: 'https://cdn2.zohoecommerce.com/product-images/TEXAS_1_SEATER-removebg-preview.png/2633289000000271186/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'zeus-1seater.png', url: 'https://cdn2.zohoecommerce.com/product-images/Screenshot_2025-02-21_172109-removebg-preview.png/2633289000000271090/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'nivea-1seater.png', url: 'https://cdn2.zohoecommerce.com/product-images/NIVEA_1_SEATER-removebg-preview.png/2633289000000260173/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'sunflower-lounge.png', url: 'https://cdn2.zohoecommerce.com/product-images/Catalogue+Cover+%2842%29.png/2633289000000413815/600x600?storefront_domain=www.ergocraft.in' },
];

async function run() {
  for (const s of singleSeaters) {
    try {
      const res = await fetch(s.url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync('frontend/public/images/categories/' + s.name, buf);
        console.log('Saved', s.name, buf.length);
      }
    } catch(e) {
      console.log('Error', s.name, e.message);
    }
  }
}
run();
