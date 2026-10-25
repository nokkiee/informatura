'use strict';
module.exports = async (H) => {
  const go = async (hash, wait = 900) => { await H.js(`location.hash = ${JSON.stringify(hash)}`); await H.sleep(wait); };
  await H.js(`(async () => { const s = await import('./js/store.js'); s.setSettings({ lang: 'python' }); })()`);
  await go('#/learn', 1500);
  await H.shot('L1-overview');
  await go('#/learn/programowanie', 1000);
  await H.shot('L2-section');
  await go('#/learn/programowanie/prog-01-start', 1500);
  await H.shot('L3-step1');
  await H.click('.ex .btn', 'Uruchom');
  await H.waitFor(() => H.js(`!!document.querySelector('.ex-stdout')`), 20000);
  await H.sleep(300);
  await H.shot('L4-run');
  console.log('out:', await H.js(`document.querySelector('.ex-stdout').textContent`));
  await H.click('.step-link', 'Sprawdź się');
  await H.sleep(1500);
  await H.shot('L5-quiz');
  // answer first question right
  await H.js(`document.querySelectorAll('.q-card')[0].querySelectorAll('.opt')[0].click()`);
  await H.js(`[...document.querySelectorAll('.q-card')[0].querySelectorAll('.btn')].find(b=>b.textContent.includes('Sprawdź')).click()`);
  await H.sleep(300);
  // code question 5: put solution
  await H.waitFor(() => H.js(`monaco.editor.getEditors().length >= 2`), 15000);
  await H.js(`(async () => { const q = (await import('../content/lessons/programowanie/prog-01-start.js')).default.quiz[4]; monaco.editor.getEditors()[0].setValue(q.solution.python); })()`);
  await H.js(`[...document.querySelectorAll('.q-card')[4].querySelectorAll('.btn')].find(b=>b.textContent.includes('Sprawdź')).click()`);
  await H.waitFor(() => H.js(`!!document.querySelectorAll('.q-card')[4].querySelector('.q-feedback:not([hidden])')`), 30000);
  await H.js(`document.querySelectorAll('.q-card')[4].scrollIntoView()`);
  await H.sleep(500);
  await H.shot('L6-code');
  console.log('fb:', await H.js(`document.querySelectorAll('.q-card')[4].querySelector('.q-feedback').textContent`));
};
