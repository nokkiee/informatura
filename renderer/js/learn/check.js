// Checking answers to the lessons' questions. Pure functions: the lesson pages, the content
// check (tools/check-lessons.mjs) and the unit tests all use them.
import { outputMatches } from '../check.js';

const norm = (s) =>
  String(s ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '')
    .toLowerCase();

// "12", "12,5", "-3.25" -> a number; anything else -> null
export function numberOf(s) {
  const t = String(s ?? '')
    .trim()
    .replace(/\s/g, '')
    .replace(',', '.');
  return /^[-+]?\d+(\.\d+)?$/.test(t) ? Number(t) : null;
}

// A typed answer against the accepted ones. Numbers compare as numbers ("7,50" = "7.5"),
// unless exact is set (e.g. a bit pattern where leading zeros count); text ignores case and
// extra spaces.
export function inputOk(value, accepted, { exact = false } = {}) {
  const v = norm(value);
  if (!v) return false;
  const list = Array.isArray(accepted) ? accepted : [accepted];
  const n = exact ? null : numberOf(value);
  return list.some((a) => {
    const na = exact ? null : numberOf(a);
    if (n !== null && na !== null) return Math.abs(n - na) < 1e-9;
    return norm(a).replace(/\s+/g, exact ? '' : ' ') === v.replace(/\s+/g, exact ? '' : ' ');
  });
}

// choice: the chosen option indexes against the right one(s)
export function choiceOk(chosen, answer) {
  const want = (Array.isArray(answer) ? answer : [answer]).slice().sort();
  const got = [...new Set(chosen || [])].sort();
  return want.length === got.length && want.every((x, i) => x === got[i]);
}

// true/false statements: values[i] is true, false or undefined (not answered)
export function tfOk(values, items) {
  return items.every((it, i) => values?.[i] === it.answer);
}

// a program's output against the expected one (spacing and punctuation don't matter)
export function outputOk(expected, got) {
  return outputMatches(String(expected), String(got ?? ''));
}

const cell = (v) => {
  if (typeof v === 'number') return String(Math.round(v * 1e6) / 1e6);
  if (v == null) return '';
  const s = String(v).trim();
  const n = numberOf(s);
  return n !== null ? String(Math.round(n * 1e6) / 1e6) : s.toLowerCase();
};

// Two query results ({columns, values}) against each other. Column names and their order
// don't matter (the values of each row are compared as a set), row order only when `ordered`.
export function sqlSame(got, want, { ordered = false } = {}) {
  if (!got) return { ok: false, why: 'Zapytanie nie zwróciło wyniku.' };
  const g = got.values || [];
  const w = want.values || [];
  if ((got.columns || []).length !== (want.columns || []).length) {
    return { ok: false, why: `Wynik ma ${got.columns.length} ${plural(got.columns.length, 'kolumnę', 'kolumny', 'kolumn')}, a powinien mieć ${want.columns.length}.` };
  }
  if (g.length !== w.length) {
    return { ok: false, why: `Wynik ma ${g.length} ${plural(g.length, 'wiersz', 'wiersze', 'wierszy')}, a powinien mieć ${w.length}.` };
  }
  const key = (r) => r.map(cell).sort().join('\u0001');
  const gk = g.map(key);
  const wk = w.map(key);
  if (ordered) {
    if (gk.every((k, i) => k === wk[i])) return { ok: true };
    const same = [...gk].sort().every((k, i) => k === [...wk].sort()[i]);
    return { ok: false, why: same ? 'Wiersze są dobre, ale w złej kolejności.' : 'Wartości w wyniku się nie zgadzają.' };
  }
  gk.sort();
  wk.sort();
  return gk.every((k, i) => k === wk[i]) ? { ok: true } : { ok: false, why: 'Wartości w wyniku się nie zgadzają.' };
}

// values computed by a formula against the expected ones
export function sheetSame(got, want) {
  if (got.length !== want.length) return false;
  return got.every((v, i) => {
    const w = want[i];
    if (typeof v === 'number' && typeof w === 'number') return Math.abs(v - w) <= 1e-9 * Math.max(1, Math.abs(w));
    if (typeof v === 'object' || typeof w === 'object') return false; // an error value
    return cell(v) === cell(w);
  });
}

export function plural(n, one, few, many) {
  if (n === 1) return one;
  const d = n % 10;
  const t = n % 100;
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many;
}

// points of a question (programs, queries and formulas count double)
export const pointsOf = (q) => q.points ?? (['code', 'sql', 'sheet'].includes(q.type) ? 2 : 1);
