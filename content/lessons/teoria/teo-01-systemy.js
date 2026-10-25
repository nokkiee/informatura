import { md, code } from '../lib.js';

const to = (n, b) => n.toString(b).toUpperCase();

export default {
  title: 'Systemy liczbowe',
  summary: 'Systemy pozycyjne o dowolnej podstawie, zamiana na dziesiętny i z dziesiętnego, skróty 2 ↔ 8 ↔ 16 i 3 ↔ 9, porównywanie liczb w różnych systemach.',
  minutes: 30,
  intro: md`
    - czym jest system pozycyjny i co znaczy zapis \`2101₃\`,
    - jak zamienić liczbę z dowolnego systemu na dziesiętny i z powrotem,
    - jak szybko przechodzić między systemami 2, 8 i 16 (oraz 3 i 9) bez liczenia w dziesiętnym,
    - jak porównywać liczby zapisane w różnych systemach.
  `,
  steps: [
    {
      title: 'System pozycyjny',
      body: md`
        W systemie o podstawie \`p\` używa się cyfr od 0 do \`p − 1\`, a cyfra na pozycji \`k\` (licząc od prawej, od zera) jest warta \`cyfra · pᵏ\`. Podstawę zapisuje się w indeksie dolnym: \`2101₃\`, \`(2101)₃\`.

        \`2101₃ = 2·3³ + 1·3² + 0·3¹ + 1·3⁰ = 54 + 9 + 0 + 1 = 64\`

        | system | podstawa | cyfry |
        |---|---|---|
        | dwójkowy (binarny) | 2 | 0, 1 |
        | trójkowy | 3 | 0, 1, 2 |
        | ósemkowy | 8 | 0 … 7 |
        | dziesiętny | 10 | 0 … 9 |
        | szesnastkowy (heksadecymalny) | 16 | 0 … 9, A (10), B (11), C (12), D (13), E (14), F (15) |

        Kilka faktów, które warto mieć w głowie:
        - potęgi dwójki: 2¹⁰ = 1024, 2⁸ = 256, 2¹⁶ = 65 536,
        - \`10…0₂\` (jedynka i k zer) to \`2ᵏ\`, a \`11…1₂\` (k jedynek) to \`2ᵏ − 1\` (np. \`11111111₂\` = 255),
        - ostatnia cyfra w systemie \`p\` to reszta z dzielenia przez \`p\` – liczba binarna jest parzysta, gdy kończy się zerem.

        > **Uwaga:** Cyfra musi być mniejsza od podstawy: zapis \`1231₃\` jest **niepoprawny** (cyfra 3 w systemie trójkowym nie istnieje). W zadaniach typu „uzupełnij cyfrę” to od razu zawęża możliwości.
      `,
    },
    {
      title: 'Zamiana na system dziesiętny i z niego',
      body: md`
        **Na dziesiętny:** suma cyfr razy potęgi podstawy – albo szybciej **schematem Hornera** od lewej: \`w ← w · p + cyfra\`.

        \`10110011₂\`: 1 → 2 → 5 → 11 → 22 → 44 → 89 → **179**.

        **Z dziesiętnego:** dziel przez podstawę i zapisuj **reszty**; odczytaj je **od ostatniej do pierwszej**.

        | dzielenie | iloraz | reszta |
        |---|---|---|
        | 179 : 2 | 89 | 1 |
        | 89 : 2 | 44 | 1 |
        | 44 : 2 | 22 | 0 |
        | 22 : 2 | 11 | 0 |
        | 11 : 2 | 5 | 1 |
        | 5 : 2 | 2 | 1 |
        | 2 : 2 | 1 | 0 |
        | 1 : 2 | 0 | 1 |

        Reszty od dołu: \`10110011₂\`. Ta sama metoda działa dla każdej podstawy – dla szesnastkowego reszty 10–15 zapisujesz literami A–F.

        Na maturze możesz sprawdzić wynik na komputerze, np. w Pythonie:

        ~~~python run only
        print(int("10110011", 2), int("2101", 3), int("B3", 16))
        print(bin(179), oct(179), hex(179))
        ~~~
      `,
    },
    {
      title: 'Skróty: 2 ↔ 8 ↔ 16 i 3 ↔ 9',
      body: md`
        Gdy jedna podstawa jest **potęgą** drugiej, zamiana nie wymaga liczenia w dziesiętnym:

        - **8 = 2³:** każda cyfra ósemkowa to **3 bity**. Dziel liczbę binarną na trójki **od prawej**: \`10 110 011₂\` = \`2 6 3₈\` = \`263₈\`.
        - **16 = 2⁴:** każda cyfra szesnastkowa to **4 bity**: \`1011 0011₂\` = \`B 3₁₆\` = \`B3₁₆\`.
        - **9 = 3²:** każda cyfra dziewiątkowa to **2 cyfry trójkowe**: \`2 21 00 01₃\` = \`2 7 0 1₉\` (bo \`21₃ = 7\`).

        W drugą stronę rozpisujesz każdą cyfrę na grupę (uzupełniając zerami z lewej): \`7B₁₆\` = \`0111 1011₂\` = \`1111011₂\`.

        | hex | bin | hex | bin |
        |---|---|---|---|
        | 0 | 0000 | 8 | 1000 |
        | 1 | 0001 | 9 | 1001 |
        | 2 | 0010 | A | 1010 |
        | 3 | 0011 | B | 1011 |
        | 4 | 0100 | C | 1100 |
        | 5 | 0101 | D | 1101 |
        | 6 | 0110 | E | 1110 |
        | 7 | 0111 | F | 1111 |

        > **Na maturze:** Zadania typu „uzupełnij tabelę: liczba w systemie 3 → zapis w systemie 9” (czerwiec 2023) rozwiązuje się właśnie grupowaniem cyfr – szybko i bez ryzyka błędu rachunkowego.
      `,
    },
    {
      title: 'Porównywanie liczb w różnych systemach',
      body: md`
        Zadanie: wstaw \`<\`, \`=\` albo \`>\` między \`134₅\` a \`134₆\`. Te same cyfry, ale w systemie o **większej podstawie** liczba jest większa (o ile ma co najmniej dwie cyfry): \`134₅ = 25 + 15 + 4 = 44\`, \`134₆ = 36 + 18 + 4 = 58\`.

        Najpewniej: zamień obie liczby na dziesiętny i porównaj. Szybkie oszacowania:
        - liczba \`k\`-cyfrowa w systemie \`p\` jest z przedziału \`[pᵏ⁻¹, pᵏ − 1]\` – np. 4-cyfrowa trójkowa to 27…80,
        - \`2222₃ = 3⁴ − 1 = 80\` (wszystkie cyfry największe), \`1000₃ = 27\`.

        ~~~python run only
        print(int("134", 5), int("134", 6), int("2011", 3), int("2222", 3))
        ~~~
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Zapisz liczbę **179** w systemie **szesnastkowym**.`,
      answer: [to(179, 16)],
      exact: true,
      explain: md`179 = 11·16 + 3, a 11 to cyfra B: **B3**. Albo przez binarny: \`1011 0011₂\` → B, 3.`,
    },
    {
      type: 'input',
      q: md`Zamień \`110100011₂\` na system **ósemkowy**.`,
      answer: [to(0b110100011, 8)],
      exact: true,
      explain: md`Trójki bitów od prawej: \`110 100 011\` → 6, 4, 3: **643₈**.`,
    },
    {
      type: 'input',
      q: md`Zapisz liczbę \`2210001₃\` w systemie **dziewiątkowym**.`,
      answer: [to(parseInt('2210001', 3), 9)],
      exact: true,
      explain: md`Pary cyfr trójkowych od prawej: \`2 | 21 | 00 | 01\` → 2, 7, 0, 1: **2701₉**. (To liczba 2026.)`,
    },
    {
      type: 'input',
      q: md`Ile wynosi w systemie dziesiętnym liczba \`7B₁₆\`?`,
      answer: String(0x7b),
      explain: md`7·16 + 11 = 123.`,
    },
    {
      type: 'choice',
      q: md`Który znak należy wstawić: \`2011₃ … 134₆\`?`,
      options: ['=', '<', '>', 'nie da się porównać liczb z różnych systemów'],
      answer: 0,
      explain: md`\`2011₃ = 54 + 0 + 3 + 1 = 58\`, \`134₆ = 36 + 18 + 4 = 58\`. Liczby są równe.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Zapis `1231₃` jest poprawnym zapisem liczby w systemie trójkowym.', answer: false },
        { text: '`11111111₂` = 255.', answer: true },
        { text: 'Liczba zapisana binarnie jest parzysta wtedy i tylko wtedy, gdy kończy się cyfrą 0.', answer: true },
        { text: 'Każda cyfra szesnastkowa odpowiada trzem cyfrom dwójkowym.', answer: false },
      ],
      explain: md`
        - Nie – w systemie trójkowym nie ma cyfry 3.
        - Tak: 2⁸ − 1.
        - Tak – ostatnia cyfra to reszta z dzielenia przez 2.
        - Nie – czterem (16 = 2⁴); trzem bitom odpowiada cyfra ósemkowa.
      `,
    },
    {
      type: 'code',
      q: md`
        Napisz program zamieniający liczbę między systemami. Wejście: podstawa \`a\`, zapis liczby w systemie \`a\` i podstawa \`b\` (2 ≤ \`a\`, \`b\` ≤ 16, cyfry powyżej 9 to wielkie litery A–F, wartość mniejsza niż 2⁶²). Wypisz zapis tej liczby w systemie \`b\` (wielkimi literami, bez zer wiodących).
      `,
      tests: [
        { input: '2 10110011 16\n', output: 'B3\n' },
        { input: '3 2210001 9\n', output: '2701\n' },
        { input: '16 7B 10\n', output: '123\n' },
        { input: '10 0 2\n', output: '0\n' },
        { input: '10 4611686018427387903 16\n', output: '3FFFFFFFFFFFFFFF\n' },
        { input: '5 134 6\n', output: `${to(44, 6)}\n` },
      ],
      solution: {
        python: code`
          a, s, b = input().split()
          a, b = int(a), int(b)
          n = int(s, a)
          cyfry = "0123456789ABCDEF"
          w = ""
          while n > 0:
              w = cyfry[n % b] + w
              n //= b
          print(w if w else "0")
        `,
        cpp: code`
          #include <iostream>
          #include <string>
          using namespace std;

          int main() {
              int a, b;
              string s;
              cin >> a >> s >> b;
              const string cyfry = "0123456789ABCDEF";
              long long n = 0;
              for (char c : s) n = n * a + cyfry.find(c);
              string w = "";
              while (n > 0) {
                  w = cyfry[n % b] + w;
                  n /= b;
              }
              cout << (w.empty() ? "0" : w) << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  int a = sc.nextInt();
                  String s = sc.next();
                  int b = sc.nextInt();
                  long n = Long.parseLong(s, a);
                  System.out.println(Long.toString(n, b).toUpperCase());
              }
          }
        `,
      },
      explain: md`Najpierw na wartość (Horner albo gotowe \`int(s, a)\`), potem kolejne reszty z dzielenia przez \`b\` jako cyfry od końca. W Javie obie zamiany robią \`Long.parseLong(s, a)\` i \`Long.toString(n, b)\` (małe litery – stąd \`toUpperCase\`).`,
    },
  ],
  practice: ['2023-czerwiec/4', '2023-maj/5', '2024-czerwiec/1.1', '2026-maj/5', '2026-czerwiec/5'],
};
