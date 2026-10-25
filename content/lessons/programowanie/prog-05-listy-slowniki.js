import { md, code } from '../lib.js';

export default {
  title: 'Listy, słowniki i sortowanie',
  summary: 'Kiedy zapamiętać dane w liście, sąsiednie elementy i najdłuższe ciągi, sortowanie, słowniki do zliczania i zbiory.',
  minutes: 35,
  intro: md`
    - kiedy dane trzeba zapamiętać w liście (tablicy), a kiedy wystarczy jeden przebieg,
    - jak porównywać sąsiednie elementy i szukać najdłuższego ciągu,
    - jak sortować – także według własnego klucza,
    - jak słownik (mapa) liczy wystąpienia czegokolwiek, a zbiór usuwa powtórzenia.
  `,
  steps: [
    {
      title: 'Lista – dane w pamięci',
      body: md`
        Licznik, suma czy maksimum liczą się „w locie”, w jednym przejściu przez dane. Ale część pytań wymaga zapamiętania wszystkich danych: gdy trzeba je **posortować**, przejrzeć **kilka razy** (np. najpierw średnia, potem porównania) albo porównać **dalekie** elementy. Wtedy używasz listy:

        | | Python | C++ | Java |
        |---|---|---|---|
        | utworzenie | \`t = []\` | \`vector<int> t;\` | \`List<Integer> t = new ArrayList<>();\` |
        | dopisanie na koniec | \`t.append(x)\` | \`t.push_back(x);\` | \`t.add(x);\` |
        | liczba elementów | \`len(t)\` | \`t.size()\` | \`t.size()\` |
        | element i (od 0) | \`t[i]\` | \`t[i]\` | \`t.get(i)\` |
        | n zer | \`[0] * n\` | \`vector<int> t(n, 0);\` | \`new int[n]\` (tablica) |

        W Javie dla znanej z góry liczby elementów wygodniejsza jest zwykła tablica \`int[] t = new int[n];\` (dostęp \`t[i]\`). W C++ \`vector\` wymaga \`#include <vector>\`.

        ~~~python run
        t = []
        for x in [4, 8, 15, 16, 23, 42]:
            t.append(x)
        print(len(t), t[0], t[-1])
        print(t[1:4])
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            vector<int> t;
            for (int x : {4, 8, 15, 16, 23, 42}) t.push_back(x);
            cout << t.size() << " " << t[0] << " " << t.back() << endl;
            for (int i = 1; i < 4; i++) cout << t[i] << " ";
            cout << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                List<Integer> t = new ArrayList<>();
                for (int x : new int[]{4, 8, 15, 16, 23, 42}) t.add(x);
                System.out.println(t.size() + " " + t.get(0) + " " + t.get(t.size() - 1));
                System.out.println(t.subList(1, 4));
            }
        }
        ~~~
      `,
    },
    {
      title: 'Sąsiednie elementy i najdłuższy ciąg',
      body: md`
        Bardzo częsty motyw: porównujesz element z **poprzednim** (\`t[i]\` i \`t[i-1]\`). Tak liczy się m.in. różnice między sąsiadami albo **najdłuższy fragment** spełniający warunek, np. najdłuższy ciąg kolejnych liczb rosnących.

        Schemat: trzymasz długość **bieżącego** ciągu i **najlepszą** dotąd. Jeśli warunek dla pary sąsiadów jest spełniony, bieżący ciąg się wydłuża; jeśli nie – zaczyna od nowa (od długości 1).

        ~~~python run
        t = [3, 5, 7, 2, 4, 6, 8, 1]
        biezacy = 1
        najlepszy = 1
        for i in range(1, len(t)):
            if t[i] > t[i - 1]:
                biezacy += 1
            else:
                biezacy = 1
            najlepszy = max(najlepszy, biezacy)
        print(najlepszy)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <vector>
        #include <algorithm>
        using namespace std;

        int main() {
            vector<int> t = {3, 5, 7, 2, 4, 6, 8, 1};
            int biezacy = 1, najlepszy = 1;
            for (int i = 1; i < (int)t.size(); i++) {
                if (t[i] > t[i - 1]) biezacy++;
                else biezacy = 1;
                najlepszy = max(najlepszy, biezacy);
            }
            cout << najlepszy << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int[] t = {3, 5, 7, 2, 4, 6, 8, 1};
                int biezacy = 1, najlepszy = 1;
                for (int i = 1; i < t.length; i++) {
                    if (t[i] > t[i - 1]) biezacy++;
                    else biezacy = 1;
                    najlepszy = Math.max(najlepszy, biezacy);
                }
                System.out.println(najlepszy);
            }
        }
        ~~~

        Wynik 4 to ciąg 2, 4, 6, 8. Pętla zaczyna się od \`i = 1\`, bo element o indeksie 0 nie ma poprzednika.

        > **Na maturze:** Gdy trzeba podać też **początek** najdłuższego ciągu, zapamiętuj przy każdej poprawie wyniku pozycję startu: \`start = i - biezacy + 1\`. Uważaj, czy zadanie liczy pozycje od 0, czy od 1.
      `,
    },
    {
      title: 'Sortowanie',
      body: md`
        Gotowe sortowanie jest szybkie i pewne – w zadaniach „napisz program” używaj go śmiało (własne algorytmy sortowania są w dziale Algorytmika).

        | | Python | C++ | Java |
        |---|---|---|---|
        | rosnąco | \`t.sort()\` lub \`sorted(t)\` | \`sort(t.begin(), t.end());\` | \`Collections.sort(t);\` / \`Arrays.sort(t);\` |
        | malejąco | \`t.sort(reverse=True)\` | \`sort(t.rbegin(), t.rend());\` | \`t.sort(Collections.reverseOrder());\` |

        Uwaga w Pythonie: \`t.sort()\` sortuje listę **w miejscu** i zwraca \`None\`, a \`sorted(t)\` zwraca **nową** posortowaną listę. Pisanie \`t = t.sort()\` to błąd – zgubisz listę.

        ### Sortowanie według klucza
        Słowa najpierw według długości, a przy równej długości alfabetycznie:

        ~~~python run
        slowa = ["kot", "zebra", "ala", "pies", "as"]
        slowa.sort(key=lambda s: (len(s), s))
        print(slowa)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <vector>
        #include <string>
        #include <algorithm>
        using namespace std;

        int main() {
            vector<string> slowa = {"kot", "zebra", "ala", "pies", "as"};
            sort(slowa.begin(), slowa.end(), [](const string& a, const string& b) {
                if (a.size() != b.size()) return a.size() < b.size();
                return a < b;
            });
            for (auto& s : slowa) cout << s << " ";
            cout << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                List<String> slowa = new ArrayList<>(List.of("kot", "zebra", "ala", "pies", "as"));
                slowa.sort(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
                System.out.println(slowa);
            }
        }
        ~~~

        - **Python:** \`key=lambda s: (len(s), s)\` – sortuj według pary (długość, słowo); pary porównuje się najpierw po pierwszym elemencie.
        - **C++:** trzeci argument \`sort\` to funkcja „czy \`a\` ma być przed \`b\`”.
        - **Java:** \`Comparator.comparing(...).thenComparing(...)\`.

        > **Wskazówka:** „k-ta największa liczba” to po prostu \`sorted(t, reverse=True)[k - 1]\`. Zwróć uwagę, czy zadanie liczy powtórzenia – jeśli liczby mają być różne, najpierw usuń duplikaty (zbiór, następny krok).
      `,
    },
    {
      title: 'Słownik i zbiór',
      body: md`
        **Słownik** (mapa) przechowuje pary *klucz → wartość*. Idealnie nadaje się do **zliczania**: kluczem jest to, co liczysz (słowo, liczba, para znaków), a wartością – liczba wystąpień. Tablica 26 liczników z lekcji o napisach to szczególny przypadek: działa tylko dla liter, a słownik – dla czegokolwiek.

        **Zbiór** (set) przechowuje elementy **bez powtórzeń** – \`len(set(t))\` to liczba różnych elementów.

        | | Python | C++ | Java |
        |---|---|---|---|
        | słownik | \`d = {}\` | \`map<string, int> d;\` | \`Map<String, Integer> d = new HashMap<>();\` |
        | zwiększ licznik | \`d[k] = d.get(k, 0) + 1\` | \`d[k]++;\` | \`d.merge(k, 1, Integer::sum);\` |
        | czy klucz jest | \`k in d\` | \`d.count(k)\` | \`d.containsKey(k)\` |
        | zbiór | \`s = set()\`, \`s.add(x)\` | \`set<int> s; s.insert(x);\` | \`Set<Integer> s = new HashSet<>(); s.add(x);\` |

        ~~~python run
        slowa = "ala ma kota a kot ma ale ala".split()
        d = {}
        for w in slowa:
            d[w] = d.get(w, 0) + 1
        for w in sorted(d):
            print(w, d[w])
        print("roznych:", len(set(slowa)))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <sstream>
        #include <map>
        #include <set>
        #include <string>
        using namespace std;

        int main() {
            istringstream in("ala ma kota a kot ma ale ala");
            map<string, int> d;
            set<string> rozne;
            string w;
            while (in >> w) {
                d[w]++;
                rozne.insert(w);
            }
            for (auto& [slowo, ile] : d) cout << slowo << " " << ile << endl;
            cout << "roznych: " << rozne.size() << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                String[] slowa = "ala ma kota a kot ma ale ala".split(" ");
                Map<String, Integer> d = new TreeMap<>();
                for (String w : slowa) d.merge(w, 1, Integer::sum);
                for (var e : d.entrySet()) System.out.println(e.getKey() + " " + e.getValue());
                System.out.println("roznych: " + new HashSet<>(Arrays.asList(slowa)).size());
            }
        }
        ~~~

        W C++ \`map\` trzyma klucze **posortowane**, a w Javie \`TreeMap\` też (\`HashMap\` – w nieokreślonej kolejności). W Pythonie słownik pamięta kolejność dodawania; posortowane klucze daje \`sorted(d)\`.

        > **Uwaga:** W C++ samo odczytanie \`d[k]\` dla nieistniejącego klucza **dodaje** go do mapy z wartością 0. Do sprawdzania, czy klucz jest, używaj \`d.count(k)\`.
      `,
    },
    {
      title: 'Którą strukturę wybrać',
      body: md`
        | Pytanie w zadaniu | Co wystarczy |
        |---|---|
        | ile elementów spełnia warunek, suma, maksimum | jeden przebieg, bez listy |
        | porównanie z poprzednim / następnym elementem | zmienna z poprzednim elementem albo lista |
        | k-ty największy, mediana, „uporządkuj” | lista + sortowanie |
        | ile razy występuje każdy element, najczęstszy element | słownik (albo tablica liczników) |
        | ile jest różnych elementów, czy element już był | zbiór |
        | czy dwa słowa mają te same litery | posortowane litery albo liczniki liter |

        > **Na maturze:** Pliki maturalne są niewielkie (zwykle do kilku tysięcy wierszy), więc zapamiętanie wszystkiego w liście nigdy nie jest problemem. Ważniejsze, żeby program był prosty i poprawny.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`
        Co wypisze ten program w Pythonie?
        ~~~python
        t = [3, 1, 2]
        t.append(5)
        t.sort()
        print(t[1])
        ~~~
      `,
      answer: '2',
      explain: md`Po \`append\` lista to [3, 1, 2, 5], po sortowaniu [1, 2, 3, 5]. Indeks 1 to drugi element: 2.`,
    },
    {
      type: 'choice',
      q: md`Chcesz policzyć, ile razy każde słowo występuje w pliku. Której struktury najlepiej użyć?`,
      options: ['słownika (mapy): słowo → liczba wystąpień', 'zbioru słów', 'posortowanej listy liczb', 'jednej zmiennej licznika'],
      answer: 0,
      explain: md`Słownik przypisuje każdemu słowu jego licznik. Zbiór powie tylko, **jakie** słowa wystąpiły (bez liczby wystąpień). Posortowana lista słów też by się dała użyć (równe słowa leżą obok siebie), ale słownik jest prostszy.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Zbiór (set) nie przechowuje powtórzeń.', answer: true },
        { text: 'W Pythonie `t = t.sort()` zostawia w `t` posortowaną listę.', answer: false },
        { text: 'Elementy `vector` w C++ i listy w Pythonie mają indeksy od 0.', answer: true },
        { text: 'W C++ odczytanie `d[k]` z mapy nigdy jej nie zmienia.', answer: false },
      ],
      explain: md`
        - Tak – dodanie elementu, który już jest, nic nie zmienia.
        - Nie – \`sort()\` zwraca \`None\`, więc w \`t\` będzie \`None\`. Wystarczy samo \`t.sort()\` albo \`t = sorted(t)\`.
        - Tak.
        - Nie – \`d[k]\` dla brakującego klucza wstawia go z wartością domyślną (0).
      `,
    },
    {
      type: 'input',
      q: md`Jaka jest długość najdłuższego fragmentu złożonego z kolejnych elementów **ściśle rosnących** w ciągu 5, 1, 2, 3, 3, 4, 9, 10, 2?`,
      answer: '4',
      explain: md`Fragmenty rosnące: 5 | 1, 2, 3 | 3, 4, 9, 10 | 2. Najdłuższy to 3, 4, 9, 10 – cztery elementy. Para 3, 3 przerywa ciąg, bo nie jest **ściśle** rosnąca.`,
    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu jest \`n\` (1 ≤ \`n\` ≤ 100 000), w drugim \`n\` liczb całkowitych. Wypisz długość najdłuższego fragmentu złożonego z **kolejnych** liczb, w którym każda liczba jest **nie mniejsza** od poprzedniej (ciąg niemalejący).
      `,
      tests: [
        { input: '8\n3 5 7 2 4 6 8 1\n', output: '4\n' },
        { input: '5\n5 4 3 2 1\n', output: '1\n' },
        { input: '6\n1 1 1 2 2 0\n', output: '5\n' },
        { input: '1\n7\n', output: '1\n' },
        { input: '7\n-5 -3 -3 10 9 9 9\n', output: '4\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          t = list(map(int, input().split()))
          biezacy = najlepszy = 1
          for i in range(1, n):
              biezacy = biezacy + 1 if t[i] >= t[i - 1] else 1
              najlepszy = max(najlepszy, biezacy)
          print(najlepszy)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          #include <algorithm>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              vector<long long> t(n);
              for (auto& x : t) cin >> x;
              int biezacy = 1, najlepszy = 1;
              for (int i = 1; i < n; i++) {
                  biezacy = t[i] >= t[i - 1] ? biezacy + 1 : 1;
                  najlepszy = max(najlepszy, biezacy);
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
                  int n = sc.nextInt();
                  long[] t = new long[n];
                  for (int i = 0; i < n; i++) t[i] = sc.nextLong();
                  int biezacy = 1, najlepszy = 1;
                  for (int i = 1; i < n; i++) {
                      biezacy = t[i] >= t[i - 1] ? biezacy + 1 : 1;
                      najlepszy = Math.max(najlepszy, biezacy);
                  }
                  System.out.println(najlepszy);
              }
          }
        `,
      },
      explain: md`Schemat „bieżący i najlepszy” z drugiego kroku lekcji, z warunkiem \`>=\` zamiast \`>\` (niemalejący, więc równe sąsiednie liczby nie przerywają ciągu). Ciąg z jednej liczby ma długość 1, dlatego obie zmienne zaczynają od 1.`,
    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu jest \`n\` (1 ≤ \`n\` ≤ 10 000), w kolejnych \`n\` wierszach – słowa z małych liter (po jednym w wierszu). Wypisz słowo, które występuje **najczęściej**, i liczbę jego wystąpień, oddzielone spacją. Przy remisie wypisz słowo **pierwsze alfabetycznie**.
      `,
      tests: [
        { input: '6\nkot\npies\nkot\nmysz\npies\nkot\n', output: 'kot 3\n' },
        { input: '4\nb\na\nb\na\n', output: 'a 2\n' },
        { input: '1\nmatura\n', output: 'matura 1\n' },
        { input: '5\nzz\nz\nzzz\nz\nzz\n', output: 'z 2\n' },
        { input: '3\nala\nala\nala\n', output: 'ala 3\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          d = {}
          for _ in range(n):
              w = input().strip()
              d[w] = d.get(w, 0) + 1
          najlepsze = min(d, key=lambda w: (-d[w], w))
          print(najlepsze, d[najlepsze])
        `,
        cpp: code`
          #include <iostream>
          #include <map>
          #include <string>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              map<string, int> d;
              for (int i = 0; i < n; i++) {
                  string w;
                  cin >> w;
                  d[w]++;
              }
              string najlepsze;
              int maks = 0;
              for (auto& [w, ile] : d)        // klucze są posortowane alfabetycznie
                  if (ile > maks) {
                      maks = ile;
                      najlepsze = w;
                  }
              cout << najlepsze << " " << maks << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  Map<String, Integer> d = new TreeMap<>();
                  for (int i = 0; i < n; i++) d.merge(sc.next(), 1, Integer::sum);
                  String najlepsze = "";
                  int maks = 0;
                  for (var e : d.entrySet())   // TreeMap: klucze posortowane alfabetycznie
                      if (e.getValue() > maks) {
                          maks = e.getValue();
                          najlepsze = e.getKey();
                      }
                  System.out.println(najlepsze + " " + maks);
              }
          }
        `,
      },
      explain: md`Słownik zlicza wystąpienia. Remis rozstrzyga kolejność przeglądania: w C++ \`map\` i w Javie \`TreeMap\` klucze idą alfabetycznie, więc warunek \`>\` zostawia pierwsze alfabetycznie słowo. W Pythonie \`min(d, key=lambda w: (-d[w], w))\` szuka słowa z największą liczbą wystąpień (minus odwraca kolejność), a przy remisie – najmniejszego alfabetycznie.`,
    },
  ],
  practice: ['2023-maj/3.2', '2025-czerwiec/3.2', '2024-maj/4.2', '2026-czerwiec/3.3', '2026-maj/4.3', '2023-czerwiec/3.2', '2023-maj/3.4'],
};
