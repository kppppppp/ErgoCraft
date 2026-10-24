async function printPage2And3() {
  for (let page of [2, 3]) {
    const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=50&page_number=${page}`);
    const data = await res.json();
    const products = data.payload?.products || [];
    console.log(`=== PAGE ${page} ===`);
    products.forEach(p => console.log(`  ${p.name} | ${p.images?.[0]?.url}`));
  }
}
printPage2And3();
