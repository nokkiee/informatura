import { md } from '../lib.js';
import { SPRZEDAZ } from './dane.js';

export default {
  title: 'Wyszukiwanie, zestawienia i tabele przestawne',
  summary: 'WYSZUKAJ.PIONOWO z cennika, INDEKS i PODAJ.POZYCJĘ, MAX.K, zestawienia z listą wartości, tabela przestawna, sortowanie i filtrowanie.',
  minutes: 35,
  sheet: { data: SPRZEDAZ },
  intro: md`
    - jak dobrać wartość z innej tabeli (\`WYSZUKAJ.PIONOWO\`),
    - jak znaleźć wiersz z największą wartością i odczytać z niego inne pole (\`INDEKS\` + \`PODAJ.POZYCJĘ\`),
    - jak zrobić zestawienie „dla każdego…” formułami,
    - kiedy szybciej użyć tabeli przestawnej, sortowania i filtra.
  `,
  steps: [
    {
      title: 'WYSZUKAJ.PIONOWO',
      body: md`
        Tym razem w tabeli sprzedaży nie ma cen – są w osobnym **cenniku** w kolumnach G:H:

        ~~~sheet 8
        ~~~

        \`WYSZUKAJ.PIONOWO(szukana; tabela; nr_kolumny; 0)\` szuka wartości w **pierwszej kolumnie** tabeli i zwraca wartość z kolumny o podanym numerze w tym samym wierszu. Cena produktu z wiersza 2:

        ~~~excel run
        =WYSZUKAJ.PIONOWO(B2;$G$2:$H$7;2;0)
        =D5*WYSZUKAJ.PIONOWO(B5;$G$2:$H$7;2;0)
        ~~~

        - Tabela cennika ma adres **bezwzględny** (\`$G$2:$H$7\`) – formuła będzie kopiowana w dół, a cennik ma zostać na miejscu.
        - Ostatni argument **0** (albo \`FAŁSZ\`) oznacza **dokładne dopasowanie**. Bez niego funkcja szuka „przybliżenia” w posortowanej kolumnie i potrafi zwrócić cenę zupełnie innego produktu – na maturze prawie zawsze chcesz 0.
        - Gdy wartości nie ma w tabeli, wynikiem jest błąd \`#N/D!\`. \`JEŻELI.BŁĄD(formuła; 0)\` zamienia go na 0.

        > **Na maturze:** Zadania często mają kilka plików, np. transakcje i cennik albo pomiary i opis stacji. \`WYSZUKAJ.PIONOWO\` (albo import obu plików do bazy i \`JOIN\`) łączy je ze sobą.
      `,
    },
    {
      title: 'INDEKS i PODAJ.POZYCJĘ',
      body: md`
        *„Podaj datę sprzedaży, w której kupiono najwięcej sztuk”* – najpierw trzeba znaleźć **pozycję** maksimum, potem odczytać z niej datę:

        - \`PODAJ.POZYCJĘ(szukana; zakres; 0)\` – na której pozycji (od 1) w zakresie jest szukana wartość (pierwsze wystąpienie),
        - \`INDEKS(zakres; n)\` – n-ty element zakresu.

        ~~~excel run
        =PODAJ.POZYCJĘ(MAKS(D2:D37);D2:D37;0)
        =INDEKS(B2:B37;PODAJ.POZYCJĘ(MAKS(D2:D37);D2:D37;0))
        =INDEKS(A2:A37;PODAJ.POZYCJĘ(MAKS(D2:D37);D2:D37;0))
        ~~~

        Ostatni wynik to liczba – data w postaci liczby dni (45369 to 2024-03-18); w komórce z formatem daty wyświetli się jako data.

        W odróżnieniu od \`WYSZUKAJ.PIONOWO\` ta para potrafi szukać w **dowolnej** kolumnie i zwracać wartość z kolumny po jej lewej stronie.

        Inne przydatne funkcje: \`MAX.K(zakres; k)\` i \`MIN.K(zakres; k)\` – k-ta największa / najmniejsza wartość; \`MAKS.WARUNKÓW(zakres; zakres_kryt; kryterium)\` – maksimum wśród wierszy spełniających warunek.

        > **Uwaga:** \`PODAJ.POZYCJĘ\` znajduje **pierwsze** wystąpienie. Jeśli maksimum powtarza się kilka razy, a pytanie dotyczy np. ostatniego dnia, trzeba zrobić to inaczej (np. kolumna pomocnicza albo sortowanie).
      `,
    },
    {
      title: 'Zestawienia formułami',
      body: md`
        *„Dla każdego produktu podaj łączną liczbę sprzedanych sztuk”*:

        1. Wypisz listę produktów – tu jest już w cenniku (G2:G7). W innych danych listę różnych wartości dostaniesz, kopiując kolumnę i używając **Dane → Usuń duplikaty** albo z tabeli przestawnej.
        2. Obok każdej pozycji listy wpisz \`SUMA.JEŻELI\` (albo \`LICZ.JEŻELI\`) i skopiuj w dół. Zakresy danych – **bezwzględne**, kryterium – **względne** (komórka z listy).

        ~~~excel run
        =SUMA.JEŻELI($B$2:$B$37;G2;$D$2:$D$37)
        =SUMA.JEŻELI($B$2:$B$37;G5;$D$2:$D$37)
        =LICZ.JEŻELI($B$2:$B$37;G5)
        ~~~

        Lampek sprzedano 27 sztuk w 11 sprzedażach. Do zestawienia „dla każdego miesiąca” lista to numery 3, 4, 5, a kryterium działa na kolumnie pomocniczej z \`MIESIĄC(A2)\`.
      `,
    },
    {
      title: 'Tabela przestawna, sortowanie, filtr',
      body: md`
        **Tabela przestawna** robi zestawienie bez pisania formuł: wybierasz pole do **wierszy** (np. produkt albo miesiąc z daty), pole do **wartości** (np. ilość) i funkcję (suma, liczba, średnia, maksimum). W Excelu: **Wstawianie → Tabela przestawna**, a potem przeciągasz pola w panelu **Pola tabeli przestawnej** do obszarów *Wiersze*, *Kolumny*, *Wartości* i *Filtry*. W Informaturze działa to tak samo: przycisk **Tabela przestawna** nad arkuszem tworzy tabelę w nowym arkuszu, a obok niej pojawia się ten sam panel (daty pogrupujesz po dniach, miesiącach, latach i godzinach). Gdy w wierszach są dwa pola (np. miesiąc i produkt), pod każdą grupą pojawia się jej **suma częściowa**.

        Kiedy jej używać:
        - zestawienia „dla każdego…” – szybciej niż formuły,
        - gdy potrzebny jest **wykres** zestawienia (wykres robisz z tabeli przestawnej),
        - do sprawdzenia wyniku policzonego formułami.

        Kiedy formuły są lepsze: gdy wynik zależy od **kolejności** wierszy (serie, stan „dzień po dniu”) – tego tabela przestawna nie policzy.

        **Suma częściowa** (Dane → Suma częściowa) to zestawienie „dla każdego…” prosto w danych: posortuj je według kolumny z grupami (np. dostawcy), a pod każdą grupą pojawi się wiersz z funkcją \`SUMY.CZĘŚCIOWE\` (suma, licznik, średnia…), na końcu zaś wynik dla wszystkich danych. W Informaturze: przycisk **Suma częściowa** – może też najpierw posortować dane.

        **Sortowanie** (Dane → Sortuj) i **filtr** (Dane → Filtruj) pozwalają szybko obejrzeć dane: posortuj malejąco po ilości i odczytaj pierwszy wiersz, odfiltruj jeden produkt i zobacz sumę na pasku stanu.

        > **Uwaga:** Sortując, zaznacz **całą tabelę** (albo kliknij w nią i użyj sortowania tabeli) – sortowanie jednej kolumny rozdzieli dane z różnych kolumn i zniszczy wiersze. W Informaturze cofniesz to przez Ctrl+Z, na maturze – też, ale lepiej nie ryzykować.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Co oznacza ostatni argument **0** w \`WYSZUKAJ.PIONOWO(B2;$G$2:$H$7;2;0)\`?`,
      options: ['dokładne dopasowanie szukanej wartości', 'zwróć wartość z kolumny 0', 'szukaj od końca tabeli', 'zwróć 0, gdy nie znajdziesz'],
      answer: 0,
      explain: md`0 (FAŁSZ) to wyszukiwanie dokładne. Wartość 1 (PRAWDA) lub pominięcie argumentu oznacza wyszukiwanie przybliżone w posortowanej kolumnie – źródło trudnych do zauważenia błędów.`,
    },
    {
      type: 'choice',
      q: md`Co zwróci \`WYSZUKAJ.PIONOWO\`, jeśli szukanej wartości nie ma w pierwszej kolumnie tabeli (przy dopasowaniu dokładnym)?`,
      options: ['błąd #N/D!', '0', 'pusty tekst', 'wartość z ostatniego wiersza tabeli'],
      answer: 0,
      explain: md`Brak dopasowania daje błąd \`#N/D!\` (w angielskiej wersji \`#N/A\`). Można go przechwycić funkcją \`JEŻELI.BŁĄD\`.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Tabela przestawna dobrze nadaje się do zestawień „dla każdego miesiąca” i do wykresów.', answer: true },
        { text: 'Tabelą przestawną łatwo policzysz najdłuższą serię kolejnych dni spełniających warunek.', answer: false },
        { text: '`PODAJ.POZYCJĘ` zwraca pozycję pierwszego wystąpienia szukanej wartości.', answer: true },
        { text: 'Sortowanie jednej zaznaczonej kolumny przestawia całe wiersze tabeli.', answer: false },
      ],
      explain: md`
        - Tak.
        - Nie – serie zależą od kolejności wierszy; to zadanie na kolumnę pomocniczą z formułą odwołującą się do poprzedniego wiersza.
        - Tak.
        - Nie – sortowanie samej kolumny rozdziela ją od reszty danych (Excel zwykle o tym ostrzega).
      `,
    },
    {
      type: 'sheet',
      q: md`W kolumnie E policz **wartość** każdej sprzedaży: ilość (D) · cena z cennika (G2:H7). Wpisz formułę dla **E2** – zostanie skopiowana do E2:E37.`,
      cell: 'E2',
      fill: 'E2:E37',
      solution: '=D2*WYSZUKAJ.PIONOWO(B2;$G$2:$H$7;2;0)',
      explain: md`\`=D2*WYSZUKAJ.PIONOWO(B2;$G$2:$H$7;2;0)\` – cennik z adresem bezwzględnym, produkt z wiersza (\`B2\`) względny.`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie I, obok listy produktów z cennika (G2:G7), policz **łączną liczbę sprzedanych sztuk** każdego produktu. Wpisz formułę dla **I2** – zostanie skopiowana do I2:I7.`,
      cell: 'I2',
      fill: 'I2:I7',
      solution: '=SUMA.JEŻELI($B$2:$B$37;G2;$D$2:$D$37)',
      explain: md`\`=SUMA.JEŻELI($B$2:$B$37;G2;$D$2:$D$37)\` – zakresy danych przypięte, a kryterium (\`G2\`) przesuwa się w dół razem z listą.`,
    },
    {
      type: 'sheet',
      q: md`W komórce **K1** podaj **nazwę produktu** z pierwszej (najwcześniejszej w tabeli) sprzedaży, w której kupiono **najwięcej sztuk**.`,
      cell: 'K1',
      solution: '=INDEKS(B2:B37;PODAJ.POZYCJĘ(MAKS(D2:D37);D2:D37;0))',
      expect: 'Lampka',
      explain: md`\`=INDEKS(B2:B37;PODAJ.POZYCJĘ(MAKS(D2:D37);D2:D37;0))\` → Lampka. \`MAKS\` daje największą ilość (4), \`PODAJ.POZYCJĘ\` – pozycję jej pierwszego wystąpienia, a \`INDEKS\` – produkt z tej pozycji.`,
    },
  ],
  practice: ['2024-maj/7.3', '2023-czerwiec/6.3', '2026-czerwiec/7.3', '2025-maj/6.4', '2026-maj/7.1'],
};
