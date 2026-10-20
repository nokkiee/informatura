// Helpers shared by the exam content files (content/exams/*.js).
//
// Task statements are Markdown with inline HTML. Answer fields are written as {{id}}
// (text box), {{id|8}} (text box ~8 characters wide) or {{id:<|>|=}} (drop-down list);
// the app swaps them for real inputs after rendering.

// Strips the common indentation so statements can be indented with the code.
export function md(strings, ...values) {
  let s = strings.reduce((acc, str, i) => acc + str + (i < values.length ? values[i] : ''), '');
  s = s.replace(/^\n/, '').replace(/\n\s*$/, '');
  const indents = s
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => l.match(/^ */)[0].length);
  const cut = indents.length ? Math.min(...indents) : 0;
  return s
    .split('\n')
    .map((l) => l.slice(cut))
    .join('\n');
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// rows: array of rows (arrays of cell HTML). The first row is the header unless head:false.
export function table(rows, { head = true, cls = '', widths = null } = {}) {
  const colgroup = widths ? `<colgroup>${widths.map((w) => `<col style="width:${w}">`).join('')}</colgroup>` : '';
  const tr = (r, tag) => `<tr>${r.map((c) => `<${tag}>${c}</${tag}>`).join('')}</tr>`;
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
