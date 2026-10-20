// Loads the exam content modules and builds a flat index of all tasks.

const MONTHS = { maj: 'maj', czerwiec: 'czerwiec' };

export const CATEGORIES = {
  programowanie: { label: 'Programowanie', short: 'Kod', icon: 'code', desc: 'Programy pracujące na plikach z danymi' },
  algorytmy: { label: 'Algorytmika', short: 'Algorytmy', icon: 'brain', desc: 'Analiza i zapis algorytmów, rekurencja, uzupełnianie tabel' },
  bazy: { label: 'Bazy danych', short: 'SQL', icon: 'db', desc: 'Zapytania SQL do relacyjnej bazy danych' },
  arkusz: { label: 'Arkusz kalkulacyjny', short: 'Arkusz', icon: 'grid', desc: 'Obliczenia, zestawienia i wykresy w arkuszu' },
  teoria: { label: 'Teoria', short: 'Teoria', icon: 'binary', desc: 'Systemy liczbowe, sieci, bezpieczeństwo, architektura' },
};

export const KIND_LABELS = {
  program: 'program',
  sheet: 'arkusz kalkulacyjny',
  sql: 'baza danych',
  fill: 'uzupełnij',
  tf: 'prawda / fałsz',
  choice: 'wybór',
  algorithm: 'zapis algorytmu',
  open: 'odpowiedź otwarta',
  sqlwrite: 'zapis zapytania SQL',
};

let exams = [];
let tasks = [];
const byKey = new Map();

export async function loadContent() {
  const ids = (await import('../content/exams/index.js')).default;
  exams = [];
  for (const id of ids) {
    const mod = await import(`../content/exams/${id}.js`);
    exams.push(mod.default);
  }
  tasks = [];
  byKey.clear();
  for (const exam of exams) {
    exam.tasks = [];
    for (const group of exam.groups) {
      const siblings = group.tasks.map((t) => t.no);
      for (const task of group.tasks) {
        const entry = { key: `${exam.id}/${task.no}`, exam, group, task, siblings, index: tasks.length };
        exam.tasks.push(entry);
        tasks.push(entry);
        byKey.set(entry.key, entry);
      }
    }
  }
  return exams;
}

export const getExams = () => exams;
export const getExam = (id) => exams.find((e) => e.id === id) || null;
export const allTasks = () => tasks;
export const getTask = (key) => byKey.get(key) || null;

export function examTitle(exam) {
  return `Matura ${MONTHS[exam.session] || exam.session} ${exam.year}`;
}

export function examLong(exam) {
  return `${examTitle(exam)} (${exam.dateText})`;
}

export function dataUrl(exam, file) {
  return `content/data/${exam.id}/${file}`;
}

export function dataSrc(exam, file) {
  return `data/${exam.id}/${file}`;
}

const textCache = new Map();
export async function fetchData(exam, file) {
  const url = dataUrl(exam, file);
  if (textCache.has(url)) return textCache.get(url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Nie można wczytać pliku ' + file);
  const text = await res.text();
  textCache.set(url, text);
  return text;
}

// Data files visible to a task: its group's files.
export function taskFiles(entry) {
  return entry.group.files || [];
}

export function isPractical(task) {
  return ['program', 'sheet', 'sql'].includes(task.kind);
}

export function autoPoints(task) {
  return task.points - (task.self?.points || 0);
}

// ---- hints -------------------------------------------------------------------------------
// content/hints/<exam>.js: { '<task no>': ['a vague hint', 'a more specific one', …] } (markdown)
// content/solutions/<exam>/<task no>.<py|cpp|java|sql>: model solutions, which the later
// hints reveal line by line in the editor.

const hintModules = new Map();
export async function getHints(exam, no) {
  if (!hintModules.has(exam.id)) {
    hintModules.set(
      exam.id,
      import(`../content/hints/${exam.id}.js`).then((m) => m.default).catch(() => ({})),
    );
  }
  return (await hintModules.get(exam.id))[no] || [];
}

export const SOLUTION_EXT = { python: 'py', cpp: 'cpp', java: 'java', sql: 'sql' };

export async function fetchSolution(exam, no, lang) {
  const url = `content/solutions/${exam.id}/${no}.${SOLUTION_EXT[lang]}`;
  if (textCache.has(url)) return textCache.get(url);
  const res = await fetch(url).catch(() => null);
  const text = res && res.ok ? await res.text() : null;
  textCache.set(url, text);
  return text;
}
