import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_canvas_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9227',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9227/json/list');
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

  const catCafeB64 = fs.readFileSync('frontend/public/images/cat-cafe.png').toString('base64');
  const barStoolB64 = fs.readFileSync('frontend/public/hero-img/bar_stool.png').toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      function loadB64(b64) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => reject(new Error('b64 load failed'));
          img.src = 'data:image/png;base64,' + b64;
        });
      }

      // 1. Dining chair crop from cat-cafe.png
      // Chair 4 (tan high back dining chair in center)
      // On 1600x1067 image: x: 770, y: 535, w: 155, h: 280
      const imgD = await loadB64('${catCafeB64}');
      const canvasD = document.createElement('canvas');
      canvasD.width = 400;
      canvasD.height = 400;
      const ctxD = canvasD.getContext('2d');
      ctxD.drawImage(imgD, 770, 535, 155, 280, 120, 35, 160, 330);
      const diningData = canvasD.toDataURL('image/png');

      // 2. Bar stool crop from bar_stool.png (1920x1080)
      // Stool 4 (sleek black bar stool) x: 1180, y: 395, w: 220, h: 420
      const imgS = await loadB64('${barStoolB64}');
      const canvasS = document.createElement('canvas');
      canvasS.width = 400;
      canvasS.height = 400;
      const ctxS = canvasS.getContext('2d');
      ctxS.drawImage(imgS, 1180, 395, 220, 420, 95, 25, 210, 350);
      const stoolData = canvasS.toDataURL('image/png');

      return { diningData, stoolData };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const val = evalRes.result?.value;
  if (val?.diningData && val?.stoolData) {
    const dB64 = val.diningData.replace(/^data:image\/png;base64,/, '');
    const sB64 = val.stoolData.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('frontend/public/images/categories/dining-chair-ergo.png', Buffer.from(dB64, 'base64'));
    fs.writeFileSync('frontend/public/images/categories/cafe-stool-ergo.png', Buffer.from(sB64, 'base64'));
    console.log('Successfully cropped and saved dining-chair-ergo.png and cafe-stool-ergo.png!');
  } else {
    console.error('Failed eval:', evalRes);
  }

  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
