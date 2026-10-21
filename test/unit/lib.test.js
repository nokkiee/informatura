'use strict';
// content/lib.js: how task texts are assembled.
const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const url = require('url');

let L;
test.before(async () => {
  L = await import(url.pathToFileURL(path.join(__dirname, '..', '..', 'content', 'lib.js')).href);
});

test('an inserted block indented less than the text does not turn the text into a code block', () => {
  const block = '<table>\n    <tr><td>1</td></tr>\n</table>';
  const text = L.md`
            Uzupełnij brakujące cyfry.

            ${block}
          `;
  assert.strictEqual(text, 'Uzupełnij brakujące cyfry.\n\n<table>\n<tr><td>1</td></tr>\n</table>');
});

test('lines of an inserted list keep their place inside a fenced block', () => {
  const lines = ['101', '110'].join('\n');
  const text = L.md`
            Wynik:

            \`\`\`
            ${lines}
            \`\`\`
          `;
  assert.strictEqual(text, 'Wynik:\n\n```\n101\n110\n```');
});

test('long column names in table headers can wrap at natural points', () => {
  const html = L.table([['dostawa_malin', 'IdTransakcji', '*n*'], ['1', '2', '3']]);
  assert.match(html, /dostawa_<wbr>malin/);
  assert.match(html, /Id<wbr>Transakcji/);
  assert.match(html, /<i>n<\/i>/);
});
