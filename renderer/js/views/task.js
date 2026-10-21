// The task screen: statement and answer on the left, a workspace (code / spreadsheet /
// SQL) on the right.
import { h, btn, icon, clear, toast, splitter, esc, fmtTime, debounce } from '../ui.js';
import { md, renderWithFields } from '../markdown.js';
import { getTask, examTitle, CATEGORIES, KIND_LABELS, isPractical, autoPoints, fetchData, getHints, fetchSolution } from '../content.js';
import { loadTaskState, saveTaskState, recordResult, getProgress, markSeen, getSession, getSettings } from '../store.js';
import { gradeTask, fieldResults } from '../grading.js';
import { createCodeWorkspace, showPreview } from '../ws/code.js';
import { createSqlWorkspace } from '../ws/sql.js';
import { createSheetWorkspace } from '../ws/sheet.js';
import { navigate, navContext } from '../app.js';

// appendChild for several children, skipping empty ones
const put = (el, ...kids) => kids.forEach((k) => k && el.appendChild(k));

// Tables and figures that are still wider than the pane (it can be dragged quite narrow) are
// shrunk to fit, so nothing in a task needs sideways scrolling and words stay whole.
function fitWide(root) {
  for (const el of root.querySelectorAll('.md table, .md .formula, .md .algo-lines, .md .board-input, .md figure')) {
    if (el.parentElement.closest('table, figure, .formula')) continue;
    el.style.zoom = '';
    const box = el.parentElement;
    const cs = getComputedStyle(box);
    const avail = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (el.offsetWidth > avail + 1) el.style.zoom = String(Math.max(0.5, avail / el.offsetWidth));
  }
}

const TOOL_INFO = {
  code: { label: 'Kod', icon: 'code' },
  sheet: { label: 'Arkusz kalkulacyjny', icon: 'grid' },
  sql: { label: 'Baza danych (SQL)', icon: 'db' },
  scratch: { label: 'Brudnopis (kod)', icon: 'code' },
};

function toolsFor(entry) {
  const { task, group } = entry;
  const hasTables = group.tables && Object.keys(group.tables).length;
  const hasFiles = group.files && group.files.length;
  switch (task.kind) {
    case 'program':
      return ['code', hasFiles && 'sheet'].filter(Boolean);
    case 'sheet':
      return ['sheet', 'code', hasTables && 'sql'].filter(Boolean);
    case 'sql':
      return ['sql', 'sheet', 'code'];
    case 'algorithm':
      return ['code'];
    case 'sqlwrite':
      return ['sql'];
    default:
      return ['scratch'];
  }
}

export async function renderTask(view, { key, from }) {
  const entry = getTask(key);
  if (!entry) {
    view.appendChild(h('div', { class: 'empty' }, 'Nie znaleziono zadania ', key));
    return null;
  }
  const { exam, group, task } = entry;
  const state = await loadTaskState(key);
  const save = () => saveTaskState(key, state);
  markSeen(key);

  const session = from === 'exam' ? await getSession(exam.id) : null;
  const sim = !!(session && session.mode === 'sim' && !session.finishedAt);
  const nav = navContext(entry, from);
  const cleanups = [];

  // ---- top bar ---------------------------------------------------------------------------
  const cat = CATEGORIES[task.cat] || {};
  const timerEl = h('span', { class: 'timer' });
  const top = h(
    'div',
    { class: 'task-top' },
    h('button', { class: 'icon-btn', title: 'Wróć', onclick: () => navigate(nav.back) }, icon('left')),
    h(
      'div',
      { class: 'task-ident' },
      h('span', { class: 'exam-chip', title: exam.symbol }, icon('book', 14), ` ${examTitle(exam)}`, h('span', { class: 'date' }, ' · ' + exam.dateText)),
      h('span', { class: 'task-no' }, `Zadanie ${task.no}`),
      h('span', { class: 'pts' }, `${task.points} pkt`),
      h('span', { class: `cat-tag cat-${task.cat}` }, icon(cat.icon || 'info', 13), ' ', cat.label || task.cat),
    ),
    h('div', { class: 'grow' }),
    sim ? timerEl : null,
    btn('Arkusz PDF', { icon: 'pdf', small: true, title: `Otwórz oryginalny arkusz (strona ${task.page})`, onClick: () => window.api.openPdf(exam.pdf, task.page) }),
    nav.prev ? h('button', { class: 'icon-btn', title: `Poprzednie: ${nav.prevLabel} (Alt+←)`, onclick: () => navigate(nav.prev) }, icon('left')) : null,
    nav.next ? btn(nav.nextLabel, { icon: nav.nextIcon || 'right', small: true, kind: 'primary', title: 'Alt+→', onClick: () => navigate(nav.next) }) : null,
  );

  // exam strip: every task of the exam as a chip
  let strip = null;
  if (from === 'exam') {
    strip = h('div', { class: 'task-strip' });
    for (const g of exam.groups) {
      const chips = g.tasks.map((t) => {
        const k = `${exam.id}/${t.no}`;
        const p = getProgress(k);
        const cls = ['chip', k === key ? 'current' : '', !sim && p && p.status !== 'seen' ? p.status : '', sim && p ? 'seen' : ''].join(' ');
        return h('button', { class: cls, title: `Zadanie ${t.no} (${t.points} pkt)`, onclick: () => navigate(`#/t/${k}?from=exam`) }, t.no);
      });
      strip.appendChild(h('div', { class: 'strip-group' }, chips));
    }
    if (sim) {
      strip.appendChild(h('div', { class: 'grow' }));
      strip.appendChild(btn('Zakończ egzamin', { icon: 'flag', small: true, kind: 'danger', onClick: () => navigate(`#/exam/${exam.id}/summary?finish=1`) }));
    }
  }

  // ---- statement -------------------------------------------------------------------------
  const left = h('section', { class: 'pane-left' });
  const stmt = h('div', { class: 'stmt' });
  left.appendChild(stmt);

  const groupHead = h('h2', { class: 'group-title' }, `Zadanie ${group.no}.`, group.title ? ' ' + group.title : '');
  stmt.appendChild(groupHead);

  if (group.intro) {
    const collapsedKey = `intro-collapsed:${exam.id}/${group.no}`;
    const intro = h('details', { class: 'intro', open: sessionStorage.getItem(collapsedKey) !== '1' });
    intro.appendChild(h('summary', null, 'Treść wspólna zadania ', group.no));
    intro.appendChild(h('div', { class: 'md', html: md(group.intro) }));
    intro.addEventListener('toggle', () => sessionStorage.setItem(collapsedKey, intro.open ? '0' : '1'));
    stmt.appendChild(intro);
  }
  if (group.files?.length) {
    stmt.appendChild(
      h(
        'div',
        { class: 'files-row' },
        h('span', { class: 'muted small' }, 'Pliki z danymi:'),
        group.files.map((f) => h('button', { class: 'file-chip', title: 'Podgląd pliku', onclick: async () => showPreview(f, await fetchData(exam, f)) }, icon('file', 13), f)),
      ),
    );
  }
  if (task.info && group.infos?.[task.info]) {
    const info = group.infos[task.info];
    stmt.appendChild(h('div', { class: 'info-block' }, h('div', { class: 'info-title' }, info.title), h('div', { class: 'md', html: md(info.text) })));
  }

  const card = h('div', { class: 'task-card' });
  card.appendChild(
    h(
      'div',
      { class: 'task-card-head' },
      h('span', null, `Zadanie ${task.no}. (0–${task.points})`),
      h('span', { class: 'kind' }, KIND_LABELS[task.kind] || ''),
      !isPractical(task) && task.kind !== 'algorithm' && task.kind !== 'sqlwrite' ? h('span', { class: 'paper', title: 'Na egzaminie odpowiedź zapisuje się w arkuszu (bez komputera)' }, icon('file', 13), ' w arkuszu') : null,
    ),
  );
  const textEl = h('div', { class: 'task-text md' });
  card.appendChild(textEl);
  stmt.appendChild(card);

  // ---- answer widgets ----------------------------------------------------------------------
  const answer = h('div', { class: 'answer-panel' });
  const resultBox = h('div', { class: 'result-box', hidden: true });
  const solution = h('div', { class: 'solution-panel', hidden: true });
  let fieldInputs = {};

  const showSolution = () => {
    state.revealed = true;
    save();
    clear(solution);
    solution.hidden = false;
    solution.appendChild(h('div', { class: 'sol-title' }, icon('key', 15), ' Rozwiązanie (zasady oceniania CKE)'));
    if (task.solution) solution.appendChild(h('div', { class: 'md sol-body', html: md(task.solution) }));
    if (task.rubric) solution.appendChild(h('details', { class: 'rubric', open: true }, h('summary', null, 'Zasady oceniania'), h('div', { class: 'md', html: md(task.rubric) })));
    solution.appendChild(h('div', { class: 'sol-actions' }, btn('Klucz odpowiedzi (PDF)', { icon: 'pdf', small: true, onClick: () => window.api.openPdf(exam.keyPdf) })));
    renderSelfGrade();
    solution.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  function finish(res, { silent } = {}) {
    if (sim) return;
    const rec = recordResult(key, res);
    refreshStrip();
    if (!silent) {
      if (rec.status === 'correct') toast(`Dobrze! ${res.points} / ${res.max} pkt`, 'ok');
      else if (rec.status === 'partial') toast(`Częściowo: ${res.points} / ${res.max} pkt`, 'warn');
    }
  }

  function refreshStrip() {
    if (!strip) return;
    strip.querySelectorAll('.chip').forEach((c) => {
      const k = `${exam.id}/${c.textContent}`;
      const p = getProgress(k);
      c.classList.remove('correct', 'partial', 'wrong');
      if (p && p.status !== 'seen' && !sim) c.classList.add(p.status);
    });
  }

  function renderResult(r) {
    clear(resultBox);
    resultBox.hidden = false;
    const full = r.points >= r.max;
    resultBox.className = `result-box ${full ? 'ok' : r.points > 0 ? 'partial' : 'bad'}`;
    resultBox.appendChild(h('div', { class: 'result-title' }, full ? icon('check') : icon('x'), ` ${r.points} / ${r.max} pkt`, r.selfPending ? h('span', { class: 'muted small' }, ' (część oceniasz samodzielnie)') : null));
    return resultBox;
  }

  function renderSelfGrade() {
    const selfMax = task.self ? task.self.points : ['open', 'sqlwrite', 'algorithm'].includes(task.kind) ? task.points : 0;
    if (!selfMax || sim) return;
    const old = solution.querySelector('.self-grade');
    old?.remove();
    const label = task.self ? `Część „${task.self.label}” oceń samodzielnie` : task.kind === 'algorithm' ? 'Twój algorytm nie przeszedł testów? Oceń go według zasad oceniania' : 'Oceń swoją odpowiedź według zasad oceniania';
    const box = h('div', { class: 'self-grade' }, h('div', null, icon('check', 14), ' ', label, task.self?.hint ? h('div', { class: 'muted small' }, task.self.hint) : null));
    const row = h('div', { class: 'pts-row' });
    for (let p = 0; p <= selfMax; p++) {
      row.appendChild(
        h(
          'button',
          {
            class: `pts-btn ${state.selfPoints === p ? 'active' : ''}`,
            onclick: () => {
              state.selfPoints = p;
              save();
              row.querySelectorAll('.pts-btn').forEach((b, i) => b.classList.toggle('active', i === p));
              const g = gradeTask(entry, state);
              finish(g, { silent: true });
              toast(`Zapisano: ${g.points} / ${g.max} pkt`, 'info', 1800);
            },
          },
          `${p} pkt`,
        ),
      );
    }
    box.appendChild(row);
    solution.appendChild(box);
  }

  const checkBtn = sim ? null : btn('Sprawdź', { icon: 'check', kind: 'primary', onClick: () => check() });
  const revealBtn = sim ? null : btn('Pokaż rozwiązanie', { icon: 'eye', onClick: () => showSolution() });

  // ---- hints: vague first, then more specific; the last ones write the model solution into
  // the editor as faint text, one line first, then more. None during an exam simulation.
  const ghostTool = ['program', 'algorithm'].includes(task.kind) ? 'code' : ['sql', 'sqlwrite'].includes(task.kind) ? 'sql' : null;
  const hintTexts = sim ? [] : await getHints(exam, task.no);
  const hasModel = !sim && !!ghostTool && (await fetchSolution(exam, task.no, ghostTool === 'sql' ? 'sql' : 'python')) != null;
  const GHOST_STEPS =
    ghostTool === 'sql'
      ? [
          '**Pierwsza linijka zapytania** jest w edytorze SQL – szarym tekstem, w miejscu, w którym powinna się znaleźć. Przepisz ją albo naciśnij **Tab**.',
          'W edytorze widać teraz **całe przykładowe zapytanie**. Linijki, które są już w Twoim zapytaniu, znikają z podpowiedzi, a przekreślone linijki przykładu na start nie są potrzebne.',
        ]
      : [
          '**Pierwsza linijka rozwiązania** jest w edytorze – szarym tekstem, w miejscu, w którym powinna się znaleźć. Przepisz ją albo naciśnij **Tab**.',
          'W edytorze widać teraz **mniej więcej połowę rozwiązania**. Linijki, które są już w Twoim kodzie, znikają z podpowiedzi.',
          'W edytorze widać **całe przykładowe rozwiązanie**. Przekreślone linijki szablonu nie są w nim potrzebne.',
        ];
  const hintLevels = [...hintTexts.map((text) => ({ text })), ...(hasModel ? GHOST_STEPS.map((text, i) => ({ text, ghost: i + 1 })) : [])];
  state.hintLevel = Math.min(state.hintLevel || 0, hintLevels.length);
  const ghostStage = () => hintLevels.slice(0, state.hintLevel).filter((l) => l.ghost).length;
  const hintsBox = h('div', { class: 'hints-box', hidden: true });
  const hintBtn = hintLevels.length ? btn('Podpowiedź', { icon: 'bulb', onClick: () => nextHint() }) : null;

  function renderHints() {
    clear(hintsBox);
    hintsBox.hidden = !state.hintLevel;
    const shown = hintLevels.slice(0, state.hintLevel);
    const lastGhost = shown.map((l) => !!l.ghost).lastIndexOf(true);
    shown.forEach((l, i) => {
      hintsBox.appendChild(
        h(
          'div',
          { class: `hint-card${l.ghost ? ' code' : ''}` },
          h('div', { class: 'hint-head' }, icon('bulb', 14), ` Podpowiedź ${i + 1}`, h('span', { class: 'muted small' }, ` z ${hintLevels.length}`)),
          h('div', { class: 'md', html: md(l.text) }),
          i === lastGhost ? h('div', { class: 'hint-actions' }, btn('Pokaż w edytorze', { icon: ghostTool === 'sql' ? 'db' : 'code', small: true, onClick: () => showGhost(true) })) : null,
        ),
      );
    });
    if (hintBtn) {
      const n = state.hintLevel;
      hintBtn.disabled = n >= hintLevels.length;
      hintBtn.lastChild.textContent = n === 0 ? 'Podpowiedź' : n >= hintLevels.length ? 'Brak kolejnych podpowiedzi' : `Kolejna podpowiedź (${n + 1}/${hintLevels.length})`;
    }
  }

  function nextHint() {
    if (state.hintLevel >= hintLevels.length) return;
    state.hintLevel++;
    save();
    renderHints();
    const level = hintLevels[state.hintLevel - 1];
    if (level.ghost) showGhost(true);
    hintsBox.lastChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Puts the revealed part of the model solution into the editor.
  async function showGhost(focus) {
    if (!ghostTool) return;
    if (focus && currentTool !== ghostTool) showTool(ghostTool);
    const plan = await instances[ghostTool]?.setGhostStage?.(ghostStage(), focus);
    if (focus && plan === null && ghostTool === 'code') {
      toast('Do tego zadania nie ma jeszcze przykładowego rozwiązania w tym języku.', 'warn');
    } else if (focus && plan && !plan.missing) {
      toast('Ta część rozwiązania jest już w Twoim kodzie.', 'ok', 2400);
    }
  }

  // practical tasks: an answer box like the exam's results file
  let answerArea = null;
  const setAnswer = (text, source) => {
    if (!answerArea) return;
    answerArea.value = text.replace(/\s+$/, '');
    state.answer = answerArea.value;
    save();
    answerArea.classList.remove('flash');
    void answerArea.offsetWidth;
    answerArea.classList.add('flash');
    if (source) answerNote.textContent = `Wstawiono ${source}. Możesz ją poprawić przed sprawdzeniem.`;
  };
  const answerNote = h('div', { class: 'muted small' });

  function check() {
    if (task.kind === 'algorithm') {
      toast('Uruchom „Sprawdź testami” w edytorze po prawej.', 'info');
      return;
    }
    const g = gradeTask(entry, state);
    state.checked = true;
    save();
    const box = renderResult(g);
    if (isPractical(task)) {
      for (const p of g.detail.parts) {
        box.appendChild(
          h(
            'div',
            { class: `part ${p.ok ? 'ok' : 'bad'}` },
            p.ok ? icon('check', 14) : icon('x', 14),
            h('span', null, p.label || (g.detail.parts.length > 1 ? 'część odpowiedzi' : 'odpowiedź')),
            h('span', { class: 'part-pts' }, `${p.ok ? p.max : 0}/${p.max}`),
            p.note ? h('span', { class: 'muted small' }, ' – ' + p.note) : null,
          ),
        );
      }
      if (g.detail.extra?.length) box.appendChild(h('div', { class: 'small muted' }, 'Nadmiarowe wiersze: ', h('code', null, g.detail.extra.slice(0, 5).join(' | ') + (g.detail.extra.length > 5 ? ' …' : ''))));
      if (task.self) box.appendChild(h('div', { class: 'small muted' }, `+ ${task.self.points} pkt za „${task.self.label}” – oceń samodzielnie po pokazaniu rozwiązania.`));
    } else if (task.kind === 'fill') {
      const ok = fieldResults(task, state.fields);
      for (const [id, input] of Object.entries(fieldInputs)) {
        input.classList.toggle('good', !!ok[id]);
        input.classList.toggle('wrong', !ok[id]);
      }
      const wrong = Object.values(ok).filter((v) => !v).length;
      if (g.detail.note) box.appendChild(h('div', { class: 'small' }, g.detail.note));
      else box.appendChild(h('div', { class: 'small muted' }, wrong ? `Błędnych pól: ${wrong} z ${Object.keys(ok).length}.` : 'Wszystkie pola poprawne.'));
    } else if (task.kind === 'tf') {
      tfRows.forEach((row, i) => {
        row.classList.toggle('good', g.detail.ok[i]);
        row.classList.toggle('wrong', !g.detail.ok[i]);
      });
    } else if (task.kind === 'choice') {
      choiceBox.querySelectorAll('.opt').forEach((o) => o.classList.toggle('wrong', o.classList.contains('selected') && !task.answer.includes(o.dataset.letter)));
      choiceBox.querySelectorAll('.opt').forEach((o) => o.classList.toggle('good', o.classList.contains('selected') && task.answer.includes(o.dataset.letter)));
    }
    if (g.auto || !g.selfPending) finish(g);
    else finish(g, { silent: true });
  }

  let tfRows = [];
  let choiceBox = null;

  switch (task.kind) {
    case 'fill': {
      state.fields = state.fields || {};
      fieldInputs = renderWithFields(textEl, task.text, {
        values: state.fields,
        disabled: false,
        onInput: (id, v) => {
          state.fields[id] = v;
          fieldInputs[id]?.classList.remove('good', 'wrong');
          save();
        },
      });
      put(answer, h('div', { class: 'answer-actions' }, checkBtn, hintBtn, revealBtn, sim ? h('span', { class: 'muted small' }, 'Odpowiedzi zapisują się automatycznie.') : null));
      break;
    }
    case 'tf': {
      textEl.innerHTML = md(task.text);
      state.tf = state.tf || [];
      const table = h('table', { class: 'tf-table' });
      tfRows = task.statements.map((s, i) => {
        const cell = (val) =>
          h(
            'button',
            {
              class: `tf-btn ${state.tf[i] === val ? 'active' : ''}`,
              onclick: (e) => {
                state.tf[i] = val;
                save();
                const tr = e.target.closest('tr');
                tr.classList.remove('good', 'wrong');
                tr.querySelectorAll('.tf-btn').forEach((b) => b.classList.toggle('active', b.textContent === val));
              },
            },
            val,
          );
        return h('tr', null, h('td', { class: 'tf-no' }, `${i + 1}.`), h('td', { class: 'md', html: md(s) }), h('td', { class: 'tf-cell' }, cell('P')), h('td', { class: 'tf-cell' }, cell('F')));
      });
      table.appendChild(h('tbody', null, tfRows));
      textEl.appendChild(table);
      put(answer, h('div', { class: 'answer-actions' }, checkBtn, hintBtn, revealBtn));
      break;
    }
    case 'choice': {
      textEl.innerHTML = md(task.text);
      choiceBox = h('div', { class: 'choice-list' });
      for (const [letter, text] of task.options) {
        const o = h(
          'button',
          {
            class: `opt ${(state.choice || '').includes(letter) ? 'selected' : ''}`,
            dataset: { letter },
            onclick: () => {
              if (task.multi) {
                const set = new Set(state.choice || '');
                set.has(letter) ? set.delete(letter) : set.add(letter);
                state.choice = [...set].sort().join('');
              } else state.choice = letter;
              save();
              choiceBox.querySelectorAll('.opt').forEach((x) => {
                x.classList.toggle('selected', state.choice.includes(x.dataset.letter));
                x.classList.remove('good', 'wrong');
              });
            },
          },
          h('span', { class: 'opt-letter' }, letter + '.'),
          h('span', { class: 'md', html: md(text) }),
        );
        choiceBox.appendChild(o);
      }
      textEl.appendChild(choiceBox);
      put(answer, h('div', { class: 'answer-actions' }, checkBtn, hintBtn, revealBtn));
      break;
    }
    case 'open': {
      textEl.innerHTML = md(task.text);
      const ta = h('textarea', { class: 'answer-area', rows: 6, placeholder: 'Twoja odpowiedź…', spellcheck: false });
      ta.value = state.text || '';
      ta.addEventListener('input', () => {
        state.text = ta.value;
        save();
      });
      put(answer, h('div', { class: 'answer-label' }, 'Odpowiedź'), ta, h('div', { class: 'answer-actions' }, hintBtn, revealBtn));
      break;
    }
    case 'algorithm': {
      textEl.innerHTML = md(task.text);
      const info = h(
        'div',
        { class: 'algo-info' },
        h('div', { class: 'answer-label' }, icon('flask', 14), ' Sprawdzanie algorytmu'),
        h(
          'p',
          { class: 'small' },
          'Zapisz algorytm w wybranym języku po prawej. Program czyta dane z wejścia i wypisuje wynik – szablon już to robi. „Sprawdź testami” uruchomi go dla przykładów z arkusza i dodatkowych danych testowych.',
        ),
        task.algo.noBuiltins ? h('p', { class: 'small warn-text' }, 'Pamiętaj o ograniczeniach z treści zadania (bez funkcji wbudowanych) – testy tego nie sprawdzą, ale egzaminator tak.') : null,
        h('div', { class: 'tests-status' }),
      );
      put(answer, info);
      put(answer, h('div', { class: 'answer-actions' }, hintBtn, revealBtn));
      renderTestsStatus(info.querySelector('.tests-status'));
      break;
    }
    case 'sqlwrite': {
      textEl.innerHTML = md(task.text);
      put(answer, 
        h(
          'div',
          { class: 'algo-info' },
          h('div', { class: 'answer-label' }, icon('db', 14), ' Zapis zapytania'),
          h(
            'p',
            { class: 'small' },
            'Napisz zapytanie w edytorze SQL po prawej. Dodatkowe tabele z treści zadania są w bazie, ale puste – „Wykonaj” sprawdzi więc składnię i nazwy pól, a poprawność logiczną porównasz z rozwiązaniem.',
          ),
          h('div', { class: 'sql-status' }),
        ),
        h('div', { class: 'answer-actions' }, hintBtn, revealBtn),
      );
      break;
    }
    default: {
      // program / sheet / sql
      textEl.innerHTML = md(task.text);
      answerArea = h('textarea', {
        class: 'answer-area mono',
        rows: 4,
        spellcheck: false,
        placeholder: task.kind === 'program' ? 'Tu trafi wynik Twojego programu (możesz go też wpisać lub poprawić).' : 'Wpisz wynik albo wstaw go z arkusza / zapytania.',
      });
      answerArea.value = state.answer || '';
      answerArea.addEventListener('input', () => {
        state.answer = answerArea.value;
        save();
        resultBox.hidden = true;
      });
      put(answer, 
        h('div', { class: 'answer-label' }, icon('file', 14), ' Odpowiedź', h('span', { class: 'muted small' }, ` – jak w pliku wyniki${group.no}.txt`)),
        answerArea,
        task.answerHint ? h('div', { class: 'muted small hint' }, task.answerHint) : null,
        answerNote,
        h('div', { class: 'answer-actions' }, checkBtn, hintBtn, revealBtn, sim ? h('span', { class: 'muted small' }, 'Odpowiedź zapisuje się automatycznie; wynik zobaczysz po zakończeniu egzaminu.') : null),
      );
    }
  }
  stmt.appendChild(hintsBox);
  stmt.appendChild(answer);
  stmt.appendChild(resultBox);
  stmt.appendChild(solution);
  renderHints();
  if (state.revealed && !sim) showSolution();

  function renderTestsStatus(el) {
    if (!el) return;
    clear(el);
    const t = state.tests;
    if (!t) return;
    const ok = t.total && t.passed === t.total;
    el.appendChild(h('div', { class: `tests-summary ${ok ? 'ok' : 'bad'}` }, ok ? icon('check') : icon('x'), ` Ostatnio: ${t.passed} / ${t.total} testów (${LANG_NAMES[t.lang] || t.lang})`));
  }

  // ---- workspace ---------------------------------------------------------------------------
  const tools = toolsFor(entry);
  const right = h('section', { class: 'pane-right' });
  const wsTabs = h('div', { class: 'ws-tabs' });
  const wsHost = h('div', { class: 'ws-host' });
  right.appendChild(wsTabs);
  right.appendChild(wsHost);
  const instances = {};
  const hosts = {};
  let currentTool = null;

  const prevSibling = group.tasks[group.tasks.indexOf(task) - 1];
  let previousCode = null;
  if (prevSibling && ['program', 'sheet', 'sql'].includes(prevSibling.kind)) {
    const ps = await loadTaskState(`${exam.id}/${prevSibling.no}`);
    if (ps.code && Object.keys(ps.code).length) previousCode = { no: prevSibling.no, code: ps.code };
  }

  const wsKey = `${exam.id}-zad${group.no}`;
  function makeWorkspace(tool, host) {
    const common = { entry, state, save, wsKey, focus: true, onOutput: (text, source) => setAnswer(text, source) };
    if (tool === ghostTool && hasModel) {
      common.solutionFor = (lang) => fetchSolution(exam, task.no, lang);
      common.ghostStage = ghostStage();
    }
    if (tool === 'code') {
      if (task.kind === 'algorithm') {
        return createCodeWorkspace(host, {
          ...common,
          mode: 'algo',
          onTests: (t) => {
            state.tests = { ...t, lang: instances.code?.getLang?.() || getSettings().lang, at: Date.now() };
            save();
            renderTestsStatus(stmt.querySelector('.tests-status'));
            if (!sim) {
              if (t.total && t.passed === t.total) finish({ points: task.points, max: task.points });
              else finish({ points: state.selfPoints ?? 0, max: task.points }, { silent: true });
            }
          },
        });
      }
      return createCodeWorkspace(host, { ...common, mode: 'data', previousCode });
    }
    if (tool === 'scratch') return createCodeWorkspace(host, { ...common, entry: { ...entry, group: { ...group, files: [] } }, mode: 'scratch', onOutput: null });
    if (tool === 'sql') {
      return createSqlWorkspace(host, {
        ...common,
        extraTables: task.extraTables,
        extraColumns: task.extraColumns,
        onOutput: task.kind === 'sqlwrite' ? null : common.onOutput,
        onSqlResult: (r) => {
          const el = stmt.querySelector('.sql-status');
          if (!el) return;
          clear(el).appendChild(
            r.ok
              ? h('div', { class: 'tests-summary ok' }, icon('check'), ' Zapytanie wykonało się bez błędów.')
              : h('div', { class: 'tests-summary bad' }, icon('x'), ' Zapytanie zawiera błąd – zobacz komunikat pod edytorem.'),
          );
        },
      });
    }
    if (tool === 'sheet') return createSheetWorkspace(host, { ...common, chart: !!task.chart });
    return null;
  }

  function showTool(tool) {
    currentTool = tool;
    state.tool = tool;
    save();
    for (const [t, el] of Object.entries(hosts)) el.hidden = t !== tool;
    if (!hosts[tool]) {
      hosts[tool] = h('div', { class: 'ws-instance' });
      wsHost.appendChild(hosts[tool]);
      instances[tool] = makeWorkspace(tool, hosts[tool]);
    }
    wsTabs.querySelectorAll('.wtab').forEach((b) => b.classList.toggle('active', b.dataset.tool === tool));
  }

  const scratchOnly = tools.length === 1 && tools[0] === 'scratch';
  for (const t of tools) {
    wsTabs.appendChild(h('button', { class: 'wtab', dataset: { tool: t }, onclick: () => showTool(t) }, icon(TOOL_INFO[t].icon, 14), TOOL_INFO[t].label));
  }
  wsTabs.appendChild(h('div', { class: 'grow' }));
  if (scratchOnly) wsTabs.appendChild(h('button', { class: 'icon-btn small', title: 'Ukryj brudnopis', onclick: () => toggleScratch(false) }, icon('x', 14)));

  const split = h('div', { class: 'vsplit' });
  const page = h('div', { class: 'task-split' }, left, split, right);
  const root = h('div', { class: 'task-page' }, top, strip, page);
  view.appendChild(root);

  const savedWidth = Number(localStorage.getItem('leftPaneWidth')) || 0;
  if (savedWidth) left.style.width = savedWidth + 'px';
  splitter(split, {
    min: 320,
    max: () => page.getBoundingClientRect().width - 380,
    onResize: (w) => {
      left.style.width = w + 'px';
      localStorage.setItem('leftPaneWidth', String(Math.round(w)));
    },
  });

  function toggleScratch(on) {
    page.classList.toggle('no-ws', !on);
    state.scratchOpen = on;
    save();
    if (on && !currentTool) showTool('scratch');
    scratchBtn.hidden = on;
  }
  const scratchBtn = btn('Brudnopis', { icon: 'code', small: true, title: 'Otwórz edytor kodu, w którym możesz coś policzyć', onClick: () => toggleScratch(true) });
  if (scratchOnly) {
    top.insertBefore(scratchBtn, top.querySelector('.btn'));
    toggleScratch(!!state.scratchOpen);
  } else {
    showTool(tools.includes(state.tool) ? state.tool : tools[0]);
  }

  // ---- simulation timer ----------------------------------------------------------------------
  if (sim) {
    const end = session.startedAt + session.duration * 60000;
    const tick = () => {
      const left = (end - Date.now()) / 1000;
      timerEl.textContent = '';
      timerEl.appendChild(icon('clock', 14));
      timerEl.appendChild(document.createTextNode(' ' + fmtTime(left)));
      timerEl.classList.toggle('low', left < 600);
      if (left <= 0) {
        clearInterval(iv);
        toast('Czas minął! Egzamin zakończony.', 'warn', 5000);
        navigate(`#/exam/${exam.id}/summary?finish=1`);
      }
    };
    const iv = setInterval(tick, 1000);
    tick();
    cleanups.push(() => clearInterval(iv));
  }

  const onKey = (e) => {
    if (e.altKey && e.key === 'ArrowRight' && nav.next) navigate(nav.next);
    if (e.altKey && e.key === 'ArrowLeft' && nav.prev) navigate(nav.prev);
  };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));

  // refit when the pane is resized or hints / the solution appear
  let fitQueued = false;
  const fitObserver = new ResizeObserver(() => {
    if (fitQueued) return;
    fitQueued = true;
    requestAnimationFrame(() => {
      fitQueued = false;
      fitWide(stmt);
    });
  });
  fitObserver.observe(stmt);
  cleanups.push(() => fitObserver.disconnect());

  left.scrollTop = 0;
  return {
    destroy() {
      for (const c of cleanups) c();
      for (const inst of Object.values(instances)) inst?.destroy?.();
    },
  };
}

const LANG_NAMES = { python: 'Python', cpp: 'C++', java: 'Java' };
