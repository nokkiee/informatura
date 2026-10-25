import { md } from '../lib.js';
import db from './db.js';

export default {
  db,
  questions: [
    {
      lesson: 'sql-01-model',
      type: 'choice',
      q: md`W tabeli \`oceny\` pole \`id_przedmiotu\` przechowuje identyfikator przedmiotu z tabeli \`przedmioty\`. Czym jest to pole w tabeli \`oceny\`?`,
      options: ['kluczem obcym', 'kluczem głównym', 'polem obliczanym', 'indeksem tekstowym'],
      answer: 0,
      explain: md`Pole wskazujące klucz główny innej tabeli to klucz obcy. Kluczem głównym tabeli \`oceny\` jest \`id_oceny\`.`,
    },
    {
      lesson: 'sql-01-model',
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: 'Relację wiele do wielu zapisuje się za pomocą tabeli pośredniczącej z dwoma kluczami obcymi.', answer: true },
        { text: 'Wartości klucza głównego mogą się powtarzać, jeśli rekordy różnią się innymi polami.', answer: false },
        { text: 'Jeden nauczyciel może uczyć kilku przedmiotów – to relacja jeden do wielu.', answer: true },
      ],
      explain: md`Klucz główny jednoznacznie wskazuje rekord, więc jego wartości nie mogą się powtarzać.`,
    },
    {
      lesson: 'sql-02-select',
      type: 'input',
      q: md`Ilu uczniów klasy **2A** mieszka w Krakowie (\`miasto = 'Krakow'\`)? Policz zapytaniem.`,
      answer: '2',
      explain: md`\`SELECT COUNT(*) FROM uczniowie WHERE klasa = '2A' AND miasto = 'Krakow';\` – to Iga Baran i Jan Kowalczyk.`,
    },
    {
      lesson: 'sql-02-select',
      type: 'choice',
      q: md`Do którego nazwiska pasuje wzorzec \`LIKE '%ow%'\`?`,
      options: ['Kowalski', 'Wrona', 'Baran', 'Dudek'],
      answer: 0,
      explain: md`\`%ow%\` – nazwisko zawiera fragment *ow* w dowolnym miejscu: K**ow**alski. *Wrona* ma *ro* i *on*, ale nie *ow*. Sprawdź wszystkie pasujące nazwiska zapytaniem \`SELECT nazwisko FROM uczniowie WHERE nazwisko LIKE '%ow%';\` – pasuje też np. *Sowa*.`,
    },
    {
      lesson: 'sql-03-grupowanie',
      type: 'choice',
      q: md`W jakiej kolejności baza wykonuje części zapytania z grupowaniem?`,
      options: ['FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY', 'SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY', 'FROM, GROUP BY, WHERE, HAVING, ORDER BY, SELECT', 'WHERE, FROM, HAVING, GROUP BY, SELECT, ORDER BY'],
      answer: 0,
      explain: md`Najpierw tabele (\`FROM\`), wybór wierszy (\`WHERE\`), podział na grupy (\`GROUP BY\`), wybór grup (\`HAVING\`), obliczenie pól wyniku (\`SELECT\`) i na końcu sortowanie (\`ORDER BY\`). Dlatego w \`WHERE\` nie ma jeszcze grup, a w \`ORDER BY\` można użyć aliasów z \`SELECT\`.`,
    },
    {
      lesson: 'sql-03-grupowanie',
      type: 'input',
      q: md`Ile ocen **4** jest w tabeli \`oceny\`?`,
      answer: '31',
      explain: md`\`SELECT COUNT(*) FROM oceny WHERE ocena = 4;\``,
    },
    {
      lesson: 'sql-04-join',
      type: 'choice',
      q: md`Zapytanie \`SELECT p.nazwa, COUNT(o.id_oceny) FROM przedmioty AS p LEFT JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu GROUP BY p.nazwa\` zwraca dla historii (brak ocen):`,
      options: ['wiersz z liczbą 0', 'wiersz z liczbą 1', 'nic – historii nie ma w wyniku', 'błąd'],
      answer: 0,
      explain: md`\`LEFT JOIN\` zachowuje historię z pustymi polami z tabeli \`oceny\`, a \`COUNT(o.id_oceny)\` pomija puste wartości – daje 0. (\`COUNT(*)\` dałoby 1.)`,
    },
    {
      lesson: 'sql-05-funkcje-podzapytania',
      type: 'input',
      q: md`Co zwróci \`LEFT('Kaczmarek', 3)\`?`,
      answer: ['Kac'],
      exact: true,
      explain: md`Trzy pierwsze znaki: K-a-c.`,
    },
    {
      lesson: 'sql-05-funkcje-podzapytania',
      type: 'choice',
      q: md`Jak znaleźć uczniów, którzy **nie** mają żadnej oceny z fizyki (\`id_przedmiotu = 3\`)?`,
      options: [
        '`WHERE id_ucznia NOT IN (SELECT id_ucznia FROM oceny WHERE id_przedmiotu = 3)`',
        '`INNER JOIN oceny … WHERE id_przedmiotu <> 3`',
        '`WHERE id_ucznia IN (SELECT id_ucznia FROM oceny WHERE id_przedmiotu <> 3)`',
        '`GROUP BY id_ucznia HAVING id_przedmiotu <> 3`',
      ],
      answer: 0,
      explain: md`Lista uczniów z oceną z fizyki w podzapytaniu, a \`NOT IN\` zostawia resztę. Pozostałe zapytania zwracają uczniów, którzy mają jakąś ocenę z **innego** przedmiotu – także tych, którzy mają też ocenę z fizyki.`,
    },
    {
      lesson: 'sql-06-matura',
      type: 'input',
      q: md`Ile wierszy zwróci \`SELECT * FROM oceny, przedmioty;\` (91 ocen, 6 przedmiotów, bez warunku łączenia)?`,
      answer: '546',
      explain: md`Iloczyn kartezjański: 91 · 6 = 546 wierszy – każda ocena z każdym przedmiotem.`,
    },
    {
      lesson: 'sql-03-grupowanie',
      type: 'sql',
      q: md`Dla każdej **oceny** (wartości od 1 do 6) podaj, **ile razy** została wystawiona.`,
      solution: 'SELECT ocena, COUNT(*) FROM oceny GROUP BY ocena;',
      explain: md`\`SELECT ocena, COUNT(*) FROM oceny GROUP BY ocena;\``,
    },
    {
      lesson: 'sql-04-join',
      type: 'sql',
      q: md`Podaj **nazwy przedmiotów** (bez powtórzeń), z których **Natan Bielak** ma oceny.`,
      solution: "SELECT DISTINCT p.nazwa FROM (przedmioty AS p INNER JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu) INNER JOIN uczniowie AS u ON u.id_ucznia = o.id_ucznia WHERE u.imie = 'Natan' AND u.nazwisko = 'Bielak';",
      explain: md`
        Trzy tabele: nazwa przedmiotu, oceny i dane ucznia. \`DISTINCT\` usuwa powtórzenia (uczeń ma kilka ocen z tego samego przedmiotu):
        ~~~sql
        SELECT DISTINCT p.nazwa
        FROM (przedmioty AS p INNER JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu)
             INNER JOIN uczniowie AS u ON u.id_ucznia = o.id_ucznia
        WHERE u.imie = 'Natan' AND u.nazwisko = 'Bielak';
        ~~~
      `,
    },
    {
      lesson: 'sql-05-funkcje-podzapytania',
      type: 'sql',
      q: md`Podaj **imiona i nazwiska** uczniów urodzonych w **2008** roku, którzy mają co najmniej jedną ocenę z **fizyki** (\`id_przedmiotu = 3\`). Każdy uczeń ma się pojawić raz.`,
      solution: 'SELECT imie, nazwisko FROM uczniowie WHERE YEAR(data_urodzenia) = 2008 AND id_ucznia IN (SELECT id_ucznia FROM oceny WHERE id_przedmiotu = 3);',
      explain: md`
        ~~~sql
        SELECT imie, nazwisko
        FROM uczniowie
        WHERE YEAR(data_urodzenia) = 2008
          AND id_ucznia IN (SELECT id_ucznia FROM oceny WHERE id_przedmiotu = 3);
        ~~~
        Podzapytanie z \`IN\` od razu daje każdego ucznia raz. Przy złączeniu z \`oceny\` trzeba by dopisać \`DISTINCT\`.
      `,
    },
    {
      lesson: 'sql-06-matura',
      type: 'sql',
      q: md`Podaj **nazwy przedmiotów** i **średnie ocen** z nich (zaokrąglone do dwóch miejsc), ale tylko dla przedmiotów, z których wystawiono **co najmniej 10 ocen**.`,
      solution: 'SELECT p.nazwa, ROUND(AVG(o.ocena), 2) FROM przedmioty AS p INNER JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu GROUP BY p.nazwa HAVING COUNT(*) >= 10;',
      explain: md`
        ~~~sql
        SELECT p.nazwa, ROUND(AVG(o.ocena), 2) AS srednia
        FROM przedmioty AS p INNER JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu
        GROUP BY p.nazwa
        HAVING COUNT(*) >= 10;
        ~~~
        Złączenie dla nazwy, grupowanie po przedmiocie, warunek na liczbę ocen w grupie – w \`HAVING\`.
      `,
    },
  ],
};
