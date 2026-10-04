import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Attach to a locally running headless Chrome CDP port. Expo's ?preview=
// routes render isolated screens with fixture data and never ship in builds.
const baseUrl = process.argv[2] ?? 'http://localhost:8090';
const outputDir = process.argv[3] ?? '/tmp/epp-mobile-previews';
const port = process.argv[4] ?? '9225';
const screens = ['Splash', 'IntroSlides', 'CategoryGrid', 'ContactList', 'ContactDetail', 'Tracker', 'Challenges'];
const viewports = [{ width: 360, height: 800 }, { width: 390, height: 844 }];

const targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
const page = targets.find((target) => target.type === 'page');
if (!page) throw new Error('No Chrome page target is available');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let nextId = 0;
const pending = new Map();
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
});

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, (message) => message.error ? reject(new Error(message.error.message)) : resolve(message.result));
    socket.send(JSON.stringify({ id, method, params }));
  });
}

await mkdir(outputDir, { recursive: true });
await send('Page.enable');
for (const { width, height } of viewports) {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: true });
  for (const screen of screens) {
    const url = `${baseUrl}/?preview=${encodeURIComponent(screen)}`;
    await send('Page.navigate', { url });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const file = path.join(outputDir, `${screen}-${width}x${height}.png`);
    await writeFile(file, Buffer.from(image.data, 'base64'));
    const dom = await send('Runtime.evaluate', { expression: 'document.body.innerText.slice(0, 100)', returnByValue: true });
    process.stdout.write(`${file}\t${JSON.stringify(dom.result.value ?? '')}\n`);
  }
}
socket.close();
