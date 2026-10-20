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
    return `<pre class="code ${lang ? 'lang-' + esc(lang) : ''}"><code>${esc(text)}</code></pre>`;
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
      if (opts) {
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
      input.value = values[id] ?? '';
      input.disabled = disabled;
      input.addEventListener('input', () => onInput?.(id, input.value));
      input.addEventListener('change', () => onInput?.(id, input.value));
      inputs[id] = input;
      frag.appendChild(input);
      last = m.index + m[0].length;
    }
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    node.parentNode.replaceChild(frag, node);
  }
  return inputs;
}
