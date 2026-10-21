'use strict';
// Hints: text hints first, then the model solution is hinted in the editor the way VS Code
// suggests code – faint text at the cursor (woven around brackets the editor closed itself) and
// the following lines faintly under it, while the code below stays put; a bulb marks where a
// hint waits; Tab writes a line, Esc hides the hint; no hints in an exam.
module.exports = async (H) => {
  const go = async (hash, wait = 900) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  const editor = `window.monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null)`;
  const hintCount = () => H.js(`document.querySelectorAll('.hint-card').length`);
  // (Monaco draws the spaces of injected text as no-break spaces)
  const ghostText = () => H.js(`[...document.querySelectorAll('.ghost-text')].map((d) => d.textContent.replace(/\\u00a0/g, ' ')).join('|')`);
  const ghostLines = () => H.js(`[...document.querySelectorAll('.ghost-zone > div')].map((d) => d.textContent)`);
  const bulbs = () => H.js(`document.querySelectorAll('.ghost-bulb').length`);
  const value = () => H.js(`${editor}.getValue()`);
  const cursorLine = () => H.js(`(() => { const p = ${editor}.getPosition(); return ${editor}.getModel().getLineContent(p.lineNumber); })()`);
  const topOf = (text) => H.js(`(() => { const ed = ${editor}; return ed.getTopForLineNumber(ed.getModel().getLinesContent().indexOf(${JSON.stringify(text)}) + 1); })()`);
  const key = (keyCode, modifiers = []) => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
  };
  const enter = async () => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode: 'Return' });
    H.wc.sendInputEvent({ type: 'char', keyCode: '\r' });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode: 'Return' });
    await H.sleep(100);
  };
  const type = async (text) => {
    for (const ch of text) {
      H.wc.sendInputEvent({ type: 'keyDown', keyCode: ch });
      H.wc.sendInputEvent({ type: 'char', keyCode: ch });
      H.wc.sendInputEvent({ type: 'keyUp', keyCode: ch });
      await H.sleep(15);
    }
    await H.sleep(150);
  };
  const hintBtn = () => H.click('.answer-actions .btn', 'odpowied'); // „Podpowiedź” / „Kolejna podpowiedź”

  // ---- a program task (Python) ------------------------------------------------------------------
  await go('#/settings', 300);
  await H.js(`(async () => { const s = await import('./js/store.js'); s.setSettings({ lang: 'python' }); })()`);
  await go('#/t/2023-maj/2.2?from=exam', 2500);
  await H.waitFor(() => H.js(`!!window.monaco && ${editor} != null`), 15000);
  H.assert((await hintCount()) === 0, 'no hints shown at the start');
  await hintBtn();
  await H.sleep(300);
  H.assert((await hintCount()) === 1, 'first hint shown');
  H.assert((await ghostText()) === '' && (await ghostLines()).length === 0 && (await bulbs()) === 0, 'no code in the editor after a text hint');
  await hintBtn();
  await hintBtn();
  await H.sleep(600);
  H.assert((await hintCount()) === 3, 'three hints shown');
  // stage 1: the first line, at the cursor on the empty line where it belongs
  H.assert((await ghostText()) === 'for liczba in dane:', 'one line hinted at the cursor: ' + (await ghostText()));
  H.assert((await ghostLines()).length === 0, 'only one line at stage 1');
  H.assert((await bulbs()) === 1, 'a bulb marks where the hint waits');
  H.assert((await cursorLine()) === '', 'the line itself stays empty');
  await H.shot('40-hint-one-line');

  // typing it: the rest follows the cursor and the code below doesn't move
  const printTop = await topOf('print(wynik)');
  await type('for liczba in da');
  H.assert((await ghostText()) === 'ne:', 'the rest of the line follows the cursor: ' + (await ghostText()));
  H.assert((await topOf('print(wynik)')) === printTop, 'the code below stays put');
  await type('ne:');
  H.assert((await ghostText()) === '' && (await bulbs()) === 0, 'typed line no longer hinted');

  // stage 2: about half of the solution; the cursor goes where the next lines belong
  await hintBtn();
  await H.sleep(600);
  H.assert(JSON.stringify(await ghostLines()) === JSON.stringify(['    bloki = 1', '    for i in range(1, len(liczba)):', '        if liczba[i] != liczba[i - 1]:']), 'stage 2 shows the next lines: ' + JSON.stringify(await ghostLines()));
  // Tab writes the next line
  key('Tab');
  await H.sleep(300);
  H.assert((await value()).includes('dane:\n    bloki = 1\n'), 'Tab wrote the hinted line:\n' + (await value()));
  // typing the next one by hand: the editor closes the bracket, the hint goes around it
  const top2 = await topOf('print(wynik)');
  await enter();
  await type('for i in range(');
  H.assert((await cursorLine()) === '    for i in range()', 'the editor closed the bracket: ' + JSON.stringify(await cursorLine()));
  H.assert((await ghostText()) === '1, len(liczba|):', 'hint woven around the bracket: ' + (await ghostText()));
  H.assert((await topOf('print(wynik)')) === top2, 'the code below stays put while typing');
  await H.shot('40b-hint-typing');
  key('Tab'); // finishes the started line
  await H.sleep(300);
  H.assert((await value()).includes('\n    for i in range(1, len(liczba)):\n'), 'Tab finished the started line');
  // Esc hides the hint
  H.assert((await ghostLines()).length === 1, 'one more line hinted under the cursor');
  key('Escape');
  await H.sleep(200);
  H.assert((await ghostLines()).length === 0 && (await ghostText()) === '', 'Esc hid the hint');
  H.assert((await bulbs()) === 1, 'the bulb still marks it');

  // stage 3: the whole solution; running it gives the right answer
  await hintBtn();
  await H.sleep(600);
  H.assert((await hintCount()) === 5, 'all five hints shown');
  await H.shot('41-hint-whole-solution');
  await H.js(`(async () => ${editor}.setValue(await (await fetch('content/solutions/2023-maj/2.2.py')).text()))()`);
  await H.sleep(400);
  H.assert((await ghostLines()).length === 0 && (await ghostText()) === '' && (await bulbs()) === 0, 'the whole solution typed: no hint left');
  await H.click('.btn', 'Uruchom');
  await H.waitFor(() => H.js(`(document.querySelector('.answer-area')?.value || '').trim() === '10'`), 20000);

  // other language: the hints follow
  await H.js(`(() => { const s = document.querySelector('.lang-select'); s.value = 'cpp'; s.dispatchEvent(new Event('change')); })()`);
  await H.sleep(900);
  await H.click('.hint-card .btn', 'Pokaż w edytorze'); // puts the cursor where the hint is
  await H.sleep(400);
  const cppGhost = (await ghostText()) + '\n' + (await ghostLines()).join('\n');
  H.assert(cppGhost.includes('for (string liczba : dane) {'), 'C++ hint shown: ' + cppGhost.slice(0, 200));
  await H.shot('42-hint-cpp');

  // ---- SQL ------------------------------------------------------------------------------------
  await go('#/t/2023-maj/7.4?from=exam', 2500);
  await H.waitFor(() => H.js(`document.querySelectorAll('.sql-side .tbl-item').length === 3`), 15000);
  for (let i = 0; i < 4; i++) {
    await hintBtn();
    await H.sleep(250);
  }
  await H.sleep(500);
  H.assert((await ghostText()).startsWith('WITH zestawienie AS ('), 'SQL hint: first line: ' + (await ghostText()));
  await hintBtn();
  await H.sleep(600);
  H.assert((await ghostLines()).length > 10, 'SQL hint: whole query');
  const struck = await H.js(`${editor}.getModel().getAllDecorations().filter((d) => d.options.inlineClassName === 'ghost-remove').length`);
  H.assert(struck === 3, 'starter lines struck through: ' + struck);
  await H.shot('43-hint-sql');

  // ---- theory: text hints only -------------------------------------------------------------------
  await go('#/t/2023-maj/5?from=exam', 800);
  await hintBtn();
  await hintBtn();
  await hintBtn();
  await H.sleep(300);
  H.assert((await hintCount()) === 3, 'three theory hints');
  H.assert(await H.js(`[...document.querySelectorAll('.answer-actions .btn')].some((b) => b.disabled && b.textContent.includes('Brak kolejnych'))`), 'no more hints');

  // hints are remembered
  await go('#/t/2023-maj/2.2?from=exam', 2500);
  H.assert((await hintCount()) === 5, 'hints remembered for the task');

  // ---- no hints in an exam simulation --------------------------------------------------------------
  await go('#/exam/2023-czerwiec', 800);
  await H.click('.btn', 'Symulacja egzaminu');
  await H.sleep(300);
  await H.click('.modal .btn', 'Start');
  await H.waitFor(() => H.js(`!!document.querySelector('.timer')`), 8000);
  H.assert(await H.js(`![...document.querySelectorAll('.answer-actions .btn')].some((b) => b.textContent.includes('odpowied'))`), 'no hint button in a simulation');
};
