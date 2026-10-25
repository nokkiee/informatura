'use strict';
// Lessons: checking answers, and the structure of every lesson and section test.
// (Running the model solutions, queries and formulas is tools/check-lessons.mjs.)
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', '..');
const load = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
let C;
let LG;
test.before(async () => {
  C = await load('renderer/js/learn/check.js');
  LG = await load('renderer/js/learn/langs.js');
});

test('a lesson is read in one language: blocks, inline pieces and table columns', () => {
  const src = [
    'Dzielenie: [[python: `a // b`]][[cpp java: `a / b`]].',
    ':::python',
    'Tylko Python.',
    ':::',
    ':::cpp java',
    'C++ i Java[[java: , a tu tylko Java]].',
    ':::',
    '| działanie | Python | C++ / Java (liczby `int`) |',
    '|---|---|---|',
    '| lub | `or` | `\\|\\|` |',
  ].join('\n');
  const py = LG.forLang(src, 'python');
  assert.match(py, /`a \/\/ b`/);
  assert.match(py, /Tylko Python/);
  assert.doesNotMatch(py, /C\+\+|Java|:::|\[\[/);
  assert.match(py, /\| działanie \| Python \|\n/);
  const java = LG.forLang(src, 'java');
  assert.match(java, /Dzielenie: `a \/ b`\./);
  assert.match(java, /C\+\+ i Java, a tu tylko Java\./);
  assert.match(java, /\| działanie \| Java \(liczby `int`\) \|/);
  assert.match(java, /\| lub \| `\\\|\\\|` \|/);
  assert.doesNotMatch(LG.forLang(src, 'cpp'), /tylko Java|Tylko Python/);
  // questions only for some languages keep their place in the full list
  const qs = [{ q: 'a' }, { q: 'b', langs: ['cpp'] }, { q: 'c' }];
  assert.deepStrictEqual(LG.questionsFor(qs, 'python').map((x) => x.i), [0, 2]);
  assert.deepStrictEqual(LG.questionsFor(qs, 'cpp').map((x) => x.i), [0, 1, 2]);
  assert.strictEqual(LG.langOf('sql'), 'python');
});

test('short answers: numbers as numbers, text without case and extra spaces', () => {
  assert.ok(C.inputOk('7,50', '7.5'));
  assert.ok(C.inputOk(' 12 ', ['12']));
  assert.ok(C.inputOk('ROWER', 'rower'));
  assert.ok(C.inputOk('Kot.', 'kot'));
  assert.ok(!C.inputOk('', '0'));
  assert.ok(!C.inputOk('13', '12'));
  // exact: leading zeros and letters count
  assert.ok(!C.inputOk('0101', '101', { exact: true }));
  assert.ok(C.inputOk('1 4 2 5 8', '1 4 2 5 8', { exact: true }));
  assert.ok(C.inputOk('b3', 'B3', { exact: true }));
});

test('choice and true/false', () => {
  assert.ok(C.choiceOk([2], 2));
  assert.ok(!C.choiceOk([1], 2));
  assert.ok(C.choiceOk([3, 0], [0, 3]));
  assert.ok(!C.choiceOk([0], [0, 3]));
  const items = [{ answer: true }, { answer: false }];
  assert.ok(C.tfOk([true, false], items));
  assert.ok(!C.tfOk([true], items));
});

test('query results: columns and row order free unless ordered', () => {
  const want = { columns: ['a', 'b'], values: [[1, 'x'], [2, 'y']] };
  assert.ok(C.sqlSame({ columns: ['b', 'a'], values: [['y', 2], ['x', 1]] }, want).ok);
  assert.ok(!C.sqlSame({ columns: ['a', 'b'], values: [[2, 'y'], [1, 'x']] }, want, { ordered: true }).ok);
  assert.match(C.sqlSame({ columns: ['a'], values: [[1], [2]] }, want).why, /1 kolumnę/);
  assert.match(C.sqlSame({ columns: ['a', 'b'], values: [[1, 'x']] }, want).why, /1 wiersz/);
  assert.ok(C.sqlSame({ columns: ['n'], values: [[3.9010989]] }, { columns: ['n'], values: [[3.901099]] }).ok);
});

test('formula values and program output', () => {
  assert.ok(C.sheetSame([7.72, 'Lampka'], [7.72, 'lampka']));
  assert.ok(!C.sheetSame([{ value: '#N/A' }], [0]));
  assert.ok(C.outputOk('3\n2\n', '3 2'));
  assert.ok(!C.outputOk('3\n2\n', '3\n'));
  assert.strictEqual(C.pointsOf({ type: 'code' }), 2);
  assert.strictEqual(C.pointsOf({ type: 'tf' }), 1);
});

test('every lesson and section test is complete', async () => {
  const sections = (await load('content/lessons/index.js')).default;
  assert.strictEqual(sections.length, 5);
  const ids = new Set();
  for (const s of sections) {
    for (const id of s.lessons) {
      assert.ok(!ids.has(id), `duplicate lesson ${id}`);
      ids.add(id);
      const l = (await load(`content/lessons/${s.id}/${id}.js`)).default;
      assert.ok(l.title && l.summary && l.intro && l.minutes > 0, `${id}: title, summary, intro, minutes`);
      assert.ok(l.steps.length >= 2 && l.steps.every((st) => st.title && st.body), `${id}: steps`);
      for (const lang of LG.CODE_LANGS) assert.ok(LG.questionsFor(l.quiz, lang).length >= 4, `${id}: quiz in ${lang}`);

      for (const q of l.quiz) assert.ok(q.type && q.q && q.explain, `${id}: a question without text or explanation`);
      assert.ok(l.practice.length > 0, `${id}: practice tasks`);
    }
    const t = (await load(`content/lessons/${s.id}/test.js`)).default;
    assert.ok(t.questions.length >= 8, `${s.id}: test`);
    for (const q of t.questions) assert.ok(s.lessons.includes(q.lesson), `${s.id} test: lesson ${q.lesson}`);
  }
  assert.strictEqual(ids.size, 32);
});
