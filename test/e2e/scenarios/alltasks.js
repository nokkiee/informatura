'use strict';
// Opens every task of every exam and checks that it renders without errors.
// SHOTS=1 also saves a screenshot of each task.
module.exports = async (H) => {
  const keys = await H.js(`(async () => {
    const ids = (await import('./content/exams/index.js')).default;
    const out = [];
    for (const id of ids) {
      const e = (await import('./content/exams/' + id + '.js')).default;
      for (const g of e.groups) for (const t of g.tasks) out.push(id + '/' + t.no);
    }
    return out;
  })()`);
  H.assert(keys.length > 100, 'tasks found: ' + keys.length);
  const problems = [];
  for (const key of keys) {
    await H.js(`location.hash = ${JSON.stringify('#/t/' + key + '?from=exam')}`);
    try {
      await H.waitFor(() => H.js(`!!document.querySelector('.task-card .task-text') && document.querySelector('.task-no')?.textContent.includes(${JSON.stringify(key.split('/')[1])})`), 8000);
    } catch {
      problems.push(key + ': did not render');
      continue;
    }
    await H.sleep(250);
    const info = await H.js(`(() => {
      const t = document.querySelector('.task-text');
      const clone = document.querySelector('.stmt').cloneNode(true);
      clone.querySelectorAll('code, pre').forEach((c) => c.remove());
      document.body.appendChild(clone);
      const txt = clone.innerText;
      clone.remove();
      const raw = /\\{\\{|\\$\\{|undefined|\\[object Object\\]|\\*\\*|(^|[\\s(])\\*[A-Za-z][^*\\n]{0,30}\\*([\\s,.)]|$)/.test(txt);
      const imgs = [...document.querySelectorAll('.stmt img')].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src);
      return { len: t.innerText.length, raw, imgs, fields: document.querySelectorAll('.task-text .fld, .task-text .board-input').length };
    })()`);
    if (info.len < 20) problems.push(key + ': empty text');
    if (info.raw) problems.push(key + ': raw placeholder or undefined in text');
    if (info.imgs.length) problems.push(key + ': broken image ' + info.imgs.join(', '));
    if (process.env.SHOTS) await H.shot('task-' + key.replace(/[/.]/g, '_'));
  }
  if (problems.length) throw new Error('Problems:\n' + problems.join('\n'));
  console.log('rendered', keys.length, 'tasks');
};
