'use strict';
// Builds the project's page (site/ → the given folder, default _site): copies the pages, adds the
// images (icon, screenshots, link preview) and fills in the latest release.
//   VERSION=1.3.1 RELEASE_DATE=2026-11-02 node scripts/build-site.js [out]
// Without VERSION it uses package.json's version and today's date.
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, '_site'));
const version = (process.env.VERSION || require(path.join(root, 'package.json')).version).replace(/^v/, '');
const iso = (process.env.RELEASE_DATE || new Date().toISOString()).slice(0, 10);
const MONTHS = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];
const [y, m, d] = iso.split('-').map(Number);
const date = `${d} ${MONTHS[m - 1]} ${y}`;

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'img'), { recursive: true });
const fill = (text) => text.replaceAll('{{VERSION}}', version).replaceAll('{{DATE}}', date).replaceAll('{{ISO_DATE}}', iso);
for (const f of fs.readdirSync(path.join(root, 'site'))) {
  const src = path.join(root, 'site', f);
  if (/\.(html|xml|txt|css)$/.test(f)) fs.writeFileSync(path.join(out, f), fill(fs.readFileSync(src, 'utf8')));
  else fs.copyFileSync(src, path.join(out, f));
}
const images = [
  ['build/icon.svg', 'icon.svg'],
  ['build/icon.png', 'icon.png'],
  ['docs/social-preview.png', 'social-preview.png'],
  ...fs.readdirSync(path.join(root, 'docs/screenshots')).map((f) => [`docs/screenshots/${f}`, f]),
];
for (const [src, name] of images) fs.copyFileSync(path.join(root, src), path.join(out, 'img', name));
const left = fs.readFileSync(path.join(out, 'index.html'), 'utf8').match(/\{\{\w+\}\}/);
if (left) throw new Error('unfilled placeholder ' + left[0]);
console.log(`site built in ${out}: version ${version}, ${date}`);
