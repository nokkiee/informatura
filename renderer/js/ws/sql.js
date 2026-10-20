// SQL workspace: an in-memory SQLite database (sql.js) built from the task's data files,
// a query editor and a result grid. Several MySQL/Access functions are added so queries
// written the way they are at the exam (YEAR(), LEFT(), TOP 5, #2020-01-01#, …) work too.
import { h, btn, icon, clear, toast, splitter, modal, loadUmd } from '../ui.js';
import { loadMonaco, editorOptions } from '../monaco.js';
import { fetchData } from '../content.js';

let sqlPromise = null;
function loadSqlJs() {
  if (!sqlPromise) sqlPromise = loadUmd('vendor/sqljs/sql-wasm.js').then(() => window.initSqlJs({ locateFile: (f) => 'vendor/sqljs/' + f }));
  return sqlPromise;
}

// ---- loading text files into tables -----------------------------------------------------

export function parseTable(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  const sep = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : /\s{2,}/;
  const split = (l) => (typeof sep === 'string' ? l.split(sep) : l.trim().split(sep)).map((c) => c.trim());
  const header = split(lines[0]);
  const rows = lines.slice(1).map(split);
  return { header, rows };
}

const RE_INT = /^-?\d+$/;
const RE_NUM = /^-?\d+([.,]\d+)?$/;
const RE_DMY = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
const RE_ISO = /^\d{4}-\d{2}-\d{2}$/;
const RE_BOOL = /^(true|false|prawda|fałsz)$/i;

export function inferColumn(values) {
  const vals = values.filter((v) => v !== '' && v != null);
  if (!vals.length) return 'TEXT';
  if (vals.every((v) => RE_INT.test(v) && !(v.length > 1 && /^-?0/.test(v)))) return 'INTEGER';
  if (vals.every((v) => RE_NUM.test(v) && !/^-?0\d/.test(v))) return 'REAL';
  if (vals.every((v) => RE_DMY.test(v) || RE_ISO.test(v))) return 'DATE';
  if (vals.every((v) => RE_BOOL.test(v))) return 'BOOLEAN';
  return 'TEXT';
}

export function convertValue(v, type) {
  if (v === '' || v == null) return null;
  if (type === 'INTEGER') return Number(v);
  if (type === 'REAL') return Number(v.replace(',', '.'));
  if (type === 'DATE') {
    const m = v.match(RE_DMY);
    return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : v;
  }
  if (type === 'BOOLEAN') return /^(true|prawda)$/i.test(v) ? 1 : 0;
  return v;
}

function parseDate(v) {
  if (v == null) return null;
  const s = String(v);
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  m = s.match(RE_DMY);
  if (m) return new Date(Date.UTC(+m[3], +m[2] - 1, +m[1]));
  return null;
}

const DAY = 86400000;

function registerFunctions(db) {
  const f = (name, fn) => db.create_function(name, fn);
  f('YEAR', (d) => parseDate(d)?.getUTCFullYear() ?? null);
  f('MONTH', (d) => (parseDate(d) ? parseDate(d).getUTCMonth() + 1 : null));
  f('DAY', (d) => parseDate(d)?.getUTCDate() ?? null);
  f('DAYOFWEEK', (d) => (parseDate(d) ? parseDate(d).getUTCDay() + 1 : null)); // MySQL: 1 = niedziela
  f('WEEKDAY', (d) => (parseDate(d) ? (parseDate(d).getUTCDay() + 6) % 7 : null)); // MySQL: 0 = poniedziałek
  f('DATEDIFF', (a, b, c) => {
    // MySQL: DATEDIFF(a, b) = a − b w dniach. Access: DateDiff("d", a, b) = b − a.
    if (c !== undefined && typeof a === 'string' && /^[a-z]+$/i.test(a)) {
      const x = parseDate(b);
      const y = parseDate(c);
      if (!x || !y) return null;
      const unit = a.toLowerCase();
      if (unit === 'yyyy') return y.getUTCFullYear() - x.getUTCFullYear();
      if (unit === 'm') return (y.getUTCFullYear() - x.getUTCFullYear()) * 12 + y.getUTCMonth() - x.getUTCMonth();
      return Math.round((y - x) / DAY);
    }
    const x = parseDate(a);
    const y = parseDate(b);
    return x && y ? Math.round((x - y) / DAY) : null;
  });
  f('LEFT', (s, n) => (s == null ? null : String(s).slice(0, Math.max(0, n))));
  f('RIGHT', (s, n) => (s == null ? null : n > 0 ? String(s).slice(-n) : ''));
  f('MID', (s, start, len) => (s == null ? null : len == null ? String(s).slice(start - 1) : String(s).substr(start - 1, len)));
  f('LEN', (s) => (s == null ? null : String(s).length));
  f('CHAR_LENGTH', (s) => (s == null ? null : String(s).length));
  f('UCASE', (s) => (s == null ? null : String(s).toUpperCase()));
  f('LCASE', (s) => (s == null ? null : String(s).toLowerCase()));
  f('CONCAT', (...a) => (a.some((x) => x == null) ? null : a.join('')));
  f('TRUNCATE', (x, d = 0) => (x == null ? null : Math.trunc(x * 10 ** d) / 10 ** d));
  f('FIX', (x) => (x == null ? null : Math.trunc(x)));
  f('INT', (x) => (x == null ? null : Math.floor(x)));
  // math functions are missing from some SQLite builds
  const probe = (expr) => {
    try {
      db.exec('SELECT ' + expr);
      return true;
    } catch {
      return false;
    }
  };
  if (!probe('floor(1.5)')) {
    f('FLOOR', (x) => (x == null ? null : Math.floor(x)));
    f('CEIL', (x) => (x == null ? null : Math.ceil(x)));
    f('CEILING', (x) => (x == null ? null : Math.ceil(x)));
    f('POWER', (a, b) => (a == null || b == null ? null : a ** b));
    f('POW', (a, b) => (a == null || b == null ? null : a ** b));
    f('SQRT', (x) => (x == null ? null : Math.sqrt(x)));
    f('MOD', (a, b) => (a == null || b == null ? null : a % b));
    f('LOG10', (x) => (x == null ? null : Math.log10(x)));
    f('LN', (x) => (x == null ? null : Math.log(x)));
  }
}

// Rewrites a few Access/MySQL idioms into SQLite.
export function dialectFix(sql) {
  let s = sql;
  // #2020-05-01# and #01.05.2020# date literals (Access)
  s = s.replace(/#(\d{4})-(\d{1,2})-(\d{1,2})#/g, (_, y, m, d) => `'${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}'`);
  s = s.replace(/#(\d{1,2})[./](\d{1,2})[./](\d{4})#/g, (_, d, m, y) => `'${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}'`);
  // SELECT TOP n … -> SELECT … LIMIT n (only for simple single statements)
  const top = s.match(/^\s*select\s+(distinct\s+)?top\s+(\d+)\s+/i);
  if (top && !/\blimit\b/i.test(s) && (s.match(/;/g) || []).length <= 1) {
    s = s.replace(/^\s*select\s+(distinct\s+)?top\s+\d+\s+/i, (m0, dist) => `SELECT ${dist || ''}`);
    s = s.replace(/;?\s*$/, ` LIMIT ${top[2]};`);
  }
  // LIKE "*abc*" (Access) -> LIKE '%abc%'
  s = s.replace(/\blike\s+(["'])([^"']*)\1/gi, (m0, q, pat) => (pat.includes('*') && !pat.includes('%') ? `LIKE ${q}${pat.replace(/\*/g, '%').replace(/\?/g, '_')}${q}` : m0));
  return s;
}

export async function buildDatabase(exam, group, extraTables) {
  const SQL = await loadSqlJs();
  const db = new SQL.Database();
  registerFunctions(db);
  const schema = [];
  for (const [table, file] of Object.entries(group.tables || {})) {
    const { header, rows } = parseTable(await fetchData(exam, file));
    const types = header.map((_, i) => inferColumn(rows.map((r) => r[i])));
    db.run(`CREATE TABLE "${table}" (${header.map((c, i) => `"${c}" ${types[i]}`).join(', ')})`);
    const stmt = db.prepare(`INSERT INTO "${table}" VALUES (${header.map(() => '?').join(',')})`);
    db.run('BEGIN');
    for (const r of rows) stmt.run(header.map((_, i) => convertValue(r[i] ?? '', types[i])));
    db.run('COMMIT');
    stmt.free();
    schema.push({ name: table, file, columns: header.map((c, i) => ({ name: c, type: types[i] })), rows: rows.length });
  }
  for (const [table, cols] of Object.entries(extraTables || {})) {
    db.run(`CREATE TABLE "${table}" (${cols.join(', ')})`);
    schema.push({
      name: table,
      extra: true,
      columns: cols.map((c) => ({ name: c.split(/\s+/)[0], type: c.split(/\s+/)[1] || '' })),
      rows: 0,
    });
  }
  return { db, schema };
}

// Columns with the same name in two tables are most likely how they're related.
export function guessRelations(schema) {
  const rel = [];
  for (let i = 0; i < schema.length; i++)
    for (let j = i + 1; j < schema.length; j++)
      for (const c of schema[i].columns)
        if (schema[j].columns.some((d) => d.name.toLowerCase() === c.name.toLowerCase()) && /^(id|kod|nr|pesel)/i.test(c.name))
          rel.push(`${schema[i].name}.${c.name} ↔ ${schema[j].name}.${c.name}`);
  return rel;
}

export function resultToText(res) {
  if (!res) return '';
  return res.values.map((r) => r.map((v) => (v == null ? '' : typeof v === 'number' ? fmtNum(v) : String(v))).join('\t')).join('\n');
}

function fmtNum(v) {
  if (Number.isInteger(v)) return String(v);
  return String(Math.round(v * 1e10) / 1e10);
}

// ---- UI ------------------------------------------------------------------------------------

export function createSqlWorkspace(container, ctx) {
  const { entry, state } = ctx;
  const group = entry.group;
  let db = null;
  let schema = [];
  let editor = null;
  let monaco = null;
  let disposed = false;
  let completion = null;

  const runBtn = btn('Wykonaj', { icon: 'play', kind: 'primary', kbd: 'Ctrl+⏎', onClick: () => runQuery() });
  const resetBtn = h('button', { class: 'icon-btn', title: 'Przywróć bazę do stanu początkowego (cofa INSERT/UPDATE/DELETE)', onclick: () => rebuild(true) }, icon('refresh'));
  const schemaBtn = btn('Schemat', { icon: 'db', small: true, onClick: () => showSchema() });
  const toolbar = h('div', { class: 'ws-toolbar' }, h('span', { class: 'ws-label' }, icon('db'), ' SQL (SQLite)'), runBtn, h('div', { class: 'grow' }), schemaBtn, resetBtn);

  const side = h('div', { class: 'sql-side' }, h('div', { class: 'loading-line' }, 'Wczytywanie bazy…'));
  const editorBox = h('div', { class: 'editor-box sql-editor' });
  const resultHead = h('div', { class: 'result-head' }, h('span', { class: 'muted' }, 'Wynik zapytania pojawi się tutaj.'));
  const resultBody = h('div', { class: 'result-body' });
  const results = h('div', { class: 'ws-bottom sql-results' }, resultHead, resultBody);
  const split = h('div', { class: 'hsplit' });
  const main = h('div', { class: 'sql-main' }, editorBox, split, results);
  const root = h('div', { class: 'ws ws-sql' }, toolbar, h('div', { class: 'sql-wrap' }, side, main));
  clear(container).appendChild(root);
  results.style.height = (state.sqlResultHeight || 260) + 'px';
  splitter(split, {
    vertical: true,
    min: 80,
    max: () => main.getBoundingClientRect().height - 80,
    onResize: (size) => {
      const hb = Math.max(80, main.getBoundingClientRect().height - split.offsetHeight - size);
      results.style.height = hb + 'px';
      state.sqlResultHeight = hb;
    },
  });

  async function rebuild(announce) {
    try {
      db?.close();
      ({ db, schema } = await buildDatabase(entry.exam, group, ctx.extraTables));
      if (disposed) return db.close();
      renderSide();
      registerCompletion();
      if (announce) toast('Baza przywrócona do stanu początkowego', 'info');
    } catch (e) {
      clear(side).appendChild(h('div', { class: 'con-err-title' }, 'Nie udało się wczytać bazy: ' + e.message));
    }
  }

  function renderSide() {
    clear(side);
    side.appendChild(h('div', { class: 'side-title' }, 'Tabele'));
    for (const t of schema) {
      const cols = h(
        'ul',
        { class: 'cols' },
        t.columns.map((c) => h('li', { title: 'Kliknij, aby wstawić nazwę pola', onclick: () => insertText(c.name) }, h('span', null, c.name), h('span', { class: 'ctype' }, c.type.toLowerCase()))),
      );
      side.appendChild(
        h(
          'div',
          { class: 'tbl-item' },
          h(
            'div',
            { class: 'tbl-name' },
            h('button', { class: 'link', title: 'Wstaw nazwę tabeli', onclick: () => insertText(t.name) }, icon('table', 14), ' ', t.name),
            t.extra ? h('span', { class: 'tag' }, 'pusta') : h('span', { class: 'muted small' }, `${t.rows} w.`),
            h('button', { class: 'icon-btn small', title: 'Podgląd zawartości', onclick: () => runQuery(`SELECT * FROM "${t.name}" LIMIT 200;`, true) }, icon('eye', 14)),
          ),
          cols,
        ),
      );
    }
    const rel = guessRelations(schema);
    if (rel.length) side.appendChild(h('div', { class: 'side-note' }, h('div', { class: 'side-title' }, 'Powiązania'), rel.map((r) => h('div', { class: 'small' }, r))));
    side.appendChild(
      h(
        'div',
        { class: 'side-note small muted' },
        'Dialekt: SQLite. Działają też m.in. YEAR(), MONTH(), DAY(), DATEDIFF(), LEFT(), RIGHT(), MID(), LEN(), CONCAT(), IIF(), TOP n oraz daty #2020-01-31#. Daty są zapisane jako tekst rrrr-mm-dd.',
      ),
    );
  }

  function insertText(t) {
    if (!editor) return;
    editor.trigger('kbd', 'type', { text: t });
    editor.focus();
  }

  function registerCompletion() {
    if (!monaco) return;
    completion?.dispose();
    completion = monaco.languages.registerCompletionItemProvider('sql', {
      provideCompletionItems(model, position) {
        if (model !== editor?.getModel()) return { suggestions: [] };
        const word = model.getWordUntilPosition(position);
        const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: word.startColumn, endColumn: word.endColumn };
        const s = [];
        for (const t of schema) {
          s.push({ label: t.name, kind: monaco.languages.CompletionItemKind.Struct, insertText: t.name, range, detail: 'tabela' });
          for (const c of t.columns) s.push({ label: c.name, kind: monaco.languages.CompletionItemKind.Field, insertText: c.name, range, detail: `${t.name} · ${c.type.toLowerCase()}` });
        }
        return { suggestions: s };
      },
    });
  }

  function showSchema() {
    const rel = guessRelations(schema);
    modal({
      title: 'Schemat bazy danych',
      wide: true,
      body: h(
        'div',
        { class: 'schema-view' },
        h(
          'div',
          { class: 'schema-tables' },
          schema.map((t) =>
            h(
              'div',
              { class: 'schema-card' },
              h('div', { class: 'schema-card-head' }, t.name, t.file ? h('span', { class: 'muted small' }, ' ' + t.file) : h('span', { class: 'tag' }, 'pusta')),
              t.columns.map((c) => h('div', { class: 'schema-col' }, h('span', null, c.name), h('span', { class: 'ctype' }, c.type.toLowerCase()))),
            ),
          ),
        ),
        rel.length ? h('div', { class: 'pad' }, h('b', null, 'Prawdopodobne powiązania: '), rel.join(', ')) : null,
      ),
    });
  }

  function renderResult(res, ms, changes) {
    clear(resultBody);
    clear(resultHead);
    if (!res) {
      resultHead.appendChild(h('span', { class: 'ok-text' }, icon('check', 14), ` Wykonano (${changes} zmienionych wierszy) · ${ms} ms`));
      return;
    }
    const n = res.values.length;
    resultHead.appendChild(h('span', null, `${n} ${n === 1 ? 'wiersz' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? 'wiersze' : 'wierszy'} · ${ms} ms`));
    const LIMIT = 1000;
    const table = h('table', { class: 'grid-table' });
    table.appendChild(h('thead', null, h('tr', null, h('th', { class: 'rn' }, '#'), res.columns.map((c) => h('th', null, c)))));
    const tb = h('tbody');
    res.values.slice(0, LIMIT).forEach((r, i) =>
      tb.appendChild(
        h(
          'tr',
          null,
          h('td', { class: 'rn' }, String(i + 1)),
          r.map((v) => h('td', { class: typeof v === 'number' ? 'num' : v == null ? 'null' : '' }, v == null ? 'NULL' : typeof v === 'number' ? fmtNum(v).replace('.', ',') : String(v))),
        ),
      ),
    );
    table.appendChild(tb);
    resultBody.appendChild(table);
    if (n > LIMIT) resultBody.appendChild(h('div', { class: 'muted small pad' }, `Pokazano pierwsze ${LIMIT} wierszy z ${n}.`));
  }

  function runQuery(sqlText, preview = false) {
    if (!db) return;
    let sql = sqlText ?? (editor ? selectedOrAll() : state.sql || '');
    if (!sql.trim()) return;
    sql = dialectFix(sql);
    const t0 = performance.now();
    try {
      const before = db.getRowsModified();
      const out = db.exec(sql);
      const ms = Math.round(performance.now() - t0);
      const last = out.length ? out[out.length - 1] : null;
      renderResult(last, ms, db.getRowsModified() - before);
      if (last && !preview) ctx.onOutput?.(resultToText(last), 'wynik zapytania');
      ctx.onSqlResult?.({ ok: true, rows: last ? last.values.length : 0 });
    } catch (e) {
      clear(resultBody);
      clear(resultHead);
      resultHead.appendChild(h('span', { class: 'bad-text' }, icon('x', 14), ' Błąd'));
      resultBody.appendChild(h('pre', { class: 'stderr-block' }, translateError(e.message)));
      ctx.onSqlResult?.({ ok: false, error: e.message });
    }
  }

  function selectedOrAll() {
    const sel = editor.getSelection();
    const text = sel && !sel.isEmpty() ? editor.getModel().getValueInRange(sel) : editor.getValue();
    return text;
  }

  const starter =
    ctx.starter ||
    `-- Zadanie ${entry.task.no}\n-- Tabele: ${Object.keys(group.tables || {})
      .concat(Object.keys(ctx.extraTables || {}))
      .join(', ')}\n\nSELECT *\nFROM ${Object.keys(group.tables || {})[0] || 'tabela'}\nLIMIT 10;\n`;

  loadMonaco().then((m) => {
    if (disposed) return;
    monaco = m;
    editor = monaco.editor.create(editorBox, editorOptions({ value: state.sql ?? starter, language: 'sql', tabSize: 2 }));
    editor.onDidChangeModelContent(() => {
      state.sql = editor.getValue();
      ctx.save();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runQuery());
    registerCompletion();
    if (ctx.focus !== false) editor.focus();
  });
  rebuild(false);

  return {
    destroy() {
      disposed = true;
      completion?.dispose();
      db?.close();
      if (editor) {
        editor.getModel()?.dispose();
        editor.dispose();
      }
    },
    run: () => runQuery(),
  };
}

function translateError(msg) {
  return msg
    .replace(/^no such table: (.*)/, 'Nie ma tabeli: $1')
    .replace(/^no such column: (.*)/, 'Nie ma pola (kolumny): $1')
    .replace(/^near "(.*)": syntax error/, 'Błąd składni w pobliżu „$1”')
    .replace(/^incomplete input/, 'Niedokończone zapytanie')
    .replace(/^ambiguous column name: (.*)/, 'Niejednoznaczna nazwa pola: $1 (dodaj nazwę tabeli, np. tabela.$1)')
    .replace(/^misuse of aggregate: (.*)/, 'Niepoprawne użycie funkcji agregującej: $1')
    .replace(/^no such function: (.*)/, 'Nieznana funkcja: $1');
}
