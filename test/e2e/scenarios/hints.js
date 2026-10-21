'use strict';
// Hints: text hints first, then the model solution appears in a marked block in the editor, one
// line first and more later; the line being typed is never mixed with the hint (brackets the
// editor closes itself stay out of it); typed lines leave the ghost, Tab writes a line; no hints
// in an exam.
module.exports = async (H) => {
  const go = async (hash, wait = 900) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  const editor = `window.monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null)`;
  const hintCount = () => H.js(`document.querySelectorAll('.hint-card').length`);
  const ghostLines = () => H.js(`[...document.querySelectorAll('.ghost-zone > div')].map((d) => d.textContent)`);
  const typedPart = () => H.js(`document.querySelector('.ghost-done')?.textContent ?? ''`);
  const key = (keyCode, modifiers = []) => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
  };
  const type = async (text) => {
    for (const ch of text) {
      H.wc.sendInputEvent({ type: 'keyDown', keyCode: ch });
      H.wc.sendInputEvent({ type: 'char', keyCode: ch });
      H.wc.sendInputEvent({ type: 'keyUp', keyCode: ch });
      await H.sleep(15);
    }
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
  H.assert((await ghostLines()).length === 0, 'no code in the editor after a text hint');
  await hintBtn();
  await hintBtn();
  await H.sleep(600);
  H.assert((await hintCount()) === 3, 'three hints shown');
  H.assert(JSON.stringify(await ghostLines()) === '["for liczba in dane:"]', 'one ghost line at stage 1: ' + JSON.stringify(await ghostLines()));
  H.assert(await H.js(`!!document.querySelector('.ghost-margin svg')`), 'the hint block is marked in the margin');
  // the line under the block is where it gets typed; the line itself stays untouched
  const typingLine = await H.js(`(() => { const p = ${editor}.getPosition(); return ${editor}.getModel().getLineContent(p.lineNumber); })()`);
  H.assert(typingLine === '', 'cursor on the empty line under the hint: ' + JSON.stringify(typingLine));
  await H.shot('40-hint-one-line');

  // type the line: it leaves the ghost
  await H.js(`(() => {
    const ed = ${editor};
    const m = ed.getModel();
    const ln = m.getLinesContent().indexOf('wynik = 0') + 2;
    ed.executeEdits('t', [{ range: new monaco.Range(ln, 1, ln, 1), text: 'for liczba in dane :' }]);
  })()`);
  await H.sleep(300);
  H.assert((await ghostLines()).length === 0, 'typed line no longer a ghost');

  // stage 2: about half of the solution
  await hintBtn();
  await H.sleep(600);
  const half = await ghostLines();
  H.assert(half.length === 3, 'stage 2 shows the next lines: ' + JSON.stringify(half));

  // Tab writes the ghost line under the cursor
  await H.js(`(() => {
    const ed = ${editor};
    const m = ed.getModel();
    const ln = m.getLinesContent().findIndex((l) => l.startsWith('for liczba')) + 1;
    ed.executeEdits('t', [{ range: new monaco.Range(ln, m.getLineMaxColumn(ln), ln, m.getLineMaxColumn(ln)), text: '\\n    ' }]);
    ed.setPosition({ lineNumber: ln + 1, column: m.getLineMaxColumn(ln + 1) });
    ed.focus();
  })()`);
  await H.sleep(300);
  H.wc.sendInputEvent({ type: 'keyDown', keyCode: 'Tab' });
  H.wc.sendInputEvent({ type: 'keyUp', keyCode: 'Tab' });
  await H.sleep(300);
  const written = await H.js(`${editor}.getValue()`);
  H.assert(written.includes('\n    bloki = 1\n'), 'Tab wrote the ghost line:\n' + written);

  // typing the next line by hand: the editor closes the bracket itself, and the hint block only
  // marks the typed part – nothing is added to the line being typed
  key('End');
  H.wc.sendInputEvent({ type: 'keyDown', keyCode: 'Return' });
  H.wc.sendInputEvent({ type: 'char', keyCode: '\r' });
  H.wc.sendInputEvent({ type: 'keyUp', keyCode: 'Return' });
  await H.sleep(100);
  await type('for i in range(');
  await H.sleep(300);
  const line = await H.js(`(() => { const p = ${editor}.getPosition(); return ${editor}.getModel().getLineContent(p.lineNumber); })()`);
  H.assert(line === '    for i in range()', 'the editor closed the bracket: ' + JSON.stringify(line));
  H.assert((await typedPart()) === '    for i in range(', 'typed part marked in the hint: ' + JSON.stringify(await typedPart()));
  H.assert((await ghostLines())[0] === '    for i in range(1, len(liczba)):', 'hint keeps the whole line: ' + JSON.stringify(await ghostLines()));
  await H.shot('40b-hint-typing');
  key('Tab'); // finishes the line from the hint
  await H.sleep(300);
  H.assert((await H.js(`${editor}.getValue()`)).includes('\n    for i in range(1, len(liczba)):\n'), 'Tab finished the started line');

  // stage 3: the whole solution; running it gives the right answer
  await hintBtn();
  await H.sleep(600);
  H.assert((await hintCount()) === 5, 'all five hints shown');
  await H.shot('41-hint-whole-solution');
  const missing = await H.js(`(async () => {
    const ed = ${editor};
    const m = ed.getModel();
    // write out the rest of the ghost exactly as shown
    const ref = await (await fetch('content/solutions/2023-maj/2.2.py')).text();
    ed.setValue(ref);
    return 0;
  })()`);
  await H.sleep(400);
  H.assert(missing === 0 && (await ghostLines()).length === 0, 'the whole solution typed: no ghost left');
  await H.click('.btn', 'Uruchom');
  await H.waitFor(() => H.js(`(document.querySelector('.answer-area')?.value || '').trim() === '10'`), 20000);

  // other language: the ghost follows
  await H.js(`(() => { const s = document.querySelector('.lang-select'); s.value = 'cpp'; s.dispatchEvent(new Event('change')); })()`);
  await H.sleep(900);
  await H.click('.hint-card .btn', 'Pokaż w edytorze'); // scrolls the ghost into view
  await H.sleep(400);
  const cppGhost = (await ghostLines()).join('\n');
  H.assert(cppGhost.includes('for (string liczba : dane) {'), 'C++ ghost shown: ' + cppGhost.slice(0, 200));
  await H.shot('42-hint-cpp');

  // ---- SQL ------------------------------------------------------------------------------------
  await go('#/t/2023-maj/7.4?from=exam', 2500);
  await H.waitFor(() => H.js(`document.querySelectorAll('.sql-side .tbl-item').length === 3`), 15000);
  for (let i = 0; i < 4; i++) {
    await hintBtn();
    await H.sleep(250);
  }
  await H.sleep(500);
  H.assert(((await ghostLines())[0] || '').startsWith('WITH zestawienie AS ('), 'SQL ghost: first line: ' + JSON.stringify(await ghostLines()));
  await hintBtn();
  await H.sleep(600);
  H.assert((await ghostLines()).length > 10, 'SQL ghost: whole query');
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
