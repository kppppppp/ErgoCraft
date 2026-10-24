async function checkImages() {
  const res = await fetch('https://www.ergocraft.in/');
  const html = await res.text();
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi;
  let m;
  const imgs = [];
  while ((m = imgRegex.exec(html)) !== null) {
    imgs.push({ src: m[1], alt: m[2] });
  }
  console.log(imgs.filter(i => !i.src.includes('svg') && !i.src.includes('logo')));
}
checkImages();
