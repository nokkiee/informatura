// Hints for the June 2023 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2023-czerwiec come after
// these, revealed line by line in the editor.
export default {
  '1.1': [
    `Każde wywołanie dzieli *y* przez 2 (div), aż dojdzie do *y* = 1. Zacznij od góry: *iloczyn*(10, 45) liczy *k* = 45 div 2 = 22.`,
    `Kolumna *z* to wynik wywołania z następnego wiersza. Wynik to *z* + *z*, gdy *y* jest parzyste, albo *x* + *z* + *z*, gdy nieparzyste – dlatego wyniki uzupełniaj od ostatniego wiersza w górę.`,
    `Ostatnie wywołanie, *iloczyn*(10, 1), zwraca 10. Przedostatnie ma *y* = 2 (parzyste), więc *z* = 10, a wynik to 10 + 10 = 20.`,
  ],
  '1.2': [
    `Liczba dodawań zależy tylko od *y*: wywołanie z parzystym *y* wykonuje jedno dodawanie, z nieparzystym (większym od 1) – dwa, a z *y* = 1 – żadnego.`,
    `Wypisz kolejne wartości *y*, dzieląc przez 2 (div) aż do 1. Dla *y* = 32 to 32, 16, 8, 4, 2, 1 – pięć wywołań z parzystym *y*, więc 5 dodawań.`,
    `Krócej, w zapisie binarnym *y*: każda cyfra oprócz pierwszej to jedno dodawanie, a każda jedynka oprócz pierwszej – jeszcze jedno. Na przykład 47 = 101111<sub>2</sub>.`,
  ],
  '1.3': [
    `To mnożenie przez podwajanie i połowienie: *x* w każdym kroku się podwaja, a *y* traci ostatnią cyfrę binarną.`,
    `Do *z* dodajesz *x* wtedy, gdy ostatni bit *y* to 1. Na początku *z* jeszcze nic nie zawiera, a pętla kończy się, gdy w *y* nie zostanie już żaden bit.`,
    `Po każdym kroku *y* ← *y* div 2, a pętla działa, dopóki *y* > 0.`,
  ],
  '2.1': [
    `Pierwsza instrukcja **jeżeli** porównuje *s*[*i*] z *s*[*j*]. Pętla trwa, dopóki te znaki są równe i oba indeksy mieszczą się w słowie.`,
    `Każda zgodna para to jedno porównanie i przesunięcie *i* oraz *j*. Sześć porównań uzyskasz na dwa sposoby: pięć zgodnych par i szósta niezgodna albo sześć zgodnych par, po których *j* (lub *i*) wychodzi poza słowo.`,
    `Najprościej użyć słowa z samych liter a. Dla *s* = aaaaaaaaaa (10 liter) pętla kończy się, gdy większy z indeksów przekroczy 10 – dobierz *k1* i *k2* tak, żeby zdążyła wykonać dokładnie 6 porównań.`,
  ],
  '2.2': [
    `Najpierw zapisz funkcję *czy_mniejszy* dokładnie według pseudokodu. Uważaj na numerację: w pseudokodzie znaki są numerowane od 1, a w Pythonie, C++ i Javie – od 0.`,
    `Każdy plik ma trzy wiersze: *n*, słowo oraz *k1* i *k2*. Wywołaj funkcję dla każdego z trzech plików i wypisz nazwę pliku oraz TAK albo NIE.`,
  ],
  '2.3': [
    `To zwykłe sortowanie tablicy liczb 1, 2, …, *n*, tyle że zamiast liczb porównujesz sufiksy, na które one wskazują.`,
    `Wypełnij *T* liczbami od 1 do *n* i posortuj ją, np. bąbelkowo: zamieniasz *T*[*j*] i *T*[*j* + 1], gdy *czy_mniejszy*(*n*, *s*, *T*[*j*], *T*[*j* + 1]) daje FAŁSZ.`,
  ],
  '2.4': [
    `Każdy sufiks to *s*[*k*..*n*]. Najmniejszy w porządku alfabetycznym znajdziesz, porównując wszystkie sufiksy słowa.`,
    `Dla każdego słowa przejdź po *k* = 1, …, *n* i zapamiętuj najmniejszy sufiks. Napisy możesz porównywać zwykłym operatorem \`<\` (w Javie \`compareTo\`), który działa alfabetycznie, albo funkcją *czy_mniejszy*.`,
  ],
  '3.1': [
    `Wystarczy policzyć zera i jedynki w każdym wierszu.`,
    `Zrównoważona: zer i jedynek jest tyle samo. Prawie zrównoważona: liczby jedynek i zer różnią się o 1, w którąkolwiek stronę.`,
  ],
  '3.2': [
    `Interesują Cię tylko wiersze 8-cyfrowe. Liczba anagramów zależy wyłącznie od tego, ile w liczbie jest zer, a ile jedynek.`,
    `Pierwsza cyfra musi być jedynką, więc przestawiasz tylko 7 pozostałych cyfr: anagramów jest 7! / (zera! · (jedynki – 1)!).`,
    `Policz tę wartość dla każdej 8-cyfrowej liczby, znajdź maksimum i wypisz – w kolejności z pliku – wszystkie liczby, które je osiągają.`,
  ],
  '3.3': [
    `Zamień liczby na dziesiętne i porównuj każdą z liczbą z następnego wiersza.`,
    `Szukasz największej wartości |*a*<sub>*i*</sub> – *a*<sub>*i*+1</sub>| po wszystkich sąsiednich parach. Wynik zamień z powrotem na zapis binarny.`,
  ],
  '3.4': [
    `Zamień każdy wiersz na liczbę dziesiętną i pracuj na jej zapisie jako na napisie z cyframi.`,
    `a) Sprawdź, czy w zapisie nie ma znaku 0. b) Każdą cyfrę licz do sumy tylko raz – np. przez zbiór cyfr albo tablicę 10 znaczników „już była”.`,
    `Szukając maksimum, zmieniaj wynik tylko przy ostrej nierówności – wtedy zostaje liczba, która wystąpiła w pliku jako pierwsza.`,
  ],
  '4': [
    `9 = 3², więc jedna cyfra w systemie dziewiątkowym odpowiada dokładnie dwóm cyfrom w systemie trójkowym.`,
    `Podziel zapis trójkowy na pary cyfr, licząc od prawej, i każdą parę *ab*<sub>3</sub> zamień na jedną cyfrę dziewiątkową 3·*a* + *b*.`,
    `Na przykład 12<sub>3</sub> = 5. W drugą stronę każdą cyfrę dziewiątkową zamień na dokładnie dwie cyfry trójkowe, z zerem z przodu: 2 = 02<sub>3</sub>, 7 = 21<sub>3</sub>, 8 = 22<sub>3</sub>.`,
  ],
  '5': [
    `Kolor #RRGGBB to trzy liczby szesnastkowe: składowa czerwona, zielona i niebieska.`,
    `Składowa czerwona to E9<sub>16</sub> = 14·16 + 9. Zapis rgb(255,255,255) ustawia wszystkie trzy składowe na maksimum.`,
  ],
  '6.1': [
    `Potrzebujesz sumy generowania dla każdego dnia osobno, a potem największej z tych sum.`,
    `Zaznacz dane i wybierz „Tabela przestawna”: wiersze – Data_godzina z grupowaniem „dni”, wartości – suma z Generowanie.`,
    `Posortuj zestawienie malejąco po sumie (albo znajdź ją funkcją MAKS(…)) i odczytaj datę z tego wiersza.`,
  ],
  '6.2': [
    `Liczą się tylko wiersze, w których pobór wynosi 0. Policz je osobno dla każdej godziny.`,
    `Dodaj kolumnę =JEŻELI(B2=0;1;0) i zrób tabelę przestawną: wiersze – Data_godzina z grupowaniem „godziny”, wartości – suma tej nowej kolumny.`,
    `Bez tabeli przestawnej: kolumna z godziną =GODZINA(A2), a potem dla każdej godziny =LICZ.WARUNKI(…) z dwoma warunkami: ta godzina i pobór równy 0.`,
  ],
  '6.3': [
    `Potrzebujesz średniego generowania dla każdej z 24 godzin doby, licząc ze wszystkich dni.`,
    `Tabela przestawna: wiersze – Data_godzina z grupowaniem „godziny”, wartości – Generowanie, funkcja „Średnia”. Średnie zaokrąglij do czterech miejsc, np. =ZAOKR(B2;4).`,
    `Wykres kolumnowy zrób z gotowego zestawienia: na osi X godziny, na osi Y średnia liczba kWh. Pamiętaj o tytule i opisach osi.`,
  ],
  '6.4': [
    `Liczą się tylko kwietniowe godziny od 10 do 15, w których był pobór z sieci. Wystarczy, że dodatkowe panele pokryją go w najgorszej z tych godzin.`,
    `Jeden panel daje 1/18 generowania z danej godziny. Żeby pokryć pobór *P* w godzinie z generowaniem *G*, potrzeba *P* / (*G* / 18) dodatkowych paneli.`,
    `Na przykład w kolumnie D: =JEŻELI(ORAZ(MIESIĄC(A2)=4;GODZINA(A2)>=10;GODZINA(A2)<=15;B2>0);ZAOKR.GÓRA(B2/(C2/18);0);0). Odpowiedź to największa liczba w tej kolumnie (MAKS).`,
  ],
  '7.1': [
    `Typ urządzenia jest w tabeli urzadzenia, a instalacje w tabeli instalacje – połącz je i policz instalacje dla każdego typu.`,
    `\`JOIN\` po \`kod_u\`, \`GROUP BY typ_u\` i \`COUNT(*)\`.`,
  ],
  '7.2': [
    `Interesują Cię tylko instalacje z lutego 2019, pogrupowane według producenta urządzenia.`,
    `Połącz instalacje z urządzeniami, dodaj warunek \`YEAR(data_i) = 2019 AND MONTH(data_i) = 2\`, pogrupuj po \`producent_u\`, posortuj malejąco po liczbie i weź pierwszy wiersz.`,
  ],
  '7.3': [
    `Dla każdego kraju policz instalacje i podziel przez liczbę mieszkańców, a potem pomnóż przez milion.`,
    `Połącz instalacje z krajami, pomiń kraje z \`ludnosc_k < 1000000\`, pogrupuj po kraju i licz \`COUNT(*) * 1000000.0 / ludnosc_k\`. Posortuj malejąco i weź pięć pierwszych.`,
    `Wynik zaokrąglij funkcją \`ROUND(…, 2)\`. Zapisz \`1000000.0\` z kropką – inaczej SQLite podzieli liczby całkowicie i zgubi część ułamkową.`,
  ],
  '7.4': [
    `Liczysz różne kraje, nie instalacje – jedno urządzenie mogło być instalowane wiele razy w tym samym kraju.`,
    `Połącz instalacje z urządzeniami, zostaw tylko \`typ_u = 'Tablet'\`, pogrupuj po urządzeniu i licz \`COUNT(DISTINCT kod_k)\`. Posortuj malejąco i weź pierwszy wiersz.`,
  ],
  '7.5': [
    `Potrzebujesz połączenia firm z instalacjami i zliczenia instalacji dla każdej firmy.`,
    `\`JOIN\` tabel firmy i instalacje po \`id_firmy\`, \`GROUP BY\` firma, \`COUNT(*)\`, a na końcu \`ORDER BY\` liczba instalacji malejąco (\`DESC\`).`,
  ],
};
