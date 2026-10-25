// Markdown rendering for task statements, plus the {{field}} answer boxes inside them.
import { marked } from '../vendor/marked/marked.esm.js';
import { esc } from './ui.js';

marked.setOptions({ gfm: true, breaks: true });

const PSEUDO_KW =
  /(?<![\p{L}\d_])(jeżeli|jeśli|to|w przeciwnym razie|wpp|dopóki|wykonuj|dla|od|do|zwróć|wynikiem jest|wypisz|wykonaj|funkcja|procedura|lub|oraz|div|mod|koniec|powtarzaj|aż)(?![\p{L}\d_])/gu;

const renderer = {
  code({ text, lang }) {
    if (lang === 'pseudo') {
      const body = esc(text)
        .replace(PSEUDO_KW, '<b class="kw">$1</b>')
        .replace(/←/g, '<span class="op">←</span>');
      return `<pre class="pseudo"><code>${body}</code></pre>`;
    }
    // "~~~python run": the language, then flags (used by the lessons)
    const [l = '', ...flags] = String(lang || '').split(/\s+/);
    return `<pre class="code ${l ? 'lang-' + esc(l) : ''}" data-lang="${esc(l)}" data-flags="${esc(flags.join(' '))}"><code>${esc(text)}</code></pre>`;
  },
};
marked.use({ renderer });

export function md(src) {
  if (src == null) return '';
  return marked.parse(String(src));
}

const FIELD = /\{\{([\w-]+)(?:\|(\d+))?(?::([^}]+))?\}\}/g;

// Renders Markdown into `el` and replaces {{id}} placeholders with inputs.
// values: current field values; onInput(id, value) is called on every change.
export function renderWithFields(el, src, { values = {}, onInput, disabled = false } = {}) {
  el.innerHTML = md(src);
  const inputs = {};
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.includes('{{')) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const text = node.nodeValue;
    const frag = document.createDocumentFragment();
    let last = 0;
    FIELD.lastIndex = 0;
    let m;
    while ((m = FIELD.exec(text))) {
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const [, id, width, opts] = m;
      let input;
      if (opts && opts.startsWith('board:')) {
        input = boardInput(id, opts.slice(6), values[id], onInput, disabled);
      } else if (opts) {
        input = document.createElement('select');
        input.className = 'fld fld-select';
        input.appendChild(new Option('…', ''));
        for (const o of opts.split('|')) input.appendChild(new Option(o, o));
      } else {
        input = document.createElement('input');
        input.type = 'text';
        input.className = 'fld';
        input.spellcheck = false;
        input.autocomplete = 'off';
        if (width) input.style.width = `calc(${Math.max(2, Number(width))}ch + 18px)`;
      }
      input.dataset.field = id;
      if (!input.classList.contains('board-input')) input.value = values[id] ?? '';
      input.disabled = disabled;
      if (!input.classList.contains('board-input')) {
        input.addEventListener('input', () => onInput?.(id, input.value));
        input.addEventListener('change', () => onInput?.(id, input.value));
      }
      inputs[id] = input;
      frag.appendChild(input);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  return inputs;
}

// A board of white/black cells the user paints by clicking ({{id:board:5x5}}).
// The value is rows of 1 (white) and 0 (black) joined with "/"; the top-left and
// bottom-right corners stay white.
function boardInput(id, size, value, onInput, disabled) {
  const [n, m] = size.split('x').map(Number);
  const rows = String(value || '').split('/');
  const cells = Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => (rows[i]?.[j] === '0' ? 0 : 1)));
  const wrap = document.createElement('div');
  wrap.className = 'board-input';
  wrap.value = '';
  const table = document.createElement('table');
  table.className = 'board';
  const emit = () => {
    wrap.value = cells.map((r) => r.join('')).join('/');
    onInput?.(id, wrap.value);
  };
  for (let i = 0; i < n; i++) {
    const tr = document.createElement('tr');
    for (let j = 0; j < m; j++) {
      const td = document.createElement('td');
      const corner = (i === 0 && j === 0) || (i === n - 1 && j === m - 1);
      td.className = (cells[i][j] ? 'w' : 'b') + (corner ? ' fixed' : '');
      if (!corner && !disabled) {
        td.addEventListener('mousedown', (e) => {
          e.preventDefault();
          cells[i][j] = cells[i][j] ? 0 : 1;
          td.className = cells[i][j] ? 'w' : 'b';
          emit();
        });
      }
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  wrap.appendChild(table);
  const black = () => cells.flat().filter((v) => !v).length;
  const info = document.createElement('div');
  info.className = 'board-info muted small';
  const upd = () => (info.textContent = `Czarnych pól: ${black()} · kliknij pole, aby je zamalować`);
  table.addEventListener('mousedown', () => setTimeout(upd, 0));
  upd();
  wrap.appendChild(info);
  wrap.value = cells.map((r) => r.join('')).join('/');
  return wrap;
}
