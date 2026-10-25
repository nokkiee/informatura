import { md, code } from '../lib.js';

export default {
  title: 'Pierwszy program: wypisywanie, zmienne i działania',
  summary: 'Jak zbudowany jest program, zmienne i typy, wczytywanie danych, dzielenie całkowite i reszta z dzielenia.',
  minutes: 25,
  intro: md`
    - jak wygląda najprostszy program w [[python: Pythonie]][[cpp: C++]][[java: Javie]] i jak go uruchomić,
    - czym są zmienne i typy[[cpp java:  oraz dlaczego trzeba uważać na zbyt duże liczby]],
    - jak wczytać liczby i wypisać wynik,
    - dzielenie całkowite i reszta z dzielenia (\`div\` i \`mod\`) – działania, które są w prawie każdym zadaniu maturalnym.
  `,
  steps: [
    {
      title: 'Program na maturze',
      body: md`
        Na maturze z informatyki część zadań brzmi: *„Napisz program, który…”*. Dostajesz plik z danymi (np. \`liczby.txt\`), a Twój program ma policzyć odpowiedź – na przykład ile liczb jest parzystych albo która liczba jest największa. Oceniana jest **odpowiedź**, którą zapiszesz w pliku z wynikami, więc program jest narzędziem: ma być poprawny, nie musi być piękny.

        Ta lekcja pokazuje wszystko w języku **[[python: Python]][[cpp: C++]][[java: Java]]**. Jeśli na maturze chcesz pisać w innym języku, zmień go przełącznikiem **Język** nad lekcją (albo u góry okna) – wtedy cała lekcja, przykłady i zadania będą w tamtym języku.

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
        :::python
        - Python wykonuje instrukcje po kolei, od góry – program to po prostu lista poleceń.
        - \`print(...)\` wypisuje to, co jest w nawiasie, i przechodzi do nowego wiersza.
        - Tekst (napis) piszesz w cudzysłowie: \`"Witaj, maturo!"\`.
        :::
        :::cpp
        - \`#include <iostream>\` dołącza obsługę wejścia i wyjścia (\`cin\` i \`cout\`).
        - \`using namespace std;\` pozwala pisać \`cout\` zamiast \`std::cout\`.
        - Program zaczyna się w funkcji \`main\` – to, co między \`{\` a \`}\`, wykonuje się po kolei.
        - \`cout << ...\` wypisuje, a \`endl\` kończy wiersz. \`return 0;\` kończy program („wszystko w porządku”).
        - Każda instrukcja kończy się średnikiem \`;\`.
        :::
        :::java
        - Każdy program w Javie to **klasa** – w Informaturze nazywa się \`Main\` (tak jak plik \`Main.java\`).
        - Program zaczyna się w metodzie \`public static void main(String[] args)\` – to, co między \`{\` a \`}\`, wykonuje się po kolei.
        - \`System.out.println(...)\` wypisuje to, co w nawiasie, i przechodzi do nowego wiersza.
        - Każda instrukcja kończy się średnikiem \`;\`.
        :::

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

        [[python: Typu nie piszesz – zmienna dostaje go razem z wartością (\`a = 7\` to od razu \`int\`, \`x = 2.5\` to \`float\`).]][[cpp java: Typ podajesz przy pierwszym użyciu zmiennej, czyli w **deklaracji**: \`int a = 7;\`. Potem piszesz już samo \`a\`.]]

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

        :::python
        ### Duże liczby
        Liczby całkowite w Pythonie **nie mają górnej granicy** – suma czy iloczyn bardzo dużych liczb wyjdzie dokładnie. Na maturze dane często mają liczby do miliarda, a ich iloczyn ma kilkanaście cyfr – w Pythonie nie musisz się tym przejmować.
        :::
        :::cpp java
        ### Uwaga na duże liczby
        Typ \`int\` mieści liczby tylko do około **2,1 miliarda** (dokładnie 2 147 483 647). Jeśli wynik będzie większy, zmienna się „przekręci” i dostaniesz bzdurę – bez żadnego komunikatu o błędzie. Na maturze dane często mają liczby do miliarda, a ich suma czy iloczyn łatwo przekracza tę granicę.

        > **Zapamiętaj:** Do sum i iloczynów używaj typu [[cpp: \`long long\`]][[java: \`long\`]] – mieści liczby do około 9·10¹⁸. [[cpp: Liczbę większą niż \`int\` zapisaną wprost w kodzie kończ literami \`LL\`.]][[java: Liczbę większą niż \`int\` zapisaną wprost w kodzie kończ literą \`L\`.]]
        :::

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

        | Działanie | pseudokod | Python | C++ / Java (dla liczb typu \`int\`) |
        |---|---|---|---|
        | dzielenie całkowite | \`a div b\` | \`a // b\` | \`a / b\` |
        | reszta z dzielenia | \`a mod b\` | \`a % b\` | \`a % b\` |
        | dzielenie „zwykłe” | \`a / b\` | \`a / b\` (daje np. 3.4) | \`(double) a / b\` |

        :::python
        > **Uwaga:** W Pythonie są **dwa** dzielenia: \`/\` zawsze daje liczbę z przecinkiem (\`7 / 2 = 3.5\`, a nawet \`6 / 2 = 3.0\`), a \`//\` – dzielenie całkowite (\`7 // 2 = 3\`). Gdy liczysz na liczbach całkowitych (cyfry, indeksy, połowa liczby), używaj \`//\`.
        :::
        :::cpp java
        > **Uwaga:** \`7 / 2\` dla liczb typu \`int\` daje **3**, nie 3,5 – ułamek jest obcinany. Jeśli potrzebujesz wyniku z przecinkiem, zamień jedną z liczb na \`double\`, np. \`(double) a / b\` albo \`a / 2.0\`.
        :::

        ### Do czego to się przydaje
        Reszta z dzielenia odpowiada na mnóstwo pytań z zadań:
        - \`n % 2 == 0\` – czy liczba jest **parzysta**,
        - \`n % k == 0\` – czy \`n\` jest **podzielna** przez \`k\`,
        - \`n % 10\` – **ostatnia cyfra** liczby (\`4728 % 10 = 8\`),
        - [[python: \`n // 10\`]][[cpp java: \`n / 10\`]] – liczba **bez ostatniej cyfry** ([[python: \`4728 // 10 = 472\`]][[cpp java: \`4728 / 10 = 472\`]]).

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

        :::python
        > **Uwaga:** Dla liczb **ujemnych** \`//\` zaokrągla **w dół**: \`-7 // 2 = -4\`, a reszta ma znak dzielnika: \`-7 % 2 = 1\`. W zadaniach maturalnych liczby są zwykle nieujemne, ale gdy nie są – sprawdź wynik na przykładzie.
        :::
        :::cpp java
        > **Uwaga:** Dla liczb **ujemnych** ułamek jest obcinany w stronę zera, a reszta ma znak dzielnej: \`-7 / 2 = -3\` i \`-7 % 2 = -1\`. Dlatego parzystość sprawdzaj przez \`n % 2 == 0\` (działa zawsze), a nie nieparzystość przez \`n % 2 == 1\` (dla \`-7\` daje fałsz!) – lepiej \`n % 2 != 0\`.
        :::
      `,
    },
    {
      title: 'Wczytywanie danych',
      body: md`
        Program zwykle coś **wczytuje**, liczy i **wypisuje** wynik. Na maturze dane są w pliku (tym zajmiemy się w lekcji o plikach), ale zasada jest ta sama, co przy wczytywaniu z klawiatury – czyli ze **standardowego wejścia**. Ćwiczenia w lekcjach właśnie tak dostają dane.

        :::python
        \`input()\` wczytuje **cały wiersz jako napis**. Żeby dostać liczbę, trzeba go zamienić: \`int(input())\`. Dwie liczby w jednym wierszu rozdzielisz metodą \`split()\`.
        :::
        :::cpp
        \`cin >> x\` odczytuje kolejną wartość i zapisuje ją w zmiennej \`x\` – typ zmiennej mówi, czego się spodziewać (liczby, napisu). Nie ma znaczenia, czy liczby są w jednym wierszu, czy w kilku: \`cin\` pomija spacje i znaki końca wiersza.
        :::
        :::java
        Do czytania służy \`Scanner\` (z pakietu \`java.util\`, stąd \`import java.util.*;\`). \`sc.nextInt()\` i \`sc.nextLong()\` odczytują kolejną liczbę, \`sc.next()\` – kolejne słowo. Nie ma znaczenia, czy liczby są w jednym wierszu, czy w kilku: \`Scanner\` pomija spacje i znaki końca wiersza.
        :::

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

        :::python
        \`map(int, input().split())\` czytaj tak: weź wiersz, potnij go na kawałki w miejscach spacji (\`split\`) i każdy kawałek zamień na liczbę (\`map(int, …)\`).

        > **Uwaga:** Najczęstszy błąd początkujących: zapomnieć o \`int(...)\`. Wtedy \`"12" + "5"\` daje napis \`"125"\` zamiast liczby 17, a porównanie \`"9" > "10"\` jest prawdziwe, bo napisy porównuje się znak po znaku.
        :::
        :::cpp java
        Zmienne są typu [[cpp: \`long long\`]][[java: \`long\`]], bo iloczyn dwóch dużych liczb nie zmieściłby się w \`int\`.
        :::
      `,
    },
    {
      title: 'Najczęstsze błędy',
      body: md`
        Zanim przejdziesz do testu, lista pułapek, w które najłatwiej wpaść na początku:

        :::python
        1. **Napis zamiast liczby** – wynik \`input()\` albo wiersza z pliku to napis. Zamień go przez \`int(...)\` przed liczeniem.
        2. **\`/\` zamiast \`//\`** – \`/\` daje liczbę z przecinkiem (\`10 / 2 = 5.0\`). Do cyfr, indeksów i połówek używaj \`//\`.
        3. **\`=\` zamiast \`==\`** – \`=\` przypisuje, \`==\` porównuje. \`if x = 5:\` to błąd składni.
        4. **Złe wcięcia** – w Pythonie wcięcie jest częścią programu (zobaczysz to w lekcji o warunkach). Pilnuj, by instrukcje na tym samym poziomie miały tyle samo spacji.
        5. **Wielkość liter** – \`Print\` czy \`INPUT\` nie zadziałają. Python rozróżnia wielkie i małe litery.
        :::
        :::cpp java
        1. **Przepełnienie** – suma wielu liczb albo iloczyn dwóch dużych nie mieści się w \`int\`. Używaj [[cpp: \`long long\`]][[java: \`long\`]].
        2. **Obcięte dzielenie** – \`5 / 2\` to 2. Do średniej potrzebujesz \`double\`.
        3. **\`=\` zamiast \`==\`** – \`=\` przypisuje, \`==\` porównuje. [[cpp: \`if (x = 5)\` skompiluje się i zawsze będzie prawdą!]][[java: \`if (x = 5)\` się nie skompiluje – kompilator zgłosi błąd typu.]]
        4. **Brak średnika** – kompilator pokaże błąd w wierszu *po* tym, w którym go zabrakło.
        5. **Wielkość liter** – [[cpp: \`COUT\` czy \`Main\` zamiast \`main\`]][[java: \`system.out\` czy \`string\` zamiast \`String\`]] nie zadziałają. Język rozróżnia wielkie i małe litery.
        :::

        > **Na maturze:** Zanim zapiszesz odpowiedź, uruchom program na pliku przykładowym (w Informaturze: **Test: dane przykładowe**) i porównaj wynik z tym podanym w treści zadania. To najszybszy sposób, żeby wyłapać błąd.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Jaki będzie wynik działań [[python: \`17 // 5\`]][[cpp java: \`17 / 5\`]] i \`17 % 5\`[[cpp java:  (liczby typu \`int\`)]]?`,
      options: ['3 i 2', '3,4 i 0', '3 i 5', '2 i 3'],
      answer: 0,
      explain: md`17 = 5 · 3 + 2, więc dzielenie całkowite daje 3, a reszta to 2.`,
    },
    {
      type: 'input',
      q: md`Ile wynosi \`(n div 10) mod 10\` dla \`n = 4728\`?`,
      answer: '2',
      explain: md`\`4728 div 10 = 472\` (usuwamy ostatnią cyfrę), a \`472 mod 10 = 2\` (bierzemy ostatnią cyfrę tego, co zostało). To przedostatnia cyfra liczby.`,
    },
    {
      type: 'tf',
      langs: ['python'],
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`7 / 2` daje 3.', answer: false },
        { text: '`7 // 2` daje 3.', answer: true },
        { text: 'Liczba 5 000 000 000 jest za duża, żeby zapisać ją w zmiennej.', answer: false },
        { text: '`"12" + "3"` daje napis `"123"`.', answer: true },
      ],
      explain: md`
        - Nie – \`/\` daje liczbę z przecinkiem: 3.5.
        - Tak – \`//\` to dzielenie całkowite.
        - Nie – liczby całkowite w Pythonie nie mają górnej granicy.
        - Tak – dodawanie napisów skleja je, a nie dodaje liczb.
      `,
    },
    {
      type: 'tf',
      langs: ['cpp'],
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`7 / 2` dla zmiennych typu `int` daje 3.', answer: true },
        { text: '`7 / 2.0` daje 3.5.', answer: true },
        { text: 'Zmienna typu `int` pomieści liczbę 5 000 000 000.', answer: false },
        { text: '`if (x = 5)` sprawdza, czy `x` jest równe 5.', answer: false },
      ],
      explain: md`
        - Tak – dzielenie dwóch liczb całkowitych obcina ułamek.
        - Tak – gdy jedna z liczb jest rzeczywista (\`2.0\`), wynik też jest rzeczywisty.
        - Nie – \`int\` mieści liczby do ok. 2,1 mld; na 5 mld potrzebny jest \`long long\`.
        - Nie – \`=\` przypisuje 5 do \`x\`, a warunek jest zawsze prawdziwy. Porównanie to \`==\`.
      `,
    },
    {
      type: 'tf',
      langs: ['java'],
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`7 / 2` dla zmiennych typu `int` daje 3.', answer: true },
        { text: '`(double) 7 / 2` daje 3.5.', answer: true },
        { text: 'Zmienna typu `int` pomieści liczbę 5 000 000 000.', answer: false },
        { text: '`"12" + 3` daje napis `"123"`.', answer: true },
      ],
      explain: md`
        - Tak – dzielenie dwóch liczb całkowitych obcina ułamek.
        - Tak – rzutowanie na \`double\` sprawia, że dzielenie jest rzeczywiste.
        - Nie – \`int\` mieści liczby do ok. 2,1 mld; na 5 mld potrzebny jest \`long\`.
        - Tak – gdy jedna strona \`+\` jest napisem, druga też zamienia się na napis i są sklejane.
      `,
    },
    {
      type: 'choice',
      q: md`Który warunek sprawdza, czy liczba całkowita \`n\` jest parzysta (także gdy jest ujemna)?`,
      options: ['`n % 2 == 0`', '`n / 2 == 0`', '`n % 2 == 1`', '[[python: `n // 2 == 0`]][[cpp java: `n / 2 * 2 == 1`]]'],
      answer: 0,
      explain: md`Liczba jest parzysta, gdy reszta z dzielenia przez 2 jest zerem. \`n % 2 == 1\` sprawdza nieparzystość[[cpp java: , i to tylko dla liczb nieujemnych: dla ujemnych nieparzystych reszta to -1]]. [[python: \`n / 2 == 0\` i \`n // 2 == 0\` są prawdziwe tylko dla 0 (i \`n // 2\` – także dla 1).]][[cpp java: \`n / 2 == 0\` jest prawdziwe tylko dla -1, 0 i 1, a \`n / 2 * 2\` to \`n\` bez reszty – nigdy nie jest równe 1.]]`,
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
      explain: md`[[python: Dzielenie całkowite to \`//\` (a nie \`/\`, które dałoby liczbę z przecinkiem), resztę daje \`%\`.]][[cpp java: Dzielenie całkowite to \`/\` na liczbach całkowitych, resztę daje \`%\`. Typ [[cpp: \`long long\`]][[java: \`long\`]] nie jest tu konieczny, ale nie zaszkodzi.]]`,
    },
    {
      type: 'code',
      q: md`
        Wczytaj liczbę całkowitą \`n\` (1 ≤ \`n\` ≤ 1 000 000 000) i wypisz sumę \`1 + 2 + … + n\`.

        Podpowiedź: suma ta wynosi \`n · (n + 1) / 2\`. [[python: Pamiętaj, że wynik ma być liczbą całkowitą.]][[cpp java: Zastanów się, czy wynik zmieści się w typie \`int\`.]]
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
      explain: md`[[python: Użyj \`//\`, żeby wynik był liczbą całkowitą – \`/\` dałoby liczbę z przecinkiem, np. \`5e+17\`, a dla dużych \`n\` nawet niedokładną.]][[cpp java: Dla \`n\` = 1 000 000 000 suma to ok. 5·10¹⁷ – dużo więcej niż mieści \`int\`. Trzeba użyć [[cpp: \`long long\`]][[java: \`long\`]] także dla samego \`n\`, bo \`n * (n + 1)\` liczy się w typie \`n\` i przepełniłoby się, zanim wynik trafi do zmiennej.]]`,
    },
  ],
  practice: ['2023-maj/3.1', '2024-czerwiec/4.2', '2026-czerwiec/4.1'],
};
