import { h, icon, btn, confirmDialog, fmtTime } from '../ui.js';
import { examTitle, CATEGORIES, KIND_LABELS } from '../content.js';
import { getProgress, getSession, setSession } from '../store.js';
import { navigate } from '../app.js';

export async function renderExam(view, exam) {
  if (!exam) {
    view.appendChild(h('div', { class: 'empty' }, 'Nie znaleziono arkusza.'));
    return null;
  }
  const session = await getSession(exam.id);
  const running = session && session.mode === 'sim' && !session.finishedAt;
  const first = exam.tasks[0].key;

  const startPractice = async () => {
    if (running && !(await confirmDialog('Trwa symulacja egzaminu', 'Przejść do trybu ćwiczeń? Symulacja zostanie przerwana (odpowiedzi zostają).', 'Przerwij symulację'))) return;
    await setSession(exam.id, { mode: 'practice', startedAt: Date.now() });
    navigate(`#/t/${first}?from=exam`);
  };
  const startSim = async () => {
    if (running) return navigate(`#/t/${first}?from=exam`);
    const ok = await confirmDialog(
      'Symulacja egzaminu',
      `Masz ${exam.duration} minut na cały arkusz. Sprawdzanie odpowiedzi i rozwiązania będą ukryte do końca – na końcu zobaczysz wynik punktowy. Zaczynamy?`,
      'Start',
    );
    if (!ok) return;
    await setSession(exam.id, { mode: 'sim', startedAt: Date.now(), duration: exam.duration });
    navigate(`#/t/${first}?from=exam`);
  };

  const head = h(
    'div',
    { class: 'exam-head' },
    h(
      'div',
      null,
      h('div', { class: 'muted small' }, `Egzamin maturalny · Informatyka · poziom rozszerzony · formuła 2023 · ${exam.term}`),
      h('h1', null, examTitle(exam)),
      h('div', { class: 'exam-meta' }, meta('clock', `${exam.dateText}`), meta('flag', `${exam.duration} minut`), meta('check', `${exam.maxPoints} pkt`), meta('file', exam.symbol)),
    ),
    h(
      'div',
      { class: 'exam-actions' },
      running
        ? h('div', { class: 'sim-running' }, icon('clock', 15), ` Symulacja trwa – zostało ${fmtTime((session.startedAt + session.duration * 60000 - Date.now()) / 1000)}`)
        : null,
      btn(running ? 'Wróć do symulacji' : 'Symulacja egzaminu', { icon: 'clock', kind: running ? 'primary' : '', onClick: startSim }),
      btn('Rozwiązuj zadanie po zadaniu', { icon: 'play', kind: running ? '' : 'primary', onClick: startPractice }),
      h('div', { class: 'row' }, btn('Arkusz PDF', { icon: 'pdf', small: true, onClick: () => window.api.openPdf(exam.pdf, 1) }), btn('Zasady oceniania PDF', { icon: 'key', small: true, onClick: () => window.api.openPdf(exam.keyPdf, 1) }), session?.finishedAt ? btn('Ostatni wynik', { icon: 'flag', small: true, onClick: () => navigate(`#/exam/${exam.id}/summary`) }) : null),
    ),
  );

  const list = h('div', { class: 'exam-tasks' });
  let earned = 0;
  for (const g of exam.groups) {
    const rows = g.tasks.map((t) => {
      const key = `${exam.id}/${t.no}`;
      const p = getProgress(key);
      if (p?.best) earned += p.best;
      const status = p && p.status !== 'seen' ? p.status : p ? 'seen' : 'new';
      return h(
        'button',
        { class: `task-row st-${status}`, onclick: () => navigate(`#/t/${key}?from=exam`) },
        h('span', { class: 'tr-no' }, t.no),
        h('span', { class: `cat-tag cat-${t.cat}` }, icon(CATEGORIES[t.cat]?.icon || 'info', 12), ' ', CATEGORIES[t.cat]?.short || t.cat),
        h('span', { class: 'tr-kind muted small' }, KIND_LABELS[t.kind]),
        h('span', { class: 'grow tr-topics muted small' }, (t.topics || []).join(' · ')),
        h('span', { class: 'tr-pts' }, p && p.points != null ? `${p.points} / ${t.points} pkt` : `${t.points} pkt`),
        h('span', { class: 'tr-status' }, status === 'correct' ? icon('check', 14) : status === 'wrong' ? icon('x', 14) : status === 'partial' ? '½' : ''),
      );
    });
    list.appendChild(h('div', { class: 'exam-group' }, h('div', { class: 'eg-title' }, `Zadanie ${g.no}.`, g.title ? ' ' + g.title : '', g.files?.length ? h('span', { class: 'muted small' }, '  ' + g.files.join(', ')) : null), rows));
  }

  view.appendChild(h('div', { class: 'page' }, head, h('div', { class: 'exam-progress small muted' }, `Twoje najlepsze wyniki: ${earned} / ${exam.maxPoints} pkt`), list));
  return null;
}

function meta(ic, text) {
  return h('span', { class: 'meta' }, icon(ic, 14), ' ', text);
}
