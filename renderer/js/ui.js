// Small DOM helpers shared by all views.

export function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'dataset') Object.assign(el.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    }
  }
  append(el, children);
  return el;
}

function append(el, children) {
  for (const c of children) {
    if (c == null || c === false) continue;
    if (Array.isArray(c)) append(el, c);
    else if (c instanceof Node) el.appendChild(c);
    else el.appendChild(document.createTextNode(String(c)));
  }
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

export function debounce(fn, ms) {
  let t = null;
  const d = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => {
      t = null;
      fn(...args);
    }, ms);
  };
  d.flush = (...args) => {
    if (t) {
      clearTimeout(t);
      t = null;
      fn(...args);
    }
  };
  return d;
}

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

// ---- icons (Lucide-style strokes, drawn inline) ----------------------------------------

const P = {
  play: '<polygon points="6 4 20 12 6 20 6 4"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="1"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9.5V3"/><path d="M7.5 15h9"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  left: '<polyline points="15 18 9 12 15 6"/>',
  right: '<polyline points="9 18 15 12 9 6"/>',
  home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20v3H6.5"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  grid: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  brain: '<path d="M9 3a3 3 0 0 0-3 3 3 3 0 0 0-3 3c0 1.2.7 2.2 1.7 2.7A3 3 0 0 0 6 17a3 3 0 0 0 3 3V3z"/><path d="M15 3a3 3 0 0 1 3 3 3 3 0 0 1 3 3c0 1.2-.7 2.2-1.7 2.7A3 3 0 0 1 18 17a3 3 0 0 1-3 3V3z"/>',
  binary: '<rect x="4" y="4" width="5" height="7" rx="1.5"/><path d="M15 4v7"/><path d="M15 13v7"/><rect x="4" y="13" width="5" height="7" rx="1.5"/>',
  chart: '<line x1="4" y1="20" x2="20" y2="20"/><rect x="6" y="11" width="3" height="9"/><rect x="11" y="6" width="3" height="14"/><rect x="16" y="14" width="3" height="6"/>',
  pdf: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><path d="M9 15h6"/><path d="M9 11h2"/>',
  key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="M10.7 12.3 20 3"/><path d="M17 6l3 3"/><path d="M14.5 8.5l2 2"/>',
  refresh: '<polyline points="21 3 21 9 15 9"/><path d="M21 9a9 9 0 1 0-2.6 6.4"/>',
  download: '<path d="M12 3v12"/><polyline points="7 10 12 15 17 10"/><path d="M5 21h14"/>',
  upload: '<path d="M12 21V9"/><polyline points="7 14 12 9 17 14"/><path d="M5 3h14"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  sort: '<path d="M7 4v16"/><polyline points="3 16 7 20 11 16"/><path d="M17 20V4"/><polyline points="13 8 17 4 21 8"/>',
  table: '<rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="10" y1="10" x2="10" y2="20"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r=".6"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/>',
  bulb: '<path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.2.9 2V16h6v-.1c0-.8.3-1.5.9-2A6.5 6.5 0 0 0 12 2.5z"/>',
  dice: '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.3"/><circle cx="16" cy="16" r="1.3"/><circle cx="16" cy="8" r="1.3"/><circle cx="8" cy="16" r="1.3"/><circle cx="12" cy="12" r="1.3"/>',
  network: '<rect x="9" y="2" width="6" height="5" rx="1"/><rect x="2" y="17" width="6" height="5" rx="1"/><rect x="16" y="17" width="6" height="5" rx="1"/><path d="M12 7v5M5 17v-3h14v3"/>',
  wand: '<path d="M15 4V2"/><path d="M15 16v-2"/><path d="M8 9h2"/><path d="M20 9h2"/><path d="M17.8 11.8 19 13"/><path d="M15 9h0"/><path d="M17.8 6.2 19 5"/><path d="m3 21 9-9"/><path d="M12.2 6.2 11 5"/>',
  copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  maximize: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>',
};

export function icon(name, size = 16) {
  const span = document.createElement('span');
  span.className = 'ico';
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;
  return span;
}

export function btn(label, opts = {}) {
  const b = h('button', { class: `btn ${opts.kind || ''} ${opts.small ? 'small' : ''}`.trim(), title: opts.title, type: 'button', disabled: opts.disabled, onclick: opts.onClick });
  if (opts.icon) b.appendChild(icon(opts.icon, opts.small ? 14 : 16));
  if (label) b.appendChild(h('span', null, label));
  if (opts.kbd) b.appendChild(h('kbd', null, opts.kbd));
  return b;
}

// ---- toasts & dialogs -------------------------------------------------------------------

let toastBox = null;
export function toast(msg, kind = 'info', ms = 3200) {
  if (!toastBox) {
    toastBox = h('div', { class: 'toasts' });
    document.body.appendChild(toastBox);
  }
  const t = h('div', { class: `toast ${kind}` }, msg);
  toastBox.appendChild(t);
  setTimeout(() => t.classList.add('out'), ms);
  setTimeout(() => t.remove(), ms + 400);
}

export function modal({ title, body, actions = [], wide = false, onClose }) {
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
    onClose?.();
  };
  const onKey = (e) => {
    if (e.key === 'Escape') close();
  };
  const box = h(
    'div',
    { class: `modal ${wide ? 'wide' : ''}`, role: 'dialog' },
    h('div', { class: 'modal-head' }, h('h3', null, title), h('button', { class: 'icon-btn', title: 'Zamknij', onclick: close }, icon('x'))),
    h('div', { class: 'modal-body' }, body),
    actions.length
      ? h(
          'div',
          { class: 'modal-actions' },
          actions.map((a) =>
            btn(a.label, {
              kind: a.kind,
              onClick: async () => {
                const keep = await a.onClick?.();
                if (keep !== true) close();
              },
            }),
          ),
        )
      : null,
  );
  const overlay = h('div', { class: 'overlay', onmousedown: (e) => e.target === overlay && close() }, box);
  document.body.appendChild(overlay);
  document.addEventListener('keydown', onKey);
  return { close, box };
}

export function confirmDialog(title, text, okLabel = 'OK', kind = 'primary') {
  return new Promise((resolve) => {
    let done = false;
    modal({
      title,
      body: h('p', null, text),
      actions: [
        { label: 'Anuluj', onClick: () => ((done = true), resolve(false)) },
        { label: okLabel, kind, onClick: () => ((done = true), resolve(true)) },
      ],
      onClose: () => !done && resolve(false),
    });
  });
}

export function pluralPkt(n) {
  const a = Math.abs(n);
  if (!Number.isInteger(a)) return 'pkt';
  return 'pkt';
}

export function fmtTime(sec) {
  const s = Math.max(0, Math.round(sec));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm)) + ':' + String(ss).padStart(2, '0');
}

// Draggable divider between two panes. `getSize`/`setSize` work on the first pane's width.
export function splitter(el, { min = 280, max = () => 2000, onResize, vertical = false }) {
  el.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const start = vertical ? e.clientY : e.clientX;
    const prev = el.previousElementSibling;
    const startSize = vertical ? prev.getBoundingClientRect().height : prev.getBoundingClientRect().width;
    document.body.classList.add(vertical ? 'resizing-v' : 'resizing');
    const move = (ev) => {
      const d = (vertical ? ev.clientY : ev.clientX) - start;
      const size = Math.max(min, Math.min(max(), startSize + d));
      onResize(size);
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.body.classList.remove('resizing', 'resizing-v');
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });
}

// Loads a UMD script as a plain global. Monaco's AMD loader defines `define.amd`, which
// would make UMD bundles register as AMD modules instead, so it is hidden meanwhile.
const umdLoads = new Map();
// One at a time: two overlapping loads would each save and restore define.amd, and the
// second could run its script with define.amd back in place (registering an AMD module
// instead of the global it's meant to set) or leave define.amd hidden for good.
// Monaco's own loader goes through the same queue, so it can't appear mid-load either.
let umdQueue = Promise.resolve();
export function queueScript(task) {
  const p = umdQueue.then(task);
  umdQueue = p.catch(() => {});
  return p;
}

export function loadUmd(src) {
  if (umdLoads.has(src)) return umdLoads.get(src);
  const p = queueScript(() => new Promise((resolve, reject) => {
    const def = typeof window.define === 'function' ? window.define : null;
    const amd = def ? def.amd : undefined;
    if (def) def.amd = undefined;
    const done = () => {
      if (def) def.amd = amd;
    };
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => {
      done();
      resolve();
    };
    s.onerror = () => {
      done();
      reject(new Error('Nie można wczytać ' + src));
    };
    document.head.appendChild(s);
  }));
  umdLoads.set(src, p);
  return p;
}
