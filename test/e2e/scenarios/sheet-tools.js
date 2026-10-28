'use strict';
// Spreadsheet tools as in Excel: the pivot table's fields panel (fields dragged between filters,
// columns, rows and values rebuild the table live), a layout that can't be built (a message, no
// empty sheets left behind however many times "Utwórz" is clicked) and "Suma częściowa".
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const rowsOf = (exam, file) =>
  fs
    .readFileSync(path.join(ROOT, 'content', 'data', exam, file), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(1)
    .map((l) => l.split('\t'));

module.exports = async (H) => {
  const go = async (hash, wait = 700) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  const press = (keyCode, modifiers = []) => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
  };
  const select = async (ref) => {
    await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = ${JSON.stringify(ref)}; })()`);
    press('Return');
    await H.sleep(120);
  };
  // what the formula bar shows for a cell (a value typed in, or a formula)
  const fx = async (ref) => {
    await select(ref);
    return H.js(`document.querySelector('.fx-input').value`);
  };
  const num = async (ref) => Number((await fx(ref)).replace(/\s/g, '').replace(',', '.'));
  // the value of a formula, from the status bar's sum of the cell and the (empty) one next to it
  const value = async (ref) => {
    const m = ref.match(/^([A-Z]+)(\d+)$/);
    const next = String.fromCharCode(m[1].charCodeAt(m[1].length - 1) + 1);
    await select(`${ref}:${next}${m[2]}`);
    const t = await H.js(`document.querySelector('.sheet-status').textContent`);
    const s = t.match(/Suma: (-?[\d,]+)/);
    return s ? Number(s[1].replace(',', '.')) : null;
  };
  const tabs = () => H.js(`[...document.querySelectorAll('.stab:not(.add)')].map((t) => t.textContent)`);
  const panelOpen = () => H.js(`!!document.querySelector('.pivot-panel') && !document.querySelector('.pivot-panel').hidden`);
  // drag and drop inside the fields panel (the same events a mouse drag fires)
  const drag = async (from, to) => {
    await H.js(`(() => {
      const dt = new DataTransfer();
      const s = ${from};
      const d = ${to};
      s.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
      const r = d.getBoundingClientRect();
      const at = { bubbles: true, cancelable: true, dataTransfer: dt, clientX: r.left + 8, clientY: r.bottom - 3 };
      d.dispatchEvent(new DragEvent('dragover', at));
      d.dispatchEvent(new DragEvent('drop', at));
      s.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    })()`);
    await H.sleep(250);
  };
  const field = (name) => `[...document.querySelectorAll('.pv-field')].find((f) => f.textContent.trim() === ${JSON.stringify(name)})`;
  const area = (a) => `document.querySelector('.pv-drop[data-area="${a}"]')`;
  const chip = (a, i = 0) => `document.querySelectorAll('.pv-drop[data-area="${a}"] .pv-chip')[${i}]`;
  const openSheet = async (hash) => {
    await go(hash, 300);
    await H.waitFor(() => H.js(`!!document.querySelector('.grid-canvas')`), 20000);
    await H.sleep(500);
  };

  // ---- the fields panel: May 2023, task 6 (fruit deliveries) ---------------------------------------
  const fruit = rowsOf('2023-maj', 'owoce.txt');
  const may = (col) => fruit.filter((r) => r[0].slice(3, 5) === '05').reduce((s, r) => s + Number(r[col]), 0);
  await openSheet('#/t/2023-maj/6.1?from=exam');
  await select('A2');
  await H.click('.btn', 'Tabela przestawna');
  await H.sleep(200);
  await H.js(`(() => {
    const s = document.querySelectorAll('.modal select');
    s[0].value = '0'; // rows: data
    s[1].value = 'month';
    s[3].value = '1'; // values: dostawa_malin
    s[4].value = 'Suma';
  })()`);
  await H.click('.modal .btn', 'Utwórz');
  await H.sleep(500);
  H.assert((await tabs()).includes('Przestawna'), 'pivot sheet created');
  H.assert(await panelOpen(), 'the fields panel is open next to the table');
  H.assert((await fx('B2')).replace(/\s/g, '') === String(may(1)), 'May raspberries');
  // a field dragged from the list to the values: a second value column
  await drag(field('dostawa_truskawek'), area('vals'));
  H.assert((await fx('C1')) === 'Suma z dostawa_truskawek', 'second value column: ' + (await fx('C1')));
  H.assert((await num('C2')) === may(2), 'May strawberries');
  await H.shot('60-pivot-panel');
  // the date field dragged from the rows to the columns: months across, one row of totals
  await drag(chip('rows'), area('cols'));
  H.assert((await fx('A1')) === 'maj – Suma z dostawa_malin', 'months in the columns: ' + (await fx('A1')));
  H.assert((await num('A2')) === may(1), 'May raspberries in the first column');
  // a value taken out with its ×
  await H.js(`${chip('vals', 1)}.querySelector('.icon-btn').click()`);
  await H.sleep(250);
  H.assert((await fx('A1')) === 'maj', 'one value: the columns are just the months');
  H.assert((await fx('F1')) === 'Suma końcowa', 'grand total column');
  // the date as a filter: one day only
  await drag(chip('cols'), area('filters'));
  await H.js(`(() => { const s = ${chip('filters')}.querySelector('select'); s.value = '0'; s.dispatchEvent(new Event('change')); })()`);
  await H.sleep(250);
  H.assert((await num('A2')) === Number(fruit[0][1]), 'filtered to 01.05.2020');
  // unticking a field takes it out of the table
  await H.js(`(() => { const c = ${field('data')}.querySelector('input'); c.checked = false; c.dispatchEvent(new Event('change')); })()`);
  await H.sleep(250);
  H.assert((await num('A2')) === fruit.reduce((s, r) => s + Number(r[1]), 0), 'no filter: all raspberries');
  // the panel can be closed and brought back by the toolbar button
  await H.js(`document.querySelector('.pv-head .icon-btn').click()`);
  await H.sleep(150);
  H.assert(!(await panelOpen()), 'panel closed');
  await H.click('.btn', 'Tabela przestawna');
  await H.sleep(200);
  H.assert((await panelOpen()) && !(await H.js(`!!document.querySelector('.modal')`)), 'panel back, no new pivot dialog');
  // the layout is saved with the task: reopened, the pivot sheet still has its panel
  await H.sleep(1500); // the debounced save
  await go('#/t/2023-maj/6.2?from=exam', 800);
  await openSheet('#/t/2023-maj/6.1?from=exam');
  await H.click('.stab', 'Przestawna');
  await H.sleep(300);
  H.assert((await panelOpen()) && (await H.js(`document.querySelectorAll('.pv-field input:checked').length`)) === 1, 'panel and layout back after reopening');

  // ---- a layout that can't be built: June 2026, task 7 (2114 deliveries) ------------------------------
  await openSheet('#/t/2026-czerwiec/7.1?from=exam');
  const before = await tabs();
  await select('A2');
  await H.click('.btn', 'Tabela przestawna');
  await H.sleep(200);
  await H.js(`document.querySelectorAll('.modal select')[2].value = '0'`); // columns: Nr_dostawy (2114 values)
  for (let i = 0; i < 4; i++) await H.js(`[...document.querySelectorAll('.modal .btn')].find((b) => b.textContent === 'Utwórz').click()`); // spammed
  await H.sleep(400);
  H.assert(await H.js(`!!document.querySelector('.modal')`), 'the dialog stays open');
  H.assert(/kolumn/.test(await H.js(`[...document.querySelectorAll('.toast')].map((t) => t.textContent).join(' ')`)), 'a message says why');
  H.assert(JSON.stringify(await tabs()) === JSON.stringify(before), 'no empty sheets: ' + (await tabs()));
  await H.js(`document.querySelectorAll('.modal select')[2].value = ''`);
  await H.click('.modal .btn', 'Utwórz');
  await H.sleep(500);
  H.assert((await tabs()).filter((t) => t.startsWith('Przestawna')).length === 1, 'one pivot sheet: ' + (await tabs()));
  // the same field dragged to the columns in the panel: a message, the table stays
  const a1 = await fx('A1');
  await drag(field('Nr_dostawy'), area('cols'));
  H.assert(/kolumn/.test(await H.js(`document.querySelector('.pv-err')?.textContent || ''`)), 'panel says why');
  H.assert((await fx('A1')) === a1 && (await H.js(`document.querySelectorAll('.pv-drop[data-area="cols"] .pv-chip').length`)) === 0, 'table and layout unchanged');

  // ---- Suma częściowa: the sum of kilograms for every supplier ------------------------------------------
  const deliveries = rowsOf('2026-czerwiec', 'dostawy.txt');
  const order = deliveries.map((r, i) => ({ r, i })).sort((a, b) => a.r[2].toLowerCase().localeCompare(b.r[2].toLowerCase(), 'pl') || a.i - b.i);
  const first = order[0].r[2];
  const n0 = order.filter((x) => x.r[2] === first).length;
  const sum0 = order.filter((x) => x.r[2] === first).reduce((s, x) => s + Number(x.r[3]), 0);
  const groups = new Set(deliveries.map((r) => r[2])).size;
  const total = deliveries.reduce((s, r) => s + Number(r[3]), 0);
  await H.click('.stab', 'dostawy');
  await H.sleep(300);
  await select('A2');
  await H.click('.btn', 'Suma częściowa');
  await H.sleep(200);
  await H.js(`(() => { const s = document.querySelectorAll('.modal select'); s[0].value = '2'; s[1].value = '0'; })()`); // at each change in: Dostawca; Suma
  H.assert(await H.js(`[...document.querySelectorAll('.modal .st-cols input')].map((c) => c.checked).join() === 'false,false,false,true'`), 'Liczba_kg ticked by default');
  await H.click('.modal .btn', 'OK');
  await H.sleep(800);
  const sub = n0 + 2; // header + the first supplier's rows, then its sum
  H.assert((await fx(`C${sub}`)) === `${first} Suma`, 'subtotal label: ' + (await fx(`C${sub}`)));
  H.assert((await fx(`D${sub}`)) === `=SUMY.CZĘŚCIOWE(9;D2:D${sub - 1})`, 'subtotal formula: ' + (await fx(`D${sub}`)));
  H.assert((await value(`D${sub}`)) === sum0, 'first supplier sum');
  const last = 1 + deliveries.length + groups + 1;
  H.assert((await fx(`C${last}`)) === 'Suma końcowa', 'grand total row at ' + last + ': ' + (await fx(`C${last}`)));
  H.assert((await value(`D${last}`)) === total, 'grand total counts the data rows only');
  await H.shot('61-subtotals');
  // one undo takes back the whole operation (sorting too), redo brings it back
  press('Z', ['control']);
  await H.sleep(300);
  H.assert((await fx('C2')) === deliveries[0][2] && !/Suma$/.test(await fx(`C${sub}`)), 'undone in one step');
  press('Y', ['control']);
  await H.sleep(300);
  H.assert((await fx(`C${sub}`)) === `${first} Suma`, 'redone');
  // "Usuń wszystko" takes the subtotal rows out again
  await select('A2');
  await H.click('.btn', 'Suma częściowa');
  await H.sleep(200);
  await H.click('.modal .btn', 'Usuń wszystko');
  await H.sleep(500);
  H.assert(!/Suma$/.test(await fx(`C${sub}`)) && (await fx(`C${deliveries.length + 2}`)) === '', 'subtotal rows removed');
};
