async function listAllNames() {
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=100&page=${page}`);
    const data = await res.json();
    const products = data.payload?.products || [];
    console.log(`Page ${page}: ${products.length} products`);
    if (products.length === 0) break;
    products.forEach(p => console.log(`  ${p.name} | ${p.images?.[0]?.url}`));
  }
}
listAllNames();
