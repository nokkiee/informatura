import { md, code } from '../lib.js';

export default {
  title: 'Dzielniki, liczby pierwsze, NWD',
  summary: 'Szukanie dzielników do √n, test pierwszości, sito Eratostenesa, rozkład na czynniki pierwsze, algorytm Euklidesa i NWW.',
  minutes: 35,
  intro: md`
    - jak szybko znaleźć wszystkie dzielniki liczby i dlaczego wystarczy sprawdzać do \`√n\`,
    - kiedy sprawdzać liczby pierwsze jedna po drugiej, a kiedy użyć sita Eratostenesa,
    - jak rozłożyć liczbę na czynniki pierwsze,
    - jak działa algorytm Euklidesa (NWD) i jak z niego policzyć NWW.
  `,
  steps: [
    {
      title: 'Dzielniki w parach',
      body: md`
        Dzielniki liczby występują **parami**: jeśli \`d\` dzieli \`n\`, to \`n / d\` też. Dla 36: (1, 36), (2, 18), (3, 12), (4, 9), (6, 6). W każdej parze mniejszy dzielnik jest ≤ \`√n\`. Dlatego wystarczy przejrzeć \`d\` od 1, dopóki \`d · d ≤ n\`, i dopisywać obie liczby z pary (uważając, żeby przy \`d · d = n\` nie liczyć \`d\` dwa razy).

        Zamiast \`n\` sprawdzeń robimy ich \`√n\`: dla \`n\` = 10¹² to milion zamiast biliona – różnica między ułamkiem sekundy a godzinami.

        ~~~python run
        def dzielniki(n):
            male, duze = [], []
            d = 1
            while d * d <= n:
                if n % d == 0:
                    male.append(d)
                    if d != n // d:
                        duze.append(n // d)
                d += 1
            return male + duze[::-1]

        print(dzielniki(36))
        print(len(dzielniki(720720)))
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <vector>
        #include <algorithm>
        using namespace std;

        vector<long long> dzielniki(long long n) {
            vector<long long> male, duze;
            for (long long d = 1; d * d <= n; d++)
                if (n % d == 0) {
                    male.push_back(d);
                    if (d != n / d) duze.push_back(n / d);
                }
            reverse(duze.begin(), duze.end());
            male.insert(male.end(), duze.begin(), duze.end());
            return male;
        }

        int main() {
            for (long long d : dzielniki(36)) cout << d << " ";
            cout << endl << dzielniki(720720).size() << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            static List<Long> dzielniki(long n) {
                List<Long> male = new ArrayList<>(), duze = new ArrayList<>();
                for (long d = 1; d * d <= n; d++)
                    if (n % d == 0) {
                        male.add(d);
                        if (d != n / d) duze.add(n / d);
                    }
                Collections.reverse(duze);
                male.addAll(duze);
                return male;
            }

            public static void main(String[] args) {
                System.out.println(dzielniki(36));
                System.out.println(dzielniki(720720).size());
            }
        }
        ~~~

        Liczba **pierwsza** to taka, która ma dokładnie dwa dzielniki – więc test pierwszości to ta sama pętla, przerwana przy pierwszym dzielniku z przedziału [2, √n] (było w lekcji o funkcjach w dziale Programowanie).
      `,
    },
    {
      title: 'Sito Eratostenesa',
      body: md`
        Gdy trzeba sprawdzić pierwszość **wielu** liczb z niewielkiego zakresu (np. wszystkich do miliona), szybsze od testowania każdej z osobna jest **sito Eratostenesa**:

        1. Wypisz liczby od 2 do \`n\` i uznaj wszystkie za pierwsze.
        2. Weź najmniejszą nieskreśloną liczbę \`p\` – jest pierwsza.
        3. Skreśl wszystkie jej wielokrotności: \`p²\`, \`p² + p\`, \`p² + 2p\`, … (mniejsze wielokrotności skreśliły już mniejsze liczby pierwsze).
        4. Powtarzaj dla kolejnych nieskreślonych \`p\`, dopóki \`p² ≤ n\`.

        Dla \`n = 30\`: skreślamy wielokrotności 2 (od 4), potem 3 (od 9), potem 5 (od 25). Przy 7 mamy już 49 > 30 – koniec. Zostają: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29.

        ~~~python run
        n = 30
        pierwsza = [True] * (n + 1)
        pierwsza[0] = pierwsza[1] = False
        p = 2
        while p * p <= n:
            if pierwsza[p]:
                for k in range(p * p, n + 1, p):
                    pierwsza[k] = False
            p += 1
        print([i for i in range(n + 1) if pierwsza[i]])
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <vector>
        using namespace std;

        int main() {
            int n = 30;
            vector<bool> pierwsza(n + 1, true);
            pierwsza[0] = pierwsza[1] = false;
            for (int p = 2; p * p <= n; p++)
                if (pierwsza[p])
                    for (int k = p * p; k <= n; k += p) pierwsza[k] = false;
            for (int i = 0; i <= n; i++)
                if (pierwsza[i]) cout << i << " ";
            cout << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                int n = 30;
                boolean[] pierwsza = new boolean[n + 1];
                java.util.Arrays.fill(pierwsza, true);
                pierwsza[0] = pierwsza[1] = false;
                for (int p = 2; p * p <= n; p++)
                    if (pierwsza[p])
                        for (int k = p * p; k <= n; k += p) pierwsza[k] = false;
                StringBuilder sb = new StringBuilder();
                for (int i = 0; i <= n; i++)
                    if (pierwsza[i]) sb.append(i).append(" ");
                System.out.println(sb);
            }
        }
        ~~~

        > **Wskazówka:** Po zbudowaniu sita pytanie „czy \`x\` jest pierwsza” to jedno spojrzenie do tablicy: \`pierwsza[x]\`. Opłaca się, gdy liczb do sprawdzenia jest dużo, a są one niewielkie (np. sumy kodów ASCII liter w słowach).
      `,
    },
    {
      title: 'Rozkład na czynniki pierwsze',
      body: md`
        Każdą liczbę większą od 1 da się zapisać jako iloczyn liczb pierwszych, np. \`360 = 2 · 2 · 2 · 3 · 3 · 5 = 2³ · 3² · 5\`. Algorytm: dziel przez \`d = 2, 3, 4, …\`, **dopóki się dzieli**; gdy \`d · d > n\`, to to, co zostało (jeśli > 1), jest ostatnim czynnikiem pierwszym.

        ~~~pseudo
        d ← 2
        dopóki d · d ≤ n wykonuj
            dopóki n mod d = 0 wykonuj
                wypisz d
                n ← n div d
            d ← d + 1
        jeżeli n > 1 to wypisz n
        ~~~

        Dlaczego nigdy nie wypisze się liczba złożona, np. 4? Bo zanim \`d\` dojdzie do 4, z \`n\` zostały już „wydzielone” wszystkie dwójki – więc 4 nie może już dzielić \`n\`.

        Z rozkładu łatwo odczytać np. **liczbę dzielników**: dla \`n = p₁^a₁ · p₂^a₂ · …\` jest ich \`(a₁ + 1)(a₂ + 1)…\`. Dla \`360 = 2³ · 3² · 5¹\`: \`4 · 3 · 2 = 24\` dzielniki.
      `,
    },
    {
      title: 'NWD i NWW – algorytm Euklidesa',
      body: md`
        **NWD(a, b)** – największy wspólny dzielnik. Algorytm Euklidesa opiera się na tym, że \`NWD(a, b) = NWD(b, a mod b)\` (każdy wspólny dzielnik \`a\` i \`b\` dzieli też resztę). Liczby szybko maleją, aż reszta będzie zerem:

        ~~~pseudo
        dopóki b ≠ 0 wykonuj
            r ← a mod b
            a ← b
            b ← r
        wynikiem jest a
        ~~~

        | a | b | a mod b |
        |---|---|---|
        | 1071 | 462 | 147 |
        | 462 | 147 | 21 |
        | 147 | 21 | 0 |
        | 21 | 0 | – |

        NWD(1071, 462) = 21. Starsza wersja z **odejmowaniem** (\`większą liczbę zastąp różnicą\`) daje ten sam wynik, ale potrafi wykonać bardzo dużo kroków (np. dla 1000000 i 1) – reszta z dzielenia to „wiele odejmowań naraz”.

        **NWW(a, b)** – najmniejsza wspólna wielokrotność: \`NWW(a, b) = a · b / NWD(a, b)\`. Na przykład NWW(12, 18) = 216 / 6 = 36. Dla dużych liczb dziel **przed** mnożeniem: \`a / NWD(a, b) · b\` – mniejsze ryzyko przepełnienia.

        Liczby są **względnie pierwsze**, gdy ich NWD = 1 (np. 8 i 15).

        ~~~python run
        def nwd(a, b):
            while b != 0:
                a, b = b, a % b
            return a

        print(nwd(1071, 462), nwd(84, 120), 12 // nwd(12, 18) * 18, nwd(8, 15))
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        long long nwd(long long a, long long b) {
            while (b != 0) {
                long long r = a % b;
                a = b;
                b = r;
            }
            return a;
        }

        int main() {
            cout << nwd(1071, 462) << " " << nwd(84, 120) << " " << 12 / nwd(12, 18) * 18 << " " << nwd(8, 15) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            static long nwd(long a, long b) {
                while (b != 0) {
                    long r = a % b;
                    a = b;
                    b = r;
                }
                return a;
            }

            public static void main(String[] args) {
                System.out.println(nwd(1071, 462) + " " + nwd(84, 120) + " " + 12 / nwd(12, 18) * 18 + " " + nwd(8, 15));
            }
        }
        ~~~

        > **Na maturze:** NWD pojawia się np. przy upraszczaniu ułamków, wektorów przesunięcia (zadanie „Dron” z maja 2025) czy sprawdzaniu, czy liczby są względnie pierwsze (czerwiec 2025).
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Ile dzielników ma liczba 36 (licząc 1 i 36)?`,
      answer: '9',
      explain: md`Pary: (1, 36), (2, 18), (3, 12), (4, 9) i (6, 6) – ta ostatnia daje jeden dzielnik. Razem 4·2 + 1 = 9. Ze wzoru: 36 = 2²·3², więc (2+1)(2+1) = 9.`,
    },
    {
      type: 'input',
      q: md`Oblicz NWD(84, 120).`,
      answer: '12',
      explain: md`120 mod 84 = 36, 84 mod 36 = 12, 36 mod 12 = 0 → NWD = 12.`,
    },
    {
      type: 'choice',
      q: md`Które liczby zostaną skreślone **jako pierwsze**, gdy sito Eratostenesa dla \`n = 50\` dojdzie do \`p = 7\`?`,
      options: ['49', '14, 21, 28, 35, 42, 49', '7, 14, 21, 28, 35, 42, 49', 'żadne – 7 jest pierwsza'],
      answer: 0,
      explain: md`Wykreślanie wielokrotności \`p\` zaczyna się od \`p²\` = 49 – mniejsze wielokrotności 7 (14, 21, 28, 35, 42) zostały już skreślone jako wielokrotności 2, 3 lub 5. Liczba 7 sama zostaje (jest pierwsza).`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'NWW(12, 18) = 36.', answer: true },
        { text: 'Jeśli NWD(a, b) = 1, to a i b muszą być liczbami pierwszymi.', answer: false },
        { text: 'Algorytm Euklidesa z resztą z dzielenia wykonuje zwykle mniej kroków niż wersja z odejmowaniem.', answer: true },
        { text: 'Liczba 360 ma 24 dzielniki.', answer: true },
      ],
      explain: md`
        - Tak: 12·18 / NWD(12, 18) = 216 / 6 = 36.
        - Nie – takie liczby są **względnie** pierwsze, np. 8 i 15 (żadna nie jest pierwsza).
        - Tak – jedna reszta zastępuje wiele odejmowań.
        - Tak: 360 = 2³·3²·5, więc (3+1)(2+1)(1+1) = 24.
      `,
    },
    {
      type: 'code',
      q: md`Wczytaj liczbę całkowitą \`n\` (2 ≤ \`n\` ≤ 10¹²) i wypisz jej rozkład na czynniki pierwsze: czynniki rosnąco, z powtórzeniami, oddzielone spacjami.`,
      tests: [
        { input: '360\n', output: '2 2 2 3 3 5\n' },
        { input: '97\n', output: '97\n' },
        { input: '1024\n', output: '2 2 2 2 2 2 2 2 2 2\n' },
        { input: '600851475143\n', output: '71 839 1471 6857\n' },
        { input: '999999999989\n', output: '999999999989\n' },
        { input: '2\n', output: '2\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          czynniki = []
          d = 2
          while d * d <= n:
              while n % d == 0:
                  czynniki.append(d)
                  n //= d
              d += 1
          if n > 1:
              czynniki.append(n)
          print(*czynniki)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              bool pierwszy = true;
              for (long long d = 2; d * d <= n; d++)
                  while (n % d == 0) {
                      cout << (pierwszy ? "" : " ") << d;
                      pierwszy = false;
                      n /= d;
                  }
              if (n > 1) cout << (pierwszy ? "" : " ") << n;
              cout << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  StringBuilder sb = new StringBuilder();
                  for (long d = 2; d * d <= n; d++)
                      while (n % d == 0) {
                          sb.append(d).append(" ");
                          n /= d;
                      }
                  if (n > 1) sb.append(n);
                  System.out.println(sb.toString().trim());
              }
          }
        `,
      },
      explain: md`Algorytm z kroku 3. Pętla po \`d\` kończy się przy \`d·d > n\` – dla liczby pierwszej ok. 10¹² to milion obrotów, czyli ułamek sekundy. Gdyby pętla szła do \`n\`, program liczyłby godzinami. Warunek \`d·d ≤ n\` sprawdzamy dla **zmniejszającego się** \`n\`, co dodatkowo przyspiesza.`,
    },
    {
      type: 'code',
      q: md`Wczytaj liczbę \`n\` (1 ≤ \`n\` ≤ 1 000 000) i wypisz, **ile jest liczb pierwszych nie większych od** \`n\`. Użyj sita Eratostenesa.`,
      tests: [
        { input: '10\n', output: '4\n' },
        { input: '30\n', output: '10\n' },
        { input: '1\n', output: '0\n' },
        { input: '2\n', output: '1\n' },
        { input: '100\n', output: '25\n' },
        { input: '1000000\n', output: '78498\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          pierwsza = [True] * (n + 1)
          pierwsza[0] = False
          if n >= 1:
              pierwsza[1] = False
          p = 2
          while p * p <= n:
              if pierwsza[p]:
                  for k in range(p * p, n + 1, p):
                      pierwsza[k] = False
              p += 1
          print(sum(pierwsza))
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int n;
              cin >> n;
              vector<bool> pierwsza(n + 1, true);
              pierwsza[0] = false;
              if (n >= 1) pierwsza[1] = false;
              for (long long p = 2; p * p <= n; p++)
                  if (pierwsza[p])
                      for (long long k = p * p; k <= n; k += p) pierwsza[k] = false;
              int ile = 0;
              for (int i = 0; i <= n; i++)
                  if (pierwsza[i]) ile++;
              cout << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  boolean[] pierwsza = new boolean[n + 1];
                  Arrays.fill(pierwsza, true);
                  pierwsza[0] = false;
                  if (n >= 1) pierwsza[1] = false;
                  for (long p = 2; p * p <= n; p++)
                      if (pierwsza[(int) p])
                          for (long k = p * p; k <= n; k += p) pierwsza[(int) k] = false;
                  int ile = 0;
                  for (int i = 0; i <= n; i++)
                      if (pierwsza[i]) ile++;
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Sito dla miliona liczb robi kilka milionów prostych operacji – ułamek sekundy. Sprawdzanie każdej liczby osobno do \`√x\` też by zdążyło, ale byłoby kilkadziesiąt razy wolniejsze. Uwaga na \`n = 1\`: tablica ma wtedy tylko indeksy 0 i 1.`,
    },
  ],
  practice: ['2025-maj/3.1', '2025-czerwiec/2.2', '2024-maj/4.1', '2024-maj/4.3', '2026-czerwiec/3.2'],
};
