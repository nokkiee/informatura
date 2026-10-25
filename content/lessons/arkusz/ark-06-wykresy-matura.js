import { md } from '../lib.js';

// monthly sales of the bike shop (from the earlier lessons' data) and sales by category
const data = [
  ['miesiac', 'sprzedaz_zl', null, null, 'kategoria', 'sprzedaz_zl'],
  ['marzec', 5580, null, null, 'rower', 16592],
  ['kwiecien', 6428, null, null, 'akcesoria', 5552],
  ['maj', 10496, null, null, 'serwis', 360],
];

export default {
  title: 'Wykresy, zaokrąglenia i odpowiedź na maturze',
  summary: 'Dobór typu wykresu, obowiązkowe elementy wykresu, zaokrąglanie (ZAOKR, ZAOKR.DÓŁ) a formatowanie, udziały procentowe, zapis odpowiedzi.',
  minutes: 25,
  sheet: { data },
  intro: md`
    - jaki typ wykresu wybrać do jakich danych,
    - jakie elementy musi mieć wykres, żeby dostać za niego punkty,
    - jak zaokrąglać wyniki zgodnie z poleceniem (\`ZAOKR\`, \`ZAOKR.DÓŁ\`) i czym to się różni od formatowania,
    - jak policzyć udziały procentowe i jak zapisać odpowiedzi z arkusza.
  `,
  steps: [
    {
      title: 'Jaki wykres',
      body: md`
        W zadaniach z arkusza często pada polecenie: *„Na podstawie zestawienia utwórz wykres …”*. Zwykle typ jest podany (np. kolumnowy), ale gdy nie jest – dobierz go do danych:

        | dane | wykres |
        |---|---|
        | porównanie wartości w kategoriach (miesiące, produkty) | **kolumnowy** (słupkowy) |
        | zmiana w czasie, trend (dzień po dniu, miesiąc po miesiącu) | **liniowy** (albo kolumnowy, gdy punktów jest mało) |
        | udział części w całości (procenty sumujące się do 100%) | **kołowy** |
        | zależność dwóch wielkości liczbowych (np. temperatura i zużycie prądu) | **punktowy (XY)** |

        Zestawienie, z którego robisz wykres, najlepiej przygotować w osobnej, małej tabeli (formułami albo tabelą przestawną):

        ~~~sheet
        ~~~

        W Excelu: zaznacz tabelę zestawienia → **Wstawianie → Wykres**. W Informaturze: zaznacz zakres i kliknij **Wykres** nad arkuszem.
      `,
    },
    {
      title: 'Elementy wykresu',
      body: md`
        Zasady oceniania z kluczy CKE wymagają zwykle, żeby wykres:

        1. przedstawiał **właściwe dane** (dokładnie te z zestawienia, wszystkie kategorie),
        2. był **właściwego typu** (jeśli typ jest podany w poleceniu),
        3. miał **tytuł** wykresu,
        4. miał **opisy osi** (co jest na osi X, co na osi Y – z jednostką, np. „sprzedaż [zł]”),
        5. miał **legendę**, jeśli serii danych jest więcej niż jedna (np. trzy rodzaje owoców); przy jednej serii legenda nie jest potrzebna, ale nie przeszkadza.

        Kategorie na osi X muszą być czytelne – np. nazwy miesięcy zamiast numerów 3, 4, 5 albo pełne daty.

        > **Na maturze:** Wykres oceniany jest z pliku (np. zapisanego skoroszytu albo zrzutu ekranu – instrukcja w arkuszu mówi, jak go oddać). Zanim przejdziesz dalej, sprawdź listę: dane, typ, tytuł, osie, legenda. To łatwe punkty, które najczęściej traci się przez pośpiech.
      `,
    },
    {
      title: 'Zaokrąglanie a format',
      body: md`
        Polecenia typu *„wynik podaj z dokładnością do dwóch miejsc po przecinku”* albo *„zaokrąglij w dół do liczby całkowitej”* wymagają **zmiany wartości**, a nie tylko wyglądu:

        | funkcja | działanie | przykład |
        |---|---|---|
        | \`ZAOKR(x; n)\` | zaokrąglenie „szkolne” do n miejsc | \`ZAOKR(2,345;2)\` → 2,35 |
        | \`ZAOKR.DÓŁ(x; n)\` | obcięcie (w stronę zera) do n miejsc | \`ZAOKR.DÓŁ(2,349;2)\` → 2,34 |
        | \`ZAOKR.GÓRA(x; n)\` | w górę (od zera) | \`ZAOKR.GÓRA(2,341;2)\` → 2,35 |
        | \`ZAOKR.DO.CAŁK(x)\` | w dół do liczby całkowitej (dla dodatnich jak obcięcie) | \`ZAOKR.DO.CAŁK(7,9)\` → 7 |

        ~~~excel run
        =ZAOKR(2,345;2)
        =ZAOKR.DÓŁ(2,349;2)
        =ZAOKR(7,25;1)
        ~~~

        **Format** komórki (np. 2 miejsca po przecinku) tylko **pokazuje** zaokrągloną liczbę – w obliczeniach dalej jest pełna wartość. To ma znaczenie, gdy zaokrąglona wartość ma być użyta dalej (np. „zaokrąglone do pełnych kilogramów” kolejnego dnia symulacji) – wtedy w formule musi być \`ZAOKR\`.

        > **Uwaga:** Kolejność ma znaczenie: \`ZAOKR(SUMA(…);2)\` (zaokrąglona suma) to co innego niż \`SUMA\` zaokrąglonych wartości. Rób to, co mówi polecenie.
      `,
    },
    {
      title: 'Procenty i zapis odpowiedzi',
      body: md`
        **Udział procentowy** to część podzielona przez całość. W zestawieniu całość to suma kolumny – z adresem bezwzględnym, bo formuła będzie kopiowana:

        ~~~excel run
        =B2/SUMA($B$2:$B$4)*100
        =ZAOKR(B4/SUMA($B$2:$B$4)*100;1)
        ~~~

        Maj to prawie 47% sprzedaży z trzech miesięcy. (Zamiast mnożyć przez 100, możesz ustawić format procentowy – ale wtedy w komórce jest ułamek 0,466…, o czym trzeba pamiętać przy dalszych obliczeniach.)

        ### Zapis odpowiedzi
        - Podawaj **dokładnie** to, o co pytają: datę w czytelnym formacie (np. 2024-05-31), liczbę z wymaganą dokładnością, jednostkę, jeśli treść jej wymaga.
        - Zestawienia (np. „dla każdego miesiąca podaj…”) przepisz w całości, w kolejności z polecenia.
        - Zachowaj plik z arkuszem – w nim są formuły i wykres, których mogą wymagać zasady oceniania.

        > **Wskazówka:** W Informaturze przycisk **Do odpowiedzi** przenosi zaznaczone komórki do pola odpowiedzi – a program sprawdza wynik tak, jak egzaminator (z tolerancją na zapis liczb i dat).
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Jaki typ wykresu najlepiej pokaże, **jaką część** całej sprzedaży stanowiły rowery, akcesoria i serwis?`,
      options: ['kołowy', 'liniowy', 'punktowy (XY)', 'warstwowy'],
      answer: 0,
      explain: md`Udział części w całości to wykres kołowy. Liniowy pokazuje zmiany w czasie, a punktowy – zależność dwóch wielkości liczbowych.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań o wykresach na maturze.`,
      items: [
        { text: 'Wykres powinien mieć tytuł i opisy osi.', answer: true },
        { text: 'Legenda jest potrzebna, gdy na wykresie jest kilka serii danych.', answer: true },
        { text: 'Do pokazania zmian temperatury dzień po dniu najlepiej nadaje się wykres kołowy.', answer: false },
        { text: 'Ustawienie formatu „2 miejsca po przecinku” zmienia wartość używaną w dalszych obliczeniach.', answer: false },
      ],
      explain: md`
        - Tak – to typowe kryteria z zasad oceniania.
        - Tak – inaczej nie wiadomo, która seria to która.
        - Nie – zmiany w czasie pokazuje wykres liniowy (albo kolumnowy).
        - Nie – format zmienia tylko wygląd; wartość zmienia \`ZAOKR\`.
      `,
    },
    {
      type: 'input',
      q: md`Jaki wynik da \`=ZAOKR.DÓŁ(15,789;1)\`?`,
      answer: ['15,7', '15.7'],
      explain: md`\`ZAOKR.DÓŁ\` obcina do jednego miejsca po przecinku: 15,7. (\`ZAOKR\` dałby 15,8.)`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie C policz **udział procentowy** każdego miesiąca w sprzedaży z trzech miesięcy (kolumna B), **zaokrąglony do jednego miejsca** po przecinku (np. 24,8). Wpisz formułę dla **C2** – zostanie skopiowana do C2:C4.`,
      cell: 'C2',
      fill: 'C2:C4',
      solution: '=ZAOKR(B2/SUMA($B$2:$B$4)*100;1)',
      expect: [24.8, 28.6, 46.6],
      explain: md`\`=ZAOKR(B2/SUMA($B$2:$B$4)*100;1)\` – suma z adresem bezwzględnym, bo całość jest wspólna dla wszystkich wierszy. Wyniki: 24,8; 28,6; 46,6 (razem 100).`,
    },
    {
      type: 'sheet',
      q: md`W komórce **H1** oblicz **średnią miesięczną sprzedaż** (kolumna B) zaokrągloną **w dół** do pełnych złotych.`,
      cell: 'H1',
      solution: '=ZAOKR.DÓŁ(ŚREDNIA(B2:B4);0)',
      expect: 7501,
      explain: md`Średnia to 7501,33…, a \`=ZAOKR.DÓŁ(ŚREDNIA(B2:B4);0)\` obcina ją do 7501. \`ZAOKR.DO.CAŁK(ŚREDNIA(B2:B4))\` da to samo dla liczb dodatnich.`,
    },
  ],
  practice: ['2024-czerwiec/7.1', '2023-maj/6.1', '2026-maj/7.1', '2026-czerwiec/7.3', '2025-maj/6.4', '2023-czerwiec/6.3'],
};
