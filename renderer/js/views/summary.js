// Exam results: grades every task from the saved work.
import { h, icon, btn, clear, fmtTime } from '../ui.js';
import { md } from '../markdown.js';
import { examTitle, CATEGORIES } from '../content.js';
import { loadTaskState, saveTaskState, recordResult, getSession, setSession, getSettings } from '../store.js';
import { gradeTask, hasWork } from '../grading.js';
import { buildTests } from '../algo.js';
import { outputMatches } from '../check.js';
import { navigate } from '../app.js';

export async function renderSummary(view, exam, params) {
  if (!exam) return null;
  let session = await getSession(exam.id);
  if (params.finish && session && !session.finishedAt) {
    session = { ...session, finishedAt: Date.now() };
    await setSession(exam.id, session);
  }
  const page = h('div', { class: 'page summary' });
  view.appendChild(page);
  page.appendChild(h('div', { class: 'muted small' }, 'Podsumowanie'));
  page.appendChild(h('h1', null, examTitle(exam), h('span', { class: 'muted' }, ' · ' + exam.dateText)));
  if (session?.mode === 'sim' && session.finishedAt) {
    page.appendChild(h('div', { class: 'muted' }, `Symulacja egzaminu · czas: ${fmtTime((session.finishedAt - session.startedAt) / 1000)} z ${exam.duration}:00`));
  }
  const totalBox = h('div', { class: 'total-box' }, h('span', { class: 'spin' }), ' Liczenie punktów…');
  page.appendChild(totalBox);
  const table = h('table', { class: 'summary-table' });
  page.appendChild(table);

  const rows = [];
  for (const entry of exam.tasks) {
    const state = await loadTaskState(entry.key);
    // Algorithm tasks: run the tests now if the user wrote code but didn't test it.
    if (entry.task.kind === 'algorithm' && !state.tests) {
      const lang = state.lang || getSettings().lang;
      const code = state.code?.[lang];
      if (code) {
        const tests = buildTests(entry.task.algo, entry.key);
        const res = await window.api.runTests({ lang, code, tests: tests.map((t) => ({ input: t.input })), timeoutMs: 4000 });
        if (res.results) {
          const passed = res.results.filter((r, i) => r.code === 0 && !r.timedOut && outputMatches(tests[i].expected, r.stdout)).length;
          state.tests = { passed, total: tests.length, lang, at: Date.now() };
          saveTaskState(entry.key, state);
        }
      }
    }
    rows.push({ entry, state });
  }

  function render() {
    clear(table);
    table.appendChild(h('thead', null, h('tr', null, h('th', null, 'Zadanie'), h('th', null, 'Dział'), h('th', null, 'Punkty'), h('th', null, ''))));
    const tb = h('tbody');
    let total = 0;
    let pending = 0;
    const byCat = {};
    for (const { entry, state } of rows) {
      const g = gradeTask(entry, state);
      const worked = hasWork(entry, state);
      if (worked || g.points) recordResult(entry.key, { points: g.points, max: g.max });
      total += g.points;
      const c = entry.task.cat;
      byCat[c] = byCat[c] || { got: 0, max: 0 };
      byCat[c].got += g.points;
      byCat[c].max += g.max;
      const needsSelf = (g.selfPending || (!g.auto && state.selfPoints == null)) && worked;
      if (needsSelf) pending++;
      tb.appendChild(
        h(
          'tr',
          { class: g.points >= g.max ? 'ok' : g.points > 0 ? 'partial' : 'bad' },
          h('td', null, h('a', { href: `#/t/${entry.key}?from=exam` }, entry.task.no)),
          h('td', null, h('span', { class: `cat-tag cat-${c}` }, CATEGORIES[c]?.short || c)),
          h('td', { class: 'num' }, `${g.points} / ${g.max}`),
          h('td', null, !worked ? h('span', { class: 'muted small' }, 'brak odpowiedzi') : needsSelf ? selfGrader(entry, state) : g.auto ? h('span', { class: 'muted small' }, 'sprawdzone automatycznie') : h('span', { class: 'muted small' }, 'ocenione samodzielnie')),
        ),
      );
    }
    table.appendChild(tb);
    clear(totalBox);
    const pct = Math.round((100 * total) / exam.maxPoints);
    totalBox.appendChild(h('div', { class: 'total-n' }, `${total}`, h('span', null, ` / ${exam.maxPoints} pkt`)));
    totalBox.appendChild(h('div', { class: 'total-pct' }, `${pct}%`));
    totalBox.appendChild(
      h(
        'div',
        { class: 'cat-sum' },
        Object.entries(byCat).map(([c, v]) => h('div', { class: 'small' }, h('span', { class: `cat-tag cat-${c}` }, CATEGORIES[c]?.short || c), ` ${v.got} / ${v.max}`)),
      ),
    );
    if (pending) totalBox.appendChild(h('div', { class: 'warn-text small' }, `${pending} zadań wymaga samodzielnej oceny – porównaj z rozwiązaniem i wybierz punkty.`));
  }

  function selfGrader(entry, state) {
    const { task } = entry;
    const max = task.self ? task.self.points : task.points;
    const wrap = h('div', { class: 'self-inline' });
    const sol = h('details', null, h('summary', null, 'rozwiązanie i zasady'), h('div', { class: 'md', html: md(task.solution || '') }), h('div', { class: 'md small', html: md(task.rubric || '') }));
    const row = h('div', { class: 'pts-row' });
    for (let p = 0; p <= max; p++)
      row.appendChild(
        h(
          'button',
          {
            class: 'pts-btn',
            onclick: () => {
              state.selfPoints = p;
              saveTaskState(entry.key, state);
              render();
            },
          },
          `${p}`,
        ),
      );
    wrap.appendChild(h('span', { class: 'small' }, task.self ? `oceń „${task.self.label}”:` : 'oceń się:'));
    wrap.appendChild(row);
    wrap.appendChild(sol);
    return wrap;
  }

  render();
  page.appendChild(
    h(
      'div',
      { class: 'row' },
      btn('Przejrzyj zadania', { icon: 'list', onClick: () => navigate(`#/t/${exam.tasks[0].key}?from=exam`) }),
      btn('Wróć do arkusza', { icon: 'book', onClick: () => navigate(`#/exam/${exam.id}`) }),
      btn('Wyczyść odpowiedzi i zacznij od nowa', {
        icon: 'trash',
        kind: 'danger',
        onClick: async () => {
          for (const { entry } of rows) saveTaskState(entry.key, {});
          await setSession(exam.id, null);
          navigate(`#/exam/${exam.id}`);
        },
      }),
    ),
  );
  return null;
}
