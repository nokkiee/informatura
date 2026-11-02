'use strict';
// Draws the repository's social preview (the card shown when a link to the repo is shared):
// docs/social-preview.png, 1280×640. Upload it in GitHub: Settings → General → Social preview.
//   npx electron scripts/make-social-preview.js
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');

const root = path.join(__dirname, '..');
const url = (p) => pathToFileURL(path.join(root, p)).href;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1280px; height: 640px; overflow: hidden; background: #0c0e11; color: #e7e9ec;
    font-family: Inter, system-ui, 'Segoe UI', Ubuntu, Cantarell, 'Noto Sans', sans-serif; }
  .card { position: absolute; inset: 0; padding: 72px 0 0 80px; }
  .logo { width: 104px; height: 104px; }
  h1 { font-size: 76px; font-weight: 700; letter-spacing: -0.03em; margin-top: 26px; }
  p { font-size: 27px; line-height: 1.35; color: #8a919b; margin-top: 14px; width: 560px; }
  .pills { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 30px; width: 600px; }
  .pill { font-size: 18px; padding: 6px 13px; border-radius: 10px; background: #1f2329; color: #d4d8dd; }
  .pill b { color: #2fd3a0; font-weight: 600; }
  .shot { position: absolute; left: 730px; top: 92px; width: 760px; border-radius: 16px;
    border: 1px solid #2c3138; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); }
  .fade { position: absolute; left: 670px; top: 0; width: 120px; height: 640px;
    background: linear-gradient(90deg, #0c0e11, rgba(12, 14, 17, 0)); }
</style></head><body>
  <img class="shot" src="${url('docs/screenshots/ui-4-program.png')}">
  <div class="fade"></div>
  <div class="card">
    <img class="logo" src="${url('build/icon.svg')}">
    <h1>Informatura</h1>
    <p>Matura z informatyki na prawdziwych arkuszach CKE – zadania, podpowiedzi i lekcje.</p>
    <div class="pills">
      <span class="pill"><b>175</b> zadań</span>
      <span class="pill"><b>32</b> lekcje</span>
      <span class="pill">Python · C++ · Java</span>
      <span class="pill">SQL</span>
      <span class="pill">arkusz</span>
    </div>
  </div>
</body></html>`;

app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.whenReady().then(async () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'informatura-social-')), 'card.html');
  fs.writeFileSync(file, html);
  const win = new BrowserWindow({ width: 1280, height: 640, show: false, useContentSize: true, webPreferences: { offscreen: true } });
  await win.loadFile(file);
  await new Promise((r) => setTimeout(r, 800)); // images decoded and painted
  const image = await win.webContents.capturePage({ x: 0, y: 0, width: 1280, height: 640 });
  const out = path.join(root, 'docs', 'social-preview.png');
  fs.writeFileSync(out, image.toPNG());
  console.log('written', out, image.getSize());
  app.quit();
});
