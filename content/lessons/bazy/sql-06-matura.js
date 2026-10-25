import { md, rows } from '../lib.js';
import school from './db.js';

// the school database plus a table "added in the task", like in the "write a query" tasks
const db = {
  ...school,
  wychowawcy: rows`
    klasa;id_nauczyciela
    1A;1
    1B;2
    2A;3
    2B;4
    3A;5
  `,
};

export default {
  title: 'Zadanie maturalne z bazą danych',
  summary: 'Plan pracy z bazą, „najwięcej” z remisami, maksimum w każdej grupie, zapytanie do tabeli dodanej w treści, najczęstsze błędy.',
  minutes: 35,
  db,
  intro: md`
    - jak zaplanować pracę z zadaniem z bazy danych,
    - jak odpowiadać na pytania „który ma najwięcej” – także gdy jest remis,
    - jak znaleźć maksimum **w każdej grupie** (zapytanie na zapytaniu),
    - jak zapisać zapytanie do tabeli, która pojawia się dopiero w treści zadania,
    - lista najczęstszych błędów i sposoby sprawdzania wyniku.
  `,
  steps: [
    {
      title: 'Plan pracy',
      body: md`
        1. **Przeczytaj opis plików** i zanotuj tabele, pola i klucze. Narysuj (choćby na brudnopisie) prostokąty tabel i linie między polami, które je łączą.
        2. **Obejrzyj dane**: \`SELECT * FROM tabela\` dla każdej tabeli. Sprawdź format dat, czy są puste pola, jak zapisane są teksty (wielkość liter!).
        3. **Dla każdego pytania ustal**: z których tabel są potrzebne pola (→ złączenia), które wiersze (→ \`WHERE\`), czy „dla każdego…” (→ \`GROUP BY\`), warunek na grupę (→ \`HAVING\`), kolejność i ile wierszy (→ \`ORDER BY\`, \`TOP\`).
        4. **Buduj zapytanie stopniowo**: najpierw złączenie i \`WHERE\` bez grupowania – obejrzyj wiersze i sprawdź, czy to te, o które chodzi; dopiero potem dodaj grupowanie.

        W tej lekcji baza szkoły ma dodatkową tabelę \`wychowawcy\` (klasa i identyfikator nauczyciela), tak jak w zadaniach, w których treść „dokłada” nową tabelę:

        ~~~db
        ~~~
      `,
    },
    {
      title: '„Najwięcej” i remisy',
      body: md`
        Pytanie *„który nauczyciel-wychowawca ma w swojej klasie najwięcej ocen 6”* rozwiązujesz w trzech krokach: złączenie, grupowanie, sortowanie.

        ~~~sql run
        SELECT n.nazwisko, COUNT(*) AS szostek
        FROM ((wychowawcy AS w INNER JOIN nauczyciele AS n ON w.id_nauczyciela = n.id_nauczyciela)
              INNER JOIN uczniowie AS u ON u.klasa = w.klasa)
              INNER JOIN oceny AS o ON o.id_ucznia = u.id_ucznia
        WHERE o.ocena = 6
        GROUP BY n.nazwisko
        ORDER BY szostek DESC;
        ~~~

        Wynik jest jednoznaczny (2 szóstki u jednego wychowawcy), więc odpowiedzią jest pierwszy wiersz. Gdyby dwa pierwsze wiersze miały tę samą liczbę, odpowiedzią byłyby **oba** – dlatego zamiast od razu pisać \`TOP 1\`, najpierw obejrzyj kilka pierwszych wierszy.

        > **Na maturze:** W treści często jest zapewnienie „jest tylko jeden taki…”. Jeśli Twój wynik ma remis na pierwszym miejscu, to prawie na pewno błąd w zapytaniu (np. zły warunek łączenia), a nie w zadaniu.
      `,
    },
    {
      title: 'Maksimum w każdej grupie',
      body: md`
        *„Dla każdej klasy podaj najwyższą średnią ocen ucznia”* to dwa poziomy grupowania: najpierw średnia **każdego ucznia** (grupa = uczeń), potem maksimum **w każdej klasie** (grupa = klasa). Robi się to **zapytaniem na zapytaniu** – wewnętrzne liczy średnie, zewnętrzne grupuje jego wynik:

        ~~~sql run
        SELECT klasa, MAX(srednia) AS najlepsza
        FROM (SELECT u.klasa, u.id_ucznia, AVG(o.ocena) AS srednia
              FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
              GROUP BY u.klasa, u.id_ucznia)
        GROUP BY klasa;
        ~~~

        W Accessie wygodnie jest zapisać zapytanie wewnętrzne jako osobną kwerendę (np. \`srednie\`) i potem pisać \`FROM srednie\` – to to samo.

        Ten sam pomysł rozwiązuje *„klasa z najwyższą średnią”*: porównujemy średnią grupy z maksimum średnich (podzapytanie w \`HAVING\`):

        ~~~sql run
        SELECT u.klasa, ROUND(AVG(o.ocena), 2) AS srednia
        FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        GROUP BY u.klasa
        HAVING AVG(o.ocena) = (SELECT MAX(sr) FROM (SELECT AVG(o2.ocena) AS sr
                                                     FROM uczniowie AS u2 INNER JOIN oceny AS o2 ON u2.id_ucznia = o2.id_ucznia
                                                     GROUP BY u2.klasa));
        ~~~
      `,
    },
    {
      title: 'Najczęstsze błędy',
      body: md`
        | objaw | przyczyna |
        |---|---|
        | wynik ma ogromną liczbę wierszy | złączenie bez warunku (\`FROM a, b\` bez \`WHERE\`) – każdy wiersz z każdym |
        | liczby za duże po złączeniu | jeden rekord pasuje do kilku w drugiej tabeli; liczysz wiersze złączenia zamiast różnych obiektów |
        | brakuje rekordów z zerem | \`INNER JOIN\` zamiast \`LEFT JOIN\`; albo \`COUNT(*)\` zamiast \`COUNT(pole)\` przy \`LEFT JOIN\` |
        | Access: „nie zawiera określonego wyrażenia jako części funkcji agregującej” | pole w \`SELECT\` nie jest w \`GROUP BY\` |
        | błąd z funkcją agregującą w \`WHERE\` | warunek na grupę powinien być w \`HAVING\` |
        | warunek „bez…” nie działa | \`<>\` zamiast \`NOT IN\` z podzapytaniem |
        | puste nie są znajdowane | \`= NULL\` zamiast \`IS NULL\` |

        Złączenie bez warunku – iloczyn kartezjański:

        ~~~sql run
        SELECT COUNT(*) FROM uczniowie, przedmioty;
        ~~~

        20 uczniów × 6 przedmiotów = 120 par, choć żadna z nich nic nie znaczy.

        > **Wskazówka:** Sprawdzaj wynik innym zapytaniem: jeśli policzyłeś liczbę ocen dla każdej klasy, suma tych liczb powinna być równa liczbie wszystkich ocen (\`SELECT COUNT(*) FROM oceny\`).
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Ile wierszy zwróci \`SELECT * FROM uczniowie, nauczyciele;\` (20 uczniów, 5 nauczycieli, bez warunku łączenia)?`,
      answer: '100',
      explain: md`Złączenie bez warunku to iloczyn kartezjański: każdy uczeń z każdym nauczycielem – 20 · 5 = 100 wierszy.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Maksimum średnich w każdej grupie można policzyć zapytaniem na wyniku innego zapytania.', answer: true },
        { text: 'Jeśli pytanie brzmi „podaj nauczyciela, który…”, a w Twoim wyniku jest remis na pierwszym miejscu, zawsze podajesz pierwszy wiersz.', answer: false },
        { text: 'Przy `LEFT JOIN` funkcja `COUNT(pole_z_prawej_tabeli)` daje 0 dla wierszy bez pary.', answer: true },
      ],
      explain: md`
        - Tak – zapytanie w \`FROM\` (albo zapisana kwerenda w Accessie).
        - Nie – przy remisie odpowiedzią są wszystkie rekordy z remisem (a jeśli treść zapewnia, że jest jeden, to remis sugeruje błąd w zapytaniu).
        - Tak – \`COUNT\` pomija \`NULL\`.
      `,
    },
    {
      type: 'sql',
      q: md`Do bazy dodano tabelę \`wychowawcy\` (pola \`klasa\`, \`id_nauczyciela\`). Wypisz dla każdej klasy **klasę** oraz **imię i nazwisko** jej wychowawcy.`,
      solution: 'SELECT w.klasa, n.imie, n.nazwisko FROM wychowawcy AS w INNER JOIN nauczyciele AS n ON w.id_nauczyciela = n.id_nauczyciela;',
      explain: md`
        ~~~sql
        SELECT w.klasa, n.imie, n.nazwisko
        FROM wychowawcy AS w INNER JOIN nauczyciele AS n ON w.id_nauczyciela = n.id_nauczyciela;
        ~~~
      `,
    },
    {
      type: 'sql',
      q: md`Dla **każdego ucznia klasy 3A** (także bez ocen) podaj **imię, nazwisko** i **liczbę jego ocen**.`,
      solution: "SELECT u.imie, u.nazwisko, COUNT(o.id_oceny) FROM uczniowie AS u LEFT JOIN oceny AS o ON u.id_ucznia = o.id_ucznia WHERE u.klasa = '3A' GROUP BY u.id_ucznia, u.imie, u.nazwisko;",
      explain: md`
        \`LEFT JOIN\`, żeby nie zgubić uczniów bez ocen, i \`COUNT(o.id_oceny)\`, żeby dali 0:
        ~~~sql
        SELECT u.imie, u.nazwisko, COUNT(o.id_oceny) AS ocen
        FROM uczniowie AS u LEFT JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        WHERE u.klasa = '3A'
        GROUP BY u.id_ucznia, u.imie, u.nazwisko;
        ~~~
        Warunek \`u.klasa = '3A'\` dotyczy lewej tabeli, więc może być w \`WHERE\`.
      `,
    },
    {
      type: 'sql',
      q: md`Podaj **klasę** (lub klasy), w której **średnia wszystkich ocen** jest najwyższa, i tę **średnią zaokrągloną do dwóch miejsc**.`,
      solution: 'SELECT u.klasa, ROUND(AVG(o.ocena), 2) FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia GROUP BY u.klasa HAVING AVG(o.ocena) = (SELECT MAX(sr) FROM (SELECT AVG(o2.ocena) AS sr FROM uczniowie AS u2 INNER JOIN oceny AS o2 ON u2.id_ucznia = o2.id_ucznia GROUP BY u2.klasa));',
      explain: md`
        Rozwiązanie z kroku 3 (podzapytanie w \`HAVING\`) pokaże wszystkie klasy z remisem. Prostsze rozwiązanie z sortowaniem też da tu dobry wynik, bo nie ma remisu:
        ~~~sql
        SELECT TOP 1 u.klasa, ROUND(AVG(o.ocena), 2) AS srednia
        FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        GROUP BY u.klasa
        ORDER BY AVG(o.ocena) DESC;
        ~~~
      `,
    },
    {
      type: 'choice',
      q: md`Zapytanie liczące oceny w każdej klasie dało sumę liczb większą niż liczba wszystkich ocen w tabeli \`oceny\`. Co jest najbardziej prawdopodobną przyczyną?`,
      options: [
        'złączenie, w którym jedna ocena pasuje do kilku wierszy drugiej tabeli (np. zły warunek ON)',
        'użycie GROUP BY zamiast HAVING',
        'sortowanie malejące',
        'brak średnika na końcu zapytania',
      ],
      answer: 0,
      explain: md`Każda ocena należy do jednego ucznia, a uczeń do jednej klasy – suma po klasach musi się zgadzać z liczbą ocen. Większa suma oznacza, że ocena „rozmnożyła się” w złączeniu, czyli warunek łączenia dopasował ją do kilku wierszy.`,
    },
  ],
  practice: ['2023-maj/7.5', '2023-czerwiec/7.5', '2024-maj/8.4', '2024-czerwiec/8.4', '2025-maj/7.5', '2025-czerwiec/7.5', '2026-maj/8.5', '2026-czerwiec/8.3'],
};
