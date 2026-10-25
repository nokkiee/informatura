// Settings, progress and per-task work, persisted through the main process
// (JSON files in the app's data folder).
import { debounce } from './ui.js';

const DEFAULT_SETTINGS = {
  lang: 'python',
  theme: 'dark',
  fontSize: 14,
  sheetLang: 'pl',
  examTimer: true,
  starter: 'template', // 'template' | 'empty': what a new code/SQL editor starts with
  clearConsole: false, // clear the console before every run
  toolchains: {},
};

let settings = { ...DEFAULT_SETTINGS };
let progress = {};
const listeners = new Set();

export async function initStore() {
  const [s, p] = await Promise.all([window.api.storeGet('settings'), window.api.storeGet('progress')]);
  settings = { ...DEFAULT_SETTINGS, ...(s || {}) };
  progress = p || {};
}

export function getSettings() {
  return settings;
}

export async function setSettings(patch) {
  settings = { ...settings, ...patch };
  await window.api.storeSet('settings', settings);
  for (const fn of listeners) fn(settings);
}

export function onSettings(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ---- progress: one record per task -------------------------------------------------------
// { points, max, status: 'correct'|'partial'|'wrong'|'seen', at }

const saveProgress = debounce(() => window.api.storeSet('progress', progress), 300);

export function getProgress(key) {
  return progress[key] || null;
}

export function allProgress() {
  return progress;
}

export function recordResult(key, { points, max }) {
  const status = points >= max ? 'correct' : points > 0 ? 'partial' : 'wrong';
  const prev = progress[key];
  progress[key] = { points, max, status, at: Date.now(), best: Math.max(points, prev?.best ?? 0) };
  saveProgress();
  return progress[key];
}

export function markSeen(key) {
  if (progress[key]) return;
  progress[key] = { status: 'seen', at: Date.now() };
  saveProgress();
}

export async function resetProgress() {
  progress = {};
  await window.api.storeSet('progress', progress);
}

// ---- per-task work: answers, code, queries, spreadsheet ------------------------------------

const taskCache = new Map();
const pending = new Map();

function storeKey(key) {
  return 'task/' + key.replace(/[^\w.\-/]/g, '_');
}

export async function loadTaskState(key) {
  if (taskCache.has(key)) return taskCache.get(key);
  const s = (await window.api.storeGet(storeKey(key))) || {};
  taskCache.set(key, s);
  return s;
}

export function saveTaskState(key, state) {
  taskCache.set(key, state);
  let d = pending.get(key);
  if (!d) {
    d = debounce(() => window.api.storeSet(storeKey(key), taskCache.get(key)), 600);
    pending.set(key, d);
  }
  d();
}

// ---- lessons: { lessons: { [id]: { step, seen: [i], q: { [i]: { ok, value, tried } } } },
//                tests: { [section]: { best, last, at, answers } } } -------------------------

let learn = null;
const saveLearn = debounce(() => window.api.storeSet('learn', learn), 300);

export async function getLearn() {
  if (!learn) learn = (await window.api.storeGet('learn')) || {};
  learn.lessons ||= {};
  learn.tests ||= {};
  return learn;
}

// changes the lessons' progress (fn gets it) and saves it
export function updateLearn(fn) {
  if (!learn) return;
  fn(learn);
  saveLearn();
}

// forgets everything done in the lessons and section tests (answers and programs too)
export async function resetLearn() {
  learn = { lessons: {}, tests: {} };
  await window.api.storeSet('learn', learn);
}


export function flushTaskState() {
  saveLearn.flush();
  for (const d of pending.values()) d.flush();
}

// ---- exam sessions (timer) ----------------------------------------------------------------

export async function getSession(examId) {
  return (await window.api.storeGet('session/' + examId)) || null;
}

export async function setSession(examId, s) {
  if (s === null) return window.api.storeDel('session/' + examId);
  return window.api.storeSet('session/' + examId, s);
}

window.addEventListener('beforeunload', () => flushTaskState());
