import { md, code } from '../lib.js';

export default {
  title: 'Pierwszy program: wypisywanie, zmienne i działania',
  summary: 'Jak zbudowany jest program, zmienne i typy, wczytywanie danych, dzielenie całkowite i reszta z dzielenia.',
  minutes: 25,
  intro: md`
    - jak wygląda najprostszy program w Pythonie, C++ i Javie i jak go uruchomić,
    - czym są zmienne i typy oraz dlaczego w C++ i Javie trzeba uważać na zbyt duże liczby,
    - jak wczytać liczby i wypisać wynik,
    - dzielenie całkowite i reszta z dzielenia (\`div\` i \`mod\`) – działania, które są w prawie każdym zadaniu maturalnym.
  `,
  steps: [
    {
      title: 'Program na maturze',
      body: md`
        Na maturze z informatyki część zadań brzmi: *„Napisz program, który…”*. Dostajesz plik z danymi (np. \`liczby.txt\`), a Twój program ma policzyć odpowiedź – na przykład ile liczb jest parzystych albo która liczba jest największa. Oceniana jest **odpowiedź**, którą zapiszesz w pliku z wynikami, więc program jest narzędziem: ma być poprawny, nie musi być piękny.

        Program piszesz w jednym z języków: **Python**, **C++** albo **Java**. Język wybierasz u góry okna Informatury – wszystkie przykłady w lekcjach przełączą się na niego. Możesz też kliknąć zakładkę nad przykładem.

        Oto najkrótszy sensowny program – wypisuje jeden wiersz tekstu:

        ~~~python run
        print("Witaj, maturo!")
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            cout << "Witaj, maturo!" << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                System.out.println("Witaj, maturo!");
            }
        }
        ~~~

        Kliknij **Uruchom** – pod przykładem zobaczysz, co program wypisał.

        ### Co tu jest czym
        - **Python** wykonuje instrukcje po kolei, od góry. \`print(...)\` wypisuje to, co jest w nawiasie, i przechodzi do nowego wiersza.
        - **C++** zaczyna od funkcji \`main\`. \`#include <iostream>\` dołącza obsługę wejścia i wyjścia, \`cout << ...\` wypisuje, a \`endl\` kończy wiersz. Każda instrukcja kończy się średnikiem \`;\`.
        - **Java** wymaga klasy (tu \`Main\`) i metody \`main\`. Wypisuje się przez \`System.out.println(...)\`.

        > **Wskazówka:** W zadaniach z arkuszy w Informaturze program piszesz w edytorze po prawej i uruchamiasz przyciskiem **Uruchom** (albo Ctrl+Enter). To, co wypisze, trafia do pola „Odpowiedź”.
      `,
    },
    {
      title: 'Zmienne i typy',
      body: md`
        **Zmienna** to nazwane miejsce w pamięci, w którym trzymasz wartość – liczbę, napis itp. Wartość nadajesz znakiem \`=\` (to **przypisanie**, nie porównanie): \`x = 5\` znaczy „włóż 5 do zmiennej x”.

        Każda wartość ma **typ**. Najważniejsze typy na maturze:

        | Co przechowuje | Python | C++ | Java |
        |---|---|---|---|
        | liczba całkowita | \`int\` | \`int\`, \`long long\` | \`int\`, \`long\` |
        | liczba rzeczywista | \`float\` | \`double\` | \`double\` |
        | napis (tekst) | \`str\` | \`string\` | \`String\` |
        | prawda / fałsz | \`bool\` | \`bool\` | \`boolean\` |

        W Pythonie typu nie piszesz – zmienna dostaje go razem z wartością. W C++ i Javie typ podajesz przy pierwszym użyciu zmiennej (deklaracji):

        ~~~python run
        a = 7
        b = 3
        suma = a + b
        iloczyn = a * b
        print(suma, iloczyn)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int a = 7;
            int b = 3;
            int suma = a + b;
            int iloczyn = a * b;
            cout << suma << " " << iloczyn << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int a = 7;
                int b = 3;
                int suma = a + b;
                int iloczyn = a * b;
                System.out.println(suma + " " + iloczyn);
            }
        }
        ~~~

        ### Uwaga na duże liczby
        W C++ i Javie typ \`int\` mieści liczby tylko do około **2,1 miliarda** (dokładnie 2 147 483 647). Jeśli wynik będzie większy, zmienna się „przekręci” i dostaniesz bzdurę – bez żadnego komunikatu o błędzie. Na maturze dane często mają liczby do miliarda, a ich suma czy iloczyn łatwo przekracza tę granicę.

        > **Zapamiętaj:** W C++ do sum i iloczynów używaj \`long long\`, a w Javie \`long\` (mieszczą liczby do około 9·10¹⁸). W Pythonie liczby całkowite nie mają limitu.

        ~~~python run
        n = 3000000000
        print(n * 2)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            long long n = 3000000000LL;
            cout << n * 2 << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                long n = 3000000000L;
                System.out.println(n * 2);
            }
        }
        ~~~
      `,
    },
    {
      title: 'Dzielenie całkowite i reszta',
      body: md`
        Dzielenie na maturze najczęściej jest **całkowite**: 17 podzielone przez 5 to 3 i reszta 2. W pseudokodzie z arkuszy zapisuje się to jako \`17 div 5 = 3\` i \`17 mod 5 = 2\`.

        | Działanie | pseudokod | Python | C++ / Java (dla liczb całkowitych) |
        |---|---|---|---|
        | dzielenie całkowite | \`a div b\` | \`a // b\` | \`a / b\` |
        | reszta z dzielenia | \`a mod b\` | \`a % b\` | \`a % b\` |
        | dzielenie „zwykłe” | \`a / b\` | \`a / b\` (daje np. 3.4) | \`(double) a / b\` |

        > **Uwaga:** W C++ i Javie \`7 / 2\` dla liczb typu \`int\` daje **3**, nie 3,5 – ułamek jest obcinany. Jeśli potrzebujesz wyniku z przecinkiem, zamień jedną z liczb na \`double\`, np. \`(double) a / b\` albo \`a / 2.0\`. W Pythonie odwrotnie: \`/\` zawsze daje liczbę z przecinkiem, a dzielenie całkowite to \`//\`.

        ### Do czego to się przydaje
        Reszta z dzielenia odpowiada na mnóstwo pytań z zadań:
        - \`n % 2 == 0\` – czy liczba jest **parzysta**,
        - \`n % k == 0\` – czy \`n\` jest **podzielna** przez \`k\`,
        - \`n % 10\` – **ostatnia cyfra** liczby (\`4728 % 10 = 8\`),
        - \`n // 10\` (w C++/Javie \`n / 10\`) – liczba **bez ostatniej cyfry** (\`4728 // 10 = 472\`).

        Z dwóch ostatnich zrobisz w kolejnych lekcjach rozkładanie liczby na cyfry – to jeden z najczęstszych motywów na maturze.

        ~~~python run differs
        n = 4728
        print(n % 10)        # ostatnia cyfra
        print(n // 10)       # bez ostatniej cyfry
        print(n // 10 % 10)  # przedostatnia cyfra
        print(n % 2 == 0)    # czy parzysta
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int n = 4728;
            cout << n % 10 << endl;        // ostatnia cyfra
            cout << n / 10 << endl;        // bez ostatniej cyfry
            cout << n / 10 % 10 << endl;   // przedostatnia cyfra
            cout << (n % 2 == 0) << endl;  // czy parzysta (1 = tak)
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int n = 4728;
                System.out.println(n % 10);        // ostatnia cyfra
                System.out.println(n / 10);        // bez ostatniej cyfry
                System.out.println(n / 10 % 10);   // przedostatnia cyfra
                System.out.println(n % 2 == 0);    // czy parzysta
            }
        }
        ~~~

        > **Uwaga:** Dla liczb **ujemnych** języki się różnią: w Pythonie \`-7 // 2 = -4\` i \`-7 % 2 = 1\`, a w C++ i Javie \`-7 / 2 = -3\` i \`-7 % 2 = -1\`. Dlatego parzystość lepiej sprawdzać przez \`n % 2 == 0\` (działa wszędzie), a nie przez \`n % 2 == 1\`.
      `,
    },
    {
      title: 'Wczytywanie danych',
      body: md`
        Program zwykle coś **wczytuje**, liczy i **wypisuje** wynik. Na maturze dane są w pliku (tym zajmiemy się w lekcji o plikach), ale zasada jest ta sama, co przy wczytywaniu z klawiatury – czyli ze **standardowego wejścia**. Ćwiczenia w lekcjach właśnie tak dostają dane.

        W Pythonie \`input()\` wczytuje **cały wiersz jako napis**. Żeby dostać liczbę, trzeba go zamienić: \`int(input())\`. Dwie liczby w jednym wierszu rozdzielisz metodą \`split()\`. W C++ \`cin >> x\` i w Javie \`sc.nextInt()\` same odczytują kolejną liczbę – nie ma znaczenia, czy są w jednym wierszu, czy w kilku.

        ~~~python run
        a, b = map(int, input().split())
        print(a + b)
        print(a * b)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            long long a, b;
            cin >> a >> b;
            cout << a + b << endl;
            cout << a * b << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                Scanner sc = new Scanner(System.in);
                long a = sc.nextLong();
                long b = sc.nextLong();
                System.out.println(a + b);
                System.out.println(a * b);
            }
        }
        ~~~
        ~~~stdin
        12 5
        ~~~

        \`map(int, input().split())\` czytaj tak: weź wiersz, potnij go na kawałki w miejscach spacji (\`split\`) i każdy kawałek zamień na liczbę (\`map(int, …)\`).

        > **Uwaga:** Najczęstszy błąd początkujących w Pythonie: zapomnieć o \`int(...)\`. Wtedy \`"12" + "5"\` daje napis \`"125"\` zamiast liczby 17, a porównanie \`"9" > "10"\` jest prawdziwe, bo napisy porównuje się znak po znaku.
      `,
    },
    {
      title: 'Najczęstsze błędy',
      body: md`
        Zanim przejdziesz do testu, lista pułapek, w które najłatwiej wpaść na początku:

        1. **Napis zamiast liczby** (Python) – wynik \`input()\` albo wiersza z pliku to napis. Zamień go przez \`int(...)\` przed liczeniem.
        2. **Przepełnienie** (C++, Java) – suma wielu liczb albo iloczyn dwóch dużych nie mieści się w \`int\`. Używaj \`long long\` / \`long\`.
        3. **Obcięte dzielenie** (C++, Java) – \`5 / 2\` to 2. Do średniej potrzebujesz \`double\`.
        4. **\`=\` zamiast \`==\`** – \`=\` przypisuje, \`==\` porównuje. W C++ \`if (x = 5)\` skompiluje się i zawsze będzie prawdą!
        5. **Brak średnika** (C++, Java) – kompilator pokaże błąd w wierszu *po* tym, w którym go zabrakło.
        6. **Wielkość liter** – \`Print\`, \`COUT\` czy \`system.out\` nie zadziałają. Języki programowania rozróżniają wielkie i małe litery.

        > **Na maturze:** Zanim zapiszesz odpowiedź, uruchom program na pliku przykładowym (w Informaturze: **Test: dane przykładowe**) i porównaj wynik z tym podanym w treści zadania. To najszybszy sposób, żeby wyłapać błąd.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Jaki będzie wynik działań \`17 // 5\` i \`17 % 5\` w Pythonie?`,
      options: ['3 i 2', '3,4 i 0', '3 i 5', '2 i 3'],
      answer: 0,
      explain: md`17 = 5 · 3 + 2, więc dzielenie całkowite daje 3, a reszta to 2. W C++ i Javie to samo zapisujesz jako \`17 / 5\` i \`17 % 5\`.`,
    },
    {
      type: 'input',
      q: md`Ile wynosi \`(n div 10) mod 10\` dla \`n = 4728\`?`,
      answer: '2',
      explain: md`\`4728 div 10 = 472\` (usuwamy ostatnią cyfrę), a \`472 mod 10 = 2\` (bierzemy ostatnią cyfrę tego, co zostało). To przedostatnia cyfra liczby.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'W C++ wynik `7 / 2` dla zmiennych typu `int` wynosi 3.', answer: true },
        { text: 'W Pythonie `7 / 2` daje 3.', answer: false },
        { text: 'W C++ zmienna typu `int` pomieści liczbę 5 000 000 000.', answer: false },
        { text: 'W Pythonie `"12" + "3"` daje napis `"123"`.', answer: true },
      ],
      explain: md`
        - W C++ i Javie dzielenie dwóch liczb całkowitych obcina ułamek: \`7 / 2 = 3\`.
        - W Pythonie \`/\` daje liczbę z przecinkiem (3.5); dzielenie całkowite to \`//\`.
        - \`int\` w C++ mieści liczby do ok. 2,1 mld – na 5 mld potrzebny jest \`long long\`.
        - Dodawanie napisów skleja je, a nie dodaje liczb.
      `,
    },
    {
      type: 'choice',
      q: md`Który warunek sprawdza, czy liczba całkowita \`n\` jest parzysta – i działa także dla liczb ujemnych we wszystkich trzech językach?`,
      options: ['`n % 2 == 0`', '`n / 2 == 0`', '`n % 2 == 1`', '`n // 2 == 0`'],
      answer: 0,
      explain: md`Liczba jest parzysta, gdy reszta z dzielenia przez 2 jest zerem. \`n % 2 == 1\` sprawdza nieparzystość, ale w C++ i Javie dla ujemnych nieparzystych liczb reszta to -1, więc ten warunek by je przeoczył. \`n / 2 == 0\` jest prawdziwe tylko dla 0 i 1.`,
    },
    {
      type: 'code',
      q: md`
        Wczytaj dwie dodatnie liczby całkowite \`a\` i \`b\` (w jednym wierszu, oddzielone spacją). Wypisz w pierwszym wierszu wynik **dzielenia całkowitego** \`a\` przez \`b\`, a w drugim – **resztę** z tego dzielenia.
      `,
      tests: [
        { input: '17 5\n', output: '3\n2\n' },
        { input: '100 7\n', output: '14\n2\n' },
        { input: '9 3\n', output: '3\n0\n' },
        { input: '5 8\n', output: '0\n5\n' },
        { input: '1000000 999\n', output: '1001\n1\n' },
        { input: '2000000000 3\n', output: '666666666\n2\n' },
      ],
      solution: {
        python: code`
          a, b = map(int, input().split())
          print(a // b)
          print(a % b)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long a, b;
              cin >> a >> b;
              cout << a / b << endl;
              cout << a % b << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long a = sc.nextLong();
                  long b = sc.nextLong();
                  System.out.println(a / b);
                  System.out.println(a % b);
              }
          }
        `,
      },
      explain: md`W Pythonie dzielenie całkowite to \`//\`, w C++ i Javie \`/\` na liczbach całkowitych. Resztę daje \`%\` we wszystkich trzech językach.`,
    },
    {
      type: 'code',
      q: md`
        Wczytaj liczbę całkowitą \`n\` (1 ≤ \`n\` ≤ 1 000 000 000) i wypisz sumę \`1 + 2 + … + n\`.

        Podpowiedź: suma ta wynosi \`n · (n + 1) / 2\`. Zastanów się, czy wynik zmieści się w typie \`int\`.
      `,
      tests: [
        { input: '10\n', output: '55\n' },
        { input: '1\n', output: '1\n' },
        { input: '100000\n', output: '5000050000\n' },
        { input: '1000000000\n', output: '500000000500000000\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          print(n * (n + 1) // 2)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              cout << n * (n + 1) / 2 << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  System.out.println(n * (n + 1) / 2);
              }
          }
        `,
      },
      explain: md`Dla \`n\` = 1 000 000 000 suma to ok. 5·10¹⁷ – dużo więcej niż mieści \`int\`. W C++ trzeba użyć \`long long\` (także dla samego \`n\`, bo \`n * (n + 1)\` liczy się w typie \`n\`), w Javie \`long\`. W Pythonie użyj \`//\`, żeby wynik był liczbą całkowitą, a nie np. \`5e+17\`.`,
    },
  ],
  practice: ['2023-maj/3.1', '2024-czerwiec/4.2', '2026-czerwiec/4.1'],
};
