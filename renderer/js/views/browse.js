// Task list with filters, and the random-task picker.
import { h, icon, btn, clear, toast } from '../ui.js';
import { getExams, allTasks, CATEGORIES, KIND_LABELS, examTitle } from '../content.js';
import { allProgress } from '../store.js';
import { navigate } from '../app.js';

function loadFilter(name) {
  try {
    return JSON.parse(sessionStorage.getItem(name) || 'null');
  } catch {
    return null;
  }
}

function defaultFilter() {
  return { cats: Object.keys(CATEGORIES), exams: getExams().map((e) => e.id), status: 'all', q: '' };
}

function applyFilter(f) {
  const progress = allProgress();
  const q = (f.q || '').trim().toLowerCase();
  return allTasks().filter((t) => {
    if (!f.cats.includes(t.task.cat)) return false;
    if (!f.exams.includes(t.exam.id)) return false;
    const p = progress[t.key];
    const st = p && p.status !== 'seen' ? p.status : 'new';
    if (f.status === 'todo' && st === 'correct') return false;
    if (f.status === 'done' && st !== 'correct') return false;
    if (f.status === 'wrong' && !(st === 'wrong' || st === 'partial')) return false;
    if (q) {
      const hay = [t.task.no, t.group.title, t.task.text, ...(t.task.topics || []), examTitle(t.exam)].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function filterBar(f, onChange, { search = true } = {}) {
  const set = (patch) => {
    Object.assign(f, patch);
    onChange();
  };
  const catChips = h(
    'div',
    { class: 'chips' },
    Object.entries(CATEGORIES).map(([id, c]) =>
      h(
        'button',
        {
          class: `fchip cat-${id} ${f.cats.includes(id) ? 'on' : ''}`,
          onclick: (e) => {
            const on = f.cats.includes(id);
            // a click on the only active chip re-enables all
            const cats = on ? f.cats.filter((x) => x !== id) : [...f.cats, id];
            set({ cats: cats.length ? cats : Object.keys(CATEGORIES) });
            render();
          },
          ondblclick: () => {
            set({ cats: [id] });
            render();
          },
          title: 'Kliknij, aby włączyć/wyłączyć; dwuklik – tylko ten dział',
        },
        icon(c.icon, 14),
        c.label,
      ),
    ),
  );
  const examChips = h(
    'div',
    { class: 'chips' },
    getExams().map((e) =>
      h(
        'button',
        {
          class: `fchip ${f.exams.includes(e.id) ? 'on' : ''}`,
          onclick: () => {
            const on = f.exams.includes(e.id);
            const exams = on ? f.exams.filter((x) => x !== e.id) : [...f.exams, e.id];
            set({ exams: exams.length ? exams : getExams().map((x) => x.id) });
            render();
          },
          ondblclick: () => {
            set({ exams: [e.id] });
            render();
          },
        },
        `${e.session === 'maj' ? 'Maj' : 'Czerwiec'} ${e.year}`,
      ),
    ),
  );
  const statusSel = h(
    'select',
    { class: 'select', onchange: (e) => set({ status: e.target.value }) },
    [
      ['all', 'Wszystkie'],
      ['todo', 'Nierozwiązane'],
      ['wrong', 'Z błędami'],
      ['done', 'Rozwiązane'],
    ].map(([v, l]) => h('option', { value: v, selected: f.status === v }, l)),
  );
  const searchBox = search ? h('input', { class: 'input', placeholder: 'Szukaj (np. NWD, palindrom, XOR)…', value: f.q || '', oninput: (e) => set({ q: e.target.value }) }) : null;
  const bar = h('div', { class: 'filter-bar' });
  function render() {
    catChips.querySelectorAll('.fchip').forEach((b, i) => b.classList.toggle('on', f.cats.includes(Object.keys(CATEGORIES)[i])));
    examChips.querySelectorAll('.fchip').forEach((b, i) => b.classList.toggle('on', f.exams.includes(getExams()[i].id)));
  }
  bar.appendChild(h('div', { class: 'fb-row' }, h('span', { class: 'fb-label' }, 'Działy'), catChips));
  bar.appendChild(h('div', { class: 'fb-row' }, h('span', { class: 'fb-label' }, 'Matury'), examChips));
  bar.appendChild(h('div', { class: 'fb-row' }, h('span', { class: 'fb-label' }, 'Status'), statusSel, searchBox));
  return bar;
}

export function renderBrowse(view, params) {
  const f = loadFilter('browseFilter') || defaultFilter();
  if (params.cat && CATEGORIES[params.cat]) f.cats = [params.cat];
  const list = h('div', { class: 'browse-list' });
  const count = h('span', { class: 'muted' });
  const save = () => sessionStorage.setItem('browseFilter', JSON.stringify(f));
  const update = () => {
    save();
    const tasks = applyFilter(f);
    sessionStorage.setItem('browseList', JSON.stringify(tasks.map((t) => t.key)));
    count.textContent = `${tasks.length} zadań · ${tasks.reduce((s, t) => s + t.task.points, 0)} pkt`;
    clear(list);
    const progress = allProgress();
    let lastExam = null;
    for (const t of tasks) {
      if (t.exam !== lastExam) {
        lastExam = t.exam;
        list.appendChild(h('div', { class: 'bl-exam' }, examTitle(t.exam), h('span', { class: 'muted small' }, ' · ' + t.exam.dateText)));
      }
      const p = progress[t.key];
      const st = p && p.status !== 'seen' ? p.status : p ? 'seen' : 'new';
      list.appendChild(
        h(
          'button',
          { class: `task-row st-${st}`, onclick: () => navigate(`#/t/${t.key}?from=browse`) },
          h('span', { class: 'tr-no' }, t.task.no),
          h('span', { class: `cat-tag cat-${t.task.cat}` }, icon(CATEGORIES[t.task.cat]?.icon || 'info', 12), ' ', CATEGORIES[t.task.cat]?.short),
          h('span', { class: 'tr-title' }, t.group.title || ''),
          h('span', { class: 'grow tr-topics muted small' }, [KIND_LABELS[t.task.kind], ...(t.task.topics || [])].join(' · ')),
          h('span', { class: 'tr-pts' }, p && p.points != null ? `${p.points} / ${t.task.points} pkt` : `${t.task.points} pkt`),
          h('span', { class: 'tr-status' }, st === 'correct' ? icon('check', 14) : st === 'wrong' ? icon('x', 14) : st === 'partial' ? '½' : ''),
        ),
      );
    }
    if (!tasks.length) list.appendChild(h('div', { class: 'empty' }, 'Brak zadań dla wybranych filtrów.'));
  };
  const randomBtn = btn('Losuj z tej listy', {
    icon: 'shuffle',
    onClick: () => {
      sessionStorage.setItem('randomFilter', JSON.stringify(f));
      navigate('#/random?go=1');
    },
  });
  view.appendChild(h('div', { class: 'page' }, h('div', { class: 'page-head' }, h('h1', null, 'Wszystkie zadania'), h('div', { class: 'grow' }), count, randomBtn), filterBar(f, update), list));
  update();
  return null;
}

export function renderRandom(view, params) {
  const f = loadFilter('randomFilter') || defaultFilter();
  const save = () => sessionStorage.setItem('randomFilter', JSON.stringify(f));
  const info = h('div', { class: 'muted' });
  const update = () => {
    save();
    const n = applyFilter(f).length;
    info.textContent = `Pula: ${n} zadań`;
  };
  const go = () => {
    save();
    const pool = applyFilter(f);
    if (!pool.length) {
      toast('Brak zadań dla wybranych filtrów', 'warn');
      return;
    }
    const last = sessionStorage.getItem('lastRandom');
    const choices = pool.length > 1 ? pool.filter((t) => t.key !== last) : pool;
    const pick = choices[Math.floor(Math.random() * choices.length)];
    sessionStorage.setItem('lastRandom', pick.key);
    navigate(`#/t/${pick.key}?from=random`);
  };
  if (params.go) {
    // "Losuj kolejne" from a task page draws straight away
    setTimeout(go, 0);
    return null;
  }
  view.appendChild(
    h(
      'div',
      { class: 'page random' },
      h('h1', null, 'Losowe zadanie'),
      h('p', { class: 'muted' }, 'Wybierz działy i matury, z których chcesz losować. Każde zadanie pokazuje, z jakiej matury pochodzi i jaki ma numer.'),
      filterBar(f, update, { search: false }),
      h('div', { class: 'random-go' }, btn('Losuj zadanie', { icon: 'dice', kind: 'primary big', onClick: go }), info),
    ),
  );
  update();
  return null;
}
