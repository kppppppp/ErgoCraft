import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_cut_stool_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9229',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9229/json/list');
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

      // Stool 3: black swivel bar stool with cutout
      // x: 510, y: 400, w: 200, h: 360
      const c = document.createElement('canvas');
      c.width = 320;
      c.height = 360;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 510, 395, 200, 365, 60, 10, 200, 340);
      return c.toDataURL('image/png');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const val = evalRes.result?.value;
  if (val) {
    const b64 = val.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('frontend/public/images/categories/cafe-stool-test.png', Buffer.from(b64, 'base64'));
    console.log('Saved cafe-stool-test.png!');
  }

  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
