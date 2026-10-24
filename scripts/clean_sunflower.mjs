import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const userDataDir = path.join(process.env.TEMP, 'edge_key_sun_' + Date.now());

const edge = spawn(edgePath, [
  '--headless=new',
  '--remote-debugging-port=9232',
  '--user-data-dir=' + userDataDir,
  '--disable-gpu',
  'about:blank'
]);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await sleep(1500);
  const res = await fetch('http://127.0.0.1:9232/json/list');
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

  const sunB64 = fs.readFileSync('frontend/public/images/categories/sunflower-lounge.png').toString('base64');

  const evalRes = await send('Runtime.evaluate', {
    expression: `(async () => {
      const img = new Image();
      await new Promise(r => { img.onload = r; img.src = 'data:image/png;base64,${sunB64}'; });

      const c = document.createElement('canvas');
      c.width = img.width;
      c.height = img.height;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, c.width, c.height);
      const data = imgData.data;

      // Color key the studio background (grey/white with low saturation)
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i+1], b = data[i+2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        // Yellow chair has high red + green, very low blue (b < 100, r > 180, g > 160)
        // Brass legs have gold/brown tones
        // Background has min > 180 and max - min < 25 (neutral grey/white)
        if (min > 175 && (max - min) < 22) {
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
    fs.writeFileSync(
      'frontend/public/images/categories/sunflower-lounge-cutout.png',
      Buffer.from(val.replace(/^data:image\/png;base64,/, ''), 'base64')
    );
    console.log('Saved sunflower-lounge-cutout.png!');
  }

  edge.kill();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  edge.kill();
  process.exit(1);
});
