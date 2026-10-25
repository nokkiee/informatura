// "Lekcje": every matura section explained step by step. A lesson is a few steps of text with
// examples, a quiz at the end and links to real exam tasks on its topic; each section ends with
// a test of the whole section.
//   #/learn                   sections
//   #/learn/<section>         the section's lessons and test
//   #/learn/<section>/<id>    a lesson
//   #/learn/<section>/test    the section's test
import { h, btn, icon, clear, toast } from '../ui.js';
import { getLearn, updateLearn, onSettings, getProgress } from '../store.js';
import { getTask, examTitle } from '../content.js';
import { renderLessonText, syncLangs } from '../learn/render.js';
import { createQuestion } from '../learn/questions.js';
import { pointsOf, plural } from '../learn/check.js';

const PASS = 0.7; // a section test is passed at 70%

let sectionsPromise = null;
const loadSections = () => (sectionsPromise ||= import('../../content/lessons/index.js').then((m) => m.default));
const lessons = new Map();
function loadLesson(section, id) {
  const key = `${section}/${id}`;
  if (!lessons.has(key))
    lessons.set(
      key,
      import(`../../content/lessons/${section}/${id}.js`)
        .then((m) => ({ ...m.default, id, section }))
        .catch((e) => {
          console.warn('lesson', key, e);
          return null;
        }),
    );
  return lessons.get(key);
}
const loadSectionLessons = (s) => Promise.all(s.lessons.map((id) => loadLesson(s.id, id)));

// ---- progress --------------------------------------------------------------------------------

const lessonState = (learn, id) => learn.lessons[id] || { step: 0, seen: [], q: {} };
const okCount = (lesson, st) => lesson.quiz.filter((_, i) => st.q?.[i]?.ok).length;
const isDone = (lesson, st) => lesson.quiz.length > 0 && okCount(lesson, st) === lesson.quiz.length;

function breadcrumb(...items) {
  return h(
    'div',
    { class: 'crumbs' },
    items.map((it, i) => [i ? h('span', { class: 'crumb-sep' }, icon('right', 12)) : null, it.href ? h('a', { href: it.href }, it.label) : h('span', null, it.label)]),
  );
}

export async function renderLearn(view, parts) {
  const [sectionId, lessonId] = parts;
  const sections = await loadSections();
  const learn = await getLearn();
  if (!sectionId) return renderOverview(view, sections, learn);
  const section = sections.find((s) => s.id === sectionId);
  if (!section) return view.appendChild(h('div', { class: 'empty' }, 'Nie ma takiego działu.'));
  if (!lessonId) return renderSection(view, section, learn);
  if (lessonId === 'test') return renderTest(view, section, learn);
  return renderLesson(view, section, lessonId, learn);
}

// ---- all sections ---------------------------------------------------------------------------------

async function renderOverview(view, sections, learn) {
  const all = await Promise.all(sections.map(loadSectionLessons));
  let doneTotal = 0;
  let total = 0;
  let next = null;
  const cards = sections.map((s, k) => {
    const list = all[k].filter(Boolean);
    const done = list.filter((l) => isDone(l, lessonState(learn, l.id))).length;
    doneTotal += done;
    total += list.length;
    if (!next) {
      const l = list.find((x) => !isDone(x, lessonState(learn, x.id)));
      if (l) next = l;
    }
    const t = learn.tests[s.id];
    return h(
      'button',
      { class: `learn-card cat-${s.id === 'algorytmy' ? 'algorytmy' : s.id}`, onclick: () => (location.hash = `#/learn/${s.id}`) },
      h('div', { class: 'learn-card-head' }, h('span', { class: 'learn-card-icon' }, icon(s.icon, 20)), h('b', null, s.title)),
      h('p', { class: 'small muted' }, s.desc),
      h('div', { class: 'bar' }, h('div', { class: 'bar-fill', style: { width: list.length ? (100 * done) / list.length + '%' : '0' } })),
      h(
        'div',
        { class: 'learn-card-foot small' },
        h('span', null, `${done} / ${list.length} ${plural(list.length, 'lekcja', 'lekcje', 'lekcji')}`),
        h('span', { class: t?.best >= PASS ? 'ok-text' : 'muted' }, t ? `Test: ${Math.round(t.best * 100)}%` : 'Test: jeszcze nie'),
      ),
    );
  });
  view.appendChild(
    h(
      'div',
      { class: 'page learn' },
      h(
        'section',
        { class: 'learn-hero' },
        h(
          'div',
          null,
          h('h1', null, 'Lekcje'),
          h(
            'p',
            { class: 'lead' },
            'Każdy dział matury z informatyki wyjaśniony krok po kroku: do czego służy dane narzędzie, kiedy po nie sięgnąć i jak użyć go w zadaniu. Przykłady uruchomisz od razu w lekcji. Na końcu każdej lekcji sprawdzisz się w krótkim teście, a na końcu działu – w teście z całego działu. Są w nich pytania zamknięte i zadania praktyczne: piszesz program, zapytanie SQL albo formułę, a program od razu je sprawdza.',
          ),
          h('div', { class: 'hero-stats' }, stat(doneTotal, 'ukończonych lekcji', `z ${total}`), stat(sections.filter((s) => learn.tests[s.id]?.best >= PASS).length, 'zdanych testów działów', `z ${sections.length}`)),
        ),
        next
          ? h(
              'div',
              { class: 'learn-next' },
              h('div', { class: 'side-label' }, doneTotal ? 'Kontynuuj' : 'Zacznij od'),
              h('div', { class: 'learn-next-title' }, next.title),
              h('div', { class: 'small muted' }, sections.find((s) => s.id === next.section).title),
              btn('Otwórz lekcję', { icon: 'right', kind: 'primary', onClick: () => (location.hash = `#/learn/${next.section}/${next.id}`) }),
            )
          : null,
      ),
      h('section', { class: 'learn-cards' }, cards),
      h('p', { class: 'small muted learn-note' }, 'Lekcje, przykłady i ćwiczenia napisano dla programu. Pod każdą lekcją są linki do prawdziwych zadań z matur na jej temat.'),
    ),
  );
  return null;
}

function stat(n, label, sub) {
  return h('div', { class: 'stat' }, h('div', { class: 'stat-n' }, String(n)), h('div', { class: 'stat-l' }, label), h('div', { class: 'stat-s muted small' }, sub));
}

// ---- one section --------------------------------------------------------------------------------

async function renderSection(view, section, learn) {
  const list = await loadSectionLessons(section);
  const rows = list.map((l, i) => {
    const id = section.lessons[i];
    if (!l) return h('div', { class: 'lesson-row disabled' }, h('span', { class: 'lesson-no' }, String(i + 1)), h('div', null, h('b', null, id), h('div', { class: 'small muted' }, 'Lekcja w przygotowaniu')));
    const st = lessonState(learn, l.id);
    const done = isDone(l, st);
    const ok = okCount(l, st);
    return h(
      'a',
      { class: `lesson-row ${done ? 'done' : ''}`, href: `#/learn/${section.id}/${l.id}` },
      h('span', { class: 'lesson-no' }, done ? icon('check', 16) : String(i + 1)),
      h('div', { class: 'lesson-row-main' }, h('b', null, l.title), h('div', { class: 'small muted' }, l.summary || '')),
      h('div', { class: 'lesson-row-meta small muted' }, h('span', null, icon('clock', 13), ` ${l.minutes} min`), h('span', null, done ? 'ukończona' : st.seen?.length || ok ? `test: ${ok} / ${l.quiz.length}` : `${l.steps.length} kroków`)),
    );
  });
  const t = learn.tests[section.id];
  view.appendChild(
    h(
      'div',
      { class: 'page learn' },
      breadcrumb({ label: 'Lekcje', href: '#/learn' }, { label: section.title }),
      h('div', { class: 'page-head' }, h('span', { class: 'learn-card-icon big' }, icon(section.icon, 24)), h('div', null, h('h1', null, section.title), h('p', { class: 'muted' }, section.desc))),
      h('div', { class: 'lesson-list' }, rows),
      h(
        'a',
        { class: `lesson-row test-row ${t?.best >= PASS ? 'done' : ''}`, href: `#/learn/${section.id}/test` },
        h('span', { class: 'lesson-no' }, icon('flag', 16)),
        h('div', { class: 'lesson-row-main' }, h('b', null, `Test: ${section.title}`), h('div', { class: 'small muted' }, `Pytania z wszystkich lekcji działu. Zaliczenie od ${Math.round(PASS * 100)}%.`)),
        h('div', { class: 'lesson-row-meta small' }, t ? h('span', { class: t.best >= PASS ? 'ok-text' : 'bad-text' }, `najlepszy wynik: ${Math.round(t.best * 100)}%`) : h('span', { class: 'muted' }, 'jeszcze nie rozwiązany')),
      ),
    ),
  );
  return null;
}

// ---- a lesson ------------------------------------------------------------------------------------

async function renderLesson(view, section, lessonId, learn) {
  const lesson = await loadLesson(section.id, lessonId);
  if (!lesson) return view.appendChild(h('div', { class: 'empty' }, 'Nie ma takiej lekcji.'));
  const index = section.lessons.indexOf(lessonId);
  const nextId = section.lessons[index + 1];
  const ctx = { files: lesson.files, db: lesson.db, sheet: lesson.sheet };
  const st = (learn.lessons[lesson.id] ||= { step: 0, seen: [], q: {} });
  const save = () => updateLearn(() => {});
  const QUIZ = lesson.steps.length;
  const PRACTICE = QUIZ + 1;
  let cur = Math.min(st.step || 0, lesson.practice?.length ? PRACTICE : QUIZ);
  let questions = [];

  const side = h('nav', { class: 'lesson-steps' });
  const main = h('div', { class: 'lesson-main' });
  const head = h(
    'div',
    { class: 'lesson-head' },
    breadcrumb({ label: 'Lekcje', href: '#/learn' }, { label: section.title, href: `#/learn/${section.id}` }, { label: `Lekcja ${index + 1}` }),
    h('h1', null, lesson.title),
    h('div', { class: 'small muted' }, icon('clock', 13), ` ok. ${lesson.minutes} min · ${lesson.steps.length} ${plural(lesson.steps.length, 'krok', 'kroki', 'kroków')} · test: ${lesson.quiz.length} ${plural(lesson.quiz.length, 'pytanie', 'pytania', 'pytań')}`),
  );
  const page = h('div', { class: 'page learn lesson' }, head, h('div', { class: 'lesson-grid' }, side, main));
  view.appendChild(page);

  function renderSide() {
    clear(side);
    lesson.steps.forEach((s, i) =>
      side.appendChild(
        h('button', { class: `step-link ${i === cur ? 'current' : ''} ${st.seen.includes(i) ? 'seen' : ''}`, onclick: () => go(i) }, h('span', { class: 'step-no' }, st.seen.includes(i) && i !== cur ? icon('check', 12) : String(i + 1)), h('span', null, s.title)),
      ),
    );
    const ok = okCount(lesson, st);
    side.appendChild(
      h(
        'button',
        { class: `step-link quiz ${cur === QUIZ ? 'current' : ''} ${isDone(lesson, st) ? 'seen' : ''}`, onclick: () => go(QUIZ) },
        h('span', { class: 'step-no' }, icon(isDone(lesson, st) ? 'check' : 'flask', 12)),
        h('span', null, 'Sprawdź się', h('span', { class: 'muted small' }, ` ${ok}/${lesson.quiz.length}`)),
      ),
    );
    if (lesson.practice?.length) {
      side.appendChild(h('button', { class: `step-link ${cur === PRACTICE ? 'current' : ''}`, onclick: () => go(PRACTICE) }, h('span', { class: 'step-no' }, icon('book', 12)), h('span', null, 'Zadania z matur')));
    }
  }

  function disposeQuestions() {
    questions.forEach((q) => q.dispose());
    questions = [];
  }

  function go(i) {
    cur = i;
    st.step = i;
    if (i < QUIZ && !st.seen.includes(i)) st.seen.push(i);
    save();
    disposeQuestions();
    clear(main);
    if (i < QUIZ) showStep(i);
    else if (i === QUIZ) showQuiz();
    else showPractice();
    renderSide();
    view.scrollTop = 0;
  }

  const navRow = (...items) => h('div', { class: 'lesson-nav' }, ...items);
  const nextLessonBtn = () => (nextId ? btn('Następna lekcja', { icon: 'right', kind: 'primary', onClick: () => (location.hash = `#/learn/${section.id}/${nextId}`) }) : btn(`Test: ${section.title}`, { icon: 'flag', kind: 'primary', onClick: () => (location.hash = `#/learn/${section.id}/test`) }));

  function showStep(i) {
    const s = lesson.steps[i];
    if (i === 0 && lesson.intro) main.appendChild(h('div', { class: 'lesson-intro' }, h('div', { class: 'lesson-intro-head' }, icon('flag', 14), ' W tej lekcji'), renderLessonText(lesson.intro, ctx)));
    main.append(h('h2', { class: 'step-title' }, h('span', { class: 'muted' }, `${i + 1}. `), s.title), renderLessonText(s.body, ctx));
    main.appendChild(navRow(i > 0 ? btn('Wstecz', { icon: 'left', onClick: () => go(i - 1) }) : h('span'), h('div', { class: 'grow' }), btn(i + 1 < QUIZ ? `Dalej: ${lesson.steps[i + 1].title}` : 'Sprawdź się', { icon: 'right', kind: 'primary', onClick: () => go(i + 1) })));
  }

  function showQuiz() {
    const done = h('div', { class: 'lesson-done', hidden: !isDone(lesson, st) }, h('div', null, icon('check', 18), h('b', null, ' Lekcja ukończona!'), ' Wszystkie odpowiedzi są dobre.'), h('div', { class: 'grow' }), lesson.practice?.length ? btn('Zadania z matur', { icon: 'book', onClick: () => go(PRACTICE) }) : null, nextLessonBtn());
    main.append(
      h('h2', { class: 'step-title' }, 'Sprawdź się'),
      h('p', { class: 'muted' }, `Odpowiedz na ${lesson.quiz.length} ${plural(lesson.quiz.length, 'pytanie', 'pytania', 'pytań')}. Każde możesz sprawdzać tyle razy, ile chcesz – po sprawdzeniu zobaczysz wyjaśnienie. Lekcja jest ukończona, gdy wszystkie odpowiedzi są dobre.`),
      done,
    );
    st.q ||= {};
    lesson.quiz.forEach((q, i) => {
      const qq = createQuestion(q, {
        no: i + 1,
        mode: 'quiz',
        ctx,
        saved: (st.q[i] ||= {}),
        onSave: save,
        onResult: () => {
          renderSide();
          const was = !done.hidden;
          done.hidden = !isDone(lesson, st);
          if (!was && !done.hidden) {
            toast('Lekcja ukończona!', 'ok');
            done.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        },
      });
      questions.push(qq);
      main.appendChild(qq.el);
    });
    main.appendChild(navRow(btn('Wstecz', { icon: 'left', onClick: () => go(QUIZ - 1) }), h('div', { class: 'grow' }), lesson.practice?.length ? btn('Zadania z matur', { icon: 'right', onClick: () => go(PRACTICE) }) : nextLessonBtn()));
  }

  function showPractice() {
    main.append(
      h('h2', { class: 'step-title' }, 'Zadania z matur'),
      h('p', { class: 'muted' }, 'Prawdziwe zadania z arkuszy CKE, w których przyda się to, czego nauczyła Cię ta lekcja. Otwierają się w zwykłym widoku zadania – z danymi, podpowiedziami i sprawdzaniem.'),
    );
    const list = h('div', { class: 'practice-list' });
    for (const key of lesson.practice) {
      const e = getTask(key);
      if (!e) continue;
      const p = getProgress(key);
      list.appendChild(
        h(
          'a',
          { class: `practice-row ${p?.status || ''}`, href: `#/t/${key}` },
          h('span', { class: 'practice-status' }, p?.status === 'correct' ? icon('check', 14) : icon('right', 14)),
          h('div', null, h('b', null, `${examTitle(e.exam)} · zadanie ${e.task.no}`), e.group.title ? h('span', { class: 'muted' }, ` – ${e.group.title}`) : null, h('div', { class: 'small muted' }, `${e.task.points} pkt` + (p ? ` · Twój wynik: ${p.best ?? p.points} / ${p.max}` : ''))),
        ),
      );
    }
    main.append(list, navRow(btn('Wstecz', { icon: 'left', onClick: () => go(QUIZ) }), h('div', { class: 'grow' }), nextLessonBtn()));
  }

  const unsub = onSettings(() => syncLangs(main));
  go(cur);
  return {
    destroy() {
      unsub();
      disposeQuestions();
    },
  };
}

// ---- the section test ------------------------------------------------------------------------------

async function renderTest(view, section, learn) {
  const test = await import(`../../content/lessons/${section.id}/test.js`).then((m) => m.default).catch(() => null);
  if (!test) return view.appendChild(h('div', { class: 'empty' }, 'Test tego działu jest w przygotowaniu.'));
  const all = await loadSectionLessons(section);
  const lessonById = new Map(all.filter(Boolean).map((l) => [l.id, l]));
  const t = (learn.tests[section.id] ||= {});
  t.answers ||= {};
  const save = () => updateLearn(() => {});
  const ctx = { files: test.files, db: test.db, sheet: test.sheet };
  const max = test.questions.reduce((s, q) => s + pointsOf(q), 0);
  let questions = [];

  const summary = h('div', { class: 'test-summary', hidden: true });
  const body = h('div', { class: 'test-body' });
  const finishBtn = btn('Zakończ test i sprawdź', { icon: 'flag', kind: 'primary', onClick: () => finish() });
  const againBtn = btn('Rozwiąż od nowa', { icon: 'refresh', onClick: () => restart() });
  againBtn.hidden = true;
  view.appendChild(
    h(
      'div',
      { class: 'page learn lesson test' },
      breadcrumb({ label: 'Lekcje', href: '#/learn' }, { label: section.title, href: `#/learn/${section.id}` }, { label: 'Test' }),
      h('h1', null, `Test: ${section.title}`),
      h(
        'p',
        { class: 'muted' },
        `${test.questions.length} ${plural(test.questions.length, 'pytanie', 'pytania', 'pytań')}, razem ${max} pkt. Zaliczenie od ${Math.round(PASS * 100)}%. Odpowiedzi na pytania zamknięte sprawdzisz na końcu („Zakończ test”); programy, zapytania i formuły możesz sprawdzać testami w trakcie, jak na sprawdzarce. ` +
          (t.best != null ? `Twój najlepszy wynik: ${Math.round(t.best * 100)}%.` : ''),
      ),
      summary,
      body,
      h('div', { class: 'lesson-nav' }, h('div', { class: 'grow' }), againBtn, finishBtn),
    ),
  );

  function build() {
    questions.forEach((q) => q.dispose());
    clear(body);
    questions = test.questions.map((q, i) => {
      const qq = createQuestion(q, { no: i + 1, mode: 'test', ctx, saved: (t.answers[i] ||= {}), onSave: save });
      body.appendChild(qq.el);
      return qq;
    });
  }

  async function finish() {
    finishBtn.disabled = true;
    try {
      let got = 0;
      const wrong = new Set();
      for (const q of questions) {
        const r = await q.grade();
        got += r.points;
        if (!r.ok && q.q.lesson) wrong.add(q.q.lesson);
      }
      const score = max ? got / max : 0;
      t.last = score;
      t.best = Math.max(t.best ?? 0, score);
      t.at = Date.now();
      save();
      const passed = score >= PASS;
      clear(summary).append(
        h('div', { class: `test-score ${passed ? 'ok' : 'bad'}` }, h('div', { class: 'test-pct' }, `${Math.round(score * 100)}%`), h('div', null, h('b', null, passed ? 'Test zaliczony!' : 'Jeszcze nie zaliczony'), h('div', { class: 'small' }, `${got} / ${max} pkt · zaliczenie od ${Math.round(PASS * 100)}%`))),
        wrong.size
          ? h(
              'div',
              { class: 'test-revisit' },
              h('div', { class: 'small muted' }, 'Warto powtórzyć:'),
              [...wrong].map((id) => {
                const l = lessonById.get(id);
                return l ? h('a', { class: 'chip', href: `#/learn/${section.id}/${id}` }, l.title) : null;
              }),
            )
          : null,
      );
      summary.hidden = false;
      finishBtn.hidden = true;
      againBtn.hidden = false;
      summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      finishBtn.disabled = false;
    }
  }

  function restart() {
    t.answers = {};
    save();
    summary.hidden = true;
    finishBtn.hidden = false;
    againBtn.hidden = true;
    build();
    view.scrollTop = 0;
  }

  build();
  const unsub = onSettings(() => syncLangs(body));
  return {
    destroy() {
      unsub();
      questions.forEach((q) => q.dispose());
    },
  };
}
