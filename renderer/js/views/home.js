import { h, icon, btn } from '../ui.js';
import { getExams, allTasks, CATEGORIES, examTitle } from '../content.js';
import { getSettings, setSettings, allProgress } from '../store.js';
import { LANGS } from '../algo.js';
import { navigate } from '../app.js';

export function renderHome(view) {
  const exams = getExams();
  const tasks = allTasks();
  const progress = allProgress();
  const totalPts = tasks.reduce((s, t) => s + t.task.points, 0);
  const gotPts = tasks.reduce((s, t) => s + (progress[t.key]?.best ?? progress[t.key]?.points ?? 0), 0);
  const solved = tasks.filter((t) => progress[t.key]?.status === 'correct').length;

  const langPick = h(
    'div',
    { class: 'lang-pick' },
    Object.entries(LANGS).map(([k, v]) =>
      h(
        'button',
        {
          class: `lang-card ${getSettings().lang === k ? 'active' : ''}`,
          onclick: async (e) => {
            await setSettings({ lang: k });
            langPick.querySelectorAll('.lang-card').forEach((b) => b.classList.toggle('active', b === e.currentTarget));
          },
        },
        h('span', { class: `lang-logo l-${k}` }, k === 'python' ? 'Py' : k === 'cpp' ? 'C++' : 'J'),
        h('span', null, v.label),
      ),
    ),
  );

  const tools = h('div', { class: 'toolchains small muted' }, 'Sprawdzanie kompilatorów…');
  window.api.detectToolchains().then((tc) => {
    tools.textContent = '';
    for (const [k, v] of Object.entries(tc)) {
      tools.appendChild(h('span', { class: `tc ${v.ok ? 'ok' : 'bad'}`, title: v.ok ? v.details || v.version : v.error }, v.ok ? icon('check', 13) : icon('x', 13), ` ${LANGS[k].label}${v.ok ? ': ' + v.version : ' – brak'}`));
    }
    if (Object.values(tc).some((v) => !v.ok)) tools.appendChild(h('a', { href: '#/settings', class: 'small' }, ' Jak zainstalować?'));
  });

  const cats = Object.entries(CATEGORIES).map(([id, c]) => {
    const list = tasks.filter((t) => t.task.cat === id);
    const done = list.filter((t) => progress[t.key]?.status === 'correct').length;
    return h(
      'button',
      { class: `cat-card cat-${id}`, onclick: () => navigate(`#/browse?cat=${id}`) },
      h('div', { class: 'cat-card-head' }, icon(c.icon, 18), h('b', null, c.label)),
      h('div', { class: 'small muted' }, c.desc),
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: list.length ? (100 * done) / list.length + '%' : '0' } })),
      h('div', { class: 'small' }, `${done} / ${list.length} zadań`),
    );
  });

  view.appendChild(
    h(
      'div',
      { class: 'page home' },
      h(
        'section',
        { class: 'hero' },
        h(
          'div',
          null,
          h('h1', null, 'Ćwicz na prawdziwych maturach z informatyki'),
          h(
            'p',
            { class: 'lead' },
            `Wszystkie zadania pochodzą z ${exams.length} arkuszy CKE (poziom rozszerzony, formuła 2023). Programy piszesz i uruchamiasz tutaj – pliki z danymi są już na miejscu. Do zadań z baz danych masz SQL, do arkusza kalkulacyjnego – arkusz z polskimi funkcjami, a zadania teoretyczne sprawdzisz od razu.`,
          ),
          h('div', { class: 'hero-stats' }, stat(solved, 'rozwiązanych zadań', `z ${tasks.length}`), stat(gotPts, 'zdobytych punktów', `z ${totalPts}`), stat(exams.length, 'arkuszy', 'maj i czerwiec')),
        ),
        h('div', { class: 'hero-side' }, h('div', { class: 'side-label' }, 'Twój język programowania'), langPick, tools),
      ),
      h(
        'section',
        { class: 'modes' },
        modeCard('book', 'Cały arkusz', 'Wybierz maturę i rozwiązuj ją zadanie po zadaniu – w trybie ćwiczeń albo jako symulację egzaminu z zegarem (210 minut).', 'Wybierz arkusz', '#/exams'),
        modeCard('shuffle', 'Losowe zadanie', 'Losuj zadania z wybranych działów i matur. Dobre na szybki trening jednego typu zadań.', 'Losuj', '#/random'),
        modeCard('list', 'Wszystkie zadania', 'Przeglądaj zadania według działów, matur i postępu. Wracaj do tych, które sprawiły Ci trudność.', 'Przeglądaj', '#/browse'),
      ),
      h('h2', { class: 'section-title' }, 'Działy'),
      h('section', { class: 'cats' }, cats),
      h('h2', { class: 'section-title' }, 'Arkusze'),
      h(
        'section',
        { class: 'exam-mini-list' },
        exams.map((e) => {
          const list = e.tasks;
          const pts = list.reduce((s, t) => s + (progress[t.key]?.best ?? 0), 0);
          return h('button', { class: 'exam-mini', onclick: () => navigate(`#/exam/${e.id}`) }, h('b', null, examTitle(e)), h('span', { class: 'small muted' }, e.dateText), h('span', { class: 'small' }, `${pts} / ${e.maxPoints} pkt`));
        }),
      ),
    ),
  );
  return null;
}

function stat(n, label, sub) {
  return h('div', { class: 'stat' }, h('div', { class: 'stat-n' }, String(n)), h('div', { class: 'stat-l' }, label), h('div', { class: 'stat-s muted small' }, sub));
}

function modeCard(ic, title, text, cta, href) {
  return h('button', { class: 'mode-card', onclick: () => navigate(href) }, h('div', { class: 'mode-icon' }, icon(ic, 22)), h('h3', null, title), h('p', { class: 'muted' }, text), h('span', { class: 'cta' }, cta, icon('right', 14)));
}
