// Ghost code for the hints: lines of the model solution shown in the student's editor, in a
// marked block right where they belong in the student's own code. The block is never mixed into
// a line the student is typing (brackets the editor closes by itself would look doubled); the
// line under the block is where its first line gets typed, and the part already typed there is
// marked in the block. Lines the student has written (spacing, quotes and comments don't
// matter) disappear from the ghost, and Tab writes out the next hinted line.

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

// Pure part: where each ghost line goes.
//   user: the editor's lines; ref: the solution's lines; template: the starting code's lines
//   stage / stages: which hint stage is shown (1 = one line … stages = whole solution)
// Returns { zones: [{after, lines, typing}], remove: [line], missing, total }
//   zones: blocks of hinted lines, each after line `after` (1-based, 0 = above the first line);
//   typing: {line, done} when the line under the block is empty or the beginning of the
//   block's first line – `done` characters of it are typed there
//   remove: template lines the whole solution doesn't use
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

  const zones = groups.map((g) => {
    const next = g.anchor + 1; // 0-based index of the line under the block
    let typing = null;
    if (next < user.length && !matchedUser.has(next)) {
      const done = typedLength(g.lines[0], user[next], lang);
      if (done !== null) typing = { line: next + 1, done };
    }
    return { after: g.anchor + 1, lines: g.lines, typing };
  });

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
  return { zones, remove, missing, total: own.length };
}

// Monaco part.
const BULB =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"/><path d="M10 21.5h4"/><path d="M12 2.5a6.5 6.5 0 0 0-3.9 11.7c.6.5.9 1.2.9 2V16h6v-.1c0-.8.3-1.5.9-2A6.5 6.5 0 0 0 12 2.5z"/></svg>';

export function createGhost(monaco, editor) {
  let spec = null; // { ref, template, lang, stage, stages }
  let zoneIds = [];
  let plan = null;
  const decos = editor.createDecorationsCollection();
  const canTab = editor.createContextKey('informaturaGhostLine', false);
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

    const lineHeight = editor.getOption(monaco.editor.EditorOption.lineHeight);
    editor.changeViewZones((acc) => {
      for (const z of plan.zones) {
        const dom = document.createElement('div');
        dom.className = 'ghost-zone';
        fontStyle(dom);
        z.lines.forEach((l, i) => {
          const line = document.createElement('div');
          const done = i === 0 && z.typing ? z.typing.done : 0;
          if (done) {
            const typed = document.createElement('span');
            typed.className = 'ghost-done';
            typed.textContent = l.slice(0, done);
            line.append(typed, l.slice(done));
          } else line.textContent = l || ' ';
          dom.appendChild(line);
        });
        const margin = document.createElement('div');
        margin.className = 'ghost-margin';
        margin.style.height = z.lines.length * lineHeight + 'px';
        margin.style.setProperty('--ghost-lh', lineHeight + 'px');
        margin.innerHTML = BULB;
        zoneIds.push(acc.addZone({ afterLineNumber: z.after, heightInLines: z.lines.length, domNode: dom, marginDomNode: margin, suppressMouseDown: true }));
      }
    });
    const list = [];
    for (const line of plan.remove) {
      list.push({
        range: new monaco.Range(line, model.getLineFirstNonWhitespaceColumn(line) || 1, line, model.getLineMaxColumn(line)),
        options: { inlineClassName: 'ghost-remove', hoverMessage: { value: 'Tej linijki szablonu przykładowe rozwiązanie nie potrzebuje.' } },
      });
    }
    decos.set(list);
    updateKey();
  }

  // Where Tab writes the next hinted line: into the line under a block (when it's empty or
  // its beginning is typed), or as a new line when the cursor is at the end of the line above.
  function tabTarget() {
    const pos = editor.getPosition();
    const model = editor.getModel();
    if (!plan || !pos || !model) return null;
    for (const z of plan.zones) {
      const atLineAbove = z.after >= 1 ? pos.lineNumber === z.after && pos.column === model.getLineMaxColumn(z.after) : pos.lineNumber === 1 && pos.column === 1;
      if (z.typing && (pos.lineNumber === z.typing.line || atLineAbove)) return { replace: z.typing.line, text: z.lines[0] };
      if (atLineAbove) return { after: z.after, text: z.lines[0] };
    }
    return null;
  }

  function updateKey() {
    canTab.set(!!tabTarget());
  }

  const action = editor.addAction({
    id: 'informatura.acceptGhostLine',
    label: 'Wpisz podpowiedzianą linijkę',
    keybindings: [monaco.KeyCode.Tab],
    precondition: 'informaturaGhostLine && !suggestWidgetVisible',
    run: () => {
      const t = tabTarget();
      if (!t) return;
      const model = editor.getModel();
      const eol = model.getEOL();
      let ln;
      editor.pushUndoStop();
      if (t.replace) {
        ln = t.replace;
        editor.executeEdits('ghost', [{ range: new monaco.Range(ln, 1, ln, model.getLineMaxColumn(ln)), text: t.text }]);
      } else if (t.after === 0) {
        ln = 1;
        editor.executeEdits('ghost', [{ range: new monaco.Range(1, 1, 1, 1), text: t.text + eol }]);
      } else {
        const col = model.getLineMaxColumn(t.after);
        ln = t.after + 1;
        editor.executeEdits('ghost', [{ range: new monaco.Range(t.after, col, t.after, col), text: eol + t.text }]);
      }
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
    // Puts the cursor where the first hinted line gets typed, so Tab writes it right away.
    focus() {
      const z = plan?.zones[0];
      if (!z) return;
      const model = editor.getModel();
      const ln = z.typing ? z.typing.line : Math.max(1, z.after);
      editor.revealLineInCenterIfOutsideViewport(ln);
      editor.setPosition({ lineNumber: ln, column: z.typing || z.after >= 1 ? model.getLineMaxColumn(ln) : 1 });
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
