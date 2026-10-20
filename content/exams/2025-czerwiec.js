import { md, table, sample, all, perField, byCount } from '../lib.js';

function halves(k) {
  const s = String(k);
  const n = s.length / 2;
  return [Number(s.slice(0, n)), Number(s.slice(n))];
}

// written addition in base 3 (null = box to fill)
function columnSum(rows, ids, width = 7) {
  let k = 0;
  const cell = (d) => (d === null ? `<td>{{${ids[k++]}|1}}</td>` : `<td>${d}</td>`);
  const line = (digits, sign = '') => `<td>${sign}</td>` + '<td></td>'.repeat(width - 1 - digits.length) + digits.map(cell).join('');
  return `<table class="column-sum"><tbody><tr>${line(rows[0])}</tr><tr>${line(rows[1], '+')}</tr><tr class="total">${line(rows[2])}</tr></tbody></table>`;
}

const H63 = [
  ['7', '2,885161', '1,086774', '4,924516'],
  ['8', '3,848085', '1,653191', '3,385319'],
  ['9', '5,400606', '2,559091', '3,103333'],
  ['10', '6,936667', '3,020333', '2,818'],
  ['11', '7,154', '3,481667', '2,626333'],
  ['12', '11,322667', '5,400667', '2,658333'],
  ['13', '12,232258', '6,347419', '2,497419'],
  ['14', '10,975484', '5,513548', '2,507742'],
  ['15', '13,208108', '6,69973', '2,444595'],
  ['16', '12,592615', '6,740615', '2,792462'],
];
// values compared with a tolerance of ±0,005 (two decimal places)
const round2 = (v) => (Math.round(Number(v.replace(',', '.')) * 100) / 100).toFixed(2).replace('.', ',');

const PAIRS_72 = [
  'Anna Dymek K358',
  'Anna Mason K151',
  'Anna Wiatr K052',
  'Barbara Wroblewska K275',
  'Grzegorz Sikora K045',
  'Hanna Mazur K227',
  'Krzysztof Orlik K224',
  'Krzysztof Szostak K164',
  'Marcin Ozga K221',
  'Marek Sitko K374',
  'Mateusz Szymczyk K277',
  'Natalia Chwiszczuk K137',
  'Natalia Kejza K282',
];

export default {
  id: '2025-czerwiec',
  year: 2025,
  session: 'czerwiec',
  term: 'termin dodatkowy',
  date: '2025-06-10',
  dateText: '10 czerwca 2025 r.',
  symbol: 'MINP-R0-100-2506',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2025-czerwiec-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2025-czerwiec-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Funkcja rekurencyjna',
      intro: md`
        Zastosowane w poniższym algorytmie funkcje: *skróć*, *dopisz* i *ostatnia*, przyjmują jako argument nieujemną liczbę całkowitą *x*.

        Wynikiem funkcji *skróć*(*x*) jest liczba powstała z *x* przez usunięcie najmniej znaczącej cyfry w jej zapisie dziesiętnym. Jeśli *x* jest liczbą jednocyfrową, wtedy *skróć*(*x*) = 0. Przykładowo: *skróć*(249) = 24, *skróć*(87) = 8, *skróć*(5) = 0.

        Wynikiem funkcji *dopisz*(*x*) jest liczba, której zapis dziesiętny powstaje z zapisu dziesiętnego liczby *x* przez dopisanie jako najmniej znaczącej cyfry 0. Dla liczby 0 przyjmujemy *dopisz*(0) = 0. Przykładowo: *dopisz*(29) = 290.

        Wynikiem funkcji *ostatnia*(*x*) jest liczba – wartość najmniej znaczącej cyfry zapisu dziesiętnego liczby *x*. Przykładowo: *ostatnia*(307) = 7.

        Dana jest funkcja *f*(*a*, *b*), która przyjmuje jako argumenty dwie nieujemne liczby całkowite, a jej wynikiem jest nieujemna liczba całkowita:

        \`\`\`pseudo
        f(a, b):
            jeżeli b = 0
                wynik 0
                zakończ
            k ← ostatnia(b)
            w ← f(a, skróć(b))
            w ← dopisz(w)
            dopóki k > 0 powtarzaj
                w ← w + a
                k ← k – 1
            wynik w
        \`\`\`
      `,
      tasks: [
        {
          no: '1.1',
          points: 2,
          page: 4,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'analiza algorytmu'],
          text: md`
            Uzupełnij tabelę – wpisz w ostatniej kolumnie wynik funkcji *f*(*a*, *b*) dla podanych wartości argumentów *a* i *b*.

            ${table([
              ['*a*', '*b*', '*f*(*a*, *b*)'],
              ['42', '2', '{{r1|10}}'],
              ['4', '125', '{{r2|10}}'],
              ['103', '104', '{{r3|10}}'],
            ])}
          `,
          fields: { r1: '84', r2: '500', r3: '10712' },
          score: byCount([
            [3, 2],
            [2, 1],
          ]),
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź poprawna dla dwóch wierszy.
            0 pkt – odpowiedź niepełna lub niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['*a*', '*b*', '*f*(*a*, *b*)'],
            ['42', '2', '84'],
            ['4', '125', '500'],
            ['103', '104', '10712'],
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
            Ile razy łącznie zostanie wywołana funkcja *f*, jeśli pierwszym wywołaniem będzie *f*(987654321, 123456789)?

            Odpowiedź: {{x|8}}
          `,
          fields: { x: '10' },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '10',
        },
        {
          no: '1.3',
          points: 2,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'analiza algorytmu'],
          text: md`
            Ile razy łącznie zostanie wykonana instrukcja *w* ← *w* + *a*, jeśli pierwszym wywołaniem będzie:

            a) *f*(2024, 1000) odpowiedź: {{a|6}}

            b) *f*(2024, 1234) odpowiedź: {{b|6}}
          `,
          fields: { a: '1', b: '10' },
          score: perField(1),
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź poprawna dla punktu a) ALBO b).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            a) 1
            b) 10
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Liczby',
      intro: md`
        W tym zadaniu rozważamy *operację cięcia* zdefiniowaną dla dodatnich liczb całkowitych większych lub równych 10.
        Ta operacja polega na podziale zapisu dziesiętnego liczby na dwa niepuste zapisy.

        **Przykład.**
        Dla liczby 14379 możliwe cięcia to: 1 i 4379, 14 i 379, 143 i 79, 1437 i 9.
        Dla liczby 2302 możliwe cięcia to: 2 i 302, 23 i 02 (czyli 23 i 2 – wartość liczbowa zapisu „02” to 2), 230 i 2
      `,
      files: ['liczby1.txt', 'liczby1_przyklad.txt', 'liczby2.txt', 'liczby2_przyklad.txt'],
      tasks: [
        {
          no: '2.1',
          points: 4,
          page: 6,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['cyfry liczby', 'zapis algorytmu'],
          text: md`
            Niech *k* będzie dodatnią liczbą całkowitą, której zapis dziesiętny składa się z parzystej liczby cyfr. Na zapisie dziesiętnym liczby *k* wykonujemy operację cięcia na połowę. Powstają wtedy zapisy dwóch liczb *a* i *b*: pierwszy (liczby *a*), o długości równej połowie długości zapisu *k*, złożony z cyfr należących do lewej strony tego zapisu, i drugi (liczby *b*) – złożony z cyfr z prawej strony zapisu.

            Napisz w pseudojęzyku lub wybranym języku programowania algorytm, który dla danej liczby *k*, której zapis dziesiętny składa się z parzystej liczby cyfr, obliczy liczby *a* i *b* powstałe po wykonaniu operacji cięcia na połowę zapisu dziesiętnego liczby *k*.

            **Przykład.**
            Dla *k* = 123456 otrzymamy *a* = 123 i *b* = 456
            Dla *k* = 120056 otrzymamy *a* = 120 i *b* = 56

            **Uwaga:** Twój algorytm może używać wyłącznie zmiennych przechowujących liczby całkowite oraz może operować wyłącznie na liczbach całkowitych. W zapisie możesz wykorzystać tylko operacje arytmetyczne: dodawanie, odejmowanie, mnożenie, dzielenie, dzielenie całkowite, resztę z dzielenia oraz porównywanie liczb, instrukcje sterujące, przypisania do zmiennych lub samodzielnie napisane funkcje, wykorzystujące wyżej wymienione operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów i typów innych niż wymienione (w tym – tablic i list).

            **Specyfikacja:**
            Dane
            *k* – dodatnia liczba całkowita o zapisie dziesiętnym składającym się z parzystej liczby cyfr
            Wynik
            *a*, *b* – liczby, powstałe w wyniku cięcia na połowę zapisu liczby *k*
          `,
          algo: {
            inputs: [{ name: 'k', type: 'int', desc: 'liczba o parzystej liczbie cyfr' }],
            outputs: [
              { name: 'a', type: 'int', desc: 'lewa połowa zapisu' },
              { name: 'b', type: 'int', desc: 'prawa połowa zapisu' },
            ],
            examples: [
              { in: [123456], out: [123, 456] },
              { in: [120056], out: [120, 56] },
            ],
            ref: halves,
            gen: (r) => {
              const half = r.int(1, 7);
              const lo = 10 ** (2 * half - 1);
              const hi = 10 ** (2 * half) - 1;
              return [r.pick([lo, hi, r.int(lo, hi), r.int(lo, hi), lo + r.int(0, 99)])];
            },
            random: 14,
            noBuiltins: 'conversion',
          },
          rubric: md`
            4 pkt – odpowiedź poprawna, w tym:
            3 pkt za otrzymanie liczby *b* – z prawej części zapisu, w tym:
            1 pkt za obliczenie długości zapisu,
            1 pkt za poprawne pobieranie kolejnych cyfr,
            1 pkt za otrzymanie poprawnej liczby,
            1 pkt za otrzymanie liczby *a* – z lewej części napisu.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Rozwiązanie 1 (pseudokod):

            \`\`\`pseudo
            dlugosc ← 0
            x ← k
            dopóki (x > 0)
                x ← x div 10
                dlugosc ← dlugosc + 1
            potega ← 1
            b ← 0
            dla i = 1, 2, …, dlugosc div 2
                b ← b + potega * (k mod 10)
                k ← k div 10
                potega ← potega * 10
            a ← k
            \`\`\`

            Rozwiązanie 2 (Python):

            \`\`\`python
            dlugosc = 0
            x = k
            while x > 0:
                dlugosc += 1
                x = x // 10

            ileZer = 1
            i = 0
            while i < dlugosc // 2:
                ileZer = ileZer * 10
                i += 1

            a = k // ileZer
            b = k % ileZer
            \`\`\`
          `,
        },
        {
          no: '2.2',
          points: 3,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['NWD', 'cyfry liczby'],
          mainFile: 'liczby1.txt',
          text: md`
            Niech *k* będzie dodatnią liczbą całkowitą, której zapis dziesiętny składa się z parzystej liczby cyfr. Liczbę *k* nazwiemy *połowicznie względnie pierwszą*, gdy największy wspólny dzielnik liczb powstałych przez cięcie na połowę zapisu dziesiętnego liczby *k* jest równy 1.

            **Przykład.**
            Liczba 3487 (34|87) jest połowicznie względnie pierwsza, ponieważ największy wspólny dzielnik liczb 34 i 87 jest równy 1.
            Liczba 230095 (230|095) nie jest połowicznie względnie pierwsza, ponieważ największy wspólny dzielnik liczb 230 i 95 jest równy 5.

            Plik \`liczby1.txt\` zawiera 500 dodatnich liczb całkowitych składających się z 4, 6 lub 8 cyfr. Każda liczba zapisana jest w osobnym wierszu.

            Napisz program, który wyznaczy liczbę liczb połowicznie względnie pierwszych zapisanych w pliku \`liczby1.txt\`. Odpowiedź zapisz w pliku \`wyniki2_2.txt\`.

            Plik \`liczby1_przyklad.txt\` zawiera 50 liczb spełniających warunki zadania. Dla danych zawartych w pliku \`liczby1_przyklad.txt\` prawidłową odpowiedzią jest:
            28
          `,
          example: { map: { 'liczby1.txt': 'liczby1_przyklad.txt' }, expect: '28' },
          expect: '296',
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – za otrzymanie poprawnego wyniku dla liczb: 4 i 6 albo 4 i 8 albo 6 i 8 cyfrowych.
            1 pkt – za otrzymanie poprawnego wyniku dla liczb: 4 albo 6 albo 8 cyfrowych.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '296',
        },
        {
          no: '2.3',
          points: 3,
          page: 9,
          kind: 'program',
          cat: 'programowanie',
          topics: ['cyfry liczby', 'liczby Kaprekara'],
          mainFile: 'liczby2.txt',
          text: md`
            Niech *n* będzie dodatnią liczbą całkowitą większą lub równą 10.
            Będziemy rozważać wszystkie możliwe operacje cięcia liczby *n*<sup>2</sup>. Zliczamy w ilu z tych cięć suma powstałych liczb jest mniejsza lub równa *n*.

            **Przykład.**
            Dla liczby 89 – jest 0 takich cięć, ponieważ 89<sup>2</sup> = 7921 oraz:

            ${table([
              ['*a*', '*b*', 'Czy *a* + *b* ≤ 89'],
              ['792', '1', 'Nie'],
              ['79', '21', 'Nie'],
              ['7', '921', 'Nie'],
            ])}

            Dla liczby 2757 – są 2 takie cięcia, ponieważ 2757<sup>2</sup> = 7601049 oraz:

            ${table([
              ['*a*', '*b*', 'Czy *a* + *b* ≤ 2757'],
              ['760104', '9', 'Nie'],
              ['76010', '49', 'Nie'],
              ['7601', '49 (049)', 'Nie'],
              ['760', '1049', 'Tak'],
              ['76', '1049 (01049)', 'Tak'],
              ['7', '601049', 'Nie'],
            ])}

            Liczbę cięć liczby *n*<sup>2</sup> takich, że suma powstałych liczb jest mniejsza lub równa *n*, nazwiemy *stopniem Kaprekara* liczby *n*.

            Dla liczby 89 stopień Kaprekara jest równy 0, dla liczby 2757 – jest równy 2.

            Plik \`liczby2.txt\` zawiera 1000 liczb całkowitych z przedziału [10, 30000].
            Napisz program, który wyznaczy największy stopień Kaprekara dla liczb z pliku \`liczby2.txt\` oraz poda liczbę, która ma taki stopień. Jest tylko jedna taka liczba. Odpowiedź zapisz w pliku \`wyniki2_3.txt\`.

            Plik \`liczby2_przyklad.txt\` zawiera 100 wierszy z danymi spełniającymi warunki zadania. Dla danych zawartych w pliku \`liczby2_przyklad.txt\` prawidłowa odpowiedź to:

            \`\`\`
            2
            2168
            \`\`\`
          `,
          example: { map: { 'liczby2.txt': 'liczby2_przyklad.txt' }, expect: '2 2168' },
          expect: {
            parts: [
              { label: 'największy stopień (4)', tokens: '4', points: 2 },
              { label: 'liczba (7746)', tokens: '7746', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            2 pkt – za stopień,
            1 pkt – za liczbę.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            4
            7746
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Ukryte numery',
      intro: md`
        Plik \`dane.txt\` zawiera jeden napis zbudowany z 10 000 znaków (o kodach ASCII od 33 do 126), pośród których ukryte są liczby.
        Liczba ukryta w tym ciągu to co najmniej jednoelementowy ciąg cyfr, przed którym i po którym nie występuje znak będący cyfrą.

        **Przykład.**
        W ciągu: \`356xv@@4vdfvdfD#$%@@#245\` są ukryte 3 liczby: 356, 4 oraz 245.

        Plik \`dane_przyklad.txt\` zawiera przykładowe dane – jeden napis zbudowany z 200 znaków. Odpowiedzi dla tego pliku są podane po każdym zadaniu.

        Napisz program (lub kilka programów) znajdujący(-ch) odpowiedzi do podanych zadań. Odpowiedzi zapisz odpowiednio w oddzielnych plikach: \`wyniki3_1.txt\`, \`wyniki3_2.txt\`, \`wyniki3_3.txt\`, \`wyniki3_4.txt\`.

        **Uwaga:** Pamiętaj, że Twój program musi ostatecznie działać na pliku \`dane.txt\` zawierającym 10 000 znaków.
      `,
      files: ['dane.txt', 'dane_przyklad.txt'],
      infos: {
        '3.3-3.4': {
          title: 'Informacja do zadań 3.3. i 3.4.',
          text: md`*Numerem telefonu* będziemy nazywać 9-elementowy ciąg cyfr, przed którym i po którym nie występuje znak będący cyfrą.`,
        },
      },
      tasks: [
        {
          no: '3.1',
          points: 3,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'wyszukiwanie liczb w tekście'],
          text: md`
            Podaj, ile liczb zapisanych w pliku \`dane.txt\` zaczyna się od ciągu cyfr 50. Jeżeli ta sama liczba występuje kilkukrotnie, policz każde jej wystąpienie.

            **Przykład.**
            W ciągu znaków: \`fs@dx+cd52505050VfF^&x5\` nie ma liczby zaczynającej się od 50.
            W ciągu znaków: \`fs@dx+cd50450505VfF^&x50\` są 2 liczby zaczynające się od 50 (50450505 oraz 50).

            Dla pliku \`dane_przyklad.txt\` poprawną odpowiedzią jest
            2
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: '2' },
          expect: '4',
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – za podanie prawidłowej liczby wystąpień 50 na końcu liczby (5).
            1 pkt – za podanie prawidłowej liczby wystąpień ciągu „50” (31).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '4',
        },
        {
          no: '3.2',
          points: 3,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'zliczanie'],
          text: md`
            Podaj najczęściej występującą cyfrę w pliku \`dane.txt\` oraz liczbę jej wystąpień. W pliku jest jedna taka cyfra.

            Dla pliku \`dane_przyklad.txt\` poprawną odpowiedzią jest
            0 17
            (cyfra 0, która wystąpiła 17 razy)
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: '0 17' },
          expect: '1 342',
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – za zestawienie liczb wystąpień wszystkich cyfr, bez wskazania cyfry najczęściej występującej.
            1 pkt – za podanie jedynie najczęściej występującej cyfry (1) bez liczby jej wystąpienia.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '1 342 (cyfra 1, wystąpiła 342 razy)',
        },
        {
          no: '3.3',
          points: 3,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'wyszukiwanie liczb w tekście'],
          info: '3.3-3.4',
          text: md`
            Znajdź i wypisz wszystkie numery telefonów zaczynające się od cyfry 5 z pliku \`dane.txt\` w kolejności ich występowania w tym pliku.

            Dla pliku \`dane_przyklad.txt\` odpowiedzią jest
            577050221
            (w tym pliku jest tylko jeden taki numer telefonu).
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: { parts: [{ lines: ['577050221'], points: 1 }] } },
          expect: {
            parts: [
              {
                lines: ['588095244', '593151643', '583327270', '565269349', '583672019', '506585224', '574489008', '587103844', '510672749', '529135372', '515437684', '589477488'],
                ordered: true,
                points: 3,
              },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – za podanie wszystkich numerów telefonów (160).
            1 pkt – za podanie w odpowiedzi wszystkich ciągów cyfr 7 albo 10 znakowych.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            588095244
            593151643
            583327270
            565269349
            583672019
            506585224
            574489008
            587103844
            510672749
            529135372
            515437684
            589477488
            \`\`\`
          `,
        },
        {
          no: '3.4',
          points: 3,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'zbiory cyfr'],
          info: '3.3-3.4',
          text: md`
            Spośród wszystkich numerów telefonów podaj te, które składają się z najmniejszej liczby różnych cyfr.

            Dla pliku \`dane_przyklad.txt\` odpowiedzią jest
            303004411
            (składa się z 4 różnych cyfr: 0, 1, 3, 4)
          `,
          example: { map: { 'dane.txt': 'dane_przyklad.txt' }, expect: '303004411' },
          expect: {
            parts: [
              { label: 'numer 050525250', items: ['050525250'], points: 1 },
              { label: 'numer 033035335', items: ['033035335'], points: 2 },
            ],
            score: (oks, { extraNumbers }) => (oks.every(Boolean) && !extraNumbers.length ? 3 : oks.some(Boolean) ? 2 : 0),
          },
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – podanie jednego z dwóch poprawnych ciągów.
            1 pkt – podanie w odpowiedzi telefonu składającego się z największej liczby cyfr (9 różnych cyfr).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            050525250
            033035335
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
          points: 1,
          page: 12,
          kind: 'tf',
          cat: 'teoria',
          topics: ['grafika komputerowa', 'formaty plików'],
          text: md`Oceń prawdziwość podanych zdań. Zaznacz **P**, jeśli zdanie jest prawdziwe, albo **F** – jeśli jest fałszywe.`,
          statements: ['W pliku w formacie GIF zapiszemy obraz w 16 milionach kolorów bez utraty informacji o nich.', 'W plikach w formacie JPG są wykorzystywane metody kompresji danych.', 'Format JPG obsługuje przezroczyste tła obrazów.'],
          answer: 'FPF',
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepełna lub niepoprawna albo brak odpowiedzi.
          `,
          solution: '1. F, 2. P, 3. F',
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
          topics: ['systemy liczbowe', 'działania w systemie trójkowym'],
          text: md`
            Poniżej sposobem pisemnym dodano dwie liczby zapisane w systemie trójkowym. Uzupełnij brakujące cyfry tak, aby działanie było wykonane poprawnie.

            ${columnSum(
              [
                [1, 2, null, 1, 2],
                [2, 1, 1, 0, 2],
                [1, 1, null, 2, null, null],
              ],
              ['a3', 'c3', 'c5', 'c6'],
            )}
          `,
          fields: { a3: '1', c3: '0', c5: '2', c6: '1' },
          score: byCount([
            [4, 2],
            [3, 1],
          ]),
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym błędem.
            0 pkt – odpowiedź niepełna lub niepoprawna albo brak odpowiedzi.
          `,
          solution: `<table class="column-sum"><tbody><tr><td></td><td></td><td>1</td><td>2</td><td>1</td><td>1</td><td>2</td></tr><tr><td>+</td><td></td><td>2</td><td>1</td><td>1</td><td>0</td><td>2</td></tr><tr class="total"><td></td><td>1</td><td>1</td><td>0</td><td>2</td><td>2</td><td>1</td></tr></tbody></table>`,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '6',
      title: 'Fotowoltaika',
      intro: md`
        Pan Iksiński założył panele fotowoltaiczne i przez rok monitorował wykorzystanie energii w swoim gospodarstwie domowym. Prąd wytworzony przez panele jest zużywany na bieżące potrzeby gospodarstwa domowego, a jego nadmiar jest przesyłany do zakładu energetycznego. W razie braku wystarczającej ilości energii pochodzącej z paneli (np. w godzinach nocnych lub przy pochmurnej pogodzie) energia jest pobierana z zakładu energetycznego.

        W kolejnych wierszach pliku \`fotowoltaika.txt\` są zawarte następujące informacje, rozdzielone znakami tabulacji:
        - *data* – data pomiaru
        - *wsch* – godzina wschodu słońca
        - *zach* – godzina zachodu słońca
        - *st_zach* – stopień zachmurzenia (liczba całkowita od 0 do 8, przy czym liczba 0 oznacza brak zachmurzenia, natomiast liczba 8 – całkowite zachmurzenie)
        - *produkcja* – energia wyprodukowana przez całą dobę przez panele fotowoltaiczne (w kWh)
        - *oddanie* – energia oddana do zakładu energetycznego przez całą dobę (w kWh)
        - *pobranie* – energia pobrana z zakładu przez gospodarstwo domowe przez całą dobę (w kWh).

        **Przykład:**

        ${sample(`data\twsch\tzach\tst_zach\tprodukcja\toddanie\tpobranie
        2022-01-01\t07:42:56\t15:36:07\t0\t7,78\t3,29\t4,56
        2022-01-02\t07:42:47\t15:37:12\t4\t4,47\t1,23\t3,99`)}

        Z wykorzystaniem powyższych danych oraz dostępnych narzędzi informatycznych wykonaj podane zadania. Wyniki zapisz w pliku tekstowym \`wyniki6.txt\`. Odpowiedź do każdego zadania poprzedź numerem tego zadania.
      `,
      files: ['fotowoltaika.txt'],
      sheet: { file: 'fotowoltaika.txt' },
      tasks: [
        {
          no: '6.1',
          points: 2,
          page: 13,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['sumy', 'formuły'],
          text: md`
            Podaj, ile energii łącznie (w kWh) zużył pan Iksiński przez cały rok 2022. Zużywana energia to suma energii pobranej z zakładu energetycznego i energii wyprodukowanej przez pana Iksińskiego pomniejszonej o ilość oddaną do zakładu energetycznego.

            **Uwaga:** Przez cały styczeń pan Iksiński zużył 162,68 kWh.
          `,
          expect: '2715,32',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź otrzymana w wyniku pominięcia jednej z danych (oddawania energii albo pobierania z zakładu).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '2715,32',
        },
        {
          no: '6.2',
          points: 2,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['ciągi', 'funkcje warunkowe'],
          text: md`
            Znajdź najdłuższy ciąg kolejnych dni roku, w których stopień zachmurzenia nie wzrastał w stosunku do dnia poprzedniego i jednocześnie wartość wyprodukowanej energii nie malała w stosunku do dnia poprzedniego. Podaj długość tego ciągu oraz datę pierwszego dnia tego ciągu. Jest tylko jeden taki ciąg.

            **Przykład.**
            Dla danych:

            ${sample(`data\twsch\tzach\tst_zach\tprodukcja\toddanie\tpobranie
            2022-01-20\t07:30:51\t16:03:07\t3\t4,33\t0,99\t0,21
            2022-01-21\t07:29:43\t16:04:50\t6\t2,33\t0,02\t2,61
            2022-01-22\t07:28:32\t16:06:33\t6\t3,21\t0,78\t2,22
            2022-01-23\t07:27:19\t16:08:18\t5\t4,02\t2,01\t1,01
            2022-01-24\t07:26:03\t16:10:03\t4\t4,45\t2,34\t1,95
            2022-01-25\t07:24:44\t16:11:49\t3\t5,52\t2,21\t1,21
            2022-01-26\t07:23:24\t16:13:37\t2\t5,11\t2,02\t1,35`)}

            najdłuższy ciąg ma długość 4 i rozpoczyna się w dniu 2022-01-22, ponieważ jest to pierwszy taki dzień wśród powyższych danych, w którym stopień zachmurzenia nie wzrasta w stosunku do dnia poprzedniego (jest taki sam) oraz produkcja nie maleje.
          `,
          expect: {
            parts: [
              { label: 'długość ciągu (6)', tokens: '6', points: 1 },
              { label: 'data pierwszego dnia (2022-05-26)', tokens: '2022-05-26', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za długość ciągu,
            1 pkt – za datę.
            1 pkt – za odpowiedź 7 i 2022-05-25
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            6
            2022-05-26
          `,
        },
        {
          no: '6.3',
          points: 3,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['czas', 'zestawienia', 'wykresy', 'tabela przestawna'],
          text: md`
            Dla każdego dnia oblicz czas nasłonecznienia w godzinach (czyli czas od wschodu do zachodu słońca). Wynik zaokrąglij w dół do liczby całkowitej.

            Utwórz zestawienie, w którym dla każdej liczby godzin nasłonecznienia podasz średnie ilości wyprodukowanej energii, oddanej energii i pobranej energii. Na podstawie wykonanego zestawienia utwórz wykres liniowy porównujący te wartości w całym roku. Pamiętaj o czytelnym opisie wykresu (tytuł, legenda, tytuły osi).

            **Przykład.**
            Dla fragmentu danych:

            ${sample(`data\twsch\tzach\tst_zach\tprodukcja\toddanie\tpobranie
            2022-01-01\t07:42:56\t15:36:07\t0\t7,78\t3,29\t4,56
            2022-01-02\t07:42:47\t15:37:12\t4\t4,47\t1,23\t3,99
            2022-01-03\t07:42:35\t15:38:20\t4\t6,02\t4,74\t2,56
            2022-01-04\t07:42:19\t15:39:30\t6\t2,63\t1,22\t5,22
            2022-01-05\t07:42:00\t15:40:43\t2\t7,99\t5,68\t4,22
            2022-01-06\t07:41:38\t15:41:58\t3\t4,65\t3,24\t2,57
            2022-01-07\t07:41:12\t15:43:16\t1\t7,91\t2,34\t2,22
            2022-01-08\t07:40:43\t15:44:36\t1\t7,24\t2,58\t2,47
            2022-01-09\t07:40:11\t15:45:59\t1\t7,96\t2,74\t1,95`)}

            w dniach od 1 do 5 stycznia nasłonecznie trwa 7 godzin (po zaokrągleniu w dół do liczby całkowitej), a od 6 do 9 stycznia – 8 godzin (również po odpowiednim zaokrągleniu).

            Otrzymane zestawienie dla przykładowych danych powinno wyglądać następująco:

            ${table([
              ['liczba godzin nasłonecznienia', 'Średnia z produkcji', 'Średnia z oddania', 'Średnia z pobrania'],
              ['7', '5,778', '3,232', '4,11'],
              ['8', '6,94', '2,725', '2,3025'],
            ])}
          `,
          answerHint: 'Jeden wiersz na liczbę godzin (7 → 16): godziny i trzy średnie. Średnie porównywane są z dokładnością ±0,005.',
          expect: { parts: [{ label: 'zestawienie', lines: H63.map(([h, ...v]) => [h, ...v.map(round2)].join(' ')), ordered: true, points: 1 }] },
          self: { points: 2, label: 'wykres liniowy', hint: 'Dobór danych i typ wykresu (1 pkt) oraz opis wykresu i osi: tytuł, legenda, tytuły osi, liczby godzin na osi X (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za poprawne zestawienie,
            1 pkt – za prawidłowy dobór danych i typ wykresu,
            1 pkt – za poprawny opis wykresu i osi (tytuł, legenda, tytuły osi, liczby godzin na osi X).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['Liczba godzin', 'Średnia z produkcja', 'Średnia z oddanie', 'Średnia z pobranie'],
            ['7', '2,88516129', '1,086774194', '4,924516129'],
            ['8', '3,848085106', '1,653191489', '3,385319149'],
            ['9', '5,400606061', '2,559090909', '3,103333333'],
            ['10', '6,936666667', '3,020333333', '2,818'],
            ['11', '7,154', '3,481666667', '2,626333333'],
            ['12', '11,32266667', '5,400666667', '2,658333333'],
            ['13', '12,23225806', '6,347419355', '2,497419355'],
            ['14', '10,97548387', '5,513548387', '2,507741935'],
            ['15', '13,20810811', '6,69972973', '2,444594595'],
            ['16', '12,59261538', '6,740615385', '2,792461538'],
          ]),
        },
        {
          no: '6.4',
          points: 3,
          page: 15,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja', 'sumy narastające'],
          text: md`
            Za możliwość przesłania wytworzonej, ale niewykorzystanej energii do zakładu energetycznego i późniejszego jej pobrania w dowolnym momencie przez gospodarstwo domowe zakład energetyczny pobiera prowizję wynoszącą 20% energii przesłanej przez gospodarstwo.

            **Przykład.**
            Jeżeli pan Iksiński prześle 1 kWh energii do zakładu, to może pobrać bez opłat 0,8 kWh, gdy będzie tego potrzebował.

            Zakładamy, że na początku okresu rozliczeniowego przed 1 stycznia 2022 pan Iksiński miał na swoim koncie w zakładzie (czyli możliwej do odebrania energii) 100 kWh. Przy danych z zadania ta wartość powoduje, że żadnego dnia 2022 roku panu Iksińskiemu nie zabraknie energii (czyli stan konta nie spadnie poniżej 0).

            a) Po uwzględnieniu powyższych informacji oraz przesłanej energii do zakładu i odbieranej każdego dnia z zakładu podaj, ile było takich dni w 2022 roku, w których pan Iksiński miał na swoim koncie w zakładzie mniej niż 50 kWh.

            **Uwaga:** Pamiętaj, że jeśli pan Iksiński przesyła do zakładu 1 kWh, to na jego konto trafia 0,8 kWh energii.

            b) Jaki powinien być minimalny początkowy stan konta (stan przed 1 stycznia 2022), aby pan Iksiński miał możliwość odbierania energii z zakładu energetycznego, bez potrzeby jej dokupowania? Wynik podaj zaokrąglony w górę do liczby całkowitej.

            **Uwaga:** Przy początkowym stanie sumarycznie przesłanej energii w ilości 100 kWh pan Iksiński mógł na koniec dnia 31.01.2022 odebrać 78,634 kWh.
          `,
          expect: {
            parts: [
              { label: 'a) liczba dni (71)', tokens: '71', points: 1 },
              { label: 'b) minimalny stan konta (67)', tokens: '67', points: 2 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za liczbę dni,
            2 pkt – za ilość energii.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            71
            67
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Fryzjerzy',
      intro: md`
        W czterech plikach tekstowych zapisano dane dotyczące wizyt klientów w salonie fryzjerskim. Pierwszy wiersz każdego z plików jest wierszem nagłówkowym, a dane w plikach są rozdzielone znakiem tabulacji i są zapisane bez polskich znaków.

        Plik o nazwie \`klienci.txt\` zawiera dane 400 klientów salonu fryzjerskiego. Są to:
        - *id_klienta* – identyfikator klienta
        - *imie* – imię klienta
        - *nazwisko* – nazwisko klienta
        - *emeryt* – informacja o tym, czy klient jest emerytem (TAK/NIE)

        **Przykład.**

        ${sample(`id_klienta\timie\tnazwisko\temeryt
        K001\tGenowefa\tKurdzielewicz\tNIE
        K002\tJoanna\tSapek\tNIE
        K003\tMateusz\tFido\tNIE`)}

        W pliku \`fryzjerzy.txt\` znajdują się dane fryzjerów pracujących w salonie:
        - *id_fryzjera* – identyfikator fryzjera
        - *imie* – imię fryzjera

        **Przykład.**

        ${sample(`id_fryzjera\timie
        F01\tAnna
        F02\tNatalia`)}

        Plik \`uslugi.txt\` zawiera nazwy usług fryzjerskich realizowanych przez salon:
        - *id_uslugi* – identyfikator usługi
        - *nazwa* – nazwa usługi
        - *cena* – cena usługi (w zł.)

        **Przykład.**

        ${sample(`id_uslugi\tnazwa\tcena
        Z07\tModelowanie (wlosy krotkie)\t60
        Z08\tModelowanie (wlosy srednie)\t70
        Z09\tModelowanie (wlosy dlugie)\t80`)}

        W pliku \`wizyty.txt\` znajduje się wykaz zrealizowanych usług fryzjerskich:
        - *id_wizyty* – identyfikator wizyty
        - *id_klienta* – identyfikator klienta korzystającego z usługi
        - *id_fryzjera* – identyfikator fryzjera, który realizował usługę
        - *id_uslugi* – identyfikator usługi
        - *termin* – data i godzina rozpoczęcia usługi

        **Przykład.**

        ${sample(`id_wizyty\tid_klienta\tid_fryzjera\tid_uslugi\ttermin
        1\tK317\tF13\tZ48\t2023-05-19 14:00
        2\tK255\tF10\tZ20\t2023-02-10 12:00`)}

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych podaj odpowiedzi do zadań 7.1.–7.4. Odpowiedzi zapisz w pliku \`wyniki7.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['klienci.txt', 'fryzjerzy.txt', 'uslugi.txt', 'wizyty.txt'],
      tables: { klienci: 'klienci.txt', fryzjerzy: 'fryzjerzy.txt', uslugi: 'uslugi.txt', wizyty: 'wizyty.txt' },
      tasks: [
        {
          no: '7.1',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'grupowanie'],
          text: md`Podaj imię i nazwisko osoby, która wydała najwięcej na usługi fryzjerskie. Podaj również sumę jej wydatków.`,
          expect: {
            parts: [
              { label: 'imię i nazwisko (Marta Jasczyk)', tokens: 'Marta Jasczyk', points: 1 },
              { label: 'suma wydatków (4846)', tokens: '4846', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za imię i nazwisko,
            1 pkt – za sumę.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: 'Marta Jasczyk 4846',
        },
        {
          no: '7.2',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'sortowanie'],
          text: md`Podaj identyfikatory oraz imiona i nazwiska tych klientów, którzy co najmniej jeden raz skorzystali z usług fryzjera o takim samym imieniu jak ten klient. Otrzymane zestawienie uporządkuj alfabetycznie według imion.`,
          expect: {
            exactLines: false,
            parts: [
              { label: 'zestawienie klientów', lines: PAIRS_72, points: 1 },
              { label: 'uporządkowanie według imion', lines: PAIRS_72, sort: 'asc', sortBy: 0, reuse: true, points: 1 },
            ],
            score: (oks, { extra }) => (extra.length ? 0 : oks.filter(Boolean).length),
          },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – zestawienie z pominięciem jednego pola (id_klienta, imienia lub nazwiska) albo brak sortowania.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([['imie', 'nazwisko', 'id_klienta'], ...PAIRS_72.map((l) => l.split(' '))]),
        },
        {
          no: '7.3',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'czas', 'warunki'],
          text: md`
            Codziennie w godzinach 10:00–12:00 emeryci otrzymują 10% rabatu na wszystkie usługi. Rabat przysługuje, gdy usługa rozpoczęła się w godzinach 10:00–12:00 włącznie.
            Podaj łączną sumę udzielonych rabatów.
          `,
          expect: '1848,6',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – za odpowiedź wynikającą z błędnie wyliczonych godzin obowiązywania rabatów albo bez uwzględnienia, że obowiązują one tylko emerytów.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '1848,6',
        },
        {
          no: '7.4',
          points: 2,
          page: 17,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'podzapytania', 'NOT IN'],
          text: md`Podaj identyfikatory i imiona tych fryzjerów, którzy pracowali w kwietniu, ale nie wykonali w tym miesiącu usługi o nazwie *Strzyzenie meskie*.`,
          expect: {
            parts: [
              { label: 'identyfikatory', items: ['F02', 'F03', 'F04', 'F07', 'F08', 'F10', 'F18'], points: 1 },
              { label: 'identyfikatory z imionami', lines: ['F02 Natalia', 'F03 Krzysztof', 'F04 Grzegorz', 'F07 Kamila', 'F08 Aneta', 'F10 Bartosz', 'F18 Kalina'], points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym
            1 pkt – za identyfikatory,
            1 pkt – za imiona.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['id_fryzjera', 'imie'],
            ['F02', 'Natalia'],
            ['F03', 'Krzysztof'],
            ['F04', 'Grzegorz'],
            ['F07', 'Kamila'],
            ['F08', 'Aneta'],
            ['F10', 'Bartosz'],
            ['F18', 'Kalina'],
          ]),
        },
        {
          no: '7.5',
          points: 2,
          page: 18,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'DISTINCT'],
          text: md`
            Zakład fryzjerski rozwinął się w sieć salonów, zatrudnił więcej fryzjerów i rozbudował swoją bazę danych. Do tabel utworzonych na podstawie opisanych wcześniej plików dodano tabelę *salony*, która zawiera następujące pola:
            - *id_salonu* – identyfikator salonu
            - *nazwa_salonu* – nazwa salonu
            - *miejsce* – adres salonu.

            Do tabeli *fryzjerzy* dodano pole *id_salonu*, które określa miejsce pracy fryzjera.

            Napisz w języku SQL zapytanie, w wyniku którego uzyskasz identyfikatory wszystkich klientów, dla których usługi były wykonane przez pracowników salonu o nazwie *Magnolia*. Identyfikatory klientów nie mogą się powtarzać.
          `,
          extraTables: { salony: ['id_salonu TEXT PRIMARY KEY', 'nazwa_salonu TEXT', 'miejsce TEXT'] },
          extraColumns: { fryzjerzy: ['id_salonu TEXT'] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym błędem np. błąd przy JOIN albo błąd w warunku po WHERE albo zapytanie dające w wyniku powtarzające się identyfikatory klienta itp.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe rozwiązania:

            \`\`\`sql
            SELECT Wizyty.id_klienta
            FROM Salony INNER JOIN (Fryzjerzy INNER JOIN Wizyty ON
            Fryzjerzy.id_fryzjera = Wizyty.id_fryzjera) ON Salony.id_salonu =
            Fryzjerzy.id_salonu
            WHERE (((Salony.nazwa_salonu)="Magnolia"))
            GROUP BY Wizyty.id_klienta;
            \`\`\`

            \`\`\`sql
            SELECT DISTINCT Wizyty.id_klienta
            FROM Salony INNER JOIN (Fryzjerzy INNER JOIN Wizyty ON
            Fryzjerzy.id_fryzjera = Wizyty.id_fryzjera) ON Salony.id_salonu =
            Fryzjerzy.id_salonu
            WHERE (((Salony.nazwa_salonu)="Magnolia"));
            \`\`\`

            Przykładowe rozwiązanie za 1 punkt:

            \`\`\`sql
            SELECT Wizyty.id_klienta, Salony.nazwa_salonu
            FROM Salony INNER JOIN (Fryzjerzy INNER JOIN Wizyty ON
            Fryzjerzy.id_fryzjera = Wizyty.id_fryzjera) ON Salony.id_salonu =
            Fryzjerzy.id_salonu
            WHERE (((Salony.nazwa_salonu)="Magnolia"));
            \`\`\`
          `,
        },
      ],
    },
  ],
};
