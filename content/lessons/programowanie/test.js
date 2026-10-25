import { md, code } from '../lib.js';

const DANE = '5\n7\n7\n3\n8\n9\n1\n';

export default {
  questions: [
    {
      lesson: 'prog-01-start',
      type: 'choice',
      langs: ['cpp', 'java'],
      q: md`Program sumuje 1000 liczb, z których każda może mieć wartość do 10⁹. Jakiego typu powinna być zmienna z sumą?`,
      options: ['[[cpp: `long long`]][[java: `long`]]', '`int`', '`double`', '`char`'],
      answer: 0,
      explain: md`Suma może dojść do 10¹² – dużo więcej niż mieści \`int\` (ok. 2,1·10⁹). [[cpp: \`long long\`]][[java: \`long\`]] mieści liczby do ok. 9·10¹⁸. \`double\` też pomieści taką wartość, ale liczy z zaokrągleniami – do liczb całkowitych używaj typów całkowitych.`,
    },
    {
      lesson: 'prog-01-start',
      type: 'choice',
      langs: ['python'],
      q: md`Co wypisze \`print(10 / 4, 10 // 4)\`?`,
      options: ['`2.5 2`', '`2 2`', '`2.5 2.5`', '`2 2.5`'],
      answer: 0,
      explain: md`\`/\` zawsze daje liczbę z przecinkiem (2.5), a \`//\` to dzielenie całkowite (2).`,
    },
    {
      lesson: 'prog-01-start',
      type: 'input',
      q: md`Ile wynosi \`2026 mod 7\`?`,
      answer: '3',
      explain: md`7 · 289 = 2023, a 2026 − 2023 = 3.`,
    },
    {
      lesson: 'prog-02-warunki-petle',
      type: 'input',
      q: md`Ile razy wykona się ciało pętli [[python: \`for i in range(3, 30, 4):\`]][[cpp java: \`for (int i = 3; i < 30; i += 4)\`]]?`,
      answer: '7',
      explain: md`\`i\` = 3, 7, 11, 15, 19, 23, 27 – siedem wartości (31 byłoby już poza zakresem).`,
    },
    {
      lesson: 'prog-02-warunki-petle',
      type: 'choice',
      q: md`
        Jaką wartość będzie miało \`x\` po wykonaniu programu?
        ~~~python
        x = 0
        for i in range(1, 6):
            if i % 2 == 1:
                x += i
        ~~~
        ~~~cpp
        int x = 0;
        for (int i = 1; i < 6; i++)
            if (i % 2 == 1)
                x += i;
        ~~~
        ~~~java
        int x = 0;
        for (int i = 1; i < 6; i++)
            if (i % 2 == 1)
                x += i;
        ~~~
      `,
      options: ['9', '15', '6', '5'],
      answer: 0,
      explain: md`Pętla przechodzi przez 1, 2, 3, 4, 5, a dodaje tylko liczby nieparzyste: 1 + 3 + 5 = 9.`,
    },
    {
      lesson: 'prog-03-pliki',
      type: 'tf',
      q: md`Oceń prawdziwość zdań o czytaniu plików.`,
      items: [
        { text: '[[python: Wiersz pliku wczytany w pętli `for wiersz in plik` kończy się zwykle znakiem nowego wiersza.]][[cpp: `plik >> s` (dla `string s`) wczytuje jedno słowo, a nie cały wiersz.]][[java: `plik.next()` zwraca jedno słowo, a nie cały wiersz.]]', answer: true },
        { text: '[[python: Wiersz `"45\\n"` wczytany z pliku można od razu dodać do liczby, bez zamiany.]][[cpp: `ifstream` zgłasza błąd i przerywa program, jeśli pliku nie ma.]][[java: Gdy pliku nie ma, `Scanner` po cichu nic nie wczyta i program działa dalej.]]', answer: false },
        { text: '[[python: Otwarcie pliku w trybie `"w"` usuwa jego dotychczasową zawartość.]][[cpp: Otwarcie pliku przez `ofstream` usuwa jego dotychczasową zawartość.]][[java: Otwarcie pliku przez `new PrintWriter(...)` usuwa jego dotychczasową zawartość.]]', answer: true },
      ],
      explain: md`
        :::python
        - Tak – dlatego przy słowach używa się \`strip()\`.
        - Nie – to napis; liczbą stanie się po \`int(...)\`.
        - Tak – \`"w"\` to zapis od nowa.
        :::
        :::cpp
        - Tak – \`>>\` kończy czytanie na spacji albo końcu wiersza; cały wiersz wczytuje \`getline\`.
        - Nie – \`ifstream\` po cichu nie wczyta nic. Gdy wynik jest podejrzanie zerowy, sprawdź nazwę pliku.
        - Tak – \`ofstream\` otwiera plik do zapisu od nowa.
        :::
        :::java
        - Tak – \`next()\` kończy na spacji albo końcu wiersza; cały wiersz zwraca \`nextLine()\`.
        - Nie – \`new Scanner(new File(...))\` zgłasza wyjątek \`FileNotFoundException\` i program się kończy.
        - Tak – \`PrintWriter\` otwiera plik do zapisu od nowa.
        :::
      `,
    },
    {
      lesson: 'prog-04-napisy',
      type: 'input',
      q: md`Co wypisze [[python: \`print("programowanie"[3:7])\`]][[cpp: \`cout << s.substr(3, 4)\` dla \`string s = "programowanie"\`]][[java: \`System.out.println("programowanie".substring(3, 7))\`]]?`,
      answer: ['gram'],
      exact: true,
      explain: md`Indeksy od 0: p(0) r(1) o(2) **g(3) r(4) a(5) m(6)** o(7)… [[python: Wycinek \`[3:7]\` to indeksy 3–6.]][[cpp: \`substr(3, 4)\` to 4 znaki od indeksu 3.]][[java: \`substring(3, 7)\` to indeksy 3–6.]]`,
    },
    {
      lesson: 'prog-04-napisy',
      type: 'choice',
      q: md`Ile wynosi wyrażenie [[python: \`ord("d") - ord("a")\`]][[cpp java: \`'d' - 'a'\`]]?`,
      options: ['3', '4', '100', "to błąd – nie można odejmować znaków"],
      answer: 0,
      explain: md`Litery mają kolejne kody: a = 97, b = 98, c = 99, d = 100. Różnica to 3 – czyli numer litery d w alfabecie liczony od 0.`,
    },
    {
      lesson: 'prog-05-listy-slowniki',
      type: 'choice',
      q: md`Program czyta liczby i ma wypisać \`TAK\` przy liczbie, która **już wcześniej wystąpiła**. Jaka struktura najlepiej pamięta wcześniejsze liczby?`,
      options: ['zbiór (set)', 'jedna zmienna z poprzednią liczbą', 'licznik', 'napis'],
      answer: 0,
      explain: md`Zbiór szybko odpowiada na pytanie „czy ten element już był”. Jedna zmienna pamięta tylko ostatnią liczbę, a powtórzenie może dotyczyć dowolnej wcześniejszej.`,
    },
    {
      lesson: 'prog-05-listy-slowniki',
      type: 'input',
      q: md`[[python: Co wypisze \`print(sorted([5, 3, 9, 3, 1], reverse=True)[2])\`?]][[cpp: Wektor \`{5, 3, 9, 3, 1}\` posortowano malejąco (\`sort(t.rbegin(), t.rend())\`). Ile wynosi \`t[2]\`?]][[java: Listę \`[5, 3, 9, 3, 1]\` posortowano malejąco (\`t.sort(Collections.reverseOrder())\`). Ile wynosi \`t.get(2)\`?]]`,
      answer: '3',

      explain: md`Po posortowaniu malejąco: [9, 5, 3, 3, 1]. Indeks 2 to trzeci element – 3. Powtórzenia zostają na liście.`,
    },
    {
      lesson: 'prog-06-funkcje-cyfry',
      type: 'input',
      q: md`Zapisz liczbę 45 w systemie trójkowym (o podstawie 3).`,
      answer: '1200',
      exact: true,
      explain: md`Kolejne dzielenia przez 3: 45 = 3·15 + **0**, 15 = 3·5 + **0**, 5 = 3·1 + **2**, 1 = 3·0 + **1**. Reszty od końca: 1200. Sprawdzenie: 1·27 + 2·9 + 0·3 + 0 = 45.`,
    },
    {
      lesson: 'prog-06-funkcje-cyfry',
      type: 'choice',
      q: md`Dla jakich \`d\` wystarczy sprawdzić podzielność, żeby rozstrzygnąć, czy \`n\` > 1 jest liczbą pierwszą?`,
      options: ['dla 2 ≤ d, dopóki d · d ≤ n', 'dla 2 ≤ d ≤ n', 'dla 2 ≤ d ≤ n / 2 tylko parzystych', 'dla d = 2 i d = 3'],
      answer: 0,
      explain: md`Jeśli \`n\` ma dzielnik większy od \`√n\`, to ma też dzielnik mniejszy od \`√n\` (ich iloczyn to \`n\`). Sprawdzanie do \`n\` też da dobry wynik, ale jest dużo wolniejsze; pozostałe odpowiedzi przeoczą np. dzielnik 5 albo 7.`,
    },
    {
      lesson: 'prog-07-zadanie-maturalne',
      type: 'choice',
      q: md`Zadanie: „Podaj **pierwszą** w pliku liczbę o największej sumie cyfr”. Który warunek aktualizacji najlepszej liczby jest poprawny?`,
      options: ['`suma_cyfr(x) > suma_cyfr(najlepsza)`', '`suma_cyfr(x) >= suma_cyfr(najlepsza)`', '`x > najlepsza`', '`suma_cyfr(x) != suma_cyfr(najlepsza)`'],
      answer: 0,
      explain: md`Przy \`>\` późniejsza liczba z tą samą sumą cyfr nie zastąpi wcześniejszej – zostaje pierwsza. \`>=\` dałoby ostatnią.`,
    },
    {
      lesson: 'prog-03-pliki',
      type: 'code',
      q: md`W pliku \`dane.txt\` w każdym wierszu jest jedna liczba całkowita. Wypisz, **ile razy liczba jest większa od liczby w poprzednim wierszu**.`,
      tests: [
        { files: { 'dane.txt': DANE }, output: '3\n' },
        { files: { 'dane.txt': '1\n' }, output: '0\n' },
        { files: { 'dane.txt': '3\n2\n1\n' }, output: '0\n' },
        { files: { 'dane.txt': '1\n2\n3\n4\n5\n' }, output: '4\n' },
        { files: { 'dane.txt': '-1\n-2\n0\n0\n5\n' }, output: '2\n' },
      ],
      examples: 1,
      solution: {
        python: code`
          t = [int(w) for w in open("dane.txt") if w.strip()]
          print(sum(1 for i in range(1, len(t)) if t[i] > t[i - 1]))
        `,
        cpp: code`
          #include <iostream>
          #include <fstream>
          using namespace std;

          int main() {
              ifstream plik("dane.txt");
              long long x, poprz;
              int ile = 0;
              plik >> poprz;
              while (plik >> x) {
                  if (x > poprz) ile++;
                  poprz = x;
              }
              cout << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.io.*;
          import java.util.*;

          public class Main {
              public static void main(String[] args) throws IOException {
                  Scanner plik = new Scanner(new File("dane.txt"));
                  long poprz = plik.nextLong();
                  int ile = 0;
                  while (plik.hasNextLong()) {
                      long x = plik.nextLong();
                      if (x > poprz) ile++;
                      poprz = x;
                  }
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Wystarczy pamiętać **poprzednią** liczbę (albo całą listę i porównywać \`t[i]\` z \`t[i-1]\`). Po każdym porównaniu bieżąca liczba staje się „poprzednią” dla następnej.`,
    },
    {
      lesson: 'prog-05-listy-slowniki',
      type: 'code',
      q: md`Wczytaj słowo złożone z małych liter i wypisz, **ile różnych liter** w nim występuje.`,
      tests: [
        { input: 'abrakadabra\n', output: '5\n' },
        { input: 'a\n', output: '1\n' },
        { input: 'informatyka\n', output: '10\n' },
        { input: 'zzzz\n', output: '1\n' },
        { input: 'abcdefghijklmnopqrstuvwxyz\n', output: '26\n' },
      ],
      solution: {
        python: code`
          print(len(set(input().strip())))
        `,
        cpp: code`
          #include <iostream>
          #include <set>
          #include <string>
          using namespace std;

          int main() {
              string s;
              cin >> s;
              set<char> litery(s.begin(), s.end());
              cout << litery.size() << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  String s = sc.next();
                  Set<Character> litery = new HashSet<>();
                  for (char c : s.toCharArray()) litery.add(c);
                  System.out.println(litery.size());
              }
          }
        `,
      },
      explain: md`Zbiór liter usuwa powtórzenia, a jego rozmiar to liczba różnych liter. Działa też tablica 26 liczników: policz, ile liczników jest większych od zera.`,
    },
    {
      lesson: 'prog-06-funkcje-cyfry',
      type: 'code',
      q: md`
        W pierwszym wierszu jest \`n\` (1 ≤ \`n\` ≤ 1000), w drugim \`n\` nieujemnych liczb całkowitych (każda ≤ 10⁹). Wypisz liczbę o **największej sumie cyfr** i tę sumę, oddzielone spacją. Jeśli kilka liczb ma tę samą, największą sumę cyfr, wypisz **pierwszą** z nich.
      `,
      tests: [
        { input: '4\n19 28 99 1000\n', output: '99 18\n' },
        { input: '1\n5\n', output: '5 5\n' },
        { input: '3\n11 20 2\n', output: '11 2\n' },
        { input: '3\n123456789 999999999 0\n', output: '999999999 81\n' },
        { input: '3\n909 990 99\n', output: '909 18\n' },
      ],
      solution: {
        python: code`
          def suma_cyfr(n):
              s = 0
              while n > 0:
                  s += n % 10
                  n //= 10
              return s

          n = int(input())
          t = list(map(int, input().split()))
          najlepsza = t[0]
          for x in t:
              if suma_cyfr(x) > suma_cyfr(najlepsza):
                  najlepsza = x
          print(najlepsza, suma_cyfr(najlepsza))
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int suma_cyfr(long long n) {
              int s = 0;
              while (n > 0) {
                  s += n % 10;
                  n /= 10;
              }
              return s;
          }

          int main() {
              int n;
              cin >> n;
              vector<long long> t(n);
              for (auto& x : t) cin >> x;
              long long najlepsza = t[0];
              for (long long x : t)
                  if (suma_cyfr(x) > suma_cyfr(najlepsza)) najlepsza = x;
              cout << najlepsza << " " << suma_cyfr(najlepsza) << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              static int sumaCyfr(long n) {
                  int s = 0;
                  while (n > 0) {
                      s += n % 10;
                      n /= 10;
                  }
                  return s;
              }

              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int n = sc.nextInt();
                  long[] t = new long[n];
                  for (int i = 0; i < n; i++) t[i] = sc.nextLong();
                  long najlepsza = t[0];
                  for (long x : t)
                      if (sumaCyfr(x) > sumaCyfr(najlepsza)) najlepsza = x;
                  System.out.println(najlepsza + " " + sumaCyfr(najlepsza));
              }
          }
        `,
      },
      explain: md`Funkcja \`suma_cyfr\` i maksimum z warunkiem \`>\` (pierwsza przy remisie). Zaczynamy od pierwszej liczby, więc nawet dla samych zer wynik jest poprawny.`,
    },
  ],
};
