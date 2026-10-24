async function checkSite() {
  try {
    const res = await fetch('https://www.ergocraft.in/');
    const html = await res.text();
    const regex = /<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi;
    let match;
    const links = new Set();
    while ((match = regex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      if (text && text.length > 2 && text.length < 40) {
        links.add(`${text} => ${href}`);
      }
    }
    console.log(Array.from(links).filter(l => !l.includes('Skip to') && !l.includes('Go') && !l.includes('Cookie')));
  } catch(e) {
    console.error(e);
  }
}
checkSite();
