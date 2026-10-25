// Checks the lessons (content/lessons): their structure and links, and that everything a lesson
// runs or grades works:
//   - every program exercise's model solution passes its tests in Python, C++ and Java
//   - every runnable example (~~~python run …) runs in each of its languages, and they all
//     print the same (unless the example is marked "differs")
//   - each reader gets the lesson in their language only (renderer/js/learn/langs.js): every code
//     example has a version in each language that sees it, a table never loses its only language
//     column, and the text a Python reader sees doesn't talk about C++ or Java (and so on)
//   - SQL solutions and ~~~sql run examples run on the lesson's database (solutions give rows)
//   - formula solutions and ~~~excel run examples evaluate without errors (and to `expect`)
//   - every question is complete (answers, explanations), every practice link is a real task,
//     every section has a test whose questions point to the section's lessons
//   node tools/check-lessons.mjs [section …] [--lang=python|cpp|java] [--fast] (--fast: Python only)
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');
globalThis.window = { addEventListener() {}, api: {} };
globalThis.localStorage = { getItem: () => null, setItem() {} };

const runner = require(path.join(ROOT, 'src', 'runner.js'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'informatura-lessons-'));
runner.init({ contentDir: CONTENT, workDir: () => path.join(tmp, 'ws'), cacheDir: () => path.join(tmp, 'cache'), settings: () => ({}), send() {} });

const C = await import(pathToFileURL(path.join(ROOT, 'renderer/js/check.js')).href);
const S = await import(pathToFileURL(path.join(ROOT, 'renderer/js/ws/sql.js')).href);
const E = await import(pathToFileURL(path.join(ROOT, 'renderer/js/sheet/engine.js')).href);
const L = await import(pathToFileURL(path.join(ROOT, 'renderer/js/learn/check.js')).href);
const LG = await import(pathToFileURL(path.join(ROOT, 'renderer/js/learn/langs.js')).href);
const SQL = await require('sql.js')();

// HyperFormula with the app's Polish function names (as in tools/sheet-eval.mjs)
const { HyperFormula } = require('hyperformula');
const plLang = require('hyperformula/commonjs/i18n/languages/plPL.js');
const lang = JSON.parse(JSON.stringify(plLang.default || plLang));
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
const fast = args.includes('--fast');
const onlyLang = (args.find((a) => a.startsWith('--lang=')) || '').slice(7) || (fast ? 'python' : null);
const LANGS = onlyLang ? [onlyLang] : ['python', 'cpp', 'java'];
const wanted = args.filter((a) => !a.startsWith('--'));

let failures = 0;
let checks = 0;
const fail = (where, msg) => {
  failures++;
  console.log(`FAIL ${where}: ${msg}`);
};
const excerpt = (s) => String(s || '').trim().split('\n').slice(0, 6).join(' | ').slice(0, 300);
const fileList = (files) => Object.entries(files || {}).map(([name, text]) => ({ name, text }));

// real exam tasks, for the practice links
const taskKeys = new Set();
for (const id of (await import(pathToFileURL(path.join(CONTENT, 'exams/index.js')).href)).default) {
  const exam = (await import(pathToFileURL(path.join(CONTENT, 'exams', id + '.js')).href)).default;
  for (const g of exam.groups) for (const t of g.tasks) taskKeys.add(`${id}/${t.no}`);
}

// ---- running things ----------------------------------------------------------------------------

async function run(langName, code, input, files) {
  const res = await runner.runTests({ lang: langName, code, tests: [{ input: input ?? '' }], files: fileList(files), timeoutMs: 20000 });
  if (res.error || res.compileError) return { error: res.error || res.compileError };
  return res.results[0];
}

const dbs = new Map();
function lessonDb(spec) {
  if (!dbs.has(spec)) {
    const db = new SQL.Database();
    S.registerFunctions(db);
    for (const [name, text] of Object.entries(spec)) {
      const { header, rows } = S.parseTable(text);
      const types = header.map((_, i) => S.inferColumn(rows.map((r) => r[i])));
      db.run(`CREATE TABLE "${name}" (${header.map((c, i) => `"${c}" ${types[i]}`).join(', ')})`);
      const stmt = db.prepare(`INSERT INTO "${name}" VALUES (${header.map(() => '?').join(',')})`);
      for (const r of rows) {
        if (r.length !== header.length) throw new Error(`table ${name}: row "${r.join(';')}" has ${r.length} fields, header ${header.length}`);
        stmt.run(header.map((_, i) => S.convertValue(r[i] ?? '', types[i])));
      }
      stmt.free();
    }
    dbs.set(spec, db);
  }
  return dbs.get(spec);
}
function runSql(spec, query) {
  try {
    const db = lessonDb(spec);
    db.run('SAVEPOINT lesson');
    try {
      const res = db.exec(S.dialectFix(query));
      return { result: res[res.length - 1] || { columns: [], values: [] } };
    } finally {
      db.run('ROLLBACK TO lesson');
      db.run('RELEASE lesson');
    }
  } catch (e) {
    return { error: e.message };
  }
}

function evalFormula({ data, formula, cell, fill }) {
  const hf = HyperFormula.buildFromArray(data.map((r) => r.slice()), E.hfConfig('pl'));
  try {
    if (!hf.validateFormula(formula)) return { error: 'invalid formula' };
    const a = E.parseAddr(cell);
    const at = { sheet: 0, row: a.r, col: a.c };
    hf.setCellContents(at, formula);
    const [from, to] = (fill || cell).split(':').map(E.parseAddr);
    const end = to || from;
    hf.copy({ start: at, end: at });
    for (let r = from.r; r <= end.r; r++) for (let c = from.c; c <= end.c; c++) if (r !== a.r || c !== a.c) hf.paste({ sheet: 0, row: r, col: c });
    const values = [];
    for (let r = from.r; r <= end.r; r++) for (let c = from.c; c <= end.c; c++) values.push(hf.getCellValue({ sheet: 0, row: r, col: c }));
    return { values };
  } catch (e) {
    return { error: e.message };
  } finally {
    hf.destroy();
  }
}
function calcFormula(data, formula) {
  const hf = HyperFormula.buildFromArray(data.map((r) => r.slice()), E.hfConfig('pl'));
  try {
    if (!hf.validateFormula(formula)) return { error: 'invalid formula' };
    const v = hf.calculateFormula(formula, 0);
    return v && typeof v === 'object' && v.type ? { error: `${v.value} ${v.message || ''}` } : { value: v };
  } finally {
    hf.destroy();
  }
}
const isErr = (v) => v && typeof v === 'object';

// ---- examples in the lesson text -------------------------------------------------------------------

const CODE = ['python', 'cpp', 'java'];
const BLOCK = /^\s*:::\s*(.*?)\s*$/;
function fences(src, where) {
  const out = [];
  const lines = String(src).split('\n');
  let block = null; // the languages of the :::block we're in
  for (let i = 0; i < lines.length; i++) {
    const b = lines[i].match(BLOCK);
    if (b) {
      const names = b[1].split(/[ ,]+/).filter(Boolean);
      if (names.some((n) => !CODE.includes(n))) fail(where, `unknown language block ":::${b[1]}"`);
      if (names.length && block) fail(where, `":::${b[1]}" inside another language block (close it with ":::" first)`);
      if (!names.length && !block) fail(where, 'a ":::" closes no language block');
      block = names.length ? names : null;
      continue;
    }
    const m = lines[i].match(/^~~~(\S*)\s*(.*)$/);
    if (!m) continue;
    let j = i + 1;
    while (j < lines.length && !/^~~~\s*$/.test(lines[j])) j++;
    out.push({ lang: m[1], flags: m[2].split(/\s+/).filter(Boolean), code: lines.slice(i + 1, j).join('\n'), start: i, end: j, block });
    i = j;
  }
  if (block) fail(where, `language block ":::${block.join(' ')}" is not closed`);
  // consecutive python/cpp/java fences (only blank lines between) are one example
  const groups = [];
  for (const f of out) {
    const prev = groups[groups.length - 1];
    const between = prev ? lines.slice(prev.at(-1).end + 1, f.start).every((l) => !l.trim()) : false;
    if (prev && between && CODE.includes(f.lang) && CODE.includes(prev[0].lang) && !prev.some((p) => p.lang === f.lang) && prev[0].block === f.block) prev.push(f);
    else if (prev && between && f.lang === 'stdin' && CODE.includes(prev[0].lang)) prev.stdin = f.code;
    else groups.push([f]);
  }
  return groups;
}

// Markdown tables: every row as many cells as the header (an unescaped | inside `code` splits a cell)
function checkTables(src, where) {
  const lines = String(src).split('\n');
  let head = null;
  let inFence = false;
  for (const l of lines) {
    if (/^~~~/.test(l)) inFence = !inFence;
    if (inFence) continue;
    const t = l.trim();
    if (!t.startsWith('|')) {
      head = null;
      continue;
    }
    const cells = t.replace(/\\\|/g, '').replace(/^\||\|$/g, '').split('|').length;
    if (head === null) head = cells;
    else if (cells !== head) fail(where, `table row has ${cells} cells, header ${head}: ${t.slice(0, 80)}`);
  }
}

// what a reader of each language sees: no word about the other languages, no table that loses
// its only language column, no leftover [[…]] markers
const OTHER = { python: /Python\w*/, cpp: /C\+\+/, java: /\bJav(?:a|ie|y|ę|ą)\b/, all: /(trzech|wszystkich|obu|innych) języka|język(ach|ami) programowania/ };
function checkReaders(src, where, langs = CODE) {
  for (const l of langs) {
    const text = LG.forLang(String(src), l, { tables: false });
    if (/\[\[(python|cpp|java)/.test(text)) fail(`${where} (${l})`, 'a [[…]] language marker is not closed');
    const prose = LG.forLang(String(src), l).replace(/^~~~[\s\S]*?^~~~\s*$/gm, '');
    for (const [other, re] of Object.entries(OTHER)) {
      if (other === l) continue;
      const m = prose.match(re);
      if (m) fail(`${where} (${l})`, `the ${l} reader sees "${m[0]}": …${excerpt(prose.slice(Math.max(0, m.index - 60), m.index + 40))}…`);
    }
    // a table with language columns needs one for this reader
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].trim().startsWith('|') || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) continue;
      const who = lines[i].trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(LG.columnLangs);
      if (who.some(Boolean) && !who.some((w) => w?.includes(l))) fail(`${where} (${l})`, `table has no column for ${l}: ${lines[i].trim().slice(0, 80)}`);
    }
    checkTables(LG.forLang(String(src), l), `${where} (${l})`);
  }
}

async function checkExamples(src, ctx, where, langs = CODE) {
  checkTables(src, where);
  checkReaders(src, where, langs);
  for (const g of fences(src, where)) {
    const flags = g.flatMap((f) => f.flags);
    const l0 = g[0].lang;
    // every reader who sees the example sees it in their language
    if (CODE.includes(l0)) {
      const readers = (g[0].block || CODE).filter((l) => langs.includes(l));
      const have = g.map((f) => f.lang);
      const missing = readers.filter((l) => !have.includes(l));
      const unseen = have.filter((l) => !readers.includes(l));
      if (missing.length) fail(where, `example ${have.join('/')} has no ${missing.join('/')} version (or put it in a ":::${have.join(' ')}" block)`);
      if (unseen.length) fail(where, `the ${unseen.join('/')} version of an example is never shown (it is in a ":::${(g[0].block || []).join(' ')}" block)`);
      if (flags.includes('only')) fail(where, '"only" is gone: put a one-language example in a ":::lang" block');
    }
    if (!flags.includes('run')) continue;
    if (CODE.includes(l0)) {
      let first = null;
      for (const f of g) {
        if (!LANGS.includes(f.lang)) continue;
        checks++;
        const r = await run(f.lang, f.code, g.stdin, ctx.files);
        if (r.error) fail(`${where} example ${f.lang}`, excerpt(r.error));
        else if (r.code !== 0) fail(`${where} example ${f.lang}`, `exit ${r.code}: ${excerpt(r.stderr)}`);
        else if (first && !flags.includes('differs') && !C.outputMatches(first.out, r.stdout)) fail(`${where} example ${f.lang}`, `prints "${excerpt(r.stdout)}" but ${first.lang} prints "${excerpt(first.out)}"`);
        else first ||= { lang: f.lang, out: r.stdout };
      }
    } else if (l0 === 'sql') {
      checks++;
      if (!ctx.db) fail(where, 'SQL example but the lesson has no db');
      else {
        const r = runSql(ctx.db, g[0].code);
        if (r.error) fail(`${where} sql example`, `${r.error}: ${excerpt(g[0].code)}`);
      }
    } else if (l0 === 'excel') {
      for (const line of g[0].code.split('\n').map((x) => x.trim()).filter((x) => x.startsWith('='))) {
        checks++;
        if (!ctx.sheet) fail(where, 'formula example but the lesson has no sheet');
        else {
          const r = calcFormula(ctx.sheet.data, line);
          if (r.error) fail(`${where} formula`, `${line}: ${r.error}`);
        }
      }
    }
  }
}

// ---- questions ------------------------------------------------------------------------------------

const TYPES = ['choice', 'tf', 'input', 'code', 'sql', 'sheet'];
async function checkQuestion(q, ctx, where) {
  checks++;
  if (!TYPES.includes(q.type)) return fail(where, `unknown type ${q.type}`);
  if (q.langs && (!q.langs.length || q.langs.some((l) => !CODE.includes(l)))) fail(where, `bad langs ${JSON.stringify(q.langs)}`);
  const readers = q.langs || CODE;
  if (!q.q) fail(where, 'no question text');
  if (!q.explain) fail(where, 'no explanation');
  await checkExamples(q.q || '', ctx, where, readers);
  if (q.explain) await checkExamples(q.explain, ctx, where + ' explanation', readers);
  for (const [k, o] of (q.options || []).entries()) checkReaders(o, `${where} option ${k + 1}`, readers);
  for (const [k, it] of (q.items || []).entries()) checkReaders(it.text || '', `${where} item ${k + 1}`, readers);
  if (q.type === 'choice') {
    if (!(q.options?.length >= 2)) fail(where, 'needs at least two options');
    const ans = Array.isArray(q.answer) ? q.answer : [q.answer];
    if (!ans.length || ans.some((a) => !Number.isInteger(a) || a < 0 || a >= q.options.length)) fail(where, `bad answer ${JSON.stringify(q.answer)}`);
  }
  if (q.type === 'tf') {
    if (!q.items?.length || q.items.some((it) => !it.text || typeof it.answer !== 'boolean')) fail(where, 'items need text and a true/false answer');
  }
  if (q.type === 'input') {
    const ids = [...String(q.q).matchAll(/\{\{([\w-]+)/g)].map((m) => m[1]);
    if (ids.length) {
      if (typeof q.answer !== 'object' || Array.isArray(q.answer)) fail(where, 'fields in the text need an answer per field');
      else for (const id of ids) if (q.answer[id] == null) fail(where, `no answer for field ${id}`);
    } else if (q.answer == null || q.answer === '' || (typeof q.answer === 'object' && !Array.isArray(q.answer))) fail(where, 'no answer');
  }
  if (q.type === 'code') {
    if (!(q.tests?.length >= 3)) fail(where, 'needs at least 3 tests');
    for (const l of readers) if (!q.solution?.[l]) fail(where, `no ${l} solution`);
    for (const l of LANGS.filter((x) => readers.includes(x))) {
      const code = q.solution?.[l];
      if (!code) continue;
      for (let i = 0; i < (q.tests || []).length; i++) {
        const t = q.tests[i];
        const r = await run(l, code, t.input, { ...(ctx.files || {}), ...(t.files || {}) });
        if (r.error) {
          fail(`${where} ${l}`, excerpt(r.error));
          break;
        }
        if (r.code !== 0 || r.timedOut) fail(`${where} ${l} test ${i + 1}`, `exit ${r.code}${r.timedOut ? ' (timeout)' : ''}: ${excerpt(r.stderr)}`);
        else if (!L.outputOk(t.output, r.stdout)) fail(`${where} ${l} test ${i + 1}`, `expected "${excerpt(t.output)}", got "${excerpt(r.stdout)}"`);
      }
    }
  }
  if (q.type === 'sql') {
    const db = q.db || ctx.db;
    if (!db) return fail(where, 'no database');
    if (!q.solution) return fail(where, 'no solution');
    const r = runSql(db, q.solution);
    if (r.error) fail(where, `solution: ${r.error}`);
    else if (!r.result.values.length && !q.allowEmpty) fail(where, 'solution gives no rows');
    else if (q.expect && !L.sqlSame(r.result, { columns: r.result.columns, values: q.expect }, { ordered: q.ordered }).ok) fail(where, `solution gives ${JSON.stringify(r.result.values).slice(0, 200)}, expected ${JSON.stringify(q.expect).slice(0, 200)}`);
  }
  if (q.type === 'sheet') {
    const data = q.data || ctx.sheet?.data;
    if (!data) return fail(where, 'no data');
    if (!q.cell || !q.solution) return fail(where, 'needs cell and solution');
    const r = evalFormula({ data, formula: q.solution, cell: q.cell, fill: q.fill });
    if (r.error) fail(where, `solution: ${r.error}`);
    else if (r.values.some(isErr)) fail(where, `solution gives an error value: ${JSON.stringify(r.values.find(isErr))}`);
    else if (q.expect !== undefined) {
      const want = Array.isArray(q.expect) ? q.expect : [q.expect];
      if (!L.sheetSame(r.values, want)) fail(where, `solution gives ${JSON.stringify(r.values).slice(0, 200)}, expected ${JSON.stringify(want).slice(0, 200)}`);
    }
  }
}

// ---- lessons and tests --------------------------------------------------------------------------

const sections = (await import(pathToFileURL(path.join(CONTENT, 'lessons/index.js')).href)).default;
const allIds = new Set();
let lessonCount = 0;
for (const section of sections) {
  if (wanted.length && !wanted.includes(section.id)) continue;
  for (const id of section.lessons) {
    const where = `${section.id}/${id}`;
    if (allIds.has(id)) fail(where, 'duplicate lesson id');
    allIds.add(id);
    const file = path.join(CONTENT, 'lessons', section.id, id + '.js');
    if (!fs.existsSync(file)) {
      fail(where, 'missing lesson file');
      continue;
    }
    const lesson = (await import(pathToFileURL(file).href)).default;
    lessonCount++;
    for (const k of ['title', 'summary', 'intro']) if (!lesson[k]) fail(where, `no ${k}`);
    for (const k of ['title', 'summary']) checkReaders(lesson[k] || '', `${where} ${k}`);
    await checkExamples(lesson.intro || '', { files: lesson.files, db: lesson.db, sheet: lesson.sheet }, `${where} intro`);
    if (!(lesson.minutes > 0)) fail(where, 'no minutes');
    if (!(lesson.steps?.length >= 2)) fail(where, 'needs at least two steps');
    for (const l of CODE) if (!(LG.questionsFor(lesson.quiz || [], l).length >= 4)) fail(where, `needs at least four quiz questions in ${l}`);
    if (!lesson.practice?.length) fail(where, 'no practice tasks');
    for (const key of lesson.practice || []) if (!taskKeys.has(key)) fail(where, `practice task ${key} does not exist`);
    const ctx = { files: lesson.files, db: lesson.db, sheet: lesson.sheet };
    for (const [i, s] of (lesson.steps || []).entries()) {
      if (!s.title || !s.body) fail(`${where} step ${i + 1}`, 'needs a title and a body');
      await checkExamples(s.body, ctx, `${where} step ${i + 1}`);
    }
    for (const [i, q] of (lesson.quiz || []).entries()) await checkQuestion(q, ctx, `${where} quiz ${i + 1}`);
  }
  const testFile = path.join(CONTENT, 'lessons', section.id, 'test.js');
  if (!fs.existsSync(testFile)) {
    fail(section.id, 'no section test');
    continue;
  }
  const test = (await import(pathToFileURL(testFile).href)).default;
  for (const l of CODE) if (!(LG.questionsFor(test.questions || [], l).length >= 8)) fail(`${section.id} test`, `needs at least 8 questions in ${l}`);
  checkReaders(section.desc || '', `${section.id} description`);
  const ctx = { files: test.files, db: test.db, sheet: test.sheet };
  for (const [i, q] of (test.questions || []).entries()) {
    if (!section.lessons.includes(q.lesson)) fail(`${section.id} test ${i + 1}`, `lesson "${q.lesson}" is not in the section`);
    await checkQuestion(q, ctx, `${section.id} test ${i + 1}`);
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${lessonCount} lessons, ${checks} checks, ${failures} problem(s)`);
process.exit(failures ? 1 : 0);
