// Loads the Monaco editor (AMD build) once and hands out the `monaco` namespace.
import { getSettings, onSettings } from './store.js';

let loading = null;

function workerUrl() {
  // Monaco starts module workers; this tiny one boots the AMD editor worker inside.
  const base = new URL('vendor/monaco/', document.baseURI).href;
  const src = `
    self.MonacoEnvironment = { baseUrl: ${JSON.stringify(base)} };
    importScripts(${JSON.stringify(base + 'vs/loader.js')});
    const queue = [];
    self.onmessage = (e) => queue.push(e);
    require.config({ baseUrl: ${JSON.stringify(base)} });
    require(['vs/editor/editor.worker'], () => {
      for (const e of queue) self.onmessage && self.onmessage(e);
    });
  `;
  return URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
}

export function loadMonaco() {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    self.MonacoEnvironment = {
      getWorker() {
        return new Worker(workerUrl(), { name: 'editor' });
      },
    };
    const s = document.createElement('script');
    s.src = 'vendor/monaco/vs/loader.js';
    s.onload = () => {
      window.require.config({ paths: { vs: 'vendor/monaco/vs' } });
      window.require(['vs/editor/editor.main'], () => {
        const monaco = window.monaco;
        defineThemes(monaco);
        onSettings((st) => monaco.editor.setTheme(st.theme === 'light' ? 'ml-light' : 'ml-dark'));
        resolve(monaco);
      }, reject);
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
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
