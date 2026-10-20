// Hints for the May 2026 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2026-maj come after these,
// revealed line by line in the editor. Spreadsheet formulas were checked with tools/sheet-eval.mjs.
export default {
  '1.1': [
    `Każde wywołanie rekurencyjne zmienia *n*: gdy *n* jest parzyste – na *n*/2 (a *m* się podwaja), gdy nieparzyste – na (*n* – 1)/2 (*m* bez zmian). Wywołania kończą się, gdy *n* = 1.`,
    `Dla *A*(2<sup>5</sup>, 2<sup>5</sup>): *n* = 32 → 16 → 8 → 4 → 2 → 1, a *m* za każdym razem się podwaja – kolejne wywołania to *A*(2<sup>6</sup>, 2<sup>4</sup>), *A*(2<sup>7</sup>, 2<sup>3</sup>), …`,
    `Liczba wywołań to liczba dzieleń *n* przez 2 (z zaokrągleniem w dół), aż zostanie 1 – czyli liczba cyfr zapisu binarnego *n* minus 1. Liczba 2<sup>100</sup> + 1 ma 101 cyfr binarnych.`,
  ],
  '1.2': [
    `Sprawdź na małych liczbach, co właściwie liczy funkcja: *A*(3, 9) = 27, a ile wynosi np. *A*(2, 5)?`,
    `*A*(*m*, *n*) = *m* · *n* – funkcja mnoży przez podwajanie i połowienie. Wynik możesz wpisać w postaci z potęgą, np. \`512*10^12\`.`,
  ],
  '1.3': [
    `Dla *n* = 2<sup>*k*</sup> każde wywołanie dzieli *n* na pół (*n* jest stale parzyste), aż do 1.`,
    `*n* = 2<sup>*k*</sup>: wywołań jest *k*, a w *i*-tym wywołaniu *n* = 2<sup>*k* – *i*</sup>. Liczba 2<sup>*k*</sup> – 1 jest nieparzysta i (2<sup>*k*</sup> – 1 – 1)/2 = 2<sup>*k* – 1</sup> – 1, czyli znów „potęga dwójki minus 1”.`,
    `Dla 2<sup>*k*</sup> – 1 drugi argument w *i*-tym wywołaniu to 2<sup>*k* – *i*</sup> – 1. Wywołania kończą się na 2<sup>1</sup> – 1 = 1, czyli po *k* – 1 krokach.`,
  ],
  '2.1': [
    `Dodawaj pisemnie od prawej i licz kolumny, w których suma cyfr (razem z przeniesieniem z poprzedniej kolumny) wynosi co najmniej 10.`,
    `88765 + 11111: w żadnej kolumnie suma nie przekracza 9. 456789 + 222222: od prawej 9 + 2 = 11 (przeniesienie), 8 + 2 + 1 = 11 (przeniesienie), 7 + 2 + 1 = 10, …`,
  ],
  '2.2': [
    `Przechodź po cyfrach *a* i *b* jednocześnie, od końca: *a* mod 10 i *b* mod 10, potem *a* div 10 i *b* div 10.`,
    `Pamiętaj przeniesienie z poprzedniej kolumny (0 albo 1): suma = cyfra *a* + cyfra *b* + przeniesienie. Jeśli suma ≥ 10, przeniesienie = 1 i licznik rośnie o 1, w przeciwnym razie przeniesienie = 0.`,
  ],
  '3.1': [
    `Dla każdego wiersza policz sumy kodów ASCII obu słów i wartość bezwzględną różnicy tych sum.`,
    `Kod znaku: \`ord(c)\` w Pythonie, \`(int) c\` w C++ i Javie. Zapamiętaj wiersz z największą różnicą i wypisz oba słowa oraz tę różnicę.`,
  ],
  '3.2': [
    `Dla każdej pary policz, ile razy każda litera występuje w każdym ze słów.`,
    `Suma wspólnych wystąpień to suma min(liczba w *s*<sub>1</sub>, liczba w *s*<sub>2</sub>) po wszystkich literach a–z. Wygodnie użyć dwóch tablic po 26 liczników.`,
  ],
  '3.3': [
    `Sprawdź wszystkie długości *d* – od 1 do długości krótszego słowa – i oba kierunki: początek *s*<sub>1</sub> z końcem *s*<sub>2</sub> oraz początek *s*<sub>2</sub> z końcem *s*<sub>1</sub>.`,
    `Dla długości *d*: \`s1[:d] == s2[-d:]\` albo \`s2[:d] == s1[-d:]\`. Największe *d* spełniające któryś z warunków to długość najdłuższego prefiksosufiksu – wypisz pary z *d* ≥ 5.`,
    `Prefiksosufiks może być całym krótszym słowem – nie pomiń *d* równego jego długości.`,
  ],
  '4.1': [
    `Bezpośredni podwładni to pracownicy, których strzałka wskazuje na danego pracownika. Wszyscy podwładni to także podwładni tych podwładnych, i tak dalej.`,
    `Pracownik 1 ma bezpośrednio pracowników 2 i 4, a wszystkich podwładnych – siedmiu (wszystkich pozostałych). Pracownik 3 ma jednego podwładnego: 7.`,
  ],
  '4.2': [
    `Pracownik jest czyimś przełożonym, jeśli jego numer występuje gdzieś w pliku jako numer przełożonego.`,
    `Zbierz wszystkie numery z pliku (bez 0) w zbiorze albo w tablicy znaczników i policz pracowników, których tam nie ma.`,
  ],
  '4.3': [
    `Policz, ile razy każdy numer występuje w pliku – to liczba bezpośrednich podwładnych tego pracownika.`,
    `Tablica liczników o rozmiarze *n* + 1: dla każdego wiersza zwiększ licznik przełożonego (0 pomiń). Znajdź największy licznik i numer pracownika, do którego należy.`,
  ],
  '4.4': [
    `Liczba przełożonych pracownika to długość drogi od niego do prezesa: prezes ma 0, jego bezpośredni podwładni – 1 itd.`,
    `Przełożony ma zawsze mniejszy numer, więc wystarczy jedno przejście od 2 do *n*: przełożonych[*i*] = przełożonych[szef(*i*)] + 1. Potem znajdź maksimum i policz pracowników, którzy je mają.`,
  ],
  '5': [
    `Zamień znane liczby na system dziesiętny: 1440<sub>5</sub> i 110002<sub>3</sub>.`,
    `1440<sub>5</sub> = 125 + 4·25 + 4·5 = 245, a 110002<sub>3</sub> = 243 + 81 + 2 = 326. Brakująca liczba piątkowa to 427 – 245, a trójkowa – 427 + 326. Zamień je na właściwe systemy.`,
  ],
  '6': [
    `Adres IPv4 zapisuje się jako cztery liczby 0–255 oddzielone kropkami.`,
    `Każda z tych czterech liczb to 8 bitów. Adres IPv6 jest cztery razy dłuższy: osiem grup po cztery cyfry szesnastkowe, a każda cyfra szesnastkowa to 4 bity.`,
  ],
  '7.1': [
    `Potrzebujesz średniej temperatury w każdym miesiącu – tabela przestawna albo funkcja ŚREDNIA.JEŻELI.`,
    `Tabela przestawna: wiersze – Data pogrupowana po miesiącach, wartości – Temp, funkcja „Średnia”; zaokrąglij wyniki =ZAOKR(B2;1). Albo kolumna =MIESIĄC(A2) i =ZAOKR(ŚREDNIA.JEŻELI($D$2:$D$366;1;$B$2:$B$366);1).`,
    `Wykres kolumnowy zrób z gotowego zestawienia: na osi X miesiące, na osi Y średnia temperatura. Dodaj tytuł i opisy osi.`,
  ],
  '7.2': [
    `Dla każdego dnia policz, ile kolejnych dni bez opadów kończy się na tym dniu – ale na początku każdego miesiąca licz od nowa.`,
    `E2 =JEŻELI(C2=0;1;0), E3 =JEŻELI(C3=0;JEŻELI(MIESIĄC(A3)=MIESIĄC(A2);E2+1;1);0) i przeciągnij w dół. Długość najdłuższego ciągu w miesiącu to maksimum kolumny E w tym miesiącu.`,
    `Maksimum dla miesiąca: kolumna D =MIESIĄC(A2) i =MAKS.WARUNKÓW($E$2:$E$366;$D$2:$D$366;1) – albo tabela przestawna z funkcją „Maksimum”.`,
  ],
  '7.3': [
    `To symulacja dzień po dniu od 1 marca 2023 (rano 2000 m²). Potrzebujesz własnej kolumny z datami – w pliku są dane z 2022 roku.`,
    `W ciągu dnia amury zjadają 80 · 0,25 = 20 m², w piątki dochodzi 60 m² odłowu, a w nocy rzęsa rośnie o 1,75%. Rano następnego dnia jest więc (powierzchnia – zjedzone – odłowione) · 1,0175. Kontrola: 30 kwietnia rano – 25,79%.`,
    `W kolumnie H daty (=DATA(2023;3;1), potem =H2+1), w I =DZIEŃ.TYG(H2;2) (piątek to 5), w J2 2000, a w J3 =(J2-80*0,25-JEŻELI(I2=5;60;0))*1,0175. Pierwszy dzień powyżej 7500 m² znajdziesz kolumną =JEŻELI(J2>7500;1;0) i funkcją PODAJ.POZYCJĘ.`,
  ],
  '7.4': [
    `Użyj symulacji z zadania 7.3, ale liczbę amurów wpisz w osobnej komórce i odwołuj się do niej we wzorze (np. $L$1*0,25 zamiast 80*0,25).`,
    `Zmieniaj liczbę amurów i patrz na największą powierzchnię w całym okresie (MAKS z kolumny J). Szukasz najmniejszej liczby, przy której nie przekracza ona 5000 m² (50% stawu).`,
  ],
  '8.1': [
    `Policz transakcje każdego klienta i wybierz klienta z największą liczbą.`,
    `\`JOIN\` Transakcje z Klienci po \`IdKlienta\`, \`GROUP BY\` klient, \`COUNT(*)\`, posortuj malejąco i weź pierwszy wiersz.`,
  ],
  '8.2': [
    `Klient niczego nie kupił, jeśli jego identyfikatora nie ma w tabeli Transakcje.`,
    `\`SELECT Plec, COUNT(*) FROM Klienci WHERE IdKlienta NOT IN (SELECT IdKlienta FROM Transakcje) GROUP BY Plec\`.`,
  ],
  '8.3': [
    `Transakcje w kasie samoobsługowej mają puste pole \`IdSprzedawcy\` – w bazie to wartość NULL.`,
    `Liczba sklepów: \`COUNT(DISTINCT IdSklepu)\` z warunkiem \`IdSprzedawcy IS NULL\` (a nie \`= NULL\`, które nigdy nie jest prawdziwe). Kwota: \`SUM(Cena * Liczba)\` z Opis_transakcji dla tych transakcji.`,
  ],
  '8.4': [
    `Dla każdej pary (sprzedawca, miesiąc) policz różne sklepy, w których ten sprzedawca obsługiwał klientów.`,
    `\`GROUP BY IdSprzedawcy, MONTH(DataTransakcji)\` z \`COUNT(DISTINCT IdSklepu)\`; pomiń transakcje bez sprzedawcy (\`IS NOT NULL\`) i weź wiersz z największą liczbą sklepów.`,
  ],
  '8.5': [
    `Potrzebujesz produktów, które ktoś kupił (są w Opis_transakcji), razem z ich nazwą, opisem i kategorią.`,
    `\`JOIN\` Opis_transakcji – Produkty po \`IdProduktu\` i Produkty – Kategorie po \`IdKategorii\`; \`WHERE NazwaKategorii = 'spozywcze' AND Opis LIKE '%do ekspresu kolbowego%'\`.`,
  ],
};
