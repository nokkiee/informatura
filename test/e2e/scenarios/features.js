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

  // ---- libraries loading at the same time (SQL, editor, spreadsheet) must not break each other
  await H.js(`location.hash = '#/t/2023-maj/7.1?from=exam'`);
  await H.sleep(30);
  await go('#/t/2023-maj/6.2?from=exam', 300);
  await H.waitFor(() => H.js(`!!document.querySelector('.grid-canvas')`), 15000);
  await go('#/t/2023-maj/7.1?from=exam', 300);
  await H.waitFor(() => H.js(`document.querySelectorAll('.sql-side .tbl-item').length === 3 && !!window.monaco`), 15000);
  await H.sleep(1000); // let the editor's worker finish loading before leaving (an aborted load logs an error)

  // ---- leaving a spreadsheet task while it is still starting must not throw
  // (tasks whose data files haven't been loaded yet, so the import is still waiting for them)
  for (const key of ['2024-maj/7.1', '2025-maj/6.1', '2026-czerwiec/7.1']) {
    await H.js(`location.hash = '#/t/${key}?from=exam'`);
    await H.sleep(15);
  }
  await go('#/exams', 1500);

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

  // ---- starting code: the template or an empty editor (setting „Kod na start”) ---------------
  const editorText = `window.monaco?.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null)?.getValue()`;
  const openEditor = async (key) => {
    await go('#/t/' + key + '?from=exam', 300);
    await H.waitFor(() => H.js(`typeof (${editorText}) === 'string' && document.querySelector('.task-no')?.textContent.includes(${JSON.stringify(key.split('/')[1])})`), 15000);
    await H.sleep(200);
    return H.js(editorText);
  };
  await H.click('.seg-btn', 'Pusty edytor');
  await H.waitFor(() => H.js(`import('./js/store.js').then((s) => s.getSettings().starter === 'empty')`), 3000);
  H.assert((await openEditor('2024-maj/4.1')) === '', 'program task starts empty');
  H.assert(await H.js(`document.querySelector('.ws-toolbar .icon-btn[title="Wyczyść edytor"]') !== null`), 'reset button clears the editor');
  await H.js(`window.monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null).setValue('print(1)\\n')`);
  await H.sleep(800); // let the debounced save land
  H.assert((await openEditor('2024-maj/3.1')) === '', 'algorithm task starts empty');
  const io = await H.js(`document.querySelector('.algo-io')?.textContent || ''`);
  H.assert(/Wejście/.test(io) && /Wynik/.test(io), 'algorithm task lists its input and output: ' + io);
  H.assert((await openEditor('2024-maj/8.1')) === '', 'SQL task starts empty');
  await go('#/settings', 800);
  await H.click('.seg-btn', 'Szablon');
  await H.waitFor(() => H.js(`import('./js/store.js').then((s) => s.getSettings().starter === 'template')`), 3000);
  H.assert((await openEditor('2024-maj/4.2')).includes('dane'), 'program task starts with the template');
  H.assert((await openEditor('2024-maj/8.2')).includes('SELECT'), 'SQL task starts with the starter query');
  H.assert((await openEditor('2024-maj/4.1')) === 'print(1)\n', 'code written with an empty start is kept');

  // the editor's right-click menu gets the theme's colours (it is drawn next to the editor)
  H.assert(await H.js(`getComputedStyle(document.querySelector('.editor-box')).getPropertyValue('--vscode-menu-background').trim() !== ''`), 'menu colours reach the context menu');

  // ---- console: keep earlier output or clear it before each run (setting) ----------------------
  const runs = () => H.js(`document.querySelector('.console-body').textContent.split('Proces zakończony').length - 1`);
  const runOnce = async () => {
    const before = await runs();
    await H.click('.ws-toolbar .btn', 'Uruchom');
    await H.waitFor(async () => (await runs()) !== before || (await H.js(`document.querySelector('.console-body').textContent.includes('Proces zakończony') && !document.querySelector('.ws-code.running')`)), 30000);
    await H.waitFor(() => H.js(`!document.querySelector('.ws-code.running')`), 30000);
  };
  await openEditor('2024-maj/4.3');
  await runOnce();
  await runOnce();
  H.assert((await runs()) === 2, 'output of both runs kept: ' + (await runs()));
  await go('#/settings', 800);
  await H.click('.seg-btn', 'Wyczyść przed każdym uruchomieniem');
  await openEditor('2024-maj/4.3');
  await runOnce();
  await runOnce();
  H.assert((await runs()) === 1, 'console cleared before each run: ' + (await runs()));
  // the same setting as a checkbox on the console's tab bar
  H.assert(await H.js(`document.querySelector('.con-opt input').checked`), 'console checkbox follows the setting');
  await H.click('.con-opt input');
  H.assert(await H.js(`import('./js/store.js').then((s) => s.getSettings().clearConsole === false)`), 'console checkbox turns the setting off');
  await runOnce();
  H.assert((await runs()) === 2, 'output kept again: ' + (await runs()));

  // ---- „Pokaż rozwiązanie” shows the solution, and hides it on the next click --------------------
  await go('#/t/2024-maj/1.1?from=exam', 800);
  await H.click('.answer-actions .btn', 'Pokaż rozwiązanie');
  await H.sleep(200);
  H.assert(await H.js(`!document.querySelector('.solution-panel').hidden`), 'solution shown');
  await H.click('.answer-actions .btn', 'Ukryj rozwiązanie');
  await H.sleep(200);
  H.assert(await H.js(`document.querySelector('.solution-panel').hidden`), 'solution hidden again');
  H.assert(await H.js(`[...document.querySelectorAll('.answer-actions .btn')].some((b) => b.textContent === 'Pokaż rozwiązanie')`), 'button back to „Pokaż rozwiązanie”');
  await H.sleep(800); // let the debounced save land
  await go('#/t/2024-maj/1.2?from=exam', 500);
  await go('#/t/2024-maj/1.1?from=exam', 800);
  H.assert(await H.js(`document.querySelector('.solution-panel').hidden`), 'hidden solution stays hidden');

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

  // pivot grouped by hours: average generation at 10:00 (June 2023, task 6.3: 2,1241)
  await go('#/t/2023-czerwiec/6.3?from=exam', 300);
  await H.waitFor(() => H.js(`!!document.querySelector('.grid-canvas')`), 15000);
  await H.sleep(500);
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'A2'; })()`);
  press('Return');
  await H.sleep(150);
  await H.click('.btn', 'Tabela przestawna');
  await H.sleep(200);
  await H.js(`(() => {
    const sels = document.querySelectorAll('.modal select');
    sels[0].value = '0'; // rows: Data_godzina
    sels[1].value = 'hour';
    sels[3].value = '2'; // values: Generowanie
    sels[4].value = 'Średnia';
  })()`);
  await H.click('.modal .btn', 'Utwórz');
  await H.sleep(500);
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'B12'; })()`); // row 12 = hour 10
  press('Return');
  await H.sleep(150);
  const avg10 = Number((await H.js(`document.querySelector('.fx-input').value`)).replace(',', '.'));
  H.assert(Math.abs(avg10 - 2.1241) < 0.00005, 'average generation at 10:00 = 2,1241, got ' + avg10);

  // ---- columns fit what they show: dates are stored as numbers, so the width must come from the
  // shown text ("2023-01-01"), never "###"
  await go('#/t/2024-czerwiec/7.1?from=exam', 300);
  await H.waitFor(() => H.js(`!!document.querySelector('.grid-canvas')`), 15000);
  await H.sleep(1800); // let the debounced saves land
  const fit = await H.js(`(async () => {
    const st = await (await import('./js/store.js')).loadTaskState('2024-czerwiec/7.1');
    const meta = st.sheet?.meta?.uzdrowisko;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = '13px system-ui, "Segoe UI", Ubuntu, "Noto Sans", sans-serif';
    return { w: meta?.colW?.[0], need: Math.ceil(probe.measureText('2023-01-01').width + 6) };
  })()`);
  H.assert(fit.w >= fit.need, 'date column wide enough: ' + JSON.stringify(fit));
  // a long number typed into a narrow column widens it too
  await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = 'E2'; })()`);
  press('Return');
  await H.sleep(100);
  for (const ch of '1234567890123') {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode: ch });
    H.wc.sendInputEvent({ type: 'char', keyCode: ch });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode: ch });
  }
  press('Return');
  await H.sleep(1800);
  const wE = await H.js(`(async () => (await (await import('./js/store.js')).loadTaskState('2024-czerwiec/7.1')).sheet.meta.uzdrowisko.colW[4])()`);
  H.assert(wE > 92, 'column E widened for a long number: ' + wE);

  // ---- SQL dialect helpers --------------------------------------------------------------------
  await go('#/t/2025-maj/7.2?from=exam', 1800);
  await H.js(`window.monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null).setValue("SELECT TOP 1 nazwa_lazika, MIN(data_pomiaru), MAX(data_pomiaru)\\nFROM Pomiary INNER JOIN Laziki ON Pomiary.nr_lazika = Laziki.nr_lazika\\nWHERE YEAR(data_pomiaru) > 2000\\nGROUP BY Laziki.nr_lazika\\nORDER BY DATEDIFF(MAX(data_pomiaru), MIN(data_pomiaru)) DESC;")`);
  await H.click('.btn', 'Wykonaj');
  await H.waitFor(() => H.js(`(document.querySelector('.answer-area')?.value || '').startsWith('Spirit 14')`), 5000);
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 3000);
  await H.shot('27-sql-dialect');

  // ---- the start page's language cards: the clicked one lights up, every time ---------------------
  await go('#/', 800);
  const activeCard = () => H.js(`[...document.querySelectorAll('.lang-card.active')].map((c) => c.textContent)`);
  for (const [label, lang] of [['C++', 'cpp'], ['Java', 'java'], ['Python', 'python'], ['Java', 'java']]) {
    await H.click('.lang-card', label);
    await H.sleep(150);
    const active = await activeCard();
    H.assert(active.length === 1 && active[0].endsWith(label), `${label} lit (got ${JSON.stringify(active)})`);
    H.assert(await H.js(`import('./js/store.js').then((s) => s.getSettings().lang === '${lang}')`), `${label} chosen`);
  }

  // ---- a task offers only the languages installed on this computer ----------------------------------
  process.env.INFORMATURA_HIDE_TOOLCHAINS = 'cpp,java'; // reported as missing (they can still run)
  await go('#/t/2024-maj/3.2?from=exam', 300);
  await H.waitFor(() => H.js(`document.querySelectorAll('.lang-select option').length === 1`), 15000);
  H.assert((await H.js(`document.querySelector('.lang-select').value`)) === 'python', 'only Python to pick');
  H.assert(/nie wykryto: Java/.test(await H.js(`[...document.querySelectorAll('.toast')].map((t) => t.textContent).join(' ')`)), 'says why the task opens in Python');
  H.assert(await H.js(`import('./js/store.js').then((s) => s.getSettings().lang === 'python')`), 'the language setting follows');
  delete process.env.INFORMATURA_HIDE_TOOLCHAINS;
  await go('#/t/2024-maj/3.3?from=exam', 300);
  await H.waitFor(() => H.js(`document.querySelectorAll('.lang-select option').length === 3`), 15000);
};
