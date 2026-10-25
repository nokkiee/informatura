// Lesson text: Markdown plus what the lessons need on top of it – one code example in several
// languages shown as tabs (the reader's language first), syntax colouring, examples that run
// right in the lesson (programs, SQL on the lesson's database, formulas on the lesson's sheet),
// coloured boxes, the lesson's tables and sheet.
import { h, icon, clear, esc } from '../ui.js';
import { md } from '../markdown.js';
import { getSettings, setSettings } from '../store.js';
import { LANGS } from '../algo.js';
import { loadMonaco, editorTheme } from '../monaco.js';
import { runExample, runSql, calcFormula, dbSchema, sheetValues } from './run.js';
import { displayValue, colName } from '../sheet/engine.js';

export const CODE_LANGS = ['python', 'cpp', 'java'];
const LABEL = { python: 'Python', cpp: 'C++', java: 'Java', sql: 'SQL', excel: 'Formuła', pseudo: 'Pseudokod', text: 'Tekst', stdin: 'Wejście' };
const CALLOUTS = { 'Uwaga:': 'warn', 'Wskazówka:': 'tip', 'Na maturze:': 'exam', 'Zapamiętaj:': 'key' };

// ctx: { files, db, sheet } of the lesson
export function renderLessonText(src, ctx = {}) {
  const el = h('div', { class: 'md lesson-md' });
  el.innerHTML = md(src);
  for (const bq of el.querySelectorAll('blockquote')) {
    const kind = CALLOUTS[bq.querySelector('p > strong:first-child')?.textContent.trim()];
    if (kind) bq.classList.add('callout', 'callout-' + kind);
  }
  buildExamples(el, ctx);
  colorize(el);
  return el;
}

// The example's code as written. Once colorized, the text on screen has no-break spaces, so the
// code to run or copy is kept aside.
const source = new WeakMap();
const codeOf = (pre) => source.get(pre) ?? pre.querySelector('code').textContent.replace(/\n$/, '');
const flagsOf = (pre) => (pre.dataset.flags || '').split(' ').filter(Boolean);

function buildExamples(root, ctx) {
  const pres = [...root.querySelectorAll('pre.code')];
  const used = new Set();
  for (const pre of pres) {
    if (used.has(pre)) continue;
    const lang = pre.dataset.lang;
    if (lang === 'sheet') {
      const box = h('div');
      pre.replaceWith(box);
      const rows = Number(flagsOf(pre)[0]) || 0;
      sheetValues(ctx.sheet?.data || []).then((v) => box.appendChild(sheetGrid(v, rows)));
      continue;
    }
    if (lang === 'db') {
      const box = h('div', { class: 'db-tables' });
      pre.replaceWith(box);
      if (ctx.db) showTables(box, ctx.db, flagsOf(pre));
      continue;
    }
    if (lang === 'stdin') continue; // taken by the example before it
    // the same example in several languages: consecutive python / cpp / java fences
    const group = [pre];
    if (CODE_LANGS.includes(lang)) {
      let next = pre.nextElementSibling;
      while (next?.matches('pre.code') && CODE_LANGS.includes(next.dataset.lang) && !group.some((g) => g.dataset.lang === next.dataset.lang)) {
        group.push(next);
        next = next.nextElementSibling;
      }
    }
    group.forEach((g) => used.add(g));
    const after = group[group.length - 1].nextElementSibling;
    const stdin = after?.matches('pre.code[data-lang="stdin"]') ? after : null;
    const ex = example(group, stdin ? codeOf(stdin) : null, ctx);
    pre.before(ex);
    group.forEach((g) => g.remove());
    stdin?.remove();
  }
}

function example(group, input, ctx) {
  const langs = group.map((p) => p.dataset.lang);
  const run = group.some((p) => flagsOf(p).includes('run'));
  const box = h('div', { class: 'ex', dataset: { langs: langs.join(' ') } });
  const bar = h('div', { class: 'ex-bar' });
  const out = h('div', { class: 'ex-out', hidden: true });
  const bodies = group.map((p) => {
    const b = h('pre', { class: 'ex-code', dataset: { lang: p.dataset.lang } }, h('code', null, codeOf(p)));
    source.set(b, codeOf(p));
    return b;
  });
  if (langs.length > 1 || CODE_LANGS.includes(langs[0])) {
    const tabs = h(
      'div',
      { class: 'ex-tabs' },
      langs.map((l) => h('button', { class: 'ex-tab', dataset: { lang: l }, onclick: () => setSettings({ lang: l }) }, LABEL[l] || l)),
    );
    bar.appendChild(tabs);
  } else {
    // ~~~text liczby.txt: a data file, labelled with its name
    const name = langs[0] === 'text' && flagsOf(group[0]).find((f) => f !== 'run');
    bar.appendChild(h('span', { class: 'ex-label' }, name ? h('span', null, icon('file', 13), ' ', name) : LABEL[langs[0]] || langs[0]));
  }
  bar.appendChild(h('div', { class: 'grow' }));
  bar.appendChild(
    h('button', { class: 'icon-btn small', title: 'Kopiuj', onclick: () => navigator.clipboard.writeText(codeOf(visible(box))) }, icon('copy', 14)),
  );
  if (run) {
    const isSql = langs[0] === 'sql';
    const isExcel = langs[0] === 'excel';
    const label = isSql ? 'Wykonaj' : isExcel ? 'Oblicz' : 'Uruchom';
    const go = h('button', { class: 'btn small primary' }, icon('play', 14), h('span', null, label));
    go.addEventListener('click', async () => {
      go.disabled = true;
      out.hidden = false;
      clear(out).appendChild(h('div', { class: 'muted small' }, h('span', { class: 'spin' }), isSql ? ' Wykonywanie…' : ' Uruchamianie…'));
      try {
        if (isSql) await showSql(out, ctx.db, codeOf(visible(box)));
        else if (isExcel) await showFormulas(out, ctx.sheet, codeOf(visible(box)));
        else await showRun(out, visible(box).dataset.lang, codeOf(visible(box)), input, ctx.files);
      } finally {
        go.disabled = false;
      }
    });
    bar.appendChild(go);
  }
  box.append(bar, ...bodies);
  if (input != null) box.appendChild(h('div', { class: 'ex-in' }, h('span', { class: 'muted small' }, 'Wejście programu:'), h('pre', null, input)));
  box.appendChild(out);
  syncLang(box);
  return box;
}

const visible = (box) => box.querySelector('.ex-code:not([hidden])') || box.querySelector('.ex-code');

// shows the example in the reader's language (or the first one there is)
function syncLang(box) {
  const langs = box.dataset.langs.split(' ');
  const want = langs.includes(getSettings().lang) ? getSettings().lang : langs[0];
  box.querySelectorAll('.ex-code').forEach((b) => (b.hidden = b.dataset.lang !== want));
  box.querySelectorAll('.ex-tab').forEach((t) => t.classList.toggle('active', t.dataset.lang === want));
}

export function syncLangs(root) {
  root.querySelectorAll('.ex').forEach(syncLang);
}

// syntax colours from the editor (Monaco), once it's loaded
const MONACO_LANG = { python: 'python', cpp: 'cpp', java: 'java', sql: 'sql' };
function colorize(root) {
  const blocks = [...root.querySelectorAll('.ex-code')].filter((b) => MONACO_LANG[b.dataset.lang]);
  if (!blocks.length) return;
  loadMonaco()
    .then(async (monaco) => {
      monaco.editor.setTheme(editorTheme());
      for (const b of blocks) {
        const code = b.querySelector('code');
        code.innerHTML = await monaco.editor.colorize(code.textContent, MONACO_LANG[b.dataset.lang], { tabSize: 4 });
      }
    })
    .catch(() => {});
}

// ---- running examples ------------------------------------------------------------------------

async function showRun(out, lang, code, input, files) {
  const res = await runExample({ lang, code, input, files });
  clear(out);
  if (res.missingToolchain || res.error) {
    out.appendChild(h('div', { class: 'bad-text small' }, res.error || 'Brak kompilatora.', ' ', h('a', { href: '#/settings' }, 'Ustawienia')));
    return;
  }
  if (res.compileError) {
    out.append(h('div', { class: 'bad-text small' }, 'Błąd kompilacji:'), h('pre', { class: 'stderr-block' }, res.compileError.trim()));
    return;
  }
  out.appendChild(h('div', { class: 'muted small' }, `Wynik (${LANGS[lang]?.label || lang}):`));
  out.appendChild(h('pre', { class: 'ex-stdout' }, res.stdout || '(program nic nie wypisał)'));
  if (res.stderr) out.appendChild(h('pre', { class: 'stderr-block' }, res.stderr.trim()));
  if (res.timedOut) out.appendChild(h('div', { class: 'bad-text small' }, 'Program działał za długo i został zatrzymany.'));
}

async function showSql(out, db, query) {
  const res = await runSql(db, query);
  clear(out);
  if (res.error) out.appendChild(h('div', { class: 'bad-text small' }, res.error));
  else out.appendChild(resultTable(res.result));
}

export function resultTable(r, max = 30) {
  if (!r || !r.columns.length) return h('div', { class: 'muted small' }, 'Zapytanie nie zwróciło żadnych wierszy.');
  const rows = r.values.slice(0, max);
  return h(
    'div',
    { class: 'res-wrap' },
    h(
      'table',
      { class: 'tbl res-tbl' },
      h('thead', null, h('tr', null, r.columns.map((c) => h('th', null, c)))),
      h('tbody', null, rows.map((row) => h('tr', null, row.map((v) => h('td', { class: typeof v === 'number' ? 'num' : '' }, v == null ? '' : typeof v === 'number' ? fmt(v) : String(v)))))),
    ),
    h('div', { class: 'muted small' }, `${r.values.length} ${r.values.length === 1 ? 'wiersz' : r.values.length % 10 >= 2 && r.values.length % 10 <= 4 && (r.values.length % 100 < 12 || r.values.length % 100 > 14) ? 'wiersze' : 'wierszy'}` + (r.values.length > max ? ` (pokazano ${max})` : '')),
  );
}

const fmt = (v) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 1e4) / 1e4).replace('.', ','));

async function showFormulas(out, sheet, text) {
  clear(out);
  for (const line of text.split('\n').map((l) => l.trim()).filter((l) => l.startsWith('='))) {
    const res = await calcFormula({ data: sheet?.data || [], formula: line, lang: 'pl' });
    const v = res.error ? res.error : typeof res.value === 'object' && res.value ? res.value.value || '#BŁĄD' : displayValue(res.value, null, null, 'pl');
    out.appendChild(h('div', { class: 'formula-res' }, h('code', null, line), ' → ', h('b', { class: res.error ? 'bad-text' : '' }, String(v))));
  }
}

// ---- the lesson's database and sheet ----------------------------------------------------------

async function showTables(box, db, only) {
  const schema = await dbSchema(db);
  for (const t of schema) {
    if (only.length && !only.includes(t.name)) continue;
    box.appendChild(
      h(
        'div',
        { class: 'db-table' },
        h('div', { class: 'db-name' }, icon('table', 14), ' ', t.name, h('span', { class: 'muted small' }, ` (${t.rows} ${t.rows === 1 ? 'wiersz' : 'wierszy'})`)),
        h('div', { class: 'db-cols' }, t.columns.map((c) => h('span', { class: 'db-col' }, c.name, h('i', null, ' ' + c.type.toLowerCase())))),
      ),
    );
  }
}

// a sheet-like table: column letters, row numbers (rows: show this many, 0 = up to 15)
export function sheetGrid(data, rows = 0, extra = null) {
  const n = rows || (data.length > 15 ? 12 : data.length);
  const width = Math.max(...data.map((r) => r.length), 0) + (extra ? 1 : 0);
  return h(
    'div',
    { class: 'mini-sheet-wrap' },
    h(
      'table',
      { class: 'mini-sheet' },
      h('thead', null, h('tr', null, h('th'), Array.from({ length: width }, (_, c) => h('th', null, colName(c))))),
      h(
        'tbody',
        null,
        data.slice(0, n).map((r, i) =>
          h(
            'tr',
            null,
            h('th', null, String(i + 1)),
            Array.from({ length: width }, (_, c) => {
              if (extra && c === width - 1) return extra(i);
              const v = r[c];
              return h('td', { class: typeof v === 'number' ? 'num' : '' }, v == null ? '' : typeof v === 'number' ? fmt(v) : String(v));
            }),
          ),
        ),
      ),
    ),
    data.length > n ? h('div', { class: 'muted small' }, `… i jeszcze ${data.length - n} wierszy (razem ${data.length})`) : null,
  );
}

export { esc };
