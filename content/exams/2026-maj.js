import { md, table, sample, all, perField, byCount, evalExpr, parseCalls } from '../lib.js';

const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

// Zadanie 1: A(m, n)
function callsOf(m, n) {
  const calls = [];
  while (n > 1) {
    if (n % 2 === 0) {
      m = 2 * m;
      n = n / 2;
    } else n = (n - 1) / 2;
    calls.push([m, n]);
  }
  return calls;
}

const near = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b));

function callsMatch(text, expected) {
  const got = parseCalls(text);
  return got.length === expected.length && got.every((args, i) => args.length === 2 && near(evalExpr(args[0]), expected[i][0]) && near(evalExpr(args[1]), expected[i][1]));
}

function carries(a, b) {
  let p = 0;
  let w = 0;
  while (a > 0) {
    const s = (a % 10) + (b % 10) + w;
    w = s >= 10 ? 1 : 0;
    p += w;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return p;
}

const TEMP_71 = ['1,1', '4,1', '4,1', '7,4', '15,9', '20,5', '20,4', '21,1', '13,7', '12,5', '5,2', '1,6'];
const DRY_72 = ['11', '7', '20', '8', '20', '11', '10', '8', '14', '15', '10', '10'];
const MONTHS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

const PAIRS_33 = [
  ['bbbbaabbababbaaaa', 'baaaaabaaabbbabab', 5],
  ['aababbbababbbbbbaab', 'bbbbaabbababababa', 7],
  ['aaaababaaaabbbb', 'aabbbbbabbbaaaa', 6],
  ['bbbbabaaabbbabb', 'aaababaabbbbbbba', 5],
  ['ccccabacbba', 'acbbabcbcbcbaa', 5],
  ['caabbccabccc', 'cabccccabbaac', 6],
  ['abaacabcccccabbbc', 'abbbcbbbbbcabaca', 5],
];

const SUB_41 = { 1: [2, 7], 3: [1, 1], 4: [1, 1], 5: [0, 0], 6: [0, 0], 7: [0, 0] };

export default {
  id: '2026-maj',
  year: 2026,
  session: 'maj',
  term: 'termin główny',
  date: '2026-05-14',
  dateText: '14 maja 2026 r.',
  symbol: 'MINP-R0-100-2605',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2026-maj-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2026-maj-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Rekurencja',
      intro: md`
        Dana jest zdefiniowana rekurencyjnie funkcja *A*(*m*, *n*), gdzie *m* i *n* są dodatnimi liczbami całkowitymi.

        <div class="formula">*A*(*m*, *n*) = <span class="cases"><span>*m* — gdy *n* = 1</span><span>*A*(2 · *m*, ${frac('n', '2')}) — gdy *n* > 1 oraz *n* jest podzielne przez 2</span><span>2 · *A*(*m*, ${frac('n – 1', '2')}) + *m* — gdy *n* > 1 oraz *n* nie jest podzielne przez 2</span></span></div>
      `,
      tasks: [
        {
          no: '1.1',
          points: 3,
          page: 4,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'potęgi dwójki', 'analiza algorytmu'],
          text: md`
            Obliczenie wartości funkcji *A*(3, 9) wprost z definicji wymaga trzech wywołań rekurencyjnych: *A*(3, 4), *A*(6, 2), *A*(12, 1), ponieważ:

            *A*(3, 9) = 2 · *A*(3, 4) + 3 = 2 · *A*(6, 2) + 3 = 2 · *A*(12, 1) + 3 = 2 · 12 + 3 = 27

            Uzupełnij poniższą tabelę. Podaj liczbę wywołań rekurencyjnych funkcji *A* oraz wypisz wywołania rekurencyjne wraz z ich argumentami (w ostatnim wierszu podaj tylko liczbę wywołań rekurencyjnych).

            ${table([
              ['*m*', '*n*', 'liczba wywołań rekurencyjnych funkcji *A*', 'wywołania rekurencyjne funkcji *A*'],
              ['3', '9', '3', '*A*(3, 4), *A*(6, 2), *A*(12, 1)'],
              ['2<sup>5</sup>', '2<sup>5</sup>', '{{c1|4}}', '{{w1|40}}'],
              ['10', '15', '{{c2|4}}', '{{w2|40}}'],
              ['1', '2<sup>100</sup> + 1', '{{c3|4}}', ''],
            ])}

            Wywołania wpisz np. jako \`A(2^6, 2^4), A(2^7, 2^3), …\` albo z obliczonymi wartościami.
          `,
          fields: { c1: null, w1: null, c2: null, w2: null, c3: null },
          validate: (v) => {
            const ok = {
              c1: evalExpr(v.c1) === 5,
              w1: callsMatch(v.w1, callsOf(32, 32)),
              c2: evalExpr(v.c2) === 3,
              w2: callsMatch(v.w2, callsOf(10, 15)),
              c3: evalExpr(v.c3) === 100,
            };
            const n = Object.values(ok).filter(Boolean).length;
            return { ok, points: n === 5 ? 3 : n === 4 ? 2 : n >= 2 ? 1 : 0 };
          },
          rubric: md`
            3 pkt – odpowiedź poprawna w 5 polach tabeli.
            2 pkt – odpowiedź poprawna w 4 polach tabeli.
            1 pkt – odpowiedź poprawna dla co najmniej dwóch pól tabeli.
            0 pkt – odpowiedź niepoprawna lub niepełna albo brak rozwiązania.
          `,
          solution: table([
            ['*m*', '*n*', 'liczba wywołań rekurencyjnych', 'wywołania rekurencyjne funkcji *A*'],
            ['3', '9', '3', '*A*(3, 4), *A*(6, 2), *A*(12, 1)'],
            ['2<sup>5</sup>', '2<sup>5</sup>', '5', '*A*(2<sup>6</sup>, 2<sup>4</sup>), *A*(2<sup>7</sup>, 2<sup>3</sup>), *A*(2<sup>8</sup>, 2<sup>2</sup>), *A*(2<sup>9</sup>, 2<sup>1</sup>), *A*(2<sup>10</sup>, 2<sup>0</sup>)'],
            ['10', '15', '3', '*A*(10, 7), *A*(10, 3), *A*(10, 1)'],
            ['1', '2<sup>100</sup> + 1', '100', ''],
          ]),
        },
        {
          no: '1.2',
          points: 1,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'analiza algorytmu'],
          text: md`
            Uzupełnij poniższą tabelę. Podaj wartości funkcji *A*(*m*, *n*) dla zadanych argumentów *m* i *n*:

            ${table([
              ['*m*', '*n*', '*A*(*m*, *n*)'],
              ['1', '777', '{{a|24}}'],
              ['2 · 10<sup>6</sup>', '256 · 10<sup>6</sup>', '{{b|24}}'],
            ])}

            **Uwaga:** W swoich odpowiedziach możesz zapisać wynik podobnie jak wartości w pierwszych dwóch kolumnach (z wykorzystaniem operatorów mnożenia i potęgowania), np. \`3*10^5\`.
          `,
          fields: { a: null, b: null },
          validate: (v) => {
            const ok = { a: evalExpr(v.a) === 777, b: near(evalExpr(v.b), 512e12) };
            return { ok, points: ok.a && ok.b ? 1 : 0 };
          },
          rubric: md`
            1 pkt – odpowiedź poprawna w 2 wierszach tabeli.
            0 pkt – odpowiedź niepoprawna lub niepełna albo brak rozwiązania.
          `,
          solution: md`
            777
            512 · 10<sup>12</sup> = 512 000 000 000 000
          `,
        },
        {
          no: '1.3',
          points: 3,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'potęgi dwójki', 'analiza algorytmu'],
          text: md`
            Uzupełnij tabelę. W drugiej kolumnie podaj liczbę wywołań rekurencyjnych funkcji *A* dla każdej wartości *n* podanej w tabeli (drugiego argumentu wywołania funkcji, pierwszy jest nieistotny w tym zadaniu). W trzeciej kolumnie podaj wyrażenie, którego wartość jest równa drugiemu argumentowi funkcji w *i*-tym wywołaniu rekurencyjnym dla wszystkich wartości *i* większych bądź równych 1 i mniejszych bądź równych całkowitej liczbie wywołań.

            ${table([
              ['*n* – drugi argument wywołania funkcji', 'liczba wywołań rekurencyjnych', 'wartość drugiego argumentu *A* w *i*-tym wywołaniu rekurencyjnym'],
              ['8', '3', `${frac('8', '2<sup>i</sup>')} (lub 2<sup>3 – i</sup>)`],
              ['2<sup>*k*</sup>', '{{n1|8}}', '{{e1|20}}'],
              ['2<sup>*k*</sup> – 1', '{{n2|8}}', '{{e2|20}}'],
            ])}

            gdzie *k* jest pewną liczbą całkowitą dodatnią większą od 2.

            Wyrażenia zapisz np. jako \`2^(k-i)\`; część całkowitą możesz zapisać jako \`floor(...)\` albo \`div\`.
          `,
          fields: { n1: null, e1: null, n2: null, e2: null },
          validate: (v) => {
            const ks = [3, 4, 5, 6, 7, 9, 12];
            const ok = {
              n1: ks.every((k) => evalExpr(v.n1, { k }) === k),
              n2: ks.every((k) => evalExpr(v.n2, { k }) === k - 1),
              e1: ks.every((k) => Array.from({ length: k }, (_, j) => j + 1).every((i) => near(evalExpr(v.e1, { k, i }), 2 ** (k - i)))),
              e2: ks.every((k) => Array.from({ length: k - 1 }, (_, j) => j + 1).every((i) => near(evalExpr(v.e2, { k, i }), 2 ** (k - i) - 1))),
            };
            const n = Object.values(ok).filter(Boolean).length;
            return { ok, points: n === 4 ? 3 : n === 3 ? 2 : n === 2 ? 1 : 0, note: 'Wyrażenia sprawdzono, podstawiając różne wartości k i i.' };
          },
          rubric: md`
            3 pkt – odpowiedź poprawna w 4 polach tabeli.
            2 pkt – odpowiedź poprawna w 3 polach tabeli.
            1 pkt – odpowiedź poprawna w 2 polach tabeli.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: table([
            ['*n*', 'liczba wywołań rekurencyjnych', 'wartość drugiego argumentu *A* w *i*-tym wywołaniu'],
            ['8', '3', `${frac('8', '2<sup>i</sup>')} (lub 2<sup>3 – i</sup>)`],
            ['2<sup>*k*</sup>', '*k*', '2<sup>*k* – *i*</sup>'],
            ['2<sup>*k*</sup> – 1', '*k* – 1', `2<sup>*k* – *i*</sup> – 1 (lub ⌊${frac('2<sup>k</sup> – 1', '2<sup>i</sup>')}⌋)`],
          ]),
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Dodawanie',
      intro: md`
        Rozważamy dodawanie pisemne dwóch liczb zapisanych w systemie dziesiętnym, zilustrowane na przykładzie.

        ${table(
          [
            ['Przeniesienie:', '', '1', '1', '', '1', '1', ''],
            ['Liczba *a*:', '', '', '2', '7', '7', '3', '2'],
            ['Liczba *b*:', '+', '', '7', '2', '6', '1', '9'],
            ['', '', '1', '0', '0', '3', '5', '1'],
          ],
          { head: false, cls: 'compact center' },
        )}

        W tym przykładzie mamy 4 przeniesienia.
      `,
      tasks: [
        {
          no: '2.1',
          points: 1,
          page: 7,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['dodawanie pisemne', 'cyfry liczby'],
          text: md`
            Dla danych dwóch liczb: *a* i *b*, podaj, ile razy pojawiają się przeniesienia podczas ich dodawania.

            ${table([
              ['Liczba *a*', 'Liczba *b*', 'Liczba przeniesień'],
              ['37932', '12528', '3'],
              ['88765', '11111', '{{a|4}}'],
              ['456789', '222222', '{{b|4}}'],
            ])}
          `,
          fields: { a: '0', b: '3' },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna lub niepełna albo brak rozwiązania.
          `,
          solution: table([
            ['Liczba *a*', 'Liczba *b*', 'Liczba przeniesień'],
            ['37932', '12528', '3'],
            ['88765', '11111', '0'],
            ['456789', '222222', '3'],
          ]),
        },
        {
          no: '2.2',
          points: 4,
          page: 8,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['dodawanie pisemne', 'cyfry liczby', 'zapis algorytmu'],
          text: md`
            Zapisz w pseudokodzie lub w wybranym języku programowania algorytm, który dla danych dwóch liczb całkowitych dodatnich *a* i *b*, o tej samej liczbie cyfr w zapisie dziesiętnym, obliczy liczbę przeniesień otrzymanych w trakcie ich dodawania pisemnego.

            **Przykład:** dla liczb 27732 i 72619 wynik to 4.

            **Uwaga:** Twój algorytm może operować wyłącznie na liczbach całkowitych i używać tylko zmiennych przechowujących pojedyncze liczby całkowite. W zapisie algorytmu możesz korzystać tylko z operatorów arytmetycznych: dodawania, odejmowania, mnożenia, dzielenia, dzielenia całkowitego i reszty z dzielenia; z operatorów logicznych, porównań, instrukcji sterujących, instrukcji przypisania lub samodzielnie napisanych funkcji i procedur wykorzystujących powyższe operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów innych niż wymienione, dostępnych w językach programowania, nie wolno zwłaszcza korzystać z tablic/list oraz żadnych funkcji zamiany z typu znakowego lub napisowego na liczbowy – i odwrotnie.

            **Specyfikacja:**
            Dane:
            *a*, *b* – dodatnie liczby całkowite o tej samej liczbie cyfr
            Wynik:
            *p* – liczba przeniesień otrzymanych w trakcie dodawania pisemnego liczb *a* i *b*
          `,
          algo: {
            inputs: [
              { name: 'a', type: 'int', desc: 'dodatnia liczba całkowita' },
              { name: 'b', type: 'int', desc: 'dodatnia liczba całkowita o tej samej liczbie cyfr co a' },
            ],
            outputs: [{ name: 'p', type: 'int', desc: 'liczba przeniesień' }],
            examples: [
              { in: [27732, 72619], out: [4] },
              { in: [37932, 12528], out: [3] },
              { in: [88765, 11111], out: [0] },
              { in: [456789, 222222], out: [3] },
            ],
            ref: carries,
            gen: (r) => {
              const d = r.int(1, 15);
              const lo = 10 ** (d - 1);
              const hi = 10 ** d - 1;
              const pick = () => r.pick([lo, hi, r.int(lo, hi), r.int(lo, hi)]);
              return [pick(), pick()];
            },
            random: 14,
            noBuiltins: 'conversion',
          },
          rubric: md`
            4 pkt – poprawny algorytm, w tym:
            1 pkt – poprawna pętla po liczbie cyfr *a* (i *b*)
            1 pkt – poprawne pobieranie cyfr liczb *a* i *b*
            1 pkt – poprawne liczenie poszczególnych sum cyfr liczb *a* i *b* z uwzględnieniem przeniesienia oraz obliczenie tego przeniesienia (kolejnej liczby w pamięci)
            1 pkt – otrzymanie poprawnego wyniku (z uwzględnieniem ustawień początkowych).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Przykładowa odpowiedź:

            \`\`\`pseudo
            wpamieci ← 0
            p ← 0
            dopóki a > 0 wykonuj
                cyfraa ← a mod 10
                cyfrab ← b mod 10
                suma ← cyfraa + cyfrab + wpamieci
                jeżeli suma ≥ 10
                    wpamieci ← 1
                    p ← p + 1
                w przeciwnym wypadku
                    wpamieci ← 0
                a ← a div 10
                b ← b div 10
            \`\`\`

            Za każde inne, całkowicie poprawne rozwiązanie spełniające warunki zadania, przyznaje się maksymalną liczbę punktów.
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Pary słów',
      intro: md`
        W pliku tekstowym \`pary.txt\` znajduje się 500 par słów złożonych z liter alfabetu angielskiego a, b, …, z. Każda para słów jest zapisana w osobnym wierszu. Słowa w wierszu są oddzielone pojedynczym odstępem, a długość każdego z nich nie przekracza 50 znaków.

        Pierwszych pięć wierszy pliku \`pary.txt\` zawiera następujące pary słów:

        \`\`\`
        bcba babb
        abaa ccc
        bcb abbba
        bca cdd
        aadc ddcdccaba
        \`\`\`

        Napisz program (lub kilka programów), który(-e) znajdzie(-ą) i da(dzą) odpowiedzi do podanych zadań. Odpowiedzi do poszczególnych zadań zapisz w pliku \`wyniki3.txt\`. Każdą odpowiedź poprzedź numerem oznaczającym zadanie.

        Do dyspozycji masz plik \`pary_przyklad.txt\`, który zawiera 500 par słów. Odpowiedzi dla tego pliku podano w treściach zadań. Możesz sprawdzać na nim działanie swojego programu.

        **Uwaga:** Pamiętaj, że Twój program musi ostatecznie działać na pliku \`pary.txt\`.
      `,
      files: ['pary.txt', 'pary_przyklad.txt'],
      tasks: [
        {
          no: '3.1',
          points: 2,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'kody ASCII'],
          text: md`
            Niech *f*(*s*) oznacza sumę kodów ASCII znaków występujących w słowie *s*.
            Podaj parę słów *s*<sub>1</sub>, *s*<sub>2</sub> występujących w jednym wierszu pliku \`pary.txt\`, dla których wartość |*f*(*s*<sub>1</sub>) – *f*(*s*<sub>2</sub>)| (wartość bezwzględna różnicy sum kodów ASCII) jest największa, oraz podaj tę wartość. Jest tylko jedna taka para słów w pliku.

            **Przykład:**
            Dla pary słów oko i pies, mamy następujące wartości
            *f*(oko) = 111 + 107 + 111 = 329
            *f*(pies) = 112 + 105 + 101 + 115 = 433
            oraz |*f*(oko) – *f*(pies)| = 104.

            Dla pliku \`pary_przyklad.txt\` poprawną odpowiedzią jest
            \`eddcd eededcddceeecededcc 1403\`
          `,
          example: { map: { 'pary.txt': 'pary_przyklad.txt' }, expect: 'eddcd eededcddceeecededcc 1403' },
          expect: {
            parts: [
              { label: 'para słów', tokens: 'gpeeazeugmvsbzwsrxfplqdbakoxxe lhpbmoirdm', points: 1 },
              { label: 'wartość (2206)', tokens: '2206', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – podanie poprawnej pary oraz poprawnej wartości.
            1 pkt – podanie tylko poprawnej pary albo poprawnej wartości.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '`gpeeazeugmvsbzwsrxfplqdbakoxxe lhpbmoirdm 2206`',
        },
        {
          no: '3.2',
          points: 3,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'zliczanie'],
          text: md`
            Wspólną liczbę wystąpień litery *x* w słowach *s*<sub>1</sub>, *s*<sub>2</sub> oznaczymy przez *W*(*x*, *s*<sub>1</sub>, *s*<sub>2</sub>) i definiujemy jako

            *W*(*x*, *s*<sub>1</sub>, *s*<sub>2</sub>) = minimum(*d*(*x*, *s*<sub>1</sub>), *d*(*x*, *s*<sub>2</sub>))

            gdzie *d*(*x*, *s*) oznacza liczbę wystąpień litery *x* w słowie *s*.

            Podaj parę słów występujących w jednym wierszu w pliku \`pary.txt\`, dla której suma wspólnych wystąpień wszystkich liter jest największa, oraz podaj tę sumę. Jest jedna taka para.

            **Przykład:**
            Dla poniższej pary słów wypisano wspólną liczbę wystąpień wszystkich liter (wyniki wypisano w kolejności alfabetycznej):
            adabbcdde aadabbbccdc → a: 2, b: 2, c: 1, d: 2, e: 0
            Suma wspólnych wystąpień wszystkich liter dla pary z tego przykładu wynosi: 2 + 2 + 1 + 2 = 7.

            Dla pliku \`pary_przyklad.txt\` poprawną odpowiedzią jest
            \`ccccdcedddddecde ccdcdddecc 10\`
          `,
          example: { map: { 'pary.txt': 'pary_przyklad.txt' }, expect: 'ccccdcedddddecde ccdcdddecc 10' },
          expect: {
            parts: [
              { label: 'para słów', tokens: 'aacbcccaacacbcabac cccccaaaacaccbabcba', points: 2 },
              { label: 'suma (18)', tokens: '18', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            2 pkt – para słów
            1 pkt – liczba.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '`aacbcccaacacbcabac cccccaaaacaccbabcba 18`',
        },
        {
          no: '3.3',
          points: 4,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'prefiksy i sufiksy'],
          text: md`
            *Prefiksosufiksem* pary słów *s*<sub>1</sub>, *s*<sub>2</sub> nazywamy słowo, które jest początkiem *s*<sub>1</sub> (czyli *s*<sub>1</sub> zaczyna się tym słowem) oraz końcem *s*<sub>2</sub> (czyli *s*<sub>2</sub> kończy się tym słowem) lub początkiem *s*<sub>2</sub> oraz końcem *s*<sub>1</sub>.

            Podaj wszystkie pary słów z pliku \`pary.txt\`, dla których najdłuższy prefiksosufiks ma co najmniej 5 liter. Dla każdej podanej w odpowiedzi pary słów podaj długość najdłuższego prefiksosufiksu tej pary.

            **Przykłady:**
            Dla pary aabbbca caacaab mamy następujące prefiksosufiksy:
            - aab – początek pierwszego słowa i koniec drugiego
            - ca – początek drugiego słowa i koniec pierwszego.

            Najdłuższy prefiksosufiks ma długość 3, zatem para tych słów nie spełnia wymaganych warunków.

            Dla pary abbaabaa baabaabba mamy następujące prefiksosufiksy:
            - a – początek pierwszego słowa i koniec drugiego
            - abba – początek pierwszego słowa i koniec drugiego
            - baa – początek drugiego słowa i koniec pierwszego
            - baabaa – początek drugiego słowa i koniec pierwszego.

            Najdłuższy prefiksosufiks ma długość 6, zatem para spełnia warunki wymagane w zadaniu.

            Dla pliku \`pary_przyklad.txt\` poprawną odpowiedzią jest
            \`ececdddeed dddeedd 6\`
            (najdłuższy prefiksosufiks ma długość 6)
          `,
          answerHint: 'Jedna para w wierszu: oba słowa i długość najdłuższego prefiksosufiksu.',
          example: { map: { 'pary.txt': 'pary_przyklad.txt' }, expect: { parts: [{ lines: ['ececdddeed dddeedd 6'], points: 1 }] } },
          expect: {
            exactLines: false,
            parts: [
              { label: 'pary słów', items: PAIRS_33.map(([a, b]) => `${a} ${b}`), points: 3 },
              { label: 'długości najdłuższych prefiksosufiksów', lines: PAIRS_33.map((p) => p.join(' ')), points: 1 },
            ],
            score: (oks, { extra }) => (extra.length ? 0 : (oks[0] ? 3 : 0) + (oks[1] ? 1 : 0)),
          },
          rubric: md`
            4 pkt – odpowiedź poprawna, w tym:
            3 pkt – pary słów
            1 pkt – długości najdłuższych prefiksosufiksów.
            3 pkt – podanie par słów, dla których najdłuższy prefiksosufiks ma: więcej niż 5 liter albo co najmniej 4 litery, oraz podanie dla każdej z tych par długości najdłuższego prefiksosufiksu.
            2 pkt – podanie par słów oraz długości najdłuższych prefiksosufiksów (po jednym punkcie za pary i za długości) w przypadku: sprawdzania prefiksosufiksów tylko dla kolejności s1, s2 lub tylko dla kolejności s2, s1 albo szukania najdłuższego prefiksosufiksu w pliku z danymi, wynik: aababbbababbbbbbaab bbbbaabbababababa 7 albo sprawdzania prefiksosufiksów o długości dokładnie 5.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            ${PAIRS_33.map((p) => p.join(' ')).join('\n')}
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '4',
      title: 'Korporacja',
      intro: md`
        W korporacji pracuje *n* osób, które na potrzeby zadania ponumerujemy liczbami 1, 2, …, *n*. Pracownik numer 1 jest prezesem korporacji, a każdy z pozostałych pracowników ma dokładnie jednego bezpośredniego przełożonego.
        Numer bezpośredniego przełożonego pracownika *x* jest zawsze mniejszy od numeru tego pracownika.
        Prezes korporacji nie ma żadnego przełożonego. Przełożonym pracownika jest jego bezpośredni przełożony i każdy przełożony tego bezpośredniego przełożonego.
        Jeśli *x* jest (bezpośrednim) przełożonym *y*, to powiemy, że *y* jest (bezpośrednim) podwładnym *x*. Prezes jest przełożonym każdego pracownika.

        **Przykład 1.**

        <img class="fig-img" src="content/img/2026-maj/hierarchia.png" alt="Hierarchia: pracownicy 2 i 4 podlegają prezesowi (1); 3, 5 i 6 podlegają pracownikowi 2; 7 podlega 3; 8 podlega 4.">

        *Rysunek 1.* Przykład hierarchii w korporacji (strzałki wskazują na bezpośrednich przełożonych).
        Przełożonymi pracownika 7 są pracownicy 3, 2 i 1. Bezpośrednim przełożonym pracownika 7 jest pracownik 3. Pracownik 3 (podobnie jak 5 oraz 6) jest bezpośrednim podwładnym pracownika 2, a podwładnymi pracownika 2 są pracownicy 3, 5, 6 i 7.
      `,
      files: ['korpo.txt', 'korpo_przyklad.txt'],
      infos: {
        '4.2-4.4': {
          title: 'Informacja do zadań 4.2.–4.4.',
          text: md`
            Dany jest plik \`korpo.txt\` zawierający *n* = 50 000 liczb, który opisuje strukturę korporacji. W pierwszym wierszu jest liczba 0 oznaczająca brak przełożonego dla prezesa korporacji, który ma numer 1. W *i*-tym (2 ≤ *i* ≤ 50 000) wierszu pliku jest numer pracownika, który jest bezpośrednim przełożonym pracownika *i*.

            **Przykład 2.**
            Zapis w pliku dla przykładowej korporacji (Rysunek 1) miałby postać:

            \`\`\`
            0
            1
            2
            1
            2
            2
            3
            4
            \`\`\`

            Napisz program(-y), który(-e) znajdzie(-ą) i da(dzą) odpowiedzi do podanych zadań. Odpowiedzi zapisz w pliku \`wyniki4.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

            Do Twojej dyspozycji jest również plik \`korpo_przyklad.txt\`, w identycznym formacie, w którym bezpośrednim przełożonym pracowników 2 i 3 jest pracownik 1, a wszystkich innych – pracownik 3. Odpowiedzi dla danych z tego pliku są podane pod treściami zadań.

            **Uwaga:** Pamiętaj, że Twój program musi ostatecznie działać dla pliku \`korpo.txt\`.
          `,
        },
      },
      tasks: [
        {
          no: '4.1',
          points: 1,
          page: 12,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['drzewa', 'hierarchia'],
          text: md`
            Dla każdego pracownika z przykładowej hierarchii w korporacji (Rysunek 1.) określ, ilu ma on bezpośrednich podwładnych oraz ilu ma wszystkich podwładnych.

            ${table([
              ['Numer pracownika', 'Liczba bezpośrednich podwładnych', 'Liczba wszystkich podwładnych'],
              ...[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (p === 2 ? ['2', '3', '4'] : p === 8 ? ['8', '0', '0'] : [String(p), `{{d${p}|4}}`, `{{a${p}|4}}`])),
            ])}
          `,
          fields: Object.fromEntries(Object.entries(SUB_41).flatMap(([p, [d, a]]) => [[`d${p}`, String(d)], [`a${p}`, String(a)]])),
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['Numer pracownika', 'Liczba bezpośrednich podwładnych', 'Liczba podległych pracowników'],
            ['1', '2', '7'],
            ['2', '3', '4'],
            ['3', '1', '1'],
            ['4', '1', '1'],
            ['5', '0', '0'],
            ['6', '0', '0'],
            ['7', '0', '0'],
            ['8', '0', '0'],
          ]),
        },
        {
          no: '4.2',
          points: 2,
          page: 13,
          kind: 'program',
          cat: 'programowanie',
          topics: ['drzewa', 'zliczanie'],
          info: '4.2-4.4',
          text: md`
            Na podstawie danych zapisanych w pliku \`korpo.txt\` podaj, ilu pracowników nie jest przełożonym żadnego pracownika.

            Dla danych z pliku \`korpo_przyklad.txt\` poprawna odpowiedź to:
            49 998
          `,
          example: { map: { 'korpo.txt': 'korpo_przyklad.txt' }, expect: '49998' },
          expect: '25113',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź różniąca się o 1 od poprawnej odpowiedzi (25112 lub 25114).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '25113',
        },
        {
          no: '4.3',
          points: 2,
          page: 13,
          kind: 'program',
          cat: 'programowanie',
          topics: ['drzewa', 'zliczanie'],
          info: '4.2-4.4',
          text: md`
            Podaj, który pracownik spośród zapisanych w pliku \`korpo.txt\` ma najwięcej bezpośrednich podwładnych. Podaj numer tego pracownika oraz liczbę jego bezpośrednich podwładnych.

            Dla danych z pliku \`korpo_przyklad.txt\` poprawna odpowiedź to:
            3 49 997
            (pracownik numer 3 ma 49 997 bezpośrednich podwładnych).
          `,
          example: { map: { 'korpo.txt': 'korpo_przyklad.txt' }, expect: '3 49997' },
          expect: {
            parts: [
              { label: 'numer pracownika (2)', tokens: '2', points: 1 },
              { label: 'liczba bezpośrednich podwładnych (19)', tokens: '2 19', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – numer osoby
            1 pkt – liczba bezpośrednich podwładnych.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '2 19',
        },
        {
          no: '4.4',
          points: 3,
          page: 14,
          kind: 'program',
          cat: 'programowanie',
          topics: ['drzewa', 'głębokość'],
          info: '4.2-4.4',
          text: md`
            Policz, ilu najwięcej przełożonych ma jeden pracownik. Podaj tę liczbę oraz podaj, ilu pracowników ma taką liczbę przełożonych.

            Dla danych z pliku \`korpo_przyklad.txt\` poprawna odpowiedź to:
            2 49 997
            (największa liczba przełożonych: 2, liczba pracowników, którzy mają 2 przełożonych: 49 997).
          `,
          example: { map: { 'korpo.txt': 'korpo_przyklad.txt' }, expect: '2 49997' },
          expect: {
            parts: [
              { label: 'największa liczba przełożonych (22)', tokens: '22', points: 2 },
              { label: 'liczba pracowników (2)', tokens: '22 2', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            2 pkt – liczba przełożonych
            1 pkt – liczba pracowników.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '22 2',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '5',
      title: null,
      tasks: [
        {
          no: '5',
          points: 2,
          page: 15,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe'],
          text: md`
            Poniżej zapisano wyrażenie matematyczne zawierające liczby zapisane w systemach: piątkowym, dziesiętnym i trójkowym.
            W miejsce kropek wpisz odpowiednie liczby (zapisane w systemie piątkowym i trójkowym), tak aby obie równości były prawdziwe.

            <div class="formula big">1440<sub>5</sub> + {{a|8}}<sub>5</sub> = 427<sub>10</sub> = {{b|10}}<sub>3</sub> – 110002<sub>3</sub></div>
          `,
          fields: { a: '1212', b: '1000220' },
          score: perField(1),
          rubric: md`
            2 pkt – dwie poprawne liczby.
            1 pkt – jedna poprawna liczba.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '(1440)<sub>5</sub> + (**1212**)<sub>5</sub> = (427)<sub>10</sub> = (**1000220**)<sub>3</sub> − (110002)<sub>3</sub>',
        },
      ],
    },
    {
      no: '6',
      title: null,
      tasks: [
        {
          no: '6',
          points: 1,
          page: 15,
          kind: 'fill',
          cat: 'teoria',
          topics: ['sieci komputerowe', 'adresy IP'],
          text: md`
            Uzupełnij zdania. Wpisz właściwe liczby bitów.

            Adres IP w wersji 4 ma długość {{v4|5}} bity.

            Adres IP w wersji 6 ma długość {{v6|5}} bitów.
          `,
          fields: { v4: '32', v6: '128' },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Adres IP w wersji 4 ma długość 32 bity.
            Adres IP w wersji 6 ma długość 128 bitów.
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Staw',
      intro: md`
        Pan Iksiński stał się właścicielem stawu o powierzchni całkowitej 10 000 m<sup>2</sup>. Pierwszą rośliną, którą postanowił w nim umieścić, jest rzęsa wodna, która osiąga wysoką skuteczność rozmnażania wegetatywnego, tzn. przy odpowiedniej temperaturze i wielkości opadów potrafi znacząco zwiększyć rozmiar zajmowanej powierzchni.

        W pliku \`staw.txt\` są zawarte następujące informacje, rozdzielone znakami tabulacji:
        - *Data* – data pomiaru
        - *Temp* – temperatura w danym dniu w °C, zaokrąglona do jednego miejsca po przecinku
        - *Opady* – wielkość opadu w mm, zaokrąglona do liczby całkowitej.

        **Przykład:**

        ${sample(`Data\tTemp\tOpady
        2022-01-01\t9,8\t5
        2022-01-02\t8,1\t1
        2022-01-03\t9\t2
        2022-01-04\t7,3\t1
        2022-01-05\t5,7\t5`)}

        Plik zawiera dane z całego 2022 roku.

        Z wykorzystaniem danych zawartych w pliku oraz dostępnych narzędzi informatycznych wykonaj podane zadania. Wyniki zapisz w pliku tekstowym \`wyniki7.txt\`. Odpowiedź do każdego zadania poprzedź numerem tego zadania.
      `,
      files: ['staw.txt'],
      sheet: { file: 'staw.txt' },
      infos: {
        '7.3-7.4': {
          title: 'Informacja do zadań 7.3.–7.4.',
          text: md`
            Na potrzeby zadania przyjmujemy, że w kolejnym roku przez 184 dni, od 1 marca 2023 do 31 sierpnia 2023, temperatury i opady utrzymywały się na stałym poziomie, co pozwalało na regularny wzrost rzęsy wodnej w tempie rozrostu 1,75% dziennie. Przyrost rzęsy następował w nocy, a pomiar zarośnięcia stawu – rano.

            1 marca 2023 rano staw był zarośnięty rzęsą w 20%, tj. rzęsa wodna zajmowała 2000 m<sup>2</sup>.

            W związku z tym, że staw nie powinien być zarośnięty w całości, właściciel postanowił pozbywać się jej nadmiaru. Do zbiornika wpuścił 80 amurów białych, z których każdy zjadał w ciągu dnia 0,25 m<sup>2</sup> rzęsy wodnej. Dodatkowo co piątek w ciągu dnia odławiał 60 m<sup>2</sup> rzęsy wodnej.

            **Uwaga:** 30 kwietnia rano staw był zarośnięty w 25,79%.
          `,
        },
      },
      tasks: [
        {
          no: '7.1',
          points: 3,
          page: 16,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy', 'funkcje statystyczne'],
          text: md`Utwórz zestawienie średnich miesięcznych temperatur w zaokrągleniu do jednego miejsca po przecinku. Na podstawie wykonanego zestawienia utwórz wykres kolumnowy, porównujący te wartości. Pamiętaj o czytelnym opisie wykresu (tytuł wykresu, opisy osi, oznaczenie miesięcy na osi X).`,
          answerHint: '12 wierszy (styczeń → grudzień): miesiąc i średnia temperatura.',
          expect: { parts: [{ label: 'zestawienie', lines: TEMP_71.map((t, i) => `${i + 1} ${t}`), ordered: true, points: 1 }] },
          self: { points: 2, label: 'wykres kolumnowy', hint: 'Poprawny dobór danych i typ wykresu (1 pkt) oraz czytelny opis – tytuł wykresu, opisy osi (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            zestawienie – 1 pkt
            wykres – 2 pkt, w tym:
            1 pkt – poprawny dobór danych i typ wykresu
            1 pkt – czytelny opis (tytuł wykresu, opisy osi).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: table([['miesiąc', 'Średnia temperatura'], ...TEMP_71.map((t, i) => [String(i + 1), t])]),
        },
        {
          no: '7.2',
          points: 2,
          page: 16,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['ciągi', 'funkcje warunkowe'],
          text: md`Dla każdego miesiąca wyznacz długość najdłuższego ciągu kolejnych dni bez opadów w tym miesiącu (wartość opadów w tych dniach jest równa 0).`,
          answerHint: '12 wierszy (styczeń → grudzień): miesiąc i długość ciągu.',
          expect: { parts: [{ lines: DRY_72.map((v, i) => `${i + 1} ${v}`), ordered: true, points: 2 }] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź wynikająca z niepoprawnego zliczania ciągu zer: kończącego się w kolejnym miesiącu (wynik 11 w grudniu, pozostałe poprawne) albo przy zastosowaniu jednakowej dla każdego miesiąca niewłaściwej wartości początkowej (wszystkie wyniki większe o 1).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([['Miesiące', 'Maksimum z dł. ciągu zer w miesiącu'], ...DRY_72.map((v, i) => [String(i + 1), v])]),
        },
        {
          no: '7.3',
          points: 2,
          page: 17,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja', 'daty'],
          info: '7.3-7.4',
          text: md`Podaj, w którym dniu (licząc od 1 marca 2023) pomiar wykazał, że rzęsa wodna po raz pierwszy zajęła więcej niż 75% procent powierzchni stawu.`,
          expect: { parts: [{ tokens: ['167', '2023-08-14'], points: 2 }] },
          rubric: md`
            2 pkt – odpowiedź poprawna (numer dnia lub data).
            1 pkt – odpowiedź wynikająca z odczytywania zarośniętej powierzchni po nocy kolejnego dnia (166 dzień; 2023-08-13).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '167 lub 2023-08-14',
        },
        {
          no: '7.4',
          points: 2,
          page: 17,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          info: '7.3-7.4',
          text: md`Podaj, jaka jest najmniejsza liczba amurów białych, jaką musi wpuścić właściciel, by rzęsa wodna w całym badanym okresie zajmowała maksymalnie 50% powierzchni stawu.`,
          expect: '94',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź różniąca się o 1 od poprawnej odpowiedzi (93 lub 95).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '94',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '8',
      title: 'Sieć sklepów',
      intro: md`
        W trzech plikach tekstowych o nazwach \`klienci.txt\`, \`transakcje.txt\`, \`opis_transakcji.txt\` zapisano dane o sprzedaży towarów w pewnej sieci sklepów w porach wieczornych pierwszych dni miesiąca. Dane obejmują informacje od 1. do 3. dnia miesiąca w miesiącach od stycznia do czerwca 2025 roku w godzinach od 22:00 do 23:59.
        Pierwszy wiersz każdego z plików jest wierszem nagłówkowym, a dane w wierszach rozdzielono tabulatorami.

        Plik \`klienci.txt\` zawiera informacje na temat zarejestrowanych klientów sieci sklepów. W każdym wierszu zapisano:
        - *IdKlienta* – unikatowy identyfikator klienta (liczba całkowita)
        - *Imie* – imię klienta (tekst do 20 znaków)
        - *Nazwisko* – nazwisko klienta (tekst do 20 znaków)
        - *Plec* – płeć klienta (znak K lub M).

        **Przykład:**

        ${sample(`IdKlienta\tImie\tNazwisko\tPlec
        1\tZofia\tSawicka\tK
        2\tZuzanna\tChmiel\tK
        3\tHanna\tSokolowska\tK`)}

        Plik \`transakcje.txt\` zawiera informacje o dokonanych transakcjach. W każdym wierszu zapisano:
        - *IdTransakcji* – unikatowy identyfikator transakcji (uwaga: identyfikatory nie są nadane chronologicznie – nie są kolejnymi numerami transakcji)
        - *DataTransakcji* – datę transakcji (dd.mm.rrrr)
        - *IdKlienta* – identyfikator klienta, który dokonał transakcji
        - *IdSklepu* – identyfikator sklepu, w którym dokonano transakcji
        - *IdSprzedawcy* – identyfikator sprzedawcy, który obsługiwał klienta przy kasie; jeśli klient korzystał z kasy samoobsługowej, pole jest puste (brak danych).

        **Przykład:**

        ${sample(`IdTransakcji\tDataTransakcji\tIdKlienta\tIdSklepu\tIdSprzedawcy
        1\t01.01.2025\t1814\t12\t160
        2\t01.02.2025\t550\t4\t125
        3\t01.03.2025\t1408\t16\t65
        4\t01.04.2025\t1146\t14\t33
        5\t01.05.2025\t630\t9\t
        6\t01.06.2025\t1011\t12\t120`)}

        Plik o nazwie \`opis_transakcji.txt\` zawiera informacje o produktach zakupionych w danej transakcji. W każdym wierszu zapisano:
        - *IdTransakcji* – identyfikator transakcji (uwaga: identyfikatory mogą się powtarzać)
        - *IdProduktu* – identyfikator zakupionego produktu
        - *Cena* – cena jednostkowa zakupionego produktu
        - *Liczba* – liczba określająca, ile sztuk danego produktu zakupiono.

        **Przykład:**

        ${sample(`IdTransakcji\tIdProduktu\tCena\tLiczba
        485\t78\t5,66\t11
        104\t87\t7\t4
        104\t84\t2\t5
        246\t42\t7,0\t15`)}

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych podaj odpowiedzi do zadań 8.1.–8.4. Odpowiedzi zapisz w pliku \`wyniki8.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['klienci.txt', 'transakcje.txt', 'opis_transakcji.txt'],
      tables: { Klienci: 'klienci.txt', Transakcje: 'transakcje.txt', Opis_transakcji: 'opis_transakcji.txt' },
      tasks: [
        {
          no: '8.1',
          points: 1,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie', 'złączenia'],
          text: md`Podaj imię i nazwisko klienta, który dokonał łącznie najwięcej transakcji w całym analizowanym okresie.`,
          expect: 'Marcelino Kruk',
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: 'Marcelino Kruk',
        },
        {
          no: '8.2',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'podzapytania', 'NOT IN'],
          text: md`Podaj, ile kobiet (K) oraz ilu mężczyzn (M) spośród klientów sieci sklepów nie kupiło niczego w całym analizowanym okresie.`,
          expect: {
            parts: [
              { label: 'kobiety (689)', items: ['K 689'], points: 1 },
              { label: 'mężczyźni (651)', items: ['M 651'], points: 1 },
            ],
          },
          answerHint: 'Np. „K 689” i „M 651”.',
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – liczba kobiet
            1 pkt – liczba mężczyzn.
            1 pkt – łączna liczba klientów, którzy nie dokonali zakupu (1340).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: 'K – 689 i M – 651',
        },
        {
          no: '8.3',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'wartości NULL', 'COUNT DISTINCT'],
          text: md`Podaj liczbę różnych sklepów, w których dokonano transakcji w kasach samoobsługowych, oraz podaj, ile zapłacono łącznie za zakupy w tych kasach.`,
          expect: {
            parts: [
              { label: 'liczba sklepów (28)', tokens: '28', points: 1 },
              { label: 'łączna kwota (19443,29)', tokens: '19443,29', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – liczba sklepów
            1 pkt – łączna kwota.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '28 sklepów, kwota: 19443,29',
        },
        {
          no: '8.4',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'COUNT DISTINCT', 'daty'],
          text: md`
            Niektórzy sprzedawcy pracowali w różnych sklepach sieci w ciągu miesiąca.
            Podaj *IdSprzedawcy*, który obsługiwał klientów w największej liczbie różnych sklepów w jednym miesiącu, oraz podaj ten miesiąc (nazwę lub numer).
          `,
          expect: {
            parts: [
              { label: 'IdSprzedawcy (14)', tokens: '14', points: 1 },
              { label: 'miesiąc (styczeń)', tokens: ['styczeń', '14 1', '14 01', '1 14', '01 14'], points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – numer sprzedawcy
            1 pkt – miesiąc.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '14, styczeń',
        },
        {
          no: '8.5',
          points: 2,
          page: 20,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'LIKE'],
          text: md`
            Do bazy danych utworzonej na podstawie opisanych wcześniej plików dodano dwie kolejne tabele: o nazwie *Produkty* i o nazwie *Kategorie*, w których zapisano informacje o sprzedawanych produktach.

            Tabela *Kategorie* zawiera następujące pola:
            - *IdKategorii* – unikatowy identyfikator kategorii produktu
            - *NazwaKategorii* – nazwa kategorii produktu.

            Tabela *Produkty* zawiera następujące pola:
            - *IdProduktu* – unikatowy identyfikator produktu
            - *IdKategorii* – identyfikator kategorii, do której należy dany produkt
            - *Nazwa* – nazwa produktu
            - *Opis* – opis produktu.

            Napisz w języku SQL zapytanie, w wyniku którego zostaną wypisane wszystkie zakupione produkty (*IdProduktu* i *Nazwa*) z kategorii (*NazwaKategorii*) „spozywcze” zawierające w opisie fragment: „do ekspresu kolbowego”.
          `,
          extraTables: {
            Kategorie: ['IdKategorii INTEGER PRIMARY KEY', 'NazwaKategorii TEXT'],
            Produkty: ['IdProduktu INTEGER PRIMARY KEY', 'IdKategorii INTEGER', 'Nazwa TEXT', 'Opis TEXT'],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – wybór pól i połączenie tabel
            1 pkt – warunki wyszukiwania.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`sql
            SELECT Produkty.IdProduktu, Nazwa
            FROM Opis_transakcji
            JOIN Produkty
            ON Opis_transakcji.IdProduktu = Produkty.IdProduktu
            JOIN Kategorie
            ON Kategorie.IdKategorii = Produkty.IdKategorii
            WHERE NazwaKategorii = "spozywcze" AND Opis LIKE "%do ekspresu kolbowego%";
            \`\`\`
          `,
        },
      ],
    },
  ],
};
