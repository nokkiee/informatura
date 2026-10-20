'use strict';
// The official answers must score full points with the app's own checking rules.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..', 'content');
let exams = [];
let C;
let G;

test.before(async () => {
  const ids = (await import(path.join(ROOT, 'exams', 'index.js'))).default;
  for (const id of ids) exams.push((await import(path.join(ROOT, 'exams', id + '.js'))).default);
  C = await import('../../renderer/js/check.js');
});

function task(id, no) {
  const e = exams.find((x) => x.id === id);
  for (const g of e.groups) for (const t of g.tasks) if (t.no === no) return { exam: e, group: g, task: t, siblings: g.tasks.map((x) => x.no) };
  throw new Error('no task ' + id + ' ' + no);
}

// Builds the answer a student would write from the expected parts.
function officialAnswer(spec) {
  // when the answer is a list of lines, those lines already contain everything
  const lineParts = spec.parts.filter((p) => p.lines && !p.reuse);
  if (lineParts.length) {
    const blocks = [];
    for (const p of lineParts) if (!blocks.some((b) => b.join('\n') === p.lines.join('\n'))) blocks.push(p.lines);
    return blocks.flat().join('\n');
  }
  // one block per part; a part repeating an earlier one (e.g. "2 19" after "2") adds nothing new
  const out = [];
  for (const p of spec.parts) {
    if (p.reuse) continue;
    const block = p.tokens != null ? (Array.isArray(p.tokens) ? p.tokens[0] : p.tokens) : (p.items || []).join('\n');
    const prev = out.join(' ');
    if (block.split(/\s+/).every((w) => prev.split(/\s+/).includes(w)) && out.length) continue;
    out.push(block);
  }
  return out.join('\n');
}

test('official answers to data tasks score full automatic points', () => {
  let n = 0;
  for (const e of exams) {
    for (const g of e.groups) {
      for (const t of g.tasks) {
        if (!['program', 'sheet', 'sql'].includes(t.kind)) continue;
        const auto = t.points - (t.self?.points || 0);
        const spec = C.normalizeExpect(t.expect, auto);
        const answer = officialAnswer(spec);
        const r = C.checkAnswer(answer, t.expect, { taskNo: t.no, siblings: g.tasks.map((x) => x.no), autoPoints: auto });
        assert.strictEqual(r.points, auto, `${e.id} ${t.no}: official answer got ${r.points}/${auto}\n${answer}\n${JSON.stringify(r.parts)}`);
        // and an empty answer gets nothing
        assert.strictEqual(C.checkAnswer('', t.expect, { taskNo: t.no, autoPoints: auto }).points, 0, `${e.id} ${t.no}: empty answer`);
        n++;
      }
    }
  }
  assert.ok(n > 100, 'checked ' + n);
});

test('answers written like the CKE key are accepted', () => {
  const cases = [
    ['2023-maj', '3.2', '88 80\n65 124', 3],
    ['2023-maj', '6.3', 'malinowo-porzeczkowe 41\nmalinowo-truskawkowe 72\ntruskawkowo-porzeczkowe 40', 3],
    ['2023-maj', '7.2', 'nazwa\tŚrednia ocena\n5 sekund\t8,16\nAvalone\t8,25\nColt Express\t7,54\nJenga\t8,16\nKoncept\t8,37\nMamy szpiega\t8,22\nPrzebiegle wielblady\t7,73\nSushi Go\t8,07\nSwiatowy Konflikt\t7,80\nSzeryf z Nottingham\t7,88', 2],
    ['2023-czerwiec', '6.1', '7.04.2020   41,582', 2],
    ['2023-czerwiec', '6.2', '35 razy o 10.00', 2],
    ['2023-czerwiec', '6.2', '10:00 35', 2],
    ['2023-czerwiec', '7.4', '11935 Galaxy Tab A (2016) 20', 2],
    ['2024-maj', '7.2', '2 422 669,40\nReneta', 2],
    ['2024-maj', '7.2', '2422669.4 Reneta', 2],
    ['2024-maj', '8.2', 'Miesiąc: listopad.\nLiczba punktów karnych: 1766.', 2],
    ['2024-maj', '4.4', 'Średnia: 1200.704918032787\nLiczba elementów w ciągu: 61\nliczba początkowa 1847 (na pozycji 2797)', 3],
    ['2024-czerwiec', '8.3', '2023-05\t48', 3],
    ['2024-czerwiec', '8.3', 'maj 2023\nLiczba pacjentów: 48', 3],
    ['2025-maj', '3.2', 'a) 24\nb) (7410, 1990), (5832, 1801), (8988, 2179)', 4],
    ['2025-maj', '6.5', '30 razy\n29.05.2033 1.09.2038', 3],
    ['2025-maj', '7.2', 'Spirit 14\t2066-08-29\t2076-07-25', 2],
    ['2025-czerwiec', '6.3', '7\t2,88516129\t1,086774194\t4,924516129\n8\t3,848085106\t1,653191489\t3,385319149\n9\t5,400606061\t2,559090909\t3,103333333\n10\t6,936666667\t3,020333333\t2,818\n11\t7,154\t3,481666667\t2,626333333\n12\t11,32266667\t5,400666667\t2,658333333\n13\t12,23225806\t6,347419355\t2,497419355\n14\t10,97548387\t5,513548387\t2,507741935\n15\t13,20810811\t6,69972973\t2,444594595\n16\t12,59261538\t6,740615385\t2,792461538', 1],
    ['2026-maj', '8.4', '14, styczeń', 2],
    ['2026-maj', '8.4', '14\t01\t3', 2],
    ['2026-maj', '8.2', 'K – 689 i M – 651', 2],
    ['2026-czerwiec', '7.4', '11 224 kg\n25.08.2023 (wieczorem)', 2],
    ['2026-czerwiec', '8.1', 'k\t3.57\nm\t3.73', 2],
  ];
  for (const [id, no, answer, pts] of cases) {
    const { task: t, siblings } = task(id, no);
    const auto = t.points - (t.self?.points || 0);
    const r = C.checkAnswer(answer, t.expect, { taskNo: t.no, siblings, autoPoints: auto });
    assert.strictEqual(r.points, pts, `${id} ${no}: "${answer.slice(0, 60)}" got ${r.points}, ${JSON.stringify(r.parts)}`);
  }
});

test('typical wrong answers named in the CKE rubrics are not accepted', () => {
  const cases = [
    ['2023-maj', '3.1', '1014'],
    ['2023-maj', '7.3', '351'],
    ['2023-czerwiec', '3.3', '9785'],
    ['2024-maj', '4.1', '2788'],
    ['2024-czerwiec', '3.1', '25'],
    ['2025-maj', '3.1', '41'],
    ['2025-czerwiec', '6.2', '7\n2022-05-25'],
    ['2026-maj', '4.2', '25112'],
    ['2026-czerwiec', '7.5', '3125'],
  ];
  for (const [id, no, answer] of cases) {
    const { task: t, siblings } = task(id, no);
    const auto = t.points - (t.self?.points || 0);
    const r = C.checkAnswer(answer, t.expect, { taskNo: t.no, siblings, autoPoints: auto });
    assert.ok(r.points < auto, `${id} ${no}: wrong answer "${answer}" got full points`);
  }
});

test('answers checked by simulation accept the key and reject wrong ones', () => {
  const v = (id, no, fields) => task(id, no).task.validate(fields);
  // the key's first example actually makes 7 comparisons (the rubric gives 1 pt for 7)
  assert.strictEqual(v('2023-czerwiec', '2.1', { s: 'ababababb', k1: '1', k2: '3' }).points, 1);
  assert.strictEqual(v('2023-czerwiec', '2.1', { s: 'aaaaaaaaaa', k1: '2', k2: '5' }).points, 2);
  assert.strictEqual(v('2023-czerwiec', '2.1', { s: 'abc', k1: '1', k2: '2' }).points, 0);
  assert.strictEqual(v('2024-maj', '1.2', { a: '10111/01111/11111/11111/11111', b: '1000/1000/1000/1111' }).points, 2);
  assert.strictEqual(v('2024-maj', '1.2', { a: '11111/11111/11111/11111/11111', b: '1111/1111/1111/1111' }).points, 0);
  assert.strictEqual(
    v('2026-maj', '1.1', { c1: '5', w1: 'A(2^6, 2^4), A(2^7, 2^3), A(2^8, 2^2), A(2^9, 2^1), A(2^10, 2^0)', c2: '3', w2: 'A(10, 7), A(10, 3), A(10, 1)', c3: '100' }).points,
    3,
  );
  assert.strictEqual(v('2026-maj', '1.1', { c1: '5', w1: 'A(64, 16), A(128, 8), A(256, 4), A(512, 2), A(1024, 1)', c2: '3', w2: 'A(10,7), A(10,3), A(10,1)', c3: '100' }).points, 3);
  assert.strictEqual(v('2026-maj', '1.2', { a: '777', b: '512 000 000 000 000' }).points, 1);
  assert.strictEqual(v('2026-maj', '1.2', { a: '777', b: '512·10^12' }).points, 1);
  assert.strictEqual(v('2026-maj', '1.3', { n1: 'k', e1: '2^(k-i)', n2: 'k-1', e2: '2^(k-i)-1' }).points, 3);
  assert.strictEqual(v('2026-maj', '1.3', { n1: 'k', e1: '2^k/2^i', n2: 'k – 1', e2: '⌊(2^k-1)/2^i⌋' }).points, 3);
  assert.strictEqual(v('2026-maj', '1.3', { n1: 'k', e1: '2^(k-i)', n2: 'k', e2: '2^(k-i)' }).points, 1);
  assert.strictEqual(v('2026-czerwiec', '1.2', { k: '1' }).points, 1);
  assert.strictEqual(v('2026-czerwiec', '1.2', { k: '2' }).points, 0);
  assert.strictEqual(v('2026-czerwiec', '1.3', { k: 'n + 1' }).points, 1);
  assert.strictEqual(v('2026-czerwiec', '1.3', { k: 'k > n' }).points, 1);
  assert.strictEqual(v('2026-czerwiec', '1.3', { k: 'n' }).points, 0);
});
