import { md } from '../lib.js';
import { SKLEP } from './dane.js';

// the shop table with the VAT rate in F2
const data = SKLEP.map((r, i) => (i === 0 ? [...r, null, null, 'VAT'] : i === 1 ? [...r, null, null, 0.23] : r.slice()));

export default {
  title: 'Formuły i adresowanie',
  summary: 'Komórki i formuły, kopiowanie formuł, adresy względne, bezwzględne i mieszane, import danych z pliku tekstowego, typy wartości.',
  minutes: 30,
  sheet: { data },
  intro: md`
    - jak zbudowana jest formuła i jakie ma operatory,
    - co dzieje się z adresami, gdy kopiujesz formułę (adresy względne),
    - kiedy i jak „przypiąć” adres znakiem \`$\` (adresy bezwzględne i mieszane),
    - jak wczytać dane z pliku tekstowego i na co uważać przy liczbach i datach.
  `,
  steps: [
    {
      title: 'Komórki i formuły',
      body: md`
        Arkusz to tabela komórek. Komórkę wskazuje **adres**: litera kolumny i numer wiersza (\`B3\` – kolumna B, wiersz 3). Zakres to prostokąt komórek: \`B2:B9\` (od B2 do B9).

        **Formuła** zaczyna się od znaku \`=\`. Może zawierać liczby, adresy, operatory i funkcje:

        | operator | znaczenie |
        |---|---|
        | \`+ - * /\` | dodawanie, odejmowanie, mnożenie, dzielenie |
        | \`^\` | potęgowanie (\`=2^10\` → 1024) |
        | \`&\` | łączenie tekstów (\`="Rok "&2024\`) |
        | \`= <> < > <= >=\` | porównania (wynik PRAWDA / FAŁSZ) |

        Kolejność działań jak w matematyce: najpierw potęgowanie, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie. W wątpliwych miejscach dawaj nawiasy.

        W tej lekcji pracujemy na małej tabeli sklepu (ceny i ilości), a w komórce **F2** jest stawka VAT 23%:

        ~~~sheet
        ~~~

        Przycisk **Oblicz** przy formułach poniżej liczy je na tej tabeli – tak, jakbyś wpisał je w pustą komórkę:

        ~~~excel run
        =B2*C2
        =SUMA(C2:C9)
        =MAKS(B2:B9)
        =B4*C4*(1+F2)
        ~~~

        > **Uwaga:** W polskim Excelu funkcje mają polskie nazwy (\`SUMA\`, \`MAKS\`, \`JEŻELI\`), argumenty oddziela się **średnikiem**, a ułamki pisze się z **przecinkiem** (\`0,23\`). W angielskiej wersji: \`SUM\`, \`MAX\`, \`IF\`, przecinki i kropki. W Informaturze możesz to przełączyć w Ustawieniach.
      `,
    },
    {
      title: 'Kopiowanie formuł',
      body: md`
        Siła arkusza: formułę piszesz **raz**, a potem kopiujesz ją w dół (przeciągając uchwyt wypełniania – mały kwadrat w rogu zaznaczenia – albo kopiując i wklejając). Adresy w formule **przesuwają się** razem z nią.

        Formuła \`=B2*C2\` wpisana w **D2** i skopiowana w dół zmienia się w kolejnych wierszach:

        | komórka | formuła po skopiowaniu |
        |---|---|
        | D2 | \`=B2*C2\` |
        | D3 | \`=B3*C3\` |
        | D4 | \`=B4*C4\` |

        To są **adresy względne**: formuła „pamięta” nie konkretną komórkę, tylko jej położenie względem siebie („dwie kolumny w lewo, ten sam wiersz”). Kopiowanie o 1 wiersz w dół dodaje 1 do numerów wierszy, o 1 kolumnę w prawo – przesuwa litery kolumn.

        > **Wskazówka:** W Excelu dwuklik na uchwycie wypełniania kopiuje formułę w dół aż do końca danych w sąsiedniej kolumnie – przy tysiącach wierszy to dużo szybsze niż przeciąganie.
      `,
    },
    {
      title: 'Adresy bezwzględne i mieszane',
      body: md`
        Chcemy policzyć cenę brutto: \`wartość · (1 + VAT)\`, gdzie VAT jest w **F2**. Gdybyśmy w E2 wpisali \`=B2*C2*(1+F2)\` i skopiowali w dół, w E3 byłoby \`=B3*C3*(1+F3)\` – a F3 jest puste! Adres stawki VAT **nie może się przesuwać**.

        Znak \`$\` „przypina” część adresu:

        | zapis | przy kopiowaniu |
        |---|---|
        | \`F2\` | zmienia się kolumna i wiersz (względny) |
        | \`$F$2\` | nie zmienia się nic (**bezwzględny**) |
        | \`$F2\` | stała kolumna, wiersz się zmienia (mieszany) |
        | \`F$2\` | kolumna się zmienia, stały wiersz (mieszany) |

        Poprawnie: \`=B2*C2*(1+$F$2)\`. W Excelu klawisz **F4** przełącza kolejne warianty \`F2 → $F$2 → F$2 → $F2\`.

        ~~~excel run
        =B2*C2*(1+$F$2)
        =B9*C9*(1+$F$2)
        ~~~

        **Adresy mieszane** przydają się w tabelach dwuwymiarowych, np. tabliczce mnożenia: \`=$A2*B$1\` skopiowane w prawo i w dół zawsze bierze liczbę z kolumny A i z wiersza 1.

        > **Na maturze:** Błąd „zapomniany \`$\`” jest zdradliwy: pierwsza komórka liczy się dobrze, a dalsze – źle albo zerem. Zawsze sprawdź formułę w jakimś wierszu na dole tabeli, nie tylko w pierwszym.
      `,
    },
    {
      title: 'Import danych z pliku',
      body: md`
        Dane do zadania z arkusza dostajesz w pliku tekstowym (np. \`staw.txt\`). W Excelu wczytujesz go przez **Dane → Z tekstu/CSV** i ustawiasz:

        1. **Separator** – czym oddzielone są pola: tabulator, średnik, spacja (treść zadania to mówi).
        2. **Pochodzenie pliku / kodowanie** – zwykle UTF-8, żeby polskie znaki się nie popsuły.
        3. **Typy kolumn** – szczególnie **daty** i **liczby z ułamkiem**. Plik może mieć liczby z kropką (\`3.5\`), a polski Excel oczekuje przecinka – wtedy liczby wczytają się jako tekst albo jako daty (\`3.5\` → 3 maja!). W kreatorze importu można wskazać separator dziesiętny.
        4. **Pierwszy wiersz** – czy to nagłówki (nazwy pól).

        W Informaturze plik z danymi zadania jest już wczytany do arkusza, z rozpoznanymi datami i liczbami. Dodatkowe pliki wczytasz przyciskiem **Importuj**.

        ### Typy wartości
        - **Liczby** – domyślnie wyrównane do prawej.
        - **Tekst** – do lewej. Liczba zapisana jako tekst nie wejdzie do \`SUMA\`! (Typowy objaw złego importu: suma kolumny wynosi 0.)
        - **Daty** – w środku arkusza to **liczby dni** od 1 stycznia 1900 r. (np. 45658 to 1.01.2025). Dzięki temu daty można odejmować (różnica w dniach) i porównywać.
        - **Format** komórki (liczba miejsc po przecinku, format daty) zmienia tylko **wygląd**, nie wartość. Do zaokrąglenia samej wartości służy funkcja \`ZAOKR\`.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Formułę \`=A1+B$1\` wpisaną w komórce **C2** skopiowano do komórki **D5**. Jak wygląda formuła w D5?`,
      answer: ['=B4+C$1', 'B4+C$1'],
      exact: true,
      explain: md`Przesunięcie o 1 kolumnę w prawo i 3 wiersze w dół. \`A1\` (względny) → \`B4\`. \`B$1\`: kolumna się przesuwa (B → C), wiersz jest przypięty → \`C$1\`.`,
    },
    {
      type: 'choice',
      q: md`Który adres **nie zmieni się** przy kopiowaniu formuły w żadnym kierunku?`,
      options: ['`$F$2`', '`F2`', '`$F2`', '`F$2`'],
      answer: 0,
      explain: md`\`$\` przed literą przypina kolumnę, przed liczbą – wiersz. Tylko \`$F$2\` ma przypięte oba.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'W polskim Excelu argumenty funkcji oddziela się średnikiem.', answer: true },
        { text: 'Zmiana formatu komórki na „2 miejsca po przecinku” zaokrągla wartość używaną w obliczeniach.', answer: false },
        { text: 'Data w arkuszu jest liczbą dni, więc różnica dwóch dat daje liczbę dni między nimi.', answer: true },
        { text: 'Liczba zapisana jako tekst jest liczona przez funkcję SUMA.', answer: false },
      ],
      explain: md`
        - Tak.
        - Nie – format zmienia tylko wygląd; do zmiany wartości służy \`ZAOKR\`.
        - Tak.
        - Nie – \`SUMA\` pomija teksty; to częsty skutek złego importu.
      `,
    },
    {
      type: 'sheet',
      q: md`W kolumnie D policz **wartość** każdego produktu (cena · ilość). Wpisz formułę dla komórki **D2** – zostanie skopiowana do D2:D9.`,
      cell: 'D2',
      fill: 'D2:D9',
      solution: '=B2*C2',
      explain: md`\`=B2*C2\` – adresy względne przesuwają się w kolejnych wierszach: D3 liczy \`B3*C3\` itd.`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie E policz **wartość brutto** (cena · ilość · (1 + VAT)), gdzie stawka VAT jest w komórce **F2**. Wpisz formułę dla **E2** – zostanie skopiowana do E2:E9. Pamiętaj, co się dzieje z adresem F2 przy kopiowaniu!`,
      cell: 'E2',
      fill: 'E2:E9',
      solution: '=B2*C2*(1+$F$2)',
      explain: md`\`=B2*C2*(1+$F$2)\`. Bez \`$\` w E3 byłoby \`F3\` (puste), więc od trzeciego wiersza wartość brutto byłaby równa netto.`,
    },
    {
      type: 'sheet',
      q: md`W komórce **H1** oblicz **średnią cenę** produktów z tabeli (zakres B2:B9).`,
      cell: 'H1',
      solution: '=ŚREDNIA(B2:B9)',
      expect: 7.72,
      explain: md`\`=ŚREDNIA(B2:B9)\` daje 7,72. Działa też \`=SUMA(B2:B9)/8\`, ale funkcja \`ŚREDNIA\` sama policzy elementy.`,
    },
  ],
  practice: ['2023-maj/6.1', '2024-maj/7.1', '2025-maj/6.1', '2026-maj/7.1'],
};
