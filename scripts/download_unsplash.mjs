import fs from 'fs';

const unsplashImages = [
  { name: 'dining-chair-sienna.jpg', url: 'https://images.unsplash.com/photo-1503602642458-232111445657?q=80&w=800&auto=format&fit=crop' },
  { name: 'cafe-chair-aria.jpg', url: 'https://images.unsplash.com/photo-1519947486513-ce62b9f0b160?q=80&w=800&auto=format&fit=crop' },
  { name: 'lounge-chair-velvet.jpg', url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop' },
];

async function downloadUnsplash() {
  for (const item of unsplashImages) {
    const res = await fetch(item.url);
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync('frontend/public/images/categories/' + item.name, buf);
      console.log('Saved', item.name, buf.length, 'bytes');
    }
  }
}
downloadUnsplash();
