// Running the lessons' examples and exercises: programs (the same runner as the tasks, with the
// lesson's data files written next to the program), SQL queries on a lesson's small database
// and spreadsheet formulas on a lesson's data.
import { loadSqlJs, registerFunctions, dialectFix, parseTable, inferColumn, convertValue, translateError } from '../ws/sql.js';
import { loadHyperFormula, hfConfig, parseAddr } from '../sheet/engine.js';
import { outputOk } from './check.js';

// ---- programs ------------------------------------------------------------------------------

const fileList = (files) => Object.entries(files || {}).map(([name, text]) => ({ name, text }));

// Runs `code` once per test ({input, files, output}). Files: the lesson's, plus the test's own.
// Returns { error | compileError | missingToolchain } or { results: [{ok, stdout, stderr, timedOut}] }.
export async function runCode({ lang, code, tests, files }) {
  const results = new Array(tests.length);
  // tests with the same files run together, in one workspace
  const groups = new Map();
  tests.forEach((t, i) => {
    const all = { ...(files || {}), ...(t.files || {}) };
    const key = JSON.stringify(all);
    if (!groups.has(key)) groups.set(key, { files: all, idx: [] });
    groups.get(key).idx.push(i);
  });
  for (const g of groups.values()) {
    const res = await window.api.runTests({ lang, code, tests: g.idx.map((i) => ({ input: tests[i].input ?? '' })), files: fileList(g.files), timeoutMs: 5000 });
    if (res.error || res.compileError) return res;
    g.idx.forEach((i, k) => {
      const r = res.results[k];
      results[i] = { ...r, ok: !r.timedOut && outputOk(tests[i].output, r.stdout) };
    });
  }
  return { results };
}

// Runs an example once and gives back what it printed.
export async function runExample({ lang, code, input, files }) {
  const res = await window.api.runTests({ lang, code, tests: [{ input: input ?? '' }], files: fileList(files), timeoutMs: 8000 });
  if (res.error || res.compileError) return res;
  return res.results[0];
}

// ---- SQL ---------------------------------------------------------------------------------

const dbs = new WeakMap();

// spec: { tableName: "header;…\nrow;…" }; built once per spec
export function lessonDb(spec) {
  if (!dbs.has(spec)) {
    dbs.set(
      spec,
      loadSqlJs().then((SQL) => {
        const db = new SQL.Database();
        registerFunctions(db);
        for (const [name, text] of Object.entries(spec)) {
          const { header, rows } = parseTable(text);
          const types = header.map((_, i) => inferColumn(rows.map((r) => r[i])));
          db.run(`CREATE TABLE "${name}" (${header.map((c, i) => `"${c}" ${types[i]}`).join(', ')})`);
          const stmt = db.prepare(`INSERT INTO "${name}" VALUES (${header.map(() => '?').join(',')})`);
          for (const r of rows) stmt.run(header.map((_, i) => convertValue(r[i] ?? '', types[i])));
          stmt.free();
        }
        return db;
      }),
    );
  }
  return dbs.get(spec);
}

// The tables of a lesson database: [{ name, columns: [{name, type}], rows }]
export async function dbSchema(spec) {
  const db = await lessonDb(spec);
  return Object.keys(spec).map((name) => {
    const cols = db.exec(`PRAGMA table_info("${name}")`)[0].values.map((r) => ({ name: r[1], type: r[2] }));
    const n = db.exec(`SELECT COUNT(*) FROM "${name}"`)[0].values[0][0];
    return { name, columns: cols, rows: n };
  });
}

// Runs a query; changes (UPDATE, DELETE, …) are rolled back, so the database stays as it was.
// Returns { result: {columns, values} } (the last statement's) or { error }.
export async function runSql(spec, query) {
  const db = await lessonDb(spec);
  try {
    db.run('SAVEPOINT lesson');
    const res = db.exec(dialectFix(query));
    return { result: res[res.length - 1] || { columns: [], values: [] } };
  } catch (e) {
    return { error: translateError(e.message) };
  } finally {
    try {
      db.run('ROLLBACK TO lesson');
      db.run('RELEASE lesson');
    } catch {}
  }
}

// ---- spreadsheet ---------------------------------------------------------------------------

// Puts `data` (rows of values; dates as "2024-03-15") on a sheet, writes `formula` into `cell`,
// copies it down/right over `fill` (like dragging the fill handle) and returns the values of
// `fill` (or of the cell) – or { error } for a formula the engine can't read.
export async function evalFormula({ data, formula, cell, fill, lang = 'pl' }) {
  const HF = await loadHyperFormula();
  const hf = HF.buildFromArray(data.map((r) => r.slice()), hfConfig(lang));
  try {
    const a = parseAddr(cell);
    const at = { sheet: 0, row: a.r, col: a.c };
    if (!hf.validateFormula(formula)) return { error: 'Tej formuły nie da się odczytać – sprawdź nawiasy, średniki i nazwy funkcji.' };
    hf.setCellContents(at, formula);
    const [from, to] = (fill || cell).split(':').map(parseAddr);
    const end = to || from;
    hf.copy({ start: at, end: at });
    for (let r = from.r; r <= end.r; r++) {
      for (let c = from.c; c <= end.c; c++) if (r !== a.r || c !== a.c) hf.paste({ sheet: 0, row: r, col: c });
    }
    const values = [];
    for (let r = from.r; r <= end.r; r++) for (let c = from.c; c <= end.c; c++) values.push(hf.getCellValue({ sheet: 0, row: r, col: c }));
    return { values };
  } catch (e) {
    return { error: e.message };
  } finally {
    hf.destroy();
  }
}

// The values a sheet shows: data that holds formulas (helper columns a lesson fills in for the
// student) is computed; plain data comes back as it is.
export async function sheetValues(data, lang = 'pl') {
  if (!data.some((r) => r.some((v) => typeof v === 'string' && v.startsWith('=')))) return data;
  const HF = await loadHyperFormula();
  const hf = HF.buildFromArray(data.map((r) => r.slice()), hfConfig(lang));
  try {
    return hf.getSheetValues(0).map((r, i) => r.map((v, j) => (typeof data[i]?.[j] === 'string' && !data[i][j].startsWith('=') ? data[i][j] : v && typeof v === 'object' ? v.value : v)));
  } finally {
    hf.destroy();
  }
}

// a formula's result on its own (e.g. =SUMA(B2:B11)), for the ~~~excel run examples
export async function calcFormula({ data, formula, lang = 'pl' }) {
  const HF = await loadHyperFormula();
  const hf = HF.buildFromArray(data.map((r) => r.slice()), hfConfig(lang));
  try {
    if (!hf.validateFormula(formula)) return { error: 'Tej formuły nie da się odczytać.' };
    return { value: hf.calculateFormula(formula, 0) };
  } catch (e) {
    return { error: e.message };
  } finally {
    hf.destroy();
  }
}
