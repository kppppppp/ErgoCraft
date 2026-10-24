import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_cdp_cat_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
  }

  async ready() {
    if (this.ws.readyState === WebSocket.OPEN) return;
    return new Promise((resolve) => {
      this.ws.onopen = resolve;
    });
  }

  send(method, params = {}) {
    const id = this.id++;
    return new Promise((resolve, reject) => {
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

async function run() {
  await sleep(1500);

  const versionRes = await fetch('http://127.0.0.1:9222/json/list');
  const targets = await versionRes.json();
  const pageTarget = targets.find(t => t.type === 'page');

  if (!pageTarget) {
    console.error('No page target found');
    edge.kill();
    return;
  }

  console.log('Connecting to target:', pageTarget.webSocketDebuggerUrl);
  const client = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await client.ready();

  await client.send('Page.enable');
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  await client.send('Network.enable');

  const failedRequests = [];
  client.ws.addEventListener('message', (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Network.responseReceived') {
      const { response } = msg.params;
      if (response.status >= 400) {
        failedRequests.push({ url: response.url, status: response.status });
      }
    }
  });

  const outDir = path.resolve('verification-screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Desktop 1440x900
  console.log('--- Testing Desktop 1440x900 ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await client.send('Page.navigate', { url: 'http://localhost:3000' });
  await sleep(3000);

  // Evaluate metrics and element coordinates
  const metrics = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const hero = document.getElementById('hero-slider');
      const catSection = document.getElementById('shop-by-category');
      const heroRect = hero ? hero.getBoundingClientRect() : null;
      const catRect = catSection ? catSection.getBoundingClientRect() : null;
      const header = document.querySelector('header');
      const headerRect = header ? header.getBoundingClientRect() : null;
      
      const categoryLinks = Array.from(document.querySelectorAll('#shop-by-category a')).map(a => ({
        href: a.getAttribute('href'),
        label: a.querySelector('span')?.textContent?.trim() || a.textContent.trim(),
        img: a.querySelector('img')?.src || null,
        circleWidth: a.querySelector('.rounded-full')?.getBoundingClientRect().width,
        circleHeight: a.querySelector('.rounded-full')?.getBoundingClientRect().height,
      }));

      return {
        viewportHeight: window.innerHeight,
        headerHeight: headerRect ? headerRect.height : null,
        heroHeight: heroRect ? heroRect.height : null,
        heroBottom: heroRect ? heroRect.bottom : null,
        catTop: catRect ? catRect.top : null,
        catBottom: catRect ? catRect.bottom : null,
        catHeight: catRect ? catRect.height : null,
        visibleCatHeightAboveFold: catRect ? Math.max(0, window.innerHeight - catRect.top) : null,
        categoryLinks
      };
    })()`,
    returnByValue: true
  });

  console.log('Desktop 1440x900 Metrics:', JSON.stringify(metrics.result.value, null, 2));

  // Take full viewport screenshot
  const desktopShot = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1440, height: 900, scale: 1 }
  });
  fs.writeFileSync(path.join(outDir, 'shop_by_category_desktop_1440x900.png'), Buffer.from(desktopShot.data, 'base64'));
  console.log('Saved shop_by_category_desktop_1440x900.png');

  // Take dedicated section screenshot
  const sectionMetrics = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const catSection = document.getElementById('shop-by-category');
      const rect = catSection.getBoundingClientRect();
      return { x: rect.x, y: window.scrollY + rect.y, width: rect.width, height: rect.height };
    })()`,
    returnByValue: true
  });
  const sec = sectionMetrics.result.value;
  const sectionShot = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: Math.max(0, sec.x), y: sec.y, width: 1440, height: sec.height, scale: 1 }
  });
  fs.writeFileSync(path.join(outDir, 'shop_by_category_section_detail.png'), Buffer.from(sectionShot.data, 'base64'));
  console.log('Saved shop_by_category_section_detail.png');

  // 2. Tablet 1024x768
  console.log('--- Testing Tablet 1024x768 ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
    mobile: false
  });
  await sleep(1000);
  const tabletShot = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 1024, height: 768, scale: 1 }
  });
  fs.writeFileSync(path.join(outDir, 'shop_by_category_tablet_1024x768.png'), Buffer.from(tabletShot.data, 'base64'));
  console.log('Saved shop_by_category_tablet_1024x768.png');

  // 3. Mobile 390x844
  console.log('--- Testing Mobile 390x844 ---');
  await client.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });
  await sleep(1000);

  const mobileMetrics = await client.send('Runtime.evaluate', {
    expression: `(() => {
      const catSection = document.getElementById('shop-by-category');
      const rect = catSection.getBoundingClientRect();
      const scrollContainer = catSection.querySelector('.overflow-x-auto');
      return {
        bodyScrollWidth: document.body.scrollWidth,
        windowInnerWidth: window.innerWidth,
        hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth,
        catScrollWidth: scrollContainer ? scrollContainer.scrollWidth : null,
        catClientWidth: scrollContainer ? scrollContainer.clientWidth : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Mobile Metrics:', JSON.stringify(mobileMetrics.result.value, null, 2));

  const mobileShot = await client.send('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width: 390, height: 844, scale: 2 }
  });
  fs.writeFileSync(path.join(outDir, 'shop_by_category_mobile_390x844.png'), Buffer.from(mobileShot.data, 'base64'));
  console.log('Saved shop_by_category_mobile_390x844.png');

  console.log('Failed Requests:', failedRequests);

  edge.kill();
  process.exit(0);
}

run().catch(err => {
  console.error('Test run error:', err);
  edge.kill();
  process.exit(1);
});
