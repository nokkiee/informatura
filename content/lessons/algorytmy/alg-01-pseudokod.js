import { md, code } from '../lib.js';

export default {
  title: 'Pseudokod i śledzenie algorytmu',
  summary: 'Jak czytać pseudokod z arkuszy CKE, specyfikacja, śledzenie wartości zmiennych w tabeli i liczenie wykonań instrukcji.',
  minutes: 30,
  intro: md`
    - jak czytać specyfikację (*Dane*, *Wynik*) i pseudokod używany w arkuszach maturalnych,
    - jak „wykonać algorytm na kartce”, czyli śledzić wartości zmiennych w tabeli,
    - jak policzyć, ile razy wykona się instrukcja (także w pętlach zagnieżdżonych),
    - jak przepisać pseudokod na program – i gdzie łatwo o pomyłkę.
  `,
  steps: [
    {
      title: 'Specyfikacja i pseudokod',
      body: md`
        Zadania z algorytmiki na maturze opisują algorytm **specyfikacją** i **pseudokodem**. Specyfikacja mówi, co algorytm dostaje i co oddaje:

        > **Dane:** *n* – dodatnia liczba całkowita
        > **Wynik:** *s* – suma nieparzystych cyfr liczby *n*, *k* – liczba nieparzystych cyfr

        Pseudokod to zapis „prawie jak program”, ale bez szczegółów konkretnego języka. W arkuszach CKE wygląda tak:

        | pseudokod | znaczenie | Python | C++ / Java |
        |---|---|---|---|
        | \`x ← 5\` | przypisanie | \`x = 5\` | \`x = 5;\` |
        | \`a div b\`, \`a mod b\` | dzielenie całkowite, reszta | \`a // b\`, \`a % b\` | \`a / b\`, \`a % b\` |
        | \`jeżeli w to … w przeciwnym razie …\` | instrukcja warunkowa | \`if w: … else: …\` | \`if (w) { … } else { … }\` |
        | \`dopóki w wykonuj …\` | pętla while | \`while w: …\` | \`while (w) { … }\` |
        | \`dla i = 1, 2, …, n wykonuj …\` | pętla for (**włącznie z n**) | \`for i in range(1, n + 1): …\` | \`for (int i = 1; i <= n; i++) { … }\` |
        | \`T[1..n]\`, \`T[i]\` | tablica numerowana **od 1** | lista numerowana od 0 | tablica numerowana od 0 |
        | \`wynikiem jest x\`, \`zwróć x\` | zakończ i oddaj wynik | \`return x\` | \`return x;\` |
        | \`oraz\`, \`lub\`, \`nie\` | spójniki logiczne | \`and\`, \`or\`, \`not\` | \`&&\`, \`\|\|\`, \`!\` |

        Bloki wyznaczają **wcięcia**[[python:  – tak jak w Pythonie]][[cpp java:  (w programie zamiast nich są nawiasy klamrowe \`{ }\`)]]. Oto algorytm do powyższej specyfikacji:

        ~~~pseudo
        s ← 0
        k ← 0
        dopóki n > 0 wykonuj
            c ← n mod 10
            jeżeli c mod 2 = 1 to
                s ← s + c
                k ← k + 1
            n ← n div 10
        ~~~

        > **Uwaga:** W pseudokodzie \`=\` oznacza **porównanie** (jak \`==\` w programach), a przypisanie zapisuje się strzałką \`←\`.
      `,
    },
    {
      title: 'Śledzenie w tabeli',
      body: md`
        Najczęstsze polecenie w zadaniach z algorytmiki: *„Uzupełnij tabelę – podaj wynik działania algorytmu dla podanych danych”*. Robisz to „ręcznie”: zapisujesz wartości zmiennych **po każdym obrocie pętli**. Dla algorytmu z poprzedniego kroku i \`n = 37254\`:

        | obrót | c | s | k | n (po obrocie) |
        |---|---|---|---|---|
        | przed pętlą | – | 0 | 0 | 37254 |
        | 1 | 4 | 0 | 0 | 3725 |
        | 2 | 5 | 5 | 1 | 372 |
        | 3 | 2 | 5 | 1 | 37 |
        | 4 | 7 | 12 | 2 | 3 |
        | 5 | 3 | 15 | 3 | 0 |

        Po piątym obrocie \`n = 0\`, warunek \`n > 0\` jest fałszywy i pętla się kończy. Wynik: \`s = 15\`, \`k = 3\`.

        Zasady, które oszczędzają pomyłek:
        1. Wykonuj instrukcje **dokładnie w kolejności** z pseudokodu – w tym algorytmie \`c\` liczy się z *starego* \`n\`, a \`n\` zmienia się dopiero na końcu obrotu.
        2. Warunek pętli \`dopóki\` sprawdzasz **przed** każdym obrotem.
        3. Zapisuj **każdy** obrót, nawet jeśli „widać”, co wyjdzie. Na maturze dane bywają dobrane tak, żeby złapać na skrótach myślowych.

        Gdy masz komputer (na maturze masz go przez cały egzamin), możesz przepisać algorytm na program i **sprawdzić** swoje ręczne obliczenia:

        ~~~python run
        n = 37254
        s, k = 0, 0
        while n > 0:
            c = n % 10
            if c % 2 == 1:
                s += c
                k += 1
            n //= 10
            print(c, s, k, n)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            long long n = 37254;
            int s = 0, k = 0;
            while (n > 0) {
                int c = n % 10;
                if (c % 2 == 1) {
                    s += c;
                    k++;
                }
                n /= 10;
                cout << c << " " << s << " " << k << " " << n << endl;
            }
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                long n = 37254;
                int s = 0, k = 0;
                while (n > 0) {
                    int c = (int) (n % 10);
                    if (c % 2 == 1) {
                        s += c;
                        k++;
                    }
                    n /= 10;
                    System.out.println(c + " " + s + " " + k + " " + n);
                }
            }
        }
        ~~~
      `,
    },
    {
      title: 'Ile razy wykona się instrukcja',
      body: md`
        Drugi typowy rodzaj pytań: *„ile razy zostanie wykonana instrukcja …”* albo *„ile operacji dodawania wykona algorytm”*. Liczysz obroty pętli, w której ta instrukcja stoi.

        **Pętla \`dla\`:** \`dla i = a, a+1, …, b\` wykonuje się \`b − a + 1\` razy (oba końce włącznie!).

        **Pętle zagnieżdżone:** sumujesz obroty wewnętrznej pętli dla każdego obrotu zewnętrznej:
        ~~~pseudo
        dla i = 1, 2, …, n wykonuj
            dla j = i, i + 1, …, n wykonuj
                x ← x + 1
        ~~~
        Dla \`i = 1\` wewnętrzna pętla robi \`n\` obrotów, dla \`i = 2\` – \`n − 1\`, …, dla \`i = n\` – jeden. Razem \`n + (n − 1) + … + 1 = n(n + 1) / 2\`. Dla \`n = 5\` to 15.

        **Pętla, w której zmienna rośnie geometrycznie** (np. \`j ← j · 2\`) wykonuje się tyle razy, ile razy trzeba podwoić 1, żeby przekroczyć granicę – około \`log₂\` granicy. Dla \`j\` = 1, 2, 4, 8, … ≤ 100 to 7 obrotów (1, 2, 4, 8, 16, 32, 64).

        > **Wskazówka:** Jeśli wzór nie przychodzi do głowy, przepisz algorytm na program, dodaj licznik przy tej instrukcji i wypisz go. Na maturze to w pełni dozwolone – liczy się poprawna odpowiedź.

        ~~~python run
        def ile(n):
            licznik = 0
            for i in range(1, n + 1):
                for j in range(i, n + 1):
                    licznik += 1
            return licznik

        print([ile(n) for n in range(1, 8)])
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int ile(int n) {
            int licznik = 0;
            for (int i = 1; i <= n; i++)
                for (int j = i; j <= n; j++)
                    licznik++;
            return licznik;
        }

        int main() {
            for (int n = 1; n < 8; n++) cout << ile(n) << " ";
            cout << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static int ile(int n) {
                int licznik = 0;
                for (int i = 1; i <= n; i++)
                    for (int j = i; j <= n; j++)
                        licznik++;
                return licznik;
            }

            public static void main(String[] args) {
                StringBuilder sb = new StringBuilder();
                for (int n = 1; n < 8; n++) sb.append(ile(n)).append(" ");
                System.out.println(sb);
            }
        }
        ~~~

        Wynik 1, 3, 6, 10, 15, 21, 28 to właśnie \`n(n + 1)/2\` – program potwierdza wzór.
      `,
    },
    {
      title: 'Od pseudokodu do programu',
      body: md`
        Przepisując pseudokod na program, uważaj na trzy rzeczy:

        1. **Tablice od 1.** W pseudokodzie \`T[1..n]\`, w programie [[python: lista ma]][[cpp java: tablica ma]] indeksy od 0. Najprościej przesunąć wszystko o jeden (\`T[i]\` → \`t[i - 1]\`) albo dodać na początku listy nieużywany element, żeby indeksy się zgadzały.
        2. **Zakres pętli \`dla\`.** \`dla i = 1, 2, …, n\` to [[python: \`range(1, n + 1)\` – z **plusem jeden**, bo koniec \`range\` nie wchodzi.]][[cpp java: \`for (int i = 1; i <= n; i++)\` – z **równością**.]]
        3. **\`div\` i \`mod\`.** [[python: \`div\` to \`//\`, a nie \`/\` – zwykłe dzielenie dałoby liczbę z przecinkiem. Dla liczb ujemnych \`//\` zaokrągla w dół, ale w pseudokodzie z arkuszy dane są zwykle dodatnie.]][[cpp java: \`/\` na liczbach całkowitych to \`div\`, ale tylko dla nieujemnych liczb wynik jest taki sam jak w pseudokodzie z arkuszy (tam dane są zwykle dodatnie).]]

        Przykład – algorytm liczący pary \`(i, j)\`, \`i < j\`, w których \`T[i] > T[j]\` (tzw. **inwersje**):

        ~~~pseudo
        w ← 0
        dla i = 1, 2, …, n − 1 wykonuj
            dla j = i + 1, …, n wykonuj
                jeżeli T[i] > T[j] to
                    w ← w + 1
        ~~~

        ~~~python run
        t = [4, 1, 3, 2, 5]
        n = len(t)
        w = 0
        for i in range(n - 1):          # i = 0 .. n-2  (w pseudokodzie 1 .. n-1)
            for j in range(i + 1, n):   # j = i+1 .. n-1 (w pseudokodzie i+1 .. n)
                if t[i] > t[j]:
                    w += 1
        print(w)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int t[] = {4, 1, 3, 2, 5};
            int n = 5, w = 0;
            for (int i = 0; i < n - 1; i++)
                for (int j = i + 1; j < n; j++)
                    if (t[i] > t[j]) w++;
            cout << w << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int[] t = {4, 1, 3, 2, 5};
                int n = t.length, w = 0;
                for (int i = 0; i < n - 1; i++)
                    for (int j = i + 1; j < n; j++)
                        if (t[i] > t[j]) w++;
                System.out.println(w);
            }
        }
        ~~~

        Pary z inwersją: (4,1), (4,3), (4,2), (3,2) – razem 4.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`
        Jaka będzie wartość \`w\` po wykonaniu algorytmu dla \`n = 11\`?
        ~~~pseudo
        w ← 0
        p ← 1
        dopóki n > 0 wykonuj
            w ← w + (n mod 2) · p
            p ← p · 10
            n ← n div 2
        ~~~
      `,
      answer: '1011',
      explain: md`
        | obrót | n mod 2 | w | p | n |
        |---|---|---|---|---|
        | 1 | 1 | 1 | 10 | 5 |
        | 2 | 1 | 11 | 100 | 2 |
        | 3 | 0 | 11 | 1000 | 1 |
        | 4 | 1 | 1011 | 10000 | 0 |

        Wynik 1011 to zapis binarny liczby 11 „udający” liczbę dziesiętną.
      `,
    },
    {
      type: 'choice',
      q: md`Co oblicza algorytm z poprzedniego pytania dla dowolnej dodatniej liczby \`n\`?`,
      options: [
        'liczbę dziesiętną, której cyfry są cyframi zapisu binarnego n',
        'liczbę jedynek w zapisie binarnym n',
        'n podzielone przez 2',
        'odwrócony zapis dziesiętny n',
      ],
      answer: 0,
      explain: md`Kolejne reszty \`n mod 2\` to bity od najmniej znaczącego, a \`p\` = 1, 10, 100… ustawia każdy bit na kolejnym miejscu dziesiętnym. Np. dla 6 wynik to 110.`,
    },
    {
      type: 'input',
      q: md`
        Ile razy zostanie wykonana instrukcja \`x ← x + 1\` dla \`n = 4\`?
        ~~~pseudo
        dla i = 1, 2, …, n wykonuj
            j ← 1
            dopóki j ≤ i wykonuj
                x ← x + 1
                j ← j · 2
        ~~~
      `,
      answer: '8',
      explain: md`Dla każdego \`i\` liczymy wartości \`j\` = 1, 2, 4, … nie większe od \`i\`: \`i = 1\`: 1 (jeden raz), \`i = 2\`: 1, 2 (dwa), \`i = 3\`: 1, 2 (dwa), \`i = 4\`: 1, 2, 4 (trzy). Razem 1 + 2 + 2 + 3 = 8.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań o pseudokodzie z arkuszy maturalnych.`,
      items: [
        { text: 'Pętla `dla i = 1, 2, …, n` wykonuje się n razy.', answer: true },
        { text: 'W pseudokodzie `x = 5` oznacza przypisanie wartości 5 do x.', answer: false },
        { text: 'Tablica `T[1..n]` ma pierwszy element `T[1]`.', answer: true },
        { text: 'Warunek pętli `dopóki` jest sprawdzany po każdym obrocie, więc pętla wykona się co najmniej raz.', answer: false },
      ],
      explain: md`
        - Tak – od 1 do n włącznie.
        - Nie – przypisanie to \`←\`, a \`=\` to porównanie.
        - Tak – w pseudokodzie tablice numeruje się zwykle od 1.
        - Nie – \`dopóki\` sprawdza warunek **przed** obrotem i może nie wykonać się wcale. (Pętla „powtarzaj … aż” sprawdza warunek po obrocie.)
      `,
    },
    {
      type: 'code',
      q: md`
        Przepisz na program algorytm z pierwszego kroku lekcji: wczytaj nieujemną liczbę całkowitą \`n\` (≤ 10¹⁸) i wypisz w jednym wierszu **sumę nieparzystych cyfr** \`n\` i **liczbę nieparzystych cyfr**, oddzielone spacją.

        ~~~pseudo
        s ← 0
        k ← 0
        dopóki n > 0 wykonuj
            c ← n mod 10
            jeżeli c mod 2 = 1 to
                s ← s + c
                k ← k + 1
            n ← n div 10
        ~~~
      `,
      tests: [
        { input: '37254\n', output: '15 3\n' },
        { input: '0\n', output: '0 0\n' },
        { input: '13579\n', output: '25 5\n' },
        { input: '2468\n', output: '0 0\n' },
        { input: '1000000001\n', output: '2 2\n' },
        { input: '999999999999999999\n', output: '162 18\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          s = k = 0
          while n > 0:
              c = n % 10
              if c % 2 == 1:
                  s += c
                  k += 1
              n //= 10
          print(s, k)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              int s = 0, k = 0;
              while (n > 0) {
                  int c = n % 10;
                  if (c % 2 == 1) {
                      s += c;
                      k++;
                  }
                  n /= 10;
              }
              cout << s << " " << k << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  int s = 0, k = 0;
                  while (n > 0) {
                      int c = (int) (n % 10);
                      if (c % 2 == 1) {
                          s += c;
                          k++;
                      }
                      n /= 10;
                  }
                  System.out.println(s + " " + k);
              }
          }
        `,
      },
      explain: md`Instrukcja po instrukcji: \`←\` to \`=\`, \`mod\` to \`%\`, \`div\` to [[python: \`//\`]][[cpp java: \`/\`]], \`dopóki\` to \`while\`.[[cpp java:  Liczba do 10¹⁸ wymaga typu [[cpp: \`long long\`]][[java: \`long\`]].]]`,

    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu jest \`n\` (1 ≤ \`n\` ≤ 1000), w drugim elementy tablicy \`T[1..n]\` (liczby całkowite). Przepisz na program algorytm liczący inwersje (z ostatniego kroku lekcji) i wypisz ich liczbę.
      `,
      tests: [
        { input: '5\n4 1 3 2 5\n', output: '4\n' },
        { input: '3\n3 1 2\n', output: '2\n' },
        { input: '3\n1 2 3\n', output: '0\n' },
        { input: '5\n5 4 3 2 1\n', output: '10\n' },
        { input: '3\n2 2 2\n', output: '0\n' },
        { input: '1\n7\n', output: '0\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          t = list(map(int, input().split()))
          w = 0
          for i in range(n - 1):
              for j in range(i + 1, n):
                  if t[i] > t[j]:
                      w += 1
          print(w)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              vector<long long> t(n);
              for (auto& x : t) cin >> x;
              long long w = 0;
              for (int i = 0; i < n - 1; i++)
                  for (int j = i + 1; j < n; j++)
                      if (t[i] > t[j]) w++;
              cout << w << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  long[] t = new long[n];
                  for (int i = 0; i < n; i++) t[i] = sc.nextLong();
                  long w = 0;
                  for (int i = 0; i < n - 1; i++)
                      for (int j = i + 1; j < n; j++)
                          if (t[i] > t[j]) w++;
                  System.out.println(w);
              }
          }
        `,
      },
      explain: md`Pętle z pseudokodu \`i = 1..n−1\` i \`j = i+1..n\` w programie to \`i = 0..n−2\` i \`j = i+1..n−1\` (przesunięcie o jeden). Równe elementy (\`2 2 2\`) nie tworzą inwersji, bo warunek to ostre \`>\`.`,
    },
  ],
  practice: ['2024-maj/2.1', '2024-maj/2.2', '2024-maj/1.1', '2026-czerwiec/1.1', '2024-czerwiec/4.1', '2023-maj/1.1'],
};
