'use strict';
// Recomputes the answers to the data tasks with the reference scripts in tools/ref and
// checks them against the CKE keys. Needs Python 3.
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
process.exit(failed ? 1 : 0);
