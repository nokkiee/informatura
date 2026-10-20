// Hints for the June 2026 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2026-czerwiec come after
// these, revealed line by line in the editor. Spreadsheet formulas were checked with
// tools/sheet-eval.mjs.
export default {
  '1.1': [
    `Znaki z pozycji podzielnych przez *k* trafiają na koniec szyfrogramu (w tej samej kolejności), a pozostałe – na początek, ale od tyłu.`,
    `Dla *defragmentacja* i *k* = 3: *a* = 14 div 3 = 4, *c* = 10. Znaki z pozycji 3, 6, 9, 12 (f, g, n, c) idą kolejno na pozycje 11–14. Pozostałe wpisujesz od pozycji 10 w dół: d → *S*[10], e → *S*[9], r → *S*[8], …`,
  ],
  '1.2': [
    `Zastanów się, które pozycje 1, …, *n* są podzielne przez *k* – i dokąd wtedy trafiają znaki.`,
    `Gdy każda pozycja jest podzielna przez *k*, każdy znak trafia do „końcowej” części szyfrogramu – w tej samej kolejności, w jakiej był w tekście.`,
  ],
  '1.3': [
    `Tekst ma wyjść od tyłu – czyli żaden znak nie może trafić do części dla pozycji podzielnych przez *k*.`,
    `Znaki z pozycji niepodzielnych przez *k* są wpisywane od końca. Dobierz *k* tak, żeby żadna z pozycji 1, …, *n* nie była podzielna przez *k* – wartość będzie zależeć od *n*.`,
  ],
  '2.1': [
    `Szukasz najdłuższego początku tablicy, który jest jednocześnie jej końcem – ale krótszego niż cała tablica.`,
    `Dla [3,5,3,5,3,5,3,5,3,5] sprawdź *k* = 9: początek to [3,5,…,3], a koniec [5,3,…,5] – różnią się. A *k* = 8?`,
  ],
  '2.2': [
    `Sprawdź każde możliwe *k* od 1 do *n* – 1 i zapamiętaj największe, dla którego *T* jest *k*-podobna.`,
    `*T* jest *k*-podobna, gdy *T*[*i*] = *T*[*n* – *k* + *i*] dla każdego *i* od 1 do *k*. Porównuj element po elemencie w pętli – wycinanie fragmentów tablicy jest zabronione.`,
  ],
  '3.1': [
    `Podziel napis na np-pary: znaki 1–2, 3–4, 5–6, … i porównuj każdą parę z następną.`,
    `Kolejne np-pary zaczynają się na indeksach 0, 2, 4, … (licząc od 0). Licz sytuacje, w których para od indeksu *i* jest taka sama jak para od *i* + 2 – nie sprawdzaj fragmentów zaczynających się na nieparzystych indeksach.`,
  ],
  '3.2': [
    `Fragment złożony z np-par zaczyna się na początku jakiejś np-pary i kończy na końcu jakiejś np-pary – sprawdź wszystkie takie fragmenty.`,
    `Sumy kodów licz szybko sumami prefiksowymi: *S*[*j*] – *S*[*i*] to suma kodów znaków od *i* do *j* – 1. Indeksy *i* oraz *j* zmieniaj co 2.`,
    `Pierwszość sumy sprawdź, dzieląc ją przez kolejne liczby do pierwiastka. Zapamiętuj najdłuższy fragment z pierwszą sumą.`,
  ],
  '3.3': [
    `Policz wystąpienia każdej np-pary – np. w słowniku (mapie).`,
    `Posortuj różne np-pary rosnąco według liczby wystąpień i sklej je w jeden napis – każdą parę tylko raz.`,
  ],
  '4.1': [
    `Szukasz maksimum w trzeciej kolumnie i numeru wiersza, w którym ono jest.`,
    `Numer miasta to numer wiersza w pliku liczony od 1 – jeśli indeksujesz od 0, dodaj 1.`,
  ],
  '4.2': [
    `Policz odległość dla każdej pary miast (*i* < *j*). To około pół miliona par, więc dwie zagnieżdżone pętle wystarczą.`,
    `*d* = |*x*<sub>1</sub> – *x*<sub>2</sub>| + |*y*<sub>1</sub> – *y*<sub>2</sub>|. Gdy znajdziesz mniejszą odległość, wyczyść listę par; gdy równą – dopisz parę do listy.`,
  ],
  '4.3': [
    `Sprawdzaj kolejne długości boku *a* = 1, 2, 3, … i dla każdej policz ludność miast leżących ściśle wewnątrz kwadratu.`,
    `Miasto leży w środku, gdy 0 < *x* < *a* i 0 < *y* < *a*. Gęstość > 2 sprawdź bez dzielenia: suma > 2 · *a*². Szukasz największego takiego *a*.`,
    `Ile boków sprawdzić? Gdy 2 · *a*² przekroczy ludność całej I ćwiartki, większe kwadraty na pewno nie spełnią warunku – możesz wtedy skończyć.`,
  ],
  '5': [
    `Zamień znane liczby na system dziesiętny: 1251<sub>6</sub> i 110102<sub>3</sub>.`,
    `1251<sub>6</sub> = 216 + 2·36 + 5·6 + 1 = 319, a 110102<sub>3</sub> = 243 + 81 + 9 + 2 = 335. Brakująca liczba szóstkowa to 500 – 319, a trójkowa – 500 + 335. Zamień je na właściwe systemy.`,
  ],
  '6': [
    `Uwierzytelnianie dwuskładnikowe łączy dwa różne sposoby potwierdzenia tożsamości, np. hasło i jednorazowy kod.`,
    `Drugim składnikiem bywa kod z SMS-a, aplikacja albo klucz sprzętowy – kamera i mikrofon nie są do tego potrzebne. 2FA bardzo utrudnia włamanie, ale niczego nie gwarantuje w stu procentach.`,
  ],
  '7.1': [
    `Potrzebujesz sumy dostaw z każdego dnia, a potem największej z tych sum.`,
    `Tabela przestawna: wiersze – Data z grupowaniem „dni”, wartości – suma Liczba_kg; posortuj malejąco. Albo kolumna =SUMA.JEŻELI($B$2:$B$2115;B2;$D$2:$D$2115) i jej największa wartość (MAKS).`,
  ],
  '7.2': [
    `Dla każdej dostawy policz, ile dostaw miał ten sam dostawca tego samego dnia.`,
    `Kolumna =LICZ.WARUNKI($B$2:$B$2115;B2;$C$2:$C$2115;C2) da liczbę dostaw danego dostawcy w danym dniu. Każda podwójna dostawa ma w tej kolumnie dwa wiersze z wartością 2, więc wynik to =LICZ.JEŻELI(…;2)/2.`,
  ],
  '7.3': [
    `Potrzebujesz sumy kilogramów w każdym miesiącu – tabela przestawna albo SUMA.JEŻELI.`,
    `Tabela przestawna: wiersze – Data pogrupowana po miesiącach, wartości – suma Liczba_kg. Bez niej: kolumna =MIESIĄC(B2) i =SUMA.JEŻELI(…;1;$D$2:$D$2115) dla stycznia.`,
    `Wykres kolumnowy zrób z gotowego zestawienia; na osi X nazwy miesięcy. Dodaj tytuł.`,
  ],
  '7.4': [
    `Najpierw zrób zestawienie dostaw z każdego dnia (tabela przestawna: wiersze – Data z grupowaniem „dni”, wartości – suma Liczba_kg), a potem symuluj magazyn dzień po dniu.`,
    `Stan wieczorem = stan rano – przetworzone + dostawy, a przetworzone = MIN(stan rano; 3900). Rano 2.01 jest 5000 kg, więc w zestawieniu: C2 =5000-MIN(5000;3900)+B2, a C3 =C2-MIN(C2;3900)+B3.`,
    `Największy stan to MAKS z kolumny C (bez wiersza „Suma końcowa”), a datę odczytasz z kolumny A w tym samym wierszu, np. funkcjami INDEKS i PODAJ.POZYCJĘ.`,
  ],
  '7.5': [
    `Wpisz wydajność w osobnej komórce i użyj jej w symulacji z zadania 7.4 zamiast 3900.`,
    `Pełna moc w danym dniu oznacza, że rano w magazynie jest co najmniej tyle, ile wynosi wydajność. Policz dni, w których stan rano jest mniejszy od wydajności (LICZ.JEŻELI z warunkiem "<"&komórka), i zmieniaj wydajność – szukasz największej, przy której takich dni nie ma.`,
  ],
  '8.1': [
    `Liczą się tylko oceny z matematyki – przedmiot jest w tabeli Nauczyciele, a płeć w tabeli Uczniowie.`,
    `\`JOIN\` Oceny z Uczniowie i z Nauczyciele, \`WHERE Przedmiot = 'matematyka'\`, \`GROUP BY Plec\` i \`ROUND(AVG(Ocena), 2)\`.`,
  ],
  '8.2': [
    `Najpierw znajdź nauczycieli, którzy w grudniu 2023 wystawili choć jedną jedynkę – szukasz wszystkich pozostałych.`,
    `\`SELECT Id_Naucz FROM Nauczyciele WHERE Id_Naucz NOT IN (SELECT Id_Naucz FROM Oceny WHERE Ocena = 1 AND Data BETWEEN '2023-12-01' AND '2023-12-31')\`.`,
  ],
  '8.3': [
    `Najpierw policz, ile razy każda ocena pojawiła się w każdym miesiącu – grupowanie po miesiącu i ocenie.`,
    `Z takiego zestawienia wybierz w każdym miesiącu wiersz z najmniejszą liczbą, np. podzapytaniem z \`MIN\` dla tego samego miesiąca (wygodnie z \`WITH zestawienie AS (…)\`).`,
  ],
  '8.4': [
    `Łączysz kategorie z ocenami i liczysz oceny w każdej kategorii.`,
    `\`JOIN\` Kategorie z Oceny po \`Id_Kategorii\`, \`GROUP BY\` nazwa kategorii i \`COUNT(*)\`.`,
  ],
  '8.5': [
    `Zostaw tylko szóstki ze sprawdzianów, a potem policz je dla każdego ucznia.`,
    `\`JOIN\` Oceny z Kategorie, \`WHERE Nazwa_Kategorii = 'sprawdzian' AND Ocena = 6\`, \`GROUP BY Id_Ucznia\`, \`ORDER BY COUNT(*) DESC\` i pierwszy wiersz (\`TOP 1\` albo \`LIMIT 1\`).`,
  ],
};
