import { md, table, sample, all, perField, byCount } from '../lib.js';

function przestaw(n) {
  const r = n % 100;
  const a = Math.floor(r / 10);
  const b = r % 10;
  n = Math.floor(n / 100);
  if (n > 0) return a + 10 * b + 100 * przestaw(n);
  return a > 0 ? a + 10 * b : b;
}

const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

// Zadanie 5: written binary addition; null = a box to fill
function columnSum(rows, ids) {
  let k = 0;
  const cell = (d) => (d === null ? `<td>{{${ids[k++]}|1}}</td>` : `<td>${d}</td>`);
  const width = 13;
  const line = (digits, sign = '') => {
    const pad = width - 1 - digits.length;
    return `<td>${sign}</td>` + '<td></td>'.repeat(pad) + digits.map(cell).join('');
  };
  return `<table class="column-sum"><tbody>
    <tr>${line(rows[0])}</tr>
    <tr>${line(rows[1], '+')}</tr>
    <tr class="total">${line(rows[2])}</tr>
  </tbody></table>`;
}

const SUM_ROWS = [
  [1, 1, null, 0, 1, 0, 1, 1, 0, null, 1],
  [1, 1, 0, 0, null, 1, 0, 1, 1, 1],
  [1, null, 0, 1, 1, 0, 0, 1, null, null, 1, 0],
];
const SUM_IDS = ['a3', 'a10', 'b5', 'c2', 'c9', 'c10'];
const SUM_FULL = [
  [1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1],
  [1, 1, 0, 0, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0],
];

const AREAS_64 = [
  ['Aeolis', 5, 7, 11, 2, 13, 5],
  ['Amazonis', 23, 20, 21, 29, 20, 25],
  ['Amenthes', 10, 5, 9, 12, 10, 10],
  ['Arabia', 9, 10, 15, 8, 10, 7],
  ['Arcadia', 7, 7, 11, 14, 5, 9],
  ['Argyre', 4, 4, 3, 3, 10, 7],
  ['Casius', 6, 10, 7, 13, 7, 7],
  ['Cebrenia', 4, 5, 1, 1, 1, 1],
  ['Coprates', 21, 27, 18, 33, 30, 23],
  ['Diacria', 2, 3, 2, 3, 3, 2],
  ['Elysium', 6, 9, 5, 4, 8, 7],
  ['Eridania', 8, 19, 23, 20, 22, 16],
  ['Hellas', 1, 4, 2, 1, 3, 4],
  ['Iapygia', 47, 51, 67, 53, 51, 33],
  ['Ismenius Lacus', 6, 4, 5, 3, 9, 13],
  ['Lunae Palus', 11, 11, 9, 10, 10, 3],
  ['Mare Acidalium', 8, 14, 10, 8, 14, 10],
  ['Mare Australe', 2, 3, 2, 3, 2, 2],
  ['Mare Boreum', 14, 19, 8, 13, 14, 12],
  ['Mare Tyrrhenum', 2, 5, 3, 2, 0, 2],
  ['Margaritifer Sinus', 4, 5, 5, 2, 2, 7],
  ['Memnonia', 11, 24, 23, 19, 14, 13],
  ['Noachis', 13, 11, 11, 25, 17, 14],
  ['Oxia Palus', 3, 3, 1, 0, 4, 2],
  ['Phaethontis', 1, 7, 2, 4, 5, 4],
  ['Phoenicis Lacus', 25, 22, 25, 22, 15, 18],
  ['Sinus Sabaeus', 14, 12, 19, 13, 12, 6],
  ['Syrtis Major', 6, 2, 5, 4, 6, 3],
  ['Tharsis', 29, 40, 38, 41, 46, 39],
  ['Thaumasia', 2, 2, 4, 1, 2, 3],
];

export default {
  id: '2025-maj',
  year: 2025,
  session: 'maj',
  term: 'termin główny',
  date: '2025-05-14',
  dateText: '14 maja 2025 r.',
  symbol: 'MINP-R0-100-2505',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2025-maj-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2025-maj-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Funkcja rekurencyjna',
      intro: md`
        Dana jest rekurencyjna funkcja *przestaw*, której parametrem jest nieujemna liczba całkowita:

        \`\`\`pseudo
        przestaw(n):
            r ← n mod 100
            a ← r div 10
            b ← r mod 10
            n ← n div 100
            jeżeli n > 0
                w ← a + 10 * b + 100 * przestaw(n)
            w przeciwnym razie
                jeżeli a > 0
                    w ← a + 10 * b
                w przeciwnym razie
                    w ← b
            wynikiem jest w
        \`\`\`

        **Uwaga:** Operator mod oznacza resztę z dzielenia, natomiast div – część całkowitą z dzielenia.
      `,
      tasks: [
        {
          no: '1.1',
          points: 3,
          page: 4,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'cyfry liczby', 'analiza algorytmu'],
          text: md`
            Uzupełnij tabelę – wpisz w drugiej kolumnie wynik funkcji *przestaw*(*n*) dla podanych wartości argumentu *n* oraz wpisz w trzeciej kolumnie liczbę wywołań funkcji *przestaw* łącznie z pierwszym wywołaniem z parametrem *n*.

            ${table([
              ['*n*', 'Wynik działania funkcji *przestaw*', 'Liczba wywołań funkcji *przestaw*'],
              ['316498', '134689', '3'],
              ['43657688', '{{w1|18}}', '{{c1|4}}'],
              ['154005710', '{{w2|18}}', '{{c2|4}}'],
              ['998877665544321', '{{w3|18}}', '{{c3|4}}'],
            ])}
          `,
          fields: { w1: String(przestaw(43657688)), c1: '4', w2: String(przestaw(154005710)), c2: '5', w3: String(przestaw(998877665544321)), c3: '8' },
          score: byCount([
            [6, 3],
            [5, 2],
            [4, 1],
          ]),
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – odpowiedź poprawna dla pięciu pól tabeli.
            1 pkt – odpowiedź poprawna dla czterech pól tabeli.
            0 pkt – odpowiedź niepoprawna lub niepełna albo brak rozwiązania.
          `,
          solution: table([
            ['*n*', 'Wynik działania funkcji *przestaw*', 'Liczba wywołań funkcji *przestaw*'],
            ['316498', '134689', '3'],
            ['43657688', '34566788', '4'],
            ['154005710', '145007501', '5'],
            ['998877665544321', '989786756453412', '8'],
          ]),
        },
        {
          no: '1.2',
          points: 2,
          page: 5,
          kind: 'tf',
          cat: 'algorytmy',
          topics: ['rekurencja', 'złożoność'],
          text: md`
            Oceń prawdziwość podanych zdań. Zaznacz **P**, jeśli zdanie jest prawdziwe, albo **F** – jeśli jest fałszywe.

            Niech *n* będzie liczbą *k*-cyfrową, gdzie *k* > 0. Liczba wywołań funkcji *przestaw* w zależności od *k* jest równa:
          `,
          statements: [
            frac('k', '2'),
            '(*k* + 1) div 2 (gdzie div oznacza dzielenie całkowite)',
            `<span class="cases"><span>${frac('k', '2')} gdy *k* jest liczbą parzystą</span><span>${frac('k + 1', '2')} gdy *k* jest liczbą nieparzystą</span></span>`,
            frac('k + 1', '2'),
          ],
          answer: 'FPPF',
          score: byCount([
            [4, 2],
            [3, 1],
          ]),
          rubric: md`
            2 pkt – za poprawną odpowiedź w 4 zdaniach.
            1 pkt – za poprawną odpowiedź w 3 zdaniach.
            0 pkt – odpowiedź niepełna lub niepoprawna albo brak rozwiązania.
          `,
          solution: '1. F, 2. P, 3. P, 4. F',
        },
        {
          no: '1.3',
          points: 4,
          page: 6,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['iteracja', 'cyfry liczby', 'zapis algorytmu'],
          text: md`
            W postaci pseudokodu lub w wybranym języku programowania napisz **nierekurencyjną** funkcję *przestaw2*, która dla danej nieujemnej liczby całkowitej *n* da taką samą wartość jak *przestaw*(*n*).

            **Uwaga:** Twój algorytm może używać wyłącznie zmiennych przechowujących liczby całkowite oraz może operować wyłącznie na liczbach całkowitych. W zapisie możesz wykorzystać tylko operacje arytmetyczne: dodawanie, odejmowanie, mnożenie, dzielenie, dzielenie całkowite, resztę z dzielenia oraz porównywanie liczb, instrukcje sterujące, przypisania do zmiennych lub samodzielnie napisane funkcje, wykorzystujące wyżej wymienione operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów innych niż wymienione, w tym – funkcji *przestaw*.

            **Specyfikacja:**
            Dane
            *n* – nieujemna liczba całkowita
            Wynik
            *w* – nieujemna liczba całkowita, wynik działania taki sam jak po wykonaniu *przestaw*(*n*)
          `,
          algo: {
            inputs: [{ name: 'n', type: 'int', desc: 'nieujemna liczba całkowita' }],
            outputs: [{ name: 'w', type: 'int', desc: 'wynik taki sam jak przestaw(n)' }],
            examples: [
              { in: [316498], out: [134689] },
              { in: [43657688], out: [34566788] },
              { in: [154005710], out: [145007501] },
              { in: [998877665544321], out: [989786756453412] },
            ],
            ref: przestaw,
            gen: (r) => [r.pick([0, 5, 10, 12, 100, 105, r.int(0, 999), r.int(0, 999999), r.int(0, 2 ** 31 - 1), r.int(0, 10 ** 15)])],
            random: 14,
            noBuiltins: 'conversion',
          },
          rubric: md`
            4 pkt – za poprawny algorytm, w tym:
            1 pkt – za poprawne przypisanie wartości początkowych zmiennym *w* oraz *p* (potęga 100) oraz modyfikację zmiennej oznaczającej potęgę 100
            1 pkt – za poprawną pętlę (warunek i dzielenie przez 100)
            1 pkt – za poprawną zamianę cyfr
            1 pkt – za otrzymanie poprawnego wyniku.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`pseudo
            funkcja przestaw2(n)
                w ← 0
                p ← 1
                dopóki n > 0 wykonuj
                    r ← n mod 100
                    a ← r div 10
                    b ← r mod 10
                    jeżeli n > 9
                        w ← p*a + 10*p*b + w
                    w przeciwnym razie
                        w ← p*b + w
                    n ← n div 100
                    p ← p*100
                zwróć w
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Zapis symboliczny',
      intro: md`
        W pliku \`symbole.txt\` zapisano 2000 napisów. Każdy z nich jest zapisany w osobnym wierszu i składa się z dokładnie 12 znaków spośród: o, +, *.

        Napisz program (lub kilka programów) znajdujący(-ch) odpowiedzi do podanych zadań. Każdą odpowiedź zapisz w pliku \`wyniki2.txt\` i poprzedź ją numerem oznaczającym zadanie.

        Do Twojej dyspozycji jest plik \`symbole_przyklad.txt\`, który zawiera 20 wierszy danych spełniających warunki zadania. Odpowiedzi dla pliku \`symbole_przyklad.txt\` są podane pod każdym zadaniem.

        Pamiętaj, że Twój program musi ostatecznie zadziałać na pliku \`symbole.txt\` zawierającym 2000 napisów.
      `,
      files: ['symbole.txt', 'symbole_przyklad.txt'],
      infos: {
        '2.3-2.4': {
          title: 'Informacja do zadań 2.3. i 2.4.',
          text: md`
            Każdy z napisów podanych w pliku \`symbole.txt\` będziemy traktować jako liczbę zapisaną w systemie trójkowym, w którym:
            - znak o odpowiada cyfrze 0
            - znak + odpowiada cyfrze 1
            - znak * odpowiada cyfrze 2.
          `,
        },
      },
      tasks: [
        {
          no: '2.1',
          points: 2,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'palindromy'],
          text: md`
            Podaj wszystkie takie napisy z pliku \`symbole.txt\`, które są palindromami (czytane od przodu i od tyłu są takie same). Wypisz je po jednym w wierszu, w kolejności takiej jak w pliku \`symbole.txt\`.

            Odpowiedź dla pliku \`symbole_przyklad.txt\` to
            \`oooo+**+oooo\`
            (w tym pliku jest jeden palindrom)
          `,
          example: { map: { 'symbole.txt': 'symbole_przyklad.txt' }, expect: { parts: [{ lines: ['oooo+**+oooo'], points: 1 }] } },
          expect: {
            exactLines: false,
            parts: ['++o+o++o+o++', '+*+**++**+*+', '*+o++**++o+*', '*oo*o**o*oo*', '+*++*oo*++*+', '+o++oooo++o+'].map((w, i) => ({ lines: [w], points: i < 2 ? 1 : 0 })),
            score: (oks, { extra }) => {
              const good = oks.filter(Boolean).length;
              if (good === 6 && !extra.length) return 2;
              return good >= 3 ? 1 : 0;
            },
          },
          rubric: md`
            2 pkt – poprawne podanie wszystkich palindromów.
            1 pkt – poprawne podanie 3 palindromów.
            0 pkt – odpowiedź niepełna lub niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            ++o+o++o+o++
            +*+**++**+*+
            *+o++**++o+*
            *oo*o**o*oo*
            +*++*oo*++*+
            +o++oooo++o+
            \`\`\`
          `,
        },
        {
          no: '2.2',
          points: 4,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['tablice dwuwymiarowe', 'napisy'],
          text: md`
            W pliku \`symbole.txt\` szukamy „kwadratów” złożonych z dziewięciu sąsiadujących identycznych symboli:

            \`\`\`
            + + +     o o o     * * *
            + + +  lub o o o lub * * *
            + + +     o o o     * * *
            \`\`\`

            Podaj, ile takich kwadratów występuje w pliku \`symbole.txt\`. Jeżeli w pliku występuje jeden taki kwadrat, podaj numer wiersza i numer pozycji w wierszu (licząc od 1) jego środkowego pola. Jeżeli jest więcej takich kwadratów, podaj numer wiersza i numer pozycji w wierszu dla środkowego pola każdego z nich.

            **Przykład:**
            Poniżej podano 6 wierszy przykładowych danych (po 12 znaków w każdym wierszu):

            \`\`\`
            1. + * * + o * o + + * o +
            2. + + + o o o o * o * * *
            3. + o * o o o o * * + + +
            4. * + * o o o o o o + + +
            5. o * * o + + + o + + + +
            6. o o o o + + * * + * + o
            \`\`\`

            Mamy tutaj trzy kwadraty złożone z 9 identycznych symboli: pierwszy ma środek w wierszu 3 na pozycji 5, drugi – w wierszu 3 na pozycji 6, a trzeci – w wierszu 4 na pozycji 11.

            Odpowiedź dla pliku \`symbole_przyklad.txt\` to
            1 6 3
            (jeden kwadrat, który ma środkowe pole w wierszu 6, na pozycji 3).
          `,
          answerHint: 'Liczba kwadratów, a potem współrzędne środków (wiersz pozycja).',
          example: { map: { 'symbole.txt': 'symbole_przyklad.txt' }, expect: '1 6 3' },
          expect: {
            parts: [
              { label: 'liczba kwadratów (3)', tokens: '3', points: 1 },
              { label: 'środek (399, 5)', items: ['399 5'], points: 1 },
              { label: 'środek (546, 2)', items: ['546 2'], points: 1 },
              { label: 'środek (630, 11)', items: ['630 11'], points: 1 },
            ],
          },
          rubric: md`
            4 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za liczbę kwadratów
            3 pkt – za podanie współrzędnych środków kwadratów (po 1 pkt za każdą parę) i żadnego nieprawidłowego.
            2 pkt – za podanie współrzędnych 4 kwadratów (3 prawidłowych i jednego błędnego).
            1 pkt – za podanie współrzędnych 5 kwadratów (3 prawidłowych i dwóch błędnych).
            0 pkt – za odpowiedź niepełną lub niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            3 399 5 546 2 630 11
            (3 kwadraty o środkach (399, 5) (546, 2) (630, 11))
          `,
        },
        {
          no: '2.3',
          points: 2,
          page: 9,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe'],
          info: '2.3-2.4',
          text: md`
            Podaj największą liczbę spośród liczb zapisanych w pliku \`symbole.txt\`. W odpowiedzi podaj tę liczbę w zapisie dziesiętnym oraz napis jej odpowiadający.

            Odpowiedź dla pliku \`symbole_przyklad.txt\` to
            \`519789 ***+o*ooo++o\`
          `,
          example: { map: { 'symbole.txt': 'symbole_przyklad.txt' }, expect: '519789 ***+o*ooo++o' },
          expect: {
            parts: [
              { label: 'liczba (531246)', tokens: '531246', points: 1 },
              { label: 'napis (*******o+*+o)', tokens: '*******o+*+o', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za liczbę
            1 pkt – za napis.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: '`531246 *******o+*+o`',
        },
        {
          no: '2.4',
          points: 3,
          page: 9,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe'],
          info: '2.3-2.4',
          text: md`
            Oblicz sumę wszystkich liczb z pliku \`symbole.txt\`. Podaj jej wartość w zapisie dziesiętnym oraz w zapisie trójkowym z użyciem symboli: o, +, *.

            Odpowiedź dla pliku \`symbole_przyklad.txt\` to
            \`4841542 +oooo****+oo+o+\`
          `,
          example: { map: { 'symbole.txt': 'symbole_przyklad.txt' }, expect: '4841542 +oooo****+oo+o+' },
          expect: {
            parts: [
              { label: 'suma dziesiętnie (527865439)', tokens: '527865439', points: 1 },
              { label: 'suma w zapisie o, +, *', tokens: '++oo*+oo*++ooo*o*++', points: 2 },
            ],
          },
          rubric: md`
            3 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za podanie poprawnej sumy w systemie dziesiętnym
            2 pkt – za podanie poprawnej sumy w zapisie trójkowym z użyciem symboli: o,+,* (1 pkt za podanie poprawnej sumy w zapisie trójkowym z użyciem cyfr).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: '`527865439 ++oo*+oo*++ooo*o*++`',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Dron',
      intro: md`
        Tor lotu pewnego drona składa się z prostych odcinków. Lot rozpoczyna się w punkcie (0, 0), a kończy w punkcie (20000, 0). Dron poza startem i lądowaniem jest zawsze na wysokości większej od zera.

        Plik \`dron.txt\` zawiera 100 wierszy, w których zapisano dane dotyczące ruchu drona. W każdym wierszu jest zapisana para liczb całkowitych rozdzielonych znakiem spacji. Pierwsza liczba oznacza przemieszczenie drona (odległość) w poziomie od ostatniej pozycji – jest to zawsze liczba dodatnia. Druga liczba oznacza przemieszczenie w pionie od ostatniej pozycji. Jeśli druga liczba jest dodatnia, to dron wykonał ruch w górę, jeśli ujemna – w dół, a jeśli równa 0 – nie zmieniał wysokości.

        **Przykład 1.**
        Dla przykładowych danych:

        \`\`\`
        3000 2000
        2000 9000
        5000 -7000
        5000 4000
        3000 6000
        2000 -14000
        \`\`\`

        lot drona można zilustrować na wykresie:

        <img class="fig-img" src="content/img/2025-maj/dron-wykres.png" alt="Wykres lotu drona: punkty (3000, 2000), (5000, 11000), (10000, 4000), (15000, 8000), (18000, 14000), (20000, 0)">

        gdzie:
        x – odległość w poziomie od punktu startowego
        y – wysokość (odległość w pionie od punktu startowego)
        [*A*, *B*] – umieszczone na wykresie pary liczb oznaczające przemieszczenia drona odpowiednio w poziomie i w pionie.

        **Napisz program** (lub kilka programów), który(-e) znajdzie(-dą) odpowiedzi dla podanych zadań. Każdą odpowiedź zapisz w pliku \`wyniki3.txt\` i poprzedź ją numerem oznaczającym zadanie.

        Do Twojej dyspozycji jest plik \`dron_przyklad.txt\` zawierający 10 wierszy danych w opisanej postaci. Odpowiedzi dla pliku \`dron_przyklad.txt\` są podane pod każdym zadaniem. Pamiętaj, że Twój program musi ostatecznie zadziałać na pliku \`dron.txt\` zawierającym 100 wierszy danych.
      `,
      files: ['dron.txt', 'dron_przyklad.txt'],
      tasks: [
        {
          no: '3.1',
          points: 2,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['NWD', 'algorytm Euklidesa'],
          text: md`
            Dla każdego przesunięcia [*A*, *B*] zapisanego w pliku \`dron.txt\` oblicz największy wspólny dzielnik (NWD) wartości bezwzględnych liczb *A* i *B*. Podaj liczbę par [*A*, *B*], dla których największy wspólny dzielnik wartości bezwzględnych liczb *A* i *B* jest większy od 1.

            **Uwaga:** przyjmujemy, że NWD(*A*, 0) = *A*.

            Odpowiedź dla pliku \`dron_przyklad.txt\` to
            6
          `,
          example: { map: { 'dron.txt': 'dron_przyklad.txt' }, expect: '6' },
          expect: '40',
          rubric: md`
            2 pkt – za poprawną odpowiedź.
            1 pkt – za odpowiedź wynikającą z uwzględnienia tylko liczb nieujemnych (26) albo za odpowiedź nie uwzględniającą pary z liczbą 0 (39), albo za odpowiedź uwzględniającą dwukrotnie parę z liczbą 0 (41).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: '40',
        },
        {
          no: '3.2',
          points: 4,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['geometria', 'punkty'],
          text: md`
            Rozważmy wszystkie punkty, w których dron znajdował się po wykonaniu kolejnych ruchów (przesunięć).
            Dla danych z przykładu 1. będą to punkty: (3000, 2000), (5000, 11000), (10000, 4000), (15000, 8000), (18000, 14000) i (20000, 0).

            a) Podaj, ile spośród wszystkich rozważanych punktów znajduje się wewnątrz kwadratu o wierzchołkach (0, 0), (0, 5000), (5000, 5000), (5000, 0). Nie liczymy punktów leżących na krawędziach kwadratu.

            b) Spośród wszystkich rozważanych punktów znajdź i podaj trzy różne, takie, że jeden z nich jest środkiem odcinka o końcach w pozostałych dwóch. Jest tylko jedna taka trójka punktów.
            **Uwaga:** punkty należące do szukanej trójki nie muszą być trzema kolejnymi punktami, do których przemieszczał się dron.

            Odpowiedź dla pliku \`dron_przyklad.txt\` to
            a) 2
            b) (14000, 3014), (16000, 2010), (18000, 1006)
          `,
          example: { map: { 'dron.txt': 'dron_przyklad.txt' }, expect: { parts: [{ tokens: '2', points: 1 }, { items: ['14000 3014', '16000 2010', '18000 1006'], points: 1 }] } },
          expect: {
            parts: [
              { label: 'a) liczba punktów w kwadracie (24)', tokens: '24', points: 2 },
              { label: 'b) trójka punktów', items: ['5832 1801', '7410 1990', '8988 2179'], points: 2 },
            ],
          },
          rubric: md`
            4 pkt – za poprawną odpowiedź, w tym:
            2 pkt – za poprawną odpowiedź w podpunkcie a)
            2 pkt – za poprawną odpowiedź w podpunkcie b) (1 pkt w przypadku podania poprawnych tylko współrzędnych x).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            a) 24
            b) 5832 1801 7410 1990 8988 2179
            (współrzędne trójki punktów (5832, 1801) (7410, 1990) (8988, 2179))
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
          points: 1,
          page: 12,
          kind: 'choice',
          cat: 'teoria',
          topics: ['bezpieczeństwo', 'złośliwe oprogramowanie'],
          text: md`
            Dokończ zdanie. Zaznacz właściwą odpowiedź spośród podanych.

            Program typu *keylogger* służy do
          `,
          options: [
            ['A', 'szyfrowania informacji do postaci uniemożliwiającej jej odczytanie bez zdefiniowanego klucza.'],
            ['B', 'przechowywania danych logowania, w tym haseł, w bezpiecznym miejscu na dysku użytkownika.'],
            ['C', 'generowania kodu, który umożliwia użytkownikowi bankowości elektronicznej wykonanie operacji.'],
            ['D', 'przechwytywania i gromadzenia informacji o naciśniętych klawiszach.'],
          ],
          answer: 'D',
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: 'D',
        },
      ],
    },
    {
      no: '5',
      title: null,
      tasks: [
        {
          no: '5',
          points: 2,
          page: 12,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe', 'działania w systemie binarnym'],
          text: md`
            Poniżej sposobem pisemnym dodano dwie liczby podane w zapisie binarnym. Uzupełnij brakujące cyfry tak, aby działanie było wykonane poprawnie.

            ${columnSum(SUM_ROWS, SUM_IDS)}
          `,
          fields: { a3: '0', a10: '1', b5: '1', c2: '0', c9: '0', c10: '0' },
          score: byCount([
            [6, 2],
            [4, 1],
          ]),
          rubric: md`
            2 pkt – odpowiedź poprawna dla wszystkich pól.
            1 pkt – odpowiedź poprawna dla 4 pól.
            0 pkt – odpowiedź niepełna lub niepoprawna albo brak rozwiązania.
          `,
          solution: `<table class="column-sum"><tbody>${SUM_FULL.map((r, i) => `<tr class="${i === 2 ? 'total' : ''}"><td>${i === 1 ? '+' : ''}</td>${'<td></td>'.repeat(12 - r.length)}${r.map((d) => `<td>${d}</td>`).join('')}</tr>`).join('')}</tbody></table>`,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '6',
      title: 'Martianeum',
      intro: md`
        W 2033 roku na Marsie wylądowała automatyczna stacja wydobywcza wyposażona w transporter i w autonomiczny dron pobierający ładunki skał zawierających minerał niewystępujący na Ziemi – martianeum.

        Stacja działa według następujących zasad:
        - dron codziennie przywozi ładunek z pewnego obszaru Marsa
        - stacja waży ładunek przywieziony przez drona i bada zawartość martianeum
        - jeśli zawartość martianeum w przywiezionym ładunku wynosi co najmniej 1%, to stacja automatycznie wydobywa cały minerał z tego ładunku
        - jeśli na koniec dnia (po wydobyciu martianeum) ilość minerału na stacji osiągnie co najmniej 100 kg, to transporter zabiera 100 kg na orbitę, skąd ładunek jest wysyłany na Ziemię, a transporter wraca do stacji (jeśli na stacji zgromadzone jest więcej niż 100 kg, to nadmiar pozostaje na stacji)
        - początkowy stan magazynu na stacji – 0 kg martianeum.

        W pliku tekstowym \`martianeum.txt\` w kolejnych wierszach zapisano dane z lat 2033–2038:
        - *data* – data przywozu ładunku w formacie rrrr-mm-dd
        - *nazwa_obszaru* – nazwa obszaru Marsa, z którego ładunek został pobrany
        - *masa [kg]* – masa ładunku drona w kilogramach
        - *zawartość [%]* – zawartość martianeum w próbce w % (nieujemna liczba z jednym miejscem po przecinku, np. 0,1 oznacza 0,1%)

        Dane w pliku rozdzielono znakami tabulacji.

        **Przykład:**

        ${sample(`data\tnazwa_obszaru\tmasa [kg]\tzawartosc [%]
        2033-03-03\tCebrenia\t27,8\t0,2
        2033-03-04\tAmenthes\t11,8\t1,7
        2033-03-05\tNoachis\t21,0\t6,0
        2033-03-06\tCoprates\t26,3\t11,4
        2033-03-07\tIsmenius Lacus\t28,8\t0,0
        2033-03-08\tMare Boreum\t29,2\t0,0`)}

        Z wykorzystaniem danych zawartych w pliku \`martianeum.txt\` oraz dostępnych narzędzi informatycznych wykonaj podane zadania. Wyniki zapisz w pliku tekstowym \`wyniki6.txt\`. Odpowiedź do każdego zadania poprzedź numerem tego zadania.
      `,
      files: ['martianeum.txt'],
      sheet: { file: 'martianeum.txt' },
      tasks: [
        {
          no: '6.1',
          points: 2,
          page: 13,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['funkcje warunkowe', 'sumy'],
          text: md`Podaj łączną masę ładunków drona oraz łączną masę martianeum wydobytego przez stację.`,
          answerHint: 'Najpierw łączna masa ładunków, potem masa martianeum.',
          expect: {
            parts: [
              { label: 'łączna masa ładunków (41498,2 kg)', tokens: '41498,2', points: 1 },
              { label: 'łączna masa martianeum (3092,2943 kg)', tokens: '3092,29', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za łączną masę ładunków
            1 pkt – za łączną masę martianeum.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            41498,2 kg
            3092,2943 kg
          `,
        },
        {
          no: '6.2',
          points: 1,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['funkcje statystyczne', 'tabela przestawna'],
          text: md`Podaj nazwę obszaru, dla którego średnia masa przywiezionych ładunków jest najmniejsza.`,
          expect: 'Thaumasia',
          rubric: md`
            1 pkt – za poprawną odpowiedź.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: 'Thaumasia',
        },
        {
          no: '6.3',
          points: 2,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['daty', 'zestawienia'],
          text: md`
            Czas pracy stacji dzielimy na kolejne 7-dniowe okresy. Pierwszy okres obejmuje dni od 03.03.2033 do 09.03.2033, drugi – od 10.03.2033 do 16.03.2033 itd.
            Podaj największą łączną masę ładunków przywiezionych w ciągu kolejnych 7-dniowych okresów oraz podaj datę początku okresu, w którym przywieziono tę największą masę.
          `,
          expect: {
            parts: [
              { label: 'data początku okresu (13.12.2035)', tokens: '13.12.2035', points: 1 },
              { label: 'masa (174,5 kg)', tokens: '174,5', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za datę
            1 pkt – za masę.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            13.12.2035
            174,5 kg
          `,
        },
        {
          no: '6.4',
          points: 3,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy', 'tabela przestawna'],
          text: md`
            Wykonaj zestawienie, w którym dla każdego obszaru podasz, ile razy dron przewoził ładunek z tego obszaru w poszczególnych latach.

            Na podstawie wykonanego zestawienia utwórz wykres skumulowany kolumnowy. Pamiętaj o czytelnym opisie wykresu: na osi X umieść nazwy obszarów, dodaj opisy osi – „nazwy obszarów” dla osi X i „liczba przewozów ładunku” dla osi Y, tytuł oraz legendę zawierającą kolejne lata.
          `,
          answerHint: 'Jeden obszar w wierszu: nazwa i liczby przewozów w latach 2033–2038.',
          expect: { parts: [{ label: 'zestawienie', lines: AREAS_64.map((r) => r.join(' ')), points: 1 }] },
          self: { points: 2, label: 'wykres skumulowany kolumnowy', hint: 'Dobór danych i typ wykresu (1 pkt) oraz opis wykresu i osi: tytuł, legenda, nazwy obszarów na osi X, opisy osi X i Y (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za poprawne zestawienie
            1 pkt – za prawidłowy dobór danych i typ wykresu
            1 pkt – za poprawny opis wykresu i osi (tytuł, legenda, nazwy obszarów na osi X, opisy na osiach X i Y).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: table([['Nazwy obszarów', '2033', '2034', '2035', '2036', '2037', '2038'], ...AREAS_64.map((r) => r.map(String))]),
        },
        {
          no: '6.5',
          points: 3,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          text: md`
            Uwzględnij zasady działania stacji opisane na początku zadania i podaj:
            - ile razy stacja wysyłała ładunek na orbitę
            - datę pierwszego transportu ładunku na orbitę
            - datę ostatniego transportu ładunku na orbitę.
          `,
          expect: {
            parts: [
              { label: 'liczba wysyłek (30)', tokens: '30', points: 1 },
              { label: 'data pierwszego transportu (29.05.2033)', tokens: '29.05.2033', points: 1 },
              { label: 'data ostatniego transportu (1.09.2038)', tokens: '1.09.2038', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za podanie prawidłowej liczby wysyłek ładunku na orbitę
            2 pkt – za podanie prawidłowych dat (w tym po 1 pkt za datę początku i końca okresu).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            30 razy
            29.05.2033 1.09.2038
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Poszukiwanie wody na Marsie',
      intro: md`
        W trzech plikach tekstowych o nazwach \`laziki.txt\`, \`obszary.txt\`, \`pomiary.txt\` zapisano informacje zawierające dane o poszukiwaniu wody na Marsie w latach 2050–2080. Łaziki zasilane energią słoneczną poruszają się po różnych obszarach Marsa i wykonują pomiary georadarowe, na podstawie których szacują ilość wody i głębokość, na której się ona znajduje. Pierwszy wiersz każdego z plików jest wierszem nagłówkowym, a dane w wierszach rozdzielono znakami tabulacji.

        Plik o nazwie \`laziki.txt\` zawiera informacje o różnych łazikach, które wykonywały pomiary. W każdym wierszu tego pliku znajdują się:
        - *nr_lazika* – co najwyżej trzycyfrowy, unikatowy numer łazika
        - *nazwa_lazika* – nazwa łazika (tekst do 50 znaków)
        - *rok_wyslania* – rok startu z Ziemi
        - *wsp_ladowania* – współrzędne lądowania na Marsie oddzielone znakiem przecinka i spacją

        **Przykład:**

        ${sample(`nr_lazika\tnazwa_lazika\trok_wyslania\twsp_ladowania
        1\tMariner 3\t2049\t50.51N, 70.01E
        2\tMariner 6\t2050\t11.90N, 119.49E
        3\tMariner 7\t2050\t44.90S, 130.80W`)}

        Plik o nazwie \`obszary.txt\` zawiera informacje o obszarach na Marsie. W każdym wierszu tego pliku znajdują się:
        - *kod_obszaru* – pięcioznakowy, unikatowy kod obszaru
        - *nazwa_obszaru* – nazwa obszaru (tekst do 50 znaków)

        **Przykład:**

        ${sample(`kod_obszaru\tnazwa_obszaru
        MC-01\tMare Boreum
        MC-02\tDiacria
        MC-03\tArcadia`)}

        Plik o nazwie \`pomiary.txt\` zawiera informacje o wynikach badań georadarowych wykonanych przez łaziki. W każdym wierszu tego pliku znajdują się:
        - *nr_lazika* – co najwyżej trzycyfrowy numer łazika
        - *data_pomiaru* – data wykonania pomiaru (w formacie rrrr-mm-dd)
        - *kod_obszaru* – pięcioznakowy kod obszaru, na którym został wykonany pomiar
        - *wspolrzedne* – współrzędne wykonania pomiaru, oddzielone znakiem przecinka i spacją
        - *glebokosc* – szacowana głębokość, na której znajduje się woda (w metrach)
        - *ilosc* – szacowana ilość wody (w m<sup>3</sup>)

        **Przykład:**

        ${sample(`nr_lazika\tdata_pomiaru\tkod_obszaru\twspolrzedne\tglebokosc\tilosc
        17\t2061-06-03\tMC-13\t13.17N, 77.80E\t344\t5622
        17\t2056-06-02\tMC-14\t14.93N, 106.00E\t43\t2054
        47\t2075-10-18\tMC-05\t45.57N, 3.30E\t9\t23366`)}

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych podaj odpowiedzi do zadań 7.1–7.4. Odpowiedzi zapisz w pliku \`wyniki7.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['laziki.txt', 'obszary.txt', 'pomiary.txt'],
      tables: { Laziki: 'laziki.txt', Obszary: 'obszary.txt', Pomiary: 'pomiary.txt' },
      tasks: [
        {
          no: '7.1',
          points: 2,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie', 'złączenia'],
          text: md`Podaj nazwę obszaru, na którym znaleziono łącznie we wszystkich pomiarach najwięcej m<sup>3</sup> wody na głębokości do 100 metrów włącznie. Jest jeden taki obszar.`,
          expect: 'Mare Boreum',
          rubric: md`
            2 pkt – za pełną poprawną odpowiedź.
            1 pkt – za odpowiedź, w której: podano obszar, na którym znaleziono najmniej wody (Sinus Sabaeus) albo podano kod zamiast nazwy obszaru (MC-01).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: 'Mare Boreum',
        },
        {
          no: '7.2',
          points: 2,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'daty', 'MIN/MAX'],
          text: md`Podaj nazwę łazika, który wykonywał pomiary w najdłuższym okresie, licząc od pierwszego (najwcześniejszego) do ostatniego (najpóźniejszego) pomiaru. Podaj datę pierwszego i ostatniego pomiaru wykonanego przez ten łazik.`,
          expect: {
            parts: [
              { label: 'nazwa łazika (Spirit 14)', tokens: 'Spirit 14', points: 1 },
              { label: 'daty (29.08.2066, 25.07.2076)', tokens: '29.08.2066 25.07.2076', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za poprawną nazwę łazika
            1 pkt – za poprawne daty.
            0 pkt – za odpowiedź niepełną lub niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            Spirit 14
            29.08.2066 25.07.2076
          `,
        },
        {
          no: '7.3',
          points: 2,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'podzapytania', 'NOT IN'],
          text: md`Podaj nazwy obszarów na Marsie, na których żaden z łazików nie wykonał ani jednego pomiaru w tym samym roku, w którym został wysłany z Ziemi.`,
          expect: { parts: [{ lines: ['Aeolis', 'Amazonis', 'Arabia', 'Elysium', 'Eridania', 'Mare Tyrrhenum', 'Sinus Sabaeus', 'Syrtis Major'], points: 2 }] },
          rubric: md`
            2 pkt – za pełną poprawną odpowiedź.
            1 pkt – za podanie wszystkich prawidłowych nazw obszarów, na których łaziki wykonały pierwszy pomiar w tym samym roku, w którym zostały wysłane z Ziemi (22 obszary).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            Aeolis
            Amazonis
            Arabia
            Elysium
            Eridania
            Mare Tyrrhenum
            Sinus Sabaeus
            Syrtis Major
          `,
        },
        {
          no: '7.4',
          points: 2,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'funkcje tekstowe', 'podzapytania'],
          text: md`Podaj nazwy łazików, które wylądowały na półkuli południowej, ale wykonywały pomiary na obu półkulach: północnej (N) i południowej (S).`,
          expect: { parts: [{ lines: ['Mariner 14', 'Mariner 15', 'Mariner 20', 'Viking 17', 'Spirit 7', 'Spirit 12', 'Rosetta 1', 'Rosetta 8', 'Phoenix 3', 'Phoenix 13'], points: 2 }] },
          rubric: md`
            2 pkt – za poprawną odpowiedź.
            1 pkt – za podanie wszystkich nazw łazików, które badały obszary na obu półkulach albo za podanie wszystkich numerów łazików zamiast ich nazw.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            Mariner 14, Mariner 15, Mariner 20, Viking 17, Spirit 7, Spirit 12, Rosetta 1, Rosetta 8, Phoenix 3, Phoenix 13
          `,
        },
        {
          no: '7.5',
          points: 2,
          page: 17,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'DISTINCT'],
          text: md`
            Do tabel utworzonych na podstawie opisanych wcześniej plików dołączamy kolejną – o nazwie *Producent*, w której zapisano informacje o producentach poszczególnych modeli łazików.

            Tabela *Producent* zawiera następujące pola:
            - *kod_producenta* – unikatowy kod producenta
            - *nazwa* – nazwa producenta
            - *kraj* – kraj producenta

            Do tabeli *Laziki* dodano pole *kod_producenta*.

            Napisz w języku SQL zapytanie, w wyniku którego otrzymasz listę nazw producentów, których łaziki badały obszar Marsa o nazwie *Arcadia* w roku 2060. Nazwy producentów nie mogą się powtarzać.
          `,
          extraTables: { Producent: ['kod_producenta TEXT PRIMARY KEY', 'nazwa TEXT', 'kraj TEXT'] },
          extraColumns: { Laziki: ['kod_producenta TEXT'] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym błędem, np. błąd przy JOIN albo błąd w warunku po WHERE itp.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
            Uwaga: wymagamy uniwersalnego zapytania działającego dla dowolnych danych.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`sql
            SELECT DISTINCT Producent.nazwa
            FROM Producent
            INNER JOIN Laziki
            ON Producent.kod_producenta = Laziki.kod_producenta
            INNER JOIN Pomiary
            ON Laziki.nr_lazika = Pomiary.nr_lazika
            INNER JOIN Obszary
            ON Obszary.kod_obszaru = Pomiary.kod_obszaru
            WHERE Obszary.nazwa_obszaru = "Arcadia" and YEAR(Pomiary.data_pomiaru) = 2060;
            \`\`\`
          `,
        },
      ],
    },
  ],
};
