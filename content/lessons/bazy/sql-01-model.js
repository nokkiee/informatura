import { md } from '../lib.js';
import db from './db.js';

export default {
  title: 'Relacyjna baza danych',
  summary: 'Tabele, rekordy i pola, typy danych, klucz główny i obcy, relacje jeden do wielu i wiele do wielu, pierwsze zapytanie SELECT.',
  minutes: 25,
  db,
  intro: md`
    - czym jest relacyjna baza danych i po co dzielić dane na kilka tabel,
    - tabela, rekord, pole i typ danych,
    - klucz główny, klucz obcy i relacje między tabelami,
    - jak wygląda najprostsze zapytanie SQL,
    - jak to wszystko wygląda w zadaniu maturalnym.
  `,
  steps: [
    {
      title: 'Tabele, rekordy, pola',
      body: md`
        **Baza danych** przechowuje dane w **tabelach**. Każdy wiersz tabeli to **rekord** (np. jeden uczeń), a każda kolumna to **pole** (np. nazwisko). Pole ma **typ**: liczba całkowita, liczba rzeczywista, tekst, data, wartość logiczna (prawda/fałsz).

        We wszystkich lekcjach tego działu używamy małej bazy szkoły. Ma cztery tabele:

        ~~~db
        ~~~

        Każdy przykład SQL w lekcjach możesz od razu **wykonać** na tej bazie – przycisk **Wykonaj** pokaże wynik pod zapytaniem. Zobacz, co jest w tabeli \`uczniowie\`:

        ~~~sql run
        SELECT * FROM uczniowie;
        ~~~

        > **Na maturze:** Dane do zadania z bazy danych dostajesz w kilku plikach tekstowych – każdy plik to jedna tabela, a pierwszy wiersz pliku zawiera nazwy pól. Importujesz je do programu bazodanowego (np. Access), ustawiasz typy pól i klucze, a potem piszesz zapytania. W Informaturze tabele są już zaimportowane – od razu piszesz SQL.
      `,
    },
    {
      title: 'Klucze i relacje',
      body: md`
        **Klucz główny** (podstawowy) to pole, którego wartość jednoznacznie wskazuje rekord – nie może się powtarzać. W naszej bazie: \`id_ucznia\` w tabeli \`uczniowie\`, \`id_przedmiotu\` w \`przedmioty\` itd. Imię i nazwisko się do tego nie nadają: w bazie są dwie osoby o nazwisku Nowak.

        **Klucz obcy** to pole, które przechowuje wartość klucza głównego **innej** tabeli – w ten sposób rekordy się ze sobą łączą. W tabeli \`oceny\` pole \`id_ucznia\` mówi, czyja to ocena, a \`id_przedmiotu\` – z jakiego przedmiotu.

        Rodzaje **relacji** między tabelami:
        - **jeden do wielu (1:n)** – jeden uczeń ma wiele ocen, ale każda ocena należy do jednego ucznia. To najczęstsza relacja; klucz obcy jest po stronie „wielu” (\`oceny.id_ucznia\`).
        - **wiele do wielu (n:m)** – uczeń ma oceny z wielu przedmiotów, a z przedmiotu oceny ma wielu uczniów. Taką relację zapisuje się przez **tabelę pośredniczącą** z dwoma kluczami obcymi – tu jest nią \`oceny\`.
        - **jeden do jednego (1:1)** – np. uczeń i jego legitymacja; rzadko spotykana.

        ### Po co kilka tabel?
        Gdyby każda ocena zawierała pełne dane ucznia i nauczyciela, te same informacje powtarzałyby się dziesiątki razy. Zmiana nazwiska nauczyciela wymagałaby poprawienia każdej oceny – a jedna przeoczona dawałaby sprzeczne dane. Podział na tabele połączone kluczami (tzw. **normalizacja**) sprawia, że każdą informację zapisuje się **raz**.

        ~~~sql run
        SELECT * FROM oceny;
        ~~~
      `,
    },
    {
      title: 'Pierwsze zapytanie',
      body: md`
        **SQL** to język zapytań do baz danych. Podstawowe zapytanie wybiera dane z tabeli:

        ~~~sql run
        SELECT imie, nazwisko, klasa
        FROM uczniowie;
        ~~~

        - \`SELECT\` – **jakie pola** chcesz zobaczyć (oddzielone przecinkami; \`*\` oznacza wszystkie),
        - \`FROM\` – **z której tabeli**,
        - średnik kończy zapytanie.

        Słowa kluczowe (\`SELECT\`, \`FROM\`) można pisać małymi literami – zwyczajowo pisze się je wielkimi, żeby odróżnić je od nazw pól. Zapytanie może zajmować kilka wierszy.

        Wynik zapytania to też **tabela** – i to jest najważniejsza idea SQL: z tabel robimy nowe tabele, wybierając wiersze, kolumny, łącząc i grupując. Kolejne lekcje pokażą każdą z tych operacji.

        > **Uwaga:** Tekst w zapytaniu zapisuje się w apostrofach: \`'Torun'\`. Access akceptuje też cudzysłów \`"Torun"\`. Nazwy pól i tabel – bez cudzysłowów (chyba że zawierają spację; wtedy w Accessie piszesz je w nawiasach kwadratowych \`[data urodzenia]\`).
      `,
    },
    {
      title: 'Zapytanie a zadanie maturalne',
      body: md`
        Zadania z baz danych na maturze mają dwa rodzaje poleceń:

        1. **„Podaj…” / „Utwórz zestawienie…”** – pisz zapytanie, uruchom je i zapisz **wynik** (liczbę, listę) w pliku z odpowiedziami. Ocenia się wynik, ale do rozwiązania dołącza się też zapytanie (zrzut ekranu albo zapis SQL – według instrukcji w arkuszu).
        2. **„Zapisz zapytanie w języku SQL…”** – oceniany jest sam **zapis** zapytania, często do tabel dodanych w treści zadania (np. nowej tabeli z producentami). Tu trzeba bezbłędnie znać składnię.

        W Informaturze zadania pierwszego typu mają pole „Odpowiedź”, do którego trafia wynik zapytania, a drugiego – edytor, w którym zapytanie sprawdzisz na pustych tabelach (czy się wykonuje) i porównasz z rozwiązaniem.

        > **Na maturze:** Zanim zaczniesz pisać zapytania, obejrzyj każdą tabelę (\`SELECT * FROM …\`) i ustal, które pola łączą tabele. Pięć minut na zrozumienie danych oszczędza dużo pomyłek.
      `,
    },
  ],
  quiz: [
    {
      type: 'choice',
      q: md`Czym jest **klucz główny** tabeli?`,
      options: [
        'polem (lub zestawem pól), którego wartość jednoznacznie identyfikuje rekord',
        'polem, które przechowuje klucz innej tabeli',
        'pierwszym polem tabeli',
        'najważniejszym rekordem tabeli',
      ],
      answer: 0,
      explain: md`Wartości klucza głównego nie mogą się powtarzać – po nich odróżnia się rekordy. Pole przechowujące klucz innej tabeli to **klucz obcy**. Klucz główny nie musi być pierwszym polem, choć zwykle jest.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań o bazie szkoły z tej lekcji.`,
      items: [
        { text: 'Pole `id_ucznia` w tabeli `oceny` jest kluczem obcym.', answer: true },
        { text: 'Między tabelami `uczniowie` i `oceny` jest relacja jeden do wielu.', answer: true },
        { text: 'Pole `nazwisko` nadaje się na klucz główny tabeli `uczniowie`.', answer: false },
        { text: 'Rekord to jedna kolumna tabeli.', answer: false },
      ],
      explain: md`
        - Tak – wskazuje rekord z tabeli \`uczniowie\`.
        - Tak – jeden uczeń, wiele ocen.
        - Nie – nazwiska się powtarzają (np. dwie osoby o nazwisku Nowak).
        - Nie – rekord to **wiersz**; kolumna to pole.
      `,
    },
    {
      type: 'choice',
      q: md`Relację **wiele do wielu** między uczniami a przedmiotami realizuje w naszej bazie:`,
      options: ['tabela `oceny` z kluczami obcymi `id_ucznia` i `id_przedmiotu`', 'pole `id_przedmiotu` w tabeli `uczniowie`', 'tabela `nauczyciele`', 'klucz główny `id_oceny`'],
      answer: 0,
      explain: md`Relację n:m zapisuje się tabelą pośredniczącą, która ma klucze obce do obu tabel. Każdy rekord \`oceny\` łączy jednego ucznia z jednym przedmiotem.`,
    },
    {
      type: 'input',
      q: md`Ile rekordów ma tabela \`przedmioty\`? Sprawdź zapytaniem w edytorze poniżej albo w przykładach w lekcji.`,
      answer: '6',
      explain: md`\`SELECT * FROM przedmioty;\` zwraca 6 wierszy: matematyka, informatyka, fizyka, polski, angielski, historia.`,
    },
    {
      type: 'sql',
      q: md`Napisz zapytanie, które wypisze **imię, nazwisko i miasto** wszystkich uczniów.`,
      solution: 'SELECT imie, nazwisko, miasto FROM uczniowie;',
      explain: md`
        ~~~sql
        SELECT imie, nazwisko, miasto
        FROM uczniowie;
        ~~~
        Kolejność pól w wyniku nie ma znaczenia przy sprawdzaniu, ale pól musi być dokładnie trzy.
      `,
    },
    {
      type: 'sql',
      q: md`Napisz zapytanie, które wypisze **wszystkie pola** tabeli \`nauczyciele\`.`,
      solution: 'SELECT * FROM nauczyciele;',
      explain: md`\`*\` zamiast listy pól oznacza wszystkie pola tabeli: \`SELECT * FROM nauczyciele;\``,
    },
  ],
  practice: ['2023-maj/7.1', '2024-maj/8.1', '2025-maj/7.1', '2026-maj/8.1'],
};
