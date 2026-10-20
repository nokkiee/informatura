import { h, icon } from '../ui.js';
import { getExams, examTitle, CATEGORIES } from '../content.js';
import { allProgress } from '../store.js';
import { navigate } from '../app.js';

export function renderExams(view) {
  const progress = allProgress();
  const byYear = new Map();
  for (const e of getExams()) {
    if (!byYear.has(e.year)) byYear.set(e.year, []);
    byYear.get(e.year).push(e);
  }
  const page = h('div', { class: 'page' }, h('h1', null, 'Arkusze maturalne'), h('p', { class: 'muted' }, 'Egzamin maturalny z informatyki, poziom rozszerzony, formuła 2023 – termin główny (maj) i dodatkowy (czerwiec).'));
  for (const [year, list] of [...byYear.entries()].sort((a, b) => b[0] - a[0])) {
    page.appendChild(h('h2', { class: 'section-title' }, String(year)));
    page.appendChild(
      h(
        'div',
        { class: 'exam-grid' },
        list.map((e) => {
          const done = e.tasks.filter((t) => progress[t.key]?.status === 'correct').length;
          const pts = e.tasks.reduce((s, t) => s + (progress[t.key]?.best ?? 0), 0);
          const cats = {};
          for (const t of e.tasks) cats[t.task.cat] = (cats[t.task.cat] || 0) + t.task.points;
          return h(
            'button',
            { class: 'exam-card', onclick: () => navigate(`#/exam/${e.id}`) },
            h('div', { class: 'exam-card-top' }, h('span', { class: 'exam-term' }, e.term), h('span', { class: 'muted small' }, e.symbol)),
            h('h3', null, examTitle(e)),
            h('div', { class: 'muted' }, icon('clock', 14), ` ${e.dateText} · ${e.duration} min · ${e.maxPoints} pkt`),
            h(
              'div',
              { class: 'cat-mix' },
              Object.entries(cats).map(([c, p]) => h('span', { class: `cat-tag cat-${c}`, title: `${CATEGORIES[c]?.label}: ${p} pkt` }, icon(CATEGORIES[c]?.icon || 'info', 12), ` ${p}`)),
            ),
            h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: (100 * pts) / e.maxPoints + '%' } })),
            h('div', { class: 'small' }, `${pts} / ${e.maxPoints} pkt · ${done} / ${e.tasks.length} zadań rozwiązanych`),
          );
        }),
      ),
    );
  }
  view.appendChild(page);
  return null;
}
