'use strict';

const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, protocol, Menu, shell, net, ipcMain } = require('electron');
const { pathToFileURL } = require('url');
const runner = require('./src/runner');
const store = require('./src/store');

app.setName('MaturaLab');
app.setDesktopName('maturalab.desktop'); // lets GNOME/KDE match the window to its launcher and icon on Wayland
if (process.env.MATURALAB_DATA_DIR) app.setPath('userData', process.env.MATURALAB_DATA_DIR);
if (process.platform === 'linux') app.commandLine.appendSwitch('ozone-platform-hint', 'auto');
if (process.platform === 'win32') app.setAppUserModelId('app.maturalab');
const DEV = !!process.env.MATURALAB_DEV || process.argv.includes('--dev');

// The renderer is served from maturalab://app/ so ES modules, fetch(), WebAssembly and
// web workers all behave as on a normal (secure) web origin.
protocol.registerSchemesAsPrivileged([
  { scheme: 'maturalab', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true } },
]);

const ROOT = __dirname;
const RENDERER = path.join(ROOT, 'renderer');
const CONTENT = path.join(ROOT, 'content');
const MODULES = path.join(ROOT, 'node_modules');
// URL prefix -> folder. Third-party libraries are served straight from node_modules.
const MOUNTS = [
  ['/content/', CONTENT],
  ['/vendor/monaco/', path.join(MODULES, 'monaco-editor', 'min')],
  ['/vendor/sqljs/', path.join(MODULES, 'sql.js', 'dist')],
  ['/vendor/hyperformula/', path.join(MODULES, 'hyperformula', 'dist')],
  ['/vendor/marked/', path.join(MODULES, 'marked', 'lib')],
  ['/vendor/chartjs/', path.join(MODULES, 'chart.js', 'dist')],
  ['/', RENDERER],
];
const BG = '#14171c';
let win = null;

function inside(base, target) {
  const rel = path.relative(base, target);
  return !!rel && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function resolveUrlPath(pathname) {
  const p = decodeURIComponent(pathname === '/' ? '/index.html' : pathname);
  for (const [prefix, dir] of MOUNTS) {
    if (p.startsWith(prefix)) {
      const file = path.join(dir, p.slice(prefix.length));
      return inside(dir, file) ? file : null;
    }
  }
  return null;
}

function serve(request) {
  const file = resolveUrlPath(new URL(request.url).pathname);
  if (!file) return new Response('Not found', { status: 404 });
  return net.fetch(pathToFileURL(file).toString());
}

// ---- window size memory ---------------------------------------------------------------

const stateFile = () => path.join(app.getPath('userData'), 'window-state.json');

function loadBounds() {
  try {
    return JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
  } catch {
    return { width: 1440, height: 900 };
  }
}

function saveBounds() {
  if (!win || win.isDestroyed()) return;
  const state = { ...win.getNormalBounds(), maximized: win.isMaximized() };
  try {
    fs.writeFileSync(stateFile(), JSON.stringify(state));
  } catch {
    // Not worth bothering the user about.
  }
}

// ---- window ------------------------------------------------------------------------------

function createWindow() {
  const bounds = loadBounds();
  win = new BrowserWindow({
    ...bounds,
    minWidth: 1100,
    minHeight: 680,
    backgroundColor: BG,
    title: 'MaturaLab',
    icon: path.join(ROOT, 'build', 'icon.png'),
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(ROOT, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      backgroundThrottling: !process.env.MATURALAB_HIDDEN,
    },
  });
  if (bounds.maximized) win.maximize();
  win.once('ready-to-show', () => !process.env.MATURALAB_HIDDEN && win.show());
  win.on('close', saveBounds);
  win.on('closed', () => {
    win = null;
    runner.killAll();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('maturalab://')) e.preventDefault();
  });
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type !== 'keyDown') return;
    if ((DEV && input.key === 'F12') || (input.control && input.shift && input.key.toLowerCase() === 'i' && DEV)) {
      win.webContents.toggleDevTools();
    }
    if (input.control && !input.shift && !input.alt && ['=', '+', '-', '0'].includes(input.key)) {
      const z = win.webContents.getZoomLevel();
      win.webContents.setZoomLevel(input.key === '0' ? 0 : Math.max(-3, Math.min(4, z + (input.key === '-' ? -0.5 : 0.5))));
      e.preventDefault();
    }
  });

  win.loadURL('maturalab://app/index.html');
  if (process.env.MATURALAB_SELFTEST) selfTest(win);
}

// MATURALAB_SELFTEST=1: quick smoke test of a (packaged) build – opens a task of each
// kind, prints the result and quits with a matching exit code.
async function selfTest(w) {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const js = (code) => w.webContents.executeJavaScript(code, true);
  const until = async (code, ms = 20000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      try {
        if (await js(code)) return true;
      } catch {}
      await wait(200);
    }
    return false;
  };
  const result = {};
  result.home = await until(`!document.body.classList.contains('loading') && !!document.querySelector('.hero')`);
  await js(`location.hash = '#/t/2023-maj/2.2?from=exam'`);
  result.code = await until(`!!window.monaco && window.monaco.editor.getEditors().length > 0`);
  await js(`location.hash = '#/t/2023-maj/7.1?from=exam'`);
  result.sql = await until(`document.querySelectorAll('.sql-side .tbl-item').length === 3`);
  await js(`location.hash = '#/t/2023-maj/6.2?from=exam'`);
  result.sheet = await until(`!!document.querySelector('.grid-canvas') && document.querySelector('.fx-input')?.value === 'data'`);
  try {
    openPdf('pdf/informatyka-2023-maj-matura-rozszerzona.pdf', 3);
    await wait(1500);
    result.pdf = BrowserWindow.getAllWindows().length === 2;
  } catch (e) {
    result.pdf = String(e.message);
  }
  result.toolchains = await runner.detect();
  const ok = ['home', 'code', 'sql', 'sheet', 'pdf'].every((k) => result[k] === true);
  console.log('SELFTEST ' + (ok ? 'OK ' : 'FAILED ') + JSON.stringify(result));
  app.exit(ok ? 0 : 1);
}

// Original exam sheets open in their own window, in Chromium's PDF viewer.
const pdfWindows = new Map();
function openPdf(rel, page) {
  let file = resolveUrlPath('/content/' + rel);
  // Chromium's PDF viewer can't read inside app.asar; the PDFs are unpacked next to it.
  if (file && file.includes(`app.asar${path.sep}`)) file = file.replace(`app.asar${path.sep}`, `app.asar.unpacked${path.sep}`);
  if (!file || !fs.existsSync(file)) throw new Error('Brak pliku: ' + rel);
  const url = pathToFileURL(file).toString() + (page ? `#page=${page}` : '');
  let w = pdfWindows.get(rel);
  if (w && !w.isDestroyed()) {
    w.loadURL(url);
    w.show();
    w.focus();
    return;
  }
  w = new BrowserWindow({
    width: 980,
    height: 1000,
    title: path.basename(rel),
    backgroundColor: '#525659',
    autoHideMenuBar: true,
    icon: path.join(ROOT, 'build', 'icon.png'),
    webPreferences: { plugins: true, contextIsolation: true, sandbox: true },
  });
  w.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  pdfWindows.set(rel, w);
  w.on('closed', () => pdfWindows.delete(rel));
  w.loadURL(url);
}

// ---- IPC -------------------------------------------------------------------------------

function registerIpc() {
  const ctx = {
    contentDir: CONTENT,
    workDir: () => path.join(app.getPath('userData'), 'workspace'),
    cacheDir: () => path.join(app.getPath('userData'), 'build-cache'),
    settings: () => store.readSync(app.getPath('userData'), 'settings') || {},
    send: (channel, payload) => win && !win.isDestroyed() && win.webContents.send(channel, payload),
  };
  runner.init(ctx);

  ipcMain.handle('toolchains:detect', (_e, force) => runner.detect(force));
  ipcMain.handle('run:start', (_e, spec) => runner.start(spec));
  ipcMain.handle('run:stdin', (_e, id, text) => runner.stdin(id, text));
  ipcMain.handle('run:kill', (_e, id) => runner.kill(id));
  ipcMain.handle('run:tests', (_e, spec) => runner.runTests(spec));
  ipcMain.handle('ws:list', (_e, taskKey) => runner.listWorkspace(taskKey));
  ipcMain.handle('ws:read', (_e, taskKey, name) => runner.readWorkspaceFile(taskKey, name));
  ipcMain.handle('ws:open', (_e, taskKey) => shell.openPath(runner.prepareWorkspace(taskKey, [])));
  ipcMain.handle('store:get', (_e, key) => store.read(app.getPath('userData'), key));
  ipcMain.handle('store:set', (_e, key, value) => store.write(app.getPath('userData'), key, value));
  ipcMain.handle('store:del', (_e, key) => store.remove(app.getPath('userData'), key));
  ipcMain.handle('pdf:open', (_e, rel, page) => openPdf(rel, page));
  ipcMain.handle('app:info', () => ({ version: app.getVersion(), platform: process.platform, dev: DEV }));
}

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    protocol.handle('maturalab', serve);
    registerIpc();
    createWindow();
  });

  app.on('window-all-closed', () => app.quit());
}

module.exports = { getWindow: () => win };
