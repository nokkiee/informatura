// App shell: header, hash router and navigation helpers.
import { h, icon, clear, toast } from './ui.js';
import { initStore, getSettings, setSettings, onSettings, flushTaskState } from './store.js';
import { loadContent, getExam, examTitle } from './content.js';
import { LANGS } from './algo.js';

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
    else view.appendChild(h('div', { class: 'empty' }, 'Nie ma takiej strony.'));
  } catch (err) {
    console.error(err);
    view.appendChild(h('div', { class: 'empty error' }, 'Coś poszło nie tak: ', err.message));
  }
  if (token !== rendering) res?.destroy?.();
  else current = res;
  view.scrollTop = 0;
}

// ---- header ------------------------------------------------------------------------------

const navItems = [
  { id: 'home', label: 'Start', icon: 'home', href: '#/' },
  { id: 'exams', label: 'Arkusze', icon: 'book', href: '#/exams' },
  { id: 'browse', label: 'Zadania', icon: 'list', href: '#/browse' },
  { id: 'random', label: 'Losuj', icon: 'shuffle', href: '#/random' },
];

function setActiveNav(id) {
  const map = { exam: 'exams', t: null };
  const active = id in map ? map[id] : id;
  document.querySelectorAll('.nav-link').forEach((a) => a.classList.toggle('active', a.dataset.id === active));
}

function buildHeader() {
  const header = document.getElementById('header');
  clear(header);
  const langSwitch = h(
    'div',
    { class: 'seg', title: 'Język programowania' },
    Object.entries(LANGS).map(([k, v]) =>
      h(
        'button',
        {
          class: `seg-btn ${getSettings().lang === k ? 'active' : ''}`,
          dataset: { lang: k },
          onclick: async () => {
            await setSettings({ lang: k });
          },
        },
        v.label,
      ),
    ),
  );
  onSettings((s) => langSwitch.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.lang === s.lang)));
  header.appendChild(
    h(
      'div',
      { class: 'brand', onclick: () => navigate('#/') },
      h('img', { class: 'logo', src: 'img/logo.svg', alt: '' }),
      h('span', { class: 'brand-name' }, 'Infor', h('b', null, 'matura')),
      h('span', { class: 'brand-sub' }, 'informatyka · rozszerzona · formuła 2023'),
    ),
  );
  header.appendChild(h('nav', { class: 'nav' }, navItems.map((n) => h('a', { class: 'nav-link', href: n.href, dataset: { id: n.id } }, icon(n.icon, 15), n.label))));
  header.appendChild(h('div', { class: 'grow' }));
  header.appendChild(langSwitch);
  header.appendChild(h('a', { class: 'icon-btn nav-link', href: '#/settings', title: 'Ustawienia', dataset: { id: 'settings' } }, icon('settings')));
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
    buildHeader();
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
