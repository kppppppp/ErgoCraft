async function printPage1() {
  const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=50&page_number=1`);
  const data = await res.json();
  const products = data.payload?.products || [];
  console.log(`=== PAGE 1 ===`);
  products.forEach(p => console.log(`  ${p.name} | ${p.images?.[0]?.url}`));
}
printPage1();
