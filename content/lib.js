// Helpers shared by the exam content files (content/exams/*.js).
//
// Task statements are Markdown with inline HTML. Answer fields are written as {{id}}
// (text box), {{id|8}} (text box ~8 characters wide) or {{id:<|>|=}} (drop-down list);
// the app swaps them for real inputs after rendering.

// Strips the common indentation so statements can be indented with the code.
export function md(strings, ...values) {
  // The common indentation is measured on the template's own lines only. Interpolated blocks
  // (tables, figures) can have lines indented less; if they counted, the text around them
  // would keep 4+ spaces and Markdown would turn it into a code block.
  const indents = [];
  strings.forEach((str, i) => {
    const lines = str.split('\n').slice(1);
    lines.forEach((l, j) => {
      const valueFollows = j === lines.length - 1 && i < values.length;
      if (l.trim() || valueFollows) indents.push(l.match(/^ */)[0].length);
    });
  });
  const cut = indents.length ? Math.min(...indents) : 0;
  const lead = new RegExp(`^ {0,${cut}}`);
  let s = strings.reduce((acc, str, i) => acc + str + (i < values.length ? values[i] : ''), '');
  s = s.replace(/^\n/, '').replace(/\n\s*$/, '');
  return s
    .split('\n')
    .map((l) => l.replace(lead, ''))
    .join('\n');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Markdown isn't parsed inside HTML blocks, so table cells and formulas convert their
// own **bold**, *italic* and `code` here.
export function inline(s) {
  return String(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^\\\w*])\*([^*\s](?:[^*]*?[^*\s])?)\*(?![\w*])/g, '$1<i>$2</i>')
    .replace(/\\\*/g, '*');
}

// Lets long column names wrap where it reads naturally – after "_" and before a capital in
// camelCase (dostawa_⁠truskawek, Id⁠Transakcji) – instead of widening the table past the pane.
function breakable(html) {
  return html
    .split(/(<[^>]+>|&[a-z]+;)/)
    .map((part, i) => (i % 2 ? part : part.replace(/_(?=\S)/g, '_<wbr>').replace(/(\p{Ll})(\p{Lu})/gu, '$1<wbr>$2')))
    .join('');
}

// rows: array of rows (arrays of cell HTML). The first row is the header unless head:false.
export function table(rows, { head = true, cls = '', widths = null } = {}) {
  const colgroup = widths ? `<colgroup>${widths.map((w) => `<col style="width:${w}">`).join('')}</colgroup>` : '';
  const tr = (r, tag) => `<tr>${r.map((c) => `<${tag}>${tag === 'th' ? breakable(inline(c)) : inline(c)}</${tag}>`).join('')}</tr>`;
  const body = (head ? rows.slice(1) : rows).map((r) => tr(r, 'td')).join('');
  const thead = head ? `<thead>${tr(rows[0], 'th')}</thead>` : '';
  return `<table class="tbl ${cls}">${colgroup}${thead}<tbody>${body}</tbody></table>`;
}

// Monospace data sample (a fragment of a data file), shown as a table.
export function sample(text, { head = true } = {}) {
  const rows = text
    .trim()
    .split('\n')
    .map((l) => l.trim().split(/\t| {2,}/).map(esc));
  return table(rows, { head, cls: 'sample' });
}

// ---- scoring helpers -----------------------------------------------------------------------
// A scorer gets ok = { fieldId: true/false } and returns points.

export const all = (points) => (ok) => (Object.values(ok).every(Boolean) ? points : 0);
export const perField = (each = 1) => (ok) => Object.values(ok).filter(Boolean).length * each;
// byCount([[4, 2], [3, 1]]): 4 correct -> 2 pts, 3 correct -> 1 pt, otherwise 0.
export const byCount = (steps) => (ok) => {
  const n = Object.values(ok).filter(Boolean).length;
  for (const [min, pts] of steps) if (n >= min) return pts;
  return 0;
};
// groups([['a', 'b'], ['c']], each): points for every group whose fields are all correct.
export const groups = (gs, each = 1) => (ok) => gs.filter((g) => g.every((id) => ok[id])).length * each;

// ---- evaluating answers written as expressions ---------------------------------------------
// evalExpr('2^(k-i) - 1', { k: 5, i: 2 }) -> 7. Understands + - * / ^ ( ), "div", "mod",
// floor(…) or ⌊…⌋, the dots/crosses used for multiplication and implicit products like 2k.
// Returns NaN when the text isn't a valid expression.
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };

export function evalExpr(text, vars = {}) {
  let s = String(text ?? '')
    .toLowerCase()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, (m) => '^' + [...m].map((c) => SUP[c]).join(''))
    .replace(/[·×∙⋅]/g, '*')
    .replace(/[−–—]/g, '-')
    .replace(/\*\*/g, '^')
    .replace(/⌊/g, 'floor(')
    .replace(/⌋/g, ')')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/(\d)[\s\u00a0\u202f]+(?=\d{3}(?!\d))/g, '$1') // 512 000 000
    .replace(/\s+/g, ' ')
    .trim();
  const toks = [];
  const re = /\s*(\d+(?:\.\d+)?|floor|div|mod|[a-z]|\/\/|[-+*/^%()])/y;
  let m;
  re.lastIndex = 0;
  while (re.lastIndex < s.length) {
    m = re.exec(s);
    if (!m) return NaN;
    toks.push(m[1]);
  }
  // implicit multiplication: 2k, 2(…), )(, k(…)
  const full = [];
  for (let i = 0; i < toks.length; i++) {
    const a = toks[i - 1];
    const b = toks[i];
    const endsValue = a !== undefined && (/^[\d.]+$/.test(a) || (/^[a-z]$/.test(a)) || a === ')');
    const startsValue = /^[\d.]+$/.test(b) || /^[a-z]$/.test(b) || b === '(' || b === 'floor';
    if (endsValue && startsValue && !(/^[\d.]+$/.test(a) && /^[\d.]+$/.test(b))) full.push('*');
    full.push(b);
  }
  let pos = 0;
  const peek = () => full[pos];
  const take = () => full[pos++];
  function expr() {
    let v = term();
    while (peek() === '+' || peek() === '-') v = take() === '+' ? v + term() : v - term();
    return v;
  }
  function term() {
    let v = unary();
    for (;;) {
      const op = peek();
      if (op === '*') (take(), (v *= unary()));
      else if (op === '/') (take(), (v /= unary()));
      else if (op === '//' || op === 'div') (take(), (v = Math.floor(v / unary())));
      else if (op === '%' || op === 'mod') {
        take();
        const d = unary();
        v = ((v % d) + d) % d;
      } else return v;
    }
  }
  function unary() {
    if (peek() === '-') return take(), -unary();
    if (peek() === '+') return take(), unary();
    return power();
  }
  function power() {
    const base = atom();
    if (peek() === '^') {
      take();
      return base ** unary();
    }
    return base;
  }
  function atom() {
    const t = take();
    if (t === undefined) throw new Error('end');
    if (/^[\d.]+$/.test(t)) return Number(t);
    if (t === '(') {
      const v = expr();
      if (take() !== ')') throw new Error(')');
      return v;
    }
    if (t === 'floor') {
      if (take() !== '(') throw new Error('(');
      const v = expr();
      if (take() !== ')') throw new Error(')');
      return Math.floor(v);
    }
    if (/^[a-z]$/.test(t) && t in vars) return vars[t];
    throw new Error('token ' + t);
  }
  try {
    const v = expr();
    return pos === full.length ? v : NaN;
  } catch {
    return NaN;
  }
}

// Splits "A(2^6, 2^4), A(2^7, 2^3)" into [['2^6', '2^4'], ['2^7', '2^3']].
export function parseCalls(text, name = 'A') {
  const out = [];
  const s = String(text ?? '');
  let i = 0;
  while ((i = s.indexOf('(', i)) >= 0) {
    const before = s.slice(0, i).trimEnd();
    if (!before.toUpperCase().endsWith(name.toUpperCase())) {
      i++;
      continue;
    }
    let depth = 0;
    let j = i;
    const args = [''];
    for (; j < s.length; j++) {
      const c = s[j];
      if (c === '(') {
        depth++;
        if (depth === 1) continue;
      } else if (c === ')') {
        depth--;
        if (depth === 0) break;
      } else if ((c === ',' || c === ';') && depth === 1) {
        args.push('');
        continue;
      }
      args[args.length - 1] += c;
    }
    out.push(args.map((a) => a.trim()));
    i = j + 1;
  }
  return out;
}
