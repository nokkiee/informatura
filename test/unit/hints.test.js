'use strict';
// Hints: every task has a few, the spreadsheet functions they name exist in the app's
// Polish spreadsheet, and every code / SQL task has model solutions for the later hints.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const url = (file) => require('url').pathToFileURL(file).href;

const ROOT = path.join(__dirname, '..', '..');
const CONTENT = path.join(ROOT, 'content');
const exams = [];
let functionNames;

test.before(async () => {
  globalThis.window = globalThis.window || { addEventListener() {}, api: {} };
  const ids = (await import(url(path.join(CONTENT, 'exams', 'index.js')))).default;
  for (const id of ids) {
    const exam = (await import(url(path.join(CONTENT, 'exams', id + '.js')))).default;
    const file = path.join(CONTENT, 'hints', id + '.js');
    exam.hints = fs.existsSync(file) ? (await import(url(file))).default : null;
    exams.push(exam);
  }
  // the app's Polish function names: HyperFormula's Polish pack with Excel's names on top
  const pl = require('hyperformula/commonjs/i18n/languages/plPL.js');
  const { EXCEL_PL } = await import(url(path.join(ROOT, 'renderer', 'js', 'sheet', 'engine.js')));
  const fns = { ...(pl.default || pl).functions };
  for (const [fn, name] of Object.entries(EXCEL_PL)) if (fn in fns) fns[fn] = name;
  functionNames = new Set(Object.values(fns));
});

const withHints = () => exams.filter((e) => e.hints);
const tasksOf = (e) => e.groups.flatMap((g) => g.tasks);

test('every task of an exam with hints has at least two of them', () => {
  assert.ok(withHints().length > 0);
  for (const e of withHints()) {
    const nos = new Set(tasksOf(e).map((t) => t.no));
    for (const t of tasksOf(e)) {
      const hs = e.hints[t.no];
      assert.ok(Array.isArray(hs) && hs.length >= 2, `${e.id} ${t.no}: needs at least two hints`);
      for (const hnt of hs) assert.ok(typeof hnt === 'string' && hnt.trim().length > 20, `${e.id} ${t.no}: empty hint`);
    }
    for (const no of Object.keys(e.hints)) assert.ok(nos.has(no), `${e.id}: hints for a task that doesn't exist: ${no}`);
  }
});

test('spreadsheet functions named in the hints exist in the app', () => {
  const re = /(?<![\p{L}\d.])(\p{Lu}[\p{Lu}\d]*(?:\.[\p{Lu}\d]+)*)\(/gu;
  for (const e of withHints()) {
    for (const t of tasksOf(e).filter((x) => x.kind === 'sheet')) {
      for (const hnt of e.hints[t.no] || []) {
        for (const m of hnt.matchAll(re)) assert.ok(functionNames.has(m[1]), `${e.id} ${t.no}: unknown spreadsheet function ${m[1]}`);
      }
    }
  }
});

test('code and SQL tasks have model solutions in every language', () => {
  for (const e of withHints()) {
    for (const t of tasksOf(e)) {
      const exts = ['program', 'algorithm'].includes(t.kind) ? ['py', 'cpp', 'java'] : ['sql', 'sqlwrite'].includes(t.kind) ? ['sql'] : [];
      for (const ext of exts) assert.ok(fs.existsSync(path.join(CONTENT, 'solutions', e.id, `${t.no}.${ext}`)), `${e.id} ${t.no}: no model solution .${ext}`);
    }
  }
});
