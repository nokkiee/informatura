'use strict';
// Where hint lines of the model solution appear in the student's code, VS Code style.
const test = require('node:test');
const assert = require('node:assert');

let G;
let A;
test.before(async () => {
  G = await import('../../renderer/js/ghost.js');
  A = await import('../../renderer/js/algo.js');
});

const REF = `with open("bin.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = 0
for liczba in dane:
    bloki = 1
    for i in range(1, len(liczba)):
        if liczba[i] != liczba[i - 1]:
            bloki += 1
    if bloki <= 2:
        wynik += 1

print(wynik)
`.split('\n');

function plan(user, stage, stages = 3) {
  const template = A.dataTemplate('python', { file: 'bin.txt', title: 'T' }).split('\n');
  return G.planGhost({ user: user ?? template, ref: REF, template, stage, stages, lang: 'python' });
}

const TEMPLATE = () => A.dataTemplate('python', { file: 'bin.txt', title: 'T' }).split('\n');
const at = (user, line, column, stage = 3, extra = {}) => G.suggestAt({ user, ref: REF, template: TEMPLATE(), stage, stages: 3, lang: 'python', line, column, ...extra });

test('first hint: one line, waiting on the empty line where it gets typed', () => {
  const template = TEMPLATE();
  const p = plan(template, 1);
  assert.strictEqual(p.total, 7);
  assert.strictEqual(p.spots.length, 1);
  const [spot] = p.spots;
  assert.deepStrictEqual(spot.lines, ['for liczba in dane:']);
  assert.ok(spot.typing);
  assert.strictEqual(template[spot.line - 2], 'wynik = 0');
  assert.strictEqual(template[spot.line - 1], '');
  // with the cursor there, the line shows up at the cursor
  const s = at(template, spot.line, 1, 1);
  assert.deepStrictEqual(s.parts, [{ at: 0, text: 'for liczba in dane:' }]);
  assert.deepStrictEqual(s.more, []);
  assert.strictEqual(s.kind, 'line');
  // nowhere else
  assert.strictEqual(at(template, 3, 1, 1), null);
});

test('later hints reveal more lines; the whole solution marks unused template lines', () => {
  const p2 = plan(null, 2);
  assert.strictEqual(p2.spots.reduce((s, x) => s + x.lines.length, 0), 4);
  const p3 = plan(null, 3);
  assert.strictEqual(p3.missing, 7);
  assert.deepStrictEqual(p3.remove, []);
  assert.strictEqual(p3.spots[0].lines.at(-1), '        wynik += 1');
  // stage 2 at the empty line: the line and the next revealed ones under it
  const template = TEMPLATE();
  const s = at(template, p2.spots[0].line, 1, 2);
  assert.strictEqual(s.parts[0].text, 'for liczba in dane:');
  assert.deepStrictEqual(s.more, ['    bloki = 1', '    for i in range(1, len(liczba)):', '        if liczba[i] != liczba[i - 1]:']);
});

test('typing the hinted line: the rest of it follows the cursor, whatever the spacing', () => {
  const template = TEMPLATE();
  const i = template.indexOf('wynik = 0');
  const user = [...template];
  user[i + 1] = 'for liczba  in da';
  assert.deepStrictEqual(at(user, i + 2, user[i + 1].length + 1).parts, [{ at: 0, text: 'ne:' }]);
});

test('brackets the editor closed by itself: the hint is woven around them', () => {
  const template = TEMPLATE();
  const i = template.indexOf('wynik = 0');
  const user = [...template.slice(0, i + 1), 'for liczba in dane:', '    bloki = 1', '    for i in range()', ...template.slice(i + 2)];
  const s = at(user, i + 4, '    for i in range('.length + 1);
  assert.deepStrictEqual(s.parts, [
    { at: 0, text: '1, len(liczba' },
    { at: 1, text: '):' },
  ]);
  assert.strictEqual(s.full, '    for i in range(1, len(liczba)):');
  assert.deepStrictEqual(s.more, ['        if liczba[i] != liczba[i - 1]:', '            bloki += 1', '    if bloki <= 2:', '        wynik += 1']);
  // a typo: no hint for the line
  user[i + 3] = '    for j in range()';
  assert.strictEqual(at(user, i + 4, '    for j in range('.length + 1), null);
});

test('at the end of a finished line: the hinted lines that follow it', () => {
  const template = TEMPLATE().filter((l, k, all) => !(l === '' && all[k - 1] === 'wynik = 0')); // no empty line after "wynik = 0"
  const i = template.indexOf('wynik = 0');
  const p = plan(template, 1);
  assert.deepStrictEqual(p.spots, [{ line: i + 1, typing: false, lines: ['for liczba in dane:'] }]);
  const s = at(template, i + 1, 'wynik = 0'.length + 1, 1);
  assert.strictEqual(s.kind, 'after');
  assert.deepStrictEqual(s.more, ['for liczba in dane:']);
  assert.strictEqual(at(template, i + 1, 3, 1), null); // only at the end of the line
});

test('Python: an empty line indented deeper than the hinted line asks for a dedent', () => {
  const template = TEMPLATE();
  const i = template.indexOf('wynik = 0');
  const user = [...template.slice(0, i + 1), 'for liczba in dane:', '    bloki = 1', '    for i in range(1, len(liczba)):', '        if liczba[i] != liczba[i - 1]:', '            bloki += 1', '            ', ...template.slice(i + 2)];
  const s = at(user, i + 7, 13);
  assert.ok(s.dedent);
  assert.deepStrictEqual(s.parts, [{ at: 0, text: 'if bloki <= 2:' }]);
  assert.strictEqual(s.full, '    if bloki <= 2:');
  // an empty line indented less: the hint keeps the solution's indentation
  user[i + 6] = '    ';
  assert.deepStrictEqual(at(user, i + 7, 5).parts, [{ at: 0, text: 'if bloki <= 2:' }]);
  user[i + 6] = '';
  assert.deepStrictEqual(at(user, i + 7, 1).parts, [{ at: 0, text: '    if bloki <= 2:' }]);
});

test('weaving a hint around the text right of the cursor', () => {
  assert.deepStrictEqual(G.interleave('wynik)', ')', 'python'), [{ at: 0, text: 'wynik' }]);
  assert.deepStrictEqual(G.interleave('wiersz.strip() for wiersz in plik]', ']', 'python'), [{ at: 0, text: 'wiersz.strip() for wiersz in plik' }]);
  assert.deepStrictEqual(G.interleave('a", "b")', '")', 'python'), [{ at: 0, text: 'a' }, { at: 1, text: ', "b"' }]);
  assert.deepStrictEqual(G.interleave('abc', '', 'python'), [{ at: 0, text: 'abc' }]);
  assert.strictEqual(G.interleave('abc', 'x', 'python'), null);
});

test('brackets the editor closed by itself are not part of what is typed', () => {
  assert.strictEqual(G.typedLength('print(wynik)', 'print()', 'python'), 'print('.length);
  assert.strictEqual(G.typedLength('dane = [wiersz.strip() for wiersz in plik]', 'dane = [wiersz.strip()]', 'python'), 'dane = [wiersz.strip()'.length);
  assert.strictEqual(G.typedLength('wynik = 0', '   ', 'python'), 0);
  assert.strictEqual(G.typedLength('wynik = 0', 'wynik = 1', 'python'), null);
});

test('C++: a closing brace the template also has is still part of the solution', () => {
  const template = ['int main() {', '    int wynik = 0;', '    cout << wynik;', '}'];
  const ref = ['int main() {', '    int wynik = 0;', '    for (int x : v) {', '        wynik += x;', '    }', '    cout << wynik;', '}'];
  const p = G.planGhost({ user: template, ref, template, stage: 3, stages: 3, lang: 'cpp' });
  assert.deepStrictEqual(p.spots, [{ line: 2, typing: false, lines: ['    for (int x : v) {', '        wynik += x;', '    }'] }]);
  // "{}" closed by the editor at the end of the hinted line: the rest is under the cursor line
  const user = ['int main() {', '    int wynik = 0;', '    for (int x : v) {}', '    cout << wynik;', '}'];
  const s = G.suggestAt({ user, ref, template, stage: 3, stages: 3, lang: 'cpp', line: 3, column: '    for (int x : v) {'.length + 1 });
  assert.deepStrictEqual(s.parts, []);
  assert.deepStrictEqual(s.more, ['        wynik += x;', '    }']);
});

test('SQL: hints go below the leading comments, keywords in any case', () => {
  const user = ['-- Zadanie 7.1', '-- Tabele: gry', '', 'SELECT *', 'FROM gry', 'LIMIT 10;'];
  const ref = ['SELECT nazwa, COUNT(*)', 'FROM gry', 'GROUP BY nazwa;'];
  const sql = (u, stage, line, column) => G.suggestAt({ user: u, ref, template: user, stage, stages: 2, lang: 'sql', line, column });
  const p1 = G.planGhost({ user, ref, template: user, stage: 1, stages: 2, lang: 'sql' });
  assert.deepStrictEqual(p1.spots, [{ line: 3, typing: true, lines: ['SELECT nazwa, COUNT(*)'] }]);
  assert.deepStrictEqual(sql(user, 1, 3, 1).parts, [{ at: 0, text: 'SELECT nazwa, COUNT(*)' }]);
  const typed = ['-- Zadanie 7.1', '-- Tabele: gry', 'select nazwa, count()', 'from gry', ''];
  assert.deepStrictEqual(sql(typed, 1, 3, 'select nazwa, count('.length + 1).parts, [{ at: 0, text: '*' }]);
  assert.deepStrictEqual(sql(typed, 2, 5, 1).parts, [{ at: 0, text: 'GROUP BY nazwa;' }]);
  const p3 = G.planGhost({ user, ref, template: user, stage: 2, stages: 2, lang: 'sql' });
  assert.deepStrictEqual(p3.remove, [4, 6]);
});

test('empty editor (setting „Pusty edytor”): the whole solution is hinted, starting on line 1', () => {
  const p1 = G.planGhost({ user: [''], ref: REF, template: [''], stage: 1, stages: 3, lang: 'python' });
  assert.deepStrictEqual(p1.spots, [{ line: 1, typing: true, lines: [REF[0]] }]);
  const s = G.suggestAt({ user: [''], ref: REF, template: [''], stage: 3, stages: 3, lang: 'python', line: 1, column: 1 });
  assert.deepStrictEqual(s.parts, [{ at: 0, text: REF[0] }]);
  assert.strictEqual(s.more.length, REF.filter((l) => l.trim()).length - 1);
  const p3 = G.planGhost({ user: [''], ref: REF, template: [''], stage: 3, stages: 3, lang: 'python' });
  assert.strictEqual(p3.missing, p3.total);
  assert.deepStrictEqual(p3.remove, []);
});
