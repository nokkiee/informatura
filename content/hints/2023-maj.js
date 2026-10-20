// Hints for the May 2023 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2023-maj come after these,
// revealed line by line in the editor.
export default {
  '1.1': [
    `Wstawiaj książki po kolei i za każdym razem zaczynaj od przegródki *B*[0, 1] – tak jak w przykładzie 2.`,
    `Mniejszy numer schodzi w lewo, do *B*[*i* + 1, 2*j* – 1], większy w prawo, do *B*[*i* + 1, 2*j*]. Na przykład 18 > 14, więc 18 trafia do *B*[1, 2].`,
    `Po wstawieniu 14, 18, 12 i 9: *B*[0, 1] = 14, *B*[1, 1] = 12, *B*[1, 2] = 18, *B*[2, 1] = 9. Liczba 20 jest większa od 14 i od 18, więc trafia do *B*[2, 4].`,
  ],
  '1.2': [
    `Pomyśl o dwóch skrajnych sposobach ustawienia książek: wszystkie w jednej „linii” albo półki zapełniane do pełna, zanim zacznie się następna.`,
    `Maksimum: każda kolejna książka ląduje na nowej półce (np. gdy numery rosną), więc *n* książek zajmuje *n* półek. Minimum: półki 0, 1, …, *k* – 1 mieszczą razem 1 + 2 + 4 + … + 2<sup>*k*–1</sup> = 2<sup>*k*</sup> – 1 książek.`,
    `Minimalna liczba półek to najmniejsze *k*, dla którego 2<sup>*k*</sup> – 1 ≥ *n*. Dla *n* = 7 jest to 3 (bo 2³ – 1 = 7), a dla *n* = 32 trzeba już 6 półek.`,
  ],
  '1.3': [
    `Algorytm A wypisuje bieżącą książkę, a dopiero potem schodzi niżej – najpierw całe lewe „poddrzewo”, potem prawe.`,
    `Z *B*[*i*, *j*] algorytm idzie do *B*[*i* + 1, 2*j* – 1] (lewe dziecko) i wypisuje wszystko, co jest pod nim, zanim w ogóle zajrzy do *B*[*i* + 1, 2*j*] (prawe dziecko).`,
    `W a) kolejność zaczyna się tak: 9, potem lewe dziecko 2 (nie ma nic pod sobą), a potem prawa strona: 12, 10, …`,
  ],
  '2.1': [
    `Kolejne cyfry zapisu binarnego dostajesz od końca: *n* mod 2 to ostatnia cyfra, a *n* div 2 ją „obcina”.`,
    `Nowy blok zaczyna się tam, gdzie cyfra różni się od poprzedniej. Zapamiętuj poprzednią cyfrę i licz takie zmiany – pierwsza cyfra zawsze otwiera blok.`,
  ],
  '2.2': [
    `Blok kończy się tam, gdzie cyfra różni się od poprzedniej. Liczba bloków to 1 + liczba takich miejsc.`,
    `Dla każdego wiersza porównuj sąsiednie znaki i licz zmiany. Liczbę zaliczasz, gdy zmian jest co najwyżej jedna (czyli bloki są najwyżej dwa).`,
  ],
  '2.3': [
    `Porównuj wartości liczb, a nie napisy – „111” jest mniejsze od „1000”, choć alfabetycznie jest dalej.`,
    `Zamień każdy zapis na liczbę – \`int(s, 2)\` w Pythonie, \`stoi(s, nullptr, 2)\` w C++, \`Integer.parseInt(s, 2)\` w Javie – i szukaj maksimum, pamiętając, z którego wiersza pochodzi. Wypisz oryginalny zapis binarny.`,
  ],
  '2.4': [
    `Zamień wszystkie trzy liczby na system dwójkowy i wykonuj XOR bit po bicie.`,
    `123<sub>10</sub> = 1111011<sub>2</sub>, a 2D<sub>16</sub> = 0010 1101<sub>2</sub> = 101101<sub>2</sub>. Porównaj to z drugą liczbą.`,
    `Druga i trzecia liczba są równe, a XOR z tą samą liczbą wykonany dwa razy się znosi: (*a* XOR *b*) XOR *b* = *a*.`,
  ],
  '2.5': [
    `*p* div 2 w zapisie binarnym to *p* bez ostatniej cyfry – przesunięcie o jedną pozycję w prawo.`,
    `Zamień wiersz na liczbę, policz \`p ^ (p // 2)\` (w C++ i Javie \`p ^ (p / 2)\`) i wypisz wynik z powrotem w systemie dwójkowym, jeden wynik w wierszu.`,
  ],
  '3.1': [
    `Fragment 2-cyfrowy to cyfry z dwóch sąsiednich wierszy: *i* oraz *i* + 1. Fragmentów jest o jeden mniej niż cyfr.`,
    `Z cyfr *a* i *b* zrób liczbę 10·*a* + *b* i licz te większe od 90, czyli od 91 do 99.`,
  ],
  '3.2': [
    `Różnych fragmentów jest tylko 100 (od 00 do 99), więc wystarczy tablica stu liczników.`,
    `Dla każdej pary sąsiednich cyfr zwiększ licznik[10·*a* + *b*]. Potem szukaj minimum i maksimum, przeglądając fragmenty od 00 w górę i zmieniając wynik tylko przy ostrej nierówności – wtedy przy remisie zostaje mniejszy fragment.`,
    `Fragment wypisz jako dwie cyfry (np. 08, a nie 8), a obok liczbę jego wystąpień.`,
  ],
  '3.3': [
    `Sprawdź osobno każde okno sześciu kolejnych cyfr – zaczynające się w wierszu 1, 2, 3, …`,
    `Ciąg jest rosnąco-malejący, gdy da się go przeciąć na część ostro rosnącą i ostro malejącą, każdą co najmniej 2-elementową. Dla sześciu cyfr są tylko trzy podziały: 2 + 4, 3 + 3 i 4 + 2.`,
    `Między ostatnią cyfrą części rosnącej a pierwszą malejącej nie ma żadnego warunku – dlatego (5, 9, 9, 4, 1) też jest rosnąco-malejący.`,
  ],
  '3.4': [
    `Dla każdej pozycji startowej znajdź najdłuższy ciąg rosnąco-malejący, który się w niej zaczyna, i zapamiętaj najlepszy.`,
    `Od startu idź w prawo, póki cyfry rosną – każde miejsce na tym odcinku może kończyć część rosnącą. Od każdego takiego miejsca sprawdź, jak długo cyfry maleją; część malejąca też musi mieć co najmniej 2 cyfry.`,
    `Pozycja to numer wiersza w pliku liczony od 1. Ciąg wypisz jako cyfry sklejone bez odstępów.`,
  ],
  '4': [
    `Klucz prywatny osoby A zna tylko A. Zastanów się, do czego może go użyć ona sama, a do czego inni używają jej klucza publicznego.`,
    `Wiadomość dla A szyfruje się kluczem publicznym A, a odszyfrować ją może tylko A – swoim kluczem prywatnym. Swoim kluczem prywatnym A może też podpisać wiadomość, żeby inni mogli ją uwierzytelnić. Do sprawdzenia, kim jest B, potrzebny jest klucz publiczny B.`,
  ],
  '5': [
    `Zamień każdą liczbę na system dziesiętny: każda cyfra razy podstawa do potęgi równej numerowi pozycji (od prawej, od zera).`,
    `(134)<sub>5</sub> = 1·25 + 3·5 + 4 = 44, a (134)<sub>6</sub> = 1·36 + 3·6 + 4 = 58.`,
    `(2222)<sub>3</sub> = 2·(27 + 9 + 3 + 1) = 80, a (1111)<sub>6</sub> = 216 + 36 + 6 + 1 = 259.`,
  ],
  '6.1': [
    `Potrzebujesz sumy dostaw każdego owocu w każdym miesiącu – to zadanie na tabelę przestawną albo na funkcję SUMA.JEŻELI.`,
    `Zaznacz dane i wybierz „Tabela przestawna”: w wierszach data pogrupowana po miesiącach, w wartościach suma każdego owocu. Bez tabeli przestawnej: dodaj kolumnę z numerem miesiąca, np. =MIESIĄC(A2).`,
    `Z kolumną E = MIESIĄC(A2) suma malin w maju to =SUMA.JEŻELI($E$2:$E$154;5;B$2:B$154). Wykres kolumnowy zrób z gotowego zestawienia i dodaj tytuł, legendę oraz opisy osi.`,
  ],
  '6.2': [
    `W każdym wierszu porównaj trzy dostawy z tego samego dnia.`,
    `Dodaj kolumnę =JEŻELI(ORAZ(D2>B2;D2>C2);1;0), przeciągnij ją do końca danych i zsumuj.`,
  ],
  '6.3': [
    `To symulacja dzień po dniu: owoce, które zostały po produkcji, są doliczane do dostawy następnego dnia.`,
    `Każdego dnia: stan = reszta z wczoraj + dzisiejsza dostawa. Produkujesz z dwóch owoców, których jest najwięcej – czyli rodzaj konfitury wyznacza owoc, którego jest **najmniej** (on nie jest używany).`,
    `W arkuszu: kolumny E, F, G – stan malin, truskawek i porzeczek przed produkcją, kolumna H – rodzaj, np. =JEŻELI(ORAZ(G2<E2;G2<F2);"malinowo-truskawkowe";JEŻELI(F2<E2;"malinowo-porzeczkowe";"truskawkowo-porzeczkowe")). Z obu użytych owoców zużywasz tyle, ile jest mniejszego z nich. Na koniec policz rodzaje funkcją LICZ.JEŻELI.`,
  ],
  '6.4': [
    `Wystarczy symulacja z zadania 6.3 – trzeba tylko zapisywać, ile konfitury powstało każdego dnia.`,
    `Jednego dnia powstaje tyle kilogramów konfitury, ile jest mniejszego z dwóch użytych owoców. To środkowa z trzech wartości stanu, więc wystarczy =MEDIANA(E2:G2).`,
    `Zsumuj tę kolumnę osobno dla każdego rodzaju, np. =SUMA.JEŻELI(H$2:H$154;"malinowo-truskawkowe";I$2:I$154).`,
  ],
  '7.1': [
    `Policz oceny każdej gry – grupowanie po grze i funkcja COUNT.`,
    `Połącz tabele oceny i gry po \`id_gry\`, pogrupuj po grze, posortuj malejąco po liczbie ocen i weź pierwszy wiersz (\`LIMIT 1\` albo \`TOP 1\`).`,
  ],
  '7.2': [
    `Potrzebujesz średniej (AVG) ocen każdej gry, ale tylko dla gier z kategorii „imprezowa”.`,
    `Połącz gry z ocenami, dodaj \`WHERE kategoria = 'imprezowa'\`, pogrupuj po grze i zaokrąglij średnią: \`ROUND(AVG(ocena), 2)\`.`,
  ],
  '7.3': [
    `Najpierw znajdź graczy, którzy mają jakąkolwiek grę ze stanem „posiada”. Szukasz pozostałych – ale tylko spośród tych, którzy wystawili ocenę.`,
    `Policz \`COUNT(DISTINCT id_gracza)\` w tabeli oceny z warunkiem \`id_gracza NOT IN (SELECT id_gracza FROM oceny WHERE stan = 'posiada')\`.`,
    `Graczy bierz z tabeli oceny, a nie gracze – inaczej policzysz też osoby bez żadnej oceny (to typowy błąd: wynik 351).`,
  ],
  '7.4': [
    `Każdej ocenie przypisz kategorię wiekową gracza, a potem licz oceny dla par (kategoria, gra).`,
    `Kategorię zrobisz wyrażeniem \`CASE WHEN wiek <= 19 THEN 'juniorzy' WHEN wiek <= 49 THEN 'seniorzy' ELSE 'weterani' END\` (w Accessie: \`IIf\`). Grupuj po kategorii i po grze.`,
    `Z takiego zestawienia wybierz wiersze, w których liczba ocen równa się maksimum w ich kategorii – np. podzapytaniem z MAX. Pamiętaj, że w jednej kategorii może być kilka gier z tą samą liczbą ocen.`,
  ],
  '7.5': [
    `Szukasz sumy cen, więc połącz gry ze sklepem i odfiltruj dwa warunki.`,
    `\`JOIN\` tabel gry i sklep po \`id_gry\`, \`WHERE kategoria = 'logiczna' AND promocja = true\`, a w \`SELECT\` – \`SUM(cena)\`.`,
  ],
};
