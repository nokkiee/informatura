import { md, code } from '../lib.js';

export default {
  title: 'Bity, logika i kolory',
  summary: 'Bit i bajt, jednostki, zakresy liczb n-bitowych, liczby ujemne w kodzie U2, operacje AND, OR, XOR, NOT, bramki logiczne i kolory RGB w zapisie szesnastkowym.',
  minutes: 30,
  intro: md`
    - czym są bit i bajt i jak rosną jednostki (kB, KiB, MB…),
    - jakie liczby zmieszczą się na \`n\` bitach – bez znaku i ze znakiem (kod U2),
    - operacje bitowe i bramki logiczne: \`AND\`, \`OR\`, \`XOR\`, \`NOT\`,
    - jak zapisuje się kolory: RGB i zapis szesnastkowy \`#RRGGBB\` (np. w CSS).
  `,
  steps: [
    {
      title: 'Bit, bajt, jednostki',
      body: md`
        **Bit** to najmniejsza porcja informacji: 0 albo 1. **Bajt** to 8 bitów.

        Na \`n\` bitach da się zapisać \`2ⁿ\` różnych wartości: liczby bez znaku od 0 do \`2ⁿ − 1\`. Na jednym bajcie: 0…255; na 16 bitach: 0…65 535; na 32 bitach: ok. 4,3 mld.

        | jednostka | wartość |
        |---|---|
        | 1 kB (kilobajt, SI) | 1000 B |
        | 1 KiB (kibibajt) | 1024 B = 2¹⁰ B |
        | 1 MB / 1 MiB | 10⁶ B / 2²⁰ B |
        | 1 GB / 1 GiB | 10⁹ B / 2³⁰ B |

        W praktyce „1 KB = 1024 B” bywa używane potocznie – czytaj treść zadania, którą konwencję przyjmuje. Uwaga też na **bity i bajty**: łącze 100 Mb/s (megabitów) przesyła ok. 12,5 MB (megabajtów) na sekundę.
      `,
    },
    {
      title: 'Liczby ujemne: kod U2',
      body: md`
        Komputery zapisują liczby całkowite ze znakiem w **kodzie uzupełnień do dwóch (U2)**. Na \`n\` bitach najstarszy bit ma wagę **ujemną**: \`−2ⁿ⁻¹\`, pozostałe – zwykłe dodatnie.

        Na 8 bitach: \`10000000\` = −128, \`11111111\` = −128 + 127 = **−1**, \`01111111\` = 127. Zakres: **−128 … 127**. Liczba jest ujemna, gdy najstarszy bit to 1.

        **Jak zapisać −5 na 8 bitach?** Zapisz 5 (\`00000101\`), **odwróć** wszystkie bity (\`11111010\`) i **dodaj 1**: \`11111011\`. Sprawdzenie: −128 + 64 + 32 + 16 + 8 + 2 + 1 = −5 ✓.

        **Odczyt:** \`11110110\` → najstarszy bit 1, więc ujemna: −128 + 64 + 32 + 16 + 4 + 2 = **−10**.

        > **Zapamiętaj:** [[python: 32-bitowa liczba w kodzie U2 ma zakres od −2 147 483 648 do 2 147 483 647, a przekroczenie maksimum „zawija się” na liczby ujemne. W Pythonie liczby całkowite nie mają limitu, więc tego nie zobaczysz – ale na maturze takie pytania się zdarzają.]][[cpp java: Dlatego \`int\` (32 bity) ma zakres od −2 147 483 648 do 2 147 483 647, a przekroczenie maksimum „zawija się” na liczby ujemne – to przepełnienie z lekcji o programowaniu.]]
      `,
    },
    {
      title: 'Operacje logiczne i bramki',
      body: md`
        Operacje logiczne działają na pojedynczych bitach (a zastosowane do liczb – na każdej parze odpowiadających sobie bitów):

        | a | b | a AND b | a OR b | a XOR b |
        |---|---|---|---|---|
        | 0 | 0 | 0 | 0 | 0 |
        | 0 | 1 | 0 | 1 | 1 |
        | 1 | 0 | 0 | 1 | 1 |
        | 1 | 1 | 1 | 1 | 0 |

        \`NOT a\` odwraca bit. **XOR** (alternatywa wykluczająca) daje 1, gdy bity są **różne**.

        Na liczbach: \`12 XOR 10\` → \`1100 XOR 1010 = 0110\` = 6; \`12 AND 10\` = \`1000\` = 8; \`12 OR 10\` = \`1110\` = 14.

        Przydatne własności XOR: \`a XOR a = 0\`, \`a XOR 0 = a\`, \`(a XOR b) XOR b = a\` – dlatego XOR z kluczem szyfruje i ten sam XOR odszyfrowuje. Liczba jedynek w \`a XOR b\` mówi, na ilu bitach liczby się różnią.

        W programach: \`&\` (AND), \`|\` (OR), \`^\` (XOR), \`~\` (NOT), a przesunięcia \`<<\`, \`>>\` mnożą i dzielą przez potęgi 2.

        ~~~python run
        print(12 ^ 10, 12 & 10, 12 | 10, 5 << 3, 100 >> 2)
        ~~~
        ~~~cpp run
        #include <iostream>
        using namespace std;

        int main() {
            cout << (12 ^ 10) << " " << (12 & 10) << " " << (12 | 10) << " " << (5 << 3) << " " << (100 >> 2) << endl;
            return 0;
        }
        ~~~
        ~~~java run
        public class Main {
            public static void main(String[] args) {
                System.out.println((12 ^ 10) + " " + (12 & 10) + " " + (12 | 10) + " " + (5 << 3) + " " + (100 >> 2));
            }
        }
        ~~~

        **Bramki logiczne** to układy elektroniczne realizujące te operacje (AND, OR, NOT, XOR, NAND, NOR). Z bramek NAND (albo NOR) da się zbudować każdą inną funkcję logiczną.
      `,
    },
    {
      title: 'Kolory RGB i zapis szesnastkowy',
      body: md`
        Kolor na ekranie składa się z trzech składowych: **czerwonej (R), zielonej (G) i niebieskiej (B)**, każda o natężeniu 0–255 (1 bajt). Razem 24 bity, czyli 2²⁴ = **16 777 216** kolorów.

        W CSS i HTML kolor zapisuje się szesnastkowo: \`#RRGGBB\` – po dwie cyfry szesnastkowe na składową. \`#4B9CD3\`:
        - R = \`4B₁₆\` = 4·16 + 11 = **75**,
        - G = \`9C₁₆\` = 9·16 + 12 = **156**,
        - B = \`D3₁₆\` = 13·16 + 3 = **211**,

        czyli \`rgb(75, 156, 211)\` – jasnoniebieski. Ten sam kolor w CSS można więc zapisać dwojako: \`background-color: #4B9CD3;\` albo \`background-color: rgb(75, 156, 211);\`.

        | zapis | kolor |
        |---|---|
        | \`#000000\` / \`rgb(0,0,0)\` | czarny (wszystko zgaszone) |
        | \`#FFFFFF\` / \`rgb(255,255,255)\` | biały (wszystko na maksimum) |
        | \`#FF0000\` | czerwony |
        | \`#808080\` | szary (równe składowe) |

        > **Na maturze:** Zadanie z czerwca 2023 pytało właśnie o kolor tła zapisany w CSS jako \`#…\` – trzeba było zamienić składową na dziesiętny i rozpoznać biały \`rgb(255,255,255)\`.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Zapisz liczbę **−5** w 8-bitowym kodzie U2.`,
      answer: ['11111011'],
      exact: true,
      explain: md`5 = \`00000101\` → odwrócenie bitów \`11111010\` → +1 → **11111011**.`,
    },
    {
      type: 'input',
      q: md`Jaką liczbę oznacza 8-bitowy zapis U2 \`11110110\`?`,
      answer: '-10',
      explain: md`Najstarszy bit ma wagę −128: −128 + 64 + 32 + 16 + 4 + 2 = −10.`,
    },
    {
      type: 'input',
      q: md`Ile wynosi \`12 XOR 10\` (w systemie dziesiętnym)?`,
      answer: String(12 ^ 10),
      explain: md`\`1100 XOR 1010 = 0110\` = 6 – jedynki tam, gdzie bity się różnią.`,
    },
    {
      type: 'input',
      q: md`Kolor tła ma w CSS zapis \`#1A2B3C\`. Ile wynosi jego składowa **zielona** w systemie dziesiętnym?`,
      answer: String(0x2b),
      explain: md`Zielona to środkowa para: \`2B₁₆\` = 2·16 + 11 = 43.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Na 8 bitach w kodzie U2 można zapisać liczby od −128 do 127.', answer: true },
        { text: 'Kolor `#FFFFFF` to czarny.', answer: false },
        { text: '`a XOR a` jest zawsze równe 0.', answer: true },
        { text: '1 KiB to 1000 bajtów.', answer: false },
      ],
      explain: md`
        - Tak.
        - Nie – wszystkie składowe na maksimum to **biały**; czarny to \`#000000\`.
        - Tak – każdy bit z samym sobą daje 0.
        - Nie – 1 KiB = 1024 B; 1000 B to 1 kB (w układzie SI).
      `,
    },
    {
      type: 'code',
      q: md`Wczytaj kolor zapisany jako \`#RRGGBB\` (wielkie litery A–F) i wypisz jego składowe **R, G, B** w systemie dziesiętnym, oddzielone spacjami.`,
      tests: [
        { input: '#4B9CD3\n', output: '75 156 211\n' },
        { input: '#000000\n', output: '0 0 0\n' },
        { input: '#FFFFFF\n', output: '255 255 255\n' },
        { input: '#FF8000\n', output: '255 128 0\n' },
        { input: '#1A2B3C\n', output: '26 43 60\n' },
      ],
      solution: {
        python: code`
          s = input().strip()
          print(int(s[1:3], 16), int(s[3:5], 16), int(s[5:7], 16))
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              string s;
              cin >> s;
              for (int i = 1; i < 7; i += 2)
                  cout << stoi(s.substr(i, 2), nullptr, 16) << (i < 5 ? " " : "\n");
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  String s = sc.next();
                  int r = Integer.parseInt(s.substring(1, 3), 16);
                  int g = Integer.parseInt(s.substring(3, 5), 16);
                  int b = Integer.parseInt(s.substring(5, 7), 16);
                  System.out.println(r + " " + g + " " + b);
              }
          }
        `,
      },
      explain: md`Każda składowa to dwie cyfry szesnastkowe: znaki 1–2, 3–4 i 5–6 (znak 0 to \`#\`). Gotowa funkcja zamienia je na liczby: [[python: \`int(…, 16)\`]][[cpp: \`stoi(…, nullptr, 16)\`]][[java: \`Integer.parseInt(…, 16)\`]].`,
    },
    {
      type: 'code',
      q: md`Wczytaj dwie nieujemne liczby całkowite \`a\` i \`b\` (< 2³¹) i wypisz, **na ilu bitach** różnią się ich zapisy binarne (czyli ile jedynek ma \`a XOR b\`).`,
      tests: [
        { input: '12 10\n', output: '2\n' },
        { input: '0 0\n', output: '0\n' },
        { input: '255 0\n', output: '8\n' },
        { input: '1023 1\n', output: '9\n' },
        { input: '123456789 987654321\n', output: '15\n' },
      ],
      solution: {
        python: code`
          a, b = map(int, input().split())
          x = a ^ b
          ile = 0
          while x > 0:
              ile += x % 2
              x //= 2
          print(ile)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long a, b;
              cin >> a >> b;
              long long x = a ^ b;
              int ile = 0;
              while (x > 0) {
                  ile += x % 2;
                  x /= 2;
              }
              cout << ile << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long a = sc.nextLong(), b = sc.nextLong();
                  System.out.println(Long.bitCount(a ^ b));
              }
          }
        `,
      },
      explain: md`XOR ma jedynki dokładnie tam, gdzie bity są różne; potem liczymy jedynki (pętla z \`% 2\` i [[python: \`// 2\`]][[cpp java: \`/ 2\`]] albo gotowe [[python: \`bin(x).count("1")\`]][[cpp: \`__builtin_popcountll(x)\`]][[java: \`Long.bitCount(x)\`]]).`,

    },
  ],
  practice: ['2023-maj/2.4', '2023-czerwiec/5', '2023-maj/2.5'],
};
