import { md, code } from '../lib.js';

export default {
  title: 'Warunki i pętle',
  summary: 'if / else, pętle for i while, liczniki, sumy i maksimum – schematy, z których składa się prawie każdy program.',
  minutes: 30,
  intro: md`
    - jak program podejmuje decyzje (\`if\`, \`else\`) i jak łączyć warunki,
    - kiedy użyć pętli \`for\`, a kiedy \`while\`,
    - trzy schematy, które wracają w każdym zadaniu: **licznik**, **suma** i **maksimum / minimum**,
    - do czego służą \`break\` i \`continue\` oraz pętle zagnieżdżone.
  `,
  steps: [
    {
      title: 'Instrukcja warunkowa',
      body: md`
        Instrukcja \`if\` wykonuje fragment programu tylko wtedy, gdy warunek jest prawdziwy. Część \`else\` wykonuje się w przeciwnym razie, a [[python: \`elif\`]][[cpp java: \`else if\`]] pozwala sprawdzić kolejny warunek.

        ~~~python run
        n = int(input())
        if n > 0:
            print("dodatnia")
        elif n < 0:
            print("ujemna")
        else:
            print("zero")
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            if (n > 0) {
                cout << "dodatnia" << endl;
            } else if (n < 0) {
                cout << "ujemna" << endl;
            } else {
                cout << "zero" << endl;
            }
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                if (n > 0) {
                    System.out.println("dodatnia");
                } else if (n < 0) {
                    System.out.println("ujemna");
                } else {
                    System.out.println("zero");
                }
            }
        }
        ~~~
        ~~~stdin
        -12
        ~~~

        :::python
        > **Uwaga:** To, co należy do \`if\`, poznaje się po **wcięciu** (4 spacje) – a sam warunek kończy dwukropek \`:\`. Wcięcie jest częścią programu: instrukcja wcięta o mniej spacji już do \`if\` nie należy.
        :::
        :::cpp java
        > **Uwaga:** To, co należy do \`if\`, wyznaczają nawiasy klamrowe \`{ }\`, a warunek musi być w nawiasach okrągłych: \`if (n > 0)\`. Wcięcia są tylko dla czytelności, ale warto je robić. Bez klamer do \`if\` należy tylko **jedna** następna instrukcja.
        :::

        ### Porównania i łączenie warunków
        | znaczenie | Python | C++ / Java |
        |---|---|---|
        | równe, różne | \`==\`, \`!=\` | \`==\`, \`!=\` |
        | mniejsze, mniejsze lub równe | \`<\`, \`<=\` | \`<\`, \`<=\` |
        | i (oba prawdziwe) | \`and\` | \`&&\` |
        | lub (co najmniej jeden) | \`or\` | \`\|\|\` |
        | nie | \`not\` | \`!\` |

        :::python
        Przykład: liczba należy do przedziału [10, 99] – \`n >= 10 and n <= 99\`, albo krócej \`10 <= n <= 99\`.
        :::
        :::cpp java
        Przykład: liczba należy do przedziału [10, 99] – \`n >= 10 && n <= 99\`. Zapisu \`10 <= n <= 99\` nie używaj: [[cpp: skompiluje się, ale porówna z 99 wynik \`10 <= n\` (czyli 0 albo 1), więc będzie zawsze prawdziwy]][[java: nie skompiluje się]].
        :::
      `,
    },
    {
      title: 'Pętla for',
      body: md`
        Pętla \`for\` powtarza instrukcje **znaną z góry liczbę razy** – np. dla każdej liczby od 1 do n albo dla każdego wiersza pliku.

        :::python
        \`for i in range(a, b)\` przechodzi po liczbach od \`a\` do \`b - 1\` (**bez** \`b\`!), a \`range(b)\` – od 0 do \`b - 1\`. Trzeci argument to krok: \`range(10, 0, -2)\` to 10, 8, 6, 4, 2.
        :::

        ~~~python run
        n = 5
        suma = 0
        for i in range(1, n + 1):
            suma = suma + i
            print(i, suma)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int n = 5;
            int suma = 0;
            for (int i = 1; i <= n; i++) {
                suma = suma + i;
                cout << i << " " << suma << endl;
            }
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int n = 5;
                int suma = 0;
                for (int i = 1; i <= n; i++) {
                    suma = suma + i;
                    System.out.println(i + " " + suma);
                }
            }
        }
        ~~~

        :::python
        Żeby dojść do \`n\` **włącznie**, piszemy \`range(1, n + 1)\` – to najczęstsze miejsce pomyłki o jeden.

        > **Wskazówka:** \`suma = suma + i\` można zapisać krócej: \`suma += i\`. Podobnie \`-=\`, \`*=\`.
        :::
        :::cpp java
        \`for (int i = 1; i <= n; i++)\` czytaj: zacznij od \`i = 1\`, powtarzaj dopóki \`i <= n\`, po każdym obrocie zwiększ \`i\` o 1 (\`i++\`). Trzy części oddziela średnik. Pętla od 0 do \`n - 1\` to \`for (int i = 0; i < n; i++)\`, a w dół co 2: \`for (int i = 10; i > 0; i -= 2)\`.

        > **Wskazówka:** \`suma = suma + i\` można zapisać krócej: \`suma += i\`. Podobnie \`-=\`, \`*=\`, a \`i++\` to \`i += 1\`.
        :::
      `,
    },
    {
      title: 'Pętla while',
      body: md`
        Pętla \`while\` (*dopóki*) powtarza instrukcje, **dopóki warunek jest prawdziwy**. Używasz jej, gdy nie wiesz z góry, ile będzie powtórzeń – np. „dziel liczbę przez 10, dopóki jest większa od zera”.

        Ten program liczy, ile cyfr ma liczba – w każdym obrocie odcina ostatnią cyfrę:

        ~~~python run
        n = int(input())
        cyfry = 0
        while n > 0:
            n = n // 10
            cyfry += 1
        print(cyfry)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            long long n;
            cin >> n;
            int cyfry = 0;
            while (n > 0) {
                n = n / 10;
                cyfry++;
            }
            cout << cyfry << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long n = sc.nextLong();
                int cyfry = 0;
                while (n > 0) {
                    n = n / 10;
                    cyfry++;
                }
                System.out.println(cyfry);
            }
        }
        ~~~
        ~~~stdin
        2024
        ~~~

        Śledźmy to dla 2024: 2024 → 202 → 20 → 2 → 0. Cztery obroty, więc 4 cyfry. Zauważ, że dla \`n = 0\` pętla nie wykona się **ani razu** i program wypisze 0 – warunek jest sprawdzany *przed* każdym obrotem.

        > **Uwaga:** Jeśli w pętli \`while\` nic nie zmienia zmiennej z warunku, pętla będzie się kręcić w nieskończoność. W Informaturze program zostanie wtedy zatrzymany po kilku sekundach.

        W pseudokodzie na maturze pętlę \`while\` zapisuje się tak:
        ~~~pseudo
        dopóki n > 0 wykonuj
            n ← n div 10
            cyfry ← cyfry + 1
        ~~~
      `,
    },
    {
      title: 'Licznik, suma, maksimum',
      body: md`
        Większość odpowiedzi w zadaniach z programowania to: **ile** elementów spełnia warunek (licznik), **ile wynosi suma** albo **który jest największy / najmniejszy**. Te trzy schematy warto umieć napisać bez zastanawiania się.

        Program wczytuje \`n\`, a potem \`n\` liczb, i liczy: ile jest parzystych, ich sumę i największą liczbę.

        ~~~python run
        n = int(input())
        liczby = list(map(int, input().split()))
        parzyste = 0
        suma = 0
        najwieksza = liczby[0]
        for x in liczby:
            if x % 2 == 0:
                parzyste += 1      # licznik
            suma += x              # suma
            if x > najwieksza:     # maksimum
                najwieksza = x
        print(parzyste, suma, najwieksza)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            int parzyste = 0;
            long long suma = 0;
            long long najwieksza = 0;
            for (int i = 0; i < n; i++) {
                long long x;
                cin >> x;
                if (x % 2 == 0) parzyste++;            // licznik
                suma += x;                             // suma
                if (i == 0 || x > najwieksza) najwieksza = x;  // maksimum
            }
            cout << parzyste << " " << suma << " " << najwieksza << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                int n = sc.nextInt();
                int parzyste = 0;
                long suma = 0;
                long najwieksza = 0;
                for (int i = 0; i < n; i++) {
                    long x = sc.nextLong();
                    if (x % 2 == 0) parzyste++;            // licznik
                    suma += x;                             // suma
                    if (i == 0 || x > najwieksza) najwieksza = x;  // maksimum
                }
                System.out.println(parzyste + " " + suma + " " + najwieksza);
            }
        }
        ~~~
        ~~~stdin
        6
        7 -4 12 9 -1 3
        ~~~

        ### Jak zacząć maksimum
        Maksimum trzeba zacząć od wartości, która na pewno nie wygra z prawdziwymi danymi. Najbezpieczniej: od **pierwszego elementu** (tak jak wyżej). Zaczynanie od 0 to częsty błąd – jeśli wszystkie liczby są ujemne, wynik wyjdzie 0, którego w danych nie ma.

        > **Na maturze:** Pytanie „podaj liczbę, która… oraz jej pozycję / numer wiersza” wymaga zapamiętania obok maksimum także miejsca, w którym wystąpiło: przy każdej zmianie \`najwieksza = x\` zapisz też \`numer = i\`.
      `,
    },
    {
      title: 'break, continue i pętle w pętli',
      body: md`
        - \`break\` – natychmiast **kończy pętlę** (np. gdy znaleźliśmy to, czego szukaliśmy),
        - \`continue\` – **pomija resztę tego obrotu** i przechodzi do następnego.

        Pętla wewnątrz pętli pozwala przejrzeć **wszystkie pary** elementów. Para \`(i, j)\` z \`i < j\` – każda para raz:

        ~~~python run
        t = [3, 8, 5, 2]
        n = len(t)
        for i in range(n):
            for j in range(i + 1, n):
                if t[i] + t[j] == 10:
                    print(t[i], "+", t[j])
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int t[] = {3, 8, 5, 2};
            int n = 4;
            for (int i = 0; i < n; i++)
                for (int j = i + 1; j < n; j++)
                    if (t[i] + t[j] == 10)
                        cout << t[i] << " + " << t[j] << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int[] t = {3, 8, 5, 2};
                int n = t.length;
                for (int i = 0; i < n; i++)
                    for (int j = i + 1; j < n; j++)
                        if (t[i] + t[j] == 10)
                            System.out.println(t[i] + " + " + t[j]);
            }
        }
        ~~~

        Dla \`n\` elementów taka pętla wykona około \`n · n / 2\` porównań. Dla 1000 liczb to pół miliona – nic dla komputera. Dla miliona liczb byłoby to już 500 miliardów – za dużo. O tym, jak szacować czas działania, jest lekcja o złożoności w dziale Algorytmika.

        > **Wskazówka:** Gdy szukasz **pierwszego** elementu spełniającego warunek, użyj \`break\` od razu po jego znalezieniu – oszczędzisz czas, a przede wszystkim nie nadpiszesz wyniku kolejnymi pasującymi elementami.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`[[python: Jakie liczby da \`range(2, 10, 3)\`?]][[cpp java: Jakie wartości przyjmie \`i\` w pętli \`for (int i = 2; i < 10; i += 3)\`?]]`,
      options: ['2, 5, 8', '2, 5, 8, 11', '2, 3, …, 10', '3, 6, 9'],
      answer: 0,
      explain: md`Od 2, co 3, dopóki liczba jest **mniejsza** od 10: 2, 5, 8. Następna byłaby 11, ale to już za dużo. [[python: Koniec przedziału w \`range\` nigdy nie jest włączony.]][[cpp java: Warunek \`i < 10\` jest sprawdzany przed każdym obrotem.]]`,
    },
    {
      type: 'input',
      q: md`Ile razy wykona się ciało pętli [[python: \`for i in range(5, 20):\`]][[cpp java: \`for (int i = 5; i < 20; i++)\`]]?`,
      answer: '15',
      explain: md`\`i\` przyjmie wartości 5, 6, …, 19 – to 20 − 5 = 15 wartości.`,
    },
    {
      type: 'input',
      q: md`
        Ile razy wykona się ciało tej pętli?
        ~~~pseudo
        n ← 100
        dopóki n > 1 wykonuj
            n ← n div 2
        ~~~
      `,
      answer: '6',
      explain: md`Kolejne wartości \`n\`: 100 → 50 → 25 → 12 → 6 → 3 → 1. Sześć dzieleń; przy \`n = 1\` warunek \`n > 1\` jest już fałszywy.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '[[python: Wcięcie decyduje o tym, które instrukcje należą do bloku `if`.]][[cpp java: Nawiasy klamrowe `{ }` decydują o tym, które instrukcje należą do bloku `if`.]]', answer: true },
        { text: 'Warunek [[python: `x > 3 and x < 7`]][[cpp java: `x > 3 && x < 7`]] jest prawdziwy dla `x = 7`.', answer: false },
        { text: 'Pętla `while` może nie wykonać się ani razu.', answer: true },
        { text: 'Instrukcja `break` kończy cały program.', answer: false },
      ],
      explain: md`
        - Tak – [[python: wcięcia są częścią składni Pythona]][[cpp java: wcięcia są tylko dla czytelności]].
        - Dla 7 część \`x < 7\` jest fałszywa, a [[python: \`and\`]][[cpp java: \`&&\`]] wymaga obu.
        - Tak – jeśli warunek jest fałszywy już na początku.
        - \`break\` kończy tylko najbliższą pętlę, w której się znajduje.
      `,
    },
    {
      type: 'choice',
      q: md`Szukasz największej liczby w danych, w których mogą być **same liczby ujemne**. Od czego zacząć zmienną z maksimum?`,
      options: ['od pierwszego elementu danych', 'od 0', 'od -1', 'od 1'],
      answer: 0,
      explain: md`Pierwszy element na pewno należy do danych, więc maksimum nigdy nie wyjdzie „spoza danych”. Start od 0 dałby wynik 0, gdy wszystkie liczby są ujemne. (Można też zacząć od bardzo małej liczby, np. [[python: \`-10**18\`]][[cpp: \`LLONG_MIN\` z \`<climits>\`]][[java: \`Long.MIN_VALUE\`]], ale pierwszy element jest najprostszy.)`,
    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu wejścia jest liczba \`n\` (1 ≤ \`n\` ≤ 1000), a w drugim \`n\` liczb całkowitych z przedziału [−10⁹, 10⁹] oddzielonych spacjami.

        Wypisz w trzech wierszach: **ile liczb jest podzielnych przez 3**, **sumę wszystkich liczb** i **najmniejszą liczbę**.
      `,
      tests: [
        { input: '6\n7 -4 12 9 -1 3\n', output: '3\n26\n-4\n' },
        { input: '3\n5 5 5\n', output: '0\n15\n5\n' },
        { input: '1\n-9\n', output: '1\n-9\n-9\n' },
        { input: '4\n1000000000 1000000000 1000000000 999999999\n', output: '1\n3999999999\n999999999\n' },
        { input: '5\n-3 -6 -1000000000 0 2\n', output: '3\n-1000000007\n-1000000000\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          liczby = list(map(int, input().split()))
          print(sum(1 for x in liczby if x % 3 == 0))
          print(sum(liczby))
          print(min(liczby))
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              int ile = 0;
              long long suma = 0, najm = 0;
              for (int i = 0; i < n; i++) {
                  long long x;
                  cin >> x;
                  if (x % 3 == 0) ile++;
                  suma += x;
                  if (i == 0 || x < najm) najm = x;
              }
              cout << ile << endl << suma << endl << najm << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  int ile = 0;
                  long suma = 0, najm = 0;
                  for (int i = 0; i < n; i++) {
                      long x = sc.nextLong();
                      if (x % 3 == 0) ile++;
                      suma += x;
                      if (i == 0 || x < najm) najm = x;
                  }
                  System.out.println(ile);
                  System.out.println(suma);
                  System.out.println(najm);
              }
          }
        `,
      },
      explain: md`To trzy schematy naraz: licznik z warunkiem \`x % 3 == 0\` (działa też dla liczb ujemnych i zera), suma[[cpp java:  (typu [[cpp: \`long long\`]][[java: \`long\`]] – 4 miliardy nie mieszczą się w \`int\`)]] i minimum zaczynane od pierwszego elementu.[[python:  Zamiast pętli możesz użyć gotowych funkcji \`sum\` i \`min\`.]]`,
    },
    {
      type: 'code',
      q: md`
        Weźmy liczbę \`n\`. Jeśli jest parzysta, dzielimy ją przez 2, a jeśli nieparzysta – zamieniamy na \`3·n + 1\`. Powtarzamy, aż dojdziemy do 1.

        Wczytaj \`n\` (1 ≤ \`n\` < 1 000 000) i wypisz, **ile kroków** potrzeba, żeby dojść do 1. Dla \`n = 6\`: 6 → 3 → 10 → 5 → 16 → 8 → 4 → 2 → 1, czyli 8 kroków.

        Uwaga: po drodze liczby mogą przekroczyć 2 miliardy.
      `,
      tests: [
        { input: '6\n', output: '8\n' },
        { input: '1\n', output: '0\n' },
        { input: '27\n', output: '111\n' },
        { input: '7\n', output: '16\n' },
        { input: '837799\n', output: '524\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          kroki = 0
          while n != 1:
              if n % 2 == 0:
                  n = n // 2
              else:
                  n = 3 * n + 1
              kroki += 1
          print(kroki)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              int kroki = 0;
              while (n != 1) {
                  if (n % 2 == 0) n = n / 2;
                  else n = 3 * n + 1;
                  kroki++;
              }
              cout << kroki << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  int kroki = 0;
                  while (n != 1) {
                      if (n % 2 == 0) n = n / 2;
                      else n = 3 * n + 1;
                      kroki++;
                  }
                  System.out.println(kroki);
              }
          }
        `,
      },
      explain: md`Liczby kroków nie znamy z góry, więc to zadanie na pętlę [[python: \`while n != 1:\`]][[cpp java: \`while (n != 1)\`]]. Dla \`n = 1\` pętla nie wykona się ani razu i wynik to 0.[[cpp java:  Dla 837799 liczby po drodze dochodzą do prawie 3 miliardów – \`n\` musi być typu [[cpp: \`long long\`]][[java: \`long\`]], inaczej wynik będzie zły albo pętla się nie skończy.]][[python:  Pamiętaj o \`//\` – po \`n / 2\` liczba stałaby się rzeczywista.]]`,
    },
  ],
  practice: ['2026-czerwiec/4.1', '2024-czerwiec/4.2', '2023-maj/3.1', '2026-maj/4.2'],
};
