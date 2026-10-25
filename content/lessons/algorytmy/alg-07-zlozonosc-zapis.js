import { md, code } from '../lib.js';

// a large test for the pairs exercise: an O(n²) program won't finish in time
const N = 100000;
const BIG = Array.from({ length: N }, (_, i) => ((i * 7919 + 13) % 2001) - 1000);
function pairs(t, x) {
  const seen = new Map();
  let n = 0;
  for (const v of t) {
    n += seen.get(x - v) || 0;
    seen.set(v, (seen.get(v) || 0) + 1);
  }
  return n;
}

export default {
  title: 'Złożoność i zapis algorytmu na maturze',
  summary: 'Rząd złożoności, co zdąży się policzyć, sumy prefiksowe i słownik zamiast drugiej pętli, uzupełnianie luk i zapisywanie algorytmu.',
  minutes: 35,
  intro: md`
    - jak szacować liczbę operacji algorytmu (rząd złożoności),
    - ile operacji komputer wykona w sekundę i co z tego wynika,
    - dwie sztuczki, które zamieniają \`n²\` na \`n\`: sumy prefiksowe i słownik,
    - jak uzupełniać luki w algorytmie i jak zapisać własny algorytm, żeby dostać pełne punkty.
  `,
  steps: [
    {
      title: 'Rząd złożoności',
      body: md`
        **Złożoność czasowa** mówi, jak liczba operacji rośnie wraz z rozmiarem danych \`n\`. Nie liczymy jej co do sztuki – interesuje nas **rząd**: czy przy dwa razy większych danych algorytm działa tak samo długo, dwa razy, cztery razy dłużej…

        | rząd | nazwa | przykład z lekcji | n = 1000 | n = 10⁶ |
        |---|---|---|---|---|
        | 1 | stała | ostatnia cyfra \`n mod 10\` | 1 | 1 |
        | log n | logarytmiczna | wyszukiwanie binarne, cyfry liczby | 10 | 20 |
        | n | liniowa | suma, maksimum, licznik | 1000 | 10⁶ |
        | n log n | liniowo-logarytmiczna | dobre sortowanie | 10⁴ | 2·10⁷ |
        | n² | kwadratowa | wszystkie pary, sortowanie bąbelkowe | 10⁶ | 10¹² |
        | 2ⁿ | wykładnicza | Fibonacci rekurencyjnie, wszystkie podzbiory | ≈10³⁰¹ | – |

        Stałe i mniejsze składniki pomija się: algorytm z \`3n + 7\` operacjami jest liniowy, a z \`n²/2 + n\` – kwadratowy.

        > **Zapamiętaj:** Pętla po \`n\` elementach → \`n\`. Pętla w pętli, obie po \`n\` → \`n²\`. Pętla, w której zmienna jest dzielona przez 2 (albo mnożona przez 2) → \`log n\`.
      `,
    },
    {
      title: 'Co zdąży się policzyć',
      body: md`
        Zwykły komputer wykonuje około **10⁸ prostych operacji na sekundę** (w Pythonie raczej 10⁷). To pozwala szybko ocenić, czy algorytm ma szansę:

        | rozmiar danych | wystarczy | za wolne |
        |---|---|---|
        | n ≤ 20 | nawet 2ⁿ | – |
        | n ≤ 5000 | n² | 2ⁿ |
        | n ≤ 10⁶ | n log n, n | n² |
        | n ≤ 10¹⁸ (jedna liczba) | log n, √n (do ~10¹²) | n |

        Pliki maturalne mają zwykle od kilkuset do kilku tysięcy wierszy, więc prawie każdy rozsądny algorytm zdąży. Ale zdarzają się wyjątki: wszystkie fragmenty długiego ciągu, wszystkie pary w 10 000 liczb (to już 50 milionów par – w Pythonie kilka–kilkanaście sekund), duże liczby do rozłożenia na czynniki.

        > **Wskazówka:** Jeśli program „myśli” dłużej niż minutę, zatrzymaj go i policz złożoność. Zwykle winna jest niepotrzebna pętla w pętli albo pętla do \`n\` zamiast do \`√n\`.
      `,
    },
    {
      title: 'Sumy prefiksowe i słownik',
      body: md`
        ### Sumy prefiksowe
        Pytanie „ile wynosi suma elementów od \`i\` do \`j\`” zadane wiele razy (np. dla wszystkich fragmentów) liczone pętlą kosztuje \`n\` za każdym razem. Zamiast tego policz raz tablicę **sum prefiksowych**: \`P[0] = 0\`, \`P[k] = P[k−1] + T[k]\` (suma pierwszych \`k\` elementów). Wtedy suma fragmentu \`T[i..j] = P[j] − P[i−1]\` – jedno odejmowanie. Przydaje się np. przy szukaniu fragmentu o największej średniej (zadanie z maja 2024).

        ### Słownik zamiast drugiej pętli
        Ile jest par \`(i, j)\`, \`i < j\`, z \`T[i] + T[j] = x\`? Dwie pętle to \`n²\`. Ale idąc od lewej, dla każdego elementu \`v\` wystarczy wiedzieć, **ile razy wcześniej** wystąpiło \`x − v\` – a to zapamiętuje słownik liczników. Jedno przejście, czyli \`n\` operacji:

        ~~~python run
        t = [1, 5, 3, 3, 2, 4]
        x = 6
        widziane = {}
        par = 0
        for v in t:
            par += widziane.get(x - v, 0)
            widziane[v] = widziane.get(v, 0) + 1
        print(par)
        ~~~
        ~~~cpp run
        #include <iostream>
        #include <map>
        using namespace std;

        int main() {
            int t[] = {1, 5, 3, 3, 2, 4};
            int x = 6;
            map<int, long long> widziane;
            long long par = 0;
            for (int v : t) {
                if (widziane.count(x - v)) par += widziane[x - v];
                widziane[v]++;
            }
            cout << par << endl;
            return 0;
        }
        ~~~
        ~~~java run
        import java.util.*;

        public class Main {
            public static void main(String[] args) {
                int[] t = {1, 5, 3, 3, 2, 4};
                int x = 6;
                Map<Integer, Long> widziane = new HashMap<>();
                long par = 0;
                for (int v : t) {
                    par += widziane.getOrDefault(x - v, 0L);
                    widziane.merge(v, 1L, Long::sum);
                }
                System.out.println(par);
            }
        }
        ~~~

        Pary: (1, 5), (3, 3), (2, 4) – razem 3.
      `,
    },
    {
      title: 'Uzupełnianie luk',
      body: md`
        Częsty typ zadania: algorytm z **lukami** do uzupełnienia. Nie zgaduj – ustal, **co ma być prawdą** w każdym miejscu algorytmu (tzw. niezmiennik), i dobierz wyrażenie tak, żeby tak było.

        Przykład: algorytm ma znaleźć **pozycję ostatniego** największego elementu tablicy \`T[1..n]\`.
        ~~~pseudo
        m ← T[1]
        p ← 1
        dla i = 2, 3, …, n wykonuj
            jeżeli T[i] ___ m to
                m ← T[i]
                p ← i
        ~~~

        Co ma być prawdą po każdym obrocie? „\`m\` to największy element spośród \`T[1..i]\`, a \`p\` – jego **ostatnia** pozycja”. Gdy \`T[i]\` jest **równe** \`m\`, pozycja ma się przesunąć na \`i\` – więc w luce \`≥\`. (Gdyby chodziło o pierwszą pozycję – \`>\`.)

        Sprawdź uzupełniony algorytm na małym przykładzie, najlepiej takim, który rozróżnia warianty (tu: tablica z powtórzonym maksimum, np. 3, 7, 2, 7).

        > **Na maturze:** Po uzupełnieniu luk przepisz algorytm na program i uruchom na kilku danych – to kilka minut, a daje pewność.
      `,
    },
    {
      title: 'Zapis własnego algorytmu',
      body: md`
        Zadania *„Zapisz w pseudokodzie lub w wybranym języku programowania algorytm…”* są oceniane według zasad z klucza CKE. Zwykle:
        - pełne punkty za algorytm **poprawny dla wszystkich danych** ze specyfikacji,
        - mniej punktów za algorytm z drobnym błędem (np. zły warunek brzegowy),
        - 0 punktów, jeśli użyto zabronionych funkcji albo algorytm nie rozwiązuje zadania.

        Jak pisać:
        1. **Trzymaj się specyfikacji** – używaj nazw danych z treści (\`n\`, \`T\`, \`k\`) i podaj wynik dokładnie tak, jak go nazwano (\`wynikiem jest …\` / wypisz / zmienna o podanej nazwie).
        2. **Pisz prosto** – czytelna pętla jest lepsza niż sprytna sztuczka, której sprawdzający może nie zrozumieć.
        3. **Przypadki brzegowe** – sprawdź minimalne dane (\`n = 1\`, liczba jednocyfrowa, wszystkie elementy równe).
        4. **Ograniczenia** – jeśli treść zabrania funkcji wbudowanych albo tablic, nie używaj ich nawet „pomocniczo”.
        5. **Sprawdź na komputerze** – na maturze masz komputer; w Informaturze zadania tego typu mają przycisk **Sprawdź testami**.

        Algorytm możesz zapisać w pseudokodzie (jak w arkuszach) albo jako fragment programu w Pythonie, C++ lub Javie – liczy się logika, a nie konkretna składnia.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Jaki jest rząd złożoności algorytmu, który dla każdej pary \`(i, j)\`, \`i < j\`, z \`n\` elementów wykonuje jedno porównanie?`,
      options: ['n²', 'n', 'n log n', 'log n'],
      answer: 0,
      explain: md`Par jest \`n(n − 1)/2\` – stała 1/2 i składnik \`−n/2\` nie zmieniają rzędu, więc to złożoność kwadratowa.`,
    },
    {
      type: 'choice',
      q: md`Jaki jest rząd złożoności liczenia cyfr liczby \`n\` (dzielenie przez 10, dopóki \`n > 0\`)?`,
      options: ['log n', 'n', '√n', '1'],
      answer: 0,
      explain: md`Liczba obrotów to liczba cyfr, czyli około \`log₁₀ n\`. Podstawa logarytmu nie zmienia rzędu – to złożoność logarytmiczna.`,
    },
    {
      type: 'input',
      q: md`Algorytm o złożoności \`n²\` działa 1 sekundę dla \`n = 10 000\`. Ile sekund (w przybliżeniu) będzie działał dla \`n = 20 000\`?`,
      answer: '4',
      explain: md`Dwa razy więcej danych to (2n)² = 4n² operacji – cztery razy dłużej.`,
    },
    {
      type: 'choice',
      q: md`
        Algorytm ma podać pozycję **pierwszego** wystąpienia najmniejszego elementu tablicy \`T[1..n]\`. Co wpisać w lukę?
        ~~~pseudo
        m ← T[1]
        p ← 1
        dla i = 2, 3, …, n wykonuj
            jeżeli T[i] ___ m to
                m ← T[i]
                p ← i
        ~~~
      `,
      options: ['<', '≤', '>', '≥'],
      answer: 0,
      explain: md`Szukamy minimum, więc nowy element zastępuje stary, gdy jest **mniejszy**. Ostre \`<\` sprawia, że przy równym elemencie pozycja się nie zmienia – zostaje pierwsza. \`≤\` dałoby ostatnią pozycję minimum.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Dla dużych n algorytm o złożoności n log n jest szybszy od algorytmu o złożoności n².', answer: true },
        { text: 'Algorytm o złożoności 2ⁿ zdąży policzyć wynik dla n = 100 w kilka sekund.', answer: false },
        { text: 'Sumy prefiksowe pozwalają policzyć sumę dowolnego fragmentu tablicy jednym odejmowaniem.', answer: true },
        { text: 'W zadaniu „zapisz algorytm” z zakazem funkcji wbudowanych wolno użyć wbudowanego sortowania, jeśli tylko pomaga.', answer: false },
      ],
      explain: md`
        - Tak – np. dla miliona: 2·10⁷ wobec 10¹².
        - Nie – 2¹⁰⁰ ≈ 10³⁰ operacji, czyli dłużej niż istnieje Wszechświat.
        - Tak: suma T[i..j] = P[j] − P[i−1].
        - Nie – zakaz obejmuje wszystkie funkcje wbudowane, także pomocniczo.
      `,
    },
    {
      type: 'code',
      q: md`
        Wczytaj nieujemną liczbę całkowitą \`n\` (≤ 10¹⁸). Wypisz \`TAK\`, jeśli jej cyfry czytane **od lewej** tworzą ciąg niemalejący (np. 1123, 7, 0), albo \`NIE\` w przeciwnym razie (np. 1321). Spróbuj bez zamiany liczby na napis – jak w zadaniu z zakazem funkcji wbudowanych.
      `,
      tests: [
        { input: '1123\n', output: 'TAK\n' },
        { input: '1321\n', output: 'NIE\n' },
        { input: '7\n', output: 'TAK\n' },
        { input: '0\n', output: 'TAK\n' },
        { input: '10\n', output: 'NIE\n' },
        { input: '123456789999999999\n', output: 'TAK\n' },
        { input: '111111111111111110\n', output: 'NIE\n' },
      ],
      solution: {
        python: code`
          n = int(input())
          ok = True
          poprzednia = 10                # cyfry idą od końca, więc każda kolejna ma być ≤ poprzedniej
          while n > 0:
              c = n % 10
              if c > poprzednia:
                  ok = False
              poprzednia = c
              n //= 10
          print("TAK" if ok else "NIE")
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long n;
              cin >> n;
              bool ok = true;
              int poprzednia = 10;
              while (n > 0) {
                  int c = n % 10;
                  if (c > poprzednia) ok = false;
                  poprzednia = c;
                  n /= 10;
              }
              cout << (ok ? "TAK" : "NIE") << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long n = sc.nextLong();
                  boolean ok = true;
                  int poprzednia = 10;
                  while (n > 0) {
                      int c = (int) (n % 10);
                      if (c > poprzednia) ok = false;
                      poprzednia = c;
                      n /= 10;
                  }
                  System.out.println(ok ? "TAK" : "NIE");
              }
          }
        `,
      },
      explain: md`Cyfry dostajemy od końca, więc warunek „niemalejące od lewej” zamienia się w „nierosnące od prawej”: każda kolejna (bardziej na lewo) cyfra ma być **nie większa** od poprzedniej. Start od 10 sprawia, że pierwsza (ostatnia) cyfra zawsze pasuje.`,
    },
    {
      type: 'code',
      q: md`
        W pierwszym wierszu są \`n\` (1 ≤ \`n\` ≤ 100 000) i \`x\`, w drugim \`n\` liczb całkowitych z przedziału [−1000, 1000]. Wypisz, **ile jest par** \`(i, j)\`, \`i < j\`, dla których \`T[i] + T[j] = x\`.

        Uwaga: dla 100 000 liczb par jest prawie 5 miliardów – sprawdzanie wszystkich nie zdąży. Użyj słownika z kroku 3.
      `,
      tests: [
        { input: '6 6\n1 5 3 3 2 4\n', output: '3\n' },
        { input: '4 2\n1 1 1 1\n', output: '6\n' },
        { input: '1 0\n0\n', output: '0\n' },
        { input: '5 0\n-1 1 0 0 2\n', output: '2\n' },
        { input: `${N} 7\n${BIG.join(' ')}\n`, output: `${pairs(BIG, 7)}\n` },
      ],
      examples: 2,
      solution: {
        python: code`
          n, x = map(int, input().split())
          t = list(map(int, input().split()))
          widziane = {}
          par = 0
          for v in t:
              par += widziane.get(x - v, 0)
              widziane[v] = widziane.get(v, 0) + 1
          print(par)
        `,
        cpp: code`
          #include <iostream>
          #include <map>
          using namespace std;

          int main() {
              int n;
              long long x;
              cin >> n >> x;
              map<long long, long long> widziane;
              long long par = 0;
              for (int i = 0; i < n; i++) {
                  long long v;
                  cin >> v;
                  auto it = widziane.find(x - v);
                  if (it != widziane.end()) par += it->second;
                  widziane[v]++;
              }
              cout << par << endl;
              return 0;
          }
        `,
        java: code`
          import java.io.*;
          import java.util.*;

          public class Main {
              public static void main(String[] args) throws IOException {
                  BufferedReader in = new BufferedReader(new InputStreamReader(System.in));
                  StringTokenizer st = new StringTokenizer(in.readLine());
                  int n = Integer.parseInt(st.nextToken());
                  long x = Long.parseLong(st.nextToken());
                  st = new StringTokenizer(in.readLine());
                  Map<Long, Long> widziane = new HashMap<>();
                  long par = 0;
                  for (int i = 0; i < n; i++) {
                      long v = Long.parseLong(st.nextToken());
                      par += widziane.getOrDefault(x - v, 0L);
                      widziane.merge(v, 1L, Long::sum);
                  }
                  System.out.println(par);
              }
          }
        `,
      },
      explain: md`Każdy element „łączy się w parę” ze wszystkimi wcześniejszymi elementami równymi \`x − v\` – a ich liczbę daje słownik. Kolejność (najpierw dolicz pary, potem dodaj \`v\` do słownika) sprawia, że element nie łączy się sam ze sobą i każda para jest liczona raz. Wynik może przekroczyć 2 miliardy (dla 100 000 jednakowych liczb to prawie 5·10⁹), stąd \`long long\` / \`long\`. W Javie przy dużych danych szybciej czyta \`BufferedReader\` niż \`Scanner\`.`,
    },
  ],
  practice: ['2023-maj/2.1', '2024-maj/3.1', '2025-maj/1.3', '2026-maj/2.2', '2026-czerwiec/2.2', '2024-maj/4.4', '2023-czerwiec/1.3'],
};
