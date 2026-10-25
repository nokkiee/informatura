import { md } from '../lib.js';
import db from './db.js';

export default {
  title: 'Daty, tekst i podzapytania',
  summary: 'YEAR, MONTH, DAY i różnice dat, funkcje tekstowe LEFT, MID, LEN, warunek IIF, podzapytania z IN, NOT IN i porównaniem z agregatem.',
  minutes: 35,
  db,
  intro: md`
    - jak wyciągać rok, miesiąc i dzień z daty, porównywać daty i liczyć różnice dni,
    - funkcje tekstowe z Accessa: \`LEFT\`, \`RIGHT\`, \`MID\`, \`LEN\`, \`UCASE\`,
    - warunek w zapytaniu: \`IIF\`,
    - podzapytania: \`IN\`, \`NOT IN\` i porównanie z wynikiem innego zapytania (np. z maksimum).
  `,
  steps: [
    {
      title: 'Daty',
      body: md`
        Funkcje \`YEAR(d)\`, \`MONTH(d)\`, \`DAY(d)\` wyciągają części daty. Zestawienie „dla każdego miesiąca” to grupowanie po \`MONTH(data)\`:

        ~~~sql run
        SELECT MONTH(data) AS miesiac, COUNT(*) AS ocen
        FROM oceny
        GROUP BY MONTH(data)
        ORDER BY ocen DESC;
        ~~~

        Daty można porównywać jak liczby (wcześniejsza jest mniejsza). Oceny z pierwszego semestru (wrzesień–grudzień 2024):

        ~~~sql run
        SELECT COUNT(*)
        FROM oceny
        WHERE data BETWEEN #2024-09-01# AND #2024-12-31#;
        ~~~

        **Różnica dat w dniach:** w Accessie \`DateDiff("d", data1, data2)\` (= data2 − data1). W Informaturze działa zapis Accessa i MySQL-owy \`DATEDIFF(data2, data1)\`:

        ~~~sql run
        SELECT imie, nazwisko, DateDiff("d", data_urodzenia, #2025-06-27#) AS dni_zycia
        FROM uczniowie
        WHERE klasa = '3A';
        ~~~

        > **Uwaga:** Przy grupowaniu „po miesiącu” w danych z kilku lat sam \`MONTH\` połączy np. styczeń 2024 i styczeń 2025! Wtedy grupuj po \`YEAR(data), MONTH(data)\`.
      `,
    },
    {
      title: 'Tekst i IIF',
      body: md`
        | Access | znaczenie | przykład |
        |---|---|---|
        | \`LEFT(t, n)\` | n pierwszych znaków | \`LEFT('Nowak', 2)\` → \`No\` |
        | \`RIGHT(t, n)\` | n ostatnich znaków | \`RIGHT('Nowak', 2)\` → \`ak\` |
        | \`MID(t, start, n)\` | n znaków od pozycji start (od 1) | \`MID('Nowak', 2, 3)\` → \`owa\` |
        | \`LEN(t)\` | długość | \`LEN('Nowak')\` → 5 |
        | \`UCASE(t)\`, \`LCASE(t)\` | wielkie / małe litery | |

        Przykład: inicjał nazwiska i długość nazwiska.

        ~~~sql run
        SELECT imie, LEFT(nazwisko, 1) AS inicjal, LEN(nazwisko) AS dlugosc
        FROM uczniowie
        WHERE klasa = '1A';
        ~~~

        Na maturze funkcje tekstowe służą np. do wyciągnięcia płci z numeru PESEL (przedostatnia cyfra: \`MID(pesel, 10, 1)\`) albo kodu z dłuższego identyfikatora.

        **\`IIF(warunek, a, b)\`** daje \`a\`, gdy warunek jest prawdziwy, i \`b\` w przeciwnym razie – np. podział na kategorie:

        ~~~sql run
        SELECT IIF(ocena >= 5, 'bardzo dobra', IIF(ocena >= 3, 'srednia', 'slaba')) AS kategoria, COUNT(*) AS ile
        FROM oceny
        GROUP BY IIF(ocena >= 5, 'bardzo dobra', IIF(ocena >= 3, 'srednia', 'slaba'));
        ~~~

        > **Wskazówka:** W standardowym SQL (MySQL, SQLite) to samo zapisuje się \`CASE WHEN warunek THEN a ELSE b END\` – w Informaturze działają oba zapisy.
      `,
    },
    {
      title: 'Podzapytania z IN i NOT IN',
      body: md`
        **Podzapytanie** to zapytanie w nawiasie wewnątrz innego zapytania. Z \`IN\` sprawdza, czy wartość jest na liście, którą zwraca podzapytanie.

        Uczniowie, którzy dostali kiedykolwiek ocenę 6:

        ~~~sql run
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE id_ucznia IN (SELECT id_ucznia FROM oceny WHERE ocena = 6);
        ~~~

        \`NOT IN\` – rekordy, których **nie ma** na liście. Uczniowie bez żadnej oceny (to samo, co \`LEFT JOIN … IS NULL\` z poprzedniej lekcji):

        ~~~sql run
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE id_ucznia NOT IN (SELECT id_ucznia FROM oceny);
        ~~~

        Podzapytania łatwo łączyć: uczniowie, którzy mają ocenę z informatyki, ale **nie** mają żadnej z matematyki:

        ~~~sql run
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE id_ucznia IN (SELECT id_ucznia FROM oceny WHERE id_przedmiotu = 2)
          AND id_ucznia NOT IN (SELECT id_ucznia FROM oceny WHERE id_przedmiotu = 1);
        ~~~

        > **Na maturze:** Pytania „którzy nie…”, „żaden z…”, „ani razu” to prawie zawsze \`NOT IN\` (albo \`LEFT JOIN … IS NULL\`). Uważaj, żeby warunek był w **podzapytaniu**: „nie dostał oceny 1” to \`id NOT IN (SELECT id … WHERE ocena = 1)\`, a nie \`WHERE ocena <> 1\` (to drugie zwróci ucznia, który ma jedną jedynkę i inne oceny).
      `,
    },
    {
      title: 'Porównanie z wynikiem zapytania',
      body: md`
        Podzapytanie, które zwraca **jedną wartość**, można wstawić w miejsce liczby. Wszystkie oceny równe największej ocenie w bazie:

        ~~~sql run
        SELECT *
        FROM oceny
        WHERE ocena = (SELECT MAX(ocena) FROM oceny);
        ~~~

        To dobre rozwiązanie problemu **remisów**: \`TOP 1\` pokaże jeden wiersz, a porównanie z maksimum – wszystkie, które je osiągają.

        Oceny z fizyki wyższe od średniej wszystkich ocen:

        ~~~sql run
        SELECT u.imie, u.nazwisko, o.ocena
        FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        WHERE o.id_przedmiotu = 3 AND o.ocena > (SELECT AVG(ocena) FROM oceny);
        ~~~

        Podzapytanie może też stać w \`FROM\` (jak przy liczeniu różnych wartości w lekcji 3) – wtedy jego wynik traktuje się jak tabelę.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Co zwróci \`MID('informatyka', 3, 4)\`?`,
      answer: ['form'],
      exact: true,
      explain: md`Od trzeciego znaku (liczonego od 1) cztery znaki: i-n-**f-o-r-m**-a… → \`form\`.`,
    },
    {
      type: 'choice',
      q: md`Które zapytanie zwróci uczniów, którzy **nigdy** nie dostali oceny 1?`,
      options: [
        '`SELECT * FROM uczniowie WHERE id_ucznia NOT IN (SELECT id_ucznia FROM oceny WHERE ocena = 1)`',
        '`SELECT u.* FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia WHERE o.ocena <> 1`',
        '`SELECT * FROM uczniowie WHERE id_ucznia IN (SELECT id_ucznia FROM oceny WHERE ocena <> 1)`',
        '`SELECT * FROM oceny WHERE ocena <> 1`',
      ],
      answer: 0,
      explain: md`Trzeba odrzucić **każdego** ucznia, który ma choć jedną jedynkę – to robi \`NOT IN\` z listą uczniów z jedynkami. Pozostałe zapytania zwracają uczniów, którzy mają **jakąś** ocenę różną od 1 – więc także tych, którzy mają jedynkę obok innych ocen (B i C), albo w ogóle oceny zamiast uczniów (D).`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Grupowanie po samym `MONTH(data)` łączy ten sam miesiąc z różnych lat.', answer: true },
        { text: 'Podzapytanie `(SELECT MAX(ocena) FROM oceny)` można porównać z polem przez `=`.', answer: true },
        { text: 'W Accessie daty w warunkach zapisuje się w krzyżykach, np. `#2024-09-01#`.', answer: true },
        { text: '`TOP 1` z sortowaniem zawsze pokaże wszystkie rekordy z największą wartością.', answer: false },
      ],
      explain: md`
        - Tak – dlatego przy danych z kilku lat grupuj po roku i miesiącu.
        - Tak – zwraca jedną wartość.
        - Tak.
        - Nie – przy remisie pokaże jeden (albo w Accessie wszystkie z remisem na ostatnim miejscu, ale nie da się na tym polegać). Porównanie z \`MAX\` jest pewne.
      `,
    },
    {
      type: 'sql',
      q: md`Podaj **imiona i nazwiska** uczniów, którzy **nie dostali żadnej oceny 1 ani 2**. (Uczniowie bez żadnych ocen też spełniają ten warunek.)`,
      solution: 'SELECT imie, nazwisko FROM uczniowie WHERE id_ucznia NOT IN (SELECT id_ucznia FROM oceny WHERE ocena <= 2);',
      explain: md`
        ~~~sql
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE id_ucznia NOT IN (SELECT id_ucznia FROM oceny WHERE ocena <= 2);
        ~~~
        Podzapytanie zwraca uczniów z ocenami 1 lub 2, a \`NOT IN\` – całą resztę, także osoby bez ocen.
      `,
    },
    {
      type: 'sql',
      q: md`Dla każdego **miesiąca** (numer miesiąca) podaj **liczbę ocen 5 i 6** wystawionych w tym miesiącu. (Wszystkie oceny są z jednego roku szkolnego, w którym każdy miesiąc występuje raz.)`,
      solution: 'SELECT MONTH(data), COUNT(*) FROM oceny WHERE ocena >= 5 GROUP BY MONTH(data);',
      explain: md`
        ~~~sql
        SELECT MONTH(data) AS miesiac, COUNT(*) AS dobrych
        FROM oceny
        WHERE ocena >= 5
        GROUP BY MONTH(data);
        ~~~
      `,
    },
    {
      type: 'sql',
      q: md`Wypisz **wszystkie pola** ocen, które są równe **najniższej** ocenie wystawionej z matematyki (\`id_przedmiotu = 1\`), i pochodzą z matematyki.`,
      solution: 'SELECT * FROM oceny WHERE id_przedmiotu = 1 AND ocena = (SELECT MIN(ocena) FROM oceny WHERE id_przedmiotu = 1);',
      explain: md`
        Podzapytanie liczy minimum **z matematyki** – warunek \`id_przedmiotu = 1\` musi być w obu zapytaniach:
        ~~~sql
        SELECT *
        FROM oceny
        WHERE id_przedmiotu = 1
          AND ocena = (SELECT MIN(ocena) FROM oceny WHERE id_przedmiotu = 1);
        ~~~
      `,
    },
  ],
  practice: ['2024-maj/8.3', '2026-maj/8.2', '2025-maj/7.3', '2025-czerwiec/7.4', '2026-czerwiec/8.2', '2024-maj/8.2', '2024-czerwiec/8.3'],
};
