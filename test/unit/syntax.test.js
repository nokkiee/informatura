'use strict';
// Every renderer and content module parses (a syntax error there only shows up as a blank
// screen in the app).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..', '..');
function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? jsFiles(p) : d.name.endsWith('.js') ? [p] : [];
  });
}

test('renderer and content modules parse', () => {
  const files = [...jsFiles(path.join(ROOT, 'renderer', 'js')), ...jsFiles(path.join(ROOT, 'content', 'exams')), ...(fs.existsSync(path.join(ROOT, 'content', 'hints')) ? jsFiles(path.join(ROOT, 'content', 'hints')) : [])];
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    assert.strictEqual(r.status, 0, `${path.relative(ROOT, f)}:\n${r.stderr}`);
  }
});
