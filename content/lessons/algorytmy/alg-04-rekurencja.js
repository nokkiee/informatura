import { md, code } from '../lib.js';

export default {
  title: 'Rekurencja',
  summary: 'Funkcja, która wywołuje samą siebie: warunek stopu, śledzenie i liczenie wywołań, drzewo wywołań, szybkie potęgowanie, rekurencja a pętla.',
  minutes: 35,
  intro: md`
    - czym jest funkcja rekurencyjna i dlaczego musi mieć warunek stopu,
    - jak śledzić wywołania i liczyć ich liczbę – typowe zadanie maturalne,
    - jak wygląda drzewo wywołań i kiedy rekurencja staje się bardzo wolna,
    - szybkie potęgowanie i rekurencja z \`div 2\`,
    - kiedy zamienić rekurencję na pętlę albo zapamiętywać wyniki.
  `,
  steps: [
    {
      title: 'Funkcja wywołująca samą siebie',
      body: md`
        Funkcja **rekurencyjna** rozwiązuje problem, odwołując się do **tego samego problemu dla mniejszych danych**. Klasyczny przykład – silnia: \`n! = n · (n − 1)!\`, a \`0! = 1\`.

        ~~~pseudo
        silnia(n):
            jeżeli n = 0
                wynikiem jest 1
            w przeciwnym razie
                wynikiem jest n · silnia(n − 1)
        ~~~

        Dwie części są obowiązkowe:
        1. **Warunek stopu** (przypadek bazowy) – dane, dla których wynik znamy od razu (\`n = 0\`).
        2. **Krok rekurencyjny** – wywołanie dla danych **bliższych** warunkowi stopu (\`n − 1\`).

        Bez warunku stopu (albo gdy dane się do niego nie zbliżają) funkcja wywołuje się bez końca, aż programowi zabraknie pamięci na stos wywołań.

        ~~~python run
        def silnia(n):
            if n == 0:
                return 1
            return n * silnia(n - 1)

        print(silnia(5), silnia(20))
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        long long silnia(int n) {
            if (n == 0) return 1;
            return n * silnia(n - 1);
        }

        int main() {
            cout << silnia(5) << " " << silnia(20) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static long silnia(int n) {
                if (n == 0) return 1;
                return n * silnia(n - 1);
            }

            public static void main(String[] args) {
                System.out.println(silnia(5) + " " + silnia(20));
            }
        }
        ~~~

        :::python
        > **Uwaga:** Python domyślnie pozwala na około 1000 zagnieżdżonych wywołań – \`silnia(5000)\` skończy się błędem *RecursionError*. Głębokość można zwiększyć (\`sys.setrecursionlimit\`), ale przy głębokiej rekurencji zwykle lepiej napisać pętlę.
        :::
        :::cpp java
        > **Uwaga:** Każde wywołanie zajmuje miejsce na **stosie**, a stos jest ograniczony. Rekurencja głęboka na setki tysięcy wywołań może go przepełnić – program zakończy się [[cpp: błędem, zwykle bez żadnego komunikatu]][[java: błędem \`StackOverflowError\`]]. Przy bardzo głębokiej rekurencji lepiej napisać pętlę.
        :::
      `,
    },
    {
      title: 'Śledzenie i liczenie wywołań',
      body: md`
        W zadaniach maturalnych dostajesz funkcję zdefiniowaną rekurencyjnie i pytania: *„podaj wynik dla …”*, *„ile razy zostanie wywołana funkcja”*. Rozpisujesz wywołania jedno pod drugim aż do warunku stopu, a potem „wracasz” z wynikami.

        Przykład – funkcja:
        ~~~pseudo
        T(n):
            jeżeli n = 1
                wynikiem jest 1
            w przeciwnym razie
                wynikiem jest T(n div 2) + n
        ~~~

        Dla \`T(10)\`:

        | wywołanie | czeka na | wynik |
        |---|---|---|
        | T(10) | T(5) + 10 | 8 + 10 = **18** |
        | T(5) | T(2) + 5 | 3 + 5 = 8 |
        | T(2) | T(1) + 2 | 1 + 2 = 3 |
        | T(1) | – (warunek stopu) | 1 |

        Wywołań jest **4** (licząc pierwsze, \`T(10)\`). Liczba wywołań to tutaj długość ciągu 10 → 5 → 2 → 1, czyli liczba cyfr zapisu binarnego liczby 10 (\`1010₂\` – 4 cyfry). Takie obserwacje pozwalają odpowiedzieć na pytania o ogromne argumenty, np. \`T(10¹⁸)\` ma 60 wywołań, bo 10¹⁸ ma 60 cyfr binarnych.

        > **Wskazówka:** Czytaj uważnie, czy pytanie liczy **wszystkie** wywołania, czy tylko **rekurencyjne** (bez pierwszego) – różnią się o 1. W treściach CKE jest to zawsze dopowiedziane, np. „łącznie z wywołaniem F(x)”.

        Komputer jest najlepszym sprawdzianem: dodaj licznik wywołań.

        ~~~python run
        licznik = 0

        def T(n):
            global licznik
            licznik += 1
            if n == 1:
                return 1
            return T(n // 2) + n

        for n in [10, 7, 1000]:
            licznik = 0
            print(n, T(n), licznik)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int licznik = 0;

        long long T(long long n) {
            licznik++;
            if (n == 1) return 1;
            return T(n / 2) + n;
        }

        int main() {
            for (long long n : {10LL, 7LL, 1000LL}) {
                licznik = 0;
                long long w = T(n);
                cout << n << " " << w << " " << licznik << endl;
            }
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static int licznik = 0;

            static long T(long n) {
                licznik++;
                if (n == 1) return 1;
                return T(n / 2) + n;
            }

            public static void main(String[] args) {
                for (long n : new long[]{10, 7, 1000}) {
                    licznik = 0;
                    long w = T(n);
                    System.out.println(n + " " + w + " " + licznik);
                }
            }
        }
        ~~~
      `,
    },
    {
      title: 'Drzewo wywołań',
      body: md`
        Gdy funkcja wywołuje się **więcej niż raz**, wywołania tworzą drzewo. Ciąg Fibonacciego: \`F(0) = 0\`, \`F(1) = 1\`, \`F(n) = F(n − 1) + F(n − 2)\`.

        ~~~text
                        F(4)
                   /          \
                F(3)          F(2)
               /    \        /    \
            F(2)    F(1)   F(1)   F(0)
           /    \
        F(1)    F(0)
        ~~~

        Dla \`F(4)\` to już 9 wywołań, dla \`F(5)\` – 15, dla \`F(30)\` – ponad 2,6 miliona, a dla \`F(50)\` – ponad 40 miliardów. Ta sama wartość (np. \`F(2)\`) liczy się wiele razy. Liczbę wywołań \`W(n)\` opisuje znowu rekurencja: \`W(n) = 1 + W(n − 1) + W(n − 2)\`, \`W(0) = W(1) = 1\`.

        Rozwiązania:
        - **pętla** liczy kolejne wyrazy od dołu, każdy raz,
        - **zapamiętywanie** (memoizacja): przed liczeniem sprawdź, czy wynik dla tego argumentu już jest w słowniku / tablicy.

        ~~~python run
        def fib(n):
            a, b = 0, 1
            for _ in range(n):
                a, b = b, a + b
            return a

        pamiec = {0: 0, 1: 1}
        def fib_rek(n):
            if n not in pamiec:
                pamiec[n] = fib_rek(n - 1) + fib_rek(n - 2)
            return pamiec[n]

        print(fib(50), fib_rek(50))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <map>
        using namespace std;

        long long fib(int n) {
            long long a = 0, b = 1;
            for (int i = 0; i < n; i++) {
                long long c = a + b;
                a = b;
                b = c;
            }
            return a;
        }

        map<int, long long> pamiec = {{0, 0}, {1, 1}};
        long long fib_rek(int n) {
            if (!pamiec.count(n)) pamiec[n] = fib_rek(n - 1) + fib_rek(n - 2);
            return pamiec[n];
        }

        int main() {
            cout << fib(50) << " " << fib_rek(50) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            static long fib(int n) {
                long a = 0, b = 1;
                for (int i = 0; i < n; i++) {
                    long c = a + b;
                    a = b;
                    b = c;
                }
                return a;
            }

            static Map<Integer, Long> pamiec = new HashMap<>(Map.of(0, 0L, 1, 1L));
            static long fibRek(int n) {
                if (!pamiec.containsKey(n)) pamiec.put(n, fibRek(n - 1) + fibRek(n - 2));
                return pamiec.get(n);
            }

            public static void main(String[] args) {
                System.out.println(fib(50) + " " + fibRek(50));
            }
        }
        ~~~
      `,
    },
    {
      title: 'Szybkie potęgowanie',
      body: md`
        Rekurencja z dzieleniem argumentu przez 2 bywa bardzo szybka. **Szybkie potęgowanie** korzysta z tego, że \`aⁿ = (a^(n/2))²\` dla parzystego \`n\`:

        ~~~pseudo
        pot(a, n):
            jeżeli n = 0
                wynikiem jest 1
            jeżeli n mod 2 = 0
                h ← pot(a, n div 2)
                wynikiem jest h · h
            w przeciwnym razie
                wynikiem jest a · pot(a, n − 1)
        ~~~

        \`pot(2, 10)\` wywołuje kolejno \`pot(2, 5)\`, \`pot(2, 4)\`, \`pot(2, 2)\`, \`pot(2, 1)\`, \`pot(2, 0)\` – razem **6** wywołań zamiast 10 mnożeń. Dla \`n\` rzędu miliarda to około 60 wywołań zamiast miliarda mnożeń.

        Zwróć uwagę na \`h ← pot(a, n div 2)\` i \`h · h\`: gdybyśmy napisali \`pot(a, n div 2) · pot(a, n div 2)\`, funkcja wywoływałaby się **dwa razy** – i cała korzyść by przepadła (powstałoby drzewo jak przy Fibonaccim).

        > **Na maturze:** Zadania z rekurencją (np. „Funkcja rekurencyjna” w czerwcu 2024 i 2025, „Rekurencja” w maju 2026) pytają o wynik i liczbę wywołań także dla bardzo dużych argumentów – wtedy trzeba zauważyć zależność (np. liczba wywołań = liczba cyfr binarnych), a nie liczyć „na piechotę”.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`
        Funkcja \`f\` jest zdefiniowana tak: \`f(0) = 0\`, a dla \`n > 0\`: \`f(n) = n + f(n − 1)\`. Ile wynosi \`f(5)\`?
      `,
      answer: '15',
      explain: md`f(5) = 5 + f(4) = 5 + 4 + f(3) = … = 5 + 4 + 3 + 2 + 1 + 0 = 15. To suma liczb od 1 do n.`,
    },
    {
      type: 'input',
      q: md`Ile **łącznie** wywołań funkcji (licząc pierwsze) wykona rekurencyjne obliczenie \`F(5)\` ciągu Fibonacciego według definicji \`F(0) = 0\`, \`F(1) = 1\`, \`F(n) = F(n − 1) + F(n − 2)\`?`,
      answer: '15',
      explain: md`W(n) = 1 + W(n − 1) + W(n − 2), W(0) = W(1) = 1: W(2) = 3, W(3) = 5, W(4) = 9, W(5) = 15.`,
    },
    {
      type: 'input',
      q: md`Ile łącznie wywołań funkcji \`pot\` (szybkie potęgowanie z lekcji, licząc pierwsze) wykona obliczenie \`pot(3, 13)\`?`,
      answer: '7',
      explain: md`Argumenty \`n\` kolejnych wywołań: 13 (nieparzyste → 12), 12 (→ 6), 6 (→ 3), 3 (→ 2), 2 (→ 1), 1 (→ 0), 0 – razem 7.`,
    },
    {
      type: 'choice',
      q: md`
        Co oblicza funkcja \`g\` dla nieujemnej liczby całkowitej \`n\`?
        ~~~pseudo
        g(n):
            jeżeli n = 0
                wynikiem jest 0
            w przeciwnym razie
                wynikiem jest (n mod 10) + g(n div 10)
        ~~~
      `,
      options: ['sumę cyfr n', 'liczbę cyfr n', 'n odwrócone', 'ostatnią cyfrę n'],
      answer: 0,
      explain: md`Każde wywołanie dodaje ostatnią cyfrę (\`n mod 10\`) do wyniku dla liczby bez tej cyfry (\`n div 10\`). Np. g(472) = 2 + g(47) = 2 + 7 + g(4) = 2 + 7 + 4 + g(0) = 13.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Funkcja rekurencyjna bez warunku stopu wywołuje się bez końca (aż do błędu przepełnienia stosu).', answer: true },
        { text: 'Rekurencyjne obliczenie F(50) ciągu Fibonacciego wprost z definicji trwa ułamek sekundy.', answer: false },
        { text: 'Każdą funkcję rekurencyjną można zapisać bez rekurencji (np. z pętlą).', answer: true },
        { text: 'W szybkim potęgowaniu zapis `pot(a, n div 2) · pot(a, n div 2)` jest tak samo szybki jak `h ← pot(a, n div 2); h · h`.', answer: false },
      ],
      explain: md`
        - Tak.
        - Nie – to ponad 40 miliardów wywołań.
        - Tak – w najgorszym razie trzeba samemu prowadzić stos, ale zwykle wystarcza prosta pętla.
        - Nie – dwa wywołania zamiast jednego tworzą drzewo i liczba wywołań rośnie do około \`2n\`.
      `,
    },
    {
      type: 'code',
      q: md`
        Funkcja \`T\` jest zdefiniowana tak: \`T(1) = 1\`, a dla \`n > 1\`: \`T(n) = T(n div 2) + n\`.

        Wczytaj \`n\` (1 ≤ \`n\` ≤ 10¹⁸) i wypisz w jednym wierszu wartość \`T(n)\` oraz łączną liczbę wywołań funkcji \`T\` (licząc pierwsze), oddzielone spacją.
      `,
      tests: [
        { input: '10\n', output: '18 4\n' },
        { input: '1\n', output: '1 1\n' },
        { input: '2\n', output: '3 2\n' },
        { input: '7\n', output: '11 3\n' },
        { input: '1000\n', output: '1994 10\n' },
        { input: '1000000000000000000\n', output: '1999999999999999976 60\n' },
      ],
      solution: {
        python: code`
          licznik = 0

          def T(n):
              global licznik
              licznik += 1
              if n == 1:
                  return 1
              return T(n // 2) + n

          n = int(input())
          w = T(n)
          print(w, licznik)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int licznik = 0;

          long long T(long long n) {
              licznik++;
              if (n == 1) return 1;
              return T(n / 2) + n;
          }

          int main() {
              long long n;
              cin >> n;
              long long w = T(n);
              cout << w << " " << licznik << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              static int licznik = 0;

              static long T(long n) {
                  licznik++;
                  if (n == 1) return 1;
                  return T(n / 2) + n;
              }

              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  long w = T(n);
                  System.out.println(w + " " + licznik);
              }
          }
        `,
      },
      explain: md`Funkcję przepisujemy wprost z definicji i dokładamy licznik zwiększany na początku każdego wywołania. [[cpp: Wynik trzeba policzyć **przed** wypisaniem licznika (\`long long w = T(n);\`) – w jednej instrukcji \`cout << T(n) << licznik\` kolejność obliczenia nie jest zagwarantowana w starszych standardach. ]][[java: Wynik trzeba policzyć **przed** wypisaniem licznika (\`long w = T(n);\`), żeby licznik był już pełny. ]][[python: Wynik trzeba policzyć **przed** wypisaniem licznika (\`w = T(n)\`), żeby licznik był już pełny. ]]Głębokość
 rekurencji to tylko ok. 60, więc nie ma ryzyka przepełnienia stosu.`,
    },
    {
      type: 'code',
      q: md`
        Na schody o \`n\` stopniach można wchodzić, stawiając krok o jeden albo o dwa stopnie. Na ile sposobów można wejść na górę? Np. dla \`n = 3\`: 1+1+1, 1+2, 2+1 – trzy sposoby.

        Wczytaj \`n\` (1 ≤ \`n\` ≤ 90) i wypisz liczbę sposobów. Wskazówka: ostatni krok był o 1 albo o 2 stopnie, więc \`S(n) = S(n − 1) + S(n − 2)\`. Uważaj na czas działania!
      `,
      tests: [
        { input: '1\n', output: '1\n' },
        { input: '2\n', output: '2\n' },
        { input: '3\n', output: '3\n' },
        { input: '10\n', output: '89\n' },
        { input: '50\n', output: '20365011074\n' },
        { input: '90\n', output: '4660046610375530309\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          a, b = 1, 1          # S(0), S(1)
          for _ in range(n - 1):
              a, b = b, a + b
          print(b)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              long long a = 1, b = 1;   // S(0), S(1)
              for (int i = 1; i < n; i++) {
                  long long c = a + b;
                  a = b;
                  b = c;
              }
              cout << b << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  long a = 1, b = 1;   // S(0), S(1)
                  for (int i = 1; i < n; i++) {
                      long c = a + b;
                      a = b;
                      b = c;
                  }
                  System.out.println(b);
              }
          }
        `,
      },
      explain: md`To ciąg Fibonacciego przesunięty o jeden (S(n) = F(n + 1)). Rekurencja wprost z definicji dla \`n = 90\` liczyłaby się latami – trzeba liczyć pętlą od dołu albo z zapamiętywaniem. Wynik dla 90 to prawie 4,7·10¹⁸[[cpp java:  – jeszcze mieści się w [[cpp: \`long long\`]][[java: \`long\`]]]].`,

    },
  ],
  practice: ['2026-maj/1.1', '2026-maj/1.3', '2025-czerwiec/1.2', '2025-maj/1.1', '2024-czerwiec/2.1', '2024-czerwiec/2.2', '2023-czerwiec/1.1', '2023-maj/1.3'],
};
