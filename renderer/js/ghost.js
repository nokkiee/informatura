// Ghost code for the hints, the way VS Code suggests code: the next line of the model solution
// appears as faint text right at the cursor, woven around brackets the editor closed by itself,
// and the hinted lines that follow appear faintly under it. Nothing is drawn elsewhere in the
// code (a bulb next to the line numbers marks where a hint is waiting), so the code doesn't move
// while the student types. Tab writes the hinted line, Esc hides the hint.
//
// Lines the student has already written (spacing, quotes and comments don't matter) are not
// hinted again. Which lines can be hinted depends on the hint stage: the first missing line,
// then about half of the solution, then all of it.

const COMMENT = { python: '#', cpp: '//', java: '//', sql: '--' };
const MAX_CELLS = 400000; // alignment table size limit (user lines × solution lines)

// Drops a trailing comment that isn't inside a string.
function stripComment(line, lang) {
  const mark = COMMENT[lang];
  if (!mark) return line;
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === '\\') i++;
      else if (c === quote) quote = null;
    } else if (c === '"' || c === "'") quote = c;
    else if (line.startsWith(mark, i)) return line.slice(0, i);
  }
  return line;
}

// The form two lines are compared in.
export function normLine(line, lang) {
  let s = stripComment(line, lang).replace(/\s+/g, '').replace(/'/g, '"');
  if (lang === 'sql') s = s.toLowerCase();
  return s;
}

const isCommentOnly = (line, lang) => line.trim() !== '' && normLine(line, lang) === '';

// Longest common subsequence of the user's non-empty lines and the solution's lines.
// Returns, for every solution line, the index of the user line it matched (or -1).
export function alignLines(userNorms, refNorms) {
  const U = [];
  userNorms.forEach((n, i) => n && U.push(i));
  const n = U.length;
  const m = refNorms.length;
  const match = new Array(m).fill(-1);
  if (!n || !m || n * m > MAX_CELLS) return match;
  const dp = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = userNorms[U[i]] === refNorms[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (userNorms[U[i]] === refNorms[j]) {
      match[j] = U[i];
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  return match;
}

// What's left to type of `ref` after the user has typed `typed` (compared without spaces).
// Returns null when `typed` isn't the beginning of `ref`.
export function remainderOf(ref, typed, lang) {
  const t = normLine(typed, lang);
  const want = (c) => (lang === 'sql' ? c.toLowerCase() : c).replace(/'/g, '"');
  let k = 0;
  let pos = 0;
  while (k < t.length) {
    while (pos < ref.length && /\s/.test(ref[pos])) pos++;
    if (pos >= ref.length || want(ref[pos]) !== t[k]) return null;
    pos++;
    k++;
  }
  return ref.slice(pos);
}

// How much of `ref` is already typed in `typed`: the length of the beginning of `ref` that
// `typed` covers, or null when `typed` isn't the beginning of `ref`. Brackets and quotes the
// editor closed by itself at the end of the line don't count.
export function typedLength(ref, typed, lang) {
  let t = typed.replace(/\s+$/, '');
  for (;;) {
    const rest = remainderOf(ref, t, lang);
    if (rest !== null) return ref.length - rest.length;
    if (!/[)\]}"']$/.test(t)) return null;
    t = t.slice(0, -1).replace(/\s+$/, '');
  }
}

// How many solution lines each stage reveals.
export function stageCount(stage, stages, total) {
  if (stage <= 0 || !total) return 0;
  if (stage === 1) return 1;
  if (stage >= stages || total <= 2) return total;
  return Math.max(2, Math.ceil(total / 2));
}

// The solution's lines and which of them the current stage reveals.
function prepare({ ref, template, stage, stages, lang }) {
  const refLines = ref.filter((l) => normLine(l, lang) !== '');
  const refNorms = refLines.map((l) => normLine(l, lang));
  const templateNorms = template.map((l) => normLine(l, lang));
  // The solution's own lines, in order; the rest come from the template, which is already in
  // the editor. Aligning (rather than a set lookup) keeps e.g. a loop's closing brace, which
  // the template also has elsewhere.
  const fromTemplate = alignLines(templateNorms, refNorms);
  const own = [];
  refNorms.forEach((n, j) => fromTemplate[j] < 0 && own.push(j));
  const count = stageCount(stage, stages, own.length);
  return { refLines, refNorms, templateNorms, own, count, full: count >= own.length, revealed: new Set(own.slice(0, count)) };
}

// Pure part 1: the whole editor.
//   user: the editor's lines; ref: the solution's lines; template: the starting code's lines
//   stage / stages: which hint stage is shown (1 = one line … stages = whole solution)
// Returns { spots: [{line, typing, lines}], remove: [line], missing, total }
//   spots: where hinted lines are waiting – on an empty (or started) line where the first of
//   them gets typed (typing: true), or at the end of the line they follow (typing: false)
//   remove: template lines the whole solution doesn't use
export function planGhost({ user, ref, template, stage, stages, lang }) {
  const P = prepare({ ref, template, stage, stages, lang });
  const userNorms = user.map((l) => normLine(l, lang));
  const match = alignLines(userNorms, P.refNorms);
  const matchedUser = new Set(match.filter((x) => x >= 0));

  // the lines before the first matched one: hints go after a leading comment block
  let lead = -1;
  while (lead + 1 < user.length && isCommentOnly(user[lead + 1], lang)) lead++;

  const groups = [];
  let last = -1;
  let seenMatch = false;
  P.refNorms.forEach((n, j) => {
    if (match[j] >= 0) {
      last = match[j];
      seenMatch = true;
      return;
    }
    if (!P.revealed.has(j)) return;
    const anchor = seenMatch ? last : lead;
    const g = groups[groups.length - 1];
    if (g && g.anchor === anchor) g.lines.push(P.refLines[j]);
    else groups.push({ anchor, lines: [P.refLines[j]] });
  });

  const spots = groups.map((g) => {
    const next = g.anchor + 1; // 0-based index of the line after the anchor
    if (next < user.length && !matchedUser.has(next) && typedLength(g.lines[0], user[next], lang) !== null) return { line: next + 1, typing: true, lines: g.lines };
    return { line: Math.max(1, g.anchor + 1), typing: false, lines: g.lines };
  });

  // with the whole solution shown: template lines the solution doesn't use
  const remove = [];
  if (P.full && P.count) {
    const refSet = new Set(P.refNorms);
    const tmplSet = new Set(P.templateNorms);
    userNorms.forEach((n, i) => {
      if (n && !matchedUser.has(i) && tmplSet.has(n) && !refSet.has(n)) remove.push(i + 1);
    });
  }
  const missing = groups.reduce((s, g) => s + g.lines.length, 0);
  return { spots, remove, missing, total: P.own.length };
}

// What's left of `ref` after `before` (the text left of the cursor). On a line with nothing
// typed yet the hint keeps the solution's indentation; when the line is indented deeper than
// the solution's line, Python needs a dedent, so that is flagged.
function restOf(ref, before, lang) {
  const indent = ref.length - ref.trimStart().length;
  if (!before.trim()) {
    if (before.length <= indent) return { rest: ref.slice(before.length), dedent: false };
    return { rest: ref.trimStart(), dedent: lang === 'python' };
  }
  const rest = remainderOf(ref, before, lang);
  return rest === null ? null : { rest, dedent: false };
}

// Weaves the rest of the hinted line around the text right of the cursor (usually brackets and
// quotes the editor closed by itself), the way VS Code shows a suggestion: returns the pieces
// to show, each before character `at` of `after` (after.length = at the end of the line), or
// null when `after` doesn't fit into the hinted line.
export function interleave(rest, after, lang) {
  const same = (a, b) => (lang === 'sql' ? a.toLowerCase() === b.toLowerCase() : a === b) || (/['"]/.test(a) && /['"]/.test(b));
  const parts = [];
  let pos = 0;
  for (let k = 0; k < after.length; k++) {
    let q = pos;
    while (q < rest.length && !same(rest[q], after[k])) q++;
    if (q >= rest.length) return null;
    if (q > pos) parts.push({ at: k, text: rest.slice(pos, q) });
    pos = q + 1;
  }
  if (pos < rest.length) parts.push({ at: after.length, text: rest.slice(pos) });
  return parts;
}

// Pure part 2: the hint at the cursor.
// Returns null, or { line, kind, parts, full, more, dedent }:
//   kind 'line': the cursor line is (the beginning of) a hinted line – `parts` (see interleave)
//     are what's left of it, `full` is the whole line, `more` the hinted lines that follow
//   kind 'after': the cursor is at the end of a finished line – `more` are the hinted lines
//     that follow it
export function suggestAt({ user, ref, template, stage, stages, lang, line, column }) {
  const P = prepare({ ref, template, stage, stages, lang });
  if (!P.count) return null;
  const L = line - 1;
  const text = user[L] ?? '';
  // align everything but the cursor line, then look at the gap the cursor line is in
  const match = alignLines(
    user.map((l, i) => (i === L ? '' : normLine(l, lang))),
    P.refNorms,
  );
  const refOf = new Map();
  match.forEach((u, j) => u >= 0 && refOf.set(u, j));
  let a = L - 1;
  while (a >= 0 && !refOf.has(a)) a--;
  let b = L + 1;
  while (b < user.length && !refOf.has(b)) b++;
  const lo = a >= 0 ? refOf.get(a) + 1 : 0;
  const hi = b < user.length ? refOf.get(b) : P.refLines.length;
  const following = (j) => {
    const out = [];
    for (let k = j + 1; k < hi && P.revealed.has(k); k++) out.push(P.refLines[k]);
    return out;
  };

  const norm = normLine(text, lang);
  const before = text.slice(0, column - 1);
  const after = text.slice(column - 1);
  // a finished line with the cursor at its end: the hinted lines that follow
  if (norm && !after.trim()) {
    for (let j = lo; j < hi; j++) {
      if (P.refNorms[j] !== norm) continue;
      const more = following(j);
      return more.length ? { line, kind: 'after', parts: [], full: P.refLines[j], more, dedent: false } : null;
    }
  }
  for (let j = lo; j < hi; j++) {
    if (!P.revealed.has(j) || P.refNorms[j] === norm) continue;
    const r = restOf(P.refLines[j], before, lang);
    if (!r) continue;
    let parts = interleave(r.rest, after, lang);
    // e.g. "{}" closed by the editor on a line that ends with "{": the hint goes at the cursor
    if (!parts && /^[\s)\]}"']*$/.test(after)) parts = r.rest ? [{ at: 0, text: r.rest }] : [];
    if (!parts) continue;
    return { line, kind: 'line', parts, full: P.refLines[j], more: following(j), dedent: r.dedent };
  }
  return null;
}

// Monaco part.
export function createGhost(monaco, editor) {
  let spec = null; // { ref, template, lang, stage, stages }
  let plan = null;
  let sug = null; // the hint at the cursor
  let lastSug = null;
  let dismissed = null; // Esc: { line, version }
  let zoneId = null;
  let zoneKey = '';
  const decos = editor.createDecorationsCollection();
  const canTab = editor.createContextKey('informaturaGhostTab', false);
  const shown = editor.createContextKey('informaturaGhostShown', false);
  const lines = (text) => text.replace(/\r/g, '').split('\n');
  // the editor's own word suggestions would cover the hint
  const ownSuggest = { quickSuggestions: editor.getRawOptions().quickSuggestions ?? true, suggestOnTriggerCharacters: editor.getRawOptions().suggestOnTriggerCharacters ?? true };
  let active = false;
  // while hints are shown: no word suggestions, and a margin for the bulbs
  function hintsMode(on) {
    if (active === on) return;
    active = on;
    editor.updateOptions(on ? { quickSuggestions: false, suggestOnTriggerCharacters: false, glyphMargin: true } : { ...ownSuggest, glyphMargin: false });
  }

  function fontStyle(el) {
    const f = editor.getOption(monaco.editor.EditorOption.fontInfo);
    el.style.fontFamily = f.fontFamily;
    el.style.fontSize = f.fontSize + 'px';
    el.style.lineHeight = f.lineHeight + 'px';
  }

  // the hinted lines under the cursor line; only redrawn when they change, so typing the line
  // doesn't move the code below
  function setZone(after, more) {
    const key = more.length ? after + '\n' + more.join('\n') : '';
    if (key === zoneKey) return;
    zoneKey = key;
    editor.changeViewZones((acc) => {
      if (zoneId) acc.removeZone(zoneId);
      zoneId = null;
      if (!more.length) return;
      const dom = document.createElement('div');
      dom.className = 'ghost-zone';
      fontStyle(dom);
      for (const l of more) {
        const div = document.createElement('div');
        div.textContent = l || ' ';
        dom.appendChild(div);
      }
      zoneId = acc.addZone({ afterLineNumber: after, heightInLines: more.length, domNode: dom, suppressMouseDown: true });
    });
  }

  function render() {
    const model = editor.getModel();
    plan = null;
    sug = null;
    hintsMode(!!spec?.stage);
    if (!spec || !model || !spec.stage) {
      lastSug = null;
      decos.clear();
      setZone(0, []);
      updateKeys();
      return;
    }
    const args = { user: model.getLinesContent(), ref: lines(spec.ref), template: lines(spec.template), stage: spec.stage, stages: spec.stages, lang: spec.lang };
    plan = planGhost(args);
    const pos = editor.getPosition();
    if (pos && !(dismissed && dismissed.line === pos.lineNumber && dismissed.version === model.getAlternativeVersionId())) {
      dismissed = null;
      sug = suggestAt({ ...args, line: pos.lineNumber, column: pos.column });
      // a typo in the hinted line: keep showing the lines that follow, so nothing jumps
      if (!sug && lastSug?.kind === 'line' && lastSug.line === pos.lineNumber && model.getLineContent(pos.lineNumber).trim()) sug = { ...lastSug, parts: [], dedent: false, stale: true };
    }
    lastSug = sug;

    const list = [];
    for (const spot of plan.spots) {
      list.push({
        range: new monaco.Range(spot.line, 1, spot.line, 1),
        options: { glyphMarginClassName: 'ghost-bulb', glyphMarginHoverMessage: { value: 'Tu czeka podpowiedź – kliknij, żeby ją zobaczyć' } },
      });
    }
    if (sug) {
      const ln = sug.line;
      for (const p of sug.parts) {
        const col = (pos?.column ?? 1) + p.at;
        list.push({
          range: new monaco.Range(ln, col, ln, col),
          options: { after: { content: p.text, inlineClassName: 'ghost-text' }, showIfCollapsed: true, stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges },
        });
      }
      if (sug.dedent) {
        const end = model.getLineMaxColumn(ln);
        list.push({ range: new monaco.Range(ln, end, ln, end), options: { after: { content: '   ← mniejsze wcięcie', inlineClassName: 'ghost-note' }, showIfCollapsed: true, stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges } });
      }
    }
    for (const line of plan.remove) {
      list.push({
        range: new monaco.Range(line, model.getLineFirstNonWhitespaceColumn(line) || 1, line, model.getLineMaxColumn(line)),
        options: { inlineClassName: 'ghost-remove', hoverMessage: { value: 'Tej linijki szablonu przykładowe rozwiązanie nie potrzebuje.' } },
      });
    }
    decos.set(list);
    setZone(sug ? sug.line : 0, sug ? sug.more : []);
    updateKeys();
  }

  function updateKeys() {
    canTab.set(!!sug && !sug.stale && (sug.kind === 'after' ? sug.more.length > 0 : sug.parts.length > 0 || sug.dedent));
    shown.set(!!sug);
  }

  // Tab: the hinted line at the cursor, or the next one after a finished line
  const tabAction = editor.addAction({
    id: 'informatura.acceptGhostLine',
    label: 'Wpisz podpowiedzianą linijkę',
    keybindings: [monaco.KeyCode.Tab],
    precondition: 'informaturaGhostTab && !suggestWidgetVisible',
    run: () => {
      if (!sug || sug.stale) return;
      const model = editor.getModel();
      const ln = sug.line;
      editor.pushUndoStop();
      if (sug.kind === 'after') {
        const end = model.getLineMaxColumn(ln);
        editor.executeEdits('ghost', [{ range: new monaco.Range(ln, end, ln, end), text: model.getEOL() + sug.more[0] }]);
        editor.setPosition({ lineNumber: ln + 1, column: model.getLineMaxColumn(ln + 1) });
      } else {
        editor.executeEdits('ghost', [{ range: new monaco.Range(ln, 1, ln, model.getLineMaxColumn(ln)), text: sug.full }]);
        editor.setPosition({ lineNumber: ln, column: model.getLineMaxColumn(ln) });
      }
      editor.pushUndoStop();
    },
  });
  // Esc: hide the hint until the line changes
  const escAction = editor.addAction({
    id: 'informatura.hideGhost',
    label: 'Ukryj podpowiedź',
    keybindings: [monaco.KeyCode.Escape],
    precondition: 'informaturaGhostShown && !suggestWidgetVisible && !findWidgetVisible',
    run: () => {
      const pos = editor.getPosition();
      if (!pos) return;
      dismissed = { line: pos.lineNumber, version: editor.getModel().getAlternativeVersionId() };
      lastSug = null;
      render();
    },
  });

  // typing changes the text and then the cursor: draw once, before the next paint
  let queued = false;
  const update = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      render();
    });
  };
  // a click on a bulb puts the cursor where its hint is
  const toSpot = (spot) => {
    const model = editor.getModel();
    const ln = Math.min(spot.line, model.getLineCount());
    editor.setPosition({ lineNumber: ln, column: model.getLineMaxColumn(ln) });
    editor.revealLineInCenterIfOutsideViewport(ln);
    editor.focus();
  };
  const subs = [
    editor.onDidChangeModelContent(update),
    editor.onDidChangeCursorPosition(update),
    editor.onDidChangeModel(() => {
      lastSug = null;
      dismissed = null;
      render();
    }),
    editor.onMouseDown((e) => {
      if (e.target.type !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN || !plan) return;
      const spot = plan.spots.find((s) => s.line === e.target.position?.lineNumber);
      if (spot) setTimeout(() => toSpot(spot));
    }),
  ];

  return {
    // spec: { ref, template, lang, stage, stages }; a falsy spec hides the ghost
    set(s) {
      spec = s;
      lastSug = null;
      dismissed = null;
      render();
      return plan;
    },
    // Puts the cursor where the first hint is waiting, so it shows up there.
    focus() {
      const spot = plan?.spots[0];
      if (spot) toSpot(spot);
    },
    plan: () => plan,
    suggestion: () => sug,
    dispose() {
      subs.forEach((x) => x.dispose());
      tabAction.dispose();
      escAction.dispose();
      spec = null;
      render();
    },
  };
}
