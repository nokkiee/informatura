'use strict';
// Solves every task through the app's interface, the way a student would, and expects full
// (automatic) points each time:
//   fill-in fields: the key's answers typed in (boards: cells clicked; tasks with many correct
//     answers: one correct example); true/false and choice: the key's answers clicked;
//   program tasks: the Python model solution run with "Uruchom", then "Sprawdź";
//   SQL tasks: the model query run with "Wykonaj", then "Sprawdź";
//   "write a query" tasks: the model query runs without errors;
//   algorithm tasks: the Python model solution passes "Sprawdź testami";
//   spreadsheet tasks: the official answer typed into the answer box, then "Sprawdź".
// Takes several minutes, so it isn't in the default e2e run:  node scripts/e2e.js solveall
// (ONLY=<exam>/<task>,<exam> limits it to some tasks).
module.exports = async (H) => {
  // answers for tasks with many correct answers (checked by simulation in the app)
  const EXAMPLES = {
    '2023-czerwiec/2.1': { s: 'aaaaaaaaaa', k1: '2', k2: '5' },
    '2024-maj/1.2': { a: '10111/01111/11111/11111/11111', b: '1000/1000/1000/1111' },
    '2026-maj/1.1': { c1: '5', w1: 'A(2^6, 2^4), A(2^7, 2^3), A(2^8, 2^2), A(2^9, 2^1), A(2^10, 2^0)', c2: '3', w2: 'A(10, 7), A(10, 3), A(10, 1)', c3: '100' },
    '2026-maj/1.2': { a: '777', b: '512·10^12' },
    '2026-maj/1.3': { n1: 'k', e1: '2^(k-i)', n2: 'k-1', e2: '2^(k-i)-1' },
    '2026-czerwiec/1.2': { k: '1' },
    '2026-czerwiec/1.3': { k: 'n + 1' },
  };
  await H.js(`(async () => { const s = await import('./js/store.js'); s.setSettings({ lang: 'python' }); })()`);
  const keys = await H.js(`(async () => {
    const ids = (await import('./content/exams/index.js')).default;
    const out = [];
    for (const id of ids) { const e = (await import('./content/exams/' + id + '.js')).default; for (const g of e.groups) for (const t of g.tasks) out.push(id + '/' + t.no); }
    return out;
  })()`);
  // ONLY=2025-maj/5,2026-maj solves just these tasks / exams
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  if (only.length) keys.splice(0, keys.length, ...keys.filter((k) => only.some((o) => k === o || k.startsWith(o + '/'))));
  const editor = `monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null)`;
  const clickBtn = (text) => H.js(`(() => { const b = [...document.querySelectorAll('.btn')].find((x) => x.offsetParent !== null && x.textContent.includes(${JSON.stringify(text)})); b?.click(); return !!b; })()`);
  const resultPoints = () => H.js(`(() => { const t = document.querySelector('.result-box:not([hidden]) .result-title'); return t ? Number(t.textContent.trim().split('/')[0]) : null; })()`);
  const problems = [];
  let solved = 0;

  for (const key of keys) {
    await H.js(`location.hash = ${JSON.stringify('#/t/' + key + '?from=browse')}`);
    await H.waitFor(() => H.js(`!!document.querySelector('.task-card .task-text') && document.querySelector('.task-no')?.textContent.includes(${JSON.stringify(key.split('/')[1])})`), 10000);
    const t = await H.js(`(async () => {
      const [id, no] = ${JSON.stringify(key)}.split('/');
      const e = (await import('./content/exams/' + id + '.js')).default;
      const t = e.groups.flatMap((g) => g.tasks).find((x) => x.no === no);
      const fields = {};
      for (const [k, v] of Object.entries(t.fields || {})) fields[k] = v == null ? null : typeof v === 'object' ? v.expr?.[0] ?? null : v;
      return { kind: t.kind, points: t.points, auto: t.points - (t.self?.points || 0), fields, answer: t.answer || null, multi: !!t.multi };
    })()`);
    const fail = (msg) => problems.push(`${key} (${t.kind}): ${msg}`);
    try {
      if (t.kind === 'fill') {
        const values = { ...t.fields, ...(EXAMPLES[key] || {}) };
        const missing = Object.entries(values).filter(([, v]) => v == null).map(([k]) => k);
        if (missing.length) {
          fail('no answer known for ' + missing.join(', '));
          continue;
        }
        await H.js(`(() => {
          const values = ${JSON.stringify(values)};
          for (const [id, v] of Object.entries(values)) {
            const el = document.querySelector('.task-text [data-field="' + id + '"]');
            if (!el) throw new Error('no field ' + id);
            if (el.classList.contains('board-input')) {
              const rows = v.split('/');
              el.querySelectorAll('tr').forEach((tr, i) => tr.querySelectorAll('td').forEach((td, j) => {
                const black = td.classList.contains('b');
                if ((rows[i][j] === '0') !== black) td.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
              }));
            } else {
              el.value = v;
              el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input'));
            }
          }
        })()`);
        await clickBtn('Sprawdź');
      } else if (t.kind === 'tf') {
        await H.js(`(() => {
          const rows = document.querySelectorAll('.tf-table tr');
          ${JSON.stringify(t.answer)}.split('').forEach((v, i) => [...rows[i].querySelectorAll('.tf-btn')].find((b) => b.textContent === v).click());
        })()`);
        await clickBtn('Sprawdź');
      } else if (t.kind === 'choice') {
        await H.js(`${JSON.stringify(t.answer)}.split('').forEach((l) => document.querySelector('.opt[data-letter="' + l + '"]').click())`);
        await clickBtn('Sprawdź');
      } else if (t.kind === 'program' || t.kind === 'algorithm') {
        await H.waitFor(() => H.js(`!!window.monaco && !!${editor}`), 20000);
        const ok = await H.js(`(async () => {
          const [id, no] = ${JSON.stringify(key)}.split('/');
          const res = await fetch('content/solutions/' + id + '/' + no + '.py');
          if (!res.ok) return false;
          ${editor}.setValue(await res.text());
          return true;
        })()`);
        if (!ok) {
          fail('no Python model solution');
          continue;
        }
        if (t.kind === 'algorithm') {
          await clickBtn('Sprawdź testami');
          await H.waitFor(() => H.js(`/Zaliczone testy/.test(document.querySelector('.tests-body')?.textContent || '')`), 60000);
          const summary = await H.js(`document.querySelector('.tests-body .tests-summary').textContent.trim()`);
          const m = summary.match(/(\d+)\s*\/\s*(\d+)/);
          if (!m || m[1] !== m[2]) fail('tests: ' + summary);
          else solved++;
          continue;
        }
        await H.js(`document.querySelector('.answer-area').value = ''`);
        await clickBtn('Uruchom');
        await H.waitFor(() => H.js(`(document.querySelector('.answer-area')?.value || '').trim().length > 0`), 90000);
        await H.sleep(150);
        await clickBtn('Sprawdź');
      } else if (t.kind === 'sql' || t.kind === 'sqlwrite') {
        await H.waitFor(() => H.js(`!!window.monaco && !!${editor} && document.querySelectorAll('.sql-side .tbl-item').length > 0`), 20000);
        await H.js(`(async () => {
          const [id, no] = ${JSON.stringify(key)}.split('/');
          ${editor}.setValue(await (await fetch('content/solutions/' + id + '/' + no + '.sql')).text());
        })()`);
        if (t.kind === 'sqlwrite') {
          await clickBtn('Wykonaj');
          await H.waitFor(() => H.js(`!!document.querySelector('.sql-status .tests-summary')`), 10000);
          if (!(await H.js(`!!document.querySelector('.sql-status .tests-summary.ok')`))) fail('the model query fails: ' + (await H.js(`document.querySelector('.result-body')?.textContent.slice(0, 160)`)));
          else solved++;
          continue;
        }
        await H.js(`document.querySelector('.answer-area').value = ''`);
        await clickBtn('Wykonaj');
        await H.waitFor(() => H.js(`(document.querySelector('.answer-area')?.value || '').trim().length > 0`), 15000);
        await clickBtn('Sprawdź');
      } else if (t.kind === 'sheet') {
        // the official answer, built from the key like the unit test does
        await H.js(`(async () => {
          const C = await import('./js/check.js');
          const [id, no] = ${JSON.stringify(key)}.split('/');
          const e = (await import('./content/exams/' + id + '.js')).default;
          const task = e.groups.flatMap((g) => g.tasks).find((x) => x.no === no);
          const spec = C.normalizeExpect(task.expect, ${t.auto});
          const lineParts = spec.parts.filter((p) => p.lines && !p.reuse);
          let answer;
          if (lineParts.length) {
            const blocks = [];
            for (const p of lineParts) if (!blocks.some((b) => b.join('\\n') === p.lines.join('\\n'))) blocks.push(p.lines);
            answer = blocks.flat().join('\\n');
          } else {
            const out = [];
            for (const p of spec.parts) {
              if (p.reuse) continue;
              const block = p.tokens != null ? (Array.isArray(p.tokens) ? p.tokens[0] : p.tokens) : (p.items || []).join('\\n');
              const prev = out.join(' ');
              if (out.length && block.split(/\\s+/).every((w) => prev.split(/\\s+/).includes(w))) continue;
              out.push(block);
            }
            answer = out.join('\\n');
          }
          const area = document.querySelector('.answer-area');
          area.value = answer;
          area.dispatchEvent(new Event('input'));
        })()`);
        await clickBtn('Sprawdź');
      } else {
        fail('unknown kind');
        continue;
      }
      await H.waitFor(async () => (await resultPoints()) !== null, 5000);
      const pts = await resultPoints();
      if (pts !== t.auto) fail(`${pts} / ${t.auto} pkt` + (await H.js(`' – ' + (document.querySelector('.result-box')?.innerText || '').replace(/\\s+/g, ' ').slice(0, 200)`)));
      else solved++;
    } catch (err) {
      fail(err.message.slice(0, 200));
    }
  }
  console.log(`solved ${solved} of ${keys.length} tasks with full points`);
  if (problems.length) throw new Error('Problems:\n' + problems.join('\n'));
};
