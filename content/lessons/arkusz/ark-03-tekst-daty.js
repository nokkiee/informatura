import { md } from '../lib.js';
import { ROWERY } from './dane.js';

export default {
  title: 'Tekst, daty i godziny',
  summary: 'LEWY, PRAWY, FRAGMENT.TEKSTU, DŁ, ZNAJDŹ, łączenie tekstów; daty jako liczby, ROK, MIESIĄC, DZIEŃ, DZIEŃ.TYG, DATA, różnice dat, godziny.',
  minutes: 30,
  sheet: { data: ROWERY },
  intro: md`
    - jak wyciągać fragmenty tekstu (\`LEWY\`, \`PRAWY\`, \`FRAGMENT.TEKSTU\`) i szukać w nim znaków (\`ZNAJDŹ\`),
    - jak łączyć teksty (\`&\`, \`ZŁĄCZ.TEKSTY\`),
    - jak arkusz przechowuje daty i godziny,
    - funkcje \`ROK\`, \`MIESIĄC\`, \`DZIEŃ\`, \`DZIEŃ.TYG\`, \`DATA\`, \`GODZINA\` i liczenie różnic dat.
  `,
  steps: [
    {
      title: 'Funkcje tekstowe',
      body: md`
        | funkcja | wynik | przykład dla „Rower miejski” |
        |---|---|---|
        | \`LEWY(t; n)\` | n pierwszych znaków | \`LEWY(B5;5)\` → Rower |
        | \`PRAWY(t; n)\` | n ostatnich znaków | \`PRAWY(B5;3)\` → ski |
        | \`FRAGMENT.TEKSTU(t; start; n)\` | n znaków od pozycji start (od 1) | \`FRAGMENT.TEKSTU(B5;7;6)\` → miejsk |
        | \`DŁ(t)\` | długość | 13 |
        | \`ZNAJDŹ(szukany; t)\` | pozycja pierwszego wystąpienia | \`ZNAJDŹ(" ";B5)\` → 6 |
        | \`LITERY.WIELKIE(t)\`, \`LITERY.MAŁE(t)\` | zmiana wielkości liter | |

        ~~~excel run
        =LEWY(B5;5)
        =DŁ(B5)
        =ZNAJDŹ(" ";B5)
        =B5&" ("&C5&")"
        ~~~

        Teksty łączy operator \`&\` (albo funkcja \`ZŁĄCZ.TEKSTY\`). Łącząc liczbę z tekstem, dostajesz tekst.

        **Pierwsze słowo** z tekstu to klasyczna kombinacja: \`=LEWY(B2;ZNAJDŹ(" ";B2&" ")-1)\`. Dopisanie spacji (\`B2&" "\`) sprawia, że formuła działa też dla tekstu bez spacji (np. „Kask”) – inaczej \`ZNAJDŹ\` zwróciłby błąd.

        > **Na maturze:** Funkcje tekstowe przydają się do rozbierania identyfikatorów (np. kod produktu „AB-2023-17” → rok \`FRAGMENT.TEKSTU(A2;4;4)\`) i numerów PESEL (pierwsze cyfry to data urodzenia, przedostatnia – płeć).
      `,
    },
    {
      title: 'Daty to liczby',
      body: md`
        Arkusz przechowuje datę jako **liczbę dni** od 1 stycznia 1900 r. Data 2024-03-04 to 45355 – sformatowana jako data wyświetla się normalnie, ale można na niej liczyć:

        ~~~excel run
        =A2
        =A37-A2
        =DATA(2024;4;1)
        ~~~

        - **różnica dat** to liczba dni między nimi (\`=A37-A2\` → 88 dni między pierwszą a ostatnią sprzedażą),
        - **data + liczba** to data przesunięta o tyle dni (\`=A2+7\` – tydzień później),
        - \`DATA(rok; miesiąc; dzień)\` buduje datę z liczb; przydaje się w warunkach: \`">="&DATA(2024;4;1)\`.

        Części daty wyciągają funkcje:

        ~~~excel run
        =ROK(A2)
        =MIESIĄC(A2)
        =DZIEŃ(A2)
        =DZIEŃ.TYG(A2;2)
        ~~~

        \`DZIEŃ.TYG(data; 2)\` numeruje dni od **poniedziałku = 1** do **niedzieli = 7** (bez drugiego argumentu numeracja zaczyna się od niedzieli – to częsta pułapka!). Weekend to więc \`DZIEŃ.TYG(A2;2)>=6\`.
      `,
    },
    {
      title: 'Godziny',
      body: md`
        Godzina to **ułamek doby**: 12:00 to 0,5, a 06:00 to 0,25. Dlatego:
        - \`GODZINA(t)\`, \`MINUTA(t)\` wyciągają części czasu,
        - różnica dwóch godzin to ułamek doby – żeby dostać godziny, pomnóż przez 24, a minuty – przez 24·60,
        - data z godziną (np. 2024-03-04 14:35) to liczba dni z ułamkiem: \`ZAOKR.DO.CAŁK(x)\` daje samą datę, a \`x-ZAOKR.DO.CAŁK(x)\` samą godzinę.

        ~~~excel run
        =GODZINA("14:35")
        =MINUTA("14:35")
        =("17:20"-"14:35")*24*60
        ~~~

        > **Uwaga:** Gdy w danych są daty z godzinami, a pytanie dotyczy dni (np. „w którym dniu…”), zrób kolumnę pomocniczą z samą datą – inaczej każdy pomiar będzie osobną „datą”.
      `,
    },
    {
      title: 'Daty w zestawieniach',
      body: md`
        Typowe pytania o daty i jak je rozwiązać kolumną pomocniczą:

        | pytanie | kolumna pomocnicza | potem |
        |---|---|---|
        | ile sprzedaży w każdym miesiącu | \`=MIESIĄC(A2)\` | \`LICZ.JEŻELI\` po numerach miesięcy |
        | ile sprzedaży w weekendy | \`=JEŻELI(DZIEŃ.TYG(A2;2)>=6;1;0)\` | \`SUMA\` |
        | suma w każdym tygodniu | \`=ZAOKR.DO.CAŁK((A2-start)/7)+1\` (numer tygodnia) | \`SUMA.JEŻELI\` |
        | ile dni minęło od poprzedniego zdarzenia | \`=A3-A2\` | \`MAKS\` itp. |

        ~~~excel run
        =LICZ.WARUNKI(A2:A37;">="&DATA(2024;4;1);A2:A37;"<"&DATA(2024;5;1))
        ~~~

        Ostatnia formuła liczy sprzedaże w kwietniu bez kolumny pomocniczej – warunek „od 1 kwietnia włącznie do 1 maja wyłącznie” działa niezależnie od liczby dni w miesiącu.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Jaką liczbę zwróci \`DZIEŃ.TYG(data;2)\` dla **niedzieli**?`,
      answer: '7',
      explain: md`Z drugim argumentem 2 poniedziałek to 1, a niedziela – 7.`,
    },
    {
      type: 'input',
      q: md`Co zwróci \`=FRAGMENT.TEKSTU("informatyka";3;4)\`?`,
      answer: ['form'],
      exact: true,
      explain: md`Od trzeciego znaku cztery znaki: in**form**atyka.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Różnica dwóch dat w arkuszu to liczba dni między nimi.', answer: true },
        { text: 'Godzina 18:00 jest w arkuszu zapisana jako 0,75.', answer: true },
        { text: '`DZIEŃ.TYG(data)` bez drugiego argumentu zwraca 1 dla poniedziałku.', answer: false },
        { text: '`=LEWY("Kask";ZNAJDŹ(" ";"Kask")-1)` zwróci „Kask”.', answer: false },
      ],
      explain: md`
        - Tak.
        - Tak: 18/24 = 0,75.
        - Nie – bez drugiego argumentu numeracja zaczyna się od niedzieli (niedziela = 1, poniedziałek = 2).
        - Nie – w „Kask” nie ma spacji, więc \`ZNAJDŹ\` zwraca błąd. Dlatego dopisuje się spację: \`ZNAJDŹ(" ";B2&" ")\`.
      `,
    },
    {
      type: 'sheet',
      q: md`W kolumnie F wpisz **numer miesiąca** każdej sprzedaży (z daty w kolumnie A). Formuła dla **F2** zostanie skopiowana do F2:F37.`,
      cell: 'F2',
      fill: 'F2:F37',
      solution: '=MIESIĄC(A2)',
      explain: md`\`=MIESIĄC(A2)\`. Z taką kolumną zestawienie miesięczne to już tylko \`LICZ.JEŻELI\` albo \`SUMA.JEŻELI\` po numerach 3, 4, 5.`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie G wpisz **1**, jeśli sprzedaż odbyła się w **weekend** (sobota lub niedziela), a **0** w przeciwnym razie. Formuła dla **G2** zostanie skopiowana do G2:G37.`,
      cell: 'G2',
      fill: 'G2:G37',
      solution: '=JEŻELI(DZIEŃ.TYG(A2;2)>=6;1;0)',
      explain: md`\`=JEŻELI(DZIEŃ.TYG(A2;2)>=6;1;0)\` – z typem 2 sobota to 6, a niedziela 7. Suma tej kolumny (12) to liczba sprzedaży w weekendy.`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie H wpisz **pierwsze słowo** nazwy produktu z kolumny B (np. dla „Rower miejski” – „Rower”, a dla „Kask” – „Kask”). Formuła dla **H2** zostanie skopiowana do H2:H37.`,
      cell: 'H2',
      fill: 'H2:H37',
      solution: '=LEWY(B2;ZNAJDŹ(" ";B2&" ")-1)',
      explain: md`\`=LEWY(B2;ZNAJDŹ(" ";B2&" ")-1)\` – pozycja pierwszej spacji minus jeden to długość pierwszego słowa. Dopisana spacja zapewnia, że jednowyrazowe nazwy też działają.`,
    },
    {
      type: 'sheet',
      q: md`W komórce **I1** oblicz, **ile dni** minęło od **pierwszej** do **ostatniej** sprzedaży w tabeli (daty w A2:A37).`,
      cell: 'I1',
      solution: '=MAKS(A2:A37)-MIN(A2:A37)',
      expect: 88,
      explain: md`Najpóźniejsza data minus najwcześniejsza: \`=MAKS(A2:A37)-MIN(A2:A37)\` → 88. Gdy dane są posortowane według daty, wystarczy \`=A37-A2\`.`,
    },
  ],
  practice: ['2025-czerwiec/6.3', '2025-maj/6.3', '2024-czerwiec/7.1', '2023-czerwiec/6.2', '2026-czerwiec/7.1'],
};
