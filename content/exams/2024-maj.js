import { md, table, sample, all, perField, byCount } from '../lib.js';

// Zadanie 1: boards. Rows of 1 (white) / 0 (black).
function board(rows) {
  return `<table class="board">${rows.map((r) => `<tr>${[...r].map((c) => `<td class="${c === '1' ? 'w' : 'b'}"></td>`).join('')}</tr>`).join('')}</table>`;
}

// The algorithm from the task: is there a path of white fields moving only right or down?
function pathExists(rows) {
  const n = rows.length;
  const m = rows[0].length;
  const P = Array.from({ length: n }, () => new Array(m).fill(false));
  for (let i = 0; i < n; i++)
    for (let j = 0; j < m; j++) {
      if (rows[i][j] === '0') P[i][j] = false;
      else if (i === 0 && j === 0) P[i][j] = true;
      else if (i === 0) P[i][j] = P[i][j - 1];
      else if (j === 0) P[i][j] = P[i - 1][j];
      else P[i][j] = P[i][j - 1] || P[i - 1][j];
    }
  return P[n - 1][m - 1];
}

function readBoard(v, n, m) {
  const rows = String(v || '').split('/');
  return Array.from({ length: n }, (_, i) => Array.from({ length: m }, (_, j) => (rows[i]?.[j] === '0' ? '0' : '1')).join(''));
}

const blackCount = (rows) => rows.join('').split('').filter((c) => c === '0').length;

function digitsAlg(n) {
  let b = 1n;
  let c = 0n;
  let x = BigInt(n);
  while (x > 0n) {
    const a = x % 10n;
    x /= 10n;
    if (a % 2n === 0n) c += b * (a / 2n);
    else c += b;
    b *= 10n;
  }
  return c;
}

function skrot(n) {
  let m = 0;
  let p = 1;
  while (n > 0) {
    const d = n % 10;
    if (d % 2 !== 0) {
      m += d * p;
      p *= 10;
    }
    n = Math.floor(n / 10);
  }
  return m;
}

// "co najmniej jedna poprawna i żadnej niepoprawnej" rubrics for lists of numbers
function listScore(full, steps) {
  return (oks, { extra }) => {
    const good = oks.filter(Boolean).length;
    for (const [minGood, maxWrong, pts] of steps) if (good >= minGood && extra.length <= maxWrong) return pts;
    return 0;
  };
}

export default {
  id: '2024-maj',
  year: 2024,
  session: 'maj',
  term: 'termin główny',
  date: '2024-05-22',
  dateText: '22 maja 2024 r.',
  symbol: 'MINP-R0-100-2405',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2024-maj-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2024-maj-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Plansza',
      intro: md`
        Dana jest prostokątna plansza złożona z *n* wierszy i *m* kolumn zawierająca *n* \\* *m* pól. Wiersze są ponumerowane od góry kolejnymi liczbami 1, 2, …, *n*, natomiast kolumny od lewej do prawej kolejnymi liczbami 1, 2, …, *m*. Każde pole jest albo białe, albo czarne.

        Planszę możemy opisać jako tablicę dwuwymiarową *A*[1..*n*][1..*m*], w której *A*[*i*][*j*] = 0, jeśli pole w *i*-tym wierszu i *j*-tej kolumnie jest czarne, natomiast *A*[*i*][*j*] = 1, jeśli to pole jest białe. Pola w lewym górnym rogu oraz prawym dolnym rogu zawsze są białe (czyli *A*[1][1] = 1 oraz *A*[*n*][*m*] = 1).

        Rozważmy następujący algorytm, w którym jest wykorzystywana pomocnicza tablica *P*[1..*n*][1..*m*], przyjmująca wartości logiczne (PRAWDA albo FAŁSZ).

        **Specyfikacja:**
        Dane:
        *n*, *m* – liczby całkowite dodatnie, wymiary planszy
        *A*[1..*n*][1..*m*] – opis planszy
        Wynik:
        PRAWDA albo FAŁSZ

        \`\`\`pseudo
        P[1][1] ← PRAWDA
        dla i = 1, 2, ..., n wykonuj
            dla j = 1, 2, .., m wykonuj
                jeżeli A[i][j] = 0
                    P[i][j] ← FAŁSZ
                w przeciwnym przypadku
                    jeżeli i = 1 oraz j ≠ 1
                        P[i][j] ← P[i][j – 1]
                    jeżeli i ≠ 1 oraz j = 1
                        P[i][j] ← P[i – 1][j]
                    jeżeli i ≠ 1 oraz j ≠ 1
                        P[i][j] ← P[i][j – 1] lub P[i – 1][j]
        podaj wynik P[n][m]
        \`\`\`
      `,
      tasks: [
        {
          no: '1.1',
          points: 2,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['tablice dwuwymiarowe', 'analiza algorytmu', 'programowanie dynamiczne'],
          text: md`
            Podaj wynik działania algorytmu dla plansz podanych na rysunkach poniżej, gdzie *n* to liczba wierszy, a *m* to liczba kolumn danej planszy.

            a) *n* = 3, *m* = 3

            ${board(['111', '010', '111'])}

            Wynik: {{a:PRAWDA|FAŁSZ}}

            b) *n* = 5, *m* = 3

            ${board(['111', '001', '111', '100', '111'])}

            Wynik: {{b:PRAWDA|FAŁSZ}}

            c) *n* = 5, *m* = 5

            ${board(['10000', '11001', '01001', '01110', '01011'])}

            Wynik: {{c:PRAWDA|FAŁSZ}}
          `,
          fields: { a: 'PRAWDA', b: 'FAŁSZ', c: 'PRAWDA' },
          score: byCount([
            [3, 2],
            [2, 1],
          ]),
          rubric: md`
            2 pkt – odpowiedź poprawna dla trzech podpunktów.
            1 pkt – odpowiedź poprawna dla dwóch podpunktów.
            0 pkt – odpowiedź niepoprawna lub niepełna albo brak odpowiedzi.
          `,
          solution: md`
            a) PRAWDA
            b) FAŁSZ
            c) PRAWDA
          `,
        },
        {
          no: '1.2',
          points: 2,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['tablice dwuwymiarowe', 'analiza algorytmu'],
          text: md`
            Przy założeniu, że lewy górny i prawy dolny róg planszy <u>są białe</u>, podaj przykład planszy (zamaluj odpowiednie pola lub wpisz w nie zera):

            a) o 5 wierszach i 5 kolumnach, na której **co najwyżej 2 pola** są czarne, a wynikiem działania algorytmu jest FAŁSZ

            {{a:board:5x5}}

            b) o 4 wierszach i 4 kolumnach, na której **co najmniej 9 pól** jest czarnych, a wynikiem działania algorytmu jest PRAWDA.

            {{b:board:4x4}}
          `,
          fields: { a: null, b: null },
          validate: (v) => {
            const a = readBoard(v.a, 5, 5);
            const b = readBoard(v.b, 4, 4);
            const okA = blackCount(a) <= 2 && !pathExists(a);
            const okB = blackCount(b) >= 9 && pathExists(b);
            const why = [];
            why.push(`a) czarnych pól: ${blackCount(a)}, wynik algorytmu: ${pathExists(a) ? 'PRAWDA' : 'FAŁSZ'}`);
            why.push(`b) czarnych pól: ${blackCount(b)}, wynik algorytmu: ${pathExists(b) ? 'PRAWDA' : 'FAŁSZ'}`);
            return { ok: { a: okA, b: okB }, points: (okA ? 1 : 0) + (okB ? 1 : 0), note: why.join(' · ') };
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – poprawny rysunek w podpunkcie a)
            1 pkt – poprawny rysunek w podpunkcie b).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.

            Uwaga: Musi istnieć ścieżka przejścia po białych polach od lewego górnego rogu do prawego dolnego, taka że poruszamy się tylko w prawo lub w dół.
          `,
          solution: md`
            Przykładowe rozwiązania:

            Podpunkt a):

            ${board(['10111', '01111', '11111', '11111', '11111'])}

            ${board(['11111', '11111', '11111', '11110', '11101'])}

            Podpunkt b):

            ${board(['1000', '1000', '1000', '1111'])}

            (Program sprawdza Twoją planszę, wykonując algorytm z zadania – poprawnych odpowiedzi jest wiele.)
          `,
        },
        {
          no: '1.3',
          points: 1,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['tablice dwuwymiarowe', 'analiza algorytmu'],
          text: md`
            Dana jest kwadratowa plansza o *n* wierszach i *n* kolumnach.
            Podaj, jaka jest największa możliwa liczba czarnych pól na tej planszy, dla których wynikiem działania algorytmu jest PRAWDA.

            Odpowiedź: {{x|16}}

            Potęgę zapisz np. jako \`(n-1)^2\`.
          `,
          fields: { x: { expr: ['(n-1)^2', '(n-1)*(n-1)', 'n^2-2n+1', 'n^2-2*n+1', 'n*n-2*n+1', '(1-n)^2', 'n^2-2n+1', '(n-1)(n-1)', 'pow(n-1,2)'] } },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '(*n* – 1)<sup>2</sup>',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Cyfry',
      intro: md`
        Przeanalizuj poniższy algorytm, który dla danej nieujemnej liczby całkowitej *n* oblicza liczbę całkowitą *c*.

        \`\`\`pseudo
        b ← 1
        c ← 0
        dopóki n > 0 wykonuj
            a ← n mod 10
            n ← n div 10
            jeżeli (a mod 2 = 0)
                c ← c + b * (a div 2)
            w przeciwnym razie
                c ← c + b
            b ← b * 10
        \`\`\`

        **Uwaga**: *x* mod *y*, *x* div *y* oznaczają – odpowiednio – resztę i iloraz z dzielenia całkowitego *x* przez *y*.
      `,
      tasks: [
        {
          no: '2.1',
          points: 2,
          page: 7,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['cyfry liczby', 'analiza algorytmu'],
          text: md`
            Uzupełnij poniższą tabelę – dla każdej z podanych liczb wpisz wartość zmiennej *c* po wykonaniu algorytmu oraz liczbę wykonań instrukcji *c* ← *c* + *b*.

            ${table([
              ['*n*', 'Wartość *c* po wykonaniu algorytmu dla danego *n*', 'Liczba wykonań instrukcji *c* ← *c* + *b*'],
              ['33658', '11314', '3'],
              ['542102', '{{c1|20}}', '{{k1|4}}'],
              ['87654321012345678', '{{c2|20}}', '{{k2|4}}'],
            ])}
          `,
          fields: { c1: String(digitsAlg('542102')), k1: '2', c2: String(digitsAlg('87654321012345678')), k2: '8' },
          score: (ok) => {
            const rows = [ok.c1 && ok.k1, ok.c2 && ok.k2].filter(Boolean).length;
            const cols = [ok.c1 && ok.c2, ok.k1 && ok.k2].filter(Boolean).length;
            return rows === 2 ? 2 : rows || cols ? 1 : 0;
          },
          rubric: md`
            2 pkt – po dwie poprawne odpowiedzi w obu wierszach.
            1 pkt – dwie poprawne odpowiedzi w jednym wierszu lub w jednej kolumnie.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['*n*', 'Wartość *c*', 'Liczba wykonań *c* ← *c* + *b*'],
            ['33658', '11314', '3'],
            ['542102', '121101', '2'],
            ['87654321012345678', '41312111011121314', '8'],
          ]),
        },
        {
          no: '2.2',
          points: 1,
          page: 8,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['cyfry liczby', 'analiza algorytmu'],
          text: md`
            Podaj wartość *c* po wykonaniu algorytmu dla osiemnastocyfrowej liczby całkowitej *n*, w której pierwszych sześć cyfr to 3, następnych sześć cyfr to 6, a pozostałych sześć cyfr to 9.

            *c* = {{c|22}}
          `,
          fields: { c: '111111333333111111' },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '111111333333111111',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Nieparzysty skrót',
      intro: md`
        *Nieparzystym skrótem* dodatniej liczby całkowitej *n* nazwiemy dodatnią liczbę całkowitą *m*, która powstaje przez usunięcie cyfr parzystych z zapisu dziesiętnego liczby *n*. Nieparzysty skrót liczby całkowitej *n* nie istnieje, gdy jej zapis dziesiętny składa się tylko z cyfr parzystych.

        **Przykład:**
        Nieparzystym skrótem liczby 294762 jest liczba 97.
        Nieparzystym skrótem liczby 39101 jest liczba 3911.
        Nieparzysty skrót liczby 224 nie istnieje.
      `,
      files: ['skrot.txt', 'skrot_przyklad.txt', 'skrot2.txt', 'skrot2_przyklad.txt'],
      tasks: [
        {
          no: '3.1',
          points: 3,
          page: 8,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['cyfry liczby', 'zapis algorytmu'],
          text: md`
            W postaci pseudokodu lub w wybranym języku programowania napisz funkcję, która dla dodatniej całkowitej liczby *n*, takiej że istnieje dla niej nieparzysty skrót, wyznaczy liczbę *m* – nieparzysty skrót liczby *n*.

            **Uwaga:** Twój algorytm może używać wyłącznie zmiennych przechowujących liczby całkowite oraz może operować wyłącznie na liczbach całkowitych. W zapisie możesz wykorzystać tylko operacje arytmetyczne: dodawanie, odejmowanie, mnożenie, dzielenie, dzielenie całkowite, resztę z dzielenia oraz porównywanie liczb, instrukcje sterujące, przypisania do zmiennych lub samodzielnie napisane funkcje, wykorzystujące wyżej wymienione operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów innych niż wymienione.

            **Specyfikacja:**
            Dane:
            *n* – dodatnia liczba całkowita, taka że istnieje dla niej nieparzysty skrót
            Wynik:
            *m* – nieparzysty skrót liczby *n*
          `,
          algo: {
            inputs: [{ name: 'n', type: 'int', desc: 'dodatnia liczba całkowita, dla której istnieje nieparzysty skrót' }],
            outputs: [{ name: 'm', type: 'int', desc: 'nieparzysty skrót liczby n' }],
            examples: [
              { in: [294762], out: [97] },
              { in: [39101], out: [3911] },
            ],
            ref: skrot,
            gen: (r) => {
              let n;
              do n = r.pick([r.int(1, 99), r.int(1, 99999), r.int(1, 999999999), r.int(1, 2 ** 31 - 1)]);
              while (skrot(n) === 0);
              return [n];
            },
            random: 14,
            noBuiltins: 'conversion',
          },
          rubric: md`
            3 pkt – prawidłowy algorytm, w tym:
            1 pkt – poprawny zapis pętli przechodzącej przez wszystkie cyfry liczby *n*
            1 pkt – poprawne pobieranie cyfry i sprawdzanie nieparzystości
            1 pkt – otrzymanie poprawnej liczby wynikowej *m*.
            0 pkt – rozwiązanie błędne albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`pseudo
            m ← 0
            p ← 1
            dopóki n > 0
                cyfra ← n mod 10
                jeżeli cyfra mod 2 ≠ 0
                    m ← m + cyfra * p
                    p ← p * 10
                n ← n div 10
            \`\`\`
          `,
        },
        {
          no: '3.2',
          points: 3,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['cyfry liczby'],
          mainFile: 'skrot.txt',
          text: md`
            Plik \`skrot.txt\` zawiera 200 dodatnich liczb całkowitych, mniejszych od 30 000. Każda liczba jest zapisana w osobnym wierszu. Dla co najmniej jednej z tych liczb nie istnieje nieparzysty skrót.

            Napisz program, który wyznaczy liczbę wszystkich liczb z pliku \`skrot.txt\`, dla których nie istnieje nieparzysty skrót, oraz poda największą z nich. Odpowiedź zapisz w pliku \`wyniki3_2.txt\`.

            Plik \`skrot_przyklad.txt\` zawiera 20 liczb mniejszych od 30 000. Dla danych zawartych w pliku \`skrot_przyklad.txt\` prawidłową odpowiedzią jest:

            \`\`\`
            2
            2428
            \`\`\`

            (w pliku są dwie liczby, dla których nie istnieje nieparzysty skrót: 266 i 2428; 2428 jest największą z nich).
          `,
          example: { map: { 'skrot.txt': 'skrot_przyklad.txt' }, expect: '2 2428' },
          expect: {
            parts: [
              { label: 'liczba liczb bez nieparzystego skrótu (18)', tokens: '18', points: 1 },
              { label: 'największa z nich (28422)', tokens: '28422', points: 2 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za liczbę liczb, dla których nie istnieje nieparzysty skrót
            2 pkt – za największą liczbę, dla której nie istnieje nieparzysty skrót
            (1 pkt – za podanie liczby 46, czyli minimum zamiast maksimum).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            18
            28422
            \`\`\`
          `,
        },
        {
          no: '3.3',
          points: 4,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['cyfry liczby', 'NWD'],
          mainFile: 'skrot2.txt',
          text: md`
            Plik \`skrot2.txt\` zawiera 200 dodatnich liczb całkowitych, mniejszych od 30 000. Każda liczba jest zapisana w osobnym wierszu. Dla każdej z tych liczb istnieje nieparzysty skrót.

            Napisz program, który wypisze te liczby z pliku \`skrot2.txt\`, dla których największy wspólny dzielnik liczby i jej nieparzystego skrótu jest równy 7. Odpowiedź zapisz w pliku \`wyniki3_3.txt\`. Twój program powinien wypisać w każdym wierszu wyniku po jednej liczbie z pliku \`skrot2.txt\`, dla której jest spełniony powyższy warunek.

            Plik \`skrot2_przyklad.txt\` zawiera 20 liczb spełniających warunki zadania. Dla danych zawartych w pliku \`skrot2_przyklad.txt\` prawidłową odpowiedzią jest:

            \`\`\`
            4872
            23527
            \`\`\`
          `,
          example: { map: { 'skrot2.txt': 'skrot2_przyklad.txt' }, expect: { parts: [{ lines: ['4872', '23527'], points: 1 }] } },
          expect: {
            exactLines: false,
            parts: ['784', '14196', '2247', '24087', '3871', '10192'].map((v, i) => ({ lines: [v], points: i < 4 ? 1 : 0 })),
            score: listScore(6, [
              [6, 0, 4],
              [5, 0, 3],
              [1, 0, 2],
              [6, 2, 1],
            ]),
          },
          rubric: md`
            4 pkt – odpowiedź poprawna.
            3 pkt – podanie w wyniku 5 poprawnych liczb i żadnej niepoprawnej.
            2 pkt – podanie w wyniku co najmniej jednej poprawnej liczby i żadnej niepoprawnej.
            1 pkt – podanie wszystkich poprawnych liczb i nie więcej niż dwóch niepoprawnych.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            784
            14196
            2247
            24087
            3871
            10192
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '4',
      title: 'Liczby',
      intro: md`
        Plik \`liczby.txt\` składa się z dwóch wierszy:
        - pierwszy wiersz pliku zawiera 3000 liczb pierwszych z przedziału [2, 2000]
        - drugi wiersz pliku zawiera 20 liczb całkowitych z przedziału [2, 1 000 000 000].

        Liczby w wierszach są rozdzielone znakami spacji.

        Napisz program (lub kilka programów), który(-e) znajdzie(-ą) odpowiedzi do podanych zadań. Każdą odpowiedź zapisz w pliku \`wyniki4.txt\` i poprzedź ją numerem oznaczającym zadanie.

        Do Twojej dyspozycji jest plik \`liczby_przyklad.txt\`, który zawiera 200 liczb w pierwszym wierszu (są to wyłącznie liczby 2, 3, 5, 7 i 31) oraz 20 liczb w drugim wierszu. Odpowiedzi dla danych z tego pliku są umieszczone pod każdym zadaniem.

        Pamiętaj, że Twój program musi ostatecznie zadziałać na pliku \`liczby.txt\` z 3000 liczb w pierwszym wierszu.
      `,
      files: ['liczby.txt', 'liczby_przyklad.txt'],
      tasks: [
        {
          no: '4.1',
          points: 2,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['podzielność'],
          text: md`
            Podaj, ile liczb z pierwszego wiersza jest dzielnikiem jakiejkolwiek liczby spośród liczb z drugiego wiersza.

            Dla pliku \`liczby_przyklad.txt\` odpowiedzią jest 199
            (tylko liczba 31, która występuje raz, nie jest dzielnikiem żadnej z liczb w drugim wierszu).
          `,
          example: { map: { 'liczby.txt': 'liczby_przyklad.txt' }, expect: '199' },
          expect: '212',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź 2788 (liczby, które nie są dzielnikami, zamiast tych, które nimi są).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '212',
        },
        {
          no: '4.2',
          points: 2,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['sortowanie'],
          text: md`
            Spośród liczb z pierwszego wiersza podaj liczbę, która jest sto pierwszą liczbą w kolejności, licząc od największej po ich uporządkowaniu.

            **Przykład:** wśród liczb 2, 4, 2, 3, 3, 4 drugą w kolejności, licząc od największej, jest liczba 4.

            Dla pliku \`liczby_przyklad.txt\` odpowiedzią jest 5.
          `,
          example: { map: { 'liczby.txt': 'liczby_przyklad.txt' }, expect: '5' },
          expect: '1933',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – za podanie w odpowiedzi liczby 31 (101-szej w kolejności od najmniejszej).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '1933',
        },
        {
          no: '4.3',
          points: 3,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['rozkład na czynniki pierwsze'],
          text: md`
            Dla każdej z liczb z drugiego wiersza rozstrzygnij, czy da się ją przedstawić jako iloczyn jedynie liczb z pierwszego wiersza. Przy tym liczba wystąpień danego czynnika w iloczynie nie może być większa niż liczba wystąpień tego czynnika w pierwszym wierszu. Znajdź wszystkie liczby, które da się tak przedstawić, i je wypisz.

            Dla pliku \`liczby_przyklad.txt\` odpowiedzią są liczby:
            10 12 14 15 18 20 21 25 27 28
            (liczbę 16 można przedstawić jako iloczyn 2∙2∙2∙2, jednak w pierwszym wierszu liczba 2 występuje tylko dwa razy, więc 16 nie należy do rozwiązania. Podobnie jest z liczbą 24, którą można przedstawić jako iloczyn 2∙2∙2∙3).
          `,
          answerHint: 'Każdą liczbę w osobnym wierszu.',
          example: { map: { 'liczby.txt': 'liczby_przyklad.txt' }, expect: { parts: [{ items: ['10', '12', '14', '15', '18', '20', '21', '25', '27', '28'], points: 1 }] } },
          expect: {
            parts: ['547839600', '2954285', '573219169', '573549984', '212444924'].map((v, i) => ({ items: [v], points: i < 3 ? 1 : 0 })),
            score: (oks, { extraNumbers }) => {
              const good = oks.filter(Boolean).length;
              if (extraNumbers.length) return 0;
              return good === 5 ? 3 : good >= 3 ? 2 : good >= 1 ? 1 : 0;
            },
          },
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – znalezienie co najmniej trzech prawidłowych liczb i żadnej niepoprawnej.
            1 pkt – znalezienie co najmniej jednej poprawnej liczby i żadnej niepoprawnej.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            547839600
            2954285
            573219169
            573549984
            212444924
            \`\`\`
          `,
        },
        {
          no: '4.4',
          points: 3,
          page: 12,
          kind: 'program',
          cat: 'programowanie',
          topics: ['ciągi', 'sumy prefiksowe'],
          text: md`
            Znajdź w ciągu liczb z pierwszego wiersza spójny fragment, który zawiera co najmniej 50 elementów i którego średnia arytmetyczna jest największa.
            Jeżeli jest więcej niż jeden taki fragment, wybierz ten, który występuje jako pierwszy w pliku \`liczby.txt\`.

            W odpowiedzi wypisz:
            - znalezioną najwyższą średnią
            - liczbę elementów ciągu z tą najwyższą średnią
            - liczbę, która jest pierwszym elementem tego ciągu.

            Dla pliku \`liczby_przyklad.txt\` odpowiedzią jest:
            5,52 50 5
            (największa średnia to 5,52 dla 50 liczb zaczynających się od liczby 5).
          `,
          example: { map: { 'liczby.txt': 'liczby_przyklad.txt' }, expect: '5,52 50 5' },
          expect: {
            parts: [
              { label: 'najwyższa średnia (1200,70…)', tokens: '1200,70', points: 1 },
              { label: 'liczba elementów (61)', tokens: '1200,70 61', points: 1 },
              { label: 'pierwszy element ciągu (1847)', tokens: '1847', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – podanie poprawnej średniej
            1 pkt – podanie liczby elementów
            1 pkt – podanie początku ciągu.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Średnia: 1200.704918032787
            Liczba elementów w ciągu: 61
            liczba początkowa 1847 (na pozycji 2797)
          `,
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
          points: 1,
          page: 12,
          kind: 'tf',
          cat: 'teoria',
          topics: ['sieci komputerowe', 'protokoły'],
          text: md`Oceń prawdziwość podanych zdań. Zaznacz **P**, jeśli zdanie jest prawdziwe, albo **F** – jeśli jest fałszywe.`,
          statements: [
            'HTTP to protokół komunikacyjny opisujący sposób przekazywania poczty elektronicznej w internecie.',
            'FTP to protokół zamiany nazw domenowych na adresy IP.',
            'DHCP to protokół umożliwiający hostom uzyskanie od serwera danych konfiguracyjnych, np. adresu IP, adresu bramy sieciowej, adresu serwera DNS.',
          ],
          answer: 'FFP',
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna lub niepełna albo brak odpowiedzi.
          `,
          solution: '1. F, 2. F, 3. P',
        },
      ],
    },
    {
      no: '6',
      title: null,
      tasks: [
        {
          no: '6',
          points: 2,
          page: 13,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe', 'działania w systemach pozycyjnych'],
          text: md`
            Wykonaj działania na liczbach zapisanych w systemie trójkowym i systemie dziewiątkowym. Wyniki podaj w systemie trójkowym.

            101112<sub>3</sub> + 121<sub>9</sub> = {{a|12}} <sub>3</sub>

            101112<sub>3</sub> – 121<sub>9</sub> = {{b|12}} <sub>3</sub>
          `,
          fields: { a: '112020', b: '20211' },
          score: perField(1),
          rubric: md`
            2 pkt – odpowiedź poprawna dla dwóch działań.
            1 pkt – odpowiedź poprawna dla jednego działania.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            101112<sub>3</sub> + 121<sub>9</sub> = 112020<sub>3</sub>
            101112<sub>3</sub> – 121<sub>9</sub> = 20211<sub>3</sub>
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Hurtownia',
      intro: md`
        Pewna hurtownia sprzedaje jabłka. W pliku \`jablka.txt\` znajduje się 2500 wierszy z danymi dotyczącymi sprzedaży jabłek od 3 stycznia 2022 roku do 31 grudnia 2022 roku. W każdym wierszu podane są dane opisujące jedną transakcję sprzedaży, oddzielone pojedynczymi znakami tabulacji:
        - data sprzedaży zapisana w formacie rrrr-mm-dd
        - nazwa odmiany jabłka
        - kod, który określa, czy odmiana jest: L – letnia, J – jesienna czy Z – zimowa
        - numer NIP klienta (13-znakowy tekst)
        - liczba kilogramów sprzedanego towaru.

        Fragment pliku \`jablka.txt\`:

        ${sample(
          `2022-01-03\tJonagold\tZ\t128-29-15-591\t470
          2022-01-03\tJonagold\tZ\t192-09-72-275\t410
          2022-01-03\tJonagored\tZ\t140-36-11-559\t242`,
          { head: false },
        )}

        Cena sprzedaży jednego kilograma jabłek zależy od odmiany jabłek. W pliku \`cennik.txt\` jest podana cena w złotych 1 kg jabłek każdej odmiany.

        Fragment pliku \`cennik.txt\`:

        ${sample(
          `Alwa\t2,9
          Antonowka\t3,2
          Cortland\t3,2`,
          { head: false },
        )}

        Z wykorzystaniem powyższych danych oraz dostępnych narzędzi informatycznych wykonaj podane zadania. Wyniki zapisz w pliku tekstowym \`wyniki7.txt\`. Odpowiedź do każdego zadania poprzedź numerem tego zadania.
      `,
      files: ['jablka.txt', 'cennik.txt'],
      sheet: { file: 'jablka.txt' },
      tasks: [
        {
          no: '7.1',
          points: 2,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'funkcje warunkowe'],
          text: md`Dla każdego klienta policz, ile kupił on łącznie (we wszystkich swoich transakcjach) kilogramów jabłek odmian zimowych. Podaj numery NIP trzech klientów, którzy kupili najwięcej jabłek odmian zimowych (Z), oraz podaj dla każdego z nich liczbę kilogramów jabłek odmian zimowych przez nich kupionych.`,
          expect: { parts: [{ lines: ['164-61-25-530 12185', '159-34-45-151 12047', '091-99-74-175 11769'], points: 2 }] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź, w której nie uwzględniono, że sumujemy kg zakupionych jabłek odmiany zimowej, albo podano tylko prawidłowe numery NIP.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['NIP', 'kg'],
            ['164-61-25-530', '12185'],
            ['159-34-45-151', '12047'],
            ['091-99-74-175', '11769'],
          ]),
        },
        {
          no: '7.2',
          points: 2,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['wyszukiwanie (WYSZUKAJ.PIONOWO)', 'zestawienia'],
          text: md`Przychód z pojedynczej sprzedaży to cena sprzedaży jednego kilograma jabłek pomnożona przez liczbę kilogramów. Podaj całkowity przychód hurtowni uzyskany w całym okresie. Podaj nazwę odmiany jabłek, która dała największy przychód.`,
          expect: {
            parts: [
              { label: 'całkowity przychód (2 422 669,40)', tokens: '2422669,40', points: 1 },
              { label: 'odmiana z największym przychodem (Reneta)', tokens: 'Reneta', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – całkowity przychód
            1 pkt – nazwa odmiany jabłek, która dała największy przychód.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            2 422 669,40
            Reneta
          `,
        },
        {
          no: '7.3',
          points: 3,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy', 'tabela przestawna'],
          text: md`
            Wykonaj zestawienie, w którym dla każdego miesiąca roku 2022 podasz nazwę najbardziej popularnej odmiany w tym miesiącu, czyli takiej, której w danym miesiącu sprzedano najwięcej.

            Na podstawie wykonanego zestawienia utwórz wykres kolumnowy ilustrujący wielkości sprzedaży najpopularniejszych odmian jabłek w poszczególnych miesiącach. Pamiętaj o czytelnym opisie wykresu – na osi X umieść dla każdego miesiąca jego nazwę połączoną z nazwą najbardziej popularnej odmiany w tym miesiącu, dodaj opis osi Y i tytuł wykresu.
          `,
          answerHint: '12 wierszy (styczeń → grudzień): odmiana i liczba kg, np. „styczeń-Gala 14017”.',
          expect: {
            parts: [
              {
                label: 'zestawienie',
                lines: ['Gala 14017', 'Gala 14969', 'Jonagored 15079', 'Gala 19404', 'Gala 17382', 'Reneta 18661', 'Melba 21216', 'Reneta 19054', 'Reneta 20881', 'Reneta 17065', 'Reneta 19755', 'Jonagored 13425'],
                ordered: true,
                points: 1,
              },
            ],
          },
          self: { points: 2, label: 'wykres', hint: 'Dobór danych i typ wykresu (1 pkt) oraz opis wykresu i obu osi – nazwy odmian i miesiące na osi X, opis osi Y (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – poprawne zestawienie
            1 pkt – prawidłowy dobór danych i typ wykresu
            1 pkt – poprawny opis wykresu i obu osi (w tym za nazwy odmian jabłek i miesiące na osi X i opis osi Y).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['miesiąc-odmiana', 'kg'],
            ['styczeń-Gala', '14017'],
            ['luty-Gala', '14969'],
            ['marzec-Jonagored', '15079'],
            ['kwiecień-Gala', '19404'],
            ['maj-Gala', '17382'],
            ['czerwiec-Reneta', '18661'],
            ['lipiec-Melba', '21216'],
            ['sierpień-Reneta', '19054'],
            ['wrzesień-Reneta', '20881'],
            ['październik-Reneta', '17065'],
            ['listopad-Reneta', '19755'],
            ['grudzień-Jonagored', '13425'],
          ]),
        },
        {
          no: '7.4',
          points: 3,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja', 'sumy narastające'],
          text: md`
            Hurtownia ma system premiowania klientów hurtowych. Klient otrzymuje przy zakupie rabat, którego wysokość zależy od łącznej ilości jabłek zakupionych do tej pory przez tego klienta, wliczając w to jabłka zakupione w bieżącej transakcji.

            Wysokość rabatu za każdy kilogram w bieżącej transakcji wynosi:
            - 5 gr, jeśli klient dotychczas zakupił co najmniej 15 000 kg, ale mniej niż 20 000 kg
            - 10 gr, jeśli klient dotychczas zakupił co najmniej 20 000 kg.

            Podaj, w ilu transakcjach hurtownia udzieliła rabatu, oraz podaj łączną wartość tych rabatów w złotych.

            **Przykład:**
            Załóżmy, że przed 1.04.2022 klient z NIP 128-29-15-591 zakupił łącznie 10 000 kg jabłek, klient 192-09-72-275 nabył 14 900 kg, a klient 140-36-11-559 – kupił 19 900 kg. Wtedy dla przykładowych danych 1.04.2022:

            ${sample(
              `2022-04-01\tJonagold\tZ\t128-29-15-591\t470
              2022-04-01\tJonagold\tZ\t192-09-72-275\t410
              2022-04-01\tJonagored\tZ\t140-36-11-559\t242`,
              { head: false },
            )}

            - pierwszy klient, po dokonaniu transakcji 1.04.2022, będzie miał już 10 470 kg zakupionych jabłek i dla tej transakcji jeszcze nie należy się rabat
            - drugi klient, po dokonaniu transakcji 1.04.2022, będzie miał już 15 310 kg zakupionych jabłek, czyli podczas tej transakcji otrzyma 5 gr rabatu na każdy kilogram kupowanych tego dnia jabłek (5 gr \\* 410 = 20,50 zł rabatu)
            - trzeci klient, po dokonaniu transakcji 1.04.2022, będzie miał już 20 142 kg zakupionych jabłek i podczas tej transakcji otrzyma 10 gr rabatu za każdy kilogram (10 gr \\* 242 = 24,20 zł rabatu).
          `,
          expect: {
            parts: [
              { label: 'liczba transakcji z rabatem (180)', tokens: '180', points: 1 },
              { label: 'łączna wartość rabatów (3 089,10 zł)', tokens: '3089,10', points: 2 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za liczbę transakcji, w których hurtownia udzieliła rabatu
            2 pkt – za łączną wartość rabatów w złotych.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            180
            3 089,10 zł
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '8',
      title: 'Rejestr wykroczeń',
      intro: md`
        W trzech plikach tekstowych o nazwach: \`kierowcy.txt\`, \`taryfikator.txt\`, \`rejestr.txt\`, zapisano dane związane z przekroczeniem dozwolonych prędkości pojazdów na pewnej trasie w okresie 2023-01-01 – 2023-12-30 (wszystkie dane są fikcyjne i wygenerowane na potrzeby zadania).

        Pierwszy wiersz każdego z plików jest wierszem nagłówkowym, a dane w wierszach rozdzielono znakiem średnika.

        Plik o nazwie \`kierowcy.txt\` zawiera informacje o 1000 osobach będących właścicielami samochodów. W każdym wierszu znajduje się:
        - *IdOsoby* – identyfikator kierowcy
        - *Imie* – imię
        - *Nazwisko* – nazwisko
        - *NrRejestracyjny* – numer rejestracyjny samochodu.

        **Przykład:**

        \`\`\`
        IdOsoby;Imie;Nazwisko;NrRejestracyjny
        1;Echo;Ayala;FVX4190
        2;Nolan;Stein;DUG5882
        3;Lee;Joseph;TBG6984
        \`\`\`

        Plik o nazwie \`taryfikator.txt\` zawiera informacje o 6 rodzajach wykroczeń związanych z przekroczeniem prędkości. W każdym wierszu znajdują się:
        - *IdWykroczenia* – identyfikator wykroczenia
        - *Wykroczenie* – opis wykroczenia
        - *Punkty* – liczba punktów karnych za dane wykroczenie
        - *Kwota* – kwota mandatu, jaką należy zapłacić za to wykroczenie.

        **Przykład:**

        \`\`\`
        IdWykroczenia;Wykroczenie;Punkty;Kwota
        1;Przekroczenie predkosci do 10 km/h;0;50
        2;Przekroczenie predkosci od 11 do 20 km/h;2;100
        3;Przekroczenie predkosci od 21 do 30 km/h;4;200
        4;Przekroczenie predkosci od 31 do 40 km/h;6;300
        5;Przekroczenie predkosci od 41 do 50 km/h;8;400
        6;Przekroczenie predkosci od 51 km/h;10;500
        \`\`\`

        Plik o nazwie \`rejestr.txt\` zawiera 5000 zarejestrowanych wykroczeń związanych z przekroczeniem prędkości. W każdym wierszu znajdują się:
        - *IdZdarzenia* – identyfikator zdarzenia
        - *Data* – data zdarzenia w formacie rrrr-mm-dd
        - *IdOsoby* – identyfikator kierowcy
        - *IdWykroczenia* – identyfikator wykroczenia.

        **Przykład:**

        \`\`\`
        IdZdarzenia;Data;IdOsoby;IdWykroczenia
        1;2023-01-01;617;1
        2;2023-01-01;956;4
        \`\`\`

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych podaj odpowiedzi do zadań 8.1.–8.3. Odpowiedzi zapisz w pliku \`wyniki8.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['kierowcy.txt', 'taryfikator.txt', 'rejestr.txt'],
      tables: { Kierowcy: 'kierowcy.txt', Taryfikator: 'taryfikator.txt', Rejestr: 'rejestr.txt' },
      tasks: [
        {
          no: '8.1',
          points: 2,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'grupowanie'],
          text: md`Podaj imię i nazwisko kierowcy, dla którego suma kwot za wszystkie mandaty była największa, oraz podaj tę największą sumę. Jest tylko jeden taki kierowca.`,
          expect: {
            parts: [
              { label: 'imię i nazwisko (Rafael Blake)', tokens: 'Rafael Blake', points: 1 },
              { label: 'suma kwot (3700)', tokens: '3700', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za imię i nazwisko kierowcy
            1 pkt – za sumę kwot mandatów tego kierowcy.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Imię i nazwisko kierowcy: Rafael Blake.
            Suma kwot mandatów: 3700.
          `,
        },
        {
          no: '8.2',
          points: 2,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'daty', 'grupowanie'],
          text: md`W którym miesiącu kierowcy otrzymali najmniej punktów karnych (łącznie) za wykroczenia polegające na przekroczeniu dozwolonej prędkości o więcej niż 20 km/h (wykroczenia o identyfikatorach od 3 do 6)? Podaj miesiąc oraz łączną liczbę punktów karnych z tego miesiąca.`,
          expect: {
            parts: [
              { label: 'miesiąc (listopad)', tokens: ['listopad', '11'], points: 1 },
              { label: 'liczba punktów (1766)', tokens: '1766', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – podanie miesiąca
            1 pkt – podanie łącznej liczby punktów karnych z tego miesiąca.
            1 pkt – odpowiedź wrzesień, 2074 (największa liczba punktów zamiast najmniejszej).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Miesiąc: listopad.
            Liczba punktów karnych: 1766.
          `,
        },
        {
          no: '8.3',
          points: 3,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'podzapytania', 'sortowanie'],
          text: md`Wykonaj zestawienie numerów rejestracyjnych samochodów wraz z imionami i nazwiskami ich właścicieli, którzy nie figurują w rejestrze wykroczeń. Zestawienie posortuj alfabetycznie według numerów rejestracyjnych samochodów.`,
          expect: {
            parts: [
              { label: 'numery rejestracyjne', items: ['BHW4028', 'CJX1859', 'KNM7950', 'NIP6570', 'QFR8936', 'SRU9727', 'XHK9060', 'YYS1077'], points: 1 },
              { label: 'imiona i nazwiska', items: ['Sandra Wheeler', 'Quynn Travis', 'Jasper Santos', 'Honorato Roth', 'Ivy Bowen', 'Helen White', 'Quentin Tyler', 'Kevin Wright'], points: 1 },
              { label: 'posortowanie', items: ['BHW4028', 'CJX1859', 'KNM7950', 'NIP6570', 'QFR8936', 'SRU9727', 'XHK9060', 'YYS1077'], ordered: true, points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – podanie numerów rejestracyjnych
            1 pkt – podanie imion i nazwisk
            1 pkt – posortowanie zestawienia.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['Imie', 'Nazwisko', 'NrRejestracyjny'],
            ['Sandra', 'Wheeler', 'BHW4028'],
            ['Quynn', 'Travis', 'CJX1859'],
            ['Jasper', 'Santos', 'KNM7950'],
            ['Honorato', 'Roth', 'NIP6570'],
            ['Ivy', 'Bowen', 'QFR8936'],
            ['Helen', 'White', 'SRU9727'],
            ['Quentin', 'Tyler', 'XHK9060'],
            ['Kevin', 'Wright', 'YYS1077'],
          ]),
        },
        {
          no: '8.4',
          points: 2,
          page: 17,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia zewnętrzne'],
          text: md`
            Baza danych rejestru wykroczeń została zmodyfikowana. Dodano nową tabelę *Fotoradar*, wraz z polami *IdFotoradaru*, *Miejscowosc* i *DozwolonaPredkosc*. Natomiast do tabeli *Rejestr* zostało dodane pole *IdFotoradaru*, w którym dla każdego rekordu zapisano identyfikator tego fotoradaru, który zarejestrował dane wykroczenie.

            Załóżmy, że w bazie istnieją fotoradary, które nie zarejestrowały żadnych wykroczeń. Zapisz w języku SQL zapytanie, w wyniku którego otrzymasz identyfikatory tych fotoradarów.
          `,
          extraTables: { Fotoradar: ['IdFotoradaru INTEGER PRIMARY KEY', 'Miejscowosc TEXT', 'DozwolonaPredkosc INTEGER'] },
          extraColumns: { Rejestr: ['IdFotoradaru INTEGER'] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym błędem, np. błąd przy rodzaju JOIN albo błąd w warunku po WHERE itp.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe rozwiązania:

            \`\`\`sql
            SELECT Fotoradar.IdFotoradaru
            FROM Fotoradar
            LEFT JOIN Rejestr
            ON Fotoradar.IdFotoradaru = Rejestr.IdFotoradaru
            WHERE Rejestr.IdFotoradaru is Null;
            \`\`\`

            \`\`\`sql
            SELECT Fotoradar.IdFotoradaru
            FROM Fotoradar
            WHERE Fotoradar.IdFotoradaru NOT IN (SELECT Rejestr.IdFotoradaru FROM Rejestr)
            \`\`\`
          `,
        },
      ],
    },
  ],
};
