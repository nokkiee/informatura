import { md, code } from '../lib.js';

const BIN = '1011\n111000\n10\n1\n1010101\n111111\n100001\n1101110\n';
const SLOWA = 'kajak\nmatura\noko\ninformatyka\nabba\npies\nradar\nsos\n';

export default {
  title: 'Zadanie maturalne krok po kroku',
  summary: 'Od treści zadania do zapisanej odpowiedzi: czytanie formatu, plan, funkcje, test na pliku przykładowym i kontrola wyniku.',
  minutes: 30,
  files: { 'bin.txt': BIN },
  intro: md`
    - jak czytać treść zadania programistycznego, żeby nie przeoczyć szczegółu,
    - jak rozbić zadanie na małe kroki i funkcje,
    - jak sprawdzać program na pliku przykładowym i na własnych przypadkach,
    - jak zapisać odpowiedzi i jak gospodarować czasem na maturze.
  `,
  steps: [
    {
      title: 'Czytanie treści',
      body: md`
        Weźmy zadanie w stylu maturalnym (to wariant zadania 2 z matury z maja 2023 – samo zadanie znajdziesz w linkach na końcu lekcji):

        > W pliku \`bin.txt\` w każdym wierszu zapisano liczbę w systemie dwójkowym. **Blokiem** nazywamy każdy maksymalny ciąg kolejnych jednakowych cyfr, np. liczba \`1110010\` ma 4 bloki: \`111\`, \`00\`, \`1\`, \`0\`. Podaj, ile liczb z pliku ma co najwyżej dwa bloki, oraz liczbę, która ma najwięcej bloków.

        Zanim napiszesz choćby wiersz kodu, wypisz sobie:
        1. **Format danych:** jeden napis binarny w wierszu; ile wierszy, jaka długość (to mówi, czy liczby zmieszczą się w \`int\` i czy prosty algorytm zdąży).
        2. **Co dokładnie jest odpowiedzią:** liczba (ile?) czy element (która?), jedna odpowiedź czy kilka, w jakiej kolejności.
        3. **Przypadki brzegowe:** czy liczba może mieć jeden blok (\`111\`)? Co, jeśli kilka liczb ma tyle samo bloków – którą podać? (W prawdziwych zadaniach treść zwykle mówi „jest jedna taka liczba” – czytaj to uważnie.)
        4. **Przykład z treści:** policz go ręcznie. Jeśli Twoje rozumienie daje inny wynik niż podany w zadaniu – źle zrozumiałeś definicję.

        > **Na maturze:** Podkreśl w treści słowa „co najmniej”, „co najwyżej”, „dokładnie”, „różnych”, „kolejnych”, „pierwszą / ostatnią”. Najwięcej punktów traci się nie na trudnym algorytmie, tylko na źle przeczytanym warunku.
      `,
    },
    {
      title: 'Plan i funkcje',
      body: md`
        Rozbij zadanie na kawałki, które umiesz zrobić osobno:

        1. funkcja \`bloki(s)\` – ile bloków ma jeden napis,
        2. pętla po wierszach pliku,
        3. licznik dla „co najwyżej dwa bloki”,
        4. maksimum (z zapamiętaniem napisu) dla „najwięcej bloków”.

        Jak policzyć bloki? Blok zaczyna się na pierwszym znaku i w każdym miejscu, gdzie cyfra **różni się od poprzedniej**. Więc: \`bloki = 1 + liczba miejsc i, w których s[i] ≠ s[i-1]\`. Sprawdź na przykładzie: \`1110010\` – zmiany są między 1|0, 0|1 i 1|0, czyli 3 zmiany i 4 bloki. Zgadza się.

        Najpierw napisz i sprawdź **samą funkcję** na przykładzie z treści, dopiero potem resztę:

        ~~~python run
        def bloki(s):
            wynik = 1
            for i in range(1, len(s)):
                if s[i] != s[i - 1]:
                    wynik += 1
            return wynik

        print(bloki("1110010"), bloki("1"), bloki("10"))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <string>
        using namespace std;

        int bloki(const string& s) {
            int wynik = 1;
            for (int i = 1; i < (int)s.size(); i++)
                if (s[i] != s[i - 1]) wynik++;
            return wynik;
        }

        int main() {
            cout << bloki("1110010") << " " << bloki("1") << " " << bloki("10") << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static int bloki(String s) {
                int wynik = 1;
                for (int i = 1; i < s.length(); i++)
                    if (s.charAt(i) != s.charAt(i - 1)) wynik++;
                return wynik;
            }

            public static void main(String[] args) {
                System.out.println(bloki("1110010") + " " + bloki("1") + " " + bloki("10"));
            }
        }
        ~~~
      `,
    },
    {
      title: 'Cały program i test',
      body: md`
        Teraz pętla po pliku. Plik \`bin.txt\` w tej lekcji ma tylko 8 wierszy – tak jak plik przykładowy na maturze, możesz go policzyć ręcznie i sprawdzić program:

        ~~~text bin.txt
        1011
        111000
        10
        1
        1010101
        111111
        100001
        1101110
        ~~~

        ~~~python run
        def bloki(s):
            wynik = 1
            for i in range(1, len(s)):
                if s[i] != s[i - 1]:
                    wynik += 1
            return wynik

        ile = 0
        naj, naj_s = 0, ""
        with open("bin.txt") as plik:
            for wiersz in plik:
                s = wiersz.strip()
                if not s:
                    continue
                b = bloki(s)
                if b <= 2:
                    ile += 1
                if b > naj:
                    naj, naj_s = b, s
        print("2.2.", ile)
        print("2.3.", naj_s, naj)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <fstream>
        #include <string>
        using namespace std;

        int bloki(const string& s) {
            int wynik = 1;
            for (int i = 1; i < (int)s.size(); i++)
                if (s[i] != s[i - 1]) wynik++;
            return wynik;
        }

        int main() {
            ifstream plik("bin.txt");
            string s, naj_s;
            int ile = 0, naj = 0;
            while (plik >> s) {
                int b = bloki(s);
                if (b <= 2) ile++;
                if (b > naj) {
                    naj = b;
                    naj_s = s;
                }
            }
            cout << "2.2. " << ile << endl;
            cout << "2.3. " << naj_s << " " << naj << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.io.*;
        import java.util.*;

        public class Main {
            static int bloki(String s) {
                int wynik = 1;
                for (int i = 1; i < s.length(); i++)
                    if (s.charAt(i) != s.charAt(i - 1)) wynik++;
                return wynik;
            }

            public static void main(String[] args) throws IOException {
                Scanner plik = new Scanner(new File("bin.txt"));
                String najS = "";
                int ile = 0, naj = 0;
                while (plik.hasNext()) {
                    String s = plik.next();
                    int b = bloki(s);
                    if (b <= 2) ile++;
                    if (b > naj) {
                        naj = b;
                        najS = s;
                    }
                }
                System.out.println("2.2. " + ile);
                System.out.println("2.3. " + najS + " " + naj);
            }
        }
        ~~~

        Policz ręcznie: bloki mają kolejno 3, 2, 2, 1, 7, 1, 3, 4. Co najwyżej dwa bloki: \`111000\`, \`10\`, \`1\`, \`111111\` – cztery liczby. Najwięcej bloków (7) ma \`1010101\`. Program daje to samo, więc można go uruchomić na pełnym pliku.

        > **Wskazówka:** Jeśli wynik dla pliku przykładowego się nie zgadza, wypisz wartości pośrednie (np. \`print(s, bloki(s))\` dla każdego wiersza) i porównaj z ręcznymi obliczeniami. Błąd zwykle widać od razu.
      `,
    },
    {
      title: 'Odpowiedzi i czas',
      body: md`
        ### Zapis odpowiedzi
        - Każdą odpowiedź poprzedź **numerem zadania** (np. \`2.2. 4\`), tak jak w poleceniu.
        - Podaj **dokładnie to, o co pytają** – jeśli pytają o liczbę i jej pozycję, podaj oba; nie dopisuj zbędnych danych, które mogą zmylić sprawdzającego.
        - Zachowaj **kolejność**, jeśli jest wymagana („w kolejności występowania w pliku”).
        - Zapisz też pliki z programami – na maturze oceniana jest odpowiedź, ale programy są dowodem pracy i trzeba je zachować zgodnie z instrukcją.

        ### Kontrola wyniku
        - Czy wynik ma sens? Jeśli w pliku jest 1000 liczb, a program twierdzi, że 1200 spełnia warunek – coś jest nie tak.
        - Zrób jeden prosty test „na złość”: plik z jednym wierszem, liczba z jednym blokiem, same takie same elementy.
        - Zmień jeden warunek (\`<\` na \`<=\`) i zobacz, czy wynik się zmienia. Jeśli tak – upewnij się, który jest zgodny z treścią.

        ### Czas
        - Na maturze masz 210 minut na cały arkusz. Zadania programistyczne mają zwykle kilka części o rosnącej trudności – **pierwsze części są najłatwiejsze**, rób je od razu.
        - Jeśli utkniesz, przejdź do innego zadania (np. bazy danych czy arkusza) i wróć później. Prosty, wolniejszy algorytm, który daje dobrą odpowiedź, jest lepszy niż sprytny, którego nie zdążysz skończyć.

        > **Na maturze:** W Informaturze możesz to wszystko przećwiczyć w trybie **Symulacja egzaminu** (zakładka Arkusze) – z zegarem i sprawdzaniem dopiero na końcu.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Ile bloków (maksymalnych ciągów takich samych cyfr) ma liczba binarna \`110100111\`?`,
      answer: '5',
      explain: md`\`11\` | \`0\` | \`1\` | \`00\` | \`111\` – pięć bloków. Inaczej: 4 miejsca zmiany cyfry + 1.`,
    },
    {
      type: 'choice',
      q: md`Program daje dla pliku przykładowego wynik 5, a w treści zadania podano, że poprawna odpowiedź dla tego pliku to 4. Co zrobić najpierw?`,
      options: [
        'Sprawdzić wartości pośrednie dla każdego wiersza i porównać z ręcznym liczeniem',
        'Uruchomić program na pełnym pliku – plik przykładowy może być nietypowy',
        'Zapisać 5, bo program na pewno liczy dobrze',
        'Odjąć 1 od wyniku',
      ],
      answer: 0,
      explain: md`Wynik dla pliku przykładowego podany w treści jest pewny – rozbieżność oznacza błąd w programie (albo w rozumieniu treści). Najszybciej znajdziesz go, wypisując wyniki pośrednie i porównując z ręcznymi obliczeniami.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań o rozwiązywaniu zadań programistycznych na maturze.`,
      items: [
        { text: 'Najpierw warto sprawdzić osobno małą funkcję (np. liczącą bloki), a dopiero potem pisać pętlę po pliku.', answer: true },
        { text: 'Słowa „co najmniej” i „co najwyżej” w treści nie wpływają na wynik, bo program i tak liczy to samo.', answer: false },
        { text: 'Jeśli zadanie mówi „w kolejności występowania w pliku”, posortowanie odpowiedzi może sprawić, że będzie błędna.', answer: true },
        { text: 'Jeśli prosty algorytm daje dobrą odpowiedź w kilka sekund, nie trzeba szukać szybszego.', answer: true },
      ],
      explain: md`
        - Tak – małe kawałki łatwo sprawdzić ręcznie.
        - Nie – to różnica między \`<=\` a \`<\` (albo \`>=\` a \`>\`), a więc między dobrą a złą odpowiedzią.
        - Tak – kolejność bywa częścią odpowiedzi.
        - Tak – na maturze liczy się poprawny wynik; czas działania ma znaczenie tylko wtedy, gdy program nie zdąży się wykonać.
      `,
    },
    {
      type: 'code',
      q: md`
        W pliku \`bin.txt\` w każdym wierszu jest liczba binarna (bez zer wiodących). Wypisz, **ile liczb ma parzystą liczbę bloków**.
      `,
      tests: [
        { files: { 'bin.txt': BIN }, output: '3\n' },
        { files: { 'bin.txt': '1\n11\n111\n' }, output: '0\n' },
        { files: { 'bin.txt': '10\n1100\n100\n101\n' }, output: '3\n' },
        { files: { 'bin.txt': '1010\n' }, output: '1\n' },
      ],
      examples: 1,
      solution: {
        python: code`
          def bloki(s):
              return 1 + sum(1 for i in range(1, len(s)) if s[i] != s[i - 1])

          ile = 0
          for wiersz in open("bin.txt"):
              s = wiersz.strip()
              if s and bloki(s) % 2 == 0:
                  ile += 1
          print(ile)
        `,
        cpp: code`
          #include <iostream>
          #include <fstream>
          #include <string>
          using namespace std;

          int bloki(const string& s) {
              int wynik = 1;
              for (int i = 1; i < (int)s.size(); i++)
                  if (s[i] != s[i - 1]) wynik++;
              return wynik;
          }

          int main() {
              ifstream plik("bin.txt");
              string s;
              int ile = 0;
              while (plik >> s)
                  if (bloki(s) % 2 == 0) ile++;
              cout << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.io.*;
          import java.util.*;

          public class Main {
              static int bloki(String s) {
                  int wynik = 1;
                  for (int i = 1; i < s.length(); i++)
                      if (s.charAt(i) != s.charAt(i - 1)) wynik++;
                  return wynik;
              }

              public static void main(String[] args) throws IOException {
                  Scanner plik = new Scanner(new File("bin.txt"));
                  int ile = 0;
                  while (plik.hasNext())
                      if (bloki(plik.next()) % 2 == 0) ile++;
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Ta sama funkcja \`bloki\` co w lekcji, inny warunek licznika. Liczba binarna bez zer wiodących zaczyna się od 1, więc parzystą liczbę bloków mają te, które **kończą się zerem** – to też poprawne rozwiązanie!`,
    },
    {
      type: 'code',
      q: md`
        W pliku \`slowa.txt\` w każdym wierszu jest jedno słowo z małych liter. Wypisz trzy odpowiedzi, każdą w osobnym wierszu i poprzedzoną numerem:
        - \`1.\` ile słów jest palindromami,
        - \`2.\` najdłuższe słowo (jeśli jest kilka – pierwsze w pliku),
        - \`3.\` ile słów zaczyna się i kończy tą samą literą.

        Przykład odpowiedzi: \`1. 5\`, w kolejnym wierszu \`2. informatyka\` itd.
      `,
      tests: [
        { files: { 'slowa.txt': SLOWA }, output: '1. 5\n2. informatyka\n3. 5\n' },
        { files: { 'slowa.txt': 'ab\ncd\nef\n' }, output: '1. 0\n2. ab\n3. 0\n' },
        { files: { 'slowa.txt': 'a\n' }, output: '1. 1\n2. a\n3. 1\n' },
        { files: { 'slowa.txt': 'abca\nxyzzy\nmm\nqwerty\nkok\n' }, output: '1. 2\n2. qwerty\n3. 3\n' },
      ],
      examples: 1,
      solution: {
        python: code`
          slowa = [w.strip() for w in open("slowa.txt") if w.strip()]
          print("1.", sum(1 for s in slowa if s == s[::-1]))
          najdl = slowa[0]
          for s in slowa:
              if len(s) > len(najdl):
                  najdl = s
          print("2.", najdl)
          print("3.", sum(1 for s in slowa if s[0] == s[-1]))
        `,
        cpp: code`
          #include <iostream>
          #include <fstream>
          #include <string>
          using namespace std;

          int main() {
              ifstream plik("slowa.txt");
              string s, najdl = "";
              int pal = 0, te_same = 0;
              while (plik >> s) {
                  if (s == string(s.rbegin(), s.rend())) pal++;
                  if (s.size() > najdl.size()) najdl = s;
                  if (s.front() == s.back()) te_same++;
              }
              cout << "1. " << pal << endl;
              cout << "2. " << najdl << endl;
              cout << "3. " << te_same << endl;
              return 0;
          }
        `,
        java: code`
          import java.io.*;
          import java.util.*;

          public class Main {
              public static void main(String[] args) throws IOException {
                  Scanner plik = new Scanner(new File("slowa.txt"));
                  String najdl = "";
                  int pal = 0, teSame = 0;
                  while (plik.hasNext()) {
                      String s = plik.next();
                      if (s.equals(new StringBuilder(s).reverse().toString())) pal++;
                      if (s.length() > najdl.length()) najdl = s;
                      if (s.charAt(0) == s.charAt(s.length() - 1)) teSame++;
                  }
                  System.out.println("1. " + pal);
                  System.out.println("2. " + najdl);
                  System.out.println("3. " + teSame);
              }
          }
        `,
      },
      explain: md`Trzy niezależne pytania, jedna pętla po pliku – tak wygląda typowy zestaw zadań na maturze. Najdłuższe słowo: warunek \`>\` zostawia pierwsze przy remisie. Słowo jednoliterowe jest palindromem i zaczyna się i kończy tą samą literą.`,
    },
  ],
  practice: ['2023-maj/2.2', '2024-czerwiec/3.3', '2023-maj/3.4', '2026-maj/4.4', '2025-czerwiec/3.3'],
};
