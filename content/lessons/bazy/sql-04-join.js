import { md } from '../lib.js';
import db from './db.js';

export default {
  title: 'Łączenie tabel: JOIN',
  summary: 'INNER JOIN po kluczach, aliasy tabel, łączenie trzech tabel (zapis Accessa), LEFT JOIN i szukanie rekordów bez pary.',
  minutes: 35,
  db,
  intro: md`
    - jak połączyć dwie tabele po kluczu (\`INNER JOIN … ON …\`),
    - po co aliasy tabel i kiedy trzeba pisać \`tabela.pole\`,
    - jak łączyć trzy tabele – także w zapisie, którego wymaga Access,
    - czym różni się \`LEFT JOIN\` od \`INNER JOIN\` i jak znaleźć rekordy „bez pary”.
  `,
  steps: [
    {
      title: 'INNER JOIN',
      body: md`
        W tabeli \`oceny\` jest tylko \`id_ucznia\`. Żeby zobaczyć **imię i nazwisko** przy ocenie, trzeba połączyć tabele \`oceny\` i \`uczniowie\` – dla każdej oceny dobrać ucznia o tym samym \`id_ucznia\`:

        ~~~sql run
        SELECT uczniowie.imie, uczniowie.nazwisko, oceny.ocena, oceny.data
        FROM uczniowie INNER JOIN oceny ON uczniowie.id_ucznia = oceny.id_ucznia
        WHERE oceny.ocena = 6;
        ~~~

        - \`A INNER JOIN B ON warunek\` – utwórz pary wierszy (wiersz z A, wiersz z B), dla których warunek jest prawdziwy. Prawie zawsze warunkiem jest równość **klucza obcego** i **klucza głównego**.
        - Pole \`id_ucznia\` jest w obu tabelach, więc trzeba wskazać, z której: \`uczniowie.id_ucznia\`. Pola występujące tylko w jednej tabeli (np. \`ocena\`) można pisać bez nazwy tabeli, ale z nią zapytanie jest czytelniejsze.

        **Wiersze bez pary znikają:** uczniowie bez ocen nie pojawią się w wyniku \`INNER JOIN\` – nie mają z czym się połączyć.

        > **Uwaga:** Access wymaga słów \`INNER JOIN\` (samo \`JOIN\` nie działa). Starszy zapis \`FROM uczniowie, oceny WHERE uczniowie.id_ucznia = oceny.id_ucznia\` daje to samo i też działa wszędzie.
      `,
    },
    {
      title: 'Aliasy i grupowanie po złączeniu',
      body: md`
        Długie nazwy tabel można skrócić **aliasem**: \`FROM uczniowie AS u\` – i dalej pisać \`u.imie\`. W Accessie przy aliasie tabeli też można pominąć \`AS\`.

        Złączenie łączy się z grupowaniem: *„dla każdego przedmiotu podaj jego nazwę i liczbę ocen”* – nazwa jest w \`przedmioty\`, oceny w \`oceny\`:

        ~~~sql run
        SELECT p.nazwa, COUNT(*) AS ile
        FROM przedmioty AS p INNER JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu
        GROUP BY p.nazwa
        ORDER BY ile DESC;
        ~~~

        Średnia ocen w każdej klasie – klasa jest w \`uczniowie\`, oceny w \`oceny\`:

        ~~~sql run
        SELECT u.klasa, ROUND(AVG(o.ocena), 2) AS srednia
        FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        GROUP BY u.klasa;
        ~~~

        > **Wskazówka:** Gdy grupujesz „po osobie”, grupuj po **kluczu** (\`u.id_ucznia\`), a nie po nazwisku – dwie różne osoby mogą mieć to samo nazwisko (w bazie są dwie osoby o nazwisku Nowak). W Accessie wtedy dopisz do \`GROUP BY\` także pola, które pokazujesz: \`GROUP BY u.id_ucznia, u.imie, u.nazwisko\`.
      `,
    },
    {
      title: 'Trzy tabele',
      body: md`
        Który nauczyciel wystawił najwięcej ocen? Ocena zna przedmiot, przedmiot zna nauczyciela – łańcuch \`nauczyciele → przedmioty → oceny\`:

        ~~~sql run
        SELECT n.imie, n.nazwisko, COUNT(*) AS ocen
        FROM (nauczyciele AS n INNER JOIN przedmioty AS p ON n.id_nauczyciela = p.id_nauczyciela)
             INNER JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu
        GROUP BY n.id_nauczyciela, n.imie, n.nazwisko
        ORDER BY ocen DESC;
        ~~~

        Access przy więcej niż dwóch tabelach wymaga **nawiasów** wokół wcześniejszych złączeń: \`(A INNER JOIN B ON …) INNER JOIN C ON …\`. SQLite akceptuje zapis z nawiasami i bez – pisz z nawiasami, wtedy zapytanie zadziała i tu, i w Accessie.

        Zwróć uwagę: Zofia Grabowska uczy historii, z której nie ma ocen – w wyniku jej nie ma.
      `,
    },
    {
      title: 'LEFT JOIN – także bez pary',
      body: md`
        \`LEFT JOIN\` zachowuje **wszystkie** wiersze lewej tabeli. Gdy wiersz nie ma pary, pola z prawej tabeli są puste (\`NULL\`). Liczba ocen dla **każdego** przedmiotu, także tych bez ocen:

        ~~~sql run
        SELECT p.nazwa, COUNT(o.id_oceny) AS ile
        FROM przedmioty AS p LEFT JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu
        GROUP BY p.nazwa;
        ~~~

        \`COUNT(o.id_oceny)\` liczy tylko niepuste wartości, więc historia dostaje 0. \`COUNT(*)\` dałoby 1 – liczyłoby też wiersz bez pary.

        **Rekordy bez pary** – uczniowie, którzy nie mają żadnej oceny:

        ~~~sql run
        SELECT u.imie, u.nazwisko
        FROM uczniowie AS u LEFT JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        WHERE o.id_oceny IS NULL;
        ~~~

        To bardzo częste pytanie maturalne („właściciele, którzy nie figurują w rejestrze”, „klienci, którzy nic nie kupili”). Drugi sposób – podzapytanie z \`NOT IN\` – jest w następnej lekcji.

        > **Uwaga:** Pusta wartość to \`NULL\`, a sprawdza się ją przez \`IS NULL\` / \`IS NOT NULL\`. Warunek \`= NULL\` nigdy nie jest prawdziwy!
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Dlaczego w zapytaniu łączącym \`uczniowie\` i \`oceny\` trzeba pisać \`uczniowie.id_ucznia\`, a nie samo \`id_ucznia\`?`,
      options: ['bo pole o tej nazwie jest w obu tabelach', 'bo Access wymaga nazwy tabeli przed każdym polem', 'bo id_ucznia jest kluczem obcym', 'nie trzeba – wynik będzie ten sam'],
      answer: 0,
      explain: md`Nazwa \`id_ucznia\` występuje w obu tabelach, więc bez wskazania tabeli jest niejednoznaczna – baza zgłosi błąd („niejednoznaczna nazwa pola”). Pól występujących w jednej tabeli nie trzeba poprzedzać jej nazwą.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`INNER JOIN` pomija wiersze, które nie mają pary w drugiej tabeli.', answer: true },
        { text: '`LEFT JOIN` zachowuje wszystkie wiersze prawej tabeli.', answer: false },
        { text: 'Warunek `WHERE pole = NULL` znajduje puste wartości.', answer: false },
        { text: 'W Accessie złączenie trzech tabel zapisuje się z nawiasami: `(A INNER JOIN B ON …) INNER JOIN C ON …`.', answer: true },
      ],
      explain: md`
        - Tak.
        - Nie – zachowuje wszystkie wiersze **lewej** tabeli.
        - Nie – porównanie z \`NULL\` nigdy nie jest prawdą; trzeba \`IS NULL\`.
        - Tak.
      `,
    },
    {
      type: 'input',
      q: md`Ile wierszy zwróci zapytanie \`SELECT p.nazwa FROM przedmioty AS p LEFT JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu WHERE o.id_oceny IS NULL;\`?`,
      answer: '1',
      explain: md`To przedmioty bez żadnej oceny – tylko historia.`,
    },
    {
      type: 'sql',
      q: md`Wypisz **imię i nazwisko ucznia** oraz **ocenę** dla wszystkich ocen **1** (niedostatecznych).`,
      solution: 'SELECT u.imie, u.nazwisko, o.ocena FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia WHERE o.ocena = 1;',
      explain: md`
        ~~~sql
        SELECT u.imie, u.nazwisko, o.ocena
        FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        WHERE o.ocena = 1;
        ~~~
      `,
    },
    {
      type: 'sql',
      q: md`Dla każdego **miasta** podaj, ile ocen **5 lub 6** dostali uczniowie, którzy w nim mieszkają.`,
      solution: 'SELECT u.miasto, COUNT(*) FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia WHERE o.ocena >= 5 GROUP BY u.miasto;',
      explain: md`
        Miasto jest w \`uczniowie\`, ocena w \`oceny\` – złączenie, warunek na wiersze w \`WHERE\`, grupowanie po mieście:
        ~~~sql
        SELECT u.miasto, COUNT(*) AS dobrych
        FROM uczniowie AS u INNER JOIN oceny AS o ON u.id_ucznia = o.id_ucznia
        WHERE o.ocena >= 5
        GROUP BY u.miasto;
        ~~~
      `,
    },
    {
      type: 'sql',
      q: md`Dla **każdego nauczyciela** (także takiego, którego przedmiotu nikt jeszcze nie oceniał) podaj jego **nazwisko** i **liczbę ocen** wystawionych z jego przedmiotów.`,
      solution: 'SELECT n.nazwisko, COUNT(o.id_oceny) FROM (nauczyciele AS n LEFT JOIN przedmioty AS p ON n.id_nauczyciela = p.id_nauczyciela) LEFT JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu GROUP BY n.id_nauczyciela, n.nazwisko;',
      explain: md`
        Trzy tabele i \`LEFT JOIN\`, żeby nie zgubić nauczycielki historii, a liczymy \`COUNT(o.id_oceny)\`, żeby wiersz bez oceny dał 0:
        ~~~sql
        SELECT n.nazwisko, COUNT(o.id_oceny) AS ocen
        FROM (nauczyciele AS n LEFT JOIN przedmioty AS p ON n.id_nauczyciela = p.id_nauczyciela)
             LEFT JOIN oceny AS o ON p.id_przedmiotu = o.id_przedmiotu
        GROUP BY n.id_nauczyciela, n.nazwisko;
        ~~~
      `,
    },
  ],
  practice: ['2024-maj/8.1', '2025-czerwiec/7.1', '2025-czerwiec/7.2', '2026-maj/8.1', '2023-czerwiec/7.2', '2024-maj/8.3'],
};
