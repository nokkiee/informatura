// Helpers for the lessons (content/lessons/**).
//
// A lesson's text is Markdown. Code examples are ~~~ fences: consecutive ~~~python, ~~~cpp and
// ~~~java fences become one example with language tabs (the reader sees their language), and
// "run" after the language (~~~python run) adds a button that runs the example; a ~~~stdin
// fence right after it is what the example gets on its input. ~~~sql run runs a query on the
// lesson's database, ~~~excel run evaluates formulas on the lesson's sheet. A blockquote that
// starts with **Uwaga:**, **Wskazówka:** or **Na maturze:** is shown as a coloured box.

import { md as dedent } from '../lib.js';

// Like md() for the exam statements, but the text is taken raw: backslashes in code examples
// ("\n", "\\") stay as written. Only \` and \${ need a backslash (they'd end the template or
// start a value).
export function md(strings, ...values) {
  const raw = strings.raw.map((s) => s.replace(/\\`/g, '`').replace(/\\\$\{/g, '${'));
  return dedent(raw, ...values);
}

// Code of a solution or a starting point, raw and without the common indentation.
export const code = md;

// A small table for a lesson database or sheet: a header line and data lines, fields
// separated by ";" (written raw, indentation removed).
export const rows = md;
