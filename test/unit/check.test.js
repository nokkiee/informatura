'use strict';
const test = require('node:test');
const assert = require('node:assert');

let C;
test.before(async () => {
  C = await import('../../renderer/js/check.js');
});

test('tokenize normalizes decimals, dates, labels and diacritics', () => {
  assert.deepStrictEqual(C.tokenize('Odpowiedź: 8,16'), ['odpowiedz', '8.16']);
  assert.deepStrictEqual(C.tokenize('13.12.2035 i 2035-12-13'), ['2035-12-13', 'i', '2035-12-13']);
  assert.deepStrictEqual(C.tokenize('(14000, 3014), (16000, 2010)'), ['14000', '3014', '16000', '2010']);
  assert.deepStrictEqual(C.tokenize('Spirit 14 – 29.08.2066'), ['spirit', '14', '2066-08-29']);
  assert.deepStrictEqual(C.tokenize('***+o*ooo++o +++'), ['***+o*ooo++o', '+++']);
  assert.deepStrictEqual(C.tokenize('godz. 12:30'), ['godz', '12:30']);
});

test('tokEq: integers exact, decimals with tolerance, leading zeros significant', () => {
  assert.ok(C.tokEq('10', '10'));
  assert.ok(C.tokEq('10', '10.0'));
  assert.ok(!C.tokEq('10', '10.5'));
  assert.ok(C.tokEq('7.80', '7.8'));
  assert.ok(C.tokEq('7.80', '7.7999999'));
  assert.ok(!C.tokEq('7.80', '7.79'));
  assert.ok(C.tokEq('014576540', '014576540'));
  assert.ok(!C.tokEq('014576540', '14576540'));
  assert.ok(C.tokEq('1110100011100011100', '1110100011100011100'));
  assert.ok(!C.tokEq('1110100011100011100', '1110100011100011101'));
  assert.ok(C.tokEq('malinowo-porzeczkow…', 'malinowo-porzeczkowa'));
});

test('segmentFor picks the labelled part of a multi-answer output', () => {
  const out = '2.2 10\n2.3\n1110100011100011100\n';
  assert.strictEqual(C.segmentFor(out, '2.2', ['2.2', '2.3']).trim(), '10');
  assert.strictEqual(C.segmentFor(out, '2.3', ['2.2', '2.3']).trim(), '1110100011100011100');
  assert.strictEqual(C.segmentFor('10', '2.2', ['2.2', '2.3']), '10');
});

test('checkAnswer: tokens parts and partial points', () => {
  const exp = { parts: [{ tokens: '88', points: 1 }, { tokens: '65', points: 1 }, { tokens: '88 80 65 124', points: 1 }] };
  assert.strictEqual(C.checkAnswer('88 80\n65 124', exp).points, 3);
  assert.strictEqual(C.checkAnswer('najrzadziej 88 (80 razy), najczęściej 65 (124)', exp).points, 3);
  assert.strictEqual(C.checkAnswer('88 81\n65 124', exp).points, 2);
  assert.strictEqual(C.checkAnswer('10', '10', { autoPoints: 2 }).points, 2);
  assert.strictEqual(C.checkAnswer('Zadanie 2.2: 10', '10', { taskNo: '2.2', siblings: ['2.3'], autoPoints: 2 }).points, 2);
  assert.strictEqual(C.checkAnswer('2.2 7\n2.3 10', '10', { taskNo: '2.2', siblings: ['2.3'], autoPoints: 2 }).points, 0);
});

test('checkAnswer: lines, unordered, with header and extra lines', () => {
  const exp = { parts: [{ lines: ['Terraformacja Marsa 6', 'K2 6'], points: 1 }, { lines: ['K2 24'], points: 1 }, { lines: ['Robinson Crusoe 28'], points: 1 }] };
  const good = 'kategoria\ttytul\tliczba\njuniorzy\tK2\t6\njuniorzy\tTerraformacja Marsa\t6\nseniorzy\tK2\t24\nweterani\tRobinson Crusoe\t28';
  assert.strictEqual(C.checkAnswer(good, exp).points, 3);
  const extra = good + '\nweterani\t5 sekund\t27';
  const r = C.checkAnswer(extra, exp);
  assert.strictEqual(r.points, 0);
  assert.deepStrictEqual(r.extra, ['weterani\t5 sekund\t27']);
  const missing = 'seniorzy K2 24\nweterani Robinson Crusoe 28\njuniorzy K2 6';
  assert.strictEqual(C.checkAnswer(missing, exp).points, 2);
});

test('checkAnswer: ordered lines (long list)', () => {
  const exp = { parts: [{ lines: ['1', '11', '101'], ordered: true, points: 3 }] };
  assert.strictEqual(C.checkAnswer('1\n11\n101\n', exp).points, 3);
  assert.strictEqual(C.checkAnswer('11\n1\n101\n', exp).points, 0);
});

test('checkAnswer: items in any order', () => {
  const exp = { parts: [{ items: ['5832 1801', '7410 1990', '8988 2179'], points: 2 }] };
  assert.strictEqual(C.checkAnswer('(7410, 1990), (5832, 1801), (8988, 2179)', exp).points, 2);
  assert.strictEqual(C.checkAnswer('(7410, 1990), (5832, 1802), (8988, 2179)', exp).points, 0);
});

test('fieldMatches handles sequences, symbols and expressions', () => {
  assert.ok(C.fieldMatches('9, 2, 12, 10, 14, 13, 15', '9 2 12 10 14 13 15'));
  assert.ok(C.fieldMatches('<', '<'));
  assert.ok(!C.fieldMatches('<', '>'));
  assert.ok(C.fieldMatches({ expr: ['2^k-1'] }, '2 ** k - 1'));
  assert.ok(C.fieldMatches('', ''));
  assert.ok(!C.fieldMatches('', '5'));
  assert.ok(C.fieldMatches('k', ' K '));
});

test('alternatives, non-breaking thousands and custom scoring', () => {
  assert.strictEqual(C.checkAnswer('Miesiąc: 11, punkty 1766', { parts: [{ tokens: ['listopad', '11'], points: 1 }] }).points, 1);
  assert.strictEqual(C.checkAnswer('2 422 669,40 zł', '2422669,40', { autoPoints: 1 }).points, 1);
  const exp = {
    exactLines: false,
    parts: ['1', '2', '3'].map((v) => ({ lines: [v], points: 1 })),
    score: (oks, d) => (oks.every(Boolean) && !d.extra.length ? 3 : oks.some(Boolean) && !d.extra.length ? 2 : 0),
  };
  assert.strictEqual(C.checkAnswer('1\n2\n3', exp).points, 3);
  assert.strictEqual(C.checkAnswer('1\n3', exp).points, 2);
  assert.strictEqual(C.checkAnswer('1\n3\n9', exp).points, 0);
});

test('sorted lines with ties, year-month tokens', () => {
  const exp = { parts: [{ lines: ['a 5', 'b 3', 'c 3', 'd 1'], points: 1 }, { lines: ['a 5', 'b 3', 'c 3', 'd 1'], sort: 'desc', reuse: true, points: 1 }], exactLines: false };
  assert.strictEqual(C.checkAnswer('a 5\nc 3\nb 3\nd 1', exp).points, 2);
  assert.strictEqual(C.checkAnswer('a 5\nd 1\nc 3\nb 3', exp).points, 1);
  assert.strictEqual(C.checkAnswer('2023-05 48', { parts: [{ tokens: '2023', points: 1 }, { tokens: ['maj', '5'], points: 1 }, { tokens: '48', points: 1 }] }).points, 3);
});

test('alphabetical sort by a chosen token', () => {
  const L = ['Anna Dymek K358', 'Anna Mason K151', 'Barbara Wroblewska K275'];
  const exp = { exactLines: false, parts: [{ lines: L, points: 1 }, { lines: L, sort: 'asc', sortBy: 0, reuse: true, points: 1 }] };
  assert.strictEqual(C.checkAnswer('Anna Mason K151\nAnna Dymek K358\nBarbara Wroblewska K275', exp).points, 2);
  assert.strictEqual(C.checkAnswer('Barbara Wroblewska K275\nAnna Mason K151\nAnna Dymek K358', exp).points, 1);
});

test('numbers written with digit-group spaces', () => {
  assert.strictEqual(C.checkAnswer('2 422 669,40', '2422669,40', { autoPoints: 1 }).points, 1);
  assert.strictEqual(C.checkAnswer('11 224 kg', '11224', { autoPoints: 1 }).points, 1);
  assert.strictEqual(C.checkAnswer('3 436', { parts: [{ tokens: '3', points: 2 }, { tokens: '436', points: 1 }] }).points, 3);
  assert.strictEqual(C.checkAnswer('2 422 669,41', '2422669,40', { autoPoints: 1 }).points, 0);
});
