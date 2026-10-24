import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_crop_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9224',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9224/json/list');
  const targets = await res.json();
  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  function send(method, params = {}) {
    return new Promise((resolve) => {
      const curId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === curId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  await send('Page.enable');
  await send('Page.navigate', { url: 'http://localhost:3000' });
  await sleep(1000);

  // Crop chair 4 (tan dining chair) or chair 6 (wood/leather dining chair) from cat-cafe.png (1600x1067)
  // Chair 4 is around x: 770, y: 530, w: 160, h: 280
  // Chair 6 is around x: 1100, y: 580, w: 200, h: 220
  // Let's create an in-page canvas script to crop and inspect
  const cropResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      function loadImage(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      }

      // 1. Dining chair crop from /images/cat-cafe.png
      const diningImg = await loadImage('/images/cat-cafe.png');
      const canvasD = document.createElement('canvas');
      canvasD.width = 400;
      canvasD.height = 400;
      const ctxD = canvasD.getContext('2d');
      // Crop chair 4 (tan tufted dining chair) x: 775, y: 535, w: 145, h: 275
      // Draw centered in 400x400
      ctxD.drawImage(diningImg, 775, 535, 145, 275, 125, 40, 150, 320);
      const diningData = canvasD.toDataURL('image/png');

      // 2. Bar stool crop from /hero-img/bar_stool.png (1920x1080)
      // Stool 4 (sleek black bar stool) x: 1170, y: 390, w: 230, h: 420
      const stoolImg = await loadImage('/hero-img/bar_stool.png');
      const canvasS = document.createElement('canvas');
      canvasS.width = 400;
      canvasS.height = 400;
      const ctxS = canvasS.getContext('2d');
      ctxS.drawImage(stoolImg, 1170, 390, 230, 420, 100, 30, 200, 350);
      const stoolData = canvasS.toDataURL('image/png');

      return { diningData, stoolData };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const val = cropResult.result?.result?.value || cropResult.result?.value;
  console.log('Got crop value:', Object.keys(val || {}));
  const { diningData, stoolData } = val || {};

  fs.writeFileSync(
    'frontend/public/images/categories/dining-chair-crop.png',
    Buffer.from(diningData.replace(/^data:image\/png;base64,/, ''), 'base64')
  );
  fs.writeFileSync(
    'frontend/public/images/categories/cafe-stool-crop.png',
    Buffer.from(stoolData.replace(/^data:image\/png;base64,/, ''), 'base64')
  );

  console.log('Saved dining-chair-crop.png and cafe-stool-crop.png');
  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
