async function getNav() {
  const res = await fetch('https://www.ergocraft.in/');
  const html = await res.text();
  const catMatches = [...html.matchAll(/href="(\/categories\/[^"]+)"/g)].map(m => m[1]);
  console.log('Categories:', [...new Set(catMatches)]);
}
getNav();
