import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_cut_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9228',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9228/json/list');
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

  const evalRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,${catCafeB64}'; });

      // Crop Chair 4: x: 785, y: 535, w: 130, h: 275
      const c = document.createElement('canvas');
      c.width = 300;
      c.height = 300;
      const ctx = c.getContext('2d');
      // Draw centered
      ctx.drawImage(img, 785, 535, 130, 275, 85, 12, 130, 275);

      // Simple background keying: the studio background is light grey / white
      // and the pedestal at the bottom is light grey
      const imgData = ctx.getImageData(0, 0, 300, 300);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        // If near white / light grey background (r > 215, g > 215, b > 215 and saturation is very low)
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (min > 210 && (max - min) < 25) {
          data[i+3] = 0; // transparent
        }
      }
      ctx.putImageData(imgData, 0, 0);
      return c.toDataURL('image/png');
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  const val = evalRes.result?.value;
  if (val) {
    const b64 = val.replace(/^data:image\/png;base64,/, '');
    fs.writeFileSync('frontend/public/images/categories/dining-chair-cutout.png', Buffer.from(b64, 'base64'));
    console.log('Saved dining-chair-cutout.png!');
  } else {
    console.error('Failed:', evalRes);
  }

  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
