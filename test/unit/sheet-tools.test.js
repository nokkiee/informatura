'use strict';
// Pivot tables (the layout → the table's cells) and "Suma częściowa" (where the subtotal rows go
// and their formulas). The live panel and the dialogs are covered by the e2e scenario sheet-tools.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const { pathToFileURL } = require('url');

const ROOT = path.join(__dirname, '..', '..');
const load = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
let P;
let S;
test.before(async () => {
  P = await load('renderer/js/sheet/pivot.js');
  S = await load('renderer/js/sheet/subtotal.js');
});

// 2024-01-01 = 45292 (spreadsheet serial)
const src = () => ({
  names: ['miasto', 'sklep', 'data', 'kwota'],
  dateFmt: [null, null, 'DD.MM.YYYY', null],
  records: [
    ['Kraków', 'A', 45292, 10],
    ['Kraków', 'B', 45293, 5],
    ['kraków', 'A', 45323, 7],
    ['Gdańsk', 'A', 45292, 3],
    ['Gdańsk', null, 45330, 4],
  ],
});
const layout = (d) => ({ rows: [], cols: [], vals: [], filters: [], subtotals: true, totals: true, ...d });

test('pivot: two row fields with subtotals and a grand total, groups ignore letter case', () => {
  const { cells } = P.computePivot(layout({ rows: [{ f: 0 }, { f: 1 }], vals: [{ f: 3, fn: 'Suma' }] }), src());
  assert.deepStrictEqual(cells, [
    ['miasto', 'sklep', 'Suma z kwota'],
    ['Gdańsk', 'A', 3],
    ['', '(puste)', 4],
    ['Gdańsk Suma', '', 7],
    ['Kraków', 'A', 17],
    ['', 'B', 5],
    ['Kraków Suma', '', 22],
    ['Suma końcowa', '', 29],
  ]);
  const plain = P.computePivot(layout({ rows: [{ f: 0 }, { f: 1 }], vals: [{ f: 3, fn: 'Suma' }], subtotals: false, totals: false }), src());
  assert.strictEqual(plain.cells.length, 5, 'no subtotal and total rows');
});

test('pivot: dates grouped into months across the columns, two values, totals from the records', () => {
  const { cells } = P.computePivot(layout({ rows: [{ f: 0 }], cols: [{ f: 2, grp: 'month' }], vals: [{ f: 3, fn: 'Suma' }, { f: 3, fn: 'Średnia' }] }), src());
  assert.deepStrictEqual(cells[0], ['miasto', 'styczeń – Suma z kwota', 'styczeń – Średnia z kwota', 'luty – Suma z kwota', 'luty – Średnia z kwota', 'Suma końcowa – Suma z kwota', 'Suma końcowa – Średnia z kwota']);
  assert.deepStrictEqual(cells[2], ['Kraków', 15, 7.5, 7, 7, 22, 7.3333333333]);
  // the average of all records, not of the rows' averages
  assert.deepStrictEqual(cells[3], ['Suma końcowa', 18, 6, 11, 5.5, 29, 5.8]);
});

test('pivot: a filter, dates kept as dates, values only', () => {
  const s = src();
  const krakow = P.filterValues(s, 0).find((v) => v.label === 'Kraków').k;
  const r = P.computePivot(layout({ rows: [{ f: 2 }], vals: [{ f: 3, fn: 'Liczba' }], filters: [{ f: 0, value: krakow }] }), s);
  assert.deepStrictEqual(r.cells, [['data', 'Liczba z kwota'], [45292, 1], [45293, 1], [45323, 1], ['Suma końcowa', 3]]);
  assert.deepStrictEqual(r.dateCols, { 0: 'DD.MM.YYYY' });
  assert.deepStrictEqual(P.computePivot(layout({ vals: [{ f: 3, fn: 'Maksimum' }] }), s).cells, [['Maksimum z kwota'], [10]]);
});

test('pivot: too many columns is an error message, not a broken sheet', () => {
  const s = { names: ['nr', 'x'], dateFmt: [null, null], records: Array.from({ length: 400 }, (_, i) => [i, 1]) };
  const r = P.computePivot(layout({ cols: [{ f: 0 }], vals: [{ f: 1, fn: 'Suma' }] }), s);
  assert.match(r.error, /401 kolumn.*„nr”.*400 różnych wartości/);
  assert.ok(!r.cells);
});

test('subtotals: a row under every group, the grand total sums the data rows only', () => {
  const keys = ['b', 'b', 'a', 'c', 'c', 'c'].map((k) => ({ k, label: k.toUpperCase() }));
  const fn = S.SUBTOTAL_FNS.find(([n]) => n === 'Suma');
  const { groups, inserts } = S.subtotalPlan({ from: 1, to: 6, keys, at: 0, cols: [2], fn });
  assert.deepStrictEqual(groups.map((g) => [g.label, g.start, g.end]), [['B', 1, 2], ['A', 3, 3], ['C', 4, 6]]);
  // bottom-up: the last group first, so the earlier row numbers stay valid
  assert.deepStrictEqual(inserts, [
    { row: 7, cells: { 0: 'C Suma', 2: '=SUMY.CZĘŚCIOWE(9;C5:C7)' } },
    { row: 4, cells: { 0: 'A Suma', 2: '=SUMY.CZĘŚCIOWE(9;C4:C4)' } },
    { row: 3, cells: { 0: 'B Suma', 2: '=SUMY.CZĘŚCIOWE(9;C2:C3)' } },
    // after inserting, the groups lie in rows 2–3, 5, 7–9 (1-based)
    { row: 10, cells: { 0: 'Suma końcowa', 2: '=SUMY.CZĘŚCIOWE(9;C2:C3;C5:C5;C7:C9)' } },
  ]);
  const en = S.subtotalPlan({ from: 1, to: 2, keys: keys.slice(0, 2), at: 0, cols: [1], fn: S.SUBTOTAL_FNS[1], lang: 'en' });
  assert.deepStrictEqual(en.inserts[0].cells, { 0: 'B Licznik', 1: '=SUBTOTAL(3,B2:B3)' });
  assert.ok(S.isSubtotalFormula('=SUMY.CZĘŚCIOWE(9;B2:B3)') && S.isSubtotalFormula('=subtotal(9,B2:B3)') && !S.isSubtotalFormula('=SUMA(B2:B3)'));
});
