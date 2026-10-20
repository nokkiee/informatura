// Turns a task's saved work into points, using the official answers and scoring rules.
import { checkAnswer, fieldMatches } from './check.js';
import { autoPoints } from './content.js';

export function fieldResults(task, values = {}) {
  if (typeof task.validate === 'function') return task.validate(values).ok;
  const ok = {};
  for (const [id, spec] of Object.entries(task.fields || {})) ok[id] = fieldMatches(spec, values[id] ?? '');
  return ok;
}

function scoreWith(task, ok) {
  if (typeof task.score === 'function') return Math.min(task.points, task.score(ok));
  return Object.values(ok).every(Boolean) ? task.points : 0;
}

// Returns { points, max, auto: boolean, detail } or null when nothing can be graded yet.
export function gradeTask(entry, state = {}) {
  const { task } = entry;
  const max = task.points;
  switch (task.kind) {
    case 'fill': {
      const filled = Object.values(state.fields || {}).some((v) => String(v).trim() !== '');
      if (typeof task.validate === 'function') {
        const r = task.validate(state.fields || {});
        return { points: filled ? Math.min(max, r.points) : 0, max, auto: true, detail: { ok: r.ok, note: r.note } };
      }
      const ok = fieldResults(task, state.fields);
      return { points: filled ? scoreWith(task, ok) : 0, max, auto: true, detail: { ok } };
    }
    case 'tf': {
      const ok = {};
      task.answer.split('').forEach((a, i) => (ok[i] = (state.tf || [])[i] === a));
      return { points: scoreWith(task, ok), max, auto: true, detail: { ok } };
    }
    case 'choice': {
      const want = [...task.answer].sort().join('');
      const got = [...(state.choice || '')].sort().join('');
      return { points: got && got === want ? max : 0, max, auto: true, detail: { ok: got === want } };
    }
    case 'program':
    case 'sheet':
    case 'sql': {
      const autoMax = autoPoints(task);
      const r = state.answer && state.answer.trim() ? checkAnswer(state.answer, task.expect, { taskNo: task.no, siblings: entry.siblings, autoPoints: autoMax }) : { points: 0, max: autoMax, parts: [], extra: [] };
      const self = task.self ? Math.min(task.self.points, state.selfPoints ?? 0) : 0;
      return { points: r.points + self, max, auto: !task.self, detail: r, selfPending: task.self && state.selfPoints == null };
    }
    case 'algorithm': {
      const t = state.tests;
      if (t && t.total && t.passed === t.total) return { points: max, max, auto: true, detail: t };
      if (state.selfPoints != null) return { points: Math.min(max, state.selfPoints), max, auto: false, detail: t };
      return { points: 0, max, auto: true, detail: t };
    }
    case 'open':
    case 'sqlwrite':
    default:
      return { points: Math.min(max, state.selfPoints ?? 0), max, auto: false, selfPending: state.selfPoints == null };
  }
}

export function hasWork(entry, state = {}) {
  const { task } = entry;
  switch (task.kind) {
    case 'fill':
      return Object.values(state.fields || {}).some((v) => String(v).trim() !== '');
    case 'tf':
      return (state.tf || []).some(Boolean);
    case 'choice':
      return !!state.choice;
    case 'algorithm':
      return !!state.tests || Object.keys(state.code || {}).length > 0;
    case 'sqlwrite':
      return !!(state.sql && state.sql.trim());
    case 'open':
      return !!(state.text && state.text.trim());
    default:
      return !!(state.answer && state.answer.trim());
  }
}
