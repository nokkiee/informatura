import { md } from '../lib.js';
import db from './db.js';

export default {
  title: 'Wybieranie danych: SELECT, WHERE, ORDER BY',
  summary: 'Warunki w WHERE, operatory porównania i logiczne, LIKE, BETWEEN, IN, sortowanie, DISTINCT, TOP i pola obliczane.',
  minutes: 30,
  db,
  intro: md`
    - jak wybierać wiersze spełniające warunek (\`WHERE\`),
    - operatory: porównania, \`AND\` / \`OR\` / \`NOT\`, \`BETWEEN\`, \`IN\`, \`LIKE\`,
    - jak sortować wynik (\`ORDER BY\`) i brać tylko pierwsze wiersze (\`TOP\`),
    - jak usunąć powtórzenia (\`DISTINCT\`) i dodać pole obliczane z nazwą (\`AS\`).
  `,
  steps: [
    {
      title: 'WHERE – wybór wierszy',
      body: md`
        \`WHERE\` zostawia tylko te wiersze, dla których warunek jest prawdziwy:

        ~~~sql run
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE klasa = '2B';
        ~~~

        | operator | znaczenie |
        |---|---|
        | \`=\`, \`<>\` | równe, różne (w SQLite działa też \`!=\`, w Accessie tylko \`<>\`) |
        | \`<\`, \`<=\`, \`>\`, \`>=\` | porównania (liczby, teksty alfabetycznie, daty chronologicznie) |
        | \`AND\`, \`OR\`, \`NOT\` | i, lub, nie |

        Warunki łączysz \`AND\` i \`OR\`. Uwaga na kolejność: \`AND\` wiąże silniej niż \`OR\`, więc przy mieszaniu ich używaj nawiasów:

        ~~~sql run
        SELECT imie, nazwisko, klasa, miasto
        FROM uczniowie
        WHERE (klasa = '1A' OR klasa = '1B') AND miasto <> 'Torun';
        ~~~

        Bez nawiasów \`klasa = '1A' OR klasa = '1B' AND miasto <> 'Torun'\` znaczyłoby: „cała klasa 1A” albo „ci z 1B, którzy nie są z Torunia” – a to inny wynik.
      `,
    },
    {
      title: 'BETWEEN, IN, LIKE',
      body: md`
        Trzy skróty, które oszczędzają pisania:

        - \`x BETWEEN a AND b\` – to samo co \`x >= a AND x <= b\` (**oba końce włącznie**),
        - \`x IN (a, b, c)\` – to samo co \`x = a OR x = b OR x = c\`,
        - \`x LIKE wzorzec\` – dopasowanie tekstu do wzorca: \`%\` oznacza dowolny ciąg znaków (także pusty), \`_\` – dokładnie jeden znak.

        ~~~sql run
        SELECT imie, nazwisko, data_urodzenia
        FROM uczniowie
        WHERE data_urodzenia BETWEEN '2008-01-01' AND '2008-06-30';
        ~~~

        ~~~sql run
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE nazwisko LIKE 'K%';
        ~~~

        > **Uwaga:** W **Accessie** symbole wzorca są inne: \`*\` zamiast \`%\` i \`?\` zamiast \`_\` (np. \`LIKE 'K*'\`). Daty w Accessie zapisuje się w krzyżykach: \`#2008-01-01#\`. W Informaturze działają oba zapisy – zapytania przepisane z Accessa wykonają się bez zmian.

        Przykłady wzorców: \`'%a'\` – kończy się na *a*, \`'%ow%'\` – zawiera *ow*, \`'_a%'\` – druga litera to *a*, \`'2%'\` – zaczyna się od 2 (np. klasy 2A i 2B).
      `,
    },
    {
      title: 'ORDER BY, TOP, DISTINCT',
      body: md`
        \`ORDER BY\` sortuje wynik: \`ASC\` rosnąco (domyślnie), \`DESC\` malejąco. Można podać kilka pól – drugie rozstrzyga remisy w pierwszym:

        ~~~sql run
        SELECT imie, nazwisko, klasa
        FROM uczniowie
        ORDER BY klasa DESC, nazwisko ASC;
        ~~~

        \`TOP n\` (Access) albo \`LIMIT n\` na końcu zapytania (SQLite, MySQL) zostawia tylko **pierwsze n wierszy** wyniku – razem z \`ORDER BY\` daje „n największych / najmniejszych”. Trzech najstarszych uczniów:

        ~~~sql run
        SELECT TOP 3 imie, nazwisko, data_urodzenia
        FROM uczniowie
        ORDER BY data_urodzenia;
        ~~~

        \`DISTINCT\` usuwa powtarzające się wiersze wyniku – „jakie są różne miasta”:

        ~~~sql run
        SELECT DISTINCT miasto
        FROM uczniowie
        ORDER BY miasto;
        ~~~

        > **Uwaga:** \`TOP 3\` w Accessie zwraca **więcej** wierszy, jeśli na trzecim miejscu jest remis (wszystkie o tej samej wartości). \`LIMIT 3\` zawsze zwraca dokładnie trzy. Gdy pytanie brzmi „podaj osobę z największym…”, sprawdź, czy nie ma remisu – np. sortując i oglądając kilka pierwszych wierszy.
      `,
    },
    {
      title: 'Pola obliczane i aliasy',
      body: md`
        W \`SELECT\` można liczyć: działania arytmetyczne na polach i funkcje (np. \`YEAR(data)\` – rok z daty). Nowe pole warto nazwać przez \`AS\` – nazwa pojawi się w nagłówku wyniku:

        ~~~sql run
        SELECT imie, nazwisko, YEAR(data_urodzenia) AS rok, 2025 - YEAR(data_urodzenia) AS wiek_w_2025
        FROM uczniowie
        ORDER BY rok;
        ~~~

        Alias można też nadać tabeli (\`FROM uczniowie AS u\`) – przyda się przy łączeniu tabel w lekcji o JOIN.

        > **Wskazówka:** Na maturze pytanie „podaj liczbę…” często da się rozwiązać jednym zapytaniem z warunkiem i licznikiem – o tym jest następna lekcja (\`COUNT\`, \`GROUP BY\`).
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Które zapytanie zwróci uczniów z klasy 1A **lub** 1B, mieszkających w Opolu?`,
      options: [
        "`WHERE (klasa = '1A' OR klasa = '1B') AND miasto = 'Opole'`",
        "`WHERE klasa = '1A' OR klasa = '1B' AND miasto = 'Opole'`",
        "`WHERE klasa = '1A' AND klasa = '1B' AND miasto = 'Opole'`",
        "`WHERE klasa IN ('1A', '1B') OR miasto = 'Opole'`",
      ],
      answer: 0,
      explain: md`\`AND\` wiąże silniej niż \`OR\`, więc bez nawiasów (B) zapytanie zwróci całą klasę 1A. (C) jest zawsze fałszywe – uczeń nie jest w dwóch klasach naraz. (D) zwróci wszystkich z Opola, także z innych klas.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`ocena BETWEEN 2 AND 4` obejmuje oceny 2, 3 i 4.', answer: true },
        { text: "Wzorzec `LIKE '_a%'` pasuje do słowa `Maja`.", answer: true },
        { text: '`ORDER BY` bez `DESC` sortuje malejąco.', answer: false },
        { text: "W Accessie wzorzec „zaczyna się od K” zapisuje się `LIKE 'K*'`.", answer: true },
      ],
      explain: md`
        - Tak – BETWEEN obejmuje oba końce.
        - Tak – \`_\` to jeden dowolny znak (M), potem \`a\`, potem dowolny ciąg (ja).
        - Nie – domyślnie rosnąco (ASC).
        - Tak – w Accessie \`*\` zastępuje \`%\`.
      `,
    },
    {
      type: 'input',
      q: md`Ile wierszy zwróci \`SELECT DISTINCT miasto FROM uczniowie;\`? Możesz to sprawdzić w lekcji.`,
      answer: '4',
      explain: md`Uczniowie mieszkają w czterech różnych miastach: Krakow, Opole, Poznan, Torun.`,
    },
    {
      type: 'sql',
      q: md`Wypisz **imiona i nazwiska** uczniów, których **imię kończy się na literę a**, posortowane alfabetycznie według imienia.`,
      solution: "SELECT imie, nazwisko FROM uczniowie WHERE imie LIKE '%a' ORDER BY imie;",
      ordered: true,
      explain: md`
        ~~~sql
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE imie LIKE '%a'
        ORDER BY imie;
        ~~~
        \`%a\` – dowolny początek, a na końcu *a*. W Accessie: \`LIKE '*a'\`.
      `,
    },
    {
      type: 'sql',
      q: md`Wypisz wszystkie pola tych ocen z **informatyki** (\`id_przedmiotu = 2\`), które są **niższe niż 3**.`,
      solution: 'SELECT * FROM oceny WHERE id_przedmiotu = 2 AND ocena < 3;',
      explain: md`Dwa warunki połączone \`AND\`: \`WHERE id_przedmiotu = 2 AND ocena < 3\`. (Można też \`ocena <= 2\` – oceny są liczbami całkowitymi.)`,
    },
    {
      type: 'sql',
      q: md`Wypisz **imię, nazwisko i datę urodzenia** trzech **najmłodszych** uczniów (najpóźniejsza data urodzenia), od najmłodszego.`,
      solution: 'SELECT TOP 3 imie, nazwisko, data_urodzenia FROM uczniowie ORDER BY data_urodzenia DESC;',
      ordered: true,
      explain: md`
        Najmłodszy urodził się **najpóźniej**, więc sortujemy malejąco po dacie i bierzemy trzy pierwsze wiersze:
        ~~~sql
        SELECT TOP 3 imie, nazwisko, data_urodzenia
        FROM uczniowie
        ORDER BY data_urodzenia DESC;
        ~~~
        W SQLite zamiast \`TOP 3\` możesz napisać \`LIMIT 3\` na końcu.
      `,
    },
  ],
  practice: ['2023-czerwiec/7.3', '2025-maj/7.4', '2025-czerwiec/7.3', '2024-czerwiec/8.2'],
};
