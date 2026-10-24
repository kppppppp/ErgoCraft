import fs from 'fs';

const items = [
  { name: 'leno-grey-mb.png', url: 'https://cdn2.zohoecommerce.com/product-images/Screenshot_2025-01-26_220012-removebg-preview+%281%29.png/2633289000000081618/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'oscar-mb.png', url: 'https://cdn2.zohoecommerce.com/product-images/Catalogue+Cover+-+2026-04-10T114357.640.png/2633289000000480149/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'woodland-sofa.png', url: 'https://cdn2.zohoecommerce.com/product-images/Screenshot_2025-02-21_140209-removebg-preview.png/2633289000000244439/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'stokes-sofa.png', url: 'https://cdn2.zohoecommerce.com/product-images/Screenshot_2025-10-29_135156-removebg-preview.png/2633289000000244227/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'doux-lounge.png', url: 'https://cdn2.zohoecommerce.com/product-images/Catalogue+Cover+%2826%29.png/2633289000000413271/600x600?storefront_domain=www.ergocraft.in' },
  { name: 'stanley-hb-grey.png', url: 'https://cdn2.zohoecommerce.com/product-images/Extract+Images+%282%29.png/2633289000000107046/600x600?storefront_domain=www.ergocraft.in' },
];

async function run() {
  for (const item of items) {
    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync('frontend/public/images/categories/' + item.name, buf);
        console.log('Saved', item.name, buf.length, 'bytes');
      }
    } catch(e) {
      console.error('Error', item.name, e.message);
    }
  }
}
run();
