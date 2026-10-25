// The lessons' questions: choice (A–D), true/false, a short answer, a program (checked by
// running it on tests), an SQL query (its result against the model query's) and a spreadsheet
// formula (its values against the model formula's).
//
// mode 'quiz': every question has its own "Sprawdź" and shows the explanation right away.
// mode 'test': closed questions are only graded at the end (grade()); programs, queries and
// formulas can still be run and checked while solving, like on a judge.
import { h, btn, icon, clear } from '../ui.js';
import { md, renderWithFields } from '../markdown.js';
import { getSettings, setSettings, onSettings } from '../store.js';
import { LANGS } from '../algo.js';
import { loadMonaco, editorOptions, createEditor } from '../monaco.js';
import { inputOk, choiceOk, tfOk, sqlSame, sheetSame, pointsOf } from './check.js';
import { runCode, runSql, evalFormula, dbSchema } from './run.js';
import { renderLessonText, resultTable, sheetGrid, CODE_LANGS } from './render.js';

const KIND = { choice: 'wybór', tf: 'prawda / fałsz', input: 'krótka odpowiedź', code: 'program', sql: 'zapytanie SQL', sheet: 'formuła w arkuszu' };
const LETTERS = 'ABCDEFGH';

const STARTER = {
  python: '',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  java: 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}\n',
};

// q: the question; opts: { no, mode, saved, onSave, ctx (lesson files/db/sheet), onResult }
export function createQuestion(q, opts) {
  const { mode = 'quiz', ctx = {} } = opts;
  const saved = opts.saved || {};
  const save = () => opts.onSave?.(saved);
  const quiz = mode === 'quiz';
  let disposers = [];

  const status = h('span', { class: 'q-status' });
  const card = h(
    'div',
    { class: `q-card qt-${q.type}` },
    h('div', { class: 'q-head' }, h('span', { class: 'q-no' }, `Pytanie ${opts.no}`), h('span', { class: 'q-kind' }, KIND[q.type]), h('span', { class: 'q-pts' }, `${pointsOf(q)} pkt`), h('div', { class: 'grow' }), status),
  );
  const body = h('div', { class: 'q-body' });
  const actions = h('div', { class: 'q-actions' });
  const feedback = h('div', { class: 'q-feedback', hidden: true });
  const explain = h('div', { class: 'q-explain', hidden: true });
  card.append(body, actions, feedback, explain);

  const setStatus = (ok) => {
    status.className = 'q-status ' + (ok === true ? 'ok' : ok === false ? 'bad' : '');
    clear(status);
    if (ok === true) status.append(icon('check', 14), ' dobrze');
    else if (ok === false) status.append(icon('x', 14), ' źle');
  };
  const say = (ok, ...msg) => {
    feedback.hidden = false;
    feedback.className = 'q-feedback ' + (ok ? 'ok' : 'bad');
    clear(feedback).append(icon(ok ? 'check' : 'x', 15), ' ', ...msg);
  };
  const showExplain = () => {
    if (!q.explain || !explain.hidden) return;
    explain.hidden = false;
    explain.append(h('div', { class: 'q-explain-head' }, icon('bulb', 14), ' Wyjaśnienie'), renderLessonText(q.explain, ctx));
  };
  // the result of a check; in the quiz a question once answered right stays done
  const record = (ok) => {
    saved.tried = true;
    saved.last = ok;
    if (ok) saved.ok = true;
    save();
    opts.onResult?.(ok);
  };
  if (quiz && saved.ok) setStatus(true);

  const prompt = (src) => renderLessonText(src, ctx);
  let judge = null; // closed questions: () => ok
  let practical = null; // programs/queries/formulas: async () => ok

  // ---- choice ------------------------------------------------------------------------------
  if (q.type === 'choice') {
    const multi = Array.isArray(q.answer);
    saved.value ||= [];
    body.appendChild(prompt(q.q));
    if (multi) body.appendChild(h('div', { class: 'muted small' }, 'Zaznacz wszystkie poprawne odpowiedzi.'));
    const list = h('div', { class: 'choice-list' });
    q.options.forEach((text, i) => {
      const o = h(
        'button',
        {
          class: `opt ${saved.value.includes(i) ? 'selected' : ''}`,
          onclick: () => {
            if (multi) saved.value = saved.value.includes(i) ? saved.value.filter((x) => x !== i) : [...saved.value, i];
            else saved.value = [i];
            list.querySelectorAll('.opt').forEach((x, k) => {
              x.classList.toggle('selected', saved.value.includes(k));
              x.classList.remove('good', 'wrong');
            });
            save();
          },
        },
        h('span', { class: 'opt-letter' }, LETTERS[i] + '.'),
        h('span', { class: 'md', html: md(text) }),
      );
      list.appendChild(o);
    });
    body.appendChild(list);
    judge = () => {
      const ok = choiceOk(saved.value, q.answer);
      const want = multi ? q.answer : [q.answer];
      list.querySelectorAll('.opt').forEach((x, k) => {
        x.classList.toggle('good', want.includes(k) && (ok || !quiz || saved.value.includes(k)));
        x.classList.toggle('wrong', saved.value.includes(k) && !want.includes(k));
      });
      return ok;
    };
  }

  // ---- true / false ------------------------------------------------------------------------
  if (q.type === 'tf') {
    saved.value ||= [];
    body.appendChild(prompt(q.q));
    const rows = q.items.map((it, i) => {
      const cell = (val) =>
        h(
          'button',
          {
            class: `tf-btn ${saved.value[i] === val ? 'active' : ''}`,
            onclick: (e) => {
              saved.value[i] = val;
              const tr = e.target.closest('tr');
              tr.classList.remove('good', 'wrong');
              tr.querySelectorAll('.tf-btn').forEach((b, k) => b.classList.toggle('active', (k === 0) === val));
              save();
            },
          },
          val ? 'P' : 'F',
        );
      return h('tr', null, h('td', { class: 'tf-no' }, `${i + 1}.`), h('td', { class: 'md', html: md(it.text) }), h('td', { class: 'tf-cell' }, cell(true)), h('td', { class: 'tf-cell' }, cell(false)));
    });
    body.appendChild(h('table', { class: 'tf-table' }, h('tbody', null, rows)));
    judge = () => {
      rows.forEach((tr, i) => {
        tr.classList.toggle('good', saved.value[i] === q.items[i].answer);
        tr.classList.toggle('wrong', saved.value[i] !== undefined && saved.value[i] !== q.items[i].answer);
      });
      return tfOk(saved.value, q.items);
    };
  }

  // ---- short answer ------------------------------------------------------------------------
  if (q.type === 'input') {
    // {{id}} boxes in the question, or one box under it
    const multiField = typeof q.answer === 'object' && !Array.isArray(q.answer);
    saved.value ||= {};
    let inputs = {};
    if (multiField) {
      const box = h('div', { class: 'md lesson-md' });
      inputs = renderWithFields(box, q.q, {
        values: saved.value,
        onInput: (id, v) => {
          saved.value[id] = v;
          inputs[id]?.classList.remove('good', 'wrong');
          save();
        },
      });
      body.appendChild(box);
    } else {
      body.appendChild(prompt(q.q));
      const inp = h('input', { class: 'input q-input', placeholder: q.placeholder || 'Twoja odpowiedź', spellcheck: false, autocomplete: 'off' });
      inp.value = saved.value.answer || '';
      inp.addEventListener('input', () => {
        saved.value.answer = inp.value;
        inp.classList.remove('good', 'wrong');
        save();
      });
      inp.addEventListener('keydown', (e) => e.key === 'Enter' && quiz && checkBtn?.click());
      inputs = { answer: inp };
      body.appendChild(inp);
    }
    judge = () => {
      const answers = multiField ? q.answer : { answer: q.answer };
      let all = true;
      for (const [id, acc] of Object.entries(answers)) {
        const ok = inputOk(saved.value[id], acc, { exact: q.exact });
        inputs[id]?.classList.toggle('good', ok);
        inputs[id]?.classList.toggle('wrong', !ok);
        all &&= ok;
      }
      return all;
    };
  }

  // ---- a program ---------------------------------------------------------------------------
  if (q.type === 'code') {
    saved.code ||= {};
    body.appendChild(prompt(q.q));
    const ex = q.tests.slice(0, q.examples ?? 2);
    if (ex.length) body.appendChild(examplesTable(ex));
    const editorBox = h('div', { class: 'q-editor' }, h('div', { class: 'loading-line' }, 'Ładowanie edytora…'));
    const langBar = h(
      'div',
      { class: 'seg small q-langs' },
      CODE_LANGS.map((l) => h('button', { class: 'seg-btn', dataset: { lang: l }, onclick: () => setSettings({ lang: l }) }, LANGS[l].label)),
    );
    body.append(h('div', { class: 'q-editor-head' }, h('span', { class: 'muted small' }, 'Twój program'), h('div', { class: 'grow' }), langBar), editorBox);
    const results = h('div', { class: 'q-results' });
    body.appendChild(results);
    let editor = null;
    let monaco = null;
    let lang = getSettings().lang;
    const starter = (l) => (getSettings().starter === 'empty' ? '' : q.starter?.[l] ?? STARTER[l]);
    const syncBar = () => langBar.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b.dataset.lang === lang));
    syncBar();
    loadMonaco().then((m) => {
      if (disposers === null) return;
      monaco = m;
      clear(editorBox);
      editor = createEditor(monaco, editorBox, editorOptions({ value: saved.code[lang] ?? starter(lang), language: LANGS[lang].monaco, lineNumbersMinChars: 3 }));
      editor.onDidChangeModelContent(() => {
        saved.code[lang] = editor.getValue();
        saved.lastCode = null; // a checked result no longer applies
        save();
      });
      disposers.push(() => editor.dispose());
    });
    disposers.push(
      onSettings((s) => {
        if (s.lang === lang || !CODE_LANGS.includes(s.lang)) return;
        lang = s.lang;
        syncBar();
        if (editor) {
          const old = editor.getModel();
          editor.setModel(monaco.editor.createModel(saved.code[lang] ?? starter(lang), LANGS[lang].monaco));
          old.dispose();
        }
      }),
    );
    const getCode = () => (editor ? editor.getValue() : saved.code[lang] ?? starter(lang));

    const runTests = async (tests, all) => {
      clear(results).appendChild(h('div', { class: 'muted small' }, h('span', { class: 'spin' }), all ? ` Sprawdzanie (${tests.length} testów)…` : ' Uruchamianie przykładów…'));
      const res = await runCode({ lang, code: getCode(), tests, files: ctx.files });
      clear(results);
      if (res.missingToolchain || res.error) {
        results.appendChild(h('div', { class: 'bad-text small' }, res.error || 'Brak kompilatora.', ' ', h('a', { href: '#/settings' }, 'Ustawienia')));
        return null;
      }
      if (res.compileError) {
        results.append(h('div', { class: 'bad-text small' }, 'Błąd kompilacji:'), h('pre', { class: 'stderr-block' }, res.compileError.trim()));
        return false;
      }
      results.appendChild(testsTable(tests, res.results, all ? ex.length : tests.length));
      return res.results.every((r) => r.ok);
    };
    actions.appendChild(btn('Uruchom przykłady', { icon: 'play', onClick: () => ex.length && runTests(ex, false) }));
    practical = async () => {
      const ok = await runTests(q.tests, true);
      if (ok === null) return null;
      saved.lastCode = getCode();
      return ok;
    };
  }

  // ---- an SQL query --------------------------------------------------------------------------
  if (q.type === 'sql') {
    const db = q.db || ctx.db;
    body.appendChild(prompt(q.q));
    const tables = h('details', { class: 'q-tables' }, h('summary', null, 'Tabele w bazie'));
    tables.addEventListener('toggle', async () => {
      if (!tables.open || tables.dataset.done) return;
      tables.dataset.done = '1';
      for (const t of await dbSchema(db)) tables.appendChild(h('div', { class: 'small' }, h('b', null, t.name), ': ', t.columns.map((c) => c.name).join(', ')));
    });
    const editorBox = h('div', { class: 'q-editor sql' }, h('div', { class: 'loading-line' }, 'Ładowanie edytora…'));
    const results = h('div', { class: 'q-results' });
    body.append(tables, editorBox, results);
    let editor = null;
    loadMonaco().then((monaco) => {
      if (disposers === null) return;
      clear(editorBox);
      editor = createEditor(monaco, editorBox, editorOptions({ value: saved.value ?? '', language: 'sql', tabSize: 2, lineNumbersMinChars: 3 }));
      editor.onDidChangeModelContent(() => {
        saved.value = editor.getValue();
        save();
      });
      disposers.push(() => editor.dispose());
    });
    const query = () => (editor ? editor.getValue() : saved.value || '');
    actions.appendChild(
      btn('Wykonaj', {
        icon: 'play',
        onClick: async () => {
          const r = await runSql(db, query());
          clear(results).appendChild(r.error ? h('div', { class: 'bad-text small' }, r.error) : resultTable(r.result, 15));
        },
      }),
    );
    practical = async () => {
      const [mine, model] = await Promise.all([runSql(db, query()), runSql(db, q.solution)]);
      clear(results);
      if (mine.error) {
        results.appendChild(h('div', { class: 'bad-text small' }, mine.error));
        return false;
      }
      results.appendChild(resultTable(mine.result, 15));
      const cmp = sqlSame(mine.result, model.result, { ordered: q.ordered });
      if (!cmp.ok) results.appendChild(h('div', { class: 'bad-text small' }, cmp.why));
      return cmp.ok;
    };
  }

  // ---- a spreadsheet formula -------------------------------------------------------------------
  if (q.type === 'sheet') {
    const data = q.data || ctx.sheet?.data || [];
    body.appendChild(prompt(q.q));
    body.appendChild(sheetGrid(data, q.rows || 0));
    const inp = h('input', { class: 'input q-formula mono', placeholder: `${q.cell}: wpisz formułę, np. =SUMA(B2:B5)`, spellcheck: false, autocomplete: 'off' });
    inp.value = saved.value || '';
    inp.addEventListener('input', () => {
      saved.value = inp.value;
      save();
    });
    inp.addEventListener('keydown', (e) => e.key === 'Enter' && checkBtn?.click());
    const results = h('div', { class: 'q-results' });
    body.append(h('div', { class: 'q-formula-row' }, h('span', { class: 'q-cell' }, q.cell), inp), q.fill ? h('div', { class: 'muted small' }, `Formuła zostanie skopiowana do komórek ${q.fill} (jak przeciągnięcie uchwytu wypełniania).`) : null, results);
    practical = async () => {
      const f = inp.value.trim();
      clear(results);
      if (!f.startsWith('=')) {
        results.appendChild(h('div', { class: 'bad-text small' }, 'Formuła zaczyna się od znaku „=”.'));
        return false;
      }
      const lang = getSettings().sheetLang === 'en' ? 'en' : 'pl';
      const [mine, model] = await Promise.all([evalFormula({ data, formula: f, cell: q.cell, fill: q.fill, lang }), evalFormula({ data, formula: q.solution, cell: q.cell, fill: q.fill, lang: 'pl' })]);
      if (mine.error) {
        results.appendChild(h('div', { class: 'bad-text small' }, mine.error));
        return false;
      }
      const show = (v) => (v && typeof v === 'object' ? v.value || '#BŁĄD' : typeof v === 'number' ? String(Math.round(v * 1e4) / 1e4).replace('.', ',') : String(v ?? ''));
      const ok = sheetSame(mine.values, model.values);
      if (mine.values.length === 1) results.appendChild(h('div', { class: 'small' }, `Wynik formuły: `, h('b', null, show(mine.values[0]))));
      else {
        const bad = mine.values.map((v, i) => i).filter((i) => !sheetSame([mine.values[i]], [model.values[i]]));
        results.appendChild(h('div', { class: 'small' }, `Wyniki w ${q.fill}: `, mine.values.slice(0, 8).map(show).join('; ') + (mine.values.length > 8 ? '; …' : '')));
        if (bad.length) results.appendChild(h('div', { class: 'bad-text small' }, `Nie zgadza się w ${bad.length} z ${mine.values.length} komórek.`));
      }
      return ok;
    };
  }

  // ---- buttons ----------------------------------------------------------------------------------
  let checkBtn = null;
  const solutionBtn = q.solution && (q.type === 'code' || q.type === 'sql' || q.type === 'sheet') ? btn('Pokaż rozwiązanie', { icon: 'eye', onClick: () => showSolution() }) : null;
  if (solutionBtn) solutionBtn.hidden = !saved.tried;
  const solBox = h('div', { class: 'q-solution', hidden: true });
  card.insertBefore(solBox, explain);
  function showSolution() {
    solBox.hidden = !solBox.hidden;
    if (solBox.hidden || solBox.childElementCount) return;
    if (q.type === 'code') {
      const src = CODE_LANGS.filter((l) => q.solution[l]).map((l) => `~~~${l}\n${q.solution[l].replace(/\n$/, '')}\n~~~`).join('\n');
      solBox.appendChild(renderLessonText(src, ctx));
    } else solBox.appendChild(renderLessonText(`~~~${q.type === 'sql' ? 'sql' : 'excel'}\n${q.solution}\n~~~`, ctx));
  }

  if (practical) {
    checkBtn = btn(quiz ? 'Sprawdź' : 'Sprawdź testami', {
      icon: 'check',
      kind: 'primary',
      onClick: async () => {
        checkBtn.disabled = true;
        try {
          const ok = await practical();
          if (ok === null) return;
          if (quiz) {
            setStatus(ok);
            say(ok, ok ? 'Dobrze!' : 'Jeszcze nie – popraw i sprawdź ponownie.');
            showExplain();
          } else say(ok, ok ? 'Wszystko się zgadza.' : 'Jeszcze nie wszystko się zgadza.');
          record(ok);
          if (solutionBtn) solutionBtn.hidden = false;
        } finally {
          checkBtn.disabled = false;
        }
      },
    });
    actions.prepend(checkBtn);
  } else if (quiz) {
    checkBtn = btn('Sprawdź', {
      icon: 'check',
      kind: 'primary',
      onClick: () => {
        const ok = judge();
        setStatus(ok);
        say(ok, ok ? 'Dobrze!' : 'Nie – spróbuj jeszcze raz albo przeczytaj wyjaśnienie.');
        showExplain();
        record(ok);
      },
    });
    actions.prepend(checkBtn);
  }
  if (solutionBtn) actions.appendChild(solutionBtn);

  return {
    el: card,
    q,
    // test mode: the points of the current answer (programs/queries/formulas are run if they
    // weren't checked since the last change), then the result is shown
    async grade() {
      let ok;
      if (practical) {
        ok = q.type === 'code' && saved.lastCode != null && saved.last !== undefined ? saved.last : await practical();
        ok = !!ok;
      } else ok = judge();
      setStatus(ok);
      showExplain();
      if (solutionBtn) solutionBtn.hidden = false;
      return { ok, points: ok ? pointsOf(q) : 0, max: pointsOf(q) };
    },
    dispose() {
      for (const d of disposers || []) d();
      disposers = null;
    },
  };
}

function examplesTable(tests) {
  return h(
    'table',
    { class: 'tbl q-examples' },
    h('thead', null, h('tr', null, h('th', null, 'Przykład'), h('th', null, 'Wejście'), h('th', null, 'Wynik'))),
    h(
      'tbody',
      null,
      tests.map((t, i) =>
        h(
          'tr',
          null,
          h('td', null, String(i + 1)),
          h('td', null, t.files ? Object.entries(t.files).map(([n, txt]) => h('div', null, h('div', { class: 'muted small' }, n), h('pre', null, clip(txt)))) : null, t.input ? h('pre', null, clip(t.input)) : t.files ? null : h('span', { class: 'muted small' }, '(brak)')),
          h('td', null, h('pre', null, t.output)),
        ),
      ),
    ),
  );
}

const clip = (s) => {
  const lines = String(s).replace(/\n$/, '').split('\n');
  return lines.length > 8 ? lines.slice(0, 8).join('\n') + `\n… (${lines.length} wierszy)` : lines.join('\n');
};

// all tests as small marks, then the details of the first failed one
function testsTable(tests, results, shown) {
  const passed = results.filter((r) => r.ok).length;
  const firstBad = results.findIndex((r) => !r.ok);
  const out = h(
    'div',
    { class: 'q-tests' },
    h('div', { class: `tests-summary ${passed === tests.length ? 'ok' : 'bad'}` }, passed === tests.length ? icon('check') : icon('x'), ` Zaliczone testy: ${passed} / ${tests.length}`),
    h(
      'div',
      { class: 'q-test-marks' },
      results.map((r, i) => h('span', { class: `q-test-mark ${r.ok ? 'ok' : 'bad'}`, title: i < shown ? 'przykład z treści' : 'test ukryty' }, r.ok ? icon('check', 12) : icon('x', 12), ` ${i + 1}`)),
    ),
  );
  if (firstBad >= 0) {
    const t = tests[firstBad];
    const r = results[firstBad];
    const open = firstBad < shown;
    out.appendChild(
      h(
        'div',
        { class: 'q-test-detail' },
        h('div', { class: 'small' }, h('b', null, `Test ${firstBad + 1}`), open ? '' : ' (ukryty – nie pokazujemy jego danych, ale widać, co wypisał Twój program)'),
        open && (t.input || t.files) ? h('div', null, h('div', { class: 'muted small' }, 'Wejście:'), h('pre', null, clip(t.input || Object.entries(t.files).map(([n, x]) => `${n}:\n${x}`).join('\n')))) : null,
        open ? h('div', null, h('div', { class: 'muted small' }, 'Oczekiwany wynik:'), h('pre', null, t.output.trim())) : null,
        h('div', null, h('div', { class: 'muted small' }, 'Twój program wypisał:'), h('pre', null, r.timedOut ? '(program działał za długo i został zatrzymany)' : clip(r.stdout.trim() || '(nic)'))),
        r.stderr && !r.timedOut ? h('pre', { class: 'stderr-block' }, clip(r.stderr.trim())) : null,
      ),
    );
  }
  return out;
}
