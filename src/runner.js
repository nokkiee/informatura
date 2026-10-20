'use strict';
// Compiles and runs the user's Python / C++ / Java code with the toolchains installed
// on this computer. Each exam task gets its own working folder holding copies of the
// task's data files, so `open("dane.txt")` works exactly as it does on the real exam.
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');

const IS_WIN = process.platform === 'win32';
const OUTPUT_LIMIT = 4 * 1024 * 1024; // a runaway print loop gets killed after this much output
const TEST_OUTPUT_LIMIT = 256 * 1024;

let ctx = null;
let toolchains = null;
let detecting = null;
let nextId = 1;
const running = new Map(); // id -> { child, killed }

function init(c) {
  ctx = c;
  cleanCache();
}

// ---- toolchain detection -------------------------------------------------------------

function execOut(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: opts.timeout || 15000, windowsHide: true, ...opts }, (err, stdout, stderr) => {
      resolve({ ok: !err, code: err ? err.code : 0, out: String(stdout || '') + String(stderr || '') });
    });
  });
}

function splitCmd(s) {
  // "py -3" -> ['py', '-3']; a quoted Windows path stays one piece.
  const parts = String(s).match(/"[^"]+"|\S+/g) || [];
  return parts.map((p) => p.replace(/^"|"$/g, ''));
}

async function findPython(custom) {
  const candidates = custom ? [custom] : IS_WIN ? ['py -3', 'python', 'python3'] : ['python3', 'python'];
  for (const c of candidates) {
    const [cmd, ...pre] = splitCmd(c);
    const r = await execOut(cmd, [...pre, '--version']);
    const m = r.out.match(/Python\s+(3\.\d+(?:\.\d+)?)/);
    if (r.ok && m) return { ok: true, cmd: [cmd, ...pre], version: 'Python ' + m[1] };
  }
  return { ok: false, error: 'Nie znaleziono interpretera Pythona 3.' };
}

async function findCpp(custom) {
  const candidates = custom ? [custom] : ['g++', 'clang++'];
  for (const c of candidates) {
    const [cmd, ...pre] = splitCmd(c);
    const r = await execOut(cmd, [...pre, '--version']);
    if (!r.ok) continue;
    const first = r.out.split('\n')[0].trim();
    // Prefer C++20 when the compiler knows it.
    const probe = await new Promise((resolve) => {
      const p = spawn(cmd, [...pre, '-std=c++20', '-x', 'c++', '-fsyntax-only', '-'], { windowsHide: true });
      p.on('error', () => resolve(false));
      p.on('close', (code) => resolve(code === 0));
      p.stdin.end('int main(){}\n');
    });
    return { ok: true, cmd: [cmd, ...pre], version: first, std: probe ? 'c++20' : 'c++17' };
  }
  return { ok: false, error: 'Nie znaleziono kompilatora C++ (g++ lub clang++).' };
}

async function findJava(custom) {
  const javaCandidates = [];
  if (custom) javaCandidates.push(custom);
  else {
    if (process.env.JAVA_HOME) javaCandidates.push(path.join(process.env.JAVA_HOME, 'bin', IS_WIN ? 'java.exe' : 'java'));
    javaCandidates.push('java');
  }
  for (const java of javaCandidates) {
    const r = await execOut(java, ['-version']);
    if (!r.ok) continue;
    const m = r.out.match(/version "([^"]+)"/);
    const version = m ? 'Java ' + m[1] : r.out.split('\n')[0].trim();
    // A JDK ships javac; some distributions ship only the JRE but still include the
    // compiler module, which can be started through the java launcher.
    const dir = path.dirname(java);
    const javacNext = path.join(dir, IS_WIN ? 'javac.exe' : 'javac');
    let javac = null;
    if (path.isAbsolute(java) && fs.existsSync(javacNext)) javac = [javacNext];
    else {
      const jc = await execOut(IS_WIN ? 'javac.exe' : 'javac', ['-version']);
      if (jc.ok) javac = [IS_WIN ? 'javac.exe' : 'javac'];
    }
    if (!javac) {
      const mods = await execOut(java, ['--list-modules']);
      if (/jdk\.compiler@/.test(mods.out)) javac = [java, '-m', 'jdk.compiler/com.sun.tools.javac.Main'];
    }
    if (!javac) return { ok: false, error: `${version} jest zainstalowana, ale bez kompilatora (potrzebny jest JDK, nie samo JRE).` };
    return { ok: true, cmd: [java], javac, version };
  }
  return { ok: false, error: 'Nie znaleziono Javy (JDK).' };
}

async function detect(force) {
  if (toolchains && !force) return toolchains;
  if (detecting && !force) return detecting;
  const custom = (ctx.settings() || {}).toolchains || {};
  detecting = Promise.all([findPython(custom.python), findCpp(custom.cpp), findJava(custom.java)]).then(([python, cpp, java]) => {
    toolchains = { python, cpp, java };
    detecting = null;
    return toolchains;
  });
  return detecting;
}

// ---- workspace & build cache ---------------------------------------------------------

function safeKey(taskKey) {
  const k = String(taskKey || 'scratch').replace(/[^\w.\-]+/g, '_').slice(0, 80);
  return k || 'scratch';
}

function contentFile(rel) {
  const file = path.join(ctx.contentDir, rel);
  const relCheck = path.relative(ctx.contentDir, file);
  if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) throw new Error('Nieprawidłowa ścieżka: ' + rel);
  return file;
}

// files: [{ name: 'dane.txt', src: 'data/2023-maj/dane.txt' }]
function prepareWorkspace(taskKey, files, dirOverride) {
  const dir = dirOverride || path.join(ctx.workDir(), safeKey(taskKey));
  fs.mkdirSync(dir, { recursive: true });
  for (const f of files || []) {
    const target = path.join(dir, path.basename(f.name));
    // Fresh copies every run: a program that overwrote its input can't spoil later runs.
    fs.copyFileSync(contentFile(f.src), target);
  }
  return dir;
}

function listWorkspace(taskKey) {
  const dir = path.join(ctx.workDir(), safeKey(taskKey));
  try {
    return fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => {
        const st = fs.statSync(path.join(dir, d.name));
        return { name: d.name, size: st.size, mtime: st.mtimeMs };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

function readWorkspaceFile(taskKey, name) {
  const file = path.join(ctx.workDir(), safeKey(taskKey), path.basename(String(name)));
  const st = fs.statSync(file);
  const fd = fs.openSync(file, 'r');
  try {
    const len = Math.min(st.size, 2 * 1024 * 1024);
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, 0);
    return { text: buf.toString('utf8'), truncated: st.size > len, size: st.size };
  } finally {
    fs.closeSync(fd);
  }
}

function cleanCache() {
  try {
    const dir = ctx.cacheDir();
    const cutoff = Date.now() - 3 * 24 * 3600 * 1000;
    for (const d of fs.readdirSync(dir)) {
      const p = path.join(dir, d);
      if (fs.statSync(p).mtimeMs < cutoff) fs.rmSync(p, { recursive: true, force: true });
    }
  } catch {}
}

function javaClassName(code) {
  const pub = code.match(/public\s+(?:final\s+|abstract\s+)*class\s+([A-Za-z_$][\w$]*)/);
  if (pub) return pub[1];
  const withMain = code.match(/class\s+([A-Za-z_$][\w$]*)[^{]*\{[\s\S]*?static\s+void\s+main\s*\(/);
  if (withMain) return withMain[1];
  return 'Main';
}

function spawnCollect(cmd, args, opts) {
  return new Promise((resolve) => {
    let out = '';
    let p;
    try {
      p = spawn(cmd, args, { windowsHide: true, ...opts });
    } catch (err) {
      resolve({ code: -1, out: String(err.message) });
      return;
    }
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (out += d));
    p.on('error', (err) => resolve({ code: -1, out: out + err.message }));
    p.on('close', (code) => resolve({ code, out }));
  });
}

// Compiles (or reuses a cached build of) the code and returns how to start it.
async function build(lang, code) {
  const tc = await detect();
  const t = tc[lang];
  if (!t || !t.ok) {
    const names = { python: 'Python', cpp: 'C++', java: 'Java' };
    return { error: `${names[lang] || lang}: ${t ? t.error : 'nieznany język'}`, missingToolchain: true };
  }
  const hash = crypto.createHash('sha1').update(lang + '\0' + JSON.stringify(t) + '\0' + code).digest('hex').slice(0, 20);
  const dir = path.join(ctx.cacheDir(), hash);
  fs.mkdirSync(dir, { recursive: true });
  const now = new Date();
  try {
    fs.utimesSync(dir, now, now);
  } catch {}

  if (lang === 'python') {
    const file = path.join(dir, 'zadanie.py');
    fs.writeFileSync(file, code);
    return { cmd: t.cmd[0], args: [...t.cmd.slice(1), '-u', file], dir, strip: [dir + path.sep] };
  }

  if (lang === 'cpp') {
    const exe = path.join(dir, IS_WIN ? 'zadanie.exe' : 'zadanie');
    if (!fs.existsSync(exe)) {
      fs.writeFileSync(path.join(dir, 'zadanie.cpp'), code);
      const r = await spawnCollect(t.cmd[0], [...t.cmd.slice(1), `-std=${t.std}`, '-O2', '-o', path.basename(exe), 'zadanie.cpp'], { cwd: dir });
      if (r.code !== 0) return { compileError: r.out || 'Kompilacja nie powiodła się.' };
    }
    return { cmd: exe, args: [], dir, strip: [] };
  }

  if (lang === 'java') {
    const cls = javaClassName(code);
    const classes = path.join(dir, 'classes');
    if (!fs.existsSync(path.join(classes, cls + '.class'))) {
      fs.writeFileSync(path.join(dir, cls + '.java'), code);
      const r = await spawnCollect(t.javac[0], [...t.javac.slice(1), '-encoding', 'UTF-8', '-d', 'classes', cls + '.java'], { cwd: dir });
      if (r.code !== 0) return { compileError: r.out || 'Kompilacja nie powiodła się.' };
    }
    return {
      cmd: t.cmd[0],
      args: ['-Dfile.encoding=UTF-8', '-Dstdout.encoding=UTF-8', '-Dstderr.encoding=UTF-8', '-Dstdin.encoding=UTF-8', '-XX:TieredStopAtLevel=1', '-XX:+UseSerialGC', '-cp', classes, cls],
      dir,
      strip: [],
    };
  }
  return { error: 'Nieznany język: ' + lang };
}

function childEnv() {
  return { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', PYTHONDONTWRITEBYTECODE: '1' };
}

function killTree(child) {
  if (!child || child.exitCode !== null) return;
  try {
    if (IS_WIN) spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true });
    else process.kill(-child.pid, 'SIGKILL');
  } catch {
    try {
      child.kill('SIGKILL');
    } catch {}
  }
}

function stripPaths(text, strip) {
  let t = text;
  for (const s of strip || []) t = t.split(s).join('');
  return t;
}

// ---- interactive run -------------------------------------------------------------------

// spec: { taskKey, lang, code, files: [{name, src}], stdin?, timeoutMs?, sandbox? }
// sandbox: run in a throw-away folder (used for the "example data" check).
function start(spec) {
  const id = nextId++;
  const send = (ev) => ctx.send('run:event', { id, ...ev });
  const entry = { child: null, killed: false };
  running.set(id, entry);

  (async () => {
    let dir;
    try {
      dir = spec.sandbox
        ? prepareWorkspace(null, spec.files, fs.mkdtempSync(path.join(os.tmpdir(), 'maturalab-')))
        : prepareWorkspace(spec.taskKey, spec.files);
    } catch (err) {
      send({ type: 'exit', code: -1, error: 'Nie udało się przygotować folderu roboczego: ' + err.message });
      running.delete(id);
      return;
    }
    send({ type: 'status', text: spec.lang === 'python' ? 'start' : 'compile' });
    const b = await build(spec.lang, spec.code);
    if (entry.killed) {
      send({ type: 'exit', code: null, killed: true });
      running.delete(id);
      return;
    }
    if (b.error || b.compileError) {
      send({ type: 'exit', code: -1, error: b.error, compileError: b.compileError, missingToolchain: b.missingToolchain });
      running.delete(id);
      return;
    }
    send({ type: 'status', text: 'run', cwd: dir });
    const t0 = Date.now();
    let child;
    try {
      child = spawn(b.cmd, b.args, { cwd: dir, env: childEnv(), detached: !IS_WIN, windowsHide: true });
    } catch (err) {
      send({ type: 'exit', code: -1, error: err.message });
      running.delete(id);
      return;
    }
    entry.child = child;
    let total = 0;
    let truncated = false;
    let buf = { out: '', err: '' };
    let flushTimer = null;
    const flush = () => {
      flushTimer = null;
      if (buf.out) send({ type: 'out', data: buf.out });
      if (buf.err) send({ type: 'err', data: stripPaths(buf.err, b.strip) });
      buf = { out: '', err: '' };
    };
    const onData = (stream) => (d) => {
      if (truncated) return;
      const s = d.toString('utf8');
      total += s.length;
      if (total > OUTPUT_LIMIT) {
        truncated = true;
        killTree(child);
        return;
      }
      buf[stream] += s;
      if (!flushTimer) flushTimer = setTimeout(flush, 40);
    };
    child.stdout.on('data', onData('out'));
    child.stderr.on('data', onData('err'));
    child.stdin.on('error', () => {});
    if (spec.stdin != null) {
      child.stdin.end(spec.stdin);
    }
    const timeoutMs = Math.max(1000, Math.min(spec.timeoutMs || 20000, 10 * 60 * 1000));
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeoutMs);
    child.on('error', (err) => {
      clearTimeout(timer);
      flush();
      send({ type: 'exit', code: -1, error: err.message });
      running.delete(id);
    });
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      if (flushTimer) clearTimeout(flushTimer);
      flush();
      const files = spec.sandbox ? [] : listWorkspace(spec.taskKey).filter((f) => f.mtime >= t0 - 1000);
      send({ type: 'exit', code, signal, timeMs: Date.now() - t0, timedOut, truncated, killed: entry.killed, files: files.map((f) => f.name) });
      running.delete(id);
      if (spec.sandbox) fs.rm(dir, { recursive: true, force: true }, () => {});
    });
  })();

  return { id };
}

function stdin(id, text) {
  const e = running.get(id);
  if (!e || !e.child || e.child.exitCode !== null) return false;
  try {
    if (text === null) e.child.stdin.end();
    else e.child.stdin.write(text);
    return true;
  } catch {
    return false;
  }
}

function kill(id) {
  const e = running.get(id);
  if (!e) return false;
  e.killed = true;
  killTree(e.child);
  return true;
}

function killAll() {
  for (const id of running.keys()) kill(id);
}

// ---- batch tests (algorithm tasks) -------------------------------------------------------

function runOnce(b, input, timeoutMs, cwd) {
  return new Promise((resolve) => {
    const t0 = Date.now();
    let child;
    try {
      child = spawn(b.cmd, b.args, { cwd, env: childEnv(), detached: !IS_WIN, windowsHide: true });
    } catch (err) {
      resolve({ stdout: '', stderr: err.message, code: -1, timeMs: 0 });
      return;
    }
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const cap = (s, d) => (s.length < TEST_OUTPUT_LIMIT ? s + d.toString('utf8') : s);
    child.stdout.on('data', (d) => (stdout = cap(stdout, d)));
    child.stderr.on('data', (d) => (stderr = cap(stderr, d)));
    child.stdin.on('error', () => {});
    child.stdin.end(input);
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeoutMs);
    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stderr + err.message, code: -1, timeMs: Date.now() - t0 });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr: stripPaths(stderr, b.strip), code, timedOut, timeMs: Date.now() - t0 });
    });
  });
}

// spec: { lang, code, tests: [{ input }], timeoutMs? }
async function runTests(spec) {
  const b = await build(spec.lang, spec.code);
  if (b.error || b.compileError) return { error: b.error, compileError: b.compileError, missingToolchain: b.missingToolchain };
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'maturalab-t-'));
  const results = [];
  try {
    for (const t of spec.tests || []) {
      results.push(await runOnce(b, String(t.input ?? ''), spec.timeoutMs || 5000, cwd));
    }
  } finally {
    fs.rm(cwd, { recursive: true, force: true }, () => {});
  }
  return { results };
}

module.exports = { init, detect, start, stdin, kill, killAll, runTests, prepareWorkspace, listWorkspace, readWorkspaceFile, javaClassName, splitCmd };
