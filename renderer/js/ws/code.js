// Code workspace: Monaco editor + terminal-like console that runs the program
// with the exam's data files in its working folder.
import { h, btn, icon, clear, toast, modal, splitter, esc } from '../ui.js';
import { loadMonaco, editorOptions } from '../monaco.js';
import { getSettings, setSettings } from '../store.js';
import { LANGS, dataTemplate, scratchTemplate, algoTemplate, buildTests, bannedUses } from '../algo.js';
import { dataSrc, fetchData, examTitle } from '../content.js';
import { checkAnswer, outputMatches, tokenize } from '../check.js';
import { createGhost } from '../ghost.js';

const INSTALL_HINTS = {
  python: 'Zainstaluj Pythona 3 (Linux: sudo apt install python3, Windows: python.org – zaznacz „Add to PATH”).',
  cpp: 'Zainstaluj kompilator C++ (Linux: sudo apt install g++, Windows: MSYS2/MinGW-w64 i dodaj g++ do PATH).',
  java: 'Zainstaluj JDK (Linux: sudo apt install default-jdk, Windows: Adoptium Temurin JDK).',
};

export function createCodeWorkspace(container, ctx) {
  const { entry, state } = ctx;
  const mode = ctx.mode || 'data';
  const task = entry?.task;
  const title = entry ? `${examTitle(entry.exam)}, zadanie ${task.no}` : 'Brudnopis';
  state.code = state.code || {};
  let lang = state.lang || getSettings().lang;
  let editor = null;
  let monaco = null;
  let runId = null;
  let unsub = null;
  let consoleText = '';
  let stdout = '';
  let disposed = false;
  let ghost = null;
  let ghostStage = ctx.ghostStage || 0;

  const mainFile = task?.mainFile || entry?.group.files?.[0];
  const template = (l) => {
    if (mode === 'algo') return algoTemplate(l, task.algo, title);
    if (mode === 'scratch') return scratchTemplate(l);
    return dataTemplate(l, { file: mainFile, title });
  };
  const codeFor = (l) => state.code[l] ?? template(l);

  // ---- toolbar ---------------------------------------------------------------------------
  const langSel = h(
    'select',
    { class: 'lang-select', title: 'Język programowania' },
    Object.entries(LANGS).map(([k, v]) => h('option', { value: k, selected: k === lang }, v.label)),
  );
  langSel.addEventListener('change', () => switchLang(langSel.value));

  const runBtn = btn('Uruchom', { icon: 'play', kind: 'primary', kbd: 'Ctrl+⏎', onClick: () => run() });
  const stopBtn = btn('Stop', { icon: 'stop', kind: 'danger', onClick: () => stop() });
  stopBtn.hidden = true;
  const exampleBtn =
    mode === 'data' && task?.example
      ? btn('Test: dane przykładowe', { icon: 'flask', title: 'Uruchom program na danych przykładowych z arkusza i porównaj wynik z odpowiedzią podaną w treści zadania', onClick: () => runExample() })
      : null;
  const testsBtn = mode === 'algo' ? btn('Sprawdź testami', { icon: 'flask', kind: 'primary', kbd: 'Ctrl+⇧+⏎', onClick: () => runTests() }) : null;
  if (mode === 'algo') {
    runBtn.classList.remove('primary');
  }
  const prevBtn = ctx.previousCode ? btn('Kod z ' + ctx.previousCode.no, { icon: 'copy', small: true, title: `Wstaw kod napisany w zadaniu ${ctx.previousCode.no}`, onClick: () => usePrevious() }) : null;
  const resetBtn = h('button', { class: 'icon-btn', title: 'Przywróć szablon', onclick: () => resetTemplate() }, icon('refresh'));
  const folderBtn = mode === 'data' ? h('button', { class: 'icon-btn', title: 'Otwórz folder roboczy', onclick: () => window.api.openWorkspace(ctx.wsKey) }, icon('folder')) : null;

  const toolbar = h('div', { class: 'ws-toolbar' }, langSel, runBtn, testsBtn, exampleBtn, stopBtn, h('div', { class: 'grow' }), prevBtn, folderBtn, resetBtn);

  // ---- editor + console ------------------------------------------------------------------
  const editorBox = h('div', { class: 'editor-box' }, h('div', { class: 'loading-line' }, 'Ładowanie edytora…'));
  const conBody = h('div', { class: 'console-body', tabindex: '0' });
  const stdinInput = h('input', { class: 'stdin-input', placeholder: 'Wejście programu – Enter wysyła wiersz (Ctrl+D kończy)', spellcheck: false });
  const stdinRow = h('div', { class: 'stdin-row' }, h('span', { class: 'prompt' }, '›'), stdinInput);
  stdinRow.hidden = true;
  const customInput = mode !== 'data' ? h('textarea', { class: 'custom-input', placeholder: 'Dane wejściowe dla „Uruchom” (stdin)…', spellcheck: false, rows: 3 }) : null;
  if (customInput) {
    customInput.value = state.stdin ?? (task?.algo?.examples?.[0] ? task.algo.examples[0].in.map((v) => (Array.isArray(v) ? v.join(' ') : v)).join('\n') : '');
    customInput.addEventListener('input', () => {
      state.stdin = customInput.value;
      ctx.save();
    });
  }
  const filesBody = h('div', { class: 'files-body' });
  const testsBody = h('div', { class: 'tests-body' });

  const tabs = [
    { id: 'console', label: 'Konsola', icon: 'terminal', body: h('div', { class: 'console' }, conBody, stdinRow) },
    mode === 'algo' ? { id: 'tests', label: 'Testy', icon: 'flask', body: testsBody } : null,
    mode !== 'data' ? { id: 'input', label: 'Wejście', icon: 'file', body: h('div', { class: 'input-pane' }, h('p', { class: 'muted small' }, 'To, co wpiszesz tutaj, trafi na standardowe wejście programu po kliknięciu „Uruchom”.'), customInput) } : null,
    mode === 'data' ? { id: 'files', label: 'Pliki', icon: 'folder', body: filesBody } : null,
  ].filter(Boolean);
  let activeTab = tabs[0].id;
  const tabBar = h('div', { class: 'bottom-tabs' });
  const tabArea = h('div', { class: 'bottom-area' });
  function showTab(id) {
    activeTab = id;
    clear(tabBar);
    clear(tabArea);
    for (const t of tabs) {
      tabBar.appendChild(h('button', { class: `btab ${t.id === id ? 'active' : ''}`, onclick: () => showTab(t.id) }, icon(t.icon, 14), t.label));
      if (t.id === id) tabArea.appendChild(t.body);
    }
    tabBar.appendChild(h('div', { class: 'grow' }));
    tabBar.appendChild(h('button', { class: 'icon-btn small', title: 'Wyczyść konsolę', onclick: () => clearConsole() }, icon('trash', 14)));
    if (id === 'files') refreshFiles();
  }

  const bottom = h('div', { class: 'ws-bottom' }, tabBar, tabArea);
  const split = h('div', { class: 'hsplit' });
  const root = h('div', { class: 'ws ws-code' }, toolbar, editorBox, split, bottom);
  clear(container).appendChild(root);
  bottom.style.height = (state.consoleHeight || 230) + 'px';
  splitter(split, {
    vertical: true,
    min: 120,
    max: () => root.getBoundingClientRect().height - 140,
    onResize: (size) => {
      // the splitter sits under the editor; size is the editor height
      const total = root.getBoundingClientRect().height - toolbar.offsetHeight - split.offsetHeight;
      const hb = Math.max(80, total - size);
      bottom.style.height = hb + 'px';
      state.consoleHeight = hb;
    },
  });
  showTab('console');
  writeWelcome();

  // ---- Monaco ----------------------------------------------------------------------------
  loadMonaco().then((m) => {
    if (disposed) return;
    monaco = m;
    clear(editorBox);
    const model = monaco.editor.createModel(codeFor(lang), LANGS[lang].monaco);
    editor = monaco.editor.create(editorBox, editorOptions({ model }));
    editor.onDidChangeModelContent(() => {
      state.code[lang] = editor.getValue();
      ctx.save();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => run());
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter, () => (mode === 'algo' ? runTests() : exampleBtn ? runExample() : run()));
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      ctx.save();
      toast('Zapisano', 'info', 1200);
    });
    ghost = createGhost(monaco, editor);
    applyGhost();
    if (ctx.focus !== false) editor.focus();
  });

  // Hints: the model solution, shown faintly in the editor (stage 1 = one line … 3 = all).
  let ghostSeq = 0;
  async function applyGhost(focus) {
    if (!ghost) return null;
    const seq = ++ghostSeq;
    const l = lang;
    const ref = ghostStage && ctx.solutionFor ? await ctx.solutionFor(l) : null;
    if (!ghost || seq !== ghostSeq) return null;
    if (!ref) {
      ghost.set(null);
      return null;
    }
    const plan = ghost.set({ ref, template: template(l), lang: l, stage: ghostStage, stages: 3 });
    if (focus) ghost.focus();
    return plan;
  }

  function switchLang(l) {
    lang = l;
    state.lang = l;
    ctx.save();
    setSettings({ lang: l });
    if (editor) {
      const old = editor.getModel();
      editor.setModel(monaco.editor.createModel(codeFor(l), LANGS[l].monaco));
      old.dispose();
      applyGhost();
    }
    ctx.onLangChange?.(l);
  }

  function resetTemplate() {
    if (!editor) return;
    editor.pushUndoStop();
    editor.executeEdits('reset', [{ range: editor.getModel().getFullModelRange(), text: template(lang) }]);
    editor.pushUndoStop();
  }

  function usePrevious() {
    const code = ctx.previousCode?.code?.[lang];
    if (!code || !editor) {
      toast(`W zadaniu ${ctx.previousCode?.no} nie ma jeszcze kodu w języku ${LANGS[lang].label}.`, 'warn');
      return;
    }
    editor.pushUndoStop();
    editor.executeEdits('prev', [{ range: editor.getModel().getFullModelRange(), text: code }]);
    editor.pushUndoStop();
  }

  // ---- console ---------------------------------------------------------------------------
  function writeWelcome() {
    clear(conBody);
    consoleText = '';
    const lines = [];
    if (mode === 'data') {
      const files = (entry.group.files || []).map((f) => `<span class="fname">${esc(f)}</span>`).join(' ');
      lines.push(`<div class="con-info">Folder roboczy zawiera pliki z danymi: ${files}</div>`);
      lines.push('<div class="con-info dim">Uruchom program – to, co wypisze na ekran, trafi do pola „Odpowiedź”.</div>');
    } else if (mode === 'algo') {
      lines.push('<div class="con-info">Program czyta dane z wejścia (stdin) i wypisuje wynik. „Sprawdź testami” uruchomi go dla przykładów z arkusza i dodatkowych testów.</div>');
    } else {
      lines.push('<div class="con-info dim">Brudnopis – możesz tu policzyć cokolwiek potrzebujesz.</div>');
    }
    conBody.innerHTML = lines.join('');
  }

  function clearConsole() {
    clear(conBody);
    consoleText = '';
  }

  function conAppend(text, cls) {
    consoleText += text;
    const last = conBody.lastElementChild;
    if (last && last.classList.contains('con-stream') && last.dataset.cls === (cls || '')) {
      last.textContent += text;
    } else {
      const span = h('span', { class: `con-stream ${cls || ''}`, dataset: { cls: cls || '' } }, text);
      conBody.appendChild(span);
    }
    // keep the DOM light for huge outputs
    if (conBody.textContent.length > 300000) {
      while (conBody.firstChild && conBody.textContent.length > 200000) conBody.removeChild(conBody.firstChild);
      conBody.insertBefore(h('div', { class: 'con-info dim' }, '… (początek wyjścia ukryty)'), conBody.firstChild);
    }
    conBody.scrollTop = conBody.scrollHeight;
  }

  function conLine(html, cls = 'con-info') {
    const d = h('div', { class: cls, html });
    conBody.appendChild(d);
    conBody.scrollTop = conBody.scrollHeight;
    return d;
  }

  function cmdLine() {
    const file = lang === 'java' ? 'Main.java' : `zadanie.${LANGS[lang].ext}`;
    const cmd = lang === 'python' ? `python3 ${file}` : lang === 'cpp' ? `g++ ${file} -o zadanie && ./zadanie` : `java ${file}`;
    return `<span class="prompt">$</span> ${esc(cmd)}`;
  }

  // ---- running -----------------------------------------------------------------------------
  function filesSpec(map) {
    const exam = entry.exam;
    const list = (entry.group.files || []).map((f) => ({ name: f, src: dataSrc(exam, f) }));
    if (map) {
      for (const f of list) if (map[f.name]) f.src = dataSrc(exam, map[f.name]);
    }
    return list;
  }

  function setRunning(on) {
    runBtn.hidden = on;
    stopBtn.hidden = !on;
    if (exampleBtn) exampleBtn.disabled = on;
    if (testsBtn) testsBtn.disabled = on;
    stdinRow.hidden = !on || mode !== 'data';
    root.classList.toggle('running', on);
  }

  function startRun({ files, stdin, sandbox, quiet }) {
    return new Promise(async (resolve) => {
      const code = editor ? editor.getValue() : codeFor(lang);
      const t0 = performance.now();
      let out = '';
      let err = '';
      setRunning(true);
      if (!quiet) conLine(cmdLine(), 'con-cmd');
      const statusLine = conLine('<span class="spin"></span> ' + (lang === 'python' ? 'Uruchamianie…' : 'Kompilacja…'), 'con-info dim');
      unsub?.();
      unsub = window.api.onRunEvent((ev) => {
        if (ev.id !== runId) return;
        if (ev.type === 'status' && ev.text === 'run') statusLine.remove();
        else if (ev.type === 'out') {
          out += ev.data;
          if (!quiet) conAppend(ev.data);
        } else if (ev.type === 'err') {
          err += ev.data;
          conAppend(ev.data, 'stderr');
        } else if (ev.type === 'exit') {
          statusLine.remove();
          unsub?.();
          unsub = null;
          runId = null;
          setRunning(false);
          const res = { ...ev, stdout: out, stderr: err, ms: performance.now() - t0 };
          reportExit(res, quiet);
          resolve(res);
        }
      });
      const r = await window.api.run({ taskKey: ctx.wsKey, lang, code, files, stdin, sandbox, timeoutMs: ctx.timeoutMs || 30000 });
      runId = r.id;
    });
  }

  function reportExit(ev, quiet) {
    if (ev.compileError) {
      conLine('Błąd kompilacji:', 'con-err-title');
      conAppend(ev.compileError.trim() + '\n', 'stderr');
      highlightCompileError(ev.compileError);
      return;
    }
    if (ev.missingToolchain) {
      conLine(`<b>${esc(ev.error)}</b><br>${esc(INSTALL_HINTS[lang])}<br>Ścieżkę do kompilatora możesz też wskazać w Ustawieniach.`, 'con-err-title');
      return;
    }
    if (ev.error) {
      conLine(esc(ev.error), 'con-err-title');
      return;
    }
    const secs = ((ev.timeMs ?? ev.ms) / 1000).toFixed(2).replace('.', ',');
    if (ev.timedOut) conLine(`⏱ Przekroczono limit czasu – program został zatrzymany (${secs} s).`, 'con-err-title');
    else if (ev.truncated) conLine('Program wypisał zbyt dużo danych – został zatrzymany.', 'con-err-title');
    else if (ev.killed) conLine('Program zatrzymany.', 'con-info dim');
    else if (!quiet) {
      if (ev.stdout && !ev.stdout.endsWith('\n')) conAppend('\n');
      conLine(`Proces zakończony ${ev.code === 0 ? '' : `z kodem ${ev.code} `}· ${secs} s`, ev.code === 0 ? 'con-done' : 'con-err-title');
    }
  }

  function highlightCompileError(text) {
    if (!editor || !monaco) return;
    const markers = [];
    const re = lang === 'java' ? /\.java:(\d+): error: (.*)/g : /zadanie\.cpp:(\d+):(\d+): error: (.*)/g;
    let m;
    while ((m = re.exec(text))) {
      const line = Number(m[1]);
      const col = lang === 'java' ? 1 : Number(m[2]);
      markers.push({ startLineNumber: line, startColumn: col, endLineNumber: line, endColumn: 1000, message: m[m.length - 1], severity: monaco.MarkerSeverity.Error });
    }
    monaco.editor.setModelMarkers(editor.getModel(), 'compile', markers);
    if (markers[0]) editor.revealLineInCenter(markers[0].startLineNumber);
  }

  async function run() {
    if (runId) return;
    if (monaco && editor) monaco.editor.setModelMarkers(editor.getModel(), 'compile', []);
    showTab('console');
    if (mode === 'data') {
      const res = await startRun({ files: filesSpec(null) });
      if (res.code === 0 && !res.timedOut) {
        stdout = res.stdout;
        let answer = res.stdout;
        let source = 'wyjście programu';
        const written = (res.files || []).filter((f) => !(entry.group.files || []).includes(f));
        if (written.length) {
          conLine(`Program zapisał plik(i): ${written.map((f) => `<a href="#" class="fname" data-f="${esc(f)}">${esc(f)}</a>`).join(' ')}`, 'con-info').querySelectorAll('a').forEach((a) =>
            a.addEventListener('click', (e) => {
              e.preventDefault();
              previewWorkspaceFile(a.dataset.f);
            }),
          );
          if (!answer.trim() && written.length === 1) {
            const f = await window.api.readWorkspaceFile(ctx.wsKey, written[0]);
            answer = f.text;
            source = 'plik ' + written[0];
          }
        }
        if (answer.trim()) ctx.onOutput?.(answer, source);
      }
    } else {
      await startRun({ files: [], stdin: customInput ? customInput.value : '', sandbox: true });
    }
  }

  function stop() {
    if (runId) window.api.kill(runId);
  }

  stdinInput.addEventListener('keydown', (e) => {
    if (!runId) return;
    if (e.key === 'Enter') {
      const v = stdinInput.value;
      conAppend(v + '\n', 'stdin');
      window.api.sendStdin(runId, v + '\n');
      stdinInput.value = '';
    } else if (e.key === 'd' && e.ctrlKey) {
      e.preventDefault();
      window.api.sendStdin(runId, null);
    }
  });

  async function runExample() {
    if (runId) return;
    const ex = task.example;
    showTab('console');
    const mapNote = Object.entries(ex.map || {})
      .map(([to, from]) => `<span class="fname">${esc(from)}</span> → <span class="fname">${esc(to)}</span>`)
      .join(', ');
    conLine(`🧪 Test na danych przykładowych (${mapNote}) – program czyta plik przykładowy pod nazwą pliku z zadania.`, 'con-info');
    const res = await startRun({ files: filesSpec(ex.map), sandbox: true });
    if (res.code !== 0 || res.timedOut || res.compileError || res.error) return;
    let expected = ex.expect;
    if (ex.expectFile) expected = (await fetchData(entry.exam, ex.expectFile)).trim().split(/\r?\n/);
    const r = checkAnswer(res.stdout, Array.isArray(expected) ? { parts: [{ lines: expected, ordered: true, points: 1 }] } : expected, {
      taskNo: task.no,
      siblings: entry.siblings,
      autoPoints: 1,
    });
    const shown = Array.isArray(expected) ? `zawartość pliku ${ex.expectFile}` : String(expected).replace(/\n/g, ' ');
    if (r.ok) conLine(`✔ Wynik zgodny z odpowiedzią podaną w arkuszu dla danych przykładowych (${esc(shown)}).`, 'con-ok');
    else conLine(`✘ Wynik różni się od odpowiedzi dla danych przykładowych. Oczekiwano: <b>${esc(shown)}</b>`, 'con-bad');
  }

  async function runTests() {
    if (runId) return;
    const code = editor ? editor.getValue() : codeFor(lang);
    const tests = buildTests(task.algo, entry.key);
    showTab('tests');
    clear(testsBody).appendChild(h('div', { class: 'con-info dim' }, h('span', { class: 'spin' }), ` Uruchamianie ${tests.length} testów…`));
    setRunning(true);
    stdinRow.hidden = true;
    let res;
    try {
      res = await window.api.runTests({ lang, code, tests: tests.map((t) => ({ input: t.input })), timeoutMs: 4000 });
    } finally {
      setRunning(false);
    }
    clear(testsBody);
    if (res.compileError || res.error) {
      testsBody.appendChild(h('div', { class: 'con-err-title' }, res.compileError ? 'Błąd kompilacji:' : res.error));
      if (res.compileError) {
        testsBody.appendChild(h('pre', { class: 'stderr-block' }, res.compileError));
        highlightCompileError(res.compileError);
      }
      if (res.missingToolchain) testsBody.appendChild(h('div', { class: 'con-info' }, INSTALL_HINTS[lang]));
      ctx.onTests?.({ passed: 0, total: tests.length, error: true });
      return;
    }
    let passed = 0;
    const rows = tests.map((t, i) => {
      const r = res.results[i];
      const ok = !r.timedOut && r.code === 0 && outputMatches(t.expected, r.stdout);
      if (ok) passed++;
      const got = r.timedOut ? '⏱ limit czasu' : r.code !== 0 ? `błąd (kod ${r.code})` : r.stdout.trim();
      return h(
        'tr',
        { class: ok ? 'ok' : 'bad' },
        h('td', null, ok ? icon('check', 14) : icon('x', 14)),
        h('td', null, t.official ? h('span', { class: 'tag' }, 'z arkusza') : String(i + 1)),
        h('td', null, h('code', null, t.input.trim().replace(/\n/g, ' ⏎ '))),
        h('td', null, h('code', null, t.expected)),
        h('td', { title: r.stderr || '' }, h('code', null, got.length > 120 ? got.slice(0, 120) + '…' : got)),
      );
    });
    const all = passed === tests.length;
    const summary = h('div', { class: `tests-summary ${all ? 'ok' : 'bad'}` }, all ? icon('check') : icon('x'), ` Zaliczone testy: ${passed} / ${tests.length}`);
    testsBody.appendChild(summary);
    const banned = task.algo.noBuiltins ? bannedUses(task.algo.noBuiltins, lang, code) : [];
    if (banned.length) {
      testsBody.appendChild(
        h(
          'div',
          { class: 'warn-box' },
          icon('info'),
          ` Uwaga: w treści zadania zabroniono funkcji wbudowanych. W Twoim kodzie: ${banned
            .slice(0, 5)
            .map((b) => `„${b.text}” (wiersz ${b.line})`)
            .join(', ')}. Na maturze takie rozwiązanie może stracić punkty.`,
        ),
      );
    }
    testsBody.appendChild(
      h('table', { class: 'tests-table' }, h('thead', null, h('tr', null, h('th'), h('th', null, 'Test'), h('th', null, 'Wejście'), h('th', null, 'Oczekiwane'), h('th', null, 'Twój wynik'))), h('tbody', null, rows)),
    );
    const firstFail = res.results.find((r) => r.stderr && r.stderr.trim());
    if (firstFail && !all) testsBody.appendChild(h('pre', { class: 'stderr-block' }, firstFail.stderr.trim().slice(0, 2000)));
    ctx.onTests?.({ passed, total: tests.length, banned: banned.length });
  }

  // ---- workspace files -------------------------------------------------------------------
  async function refreshFiles() {
    clear(filesBody);
    const list = await window.api.listWorkspace(ctx.wsKey);
    const dataFiles = new Set(entry.group.files || []);
    const all = [...new Set([...(entry.group.files || []), ...list.map((f) => f.name)])];
    filesBody.appendChild(
      h(
        'div',
        { class: 'file-list' },
        all.map((name) => {
          const info = list.find((f) => f.name === name);
          return h(
            'button',
            { class: 'file-item', onclick: () => (dataFiles.has(name) && !info ? previewData(name) : previewWorkspaceFile(name)) },
            icon('file', 14),
            h('span', { class: 'fname' }, name),
            dataFiles.has(name) ? h('span', { class: 'tag' }, 'dane') : h('span', { class: 'tag out' }, 'utworzony'),
            info ? h('span', { class: 'muted small' }, fmtSize(info.size)) : null,
          );
        }),
      ),
      h('div', { class: 'muted small pad' }, 'Pliki z danymi są kopiowane do folderu roboczego przy każdym uruchomieniu – Twój program może je bezpiecznie czytać.'),
    );
  }

  async function previewData(name) {
    const text = await fetchData(entry.exam, name);
    showPreview(name, text);
  }

  async function previewWorkspaceFile(name) {
    try {
      const f = await window.api.readWorkspaceFile(ctx.wsKey, name);
      const body = showPreview(name, f.text);
      if (!(entry.group.files || []).includes(name)) {
        body.box.querySelector('.modal-body').appendChild(
          btn('Użyj jako odpowiedzi', {
            icon: 'check',
            kind: 'primary',
            onClick: () => {
              ctx.onOutput?.(f.text, 'plik ' + name);
              body.close();
            },
          }),
        );
      }
    } catch (e) {
      previewData(name);
    }
  }

  return {
    destroy() {
      disposed = true;
      unsub?.();
      if (runId) window.api.kill(runId);
      ghost?.dispose();
      ghost = null;
      if (editor) {
        editor.getModel()?.dispose();
        editor.dispose();
      }
    },
    getLang: () => lang,
    getStdout: () => stdout,
    run,
    // Shows hint stage `stage` of the model solution; resolves to the ghost plan (or null
    // when there's no model solution in the current language).
    setGhostStage(stage, focus) {
      ghostStage = stage;
      return applyGhost(focus);
    },
  };
}

function fmtSize(n) {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1).replace('.', ',') + ' KB';
  return (n / 1024 / 1024).toFixed(1).replace('.', ',') + ' MB';
}

export function showPreview(name, text) {
  const lines = text.split(/\r?\n/);
  const max = 2000;
  const shown = lines.slice(0, max);
  const pre = h('pre', { class: 'file-preview' });
  pre.innerHTML = shown.map((l, i) => `<span class="ln">${i + 1}</span>${esc(l).replace(/\t/g, '<span class="tab">→</span>\t')}`).join('\n');
  return modal({
    title: name,
    wide: true,
    body: h(
      'div',
      null,
      h('div', { class: 'muted small' }, `${lines.length - (lines[lines.length - 1] === '' ? 1 : 0)} wierszy${lines.length > max ? ` (pokazano pierwsze ${max})` : ''} · tabulator oznaczony jako →`),
      pre,
    ),
  });
}
