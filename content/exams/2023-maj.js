import { md, table, sample, all, perField } from '../lib.js';

// Biblioteczka Adama: shelf i has 2^i compartments.
function shelf({ books = {}, gray = null, inputs = null, caption = '' } = {}) {
  let h = '<table class="tbl shelf"><thead><tr><th></th>';
  for (let j = 1; j <= 16; j++) h += `<th>${j}</th>`;
  h += '</tr></thead><tbody>';
  for (let i = 0; i < 5; i++) {
    h += `<tr><th>${i}</th>`;
    for (let j = 1; j <= 16; j++) {
      if (j > 2 ** i) {
        h += '<td class="none"></td>';
        continue;
      }
      const v = inputs ? `{{${inputs}_${i}_${j}|3}}` : (books[`${i},${j}`] ?? '');
      h += `<td class="cell${gray === `${i},${j}` ? ' gray' : ''}">${v}</td>`;
    }
    h += '</tr>';
  }
  h += '</tbody></table>';
  return caption ? `<figure class="fig">${h}<figcaption>${caption}</figcaption></figure>` : h;
}

function shelfFields(prefix, books) {
  const f = {};
  for (let i = 0; i < 5; i++) for (let j = 1; j <= 2 ** i; j++) f[`${prefix}_${i}_${j}`] = String(books[`${i},${j}`] ?? '');
  return f;
}

const BOOKS_11 = { '0,1': 14, '1,1': 12, '1,2': 18, '2,1': 9, '2,3': 15, '2,4': 20, '3,6': 17 };

const XOR_25 = [
  '1001011000', '1111000001', '1110001000', '1101100001111010', '110100010', '1100110000110000',
  '100010000', '1110111101', '1100110011', '1110001100001', '111110111101000', '100110100011010',
  '1000001000', '11101010110100010', '11101101111', '1100001010101010', '10011110101', '1101000111100010001',
  '1010000101110010', '11101100000', '1000000000', '100000010010', '1100010', '11010011',
  '110110000001000', '1000010', '10100111001001', '1100011101111', '101010110001', '1001100100001111',
  '100110000111', '110100110011110111', '111000110110110011', '10100111101010', '1111000110011000', '101111110101',
  '1110011111111011', '11010110100100100', '110000000', '1000000110010011', '1001111100001', '1111011101',
  '11000000100', '10000101000011110', '10100010111101', '1', '110001000', '111101100011001',
  '100110000', '1101101011110100', '110110101111', '101110111001000100', '1110110000100111', '1011001010011',
  '100000000', '1111110111100', '11011110111001', '110110101110000110', '1101101000111101', '111100010',
  '100111010111001', '110000010100', '1010111011', '1001110010010010010', '101100111101', '1010110011111100111',
  '1101010101000', '111110101011100', '10000000', '11010111000', '11001110100', '1010000011010111111',
  '110110100101', '11101100000110', '1011110010101000000', '1001010001010010', '10101100111', '10000101101',
  '100101000010', '110011000100', '10010110010110', '101010010111001', '1100011110', '1011100110001011110',
  '101001110111001', '10011000101101011', '10000000', '11110110010101011', '1101011010110', '1100010010111001',
  '11010001001100011', '1010101001001', '100000000', '1100010010010', '1111100011000', '1011111011110100',
  '11100101101110101', '110001011011011', '1011000101011000000', '11001011110011000',
];

export default {
  id: '2023-maj',
  year: 2023,
  session: 'maj',
  term: 'termin główny',
  date: '2023-05-22',
  dateText: '22 maja 2023 r.',
  symbol: 'MINP-R0-100-2305',
  duration: 210,
  maxPoints: 50,
  pdf: 'pdf/informatyka-2023-maj-matura-rozszerzona.pdf',
  keyPdf: 'pdf/informatyka-2023-maj-matura-rozszerzona-odpowiedzi.pdf',
  groups: [
    // ------------------------------------------------------------------------------------
    {
      no: '1',
      title: 'Biblioteczka Adama',
      intro: md`
        Adam przechowuje swoje książki w biblioteczce zbudowanej z półek ponumerowanych kolejno 0, 1, 2, … (zaczynając od półki położonej najwyżej). Półka o numerze *i* ma 2<sup>*i*</sup> przegródek, w których umieszczane są książki. W jednej przegródce można umieścić tylko jedną książkę. Przegródki na *i*-tej półce są ponumerowane od lewej do prawej kolejnymi liczbami 1, 2, 3, …, 2<sup>*i*</sup>.

        Jako *B*[*i*, *j*] oznaczamy *j*-tą przegródkę na *i*-tej półce.

        **Przykład 1.** Szara komórka to przegródka *B*[3, 4].

        ${shelf({ gray: '3,4', caption: 'Biblioteczka Adama (wiersze – numery półek, kolumny – numery przegródek)' })}

        Każda książka ma swój numer identyfikacyjny.

        Adam ustawia książki na półkach, zawsze zaczynając od przegródki *B*[0, 1]. Stosuje przy tym następującą, rekurencyjną regułę:

        Adam sprawdza, czy przegródka *B*[*i*, *j*] (*i* ≥ 0 oraz 1 ≤ *j* ≤ 2<sup>*i*</sup>) jest pusta. Jeśli tak, umieszcza książkę w tej przegródce. W przeciwnym przypadku porównuje numer wstawianej książki z numerem książki w przegródce. Jeśli numer wstawianej książki jest mniejszy od numeru książki stojącej w przegródce, próbuje umieścić książkę na kolejnej półce w przegródce *B*[*i* + 1, 2*j* – 1]. Jeśli numer wstawianej książki jest większy od numeru książki w przegródce, to próbuje umieścić książkę w przegródce *B*[*i* + 1, 2*j*].

        **Przykład 2.** Poniżej przedstawiono zawartość biblioteczki po wstawieniu do niej książek kolejno o numerach: 10, 2, 15, 13, 1, 5, 25 (zakładamy, że przedtem biblioteczka była pusta).

        ${shelf({ books: { '0,1': 10, '1,1': 2, '1,2': 15, '2,1': 1, '2,2': 5, '2,3': 13, '2,4': 25 } })}

        **Przykład 3.** Poniżej przedstawiono zawartość biblioteczki po wstawieniu do niej książek kolejno o numerach: 1, 5, 10, 15, 2, 25, 13 (zakładamy, że przedtem biblioteczka była pusta).

        ${shelf({ books: { '0,1': 1, '1,2': 5, '2,3': 2, '2,4': 10, '3,8': 15, '4,15': 13, '4,16': 25 } })}
      `,
      tasks: [
        {
          no: '1.1',
          points: 2,
          page: 5,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'drzewa BST'],
          text: md`
            Podaj zawartość biblioteczki po wstawieniu do niej kolejno książek o numerach: 14, 18, 12, 9, 20, 15, 17.

            Numery książek wpisz we właściwe miejsca na poniższym schemacie.

            ${shelf({ inputs: 'b' })}
          `,
          fields: shelfFields('b', BOOKS_11),
          score: (ok) => {
            const wrong = Object.values(ok).filter((v) => !v).length;
            return wrong === 0 ? 2 : wrong <= 2 ? 1 : 0;
          },
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź z jednym numerem książki w nieodpowiednim miejscu.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: shelf({ books: BOOKS_11 }),
        },
        {
          no: '1.2',
          points: 3,
          page: 6,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'drzewa BST'],
          text: md`
            Uzupełnij tabelkę – wpisz, ile minimalnie, a ile maksymalnie musi być półek w biblioteczce, żeby można było umieścić w niej *n* książek i żeby na ostatniej półce znalazła się co najmniej jedna książka.

            ${table([
              ['*n* – liczba książek', 'Minimalna liczba półek', 'Maksymalna liczba półek'],
              ['1', '1', '1'],
              ['3', '2', '3'],
              ['4', '3', '4'],
              ['7', '{{r7min|6}}', '{{r7max|6}}'],
              ['16', '5', '{{r16max|6}}'],
              ['31', '{{r31min|6}}', '{{r31max|6}}'],
              ['32', '{{r32min|6}}', '{{r32max|6}}'],
              ['2<sup>*k*</sup> – 1, dla *k* > 0', '{{rkmin|8}}', '{{rkmax|8}}'],
            ])}

            Wyrażenia z potęgą zapisz np. jako \`2^k - 1\`.
          `,
          fields: {
            r7min: '3',
            r7max: '7',
            r16max: '16',
            r31min: '5',
            r31max: '31',
            r32min: '6',
            r32max: '32',
            rkmin: 'k',
            rkmax: { expr: ['2^k-1', '(2^k)-1', '-1+2^k', 'pow(2,k)-1'] },
          },
          score: (ok) => {
            const rows = [['r7min', 'r7max'], ['r16max'], ['r31min', 'r31max'], ['r32min', 'r32max'], ['rkmin', 'rkmax']];
            const good = rows.filter((r) => r.every((id) => ok[id])).length;
            const colMin = ['r7min', 'r31min', 'r32min', 'rkmin'].every((id) => ok[id]);
            const colMax = ['r7max', 'r16max', 'r31max', 'r32max', 'rkmax'].every((id) => ok[id]);
            if (good === rows.length) return 3;
            if (good >= 4) return 2;
            if (colMin || colMax || good >= 3) return 1;
            return 0;
          },
          rubric: md`
            3 pkt – odpowiedź w całości poprawna.
            2 pkt – odpowiedź poprawna w przynajmniej 4 wierszach.
            1 pkt – odpowiedź poprawna w jednej kolumnie albo w przynajmniej 3 wierszach.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['*n* – liczba książek', 'Minimalna liczba półek', 'Maksymalna liczba półek'],
            ['1', '1', '1'],
            ['3', '2', '3'],
            ['4', '3', '4'],
            ['7', '3', '7'],
            ['16', '5', '16'],
            ['31', '5', '31'],
            ['32', '6', '32'],
            ['2<sup>*k*</sup> – 1', '*k*', '2<sup>*k*</sup> – 1'],
          ]),
        },
        {
          no: '1.3',
          points: 2,
          page: 7,
          kind: 'fill',
          cat: 'algorytmy',
          topics: ['rekurencja', 'drzewa BST'],
          text: md`
            Kolega Adama, oglądający biblioteczkę, stwierdził, że aby wypisać wszystkie numery książek umieszczonych na półkach, można posłużyć się podanym poniżej rekurencyjnym algorytmem A, którego działanie rozpoczynamy od półki o numerze 0 i od przegródki o numerze 1. Zakładamy przy tym, że w biblioteczce jest co najmniej jedna książka.

            \`\`\`pseudo
            A(i, j)
                wypisz numer książki z przegródki B[i, j]
                jeżeli przegródka B[i + 1, 2j – 1] nie jest pusta, to
                    wykonaj A(i + 1, 2j – 1)
                jeżeli przegródka B[i + 1, 2j] nie jest pusta, to
                    wykonaj A(i + 1, 2j)
            \`\`\`

            Dla biblioteczki z siedmioma książkami z przykładu 2. algorytm A wypisze: 10, 2, 1, 5, 15, 13, 25.

            Podaj ciągi liczb wypisane przez algorytm A dla podanych zawartości biblioteczki.

            **a)**

            ${shelf({ books: { '0,1': 9, '1,1': 2, '1,2': 12, '2,3': 10, '2,4': 14, '3,7': 13, '3,8': 15 } })}

            Odpowiedź: {{a|30}}

            **b)**

            ${shelf({ books: { '0,1': 10, '1,1': 8, '1,2': 15, '2,1': 4, '2,3': 12, '3,2': 6, '3,6': 13 } })}

            Odpowiedź: {{b|30}}
          `,
          fields: { a: '9, 2, 12, 10, 14, 13, 15', b: '10, 8, 4, 6, 15, 12, 13' },
          score: perField(1),
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – odpowiedź poprawna dla jednego podpunktu.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            a) 9, 2, 12, 10, 14, 13, 15

            b) 10, 8, 4, 6, 15, 12, 13
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '2',
      title: 'Liczby binarne',
      intro: md`
        W tym zadaniu rozważamy binarny zapis liczb całkowitych dodatnich.

        *Blokiem* w zapisie binarnym liczby nazywamy każdy niepusty, maksymalny (nie można go rozszerzyć ani z lewej, ani z prawej strony) ciąg kolejnych takich samych cyfr w tym zapisie.

        **Przykład:**
        Liczba binarna 111110000110111 składa się z pięciu bloków – trzech bloków złożonych z jedynek (11111, 11 i 111) i dwóch bloków złożonych z zer (0000 i 0).
        Liczba binarna 1111111111111111 składa się z jednego bloku złożonego z jedynek.
      `,
      files: ['bin.txt', 'bin_przyklad.txt', 'odp_bin_przyklad.txt'],
      infos: {
        '2.2-2.3': {
          title: 'Informacja do zadań 2.2. i 2.3.',
          text: md`
            W pliku \`bin.txt\` znajduje się 100 wierszy. Każdy wiersz zawiera zapis binarny dodatniej liczby całkowitej składający się z co najwyżej dwudziestu cyfr (0 lub 1).

            **Napisz program**(-y), który(-e) da(-dzą) odpowiedzi do poniższych zadań. Odpowiedzi zapisz w pliku \`wyniki2.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

            Plik \`bin_przyklad.txt\` zawiera 100 wierszy przykładowych danych spełniających warunki zadania. Odpowiedzi dla danych z pliku \`bin_przyklad.txt\` są podane pod treściami zadań.
          `,
        },
      },
      tasks: [
        {
          no: '2.1',
          points: 3,
          page: 8,
          kind: 'algorithm',
          cat: 'algorytmy',
          topics: ['systemy liczbowe', 'zapis algorytmu'],
          text: md`
            Zapisz w pseudokodzie lub w wybranym języku programowania algorytm, który dla danej dodatniej całkowitej liczby *n* obliczy liczbę bloków w jej zapisie binarnym.

            **Przykład:**
            Dla liczby 67 wynikiem jest 3, ponieważ 67 w zapisie binarnym to 1000011 (dwa bloki jedynek i jeden blok zer).
            Dla liczby 245 wynikiem jest 5, ponieważ 245 w zapisie binarnym to 11110101 (trzy bloki jedynek i dwa bloki zer).

            **Uwaga:** W zapisie algorytmu możesz korzystać tylko z instrukcji sterujących, operatorów arytmetycznych: dodawania, odejmowania, mnożenia, dzielenia, dzielenia całkowitego i reszty z dzielenia; operatorów logicznych, porównań, instrukcji przypisania lub samodzielnie napisanych funkcji i procedur wykorzystujących powyższe operacje. Zabronione jest używanie funkcji wbudowanych oraz operatorów innych niż wymienione, dostępnych w językach programowania, w tym zwłaszcza funkcji zamiany między systemami pozycyjnymi i konwersji między typami danych.

            **Specyfikacja:**
            Dane: *n* – dodatnia liczba całkowita
            Wynik: *b* – liczba bloków w zapisie binarnym liczby *n*
          `,
          algo: {
            inputs: [{ name: 'n', type: 'int', desc: 'dodatnia liczba całkowita' }],
            outputs: [{ name: 'b', type: 'int', desc: 'liczba bloków w zapisie binarnym liczby n' }],
            examples: [
              { in: [67], out: [3] },
              { in: [245], out: [5] },
            ],
            ref: (n) => {
              let b = 1;
              let prev = n % 2;
              n = Math.floor(n / 2);
              while (n > 0) {
                const d = n % 2;
                if (d !== prev) b++;
                prev = d;
                n = Math.floor(n / 2);
              }
              return b;
            },
            gen: (r) => [r.pick([1, 2, 3, 4, 7, 8, 15, 16, 1023, 1024, 2 ** 31 - 1, 2 ** 31, r.int(1, 1000), r.int(1, 1e6), r.int(1, 2 ** 40)])],
            random: 14,
            noBuiltins: 'conversion',
          },
          rubric: md`
            3 pkt – poprawny algorytm, w tym:
            1 pkt – za poprawną pętlę,
            1 pkt – za poprawne porównywanie kolejnych cyfr binarnych,
            1 pkt – za poprawne zliczenie liczby bloków, w tym rozpoznawanie końca/początku kolejnego bloku i ustawienia początkowe.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`pseudo
            b ← 1
            poprzednia ← n mod 2
            n ← n div 2
            dopóki (n > 0)
                cyfra ← n mod 2
                jeśli cyfra ≠ poprzednia
                    b ← b + 1
                poprzednia ← cyfra
                n ← n div 2
            \`\`\`
          `,
        },
        {
          no: '2.2',
          points: 2,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe', 'napisy'],
          info: '2.2-2.3',
          text: md`
            Podaj, ile liczb w pliku \`bin.txt\` składa się z **co najwyżej dwóch** *bloków* (zgodnie z definicją *bloku* podaną wcześniej).

            Dla danych z pliku \`bin_przyklad.txt\` poprawna odpowiedź to 3.
          `,
          example: { map: { 'bin.txt': 'bin_przyklad.txt' }, expect: '3' },
          expect: '10',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – za zliczenie liczb składających się tylko z jednego bloku ALBO za zliczenie liczb składających się z dokładnie dwóch bloków.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '10',
        },
        {
          no: '2.3',
          points: 2,
          page: 10,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe'],
          info: '2.2-2.3',
          text: md`
            Wypisz największą z liczb zapisanych w pliku \`bin.txt\`.

            Dla danych z pliku \`bin_przyklad.txt\` poprawna odpowiedź to 10001111110111100000.
          `,
          example: { map: { 'bin.txt': 'bin_przyklad.txt' }, expect: '10001111110111100000' },
          expect: '1110100011100011100',
          rubric: md`
            2 pkt – odpowiedź poprawna.
            1 pkt – za podanie drugiej liczby w kolejności od największej (1101111001101111111).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '1110100011100011100',
        },
        {
          no: '2.4',
          points: 1,
          page: 10,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe', 'operacje bitowe'],
          text: md`
            Dla nieujemnych liczb całkowitych *a* i *b* wynikiem operacji *a* XOR *b* jest liczba, której kolejne bity są wyliczane na podstawie poniższej tabelki z odpowiadających sobie bitów w zapisie binarnym liczb *a* i *b*. Jeśli jeden zapis jest krótszy od drugiego, to uzupełniamy go zerami z lewej strony (na najbardziej znaczących pozycjach).

            ${table([
              ['*p*', '*q*', '*p* XOR *q*'],
              ['1', '1', '0'],
              ['1', '0', '1'],
              ['0', '1', '1'],
              ['0', '0', '0'],
            ])}

            np.
            4<sub>10</sub> XOR 7<sub>10</sub> = 100<sub>2</sub> XOR 111<sub>2</sub> = 011<sub>2</sub> = 3<sub>10</sub>
            6<sub>10</sub> XOR 11<sub>10</sub> = 0110<sub>2</sub> XOR 1011<sub>2</sub> = 1101<sub>2</sub> = 13<sub>10</sub>

            Oblicz (123<sub>10</sub> XOR 101101<sub>2</sub>) XOR 2D<sub>16</sub>. Wynik podaj w systemie **dziesiętnym**.

            Odpowiedź: {{x|12}}
          `,
          fields: { x: '123' },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '123',
        },
        {
          no: '2.5',
          points: 3,
          page: 11,
          kind: 'program',
          cat: 'programowanie',
          topics: ['systemy liczbowe', 'operacje bitowe'],
          text: md`
            Napisz program, który dla każdej binarnej liczby *p* zapisanej w pliku \`bin.txt\` obliczy wynik działania

            *p* XOR (*p* div 2)

            gdzie XOR to operacja bitowa opisana wcześniej, a *p* div 2 oznacza połowę liczby *p*, zaokrągloną w dół do liczby całkowitej.

            Otrzymane wyniki podaj w systemie binarnym. Zapisz je do pliku \`wyniki2_5.txt\` w kolejności występowania liczb w pliku \`bin.txt\`, każdy wynik w oddzielnym wierszu.

            Odpowiedź dla danych z pliku \`bin_przyklad.txt\` znajduje się w pliku \`odp_bin_przyklad.txt\`.
          `,
          example: { map: { 'bin.txt': 'bin_przyklad.txt' }, expectFile: 'odp_bin_przyklad.txt' },
          expect: { parts: [{ lines: XOR_25, ordered: true, points: 3 }] },
          rubric: md`
            3 pkt – odpowiedź poprawna (poprawne wyniki zapisane w systemie binarnym).
            2 pkt – odpowiedź zawierająca poprawne wyniki ale zapisane w systemie dziesiętnym.
            1 pkt – odpowiedź poprawna dla wszystkich wejściowych liczb nieparzystych ALBO dla wszystkich wejściowych liczb parzystych.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            100 liczb binarnych (po jednej w wierszu), zaczynając od:

            \`\`\`
            ${XOR_25.slice(0, 6).join('\n')}
            …
            \`\`\`
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '3',
      title: 'Liczba Pi',
      intro: md`
        Pewien matematyk jest zafascynowany liczbą π ≈ 3,14159265... do tego stopnia, że zapisał jej rozwinięcie dziesiętne z dokładnością do 10 000 cyfr po przecinku. Wszystkie cyfry po przecinku zapisał w pliku tekstowym \`pi.txt\`.

        Plik \`pi.txt\` zawiera 10 000 wierszy, każdy wiersz zawiera jedną cyfrę. W pierwszych 10 wierszach pliku zapisano zatem cyfry: 1, 4, 1, 5, 9, 2, 6, 5, 3, 5 (każda w osobnym wierszu).

        Matematyk zastanawia się, jakiego rodzaju regularności można zaobserwować w zebranych danych.

        **Napisz program**(y), który(-e) da(-dzą) odpowiedzi do poniższych zadań. Odpowiedzi do zadań zapisz w pliku \`wyniki3.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.

        Plik \`pi_przyklad.txt\` zawiera 100 pierwszych wierszy pliku \`pi.txt\`. Odpowiedzi dla danych z tego pliku są podane pod treściami zadań.
      `,
      files: ['pi.txt', 'pi_przyklad.txt'],
      infos: {
        '3.3-3.4': {
          title: 'Informacja do zadań 3.3. i 3.4.',
          text: md`
            Skończony co najmniej 4-elementowy ciąg liczb (*a*<sub>1</sub>, *a*<sub>2</sub>, …, *a*<sub>*n*</sub>) jest *rosnąco-malejący*, jeśli można podzielić go na dwa ciągi, z których pierwszy jest rosnący, a drugi – malejący, tzn. jeśli istnieje takie *k* ∈ {2, 3, …, *n* – 2}, że *a*<sub>1</sub> < *a*<sub>2</sub> < … < *a*<sub>*k*</sub> oraz *a*<sub>*k*+1</sub> > *a*<sub>*k*+2</sub> > … > *a*<sub>*n*</sub>.

            **Przykład:**
            Ciąg (2, 5, 7, 9, 8, 3, 1) jest rosnąco-malejący, bo można go podzielić na dwa ciągi: rosnący (2, 5, 7) i malejący (9, 8, 3, 1) lub – odpowiednio – (2, 5, 7, 9) i (8, 3, 1). Ciąg (5, 9, 9, 4, 1) także jest rosnąco-malejący.
            Przykłady ciągów, które nie są rosnąco-malejące, to: (2, 5, 8, 4, 3, 4, 5), (1, 2, 3, 4), (5, 5, 3, 2, 1).
          `,
        },
      },
      tasks: [
        {
          no: '3.1',
          points: 2,
          page: 12,
          kind: 'program',
          cat: 'programowanie',
          topics: ['ciągi'],
          text: md`
            *Fragmentem 2-cyfrowym* nazywamy dwie następujące po sobie cyfry w pliku \`pi.txt\`. Wszystkich fragmentów 2-cyfrowych zapisanych w tym pliku jest 9 999. Ostatni rozpoczyna się w wierszu nr 9 999.

            Przykładowe fragmenty 2-cyfrowe podano w poniższej tabeli.

            ${table([
              ['*i*', 'Fragment 2-cyfrowy złożony z cyfr na pozycjach *i*, *i*+1'],
              ['1', '14'],
              ['2', '41'],
              ['3', '15'],
              ['9', '35'],
            ])}

            Znajdź liczbę wszystkich fragmentów 2-cyfrowych, które są zapisami dziesiętnymi liczb o wartościach większych od 90.

            Dla danych zapisanych w pliku \`pi_przyklad.txt\` poprawna odpowiedź to 13.
          `,
          example: { map: { 'pi.txt': 'pi_przyklad.txt' }, expect: '13' },
          expect: '902',
          rubric: md`
            2 pkt – odpowiedź poprawna (902).
            1 pkt – odpowiedź 1014 (liczba fragmentów większych bądź równych 90).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '902',
        },
        {
          no: '3.2',
          points: 3,
          page: 13,
          kind: 'program',
          cat: 'programowanie',
          topics: ['ciągi', 'zliczanie'],
          text: md`
            Wszystkich możliwych różnych fragmentów 2-cyfrowych jest dokładnie 100. Są nimi fragmenty 00, 01, 02, …, 99. Można sprawdzić, że np. 2-cyfrowy fragment równy 27 występuje w pliku \`pi.txt\` dokładnie 101 razy.

            Znajdź fragmenty 2-cyfrowe, których liczba wystąpień w pliku \`pi.txt\` jest najmniejsza, oraz fragmenty 2-cyfrowe, których liczba wystąpień w pliku \`pi.txt\` jest największa. W wyniku podaj znalezione fragmenty 2-cyfrowe oraz liczby ich wystąpień.

            W przypadku, gdy więcej niż jeden fragment występuje tyle samo razy, wypisz ten o mniejszej wartości liczbowej.

            Dla danych w pliku \`pi_przyklad.txt\` poprawna odpowiedź to

            \`\`\`
            00 0
            62 4
            \`\`\`

            (minimalna liczba wystąpień: fragment 00, liczba wystąpień 0; maksymalna liczba wystąpień: fragment 62, liczba wystąpień 4)
          `,
          example: { map: { 'pi.txt': 'pi_przyklad.txt' }, expect: '00 0 62 4' },
          expect: {
            parts: [
              { label: 'fragment występujący najrzadziej (88)', tokens: '88', points: 1 },
              { label: 'fragment występujący najczęściej (65)', tokens: '65', points: 1 },
              { label: 'liczby wystąpień obu fragmentów', tokens: '88 80 65 124', points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za podanie poprawnego fragmentu (88) występującego najrzadziej,
            1 pkt – za podanie poprawnego fragmentu (65) występującego najczęściej,
            1 pkt – za podanie liczby wystąpień obu fragmentów.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            88 80
            65 124
            \`\`\`
          `,
        },
        {
          no: '3.3',
          points: 3,
          page: 13,
          kind: 'program',
          cat: 'programowanie',
          topics: ['ciągi'],
          info: '3.3-3.4',
          text: md`
            Podaj, ile jest wszystkich rosnąco-malejących ciągów złożonych z dokładnie sześciu kolejnych cyfr zapisanych w pliku \`pi.txt\`.

            Dla pliku \`pi_przyklad.txt\` poprawna odpowiedź to 3.
            (w pliku \`pi_przyklad.txt\` są trzy ciągi rosnąco-malejące złożone z dokładnie sześciu cyfr: 028841, 089986, 899862)
          `,
          example: { map: { 'pi.txt': 'pi_przyklad.txt' }, expect: '3' },
          expect: '214',
          rubric: md`
            3 pkt – odpowiedź poprawna (214).
            2 pkt – odpowiedź, w której nie uwzględniono jednego przypadku ciągu rosnąco-malejącego (np. typu 123454).
            1 pkt – odpowiedź, w której otrzymano liczbę większą od 214, uwzględniając (oprócz właściwych ciągów) jako rosnąco-malejące kilka ciągów nie spełniających tego warunku (odpowiedź: 215, 216 lub 217).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '214',
        },
        {
          no: '3.4',
          points: 2,
          page: 14,
          kind: 'program',
          cat: 'programowanie',
          topics: ['ciągi'],
          info: '3.3-3.4',
          text: md`
            Znajdź najdłuższy ciąg kolejnych cyfr z pliku \`pi.txt\`, który jest rosnąco-malejący, oraz pozycję, na której on się rozpoczyna. W pliku \`pi.txt\` jest tylko jeden taki ciąg o największej długości.

            Wynik zapisz w dwóch wierszach: w pierwszym wierszu zapisz pozycję, od której zaczyna się znaleziony ciąg, a w drugim wypisz znaleziony ciąg. Cyfry ciągu zapisz jedną po drugiej, bez znaku odstępu.

            Dla danych w pliku \`pi_przyklad.txt\` poprawna odpowiedź to

            \`\`\`
            77
            0899862
            \`\`\`

            (najdłuższy ciąg rosnąco-malejący w pliku \`pi_przyklad.txt\` to ciąg 0899862 o długości 7 rozpoczynający się w 77 wierszu pliku).
          `,
          example: { map: { 'pi.txt': 'pi_przyklad.txt' }, expect: '77 0899862' },
          expect: {
            parts: [
              { label: 'pozycja początku ciągu', tokens: '2781', points: 1 },
              { label: 'najdłuższy ciąg', tokens: '014576540', points: 1 },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – za podanie pozycji, od której rozpoczyna się najdłuższy podciąg,
            1 pkt – za podanie najdłuższego podciągu.
            1 pkt – odpowiedź, w której podano pozycję oraz długość ciągu (9), a nie sam ciąg.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            \`\`\`
            2781
            014576540
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
          page: 15,
          kind: 'tf',
          cat: 'teoria',
          topics: ['bezpieczeństwo', 'kryptografia'],
          text: md`
            Oceń prawdziwość podanych zdań. Zaznacz **P**, jeśli zdanie jest prawdziwe, albo **F** – jeśli jest fałszywe.

            W komunikacji między dwoma osobami A i B z wykorzystaniem szyfrowania asymetrycznego klucz prywatny osoby A stosuje się do
          `,
          statements: ['odszyfrowania wiadomości wysłanej do osoby A przez osobę B.', 'uwierzytelnienia osoby B przez osobę A.'],
          answer: 'PF',
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna (PF).
            0 pkt – odpowiedź niepoprawna, niepełna albo brak odpowiedzi.
          `,
          solution: '1. P, 2. F',
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
          page: 15,
          kind: 'fill',
          cat: 'teoria',
          topics: ['systemy liczbowe'],
          text: md`
            Dane są liczby zapisane w systemach pozycyjnych o podstawach 3, 5 i 6.

            Wstaw w miejsce kropek odpowiedni znak spośród: <, >, =, tak aby wyrażenie było poprawne.

            ${table(
              [
                ['(2011)<sub>3</sub>', '=', '(134)<sub>6</sub>'],
                ['(134)<sub>5</sub>', '{{s1:<|>|=}}', '(134)<sub>6</sub>'],
                ['(2222)<sub>3</sub>', '{{s2:<|>|=}}', '(1111)<sub>6</sub>'],
              ],
              { head: false, cls: 'compact' },
            )}
          `,
          fields: { s1: '<', s2: '<' },
          score: all(1),
          rubric: md`
            1 pkt – odpowiedź poprawna.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: md`
            (134)<sub>5</sub> < (134)<sub>6</sub>
            (2222)<sub>3</sub> < (1111)<sub>6</sub>
          `,
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '6',
      title: 'Konfitury owocowe',
      intro: md`
        W pliku \`owoce.txt\` zapisano informacje o dostawach owoców do przetwórni w okresie od 01.05.2020 do 30.09.2020.

        W każdym wierszu podane są: data dostawy (dd.mm.rrrr), liczba kilogramów dostarczonych malin, liczba kilogramów dostarczonych truskawek i liczba kilogramów dostarczonych porzeczek, oddzielone znakiem tabulacji.

        Dostawy odbywały się każdego dnia w wymienionym okresie.

        **Przykład:**

        ${sample(`data\tdostawa_malin\tdostawa_truskawek\tdostawa_porzeczek
        01.05.2020\t211\t281\t88
        02.05.2020\t393\t313\t83
        03.05.2020\t389\t315\t104
        04.05.2020\t308\t221\t119`)}

        Z wykorzystaniem dostępnych narzędzi informatycznych podaj odpowiedzi do poniższych zadań. Odpowiedzi zapisz w pliku \`wyniki6.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['owoce.txt'],
      sheet: { file: 'owoce.txt' },
      infos: {
        '6.3-6.4': {
          title: 'Informacja do zadań 6.3. i 6.4.',
          text: md`
            Przetwórnia produkuje konfitury: malinowo-truskawkowe, malinowo-porzeczkowe oraz truskawkowo-porzeczkowe (zawsze w proporcji owoców 1:1 oraz z wykorzystaniem maksymalnej dostępnej ilości owoców). Decyzja, jaka konfitura w danym dniu będzie produkowana, zależy od ilości owoców w przetwórni.

            Owoce są dostarczane do przetwórni rano, przed rozpoczęciem produkcji. W danym dniu jest produkowany tylko jeden rodzaj konfitur. Do produkcji są brane owoce, których jest najwięcej w przetwórni (dla danych w pliku \`owoce.txt\` nie występuje przypadek, gdy ilość różnych owoców jest taka sama). Owoce niewykorzystane do produkcji są przechowywane w chłodni do następnego dnia. W następnym dniu podejmuje się decyzję o produkcji na ten dzień na podstawie łącznej ilości owoców pozostałych z poprzedniego dnia oraz dostarczonych rano.

            **Przykład:**
            Jeżeli 01.05.2020 dostarczono 211 kg malin, 281 kg truskawek i 88 kg porzeczek, to w tym dniu będzie produkowana konfitura malinowo-truskawkowa. Do produkcji wykorzystane zostanie 211 kg malin i 211 kg truskawek. Reszta truskawek i wszystkie porzeczki będą przechowywane w chłodni do następnego dnia.
            Po dostawie z 02.05.2020 (393 kg malin, 313 kg truskawek i 83 kg porzeczek) w przetwórni będzie 393 kg malin, 383 kg truskawek i 171 kg porzeczek, czyli znowu będzie produkowana konfitura malinowo-truskawkowa.

            Po uwzględnieniu opisanego powyżej cyklu produkcyjnego oraz danych zapisanych w pliku \`owoce.txt\` podaj odpowiedzi do poniższych zadań.
          `,
        },
      },
      tasks: [
        {
          no: '6.1',
          points: 3,
          page: 16,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['zestawienia', 'wykresy'],
          text: md`
            Dla każdego miesiąca pracy przetwórni (od maja do września) wykonaj zestawienie liczby dostarczonych kilogramów malin, liczby dostarczonych kilogramów truskawek i liczby dostarczonych kilogramów porzeczek.

            Na podstawie wykonanego zestawienia utwórz wykres kolumnowy. Pamiętaj o czytelnym opisie wykresu (tytuł, legenda, opisy osi: na osi X – nazwy miesięcy, na osi Y – liczba kilogramów).
          `,
          answerHint: 'Wpisz zestawienie: jeden miesiąc w wierszu (maj → wrzesień), w kolejności: maliny, truskawki, porzeczki.',
          expect: {
            parts: [
              {
                label: 'zestawienie',
                lines: ['9238 9287 3309', '9485 8916 5081', '11592 11339 10567', '11045 11386 11078', '6532 7476 6355'],
                ordered: true,
                points: 1,
              },
            ],
          },
          self: { points: 2, label: 'wykres kolumnowy', hint: 'Typ wykresu i dobór danych (1 pkt) oraz opis: tytuł, legenda, nazwy miesięcy na osi X, opis osi Y (1 pkt).' },
          chart: true,
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym:
            1 pkt – za prawidłowe zestawienie,
            2 pkt – za prawidłowy wykres, w tym:
            1 pkt – typ wykresu i dobór danych,
            1 pkt – prawidłowy opis (tytuł, legenda, nazwy miesięcy na osi X, opis osi Y).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['miesiąc', 'dostawa_malin', 'dostawa_truskawek', 'dostawa_porzeczek'],
            ['maj', '9238', '9287', '3309'],
            ['czerwiec', '9485', '8916', '5081'],
            ['lipiec', '11592', '11339', '10567'],
            ['sierpień', '11045', '11386', '11078'],
            ['wrzesień', '6532', '7476', '6355'],
          ]),
        },
        {
          no: '6.2',
          points: 1,
          page: 16,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['funkcje logiczne'],
          text: md`
            Podaj liczbę dni, w których dostarczono, spośród trzech rodzajów owoców, najwięcej porzeczek.
          `,
          expect: '19',
          rubric: md`
            1 pkt – odpowiedź poprawna (19).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '19',
        },
        {
          no: '6.3',
          points: 3,
          page: 17,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          info: '6.3-6.4',
          text: md`
            Podaj, ile razy, w okresie od 01.05.2020 do 30.09.2020, produkowano konfitury poszczególnych rodzajów.
          `,
          answerHint: 'Np. „malinowo-truskawkowe 72”, każdy rodzaj w osobnym wierszu.',
          expect: {
            parts: [
              { label: 'malinowo-porzeczkowe', items: ['malinowo-porzeczkow… 41'], points: 1 },
              { label: 'malinowo-truskawkowe', items: ['malinowo-truskawkow… 72'], points: 1 },
              { label: 'truskawkowo-porzeczkowe', items: ['truskawkowo-porzeczkow… 40'], points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym: po 1 pkt – za dane dla każdego rodzaju konfitur.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['rodzaj konfitur', 'liczba dni'],
            ['malinowo-porzeczkowe', '41'],
            ['malinowo-truskawkowe', '72'],
            ['truskawkowo-porzeczkowe', '40'],
          ]),
        },
        {
          no: '6.4',
          points: 3,
          page: 17,
          kind: 'sheet',
          cat: 'arkusz',
          topics: ['symulacja'],
          info: '6.3-6.4',
          text: md`
            Na wyprodukowanie 1 kg konfitur dwuowocowych potrzeba po 1 kg każdego owocu.

            Podaj, ile kilogramów konfitur każdego rodzaju wyprodukowano w okresie od 01.05.2020 do 30.09.2020.
          `,
          answerHint: 'Np. „malinowo-truskawkowe 12345”, każdy rodzaj w osobnym wierszu.',
          expect: {
            parts: [
              { label: 'malinowo-porzeczkowe', items: ['malinowo-porzeczkow… 18008'], points: 1 },
              { label: 'malinowo-truskawkowe', items: ['malinowo-truskawkow… 29732'], points: 1 },
              { label: 'truskawkowo-porzeczkowe', items: ['truskawkowo-porzeczkow… 18382'], points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym: po 1 pkt – za dane dla każdego rodzaju konfitur.
            2 pkt – odpowiedź, w której podano liczby dwa razy większe niż poprawne dla każdego rodzaju konfitur.
            1 pkt – za podanie tylko łącznej sumy (66122).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['rodzaj konfitur', 'kg'],
            ['malinowo-porzeczkowe', '18008'],
            ['malinowo-truskawkowe', '29732'],
            ['truskawkowo-porzeczkowe', '18382'],
          ]),
        },
      ],
    },
    // ------------------------------------------------------------------------------------
    {
      no: '7',
      title: 'Gry planszowe',
      intro: md`
        Pewien serwis internetowy prowadzi ranking gier planszowych. Baza serwisu została zapisana w trzech plikach.

        Plik \`gry.txt\` zawiera informacje o grach planszowych. W każdym wierszu zapisano:
        - *id_gry* – unikatowy numer gry planszowej
        - *nazwa* – tytuł gry planszowej
        - *kategoria* – kategorię, do jakiej została zakwalifikowana gra planszowa; każda gra należy tylko do jednej kategorii.

        **Przykład:**

        ${sample(`id_gry\tnazwa\tkategoria
        1\tWsiasc do Pociagu: Europa\tfamilijna
        2\tPandemia\tkooperacyjna
        3\tSplendor\tfamilijna
        4\tDixit\tfamilijna
        5\tDobble\tfamilijna`)}

        Plik \`gracze.txt\` zawiera informacje o graczach. W każdym wierszu zapisano:
        - *id_gracza* – unikatowy numer gracza
        - *imie* – imię gracza
        - *nazwisko* – nazwisko gracza
        - *wiek* – wiek gracza.

        **Przykład:**

        ${sample(`id_gracza\timie\tnazwisko\twiek
        1\tJozef\tGorecki\t29
        2\tPrzemyslaw\tMazurek\t68
        3\tCezary\tKaczmarczyk\t41
        4\tKornel\tWysocki\t72
        5\tEustachy\tGorecki\t74`)}

        Plik \`oceny.txt\` zawiera oceny wystawione grom przez poszczególnych graczy. W każdym wierszu pliku zapisano:
        - *id_gry* – numer gry planszowej
        - *id_gracza* – numer gracza
        - *stan* – zawiera jedną z możliwych wartości: posiada, chce kupic, sprzedal, opisującą, czy użytkownik posiada daną grę, czy ją sprzedał lub czy zamierza ją zakupić
        - *ocena* – zawiera ocenę gry przez gracza, wyrażoną liczbą całkowitą w zakresie od 0 do 10.

        **Przykład:**

        ${sample(`id_gry\tid_gracza\tstan\tocena
        66\t1\tposiada\t8
        72\t1\tchce kupic\t3
        79\t1\tsprzedal\t8
        43\t2\tposiada\t9`)}

        We wszystkich plikach dane w wierszach są rozdzielone znakami tabulacji, a pierwszy wiersz w każdym pliku jest wierszem nagłówkowym.

        Z wykorzystaniem danych zawartych w podanych plikach oraz dostępnych narzędzi informatycznych, podaj odpowiedzi do zadań 7.1.–7.4. Odpowiedzi zapisz w pliku \`wyniki7.txt\`, a każdą z nich poprzedź numerem odpowiedniego zadania.
      `,
      files: ['gry.txt', 'gracze.txt', 'oceny.txt'],
      tables: { gry: 'gry.txt', gracze: 'gracze.txt', oceny: 'oceny.txt' },
      tasks: [
        {
          no: '7.1',
          points: 1,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie'],
          text: md`Podaj tytuł gry, która otrzymała najwięcej ocen.`,
          expect: 'K2',
          rubric: md`
            1 pkt – odpowiedź poprawna (K2).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: 'K2',
        },
        {
          no: '7.2',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie', 'funkcje agregujące'],
          text: md`Dla każdej gry z kategorii „imprezowa” podaj średnią jej ocen z dokładnością do dwóch miejsc po przecinku.`,
          expect: {
            parts: [
              {
                lines: [
                  '5 sekund 8,16',
                  'Avalone 8,25',
                  'Colt Express 7,54',
                  'Jenga 8,16',
                  'Koncept 8,37',
                  'Mamy szpiega 8,22',
                  'Przebiegle wielblady 7,73',
                  'Sushi Go 8,07',
                  'Swiatowy Konflikt 7,80',
                  'Szeryf z Nottingham 7,88',
                ],
                points: 2,
              },
            ],
          },
          rubric: md`
            2 pkt – odpowiedź poprawna, w tym:
            1 pkt – wypisanie poprawnych wyników,
            1 pkt – podanie średnich z dokładnością do dwóch miejsc po przecinku.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['nazwa', 'Średnia ocena'],
            ['5 sekund', '8,16'],
            ['Avalone', '8,25'],
            ['Colt Express', '7,54'],
            ['Jenga', '8,16'],
            ['Koncept', '8,37'],
            ['Mamy szpiega', '8,22'],
            ['Przebiegle wielblady', '7,73'],
            ['Sushi Go', '8,07'],
            ['Swiatowy Konflikt', '7,80'],
            ['Szeryf z Nottingham', '7,88'],
          ]),
        },
        {
          no: '7.3',
          points: 2,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'podzapytania'],
          text: md`Podaj liczbę graczy, którzy nie posiadają żadnej z ocenianych przez siebie gier (nie mają żadnej gry ze stanem „posiada”), a wystawili co najmniej jedną ocenę.`,
          expect: '334',
          rubric: md`
            2 pkt – odpowiedź poprawna (334).
            1 pkt – odpowiedź uwzględniająca graczy, którzy nie wystawili żadnej oceny (351).
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: '334',
        },
        {
          no: '7.4',
          points: 3,
          page: 19,
          kind: 'sql',
          cat: 'bazy',
          topics: ['SQL', 'grupowanie'],
          text: md`
            W ocenianiu gier planszowych uczestniczą osoby w wieku od 10 do 99 lat. Osoby oceniające gry podzielono na trzy kategorie wiekowe: juniorzy (do 19 lat), seniorzy (od 20 do 49 lat) oraz weterani (od 50 lat).

            Wykonaj zestawienie, w którym dla każdej kategorii wiekowej podasz największą liczbę ocen wystawionych jednej grze przez użytkowników z tej kategorii wiekowej oraz nazwy gier z tą liczbą ocen.

            Jeżeli gier, które otrzymały taką samą największą liczbę ocen od użytkowników z danej kategorii wiekowej, jest więcej niż jedna – podaj tytuły ich wszystkich.
          `,
          answerHint: 'Jeden wiersz na grę, np. „juniorzy K2 6”.',
          expect: {
            parts: [
              { label: 'juniorzy', lines: ['Terraformacja Marsa 6', 'K2 6'], points: 1 },
              { label: 'seniorzy', lines: ['K2 24'], points: 1 },
              { label: 'weterani', lines: ['Robinson Crusoe 28'], points: 1 },
            ],
          },
          rubric: md`
            3 pkt – odpowiedź poprawna, w tym: po 1 pkt – za tytuły i liczby ocen gier dla każdego przedziału wiekowego (juniorzy, seniorzy, weterani).
            2 pkt – za poprawne wyniki dla wszystkich kategorii wiekowych z podaniem id_gry zamiast tytułu.
            0 pkt – odpowiedź niepoprawna albo brak odpowiedzi.
          `,
          solution: table([
            ['Kategoria', 'Tytuł gry', 'Liczba ocen'],
            ['juniorzy', 'Terraformacja Marsa', '6'],
            ['juniorzy', 'K2', '6'],
            ['seniorzy', 'K2', '24'],
            ['weterani', 'Robinson Crusoe', '28'],
          ]),
        },
        {
          no: '7.5',
          points: 2,
          page: 20,
          kind: 'sqlwrite',
          cat: 'bazy',
          topics: ['SQL', 'złączenia'],
          text: md`
            Do wcześniej opisanych tabel bazy danych dołączamy kolejną o nazwie *sklep*, w której zapisano cennik gier sprzedawanych w pewnym sklepie. Tabela zawiera następujące pola:
            - *id_gry* – identyfikator gry
            - *cena* – cena gry
            - *promocja* – informacja, czy cena jest ceną promocyjną (wartość *true* – jeśli cena jest promocyjna albo *false* – kiedy nie jest promocyjna)

            Tabele *gry* i *sklep* są połączone relacją jeden do wielu.

            **Uwaga:**
            - gra może mieć dwie ceny (cena w promocji i cena bez promocji), tj. może występować w tabeli *sklep* dwa razy
            - tabela *sklep* zawiera tylko identyfikatory gier, które są w ofercie sklepu (nie musi zawierać wszystkich identyfikatorów z tabeli *gry*).

            Zapisz zapytanie SQL, w wyniku którego uzyskamy informację, ile należałoby zapłacić za zakup w tym sklepie po jednej sztuce ze wszystkich gier logicznych (kategoria „logiczna”) dostępnych w cenach promocyjnych.
          `,
          extraTables: { sklep: ['id_gry INTEGER', 'cena REAL', 'promocja BOOLEAN'] },
          rubric: md`
            2 pkt – odpowiedź poprawna (poprawny zapis zapytania zgodny z treścią zadania).
            1 pkt – odpowiedź z jednym błędem np. brak jednego warunku albo błąd przy JOIN.
            0 pkt – odpowiedź niepoprawna albo brak rozwiązania.
          `,
          solution: md`
            Przykładowe rozwiązanie:

            \`\`\`sql
            SELECT Sum(cena)
            FROM Gry
            INNER JOIN Sklep ON Gry.id_gry = Sklep.id_gry
            WHERE Gry.kategoria = "logiczna" and Sklep.promocja = true;
            \`\`\`
          `,
        },
      ],
    },
  ],
};
