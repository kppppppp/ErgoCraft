import fs from 'fs';
import path from 'path';

async function downloadRecliner() {
  const url = 'https://cdn2.zohoecommerce.com/product-images/rover+side.png/2633289000000402103/600x600?storefront_domain=www.ergocraft.in';
  const res = await fetch(url);
  if (res.ok) {
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync('frontend/public/images/categories/recliner.png', buf);
    console.log('Saved recliner.png:', buf.length, 'bytes');
  } else {
    console.log('Failed:', res.status);
  }
}
downloadRecliner();
