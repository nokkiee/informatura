'use strict';
// Opens every task of every exam and checks that it renders without errors, then reveals
// all its hints (and, for code and SQL tasks, the model solution in the editor) and the solution,
// in a narrow statement pane: nothing may need sideways scrolling.
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
  // a narrow statement pane (the splitter dragged far left): nothing may need sideways scrolling
  await H.js(`localStorage.setItem('leftPaneWidth', '400')`);
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
    const expectedFields = await H.js(`(async () => {
      const [id, no] = ${JSON.stringify(key)}.split('/');
      const e = (await import('./content/exams/' + id + '.js')).default;
      const t = e.groups.flatMap((g) => g.tasks).find((x) => x.no === no);
      return t.kind === 'fill' ? Object.keys(t.fields || {}).length : 0;
    })()`);
    if (info.fields !== expectedFields) problems.push(`${key}: ${info.fields} answer fields shown, expected ${expectedFields}`);
    if (info.len < 20) problems.push(key + ': empty text');
    if (info.raw) problems.push(key + ': raw placeholder or undefined in text');
    if (info.imgs.length) problems.push(key + ': broken image ' + info.imgs.join(', '));

    // every hint: rendered, and for code / SQL tasks the model solution shows up in the editor
    const hints = await H.js(`(async () => {
      const [id, no] = ${JSON.stringify(key)}.split('/');
      const texts = (await import('./content/hints/' + id + '.js')).default[no] || [];
      const e = (await import('./content/exams/' + id + '.js')).default;
      const kind = e.groups.flatMap((g) => g.tasks).find((t) => t.no === no).kind;
      const stages = ['program', 'algorithm'].includes(kind) ? 3 : ['sql', 'sqlwrite'].includes(kind) ? 2 : 0;
      const btn = () => [...document.querySelectorAll('.answer-actions .btn')].find((b) => /odpowied/i.test(b.textContent));
      for (let i = 0; i < 12 && btn() && !btn().disabled; i++) btn().click();
      return { expected: texts.length + stages, stages };
    })()`);
    await H.sleep(hints.stages ? 1200 : 150);
    const shown = await H.js(`(() => {
      const box = document.querySelector('.hints-box').cloneNode(true);
      box.querySelectorAll('code, pre').forEach((c) => c.remove());
      document.body.appendChild(box);
      const txt = box.innerText;
      box.remove();
      return {
        cards: document.querySelectorAll('.hint-card').length,
        raw: /\\{\\{|\\$\\{|undefined|\\*\\*|\`/.test(txt),
        ghost: !!document.querySelector('.ghost-zone, .ghost-text'),
      };
    })()`);
    if (shown.cards !== hints.expected) problems.push(`${key}: ${shown.cards} hints shown, expected ${hints.expected}`);
    if (shown.raw) problems.push(key + ': raw markdown in hints');
    if (hints.stages && !shown.ghost) problems.push(key + ': no model solution in the editor');

    // with the solution shown too: code blocks hold code (not task text that slipped in), and
    // nothing in the statement pane is wider than the pane
    await H.js(`[...document.querySelectorAll('.answer-actions .btn')].find((b) => b.textContent.includes('Pokaż rozwiązanie'))?.click()`);
    await H.js(`document.querySelectorAll('details.intro').forEach((d) => (d.open = true))`);
    await H.sleep(120);
    const layout = await H.js(`(() => {
      const pane = document.querySelector('.pane-left');
      const badPre = [...pane.querySelectorAll('pre')].filter((p) => /\\x60{3}|\\{\\{|<\\/?(table|tr|td|div|span|sub|sup|img)\\b/.test(p.textContent)).length;
      const wide = [...pane.querySelectorAll('*')].filter((el) => el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible').map((el) => el.tagName.toLowerCase() + '.' + [...el.classList].join('.'));
      if (pane.scrollWidth > pane.clientWidth + 2) wide.push('the pane itself');
      return { badPre, wide };
    })()`);
    if (layout.badPre) problems.push(key + ': task text or HTML inside a code block');
    if (layout.wide.length) problems.push(key + ': needs sideways scrolling: ' + layout.wide.join(', '));
    if (process.env.SHOTS) await H.shot('task-' + key.replace(/[/.]/g, '_'));
  }
  if (problems.length) throw new Error('Problems:\n' + problems.join('\n'));
  console.log('rendered', keys.length, 'tasks');
};
