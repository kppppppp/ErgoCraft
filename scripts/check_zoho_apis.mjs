async function checkZohoApis() {
  const res = await fetch('https://www.ergocraft.in/api/v1/products?per_page=50');
  console.log('/api/v1/products:', res.status);
  const res2 = await fetch('https://www.ergocraft.in/search-products-ajax?q=chair');
  console.log('/search-products-ajax:', res2.status);
  const res3 = await fetch('https://www.ergocraft.in/zs-products-api');
  console.log('/zs-products-api:', res3.status);
}
checkZohoApis();
