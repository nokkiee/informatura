// A lesson is read in one programming language: the one chosen in the header (Python, C++ or
// Java). Everything else is left out, so each reader gets the lesson as if it were written for
// their language only.
//
// In the lesson text (and in questions and explanations):
//   :::python            a block of Markdown only for Python readers, up to the line ":::"
//   :::cpp java          … only for C++ and Java readers
//   [[python: tekst]]    a piece of a sentence only for Python readers ([[cpp java: …]] etc.)
//   | … | Python | C++ / Java |   a table column headed by language names is kept only for them
// Code examples are fences of all three languages next to each other (~~~python, ~~~cpp,
// ~~~java); the reader sees the one in their language. A question with `langs: ['python']` is
// asked only in those languages.
export const CODE_LANGS = ['python', 'cpp', 'java'];
export const LANG_LABEL = { python: 'Python', cpp: 'C++', java: 'Java' };

const BLOCK = /^\s*:::\s*(.*?)\s*$/;
// the innermost [[…]] first, so they can be nested
const INLINE = /\[\[((?:python|cpp|java)(?:[ ,]+(?:python|cpp|java))*):[ ]?((?:(?!\[\[).)*?)\]\]/g;
const names = (s) => s.split(/[ ,]+/).filter(Boolean);

export const langOf = (lang) => (CODE_LANGS.includes(lang) ? lang : 'python');

// the text for readers of `lang` (tables: false keeps all table columns)
export function forLang(src, lang, { tables = true } = {}) {
  if (src == null || typeof src !== 'string') return src;
  if (!src.includes(':::') && !src.includes('[[')) return tables ? langTables(src, lang) : src;
  const out = [];
  let keep = true;
  for (const line of src.split('\n')) {
    const m = BLOCK.exec(line);
    if (m && (!m[1] || names(m[1]).every((n) => CODE_LANGS.includes(n)))) {
      keep = !m[1] || names(m[1]).includes(lang);
      continue;
    }
    if (keep) out.push(line);
  }
  let text = out.join('\n');
  for (let prev = null; prev !== text; ) {
    prev = text;
    text = text.replace(INLINE, (_, who, piece) => (names(who).includes(lang) ? piece : ''));
  }
  return tables ? langTables(text, lang) : text;
}

// "Python", "C++ / Java", "C++ i Java (dla liczb całkowitych)" → the languages of a table column
const NAMED = { python: 'python', 'c++': 'cpp', java: 'java' };
export function columnLangs(head) {
  const words = head.replace(/\(.*?\)/g, '').replace(/\*\*/g, '').trim().toLowerCase().split(/\s*(?:\/|,|\bi\b)\s*/).filter(Boolean);
  return words.length && words.every((w) => NAMED[w]) ? words.map((w) => NAMED[w]) : null;
}
const cells = (row) => row.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/);
function langTables(src, lang) {
  if (!src.includes('|')) return src;
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].trim().startsWith('|') || !/^\s*\|[\s:|-]+\|\s*$/.test(lines[i + 1] || '')) continue;
    const head = cells(lines[i]);
    const who = head.map(columnLangs);
    if (!who.some(Boolean)) continue;
    // a kept language column is headed by the reader's language only ("C++ / Java" → "C++")
    const note = (c) => (c.match(/\(.*?\)/) || [''])[0];
    const bold = (c) => (c.includes('**') ? '**' : '');
    lines[i] = lines[i].match(/^\s*/)[0] + '| ' + head.map((c, k) => (who[k] ? `${bold(c)}${LANG_LABEL[lang]}${bold(c)} ${note(c)}`.trim() : c)).join(' | ') + ' |';
    let j = i;
    for (; j < lines.length && lines[j].trim().startsWith('|'); j++) {
      const indent = lines[j].match(/^\s*/)[0];
      lines[j] = indent + '| ' + cells(lines[j]).filter((_, k) => !who[k] || who[k].includes(lang)).map((c) => c.trim()).join(' | ') + ' |';
    }
    i = j - 1;
  }
  return lines.join('\n');
}

// the questions asked in `lang`, with their position in the full list (progress is kept by it)
export const questionsFor = (list, lang) => list.map((q, i) => ({ q, i })).filter(({ q }) => !q.langs || q.langs.includes(lang));

// does the lesson read differently in each language (code examples, programs to write)?
export function dependsOnLang(lesson) {
  const texts = [lesson.intro, ...lesson.steps.map((s) => s.body)];
  return lesson.quiz.some((q) => q.type === 'code' || q.langs) || texts.some((t) => /~~~(python|cpp|java)\b|\[\[(python|cpp|java)|^\s*:::\s*(python|cpp|java)/m.test(t || ''));
}
