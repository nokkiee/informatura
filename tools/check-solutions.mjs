// Runs every model solution in content/solutions and grades its output the way the app grades
// a student's answer, so the code the hints reveal is known to be right:
//   - programs: on the task's data (full automatic points) and on the example data
//   - algorithm tasks: on the official examples and the generated tests, without banned built-ins
//   - SQL: on the task's database (full points); queries for "write a query" tasks must run
// Also checks that every code task has a solution in all three languages, and every SQL task one.
//   node tools/check-solutions.mjs [exam-id …] [--lang=python|cpp|java]
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath, pathToFileURL } from 'url';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'content');

// the renderer modules expect a browser around them
globalThis.window = { addEventListener() {}, api: {} };
globalThis.localStorage = { getItem: () => null, setItem() {} };

const runner = require(path.join(ROOT, 'src', 'runner.js'));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'informatura-sol-'));
runner.init({ contentDir: CONTENT, workDir: () => path.join(tmp, 'ws'), cacheDir: () => path.join(tmp, 'cache'), settings: () => ({}), send() {} });

const C = await import(pathToFileURL(path.join(ROOT, 'renderer/js/check.js')).href);
const A = await import(pathToFileURL(path.join(ROOT, 'renderer/js/algo.js')).href);
const S = await import(pathToFileURL(path.join(ROOT, 'renderer/js/ws/sql.js')).href);
const SQL = await require('sql.js')();

const args = process.argv.slice(2);
const onlyLang = (args.find((a) => a.startsWith('--lang=')) || '').slice(7) || null;
const ids = (await import(pathToFileURL(path.join(CONTENT, 'exams/index.js')).href)).default;
const wanted = args.filter((a) => !a.startsWith('--'));
const EXT = { python: 'py', cpp: 'cpp', java: 'java' };
const LANGS = onlyLang ? [onlyLang] : Object.keys(EXT);

let failures = 0;
let checked = 0;
const fail = (where, msg) => {
  failures++;
  console.log(`FAIL ${where}: ${msg}`);
};
const excerpt = (s) => String(s || '').trim().split('\n').slice(0, 8).join(' | ').slice(0, 300);

async function buildDb(exam, group, task) {
  const db = new SQL.Database();
  S.registerFunctions(db);
  for (const [table, file] of Object.entries(group.tables || {})) {
    const { header, rows } = S.parseTable(fs.readFileSync(path.join(CONTENT, 'data', exam.id, file), 'utf8'));
    const types = header.map((_, i) => S.inferColumn(rows.map((r) => r[i])));
    db.run(`CREATE TABLE "${table}" (${header.map((c, i) => `"${c}" ${types[i]}`).join(', ')})`);
    const stmt = db.prepare(`INSERT INTO "${table}" VALUES (${header.map(() => '?').join(',')})`);
    for (const r of rows) stmt.run(header.map((_, i) => S.convertValue(r[i] ?? '', types[i])));
    stmt.free();
  }
  for (const [table, cols] of Object.entries(task.extraColumns || {})) for (const c of cols) db.run(`ALTER TABLE "${table}" ADD COLUMN ${c}`);
  for (const [table, cols] of Object.entries(task.extraTables || {})) db.run(`CREATE TABLE "${table}" (${cols.join(', ')})`);
  return db;
}

for (const id of ids) {
  if (wanted.length && !wanted.includes(id)) continue;
  const exam = (await import(pathToFileURL(path.join(CONTENT, 'exams', id + '.js')).href)).default;
  const dir = path.join(CONTENT, 'solutions', id);
  for (const group of exam.groups) {
    const siblings = group.tasks.map((t) => t.no);
    const dataFiles = (map) => (group.files || []).map((f) => ({ name: f, src: `data/${id}/${(map && map[f]) || f}` }));
    for (const task of group.tasks) {
      const where = `${id} ${task.no}`;
      const auto = task.points - (task.self?.points || 0);

      if (task.kind === 'program' || task.kind === 'algorithm') {
        for (const lang of LANGS) {
          const file = path.join(dir, `${task.no}.${EXT[lang]}`);
          if (!fs.existsSync(file)) {
            fail(`${where} ${lang}`, 'no model solution');
            continue;
          }
          const code = fs.readFileSync(file, 'utf8');
          checked++;
          if (task.kind === 'program') {
            const res = await runner.runTests({ lang, code, tests: [{ input: '' }], files: dataFiles(), timeoutMs: 120000 });
            if (res.error || res.compileError) {
              fail(`${where} ${lang}`, excerpt(res.error || res.compileError));
              continue;
            }
            const out = res.results[0];
            if (out.code !== 0) {
              fail(`${where} ${lang}`, `exit ${out.code}${out.timedOut ? ' (timeout)' : ''}: ${excerpt(out.stderr)}`);
              continue;
            }
            const r = C.checkAnswer(out.stdout, task.expect, { taskNo: task.no, siblings, autoPoints: auto });
            if (r.points !== auto) fail(`${where} ${lang}`, `${r.points}/${auto} pkt for: ${excerpt(out.stdout)}`);
            if (task.example) {
              const ex = task.example;
              const exRes = await runner.runTests({ lang, code, tests: [{ input: '' }], files: dataFiles(ex.map), timeoutMs: 120000 });
              const exOut = exRes.results?.[0];
              let expected = ex.expect;
              if (ex.expectFile) expected = { parts: [{ lines: fs.readFileSync(path.join(CONTENT, 'data', id, ex.expectFile), 'utf8').trim().split(/\r?\n/), ordered: true, points: 1 }] };
              const ok = exOut && exOut.code === 0 && C.checkAnswer(exOut.stdout, expected, { taskNo: task.no, siblings, autoPoints: 1 }).ok;
              if (!ok) fail(`${where} ${lang}`, `example data: ${excerpt(exOut?.stdout || exRes.compileError)}`);
            }
          } else {
            const tests = A.buildTests(task.algo, `${id}/${task.no}`);
            const res = await runner.runTests({ lang, code, tests: tests.map((t) => ({ input: t.input })), timeoutMs: 10000 });
            if (res.error || res.compileError) {
              fail(`${where} ${lang}`, excerpt(res.error || res.compileError));
              continue;
            }
            const bad = tests.findIndex((t, i) => res.results[i].code !== 0 || !C.outputMatches(t.expected, res.results[i].stdout));
            if (bad >= 0) fail(`${where} ${lang}`, `test ${bad + 1} (${excerpt(tests[bad].input)}): expected ${tests[bad].expected}, got ${excerpt(res.results[bad].stdout || res.results[bad].stderr)}`);
            const banned = task.algo.noBuiltins ? A.bannedUses(task.algo.noBuiltins, lang, code) : [];
            if (banned.length) fail(`${where} ${lang}`, `uses banned built-ins: ${banned.map((b) => b.text).join(', ')}`);
          }
        }
      }

      if (task.kind === 'sql' || task.kind === 'sqlwrite') {
        const file = path.join(dir, `${task.no}.sql`);
        if (!fs.existsSync(file)) {
          fail(where, 'no model query');
          continue;
        }
        checked++;
        const db = await buildDb(exam, group, task);
        try {
          const out = db.exec(S.dialectFix(fs.readFileSync(file, 'utf8')));
          if (task.kind === 'sql') {
            const text = S.resultToText(out[out.length - 1]);
            const r = C.checkAnswer(text, task.expect, { taskNo: task.no, siblings, autoPoints: auto });
            if (r.points !== auto) fail(where, `${r.points}/${auto} pkt for: ${excerpt(text)}`);
          }
        } catch (e) {
          fail(where, 'SQL error: ' + e.message);
        }
        db.close();
      }
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${checked} model solutions checked, ${failures} problem(s)`);
process.exit(failures ? 1 : 0);
