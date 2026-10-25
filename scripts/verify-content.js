'use strict';
// Recomputes the answers to the data tasks with the reference scripts in tools/ref and
// checks them against the CKE keys, then runs every model solution the hints reveal
// (tools/check-solutions.mjs), checks the lessons – their model solutions, examples, queries and
// formulas (tools/check-lessons.mjs) – and compares the content with the original PDFs
// (tools/audit-pdf.mjs, when pdftotext is installed). Needs Python 3, g++ and a JDK.
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const dir = path.join(__dirname, '..', 'tools', 'ref');
const python = process.platform === 'win32' ? ['py', '-3'] : ['python3'];
let failed = 0;
for (const f of fs.readdirSync(dir).filter((n) => /^ref_.*\.py$/.test(n)).sort()) {
  const r = spawnSync(python[0], [...python.slice(1), path.join(dir, f)], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
  const ok = r.status === 0;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${f}`);
  if (!ok) {
    failed++;
    process.stderr.write((r.stdout || '') + (r.stderr || '') + (r.error ? String(r.error) : ''));
  }
}
if (failed) process.exit(1);

const sol = spawnSync(process.execPath, [path.join(__dirname, '..', 'tools', 'check-solutions.mjs')], { stdio: 'inherit' });
if (sol.status !== 0) process.exit(1);

const lessons = spawnSync(process.execPath, [path.join(__dirname, '..', 'tools', 'check-lessons.mjs')], { stdio: 'inherit' });
if (lessons.status !== 0) process.exit(1);

// the content against the original PDFs (skipped without pdftotext)
const audit = spawnSync(process.execPath, [path.join(__dirname, '..', 'tools', 'audit-pdf.mjs')], { stdio: 'inherit' });
process.exit(audit.status === 0 ? 0 : 1);
