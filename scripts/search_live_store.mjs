async function testSearch(q) {
  const url = 'https://www.ergocraft.in/search-products?q=' + encodeURIComponent(q);
  const res = await fetch(url);
  const text = await res.text();
  const imgs = Array.from(text.matchAll(/https:\/\/cdn2\.zohoecommerce\.com\/product-images\/[^"'\s<>]+\.(?:jpg|jpeg|png|webp)[^"'\s<>]*/gi)).map(m => m[0]);
  console.log(q, 'Status:', res.status, 'Imgs:', imgs.length);
  if (imgs.length > 0) {
    const unique = Array.from(new Set(imgs));
    console.log(unique.slice(0, 4));
  }
}

async function run() {
  await testSearch('visitor');
  await testSearch('cantilever');
  await testSearch('conference');
  await testSearch('cafe');
  await testSearch('stool');
  await testSearch('dining');
}
run();
