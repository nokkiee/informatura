import { md, code } from '../lib.js';

export default {
  questions: [
    {
      lesson: 'alg-01-pseudokod',
      type: 'input',
      q: md`
        Jaką wartość będzie miało \`x\` po wykonaniu algorytmu?
        ~~~pseudo
        x ← 0
        dla i = 1, 2, …, 6 wykonuj
            dla j = 1, 2, …, i wykonuj
                jeżeli j mod 2 = 0 to
                    x ← x + 1
        ~~~
      `,
      answer: '9',
      explain: md`Dla każdego \`i\` liczymy parzyste \`j\` z przedziału 1..i: i = 1: 0, i = 2: 1, i = 3: 1, i = 4: 2, i = 5: 2, i = 6: 3. Razem 9.`,
    },
    {
      lesson: 'alg-01-pseudokod',
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'W pseudokodzie `a ← a + 1` zwiększa wartość zmiennej a o 1.', answer: true },
        { text: 'Pętla `dla i = 3, 4, …, 10` wykonuje się 7 razy.', answer: false },
        { text: 'Tablicę `T[1..n]` z pseudokodu w programie zwykle przechowuje się w [[python: liście]][[cpp java: tablicy]] o indeksach od 0 do n − 1.', answer: true },

      ],
      explain: md`Pętla od 3 do 10 włącznie to 10 − 3 + 1 = **8** obrotów. Przesunięcie indeksów o jeden to typowa pułapka przy przepisywaniu pseudokodu.`,
    },
    {
      lesson: 'alg-02-cyfry-systemy',
      type: 'input',
      q: md`Ile wynosi w systemie dziesiętnym liczba \`1201₃\`?`,
      answer: '46',
      explain: md`Hornerem: 1 → 1·3 + 2 = 5 → 5·3 + 0 = 15 → 15·3 + 1 = 46.`,
    },
    {
      lesson: 'alg-02-cyfry-systemy',
      type: 'input',
      q: md`Zapisz liczbę 46 w systemie czwórkowym.`,
      answer: '232',
      exact: true,
      explain: md`46 = 4·11 + **2**, 11 = 4·2 + **3**, 2 = 4·0 + **2**. Reszty od końca: 232. Sprawdzenie: 2·16 + 3·4 + 2 = 46.`,
    },
    {
      lesson: 'alg-03-liczby',
      type: 'input',
      q: md`Oblicz NWD(252, 198).`,
      answer: '18',
      explain: md`252 mod 198 = 54, 198 mod 54 = 36, 54 mod 36 = 18, 36 mod 18 = 0 → 18.`,
    },
    {
      lesson: 'alg-03-liczby',
      type: 'choice',
      q: md`Dlaczego w sicie Eratostenesa wykreślanie wielokrotności liczby pierwszej \`p\` zaczyna się od \`p²\`?`,
      options: [
        'mniejsze wielokrotności p mają mniejszy dzielnik pierwszy i zostały już wykreślone',
        'bo p² jest zawsze liczbą pierwszą',
        'bo wielokrotności mniejsze od p² są liczbami pierwszymi',
        'to tylko konwencja – można zacząć od 2p i wynik będzie inny',
      ],
      answer: 0,
      explain: md`Każda wielokrotność \`k·p\` z \`k < p\` ma czynnik \`k\` (albo jego dzielnik pierwszy) mniejszy od \`p\` – więc skreśliło ją już wcześniejsze przejście. Start od \`2p\` dałby ten sam wynik, tylko wolniej.`,
    },
    {
      lesson: 'alg-04-rekurencja',
      type: 'input',
      q: md`Funkcja \`g\` jest określona tak: \`g(0) = g(1) = 1\`, a dla \`n > 1\`: \`g(n) = g(n − 1) + 2 · g(n − 2)\`. Ile wynosi \`g(6)\`?`,
      answer: '43',
      explain: md`Liczymy od dołu: g(2) = 1 + 2 = 3, g(3) = 3 + 2 = 5, g(4) = 5 + 6 = 11, g(5) = 11 + 10 = 21, g(6) = 21 + 22 = 43.`,
    },
    {
      lesson: 'alg-04-rekurencja',
      type: 'input',
      q: md`Funkcja \`h(n)\` zwraca 0 dla \`n = 0\`, a dla \`n > 0\` zwraca \`h(n div 3) + 1\`. Ile **łącznie** wywołań funkcji (licząc pierwsze) wykona obliczenie \`h(100)\`?`,
      answer: '6',
      explain: md`Argumenty: 100, 33, 11, 3, 1, 0 – sześć wywołań (h(100) = 5, czyli liczba cyfr zapisu trójkowego liczby 100).`,
    },
    {
      lesson: 'alg-05-szukanie-sortowanie',
      type: 'choice',
      q: md`W posortowanej tablicy jest 1000 różnych liczb. Ile **najwięcej** porównań z elementem środkowym potrzeba, żeby wyszukiwaniem binarnym stwierdzić, czy jest w niej dana liczba?`,
      options: ['10', '500', '1000', '32'],
      answer: 0,
      explain: md`2¹⁰ = 1024 ≥ 1000, więc po 10 połowieniach przedział jest pusty albo element znaleziony.`,
    },
    {
      lesson: 'alg-05-szukanie-sortowanie',
      type: 'input',
      q: md`Tablicę [29, 10, 14, 37, 13] sortujemy rosnąco **przez wybór** (najmniejszy element nieposortowanej części zamieniamy z jej pierwszym elementem). Jak wygląda tablica po **dwóch** krokach? Wpisz liczby oddzielone spacjami.`,
      answer: ['10 13 14 37 29'],
      exact: true,
      explain: md`Krok 1: najmniejsze 10 zamienia się z 29 → [10, 29, 14, 37, 13]. Krok 2: w części [29, 14, 37, 13] najmniejsze jest 13 – zamiana z 29 → [10, 13, 14, 37, 29].`,
    },
    {
      lesson: 'alg-06-teksty-szyfry',
      type: 'input',
      q: md`Zaszyfruj słowo \`zebra\` kodowaniem ROT13 (Cezar z kluczem 13).`,
      answer: ['mroen'],
      exact: true,
      explain: md`z → m, e → r, b → o, r → e, a → n.`,
    },
    {
      lesson: 'alg-07-zlozonosc-zapis',
      type: 'choice',
      q: md`Jaki rząd złożoności ma sprawdzanie, czy \`n\` jest liczbą pierwszą, przez szukanie dzielnika od 2, dopóki \`d · d ≤ n\`?`,
      options: ['√n', 'n', 'log n', 'n²'],
      answer: 0,
      explain: md`Pętla wykonuje się co najwyżej około \`√n\` razy. Dla \`n\` = 10¹² to milion obrotów – szybko; pętla do \`n\` potrzebowałaby biliona.`,
    },
    {
      lesson: 'alg-03-liczby',
      type: 'code',
      q: md`Wczytaj dwie nieujemne liczby całkowite \`a\` i \`b\` (≤ 10¹², nie obie zerowe) i wypisz ich NWD. Użyj algorytmu Euklidesa.`,
      tests: [
        { input: '84 36\n', output: '12\n' },
        { input: '17 5\n', output: '1\n' },
        { input: '1000000000000 999999999999\n', output: '1\n' },
        { input: '0 7\n', output: '7\n' },
        { input: '12 12\n', output: '12\n' },
      ],
      solution: {
        python: code`
          a, b = map(int, input().split())
          while b != 0:
              a, b = b, a % b
          print(a)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long a, b;
              cin >> a >> b;
              while (b != 0) {
                  long long r = a % b;
                  a = b;
                  b = r;
              }
              cout << a << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long a = sc.nextLong(), b = sc.nextLong();
                  while (b != 0) {
                      long r = a % b;
                      a = b;
                      b = r;
                  }
                  System.out.println(a);
              }
          }
        `,
      },
      explain: md`Euklides z resztą: dla 10¹² i 10¹² − 1 kończy się w dwóch krokach. Wersja z odejmowaniem też jest poprawna, ale dla \`(10¹², 1)\` musiałaby odjąć bilion razy. NWD(0, b) = b.`,
    },
    {
      lesson: 'alg-02-cyfry-systemy',
      type: 'code',
      q: md`Wczytaj podstawę \`p\` (2 ≤ \`p\` ≤ 10) i zapis liczby w systemie o tej podstawie (najwyżej 60 cyfr, wartość mniejsza niż 2⁶³). Wypisz tę liczbę w systemie dziesiętnym. Użyj schematu Hornera.`,
      tests: [
        { input: '3\n1201\n', output: '46\n' },
        { input: '2\n1011\n', output: '11\n' },
        { input: '10\n0\n', output: '0\n' },
        { input: '9\n88888888\n', output: '43046720\n' },
        { input: '2\n111111111111111111111111111111111111111111111111111111111111\n', output: '1152921504606846975\n' },
        { input: '4\n3302\n', output: '242\n' },
      ],
      solution: {
        python: code`
          p = int(input())
          s = input().strip()
          w = 0
          for c in s:
              w = w * p + (ord(c) - ord("0"))
          print(w)
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              int p;
              string s;
              cin >> p >> s;
              long long w = 0;
              for (char c : s) w = w * p + (c - '0');
              cout << w << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int p = sc.nextInt();
                  String s = sc.next();
                  long w = 0;
                  for (char c : s.toCharArray()) w = w * p + (c - '0');
                  System.out.println(w);
              }
          }
        `,
      },
      explain: md`Schemat Hornera po cyfrach od lewej: \`w = w·p + cyfra\`. Wartość cyfry ze znaku to [[python: \`ord(c) − ord('0')\` (albo po prostu \`int(c)\`)]][[cpp java: \`c − '0'\`]].[[cpp java:  Liczba z 60 jedynek binarnych to 2⁶⁰ − 1 – mieści się w [[cpp: \`long long\`]][[java: \`long\`]].]]`,

    },
    {
      lesson: 'alg-03-liczby',
      type: 'code',
      q: md`Wczytaj dwie liczby \`a\` i \`b\` (1 ≤ \`a\` ≤ \`b\` ≤ 1 000 000) i wypisz, ile liczb pierwszych jest w przedziale [\`a\`, \`b\`] (z końcami).`,
      tests: [
        { input: '1 10\n', output: '4\n' },
        { input: '10 20\n', output: '4\n' },
        { input: '1 1\n', output: '0\n' },
        { input: '990000 1000000\n', output: '721\n' },
        { input: '2 2\n', output: '1\n' },
      ],
      solution: {
        python: code`
          a, b = map(int, input().split())
          pierwsza = [True] * (b + 1)
          pierwsza[0] = False
          pierwsza[1] = False
          p = 2
          while p * p <= b:
              if pierwsza[p]:
                  for k in range(p * p, b + 1, p):
                      pierwsza[k] = False
              p += 1
          print(sum(pierwsza[a:b + 1]))
        `,
        cpp: code`
          #include <iostream>
          #include <vector>
          using namespace std;

          int main() {
              int a, b;
              cin >> a >> b;
              vector<bool> pierwsza(b + 1, true);
              pierwsza[0] = pierwsza[1] = false;
              for (long long p = 2; p * p <= b; p++)
                  if (pierwsza[p])
                      for (long long k = p * p; k <= b; k += p) pierwsza[k] = false;
              int ile = 0;
              for (int i = a; i <= b; i++)
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
                  int a = sc.nextInt(), b = sc.nextInt();
                  boolean[] pierwsza = new boolean[b + 1];
                  Arrays.fill(pierwsza, true);
                  pierwsza[0] = false;
                  pierwsza[1] = false;
                  for (long p = 2; p * p <= b; p++)
                      if (pierwsza[(int) p])
                          for (long k = p * p; k <= b; k += p) pierwsza[(int) k] = false;
                  int ile = 0;
                  for (int i = a; i <= b; i++)
                      if (pierwsza[i]) ile++;
                  System.out.println(ile);
              }
          }
        `,
      },
      explain: md`Sito do \`b\`, potem zliczenie w przedziale [a, b]. Liczba 1 nie jest pierwsza, 2 jest. Testowanie każdej liczby osobno do \`√x\` też by zdążyło, ale sito jest prostsze i szybsze.`,
    },
  ],
};
