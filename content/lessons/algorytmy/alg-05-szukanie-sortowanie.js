import { md, code } from '../lib.js';

export default {
  title: 'Wyszukiwanie i sortowanie',
  summary: 'Wyszukiwanie liniowe i binarne, metoda połowienia, sortowanie bąbelkowe, przez wybór i przez wstawianie, sortowania szybkie.',
  minutes: 40,
  intro: md`
    - czym różni się wyszukiwanie liniowe od binarnego i ile kroków zajmuje każde,
    - jak „połowić przedział”, żeby szybko znaleźć wynik (np. pierwiastek całkowity),
    - jak działają trzy proste sortowania – i jak wygląda tablica po kolejnych krokach,
    - dlaczego sortowanie przez scalanie i szybkie są szybsze.
  `,
  steps: [
    {
      title: 'Wyszukiwanie liniowe i binarne',
      body: md`
        **Liniowe:** przeglądasz elementy po kolei, aż znajdziesz szukany. Działa na każdej tablicy, ale dla \`n\` elementów potrzebuje do \`n\` porównań.

        **Binarne** (przez połowienie): działa tylko na tablicy **posortowanej**. Patrzysz na środkowy element; jeśli szukany jest mniejszy, odrzucasz prawą połowę, jeśli większy – lewą. Po każdym kroku zostaje połowa przedziału.

        ~~~pseudo
        lewy ← 1
        prawy ← n
        dopóki lewy ≤ prawy wykonuj
            s ← (lewy + prawy) div 2
            jeżeli T[s] = x
                wynikiem jest s
            jeżeli T[s] < x
                lewy ← s + 1
            w przeciwnym razie
                prawy ← s − 1
        wynikiem jest „brak”
        ~~~

        Ile kroków? Przedział 100 elementów połowimy: 100 → 50 → 25 → 12 → 6 → 3 → 1 – po **7** porównaniach na pewno wiemy, czy element jest. Ogólnie około \`log₂ n\`: dla miliona elementów to tylko 20 porównań (liniowo – do miliona).

        > **Uwaga:** Na tablicy nieposortowanej wyszukiwanie binarne daje złe wyniki bez żadnego ostrzeżenia. Jeśli dane nie są posortowane, najpierw je posortuj – opłaca się, gdy szukasz wiele razy.
      `,
    },
    {
      title: 'Metoda połowienia przedziału',
      body: md`
        Ten sam pomysł działa nie tylko na tablicach. Jeśli szukasz **największej liczby spełniającej warunek**, a warunek jest „monotoniczny” (dla małych liczb prawdziwy, od pewnego miejsca fałszywy), możesz połowić przedział możliwych odpowiedzi.

        Przykład: **pierwiastek całkowity** – największe \`k\`, dla którego \`k · k ≤ n\`. Dla 10¹⁸ odpowiedź jest gdzieś w [0, 10⁹]; połowienie znajdzie ją w ok. 30 krokach, a sprawdzanie po kolei potrzebowałoby miliarda.

        ~~~python run
        def pierwiastek(n):
            lewy, prawy = 0, 10**9        # odpowiedź na pewno jest w tym przedziale
            while lewy < prawy:
                s = (lewy + prawy + 1) // 2
                if s * s <= n:
                    lewy = s               # s pasuje – odpowiedź to s albo więcej
                else:
                    prawy = s - 1          # s za duże
            return lewy

        print(pierwiastek(10), pierwiastek(16), pierwiastek(10**18))
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        long long pierwiastek(long long n) {
            long long lewy = 0, prawy = 1000000000;
            while (lewy < prawy) {
                long long s = (lewy + prawy + 1) / 2;
                if (s * s <= n) lewy = s;
                else prawy = s - 1;
            }
            return lewy;
        }

        int main() {
            cout << pierwiastek(10) << " " << pierwiastek(16) << " " << pierwiastek(1000000000000000000LL) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static long pierwiastek(long n) {
                long lewy = 0, prawy = 1000000000L;
                while (lewy < prawy) {
                    long s = (lewy + prawy + 1) / 2;
                    if (s * s <= n) lewy = s;
                    else prawy = s - 1;
                }
                return lewy;
            }

            public static void main(String[] args) {
                System.out.println(pierwiastek(10) + " " + pierwiastek(16) + " " + pierwiastek(1000000000000000000L));
            }
        }
        ~~~

        Dlaczego \`(lewy + prawy + 1) div 2\`, a nie \`(lewy + prawy) div 2\`? Gdy \`prawy = lewy + 1\` i środek pasuje, \`lewy = s\` musi coś zmienić – inaczej pętla kręciłaby się w miejscu. To typowa pułapka połowienia: sprawdź zawsze, czy przedział **na pewno się zmniejsza**.

        > **Wskazówka:** Ta sama metoda służy do przybliżonego znajdowania miejsca zerowego funkcji ciągłej: jeśli \`f(a)\` i \`f(b)\` mają różne znaki, środek przedziału zastępuje ten koniec, przy którym znak jest taki sam.
      `,
    },
    {
      title: 'Bąbelkowe, przez wybór, przez wstawianie',
      body: md`
        Trzy proste sortowania, o które pytają zadania z analizą algorytmów („jak będzie wyglądała tablica po drugim przebiegu?”):

        **Bąbelkowe** – przechodź po tablicy i zamieniaj sąsiednie elementy w złej kolejności. Po pierwszym przebiegu największy element „wypływa” na koniec. Dla [5, 1, 4, 2, 8] pierwszy przebieg daje [1, 4, 2, 5, 8].

        **Przez wybór** – znajdź najmniejszy element w nieposortowanej części i zamień go z pierwszym elementem tej części. Dla [29, 10, 14, 37, 13] kolejne kroki: [**10**, 29, 14, 37, 13] → [10, **13**, 14, 37, 29] → [10, 13, **14**, 37, 29] → [10, 13, 14, **29**, 37]. Najwyżej \`n − 1\` zamian.

        **Przez wstawianie** – lewa część jest posortowana; bierzesz kolejny element i przesuwasz go w lewo, aż trafi na swoje miejsce (jak układanie kart w ręce).

        ~~~python run
        t = [5, 2, 4, 6, 1, 3]
        for i in range(1, len(t)):
            x = t[i]
            j = i - 1
            while j >= 0 and t[j] > x:
                t[j + 1] = t[j]      # przesuń większy element w prawo
                j -= 1
            t[j + 1] = x
            print(t)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            int t[] = {5, 2, 4, 6, 1, 3};
            int n = 6;
            for (int i = 1; i < n; i++) {
                int x = t[i], j = i - 1;
                while (j >= 0 && t[j] > x) {
                    t[j + 1] = t[j];
                    j--;
                }
                t[j + 1] = x;
                for (int k = 0; k < n; k++) cout << t[k] << " ";
                cout << endl;
            }
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                int[] t = {5, 2, 4, 6, 1, 3};
                for (int i = 1; i < t.length; i++) {
                    int x = t[i], j = i - 1;
                    while (j >= 0 && t[j] > x) {
                        t[j + 1] = t[j];
                        j--;
                    }
                    t[j + 1] = x;
                    System.out.println(Arrays.toString(t));
                }
            }
        }
        ~~~

        Wszystkie trzy wykonują w najgorszym razie około \`n²/2\` porównań. Dla tysiąca elementów to pół miliona – dobrze; dla miliona – pół biliona, czyli za dużo. Sortowanie przez wstawianie jest za to bardzo szybkie dla danych **prawie posortowanych** (element od razu jest na miejscu i pętla \`while\` nic nie robi).
      `,
    },
    {
      title: 'Szybsze sortowania',
      body: md`
        **Sortowanie przez scalanie** (merge sort): podziel tablicę na dwie połowy, posortuj każdą (rekurencyjnie), a potem **scal** dwie posortowane połowy – porównujesz ich pierwsze elementy i mniejszy przenosisz do wyniku. Podziałów jest \`log₂ n\`, a na każdym poziomie scalanie robi \`n\` kroków: razem około \`n · log₂ n\`. Dla miliona elementów to ok. 20 milionów kroków zamiast pół biliona.

        **Sortowanie szybkie** (quicksort): wybierz element „osiowy” (pivot), przenieś mniejsze na lewo, większe na prawo i posortuj rekurencyjnie obie części. Średnio też \`n · log n\`.

        **Sortowanie przez zliczanie**: gdy wartości są małymi liczbami (np. oceny 1–6, cyfry), policz, ile razy występuje każda wartość, i wypisz je po kolei – tylko \`n\` kroków.

        > **Na maturze:** W zadaniach „napisz program” sortuj **gotową funkcją** (\`sorted\`, \`sort\`, \`Arrays.sort\`) – jest szybka (\`n log n\`) i bezbłędna. Własne sortowanie pisz tylko wtedy, gdy zadanie każe zapisać algorytm albo zabrania funkcji wbudowanych; wtedy wystarczy proste sortowanie (np. przez wstawianie), o ile danych jest niewiele.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Ile **najwięcej** porównań z elementem środkowym wykona wyszukiwanie binarne w posortowanej tablicy 100 różnych liczb?`,
      answer: '7',
      explain: md`Każde porównanie co najmniej połowi przedział: 100 → 50 → 25 → 12 → 6 → 3 → 1 → 0. Po 7 porównaniach przedział jest pusty (albo element znaleziony). 2⁷ = 128 ≥ 100, a 2⁶ = 64 < 100.`,
    },
    {
      type: 'input',
      q: md`Tablica [5, 1, 4, 2, 8] po **jednym** przebiegu sortowania bąbelkowego (od lewej, zamiana sąsiadów w złej kolejności). Wpisz elementy oddzielone spacjami.`,
      answer: ['1 4 2 5 8'],
      exact: true,
      explain: md`(5,1) zamiana → 1 5 4 2 8; (5,4) zamiana → 1 4 5 2 8; (5,2) zamiana → 1 4 2 5 8; (5,8) bez zmian. Największy element jest już na końcu.`,
    },
    {
      type: 'choice',
      q: md`Które sortowanie z lekcji wykonuje **najmniej zamian** elementów (najwyżej \`n − 1\`)?`,
      options: ['przez wybór', 'bąbelkowe', 'przez wstawianie', 'wszystkie tyle samo'],
      answer: 0,
      explain: md`Sortowanie przez wybór w każdym kroku robi co najwyżej jedną zamianę (najmniejszy element na początek nieposortowanej części). Bąbelkowe i przez wstawianie przesuwają elementy wielokrotnie – w najgorszym razie ok. \`n²/2\` razy.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Wyszukiwanie binarne wymaga posortowanej tablicy.', answer: true },
        { text: 'Sortowanie przez wstawianie jest szybkie dla danych prawie posortowanych.', answer: true },
        { text: 'Sortowanie bąbelkowe wykonuje około n · log₂ n porównań.', answer: false },
        { text: 'Sortowanie przez scalanie dzieli tablicę na połowy i scala posortowane części.', answer: true },
      ],
      explain: md`Bąbelkowe wykonuje około \`n²/2\` porównań – rząd \`n · log n\` mają scalanie i (średnio) sortowanie szybkie.`,
    },
    {
      type: 'code',
      q: md`Wczytaj liczbę całkowitą \`n\` (0 ≤ \`n\` ≤ 10¹⁸) i wypisz największą liczbę całkowitą \`k\`, dla której \`k · k ≤ n\`. Użyj metody połowienia (pierwiastek z liczby zmiennoprzecinkowej może być niedokładny dla tak dużych liczb).`,
      tests: [
        { input: '10\n', output: '3\n' },
        { input: '16\n', output: '4\n' },
        { input: '0\n', output: '0\n' },
        { input: '1\n', output: '1\n' },
        { input: '99\n', output: '9\n' },
        { input: '1000000000000\n', output: '1000000\n' },
        { input: '1000000000000000000\n', output: '1000000000\n' },
        { input: '999999999999999999\n', output: '999999999\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          lewy, prawy = 0, 10**9
          while lewy < prawy:
              s = (lewy + prawy + 1) // 2
              if s * s <= n:
                  lewy = s
              else:
                  prawy = s - 1
          print(lewy)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              long long lewy = 0, prawy = 1000000000;
              while (lewy < prawy) {
                  long long s = (lewy + prawy + 1) / 2;
                  if (s * s <= n) lewy = s;
                  else prawy = s - 1;
              }
              cout << lewy << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  long lewy = 0, prawy = 1000000000L;
                  while (lewy < prawy) {
                      long s = (lewy + prawy + 1) / 2;
                      if (s * s <= n) lewy = s;
                      else prawy = s - 1;
                  }
                  System.out.println(lewy);
              }
          }
        `,
      },
      explain: md`Połowienie przedziału [0, 10⁹]: około 30 kroków. Górna granica 10⁹ wystarcza, bo (10⁹)² = 10¹⁸[[cpp java:  – i dzięki niej \`s · s\` zmieści się w [[cpp: \`long long\`]][[java: \`long\`]]]].
 Test 999999999999999999 łapie rozwiązania z \`sqrt\`: liczba zmiennoprzecinkowa zaokrągla ją do 10¹⁸ i daje 10⁹ zamiast 999999999.`,
    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu jest \`n\` (2 ≤ \`n\` ≤ 100), w drugim \`n\` liczb całkowitych. Posortuj je rosnąco metodą **przez wstawianie** i po każdym wstawieniu (dla \`i\` = 2, …, \`n\`) wypisz całą tablicę w jednym wierszu, liczby oddzielone spacjami – razem \`n − 1\` wierszy.
      `,
      tests: [
        { input: '6\n5 2 4 6 1 3\n', output: '2 5 4 6 1 3\n2 4 5 6 1 3\n2 4 5 6 1 3\n1 2 4 5 6 3\n1 2 3 4 5 6\n' },
        { input: '3\n1 2 3\n', output: '1 2 3\n1 2 3\n' },
        { input: '3\n3 2 1\n', output: '2 3 1\n1 2 3\n' },
        { input: '3\n7 7 1\n', output: '7 7 1\n1 7 7\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          t = list(map(int, input().split()))
          for i in range(1, n):
              x = t[i]
              j = i - 1
              while j >= 0 and t[j] > x:
                  t[j + 1] = t[j]
                  j -= 1
              t[j + 1] = x
              print(*t)
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              vector<long long> t(n);
              for (auto& x : t) cin >> x;
              for (int i = 1; i < n; i++) {
                  long long x = t[i];
                  int j = i - 1;
                  while (j >= 0 && t[j] > x) {
                      t[j + 1] = t[j];
                      j--;
                  }
                  t[j + 1] = x;
                  for (int k = 0; k < n; k++) cout << t[k] << (k + 1 < n ? " " : "\n");
              }
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
                  StringBuilder out = new StringBuilder();
                  for (int i = 1; i < n; i++) {
                      long x = t[i];
                      int j = i - 1;
                      while (j >= 0 && t[j] > x) {
                          t[j + 1] = t[j];
                          j--;
                      }
                      t[j + 1] = x;
                      for (int k = 0; k < n; k++) out.append(t[k]).append(k + 1 < n ? " " : "\n");
                  }
                  System.out.print(out);
              }
          }
        `,
      },
      explain: md`Warunek \`t[j] > x\` (ostra nierówność) przesuwa tylko **większe** elementy – równe zostają na miejscu, więc kolejność równych elementów się nie zmienia (sortowanie jest stabilne). Gdy element jest już na swoim miejscu (np. 6 w pierwszym teście), tablica po kroku wygląda tak samo jak przed nim.`,
    },
  ],
  practice: ['2024-maj/4.2', '2023-czerwiec/2.1', '2023-czerwiec/2.3', '2026-czerwiec/2.1', '2026-czerwiec/2.2'],
};
