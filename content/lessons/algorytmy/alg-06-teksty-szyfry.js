import { md, code } from '../lib.js';

export default {
  title: 'Szyfry i algorytmy na tekstach',
  summary: 'Szyfr Cezara i ROT13, szyfry przestawieniowe, szyfr Vigenère’a, wyszukiwanie wzorca w tekście, porównywanie i anagramy.',
  minutes: 35,
  intro: md`
    - jak działa szyfr Cezara (i ROT13) i jak go odwrócić,
    - czym różni się szyfr **podstawieniowy** od **przestawieniowego**,
    - szyfr Vigenère’a – Cezar z kluczem-słowem,
    - jak znaleźć wszystkie wystąpienia wzorca w tekście (także nakładające się),
    - jak algorytmicznie porównać napisy i sprawdzić anagramy.
  `,
  steps: [
    {
      title: 'Szyfr Cezara i ROT13',
      body: md`
        **Szyfr Cezara** zamienia każdą literę na literę o \`k\` miejsc dalej w alfabecie (klucz \`k\`), „zawijając” z \`z\` na \`a\`. Dla \`k = 3\`: a → d, b → e, …, x → a, y → b, z → c. \`KOT\` → \`NRW\`.

        W numeracji liter od 0 (\`a\` = 0, …, \`z\` = 25):
        - szyfrowanie: \`nowa = (stara + k) mod 26\`,
        - odszyfrowanie: \`stara = (nowa − k) mod 26\`, czyli to samo co szyfrowanie kluczem \`26 − k\`.

        :::python
        > **Wskazówka:** W Pythonie \`(nowa − k) % 26\` zawsze daje wynik z przedziału 0–25, także gdy \`nowa − k\` jest ujemne (\`(0 − 3) % 26 = 23\`) – zawijanie dzieje się samo.
        :::
        :::cpp java
        > **Uwaga:** \`(nowa − k) % 26\` może być **ujemne** (np. \`(0 − 3) % 26 = −3\`). Dodaj 26 przed resztą: \`(nowa − k + 26) % 26\`.
        :::

        **ROT13** to Cezar z \`k = 13\`. Ponieważ 13 + 13 = 26, zaszyfrowanie dwa razy daje tekst wyjściowy – ta sama operacja szyfruje i odszyfrowuje.

        Cezar jest **szyfrem podstawieniowym**: każda litera zawsze zamienia się na tę samą literę. Dlatego łatwo go złamać – wystarczy sprawdzić 25 kluczy albo porównać częstości liter z typowymi dla języka.

        ~~~python run
        def cezar(s, k):
            wynik = ""
            for c in s:
                wynik += chr((ord(c) - ord("a") + k) % 26 + ord("a"))
            return wynik

        print(cezar("kot", 3), cezar("nrw", -3), cezar(cezar("matura", 13), 13))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        string cezar(const string& s, int k) {
            string wynik = "";
            for (char c : s) wynik += char(((c - 'a' + k) % 26 + 26) % 26 + 'a');
            return wynik;
        }

        int main() {
            cout << cezar("kot", 3) << " " << cezar("nrw", -3) << " " << cezar(cezar("matura", 13), 13) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static String cezar(String s, int k) {
                StringBuilder wynik = new StringBuilder();
                for (char c : s.toCharArray()) wynik.append((char) (((c - 'a' + k) % 26 + 26) % 26 + 'a'));
                return wynik.toString();
            }

            public static void main(String[] args) {
                System.out.println(cezar("kot", 3) + " " + cezar("nrw", -3) + " " + cezar(cezar("matura", 13), 13));
            }
        }
        ~~~
      `,
    },
    {
      title: 'Szyfry przestawieniowe i Vigenère',
      body: md`
        **Szyfr przestawieniowy** nie zmienia liter, tylko ich **kolejność**. Przykład: zapisz tekst wierszami po \`k\` liter i odczytaj kolumnami. Dla \`INFORMATYKA\` i \`k = 3\`:

        ~~~text
        I N F
        O R M
        A T Y
        K A
        ~~~

        Kolumnami: \`IOAK\` + \`NRTA\` + \`FMY\` = \`IOAKNRTAFMY\`. Szyfrogram ma te same litery co tekst jawny – po samej częstości liter nie da się go złamać, ale jest wrażliwy na zgadywanie układu.

        Inne przestawienia spotykane w zadaniach: odwrócenie całego tekstu albo kolejnych bloków, zamiana sąsiednich par liter, przesunięcie cykliczne. W zadaniach maturalnych przekształcenie jest zawsze opisane algorytmem – Twoim zadaniem jest wykonać go dokładnie (np. dla \`k\` większego niż długość tekstu, dla ostatniego niepełnego bloku).

        **Szyfr Vigenère’a** to Cezar, w którym klucz zmienia się co literę: kluczem jest **słowo**, a każda jego litera daje przesunięcie (a = 0, b = 1, …). Klucz powtarza się w kółko. Dla tekstu \`informatyka\` i klucza \`abc\` przesunięcia to 0, 1, 2, 0, 1, 2, …:

        | tekst | i | n | f | o | r | m | a | t | y | k | a |
        |---|---|---|---|---|---|---|---|---|---|---|---|
        | przesunięcie | 0 | 1 | 2 | 0 | 1 | 2 | 0 | 1 | 2 | 0 | 1 |
        | szyfrogram | i | o | h | o | s | o | a | u | a | k | b |

        Ta sama litera tekstu (np. \`a\`) może dać różne litery szyfrogramu – to utrudnia łamanie przez częstości.
      `,
    },
    {
      title: 'Wyszukiwanie wzorca',
      body: md`
        Gdzie w tekście \`s\` (długość \`n\`) występuje wzorzec \`p\` (długość \`m\`)? Najprostszy algorytm sprawdza **każdą pozycję startową** \`i\` = 0, …, \`n − m\` i porównuje znaki \`s[i + j]\` z \`p[j]\`:

        ~~~pseudo
        dla i = 1, 2, …, n − m + 1 wykonuj
            j ← 1
            dopóki j ≤ m oraz s[i + j − 1] = p[j] wykonuj
                j ← j + 1
            jeżeli j > m
                wypisz i           ⟵ wzorzec zaczyna się na pozycji i
        ~~~

        Wystąpienia mogą się **nakładać**: w \`aaaa\` wzorzec \`aa\` zaczyna się na pozycjach 1, 2 i 3. [[python: Gotowa funkcja \`s.count("aa")\` liczy tylko **rozłączne** wystąpienia (da 2) – uważaj, czego chce zadanie!]][[cpp: Szukanie przez \`s.find("aa", i)\` w pętli też znajdzie nakładające się wystąpienia, jeśli następne szukasz od \`i + 1\`, a nie od końca poprzedniego – uważaj, czego chce zadanie!]][[java: Szukanie przez \`s.indexOf("aa", i)\` w pętli też znajdzie nakładające się wystąpienia, jeśli następne szukasz od \`i + 1\`, a nie od końca poprzedniego – uważaj, czego chce zadanie!]]

        ~~~python run
        def wystapienia(s, p):
            pozycje = []
            for i in range(len(s) - len(p) + 1):
                if s[i:i + len(p)] == p:
                    pozycje.append(i + 1)      # pozycje od 1
            return pozycje

        print(wystapienia("aaaa", "aa"))
        print(wystapienia("abcabcab", "cab"))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        #include <vector>
        using namespace std;

        vector<int> wystapienia(const string& s, const string& p) {
            vector<int> pozycje;
            for (int i = 0; i + (int)p.size() <= (int)s.size(); i++)
                if (s.compare(i, p.size(), p) == 0) pozycje.push_back(i + 1);
            return pozycje;
        }

        int main() {
            for (int i : wystapienia("aaaa", "aa")) cout << i << " ";
            cout << endl;
            for (int i : wystapienia("abcabcab", "cab")) cout << i << " ";
            cout << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            static List<Integer> wystapienia(String s, String p) {
                List<Integer> pozycje = new ArrayList<>();
                for (int i = 0; i + p.length() <= s.length(); i++)
                    if (s.startsWith(p, i)) pozycje.add(i + 1);
                return pozycje;
            }

            public static void main(String[] args) {
                System.out.println(wystapienia("aaaa", "aa"));
                System.out.println(wystapienia("abcabcab", "cab"));
            }
        }
        ~~~

        Algorytm wykonuje w najgorszym razie około \`n · m\` porównań – dla danych maturalnych to zawsze wystarcza.
      `,
    },
    {
      title: 'Porównywanie napisów i anagramy',
      body: md`
        **Porządek leksykograficzny** (słownikowy) – algorytm porównania napisów \`a\` i \`b\`:
        1. Idź po pozycjach od początku, dopóki znaki są równe.
        2. Na pierwszej różnej pozycji mniejszy znak (mniejszy kod) wskazuje mniejszy napis.
        3. Jeśli jeden napis się skończył, a wszystkie dotychczasowe znaki były równe – krótszy napis jest mniejszy (\`kot\` < \`kotek\`).

        Na tym opiera się np. porównywanie **sufiksów** (końcówek) słowa w zadaniu „Sufiksy” z czerwca 2023.

        **Anagramy** – dwa słowa złożone z tych samych liter (\`ewa\` i \`wae\`). Algorytm bez sortowania: policz wystąpienia każdej z 26 liter w obu słowach i porównaj liczniki. Słowa różnej długości od razu nie są anagramami.

        > **Na maturze:** W zadaniach z szyframi (np. „Szyfrowanie” z czerwca 2026) i tekstami najpierw wykonaj algorytm **ręcznie na przykładzie z treści** – to najlepszy sposób, żeby zrozumieć, co dokładnie robi, zanim zaczniesz uogólniać albo programować.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Zaszyfruj słowo \`KOT\` szyfrem Cezara z kluczem \`k = 3\`.`,
      answer: ['NRW'],
      exact: true,
      explain: md`K → N, O → R, T → W (każda litera o 3 dalej).`,
    },
    {
      type: 'choice',
      q: md`Tekst zaszyfrowano szyfrem Cezara z kluczem 5. Jakim kluczem trzeba go **zaszyfrować ponownie**, żeby odzyskać tekst jawny?`,
      options: ['21', '5', '-21', '13'],
      answer: 0,
      explain: md`5 + 21 = 26, a przesunięcie o 26 to pełny obrót alfabetu. Odszyfrowanie kluczem k to szyfrowanie kluczem 26 − k.`,
    },
    {
      type: 'input',
      q: md`Zapisz \`MATURA\` wierszami po 2 litery i odczytaj kolumnami (najpierw cała pierwsza kolumna, potem druga). Jaki wychodzi szyfrogram?`,
      answer: ['MTRAUA'],
      exact: true,
      explain: md`Wiersze: MA / TU / RA. Pierwsza kolumna: M, T, R; druga: A, U, A. Razem MTRAUA.`,
    },
    {
      type: 'input',
      q: md`Ile razy (licząc wystąpienia nakładające się) wzorzec \`aba\` występuje w tekście \`abababa\`?`,
      answer: '3',
      explain: md`Na pozycjach 1, 3 i 5.[[python:  Funkcja \`"abababa".count("aba")\` dałaby tylko 2, bo liczy rozłączne wystąpienia.]][[cpp java:  Gdyby po znalezieniu wzorca szukać dalej od jego końca, wyszłyby tylko 2 (rozłączne wystąpienia).]]`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Szyfr Cezara jest szyfrem podstawieniowym.', answer: true },
        { text: 'Szyfr przestawieniowy zmienia litery na inne.', answer: false },
        { text: 'Dwukrotne zaszyfrowanie tekstu szyfrem ROT13 daje tekst wyjściowy.', answer: true },
        { text: 'W szyfrze Vigenère’a ta sama litera tekstu jawnego zawsze daje tę samą literę szyfrogramu.', answer: false },
      ],
      explain: md`
        - Tak – każda litera zamienia się na inną według stałej reguły.
        - Nie – przestawieniowy tylko zmienia kolejność liter.
        - Tak – 13 + 13 = 26.
        - Nie – przesunięcie zależy od pozycji (litery klucza), więc ta sama litera może dać różne litery szyfrogramu.
      `,
    },
    {
      type: 'code',
      q: md`Wczytaj klucz \`k\` (0 ≤ \`k\` ≤ 25) i słowo z małych liter zaszyfrowane szyfrem Cezara z tym kluczem (w drugim wierszu). Wypisz tekst jawny.`,
      tests: [
        { input: '3\nnrw\n', output: 'kot\n' },
        { input: '1\nb\n', output: 'a\n' },
        { input: '25\nzab\n', output: 'abc\n' },
        { input: '13\nznghen\n', output: 'matura\n' },
        { input: '0\ninformatyka\n', output: 'informatyka\n' },
      ],
      solution: {
        python: code`
          k = int(input())
          s = input().strip()
          print("".join(chr((ord(c) - ord("a") - k) % 26 + ord("a")) for c in s))
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              int k;
              string s;
              cin >> k >> s;
              for (char& c : s) c = char((c - 'a' - k + 26) % 26 + 'a');
              cout << s << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int k = sc.nextInt();
                  String s = sc.next();
                  StringBuilder w = new StringBuilder();
                  for (char c : s.toCharArray()) w.append((char) ((c - 'a' - k + 26) % 26 + 'a'));
                  System.out.println(w);
              }
          }
        `,
      },
      explain: md`Odejmujemy klucz i zawijamy modulo 26. [[python: \`%\` od razu daje wynik z przedziału 0–25, także dla liczb ujemnych.]][[cpp java: Przed resztą dodajemy 26, żeby nie dostać liczby ujemnej (np. dla \`a\` z kluczem 1).]]`,

    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu jest tekst \`s\`, w drugim wzorzec \`p\` (oba z małych liter, \`s\` ma najwyżej 10 000 znaków, \`p\` najwyżej 100). Wypisz w pierwszym wierszu **liczbę wystąpień** \`p\` w \`s\` (także nakładających się), a w drugim – **pozycje** ich początków (liczone od 1), oddzielone spacjami. Jeśli wzorzec nie występuje, drugi wiersz może być pusty.
      `,
      tests: [
        { input: 'aaaa\naa\n', output: '3\n1 2 3\n' },
        { input: 'abababa\naba\n', output: '3\n1 3 5\n' },
        { input: 'matura\nx\n', output: '0\n' },
        { input: 'kot\nkot\n', output: '1\n1\n' },
        { input: 'abcabcab\ncab\n', output: '2\n3 6\n' },
        { input: 'ab\nabc\n', output: '0\n' },
      ],
      solution: {
        python: code`
          s = input().strip()
          p = input().strip()
          pozycje = [i + 1 for i in range(len(s) - len(p) + 1) if s[i:i + len(p)] == p]
          print(len(pozycje))
          print(*pozycje)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          #include <vector>
          using namespace std;

          int main() {
              string s, p;
              cin >> s >> p;
              vector<int> pozycje;
              for (int i = 0; i + (int)p.size() <= (int)s.size(); i++)
                  if (s.compare(i, p.size(), p) == 0) pozycje.push_back(i + 1);
              cout << pozycje.size() << endl;
              for (size_t k = 0; k < pozycje.size(); k++) cout << (k ? " " : "") << pozycje[k];
              cout << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  String s = sc.next(), p = sc.next();
                  StringBuilder poz = new StringBuilder();
                  int ile = 0;
                  for (int i = 0; i + p.length() <= s.length(); i++)
                      if (s.startsWith(p, i)) {
                          ile++;
                          poz.append(poz.length() > 0 ? " " : "").append(i + 1);
                      }
                  System.out.println(ile);
                  System.out.println(poz);
              }
          }
        `,
      },
      explain: md`Sprawdzamy każdą pozycję startową od 0 do \`n − m\` – dzięki temu wystąpienia nakładające się też są liczone. Gdy wzorzec jest dłuższy niż tekst, zakres pętli jest pusty i wynik to 0.`,
    },
  ],
  practice: ['2026-czerwiec/1.1', '2026-czerwiec/1.2', '2024-czerwiec/3.2', '2023-czerwiec/2.1', '2023-czerwiec/2.4', '2026-maj/3.3'],
};
