async function checkAll205Products() {
  let all = [];
  for (let page = 1; page <= 5; page++) {
    const res = await fetch(`https://www.ergocraft.in/api/v1/products?per_page=50&page_number=${page}`);
    const data = await res.json();
    const products = data.payload?.products || [];
    all.push(...products);
  }
  console.log('Total products on live store:', all.length);
  // Group by terms
  const keywords = ['chair', 'sofa', 'lounge', 'recline', 'bench', 'desk', 'table'];
  keywords.forEach(k => {
    const count = all.filter(p => p.name.toLowerCase().includes(k)).length;
    console.log(`Keyword "${k}": ${count} products`);
  });

  // Find any chair that does not say "High Back" or "Medium Back"
  const others = all.filter(p => {
    const n = p.name.toLowerCase();
    return !n.includes('high back') && !n.includes('medium back') && !n.includes('sofa') && !n.includes('lounge');
  });
  console.log('Other products count:', others.length);
  others.forEach(p => console.log('  ', p.name, '->', p.images?.[0]?.url));
}
checkAll205Products();
