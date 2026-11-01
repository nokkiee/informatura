// App shell: side bar, top bar, hash router and navigation helpers.
import { h, icon, clear, toast } from './ui.js';
import { initStore, getSettings, onSettings, flushTaskState } from './store.js';
import { loadContent, getExam, examTitle } from './content.js';

const view = document.getElementById('view');
let current = null;
let rendering = 0;

export function navigate(hash) {
  if (location.hash === hash) route();
  else location.hash = hash;
}

function parseHash() {
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(qs || ''));
  return { parts: path.split('/').filter(Boolean), params };
}

// Previous/next targets for the task screen, depending on how the user got there.
export function navContext(entry, from) {
  const { exam } = entry;
  if (from === 'random') {
    return { back: '#/random', next: '#/random?go=1', nextLabel: 'Losuj kolejne', nextIcon: 'shuffle' };
  }
  if (from === 'browse') {
    let list = [];
    try {
      list = JSON.parse(sessionStorage.getItem('browseList') || '[]');
    } catch {}
    const i = list.indexOf(entry.key);
    const prev = i > 0 ? list[i - 1] : null;
    const next = i >= 0 && i < list.length - 1 ? list[i + 1] : null;
    return {
      back: '#/browse',
      prev: prev && `#/t/${prev}?from=browse`,
      prevLabel: prev,
      next: next && `#/t/${next}?from=browse`,
      nextLabel: next ? `Dalej: ${next.split('/')[1]}` : '',
    };
  }
  const i = exam.tasks.findIndex((t) => t.key === entry.key);
  const prev = exam.tasks[i - 1];
  const next = exam.tasks[i + 1];
  const q = from === 'exam' ? '?from=exam' : '';
  return {
    back: `#/exam/${exam.id}`,
    prev: prev && `#/t/${prev.key}${q}`,
    prevLabel: prev && `zadanie ${prev.task.no}`,
    next: next ? `#/t/${next.key}${q}` : `#/exam/${exam.id}${from === 'exam' ? '/summary' : ''}`,
    nextLabel: next ? `Dalej: ${next.task.no}` : 'Podsumowanie',
    nextIcon: next ? 'right' : 'flag',
  };
}

async function route() {
  const token = ++rendering;
  flushTaskState();
  if (current?.destroy) {
    try {
      current.destroy();
    } catch (e) {
      console.warn(e);
    }
  }
  current = null;
  clear(view);
  const { parts, params } = parseHash();
  const [a, b, c, d] = parts;
  document.body.dataset.view = a || 'home';
  setActiveNav(a || 'home');
  let res = null;
  try {
    if (!a) res = (await import('./views/home.js')).renderHome(view);
    else if (a === 'exams') res = (await import('./views/exams.js')).renderExams(view);
    else if (a === 'exam' && c === 'summary') res = await (await import('./views/summary.js')).renderSummary(view, getExam(b), params);
    else if (a === 'exam') res = await (await import('./views/exam.js')).renderExam(view, getExam(b));
    else if (a === 't') res = await (await import('./views/task.js')).renderTask(view, { key: `${b}/${c}`, from: params.from });
    else if (a === 'browse') res = (await import('./views/browse.js')).renderBrowse(view, params);
    else if (a === 'random') res = (await import('./views/browse.js')).renderRandom(view, params);
    else if (a === 'settings') res = await (await import('./views/settings.js')).renderSettings(view);
    else if (a === 'learn') res = await (await import('./views/learn.js')).renderLearn(view, [b, c]);
    else view.appendChild(h('div', { class: 'empty' }, 'Nie ma takiej strony.'));
  } catch (err) {
    console.error(err);
    view.appendChild(h('div', { class: 'empty error' }, 'Coś poszło nie tak: ', err.message));
  }
  if (token !== rendering) res?.destroy?.();
  else current = res;
  view.scrollTop = 0;
}

// ---- side bar and top bar ----------------------------------------------------------------------

const navItems = [
  { id: 'home', label: 'Start', icon: 'home', href: '#/' },
  { id: 'learn', label: 'Lekcje', icon: 'cap', href: '#/learn' },
  { id: 'exams', label: 'Arkusze', icon: 'book', href: '#/exams' },
  { id: 'browse', label: 'Zadania', icon: 'list', href: '#/browse' },
  { id: 'random', label: 'Losuj', icon: 'shuffle', href: '#/random' },
];

function setActiveNav(id) {
  const map = { exam: 'exams', t: null };
  const active = id in map ? map[id] : id;
  document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.id === active));
}

const sideLink = (n) => h('a', { class: 'nav-link side-link', href: n.href, title: n.label, dataset: { id: n.id } }, icon(n.icon, 19), h('span', null, n.label));

function buildShell() {
  // the side bar: logo, the sections, the settings at the bottom
  clear(document.getElementById('sidebar')).append(
    h('button', { class: 'side-logo', title: 'Informatura – start', onclick: () => navigate('#/') }, h('img', { src: 'img/logo.svg', alt: '' })),
    h('nav', { class: 'side-nav' }, navItems.map(sideLink)),
    h('div', { class: 'grow' }),
    sideLink({ id: 'settings', label: 'Ustawienia', icon: 'settings', href: '#/settings' }),
  );
  // the top bar: the name, a search through all tasks, a quick random task
  const search = h('input', { class: 'top-search-input', placeholder: 'Szukaj zadań…', spellcheck: false, 'aria-label': 'Szukaj zadań' });
  search.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const q = search.value.trim();
    navigate(q ? `#/browse?q=${encodeURIComponent(q)}` : '#/browse');
    search.blur();
  });
  clear(document.getElementById('header')).append(
    h(
      'div',
      { class: 'top-brand', onclick: () => navigate('#/') },
      h('span', { class: 'top-title' }, 'Informatura'),
      h('span', { class: 'top-sub' }, 'informatyka · rozszerzona · formuła 2023'),
    ),
    h('div', { class: 'grow' }),
    h('label', { class: 'top-search', title: 'Szukaj w treści, numerach i tematach zadań (Enter)' }, icon('search', 15), search),
    h('a', { class: 'btn primary top-cta', href: '#/random?go=1', title: 'Losuj zadanie z wybranych działów i matur' }, icon('dice', 16), h('span', null, 'Losuj zadanie')),
  );
}

function applyTheme(s) {
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.style.setProperty('--code-size', s.fontSize + 'px');
}

async function boot() {
  try {
    await initStore();
    applyTheme(getSettings());
    onSettings(applyTheme);
    await loadContent();
    buildShell();
    window.addEventListener('hashchange', route);
    await route();
  } catch (err) {
    console.error(err);
    view.appendChild(h('div', { class: 'empty error' }, 'Nie udało się uruchomić aplikacji: ', err.message));
  } finally {
    document.body.classList.remove('loading');
  }
  // Toolchain check in the background, so the first run doesn't wait for it.
  window.api.detectToolchains().catch(() => {});
}

window.addEventListener('error', (e) => console.error(e.message));
boot();

export { examTitle, toast };
