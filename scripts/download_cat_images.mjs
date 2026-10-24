import fs from 'fs';
import path from 'path';

const targetDir = 'c:\\Users\\kpkri\\Desktop\\ErgoCraft\\frontend\\public\\images\\categories';
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const imagesToDownload = [
  {
    name: 'leatherette-chairs.jpg',
    url: 'https://cdn2.zohoecommerce.com/product-images/WhatsApp+Image+2025-01-25+at+16.40.39.jpeg/2633289000000037045/600x600?storefront_domain=www.ergocraft.in',
  },
  {
    name: 'workstation-chairs.png',
    url: 'https://cdn2.zohoecommerce.com/product-images/Screenshot_2025-01-22_184040-removebg-preview.png/2633289000000081044/600x600?storefront_domain=www.ergocraft.in',
  },
  {
    name: 'mesh-chair-zee.jpg',
    url: 'https://cdn2.zohoecommerce.com/product-images/ZEE.jpg/2633289000000065055/600x600?storefront_domain=www.ergocraft.in',
  },
  {
    name: 'sofa-daylen.webp',
    url: 'https://cdn2.zohoecommerce.com/Daylen-85.83-Leather-Sofa.webp?v=1750761072&storefront_domain=www.ergocraft.in',
  },
  {
    name: 'lounge-chair.png',
    url: 'https://cdn2.zohoecommerce.com/product-images/Catalogue+Cover+%2824%29.png/2633289000000413143/600x600?storefront_domain=www.ergocraft.in',
  },
  {
    name: 'smart-mb.jpg',
    url: 'https://cdn2.zohoecommerce.com/SMART%20MB.jpg?v=1771225752&storefront_domain=www.ergocraft.in',
  },
];

async function download() {
  for (const item of imagesToDownload) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) {
        console.error('Failed to fetch', item.name, res.status);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const dest = path.join(targetDir, item.name);
      fs.writeFileSync(dest, buffer);
      console.log('Saved:', item.name, buffer.length, 'bytes');
    } catch(e) {
      console.error('Error downloading', item.name, e.message);
    }
  }
}

download();
