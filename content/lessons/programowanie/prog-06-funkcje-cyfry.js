import { md, code } from '../lib.js';

export default {
  title: 'Funkcje, cyfry liczby i systemy liczbowe',
  summary: 'Własne funkcje, rozkładanie liczby na cyfry, sprawdzanie pierwszości i zamiana systemów liczbowych w programie.',
  minutes: 35,
  intro: md`
    - jak pisać własne funkcje i po co dzielić program na części,
    - jak rozłożyć liczbę na cyfry (suma cyfr, odwracanie, usuwanie cyfr),
    - jak sprawdzić, czy liczba jest pierwsza, i policzyć NWD,
    - jak zamieniać liczby między systemami: gotowymi funkcjami i samodzielnie.
  `,
  steps: [
    {
      title: 'Funkcje',
      body: md`
        **Funkcja** to nazwany kawałek programu, który dostaje dane (**parametry**) i oddaje wynik (\`return\`). Gdy to samo trzeba policzyć dla każdej liczby z pliku, piszesz funkcję raz i wywołujesz ją w pętli. Program jest wtedy krótszy, a każdą funkcję możesz sprawdzić osobno na małym przykładzie.

        ~~~python run
        def suma_cyfr(n):
            s = 0
            while n > 0:
                s += n % 10
                n //= 10
            return s

        print(suma_cyfr(4728))
        for x in [19, 99, 1000]:
            print(x, suma_cyfr(x))
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int suma_cyfr(long long n) {
            int s = 0;
            while (n > 0) {
                s += n % 10;
                n /= 10;
            }
            return s;
        }

        int main() {
            cout << suma_cyfr(4728) << endl;
            for (int x : {19, 99, 1000})
                cout << x << " " << suma_cyfr(x) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static int sumaCyfr(long n) {
                int s = 0;
                while (n > 0) {
                    s += n % 10;
                    n /= 10;
                }
                return s;
            }

            public static void main(String[] args) {
                System.out.println(sumaCyfr(4728));
                for (int x : new int[]{19, 99, 1000})
                    System.out.println(x + " " + sumaCyfr(x));
            }
        }
        ~~~

        :::python
        - \`def nazwa(parametry):\` i wcięte ciało. Typów parametrów ani wyniku nie piszesz.
        - Funkcja musi być zdefiniowana (wyżej w pliku), zanim zostanie wywołana.
        - Funkcja bez \`return\` zwraca \`None\` („nic”).
        :::
        :::cpp
        - Przed nazwą piszesz typ wyniku (\`int\`, \`long long\`, \`bool\`, \`string\`…, a \`void\`, gdy funkcja nic nie zwraca), a przy każdym parametrze – jego typ.
        - Funkcja stoi **nad** \`main\` – kompilator musi ją znać, zanim zostanie wywołana.
        :::
        :::java
        - Funkcja to metoda \`static\` w tej samej klasie co \`main\`: \`static long sumaCyfr(long n) { … }\`.
        - Przed nazwą piszesz typ wyniku (\`int\`, \`long\`, \`boolean\`, \`String\`…, a \`void\`, gdy metoda nic nie zwraca), a przy każdym parametrze – jego typ. Kolejność metod w klasie nie ma znaczenia.
        :::

        > **Wskazówka:** Zmiana parametru \`n\` wewnątrz funkcji ([[python: \`n //= 10\`]][[cpp java: \`n /= 10\`]]) nie zmienia zmiennej, którą przekazano przy wywołaniu – funkcja dostaje kopię liczby.
      `,
    },
    {
      title: 'Cyfry liczby',
      body: md`
        Pętla „weź ostatnią cyfrę (\`n % 10\`), odetnij ją ([[python: \`n // 10\`]][[cpp java: \`n / 10\`]])” przechodzi po cyfrach **od końca**. Z niej zrobisz prawie wszystko:

        - **suma cyfr** – dodawaj kolejne \`n % 10\`,
        - **liczba cyfr** – licz obroty pętli (uwaga: dla \`n = 0\` pętla nie ruszy, a 0 ma jedną cyfrę),
        - **odwrócona liczba** – \`w = w * 10 + n % 10\` w każdym obrocie,
        - **usunięcie niektórych cyfr** – składaj nową liczbę tylko z wybranych cyfr; ponieważ cyfry przychodzą od końca, dopisujesz je z przodu z mnożnikiem 1, 10, 100…

        Ostatni schemat to dokładnie „nieparzysty skrót” z matury 2024: z liczby usuwa się cyfry parzyste.

        ~~~python run
        def odwroc(n):
            w = 0
            while n > 0:
                w = w * 10 + n % 10
                n //= 10
            return w

        def bez_parzystych(n):
            w, mnoznik = 0, 1
            while n > 0:
                c = n % 10
                if c % 2 == 1:
                    w += c * mnoznik
                    mnoznik *= 10
                n //= 10
            return w

        print(odwroc(12345), bez_parzystych(1234567))
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        long long odwroc(long long n) {
            long long w = 0;
            while (n > 0) {
                w = w * 10 + n % 10;
                n /= 10;
            }
            return w;
        }

        long long bez_parzystych(long long n) {
            long long w = 0, mnoznik = 1;
            while (n > 0) {
                int c = n % 10;
                if (c % 2 == 1) {
                    w += c * mnoznik;
                    mnoznik *= 10;
                }
                n /= 10;
            }
            return w;
        }

        int main() {
            cout << odwroc(12345) << " " << bez_parzystych(1234567) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static long odwroc(long n) {
                long w = 0;
                while (n > 0) {
                    w = w * 10 + n % 10;
                    n /= 10;
                }
                return w;
            }

            static long bezParzystych(long n) {
                long w = 0, mnoznik = 1;
                while (n > 0) {
                    long c = n % 10;
                    if (c % 2 == 1) {
                        w += c * mnoznik;
                        mnoznik *= 10;
                    }
                    n /= 10;
                }
                return w;
            }

            public static void main(String[] args) {
                System.out.println(odwroc(12345) + " " + bezParzystych(1234567));
            }
        }
        ~~~

        > **Wskazówka:** W zadaniach „napisz program” możesz też zamienić liczbę na napis: [[python: \`str(n)\`]][[cpp: \`to_string(n)\`]][[java: \`String.valueOf(n)\`]] i pracować na znakach. W zadaniach „zapisz algorytm” z zakazem funkcji wbudowanych zwykle trzeba umieć wersję z \`div\` i \`mod\`.
      `,
    },
    {
      title: 'Liczby pierwsze i NWD',
      body: md`
        Liczba **pierwsza** ma dokładnie dwa dzielniki: 1 i siebie (2, 3, 5, 7, 11…; 1 nie jest pierwsza). Żeby to sprawdzić, wystarczy szukać dzielnika od 2 do \`√n\`: jeśli \`n = a · b\` i \`a ≤ b\`, to \`a ≤ √n\`. Warunek \`d * d <= n\` zamiast \`d <= sqrt(n)\` omija liczby z przecinkiem.

        **NWD** (największy wspólny dzielnik) liczy się algorytmem Euklidesa. [[python: W programach możesz użyć gotowej funkcji \`math.gcd(a, b)\` (po \`import math\`).]][[cpp: W programach możesz użyć gotowej funkcji \`gcd(a, b)\` z \`<numeric>\`.]][[java: Gotowej funkcji dla liczb typu \`long\` nie ma, więc trzeba ją napisać – to trzy wiersze, jak niżej.]] Skąd się bierze ten algorytm, wyjaśnia lekcja o liczbach w dziale Algorytmika.

        ~~~python run
        import math

        def czy_pierwsza(n):
            if n < 2:
                return False
            d = 2
            while d * d <= n:
                if n % d == 0:
                    return False
                d += 1
            return True

        print([x for x in range(1, 30) if czy_pierwsza(x)])
        print(math.gcd(84, 36))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <numeric>
        using namespace std;

        bool czy_pierwsza(long long n) {
            if (n < 2) return false;
            for (long long d = 2; d * d <= n; d++)
                if (n % d == 0) return false;
            return true;
        }

        int main() {
            for (int x = 1; x < 30; x++)
                if (czy_pierwsza(x)) cout << x << " ";
            cout << endl << gcd(84, 36) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static boolean czyPierwsza(long n) {
                if (n < 2) return false;
                for (long d = 2; d * d <= n; d++)
                    if (n % d == 0) return false;
                return true;
            }

            static long nwd(long a, long b) {
                while (b != 0) {
                    long r = a % b;
                    a = b;
                    b = r;
                }
                return a;
            }

            public static void main(String[] args) {
                StringBuilder sb = new StringBuilder();
                for (int x = 1; x < 30; x++)
                    if (czyPierwsza(x)) sb.append(x).append(" ");
                System.out.println(sb);
                System.out.println(nwd(84, 36));
            }
        }
        ~~~

        Instrukcja \`return\` wewnątrz pętli od razu kończy funkcję – dlatego po znalezieniu dzielnika nie trzeba sprawdzać dalej.
      `,
    },
    {
      title: 'Systemy liczbowe w programie',
      body: md`
        W plikach maturalnych liczby bywają zapisane **binarnie** albo w innym systemie (np. jako ciąg symboli). Do zamiany są gotowe funkcje:

        | | Python | C++ | Java |
        |---|---|---|---|
        | napis w systemie b → liczba | \`int("1101", 2)\` | \`stoll("1101", nullptr, 2)\` | \`Long.parseLong("1101", 2)\` |
        | liczba → napis binarny | \`bin(13)[2:]\` | (własna funkcja) | \`Long.toBinaryString(13)\` |
        | liczba → napis w systemie b | (własna funkcja) | (własna funkcja) | \`Long.toString(13, b)\` |

        Własna funkcja „liczba → system o podstawie \`b\`” to znów pętla po cyfrach: reszty z dzielenia przez \`b\` są cyframi **od końca**, więc dopisujemy je z przodu napisu.

        ~~~python run
        def na_system(n, b):
            if n == 0:
                return "0"
            s = ""
            while n > 0:
                s = str(n % b) + s
                n //= b
            return s

        print(na_system(13, 2), na_system(100, 3), int("10201", 3))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        string na_system(long long n, int b) {
            if (n == 0) return "0";
            string s = "";
            while (n > 0) {
                s = char('0' + n % b) + s;
                n /= b;
            }
            return s;
        }

        int main() {
            cout << na_system(13, 2) << " " << na_system(100, 3) << " " << stoll("10201", nullptr, 3) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static String naSystem(long n, int b) {
                if (n == 0) return "0";
                StringBuilder s = new StringBuilder();
                while (n > 0) {
                    s.insert(0, n % b);
                    n /= b;
                }
                return s.toString();
            }

            public static void main(String[] args) {
                System.out.println(naSystem(13, 2) + " " + naSystem(100, 3) + " " + Long.parseLong("10201", 3));
            }
        }
        ~~~

        > **Uwaga:** Liczba binarna z 20 cyframi (jak w zadaniach maturalnych) ma wartość ponad milion[[python: , a 64-cyfrowa – ponad 10¹⁹; w Pythonie to żaden problem]][[cpp java:  – mieści się w \`int\`, ale 40-cyfrowa już nie]]. Przy porównywaniu liczb zapisanych binarnie jako napisy: dłuższy napis (bez zer wiodących) to większa liczba, a przy równej długości wystarczy porównać napisy alfabetycznie.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`
        Co zwróci ta funkcja dla \`n = 4728\`?
        ~~~python
        def f(n):
            s = 0
            while n > 0:
                s += n % 10
                n //= 10
            return s
        ~~~
        ~~~cpp
        int f(int n) {
            int s = 0;
            while (n > 0) {
                s += n % 10;
                n /= 10;
            }
            return s;
        }
        ~~~
        ~~~java
        static int f(int n) {
            int s = 0;
            while (n > 0) {
                s += n % 10;
                n /= 10;
            }
            return s;
        }
        ~~~
      `,
      answer: '21',
      explain: md`To suma cyfr: 8 + 2 + 7 + 4 = 21 (cyfry przychodzą od końca, ale przy dodawaniu kolejność nie ma znaczenia).`,
    },
    {
      type: 'input',
      q: md`[[python: Co wypisze \`print(bin(13)[2:])\`?]][[cpp: Co zwróci własna funkcja „liczba → napis w systemie o podstawie \`b\`” z tej lekcji dla \`n = 13\` i \`b = 2\`?]][[java: Co zwróci \`Long.toBinaryString(13)\`?]]`,
      answer: '1101',
      exact: true,
      explain: md`13 = 8 + 4 + 1 = 1·2³ + 1·2² + 0·2¹ + 1·2⁰, więc binarnie 1101.[[python:  \`bin(13)\` daje \`"0b1101"\`, a \`[2:]\` odcina przedrostek \`0b\`.]]`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '[[python: `int("101", 2)`]][[cpp: `stoll("101", nullptr, 2)`]][[java: `Long.parseLong("101", 2)`]] daje 5.', answer: true },
        { text: '[[python: Funkcja bez instrukcji `return` zwraca `None`.]][[cpp: Funkcja, która nic nie zwraca, ma typ wyniku `void`.]][[java: Metoda, która nic nie zwraca, ma typ wyniku `void`.]]', answer: true },
        { text: 'Żeby sprawdzić, czy n jest pierwsza, trzeba sprawdzić wszystkie dzielniki od 2 do n − 1.', answer: false },
        { text: 'Liczba 1 jest liczbą pierwszą.', answer: false },
      ],
      explain: md`
        - Tak: 1·4 + 0·2 + 1·1 = 5.
        - Tak[[python:  – a próba liczenia na \`None\` kończy się błędem, więc pilnuj \`return\`]].
        - Nie – wystarczy do \`√n\`: każdy dzielnik większy od \`√n\` ma „parę” mniejszą od \`√n\`.
        - Nie – liczba pierwsza ma **dokładnie dwa** dzielniki, a 1 ma jeden.
      `,
    },
    {
      type: 'choice',
      q: md`Która funkcja zwraca liczbę \`n\` z odwróconą kolejnością cyfr (np. 1230 → 321)?`,
      options: [
        '`w = 0; dopóki n > 0: w = w * 10 + n mod 10; n = n div 10`',
        '`w = 0; dopóki n > 0: w = w + n mod 10; n = n div 10`',
        '`w = 0; dopóki n > 0: w = w * 10 + n div 10; n = n mod 10`',
        '`w = n mod 10 * 10 + n div 10`',
      ],
      answer: 0,
      explain: md`W każdym obrocie bierzemy ostatnią cyfrę \`n\` (\`n mod 10\`), „przesuwamy” dotychczasowy wynik o jedno miejsce w lewo (\`w * 10\`) i dopisujemy ją na końcu. Dla 1230: 0 → 3 → 32 → 321. Druga funkcja liczy sumę cyfr.`,
    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu jest \`n\` (1 ≤ \`n\` ≤ 1000), a w drugim \`n\` nieujemnych liczb całkowitych nie większych niż 1 000 000. Wypisz, **ile z nich jest pierwszych**. Napisz w tym celu funkcję sprawdzającą pierwszość.
      `,
      tests: [
        { input: '10\n2 3 4 5 6 7 8 9 10 11\n', output: '5\n' },
        { input: '1\n1\n', output: '0\n' },
        { input: '6\n0 1 4 6 8 9\n', output: '0\n' },
        { input: '4\n999983 1000000 2 97\n', output: '3\n' },
        { input: '3\n49 121 169\n', output: '0\n' },
      ],
      solution: {
        python: code`
          def czy_pierwsza(n):
              if n < 2:
                  return False
              d = 2
              while d * d <= n:
                  if n % d == 0:
                      return False
                  d += 1
              return True

          n = int(input())
          liczby = map(int, input().split())
          print(sum(1 for x in liczby if czy_pierwsza(x)))
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          bool czy_pierwsza(long long n) {
              if (n < 2) return false;
              for (long long d = 2; d * d <= n; d++)
                  if (n % d == 0) return false;
              return true;
          }

          int main() {
              int n, ile = 0;
              cin >> n;
              for (int i = 0; i < n; i++) {
                  long long x;
                  cin >> x;
                  if (czy_pierwsza(x)) ile++;
              }
              cout << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              static boolean czyPierwsza(long n) {
                  if (n < 2) return false;
                  for (long d = 2; d * d <= n; d++)
                      if (n % d == 0) return false;
                  return true;
              }

              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt(), ile = 0;
                  for (int i = 0; i < n; i++)
                      if (czyPierwsza(sc.nextLong())) ile++;
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Funkcja z lekcji, wywołana dla każdej liczby. Pułapki z testów: 0 i 1 nie są pierwsze, kwadraty liczb pierwszych (49, 121, 169) mają dzielnik równy dokładnie \`√n\` – dlatego warunek to \`d * d <= n\`, a nie \`<\`.`,

    },
    {
      type: 'code',
      q: md`
        Wczytaj dwie liczby: \`n\` (0 ≤ \`n\` ≤ 10⁹) i podstawę systemu \`b\` (2 ≤ \`b\` ≤ 9). Wypisz zapis liczby \`n\` w systemie o podstawie \`b\` (bez zer wiodących; dla \`n = 0\` wypisz \`0\`).
      `,
      tests: [
        { input: '13 2\n', output: '1101\n' },
        { input: '100 3\n', output: '10201\n' },
        { input: '0 2\n', output: '0\n' },
        { input: '255 8\n', output: '377\n' },
        { input: '1000000 9\n', output: '1783661\n' },
        { input: '7 7\n', output: '10\n' },
        { input: '1000000000 2\n', output: '111011100110101100101000000000\n' },
      ],
      solution: {
        python: code`
          n, b = map(int, input().split())
          if n == 0:
              print(0)
          else:
              s = ""
              while n > 0:
                  s = str(n % b) + s
                  n //= b
              print(s)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              long long n;
              int b;
              cin >> n >> b;
              if (n == 0) {
                  cout << 0 << endl;
                  return 0;
              }
              string s = "";
              while (n > 0) {
                  s = char('0' + n % b) + s;
                  n /= b;
              }
              cout << s << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  int b = sc.nextInt();
                  if (n == 0) {
                      System.out.println(0);
                      return;
                  }
                  StringBuilder s = new StringBuilder();
                  while (n > 0) {
                      s.insert(0, n % b);
                      n /= b;
                  }
                  System.out.println(s);
              }
          }
        `,
      },
      explain: md`Kolejne reszty z dzielenia przez \`b\` to cyfry od najmniej znaczącej, więc dopisujemy je **z przodu** napisu. Przypadek \`n = 0\` trzeba obsłużyć osobno, bo pętla [[python: \`while n > 0\`]][[cpp java: \`while (n > 0)\`]] nie wykona się
 ani razu i napis zostałby pusty.`,
    },
  ],
  practice: ['2024-maj/3.2', '2024-maj/3.3', '2023-maj/2.3', '2023-czerwiec/3.4', '2025-maj/2.3', '2025-czerwiec/2.2', '2023-maj/2.5'],
};
