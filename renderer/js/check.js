// Answer checking. Pure functions, shared by the app and the unit tests.
//
// Answers are compared as sequences of tokens, so labels, separators and formatting
// ("Odpowiedź: 8,16", "8.16", "2.2 10") don't matter, while the values themselves do.

const DIACRITICS = /[̀-ͯ]/g;

export function plain(s) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/ł/g, 'l')
    .replace(/Ł/g, 'L')
    .toLowerCase();
}

function normDate(t) {
  let m = t.match(/^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  m = t.match(/^(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  return null;
}

export function tokenize(text) {
  const s = plain(String(text ?? '').replace(/(\d)[\u00a0\u202f](?=\d{3}\b)/g, '$1')) // 2 422 669,40 with non-breaking spaces
    .replace(/[−–—]/g, '-')
    .replace(/(\d):(\d)/g, '$1\u0001$2'); // keep times like 12:30 together
  const out = [];
  for (let raw of s.split(/[\s;|()[\]{}"'`<>=:‘’“”„]+/)) {
    if (!raw) continue;
    raw = raw.replace(/\u0001/g, ':');
    // "8,16" is a decimal number; "a,b,c" is a list.
    const pieces = /^[-+]?\d+,\d+$/.test(raw) ? [raw.replace(',', '.')] : raw.split(',');
    for (let p of pieces) {
      p = p.replace(/^[.!?]+/, '').replace(/(?<!\.)[.!?]+$/, '');
      if (!p || /^[-/\\_]+$/.test(p)) continue;
      const ym = p.match(/^(\d{4})-(\d{1,2})$/); // "2023-05" -> year and month
      if (ym) out.push(ym[1], ym[2]);
      else out.push(normDate(p) || p);
    }
  }
  return out;
}

const NUM = /^[-+]?\d+(\.\d+)?$/;

function canonInt(t) {
  let s = t.replace(/^\+/, '');
  const neg = s.startsWith('-');
  if (neg) s = s.slice(1);
  s = s.replace(/\.0+$/, '').replace(/^0+(?=\d)/, '');
  return (neg && s !== '0' ? '-' : '') + s;
}

// Does the user's token u count as the expected token e?
export function tokEq(e, u) {
  if (e === u) return true;
  if (e.endsWith('…') && e.length > 1) return u.startsWith(e.slice(0, -1)); // 'malinowo…' matches any ending
  // "10" counts as the hour "10:00"
  if (/^\d{1,2}$/.test(e) && /^\d{1,2}:00(:00)?$/.test(u)) return Number(e) === Number(u.split(':')[0]);
  if (!NUM.test(e) || !NUM.test(u)) return false;
  if (!e.includes('.')) {
    // Leading zeros are significant in digit strings such as "014576540" or "00".
    if (/^-?0\d/.test(e)) return false;
    if (u.includes('.') && !/\.0+$/.test(u)) return false;
    return canonInt(e) === canonInt(u);
  }
  const decimals = e.split('.')[1].length;
  return Math.abs(Number(u) - Number(e)) <= 0.5 * 10 ** -decimals + 1e-9;
}

export function seqEqual(exp, got) {
  return exp.length === got.length && exp.every((e, i) => tokEq(e, got[i]));
}

// Expected tokens appear in order (not necessarily next to each other).
export function isSubsequence(exp, got, from = 0) {
  let j = from;
  for (const e of exp) {
    while (j < got.length && !tokEq(e, got[j])) j++;
    if (j >= got.length) return false;
    j++;
  }
  return true;
}

// Expected tokens appear next to each other; returns the start index or -1.
function findRun(exp, got, used) {
  outer: for (let i = 0; i + exp.length <= got.length; i++) {
    for (let k = 0; k < exp.length; k++) {
      if (used && used[i + k]) continue outer;
      if (!tokEq(exp[k], got[i + k])) continue outer;
    }
    return i;
  }
  return -1;
}

// ---- segments: one program often prints answers for several tasks -------------------------

const LABEL = /^\s*(?:zad(?:anie)?\.?\s*)?(\d+\.\d+)\.?\s*(?:[:)\-–]\s*)?/i;

// Picks the part of the answer that belongs to taskNo, when the answer is labelled
// with task numbers ("2.2 10\n2.3 1110…"). Unlabelled answers are returned whole.
export function segmentFor(text, taskNo, siblings = []) {
  const src = String(text ?? '');
  if (!taskNo || !taskNo.includes('.')) return src;
  const known = new Set([taskNo, ...siblings]);
  const lines = src.split(/\r?\n/);
  const marks = [];
  lines.forEach((l, i) => {
    const m = l.match(LABEL);
    if (m && known.has(m[1])) marks.push({ i, no: m[1], rest: l.slice(m[0].length) });
  });
  const mine = marks.findIndex((m) => m.no === taskNo);
  if (mine < 0) return src;
  const start = marks[mine];
  const end = marks[mine + 1] ? marks[mine + 1].i : lines.length;
  return [start.rest, ...lines.slice(start.i + 1, end)].join('\n');
}

function answerLines(text, taskNo) {
  const out = [];
  for (const l of String(text ?? '').split(/\r?\n/)) {
    let t = tokenize(l);
    if (taskNo && t.length && (t[0] === taskNo || (t[0] === 'zadanie' && t[1] === taskNo))) t = t.slice(t[0] === 'zadanie' ? 2 : 1);
    if (t.length) out.push({ raw: l.trim(), tokens: t });
  }
  return out;
}

// ---- expected answers ------------------------------------------------------------------------

// Turns the shorthand forms used in content files into { parts: [...] }.
export function normalizeExpect(expect, autoPoints) {
  if (expect == null) return null;
  if (typeof expect === 'string' || typeof expect === 'number') return { parts: [{ tokens: String(expect), points: autoPoints }] };
  if (Array.isArray(expect)) return { parts: [{ lines: expect, points: autoPoints }] };
  return { exactLines: true, ...expect };
}

function lineMatches(expTokens, userTokens) {
  return isSubsequence(expTokens, userTokens);
}

// Checks an answer against an expectation. Returns per-part results and the points.
export function checkAnswer(answer, expect, { taskNo, siblings = [], autoPoints } = {}) {
  const spec = normalizeExpect(expect, autoPoints);
  const text = segmentFor(answer, taskNo, siblings);
  const tokens = tokenize(text);
  const results = spec.parts.map((p) => ({ label: p.label || '', max: p.points ?? 0, ok: false, note: '' }));

  // tokens / items parts
  const usedByItems = new Array(tokens.length).fill(false);
  spec.parts.forEach((p, idx) => {
    if (p.tokens != null) {
      const alts = Array.isArray(p.tokens) ? p.tokens : [p.tokens];
      results[idx].ok = alts.some((alt) => isSubsequence(tokenize(alt), tokens));
    } else if (p.items) {
      const used = new Array(tokens.length).fill(false);
      let pos = 0;
      let ok = true;
      for (const it of p.items) {
        const exp = tokenize(it);
        let at;
        if (p.ordered) {
          const rest = tokens.slice(pos);
          at = findRun(exp, rest, null);
          if (at >= 0) at += pos;
        } else at = findRun(exp, tokens, used);
        if (at < 0) {
          ok = false;
          break;
        }
        for (let k = 0; k < exp.length; k++) used[at + k] = true;
        pos = at + exp.length;
      }
      results[idx].ok = ok;
      if (ok) used.forEach((u, k) => u && (usedByItems[k] = true));
    }
  });

  // lines parts are matched together, so each user line is used at most once
  // "reuse" parts (e.g. a separate point for sorting) look at the same lines again
  const lineParts = spec.parts.map((p, i) => [p, i]).filter(([p]) => p.lines && !p.reuse);
  for (const [p, i] of spec.parts.map((p, i) => [p, i]).filter(([p]) => p.lines && p.reuse)) {
    const sub = checkAnswer(text, { exactLines: false, parts: [{ ...p, reuse: false, points: 1 }] }, { autoPoints: 1 });
    results[i].ok = sub.parts[0].ok;
    results[i].note = sub.parts[0].note;
  }
  let extra = [];
  if (lineParts.length) {
    let ulines = answerLines(text, taskNo);
    const wanted = [];
    for (const [p, i] of lineParts) p.lines.forEach((l) => wanted.push({ part: i, tokens: tokenize(l), ordered: !!p.ordered }));
    // Header lines without any digit are skipped when every expected line has a number.
    if (wanted.every((w) => w.tokens.some((t) => /\d/.test(t)))) ulines = ulines.filter((u) => u.tokens.some((t) => /\d/.test(t)));
    const usedLine = new Array(ulines.length).fill(false);
    const found = new Array(wanted.length).fill(false);
    const anyOrdered = wanted.some((w) => w.ordered);
    if (anyOrdered) {
      let j = 0;
      wanted.forEach((w, k) => {
        while (j < ulines.length && !lineMatches(w.tokens, ulines[j].tokens)) j++;
        if (j < ulines.length) {
          found[k] = true;
          usedLine[j] = true;
          j++;
        }
      });
    } else {
      // most specific lines first, so a short line can't steal a longer one's match
      const order = wanted.map((w, k) => k).sort((a, b) => wanted[b].tokens.length - wanted[a].tokens.length);
      for (const k of order) {
        const j = ulines.findIndex((u, jj) => !usedLine[jj] && lineMatches(wanted[k].tokens, u.tokens));
        if (j >= 0) {
          found[k] = true;
          usedLine[j] = true;
        }
      }
    }
    const lineOf = new Array(wanted.length).fill(-1);
    if (!anyOrdered) {
      // remember which user line matched each expected line (for "sort" checks)
      const used2 = new Array(ulines.length).fill(false);
      const order = wanted.map((w, k) => k).sort((a, b) => wanted[b].tokens.length - wanted[a].tokens.length);
      for (const k of order) {
        const j = ulines.findIndex((u, jj) => !used2[jj] && lineMatches(wanted[k].tokens, u.tokens));
        if (j >= 0) {
          used2[j] = true;
          lineOf[k] = j;
        }
      }
    }
    for (const [p, i] of lineParts) {
      const mine = wanted.map((w, k) => [w, k]).filter(([w]) => w.part === i);
      const missing = mine.filter(([, k]) => !found[k]).length;
      results[i].ok = missing === 0;
      if (missing) results[i].note = `brakuje ${missing} z ${mine.length} oczekiwanych wierszy`;
      if (results[i].ok && p.sort) {
        // lines must appear sorted by their last number (ties in any order)
        const seq = mine
          .map(([w, k]) => ({ at: lineOf[k], v: Number([...w.tokens].reverse().find((t) => NUM.test(t))) }))
          .sort((a, b) => a.at - b.at);
        const okSort = seq.every((x, n) => n === 0 || (p.sort === 'desc' ? seq[n - 1].v >= x.v : seq[n - 1].v <= x.v));
        if (!okSort) {
          results[i].ok = false;
          results[i].note = p.sort === 'desc' ? 'wiersze nie są posortowane nierosnąco' : 'wiersze nie są posortowane niemalejąco';
        }
      }
    }
    extra = ulines.filter((_, j) => !usedLine[j]).map((u) => u.raw);
    if (spec.exactLines && extra.length) {
      for (const [, i] of lineParts) {
        if (results[i].ok) results[i].note = 'odpowiedź zawiera nadmiarowe wiersze';
        results[i].ok = false;
      }
    }
  }

  let points = results.reduce((s, r) => s + (r.ok ? r.max : 0), 0);
  const max = results.reduce((s, r) => s + r.max, 0);
  // rubrics like "1 pkt for one or two of the three" need their own rule
  // numbers in the answer that no "items" part accounted for (for "no wrong numbers" rubrics)
  const extraNumbers = tokens.filter((t, k) => !usedByItems[k] && /^-?\d+$/.test(t) && t !== taskNo);
  if (typeof spec.score === 'function') points = Math.min(max, spec.score(results.map((r) => r.ok), { extra, extraNumbers }));
  return { ok: points === max && max > 0, points, max, parts: results, extra };
}

// ---- fill-in fields --------------------------------------------------------------------------

function normExpr(s) {
  return plain(s)
    .replace(/\s+/g, '')
    .replace(/[−–—]/g, '-')
    .replace(/\*\*/g, '^')
    .replace(/[·×⋅]/g, '*')
    .replace(/≥|=>/g, '>=')
    .replace(/≤|=</g, '<=')
    .replace(/≠|<>/g, '!=')
    .replace(/←|:=/g, '=')
    .replace(/;$/, '');
}

export function fieldMatches(spec, value) {
  const v = String(value ?? '');
  if (spec && typeof spec === 'object' && !Array.isArray(spec)) {
    if (spec.expr) return spec.expr.some((e) => normExpr(e) === normExpr(v));
    if (spec.any) return spec.any.some((e) => fieldMatches(e, v));
  }
  const list = Array.isArray(spec) ? spec : [spec];
  for (const e of list) {
    const es = String(e);
    if (es.trim() === '' ? v.trim() === '' : plain(es).replace(/\s+/g, ' ').trim() === plain(v).replace(/\s+/g, ' ').trim()) return true;
    const et = tokenize(es);
    if (et.length && seqEqual(et, tokenize(v))) return true;
  }
  return false;
}

// ---- algorithm test outputs ------------------------------------------------------------------

export function outputMatches(expected, got) {
  return seqEqual(tokenize(expected), tokenize(got));
}
