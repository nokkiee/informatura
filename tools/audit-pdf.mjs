// Compares the app's content with the original CKE PDFs (needs pdftotext and pdfinfo from poppler):
//   1. every task's "Arkusz PDF" page shows "Zadanie <no>. (0–<points>)" with the same points;
//   2. every number in task texts, intros and infos appears in the exam sheet;
//   3. the expected answers of fill-in, true/false and choice tasks appear in the key's section
//      for that task (answers checked by simulation or by expression are listed, not compared).
//   node tools/audit-pdf.mjs
import { execFileSync } from 'child_process';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
try {
  execFileSync('pdftotext', ['-v'], { stdio: 'ignore' });
} catch {
  console.log('pdftotext not found (install poppler-utils) – PDF audit skipped');
  process.exit(0);
}

const ids = (await import(pathToFileURL(path.join(ROOT, 'content/exams/index.js')).href)).default;
const DASH = '[–−-]';
const header = (no) => new RegExp(`Zadanie\\s+${no.replace(/\./g, '\\.')}\\.?\\s*\\((\\d)\\s*${DASH}\\s*(\\d+)\\)`);
const plain = (html) =>
  String(html ?? '')
    .replace(/\{\{[^}]*\}\}/g, ' ')
    .replace(/<sup>(.*?)<\/sup>/g, '^$1')
    .replace(/\)?<sub>(.*?)<\/sub>/g, (m, x) => (m.startsWith(')') ? ')' : '') + x)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
const squeeze = (s) => s.replace(/(\d)[    ](?=\d{3}\b)/g, '$1'); // 10 000 → 10000
const numbers = (s) => squeeze(s).match(/\d+(?:[.,]\d+)*/g) || [];
const norm = (s) => String(s).normalize('NFKC').toLowerCase().replace(/[\s_]+/g, '').replace(/[–−]/g, '-');

const problems = [];
const manual = [];
let counts = { pages: 0, numbers: 0, answers: 0 };
for (const id of ids) {
  const e = (await import(pathToFileURL(path.join(ROOT, 'content/exams', id + '.js')).href)).default;
  const pdf = path.join(ROOT, 'content', e.pdf);
  const pageCount = Number(run('pdfinfo', [pdf]).match(/Pages:\s+(\d+)/)[1]);
  const pages = Array.from({ length: pageCount }, (_, i) => run('pdftotext', ['-f', String(i + 1), '-l', String(i + 1), '-layout', pdf, '-']));
  const sheet = squeeze(run('pdftotext', [pdf, '-']));
  const inSheet = (n) => [n, n.replace(',', '.'), n.replace('.', ',')].some((a) => new RegExp(`(^|[^\\d])${a.replace(/\./g, '\\.')}($|[^\\d])`).test(sheet));
  const key = run('pdftotext', ['-layout', path.join(ROOT, 'content', e.keyPdf), '-']);
  const heads = [...key.matchAll(new RegExp(`Zadanie\\s+(\\d+(?:\\.\\d+)?)\\.?\\s*\\(\\d\\s*${DASH}\\s*\\d+\\)`, 'g'))];
  const sections = {};
  heads.forEach((m, i) => (sections[m[1]] = (sections[m[1]] || '') + key.slice(m.index, i + 1 < heads.length ? heads[i + 1].index : undefined)));

  for (const g of e.groups) {
    const groupText = plain(g.intro) + ' ' + Object.values(g.infos || {}).map((i) => plain(i.text)).join(' ');
    const missing = [...new Set(numbers(groupText))].filter((n) => !inSheet(n));
    counts.numbers += numbers(groupText).length;
    if (missing.length) problems.push(`${id} zadanie ${g.no} (wstęp): liczby spoza arkusza: ${missing.join(', ')}`);

    for (const t of g.tasks) {
      // 1. PDF page and points
      counts.pages++;
      const m = pages[t.page - 1]?.match(header(t.no));
      if (!m || Number(m[2]) !== t.points) {
        const where = pages.map((p, i) => (header(t.no).test(p) ? i + 1 : 0)).filter(Boolean);
        problems.push(`${id} ${t.no}: strona ${t.page} / ${t.points} pkt, a w arkuszu: strona ${where.join(',') || '?'} / ${m ? m[2] : '?'} pkt`);
      }
      // 2. numbers in the text
      const txt = plain(t.text) + ' ' + (t.statements || []).map(plain).join(' ') + ' ' + (t.options || []).map((o) => plain(o[1])).join(' ');
      counts.numbers += numbers(txt).length;
      const off = [...new Set(numbers(txt))].filter((n) => !inSheet(n));
      if (off.length) problems.push(`${id} ${t.no}: liczby spoza arkusza: ${off.join(', ')}`);
      // 3. answers vs the key
      if (!['fill', 'tf', 'choice'].includes(t.kind)) continue;
      const sec = sections[t.no];
      if (!sec) {
        problems.push(`${id} ${t.no}: brak zadania w kluczu`);
        continue;
      }
      const sol = sec.slice(Math.max(0, sec.search(/Rozwiązani|Odpowied/)));
      if (t.kind === 'fill') {
        for (const [f, v] of Object.entries(t.fields || {})) {
          if (v == null || typeof v === 'object') {
            manual.push(`${id} ${t.no}.${f}`);
            continue;
          }
          counts.answers++;
          if (!norm(sec).includes(norm(v))) problems.push(`${id} ${t.no}: pole ${f} = "${v}" nie występuje w kluczu`);
        }
      } else {
        counts.answers++;
        const re = t.kind === 'tf' ? /(?<!\p{L})[PF]+(?!\p{L})/gu : /(?<![A-Za-z])[A-D](?![A-Za-z])/g;
        const letters = (sol.match(re) || []).join('');
        if (!letters.includes(t.answer)) problems.push(`${id} ${t.no}: odpowiedź ${t.answer}, a w kluczu „${letters}”`);
      }
    }
  }
}
console.log(`PDF audit: ${counts.pages} tasks (page and points), ${counts.numbers} numbers, ${counts.answers} answers vs the key; ${manual.length} answers checked by simulation instead`);
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log('no problems');
