// Evaluates Polish spreadsheet formulas on an exam's data file with the app's own spreadsheet
// engine (HyperFormula with the same Polish function names and import rules), so formulas
// quoted in hints can be checked before they're written down.
//
//   node tools/sheet-eval.mjs <exam> <file> [--import <file>]… [--rows a-b] "<cell template>"… "=<formula>"…
//
// A template like "F{r}=WYSZUKAJ.PIONOWO(B{r};cennik!$A$1:$B$16;2;0)" is filled in for every
// data row (or the --rows range); every "=<formula>" is then evaluated once and printed.
// Example:
//   node tools/sheet-eval.mjs 2024-maj jablka.txt --import cennik.txt \
//     'F{r}=WYSZUKAJ.PIONOWO(B{r};cennik!$A$1:$B$16;2;0)' 'G{r}=E{r}*F{r}' '=SUMA(G1:G2500)'
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
globalThis.window = { addEventListener() {}, api: {} };
const E = await import(pathToFileURL(path.join(ROOT, 'renderer/js/sheet/engine.js')).href);

const { HyperFormula } = require('hyperformula');
const pl = require('hyperformula/commonjs/i18n/languages/plPL.js');
const lang = JSON.parse(JSON.stringify(pl.default || pl));
lang.langCode = 'plPLx';
delete lang.functions.VERSION;
const taken = new Set(Object.values(lang.functions));
for (const [fn, name] of Object.entries(E.EXCEL_PL)) {
  if (!(fn in lang.functions)) continue;
  if (taken.has(name) && lang.functions[fn] !== name) continue;
  lang.functions[fn] = name;
}
HyperFormula.registerLanguage('plPLx', lang);

const args = process.argv.slice(2);
const [exam, main] = args;
const imports = [];
let rows = null;
const templates = [];
const formulas = [];
for (let i = 2; i < args.length; i++) {
  if (args[i] === '--import') imports.push(args[++i]);
  else if (args[i] === '--rows') rows = args[++i].split('-').map(Number);
  else if (args[i].startsWith('=')) formulas.push(args[i]);
  else templates.push(args[i]);
}

const hf = HyperFormula.buildEmpty(E.hfConfig('pl'));
function load(file) {
  const text = fs.readFileSync(path.join(ROOT, 'content/data', exam, file), 'utf8');
  const parsed = E.parseDataFile(text, { sep: 'auto' });
  const name = file.replace(/\.txt$/i, '');
  hf.addSheet(name);
  const id = hf.getSheetId(name);
  hf.setSheetContent(id, parsed.rows);
  return { id, n: parsed.rows.length };
}
const sheet = load(main);
for (const f of imports) load(f);

const [r0, r1] = rows || [1, sheet.n];
for (const t of templates) {
  const [cell, ...rest] = t.split('=');
  const formula = '=' + rest.join('=');
  for (let r = r0; r <= r1; r++) {
    const a = E.parseAddr(cell.replace('{r}', r));
    hf.setCellContents({ sheet: sheet.id, row: a.r, col: a.c }, formula.replaceAll('{r}', r));
  }
}
for (const f of formulas) {
  const v = hf.calculateFormula(f, sheet.id);
  console.log(f, '→', typeof v === 'object' && v !== null ? JSON.stringify(v) : v);
}
