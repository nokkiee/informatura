// Loads the Monaco editor (AMD build) once and hands out the `monaco` namespace.
import { getSettings, onSettings } from './store.js';
import { queueScript } from './ui.js';

let loading = null;

export function loadMonaco() {
  if (loading) return loading;
  // the AMD loader defines `define.amd`, so it waits for UMD scripts that are still loading
  const script = (src) =>
    new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  loading = queueScript(async () => {
    // Polish menus and messages (Kopiuj, Wklej, …): the translation sets a global that the
    // editor reads, so it goes in before the editor itself
    await script('vendor/monaco/vs/nls/lang/pl.js').catch(() => console.warn('Monaco: no Polish translation'));
    await script('vendor/monaco/vs/loader.js');
  }).then(
    () =>
      new Promise((resolve, reject) => {
        window.require.config({ paths: { vs: 'vendor/monaco/vs' } });
        window.require(['vs/editor/editor.main'], () => {
          const monaco = window.monaco;
          // editor.main installs its own worker factory. A worker shut down while still
          // loading (an editor closed right after it opened) reports a load error to the page;
          // that's harmless, so it's only a warning.
          const factory = self.MonacoEnvironment?.getWorker;
          if (factory) {
            self.MonacoEnvironment.getWorker = (id, label) => {
              const w = factory(id, label);
              w.addEventListener('error', (e) => {
                e.preventDefault();
                console.warn('Monaco worker:', e.message);
              });
              return w;
            };
          }
          defineThemes(monaco);
          onSettings((st) => monaco.editor.setTheme(st.theme === 'light' ? 'ml-light' : 'ml-dark'));
          resolve(monaco);
        }, reject);
      }),
  );
  return loading;
}

function defineThemes(monaco) {
  monaco.editor.defineTheme('ml-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#12161c',
      'editorGutter.background': '#12161c',
      'editor.lineHighlightBackground': '#1a2029',
      'editorLineNumber.foreground': '#4b5563',
      'editorLineNumber.activeForeground': '#9aa4b2',
    },
  });
  monaco.editor.defineTheme('ml-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: { 'editor.background': '#ffffff' },
  });
}

export function editorTheme() {
  return getSettings().theme === 'light' ? 'ml-light' : 'ml-dark';
}

// Creates an editor in `box`. Monaco's theme colours are CSS variables set on the editor and on
// `.monaco-component` elements; the right-click menu is drawn next to the editor (in `box`), so
// the box gets that class too – otherwise the menu has no background and black text.
export function createEditor(monaco, box, options) {
  box.classList.add('monaco-component');
  return monaco.editor.create(box, options);
}

export function editorOptions(extra = {}) {
  const st = getSettings();
  return {
    theme: editorTheme(),
    fontSize: st.fontSize,
    fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', 'DejaVu Sans Mono', Consolas, monospace",
    minimap: { enabled: false },
    automaticLayout: true,
    scrollBeyondLastLine: false,
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: 'none',
    wordWrap: 'off',
    fixedOverflowWidgets: true,
    smoothScrolling: true,
    padding: { top: 8 },
    ...extra,
  };
}
