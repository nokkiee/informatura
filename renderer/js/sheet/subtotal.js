// "Suma częściowa" (Excel: Dane → Suma częściowa): below every group of rows with the same value
// in one column, a row with the group's sum (count, average…) as SUMY.CZĘŚCIOWE formulas, and a
// grand total at the end. Kept free of the DOM so it can be tested on its own.
import { addr } from './engine.js';

// [name in the dialog, SUBTOTAL function number, word in the row labels, word of the grand total]
export const SUBTOTAL_FNS = [
  ['Suma', 9, 'Suma', 'Suma końcowa'],
  ['Licznik', 3, 'Licznik', 'Licznik końcowy'],
  ['Średnia', 1, 'Średnia', 'Średnia końcowa'],
  ['Maksimum', 4, 'Maksimum', 'Maksimum końcowe'],
  ['Minimum', 5, 'Minimum', 'Minimum końcowe'],
];

const FORMULA = /^=\s*(SUBTOTAL|SUMY\.CZĘŚCIOWE)\s*\(/i;
export const isSubtotalFormula = (f) => typeof f === 'string' && FORMULA.test(f);

// groups of consecutive rows with the same key: [{ start, end, label }] (rows as given)
export function groupsOf(keys, from) {
  const groups = [];
  keys.forEach(({ k, label }, i) => {
    const last = groups[groups.length - 1];
    if (last && last.k === k) last.end = from + i;
    else groups.push({ k, label, start: from + i, end: from + i });
  });
  return groups;
}

// What to insert, bottom-up so earlier row numbers stay valid while inserting:
// [{ row, cells: { col: value or formula } }]; `row` is where the new row goes at that moment.
//   from, to   the data rows (without the header)
//   keys       [{ k, label }] for every data row: the value of the "at each change in" column
//   at         that column; cols: the columns that get a subtotal; fn: an entry of SUBTOTAL_FNS
export function subtotalPlan({ from, to, keys, at, cols, fn, lang = 'pl' }) {
  const [, code, word, grand] = fn;
  const name = lang === 'en' ? 'SUBTOTAL' : 'SUMY.CZĘŚCIOWE';
  const sep = lang === 'en' ? ',' : ';';
  const formula = (c, ranges) => `=${name}(${code}${sep}${ranges.map(([a, b]) => `${addr(a, c)}:${addr(b, c)}`).join(sep)})`;
  const groups = groupsOf(keys, from);
  const inserts = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    const g = groups[i];
    const cells = { [at]: `${g.label} ${word}` };
    for (const c of cols) cells[c] = formula(c, [[g.start, g.end]]);
    inserts.push({ row: g.end + 1, cells });
  }
  // the grand total sums the data rows only (the group rows above are not counted twice):
  // after inserting, group i has moved down by i rows
  const moved = groups.map((g, i) => [g.start + i, g.end + i]);
  const cells = { [at]: grand };
  for (const c of cols) cells[c] = formula(c, moved);
  inserts.push({ row: to + groups.length + 1, cells });
  return { groups, inserts };
}
