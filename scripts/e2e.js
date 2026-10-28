'use strict';
// Runs the end-to-end scenarios one after another in the real app (works on Windows too).
//   node scripts/e2e.js                  all scenarios
//   node scripts/e2e.js flow features    just these
const path = require('path');
const { spawnSync } = require('child_process');
const electron = require('electron');

const root = path.join(__dirname, '..');
const names = process.argv.slice(2).length ? process.argv.slice(2) : ['flow', 'features', 'sheet-tools', 'hints', 'learn', 'alltasks'];
for (const name of names) {
  console.log(`\n=== ${name} ===`);
  // CI Linux runners can't set up Chromium's sandbox (no SUID helper, restricted user namespaces).
  const flags = process.env.CI && process.platform === 'linux' ? ['--no-sandbox', '--disable-gpu'] : [];
  const r = spawnSync(electron, [...flags, path.join(root, 'test/e2e/harness.js'), path.join(root, 'test/e2e/scenarios', name + '.js')], {
    stdio: 'inherit',
    cwd: root,
  });
  if (r.status !== 0) {
    console.error(`${name} failed (exit ${r.status})`);
    process.exit(1);
  }
}
