import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_cut_stool2_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9230',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9230/json/list');
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

      // Stool 6 (Red metal cafe chair / bar stool on right): x: 1620, y: 410, w: 275, h: 500
      const c = document.createElement('canvas');
      c.width = 400;
      c.height = 400;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 1620, 410, 275, 500, 70, 15, 260, 370);

      // Stool 1 (Red curved swivel stool): x: 305, y: 385, w: 200, h: 420
      const c1 = document.createElement('canvas');
      c1.width = 400;
      c1.height = 400;
      const ctx1 = c1.getContext('2d');
      ctx1.drawImage(img, 305, 385, 200, 420, 100, 20, 200, 360);

      return {
        stool6: c.toDataURL('image/png'),
        stool1: c1.toDataURL('image/png')
      };
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const val = evalRes.result?.value;
  if (val) {
    fs.writeFileSync(
      'frontend/public/images/categories/cafe-chair-red-metal.png',
      Buffer.from(val.stool6.replace(/^data:image\/png;base64,/, ''), 'base64')
    );
    fs.writeFileSync(
      'frontend/public/images/categories/cafe-stool-red-swivel.png',
      Buffer.from(val.stool1.replace(/^data:image\/png;base64,/, ''), 'base64')
    );
    console.log('Saved both!');
  }

  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
