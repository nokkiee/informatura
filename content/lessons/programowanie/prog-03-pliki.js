import { md, code } from '../lib.js';

const LICZBY = '12\n7\n45\n-3\n28\n7\n100\n';
const WYNIKI = 'Ala 17\nBartek 23\nCelina 9\nDarek 31\nEwa 23\n';

export default {
  title: 'Pliki z danymi',
  summary: 'Jak wyglądają pliki na maturze, czytanie wiersz po wierszu, wiersze z kilkoma wartościami i zapisywanie wyników.',
  minutes: 30,
  files: { 'liczby.txt': LICZBY, 'wyniki.txt': WYNIKI },
  intro: md`
    - jak zbudowane są pliki z danymi w zadaniach maturalnych,
    - jak przeczytać plik wiersz po wierszu albo liczba po liczbie,
    - jak rozdzielić wiersz z kilkoma wartościami (np. „słowo liczba”),
    - jak zapisać odpowiedzi do pliku wynikowego,
    - typowe pułapki: znak końca wiersza, puste wiersze, liczby wczytane jako tekst.
  `,
  steps: [
    {
      title: 'Dane na maturze',
      body: md`
        W zadaniach z programowania dane są w **plikach tekstowych**. Zwykle jeden wiersz to jeden „rekord”: liczba, słowo, para liczb, kilka pól oddzielonych spacją. Treść zadania zawsze dokładnie opisuje format, np. *„W pliku \`liczby.txt\` znajduje się 200 liczb całkowitych, każda w osobnym wierszu”*.

        Oprócz właściwego pliku jest też mniejszy **plik przykładowy** (np. \`liczby_przyklad.txt\`), a w treści zadania – odpowiedzi dla niego. Służy do sprawdzenia programu, zanim uruchomisz go na prawdziwych danych.

        Oto plik, na którym będziemy ćwiczyć – leży w folderze, w którym uruchamiają się przykłady z tej lekcji (tak samo jak na maturze plik leży obok programu):

        ~~~text liczby.txt
        12
        7
        45
        -3
        28
        7
        100
        ~~~

        > **Na maturze:** Odpowiedzi zapisujesz w pliku wynikowym (np. \`wyniki4.txt\`), każdą poprzedzoną numerem zadania, np. \`4.1. 182\`. W Informaturze to, co wypisze program, trafia do pola „Odpowiedź”, a program sam rozpoznaje numery zadań.
      `,
    },
    {
      title: 'Czytanie pliku wiersz po wierszu',
      body: md`
        Plik trzeba **otworzyć**, przeczytać i (w Pythonie najwygodniej automatycznie) zamknąć. Nazwa pliku to po prostu \`"liczby.txt"\` – program uruchamia się w folderze, w którym ten plik leży.

        ~~~python run
        suma = 0
        ile = 0
        with open("liczby.txt") as plik:
            for wiersz in plik:
                x = int(wiersz)       # wiersz to napis, np. "45\n"
                suma += x
                ile += 1
        print(ile, suma)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <fstream>
        using namespace std;

        int main() {
            ifstream plik("liczby.txt");
            long long x, suma = 0;
            int ile = 0;
            while (plik >> x) {       // czyta kolejną liczbę, dopóki jakaś jest
                suma += x;
                ile++;
            }
            cout << ile << " " << suma << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.io.*;
        import java.util.*;

        public class Main {
            public static void main(String[] args) throws IOException {
                Scanner plik = new Scanner(new File("liczby.txt"));
                long suma = 0;
                int ile = 0;
                while (plik.hasNextLong()) {   // dopóki w pliku jest kolejna liczba
                    suma += plik.nextLong();
                    ile++;
                }
                System.out.println(ile + " " + suma);
            }
        }
        ~~~

        Jak to działa w każdym języku:
        - **Python:** \`with open(...) as plik\` otwiera plik i sam go zamknie. Pętla \`for wiersz in plik\` daje kolejne wiersze **jako napisy** – razem ze znakiem nowego wiersza na końcu. \`int(...)\` sobie z nim radzi, ale przy słowach trzeba go usunąć metodą \`strip()\`.
        - **C++:** \`ifstream\` z biblioteki \`<fstream>\` działa jak \`cin\`, tylko czyta z pliku. \`while (plik >> x)\` wczytuje kolejne wartości i kończy się, gdy ich zabraknie.
        - **Java:** \`Scanner\` może czytać z pliku (\`new File(...)\`). Metoda \`main\` musi mieć dopisek \`throws IOException\`, bo otwarcie pliku może się nie udać.

        > **Wskazówka:** Jeśli wolisz mieć wszystkie dane naraz w liście, w Pythonie: \`liczby = [int(w) for w in open("liczby.txt")]\`. To samo co pętla wyżej, w jednym wierszu.
      `,
    },
    {
      title: 'Kilka wartości w wierszu',
      body: md`
        Często wiersz zawiera kilka pól, np. imię i wynik:

        ~~~text wyniki.txt
        Ala 17
        Bartek 23
        Celina 9
        Darek 31
        Ewa 23
        ~~~

        W Pythonie wiersz dzielisz metodą \`split()\` – bez argumentu tnie po spacjach (i tabulatorach), a znak końca wiersza znika sam. Gdy pola są oddzielone np. średnikiem, piszesz \`split(";")\`. W C++ wystarczy \`plik >> imie >> wynik\`, a w Javie \`next()\` i \`nextInt()\`.

        Program znajduje osobę z najlepszym wynikiem (przy remisie – pierwszą w pliku):

        ~~~python run
        najlepszy = None
        kto = ""
        with open("wyniki.txt") as plik:
            for wiersz in plik:
                imie, punkty = wiersz.split()
                punkty = int(punkty)
                if najlepszy is None or punkty > najlepszy:
                    najlepszy = punkty
                    kto = imie
        print(kto, najlepszy)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <fstream>
        #include <string>
        using namespace std;

        int main() {
            ifstream plik("wyniki.txt");
            string imie, kto;
            int punkty, najlepszy = -1;
            while (plik >> imie >> punkty) {
                if (punkty > najlepszy) {
                    najlepszy = punkty;
                    kto = imie;
                }
            }
            cout << kto << " " << najlepszy << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.io.*;
        import java.util.*;

        public class Main {
            public static void main(String[] args) throws IOException {
                Scanner plik = new Scanner(new File("wyniki.txt"));
                String kto = "";
                int najlepszy = -1;
                while (plik.hasNext()) {
                    String imie = plik.next();
                    int punkty = plik.nextInt();
                    if (punkty > najlepszy) {
                        najlepszy = punkty;
                        kto = imie;
                    }
                }
                System.out.println(kto + " " + najlepszy);
            }
        }
        ~~~

        Zauważ znak \`>\` (a nie \`>=\`): przy remisie zostaje osoba, która pojawiła się **wcześniej**. Gdyby w zadaniu chodziło o ostatnią – użyłbyś \`>=\`. Takie szczegóły mają znaczenie, bo odpowiedź musi się zgadzać co do joty.

        > **Uwaga:** W C++ i Javie start od \`-1\` działa tylko dlatego, że wyniki są nieujemne. Przy dowolnych liczbach zacznij od pierwszego wiersza albo od bardzo małej liczby.
      `,
    },
    {
      title: 'Zapisywanie wyników',
      body: md`
        Na maturze odpowiedzi zapisujesz w pliku wynikowym. Możesz zrobić to ręcznie (skopiować z ekranu), ale prościej i pewniej, gdy program sam zapisze plik. Poniższy program tworzy \`wyniki_zad.txt\` i zapisuje w nim dwie odpowiedzi.

        ~~~python run
        liczby = [int(w) for w in open("liczby.txt")]
        with open("wyniki_zad.txt", "w") as out:
            print("1.1.", max(liczby), file=out)
            print("1.2.", sum(liczby), file=out)
        print(open("wyniki_zad.txt").read())
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <fstream>
        #include <string>
        using namespace std;

        int main() {
            ifstream plik("liczby.txt");
            long long x, suma = 0, maks = 0;
            bool pierwsza = true;
            while (plik >> x) {
                suma += x;
                if (pierwsza || x > maks) maks = x;
                pierwsza = false;
            }
            ofstream out("wyniki_zad.txt");
            out << "1.1. " << maks << endl;
            out << "1.2. " << suma << endl;
            out.close();
            ifstream spr("wyniki_zad.txt");
            string w;
            while (getline(spr, w)) cout << w << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.io.*;
        import java.util.*;

        public class Main {
            public static void main(String[] args) throws IOException {
                Scanner plik = new Scanner(new File("liczby.txt"));
                long suma = 0, maks = Long.MIN_VALUE;
                while (plik.hasNextLong()) {
                    long x = plik.nextLong();
                    suma += x;
                    maks = Math.max(maks, x);
                }
                PrintWriter out = new PrintWriter("wyniki_zad.txt");
                out.println("1.1. " + maks);
                out.println("1.2. " + suma);
                out.close();
                for (String w : java.nio.file.Files.readAllLines(new File("wyniki_zad.txt").toPath())) System.out.println(w);
            }
        }
        ~~~

        - **Python:** \`open(nazwa, "w")\` otwiera plik do zapisu (tworzy go albo czyści), a \`print(..., file=out)\` pisze do niego tak jak na ekran.
        - **C++:** \`ofstream\` działa jak \`cout\`, tylko do pliku.
        - **Java:** \`PrintWriter\` ma metody \`println\` jak \`System.out\`. Koniecznie \`close()\` – inaczej część tekstu może nie trafić do pliku.

        > **Uwaga:** Tryb \`"w"\` **kasuje** dotychczasową zawartość pliku. Nigdy nie otwieraj tak pliku z danymi!
      `,
    },
    {
      title: 'Pułapki przy plikach',
      body: md`
        1. **Napisy zamiast liczb.** W Pythonie wiersz z pliku to napis. \`"100" > "45"\` jest *fałszem* (porównanie znak po znaku: \`"1" < "4"\`). Zamieniaj przez \`int(...)\`.
        2. **Znak końca wiersza.** Wiersz w Pythonie kończy się \`"\n"\`, a plik z Windowsa może mieć \`"\r\n"\`. Przy słowach zawsze \`wiersz.strip()\` – inaczej \`"kot\n"\` nie będzie równe \`"kot"\`. W C++ \`getline\` też może zostawić \`\r\` na końcu.
        3. **Pusty ostatni wiersz.** \`int("")\` w Pythonie to błąd. Bezpieczniej pomijać puste wiersze (\`if not wiersz.strip(): continue\`) albo czytać wszystko naraz: \`open(...).read().split()\` daje listę wszystkich „słów” z pliku, bez pustych.
        4. **Zła nazwa pliku.** \`Liczby.txt\` to inny plik niż \`liczby.txt\` (na Linuksie i na maturze lepiej nie liczyć na to, że wielkość liter nie ma znaczenia). W C++ \`ifstream\` niczego nie zgłosi – po prostu nie wczyta żadnej liczby. Jeśli wynik to 0, sprawdź najpierw nazwę pliku.
        5. **Kolejność w wierszu.** Czytaj opis formatu: „imię, a potem wynik” to coś innego niż „wynik, a potem imię”.

        > **Na maturze:** Najpierw uruchom program na pliku przykładowym i porównaj wynik z treścią zadania. Dopiero potem zmień nazwę pliku na właściwą (albo – jak w Informaturze – użyj przycisku **Test: dane przykładowe**).
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Co zwraca w Pythonie \`" kot \n".strip()\`?`,
      options: ['`"kot"`', '`" kot"`', '`"kot \\n"`', '`["kot"]`'],
      answer: 0,
      explain: md`\`strip()\` usuwa białe znaki (spacje, tabulatory, znaki nowego wiersza) z **obu** końców napisu. Do usuwania tylko z prawej jest \`rstrip()\`.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'W C++ pętla `while (plik >> x)` kończy się, gdy w pliku zabraknie liczb.', answer: true },
        { text: 'W Pythonie wiersz wczytany z pliku jest od razu liczbą, jeśli zawiera same cyfry.', answer: false },
        { text: '`wiersz.split()` bez argumentu dzieli wiersz w miejscach spacji i pomija znak końca wiersza.', answer: true },
        { text: 'Otwarcie pliku z danymi w trybie `"w"` jest bezpieczne – plik zostanie tylko odczytany.', answer: false },
      ],
      explain: md`
        - Tak – \`plik >> x\` „zwraca fałsz”, gdy nie uda się wczytać kolejnej wartości.
        - Nie – to zawsze napis (np. \`"45\n"\`); liczbą staje się po \`int(...)\`.
        - Tak – \`split()\` bez argumentu dzieli po dowolnych białych znakach, więc \`\n\` znika.
        - Nie – \`"w"\` to zapis: plik zostanie wyczyszczony.
      `,
    },
    {
      type: 'choice',
      q: md`W pliku są pary „słowo liczba”, np. \`kot 12\`. Szukasz pierwszej w pliku pary z największą liczbą. Który warunek aktualizacji maksimum jest dobry?`,
      options: ['`if (liczba > maks)`', '`if (liczba >= maks)`', '`if (liczba != maks)`', 'oba pierwsze są równie dobre'],
      answer: 0,
      explain: md`Przy \`>\` maksimum zmienia się tylko na **większą** liczbę, więc przy remisie zostaje pierwsza para. \`>=\` podmieniłoby ją na każdą późniejszą o tej samej wartości – dostałbyś ostatnią.`,
    },
    {
      type: 'code',
      q: md`
        W pliku \`liczby.txt\` w każdym wierszu jest jedna liczba całkowita (co najmniej jedna liczba w pliku). Wypisz, **ile liczb jest większych od średniej arytmetycznej** wszystkich liczb z pliku.

        Wskazówka: zamiast liczyć średnią z przecinkiem, możesz porównać \`x · n > suma\` – wynik będzie ten sam, a unikniesz błędów zaokrągleń.
      `,
      tests: [
        { files: { 'liczby.txt': LICZBY }, output: '2\n' },
        { files: { 'liczby.txt': '5\n5\n5\n' }, output: '0\n' },
        { files: { 'liczby.txt': '1\n2\n3\n4\n' }, output: '2\n' },
        { files: { 'liczby.txt': '-10\n-20\n-30\n' }, output: '1\n' },
        { files: { 'liczby.txt': '1000000000\n1000000000\n1000000000\n1\n' }, output: '3\n' },
      ],
      examples: 2,
      solution: {
        python: code`
          liczby = [int(w) for w in open("liczby.txt") if w.strip()]
          n = len(liczby)
          suma = sum(liczby)
          print(sum(1 for x in liczby if x * n > suma))
        `,
        cpp: code`
          #include <iostream>
          #include <fstream>
          #include <vector>
          using namespace std;

          int main() {
              ifstream plik("liczby.txt");
              vector<long long> t;
              long long x, suma = 0;
              while (plik >> x) {
                  t.push_back(x);
                  suma += x;
              }
              long long n = t.size();
              int ile = 0;
              for (long long y : t)
                  if (y * n > suma) ile++;
              cout << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.io.*;
          import java.util.*;

          public class Main {
              public static void main(String[] args) throws IOException {
                  Scanner plik = new Scanner(new File("liczby.txt"));
                  List<Long> t = new ArrayList<>();
                  long suma = 0;
                  while (plik.hasNextLong()) {
                      long x = plik.nextLong();
                      t.add(x);
                      suma += x;
                  }
                  long n = t.size();
                  int ile = 0;
                  for (long y : t)
                      if (y * n > suma) ile++;
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Plik trzeba przeczytać **dwa razy** albo zapamiętać liczby (w liście / wektorze): najpierw trzeba znać sumę, a dopiero potem można porównywać liczby ze średnią. Porównanie \`x · n > suma\` to to samo co \`x > suma / n\`, ale bez dzielenia. Dla liczb rzędu miliarda iloczyn \`x · n\` nie mieści się w \`int\` – stąd \`long long\` / \`long\`.`,
    },
    {
      type: 'code',
      q: md`
        W pliku \`wyniki.txt\` każdy wiersz zawiera imię (bez spacji) i liczbę punktów oddzielone spacją. Wypisz imię osoby, która ma **najwięcej punktów**, a w drugim wierszu – **ile osób** ma tyle samo punktów co ona (razem z nią). Jeśli kilka osób ma najwięcej punktów, wypisz imię tej, która jest **ostatnia** w pliku.
      `,
      tests: [
        { files: { 'wyniki.txt': WYNIKI }, output: 'Darek\n1\n' },
        { files: { 'wyniki.txt': 'Ala 5\nOla 9\nEla 9\nIza 2\n' }, output: 'Ela\n2\n' },
        { files: { 'wyniki.txt': 'Jan 0\n' }, output: 'Jan\n1\n' },
        { files: { 'wyniki.txt': 'A 3\nB 3\nC 3\n' }, output: 'C\n3\n' },
        { files: { 'wyniki.txt': 'Zosia 100\nKasia 99\nBasia 100\nMarta 7\n' }, output: 'Basia\n2\n' },
      ],
      examples: 2,
      solution: {
        python: code`
          kto = ""
          maks = None
          ile = 0
          for wiersz in open("wyniki.txt"):
              if not wiersz.strip():
                  continue
              imie, p = wiersz.split()
              p = int(p)
              if maks is None or p > maks:
                  maks, kto, ile = p, imie, 1
              elif p == maks:
                  kto = imie
                  ile += 1
          print(kto)
          print(ile)
        `,
        cpp: code`
          #include <iostream>
          #include <fstream>
          #include <string>
          using namespace std;

          int main() {
              ifstream plik("wyniki.txt");
              string imie, kto;
              int p, maks = -1, ile = 0;
              while (plik >> imie >> p) {
                  if (p > maks) {
                      maks = p;
                      kto = imie;
                      ile = 1;
                  } else if (p == maks) {
                      kto = imie;
                      ile++;
                  }
              }
              cout << kto << endl << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.io.*;
          import java.util.*;

          public class Main {
              public static void main(String[] args) throws IOException {
                  Scanner plik = new Scanner(new File("wyniki.txt"));
                  String kto = "";
                  int maks = -1, ile = 0;
                  while (plik.hasNext()) {
                      String imie = plik.next();
                      int p = plik.nextInt();
                      if (p > maks) {
                          maks = p;
                          kto = imie;
                          ile = 1;
                      } else if (p == maks) {
                          kto = imie;
                          ile++;
                      }
                  }
                  System.out.println(kto);
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Gdy pojawia się **nowe** maksimum, zaczynamy liczyć od nowa (\`ile = 1\`). Gdy wynik jest **równy** maksimum, zwiększamy licznik i – bo chodzi o ostatnią taką osobę – podmieniamy imię. W C++ i Javie start od -1 jest bezpieczny, bo punkty są nieujemne.`,
    },
  ],
  practice: ['2024-maj/3.2', '2023-czerwiec/3.3', '2025-maj/3.1', '2026-czerwiec/4.1'],
};
