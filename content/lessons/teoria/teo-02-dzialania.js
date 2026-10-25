import { md } from '../lib.js';

const to = (n, b) => n.toString(b).toUpperCase();
const v = (s, b) => parseInt(s, b);

export default {
  title: 'Działania pisemne w systemach liczbowych',
  summary: 'Dodawanie z przeniesieniem, odejmowanie z pożyczką i mnożenie w systemach o dowolnej podstawie, działania na liczbach z różnych systemów, brakujące cyfry.',
  minutes: 30,
  intro: md`
    - jak dodawać pisemnie w systemie o podstawie \`p\` (przeniesienie przy sumie ≥ \`p\`),
    - jak odejmować z pożyczką (pożyczka jest warta \`p\`, a nie 10),
    - jak mnożyć liczby binarne,
    - co zrobić, gdy liczby są zapisane w **różnych** systemach,
    - jak odtwarzać brakujące cyfry w działaniu.
  `,
  steps: [
    {
      title: 'Dodawanie',
      body: md`
        Dodajesz jak w dziesiętnym – od prawej, kolumnami. Różnica: gdy suma w kolumnie osiąga **podstawę** \`p\`, zapisujesz \`suma − p\` i przenosisz 1 dalej (jeśli suma ≥ 2p – zapisujesz \`suma − 2p\` i przenosisz 2).

        **Binarnie:** \`1 + 1 = 10₂\` (zapisz 0, przenieś 1), \`1 + 1 + 1 = 11₂\` (zapisz 1, przenieś 1).

        ~~~text
          przeniesienia:  1 1 1
                          1 0 1 1
                      +     1 1 1
                      -----------
                        1 0 0 1 0
        ~~~

        \`1011₂ + 111₂ = 10010₂\` (11 + 7 = 18).

        **Trójkowo:** \`1212₃ + 2201₃\`. Od prawej: 2 + 1 = 3 = \`10₃\` → zapisz 0, przenieś 1; 1 + 0 + 1 = 2; 2 + 2 = 4 = \`11₃\` → zapisz 1, przenieś 1; 1 + 2 + 1 = 4 = \`11₃\` → zapisz 1, przenieś 1. Wynik: **11120₃** (50 + 73 = 123 ✓).

        > **Wskazówka:** Zawsze sprawdź wynik, przeliczając wszystko na dziesiętny. Na maturze masz komputer – np. \`int("1212", 3) + int("2201", 3)\` w Pythonie.
      `,
    },
    {
      title: 'Odejmowanie i mnożenie',
      body: md`
        **Odejmowanie z pożyczką:** gdy cyfra górna jest mniejsza od dolnej, pożyczasz 1 z następnej pozycji – a ta jedynka jest warta **p** (nie 10!).

        \`4302₅ − 1243₅\`, kolumnami od prawej:

        | kolumna | działanie | wynik | pożyczka dalej |
        |---|---|---|---|
        | jedności | 2 − 3 → pożyczam: 2 + 5 − 3 | **4** | 1 |
        | piątki | 0 − 4 − 1 → pożyczam: 0 + 5 − 4 − 1 | **0** | 1 |
        | 25-ki | 3 − 2 − 1 | **0** | 0 |
        | 125-ki | 4 − 1 | **3** | 0 |

        Wynik: **3004₅** (577 − 198 = 379 ✓).

        Rozpisz to w kolumnach na kartce – pomylić kolejność pożyczek łatwo, a sprawdzenie na liczbach dziesiętnych od razu pokaże błąd.

        **Mnożenie binarne** jest najprostsze: mnożysz przez 0 albo 1, czyli przepisujesz liczbę przesuniętą albo nic, i dodajesz:

        ~~~text
                1 0 1 1
              ×   1 0 1
              ---------
                1 0 1 1
            1 0 1 1 . .
            -----------
            1 1 0 1 1 1
        ~~~

        \`1011₂ · 101₂ = 110111₂\` (11 · 5 = 55). Mnożenie przez \`10₂\` (czyli 2) to dopisanie zera na końcu – przesunięcie bitów w lewo.
      `,
    },
    {
      title: 'Liczby z różnych systemów',
      body: md`
        Gdy w działaniu są liczby z **różnych** systemów (np. \`2102₃ + 57₈\`, wynik w systemie 3), najprościej:

        1. zamień wszystkie na dziesiętny: \`2102₃ = 65\`, \`57₈ = 47\`,
        2. policz: 65 + 47 = 112,
        3. zamień wynik na wymagany system: \`112 = 11011₃\`.

        Jeśli jeden system jest potęgą drugiego (3 i 9, 2 i 8, 2 i 16), możesz zamiast tego przepisać liczbę grupowaniem cyfr i dodawać pisemnie w jednym systemie.

        ~~~python run only
        print(int("2102", 3), int("57", 8), int("2102", 3) + int("57", 8))
        n, s = 112, ""
        while n > 0:
            s = str(n % 3) + s
            n //= 3
        print(s)
        ~~~
      `,
    },
    {
      title: 'Brakujące cyfry',
      body: md`
        Zadania typu *„uzupełnij brakujące cyfry, tak aby działanie było poprawne”* rozwiązujesz kolumna po kolumnie **od prawej**, pamiętając o przeniesieniach – każda kolumna daje równanie z jedną niewiadomą.

        Przykład: \`2□1₃ + 12₃ = 1010₃\`.
        - Jedności: 1 + 2 = 3 = \`10₃\` → zapisz 0 ✓ (w wyniku jest 0), przenieś 1.
        - Trójki: □ + 1 + 1 (przeniesienie) daje w wyniku 1 → □ + 2 = 1 albo □ + 2 = 4 (= \`11₃\`). Cyfra trójkowa to 0, 1 albo 2, więc □ = **2** (i jest przeniesienie).
        - Dziewiątki: 2 + 1 (przeniesienie) = 3 = \`10₃\` → zapisz 0, przenieś 1 ✓; zostaje 1 na przodzie ✓.

        Sprawdzenie: \`221₃ + 12₃ = 25 + 5 = 30 = 1010₃\` ✓.

        Inny sposób: zamień znane liczby na dziesiętny i rozwiąż równanie: \`18 + 3·□ + 1 + 5 = 30\` → □ = 2.

        > **Na maturze:** Ten typ zadań pojawia się regularnie (maj 2025, czerwiec 2025 – dodawanie binarne i trójkowe z lukami). Pamiętaj, że cyfry są ograniczone podstawą – to często rozstrzyga, która z dwóch możliwości jest dobra.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Oblicz \`20112₃ + 1221₃\`. Wynik zapisz w systemie trójkowym.`,
      answer: [to(v('20112', 3) + v('1221', 3), 3)],
      exact: true,
      explain: md`\`20112₃ = 176\`, \`1221₃ = 52\`, suma 228 = **22110₃**. Pisemnie: 2+1 = 3 → 0, przeniesienie; 1+2+1 = 4 → 1, przeniesienie; 1+2+1 = 4 → 1, przeniesienie; 0+1+1 = 2; 2 → wynik 22110.`,
    },
    {
      type: 'input',
      q: md`Oblicz \`110010₂ − 1011₂\`. Wynik zapisz w systemie dwójkowym.`,
      answer: [to(v('110010', 2) - v('1011', 2), 2)],
      exact: true,
      explain: md`50 − 11 = 39 = **100111₂**.`,
    },
    {
      type: 'input',
      q: md`Oblicz \`765₈ + 34₈\`. Wynik zapisz w systemie ósemkowym.`,
      answer: [to(v('765', 8) + v('34', 8), 8)],
      exact: true,
      explain: md`5+4 = 9 = \`11₈\` → 1, przeniesienie; 6+3+1 = 10 = \`12₈\` → 2, przeniesienie; 7+1 = 8 = \`10₈\` → 0, przeniesienie 1. Wynik **1021₈** (501 + 28 = 529 ✓).`,
    },
    {
      type: 'input',
      q: md`Jaką cyfrę trzeba wpisać w miejsce kratki, żeby działanie było poprawne: \`1□01₂ + 11₂ = 10000₂\`?`,
      answer: '1',
      explain: md`\`10000₂ = 16\`, \`11₂ = 3\`, więc \`1□01₂ = 13 = 1101₂\` – w miejscu kratki 1.`,
    },
    {
      type: 'input',
      q: md`Oblicz \`9F₁₆ + 2C₁₆\`. Wynik zapisz w systemie szesnastkowym.`,
      answer: [to(v('9F', 16) + v('2C', 16), 16)],
      exact: true,
      explain: md`F + C = 15 + 12 = 27 = 16 + 11 → B, przeniesienie 1; 9 + 2 + 1 = 12 → C. Wynik **CB₁₆** (159 + 44 = 203 ✓).`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'W systemie piątkowym pożyczka z wyższej pozycji jest warta 5.', answer: true },
        { text: 'Pomnożenie liczby binarnej przez 10₂ dopisuje zero na jej końcu.', answer: true },
        { text: '`1₂ + 1₂ + 1₂ = 11₂`.', answer: true },
        { text: 'W dodawaniu trójkowym przeniesienie powstaje dopiero, gdy suma w kolumnie wynosi co najmniej 10.', answer: false },
      ],
      explain: md`
        - Tak – każda pozycja jest warta 5 razy więcej niż poprzednia.
        - Tak – to mnożenie przez 2.
        - Tak: 3 = \`11₂\`.
        - Nie – w systemie trójkowym przeniesienie jest przy sumie ≥ 3.
      `,
    },
  ],
  practice: ['2024-maj/6', '2024-czerwiec/6', '2025-maj/5', '2025-czerwiec/5', '2026-maj/5', '2026-czerwiec/5'],
};
