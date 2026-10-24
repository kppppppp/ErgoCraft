async function inspectPayload() {
  const res = await fetch('https://www.ergocraft.in/api/v1/products?per_page=100');
  const data = await res.json();
  console.log('Payload keys:', Object.keys(data.payload || {}));
  const products = data.payload?.products || [];
  console.log('Products count:', products.length);
  products.forEach(p => {
    console.log(`Product: ${p.name} | Cat: ${p.category_name} | Img: ${p.images?.[0]?.url || p.image_url}`);
  });
}
inspectPayload();
