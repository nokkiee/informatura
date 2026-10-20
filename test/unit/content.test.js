'use strict';
// Consistency checks for every exam content file.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const url = (file) => require('url').pathToFileURL(file).href; // Windows paths aren't valid import specifiers

const ROOT = path.join(__dirname, '..', '..', 'content');
let exams = [];
let check;
let algo;

test.before(async () => {
  const ids = (await import(url(path.join(ROOT, 'exams', 'index.js')))).default;
  for (const id of ids) exams.push((await import(url(path.join(ROOT, 'exams', id + '.js')))).default);
  check = await import('../../renderer/js/check.js');
  algo = await import('../../renderer/js/algo.js');
});

const KINDS = new Set(['program', 'sheet', 'sql', 'fill', 'tf', 'choice', 'algorithm', 'open', 'sqlwrite']);
const CATS = new Set(['programowanie', 'algorytmy', 'bazy', 'arkusz', 'teoria']);

test('every exam adds up to its maximum and has its files', () => {
  assert.ok(exams.length > 0);
  for (const e of exams) {
    const tasks = e.groups.flatMap((g) => g.tasks);
    const sum = tasks.reduce((s, t) => s + t.points, 0);
    assert.strictEqual(sum, e.maxPoints, `${e.id}: points add up to ${sum}`);
    assert.ok(fs.existsSync(path.join(ROOT, e.pdf)), `${e.id}: pdf`);
    assert.ok(fs.existsSync(path.join(ROOT, e.keyPdf)), `${e.id}: key pdf`);
    assert.match(e.date, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(e.dateText && e.symbol, `${e.id}: date text and symbol`);
    const nos = new Set();
    for (const g of e.groups) {
      for (const f of g.files || []) assert.ok(fs.existsSync(path.join(ROOT, 'data', e.id, f)), `${e.id}: data file ${f}`);
      for (const [t, f] of Object.entries(g.tables || {})) assert.ok((g.files || []).includes(f), `${e.id}: table ${t} file ${f} listed in files`);
      if (g.sheet) assert.ok((g.files || []).includes(g.sheet.file), `${e.id}: sheet file listed`);
      for (const t of g.tasks) {
        const where = `${e.id} ${t.no}`;
        assert.ok(!nos.has(t.no), `${where}: duplicate number`);
        nos.add(t.no);
        assert.ok(KINDS.has(t.kind), `${where}: kind ${t.kind}`);
        assert.ok(CATS.has(t.cat), `${where}: category ${t.cat}`);
        assert.ok(t.text && t.text.length > 10, `${where}: text`);
        assert.ok(Number.isInteger(t.page) && t.page > 1, `${where}: page`);
        assert.ok(t.rubric, `${where}: rubric`);
        assert.ok(t.solution, `${where}: solution`);
        if (t.info) assert.ok(g.infos?.[t.info], `${where}: info block ${t.info}`);
        if (['program', 'sheet', 'sql'].includes(t.kind)) {
          assert.ok(t.expect, `${where}: expect`);
          const self = t.self?.points || 0;
          const spec = check.normalizeExpect(t.expect, t.points - self);
          const partsMax = spec.parts.reduce((s, p) => s + p.points, 0);
          assert.strictEqual(partsMax + self, t.points, `${where}: parts add up to ${partsMax}+${self}`);
          if (t.kind === 'sql') assert.ok(g.tables, `${where}: sql task needs tables`);
          if (t.example) {
            for (const [to, from] of Object.entries(t.example.map || {})) {
              assert.ok((g.files || []).includes(to) && (g.files || []).includes(from), `${where}: example map ${from}->${to}`);
            }
            if (t.example.expectFile) assert.ok((g.files || []).includes(t.example.expectFile), `${where}: example answer file`);
          }
        }
        if (t.kind === 'fill') {
          const ids = [...t.text.matchAll(/\{\{([\w-]+)/g)].map((m) => m[1]);
          assert.deepStrictEqual(new Set(ids), new Set(Object.keys(t.fields)), `${where}: fields match placeholders`);
          // the official answer scores full points
          const ok = Object.fromEntries(Object.keys(t.fields).map((k) => [k, true]));
          if (t.score && !t.validate) assert.strictEqual(t.score(ok), t.points, `${where}: full score`);
        }
        if (t.kind === 'tf') {
          assert.strictEqual(t.answer.length, t.statements.length, `${where}: answers per statement`);
          assert.match(t.answer, /^[PF]+$/);
          if (t.score) assert.strictEqual(t.score(Object.fromEntries(t.answer.split('').map((_, i) => [i, true]))), t.points, `${where}: full score`);
        }
        if (t.kind === 'choice') {
          for (const l of t.answer) assert.ok(t.options.some(([x]) => x === l), `${where}: answer ${l} is an option`);
        }
        if (t.kind === 'sqlwrite') assert.ok(g.tables || t.extraTables, `${where}: schema`);
      }
    }
  }
});

test('reference solutions agree with the official examples', () => {
  for (const e of exams) {
    for (const g of e.groups) {
      for (const t of g.tasks) {
        if (t.kind !== 'algorithm') continue;
        const a = t.algo;
        assert.ok(a.inputs?.length && a.outputs?.length, `${e.id} ${t.no}: io`);
        for (const ex of a.examples || []) {
          if (!a.ref) continue;
          const out = a.ref(...ex.in.map((v) => (Array.isArray(v) ? [...v] : v)));
          const outs = a.outputs.length === 1 ? [out] : out;
          assert.strictEqual(algo.serializeOutput(outs), algo.serializeOutput(ex.out), `${e.id} ${t.no}: ref(${ex.in}) = ${outs}`);
        }
        const tests = algo.buildTests(a, `${e.id}/${t.no}`);
        assert.ok(tests.length >= (a.examples || []).length, `${e.id} ${t.no}: tests`);
        for (const lang of ['python', 'cpp', 'java']) assert.ok(algo.algoTemplate(lang, a, 'x').length > 20);
      }
    }
  }
});
