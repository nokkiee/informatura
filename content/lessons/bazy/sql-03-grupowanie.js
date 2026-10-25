import { md } from '../lib.js';
import db from './db.js';

export default {
  title: 'Funkcje agregujące i grupowanie',
  summary: 'COUNT, SUM, AVG, MIN, MAX, GROUP BY – zestawienie dla każdej grupy, HAVING – warunek dla grup, liczenie różnych wartości.',
  minutes: 30,
  db,
  intro: md`
    - jak policzyć, zsumować, uśrednić całą tabelę (\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`),
    - jak zrobić zestawienie „dla każdego…” (\`GROUP BY\`),
    - czym różni się \`WHERE\` od \`HAVING\`,
    - jak policzyć **różne** wartości – także w Accessie, który nie ma \`COUNT(DISTINCT …)\`.
  `,
  steps: [
    {
      title: 'Funkcje agregujące',
      body: md`
        **Funkcje agregujące** zamieniają wiele wierszy w jedną wartość:

        | funkcja | wynik |
        |---|---|
        | \`COUNT(*)\` | liczba wierszy |
        | \`COUNT(pole)\` | liczba wierszy, w których pole nie jest puste |
        | \`SUM(pole)\` | suma |
        | \`AVG(pole)\` | średnia |
        | \`MIN(pole)\`, \`MAX(pole)\` | najmniejsza, największa wartość |

        ~~~sql run
        SELECT COUNT(*) AS liczba_ocen, AVG(ocena) AS srednia, MIN(ocena) AS najgorsza, MAX(ocena) AS najlepsza
        FROM oceny;
        ~~~

        Z \`WHERE\` liczysz tylko wybrane wiersze – np. ile jest ocen 5 i 6:

        ~~~sql run
        SELECT COUNT(*)
        FROM oceny
        WHERE ocena >= 5;
        ~~~

        \`ROUND(x, 2)\` zaokrągla do dwóch miejsc po przecinku – w zadaniach maturalnych często trzeba tak podać średnią.
      `,
    },
    {
      title: 'GROUP BY – zestawienie dla każdego',
      body: md`
        Pytanie *„dla każdej klasy podaj liczbę uczniów”* to **grupowanie**: wiersze o tej samej wartości pola \`klasa\` tworzą grupę, a funkcja agregująca liczy się osobno dla każdej grupy.

        ~~~sql run
        SELECT klasa, COUNT(*) AS uczniow
        FROM uczniowie
        GROUP BY klasa;
        ~~~

        Zasada, której pilnuje Access (i każdy porządny SQL): w \`SELECT\` mogą być tylko **pola z \`GROUP BY\`** i **funkcje agregujące**. Zapytanie \`SELECT klasa, nazwisko, COUNT(*) … GROUP BY klasa\` nie ma sensu – której osoby nazwisko pokazać dla całej klasy? (SQLite takie zapytanie wykona i wybierze dowolne nazwisko, ale Access zgłosi błąd – nie polegaj na tym.)

        Grupować można po kilku polach i sortować wynik według wartości agregatu – „przedmioty od największej liczby ocen”:

        ~~~sql run
        SELECT id_przedmiotu, COUNT(*) AS ile, ROUND(AVG(ocena), 2) AS srednia
        FROM oceny
        GROUP BY id_przedmiotu
        ORDER BY ile DESC;
        ~~~

        > **Na maturze:** Pytanie „który … ma najwięcej …” to: grupowanie, sortowanie malejąco po liczniku i \`TOP 1\`. Pamiętaj o możliwym remisie – obejrzyj kilka pierwszych wierszy.
      `,
    },
    {
      title: 'HAVING – warunek dla grup',
      body: md`
        \`WHERE\` filtruje **wiersze przed** grupowaniem, \`HAVING\` – **grupy po** grupowaniu (więc może używać funkcji agregujących).

        Uczniowie, którzy mają co najmniej trzy oceny 5 lub 6:

        ~~~sql run
        SELECT id_ucznia, COUNT(*) AS dobrych
        FROM oceny
        WHERE ocena >= 5
        GROUP BY id_ucznia
        HAVING COUNT(*) >= 3;
        ~~~

        Kolejność działań w zapytaniu: \`FROM\` → \`WHERE\` (które wiersze) → \`GROUP BY\` (w jakie grupy) → \`HAVING\` (które grupy) → \`SELECT\` (co pokazać) → \`ORDER BY\` (w jakiej kolejności).

        > **Uwaga:** Warunek na pojedynczy wiersz (np. \`ocena >= 5\`) piszesz w \`WHERE\`. Warunek na całą grupę (np. \`COUNT(*) >= 3\`, \`AVG(ocena) > 4\`) – w \`HAVING\`. Funkcja agregująca w \`WHERE\` to błąd.
      `,
    },
    {
      title: 'Liczenie różnych wartości',
      body: md`
        „Ilu **różnych** uczniów ma jakąkolwiek ocenę?” – \`COUNT(*)\` policzyłby oceny, a nie uczniów. W SQLite i MySQL jest \`COUNT(DISTINCT id_ucznia)\`, ale **Access go nie ma**. Uniwersalny sposób: najpierw lista różnych wartości (podzapytanie z \`DISTINCT\`), potem jej długość:

        ~~~sql run
        SELECT COUNT(*) AS uczniow_z_ocenami
        FROM (SELECT DISTINCT id_ucznia FROM oceny);
        ~~~

        Zapytanie w nawiasie tworzy tymczasową tabelę 18 różnych identyfikatorów, a zewnętrzne zapytanie liczy jej wiersze. (W Accessie podzapytanie w \`FROM\` też działa; więcej o podzapytaniach w lekcji 5.)

        > **Na maturze:** Słowo „różnych” w pytaniu (różnych klientów, różnych sklepów, różnych krajów) to sygnał, że trzeba liczyć unikalne wartości, a nie wiersze.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Chcesz pokazać tylko te klasy, w których średnia ocen uczniów przekracza 4. Gdzie wpisać warunek \`AVG(ocena) > 4\`?`,
      options: ['w HAVING', 'w WHERE', 'w ORDER BY', 'w SELECT'],
      answer: 0,
      explain: md`Średnia dotyczy całej grupy, więc warunek idzie do \`HAVING\` (po \`GROUP BY\`). W \`WHERE\` nie wolno używać funkcji agregujących – \`WHERE\` działa na pojedyncze wiersze przed grupowaniem.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`COUNT(*)` liczy wiersze, a `COUNT(pole)` – wiersze z niepustą wartością tego pola.', answer: true },
        { text: 'W Accessie można napisać `COUNT(DISTINCT pole)`.', answer: false },
        { text: 'W zapytaniu z `GROUP BY klasa` można w `SELECT` wypisać `klasa` i `COUNT(*)`.', answer: true },
        { text: '`WHERE` filtruje grupy po grupowaniu.', answer: false },
      ],
      explain: md`
        - Tak.
        - Nie – w Accessie liczy się różne wartości przez podzapytanie z \`DISTINCT\`.
        - Tak – \`klasa\` jest polem grupowania, \`COUNT(*)\` agregatem.
        - Nie – to robi \`HAVING\`; \`WHERE\` filtruje wiersze przed grupowaniem.
      `,
    },
    {
      type: 'input',
      q: md`Ilu **różnych** uczniów ma w bazie co najmniej jedną ocenę? Sprawdź zapytaniem.`,
      answer: '18',
      explain: md`\`SELECT COUNT(*) FROM (SELECT DISTINCT id_ucznia FROM oceny);\` daje 18 – dwoje z 20 uczniów nie ma jeszcze ocen.`,
    },
    {
      type: 'sql',
      q: md`Dla każdego miasta podaj **nazwę miasta** i **liczbę uczniów**, którzy w nim mieszkają.`,
      solution: 'SELECT miasto, COUNT(*) FROM uczniowie GROUP BY miasto;',
      explain: md`
        ~~~sql
        SELECT miasto, COUNT(*) AS ile
        FROM uczniowie
        GROUP BY miasto;
        ~~~
      `,
    },
    {
      type: 'sql',
      q: md`Dla każdego przedmiotu (\`id_przedmiotu\`) podaj **liczbę ocen** i **średnią ocen zaokrągloną do dwóch miejsc** po przecinku.`,
      solution: 'SELECT id_przedmiotu, COUNT(*), ROUND(AVG(ocena), 2) FROM oceny GROUP BY id_przedmiotu;',
      explain: md`
        ~~~sql
        SELECT id_przedmiotu, COUNT(*) AS ile, ROUND(AVG(ocena), 2) AS srednia
        FROM oceny
        GROUP BY id_przedmiotu;
        ~~~
        Historia (\`id_przedmiotu = 6\`) nie ma ocen, więc nie pojawi się w wyniku – grupy powstają tylko z istniejących wierszy.
      `,
    },
    {
      type: 'sql',
      q: md`Podaj \`id_ucznia\` i **średnią ocen** (zaokrągloną do dwóch miejsc) tych uczniów, których średnia wynosi **co najmniej 4,5**.`,
      solution: 'SELECT id_ucznia, ROUND(AVG(ocena), 2) FROM oceny GROUP BY id_ucznia HAVING AVG(ocena) >= 4.5;',
      explain: md`
        ~~~sql
        SELECT id_ucznia, ROUND(AVG(ocena), 2) AS srednia
        FROM oceny
        GROUP BY id_ucznia
        HAVING AVG(ocena) >= 4.5;
        ~~~
        Warunek na średnią grupy – w \`HAVING\`. Liczba 4,5 w SQL zapisuje się z kropką: \`4.5\`.
      `,
    },
  ],
  practice: ['2023-czerwiec/7.1', '2024-czerwiec/8.1', '2023-maj/7.1', '2023-maj/7.2', '2026-czerwiec/8.1', '2026-maj/8.3'],
};
