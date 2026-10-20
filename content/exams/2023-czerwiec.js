import { md, table, sample, all, perField, byCount } from '../lib.js';

// Zadanie 1: table of calls of iloczyn(x, y)
function callTable(rows, { inputs = null } = {}) {
  const head =
    '<thead><tr><th rowspan="2">Numer wywołania</th><th colspan="2">Parametry wywołania</th><th colspan="2">Obliczone <i>k</i>, <i>z</i></th><th rowspan="2">Wynik</th></tr>' +
    '<tr><th><i>x</i></th><th><i>y</i></th><th><i>k</i></th><th><i>z</i></th></tr></thead>';
  const body = rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('');
  return `<table class="tbl center">${head}<tbody>${body}</tbody></table>`;
}

const CALLS_11 = [
  ['1', '10', '45', '22', '220', '450'],
  ['2', '10', '22', '11', '110', '220'],
  ['3', '10', '11', '5', '50', '110'],
  ['4', '10', '5', '2', '20', '50'],
  ['5', '10', '2', '1', '10', '20'],
  ['6', '10', '1', '–', '–', '10'],
];

// Fields of task 1.1: every empty cell of the table (row r, column c).
const F11 = {};
const ROWS11 = CALLS_11.map((row, r) =>
  row.map((v, c) => {
    const given = (r === 0 && c <= 3) || c === 0 || (r === 5 && c >= 2 && c <= 4);
    if (given) return r === 5 && c === 2 ? '1' : v;
    const id = `c${r + 1}_${c}`;
    F11[id] = v;
    return `{{${id}|5}}`;
  }),
);

// Zadanie 2: czy_mniejszy and the number of comparisons in its first "jeżeli"
function firstIfComparisons(s, k1, k2) {
  const n = s.length;
  let i = k1;
  let j = k2;
  let count = 0;
  while (i <= n && j <= n) {
    count++;
    if (s[i - 1] === s[j - 1]) {
      i++;
      j++;
    } else break;
  }
  return count;
}

function suffixOrder(s) {
  const idx = Array.from({ length: s.length }, (_, i) => i + 1);
  return idx.sort((a, b) => (s.slice(a - 1) < s.slice(b - 1) ? -1 : 1));
}

export default {
  id: '2023-czerwiec',
  year: 2023,
  session: 'czerwiec',
  term: 'termin dodatkowy',
  date: '2023-06-16',
  dateText: '16 czerwca 2023 r.',
  symbol: 'MINP-R0-100-2306',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2023-czerwiec-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2023-czerwiec-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Mnożenie',
      intro: md`
        Następujący rekurencyjny algorytm mnożenia dwóch liczb całkowitych dodatnich *x*, *y* jest realizowany z użyciem operacji arytmetycznych dodawania i dzielenia całkowitego przez 2.

        \`\`\`pseudo
        iloczyn(x, y):
            jeżeli y = 1
                wynikiem jest x
            w przeciwnym razie
                k ← y div 2
                z ← iloczyn(x, k)
                jeżeli y mod 2 = 0
                    wynikiem jest z + z
                w przeciwnym razie
                    wynikiem jest x + z + z
        \`\`\`

        **Uwaga**: *x* mod *y* oznacza resztę z dzielenia *x* przez *y*, natomiast *x* div *y* oznacza wynik dzielenia całkowitego *x* przez *y*.

        Dla danych liczb *x*, *y* interesuje nas **liczba wykonywanych operacji dodawania** podczas obliczania wyniku funkcji *iloczyn*(*x*, *y*).

        **Przykład 1.**
        Dla liczb x=9 i y=11 algorytm wykonuje 5 dodawań. Działanie funkcji *iloczyn*(9, 11) można zilustrować w następujący sposób (w nawiasach obok wskazano liczbę wykonywanych operacji dodawania):

        *iloczyn*(9, 11) = 9 + *z* + *z*, (dwa dodawania), gdzie *z* = *iloczyn*(9, 5)
        *iloczyn*(9, 5) = 9 + *z* + *z*, (dwa dodawania), gdzie *z* = *iloczyn*(9, 2)
        *iloczyn*(9, 2) = *z* + *z*, (jedno dodawanie), gdzie *z* = *iloczyn*(9, 1)
        *iloczyn*(9, 1) = 9

        Poniższa tabela ilustruje obliczenia wykonywane podczas wywołania *iloczyn*(9, 11)

        ${callTable([
          ['1', '9', '11', '5', '45', '<b>99</b> (9+45+45)'],
          ['2', '9', '5', '2', '18', '<b>45</b> (9+18+18)'],
          ['3', '9', '2', '1', '9', '<b>18</b> (9+9)'],
          ['4', '9', '1', '–', '–', '<b>9</b>'],
        ])}
      `,
      tasks: [
        {
          no: '1.1',
          points: 2,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'analiza algorytmu'],
          text: md`
            Uzupełnij poniższą tabelę tak, aby ilustrowała obliczenia wykonywane podczas wywołania *iloczyn*(10, 45).

            ${callTable(ROWS11)}
          `,
          fields: F11,
          score: (ok) => {
            // a row counts when all its blanks are right
            const rows = [1, 2, 3, 4, 5, 6].filter((r) => Object.keys(ok).filter((k) => k.startsWith(`c${r}_`)).every((k) => ok[k]));
            return rows.length === 6 ? 2 : rows.length === 5 ? 1 : 0;
          },
          rubric: md`
            2 pkt – odpowiedź poprawna w 6 wierszach.
            1 pkt – odpowiedź poprawna w 5 wierszach.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: callTable(CALLS_11),
        },
        {
          no: '1.2',
          points: 2,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'analiza algorytmu'],
          text: md`
            Dla liczb *x*, *y* wymienionych w poniższej tabeli podaj liczbę operacji dodawania, jaka zostanie wykonana podczas obliczania wyniku funkcji *iloczyn*(*x*, *y*).

            ${table([
              ['*x*', '*y*', 'Liczba dodawań'],
              ['9', '11', '5'],
              ['8', '32', '{{a|6}}'],
              ['2', '47', '{{b|6}}'],
              ['112', '112', '{{c|6}}'],
            ])}
          `,
          fields: { a: '5', b: '9', c: '8' },
          score: byCount([
            [3, 2],
            [2, 1],
          ]),
          rubric: md`
            2 pkt – odpowiedź poprawna w 3 wierszach.
            1 pkt – odpowiedź poprawna w 2 wierszach.
            0 pkt – inna odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['*x*', '*y*', 'Liczba dodawań'],
            ['9', '11', '5'],
            ['8', '32', '5'],
            ['2', '47', '9'],
            ['112', '112', '8'],
          ]),
        },
        {
          no: '1.3',
          points: 2,
          page: 7,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['iteracja', 'zapis algorytmu'],
          text: md`
            Poniżej zapisano iteracyjny algorytm realizujący funkcję *iloczyn*(*x*, *y*). Uzupełnij trzy luki w algorytmie, tak aby był zgodny z poniższą specyfikacją.

            **UWAGA:** spośród operacji arytmetycznych możesz użyć tylko: dodawania, odejmowania, dzielenia całkowitego i reszty z dzielenia. Nie możesz użyć zwłaszcza operacji mnożenia.

            **Specyfikacja:**
            Dane: *x*, *y* – liczby całkowite dodatnie
            Wynik: *z* – wartość iloczynu *x*\\**y*

            **Algorytm:**

            <div class="algo-lines">
            <div><i>z</i> ← {{z0|10}}</div>
            <div>dopóki {{cond|14}} wykonuj:</div>
            <div class="ind">jeżeli <i>y</i> mod 2 = 1</div>
            <div class="ind2"><i>z</i> ← <i>z</i> + <i>x</i></div>
            <div class="ind"><i>x</i> ← <i>x</i> + <i>x</i></div>
            <div class="ind"><i>y</i> ← {{ynext|14}}</div>
            </div>
          `,
          fields: {
            z0: '0',
            cond: { expr: ['y>=1', 'y>0', 'y!=0', '0<y', '1<=y', '0!=y'] },
            ynext: { expr: ['ydiv2', 'y//2', '(y-ymod2)div2', '(y-ymod2)/2', 'y>>1'] },
          },
          score: byCount([
            [3, 2],
            [2, 1],
          ]),
          rubric: md`
            2 pkt – odpowiedź poprawna dla 3 luk.
            1 pkt – odpowiedź poprawna dla 2 luk.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`pseudo
            z ← 0
            dopóki y ≥ 1, wykonuj:
                jeżeli y mod 2 = 1
                    z ← z + x
                x ← x + x
                y ← y div 2
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Sufiksy',
      intro: md`
        *Słowo* definiujemy jako ciąg złożony z małych liter alfabetu angielskiego.
        Niech *s*[1..*n*] będzie słowem o długości *n* > 0.
        *Sufiksem* słowa *s* nazywamy każde jego podsłowo kończące na ostatniej pozycji słowa *s*. Sufiks *s*[*k*..*n*] nazywamy *k*-tym sufiksem.

        **Przykład 1.**
        słowo *s*[1..10] = mascarpone ma następujące sufiksy:

        ${table([
          ['*k*', '*s*[*k*..*n*]'],
          ['1', 'mascarpone'],
          ['2', 'ascarpone'],
          ['3', 'scarpone'],
          ['4', 'carpone'],
          ['5', 'arpone'],
          ['6', 'rpone'],
          ['7', 'pone'],
          ['8', 'one'],
          ['9', 'ne'],
          ['10', 'e'],
        ])}

        Uporządkowanie alfabetyczne wszystkich sufiksów słowa mascarpone daje następującą kolejność ich numerów (od najmniejszego): 5, 2, 4, 10, 1, 9, 8, 7, 6, 3:

        ${table([
          ['*k*', '*s*[*k*..*n*]'],
          ['5', 'arpone'],
          ['2', 'ascarpone'],
          ['4', 'carpone'],
          ['10', 'e'],
          ['1', 'mascarpone'],
          ['9', 'ne'],
          ['8', 'one'],
          ['7', 'pone'],
          ['6', 'rpone'],
          ['3', 'scarpone'],
        ])}

        Poniżej zapisano funkcję *czy_mniejszy*(*n*, *s*, *k1*, *k2*). Wynikiem funkcji jest wartość PRAWDA, gdy sufiks *s*[*k1*..*n*] jest mniejszy w porządku alfabetycznym od sufiksu *s*[*k2*..*n*] oraz FAŁSZ w przeciwnym przypadku.

        **Specyfikacja**
        Dane:
        *n* – długość słowa,
        *s*[1..*n*] – słowo zapisane jako tablica znaków (numerowanych od 1),
        *k1* – numer pierwszego sufiksu (1 ≤ *k1* ≤ *n*),
        *k2* – numer drugiego sufiksu (1 ≤ *k2* ≤ *n*, *k1* ≠ *k2*).
        Wynik:
        PRAWDA jeśli sufiks *s*[*k1*..*n*] jest mniejszy w porządku alfabetycznym od *s*[*k2*..*n*], albo FAŁSZ – w przeciwnym wypadku.

        \`\`\`pseudo
        czy_mniejszy (n, s, k1, k2)
            i ← k1
            j ← k2
            dopóki ( i ≤ n oraz j ≤ n ) wykonuj
                jeżeli ( s[i] == s[j] )
                    i ← i + 1
                    j ← j + 1
                w przeciwnym razie
                    jeżeli ( s[i] < s[j] )
                        zakończ z wynikiem PRAWDA
                    w przeciwnym razie
                        zakończ z wynikiem FAŁSZ
            jeżeli ( j ≤ n )
                zakończ z wynikiem PRAWDA
            w przeciwnym razie
                zakończ z wynikiem FAŁSZ
        \`\`\`
      `,
      files: ['slowa1.txt', 'slowa2.txt', 'slowa3.txt', 'sufiks_1.txt', 'sufiks_2.txt', 'slowa4.txt', 'sufiks_4.txt'],
      tasks: [
        {
          no: '2.1',
          points: 2,
          page: 10,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['napisy', 'analiza algorytmu'],
          text: md`
            Pierwsze dwie instrukcje **jeżeli** w funkcji *czy_mniejszy* wykonują porównania dwóch znaków słowa *s*.

            **Przykład:**
            dla danych *s* = mascarpone, *k1* = 5, *k2* = 2 algorytm wykona 3 porównania:
            - (pierwsza instrukcja **jeżeli**) – sprawdzenie, czy *s*[5] = *s*[2]
            - (pierwsza instrukcja **jeżeli**) – sprawdzenie, czy *s*[6] = *s*[3]
            - (druga instrukcja **jeżeli**) – sprawdzenie, czy *s*[6] < *s*[3]

            Podaj przykład słowa *s*, o długości ≤ 10 oraz liczb *k1*, *k2*, *k1* ≠ *k2*, dla których funkcja *czy_mniejszy* wykona dokładnie 6 porównań w pierwszej instrukcji **jeżeli**.

            *s* = {{s|14}}, *k1* = {{k1|4}}, *k2* = {{k2|4}}
          `,
          fields: { s: null, k1: null, k2: null },
          validate: (v) => {
            const s = String(v.s ?? '').trim();
            const k1 = Number(String(v.k1 ?? '').trim());
            const k2 = Number(String(v.k2 ?? '').trim());
            const wordOk = /^[a-z]{1,10}$/.test(s);
            const kOk = Number.isInteger(k1) && Number.isInteger(k2) && k1 !== k2 && k1 >= 1 && k2 >= 1 && k1 <= s.length && k2 <= s.length;
            if (!wordOk || !kOk) {
              return {
                ok: { s: wordOk, k1: kOk, k2: kOk },
                points: 0,
                note: !wordOk ? 'Słowo musi mieć od 1 do 10 małych liter a–z.' : 'k1 i k2 muszą być różnymi numerami pozycji w słowie (od 1 do jego długości).',
              };
            }
            const c = firstIfComparisons(s, k1, k2);
            const pts = c === 6 ? 2 : c === 5 || c === 7 ? 1 : 0;
            return { ok: { s: c === 6, k1: c === 6, k2: c === 6 }, points: pts, note: `Dla tych danych pierwsza instrukcja jeżeli wykona ${c} porównań.` };
          },
          rubric: md`
            2 pkt – poprawna odpowiedź.
            1 pkt – za podanie przykładu, dla którego algorytm wykona 5 lub 7 porównań w pierwszej instrukcji **jeżeli**.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe rozwiązania:

            *s* = ababababb, *k1* = 1, *k2* = 3

            *s* = aaaaaaaaaa, *k1* = 2, *k2* = 5

            (Program sprawdza Twoją odpowiedź, symulując funkcję *czy_mniejszy* – poprawnych odpowiedzi jest wiele. Uwaga: dla pierwszego przykładu z klucza funkcja wykonuje w pierwszej instrukcji **jeżeli** 7 porównań – ostatnie porównuje *s*[7] = a z *s*[9] = b; drugi przykład daje dokładnie 6.)
          `,
        },
        {
          no: '2.2',
          points: 2,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'porządek leksykograficzny'],
          text: md`
            W plikach \`slowa1.txt\`, \`slowa2.txt\` i \`slowa3.txt\` znajdują się po trzy wiersze:
            - w pierwszym wierszu każdego pliku zapisana jest liczba całkowita dodatnia *n*, oznaczająca długość słowa
            - w drugim wierszu zapisane jest *n*-literowe słowo *s*, składające się z małych liter alfabetu angielskiego a-z
            - w trzecim wierszu zapisane są dwie liczby *k1* i *k2*, oddzielone spacją.

            Napisz program z zaimplementowaną funkcją *czy_mniejszy*. Jako wynik Twój program powinien wypisywać TAK lub NIE, w zależności od wyniku funkcji *czy_mniejszy*. Odpowiedzi dla poszczególnych plików zapisz w pliku \`wyniki2_2.txt\`.

            Dla przykładowego pliku \`sufiks_1.txt\`, Twój program powinien dać odpowiedź: TAK, a dla przykładowego pliku \`sufiks_2.txt\` – odpowiedź: NIE.

            (odpowiedź dla każdego z plików powinna być poprzedzona jego nazwą)
          `,
          answerHint: 'Np. „slowa1.txt TAK”, każdy plik w osobnym wierszu.',
          example: { map: { 'slowa1.txt': 'sufiks_1.txt', 'slowa2.txt': 'sufiks_2.txt', 'slowa3.txt': 'sufiks_1.txt' }, expect: 'TAK NIE TAK' },
          expect: {
            parts: [{ items: ['TAK', 'NIE', 'NIE'], ordered: true, points: 2 }],
          },
          rubric: md`
            2 pkt – poprawna odpowiedź.
            1 pkt – za podanie prawidłowej odpowiedzi dla dwóch plików.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            slowa1.txt (TAK),
            slowa2.txt (NIE),
            slowa3.txt (NIE)
          `,
        },
        {
          no: '2.3',
          points: 3,
          page: 11,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['sortowanie', 'napisy', 'zapis algorytmu'],
          text: md`
            Dana jest dodatnia liczba całkowita *n* oraz słowo *s*[1..*n*]. Naszym celem jest obliczenie wartości elementów tablicy *T*[1..*n*] zawierającej numery sufiksów słowa *s*[1..*n*] uporządkowanych w porządku alfabetycznym.

            **Przykład:**
            dla słowa mascarpone wynikowa tablica *T* to [5, 2, 4, 10, 1, 9, 8, 7, 6, 3],
            dla słowa kalafiorowa wynikowa tablica *T* to [11, 4, 2, 5, 6, 1, 3, 7, 9, 8, 10].

            Z wykorzystaniem funkcji *czy_mniejszy*(*n*, *s*, *k1*, *k2*) zapisz w wybranej przez siebie notacji (w postaci pseudokodu lub w wybranym języku programowania) algorytm, który obliczy wartości elementów tablicy *T* zawierającej numery sufiksów zgodnie z porządkiem alfabetycznym sufiksów słowa *s*.

            **Uwaga:** w zapisie możesz wykorzystać tylko operacje arytmetyczne (dodawanie, odejmowanie, mnożenie, dzielenie, dzielenie całkowite, reszta z dzielenia), odwoływanie się do pojedynczych elementów tablicy, porównywanie liczb lub znaków, instrukcje sterujące i przypisania lub samodzielnie napisane funkcje zawierające wyżej wymienione operacje.

            **Specyfikacja**
            Dane:
            *n* – liczba całkowita dodatnia, długość słowa
            *s*[1..*n*] – słowo zapisane jako tablica znaków (numerowana od 1)
            Wynik:
            *T*[1..*n*] – tablica *T* taka, że *T*[*i*]-ty sufiks słowa *s* jest mniejszy w porządku alfabetycznym od *T*[*i*+1]-go sufiksu słowa *s* dla każdego 1 ≤ *i* < *n*.
          `,
          algo: {
            inputs: [
              { name: 'n', type: 'int', desc: 'długość słowa' },
              { name: 's', type: 'str', desc: 'słowo (małe litery a–z)' },
            ],
            outputs: [{ name: 'T', type: 'int[]', desc: 'numery sufiksów (od 1) w porządku alfabetycznym, oddzielone spacjami' }],
            examples: [
              { in: [10, 'mascarpone'], out: [[5, 2, 4, 10, 1, 9, 8, 7, 6, 3]] },
              { in: [11, 'kalafiorowa'], out: [[11, 4, 2, 5, 6, 1, 3, 7, 9, 8, 10]] },
            ],
            ref: (n, s) => suffixOrder(s),
            gen: (r) => {
              const n = r.pick([1, 2, 3, 5, 8, 12, 20, 40]);
              const s = r.str(n, r.pick(['ab', 'abc', 'abcdefghijklmnopqrstuvwxyz']));
              return [n, s];
            },
            random: 12,
          },
          rubric: md`
            3 pkt – poprawna odpowiedź, w tym:
            1 pkt – prawidłową organizację pętli sortujących (np. sortowanie bąbelkowe, przez wybór albo wstawianie),
            1 pkt – wypełnienie tablicy wartościami początkowymi (liczbami od 1 do *n*) oraz prawidłowe porównywanie elementów podczas sortowania (z wykorzystaniem funkcji *czy_mniejszy*),
            1 pkt – za prawidłowe przestawianie elementów tablicy podczas sortowania.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Wypełnienie tablicy początkowymi wartościami – liczbami od 1 do *n*, a następnie wykorzystanie dowolnego algorytmu sortowania (np. sortowanie bąbelkowe), w którym porównanie par liczb *T*[*i*], *T*[*j*] zastąpiono funkcją *czy_mniejszy*(*n*, *s*, *T*[*i*], *T*[*j*]), np.:

            \`\`\`pseudo
            dla i = 1, 2, …, n
                T[i] ← i
            dla i = 1, 2, …, n – 1
                dla j = 1, 2, …, n – i
                    jeżeli czy_mniejszy(n, s, T[j], T[j + 1]) = FAŁSZ
                        x ← T[j + 1]
                        T[j + 1] ← T[j]
                        T[j] ← x
            \`\`\`
          `,
        },
        {
          no: '2.4',
          points: 3,
          page: 13,
          kind: 'program',
          mainFile: 'slowa4.txt',
          cat: 'programowanie',
          topics: ['napisy', 'porządek leksykograficzny'],
          text: md`
            W pliku \`slowa4.txt\` znajduje się 10 wierszy. Każdy wiersz zawiera liczbę *n* (1 ≤ *n* ≤ 100) oraz *n*-literowe słowo *s* składające się z małych liter alfabetu angielskiego. Dane w wierszu są oddzielone znakiem odstępu.

            Napisz program, który dla każdego słowa *s* z pliku wypisze jego sufiks najmniejszy w porządku alfabetycznym.

            **Przykład:**
            Sufiksem najmniejszym w porządku alfabetycznym dla słowa mascarpone jest arpone, a dla słowa truskawki sufiksem najmniejszym w porządku alfabetycznym jest awki.

            Dla przykładowego pliku \`sufiks_4.txt\`, zawierającego tylko 4 wiersze (ze słowami: banan, mascarpone, abcaabbaabbccba, maturazinformatyki), Twój program powinien dać odpowiedź:

            \`\`\`
            an
            arpone
            a
            aturazinformatyki
            \`\`\`

            Wyniki zapisz w pliku \`wyniki2_4.txt\`, każdy sufiks w oddzielnym wierszu, zgodnie z kolejnością danych w pliku \`slowa4.txt\`.
          `,
          example: { map: { 'slowa4.txt': 'sufiks_4.txt' }, expect: { parts: [{ lines: ['an', 'arpone', 'a', 'aturazinformatyki'], ordered: true, points: 1 }] } },
          expect: {
            parts: [
              {
                lines: [
                  'ato',
                  'a',
                  'abracadabrad',
                  'abecadlo',
                  'aaababbbbcaababaz',
                  'a',
                  'aaababbbbcaababaaabcaabbccbbccbacbcaabbaabbccbbccbaaababbbbcaababaz',
                  'aaababbbbcaababaz',
                  'aaababbbbcaababacaacacaacaacaacacacacb',
                  'aaababbbbcacbabaaabcaabbccbbccbaabcaabbaabbccbbccbaaababbbbccababazbcabbab',
                ],
                ordered: true,
                points: 3,
              },
            ],
          },
          rubric: md`
            3 pkt – poprawna odpowiedź.
            2 pkt – prawidłowa odpowiedź dla pierwszych 5 słów.
            1 pkt – prawidłowa odpowiedź dla pierwszych 4 słów.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            \`\`\`
            ato
            a
            abracadabrad
            abecadlo
            aaababbbbcaababaz
            a
            aaababbbbcaababaaabcaabbccbbccbacbcaabbaabbccbbccbaaababbbbcaababaz
            aaababbbbcaababaz
            aaababbbbcaababacaacacaacaacaacacacacb
            aaababbbbcacbabaaabcaabbccbbccbaabcaabbaabbccbbccbaaababbbbccababazbcabbab
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Anagram binarny',
      intro: md`
        W pliku \`anagram.txt\` znajduje się 1000 wierszy. Każdy wiersz zawiera liczbę binarną, składającą się z maksymalnie 14 cyfr: 0 lub 1. Każda liczba zaczyna się jedynką i żadna z nich się nie powtarza.

        Napisz program(y), który(-e) da(-dzą) odpowiedzi do podanych zadań. Odpowiedzi do zadań zapisz w pliku \`wyniki3.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

        **Uwaga:** plik \`przyklad.txt\` zawiera 100 wierszy przykładowych danych spełniających warunki zadania. Odpowiedzi dla danych z pliku \`przyklad.txt\` są podane pod treściami zadań.
      `,
      files: ['anagram.txt', 'przyklad.txt'],
      tasks: [
        {
          no: '3.1',
          points: 2,
          page: 14,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe', 'napisy'],
          text: md`
            Liczbę binarną nazywamy *zrównoważoną*, gdy zawiera tyle samo zer i jedynek, natomiast *prawie zrównoważoną*, gdy liczba jedynek różni się od liczby zer o 1.

            **Przykład:**
            Liczba 101010 jest liczbą zrównoważoną.
            Liczba 1011010 jest liczbą prawie zrównoważoną.

            Podaj, ile jest liczb binarnych zrównoważonych oraz ile jest liczb binarnych prawie zrównoważonych w pliku \`anagram.txt\`.

            Dla danych z pliku \`przyklad.txt\` prawidłową odpowiedzią jest:

            \`\`\`
            21
            15
            \`\`\`
          `,
          answerHint: 'Najpierw liczba zrównoważonych, potem prawie zrównoważonych.',
          example: { map: { 'anagram.txt': 'przyklad.txt' }, expect: '21 15' },
          expect: {
            parts: [
              { label: 'liczby zrównoważone (118)', tokens: '118', points: 1 },
              { label: 'liczby prawie zrównoważone (219)', tokens: '219', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za podanie prawidłowej odpowiedzi dla obu rodzajów liczb.
            1 pkt – za podanie poprawnej odpowiedzi dla tylko jednego rodzaju liczb.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            118
            219
            \`\`\`
          `,
        },
        {
          no: '3.2',
          points: 3,
          page: 14,
          kind: 'program',
          cat: 'programowanie',
          topics: ['kombinatoryka', 'systemy liczbowe'],
          text: md`
            *Anagramy cyfrowe* to liczby utworzone z tego samego zestawu cyfr ustawionych w różnych kolejnościach. Przy tym pierwsza cyfra liczby nie może być równa zero.

            **Przykład:**
            Z liczby 209 zapisanej dziesiętnie można utworzyć 4 anagramy: 209, 902, 290, 920.
            Z liczby binarnej 11100 można utworzyć 6 różnych anagramów: 10011, 10101, 10110, 11001, 11010, 11100.

            Znajdź wszystkie takie liczby binarne 8-cyfrowe w pliku \`anagram.txt\`, z których można utworzyć największą liczbę anagramów. Wypisz te liczby w kolejności, w jakiej występują w pliku \`anagram.txt\`.

            Dla danych z pliku \`przyklad.txt\` prawidłową odpowiedzią jest:

            \`\`\`
            10001011
            10111000
            10100111
            11111000
            10011100
            11100011
            10111010
            10100011
            10011010
            10110001
            11011010
            \`\`\`
          `,
          example: {
            map: { 'anagram.txt': 'przyklad.txt' },
            expect: { parts: [{ lines: ['10001011', '10111000', '10100111', '11111000', '10011100', '11100011', '10111010', '10100011', '10011010', '10110001', '11011010'], ordered: true, points: 1 }] },
          },
          expect: { parts: [{ lines: ['10110101', '11010100', '10100101', '11001001', '10110100', '11001101', '11000110'], ordered: true, points: 3 }] },
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – podanie odpowiedzi uwzględniającej jedynie jeden z warunków, np. gdy liczba zer i jedynek jest jednakowa ALBO poprawne rozwiązanie zadania dla 7 lub 9-cyfrowej liczby dwójkowej.
            1 pkt – rozwiązanie zadania bez uwzględnienia warunku, że 1 musi być na początku liczby dwójkowej i uwzględniając jedynie jeden z warunków, np. gdy liczba zer i jedynek jest jednakowa.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            10110101
            11010100
            10100101
            11001001
            10110100
            11001101
            11000110
            \`\`\`
          `,
        },
        {
          no: '3.3',
          points: 2,
          page: 15,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe'],
          text: md`
            Podaj największą wartość bezwzględną różnicy między sąsiednimi liczbami (to jest liczbami zapisanymi w sąsiednich wierszach np. 1 i 2 wierszu, 2 i 3 wierszu itd.) w pliku \`anagram.txt\`. Tę wartość podaj w zapisie binarnym.

            Dla danych z pliku \`przyklad.txt\` prawidłową odpowiedzią jest:
            1110001010
          `,
          example: { map: { 'anagram.txt': 'przyklad.txt' }, expect: '1110001010' },
          expect: '10011000111001',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź podana w systemie dziesiętnym (9785) ALBO odpowiedź nie uwzględniająca wartości bezwzględnej (9729 / 10011000000001).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '10011000111001',
        },
        {
          no: '3.4',
          points: 4,
          page: 15,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe', 'cyfry liczby'],
          text: md`
            Zamień wszystkie liczby binarne z pliku \`anagram.txt\` na ich odpowiedniki w systemie dziesiętnym. Następnie spośród otrzymanych liczb dziesiętnych:

            a) podaj, ile jest takich, w których nie występuje cyfra zero
            b) podaj liczbę, która ma największą sumę różnych cyfr (jeśli liczb, które mają tę samą, największą sumę różnych cyfr, jest więcej niż jedna – podaj tę, która występuje jako pierwsza w pliku z danymi).

            **Przykład:**
            Dla liczby 20462 suma jej różnych cyfr to 12 (2+0+4+6), dla liczby 344 suma różnych cyfr to 7.

            Dla danych z pliku \`przyklad.txt\` prawidłową odpowiedzią jest:

            \`\`\`
            81
            895
            \`\`\`
          `,
          example: { map: { 'anagram.txt': 'przyklad.txt' }, expect: '81 895' },
          expect: {
            parts: [
              { label: 'a) liczby bez cyfry zero (728)', tokens: '728', points: 1 },
              { label: 'b) liczba o największej sumie różnych cyfr (7896)', tokens: '7896', points: 3 },
            ],
          },
          rubric: md`
            4 pkt – odpowiedź poprawna, w tym:
            1 pkt – za liczbę liczb bez zera,
            3 pkt – za liczbę z maksymalną sumą różnych cyfr
            (2 pkt – za podanie liczby z maksymalną sumą różnych cyfr, ale nie pierwszą występującą w pliku;
            1 pkt – za podanie liczby z maksymalną sumą cyfr – ale nie różnych).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            728
            7896
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '4',
      title: null,
      tasks: [
        {
          no: '4',
          points: 2,
          page: 16,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe'],
          text: md`
            Uzupełnij brakujące pola tabeli:
            – w wierszu pierwszym dla liczby zapisanej w systemie o podstawie 3 podaj jej zapis w systemie o podstawie 9
            – w wierszu drugim dla liczby zapisanej w systemie o podstawie 9 podaj jej zapis w systemie o podstawie 3.

            ${table(
              [
                ['**1.**', '101201<sub>3</sub>', '{{r1|10}} <sub>9</sub>'],
                ['**2.**', '{{r2|12}} <sub>3</sub>', '2487<sub>9</sub>'],
              ],
              { head: false, cls: 'compact' },
            )}
          `,
          fields: { r1: '351', r2: '2112221' },
          score: perField(1),
          rubric: md`
            2 pkt – odpowiedź poprawna w dwóch wierszach.
            1 pkt – odpowiedź poprawna w jednym wierszu.
            0 pkt – odpowiedź niepoprawna, niepełna albo brak rozwiązania.
          `,
          solution: md`
            1. 101201<sub>3</sub> = 351<sub>9</sub>
            2. 2112221<sub>3</sub> = 2487<sub>9</sub>
          `,
        },
      ],
    },
    {
      no: '5',
      title: null,
      tasks: [
        {
          no: '5',
          points: 1,
          page: 16,
          kind: 'tf',
          cat: 'teoria',
          topics: ['grafika komputerowa', 'systemy liczbowe', 'HTML/CSS'],
          text: md`
            Zapis koloru tła w arkuszu CSS został wyrażony w postaci

            \`background-color: #E9967A;\`
          `,
          statements: ['Zapis dziesiętny składowej czerwonej koloru #E9967A to 233.', 'Zmiana zapisu #E9967A na rgb(255,255,255) da w efekcie biały kolor tła.'],
          answer: 'PP',
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna (PP).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '1. P, 2. P',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '6',
      title: 'Fotowoltaika',
      intro: md`
        Pan Oszczędny pod koniec roku 2019 zamontował 18 paneli fotowoltaicznych na dachu swojego domu. Od 1 stycznia 2020 do 31 maja 2020 roku zapisywany był co godzinę przez całą dobę pobór prądu od dostawcy i generowany prąd przez panele fotowoltaiczne.

        W pliku \`fotowoltaika.txt\` zapisano datę i godzinę, pobór prądu z sieci energetycznej [kWh] oraz liczbę wygenerowanych kilowatogodzin przez panele. Dane w wierszach oddzielone są znakiem tabulacji.

        Gospodarstwo domowe Pana Oszczędnego w pierwszej kolejności zużywa prąd wygenerowany przez panele fotowoltaiczne. Jeżeli potrzeby są większe, to pobiera go z sieci energetycznej. Pobór równy 0 oznacza, że ogniwa wytwarzają co najmniej tyle energii, ile wynosiły potrzeby gospodarstwa domowego. Generowanie równe 0 oznacza, że panele nie produkują energii (z powodu braku nasłonecznienia).

        Przykładowy fragment pliku:

        ${sample(`Data_godzina\tPobor [kWh]\tGenerowanie [kWh]
        01.01.2020 01:00\t0,367\t0
        01.01.2020 02:00\t0,485\t0
        01.01.2020 03:00\t0,299\t0
        01.01.2020 04:00\t0,453\t0
        01.01.2020 05:00\t0,409\t0
        01.01.2020 06:00\t0,542\t0
        01.01.2020 07:00\t0,416\t0
        01.01.2020 08:00\t0,453\t0
        01.01.2020 09:00\t0,35\t0,001
        01.01.2020 10:00\t0,22\t0,02
        01.01.2020 11:00\t0,178\t0,07
        01.01.2020 12:00\t0,084\t0,158
        01.01.2020 13:00\t0,25\t0,165
        01.01.2020 14:00\t0,175\t0,238
        01.01.2020 15:00\t2,057\t0,129
        01.01.2020 16:00\t1,051\t0
        01.01.2020 17:00\t2,179\t0`)}

        Z wykorzystaniem dostępnych narzędzi informatycznych podaj odpowiedzi do poniższych zadań. Odpowiedzi zapisz w pliku \`wyniki6.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['fotowoltaika.txt'],
      sheet: { file: 'fotowoltaika.txt' },
      tasks: [
        {
          no: '6.1',
          points: 2,
          page: 17,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['daty', 'zestawienia'],
          text: md`Podaj dzień, w którym panele wytworzyły łącznie w ciągu całego dnia najwięcej energii liczonej w kWh. Podaj datę i liczbę wygenerowanych kilowatogodzin.`,
          expect: {
            parts: [
              { label: 'data (7.04.2020)', tokens: '07.04.2020', points: 1 },
              { label: 'liczba kWh (41,582)', tokens: '41,582', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za datę,
            1 pkt – za wartość.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '7.04.2020 41,582',
        },
        {
          no: '6.2',
          points: 2,
          page: 17,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['funkcje warunkowe', 'zestawienia'],
          text: md`O której godzinie najczęściej zdarzała się sytuacja, że energia wytworzona przez ogniwa pokrywa w całości zapotrzebowanie gospodarstwa (pobór z sieci wynosił 0)? Podaj tę godzinę i liczbę dni, w których pobór z sieci wynosił 0 o tej godzinie.`,
          answerHint: 'Np. „10:00 35” – godzina i liczba dni.',
          expect: {
            parts: [
              { label: 'godzina (10:00)', tokens: '10', points: 1 },
              { label: 'liczba dni (35)', tokens: '35', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za częstotliwość,
            1 pkt – za godzinę.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '35 razy o 10.00',
        },
        {
          no: '6.3',
          points: 3,
          page: 18,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy', 'funkcje statystyczne'],
          text: md`Utwórz zestawienie średniej liczby wygenerowanych kWh w poszczególnych godzinach. Wartości zapisz z dokładnością do czterech miejsc po przecinku. Dla swojego zestawienia utwórz wykres kolumnowy. Pamiętaj o prawidłowym opisie osi oraz o tytule wykresu.`,
          answerHint: '24 wiersze: godzina i średnia, od godziny 0 do 23.',
          expect: {
            parts: [
              {
                label: 'zestawienie',
                lines: ['0 0', '1 0', '2 0', '3 0', '4 0', '5 0', '6 0,0032', '7 0,1141', '8 0,5249', '9 1,3305', '10 2,1241', '11 2,4261', '12 2,6104', '13 2,4179', '14 2,2165', '15 1,6906', '16 0,8749', '17 0,3692', '18 0,0966', '19 0,0186', '20 0,0022', '21 0', '22 0', '23 0'],
                ordered: true,
                points: 1,
              },
            ],
          },
          self: { points: 2, label: 'wykres', hint: 'Opis wykresu (1 pkt) oraz typ wykresu i dobór danych (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za poprawne zestawienie,
            2 pkt – wykres (w tym 1 punkt za opis i 1 punkt za typ wykresu i dobór danych).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['godzina', 'średnia liczba wygenerowanych kWh'],
            ['0', '0'],
            ['1', '0'],
            ['2', '0'],
            ['3', '0'],
            ['4', '0'],
            ['5', '0'],
            ['6', '0,0032'],
            ['7', '0,1141'],
            ['8', '0,5249'],
            ['9', '1,3305'],
            ['10', '2,1241'],
            ['11', '2,4261'],
            ['12', '2,6104'],
            ['13', '2,4179'],
            ['14', '2,2165'],
            ['15', '1,6906'],
            ['16', '0,8749'],
            ['17', '0,3692'],
            ['18', '0,0966'],
            ['19', '0,0186'],
            ['20', '0,0022'],
            ['21', '0'],
            ['22', '0'],
            ['23', '0'],
          ]),
        },
        {
          no: '6.4',
          points: 2,
          page: 18,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja', 'funkcje warunkowe'],
          text: md`
            Pan Oszczędny rozważa rozbudowę systemu generowania energii za pomocą ogniw fotowoltaicznych. Bazą do obliczeń są wszystkie dane z kwietnia 2020 roku.

            Podaj minimalną liczbę paneli, o którą należałoby powiększyć system, aby przy kwietniowym zużyciu prądu i kwietniowym nasłonecznieniu, w godzinach od 10 do 15 system nie pobierał prądu z zakładu energetycznego.
          `,
          expect: '10',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź 9.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '10',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Instalacje',
      intro: md`
        W bazie danych firmy X zawarte są informacje o instalacjach pewnej aplikacji, o urządzeniach, na których ta aplikacja została zainstalowana, oraz o krajach, w których przeprowadzono instalację.

        Dane zgromadzono w plikach tekstowych: \`kraje.txt\`, \`instalacje.txt\` oraz \`urzadzenia.txt\`. Pierwszy wiersz każdego z plików jest wierszem nagłówkowym, a dane w wierszach rozdzielone są znakami tabulacji.

        Plik o nazwie \`kraje.txt\` zawiera informacje o krajach, w których instalowano aplikację. W każdym wierszu pliku znajdują się następujące dane:
        - *kod_k* – kod kraju (napis dwuznakowy)
        - *nazwa_k* – nazwa kraju (napis do 50 znaków)
        - *ludnosc_k* – ludność kraju (liczba całkowita do 10 cyfr określająca liczbę ludności).

        **Przykład:**

        ${sample(`kod_k\tnazwa_k\tludnosc_k
        AN\tNETHERLANDS ANTILES\t227049
        CR\tCOSTA RICA\t5003393
        DZ\tALGERIA\t42545964`)}

        Plik o nazwie \`urzadzenia.txt\` zawiera informacje o urządzeniach, na których może być instalowana aplikacja. W każdym wierszu pliku znajdują się następujące informacje:
        - *kod_u* – unikatowy kod (liczba całkowita co najwyżej 5-cyfrowa)
        - *nazwa_u* – nazwa urządzenia (napis do 80 znaków)
        - *producent_u* – producent urządzenia (napis do 35 znaków)
        - *typ_u* – typ urządzenia (napis: Tablet, Phone lub PC).

        **Uwaga:** nazwa urządzenia nie jest unikatowa – w tabeli mogą występować dwa lub więcej urządzenia o tej samej nazwie.

        **Przykład:**

        ${sample(`kod_u\tnazwa_u\tproducent_u\ttyp_u
        12410\tPLATINUM_E5\tSky Devices\tPhone
        6549\tIlium L1120\tLanix\tPhone`)}

        Plik o nazwie \`instalacje.txt\` zawiera informacje o instalacjach aplikacji. W każdym wierszu pliku znajdują się następujące informacje:
        - *data_i* – data instalacji (w formacie dd.mm.rrrr)
        - *kod_u* – kod urządzenia, na którym była wykonana instalacja (liczba całkowita co najwyżej 5-cyfrowa)
        - *kod_k* – kod kraju, w którym znajdowało się to urządzenie (napis dwuznakowy).

        **Uwaga:** *kod_u* nie oznacza pojedynczego egzemplarza urządzenia, a tylko jego rodzaj – to znaczy na urządzeniach o tym samym kodzie może być wykonanych wiele instalacji.

        **Przykład:**

        ${sample(`data_i\tkod_k\tkod_u
        01.03.2019\tAM\t145
        01.03.2019\tAR\t804
        01.03.2019\tAT\t12632`)}

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych, podaj odpowiedzi do zadań 7.1.–7.4. Odpowiedzi zapisz w pliku \`wyniki7.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['kraje.txt', 'instalacje.txt', 'urzadzenia.txt'],
      tables: { kraje: 'kraje.txt', instalacje: 'instalacje.txt', urzadzenia: 'urzadzenia.txt' },
      tasks: [
        {
          no: '7.1',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie'],
          text: md`Dla każdego typu urządzenia podaj liczbę instalacji aplikacji na tym typie urządzenia.`,
          expect: {
            parts: [
              { label: 'PC', lines: ['PC 16'], points: 1 },
              { label: 'Phone', lines: ['Phone 2814'], points: 1 },
              { label: 'Tablet', lines: ['Tablet 267'], points: 0 },
            ],
            score: (oks) => (oks.every(Boolean) ? 2 : oks.some(Boolean) ? 1 : 0),
          },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź poprawna dla jednego lub dwóch typów urządzeń.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['typ_u', 'liczba_instalacji'],
            ['PC', '16'],
            ['Phone', '2814'],
            ['Tablet', '267'],
          ]),
        },
        {
          no: '7.2',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'daty', 'grupowanie'],
          text: md`Podaj nazwę producenta urządzeń, dla którego w lutym 2019 wykonano najwięcej instalacji. Podaj liczbę tych instalacji.`,
          expect: {
            parts: [
              { label: 'producent (Samsung)', tokens: 'samsung', points: 1 },
              { label: 'liczba instalacji (478)', tokens: '478', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za nazwę,
            1 pkt – za liczbę.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: 'samsung 478',
        },
        {
          no: '7.3',
          points: 3,
          page: 20,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie', 'obliczenia'],
          text: md`
            Podaj nazwy pięciu krajów, w których przeprowadzono najwięcej instalacji w przeliczeniu na 1 000 000 mieszkańców, oraz podaj liczby tych instalacji.
            Dla każdego z tych pięciu krajów podaj liczbę instalacji na 1 000 000 mieszkańców z dokładnością do dwóch miejsc po przecinku.

            **Uwaga:** pomiń kraje, w których jest mniej niż milion mieszkańców.
          `,
          expect: {
            parts: [
              { label: 'nazwy krajów', items: ['SWITZERLAND', 'SLOVENIA', 'IRELAND', 'AUSTRIA', 'CZECH REPUBLIC'], points: 1 },
              { label: 'liczby instalacji na 1 000 000 mieszkańców (zaokrąglone)', lines: ['SWITZERLAND 5,28', 'SLOVENIA 4,35', 'IRELAND 3,91', 'AUSTRIA 3,84', 'CZECH REPUBLIC 3,76'], points: 2 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za nazwy krajów,
            1 pkt – za wyliczenie wyniku,
            1 pkt – za zaokrąglenie wyniku.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['nazwa_k', 'liczba'],
            ['SWITZERLAND', '5,28'],
            ['SLOVENIA', '4,35'],
            ['IRELAND', '3,91'],
            ['AUSTRIA', '3,84'],
            ['CZECH REPUBLIC', '3,76'],
          ]),
        },
        {
          no: '7.4',
          points: 2,
          page: 20,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'COUNT DISTINCT'],
          text: md`Podaj kod oraz nazwę urządzenia typu tablet („Tablet”), na którym zainstalowano aplikację w największej liczbie krajów. Podaj także liczbę krajów, w których instalowano aplikację na tym urządzeniu.`,
          expect: {
            parts: [
              { label: 'kod i nazwa (11935 Galaxy Tab A (2016))', tokens: '11935 Galaxy Tab A 2016', points: 1 },
              { label: 'liczba krajów (20)', tokens: '11935 20', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za podanie kodu i nazwy,
            1 pkt – za podanie liczby krajów.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '11935 Galaxy Tab A (2016) 20',
        },
        {
          no: '7.5',
          points: 2,
          page: 20,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'grupowanie'],
          text: md`
            Do istniejących już tabel bazy danych dołączono tabelę *firmy* zawierającą dane firm, w których wykonywano instalacje aplikacji.

            Tabela *firmy* zawiera pola *id_firmy* (identyfikator firmy – klucz podstawowy) oraz *nazwa* – nazwa firmy.

            Do tabeli *instalacje* (zawierającej dane z pliku \`instalacje.txt\`) dodano pole *id_firmy* wskazujące, w której firmie na należących do niej urządzeniach wykonano instalację.

            Tabele *firmy* i *instalacje* połączone są relacją jeden do wielu.

            Zapisz w języku SQL zapytanie, w którym dla każdej nazwy firmy z tabeli *firmy* zliczysz liczbę instalacji wykonanych w tej firmie. Wynik posortuj nierosnąco według liczby instalacji.
          `,
          extraTables: { firmy: ['id_firmy INTEGER PRIMARY KEY', 'nazwa TEXT'] },
          extraColumns: { instalacje: ['id_firmy INTEGER'] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym błędem (np. brak grupowania, błąd w JOIN, sortowanie niemalejąco).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Przykładowa odpowiedź:

            \`\`\`sql
            SELECT firmy.nazwa, count(*) AS liczba
            FROM firmy
            INNER JOIN instalacje ON firmy.id_firmy = instalacje.id_firmy
            GROUP BY firmy.id_firmy
            ORDER BY count(*) DESC
            \`\`\`
          `,
        },
      ],
    },
  ],
};
