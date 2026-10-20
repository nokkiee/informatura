import { md, table, sample, all, perField, byCount } from '../lib.js';

function grid(rows, { cls = '', marked = null } = {}) {
  return `<table class="tbl center ${cls}"><tbody>${rows
    .map((r, i) => `<tr>${r.map((c, j) => `<td${marked && marked[0] === i && marked[1] === j ? ' class="hl"' : ''}>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table>`;
}

function cornerDigit(w, k, n) {
  const bits = n.toString(2);
  return Number(bits[(w * k - 1) % bits.length]);
}

const T11 = ['10110', '01110', '11001', '11011'];
const F11 = {};
const ROWS11 = T11.map((r, i) =>
  [...r].map((d, j) => {
    F11[`t${i}_${j}`] = d;
    return `{{t${i}_${j}|1}}`;
  }),
);

const ROUNDS41 = [
  ['6', '3', '5', '4', '5', '4'],
  ['5', '6', '4', '5', '4', '5'],
  ['4', '5', '5', '4', '5', '4'],
];
const F41 = {};
const ROWS41 = ROUNDS41.map((r, i) =>
  r.map((v, j) => {
    F41[`r${i + 2}_${j + 1}`] = v;
    return `{{r${i + 2}_${j + 1}|2}}`;
  }),
);

function listScoreWords(oks, { extra }) {
  const good = oks.filter(Boolean).length;
  if (extra.length) return 0;
  return good === oks.length ? 3 : good >= 5 ? 2 : good >= 1 ? 1 : 0;
}

export default {
  id: '2024-czerwiec',
  year: 2024,
  session: 'czerwiec',
  term: 'termin dodatkowy',
  date: '2024-06-14',
  dateText: '14 czerwca 2024 r.',
  symbol: 'MINP-R0-100-2406',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2024-czerwiec-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2024-czerwiec-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Prostokątna liczba binarna',
      intro: md`
        Rozważmy tablicę o *w* wierszach i *k* kolumnach oraz dodatnią liczbę całkowitą *n*, której zapis w postaci binarnej ma co najwyżej *w* · *k* cyfr. Tę liczbę zapisujemy w systemie binarnym i wpisujemy otrzymane cyfry w kolejnych komórkach tablicy, począwszy od lewego górnego rogu.

        Cyfry zapisu binarnego najpierw wprowadzamy do pierwszego wiersza, następnie – do drugiego, potem – do trzeciego wiersza itd. Jeśli w pewnej komórce zakończymy wprowadzanie ostatniej cyfry zapisu binarnego, to od następnej komórki zaczynamy wprowadzać ponownie cyfry zapisu binarnego tej samej liczby, zaczynając od pierwszej cyfry. Szukamy cyfry znajdującej się w prawym dolnym rogu tablicy.

        **Przykład 1.**
        Weźmy *w* = 5, *k* = 3, *n* = 19.
        Przedstawiamy liczbę *n* = 19 w zapisie binarnym: 10011. Wprowadzamy cyfry zapisu binarnego liczby *n* do tablicy 5 x 3. Zaczynamy od lewego górnego rogu i wpisujemy kolejne cyfry, aż osiągniemy koniec tablicy.

        ${grid(
          [
            ['1', '0', '0'],
            ['1', '1', '1'],
            ['0', '0', '1'],
            ['1', '1', '0'],
            ['0', '1', '1'],
          ],
          { marked: [4, 2] },
        )}

        Cyfrą w prawym dolnym rogu jest 1.
      `,
      tasks: [
        {
          no: '1.1',
          points: 1,
          page: 4,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe'],
          text: md`
            Wprowadź cyfry zapisu binarnego liczby *n* = 179 do tablicy o wymiarach *w* = 4 i *k* = 5 według powyższej metody.

            ${grid(ROWS11, { cls: 'cells' })}
          `,
          fields: F11,
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: grid(T11.map((r) => [...r])),
        },
        {
          no: '1.2',
          points: 4,
          page: 5,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['systemy liczbowe', 'zapis algorytmu'],
          text: md`
            Dana jest dodatnia liczba całkowita *n*. Cyfry zapisu binarnego liczby *n* wprowadzono w sposób przedstawiony na początku zadania do tablicy o wymiarach *w* × *k*.

            W pseudokodzie lub języku programowania zapisz algorytm, który wyznaczy cyfrę zapisu binarnego liczby *n* znajdującą się w prawym dolnym rogu tabeli o wymiarach *w* × *k*.

            **Uwaga:** W zapisie algorytmu możesz wykorzystać tylko operacje arytmetyczne (dodawanie, odejmowanie, mnożenie, dzielenie, dzielenie całkowite, reszta z dzielenia), porównywanie liczb, odwoływanie się do pojedynczego elementu tablicy za pomocą jego indeksu, instrukcje sterujące, przypisania do zmiennych lub samodzielnie napisane funkcje, wykorzystujące powyższe operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów innych niż wymienione.

            **Specyfikacja**
            Dane:
            *w* – dodatnia liczba całkowita, liczba wierszy tablicy
            *k* – dodatnia liczba całkowita, liczba kolumn tablicy
            *n* – dodatnia liczba całkowita
            Wynik:
            *x* – cyfra w zapisie binarnym liczby *n*, która stoi w dolnym prawym rogu tablicy
          `,
          algo: {
            inputs: [
              { name: 'w', type: 'int', desc: 'liczba wierszy tablicy' },
              { name: 'k', type: 'int', desc: 'liczba kolumn tablicy' },
              { name: 'n', type: 'int', desc: 'dodatnia liczba całkowita' },
            ],
            outputs: [{ name: 'x', type: 'int', desc: 'cyfra w prawym dolnym rogu tablicy' }],
            examples: [
              { in: [5, 3, 19], out: [1] },
              { in: [4, 5, 179], out: [1] },
            ],
            ref: cornerDigit,
            gen: (r) => {
              const w = r.int(1, 12);
              const k = r.int(1, 12);
              const maxBits = Math.min(30, w * k);
              const n = r.int(1, 2 ** r.int(1, maxBits) - 1);
              return [w, k, n];
            },
            random: 16,
            noBuiltins: 'conversion',
          },
          rubric: md`
            4 pkt – odpowiedź poprawna, w tym:
            2 pkt – za zamianę na system binarny lub zliczenie liczby cyfr w zapisie binarnym,
            1 pkt – za poprawne wyłuskanie odpowiedniej cyfry,
            1 pkt – za podanie odpowiedzi (cyfry z prawego dolnego rogu tabeli).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`cpp
            int dl = 0;
            int pom = n;
            while (pom > 0)
            {
                pom = pom / 2;
                dl++;
            }
            if (w*k % dl != 0)
                for (int i = 0; i < dl - w*k % dl; i++)
                {
                    n = n / 2;
                }
            x = n % 2;
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Funkcja rekurencyjna',
      intro: md`
        Dana jest funkcja *F*(*x*), której argumentem jest nieujemna liczba całkowita *x*

        \`\`\`pseudo
        F(x):
            jeżeli x = 0
                wynikiem jest 0
            w przeciwnym przypadku
                wynikiem jest 2 + F(x div 2)
        \`\`\`

        **Uwaga:** div oznacza dzielenie całkowite
      `,
      tasks: [
        {
          no: '2.1',
          points: 2,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'analiza algorytmu'],
          text: md`
            Uzupełnij poniższą tabelę. Dla podanych wartości *x* wpisz wyniki działania funkcji *F* oraz podaj łączną liczbę wywołań funkcji *F* po wywołaniu *F*(*x*), łącznie z tym wywołaniem.

            ${table([
              ['*x*', 'wynik', 'liczba wywołań'],
              ['3', '4', '3'],
              ['16', '{{w1|5}}', '{{c1|5}}'],
              ['35', '{{w2|5}}', '{{c2|5}}'],
            ])}
          `,
          fields: { w1: '10', c1: '6', w2: '12', c2: '7' },
          score: (ok) => {
            const rows = [ok.w1 && ok.c1, ok.w2 && ok.c2].filter(Boolean).length;
            const cols = [ok.w1 && ok.w2, ok.c1 && ok.c2].filter(Boolean).length;
            return rows === 2 ? 2 : rows || cols ? 1 : 0;
          },
          rubric: md`
            2 pkt – za poprawne odpowiedzi w dwóch wierszach.
            1 pkt – za poprawną odpowiedź w jednym wierszu albo w jednej kolumnie.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: table([
            ['*x*', 'wynik', 'liczba wywołań'],
            ['3', '4', '3'],
            ['16', '10', '6'],
            ['35', '12', '7'],
          ]),
        },
        {
          no: '2.2',
          points: 2,
          page: 7,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'potęgi dwójki'],
          text: md`
            Podaj najmniejszą i największą wartość parametru *x*, dla którego wartość funkcji jest równa 18.

            najmniejsza {{min|8}} największa {{max|8}}
          `,
          fields: { min: '256', max: '511' },
          score: perField(1),
          rubric: md`
            2 pkt – poprawna odpowiedź, w tym:
            1 pkt – za najmniejsze *x*,
            1 pkt – za największe *x*.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: 'najmniejsza: 256, największa: 511',
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Słowa',
      intro: md`
        W pliku \`slowa.txt\` danych jest 1000 słów (napisów) złożonych z małych liter alfabetu angielskiego. Słowa mają długość mieszczącą się w przedziale od 1 do 200 znaków.

        Napisz program(-my), dający(-e) odpowiedzi do poniższych zadań. Uzyskane odpowiedzi zapisz w pliku \`wyniki3.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

        Do Twojej dyspozycji jest plik \`slowa_przyklad.txt\`, który zawiera 10 słów w podanym formacie. Odpowiedzi dla tego pliku są podane w treści zadań. Pamiętaj, że Twój program musi ostatecznie działać dla pliku \`slowa.txt\`, zawierającego 1000 słów.
      `,
      files: ['slowa.txt', 'slowa_przyklad.txt'],
      tasks: [
        {
          no: '3.1',
          points: 3,
          page: 7,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'wyszukiwanie wzorca'],
          text: md`
            Podaj, w ilu spośród podanych słów znajduje się trójliterowy fragment "k?t", gdzie ? oznacza dowolną pojedynczą literę (taki fragment występuje na przykład w słowach "alamakota", albo "brokat", ale nie – w słowie "krata".)

            Dla pliku \`slowa_przyklad.txt\` odpowiedzią jest
            2
          `,
          example: { map: { 'slowa.txt': 'slowa_przyklad.txt' }, expect: '2' },
          expect: '26',
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – odpowiedź, w której nie uwzględniono trójek na końcu wyrazu (25).
            1 pkt – odpowiedź, w której nie uwzględniono trójek na końcu i na początku wyrazu (24).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '26',
        },
        {
          no: '3.2',
          points: 3,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'szyfrowanie', 'szyfr Cezara'],
          text: md`
            Alfabet angielski zawiera 26 liter. Kodowanie ROT13 zamienia każdą literę na literę, która jest na pozycji o 13 miejsc dalej w alfabecie (a→n, b→o itd.), przy czym po przekroczeniu „z” liczymy z powrotem od „a” (czyli m→z, ale n→a, o→b, i tak dalej).

            Słowo *aren* ma ciekawą własność – po zakodowaniu za pomocą ROT13 staje się słowem *nera*, czyli tym samym słowem czytanym od tyłu.

            Podaj, ile w pliku \`slowa.txt\` jest słów, które mają tę własność. Wypisz ich liczbę oraz najdłuższe z nich.

            Dla pliku \`slowa_przyklad.txt\` odpowiedzią jest

            \`\`\`
            2
            aren
            \`\`\`

            (w pliku \`slowa_przyklad.txt\` są 2 słowa o tej własności: aren i bo)
          `,
          example: { map: { 'slowa.txt': 'slowa_przyklad.txt' }, expect: '2 aren' },
          expect: {
            parts: [
              { label: 'liczba słów (5)', tokens: '5', points: 2 },
              { label: 'najdłuższe słowo', tokens: 'rhszzohhubwbojohuubmmfue', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – za poprawną odpowiedź, w tym:
            2 pkt – za podanie prawidłowej liczby słów,
            1 pkt – za podanie najdłuższego słowa.
            2 pkt – za odpowiedź 9, borafgmqmlzivyrlivmyzdztsnebo
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            Liczba słów: 5
            Najdłuższe słowo: rhszzohhubwbojohuubmmfue
          `,
        },
        {
          no: '3.3',
          points: 3,
          page: 8,
          kind: 'program',
          cat: 'programowanie',
          topics: ['napisy', 'zliczanie'],
          text: md`
            Znajdź i wypisz z pliku \`slowa.txt\` wszystkie takie słowa, w których ta sama litera występuje na co najmniej połowie pozycji (przykładowo: w słowie "owocowo" litera „o” ma 4 wystąpienia na ogólną liczbę 7 liter w słowie i spełnia podany warunek, za to w słowie "ambaras" litera „a” ma tylko 3 wystąpienia na 7 liter, więc nie spełnia podanego warunku).

            W pliku \`slowa_przyklad.txt\` są 4 takie słowa:

            \`\`\`
            terefere
            ananas
            bo
            alabama
            \`\`\`
          `,
          example: { map: { 'slowa.txt': 'slowa_przyklad.txt' }, expect: { parts: [{ lines: ['terefere', 'ananas', 'bo', 'alabama'], points: 1 }] } },
          expect: {
            exactLines: false,
            parts: ['vzwzwgszezvzzlzzzzzzouz', 'azaaasfakaaaxbaaaaau', 'ppppppnoppnoclpop', 'zggggggpegpnovzgg', 'nyrpvqycpaylffffffffffffff', 'kkkkkkkkkkwpijccdbl', 'tstevttebttktnetitbttti', 'gvsvjvvvvvqppvuvcvvvi'].map((w, i) => ({
              lines: [w],
              points: i < 3 ? 1 : 0,
            })),
            score: listScoreWords,
          },
          rubric: md`
            3 pkt – za poprawną odpowiedź.
            2 pkt – za wypisanie przynajmniej 5 prawidłowych słów i żadnego niepoprawnego ALBO za wypisanie wszystkich prawidłowych słów oraz niepoprawnych, których długość jest nieparzysta a maksymalna liczba powtórzeń znaku wynosi (długość słowa – 1)/2.
            1 pkt – za wypisanie przynajmniej jednego prawidłowego słowa i żadnego niepoprawnego.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            vzwzwgszezvzzlzzzzzzouz
            azaaasfakaaaxbaaaaau
            ppppppnoppnoclpop
            zggggggpegpnovzgg
            nyrpvqycpaylffffffffffffff
            kkkkkkkkkkwpijccdbl
            tstevttebttktnetitbttti
            gvsvjvvvvvqppvuvcvvvi
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '4',
      title: 'Komputery i pakiety',
      intro: md`
        W pewnej sieci jest *n* > 1 komputerów. Komputery przesyłają między sobą pakiety informacji. Rozsyłanie odbywa się w rundach. W rundzie zerowej każdy komputer ma swój jeden pakiet oznaczony numerem tego komputera. Każdy komputer ma z góry zadany numer odbiorcy, czyli komputera, do którego w kolejnych rundach wysyła pakiety. Na początku każdej rundy każdy komputer wysyła wszystkie pakiety, które miał w rundzie poprzedniej. Pakiety przychodzące do komputera w trakcie rundy są przechowywane w tym komputerze do początku następnej rundy.

        **Przykład 1.**
        Poniżej zapisano numery odbiorców dla *n* = 6 komputerów o numerach odpowiadających numerom wierszy (od 1 do 6):

        \`\`\`
        4
        3
        5
        3
        1
        2
        \`\`\`

        Odbiorcą dla komputera pierwszego jest komputer 4, odbiorcą dla komputera drugiego jest komputer 3 itd.
        Zatem w pierwszej rundzie:
        - komputer pierwszy przesyła swój pakiet (nr 1) do komputera czwartego (pakiet nr 1 po pierwszej rundzie znajdzie się w komputerze czwartym)
        - komputer drugi wysyła swój pakiet (nr 2) do komputera trzeciego (pakiet nr 2 po pierwszej rundzie znajdzie w komputerze trzecim)

        itd.

        W drugiej rundzie pakiet numer 1, który był w komputerze nr 4, zostanie przez niego wysłany do komputera nr 3 (który jest odbiorcą dla komputera nr 4) itd.

        W poniższej tabeli dla każdego numeru pakietu przedstawiono miejsce, w którym ten pakiet znajdzie się na koniec kolejnych rund (do rundy 6) dla danych z przykładu 1.

        ${table([
          ['Nr rundy \\ Nr pakietu', '1', '2', '3', '4', '5', '6'],
          ['1. runda', '4', '3', '5', '3', '1', '2'],
          ['2. runda', '3', '5', '1', '5', '4', '3'],
          ['3. runda', '5', '1', '4', '1', '3', '5'],
          ['4. runda', '1', '4', '3', '4', '5', '1'],
          ['5. runda', '4', '3', '5', '3', '1', '4'],
          ['6. runda', '3', '5', '1', '5', '4', '3'],
        ])}
      `,
      files: ['odbiorcy.txt', 'odbiorcy_przyklad.txt'],
      infos: {
        '4.2-4.4': {
          title: 'Informacja do zadań 4.2.–4.4.',
          text: md`
            W kolejnych wierszach pliku \`odbiorcy.txt\` zapisano numery odbiorców dla *n* = 1024 komputerów. W wierszu pierwszym pliku zapisano numer odbiorcy pakietów od komputera pierwszego, w wierszu drugim – numer odbiorcy pakietów od komputera drugiego itd.

            Napisz program(-my), dający(-e) odpowiedzi do poniższych zadań. Uzyskane odpowiedzi zapisz w pliku \`wyniki4.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

            Do Twojej dyspozycji jest plik \`odbiorcy_przyklad.txt\` składający się z 16 wierszy, z których każdy zawiera jedną liczbę. Wiersz o numerze *i* = 1, 2, …, 16 zawiera odbiorcę pakietów dla komputera o numerze *i*. Odpowiedzi dla tego pliku są podane w treści zadań.
          `,
        },
      },
      tasks: [
        {
          no: '4.1',
          points: 2,
          page: 10,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['symulacja', 'permutacje'],
          text: md`
            Uzupełnij tabelę – dla poniższych danych (*n* = 6) wpisz numery komputerów, w których znajdą się pakiety o numerach od 1 do 6, po każdej z rund: 2, 3 i 4:

            \`\`\`
            3
            1
            6
            5
            4
            5
            \`\`\`

            ${table([
              ['Nr rundy \\ Nr pakietu', '1', '2', '3', '4', '5', '6'],
              ['1. runda', '3', '1', '6', '5', '4', '5'],
              ['2. runda', ...ROWS41[0]],
              ['3. runda', ...ROWS41[1]],
              ['4. runda', ...ROWS41[2]],
            ])}
          `,
          fields: F41,
          score: (ok) => {
            const rows = [2, 3, 4].filter((r) => [1, 2, 3, 4, 5, 6].every((p) => ok[`r${r}_${p}`])).length;
            return rows === 3 ? 2 : rows === 2 ? 1 : 0;
          },
          rubric: md`
            2 pkt – odpowiedź poprawna w trzech wierszach.
            1 pkt – odpowiedź poprawna w dwóch wierszach.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: table([
            ['Nr rundy \\ Nr pakietu', '1', '2', '3', '4', '5', '6'],
            ['po 1. rundzie', '3', '1', '6', '5', '4', '5'],
            ['po 2. rundzie', ...ROUNDS41[0]],
            ['po 3. rundzie', ...ROUNDS41[1]],
            ['po 4. rundzie', ...ROUNDS41[2]],
          ]),
        },
        {
          no: '4.2',
          points: 2,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['tablice', 'zliczanie'],
          info: '4.2-4.4',
          text: md`
            Dla danych zapisanych w pliku \`odbiorcy.txt\` podaj liczbę komputerów, które nie są odbiorcami żadnych pakietów.

            W przykładzie 1. jest jeden taki komputer – komputer 6 nie jest odbiorcą żadnego pakietu.

            Dla pliku \`odbiorcy_przyklad.txt\` odpowiedzią jest
            3
            (komputery 1, 6 i 10 nie są odbiorcami pakietów).
          `,
          example: { map: { 'odbiorcy.txt': 'odbiorcy_przyklad.txt' }, expect: '3' },
          expect: '395',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź różna o 1 od poprawnej.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '395',
        },
        {
          no: '4.3',
          points: 3,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['symulacja', 'permutacje'],
          info: '4.2-4.4',
          text: md`
            W kolejnych rundach może się zdarzyć, że pakiet wróci do komputera, z którego został początkowo wysłany (komputera o numerze takim, jaki ma ten pakiet).

            W przykładzie 1. w rundzie czwartej pakiety o numerach 1, 3, 4 i 5 wrócą do komputerów, w których znajdowały się przed rozpoczęciem rozsyłania.

            Wyznacz najmniejszy numer rundy, w której którykolwiek pakiet powróci do komputera, z którego startował (o tym samym numerze co numer tego pakietu).
            Podaj najmniejszy numer takiego pakietu dla wyznaczonego numeru rundy.

            Dla przykładu 1. odpowiedzią jest:
            4 1
            (runda 4, numer pakietu 1).

            Dla danych z pliku \`odbiorcy_przyklad.txt\` odpowiedzią jest:
            3 7
            (runda 3, numer pakietu 7).
          `,
          example: { map: { 'odbiorcy.txt': 'odbiorcy_przyklad.txt' }, expect: '3 7' },
          expect: {
            parts: [
              { label: 'numer rundy (3)', tokens: '3', points: 2 },
              { label: 'numer pakietu (436)', tokens: '436', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            2 pkt – za odpowiedź za liczbę rund (3),
            1 pkt – za numer pakietu (436).
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '3 436',
        },
        {
          no: '4.4',
          points: 3,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['symulacja', 'zliczanie'],
          info: '4.2-4.4',
          text: md`
            Podaj największe liczby pakietów, które trafiają do jednego komputera – odpowiednio – po każdej z rund: 1, 2, 4 i 8.

            Jako odpowiedź podaj liczby tych pakietów zapisane w jednym wierszu, rozdzielone znakiem odstępu.

            Dla pliku \`odbiorcy_przyklad.txt\` prawidłowa odpowiedź to
            2 2 3 4.
          `,
          example: { map: { 'odbiorcy.txt': 'odbiorcy_przyklad.txt' }, expect: '2 2 3 4' },
          expect: '6 8 15 20',
          rubric: md`
            3 pkt – odpowiedź poprawna.
            2 pkt – odpowiedź poprawna dla trzech rund.
            1 pkt – odpowiedź poprawna dla dwóch rund.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: '6 8 15 20',
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
          topics: ['prawo autorskie'],
          text: md`Oceń prawdziwość podanych zdań. Zaznacz **P**, jeśli zdanie jest prawdziwe, albo **F** – jeśli jest fałszywe.`,
          statements: ['Ochrona praw autorskich przysługuje twórcy niezależnie od spełnienia jakichkolwiek formalności.', 'Programy komputerowe nie są dziełami chronionymi prawami autorskimi.'],
          answer: 'PF',
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna, niepełna albo brak rozwiązania.
          `,
          solution: '1. P, 2. F',
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
          page: 12,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe', 'działania w systemach pozycyjnych'],
          text: md`
            Wykonaj działania na liczbach zapisanych w systemach pozycyjnych o podstawach 5 i 6. Wynik dodawania liczb w systemie o podstawie 5 zapisz w tym systemie, wynik odejmowania liczb zapisanych w systemie o podstawie 6 zapisz w systemie o podstawie 6.

            203<sub>5</sub> + 4401<sub>5</sub> = {{a|10}} <sub>5</sub>

            4541<sub>6</sub> – 2455<sub>6</sub> = {{b|10}} <sub>6</sub>
          `,
          fields: { a: '10104', b: '2042' },
          score: perField(1),
          rubric: md`
            2 pkt – odpowiedź poprawna w dwóch wierszach.
            1 pkt – odpowiedź poprawna w jednym wierszu.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            203<sub>5</sub> + 4401<sub>5</sub> = 10104<sub>5</sub>
            4541<sub>6</sub> – 2455<sub>6</sub> = 2042<sub>6</sub>
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Uzdrowisko',
      intro: md`
        Pewne uzdrowisko słynie z leczniczego źródła wody.

        W pliku \`uzdrowisko.txt\` zapisano przyjazdy i wyjazdy kuracjuszy do tego uzdrowiska w okresie od stycznia do grudnia 2023 roku (wszystkie dane są fikcyjne i wygenerowane na potrzeby zadania).

        W każdym wierszu pliku \`uzdrowisko.txt\` zapisano następujące dane:
        - datę z zakresu od 1 stycznia 2023 do 31 grudnia 2023 w formacie rrrr-mm-dd (*data*)
        - liczbę kuracjuszy, którzy przyjechali w podanym dniu do uzdrowiska (*przyjechali*)
        - liczbę kuracjuszy, którzy w podanym dniu opuścili uzdrowisko (*wyjechali*).

        Dane w wierszach są rozdzielone znakiem tabulacji.

        Fragment pliku \`uzdrowisko.txt\`:

        ${sample(`data\tprzyjechali\twyjechali
        2023-01-01\t528\t484
        2023-01-02\t641\t625
        2023-01-03\t352\t603
        2023-01-04\t342\t412`)}

        Z wykorzystaniem powyższych danych oraz dostępnych narzędzi informatycznych wykonaj poniższe zadania. Odpowiedzi zapisz w pliku tekstowym \`wyniki7.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['uzdrowisko.txt'],
      sheet: { file: 'uzdrowisko.txt' },
      tasks: [
        {
          no: '7.1',
          points: 3,
          page: 13,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy', 'daty'],
          text: md`
            Utwórz zestawienie łącznej liczby kuracjuszy, którzy przyjechali do uzdrowiska w każdym miesiącu 2023 roku.
            Dla otrzymanego zestawienia sporządź wykres kolumnowy ilustrujący wyniki. Pamiętaj o prawidłowym i czytelnym opisie wykresu (wstaw tytuł i opisy osi).
          `,
          answerHint: '12 wierszy (styczeń → grudzień): miesiąc i liczba kuracjuszy.',
          expect: {
            parts: [
              {
                label: 'zestawienie',
                lines: ['15226', '13394', '15096', '15292', '15723', '14880', '16378', '14778', '14294', '15637', '15272', '15528'],
                ordered: true,
                points: 1,
              },
            ],
          },
          self: { points: 2, label: 'wykres', hint: 'Dobór danych i typ wykresu (1 pkt) oraz opis wykresu i osi (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym
            1 pkt – za prawidłowe zestawienie,
            1 pkt – za prawidłowy dobór danych i typ wykresu,
            1 pkt – za poprawny opis wykresu i osi.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: table([
            ['miesiąc', 'liczba kuracjuszy, którzy przyjechali'],
            ['1', '15226'],
            ['2', '13394'],
            ['3', '15096'],
            ['4', '15292'],
            ['5', '15723'],
            ['6', '14880'],
            ['7', '16378'],
            ['8', '14778'],
            ['9', '14294'],
            ['10', '15637'],
            ['11', '15272'],
            ['12', '15528'],
          ]),
        },
        {
          no: '7.2',
          points: 2,
          page: 13,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['sumy narastające', 'daty'],
          text: md`
            Zakładamy, że w dniu 31.12.2022 w uzdrowisku przebywało 10 000 kuracjuszy.
            Podaj, w jakim dniu po raz pierwszy liczba kuracjuszy (po przyjeździe nowych i wyjeździe wszystkich opuszczających uzdrowisko w danym dniu) przekroczyła 11 000, oraz podaj datę, kiedy liczba kuracjuszy (po przyjeździe nowych i wyjeździe wszystkich opuszczających uzdrowisko w danym dniu) była największa.
          `,
          expect: {
            parts: [
              { label: 'pierwszy dzień powyżej 11 000 (16.10.2023)', tokens: '16.10.2023', points: 1 },
              { label: 'dzień z największą liczbą kuracjuszy (27.10.2023)', tokens: '27.10.2023', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za poprawną datę, kiedy liczba kuracjuszy przekroczyła 11000,
            1 pkt – za poprawną datę, kiedy liczba kuracjuszy była największa.
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            16.10.2023
            27.10.2023
          `,
        },
        {
          no: '7.3',
          points: 4,
          page: 14,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          text: md`
            Źródło ma wydajność 3900 litra/dobę. Każdy z kuracjuszy pije dziennie 0,4 litra wody ze źródła. Jeżeli wydajność źródła jest większa niż łączne potrzeby kuracjuszy danego dnia, to pozostałą ilość wody uzdrowisko butelkuje w szklanych butelkach o pojemności 5 litrów (butelki zawsze wypełnia się do pełna, a pozostała woda jest zużywana do innych celów). W przypadku, gdy wydajność dobowa źródła jest zbyt mała, aby zaspokoić potrzeby wszystkich kuracjuszy obecnych w uzdrowisku, pracownicy uzdrowiska brakującą wodę podają z butelek. Przy tym każda otwarta butelka zawsze jest zużywana do końca i w pierwszej kolejności na potrzeby kuracjuszy, tj. jeśli zostanie jakaś część wody w ostatniej użytej butelce, to zostanie wykorzystana do innych celów (nie liczymy jej w następnym dniu).

            **Uwaga:** zakładamy, że:
            - w dniu 31.12.2022 w uzdrowisku przebywało 10 000 kuracjuszy
            - w dniu 31.12.2022 wieczorem w magazynie uzdrowiska znajdowało się 120 sztuk 5-litrowych butelek wody.
            - kuracjusze otrzymują wodę w dniu przyjazdu, a w dniu odjazdu tej wody nie otrzymują

            a) Podaj datę, kiedy po raz pierwszy zabrakło zarówno wody ze źródła, jak i wody butelkowanej, aby zaspokoić potrzeby wszystkich kuracjuszy przebywających w danym dniu w uzdrowisku.
            b) Podaj łączną liczbę dni, w których zabrakło wody dla wszystkich kuracjuszy.
            c) Podaj najmniejszą liczbę butelek wody, jaka powinna znajdować się w dniu 31.12.2022 w magazynie uzdrowiska, aby wody nie zabrakło przez cały rok.
          `,
          expect: {
            parts: [
              { label: 'a) pierwszy dzień bez wody (20.02.2023)', tokens: '20.02.2023', points: 1 },
              { label: 'b) liczba dni bez wody (7)', tokens: '7', points: 1 },
              { label: 'c) najmniejsza liczba butelek (291)', tokens: '291', points: 2 },
            ],
          },
          rubric: md`
            4 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za poprawną datę, kiedy zabrakło wody,
            1 pkt – za poprawną łączną liczbę dni, w których zabrakło wody,
            2 pkt – za poprawną liczbę butelek (1 pkt w przypadku wyniku różniącego się o 1 od poprawnego).
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            20.02.2023
            7 dni
            291 butelek
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '8',
      title: 'Szczepienia',
      intro: md`
        W pewnym centrum medycznym odbywają się szczepienia. Lekarz przepisuje pacjentowi odpowiednią szczepionkę, a każda szczepionka ma rekomendowaną liczbę dawek. Pacjent zostaje uznany za zaszczepionego, jeśli przyjmie wszystkie dawki rekomendowane dla danej szczepionki.

        Dane dotyczące szczepień od 2 stycznia 2023 do 7 maja 2024 są zapisane w dwóch plikach: \`szczepionki.txt\` oraz \`wizyty.txt\`. Pierwszy wiersz w każdym pliku jest wierszem nagłówkowym i zawiera nazwy odpowiednich pól. Dane w wierszach rozdzielone są znakiem tabulacji.

        Plik o nazwie \`szczepionki.txt\` zawiera informacje o szczepionkach. W każdym wierszu znajduje się:
        - *kod_szczepionki* – tekst do 10 znaków, określający jednoznacznie szczepionkę
        - *liczba_dawek* – liczba rekomendowanych dawek, liczba całkowita większa od 0 i mniejsza od 10

        **Przykład:**

        ${sample(`kod_szczepionki\tliczba_dawek
        sz1_3d\t3
        sz2_1d\t1`)}

        Plik o nazwie \`wizyty.txt\` zawiera informacje o podanej pacjentowi dawce szczepionki. W każdym wierszu znajduje się:
        - *pesel* – numer PESEL pacjenta przyjmującego daną dawkę szczepienia, składający się z 11 znaków
        - *kod_szczepionki* – kod podanej szczepionki
        - *data_szczepienia* – data szczepienia w formacie rrrr-mm-dd
        - *numer_dawki* – liczba całkowita mniejsza od 10 określająca, która dawka szczepionki została podana.

        **Przykład:**

        ${sample(`pesel\tkod_szczepionki\tdata_szczepienia\tnumer_dawki
        79051863861\tsz16_1d\t2023-01-02\t1
        84100517145\tsz13_5d\t2023-01-02\t1`)}

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych podaj odpowiedzi do zadań 8.1.–8.3. Odpowiedzi zapisz w pliku \`wyniki8.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['szczepionki.txt', 'wizyty.txt'],
      tables: { szczepionki: 'szczepionki.txt', wizyty: 'wizyty.txt' },
      tasks: [
        {
          no: '8.1',
          points: 2,
          page: 15,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie', 'sortowanie'],
          text: md`Dla każdej szczepionki podaj, ile łącznie jej dawek zostało podanych pacjentom. Jako wynik podaj listę zawierającą kod szczepionki i liczbę dawek. Lista powinna być posortowana nierosnąco według liczby dawek.`,
          expect: (() => {
            const L = [
              'sz15_5d 111', 'sz10_4d 83', 'sz21_5d 82', 'sz17_4d 81', 'sz20_5d 79', 'sz9_5d 73', 'sz3_5d 72', 'sz13_5d 71', 'sz1_3d 69', 'sz6_3d 64', 'sz7_5d 60', 'sz12_3d 60',
              'sz24_3d 59', 'sz22_3d 45', 'sz18_2d 38', 'sz19_2d 35', 'sz4_2d 34', 'sz8_2d 29', 'sz16_1d 28', 'sz11_1d 25', 'sz23_1d 23', 'sz5_1d 23', 'sz14_1d 16', 'sz2_1d 15',
            ];
            return {
              parts: [
                { label: 'liczby podanych dawek', lines: L, points: 1 },
                { label: 'uporządkowanie nierosnąco', lines: L, sort: 'desc', reuse: true, points: 1 },
              ],
            };
          })(),
          rubric: md`
            2 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za poprawne zestawienie liczby podanych dawek każdej szczepionki,
            1 pkt – za poprawne uporządkowanie zestawienia nierosnąco według liczby podanych dawek,
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: table([
            ['kod_szczepionki', 'liczba dawek'],
            ['sz15_5d', '111'],
            ['sz10_4d', '83'],
            ['sz21_5d', '82'],
            ['sz17_4d', '81'],
            ['sz20_5d', '79'],
            ['sz9_5d', '73'],
            ['sz3_5d', '72'],
            ['sz13_5d', '71'],
            ['sz1_3d', '69'],
            ['sz6_3d', '64'],
            ['sz7_5d', '60'],
            ['sz12_3d', '60'],
            ['sz24_3d', '59'],
            ['sz22_3d', '45'],
            ['sz18_2d', '38'],
            ['sz19_2d', '35'],
            ['sz4_2d', '34'],
            ['sz8_2d', '29'],
            ['sz16_1d', '28'],
            ['sz11_1d', '25'],
            ['sz23_1d', '23'],
            ['sz5_1d', '23'],
            ['sz14_1d', '16'],
            ['sz2_1d', '15'],
          ]),
        },
        {
          no: '8.2',
          points: 3,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'COUNT DISTINCT', 'funkcje tekstowe'],
          text: md`Podaj, ilu różnych pacjentów przyjęło przynajmniej jedną dawkę szczepionki o kodzie sz12_3d. Podaj, ile wśród nich było kobiet (płeć określa przedostatnia cyfra numeru PESEL, cyfra parzysta oznacza płeć żeńską).`,
          answerHint: 'Najpierw liczba pacjentów, potem liczba kobiet.',
          expect: {
            parts: [
              { label: 'liczba pacjentów (24)', tokens: '24', points: 1 },
              { label: 'liczba kobiet (17)', tokens: '24 17', points: 2 },
            ],
          },
          rubric: md`
            3 pkt – za poprawną odpowiedź, w tym:
            1 pkt – za podanie poprawnej liczby pacjentów, którzy przyjęli przynajmniej jedną dawkę szczepionki o kodzie sz12_3d,
            2 pkt – za podanie poprawnej liczby kobiet,
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            Liczba pacjentów: 24
            Liczba kobiet: 17
          `,
        },
        {
          no: '8.3',
          points: 3,
          page: 16,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'złączenia', 'daty', 'grupowanie'],
          text: md`Podaj rok i miesiąc, w którym najwięcej osób ukończyło szczepienie (czyli: w tym miesiącu przyjęło ostatnią rekomendowaną dawkę danego szczepienia). Podaj także liczbę osób, które ukończyły szczepienie w tym terminie.`,
          expect: {
            parts: [
              { label: 'rok (2023)', tokens: '2023', points: 1 },
              { label: 'miesiąc (maj)', tokens: ['maj', '5'], points: 1 },
              { label: 'liczba osób (48)', tokens: '48', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – za poprawną odpowiedź, w tym:
            2 pkt – za podanie poprawnej daty (w tym rok – 1 punkt, miesiąc – 1 punkt)
            1 pkt – za podanie poprawnej liczby pacjentów,
            0 pkt – za odpowiedź niepoprawną albo za brak odpowiedzi.
          `,
          solution: md`
            maj 2023
            Liczba pacjentów: 48
          `,
        },
        {
          no: '8.4',
          points: 2,
          page: 16,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia'],
          text: md`
            Informacje o szczepieniach rozszerzono o dodatkowe dane:
            - do tabeli WIZYTY dodano pole *kod_punktu* – określające punkt szczepień, w którym odbyło się szczepienie
            - dodano tabele PACJENCI i PUNKT_SZCZEPIEN
            - w tabeli PACJENCI podano numer PESEL pacjenta (*pesel*) i województwo (*województwo_pacjenta*), w którym pacjent mieszka
            - w tabeli PUNKT_SZCZEPIEN podano kod punktu (*kod_punktu*) szczepienia i województwo (*województwo_punktu*), w którym znajduje się punkt szczepień.

            Relacje między tabelami pokazuje poniższy schemat:

            <img class="fig-img" src="content/img/2024-czerwiec/schemat-8-4.png" alt="Schemat relacji: PACJENCI (pesel, wojewodztwo_pacjenta) 1–∞ WIZYTY (pesel, kod_szczepionki, data_szczepienia, numer_dawki, kod_punktu) ∞–1 PUNKT_SZCZEPIEN (kod_punktu, wojewodztwo_punktu)">

            Zapisz w języku SQL zapytanie, w którym podasz numery PESEL pacjentów, którzy przyjęli co najmniej jedną dawkę szczepienia w województwie innym niż to, w którym mieszkają. Twoja odpowiedź będzie poprawna, także jeżeli PESEL pacjenta będzie wypisany więcej niż jeden raz.
          `,
          extraTables: {
            PACJENCI: ['pesel TEXT PRIMARY KEY', 'wojewodztwo_pacjenta TEXT'],
            PUNKT_SZCZEPIEN: ['kod_punktu TEXT PRIMARY KEY', 'wojewodztwo_punktu TEXT'],
          },
          extraColumns: { wizyty: ['kod_punktu TEXT'] },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym błędem np. nieprawidłowy warunek przy jednym JOIN.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`sql
            select WIZYTY.pesel
            from PACJENCI
            join WIZYTY on PACJENCI.pesel = WIZYTY.pesel
            join PUNKT_SZCZEPIEN on WIZYTY.kod_punktu = PUNKT_SZCZEPIEN.kod_punktu
            where PACJENCI.wojewodztwo_pacjenta != PUNKT_SZCZEPIEN.wojewodztwo_punktu;
            \`\`\`
          `,
        },
      ],
    },
  ],
};
