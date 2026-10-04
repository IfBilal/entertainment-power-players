import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Attach to a locally running headless Chrome CDP port. Expo's ?preview=
// routes render isolated screens with fixture data and never ship in builds.
const baseUrl = process.argv[2] ?? 'http://localhost:8090';
const outputDir = process.argv[3] ?? '/tmp/epp-mobile-previews';
const port = process.argv[4] ?? '9225';
const screens = (process.argv[5] ?? 'Splash,IntroSlides,CategoryGrid,ContactList,ContactDetail,Tracker,Challenges,TrackDetail,ChallengeDetail').split(',');
const state = process.argv[6] ?? 'normal';
const dataset = process.argv[7] ?? 'normal';
const onlyViewport = process.argv[8];
const nextClicks = Number(process.argv[9] ?? 0);
const minChartWidth = Number(process.argv[10] ?? 0);
const viewports = (onlyViewport ? [onlyViewport] : ['360x800', '390x844']).map((viewport) => {
  const [width, height] = viewport.split('x').map(Number);
  return { width, height };
});

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
    const url = `${baseUrl}/?preview=${encodeURIComponent(screen)}${state === 'normal' ? '' : `&state=${encodeURIComponent(state)}`}${dataset === 'normal' ? '' : `&dataset=${encodeURIComponent(dataset)}`}`;
    await send('Page.navigate', { url });
    await new Promise((resolve) => setTimeout(resolve, 3000));
    for (let click = 0; click < nextClicks; click += 1) {
      const result = await send('Runtime.evaluate', { expression: "Array.from(document.querySelectorAll('[role=button]')).find((element) => element.textContent?.trim() === 'Next')?.click()", returnByValue: true });
      if (result.exceptionDetails) throw new Error('Could not advance onboarding');
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
    if (minChartWidth > 0) {
      const metric = await send('Runtime.evaluate', { expression: "({ title: document.body.innerText.includes('Track Your'), chartWidth: document.querySelector('svg[viewBox=\"0 0 300 150\"]')?.getBoundingClientRect().width ?? 0 })", returnByValue: true });
      const value = metric.result.value;
      process.stdout.write(`onboarding-layout\t${JSON.stringify(value)}\n`);
      if (!value.title || value.chartWidth < minChartWidth) throw new Error(`Track Your Progress chart width ${value.chartWidth}px, expected at least ${minChartWidth}px`);
    }
    const image = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    const file = path.join(outputDir, `${screen}-${width}x${height}.png`);
    await writeFile(file, Buffer.from(image.data, 'base64'));
    const dom = await send('Runtime.evaluate', { expression: 'document.body.innerText.slice(0, 100)', returnByValue: true });
    process.stdout.write(`${file}\t${JSON.stringify(dom.result.value ?? '')}\n`);
  }
}
socket.close();
