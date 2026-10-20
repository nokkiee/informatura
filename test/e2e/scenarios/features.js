'use strict';
// Exam simulation + summary, random draw, browse filters, settings, spreadsheet tools.
module.exports = async (H) => {
  const go = async (hash, wait = 700) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  const press = (keyCode, modifiers = []) => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
  };

  // ---- simulation -----------------------------------------------------------------------
  await go('#/exam/2024-czerwiec');
  await H.shot('20-exam-overview');
  await H.click('.btn', 'Symulacja egzaminu');
  await H.sleep(300);
  await H.click('.modal .btn', 'Start');
  await H.waitFor(() => H.js(`!!document.querySelector('.timer')`), 8000);
  H.assert(await H.js(`![...document.querySelectorAll('.btn')].some((b) => b.textContent.includes('Sprawdź'))`), 'no Sprawdź button in simulation');
  // answer task 1.1 (grid) correctly and 5 (true/false) wrongly
  await H.js(`(() => {
    const rows = ['10110', '01110', '11001', '11011'];
    rows.forEach((r, i) => [...r].forEach((d, j) => { const el = document.querySelector('[data-field="t' + i + '_' + j + '"]'); el.value = d; el.dispatchEvent(new Event('input')); }));
  })()`);
  await H.shot('21-sim-task');
  await go('#/t/2024-czerwiec/5?from=exam', 800);
  await H.js(`(() => { const rows = document.querySelectorAll('.tf-table tr'); rows[0].querySelectorAll('.tf-btn')[1].click(); rows[1].querySelectorAll('.tf-btn')[1].click(); })()`);
  await H.sleep(800); // let the debounced save land
  await H.click('.btn', 'Zakończ egzamin');
  await H.waitFor(() => H.js(`!!document.querySelector('.total-n')`), 20000);
  const total = await H.js(`document.querySelector('.total-n').textContent`);
  H.assert(/^1\b/.test(total.trim()), 'simulation total should be 1 point, got ' + total);
  await H.shot('22-summary');

  // ---- random -------------------------------------------------------------------------------
  await go('#/random');
  await H.shot('23-random');
  await H.click('.btn', 'Losuj zadanie');
  await H.waitFor(() => H.js(`location.hash.includes('from=random') && !!document.querySelector('.task-card')`), 8000);
  const first = await H.js(`location.hash`);
  await H.click('.btn', 'Losuj kolejne');
  await H.waitFor(async () => (await H.js(`location.hash`)) !== first && (await H.js(`!!document.querySelector('.task-card')`)), 8000);

  // ---- browse -------------------------------------------------------------------------------
  await go('#/browse?cat=bazy');
  const rows = await H.js(`document.querySelectorAll('.browse-list .task-row').length`);
  H.assert(rows >= 30 && rows <= 45, 'database tasks listed: ' + rows);
  await H.shot('24-browse');

  // ---- settings -----------------------------------------------------------------------------
  await go('#/settings', 2500);
  await H.waitFor(() => H.js(`document.querySelectorAll('.tc-row').length === 3`), 20000);
  await H.shot('25-settings');

  // ---- spreadsheet tools ----------------------------------------------------------------------
  await go('#/t/2023-maj/6.1?from=exam', 300);
  await H.waitFor(() => H.js(`!!document.querySelector('.grid-canvas')`), 15000);
  await H.sleep(500);
  // pivot: rows = data grouped by month, values = dostawa_malin (sum)
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'A2'; })()`);
  press('Return');
  await H.sleep(150);
  await H.click('.btn', 'Tabela przestawna');
  await H.sleep(200);
  await H.js(`(() => {
    const sels = document.querySelectorAll('.modal select');
    sels[0].value = '0'; // rows: data
    sels[1].value = 'month';
    sels[3].value = '1'; // values: dostawa_malin
    sels[4].value = 'Suma';
  })()`);
  await H.click('.modal .btn', 'Utwórz');
  await H.sleep(500);
  const tabs = await H.js(`[...document.querySelectorAll('.stab')].map((t) => t.textContent)`);
  H.assert(tabs.includes('Przestawna'), 'pivot sheet created: ' + tabs);
  // read B2 (maj, maliny) through the formula bar
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'B2'; })()`);
  press('Return');
  await H.sleep(150);
  const may = await H.js(`document.querySelector('.fx-input').value`);
  H.assert(may.replace(/\s/g, '') === '9238', 'May raspberries = 9238, got ' + may);
  // chart from the pivot
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'A1:B6'; })()`);
  press('Return');
  await H.sleep(150);
  await H.click('.btn', 'Wykres');
  await H.sleep(200);
  await H.js(`(() => { const inp = document.querySelectorAll('.modal .input'); inp[1].value = 'Dostawy malin'; })()`);
  await H.click('.modal .btn', 'Wstaw');
  await H.waitFor(() => H.js(`!!document.querySelector('.chart-card canvas')`), 5000);
  await H.sleep(600);
  await H.shot('26-pivot-chart');
  // undo works on the grid
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'D2'; })()`);
  press('Return');
  await H.sleep(100);
  H.wc.sendInputEvent({ type: 'keyDown', keyCode: '7' });
  H.wc.sendInputEvent({ type: 'char', keyCode: '7' });
  H.wc.sendInputEvent({ type: 'keyUp', keyCode: '7' });
  press('Return');
  await H.sleep(150);
  press('Z', ['control']);
  await H.sleep(150);
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'D2'; })()`);
  press('Return');
  await H.sleep(100);
  H.assert((await H.js(`document.querySelector('.fx-input').value`)) === '', 'undo cleared D2');

  // ---- SQL dialect helpers --------------------------------------------------------------------
  await go('#/t/2025-maj/7.2?from=exam', 1800);
  await H.js(`window.monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null).setValue("SELECT TOP 1 nazwa_lazika, MIN(data_pomiaru), MAX(data_pomiaru)\\nFROM Pomiary INNER JOIN Laziki ON Pomiary.nr_lazika = Laziki.nr_lazika\\nWHERE YEAR(data_pomiaru) > 2000\\nGROUP BY Laziki.nr_lazika\\nORDER BY DATEDIFF(MAX(data_pomiaru), MIN(data_pomiaru)) DESC;")`);
  await H.click('.btn', 'Wykonaj');
  await H.waitFor(() => H.js(`(document.querySelector('.answer-area')?.value || '').startsWith('Spirit 14')`), 5000);
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 3000);
  await H.shot('27-sql-dialect');
};
