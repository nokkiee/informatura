import { h, icon, btn, clear, toast, confirmDialog } from '../ui.js';
import { getSettings, setSettings, resetProgress, allProgress, getLearn, resetLearn } from '../store.js';
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
        'Kod na start',
        seg(
          [
            ['template', 'Szablon (wczytanie danych)'],
            ['empty', 'Pusty edytor'],
          ],
          s.starter,
          (v) => setSettings({ starter: v }),
        ),
      ),
      h(
        'p',
        { class: 'muted small set-note' },
        'Szablon otwiera plik z danymi i wypisuje wynik, a algorytm piszesz sam. Pusty edytor to start od zera, jak na maturze. Dotyczy kodu i zapytań SQL w zadaniach, w których nic jeszcze nie napisałeś.',
      ),
      row(
        'Konsola przy uruchomieniu',
        seg(
          [
            [false, 'Zostaw poprzednie wyniki'],
            [true, 'Wyczyść przed każdym uruchomieniem'],
          ],
          !!s.clearConsole,
          (v) => setSettings({ clearConsole: v }),
        ),
      ),
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
          h('div', { class: 'tc-head' }, v.ok ? icon('check') : icon('x'), h('b', null, LANGS[k].label), h('span', { class: 'muted', title: v.ok ? v.details || '' : '' }, v.ok ? v.version : v.error)),
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

  // two separate resets: the exam tasks and the lessons (with their tests)
  const tasksNote = h('p', { class: 'muted small set-note' });
  const showTasks = () => {
    const n = Object.values(allProgress()).filter((p) => p.status && p.status !== 'seen').length;
    tasksNote.textContent = n ? `Zadania z wynikiem: ${n}. Twój kod i odpowiedzi w zadaniach zostaną.` : 'Nie masz jeszcze wyników zadań.';
  };
  const learnNote = h('p', { class: 'muted small set-note' });
  const showLearn = async () => {
    const learn = await getLearn();
    const lessons = Object.values(learn.lessons).filter((l) => l.seen?.length || Object.keys(l.q || {}).length).length;
    const tests = Object.values(learn.tests).filter((t) => t.best != null || Object.keys(t.answers || {}).length).length;
    learnNote.textContent =
      lessons || tests ? `Rozpoczęte lekcje: ${lessons}, rozwiązywane testy działów: ${tests}. Wyniki zadań z matur zostaną.` : 'Nie masz jeszcze postępu w lekcjach ani w testach działów.';
  };
  showTasks();
  showLearn();
  page.appendChild(
    section(
      'Postęp',
      row(
        'Zadania z matur',
        btn('Wyzeruj wyniki zadań', {
          icon: 'trash',
          kind: 'danger',
          onClick: async () => {
            if (await confirmDialog('Wyzerować wyniki zadań?', 'Znikną punkty i statusy zadań z matur. Twój kod i odpowiedzi zostaną. Postęp w lekcjach się nie zmieni.', 'Wyzeruj', 'danger')) {
              await resetProgress();
              showTasks();
              toast('Wyniki zadań wyzerowane', 'info');
            }
          },
        }),
      ),
      tasksNote,
      row(
        'Lekcje i testy',
        btn('Wyzeruj postęp lekcji', {
          icon: 'trash',
          kind: 'danger',
          onClick: async () => {
            if (
              await confirmDialog(
                'Wyzerować postęp lekcji?',
                'Znikną ukończone lekcje, przeczytane kroki, odpowiedzi i programy z testów po lekcjach oraz wyniki testów działów. Wyniki zadań z matur się nie zmienią.',
                'Wyzeruj',
                'danger',
              )
            ) {
              await resetLearn();
              await showLearn();
              toast('Postęp lekcji wyzerowany', 'info');
            }
          },
        }),
      ),
      learnNote,
    ),
  );


  page.appendChild(
    section(
      'O programie',
      h(
        'p',
        { class: 'small' },
        `Informatura ${info.version}. Zadania, pliki z danymi i zasady oceniania pochodzą z arkuszy egzaminu maturalnego z informatyki (CKE), pobranych z arkusze.pl. Program nie dodaje własnych zadań – testy dodatkowe do zadań z zapisem algorytmu sprawdzają tylko poprawność Twojego programu. Podpowiedzi i przykładowe rozwiązania (Python, C++, Java, SQL) przygotowano dla programu; każde rozwiązanie daje wynik zgodny z kluczem CKE. Lekcje i ćwiczenia w lekcjach również napisano dla programu.`,

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
