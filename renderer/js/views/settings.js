import { h, icon, btn, clear, toast, confirmDialog } from '../ui.js';
import { getSettings, setSettings, resetProgress } from '../store.js';
import { LANGS } from '../algo.js';

const HINTS = {
  linux: {
    python: 'sudo apt install python3',
    cpp: 'sudo apt install g++',
    java: 'sudo apt install default-jdk',
  },
  win32: {
    python: 'W PowerShellu: winget install Python.Python.3.12 (albo instalator z python.org z zaznaczonym „Add python.exe to PATH”).',
    cpp: 'W PowerShellu: winget install BrechtSanders.WinLibs.POSIX.UCRT. Program sam znajdzie też kompilator z Code::Blocks, Dev-C++ i MSYS2.',
    java: 'W PowerShellu: winget install EclipseAdoptium.Temurin.21.JDK (albo JDK z adoptium.net).',
  },
  darwin: {
    python: 'brew install python',
    cpp: 'xcode-select --install',
    java: 'brew install openjdk',
  },
};

export async function renderSettings(view) {
  const s = getSettings();
  const info = await window.api.appInfo();
  const hints = HINTS[info.platform] || HINTS.linux;
  const page = h('div', { class: 'page settings' }, h('h1', null, 'Ustawienia'));

  const seg = (options, value, onPick) => {
    const box = h('div', { class: 'seg' });
    for (const [v, label] of options)
      box.appendChild(
        h(
          'button',
          {
            class: `seg-btn ${value === v ? 'active' : ''}`,
            onclick: async (e) => {
              box.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b === e.currentTarget));
              await onPick(v);
            },
          },
          label,
        ),
      );
    return box;
  };

  page.appendChild(
    section(
      'Programowanie',
      row('Domyślny język', seg(Object.entries(LANGS).map(([k, v]) => [k, v.label]), s.lang, (v) => setSettings({ lang: v }))),
      row(
        'Rozmiar czcionki w edytorze',
        seg(
          [12, 13, 14, 15, 16, 18].map((n) => [n, String(n)]),
          s.fontSize,
          (v) => setSettings({ fontSize: v }),
        ),
      ),
    ),
  );

  page.appendChild(
    section(
      'Wygląd',
      row(
        'Motyw',
        seg(
          [
            ['dark', 'Ciemny'],
            ['light', 'Jasny'],
          ],
          s.theme,
          (v) => setSettings({ theme: v }),
        ),
      ),
    ),
  );

  page.appendChild(
    section(
      'Arkusz kalkulacyjny',
      row(
        'Nazwy funkcji',
        seg(
          [
            ['pl', 'Polskie (SUMA, JEŻELI; separator ;)'],
            ['en', 'Angielskie (SUM, IF; separator ,)'],
          ],
          s.sheetLang,
          (v) => setSettings({ sheetLang: v }),
        ),
      ),
    ),
  );

  // toolchains
  const tcBox = h('div', { class: 'tc-list' }, h('span', { class: 'spin' }), ' Sprawdzanie…');
  const custom = { ...(s.toolchains || {}) };
  async function refresh(force) {
    clear(tcBox).appendChild(h('div', { class: 'muted' }, h('span', { class: 'spin' }), ' Sprawdzanie…'));
    const tc = await window.api.detectToolchains(force);
    clear(tcBox);
    for (const [k, v] of Object.entries(tc)) {
      const input = h('input', { class: 'input', placeholder: 'ścieżka (opcjonalnie), np. ' + (k === 'python' ? 'python3' : k === 'cpp' ? '/usr/bin/g++' : 'C:\\Program Files\\Java\\jdk-21\\bin\\java.exe'), value: custom[k] || '' });
      input.addEventListener('change', () => {
        custom[k] = input.value.trim() || undefined;
      });
      tcBox.appendChild(
        h(
          'div',
          { class: `tc-row ${v.ok ? 'ok' : 'bad'}` },
          h('div', { class: 'tc-head' }, v.ok ? icon('check') : icon('x'), h('b', null, LANGS[k].label), h('span', { class: 'muted' }, v.ok ? v.version : v.error)),
          !v.ok ? h('div', { class: 'small' }, 'Jak zainstalować: ', h('code', null, hints[k])) : null,
          input,
        ),
      );
    }
    tcBox.appendChild(
      h(
        'div',
        { class: 'row' },
        btn('Zapisz ścieżki i sprawdź ponownie', {
          icon: 'refresh',
          onClick: async () => {
            await setSettings({ toolchains: { ...custom } });
            await refresh(true);
            toast('Zapisano', 'ok');
          },
        }),
      ),
    );
  }
  page.appendChild(section('Kompilatory i interpretery', h('p', { class: 'muted small' }, 'Programy uruchamiane są narzędziami zainstalowanymi na tym komputerze. Jeśli coś jest „brak”, zainstaluj to albo wskaż ścieżkę.'), tcBox));
  refresh(false);

  page.appendChild(
    section(
      'Postęp',
      row(
        'Wyniki zadań',
        btn('Wyzeruj postęp', {
          icon: 'trash',
          kind: 'danger',
          onClick: async () => {
            if (await confirmDialog('Wyzerować postęp?', 'Znikną punkty i statusy zadań. Twój kod i odpowiedzi zostaną.', 'Wyzeruj', 'danger')) {
              await resetProgress();
              toast('Postęp wyzerowany', 'info');
            }
          },
        }),
      ),
    ),
  );

  page.appendChild(
    section(
      'O programie',
      h(
        'p',
        { class: 'small' },
        `Informatura ${info.version}. Zadania, pliki z danymi i zasady oceniania pochodzą z arkuszy egzaminu maturalnego z informatyki (CKE), pobranych z arkusze.pl. Program nie dodaje własnych zadań – testy dodatkowe do zadań z zapisem algorytmu sprawdzają tylko poprawność Twojego programu.`,
      ),
    ),
  );
  view.appendChild(page);
  return null;
}

function section(title, ...children) {
  return h('section', { class: 'set-section' }, h('h2', null, title), children);
}

function row(label, control) {
  return h('div', { class: 'set-row' }, h('div', { class: 'set-label' }, label), control);
}
