import { md, code } from '../lib.js';

export default {
  title: 'Algorytmy na cyfrach i systemach liczbowych',
  summary: 'Schemat Hornera, zamiana na dowolny system, cyfry dwóch liczb naraz, bity bez napisów – bez funkcji wbudowanych.',
  minutes: 35,
  intro: md`
    - jak policzyć wartość liczby z jej cyfr (schemat Hornera),
    - jak zamienić liczbę na system o dowolnej podstawie samymi \`div\` i \`mod\`,
    - jak przetwarzać cyfry **dwóch** liczb jednocześnie (np. dodawanie pisemne),
    - jak pracować na bitach liczby bez zamieniania jej na napis,
    - czego nie wolno używać, gdy zadanie zabrania „funkcji wbudowanych”.
  `,
  steps: [
    {
      title: 'Wartość liczby z cyfr – schemat Hornera',
      body: md`
        Zapis \`2101\` w systemie trójkowym oznacza \`2·3³ + 1·3² + 0·3¹ + 1·3⁰ = 54 + 9 + 0 + 1 = 64\`. Liczenie potęg jest niewygodne. **Schemat Hornera** przechodzi po cyfrach **od lewej** i w każdym kroku mnoży dotychczasowy wynik przez podstawę:

        ~~~pseudo
        w ← 0
        dla każdej cyfry c od lewej wykonuj
            w ← w · p + c
        ~~~

        Dla \`2101\` (p = 3): 0 → 0·3 + 2 = 2 → 2·3 + 1 = 7 → 7·3 + 0 = 21 → 21·3 + 1 = **64**.

        To ten sam schemat, którym w lekcji o napisach zamienialiśmy tekst na liczbę, i to właśnie robi [[python: \`int("2101", 3)\`]][[cpp: \`stoll("2101", nullptr, 3)\`]][[java: \`Long.parseLong("2101", 3)\`]] – ale w zadaniu „zapisz algorytm” trzeba umieć go napisać samemu.

        ~~~python run
        def wartosc(cyfry, p):
            w = 0
            for c in cyfry:
                w = w * p + c
            return w

        print(wartosc([2, 1, 0, 1], 3), wartosc([1, 0, 1, 1], 2), wartosc([7, 7, 7], 8))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <vector>
        using namespace std;

        long long wartosc(const vector<int>& cyfry, int p) {
            long long w = 0;
            for (int c : cyfry) w = w * p + c;
            return w;
        }

        int main() {
            cout << wartosc({2, 1, 0, 1}, 3) << " " << wartosc({1, 0, 1, 1}, 2) << " " << wartosc({7, 7, 7}, 8) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static long wartosc(int[] cyfry, int p) {
                long w = 0;
                for (int c : cyfry) w = w * p + c;
                return w;
            }

            public static void main(String[] args) {
                System.out.println(wartosc(new int[]{2, 1, 0, 1}, 3) + " " + wartosc(new int[]{1, 0, 1, 1}, 2) + " " + wartosc(new int[]{7, 7, 7}, 8));
            }
        }
        ~~~
      `,
    },
    {
      title: 'Zamiana na system o podstawie p',
      body: md`
        Odwrotny kierunek: kolejne **reszty z dzielenia** przez \`p\` to cyfry w systemie \`p\`, **od najmniej znaczącej**. Dla 2026 w systemie piątkowym:

        | n | n div 5 | n mod 5 |
        |---|---|---|
        | 2026 | 405 | 1 |
        | 405 | 81 | 0 |
        | 81 | 16 | 1 |
        | 16 | 3 | 1 |
        | 3 | 0 | 3 |

        Reszty czytane **od dołu**: \`2026 = 31101₅\`.

        Bez napisów i list wynik można złożyć jako liczbę „udającą” zapis w systemie \`p\` (działa dla \`p ≤ 10\`) – mnożnik 1, 10, 100… ustawia kolejne cyfry:

        ~~~pseudo
        w ← 0
        m ← 1
        dopóki n > 0 wykonuj
            w ← w + (n mod p) · m
            m ← m · 10
            n ← n div p
        ~~~

        ### Palindrom w systemie p – bez napisów
        Liczba jest palindromem w systemie \`p\`, gdy jest równa liczbie o odwróconych cyfrach (w tym samym systemie). Odwracanie to znów schemat Hornera, tylko na cyfrach branych od końca:

        ~~~python run
        def odwrocona(n, p):
            w = 0
            while n > 0:
                w = w * p + n % p
                n //= p
            return w

        for n, p in [(5, 2), (6, 2), (100, 9), (585, 2)]:
            print(n, p, odwrocona(n, p) == n)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        long long odwrocona(long long n, int p) {
            long long w = 0;
            while (n > 0) {
                w = w * p + n % p;
                n /= p;
            }
            return w;
        }

        int main() {
            long long dane[][2] = {{5, 2}, {6, 2}, {100, 9}, {585, 2}};
            for (auto& d : dane)
                cout << d[0] << " " << d[1] << " " << (odwrocona(d[0], d[1]) == d[0] ? "True" : "False") << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static long odwrocona(long n, int p) {
                long w = 0;
                while (n > 0) {
                    w = w * p + n % p;
                    n /= p;
                }
                return w;
            }

            public static void main(String[] args) {
                long[][] dane = {{5, 2}, {6, 2}, {100, 9}, {585, 2}};
                for (long[] d : dane)
                    System.out.println(d[0] + " " + d[1] + " " + (odwrocona(d[0], (int) d[1]) == d[0] ? "True" : "False"));
            }
        }
        ~~~

        Na przykład 100 = 121₉, więc jest palindromem w systemie dziewiątkowym, a 585 = 1001001001₂ – w dwójkowym.
      `,
    },
    {
      title: 'Cyfry dwóch liczb naraz',
      body: md`
        Gdy algorytm porównuje albo dodaje dwie liczby „cyfra po cyfrze” (jak dodawanie pisemne), pętla idzie po obu liczbach jednocześnie i kończy się, gdy **obie** się skończą: \`dopóki a > 0 lub b > 0\`.

        Dodawanie pisemne z przeniesieniem – suma cyfr i przeniesienie z poprzedniej pozycji:

        ~~~pseudo
        p ← 0                       ⟵ przeniesienie
        dopóki a > 0 lub b > 0 wykonuj
            s ← a mod 10 + b mod 10 + p
            jeżeli s ≥ 10 to p ← 1 w przeciwnym razie p ← 0
            a ← a div 10
            b ← b div 10
        ~~~

        Dla 456 + 555: 6 + 5 = 11 (przeniesienie 1), 5 + 5 + 1 = 11 (przeniesienie 1), 4 + 5 + 1 = 10 (przeniesienie 1) – w każdej kolumnie jest przeniesienie. Zwróć uwagę, że przy 999 + 1 przeniesienie „wędruje” przez wszystkie cyfry, choć druga liczba ma tylko jedną cyfrę – dlatego warunek pętli zawiera \`lub\`.

        > **Na maturze:** Zadanie z maja 2026 („Dodawanie”) polega dokładnie na tym schemacie. Znajdziesz je w linkach na końcu lekcji.
      `,
    },
    {
      title: 'Bity bez napisów',
      body: md`
        Zapis binarny to przypadek \`p = 2\`: \`n mod 2\` to ostatni bit, \`n div 2\` usuwa go. Na tej parze oprzesz każdy algorytm „na bitach” – np. liczbę jedynek albo **najdłuższy ciąg jedynek**:

        ~~~python run
        def najdluzszy_ciag_jedynek(n):
            najlepszy = biezacy = 0
            while n > 0:
                if n % 2 == 1:
                    biezacy += 1
                    najlepszy = max(najlepszy, biezacy)
                else:
                    biezacy = 0
                n //= 2
            return najlepszy

        for n in [13, 7, 8, 1000000]:
            print(n, najdluzszy_ciag_jedynek(n))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <algorithm>
        using namespace std;

        int najdluzszy_ciag_jedynek(long long n) {
            int najlepszy = 0, biezacy = 0;
            while (n > 0) {
                if (n % 2 == 1) {
                    biezacy++;
                    najlepszy = max(najlepszy, biezacy);
                } else biezacy = 0;
                n /= 2;
            }
            return najlepszy;
        }

        int main() {
            for (long long n : {13LL, 7LL, 8LL, 1000000LL})
                cout << n << " " << najdluzszy_ciag_jedynek(n) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static int najdluzszyCiagJedynek(long n) {
                int najlepszy = 0, biezacy = 0;
                while (n > 0) {
                    if (n % 2 == 1) {
                        biezacy++;
                        najlepszy = Math.max(najlepszy, biezacy);
                    } else biezacy = 0;
                    n /= 2;
                }
                return najlepszy;
            }

            public static void main(String[] args) {
                for (long n : new long[]{13, 7, 8, 1000000})
                    System.out.println(n + " " + najdluzszyCiagJedynek(n));
            }
        }
        ~~~

        13 = 1101₂ (najdłuższy ciąg: \`11\`), 1000000 = 11110100001001000000₂ (\`1111\`).
      `,
    },
    {
      title: 'Bez funkcji wbudowanych',
      body: md`
        Zadania typu *„Zapisz w pseudokodzie lub w wybranym języku programowania algorytm…”* często mają uwagę: *„w zapisie algorytmu możesz korzystać tylko z operacji arytmetycznych, porównań, instrukcji sterujących i przypisań”*. Wtedy **nie wolno** używać m.in.:

        - zamiany liczby na napis i z powrotem ([[python: \`str(n)\`, \`int(s)\`, \`int(s, 2)\`]][[cpp: \`to_string(n)\`, \`stoi(s)\`, \`stoll(s, nullptr, 2)\`]][[java: \`String.valueOf(n)\`, \`Integer.parseInt(s)\`, \`Long.parseLong(s, 2)\`]]),
        - gotowych konwersji systemów ([[python: \`bin(n)\`]][[cpp: \`bitset\`]][[java: \`Long.toBinaryString(n)\`, \`Long.toString(n, p)\`]]),
        - gotowego sortowania, [[python: \`max\`, \`sum\`, \`reversed\`]][[cpp: \`max_element\`, \`accumulate\`, \`reverse\`]][[java: \`Collections.max\`, \`reverse\`]] itd. – jeśli uwaga ich zabrania,
        - (czasem) list / tablic – czytaj treść.

        Wolno: \`+ − · div mod\`, porównania, \`jeżeli\`, \`dopóki\`, \`dla\`, przypisania i **własne funkcje** zbudowane z tych operacji. Dlatego wszystkie algorytmy z tej lekcji są napisane samymi \`div\` i \`mod\`.

        > **Na maturze:** Algorytm możesz zapisać w pseudokodzie albo w dowolnym z języków. Oceniana jest poprawność dla **wszystkich** danych zgodnych ze specyfikacją – także brzegowych (np. \`n = 1\`, liczba z samych zer w środku). Sprawdź swój zapis na kilku przykładach, najlepiej uruchamiając go na komputerze. W Informaturze zadania „zapis algorytmu” mają przycisk **Sprawdź testami**, który robi to za Ciebie.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Ile wynosi w systemie dziesiętnym liczba \`2101₃\`? Policz schematem Hornera.`,
      answer: '64',
      explain: md`0·3 + 2 = 2, 2·3 + 1 = 7, 7·3 + 0 = 21, 21·3 + 1 = 64.`,
    },
    {
      type: 'input',
      q: md`Zapisz liczbę 2026 w systemie piątkowym.`,
      answer: '31101',
      exact: true,
      explain: md`Reszty z dzielenia przez 5: 2026 → 1, 405 → 0, 81 → 1, 16 → 1, 3 → 3. Od końca: 31101. Sprawdzenie Hornerem: ((((3·5+1)·5+1)·5+0)·5+1) = 2026.`,
    },
    {
      type: 'input',
      q: md`Ile przeniesień powstaje przy pisemnym dodawaniu liczb 999 i 1?`,
      answer: '3',
      explain: md`9 + 1 = 10 (przeniesienie), 9 + 0 + 1 = 10 (przeniesienie), 9 + 0 + 1 = 10 (przeniesienie). Wynik 1000. Dlatego pętla musi działać, **dopóki którakolwiek** z liczb ma jeszcze cyfry.`,
    },
    {
      type: 'tf',
      q: md`W zadaniu jest uwaga: *„możesz korzystać tylko z operacji arytmetycznych, porównań, instrukcji sterujących, przypisań i samodzielnie napisanych funkcji”*. Oceń, czy w zapisie algorytmu wolno użyć:`,
      items: [
        { text: '`n mod 2` i `n div 2`', answer: true },
        { text: '[[python: `int(str(n)[::-1])`]][[cpp: zamiany `to_string(n)` na napis i odwrócenia go]][[java: `new StringBuilder(String.valueOf(n)).reverse()`]] do odwrócenia liczby', answer: false },
        { text: 'własnej funkcji `odwroc(n)` napisanej pętlą z `div` i `mod`', answer: true },
        { text: '[[python: `bin(n).count("1")`]][[cpp: `bitset<64>(n).count()`]][[java: `Long.bitCount(n)`]] do policzenia jedynek', answer: false },
      ],
      explain: md`Operacje arytmetyczne i własne funkcje z nich zbudowane są dozwolone. Zamiana na napis ([[python: \`str\`, \`bin\`]][[cpp: \`to_string\`, \`bitset\`]][[java: \`String.valueOf\`, \`Long.bitCount\`]]) i gotowe metody to właśnie „funkcje wbudowane”, których uwaga zabrania.`,

    },
    {
      type: 'code',
      q: md`
        Wczytaj nieujemną liczbę całkowitą \`n\` (≤ 10¹²) i podstawę \`p\` (2 ≤ \`p\` ≤ 10). Wypisz \`TAK\`, jeśli zapis \`n\` w systemie o podstawie \`p\` jest palindromem, albo \`NIE\` w przeciwnym razie. Spróbuj **bez** zamiany liczby na napis.
      `,
      tests: [
        { input: '5 2\n', output: 'TAK\n' },
        { input: '6 2\n', output: 'NIE\n' },
        { input: '100 9\n', output: 'TAK\n' },
        { input: '0 2\n', output: 'TAK\n' },
        { input: '585 2\n', output: 'TAK\n' },
        { input: '586 2\n', output: 'NIE\n' },
        { input: '1000000 7\n', output: 'TAK\n' },
        { input: '123 10\n', output: 'NIE\n' },
      ],
      solution: {
        python: code`
          n, p = map(int, input().split())
          w, m = 0, n
          while m > 0:
              w = w * p + m % p
              m //= p
          print("TAK" if w == n else "NIE")
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n, p;
              cin >> n >> p;
              long long w = 0, m = n;
              while (m > 0) {
                  w = w * p + m % p;
                  m /= p;
              }
              cout << (w == n ? "TAK" : "NIE") << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong(), p = sc.nextLong();
                  long w = 0, m = n;
                  while (m > 0) {
                      w = w * p + m % p;
                      m /= p;
                  }
                  System.out.println(w == n ? "TAK" : "NIE");
              }
          }
        `,
      },
      explain: md`Odwracamy cyfry w systemie \`p\` schematem Hornera (\`w = w·p + cyfra\`) na kopii liczby i porównujemy z oryginałem. Dla \`n = 0\` pętla się nie wykona, \`w = 0 = n\`, więc wynik TAK – zapis „0” jest palindromem.`,
    },
    {
      type: 'code',
      q: md`Wczytaj nieujemną liczbę całkowitą \`n\` (≤ 10¹⁸) i wypisz długość **najdłuższego ciągu kolejnych jedynek** w jej zapisie binarnym (dla \`n = 0\` wypisz 0).`,
      tests: [
        { input: '13\n', output: '2\n' },
        { input: '7\n', output: '3\n' },
        { input: '8\n', output: '1\n' },
        { input: '0\n', output: '0\n' },
        { input: '1023\n', output: '10\n' },
        { input: '1000000\n', output: '4\n' },
        { input: '1000000000000000000\n', output: '4\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          najlepszy = biezacy = 0
          while n > 0:
              if n % 2 == 1:
                  biezacy += 1
                  najlepszy = max(najlepszy, biezacy)
              else:
                  biezacy = 0
              n //= 2
          print(najlepszy)
        `,
        cpp: code`
          #include <iostream>
          #include <algorithm>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              int najlepszy = 0, biezacy = 0;
              while (n > 0) {
                  if (n % 2 == 1) {
                      biezacy++;
                      najlepszy = max(najlepszy, biezacy);
                  } else biezacy = 0;
                  n /= 2;
              }
              cout << najlepszy << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  int najlepszy = 0, biezacy = 0;
                  while (n > 0) {
                      if (n % 2 == 1) {
                          biezacy++;
                          najlepszy = Math.max(najlepszy, biezacy);
                      } else biezacy = 0;
                      n /= 2;
                  }
                  System.out.println(najlepszy);
              }
          }
        `,
      },
      explain: md`Bity bierzemy od końca (\`n mod 2\`), a najdłuższy ciąg liczymy schematem „bieżący i najlepszy”: jedynka wydłuża bieżący ciąg, zero go zeruje. Kierunek przeglądania (od końca) nie zmienia długości ciągów.`,
    },
  ],
  practice: ['2024-maj/3.1', '2023-maj/2.1', '2026-maj/2.1', '2026-maj/2.2', '2025-czerwiec/2.1', '2024-czerwiec/1.2'],
};
