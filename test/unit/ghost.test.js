'use strict';
// Where hint lines of the model solution appear in the student's code.
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

test('first hint shows one line, on the empty line after the line it follows', () => {
  const template = A.dataTemplate('python', { file: 'bin.txt', title: 'T' }).split('\n');
  const p = plan(template, 1);
  assert.strictEqual(p.total, 7);
  assert.deepStrictEqual(p.zones, []);
  assert.strictEqual(p.inline.text, 'for liczba in dane:');
  assert.strictEqual(template[p.inline.line - 2], 'wynik = 0');
});

test('later hints show more lines; the whole solution marks unused template lines', () => {
  const p2 = plan(null, 2);
  assert.strictEqual(1 + p2.zones.reduce((s, z) => s + z.lines.length, 0), 4);
  const p3 = plan(null, 3);
  assert.strictEqual(p3.missing, 7);
  assert.deepStrictEqual(p3.remove, []);
  assert.strictEqual(p3.zones[0].lines.at(-1), '        wynik += 1');
});

test('typed lines disappear from the ghost, whatever the spacing', () => {
  const template = A.dataTemplate('python', { file: 'bin.txt', title: 'T' }).split('\n');
  const i = template.indexOf('wynik = 0');
  const user = [...template.slice(0, i + 1), 'for liczba  in dane :', "    bloki=1", '    for i in ra', ...template.slice(i + 1)];
  const p = plan(user, 3);
  assert.strictEqual(p.missing, 5);
  assert.strictEqual(p.inline.line, i + 4);
  assert.strictEqual(p.inline.text, 'nge(1, len(liczba)):');
  assert.strictEqual(p.inline.full, '    for i in range(1, len(liczba)):');
});

test('a closing brace the template also has is still part of the solution', () => {
  const template = ['int main() {', '    int wynik = 0;', '    cout << wynik;', '}'];
  const ref = ['int main() {', '    int wynik = 0;', '    for (int x : v) {', '        wynik += x;', '    }', '    cout << wynik;', '}'];
  const p = G.planGhost({ user: template, ref, template, stage: 3, stages: 3, lang: 'cpp' });
  assert.deepStrictEqual(p.zones, [{ after: 2, lines: ['    for (int x : v) {', '        wynik += x;', '    }'] }]);
});

test('SQL: hints go below the leading comments, keywords in any case', () => {
  const user = ['-- Zadanie 7.1', '-- Tabele: gry', '', 'SELECT *', 'FROM gry', 'LIMIT 10;'];
  const ref = ['SELECT nazwa, COUNT(*)', 'FROM gry', 'GROUP BY nazwa;'];
  const p1 = G.planGhost({ user, ref, template: user, stage: 1, stages: 2, lang: 'sql' });
  assert.deepStrictEqual(p1.inline, { line: 3, text: 'SELECT nazwa, COUNT(*)', full: 'SELECT nazwa, COUNT(*)' });
  const typed = ['-- Zadanie 7.1', '-- Tabele: gry', 'select nazwa, count(*)', 'from gry', ''];
  const p2 = G.planGhost({ user: typed, ref, template: user, stage: 2, stages: 2, lang: 'sql' });
  assert.deepStrictEqual(p2.inline, { line: 5, text: 'GROUP BY nazwa;', full: 'GROUP BY nazwa;' });
  const p3 = G.planGhost({ user, ref, template: user, stage: 2, stages: 2, lang: 'sql' });
  assert.deepStrictEqual(p3.remove, [4, 6]);
});

test('empty editor (setting „Pusty edytor”): the whole solution is hinted, starting on line 1', () => {
  const empty = (stage) => G.planGhost({ user: [''], ref: REF, template: [''], stage, stages: 3, lang: 'python' });
  const own = REF.filter((l) => l.trim()).length;
  const p1 = empty(1);
  assert.deepStrictEqual(p1.inline, { line: 1, text: REF[0], full: REF[0] });
  assert.strictEqual(p1.zones.length, 0);
  const p3 = empty(3);
  assert.strictEqual(p3.total, own);
  assert.strictEqual(p3.missing, own);
  assert.deepStrictEqual(p3.remove, []);
});
