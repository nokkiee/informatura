// Hints for the June 2024 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2024-czerwiec come after
// these, revealed line by line in the editor. Spreadsheet formulas were checked with
// tools/sheet-eval.mjs.
export default {
  '1.1': [
    `Zamień 179 na system dwójkowy i wpisuj cyfry wierszami, od lewej do prawej.`,
    `179 = 10110011<sub>2</sub> – to 8 cyfr. Tablica ma 4 · 5 = 20 pól, więc po ósmym polu zaczynasz znowu od pierwszej cyfry: 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, …`,
  ],
  '1.2': [
    `Nie musisz wypełniać całej tablicy. Wystarczy wiedzieć, ile cyfr ma zapis binarny *n* i która z nich trafi do ostatniego, (*w* · *k*)-tego pola.`,
    `Długość zapisu *d* policzysz, dzieląc kopię *n* przez 2, aż dojdziesz do 0. Pole numer *w* · *k* zawiera cyfrę o numerze (*w* · *k* – 1) mod *d*, licząc od lewej od zera.`,
    `Cyfrę o numerze *p* (od lewej, od zera) wyciągniesz, dzieląc *n* przez 2 dokładnie *d* – 1 – *p* razy i biorąc resztę z dzielenia przez 2.`,
  ],
  '2.1': [
    `Każde wywołanie z *x* > 0 dodaje 2 i wywołuje *F*(*x* div 2) – aż do *x* = 0.`,
    `Wynik to 2 razy liczba wywołań z *x* > 0, czyli 2 razy liczba cyfr zapisu binarnego *x*. Liczba wywołań jest o 1 większa (dochodzi wywołanie *F*(0)).`,
    `16 = 10000<sub>2</sub> ma 5 cyfr, więc *F*(16) = 10, a wywołań jest 6.`,
  ],
  '2.2': [
    `*F*(*x*) = 18 oznacza 9 wywołań z *x* > 0 – czyli zapis binarny *x* ma dokładnie 9 cyfr.`,
    `Najmniejsza 9-cyfrowa liczba binarna to 100000000<sub>2</sub>, a największa – 111111111<sub>2</sub>. Zamień je na system dziesiętny.`,
  ],
  '3.1': [
    `Szukasz trzech kolejnych liter, z których pierwsza to „k”, a trzecia to „t” – środkowa może być dowolna.`,
    `Dla każdego słowa sprawdź pozycje *i* = 0, …, długość – 3: czy słowo[*i*] = "k" i słowo[*i* + 2] = "t". Słowo liczysz raz, nawet jeśli fragment występuje w nim kilka razy, i pamiętaj o fragmentach na samym początku i końcu słowa.`,
  ],
  '3.2': [
    `Dla każdego słowa zakoduj je ROT13, odwróć oryginał i porównaj oba napisy.`,
    `ROT13 litery: (numer litery w alfabecie + 13) mod 26. W Pythonie \`chr((ord(c) - ord("a") + 13) % 26 + ord("a"))\`, w C++ i Javie podobnie na typie char. Słowo odwrócisz przez \`s[::-1]\` (Python), \`reverse\` (C++) albo \`StringBuilder.reverse()\` (Java).`,
  ],
  '3.3': [
    `Dla każdego słowa znajdź literę, która występuje w nim najczęściej, i porównaj liczbę jej wystąpień z długością słowa.`,
    `Zlicz litery w tablicy 26 liczników. Warunek „co najmniej połowa pozycji” zapisz bez dzielenia: 2 · największa liczba wystąpień ≥ długość słowa – dzielenie całkowite zgubiłoby słowa o nieparzystej długości.`,
  ],
  '4.1': [
    `Po każdej rundzie pakiet przechodzi do odbiorcy komputera, w którym właśnie jest.`,
    `Wiersz rundy *r* + 1 wyliczysz z wiersza rundy *r*: jeśli pakiet był w komputerze *c*, to teraz jest w odbiorcy *c*. Pakiet 1 w 1. rundzie jest w komputerze 3, a odbiorcą komputera 3 jest 6 – w 2. rundzie pakiet 1 jest więc w komputerze 6.`,
  ],
  '4.2': [
    `Komputer nie jest odbiorcą, jeśli jego numeru nie ma w żadnym wierszu pliku.`,
    `Zaznacz w tablicy wartości logicznych (albo zbiorze) wszystkie numery z pliku i policz komputery, których nie zaznaczono.`,
  ],
  '4.3': [
    `Symuluj rundy: trzymaj w tablicy położenie każdego pakietu i po każdej rundzie przesuń każdy pakiet do odbiorcy komputera, w którym jest.`,
    `Po każdej rundzie sprawdź pakiety po kolei, od numeru 1: pierwszy, który stoi w komputerze o swoim numerze, to szukany pakiet, a numer tej rundy to szukana runda.`,
  ],
  '4.4': [
    `Ta sama symulacja co w 4.3 – po rundach 1, 2, 4 i 8 policz, ile pakietów jest w każdym komputerze.`,
    `Po wybranej rundzie zrób tablicę liczników: dla każdego pakietu zwiększ licznik komputera, w którym się znajduje. Wypisz największy licznik.`,
  ],
  '5': [
    `Zastanów się, kiedy według polskiego prawa powstaje ochrona utworu i co uznaje się za utwór.`,
    `Prawa autorskie przysługują twórcy z chwilą ustalenia utworu, bez żadnej rejestracji ani zastrzeżeń. Programy komputerowe są w ustawie o prawie autorskim wprost wymienione jako utwory.`,
  ],
  '6': [
    `Dodawaj i odejmuj pisemnie, kolumna po kolumnie, pamiętając, że przeniesienie (i pożyczka) dotyczy podstawy systemu – 5 albo 6, a nie 10.`,
    `Albo przez system dziesiętny: 203<sub>5</sub> = 53, 4401<sub>5</sub> = 601, 4541<sub>6</sub> = 1069, 2455<sub>6</sub> = 611. Policz sumę i różnicę, a wyniki zamień z powrotem na system o podstawie 5 i 6.`,
  ],
  '7.1': [
    `Potrzebujesz sumy przyjazdów w każdym miesiącu – to zadanie na tabelę przestawną albo na funkcję SUMA.JEŻELI.`,
    `Tabela przestawna: wiersze – data pogrupowana po miesiącach, wartości – suma kolumny *przyjechali*. Bez niej: kolumna =MIESIĄC(A2) i =SUMA.JEŻELI($D$2:$D$366;1;$B$2:$B$366) dla stycznia.`,
    `Wykres kolumnowy zrób z gotowego zestawienia: na osi X miesiące, na osi Y liczba kuracjuszy. Dodaj tytuł i opisy osi.`,
  ],
  '7.2': [
    `Policz, ilu kuracjuszy jest w uzdrowisku na koniec każdego dnia – to suma narastająca, zaczynająca się od 10 000.`,
    `W D2 wpisz =10000+B2-C2, a w D3 =D2+B3-C3 i przeciągnij w dół.`,
    `Pierwszy dzień powyżej 11 000: kolumna =JEŻELI(D2>11000;1;0) i =INDEKS(A2:A366;PODAJ.POZYCJĘ(1;E2:E366;0)). Dzień z maksimum: =INDEKS(A2:A366;PODAJ.POZYCJĘ(MAKS(D2:D366);D2:D366;0)).`,
  ],
  '7.3': [
    `To symulacja dzień po dniu: liczba kuracjuszy z zadania 7.2 wyznacza zapotrzebowanie na wodę, a od niego zależy, czy butelek przybywa, czy ubywa.`,
    `Zapotrzebowanie to 0,4 · liczba kuracjuszy. Jeśli źródło (3900 l) wystarcza, nadwyżka trafia do butelek: przybywa ZAOKR.DÓŁ((3900 – zapotrzebowanie)/5; 0) butelek. Jeśli nie, trzeba otworzyć ZAOKR.GÓRA((zapotrzebowanie – 3900)/5; 0) butelek – a gdy jest ich za mało, tego dnia brakuje wody i magazyn się opróżnia.`,
    `Początkową liczbę butelek wpisz w jedną komórkę (np. H1 = 120), stan magazynu licz w kolumnie F, a dzień z brakiem oznacz 1 w kolumnie G, np. =JEŻELI(ORAZ(E3>3900;ZAOKR.GÓRA((E3-3900)/5;0)>F2);1;0). W c) zwiększaj H1, aż suma kolumny G spadnie do 0.`,
  ],
  '8.1': [
    `Każdy wiersz tabeli wizyty to jedna podana dawka – wystarczy policzyć wiersze dla każdej szczepionki.`,
    `\`GROUP BY kod_szczepionki\`, \`COUNT(*)\` i \`ORDER BY\` liczba dawek malejąco (\`DESC\`).`,
  ],
  '8.2': [
    `Liczysz różnych pacjentów (\`COUNT(DISTINCT pesel)\`), a nie wizyty – jeden pacjent mógł przyjąć kilka dawek.`,
    `Przedostatnia cyfra PESEL to znak numer 10: \`SUBSTR(pesel, 10, 1)\` (w Accessie \`Mid\`). Kobiety policzysz np. \`COUNT(DISTINCT CASE WHEN SUBSTR(pesel, 10, 1) IN ('0','2','4','6','8') THEN pesel END)\`.`,
  ],
  '8.3': [
    `Osoba kończy szczepienie wtedy, gdy przyjmuje dawkę o numerze równym liczbie dawek rekomendowanej dla tej szczepionki.`,
    `Połącz wizyty ze szczepionkami, zostaw wiersze z \`numer_dawki = liczba_dawek\`, pogrupuj po roku i miesiącu daty (\`YEAR\`, \`MONTH\`) i weź grupę z największą liczbą wierszy.`,
  ],
  '8.4': [
    `Potrzebujesz trzech tabel naraz: województwa pacjenta (PACJENCI) i województwa punktu (PUNKT_SZCZEPIEN), połączonych przez WIZYTY.`,
    `\`JOIN\` PACJENCI z WIZYTY po \`pesel\`, potem z PUNKT_SZCZEPIEN po \`kod_punktu\`, i warunek \`WHERE wojewodztwo_pacjenta <> wojewodztwo_punktu\`.`,
  ],
};
