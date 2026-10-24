import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_cut_stool3_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9231',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9231/json/list');
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

  const barStoolB64 = fs.readFileSync('frontend/public/hero-img/bar_stool.png').toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,${barStoolB64}'; });

      // Stool 2 (White modern tulip bar stool): x: 690, y: 390, w: 170, h: 375
      const c2 = document.createElement('canvas');
      c2.width = 400;
      c2.height = 400;
      const ctx2 = c2.getContext('2d');
      ctx2.drawImage(img, 690, 390, 170, 375, 115, 20, 170, 360);

      // Stool 4 (Sleek black padded bar stool): x: 1040, y: 395, w: 175, h: 405
      const c4 = document.createElement('canvas');
      c4.width = 400;
      c4.height = 400;
      const ctx4 = c4.getContext('2d');
      ctx4.drawImage(img, 1040, 395, 175, 405, 115, 15, 175, 370);

      return {
        stool2: c2.toDataURL('image/png'),
        stool4: c4.toDataURL('image/png')
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const val = evalRes.result?.value;
  if (val) {
    fs.writeFileSync(
      'frontend/public/images/categories/cafe-stool-white.png',
      Buffer.from(val.stool2.replace(/^data:image\/png;base64,/, ''), 'base64')
    );
    fs.writeFileSync(
      'frontend/public/images/categories/cafe-stool-black.png',
      Buffer.from(val.stool4.replace(/^data:image\/png;base64,/, ''), 'base64')
    );
    console.log('Saved cafe-stool-white.png and cafe-stool-black.png!');
  }

  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
