// Hints for the May 2025 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2025-maj come after these,
// revealed line by line in the editor. Spreadsheet formulas were checked with tools/sheet-eval.mjs.
export default {
  '1.1': [
    `Funkcja dzieli liczbę na pary cyfr, licząc od końca, i w każdej parze zamienia cyfry miejscami.`,
    `316498 → pary od końca: 98, 64, 31 → po zamianie 89, 46, 13 → razem 134689. Liczba wywołań to liczba par (pierwsza z lewej może mieć tylko jedną cyfrę).`,
    `Pojedyncza cyfra na początku zostaje bez zmian. Uważaj na zera: para 05 po zamianie daje 50, a para 10 daje 01.`,
  ],
  '1.2': [
    `Każde wywołanie „zjada” dwie cyfry liczby – tylko ostatnie może zjeść jedną.`,
    `Dla *k* = 1 jest 1 wywołanie, dla *k* = 2 – 1, dla *k* = 3 – 2, dla *k* = 4 – 2. Sprawdź każde zdanie na tych wartościach (zauważ, że *k*/2 dla nieparzystego *k* nie jest nawet liczbą całkowitą).`,
  ],
  '1.3': [
    `Przejdź po parach cyfr od końca tak jak funkcja rekurencyjna, tylko w pętli: *n* mod 100 to ostatnia para, a *n* div 100 ją usuwa.`,
    `Zamienioną parę, czyli *a* + 10·*b*, dopisuj na kolejnej pozycji wyniku: *w* ← *w* + *p*·(*a* + 10·*b*), gdzie *p* to kolejno 1, 100, 10 000, …`,
    `Gdy z *n* została już tylko jedna cyfra (*n* < 10), dopisz samo *p*·*b* – tak jak w gałęzi „w przeciwnym razie” funkcji *przestaw*.`,
  ],
  '2.1': [
    `Palindrom czytany od tyłu jest taki sam jak czytany od przodu.`,
    `Porównaj napis z jego odwróceniem: \`s == s[::-1]\` w Pythonie, \`string(s.rbegin(), s.rend())\` w C++ albo \`new StringBuilder(s).reverse()\` w Javie.`,
  ],
  '2.2': [
    `Potraktuj plik jak tablicę 2000 × 12 znaków i sprawdź każde pole, które może być środkiem kwadratu 3 × 3.`,
    `Środek nie leży na brzegu: wiersze od 2 do 1999, pozycje od 2 do 11. Dla każdego takiego pola porównaj ze środkiem wszystkie 9 pól wokół (przesunięcia –1, 0, 1 w pionie i w poziomie).`,
    `Wiersz i pozycję podaj licząc od 1 – jeśli indeksujesz od 0, dodaj 1. Kwadraty mogą na siebie nachodzić; każdy środek liczy się osobno.`,
  ],
  '2.3': [
    `Każdy napis to liczba w systemie trójkowym: o = 0, + = 1, * = 2.`,
    `Wartość policz schematem Hornera: *w* ← 3·*w* + cyfra dla kolejnych znaków od lewej. Zapamiętaj napis z największą wartością i wypisz oba.`,
  ],
  '2.4': [
    `Zsumuj wartości wszystkich napisów (jak w 2.3), a potem zamień sumę z powrotem na system trójkowy.`,
    `Zamiana: dopóki *x* > 0, dopisuj na początek symbol cyfry *x* mod 3 (0 → o, 1 → +, 2 → *) i dziel *x* przez 3.`,
  ],
  '3.1': [
    `Dla każdej pary [*A*, *B*] policz NWD wartości bezwzględnych |*A*| i |*B*|.`,
    `Algorytm Euklidesa: dopóki *b* > 0, (*a*, *b*) ← (*b*, *a* mod *b*). Gdy *B* = 0, wynikiem jest |*A*| – wersja z resztą z dzielenia daje to sama. Licz pary z NWD większym od 1.`,
  ],
  '3.2': [
    `Najpierw wyznacz punkty, w których był dron: sumuj kolejne przesunięcia, zaczynając od (0, 0).`,
    `a) Liczą się punkty ściśle wewnątrz: 0 < *x* < 5000 i 0 < *y* < 5000. b) Dla każdej pary punktów policz środek odcinka ((*x*<sub>1</sub> + *x*<sub>2</sub>)/2, (*y*<sub>1</sub> + *y*<sub>2</sub>)/2) i sprawdź, czy jest jednym z punktów.`,
    `Środek ma całkowite współrzędne tylko wtedy, gdy obie sumy są parzyste. Punkty trzymaj w zbiorze (set), żeby szybko sprawdzać, czy środek do niego należy.`,
  ],
  '4': [
    `Nazwa wiele mówi: *key* to klawisz, a *logger* – coś, co zapisuje (loguje).`,
    `Keylogger to oprogramowanie szpiegujące, które rejestruje wszystko, co użytkownik wpisuje na klawiaturze – także hasła.`,
  ],
  '5': [
    `Dodawaj kolumnami od prawej, tak jak w systemie dziesiętnym, tylko że 1 + 1 = 10<sub>2</sub> (piszesz 0, przenosisz 1).`,
    `Brakującą cyfrę wylicz z pozostałych w kolumnie: cyfra wyniku = (górna + dolna + przeniesienie) mod 2, a przeniesienie dalej = ta suma div 2. Zacznij od kolumn, w których brakuje tylko jednej cyfry.`,
  ],
  '6.1': [
    `Masa ładunków to zwykła suma. Martianeum wydobywa się tylko z ładunków o zawartości co najmniej 1%.`,
    `Dodaj kolumnę =JEŻELI(D2>=1;C2*D2/100;0) – masę minerału wydobytego danego dnia – i zsumuj ją. Zawartość jest podana w procentach, dlatego dzielisz przez 100.`,
  ],
  '6.2': [
    `Potrzebujesz średniej masy ładunku dla każdego obszaru, a potem najmniejszej z tych średnich.`,
    `Tabela przestawna: wiersze – nazwa_obszaru, wartości – masa, funkcja „Średnia”; posortuj rosnąco. Albo =ŚREDNIA.JEŻELI($B$2:$B$2073;"Tharsis";$C$2:$C$2073) dla każdego obszaru.`,
  ],
  '6.3': [
    `Każdemu dniu przypisz numer jego 7-dniowego okresu, a potem zsumuj masy w każdym okresie.`,
    `Numer okresu: =ZAOKR.DO.CAŁK((A2-DATA(2033;3;3))/7) – 0 dla pierwszego tygodnia, 1 dla drugiego itd. Sumy policzysz tabelą przestawną po tej kolumnie albo funkcją SUMA.JEŻELI.`,
    `Okres o numerze *k* zaczyna się w dniu =DATA(2033;3;3)+7*k. Jeśli zobaczysz liczbę zamiast daty, pokaż ją jako datę, np. =TEKST(…;"DD.MM.YYYY").`,
  ],
  '6.4': [
    `Potrzebujesz liczby przewozów dla każdej pary (obszar, rok) – to tabela przestawna z dwoma wymiarami.`,
    `Dodaj kolumnę z rokiem =ROK(A2) i zrób tabelę przestawną: wiersze – nazwa_obszaru, kolumny – rok, wartości – dowolna kolumna z funkcją „Liczba”.`,
    `Wykres zrób z zestawienia bez kolumny „Suma końcowa”, typ „Kolumnowy skumulowany”. Dodaj tytuł, legendę z latami i opisy osi: „nazwy obszarów” oraz „liczba przewozów ładunku”.`,
  ],
  '6.5': [
    `To symulacja dzień po dniu: stan magazynu = stan z wczoraj (po ewentualnej wysyłce) + martianeum wydobyte dziś.`,
    `Wydobycie z każdego dnia masz z zadania 6.1 (kolumna E). W G2 wpisz =E2, w H2 znacznik wysyłki =JEŻELI(G2>=100;1;0), a w G3 =G2-100*H2+E3 i przeciągnij w dół.`,
    `Liczba wysyłek to suma kolumny H. Pierwsza wysyłka: =INDEKS(A2:A2073;PODAJ.POZYCJĘ(1;H2:H2073;0)). Ostatnia: kolumna =H2*A2 i jej największa wartość (MAKS).`,
  ],
  '7.1': [
    `Sumujesz ilość wody z pomiarów na głębokości do 100 m, osobno dla każdego obszaru. Nazwę obszaru weź z tabeli Obszary.`,
    `\`JOIN\` Pomiary z Obszary po \`kod_obszaru\`, \`WHERE glebokosc <= 100\`, \`GROUP BY\` obszar, \`SUM(ilosc)\`, posortuj malejąco i weź pierwszy wiersz.`,
  ],
  '7.2': [
    `Dla każdego łazika znajdź datę pierwszego i ostatniego pomiaru – MIN i MAX z \`data_pomiaru\`.`,
    `Pogrupuj pomiary po łaziku (z \`JOIN\` do tabeli Laziki, żeby mieć nazwę) i posortuj malejąco po długości okresu: \`DATEDIFF(MAX(data_pomiaru), MIN(data_pomiaru))\` (w Accessie wystarczy różnica dat). Weź pierwszy wiersz.`,
  ],
  '7.3': [
    `Najpierw znajdź obszary, na których jakiś łazik wykonał pomiar w roku swojego wysłania – szukasz wszystkich pozostałych obszarów.`,
    `Podzapytanie: kody obszarów z Pomiary \`JOIN\` Laziki, gdzie \`YEAR(data_pomiaru) = rok_wyslania\`. Wynik to obszary, których \`kod_obszaru NOT IN\` (to podzapytanie).`,
  ],
  '7.4': [
    `Półkulę poznasz po literze N albo S przy pierwszej współrzędnej (szerokości geograficznej).`,
    `Łazik wylądował na południu, gdy \`wsp_ladowania LIKE '%S, %'\`. Potrzebujesz łazików z pomiarem na N i z pomiarem na S – dwa warunki \`nr_lazika IN (SELECT nr_lazika FROM Pomiary WHERE wspolrzedne LIKE …)\`.`,
  ],
  '7.5': [
    `Łączysz cztery tabele: Producent – Laziki – Pomiary – Obszary – i zostawiasz pomiary z Arcadii z 2060 roku.`,
    `\`JOIN\` po \`kod_producenta\`, \`nr_lazika\` i \`kod_obszaru\`; \`WHERE nazwa_obszaru = 'Arcadia' AND YEAR(data_pomiaru) = 2060\`; \`SELECT DISTINCT nazwa\`, żeby producenci się nie powtarzali.`,
  ],
};
