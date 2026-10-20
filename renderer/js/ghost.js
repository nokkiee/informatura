// Ghost code for the hints: lines of the model solution drawn faintly in the student's
// editor, right where they belong in the student's own code. Lines the student has already
// written (spacing, quotes and comments don't matter) disappear from the ghost, and Tab
// writes out the line the cursor is on.

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

// How many solution lines each stage reveals.
export function stageCount(stage, stages, total) {
  if (stage <= 0 || !total) return 0;
  if (stage === 1) return 1;
  if (stage >= stages || total <= 2) return total;
  return Math.max(2, Math.ceil(total / 2));
}

// Pure part: where each ghost line goes.
//   user: the editor's lines; ref: the solution's lines; template: the starting code's lines
//   stage / stages: which hint stage is shown (1 = one line … stages = whole solution)
// Returns { inline: {line, text, full} | null, zones: [{after, lines}], remove: [line], missing, total }
export function planGhost({ user, ref, template, stage, stages, lang }) {
  const userNorms = user.map((l) => normLine(l, lang));
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
  const full = count >= own.length;
  const revealed = new Set(own.slice(0, count));

  const match = alignLines(userNorms, refNorms);
  const matchedUser = new Set(match.filter((x) => x >= 0));

  // the lines before the first matched one: put new lines after a leading comment block
  let lead = -1;
  while (lead + 1 < user.length && isCommentOnly(user[lead + 1], lang)) lead++;

  const groups = [];
  let last = -1;
  let seenMatch = false;
  refNorms.forEach((n, j) => {
    if (match[j] >= 0) {
      last = match[j];
      seenMatch = true;
      return;
    }
    if (!revealed.has(j)) return;
    const anchor = seenMatch ? last : lead;
    const g = groups[groups.length - 1];
    if (g && g.anchor === anchor) g.lines.push(refLines[j]);
    else groups.push({ anchor, lines: [refLines[j]] });
  });

  let inline = null;
  const zones = [];
  for (const g of groups) {
    const next = g.anchor + 1; // 0-based index of the line right after the anchor
    let lines = g.lines;
    let after = g.anchor + 1; // 1-based line number the zone goes after
    if (!inline && next < user.length && !matchedUser.has(next)) {
      const typed = user[next];
      const rest = remainderOf(lines[0], typed, lang);
      if (rest !== null && rest !== '') {
        // blank line: show the whole line, indented like the solution
        const text = typed.trim() === '' ? lines[0].slice(Math.min(typed.length, lines[0].length - lines[0].trimStart().length)) : rest;
        inline = { line: next + 1, text, full: lines[0] };
        lines = lines.slice(1);
        after = next + 1;
      }
    }
    if (lines.length) zones.push({ after, lines });
  }

  // with the whole solution shown: template lines the solution doesn't use
  const remove = [];
  if (full && count) {
    const refSet = new Set(refNorms);
    const tmplSet = new Set(templateNorms);
    userNorms.forEach((n, i) => {
      if (n && !matchedUser.has(i) && tmplSet.has(n) && !refSet.has(n)) remove.push(i + 1);
    });
  }
  const missing = groups.reduce((s, g) => s + g.lines.length, 0);
  return { inline, zones, remove, missing, total: own.length };
}

// Monaco part.
export function createGhost(monaco, editor) {
  let spec = null; // { ref, template, lang, stage, stages }
  let zoneIds = [];
  let plan = null;
  const decos = editor.createDecorationsCollection();
  const atGhost = editor.createContextKey('informaturaGhostLine', false);
  let timer = null;

  function fontStyle(el) {
    const f = editor.getOption(monaco.editor.EditorOption.fontInfo);
    el.style.fontFamily = f.fontFamily;
    el.style.fontSize = f.fontSize + 'px';
    el.style.lineHeight = f.lineHeight + 'px';
  }

  function render() {
    const model = editor.getModel();
    editor.changeViewZones((acc) => {
      for (const id of zoneIds) acc.removeZone(id);
      zoneIds = [];
    });
    decos.clear();
    plan = null;
    if (!spec || !model || !spec.stage) {
      updateKey();
      return;
    }
    const lines = (text) => text.replace(/\r/g, '').split('\n');
    plan = planGhost({ user: model.getLinesContent(), ref: lines(spec.ref), template: lines(spec.template), stage: spec.stage, stages: spec.stages, lang: spec.lang });

    editor.changeViewZones((acc) => {
      for (const z of plan.zones) {
        const dom = document.createElement('div');
        dom.className = 'ghost-zone';
        fontStyle(dom);
        for (const l of z.lines) {
          const line = document.createElement('div');
          line.textContent = l || ' ';
          dom.appendChild(line);
        }
        zoneIds.push(acc.addZone({ afterLineNumber: z.after, heightInLines: z.lines.length, domNode: dom, suppressMouseDown: true }));
      }
    });
    const list = [];
    if (plan.inline) {
      const col = model.getLineMaxColumn(plan.inline.line);
      list.push({
        range: new monaco.Range(plan.inline.line, col, plan.inline.line, col),
        options: { after: { content: plan.inline.text, inlineClassName: 'ghost-inline' }, showIfCollapsed: true },
      });
    }
    for (const line of plan.remove) {
      list.push({
        range: new monaco.Range(line, model.getLineFirstNonWhitespaceColumn(line) || 1, line, model.getLineMaxColumn(line)),
        options: { inlineClassName: 'ghost-remove', hoverMessage: { value: 'Tej linijki szablonu przykładowe rozwiązanie nie potrzebuje.' } },
      });
    }
    decos.set(list);
    updateKey();
  }

  function updateKey() {
    const pos = editor.getPosition();
    const model = editor.getModel();
    atGhost.set(!!(plan?.inline && pos && model && pos.lineNumber === plan.inline.line && pos.column === model.getLineMaxColumn(pos.lineNumber)));
  }

  // Tab: write out the ghost line the cursor is on.
  const action = editor.addAction({
    id: 'informatura.acceptGhostLine',
    label: 'Wpisz podpowiedzianą linijkę',
    keybindings: [monaco.KeyCode.Tab],
    precondition: 'informaturaGhostLine && !suggestWidgetVisible',
    run: () => {
      if (!plan?.inline) return;
      const model = editor.getModel();
      const ln = plan.inline.line;
      const text = plan.inline.full;
      editor.pushUndoStop();
      editor.executeEdits('ghost', [{ range: new monaco.Range(ln, 1, ln, model.getLineMaxColumn(ln)), text }]);
      editor.pushUndoStop();
      editor.setPosition({ lineNumber: ln, column: model.getLineMaxColumn(ln) });
    },
  });

  const subs = [
    editor.onDidChangeModelContent(() => {
      clearTimeout(timer);
      timer = setTimeout(render, 60);
    }),
    editor.onDidChangeModel(() => render()),
    editor.onDidChangeCursorPosition(() => updateKey()),
  ];

  return {
    // spec: { ref, template, lang, stage, stages }; a falsy spec hides the ghost
    set(s) {
      spec = s;
      render();
      return plan;
    },
    // Moves the cursor to where the ghost starts, so the student can type (or press Tab).
    focus() {
      if (!plan) return;
      const model = editor.getModel();
      const line = plan.inline?.line ?? plan.zones[0]?.after;
      if (!line) return;
      const ln = Math.max(1, Math.min(line, model.getLineCount()));
      editor.revealLineInCenterIfOutsideViewport(ln);
      if (plan.inline) editor.setPosition({ lineNumber: ln, column: model.getLineMaxColumn(ln) });
      editor.focus();
    },
    plan: () => plan,
    dispose() {
      clearTimeout(timer);
      subs.forEach((s) => s.dispose());
      action.dispose();
      spec = null;
      render();
    },
  };
}
