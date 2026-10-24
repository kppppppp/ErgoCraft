import fs from 'fs';
import path from 'path';

const targetDir = 'c:\\Users\\kpkri\\Desktop\\ErgoCraft\\frontend\\public\\images\\categories';

const items = [
  {
    name: 'mesh-chair-polo.png',
    url: 'https://cdn2.zohoecommerce.com/product-images/Polo_High_back-removebg-preview.png/2633289000000128295/600x600?storefront_domain=www.ergocraft.in',
  },
  {
    name: 'visitor-chair.png',
    url: 'https://images.unsplash.com/photo-1580481077195-c9a75d5a7d65?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'dining-chair.png',
    url: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'cafe-chair.png',
    url: 'https://images.unsplash.com/photo-1519947486511-46149fa0a254?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'bar-stool.png',
    url: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=600&auto=format&fit=crop',
  }
];

async function run() {
  for (const item of items) {
    try {
      const res = await fetch(item.url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(path.join(targetDir, item.name), buf);
        console.log('Downloaded:', item.name, buf.length);
      } else {
        console.log('Failed:', item.name, res.status);
      }
    } catch(e) {
      console.log('Error:', item.name, e.message);
    }
  }
}

run();
