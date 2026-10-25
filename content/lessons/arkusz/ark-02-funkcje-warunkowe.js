import { md } from '../lib.js';
import { ROWERY } from './dane.js';

export default {
  title: 'Funkcje statystyczne i warunkowe',
  summary: 'SUMA, ŚREDNIA, MIN, MAKS, LICZ.JEŻELI, SUMA.JEŻELI, LICZ.WARUNKI, SUMA.WARUNKÓW, JEŻELI i łączenie warunków ORAZ / LUB.',
  minutes: 35,
  sheet: { data: ROWERY },
  intro: md`
    - podstawowe funkcje statystyczne: \`SUMA\`, \`ŚREDNIA\`, \`MIN\`, \`MAKS\`, \`ILE.LICZB\`,
    - liczenie i sumowanie z warunkiem: \`LICZ.JEŻELI\`, \`SUMA.JEŻELI\`, \`ŚREDNIA.JEŻELI\`,
    - kilka warunków naraz: \`LICZ.WARUNKI\`, \`SUMA.WARUNKÓW\`,
    - decyzja w komórce: \`JEŻELI\`, także zagnieżdżone, z \`ORAZ\` i \`LUB\`.
  `,
  steps: [
    {
      title: 'Funkcje statystyczne',
      body: md`
        W tej lekcji pracujemy na sprzedaży sklepu rowerowego (marzec–maj 2024): data, produkt, kategoria, ilość, cena za sztukę.

        ~~~sheet
        ~~~

        | funkcja | wynik |
        |---|---|
        | \`SUMA(zakres)\` | suma liczb |
        | \`ŚREDNIA(zakres)\` | średnia arytmetyczna |
        | \`MIN(zakres)\`, \`MAKS(zakres)\` | najmniejsza, największa liczba |
        | \`ILE.LICZB(zakres)\` | ile komórek zawiera liczby |
        | \`ILE.NIEPUSTYCH(zakres)\` | ile komórek nie jest pustych (także tekst) |

        ~~~excel run
        =SUMA(D2:D37)
        =MAKS(E2:E37)
        =ILE.LICZB(D2:D37)
        ~~~

        Wszystkie te funkcje **pomijają** teksty i puste komórki w zakresie – dlatego można podać cały zakres kolumny razem z nagłówkiem albo pustymi wierszami pod danymi.
      `,
    },
    {
      title: 'LICZ.JEŻELI i SUMA.JEŻELI',
      body: md`
        Najczęściej używane funkcje w zadaniach maturalnych:

        - \`LICZ.JEŻELI(zakres; kryterium)\` – ile komórek zakresu spełnia kryterium,
        - \`SUMA.JEŻELI(zakres_kryterium; kryterium; zakres_sumy)\` – suma tych komórek \`zakresu_sumy\`, dla których komórka w tym samym wierszu \`zakresu_kryterium\` spełnia kryterium,
        - \`ŚREDNIA.JEŻELI(…)\` – to samo, ale średnia.

        Kryterium to wartość (\`"rower"\`, \`5\`) albo porównanie w cudzysłowie (\`">=3"\`, \`"<>serwis"\`). Gwiazdka \`*\` zastępuje dowolny ciąg znaków: \`"Rower*"\` to każdy tekst zaczynający się od *Rower*.

        ~~~excel run
        =LICZ.JEŻELI(C2:C37;"rower")
        =LICZ.JEŻELI(D2:D37;">=3")
        =SUMA.JEŻELI(C2:C37;"akcesoria";D2:D37)
        =ŚREDNIA.JEŻELI(C2:C37;"akcesoria";D2:D37)
        =LICZ.JEŻELI(B2:B37;"Rower*")
        ~~~

        Kryterium może też odwoływać się do komórki: \`">="&H1\` (porównanie z wartością z H1) albo po prostu \`H1\` (równość). Tak buduje się zestawienia: w kolumnie H wypisujesz kategorie, a obok \`=LICZ.JEŻELI($C$2:$C$37;H2)\` i kopiujesz w dół.

        > **Uwaga:** Zakresy w \`SUMA.JEŻELI\` muszą mieć **ten sam rozmiar** i zaczynać się w tym samym wierszu – funkcja dopasowuje je wiersz po wierszu.
      `,
    },
    {
      title: 'Kilka warunków: LICZ.WARUNKI, SUMA.WARUNKÓW',
      body: md`
        Gdy warunków jest kilka i wszystkie muszą być spełnione:

        - \`LICZ.WARUNKI(zakres1; kryterium1; zakres2; kryterium2; …)\`
        - \`SUMA.WARUNKÓW(zakres_sumy; zakres1; kryterium1; zakres2; kryterium2; …)\` – uwaga: tu **zakres sumy jest pierwszy**!

        Sprzedaże akcesoriów, w których kupiono co najmniej 2 sztuki, i łączna liczba sprzedanych kasków:

        ~~~excel run
        =LICZ.WARUNKI(C2:C37;"akcesoria";D2:D37;">=2")
        =SUMA.WARUNKÓW(D2:D37;B2:B37;"Kask")
        ~~~

        Warunek na **przedział dat** to dwa kryteria na tym samym zakresie: \`=LICZ.WARUNKI(A2:A37;">=2024-04-01";A2:A37;"<=2024-04-30")\` – ile sprzedaży było w kwietniu.

        > **Wskazówka:** Warunek „lub” (np. rower **lub** serwis) to suma dwóch \`LICZ.JEŻELI\`: \`=LICZ.JEŻELI(C2:C37;"rower")+LICZ.JEŻELI(C2:C37;"serwis")\` – o ile oba warunki nie mogą być spełnione jednocześnie.
      `,
    },
    {
      title: 'JEŻELI, ORAZ, LUB',
      body: md`
        \`JEŻELI(warunek; wartość_gdy_prawda; wartość_gdy_fałsz)\` – formuła, która podejmuje decyzję. Np. rabat 5% dla transakcji o wartości co najmniej 1000 zł:

        ~~~excel run
        =JEŻELI(D5*E5>=1000;D5*E5*0,95;D5*E5)
        =JEŻELI(D3*E3>=1000;D3*E3*0,95;D3*E3)
        ~~~

        Warunki łączysz funkcjami \`ORAZ(w1; w2; …)\` (wszystkie prawdziwe) i \`LUB(w1; w2; …)\` (co najmniej jeden), a odwracasz przez \`NIE(w)\`. Funkcje \`JEŻELI\` można zagnieżdżać – trzy kategorie wartości:

        ~~~excel
        =JEŻELI(D2*E2>=1000;"duża";JEŻELI(D2*E2>=200;"średnia";"mała"))
        ~~~

        Kolumna pomocnicza z \`JEŻELI\` zwracającym 1 albo 0 to uniwersalny sposób na liczenie skomplikowanych warunków: potem wystarczy \`SUMA\` tej kolumny.

        ~~~excel run
        =JEŻELI(ORAZ(C9="akcesoria";D9>=3);1;0)
        ~~~

        > **Na maturze:** Zadania z arkusza najczęściej rozwiązuje się **kolumnami pomocniczymi**: każda kolumna liczy jeden mały krok (wartość transakcji, miesiąc, czy warunek spełniony), a odpowiedź to suma, maksimum albo licznik z ostatniej kolumny. Łatwiej to sprawdzić niż jedną gigantyczną formułę.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Jaki wynik da formuła \`=JEŻELI(ORAZ(5>3;2>4);"tak";"nie")\`?`,
      answer: ['nie'],
      explain: md`\`ORAZ\` wymaga, by **oba** warunki były prawdziwe; \`2>4\` jest fałszem, więc wynikiem jest wartość dla fałszu: „nie”.`,
    },
    {
      type: 'choice',
      q: md`Która formuła policzy, ile produktów w kolumnie B ma nazwę **zaczynającą się** od „Rower”?`,
      options: ['`=LICZ.JEŻELI(B2:B37;"Rower*")`', '`=LICZ.JEŻELI(B2:B37;"Rower")`', '`=SUMA.JEŻELI(B2:B37;"Rower*")`', '`=ILE.LICZB(B2:B37)`'],
      answer: 0,
      explain: md`Gwiazdka w kryterium zastępuje dowolny ciąg znaków. Samo \`"Rower"\` policzy tylko komórki równe dokładnie „Rower”. \`ILE.LICZB\` liczy liczby, a nazwy to teksty.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'W SUMA.WARUNKÓW zakres sumowany podaje się jako pierwszy argument.', answer: true },
        { text: 'W SUMA.JEŻELI zakres sumowany podaje się jako pierwszy argument.', answer: false },
        { text: 'LICZ.WARUNKI liczy wiersze, w których spełnione są wszystkie podane kryteria.', answer: true },
        { text: 'Funkcja ŚREDNIA traktuje puste komórki jak zera.', answer: false },
      ],
      explain: md`
        - Tak: \`SUMA.WARUNKÓW(zakres_sumy; zakres1; kryt1; …)\`.
        - Nie: \`SUMA.JEŻELI(zakres_kryterium; kryterium; zakres_sumy)\` – zakres sumy jest **ostatni**.
        - Tak – to „i” dla wszystkich kryteriów.
        - Nie – puste komórki są pomijane (nie zaniżają średniej).
      `,
    },
    {
      type: 'sheet',
      q: md`W komórce **H1** policz, **ile sprzedaży** dotyczyło kategorii **rower** (kolumna C).`,
      cell: 'H1',
      solution: '=LICZ.JEŻELI(C2:C37;"rower")',
      expect: 8,
      explain: md`\`=LICZ.JEŻELI(C2:C37;"rower")\` → 8.`,
    },
    {
      type: 'sheet',
      q: md`W komórce **H2** policz, ile **sztuk kasków** (produkt „Kask”) sprzedano łącznie (ilości są w kolumnie D).`,
      cell: 'H2',
      solution: '=SUMA.JEŻELI(B2:B37;"Kask";D2:D37)',
      expect: 20,
      explain: md`Sumujemy ilości (D), ale tylko w wierszach, w których produkt (B) to „Kask”: \`=SUMA.JEŻELI(B2:B37;"Kask";D2:D37)\` → 20. To samo da \`=SUMA.WARUNKÓW(D2:D37;B2:B37;"Kask")\`.`,
    },
    {
      type: 'sheet',
      q: md`W komórce **H3** policz, ile było sprzedaży z kategorii **akcesoria**, w których kupiono **co najmniej 2 sztuki**.`,
      cell: 'H3',
      solution: '=LICZ.WARUNKI(C2:C37;"akcesoria";D2:D37;">=2")',
      expect: 17,
      explain: md`Dwa warunki naraz: \`=LICZ.WARUNKI(C2:C37;"akcesoria";D2:D37;">=2")\` → 17.`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie F policz **kwotę do zapłaty** za każdą sprzedaż: ilość · cena, a jeśli ta wartość wynosi **co najmniej 1000 zł**, klient dostaje **5% rabatu**. Wpisz formułę dla **F2** – zostanie skopiowana do F2:F37.`,
      cell: 'F2',
      fill: 'F2:F37',
      solution: '=JEŻELI(D2*E2>=1000;D2*E2*0,95;D2*E2)',
      explain: md`\`=JEŻELI(D2*E2>=1000;D2*E2*0,95;D2*E2)\` – rabat to mnożenie przez 0,95. W polskiej wersji ułamek z przecinkiem.`,
    },
  ],
  practice: ['2023-maj/6.2', '2024-maj/7.1', '2025-maj/6.2', '2026-czerwiec/7.2', '2023-maj/6.3'],
};
