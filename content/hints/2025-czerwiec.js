// Hints for the June 2025 exam, from a nudge in the right direction to concrete steps.
// For code and SQL tasks the model solutions in content/solutions/2025-czerwiec come after
// these, revealed line by line in the editor. Spreadsheet formulas were checked with
// tools/sheet-eval.mjs.
export default {
  '1.1': [
    `Prześledź funkcję na małym przykładzie: dla *f*(42, 2) liczba *b* ma jedną cyfrę, więc wynik to *dopisz*(*f*(42, 0)) i dwa razy dodane *a*.`,
    `Funkcja liczy jak mnożenie pisemne: dla kolejnych cyfr *b* (od lewej) mnoży dotychczasowy wynik przez 10 (*dopisz*) i dodaje *a* tyle razy, ile wynosi ta cyfra.`,
    `Czyli *f*(*a*, *b*) = *a* · *b*. Sprawdź na przykładzie: *f*(4, 125) = 500.`,
  ],
  '1.2': [
    `Każde wywołanie z *b* > 0 usuwa ostatnią cyfrę *b* (*skróć*) i wywołuje *f* jeszcze raz – aż *b* = 0.`,
    `Wywołań jest tyle, ile cyfr ma *b*, plus jedno ostatnie – z *b* = 0.`,
  ],
  '1.3': [
    `W każdym wywołaniu instrukcja *w* ← *w* + *a* wykonuje się tyle razy, ile wynosi ostatnia cyfra bieżącego *b*.`,
    `Łącznie wykona się tyle razy, ile wynosi suma cyfr *b*. Dla *b* = 1000 – tylko raz.`,
  ],
  '2.1': [
    `Najpierw policz, ile cyfr ma *k*: dziel kopię *k* przez 10, aż zostanie 0.`,
    `Prawą połowę (*b*) zbieraj od końca, cyfra po cyfrze: *b* ← *b* + potęga · (*k* mod 10), *k* ← *k* div 10, potęga ← potęga · 10 – tyle razy, ile wynosi połowa liczby cyfr. To, co zostanie z *k*, jest lewą połową (*a*).`,
    `Krócej: jeśli *d* to połowa liczby cyfr, a *p* = 10<sup>*d*</sup> (policzone w pętli), to *a* = *k* div *p*, a *b* = *k* mod *p*.`,
  ],
  '2.2': [
    `Dla każdej liczby przetnij jej zapis na dwie równe połowy i policz NWD obu części.`,
    `Najprościej na napisie: *a* = \`int(s[:n // 2])\`, *b* = \`int(s[n // 2:])\` (w C++ \`substr\`, w Javie \`substring\`). Zera z przodu prawej połowy znikną same przy zamianie na liczbę. NWD policz algorytmem Euklidesa.`,
  ],
  '2.3': [
    `Dla każdej liczby *n* policz *n*², a potem sprawdź wszystkie miejsca, w których można przeciąć zapis *n*².`,
    `Zapis o długości *L* tnie się po 1, 2, …, *L* – 1 cyfrach: *a* to cyfry przed cięciem, *b* – po nim (zera z przodu *b* znikają). Licz cięcia z *a* + *b* ≤ *n* i zapamiętaj liczbę z największym wynikiem.`,
  ],
  '3.1': [
    `Najpierw wyciągnij z napisu wszystkie ukryte liczby – maksymalne ciągi kolejnych cyfr.`,
    `Idź po znakach i doklejaj cyfry do bieżącej liczby. Gdy trafisz na znak, który nie jest cyfrą, zapisz bieżącą liczbę (jeśli nie jest pusta) i zacznij od nowa. Nie zapomnij o liczbie na samym końcu napisu.`,
    `Liczby trzymaj jako napisy – łatwo wtedy sprawdzisz, czy zaczynają się od „50” (np. \`startswith\`).`,
  ],
  '3.2': [
    `Wystarczy zliczyć wystąpienia każdej cyfry 0–9 w napisie.`,
    `Użyj tablicy 10 liczników: dla każdego znaku, który jest cyfrą, zwiększ licznik[cyfra]. Potem znajdź największy licznik.`,
  ],
  '3.3': [
    `Numer telefonu to ukryta liczba o dokładnie 9 cyfrach – tak jak w 3.1, najpierw wyciągnij wszystkie liczby.`,
    `Wypisz, w kolejności z pliku, liczby o długości 9, które zaczynają się od cyfry 5. Ciągi 7- czy 10-cyfrowe się nie liczą.`,
  ],
  '3.4': [
    `Dla każdego numeru telefonu (9-cyfrowej liczby) policz, ile ma różnych cyfr.`,
    `Różne cyfry: \`len(set(numer))\` w Pythonie albo tablica 10 znaczników. Znajdź najmniejszą wartość i wypisz wszystkie numery, które ją mają – razem z zerami na początku.`,
  ],
  '4': [
    `Przypomnij sobie, ile kolorów może mieć obraz GIF i jakiej kompresji używa format JPG.`,
    `GIF ma paletę najwyżej 256 kolorów. JPG kompresuje obraz stratnie i nie ma kanału przezroczystości (ma go np. PNG).`,
  ],
  '5': [
    `Dodawaj kolumnami od prawej, tak jak dziesiętnie, ale przeniesienie pojawia się już przy 3: 2 + 2 = 11<sub>3</sub> (piszesz 1, przenosisz 1).`,
    `W każdej kolumnie: cyfra wyniku = (górna + dolna + przeniesienie) mod 3, a przeniesienie dalej = ta suma div 3. Brakującą cyfrę składnika wyliczysz z cyfry wyniku w tej samej kolumnie.`,
  ],
  '6.1': [
    `Zużycie jednego dnia to pobranie + produkcja – oddanie. Zsumuj je dla całego roku.`,
    `Najkrócej: =SUMA(G2:G366)+SUMA(E2:E366)-SUMA(F2:F366). Sprawdź się na styczniu – wychodzi 162,68 kWh.`,
  ],
  '6.2': [
    `Dla każdego dnia (od drugiego) sprawdź warunek: zachmurzenie nie wzrosło i produkcja nie zmalała w porównaniu z dniem poprzednim.`,
    `Długość bieżącego ciągu licz w kolumnie: H2 = 0, H3 =JEŻELI(ORAZ(D3<=D2;E3>=E2);H2+1;0), przeciągnij w dół. Największa wartość to długość szukanego ciągu.`,
    `Ciąg kończy się w wierszu z maksimum, a zaczyna o (długość – 1) wierszy wyżej. Dnia sprzed ciągu nie liczysz – pierwszym dniem jest pierwszy dzień spełniający warunek.`,
  ],
  '6.3': [
    `Najpierw dla każdego dnia policz liczbę godzin nasłonecznienia, a potem średnie dla każdej takiej liczby godzin.`,
    `Godziny są zapisane jako ułamek doby, więc =ZAOKR.DÓŁ((C2-B2)*24;0) da pełne godziny między wschodem a zachodem słońca.`,
    `Średnie: tabela przestawna (wiersze – liczba godzin, wartości – średnia; osobno dla produkcji, oddania i pobrania) albo =ŚREDNIA.JEŻELI($I$2:$I$366;7;E$2:E$366). Wykres liniowy: trzy serie, na osi X liczba godzin.`,
  ],
  '6.4': [
    `Śledź stan konta dzień po dniu: zaczyna się od 100 kWh, rośnie o 80% energii oddanej i maleje o energię pobraną.`,
    `J2 =100+0,8*F2-G2, J3 =J2+0,8*F3-G3 i przeciągnij w dół. Dni ze stanem poniżej 50 policzysz funkcją LICZ.JEŻELI(…;"<50"). Kontrola: na koniec stycznia stan wynosi 78,634.`,
    `b) Policz ten sam stan, ale zaczynając od 0 – najniższa wartość pokaże, ile najbardziej brakuje. Minimalny stan początkowy to =ZAOKR.GÓRA(-MIN(…);0).`,
  ],
  '7.1': [
    `Wydatki klienta to suma cen usług z jego wizyt – ceny są w tabeli uslugi.`,
    `\`JOIN\` wizyty z klienci i z uslugi, \`GROUP BY\` klient, \`SUM(cena)\`, posortuj malejąco i weź pierwszy wiersz.`,
  ],
  '7.2': [
    `Porównujesz imię klienta z imieniem fryzjera z tej samej wizyty.`,
    `\`JOIN\` wizyty z klienci i z fryzjerzy, \`WHERE klienci.imie = fryzjerzy.imie\`. Użyj \`DISTINCT\` (klient mógł przyjść do takiego fryzjera kilka razy) i \`ORDER BY\` imię.`,
  ],
  '7.3': [
    `Rabat dostają tylko emeryci (\`emeryt = 'TAK'\`), za usługi rozpoczęte od 10:00 do 12:00 włącznie. Rabat to 10% ceny usługi.`,
    `Godzinę wyciągniesz z pola termin, np. \`SUBSTR(termin, 12, 5)\` daje „14:00”. Zsumuj \`cena * 0.1\` dla wizyt spełniających oba warunki.`,
  ],
  '7.4': [
    `Szukasz fryzjerów z jakąkolwiek wizytą w kwietniu, których nie ma wśród fryzjerów robiących w kwietniu „Strzyzenie meskie”.`,
    `Podzapytanie: \`id_fryzjera\` z kwietniowych wizyt z usługą o nazwie 'Strzyzenie meskie'. Wynik: \`DISTINCT\` fryzjerzy z wizytami w kwietniu (\`MONTH(termin) = 4\`), których \`id_fryzjera NOT IN\` (podzapytanie).`,
  ],
  '7.5': [
    `Łączysz wizyty z fryzjerami (żeby wiedzieć, gdzie pracują), a fryzjerów z salonami.`,
    `\`JOIN\` wizyty – fryzjerzy po \`id_fryzjera\`, fryzjerzy – salony po \`id_salonu\`, \`WHERE nazwa_salonu = 'Magnolia'\` i \`SELECT DISTINCT id_klienta\`.`,
  ],
};
