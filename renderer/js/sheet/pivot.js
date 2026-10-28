// Pivot tables, as in Excel: fields of the source data go to four areas – filters, columns,
// rows and values – and the table is computed from that layout. Kept free of the DOM so it can
// be tested on its own.
//
// def: {
//   rows:    [{ f, grp }]            fields in the rows (outer first); grp groups dates
//   cols:    [{ f, grp }]            fields in the columns (their values become columns)
//   vals:    [{ f, fn }]             what is computed: fn is one of PIVOT_FNS
//   filters: [{ f, value }]          value: a key from filterValues(), null = all
//   subtotals, totals: booleans     sums for every outer row group / for the whole table
// }
// src: { names: [field names], records: [[value per field]], dateFmt: [format or null per field] }
import { formatDate } from './engine.js';

export const PIVOT_FNS = ['Suma', 'Liczba', 'Średnia', 'Maksimum', 'Minimum'];
export const DATE_GROUPS = [
  ['', 'bez grupowania'],
  ['day', 'dni'],
  ['month', 'miesiące'],
  ['year', 'lata'],
  ['ym', 'rok i miesiąc'],
  ['hour', 'godziny'],
];
const GROUP_LABEL = { day: 'dzień', hour: 'godzina', month: 'miesiąc', year: 'rok', ym: 'rok-miesiąc' };
const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
export const MAX_PIVOT_COLS = 250;
export const EMPTY_LABEL = '(puste)';

// what a field's value counts as: { k: key for grouping and sorting, label: what the table shows }
export function keyOf(v, { grp = '', dateFmt = null } = {}) {
  if (v === null || v === undefined || v === '') return { k: '\u0002', label: EMPTY_LABEL };
  if (typeof v === 'object') return { k: '\u0001' + v.value, label: String(v.value) }; // an error value
  if (typeof v === 'number' && grp) {
    const ymd = formatDate(v, 'YYYY-MM-DD');
    if (grp === 'day') return { k: Math.floor(v), label: formatDate(v, 'DD.MM.YYYY') };
    if (grp === 'hour') {
      const hour = Math.floor(Math.round((v - Math.floor(v)) * 1440) / 60) % 24; // via minutes: 10:00 is 0.41666…
      return { k: hour, label: hour };
    }
    if (grp === 'month') return { k: Number(ymd.slice(5, 7)), label: MONTHS[Number(ymd.slice(5, 7)) - 1] };
    if (grp === 'year') return { k: Number(ymd.slice(0, 4)), label: Number(ymd.slice(0, 4)) };
    return { k: ymd.slice(0, 7), label: ymd.slice(0, 7) };
  }
  // a date keeps its number in the table (cell) and is shown in its format
  if (typeof v === 'number') return dateFmt ? { k: v, label: formatDate(v, dateFmt), cell: v } : { k: v, label: v };
  if (typeof v === 'boolean') return { k: v ? 'prawda' : 'fałsz', label: v ? 'PRAWDA' : 'FAŁSZ' };
  const s = String(v).replace(/^'/, '');
  return { k: s.toLocaleLowerCase('pl'), label: s }; // like Excel: "Kot" and "kot" are one item
}

// numbers first (ascending), then text (alphabetically), errors and empty cells last
export function compareKeys(a, b) {
  const rank = (k) => (typeof k === 'number' ? 0 : k.startsWith('\u0001') ? 2 : k.startsWith('\u0002') ? 3 : 1);
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  return ra === 0 ? a - b : String(a).localeCompare(String(b), 'pl');
}

export function aggregate(fn, list) {
  if (!list.length) return null;
  if (fn === 'Liczba') return list.filter((v) => v !== null && v !== undefined && v !== '').length;
  const nums = list.filter((v) => typeof v === 'number');
  if (!nums.length) return null;
  if (fn === 'Suma') return nums.reduce((a, b) => a + b, 0);
  if (fn === 'Średnia') return nums.reduce((a, b) => a + b, 0) / nums.length;
  if (fn === 'Maksimum') return Math.max(...nums);
  return Math.min(...nums);
}

export const valueTitle = (v, names) => `${v.fn} z ${names[v.f]}`;
const fieldTitle = (it, names) => names[it.f] + (it.grp ? ` (${GROUP_LABEL[it.grp]})` : '');

// the values a filter can be set to: [{ k, label }] in the table's order
export function filterValues(src, f) {
  const seen = new Map();
  for (const rec of src.records) {
    const { k, label } = keyOf(rec[f], { dateFmt: src.dateFmt[f] });
    if (!seen.has(k)) seen.set(k, label);
  }
  return [...seen.keys()].sort(compareKeys).map((k) => ({ k, label: seen.get(k) }));
}

// → { cells: rows of the table, dateCols: { column: format }, leftCols, error }
export function computePivot(def, src) {
  const { names, records } = src;
  const rows = def.rows || [];
  const cols = def.cols || [];
  const vals = def.vals || [];
  const filters = (def.filters || []).filter((x) => x.value !== null && x.value !== undefined);
  const key = (rec, it) => keyOf(rec[it.f], { grp: it.grp, dateFmt: src.dateFmt[it.f] });

  const recs = records.filter((rec) => filters.every((x) => keyOf(rec[x.f], { dateFmt: src.dateFmt[x.f] }).k === x.value));

  // the column items: every combination of the column fields' values that occurs
  const colItems = new Map();
  const colKeyOf = (rec) => {
    if (!cols.length) return '';
    const parts = cols.map((it) => key(rec, it));
    const k = parts.map((p) => (typeof p.k === 'number' ? 'n' + p.k : 's' + p.k)).join('\u0000');
    if (!colItems.has(k)) colItems.set(k, { parts, label: parts.map((p) => String(p.label)).join(' – ') });
    return k;
  };
  const recCol = recs.map(colKeyOf);
  const colOrder = [...colItems.keys()].sort((a, b) => {
    const pa = colItems.get(a).parts;
    const pb = colItems.get(b).parts;
    for (let i = 0; i < pa.length; i++) {
      const c = compareKeys(pa[i].k, pb[i].k);
      if (c) return c;
    }
    return 0;
  });

  const leftCols = rows.length;
  const valueCols = vals.length ? (cols.length ? colOrder.length + (def.totals !== false ? 1 : 0) : 1) * vals.length : 0;
  if (leftCols + valueCols > MAX_PIVOT_COLS) {
    const what = cols.map((it) => `„${names[it.f]}”`).join(' i ');
    return {
      error: `Tabela miałaby ${leftCols + valueCols} kolumn – ${cols.length > 1 ? 'pola' : 'pole'} ${what} w kolumnach ${cols.length > 1 ? 'mają' : 'ma'} ${colOrder.length} różnych wartości. Przenieś je do wierszy albo pogrupuj daty (np. w miesiące).`,
    };
  }

  // the header
  const header = rows.map((it) => fieldTitle(it, names));
  const columns = []; // { ck: column item key or null (all), v: value field }
  if (vals.length) {
    const keys = cols.length ? [...colOrder, ...(def.totals !== false ? [null] : [])] : [null];
    for (const ck of keys)
      for (const v of vals) {
        columns.push({ ck, v });
        if (!cols.length) header.push(valueTitle(v, names));
        else {
          const lab = ck === null ? 'Suma końcowa' : colItems.get(ck).label;
          header.push(vals.length > 1 ? `${lab} – ${valueTitle(v, names)}` : lab);
        }
      }
  }
  const cells = [header];
  const values = (idx) =>
    columns.map(({ ck, v }) =>
      aggregate(
        v.fn,
        idx.filter((i) => ck === null || recCol[i] === ck).map((i) => recs[i][v.f]),
      ),
    );

  // the rows, outer field first; a group's label shows on its first row only (as in Excel)
  const all = recs.map((_, i) => i);
  const emit = (level, idx, labels) => {
    if (level === rows.length) {
      cells.push([...labels, ...values(idx)]);
      return;
    }
    const groups = new Map();
    for (const i of idx) {
      const { k, label, cell } = key(recs[i], rows[level]);
      if (!groups.has(k)) groups.set(k, { label, cell: cell ?? label, idx: [] });
      groups.get(k).idx.push(i);
    }
    let first = true;
    for (const k of [...groups.keys()].sort(compareKeys)) {
      const g = groups.get(k);
      const own = [...labels.map((l) => (first ? l : '')), g.cell];
      emit(level + 1, g.idx, own);
      first = false;
      if (def.subtotals !== false && level < rows.length - 1) {
        const row = new Array(rows.length).fill('');
        row[level] = `${g.label} Suma`;
        cells.push([...row, ...values(g.idx)]);
      }
    }
  };
  if (rows.length) emit(0, all, []);
  if (vals.length && (!rows.length || def.totals !== false)) {
    const row = new Array(rows.length).fill('');
    if (rows.length) row[0] = 'Suma końcowa';
    cells.push([...row, ...values(all)]);
  }

  // dates shown as dates (row fields that are not grouped keep their numbers)
  const dateCols = {};
  rows.forEach((it, c) => {
    if (!it.grp && src.dateFmt[it.f]) dateCols[c] = src.dateFmt[it.f];
  });
  const out = cells.map((r) => r.map((v) => (typeof v === 'number' ? Math.round(v * 1e10) / 1e10 : v)));
  return { cells: out, dateCols, leftCols, rows: recs.length };
}
