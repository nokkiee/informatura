import { md, code } from '../lib.js';

export default {
  title: 'Napisy',
  summary: 'Indeksy i fragmenty napisów, porównywanie, odwracanie, kody ASCII i zliczanie znaków.',
  minutes: 35,
  intro: md`
    - jak dostać się do pojedynczego znaku i do fragmentu napisu,
    - jak porównywać, łączyć i odwracać napisy (palindromy!),
    - czym są kody ASCII i jak liczyć „na literach”,
    - jak policzyć, ile razy występuje każda litera.
  `,
  steps: [
    {
      title: 'Napis to ciąg znaków',
      body: md`
        Napis (typ [[python: \`str\`]][[cpp: \`string\`]][[java: \`String\`]]) to ciąg znaków ponumerowanych **od zera**. W napisie \`"matura"\` znak \`m\` ma indeks 0, a ostatni znak \`a\` – indeks 5 (długość − 1).

        | indeks | 0 | 1 | 2 | 3 | 4 | 5 |
        |---|---|---|---|---|---|---|
        | znak | m | a | t | u | r | a |

        > **Uwaga:** W treściach zadań maturalnych pozycje znaków liczy się zwykle **od 1** („pierwszy znak napisu”). W programie pozycja \`k\` z treści to indeks \`k - 1\`. To częste źródło błędu o jeden.

        | operacja | Python | C++ | Java |
        |---|---|---|---|
        | długość | \`len(s)\` | \`s.size()\` | \`s.length()\` |
        | znak o indeksie i | \`s[i]\` | \`s[i]\` | \`s.charAt(i)\` |
        | ostatni znak | \`s[-1]\` | \`s.back()\` | \`s.charAt(s.length() - 1)\` |
        | fragment od i, długości d | \`s[i:i+d]\` | \`s.substr(i, d)\` | \`s.substring(i, i + d)\` |

        :::python
        Wycinek \`s[i:j]\` to znaki od indeksu \`i\` do \`j - 1\` – **koniec nie wchodzi**. Można pominąć początek albo koniec: \`s[:3]\` to pierwsze trzy znaki, \`s[3:]\` – wszystko od indeksu 3. Ujemne indeksy liczą od końca: \`s[-1]\` to ostatni znak, \`s[-2]\` – przedostatni.
        :::
        :::cpp
        Uwaga: drugi argument \`substr\` to **długość** fragmentu, a nie indeks końca: \`s.substr(2, 3)\` to trzy znaki o indeksach 2, 3 i 4. Sam \`s.substr(3)\` to wszystko od indeksu 3 do końca.
        :::
        :::java
        Uwaga: \`substring(i, j)\` bierze znaki od indeksu \`i\` do \`j - 1\` – **koniec nie wchodzi**. Sam \`s.substring(3)\` to wszystko od indeksu 3 do końca.
        :::

        ~~~python run
        s = "informatyka"
        print(len(s), s[0], s[-1])
        print(s[2:6])          # znaki o indeksach 2, 3, 4, 5
        for i in range(len(s)):
            if s[i] == "a":
                print("a na indeksie", i)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s = "informatyka";
            cout << s.size() << " " << s[0] << " " << s.back() << endl;
            cout << s.substr(2, 4) << endl;   // 4 znaki od indeksu 2
            for (int i = 0; i < (int)s.size(); i++)
                if (s[i] == 'a')
                    cout << "a na indeksie " << i << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                String s = "informatyka";
                System.out.println(s.length() + " " + s.charAt(0) + " " + s.charAt(s.length() - 1));
                System.out.println(s.substring(2, 6));   // indeksy 2..5
                for (int i = 0; i < s.length(); i++)
                    if (s.charAt(i) == 'a')
                        System.out.println("a na indeksie " + i);
            }
        }
        ~~~

        [[python: Pojedynczy znak to po prostu napis długości 1 – \`'a'\` i \`"a"\` znaczą to samo.]][[cpp java: Pojedynczy **znak** zapisuje się w apostrofach (\`'a'\`), a **napis** w cudzysłowie (\`"a"\`) – to dwa różne typy: \`char\` i [[cpp: \`string\`]][[java: \`String\`]].]]
      `,
    },
    {
      title: 'Porównywanie, łączenie, odwracanie',
      body: md`
        - **Łączenie:** \`s + t\`.
        - **Równość:** [[python: \`s == t\`.]][[cpp: \`s == t\`.]][[java: \`s.equals(t)\`. **Nie** używaj \`==\` – ono sprawdza, czy to ten sam obiekt w pamięci, i potrafi zwrócić fałsz dla takich samych napisów!]]
        - **Kolejność alfabetyczna (leksykograficzna):** [[python: \`s < t\`]][[cpp: \`s < t\`]][[java: \`s.compareTo(t) < 0\`]]. Porównuje się znak po znaku od lewej; pierwszy różny znak rozstrzyga. Dlatego \`kot\` jest przed \`kotek\` (krótszy początek jest mniejszy), a \`Zebra\` przed \`ala\` (wielkie litery mają mniejsze kody niż małe).

        - **Odwracanie:** [[python: \`s[::-1]\` (wycinek z krokiem −1)]][[cpp: \`string(s.rbegin(), s.rend())\` – nowy napis z liter czytanych od końca]][[java: \`new StringBuilder(s).reverse().toString()\`]].

        **Palindrom** to napis, który czytany od tyłu jest taki sam (np. \`kajak\`). Sprawdzisz to, porównując napis z jego odwróceniem:

        ~~~python run
        for s in ["kajak", "matura", "abba"]:
            print(s, s == s[::-1])
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string slowa[] = {"kajak", "matura", "abba"};
            for (string s : slowa) {
                string odw(s.rbegin(), s.rend());
                cout << s << " " << (s == odw ? "True" : "False") << endl;
            }
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                String[] slowa = {"kajak", "matura", "abba"};
                for (String s : slowa) {
                    String odw = new StringBuilder(s).reverse().toString();
                    System.out.println(s + " " + (s.equals(odw) ? "True" : "False"));
                }
            }
        }
        ~~~

        > **Wskazówka:** Palindrom można też sprawdzić bez odwracania: porównuj [[python: \`s[i]\` z \`s[n - 1 - i]\`]][[cpp: \`s[i]\` z \`s[n - 1 - i]\`]][[java: \`s.charAt(i)\` z \`s.charAt(n - 1 - i)\`]] dla \`i\` od 0 do połowy. Tak trzeba zrobić, gdy w zadaniu „zapisz algorytm” nie wolno używać gotowych funkcji.
      `,
    },
    {
      title: 'Kody ASCII',
      body: md`
        Każdy znak ma swój **kod** – liczbę. Dla liter alfabetu angielskiego, cyfr i podstawowych symboli są to kody **ASCII**. Warto pamiętać trzy:

        | znak | \`'0'\` | \`'A'\` | \`'a'\` |
        |---|---|---|---|
        | kod ASCII | 48 | 65 | 97 |

        Kolejne cyfry i litery mają kolejne kody: \`'1'\` = 49, \`'B'\` = 66, \`'z'\` = 122. Mała litera ma kod o 32 większy od wielkiej.

        [[python: \`ord(c)\` daje kod znaku, a \`chr(k)\` – znak o kodzie \`k\`.]][[cpp java: Znak \`char\` jest liczbą – można go dodawać i odejmować. \`(int) c\` pokaże kod, a \`(char) k\` zamieni kod na znak.]]

        Najczęstsze sztuczki:
        - [[python: \`ord(c) - ord('a')\`]][[cpp java: \`c - 'a'\`]] – **numer litery** w alfabecie: a → 0, b → 1, …, z → 25,
        - [[python: \`ord(c) - ord('0')\`]][[cpp java: \`c - '0'\`]] – **wartość cyfry**: znak \`'7'\` → liczba 7,
        - [[python: \`chr(ord('a') + k)\`]][[cpp java: \`(char) ('a' + k)\`]] – litera o numerze \`k\`.

        Przesunięcie litery o 3 dalej w alfabecie, z „zawinięciem” za \`z\` z powrotem na \`a\` (to szyfr Cezara – wróci w dziale Algorytmika):

        ~~~python run
        s = "xyzabc"
        wynik = ""
        for c in s:
            k = (ord(c) - ord("a") + 3) % 26
            wynik += chr(ord("a") + k)
        print(wynik)
        print(ord("A"), ord("a"), ord("0"))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s = "xyzabc", wynik = "";
            for (char c : s) {
                int k = (c - 'a' + 3) % 26;
                wynik += (char)('a' + k);
            }
            cout << wynik << endl;
            cout << (int)'A' << " " << (int)'a' << " " << (int)'0' << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                String s = "xyzabc";
                StringBuilder wynik = new StringBuilder();
                for (char c : s.toCharArray()) {
                    int k = (c - 'a' + 3) % 26;
                    wynik.append((char) ('a' + k));
                }
                System.out.println(wynik);
                System.out.println((int) 'A' + " " + (int) 'a' + " " + (int) '0');
            }
        }
        ~~~

        :::java
        > **Wskazówka:** Dopisywanie do napisu w pętli (\`s = s + c\`) przy długich napisach jest wolne – lepiej użyć \`StringBuilder\` i metody \`append\`, jak wyżej.
        :::
      `,
    },
    {
      title: 'Zliczanie znaków',
      body: md`
        Pytania typu „która litera występuje najczęściej” albo „czy dwa słowa składają się z tych samych liter” rozwiązuje się **tablicą liczników**: 26 zer, po jednym na każdą literę. Dla każdego znaku zwiększasz licznik o numerze [[python: \`ord(c) - ord('a')\`]][[cpp java: \`c - 'a'\`]].

        ~~~python run
        s = "abrakadabra"
        licznik = [0] * 26
        for c in s:
            licznik[ord(c) - ord("a")] += 1
        for i in range(26):
            if licznik[i] > 0:
                print(chr(ord("a") + i), licznik[i])
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s = "abrakadabra";
            int licznik[26] = {0};
            for (char c : s) licznik[c - 'a']++;
            for (int i = 0; i < 26; i++)
                if (licznik[i] > 0)
                    cout << (char)('a' + i) << " " << licznik[i] << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                String s = "abrakadabra";
                int[] licznik = new int[26];
                for (char c : s.toCharArray()) licznik[c - 'a']++;
                for (int i = 0; i < 26; i++)
                    if (licznik[i] > 0)
                        System.out.println((char) ('a' + i) + " " + licznik[i]);
            }
        }
        ~~~

        Dwa słowa są **anagramami** (składają się z tych samych liter w innej kolejności, np. \`kot\` i \`tok\`), gdy mają takie same tablice liczników – albo gdy po posortowaniu ich liter dostajesz ten sam napis ([[python: \`sorted(a) == sorted(b)\`]][[cpp: \`sort(a.begin(), a.end())\`, to samo dla \`b\`, i \`a == b\`]][[java: \`Arrays.sort\` na \`a.toCharArray()\` i \`b.toCharArray()\`, potem \`Arrays.equals\`]]).

        > **Na maturze:** Gotowe funkcje są dozwolone w zadaniach „napisz program”: [[python: \`s.count("a")\` policzy wystąpienia litery, \`"kot" in s\` sprawdzi, czy napis zawiera fragment, a \`s.find("kot")\` poda indeks pierwszego wystąpienia (lub -1).]][[cpp: \`s.find("kot")\` poda indeks pierwszego wystąpienia fragmentu (albo \`string::npos\`, gdy go nie ma), a \`count(s.begin(), s.end(), 'a')\` z \`<algorithm>\` policzy wystąpienia litery.]][[java: \`s.contains("kot")\` sprawdzi, czy napis zawiera fragment, a \`s.indexOf("kot")\` poda indeks pierwszego wystąpienia (lub -1).]]
      `,
    },
    {
      title: 'Fragmenty napisów w zadaniach',
      body: md`
        Częsty typ zadania: sprawdź każdy fragment określonej długości. Na przykład „ile razy w słowie występuje fragment *k?t*, gdzie *?* to dowolna litera”. Przechodzisz po wszystkich pozycjach startowych \`i\` od 0 do \`n - 3\` i patrzysz na trzy znaki \`s[i]\`, \`s[i+1]\`, \`s[i+2]\`:

        ~~~python run
        s = "kotkatkit"
        ile = 0
        for i in range(len(s) - 2):
            if s[i] == "k" and s[i + 2] == "t":
                ile += 1
        print(ile)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        int main() {
            string s = "kotkatkit";
            int ile = 0;
            for (int i = 0; i + 2 < (int)s.size(); i++)
                if (s[i] == 'k' && s[i + 2] == 't') ile++;
            cout << ile << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                String s = "kotkatkit";
                int ile = 0;
                for (int i = 0; i + 2 < s.length(); i++)
                    if (s.charAt(i) == 'k' && s.charAt(i + 2) == 't') ile++;
                System.out.println(ile);
            }
        }
        ~~~

        Zwróć uwagę na granicę pętli: ostatni fragment długości 3 zaczyna się na indeksie \`n - 3\`. [[python: \`range(len(s) - 2)\` kończy się właśnie na \`n - 3\`.]][[cpp java: Warunek \`i + 2 < n\` kończy pętlę właśnie na \`n - 3\`.]] Gdybyś wyszedł dalej, [[python: \`s[i + 2]\` wyszedłby poza napis i program zakończyłby się błędem *IndexError*]][[cpp: \`s[i + 2]\` wyszedłby poza napis i program czytałby „śmieci” z pamięci – bez żadnego komunikatu]][[java: \`s.charAt(i + 2)\` wyszedłby poza napis i program zakończyłby się wyjątkiem]].

        :::cpp
        > **Uwaga:** \`s.size()\` jest liczbą bez znaku. Warunek \`i < s.size() - 3\` dla napisu krótszego niż 3 znaki daje ogromną liczbę zamiast ujemnej! Bezpieczniej pisać \`i + 3 <= (int)s.size()\` albo rzutować na \`int\`, jak wyżej.
        :::
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Co wypisze [[python: \`print("informatyka"[2:5])\`]][[cpp: \`cout << s.substr(2, 3)\` dla \`string s = "informatyka"\`]][[java: \`System.out.println("informatyka".substring(2, 5))\`]]?`,
      options: ['`for`', '`nfo`', '`form`', '`orm`'],
      answer: 0,
      explain: md`Indeksy liczymy od 0: i(0) n(1) **f(2) o(3) r(4)** m(5)… [[python: Wycinek \`[2:5]\` to indeksy 2, 3 i 4 – bez 5.]][[cpp: \`substr(2, 3)\` to 3 znaki od indeksu 2: indeksy 2, 3 i 4.]][[java: \`substring(2, 5)\` to indeksy 2, 3 i 4 – bez 5.]]`,
    },
    {
      type: 'input',
      q: md`Jaki znak daje [[python: \`chr(ord("A") + 2)\`]][[cpp java: \`(char) ('A' + 2)\`]]?`,
      answer: ['C'],
      exact: true,
      explain: md`Kod \`'A'\` to 65, 65 + 2 = 67, a znak o kodzie 67 to \`C\`. Kolejne litery mają kolejne kody.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '[[python: `s == t` sprawdza, czy napisy mają tę samą treść.]][[cpp: `s == t` sprawdza, czy napisy mają tę samą treść.]][[java: Napisy najlepiej porównywać metodą `equals`, a nie operatorem `==`.]]', answer: true },
        { text: '[[python: `s[-1]` to ostatni znak napisu `s`.]][[cpp: `s[s.size() - 1]` to ostatni znak napisu `s`.]][[java: `s.charAt(s.length() - 1)` to ostatni znak napisu `s`.]]', answer: true },
        { text: '[[python: `s[2:3]` to fragment od indeksu 2 do indeksu 3 włącznie.]][[cpp: `s.substr(2, 3)` to fragment od indeksu 2 do indeksu 3.]][[java: `s.substring(2, 3)` to fragment od indeksu 2 do indeksu 3 włącznie.]]', answer: false },
        { text: 'W kodzie ASCII każda wielka litera ma większy kod niż każda mała.', answer: false },
      ],
      explain: md`
        - Tak[[java:  – \`==\` porównuje obiekty, nie treść]].
        - Tak[[python:  – ujemne indeksy liczą od końca]][[cpp java:  – ostatni indeks to długość − 1]].
        - Nie – [[python: koniec wycinka nie wchodzi: \`s[2:3]\` to jeden znak o indeksie 2.]][[cpp: drugi argument \`substr\` to **długość**: \`substr(2, 3)\` to trzy znaki o indeksach 2, 3, 4.]][[java: koniec nie wchodzi: \`substring(2, 3)\` to jeden znak o indeksie 2.]]
        - Nie – odwrotnie: \`'A'\` = 65, \`'a'\` = 97, więc wielkie litery mają mniejsze kody.
      `,
    },
    {
      type: 'input',
      q: md`Słowa \`kotek\`, \`kot\`, \`Kot\` i \`koala\` posortowano w kolejności leksykograficznej (rosnąco, według kodów ASCII). Które słowo jest **pierwsze**?`,
      answer: ['Kot'],
      exact: true,
      explain: md`\`'K'\` (75) ma mniejszy kod niż \`'k'\` (107), więc \`Kot\` jest przed wszystkimi słowami na małą literę. Dalej byłyby: \`koala\` (bo \`'a'\` < \`'t'\`), \`kot\`, \`kotek\` (krótszy początek przed dłuższym).`,
    },
    {
      type: 'code',
      q: md`Wczytaj jedno słowo złożone z małych liter. Wypisz \`TAK\`, jeśli jest palindromem, albo \`NIE\` w przeciwnym razie.`,
      tests: [
        { input: 'kajak\n', output: 'TAK\n' },
        { input: 'matura\n', output: 'NIE\n' },
        { input: 'a\n', output: 'TAK\n' },
        { input: 'abba\n', output: 'TAK\n' },
        { input: 'ab\n', output: 'NIE\n' },
        { input: 'abcdcbaa\n', output: 'NIE\n' },
      ],
      solution: {
        python: code`
          s = input().strip()
          print("TAK" if s == s[::-1] else "NIE")
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string s;
              cin >> s;
              string odw(s.rbegin(), s.rend());
              cout << (s == odw ? "TAK" : "NIE") << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  String s = sc.next();
                  String odw = new StringBuilder(s).reverse().toString();
                  System.out.println(s.equals(odw) ? "TAK" : "NIE");
              }
          }
        `,
      },
      explain: md`Palindrom = napis równy swojemu odwróceniu. [[python: \`input()\` usuwa znak końca wiersza, ale przy wierszach z pliku pamiętaj o \`strip()\` – inaczej \`"kajak\n"\` nie będzie palindromem.]][[cpp: Porównujesz \`s == string(s.rbegin(), s.rend())\`.]][[java: Porównanie przez \`equals\`, nie \`==\`.]]`,

    },
    {
      type: 'code',
      q: md`
        Wczytaj słowo złożone z małych liter alfabetu angielskiego (co najwyżej 100 000 znaków). Wypisz literę, która występuje w nim **najczęściej**, i liczbę jej wystąpień, oddzielone spacją. Jeśli kilka liter występuje tyle samo razy, wypisz tę, która jest **najwcześniej w alfabecie**.
      `,
      tests: [
        { input: 'abrakadabra\n', output: 'a 5\n' },
        { input: 'zzyy\n', output: 'y 2\n' },
        { input: 'q\n', output: 'q 1\n' },
        { input: 'mississippi\n', output: 'i 4\n' },
        { input: 'informatyka\n', output: 'a 2\n' },
      ],
      solution: {
        python: code`
          s = input().strip()
          licznik = [0] * 26
          for c in s:
              licznik[ord(c) - ord("a")] += 1
          najlepsza = 0
          for i in range(26):
              if licznik[i] > licznik[najlepsza]:
                  najlepsza = i
          print(chr(ord("a") + najlepsza), licznik[najlepsza])
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string s;
              cin >> s;
              int licznik[26] = {0};
              for (char c : s) licznik[c - 'a']++;
              int najlepsza = 0;
              for (int i = 1; i < 26; i++)
                  if (licznik[i] > licznik[najlepsza]) najlepsza = i;
              cout << (char)('a' + najlepsza) << " " << licznik[najlepsza] << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  String s = sc.next();
                  int[] licznik = new int[26];
                  for (char c : s.toCharArray()) licznik[c - 'a']++;
                  int najlepsza = 0;
                  for (int i = 1; i < 26; i++)
                      if (licznik[i] > licznik[najlepsza]) najlepsza = i;
                  System.out.println((char) ('a' + najlepsza) + " " + licznik[najlepsza]);
              }
          }
        `,
      },
      explain: md`Tablica 26 liczników, potem maksimum po literach od \`a\` do \`z\`. Warunek \`>\` (a nie \`>=\`) sprawia, że przy remisie zostaje litera wcześniejsza w alfabecie: w *zzyy* obie litery występują dwa razy, a wynikiem jest \`y\`. Szukanie maksimum w napisie znak po znaku (zamiast po alfabecie) dałoby przy remisie literę, która pierwsza pojawiła się w słowie – czyli coś innego, niż chce zadanie.`,
    },
  ],
  practice: ['2025-maj/2.1', '2024-czerwiec/3.1', '2024-czerwiec/3.2', '2023-czerwiec/3.1', '2026-czerwiec/3.1', '2026-maj/3.1'],
};
