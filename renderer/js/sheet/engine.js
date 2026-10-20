// HyperFormula wrapper: Polish (Excel-style) function names, data import and display formats.

import { loadUmd } from '../ui.js';

let hfPromise = null;
const loadScript = loadUmd;

// Names that differ between HyperFormula's Polish pack and Polish Excel.
export const EXCEL_PL = {
  COUNT: 'ILE.LICZB',
  COUNTA: 'ILE.NIEPUSTYCH',
  CONCATENATE: 'ZŁĄCZ.TEKSTY',
  FILTER: 'FILTRUJ',
  AVERAGEA: 'ŚREDNIA.A',
  ROUND: 'ZAOKR',
  DATEDIF: 'DATA.RÓŻNICA',
};

export function loadHyperFormula() {
  if (hfPromise) return hfPromise;
  hfPromise = (async () => {
    await loadScript('vendor/hyperformula/hyperformula.full.min.js');
    await loadScript('vendor/hyperformula/languages/plPL.js');
    await loadScript('vendor/hyperformula/languages/enUS.js');
    const HF = window.HyperFormula;
    // the language bundles only put themselves in HF.languages; they still need registering
    for (const code of ['plPL', 'enUS']) {
      if (!HF.getRegisteredLanguagesCodes().includes(code)) HF.registerLanguage(code, HF.languages[code]);
    }
    const pl = HF.getLanguage('plPL');
    const fixed = JSON.parse(JSON.stringify(pl));
    fixed.langCode = 'plPLx';
    delete fixed.functions.VERSION; // protected: HyperFormula adds it on its own
    const taken = new Set(Object.values(fixed.functions));
    for (const [fn, name] of Object.entries(EXCEL_PL)) {
      if (!(fn in fixed.functions)) continue;
      if (taken.has(name) && fixed.functions[fn] !== name) continue;
      fixed.functions[fn] = name;
    }
    HF.registerLanguage('plPLx', fixed);
    return HF;
  })();
  return hfPromise;
}

export function hfConfig(lang) {
  const pl = lang !== 'en';
  return {
    licenseKey: 'gpl-v3',
    language: pl ? 'plPLx' : 'enUS',
    functionArgSeparator: pl ? ';' : ',',
    decimalSeparator: pl ? ',' : '.',
    thousandSeparator: '',
    arrayColumnSeparator: pl ? ';' : ',',
    arrayRowSeparator: pl ? '|' : ';',
    dateFormats: ['DD.MM.YYYY', 'YYYY-MM-DD', 'DD/MM/YYYY', 'DD-MM-YYYY'],
    timeFormats: ['hh:mm', 'hh:mm:ss'],
    useColumnIndex: true,
    evaluateNullToZero: true,
    nullDate: { year: 1899, month: 12, day: 30 },
    smartRounding: true,
    precisionRounding: 10,
    maxRows: 100000,
    maxColumns: 300,
    caseSensitive: false,
    useWildcards: true,
    matchWholeCell: true,
    undoLimit: 50,
  };
}

// ---- importing text files --------------------------------------------------------------

const RE_NUM = /^[-+]?\d+([.,]\d+)?$/;
const RE_DATE = /^(?:(\d{1,2})\.(\d{1,2})\.(\d{4})|(\d{4})-(\d{1,2})-(\d{1,2}))(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const RE_TIME = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
const EPOCH = Date.UTC(1899, 11, 30);

// Spreadsheet serial number (days since 1899-12-30, time as a fraction), like Excel.
export function toSerial(y, m, d, hh = 0, mi = 0, ss = 0) {
  return (Date.UTC(y, m - 1, d) - EPOCH) / 86400000 + (hh * 3600 + mi * 60 + ss) / 86400;
}

export function detectSeparator(lines) {
  const sample = lines.slice(0, 20);
  for (const sep of ['\t', ';']) if (sample.every((l) => l.includes(sep))) return sep;
  if (sample.every((l) => / /.test(l.trim()))) return ' ';
  if (sample.every((l) => l.includes(','))) return ',';
  return null;
}

// Parses a data file into rows of cell values ready for HyperFormula.
// Returns { rows, formats } where formats[col] is a display format for date columns.
export function parseDataFile(text, { sep = 'auto' } = {}) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  while (lines.length && lines[lines.length - 1] === '') lines.pop();
  const s = sep === 'auto' ? detectSeparator(lines.filter((l) => l !== '')) : sep;
  const rows = lines.map((l) => {
    if (s === null) return [l];
    if (s === ' ') return l.trim().split(/ +/);
    return l.split(s);
  });
  const formats = {};
  const out = rows.map((r) =>
    r.map((v, c) => {
      const t = v.trim();
      if (t === '') return null;
      if (RE_NUM.test(t) && !(t.length > 1 && /^[-+]?0\d/.test(t))) return Number(t.replace(',', '.'));
      const d = t.match(RE_DATE);
      if (d) {
        const dmy = d[1] !== undefined;
        const [y, m, day] = dmy ? [+d[3], +d[2], +d[1]] : [+d[4], +d[5], +d[6]];
        const hasTime = d[7] !== undefined;
        formats[c] = formats[c] || (dmy ? 'DD.MM.YYYY' : 'YYYY-MM-DD') + (hasTime ? ' hh:mm' : '');
        return toSerial(y, m, day, +(d[7] || 0), +(d[8] || 0), +(d[9] || 0));
      }
      const tm = t.match(RE_TIME);
      if (tm && +tm[1] < 24) {
        formats[c] = formats[c] || (tm[3] !== undefined ? 'hh:mm:ss' : 'hh:mm');
        return (+tm[1] * 3600 + +tm[2] * 60 + +(tm[3] || 0)) / 86400;
      }
      // keep values that would look like formulas or leading-zero codes as text
      if (/^[=+]/.test(t) || /^0\d+$/.test(t)) return "'" + t;
      return t;
    }),
  );
  return { rows: out, formats, sep: s };
}

// ---- display ---------------------------------------------------------------------------

const pad = (n, w = 2) => String(n).padStart(w, '0');

function serialToParts(serial) {
  // Excel serial date (1899-12-30 epoch) -> UTC parts
  const ms = Math.round((serial - 25569) * 86400000);
  const d = new Date(ms);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), hh: d.getUTCHours(), mm: d.getUTCMinutes(), ss: d.getUTCSeconds() };
}

export function formatDate(serial, fmt) {
  const p = serialToParts(serial);
  return fmt
    .replace('YYYY', p.y)
    .replace('MM', pad(p.m))
    .replace('DD', pad(p.d))
    .replace('hh', pad(p.hh))
    .replace('mm', pad(p.mm))
    .replace('ss', pad(p.ss));
}

export function formatNumber(v, { dec = null, lang = 'pl' } = {}) {
  let s;
  if (dec != null) s = v.toFixed(dec);
  else if (Number.isInteger(v)) s = String(v);
  else {
    const abs = Math.abs(v);
    if (abs !== 0 && (abs < 1e-6 || abs >= 1e15)) s = v.toExponential(5);
    else s = String(Number(v.toPrecision(12)));
  }
  return lang === 'en' ? s : s.replace('.', ',');
}

// Text shown in a cell. type is HyperFormula's detailed value type.
export function displayValue(value, type, fmt, lang) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object' && value.value !== undefined && value.type !== undefined) return value.value; // error
  if (typeof value === 'boolean') return lang === 'en' ? (value ? 'TRUE' : 'FALSE') : value ? 'PRAWDA' : 'FAŁSZ';
  if (typeof value === 'number') {
    if (fmt?.date) return formatDate(value, fmt.date);
    if (type === 'NUMBER_DATE') return formatDate(value, 'YYYY-MM-DD');
    if (type === 'NUMBER_DATETIME') return formatDate(value, 'YYYY-MM-DD hh:mm');
    if (type === 'NUMBER_TIME') return formatDate(value, 'hh:mm');
    if (type === 'NUMBER_PERCENT') return formatNumber(value * 100, { dec: fmt?.dec ?? null, lang }) + '%';
    return formatNumber(value, { dec: fmt?.dec ?? null, lang });
  }
  return String(value);
}

// ---- addresses ---------------------------------------------------------------------------

export function colName(c) {
  let s = '';
  c += 1;
  while (c > 0) {
    const m = (c - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    c = Math.floor((c - 1) / 26);
  }
  return s;
}

export function addr(r, c) {
  return colName(c) + (r + 1);
}

export function parseAddr(s) {
  const m = String(s).trim().toUpperCase().match(/^\$?([A-Z]{1,3})\$?(\d+)$/);
  if (!m) return null;
  let c = 0;
  for (const ch of m[1]) c = c * 26 + (ch.charCodeAt(0) - 64);
  return { r: Number(m[2]) - 1, c: c - 1 };
}
