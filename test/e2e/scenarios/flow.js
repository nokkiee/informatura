'use strict';
// Solves real tasks end-to-end: code in all three languages, the example-data test,
// algorithm tests, SQL, the spreadsheet, fill-in fields and true/false.

const PY_22 = `with open("bin.txt") as f:
    L = [l.strip() for l in f if l.strip()]
def bloki(s):
    return 1 + sum(1 for i in range(1, len(s)) if s[i] != s[i - 1])
print(sum(1 for s in L if bloki(s) <= 2))
`;
const CPP_22 = `#include <iostream>
#include <fstream>
#include <string>
using namespace std;
int main() {
    ifstream f("bin.txt");
    string s; int ile = 0;
    while (f >> s) {
        int b = 1;
        for (size_t i = 1; i < s.size(); i++) if (s[i] != s[i-1]) b++;
        if (b <= 2) ile++;
    }
    cout << ile << endl;
}
`;
const JAVA_22 = `import java.nio.file.*;
import java.util.*;
public class Main {
    public static void main(String[] args) throws Exception {
        int ile = 0;
        for (String s : Files.readAllLines(Path.of("bin.txt"))) {
            s = s.strip();
            if (s.isEmpty()) continue;
            int b = 1;
            for (int i = 1; i < s.length(); i++) if (s.charAt(i) != s.charAt(i-1)) b++;
            if (b <= 2) ile++;
        }
        System.out.println(ile);
    }
}
`;
const PY_21 = `n = int(input())
b = 1
p = n % 2
n //= 2
while n > 0:
    c = n % 2
    if c != p:
        b += 1
    p = c
    n //= 2
print(b)
`;

module.exports = async (H) => {
  const go = async (hash, wait = 800) => {
    await H.js(`location.hash = ${JSON.stringify(hash)}`);
    await H.sleep(wait);
  };
  const setCode = (code) =>
    H.js(`(() => {
      const ed = window.monaco.editor.getEditors().find((e) => e.getContainerDomNode().offsetParent !== null);
      ed.setValue(${JSON.stringify(code)});
      return true;
    })()`);
  const answer = () => H.js(`document.querySelector('.answer-area')?.value || ''`);
  const press = (keyCode, modifiers = []) => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode, modifiers });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode, modifiers });
  };

  // ---- program task in three languages ---------------------------------------------------
  await go('#/t/2023-maj/2.2?from=exam', 300);
  await H.waitFor(() => H.js(`!!window.monaco && window.monaco.editor.getEditors().length > 0`), 15000);
  await setCode(PY_22);
  await H.click('.btn', 'Uruchom');
  await H.waitFor(async () => (await answer()).trim() === '10', 15000);
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 3000);
  await H.click('.btn', 'Test: dane przykładowe');
  await H.waitFor(() => H.js(`!!document.querySelector('.con-ok')`), 15000);
  await H.shot('10-python-ok');

  for (const [lang, code] of [
    ['cpp', CPP_22],
    ['java', JAVA_22],
  ]) {
    await H.js(`(() => { const s = document.querySelector('.lang-select'); s.value = '${lang}'; s.dispatchEvent(new Event('change')); })()`);
    await H.sleep(300);
    await H.js(`document.querySelector('.answer-area').value = ''`);
    await setCode(code);
    await H.click('.btn', 'Uruchom');
    await H.waitFor(async () => (await answer()).trim() === '10', 30000);
    console.log(lang, 'ok');
  }
  await H.shot('11-java-ok');
  // back to Python for the rest
  await H.js(`(() => { const s = document.querySelector('.lang-select'); s.value = 'python'; s.dispatchEvent(new Event('change')); })()`);
  await H.sleep(200);

  // ---- algorithm task: tests --------------------------------------------------------------
  await go('#/t/2023-maj/2.1?from=exam', 1500);
  await setCode(PY_21);
  await H.click('.btn', 'Sprawdź testami');
  await H.waitFor(() => H.js(`!!document.querySelector('.tests-body .tests-summary.ok')`), 20000);
  await H.shot('12-algo-tests');
  // a wrong solution must fail
  await setCode(PY_21.replace('b = 1\n', 'b = 0\n'));
  await H.click('.btn', 'Sprawdź testami');
  await H.waitFor(() => H.js(`!!document.querySelector('.tests-body .tests-summary.bad')`), 20000);

  // ---- SQL ---------------------------------------------------------------------------------
  await go('#/t/2023-maj/7.1?from=exam', 2000);
  await setCode('SELECT g.nazwa, COUNT(*) AS ile\nFROM oceny o JOIN gry g ON g.id_gry = o.id_gry\nGROUP BY g.id_gry\nORDER BY ile DESC\nLIMIT 1;');
  await H.click('.btn', 'Wykonaj');
  await H.waitFor(async () => (await answer()).startsWith('K2'), 5000);
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 3000);
  await H.shot('13-sql-ok');
  // Access/MySQL flavoured query on the sqlwrite task
  await go('#/t/2023-maj/7.5?from=exam', 2000);
  await setCode('SELECT Sum(cena)\nFROM Gry\nINNER JOIN Sklep ON Gry.id_gry = Sklep.id_gry\nWHERE Gry.kategoria = "logiczna" and Sklep.promocja = true;');
  await H.click('.btn', 'Wykonaj');
  await H.waitFor(() => H.js(`!!document.querySelector('.sql-status .tests-summary.ok')`), 5000);

  // ---- spreadsheet ----------------------------------------------------------------------------
  await go('#/t/2023-maj/6.2?from=exam', 300);
  await H.waitFor(() => H.js(`!!document.querySelector('.grid-canvas')`), 15000);
  await H.sleep(500);
  const nameBoxGo = async (ref) => {
    await H.js(`(() => { const n = document.querySelector('.namebox'); n.focus(); n.value = ${JSON.stringify(ref)}; })()`);
    press('Return');
    await H.sleep(150);
  };
  const typeInCell = async (text) => {
    H.wc.sendInputEvent({ type: 'keyDown', keyCode: text[0] });
    H.wc.sendInputEvent({ type: 'char', keyCode: text[0] });
    H.wc.sendInputEvent({ type: 'keyUp', keyCode: text[0] });
    await H.sleep(80);
    await H.wc.insertText(text.slice(1));
    await H.sleep(80);
    press('Return');
    await H.sleep(150);
  };
  await nameBoxGo('F2');
  await typeInCell('=JEŻELI(ORAZ(D2>B2;D2>C2);1;0)');
  await nameBoxGo('F2:F154');
  press('D', ['control']);
  await H.sleep(300);
  await nameBoxGo('H1');
  await typeInCell('=SUMA(F2:F154)');
  await nameBoxGo('H1');
  const h1 = await H.js(`document.querySelector('.fx-input').value`);
  H.assert(/SUMA/.test(h1), 'formula bar shows the formula, got ' + h1);
  await H.click('.btn', 'Do odpowiedzi');
  await H.waitFor(async () => (await answer()).trim() === '19', 3000);
  await H.shot('14-sheet');
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 3000);
  // dates are shown as in the file
  await nameBoxGo('A2');
  const a2 = await H.js(`document.querySelector('.fx-input').value`);
  H.assert(a2 === '01.05.2020', 'A2 date, got ' + a2);

  // ---- fill-in, true/false, selects -------------------------------------------------------------
  await go('#/t/2023-maj/1.3?from=exam', 800);
  await H.js(`(() => {
    const set = (id, v) => { const i = document.querySelector('[data-field="' + id + '"]'); i.value = v; i.dispatchEvent(new Event('input')); };
    set('a', '9, 2, 12, 10, 14, 13, 15'); set('b', '10 8 4 6 15 13 12');
  })()`);
  await H.click('.btn', 'Sprawdź');
  const r13 = await H.js(`document.querySelector('.result-title').textContent`);
  H.assert(r13.includes('1 / 2'), '1.3 partial points, got ' + r13);
  await go('#/t/2023-maj/4?from=exam', 800);
  await H.js(`(() => { const rows = document.querySelectorAll('.tf-table tr'); rows[0].querySelectorAll('.tf-btn')[0].click(); rows[1].querySelectorAll('.tf-btn')[1].click(); })()`);
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 2000);
  await go('#/t/2023-maj/5?from=exam', 800);
  await H.js(`(() => { for (const id of ['s1', 's2']) { const s = document.querySelector('[data-field="' + id + '"]'); s.value = '<'; s.dispatchEvent(new Event('change')); } })()`);
  await H.click('.btn', 'Sprawdź');
  await H.waitFor(() => H.js(`!!document.querySelector('.result-box.ok')`), 2000);
  await H.click('.btn', 'Pokaż rozwiązanie');
  await H.shot('15-fill-solution');
};
