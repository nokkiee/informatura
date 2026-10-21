import { md, table, sample, all, perField, byCount, evalExpr } from '../lib.js';

// Zadanie 1: the cipher from the task
function szyfr(T, k) {
  const n = T.length;
  const a = Math.floor(n / k);
  let c = n - a;
  const S = new Array(n + 1).fill('');
  for (let i = 1; i <= n; i++) {
    if (i % k === 0) {
      const b = Math.floor(i / k);
      S[n - a + b] = T[i - 1];
    } else {
      S[c] = T[i - 1];
      c--;
    }
  }
  return S.slice(1).join('');
}

const SAMPLE_TEXTS = ['serwer', 'defragmentacja', 'tropikalny', 'ab', 'informatyka', 'abcdefghijklmnopqrstu'];

// Reads "k = …" answers: a number or an expression in n (or "k > n").
function keyFor(text, n) {
  const t = String(text ?? '')
    .replace(/^\s*k\s*=\s*/i, '')
    .trim();
  return evalExpr(t, { n });
}

function kSimilar(n, T) {
  for (let k = n - 1; k >= 0; k--) {
    let ok = true;
    for (let i = 0; i < k; i++) if (T[i] !== T[n - k + i]) ok = false;
    if (ok) return k;
  }
  return 0;
}

const STR_32 =
  'INRZWZASEKYPYPYIEKDLEKODASINWNWNUPJNINEKYPDLUZASJNINYPUPWZRZJNILRZRZILNYUZWZRZZAZABYASASWZUZURUZJNDLDLEKURYIUPWNWZILWZJNWNNYEKUPASYIDLILWZEKIERZEKWZUZUZYIILINASINUZRAZAILRZWNYPURODWNINZAEKEKYPYIEKILNYWNNYDLRZDLILWZDLYPZAIEUZILRZZAUZURININODDLINILEKLOYIYIDLASILYIUZDLJNWZRZOZEKASRZINJNUZEKWZODASASUZDLURURDLRZODZALOWZRARARZZAINYPRZRAINOZRZZAURYPURYIRZEKINUZURYPJNINEKODZAUPURUPYPWZILASUZUZRZEKILRAEKODLOINNYJNODUZJNILILWNILYPASEKLOINURODEKILILASUPIEOZILZALTWZILUZYPWZJNEKINDLRZRARZUZINDLWNIELTLODLJNINILYPASYPZAILASDLDLJNRZINUZILJNRAINYIRAWZODNY';

const MONTHS_73 = [
  ['styczeń', 91769],
  ['luty', 86776],
  ['marzec', 99704],
  ['kwiecień', 78678],
  ['maj', 98806],
  ['czerwiec', 86931],
  ['lipiec', 88897],
  ['sierpień', 105548],
  ['wrzesień', 89532],
  ['październik', 83961],
  ['listopad', 96910],
  ['grudzień', 80636],
];

const GRADES_83 = [
  [1, 1, 74],
  [2, 4, 21],
  [3, 3, 42],
  [4, 1, 46],
  [5, 6, 22],
  [6, 6, 8],
  [9, 1, 44],
  [10, 1, 66],
  [11, 1, 107],
  [12, 6, 109],
];

export default {
  id: '2026-czerwiec',
  year: 2026,
  session: 'czerwiec',
  term: 'termin dodatkowy',
  date: '2026-06-10',
  dateText: '10 czerwca 2026 r.',
  symbol: 'MINP-R0-100-2606',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2026-czerwiec-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2026-czerwiec-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Szyfrowanie',
      intro: md`
        Algorytm *Szyfr* szyfruje jawny tekst o długości *n* znaków, który jest zapisany w tablicy *T*. Kluczem szyfrowania jest dodatnia liczba całkowita *k*. Szyfrogram jest zapisywany w tablicy *S*.

        **Specyfikacja:**
        Dane:
        *n* – długość tekstu, dodatnia liczba całkowita
        *T*[1..*n*] – tekst jawny, *T*[*i*] – *i*-ty znak w tekście
        *k* – klucz, dodatnia liczba całkowita
        Wynik:
        *S*[1..*n*] – szyfrogram, *S*[*i*] – *i*-ty znak w szyfrogramie

        \`\`\`pseudo
        Szyfr:
            a ← n div k
            c ← n – a
            dla i = 1, 2, …, n wykonuj
                jeżeli i mod k = 0
                    b ← i div k
                    S[n – a + b] ← T[i]
                w przeciwnym razie
                    S[c] ← T[i]
                    c ← c – 1
        \`\`\`

        **Uwaga:**
        ← oznacza przypisanie wartości
        zapis *x* div *y* oznacza dzielenie całkowite liczby *x* przez liczbę *y*
        zapis *x* mod *y* oznacza resztę z dzielenia liczby *x* przez liczbę *y*.
      `,
      tasks: [
        {
          no: '1.1',
          points: 2,
          page: 4,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['szyfrowanie', 'analiza algorytmu'],
          text: md`
            Uzupełnij tabelę – zapisz wynik działania algorytmu (szyfrogram) dla podanych wartości tekstu jawnego i klucza.

            ${table([
              ['Liczba znaków *n*', 'Tekst jawny', 'Klucz *k*', 'Szyfrogram'],
              ['14', 'defragmentacja', '3', '{{s1|16}}'],
              ['10', 'tropikalny', '5', '{{s2|16}}'],
            ])}
          `,
          fields: { s1: szyfr('defragmentacja', 3), s2: szyfr('tropikalny', 5) },
          score: perField(1),
          rubric: md`
            2 pkt – za dwie poprawne odpowiedzi.
            1 pkt – za jedną poprawną odpowiedź.
            0 pkt – za brak odpowiedzi lub obie odpowiedzi niepoprawne.
          `,
          solution: table([
            ['Liczba znaków *n*', 'Tekst jawny *T*', 'Klucz *k*', 'Wynik działania algorytmu, szyfrogram *S*'],
            ['14', 'defragmentacja', '3', 'ajatemaredfgnc'],
            ['10', 'tropikalny', '5', 'nlakportiy'],
          ]),
        },
        {
          no: '1.2',
          points: 1,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['szyfrowanie', 'analiza algorytmu'],
          text: md`
            Podaj wartość klucza *k*, dla której zawsze szyfrogram i tekst jawny są identyczne.

            Odp. *k* = {{k|8}}
          `,
          fields: { k: null },
          validate: (v) => {
            const ok = SAMPLE_TEXTS.every((t) => {
              const k = keyFor(v.k, t.length);
              return Number.isInteger(k) && k > 0 && szyfr(t, k) === t;
            });
            return { ok: { k: ok }, points: ok ? 1 : 0 };
          },
          rubric: md`
            1 pkt – za poprawną odpowiedź.
            0 pkt – za brak odpowiedzi lub odpowiedź niepoprawną.
          `,
          solution: '*k* = 1',
        },
        {
          no: '1.3',
          points: 1,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['szyfrowanie', 'analiza algorytmu'],
          text: md`
            Podaj wartość klucza *k*, dla której, dla każdego *n* zawsze szyfrogram jest tekstem jawnym zapisanym od końca.
            Np. tak jest dla tekstu *serwer* i szyfrogramu *rewres*.

            **Uwaga:** podana wartość może zależeć od *n*.

            Odp. {{k|14}}

            Wartość zależną od *n* zapisz np. jako \`n + 1\`.
          `,
          fields: { k: null },
          validate: (v) => {
            const raw = String(v.k ?? '').replace(/\s+/g, '');
            if (/^k?>n$/i.test(raw)) return { ok: { k: true }, points: 1 };
            const ok = SAMPLE_TEXTS.every((t) => {
              const k = keyFor(v.k, t.length);
              return Number.isInteger(k) && k > 0 && szyfr(t, k) === [...t].reverse().join('');
            });
            return { ok: { k: ok }, points: ok ? 1 : 0, note: 'Odpowiedź sprawdzono, szyfrując kilka tekstów różnej długości.' };
          },
          rubric: md`
            1 pkt – za poprawną odpowiedź.
            0 pkt – za brak odpowiedzi lub odpowiedź niepoprawną.
          `,
          solution: '*k* = *n* + 1 lub dowolne inne *k* > *n* lub zapis *k* > *n*',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Algorytm',
      intro: md`
        Dane są: liczba *n* > 1 oraz tablica *T*[1..*n*] zawierająca liczby całkowite. Dla liczby całkowitej 1 ≤ *k* < *n* powiemy, że tablica *T* jest ***k*-podobna** wtedy i tylko wtedy, gdy *T*[1..*k*] = *T*[*n* – *k* + 1..*n*]. Ponadto przyjmujemy, że każda tablica jest 0-*podobna* (*k* = 0).

        **Przykład:**
        Tablica *T* = [1,2,1,1,2,1,1] jest 0-*podobna*, 1-*podobna* i 4-*podobna*.
        Tablica *T* = [1,2,2] jest 0-*podobna*.
        Tablica *T* = [2,2,2] jest 0-*podobna*, 1-*podobna* i 2-*podobna*.

        **Uwaga:**
        *T* = [2,2,2] nie jest 3-podobna, bo *k* musi być mniejsze niż liczba elementów tablicy (analogicznie *T* = [1,2,2] nie jest 3-podobna, a *T* = [1,2,1,1,2,1,1] nie jest 7-podobna).
      `,
      tasks: [
        {
          no: '2.1',
          points: 2,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['tablice', 'prefiksy i sufiksy'],
          text: md`
            Uzupełnij tabelę – dla podanych wartości tablicy *T* wypisz największe takie *k*, dla którego *T* jest *k*-podobna.

            ${table([
              ['Długość tablicy – *n*', 'Tablica *T*', 'Największe takie *k*, dla którego *T* jest *k*-podobna'],
              ['4', '[1,2,3,4]', '{{a|4}}'],
              ['10', '[3,5,3,5,3,5,3,5,3,5]', '{{b|4}}'],
            ])}
          `,
          fields: { a: '0', b: '8' },
          score: perField(1),
          rubric: md`
            2 pkt – za poprawną odpowiedź w 2 wierszach.
            1 pkt – za poprawną odpowiedź w 1 wierszu.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: table([
            ['Tablica *T*', 'największe takie *k*'],
            ['[1,2,3,4]', '0'],
            ['[3,5,3,5,3,5,3,5,3,5]', '8'],
          ]),
        },
        {
          no: '2.2',
          points: 4,
          page: 6,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['tablice', 'prefiksy i sufiksy', 'zapis algorytmu'],
          text: md`
            W pseudokodzie lub w zadeklarowanym języku programowania zapisz algorytm, który oblicza największe takie *k*, dla którego tablica *T* jest *k*-podobna.

            **Uwaga:** W zapisie algorytmu możesz korzystać tylko z operatorów arytmetycznych: dodawania, odejmowania, mnożenia, dzielenia, dzielenia całkowitego i reszty z dzielenia; operatorów logicznych, porównań liczb, odwoływania się **za pomocą indeksów** do **pojedynczych elementów** tablicy, instrukcji sterujących, instrukcji przypisania lub samodzielnie napisanych funkcji i procedur wykorzystujących powyższe operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów innych niż wymienione, dostępnych w językach programowania, w szczególności nie wolno używać operacji pobierania fragmentu tablicy (listy).

            **Specyfikacja:**
            Dane:
            *n* – liczba całkowita większa od 1
            *T*[1..*n*] – tablica *n* liczb
            Wynik:
            *k* – największe takie *k*, dla którego tablica *T* jest *k*-podobna
          `,
          algo: {
            inputs: [
              { name: 'n', type: 'int', desc: 'liczba całkowita większa od 1' },
              { name: 'T', type: 'int[]', size: 'n', desc: 'tablica n liczb (w kodzie indeksowana od 0)' },
            ],
            outputs: [{ name: 'k', type: 'int', desc: 'największe k, dla którego T jest k-podobna' }],
            examples: [
              { in: [7, [1, 2, 1, 1, 2, 1, 1]], out: [4] },
              { in: [3, [1, 2, 2]], out: [0] },
              { in: [3, [2, 2, 2]], out: [2] },
              { in: [4, [1, 2, 3, 4]], out: [0] },
              { in: [10, [3, 5, 3, 5, 3, 5, 3, 5, 3, 5]], out: [8] },
            ],
            ref: kSimilar,
            gen: (r) => {
              const n = r.int(2, 30);
              const alpha = r.pick([2, 2, 3, 10]);
              return [n, r.arr(n, () => r.int(1, alpha))];
            },
            random: 14,
          },
          rubric: md`
            4 pkt – za poprawny algorytm, w tym:
            1 pkt – za poprawną pętlę po potencjalnych *k* (od 0 do *n*–1 lub od *n*–1 do 0)
            1 pkt – za poprawną pętlę sprawdzającą potencjalne *k*
            1 pkt – za poprawny warunek w pętli sprawdzającej potencjalne *k*
            1 pkt – za otrzymanie poprawnego wyniku
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
            Uwaga: za każde inne, ale całkowicie poprawne rozwiązanie spełniające warunki zadania przyznajemy maksymalną liczbę punktów.
          `,
          solution: md`
            Rozwiązanie przykładowe:

            \`\`\`pseudo
            k ← n – 1
            jest ← fałsz
            dopóki jest = fałsz
                jest ← prawda
                dla i = 1, 2, .., k wykonaj
                    jeżeli ( T[i] ≠ T[n – k + i] )
                        jest ← fałsz
                jeżeli jest = fałsz
                    k ← k – 1
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Pary',
      intro: md`
        Na potrzeby zadań 3.1.–3.3. definiujemy pojęcie *np-pary* następująco:
        *np-parą* będziemy nazywać dwa następujące po sobie znaki napisu, takie że pozycja pierwszego znaku w napisie jest nieparzysta, a drugiego – parzysta, gdzie pozycje znaków w napisie liczymy od 1.
        Pierwsza np-para to pierwsze dwa znaki napisu. Drugą np-parę tworzą znaki trzeci i czwarty napisu, trzecią – piąty i szósty itd. Na przykład w napisie MATURA są trzy np-pary znaków: MA, TU i RA.

        W pliku \`dane.txt\` znajduje się jeden napis o parzystej długości złożony z wielkich liter alfabetu angielskiego.

        Napisz program(y), który(-e) da(-dzą) odpowiedzi do podanych zadań. Odpowiedzi do zadań zapisz w pliku \`wyniki3.txt\`, a każdą poprzedź numerem odpowiedniego zadania.

        Plik \`dane_przyklad.txt\` zawiera jeden napis o parzystej długości złożony z wielkich liter alfabetu angielskiego. Odpowiedzi dla danych z pliku \`dane_przyklad.txt\` są podane pod treściami zadań.
      `,
      files: ['dane.txt', 'dane_przyklad.txt'],
      tasks: [
        {
          no: '3.1',
          points: 2,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy'],
          text: md`
            Podaj, ile razy występuje sytuacja, że dwie występujące bezpośrednio po sobie np-pary znaków są takie same.

            **Przykład:**
            Dla napisu CABABC prawidłową odpowiedzią jest: 0
            (brak np-par spełniających warunki zadania).
            Dla napisu ABABAB prawidłową odpowiedzią jest: 2
            Zauważ, że liczymy dwa razy ABAB. Nie liczymy par BABA ponieważ nie spełniają warunków zadania (nie są np-parami).

            Dla danych z pliku \`dane_przyklad.txt\` (YKFORMYKINRMRMATYKYKATYKATFOAT) prawidłową odpowiedzią jest
            2
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: '2' },
          expect: '17',
          rubric: md`
            2 pkt – za poprawną odpowiedź.
            1 pkt – za odpowiedź (23) wynikającą z przeglądu tekstu bez podziału na np-pary.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: '17',
        },
        {
          no: '3.2',
          points: 3,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'liczby pierwsze', 'kody ASCII'],
          text: md`
            Fragment napisu złożony z np-par znaków nazwiemy *parzyście pierwszym*, jeżeli suma kodów ASCII wszystkich znaków tego fragmentu jest liczbą pierwszą.

            Wyznacz i podaj najdłuższy parzyście pierwszy fragment napisu z pliku \`dane.txt\`. Jest tylko jeden taki napis w pliku z danymi.

            **Przykład:**
            W napisie NEWSROOM napisem parzyście pierwszym jest np. fragment NEWS.

            ${table([
              ['Znak', 'Kod ASCII'],
              ['N', '78'],
              ['E', '69'],
              ['W', '87'],
              ['S', '83'],
            ])}

            Suma kodów ASCII dla napisu NEWS: 78+69+87+83 = 317
            317 jest liczbą pierwszą.
            Najdłuższym parzyście pierwszym fragmentem napisu NEWSROOM jest WSROOM (suma kodów ASCII równa 487).

            Dla pliku \`dane_przyklad.txt\` prawidłową odpowiedzią jest
            FORMYKINRMRMATYKYKATYKATFO
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: 'FORMYKINRMRMATYKYKATYKATFO' },
          expect: STR_32,
          rubric: md`
            3 pkt – za poprawną odpowiedź.
            2 pkt – za podanie napisu powstałego w wyniku nie uwzględnienia zmiany pętli co 2.
            1 pkt – za podanie długości napisu lub liczby par (272).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: `<div class="wrap-mono">${STR_32}</div>`,
        },
        {
          no: '3.3',
          points: 3,
          page: 9,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'zliczanie', 'sortowanie'],
          text: md`
            Dla każdej np-pary znaków z pliku \`dane.txt\` policz, ile razy łącznie występuje ona w pliku. Uporządkuj np-pary rosnąco według liczby ich wystąpień. Podaj napis, który powstanie po ustawieniu np-par zgodnie z tym porządkiem.

            **Uwaga:** W napisie zapisanym w pliku \`dane.txt\` nie ma dwóch np-par, które mają taką samą liczbę wystąpień. Każda np-para występuje jednokrotnie w tekście wynikowym.

            **Przykład:**
            Dla napisu RAPARA mamy np-pary RA, PA i RA, liczba wystąpień to 1 × PA i 2 × RA. Po uporządkowaniu otrzymujemy tekst PARA
            Dla napisu ABCABABACABA mamy 1 × AB, 2 × CA i 3 × BA oraz wynik: ABCABA

            Dla pliku \`dane_przyklad.txt\` poprawna odpowiedź to:
            INFORMATYK
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: 'INFORMATYK' },
          expect: 'BYLTOZIELONYUPRAWNYIURODZAJNYPASWZDLUZRZEKINIL',
          rubric: md`
            3 pkt – za poprawną odpowiedź.
            2 pkt – za odpowiedź, w której nie uwzględniono uporządkowania par (wynik, w którym każda para pojawia się tylko raz, ale w złej kolejności).
            1 pkt – za napis z brakującymi maksymalnie dwoma parami ale bez powtórzeń par.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            BYLTOZIELONYUPRAWNYIURODZAJNYPASWZDLUZRZEKINIL
            (Na podst. „W pustyni i w puszczy” H. Sienkiewicz)
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '4',
      title: 'Miasta na mapie',
      intro: md`
        W kartezjańskim układzie współrzędnych (*x*, *y*) oznaczono położenie *n* miast. Położenie każdego miasta jest określone przez punkt o współrzędnych całkowitoliczbowych. Dla każdego miasta podano jego populację w tysiącach mieszkańców.
        Między miastami można poruszać się tylko wzdłuż dróg, które biegną w kierunku północ – południe albo wschód – zachód. Odległość między miastami położonymi w punktach o współrzędnych (*x*<sub>1</sub>, *y*<sub>1</sub>) i (*x*<sub>2</sub>, *y*<sub>2</sub>) będziemy liczyć jako

        *d* = |*x*<sub>1</sub> – *x*<sub>2</sub>| + |*y*<sub>1</sub> – *y*<sub>2</sub>|

        W pliku tekstowym o nazwie \`mapa.txt\` znajdują się dane 1000 miast. Każdy wiersz pliku zawiera informacje dotyczące jednego miasta oddzielone spacjami:
        - *wspX* – współrzędna miasta na osi 0X, liczba całkowita z zakresu [-250, 250]
        - *wspY* – współrzędna miasta na osi 0Y, liczba całkowita z zakresu [-250, 250]
        - *wielkość* – liczba mieszkańców wyrażona w tysiącach, większa od 0 i nieprzekraczająca 50000.

        Informacje o *i*-tym mieście (*i* = 1, 2, …, 1000) zapisane są w *i*-tym wierszu pliku.

        **Przykład:**

        \`\`\`
        7 12 53
        -4 7 315
        17 77 12
        42 -60 253
        \`\`\`

        Z wykorzystaniem danych zawartych w pliku \`mapa.txt\` napisz program(-y), który(-e) da(-dzą) odpowiedzi do zadań 4.1.–4.3. Odpowiedzi zapisz w pliku \`wyniki4.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

        Do dyspozycji masz plik \`mapa_przyklad.txt\`, który zawiera przykładowy opis mapy składający się z 50 wierszy danych spełniających warunki zadania – możesz sprawdzać na nim działanie swojego programu. Odpowiedzi dla danych z pliku \`mapa_przyklad.txt\` podano pod treściami zadań.

        Do Twojej dyspozycji jest także przykładowa mapa (Rysunek 1.), na której oznaczono położenie 10 miast (dane tych miast zapisano w Tabeli 1.). Odpowiedzi dla danych z tej mapy również umieszczono pod treściami zadań.

        <img class="fig-img" style="width:420px" src="content/img/2026-czerwiec/mapa.png" alt="Przykładowa mapa z 10 miastami (dane w Tabeli 1.)">

        *Rysunek 1.* Przykładowa mapa (mX oznacza miasto numer X)

        ${table([
          ['Nr miasta', 'wspX', 'wspY', 'Wielkość (liczba mieszkańców w tysiącach)'],
          ['1', '7', '12', '60'],
          ['2', '-4', '7', '10'],
          ['3', '-2', '5', '7'],
          ['4', '-4', '4', '15'],
          ['5', '-3', '-1', '6'],
          ['6', '5', '-1', '11'],
          ['7', '9', '-1', '12'],
          ['8', '-1', '-1', '20'],
          ['9', '8', '11', '130'],
          ['10', '9', '10', '220'],
        ])}

        *Tabela 1.* Dane miast przedstawionych na mapie na Rysunku 1.
      `,
      files: ['mapa.txt', 'mapa_przyklad.txt'],
      tasks: [
        {
          no: '4.1',
          points: 2,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['wyszukiwanie maksimum'],
          text: md`
            Dla danych zapisanych w pliku \`mapa.txt\` podaj numer miasta o największej liczbie mieszkańców. Podaj także liczbę mieszkańców tego miasta w tysiącach. W pliku jest tylko jedno takie miasto.

            Dla danych przedstawionych na Rysunku 1. poprawna odpowiedź to
            10 220
            Dla danych z pliku \`mapa_przyklad.txt\` poprawna odpowiedź to
            10 48967
            (w obu przypadkach miasto nr 10 ma największą liczbę mieszkańców).
          `,
          example: { map: { 'mapa.txt': 'mapa_przyklad.txt' }, expect: '10 48967' },
          expect: {
            parts: [
              { label: 'numer miasta (254)', tokens: '254', points: 1 },
              { label: 'liczba mieszkańców (2483)', tokens: '254 2483', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym
            1 pkt – za numer miasta (254)
            1 pkt – za liczbę mieszkańców (2483).
            1 pkt – za podanie wyniku dla pierwszych 50 wierszy (4 2481).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: '254 2483',
        },
        {
          no: '4.2',
          points: 3,
          page: 12,
          kind: 'program',
          cat: 'programowanie',
          topics: ['geometria', 'metryka Manhattan'],
          text: md`
            Wyznacz i podaj najmniejszą odległość między dwoma miastami. Podaj także pary numerów miast (każdą parę w oddzielnym wierszu), między którymi jest taka odległość.

            **Uwaga:**
            Każdą parę miast wypisujemy tylko raz, np. 1 2 oraz 2 1 to ta sama para.
            Pamiętaj, że odległość między miastami liczymy według wzoru podanego na początku zadania.

            Dla danych przedstawionych na Rysunku 1. odpowiedź to

            \`\`\`
            2
            1 9
            5 8
            9 10
            \`\`\`

            Dla danych z pliku \`mapa_przyklad.txt\` odpowiedź to

            \`\`\`
            7
            14 15
            27 32
            \`\`\`

            (odległość 7, pary miast: numer 14 i 15 oraz 27 i 32).
          `,
          answerHint: 'Najpierw odległość, potem pary miast – każda w osobnym wierszu.',
          example: { map: { 'mapa.txt': 'mapa_przyklad.txt' }, expect: { parts: [{ lines: ['7', '14 15', '27 32'], points: 1 }] } },
          expect: {
            parts: [
              { label: 'najmniejsza odległość (2)', tokens: '2', points: 1 },
              { label: 'pary miast', items: ['30 170', '120 176', '422 637', '426 599', '737 778'], points: 2 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym
            1 pkt – za poprawną najmniejszą odległość
            2 pkt – za poprawne pary w najmniejszej odległości (w przypadku pominięcia maksymalnie 3 par, albo podania liczby par zamiast ich wypisania – 1 pkt).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            2
            30 170
            120 176
            422 637
            426 599
            737 778
            \`\`\`
          `,
        },
        {
          no: '4.3',
          points: 3,
          page: 12,
          kind: 'program',
          cat: 'programowanie',
          topics: ['geometria', 'symulacja'],
          text: md`
            Na potrzeby tego zadania *aglomeracją* będziemy nazywać największy obszar spełniający warunki:

            a) kształt obszaru jest kwadratem, którego:
            - południowo-zachodni (lewy dolny) róg ma współrzędne (0,0)
            - północno-wschodni (prawy górny) róg ma współrzędne całkowitoliczbowe dodatnie
            - boki są równoległe do osi układu współrzędnych

            b) gęstość zaludnienia obszaru jest większa od 2.

            Gęstość zaludnienia liczymy, dzieląc sumę ludności miast leżących wewnątrz kwadratu (nie liczymy tych na krawędziach) przez powierzchnię kwadratu.

            Dla danych z pliku \`mapa.txt\` znajdź aglomerację oraz podaj:
            - długość boku kwadratu tworzącego aglomerację
            - sumaryczną liczbę mieszkańców aglomeracji.

            Zauważ, że miasta leżące w aglomeracji mogą znajdować się jedynie w I ćwiartce układu współrzędnych. Dla danych opisanych w pliku \`mapa.txt\` istnieje taka aglomeracja.

            Dla danych przedstawionych na mapie na Rysunku 1. poprawna odpowiedź to
            14 410

            Dla danych z pliku \`mapa_przyklad.txt\` poprawna odpowiedź to
            94 17674
          `,
          example: { map: { 'mapa.txt': 'mapa_przyklad.txt' }, expect: '94 17674' },
          expect: {
            parts: [
              { label: 'długość boku (114)', tokens: '114', points: 2 },
              { label: 'liczba mieszkańców (26078)', tokens: '26078', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            2 pkt – za poprawne współrzędne
            1 pkt – za poprawną liczbę mieszkańców.
            1 pkt – za odpowiedź 62 11599 (wynikająca z obliczania gęstości jako wielkości całkowitej) albo 9 217 (wynikającą z szukania obszaru najmniejszego zamiast największego).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '114 26078',
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
          page: 13,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe'],
          text: md`
            Poniżej zapisano wyrażenie matematyczne zawierające dodatnie liczby całkowite zapisane w systemach: szóstkowym, dziesiętnym i trójkowym.
            W miejsce kropek wpisz odpowiednie liczby, tak aby obie równości były prawdziwe

            <div class="formula big">1251<sub>6</sub> + {{a|8}}<sub>6</sub> = 500<sub>10</sub> = {{b|10}}<sub>3</sub> – 110102<sub>3</sub></div>
          `,
          fields: { a: '501', b: '1010221' },
          score: perField(1),
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – za jedną poprawną liczbę.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '1251<sub>6</sub> + **501**<sub>6</sub> = 500<sub>10</sub> = **1010221**<sub>3</sub> − 110102<sub>3</sub>',
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
          page: 13,
          kind: 'tf',
          cat: 'teoria',
          topics: ['bezpieczeństwo', 'uwierzytelnianie'],
          text: md`Oceń prawdziwość podanych zdań. Zaznacz **P**, jeśli zdanie jest prawdziwe, albo **F** – jeśli jest fałszywe.`,
          statements: ['Stosowanie uwierzytelniania dwuskładnikowego nie gwarantuje braku dostępu dla osób niepowołanych.', 'Stosowanie uwierzytelniania dwuskładnikowego jest możliwe tylko na urządzeniach wyposażonych w kamerę i w mikrofon.'],
          answer: 'PF',
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '1. P, 2. F',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Recykling',
      intro: md`
        W pliku \`dostawy.txt\` zapisano informacje na temat dostaw materiałów do magazynu przetwórni, która zajmuje się recyklingiem. Pierwszy wiersz pliku zawiera nazwy kolumn, a dane w wierszach są rozdzielone znakiem tabulacji. W kolejnych wierszach pliku zapisano numer dostawy, datę dostawy, nazwę dostawcy i liczbę kilogramów dostarczonego materiału.

        Fragment pliku:

        ${sample(`Nr_dostawy\tData\tDostawca\tLiczba_kg
        1\t02.01.2023\tB-12\t634
        2\t02.01.2023\tC-55\t385
        3\t02.01.2023\tC-92\t526
        4\t02.01.2023\tD-72\t899
        5\t02.01.2023\tC-40\t655`)}

        Z wykorzystaniem dostępnych narzędzi informatycznych podaj odpowiedzi do podanych zadań. Odpowiedzi zapisz w pliku \`wyniki7.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['dostawy.txt'],
      sheet: { file: 'dostawy.txt' },
      infos: {
        '7.4-7.5': {
          title: 'Informacja do zadań 7.4.–7.5.',
          text: md`
            Przetwórnia jest uruchamiana jedynie w dniach dostaw i jest w stanie przetworzyć maksymalnie 3900 kg materiału dziennie. Materiał do recyklingu jest pobierany rano z magazynu. Jeżeli w magazynie jest mniej niż 3900 kg lub dokładnie 3900 kg materiału, to przetwórnia przetwarza całość. Jeżeli jest więcej niż 3900 kg, to przetwarzane jest 3900 kg, a pozostała część zostaje w magazynie. Na koniec dnia stan magazynu powiększa się o dostawy z tego dnia.

            Rano 2.01.2023, przed rozpoczęciem przetwarzania i przed dostawami, w magazynie przetwórni znajdowało się 5000 kg materiału do recyklingu.
          `,
        },
      },
      tasks: [
        {
          no: '7.1',
          points: 2,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['daty', 'zestawienia'],
          text: md`Podaj datę, kiedy dostarczono łącznie najwięcej materiału do przetwórni oraz podaj liczbę dostarczonych kilogramów. Jest tylko jeden taki dzień.`,
          expect: {
            parts: [
              { label: 'liczba kg (6399)', tokens: '6399', points: 1 },
              { label: 'data (16.08.2023)', tokens: '16.08.2023', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za prawidłową wielkość dostaw,
            1 pkt – za prawidłową datę.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            6399
            16.08.2023
          `,
        },
        {
          no: '7.2',
          points: 2,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zliczanie', 'funkcje warunkowe'],
          text: md`Podaj, ile razy zdarzyło się, że ten sam dostawca przywiózł materiał dokładnie dwa razy w tym samym dniu.`,
          expect: '29',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź, w której zliczono dni z podwójnymi dostawami zamiast liczby podwójnych dostaw (28).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '29',
        },
        {
          no: '7.3',
          points: 3,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy'],
          text: md`
            Dla każdego miesiąca podaj łączną liczbę kilogramów materiału dostarczonego do recyklingu.
            Do wykonanego zestawienia wykonaj wykres kolumnowy. Pamiętaj o opisie wykresu (tytuł wykresu, nazwy miesięcy na osi 0X).
          `,
          answerHint: '12 wierszy (styczeń → grudzień): miesiąc i liczba kg.',
          expect: { parts: [{ label: 'zestawienie', lines: MONTHS_73.map(([, v]) => String(v)), ordered: true, points: 1 }] },
          self: { points: 2, label: 'wykres kolumnowy', hint: 'Prawidłowy dobór danych i typ wykresu (1 pkt) oraz poprawny opis wykresu i osi (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za poprawne zestawienie,
            1 pkt – za prawidłowy dobór danych i typ wykresu,
            1 pkt – za poprawny opis wykresu i osi.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([['miesiąc', 'łączna dostawa'], ...MONTHS_73.map(([m, v]) => [m, String(v)])]),
        },
        {
          no: '7.4',
          points: 2,
          page: 15,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          info: '7.4-7.5',
          text: md`Podaj, jaki był największy stan magazynu na koniec dnia (po przetworzeniu i po dostawie nowego materiału) oraz dzień (datę), kiedy to było. Jest jeden taki dzień.`,
          expect: {
            parts: [
              { label: 'stan magazynu (11 224 kg)', tokens: '11224', points: 1 },
              { label: 'data (25.08.2023)', tokens: '25.08.2023', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za prawidłowy stan magazynu,
            1 pkt – za prawidłową datę.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            11 224 kg
            25.08.2023 (wieczorem)
          `,
        },
        {
          no: '7.5',
          points: 2,
          page: 15,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          info: '7.4-7.5',
          text: md`Podaj z dokładnością do 1 kilograma, jaką maksymalnie powinno się przyjąć dzienną wydajność przetwórni (ile kg dziennie maksymalnie może wytwórnia przetworzyć), żeby – przy takich samych dostawach i założeniach – pracowała każdego dnia pracy z pełną mocą (to jest przetwarzała liczbę kg równą swojej wydajności).`,
          expect: '3126',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź 3125 albo 3127.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '3126',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '8',
      title: 'Oceny',
      intro: md`
        W trzech plikach tekstowych zapisano dane dotyczące oceniania grupy uczniów z pewnej szkoły z okresu od września 2023 do czerwca 2024. Pierwszy wiersz każdego z plików jest wierszem nagłówkowym, a dane w plikach są rozdzielone znakiem tabulacji. Dane są zapisane bez polskich znaków.

        Plik o nazwie \`uczniowie.txt\` zawiera dane uczniów. Są to:
        - *Id_Ucznia* – identyfikator ucznia
        - *Plec* – płeć ucznia (k lub m)
        - *Id_Klasy* – identyfikator klasy ucznia.

        **Przykład:**

        ${sample(`Id_Ucznia\tPlec\tId_Klasy
        u1\tk\tD
        u2\tk\tD
        u3\tm\tD
        u4\tk\tC`)}

        W pliku \`nauczyciele.txt\` znajdują się dane nauczycieli uczących w szkole:
        - *Id_Naucz* – identyfikator nauczyciela
        - *Przedmiot* – nazwa przedmiotu, którego uczy nauczyciel.

        **Przykład:**

        ${sample(`Id_Naucz\tPrzedmiot
        N01\tmatematyka
        N02\tmatematyka
        N03\tjezyk_polski
        N04\tjezyk_polski`)}

        Plik \`oceny.txt\` zawiera zestawienie ocen:
        - *Id_Oceny* – identyfikator wystawionej oceny
        - *Id_Ucznia* – identyfikator ucznia
        - *Data* – data wystawienia oceny w formacie rrrr-mm-dd
        - *Ocena* – ocena uzyskana przez ucznia
        - *Id_Naucz* – identyfikator nauczyciela, który wystawił ocenę.

        **Przykład:**

        ${sample(`Id_Oceny\tId_Ucznia\tData\tOcena\tId_Naucz
        1\tu50\t2023-09-04\t5\tN01
        2\tu119\t2023-09-04\t1\tN02
        3\tu31\t2023-09-04\t5\tN02
        4\tu106\t2023-09-04\t3\tN03`)}

        Z wykorzystaniem danych zawartych w wymienionych plikach oraz dostępnych narzędzi informatycznych, podaj odpowiedzi do zadań 8.1.–8.3. Odpowiedzi zapisz w pliku \`wyniki8.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['uczniowie.txt', 'nauczyciele.txt', 'oceny.txt'],
      tables: { Uczniowie: 'uczniowie.txt', Nauczyciele: 'nauczyciele.txt', Oceny: 'oceny.txt' },
      infos: {
        '8.4-8.5': {
          title: 'Informacja do zadań 8.4.–8.5.',
          text: md`
            Do bazy danych wprowadzono dodatkową tabelę *Kategorie* określającą kategorię ocen (np. sprawdzian, kartkówka itp.):
            - *Id_Kategorii* – identyfikator kategorii
            - *Nazwa_Kategorii* – nazwa kategorii.

            Do tabeli *Oceny* dodano pole *Id_Kategorii*, które określa kategorię wystawionej oceny.

            <img class="fig-img" src="content/img/2026-czerwiec/schemat-8.png" alt="Schemat bazy: Nauczyciele 1–∞ Oceny ∞–1 Uczniowie; Oceny ∞–1 Kategorie">
          `,
        },
      },
      tasks: [
        {
          no: '8.1',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'AVG', 'złączenia'],
          text: md`Oblicz średnią ocen z matematyki oddzielnie dla kobiet i dla mężczyzn. Wynik podaj z dokładnością do dwóch miejsc po przecinku.`,
          expect: { parts: [{ lines: ['k 3,57', 'm 3,73'], points: 2 }] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź nie uwzględniająca ocen z matematyki (3,57 i 3,62).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['Płeć', 'Średnia'],
            ['k', '3,57'],
            ['m', '3,73'],
          ]),
        },
        {
          no: '8.2',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'podzapytania', 'NOT IN'],
          text: md`Podaj identyfikatory nauczycieli, którzy nie wystawili żadnej oceny niedostatecznej (1) w okresie od 2023-12-01 do 2023-12-31.`,
          expect: {
            exactLines: false,
            parts: [
              { label: 'N10', lines: ['N10'], points: 1 },
              { label: 'N22', lines: ['N22'], points: 1 },
            ],
            score: (oks, { extra }) => (extra.length ? 0 : oks.filter(Boolean).length),
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź
            1 pkt – za każdy id.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            N10
            N22
          `,
        },
        {
          no: '8.3',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie', 'daty'],
          text: md`Dla każdego miesiąca podaj: ocenę, która została wystawiona najmniejszą liczbę razy, oraz liczbę wystąpień tej oceny.`,
          answerHint: 'Jeden miesiąc w wierszu: numer miesiąca, ocena, liczba ocen.',
          expect: {
            parts: [
              { label: 'oceny', items: GRADES_83.map(([m, o]) => `${m} ${o}`), points: 1 },
              { label: 'liczby ocen', lines: GRADES_83.map((r) => r.join(' ')), points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za oceny
            1 pkt – za liczby ocen.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: table([['miesiąc', 'ocena', 'Liczba ocen'], ...GRADES_83.map((r) => r.map(String))]),
        },
        {
          no: '8.4',
          points: 2,
          page: 18,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'grupowanie'],
          info: '8.4-8.5',
          text: md`Napisz w języku SQL zapytanie, w wyniku którego uzyskasz zestawienie liczby wystawionych ocen dla każdej kategorii. W zestawieniu podaj nazwę kategorii oraz liczbę wystawionych ocen.`,
          extraTables: { Kategorie: ['Id_Kategorii INTEGER PRIMARY KEY', 'Nazwa_Kategorii TEXT'] },
          extraColumns: { Oceny: ['Id_Kategorii INTEGER'] },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za prawidłowe połączenie tabel
            1 pkt – za prawidłowe warunki wyszukiwania.
            0 pkt – odpowiedź niepoprawną albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe prawidłowe odpowiedzi:

            \`\`\`sql
            SELECT Kategorie.Nazwa_Kategorii, Count(Oceny.Id_Oceny)
            FROM Kategorie INNER JOIN Oceny
            ON Kategorie.Id_Kategorii = Oceny.Id_Kategorii
            GROUP BY Kategorie.Nazwa_Kategorii;
            \`\`\`

            \`\`\`sql
            SELECT Kategorie.Nazwa_Kategorii, Count(Oceny.Id_Oceny)
            FROM Kategorie, Oceny
            WHERE Kategorie.Id_Kategorii = Oceny.Id_Kategorii
            GROUP BY Kategorie.Nazwa_Kategorii;
            \`\`\`
          `,
        },
        {
          no: '8.5',
          points: 2,
          page: 19,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'grupowanie', 'TOP/LIMIT'],
          info: '8.4-8.5',
          text: md`Napisz w języku SQL zapytanie, w wyniku którego uzyskasz identyfikator ucznia, który otrzymał najwięcej ocen celujących (6) ze sprawdzianów (nazwa kategorii: sprawdzian).`,
          extraTables: { Kategorie: ['Id_Kategorii INTEGER PRIMARY KEY', 'Nazwa_Kategorii TEXT'] },
          extraColumns: { Oceny: ['Id_Kategorii INTEGER'] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – za jeden z przypadków:
            - zapytanie z brakiem złączenia tabel przez klucze
            - zapytanie bez jednego z warunków
            - poprawne zapytanie z pominięciem grupowania
            - poprawne zapytanie z pominięciem sortowania i TOP1.
            0 pkt – za odpowiedź niepoprawną albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe prawidłowe odpowiedzi:

            \`\`\`sql
            SELECT TOP 1 Uczniowie.Id_Ucznia
            FROM Uczniowie
            INNER JOIN (Kategorie INNER JOIN Oceny ON Kategorie.Id_Kategorii =
            Oceny.Id_Kategorii) ON Uczniowie.Id_Ucznia = Oceny.Id_Ucznia
            WHERE (((Kategorie.Nazwa_Kategorii)="sprawdzian")
            AND ((Oceny.Ocena)=6))
            GROUP BY Uczniowie.Id_Ucznia
            ORDER BY Count(Oceny.Id_Oceny) DESC;
            \`\`\`

            \`\`\`sql
            SELECT TOP 1 Oceny.Id_Ucznia
            FROM Oceny
            INNER JOIN Kategorie ON Kategorie.Id_Kategorii = Oceny.Id_Kategorii
            WHERE (((Kategorie.Nazwa_Kategorii)="sprawdzian")
            AND ((Oceny.Ocena)=6))
            GROUP BY Oceny.Id_Ucznia
            ORDER BY Count(Oceny.Id_Oceny) DESC;
            \`\`\`
          `,
        },
      ],
    },
  ],
};
