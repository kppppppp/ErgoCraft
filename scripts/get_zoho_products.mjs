async function getZohoProducts() {
  const res = await fetch('https://www.ergocraft.in/api/v1/products?per_page=100');
  const data = await res.json();
  console.log('Total products:', data.products ? data.products.length : Object.keys(data));
  if (data.products) {
    data.products.forEach(p => {
      console.log(`[${p.category_name || p.category_id}] ${p.name} -> ${p.images ? p.images[0]?.url : 'no-img'}`);
    });
  }
}
getZohoProducts();
