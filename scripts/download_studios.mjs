import fs from 'fs';
import path from 'path';

const targetDir = 'c:\\Users\\kpkri\\Desktop\\ErgoCraft\\frontend\\public\\images\\categories';

const candidates = [
  {
    name: 'dining-chair-studio.jpg',
    url: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'cafe-chair-studio.jpg',
    url: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=600&auto=format&fit=crop',
  },
  {
    name: 'visitor-conference-chair.jpg',
    url: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=600&auto=format&fit=crop',
  },
];

async function run() {
  for (const c of candidates) {
    try {
      const res = await fetch(c.url);
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer());
        fs.writeFileSync(path.join(targetDir, c.name), buf);
        console.log('Saved:', c.name, buf.length);
      } else {
        console.log('Failed:', c.name, res.status);
      }
    } catch(e) {
      console.log('Error:', c.name, e.message);
    }
  }
}
run();
