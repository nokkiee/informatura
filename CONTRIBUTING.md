# Jak pomóc w rozwoju Informatury

Dzięki, że chcesz pomóc! Każde zgłoszenie błędu, poprawka literówki czy nowa lekcja przydają się
maturzystom. Przed pierwszym wkładem przeczytaj ten plik i [kodeks postępowania](CODE_OF_CONDUCT.md).

## Zgłaszanie błędów

Błędy i propozycje zgłaszaj w [Issues](https://github.com/nokkiee/informatura/issues). Najszybciej
pomogą nam:

- wersja programu (*Ustawienia → O programie*) i system (Windows / Linux, jaka dystrybucja),
- zadanie, którego to dotyczy, np. `2023-maj/6.1` (widać je w adresie i w nagłówku zadania),
- co zrobiłeś, czego się spodziewałeś, a co się stało – najlepiej ze zrzutem ekranu,
- przy błędach w kodzie: język i kompilator (*Ustawienia → Kompilatory i interpretery*).

Błąd w treści zadania albo w kluczu? Podaj stronę oryginalnego arkusza (przycisk *Arkusz PDF*).

Luk bezpieczeństwa **nie** zgłaszaj publicznie – zobacz [SECURITY.md](SECURITY.md).

## Zasady dotyczące treści

To najważniejsza część – program jest wiarygodny tylko wtedy, gdy treść jest wierna oryginałom.

- **Tylko prawdziwe zadania.** Wszystkie zadania pochodzą z matur z informatyki CKE (poziom rozszerzony,
  formuła 2023). Nie dodajemy zadań wymyślonych ani przerobionych. Treść, dane i klucz muszą zgadzać
  się z arkuszem i zasadami oceniania (sprawdza to `tools/audit-pdf.mjs`).
- **Podpowiedzi i przykładowe rozwiązania** (`content/hints/`, `content/solutions/`) piszemy sami, ale
  muszą dawać wynik zgodny z kluczem CKE – sprawdza to `tools/check-solutions.mjs`.
- **Lekcje** (`content/lessons/`) też piszemy sami i opisujemy je jako napisane dla programu. Każde
  rozwiązanie, przykład, zapytanie i formuła z lekcji jest uruchamiane przez `tools/check-lessons.mjs`
  (w Pythonie, C++ i Javie). Lekcję czyta się w jednym języku programowania – fragmenty tylko dla
  jednego języka oznaczasz blokami `:::python` … `:::` albo `[[cpp java: …]]` (opis w
  `content/lessons/lib.js` i `renderer/js/learn/langs.js`).
- Teksty w programie i w treściach są po polsku.

## Przygotowanie środowiska

Potrzebujesz [Node.js](https://nodejs.org/) 22 oraz kompilatorów, w których chcesz uruchamiać kod
(Python 3, g++ z C++17, JDK 11+ – szczegóły w README, sekcja *Czego potrzebujesz*).

```bash
npm ci
```

```bash
npm start
```

`npm run dev` uruchamia program z narzędziami deweloperskimi (F12).

## Testy

Przed wysłaniem zmian uruchom testy – te same uruchamia GitHub Actions dla każdego pull requesta:

```bash
npm test
```

```bash
npm run verify-content
```

```bash
npm run test:e2e
```

Testy e2e otwierają prawdziwe okno programu (na Linuksie bez ekranu użyj `xvfb-run -a npm run test:e2e`).
Zmiana w wyglądzie albo w zachowaniu? Dopisz albo popraw scenariusz w `test/e2e/scenarios/`.

## Kod

- Trzymaj się stylu otaczającego kodu: moduły ES w `renderer/js`, komentarze po angielsku, teksty
  interfejsu po polsku, kolory wyłącznie przez zmienne CSS z `renderer/css/app.css`.
- Małe, opisane zmiany są łatwiejsze do przejrzenia niż jedna wielka.
- Wiadomości commitów: krótka pierwsza linia mówiąca, co się zmieniło, a pod nią – w razie potrzeby –
  dlaczego.

## Pull requesty

1. Zrób fork i gałąź od `main`.
2. Wprowadź zmiany razem z testami i uruchom testy lokalnie.
3. Otwórz pull request z opisem: co zmieniasz, dlaczego i jak to sprawdziłeś (zrzut ekranu przy
   zmianach w wyglądzie).
4. Workflowy **Testy** i **Build aplikacji** muszą przejść.

Wysyłając zmiany, zgadzasz się, że będą udostępnione na tej samej licencji co projekt
(zob. [LICENSE](LICENSE)).
