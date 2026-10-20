// Hints for the May 2024 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2024-maj come after these,
// revealed line by line in the editor. Spreadsheet formulas were checked with tools/sheet-eval.mjs.
export default {
  '1.1': [
    `*P*[*i*][*j*] mówi, czy do pola (*i*, *j*) da się dojść z lewego górnego rogu po białych polach, idąc tylko w prawo lub w dół.`,
    `Wypełniaj *P* wiersz po wierszu: białe pole jest osiągalne, gdy osiągalne jest pole po jego lewej albo nad nim. Czarne pole nigdy nie jest osiągalne.`,
    `W b) drugi wiersz jest czarny poza ostatnią kolumną, a w czwartym czarne są dwie ostatnie kolumny. Sprawdź, czy da się je ominąć, idąc tylko w prawo i w dół.`,
  ],
  '1.2': [
    `a) Wystarczą dwa czarne pola, które „zamkną” start. b) Pomyśl o ścieżce, która zajmuje jak najmniej pól i biegnie brzegiem planszy.`,
    `a) Zamaluj oba pola sąsiadujące z lewym górnym rogiem (na prawo od niego i pod nim) – z rogu nie da się wtedy wyjść. b) Zostaw białą tylko lewą kolumnę i dolny wiersz – czarnych pól będzie 9.`,
  ],
  '1.3': [
    `Każda ścieżka z lewego górnego do prawego dolnego rogu, idąca tylko w prawo i w dół, ma tyle samo pól – niezależnie od tego, jak skręca.`,
    `Na planszy *n* × *n* taka ścieżka ma 2*n* – 1 pól. Wszystkie pozostałe pola mogą być czarne – policz, ile ich jest, i uprość wyrażenie.`,
  ],
  '2.1': [
    `Algorytm przechodzi przez cyfry *n* od końca i każdą zamienia na jedną cyfrę wyniku – na tej samej pozycji.`,
    `Cyfra parzysta *a* przechodzi w *a* div 2, a nieparzysta – w 1 (to właśnie instrukcja *c* ← *c* + *b*). Dla 33658: 3→1, 3→1, 6→3, 5→1, 8→4, czyli 11314.`,
    `Liczba wykonań instrukcji *c* ← *c* + *b* to liczba nieparzystych cyfr *n*.`,
  ],
  '2.2': [
    `Skorzystaj z tego, że algorytm zamienia każdą cyfrę osobno i zostawia ją na tej samej pozycji.`,
    `Cyfra 3 (nieparzysta) przechodzi w 1, cyfra 6 – w 6 div 2 = 3, a cyfra 9 – w 1. Złóż wynik w tej samej kolejności cyfr.`,
  ],
  '3.1': [
    `Przechodź po cyfrach *n* od końca: *n* mod 10 to ostatnia cyfra, a *n* div 10 ją usuwa.`,
    `Nieparzystą cyfrę dopisuj do wyniku na kolejnej pozycji: *m* ← *m* + cyfra · *p*, gdzie *p* to kolejno 1, 10, 100, … – zwiększasz je tylko po dopisaniu cyfry.`,
  ],
  '3.2': [
    `Nieparzysty skrót nie istnieje dokładnie wtedy, gdy liczba ma same parzyste cyfry.`,
    `Dla każdej liczby sprawdź jej cyfry (np. jako znaki napisu). Policz liczby z samymi parzystymi cyframi i zapamiętaj największą z nich – nie najmniejszą.`,
  ],
  '3.3': [
    `Dla każdej liczby wyznacz jej nieparzysty skrót, a potem największy wspólny dzielnik liczby i skrótu.`,
    `Skrót zbudujesz, sklejając nieparzyste cyfry (np. w napis), a NWD policzysz algorytmem Euklidesa: dopóki *b* > 0, (*a*, *b*) ← (*b*, *a* mod *b*).`,
  ],
  '4.1': [
    `Wczytaj oba wiersze jako listy liczb i dla każdej liczby z pierwszego wiersza sprawdź, czy dzieli choć jedną liczbę z drugiego.`,
    `Liczby w pierwszym wierszu się powtarzają – każde wystąpienie liczysz osobno. To 3000 · 20 sprawdzeń reszty z dzielenia, więc zwykła podwójna pętla wystarczy.`,
  ],
  '4.2': [
    `Posortuj liczby z pierwszego wiersza malejąco. Powtórzenia zostają – każde zajmuje swoje miejsce.`,
    `Sto pierwsza od największej to element o indeksie 100 po sortowaniu malejącym (indeksy od 0) albo element o indeksie *n* – 101 po sortowaniu rosnącym.`,
  ],
  '4.3': [
    `Każdą liczbę z drugiego wiersza próbuj dzielić przez liczby z pierwszego wiersza – nadaje się, jeśli na koniec zostanie z niej 1.`,
    `Policz, ile razy każda liczba pierwsza występuje w pierwszym wierszu. Dzieląc, nie używaj danej liczby więcej razy, niż jest jej w tym wierszu.`,
  ],
  '4.4': [
    `Sprawdź wszystkie spójne fragmenty o długości co najmniej 50. Jest ich około 4,5 miliona, więc sumę każdego trzeba liczyć szybko.`,
    `Użyj sum prefiksowych: *S*[*i*] to suma pierwszych *i* liczb. Suma fragmentu od *i* do *j* – 1 to *S*[*j*] – *S*[*i*], a jego średnia to (*S*[*j*] – *S*[*i*]) / (*j* – *i*).`,
    `Przeglądaj fragmenty od lewej i zmieniaj wynik tylko przy ostrej nierówności – przy remisie zostanie fragment, który zaczyna się wcześniej. Wypisz średnią, długość i pierwszą liczbę fragmentu.`,
  ],
  '5': [
    `Przypomnij sobie, do czego służy każdy z protokołów: HTTP, FTP, DHCP – i porównaj z SMTP oraz DNS.`,
    `Pocztę wysyła się protokołem SMTP, a nazwy domen na adresy IP zamienia DNS. HTTP przesyła strony WWW, a FTP – pliki.`,
  ],
  '6': [
    `Najpierw zamień 121<sub>9</sub> na system trójkowy – każda cyfra dziewiątkowa to dokładnie dwie cyfry trójkowe.`,
    `1 = 01<sub>3</sub>, a 2 = 02<sub>3</sub>, więc 121<sub>9</sub> = 10201<sub>3</sub>. Teraz dodaj i odejmij pisemnie w systemie trójkowym (przeniesienie przy 3).`,
    `Albo przez system dziesiętny: 101112<sub>3</sub> = 284, a 121<sub>9</sub> = 100. Sumę i różnicę zamień z powrotem na system trójkowy.`,
  ],
  '7.1': [
    `Potrzebujesz sumy kilogramów dla każdego klienta, ale tylko z transakcji odmian zimowych (kod Z w kolumnie C).`,
    `Dodaj kolumnę =JEŻELI(C1="Z";E1;0) i zrób tabelę przestawną: wiersze – NIP, wartości – suma tej kolumny. Posortuj wynik malejąco.`,
    `Bez tabeli przestawnej, dla jednego klienta: =SUMA.WARUNKÓW($E$1:$E$2500;$D$1:$D$2500;D1;$C$1:$C$2500;"Z").`,
  ],
  '7.2': [
    `Do każdej transakcji dopisz cenę 1 kg jej odmiany – ceny są w pliku \`cennik.txt\`.`,
    `Wczytaj cennik przyciskiem „Importuj” (trafi do arkusza *cennik*). W kolumnie F wpisz =WYSZUKAJ.PIONOWO(B1;cennik!$A$1:$B$16;2;0), a w kolumnie G przychód =E1*F1. Całkowity przychód to =SUMA(G1:G2500).`,
    `Przychód odmiany: tabela przestawna (wiersze – odmiana, wartości – suma przychodu) albo =SUMA.JEŻELI($B$1:$B$2500;"Reneta";$G$1:$G$2500) dla każdej odmiany.`,
  ],
  '7.3': [
    `Potrzebujesz sprzedaży (w kg) każdej odmiany w każdym miesiącu, a potem w każdym miesiącu – odmiany z największą sprzedażą.`,
    `Tabela przestawna: wiersze – data pogrupowana po miesiącach, kolumny – odmiana, wartości – suma kilogramów.`,
    `W każdym wierszu zestawienia =MAKS(…) da największą sprzedaż, a =INDEKS(wiersz z nazwami odmian;PODAJ.POZYCJĘ(MAKS(…);ten wiersz;0)) – nazwę odmiany. Opis osi X złożysz funkcją ZŁĄCZ.TEKSTY(miesiąc;"-";odmiana).`,
  ],
  '7.4': [
    `Rabat zależy od tego, ile klient kupił łącznie do tej transakcji włącznie – potrzebujesz sumy narastającej dla każdego klienta.`,
    `Suma narastająca: =SUMA.JEŻELI($D$1:D1;D1;$E$1:E1) – zakres „rozciąga się” przy przeciąganiu w dół, więc liczy tylko transakcje do bieżącego wiersza.`,
    `Rabat w złotych: =JEŻELI(F1>=20000;0,1;JEŻELI(F1>=15000;0,05;0))*E1. Policz transakcje z rabatem większym od 0 (LICZ.JEŻELI) i zsumuj rabaty.`,
  ],
  '8.1': [
    `Potrzebujesz sumy kwot mandatów każdego kierowcy – kwoty są w taryfikatorze, a mandaty w rejestrze.`,
    `Połącz Rejestr z Kierowcy (po \`IdOsoby\`) i z Taryfikator (po \`IdWykroczenia\`), pogrupuj po kierowcy, policz \`SUM(Kwota)\`, posortuj malejąco i weź pierwszy wiersz.`,
  ],
  '8.2': [
    `Interesują Cię tylko wykroczenia o identyfikatorach od 3 do 6. Punkty sumujesz osobno dla każdego miesiąca.`,
    `Połącz Rejestr z Taryfikator, dodaj \`WHERE IdWykroczenia BETWEEN 3 AND 6\`, pogrupuj po \`MONTH(Data)\` i policz \`SUM(Punkty)\`. Szukasz najmniejszej sumy – sortuj rosnąco.`,
  ],
  '8.3': [
    `Szukasz kierowców, których identyfikatora nie ma w ogóle w tabeli Rejestr.`,
    `\`WHERE IdOsoby NOT IN (SELECT IdOsoby FROM Rejestr)\` (albo \`LEFT JOIN\` z warunkiem \`IS NULL\`), a na końcu \`ORDER BY NrRejestracyjny\`.`,
  ],
  '8.4': [
    `Szukasz fotoradarów, do których nie pasuje żaden wiersz w tabeli Rejestr.`,
    `\`LEFT JOIN\` tabeli Rejestr do Fotoradar po \`IdFotoradaru\` daje NULL tam, gdzie nie ma żadnego wykroczenia – zostaw te wiersze warunkiem \`WHERE Rejestr.IdFotoradaru IS NULL\`.`,
  ],
};
