'use strict';
// Lessons ("Lekcje"): the overview, a lesson's steps with runnable examples in the reader's
// language, every kind of quiz question (choice, true/false, short answer, program, SQL query,
// formula), progress that survives a reload, the practice links and a section test.
module.exports = async (H) => {
  const go = async (hash, wait = 900) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  const card = (i) => `document.querySelectorAll('.q-card')[${i}]`;
  const check = (i) => H.js(`[...${card(i)}.querySelectorAll('.q-actions .btn')].find((b) => /^Sprawdź/.test(b.textContent.trim())).click()`);
  const status = (i) => H.js(`${card(i)}.querySelector('.q-status').className`);
  const waitOk = (i, ms = 30000) => H.waitFor(() => H.js(`!!${card(i)}.querySelector('.q-feedback:not([hidden])')`), ms);
  const editorIn = (i) => `monaco.editor.getEditors().find((e) => ${card(i)}.contains(e.getContainerDomNode()))`;
  const setEditor = async (i, text) => {
    await H.waitFor(() => H.js(`!!window.monaco && !!${editorIn(i)}`), 20000);
    await H.js(`${editorIn(i)}.setValue(${JSON.stringify(text)})`);
  };
  const lesson = (section, id) => H.js(`import('../content/lessons/${section}/${id}.js').then((m) => m.default)`);
  await H.js(`(async () => { const s = await import('./js/store.js'); await s.setSettings({ lang: 'python' }); })()`);

  // ---- overview and a section ------------------------------------------------------------
  await go('#/learn', 1500);
  H.assert((await H.js(`document.querySelectorAll('.learn-card').length`)) === 5, 'five sections');
  H.assert(/z 32/.test(await H.js(`document.querySelector('.hero-stats').textContent`)), '32 lessons in total');
  await H.shot('50-learn-overview');
  await go('#/learn/programowanie', 1000);
  H.assert((await H.js(`document.querySelectorAll('.lesson-row:not(.test-row)').length`)) === 7, 'seven programming lessons');
  H.assert(await H.js(`!!document.querySelector('.lesson-row.test-row')`), 'the section test is listed');

  // ---- a lesson: steps and runnable examples -------------------------------------------------
  await go('#/learn/programowanie/prog-01-start', 1500);
  H.assert((await H.js(`document.querySelectorAll('.step-link').length`)) >= 6, 'steps, the quiz and the practice in the side bar');
  await H.click('.ex .btn', 'Uruchom');
  await H.waitFor(() => H.js(`!!document.querySelector('.ex-stdout')`), 30000);
  H.assert((await H.js(`document.querySelector('.ex-stdout').textContent.trim()`)) === 'Witaj, maturo!', 'the Python example ran');
  // examples run the code as written, also after the editor colours them (no-break spaces)
  await H.waitFor(() => H.js(`!!document.querySelector('.ex-code code span')`), 20000);
  await H.js(`document.querySelector('.ex-out').hidden = true; document.querySelector('.ex-stdout').remove()`);
  await H.click('.ex .btn', 'Uruchom');
  await H.waitFor(() => H.js(`!!document.querySelector('.ex-stdout')`), 30000);
  H.assert((await H.js(`document.querySelector('.ex-stdout').textContent`)) === 'Witaj, maturo!\n', 'colourized example runs with plain spaces');
  // the examples follow the language chosen in the header
  await H.js(`(async () => { const s = await import('./js/store.js'); await s.setSettings({ lang: 'cpp' }); })()`);
  await H.sleep(300);
  H.assert((await H.js(`document.querySelector('.ex .ex-code:not([hidden])').dataset.lang`)) === 'cpp', 'examples switch to C++');
  await H.js(`(async () => { const s = await import('./js/store.js'); await s.setSettings({ lang: 'python' }); })()`);
  await H.click('.lesson-nav .btn', 'Dalej');
  await H.sleep(400);
  H.assert(/Zmienne i typy/.test(await H.js(`document.querySelector('.step-title').textContent`)), 'next step');
  await H.shot('51-learn-lesson');

  // ---- the quiz: every closed question and the programs ------------------------------------------
  await H.click('.step-link', 'Sprawdź się');
  await H.sleep(800);
  const L1 = await lesson('programowanie', 'prog-01-start');
  H.assert((await H.js(`document.querySelectorAll('.q-card').length`)) === L1.quiz.length, 'all quiz questions shown');
  // a wrong answer first: feedback and explanation, not done
  await H.js(`${card(0)}.querySelectorAll('.opt')[1].click()`);
  await check(0);
  await H.sleep(200);
  H.assert(/bad/.test(await status(0)), 'wrong choice marked');
  H.assert(await H.js(`!${card(0)}.querySelector('.q-explain').hidden`), 'explanation shown after checking');
  await H.js(`${card(0)}.querySelectorAll('.opt')[0].click()`);
  await check(0);
  await H.sleep(200);
  H.assert(/ok/.test(await status(0)), 'right choice marked');
  // short answer
  await H.js(`(() => { const i = ${card(1)}.querySelector('.q-input'); i.value = '2'; i.dispatchEvent(new Event('input')); })()`);
  await check(1);
  await H.sleep(200);
  H.assert(/ok/.test(await status(1)), 'short answer accepted');
  // true / false
  await H.js(`(() => { const want = ${JSON.stringify(L1.quiz[2].items.map((x) => x.answer))}; ${card(2)}.querySelectorAll('tr').forEach((tr, k) => tr.querySelectorAll('.tf-btn')[want[k] ? 0 : 1].click()); })()`);
  await check(2);
  await H.sleep(200);
  H.assert(/ok/.test(await status(2)), 'true/false accepted');
  await H.js(`${card(3)}.querySelectorAll('.opt')[0].click()`);
  await check(3);
  // programs: a wrong one shows the failing test, the model solution passes
  await setEditor(4, 'a, b = map(int, input().split())\nprint(a / b)\nprint(a % b)\n');
  await check(4);
  await waitOk(4);
  H.assert(/bad/.test(await status(4)), 'a wrong program fails');
  H.assert(await H.js(`!!${card(4)}.querySelector('.q-test-detail')`), 'the failing test is shown');
  await H.shot('52-learn-code-wrong');
  await setEditor(4, L1.quiz[4].solution.python);
  await check(4);
  await H.waitFor(() => H.js(`/ok/.test(${card(4)}.querySelector('.q-status').className)`), 30000);
  await setEditor(5, L1.quiz[5].solution.python);
  await check(5);
  await H.waitFor(() => H.js(`/ok/.test(${card(5)}.querySelector('.q-status').className)`), 30000);
  await H.waitFor(() => H.js(`!document.querySelector('.lesson-done').hidden`), 5000);
  await H.shot('53-learn-done');
  // progress survives a reload
  await H.sleep(800);
  await go('#/learn/programowanie', 1000);
  H.assert(await H.js(`document.querySelector('.lesson-row').classList.contains('done')`), 'the lesson is marked done');
  await go('#/learn/programowanie/prog-01-start', 1200);
  H.assert(await H.js(`!document.querySelector('.lesson-done')?.hidden`), 'reopened on the quiz, still done');
  // practice links lead to real exam tasks
  await H.click('.step-link', 'Zadania z matur');
  await H.sleep(400);
  H.assert((await H.js(`document.querySelectorAll('.practice-row').length`)) === L1.practice.length, 'practice tasks listed');
  await H.click('.practice-row');
  await H.waitFor(() => H.js(`location.hash.startsWith('#/t/') && !!document.querySelector('.task-card')`), 10000);

  // ---- SQL: an example on the lesson database and a query question --------------------------------
  await go('#/learn/bazy/sql-01-model', 1500);
  H.assert((await H.js(`document.querySelectorAll('.db-table').length`)) === 4, 'the lesson database tables are shown');
  await H.click('.ex .btn', 'Wykonaj');
  await H.waitFor(() => H.js(`!!document.querySelector('.ex-out .res-tbl')`), 15000);
  H.assert((await H.js(`document.querySelectorAll('.ex-out .res-tbl tbody tr').length`)) === 20, 'the example query returns 20 students');
  await H.click('.step-link', 'Sprawdź się');
  await H.sleep(800);
  const S1 = await lesson('bazy', 'sql-01-model');
  const sq = S1.quiz.findIndex((q) => q.type === 'sql');
  await setEditor(sq, 'SELECT imie, nazwisko FROM uczniowie;');
  await check(sq);
  await waitOk(sq);
  H.assert(/bad/.test(await status(sq)), 'a query with too few columns fails');
  await setEditor(sq, 'select nazwisko, miasto, imie from uczniowie');
  await check(sq);
  await H.waitFor(() => H.js(`/ok/.test(${card(sq)}.querySelector('.q-status').className)`), 15000);
  await H.shot('54-learn-sql');

  // ---- spreadsheet: a formula example and formula questions ----------------------------------------
  await go('#/learn/arkusz/ark-01-podstawy', 1500);
  await H.click('.ex .btn', 'Oblicz');
  await H.waitFor(() => H.js(`document.querySelectorAll('.formula-res').length >= 4`), 15000);
  H.assert(/45/.test(await H.js(`document.querySelector('.formula-res').textContent`)), '=B2*C2 is 45');
  await H.click('.step-link', 'Sprawdź się');
  await H.sleep(800);
  const A1 = await lesson('arkusz', 'ark-01-podstawy');
  const vat = A1.quiz.findIndex((q) => q.type === 'sheet' && q.cell === 'E2');
  const formula = async (i, f) => {
    await H.js(`(() => { const x = ${card(i)}.querySelector('.q-formula'); x.value = ${JSON.stringify(f)}; x.dispatchEvent(new Event('input')); })()`);
    await check(i);
    await waitOk(i, 15000);
    await H.sleep(200);
    return status(i);
  };
  H.assert(/bad/.test(await formula(vat, '=B2*C2*(1+F2)')), 'a relative address to the VAT rate fails when copied');
  H.assert(/ok/.test(await formula(vat, '=B2*C2*(1+$F$2)')), 'the absolute address passes');
  await H.shot('55-learn-sheet');

  // ---- a section test ---------------------------------------------------------------------------------
  await go('#/learn/teoria/test', 1500);
  const T = await H.js(`import('../content/lessons/teoria/test.js').then((m) => m.default.questions.length)`);
  H.assert((await H.js(`document.querySelectorAll('.q-card').length`)) === T, 'all test questions shown');
  H.assert(await H.js(`![...document.querySelectorAll('.q-card')].some((c) => [...c.querySelectorAll('.btn')].some((b) => b.textContent.trim() === 'Sprawdź'))`), 'closed questions have no check button in a test');
  await H.js(`${card(0)}.querySelector('.q-input').value = '12C'; ${card(0)}.querySelector('.q-input').dispatchEvent(new Event('input'))`);
  await H.click('.lesson-nav .btn', 'Zakończ test');
  await H.waitFor(() => H.js(`!document.querySelector('.test-summary').hidden`), 60000);
  H.assert(await H.js(`document.querySelector('.test-score').classList.contains('bad')`), 'one right answer does not pass the test');
  H.assert((await H.js(`document.querySelectorAll('.test-revisit .chip').length`)) > 0, 'lessons to revisit are suggested');
  await H.shot('56-learn-test');
  await H.click('.lesson-nav .btn', 'Rozwiąż od nowa');
  await H.sleep(400);
  H.assert(await H.js(`document.querySelector('.test-summary').hidden && document.querySelector('.q-input').value === ''`), 'the test starts over');
};
