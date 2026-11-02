# Historia zmian

Wszystkie ważniejsze zmiany w Informaturze. Pliki do pobrania każdej wersji (z sumami kontrolnymi
od wersji 1.3.1) są na stronie [Releases](https://github.com/nokkiee/informatura/releases).
Numery wersji: zmiana środkowej liczby to nowe funkcje, ostatniej – poprawki i drobne zmiany.

## [Nieopublikowane]

Zmiany w repozytorium, które trafią do następnej wersji programu (sam program się nie zmienił).

- Formularze zgłoszeń (*Błąd w programie*, *Błąd w treści zadania*, *Propozycja*) i szablon pull requesta.
- Ta historia zmian.
- Workflow *Sumy kontrolne* sam dołącza `SHA256SUMS.txt` do każdego publikowanego wydania;
  [SECURITY.md](SECURITY.md) opisuje, jak sprawdzić pobrany plik.
- Obrazek podglądu repozytorium (`docs/social-preview.png`).
- Strona projektu na GitHub Pages: [nokkiee.github.io/informatura](https://nokkiee.github.io/informatura/) – opis,
  zrzuty ekranu, pobieranie najnowszej wersji, wymagania i najczęstsze pytania.
- Testy e2e czekają dłużej na pierwszy start programu na świeżym runnerze Windows.

## [1.3.1] – 2026-11-02

Sam program działa tak samo jak w 1.3.0.

- Dokumenty dla współtwórców: [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md) i
  [kodeks postępowania](CODE_OF_CONDUCT.md).
- Prywatne zgłaszanie luk bezpieczeństwa (*Security → Report a vulnerability*).
- README z wyśrodkowanym logo i odznakami.
- Automatyczne sprawdzanie podzielone na workflowy *Testy* i *Build aplikacji*; każda zbudowana
  wersja programu jest uruchamiana testowo.
- Plik `SHA256SUMS.txt` z sumami kontrolnymi przy wydaniu – od teraz dołączany automatycznie przez
  workflow *Sumy kontrolne* przy publikacji każdego wydania.

## [1.3.0] – 2026-11-01

### Nowy wygląd
- Spokojny, ciemny interfejs: prawie czarne tła, płaskie karty z cienką ramką i jeden miętowy kolor
  akcentu. Jasny motyw w tej samej palecie.
- Pasek z boku: Start, Lekcje, Arkusze, Zadania, Losuj, a na dole Ustawienia.
- Górny pasek z wyszukiwarką zadań (treść, numery i tematy) i przyciskiem *Losuj zadanie*.
- Edytor kodu, arkusz kalkulacyjny i wykresy w tych samych kolorach.
- Nowa ikona aplikacji w tym samym stylu.

## [1.2.3] – 2026-10-28

### Nowości
- Tabela przestawna jak w Excelu: panel *Pola tabeli przestawnej* z przeciąganiem pól między
  filtrami, kolumnami, wierszami i wartościami, który na bieżąco przebudowuje tabelę. Kilka wartości
  naraz, grupowanie dat, sumy częściowe i końcowe; układ zapisuje się z zadaniem.
- *Suma częściowa* (jak *Dane → Suma częściowa* w Excelu) z funkcją `SUMY.CZĘŚCIOWE`.
- W zadaniach z programowania do wyboru są tylko języki zainstalowane na komputerze.

### Poprawki
- Tabela przestawna z polem o wielu różnych wartościach w kolumnach nie powstawała, a każde kolejne
  kliknięcie *Utwórz* dokładało pusty arkusz.
- Przyciski w oknach dialogowych nie reagują na wielokrotne kliknięcia i zawsze pokazują błąd.
- Na stronie startowej kliknięta ikonka języka znów się podświetla.

## [1.2.2] – 2026-10-28

- Pasek u góry bez przełącznika języka programowania – język wybiera się w zadaniu, w lekcji, na
  stronie startowej albo w *Ustawieniach* (to jedno wspólne ustawienie).

## [1.2.1] – 2026-10-25

- Osobny reset postępu w lekcjach: w *Ustawieniach → Postęp* są przyciski *Wyzeruj wyniki zadań* i
  *Wyzeruj postęp lekcji*.

## [1.2.0] – 2026-10-25

- Nowa zakładka **Lekcje**: 32 lekcje w 5 działach (programowanie, algorytmika, bazy danych, arkusz
  kalkulacyjny, teoria) z przykładami do uruchomienia, testem po każdej lekcji i testem z działu.
  Lekcje, przykłady i ćwiczenia napisano dla programu i są sprawdzane automatycznie.
- Lekcję czyta się w jednym języku programowania (Python, C++ albo Java) – tekst, przykłady, pytania
  i rozwiązania dotyczą tylko wybranego języka.

## [1.1.0] – 2026-10-25

### Nowości
- Podpowiedzi w edytorze jak w VS Code: szary tekst przy kursorze, kolejne linijki pod nim, Tab
  wpisuje linijkę, Esc chowa podpowiedź.
- Ustawienie *Kod na start*: szablon wczytujący dane albo pusty edytor, jak na maturze.
- Pole *Czyść przy uruchomieniu* w konsoli.
- *Pokaż rozwiązanie* po drugim kliknięciu chowa rozwiązanie.
- Kolumny arkusza same się poszerzają, więc daty i liczby nie zamieniają się w `###`.

### Poprawki
- Menu pod prawym przyciskiem w edytorze jest czytelne i po polsku.
- Fragment treści zadania 5 z maja 2025 wyświetlał się jak blok kodu.
- Wszystkie 175 zadań porównano automatycznie z oryginalnymi arkuszami PDF – bez niezgodności.

## [1.0.1] – 2026-10-21

- Nowe logo: czapka absolwenta w prawidłowych proporcjach, założona na okno terminala.

## [1.0.0] – 2026-10-21

Pierwsze wydanie.

- 8 matur z informatyki (maj i czerwiec 2023–2026): 175 zadań, 400 punktów – cały arkusz zadanie po
  zadaniu, symulacja egzaminu z zegarem albo losowe zadania.
- Programowanie w Pythonie, C++ i Javie z wbudowanymi plikami danych, SQL na wbudowanej bazie,
  arkusz kalkulacyjny z polskimi funkcjami i zadania teoretyczne.
- Podpowiedzi do każdego zadania i przykładowe rozwiązania zgodne z kluczem CKE.

[1.3.1]: https://github.com/nokkiee/informatura/releases/tag/v1.3.1
[1.3.0]: https://github.com/nokkiee/informatura/releases/tag/v1.3.0
[1.2.3]: https://github.com/nokkiee/informatura/releases/tag/v1.2.3
[1.2.2]: https://github.com/nokkiee/informatura/releases/tag/v1.2.2
[1.2.1]: https://github.com/nokkiee/informatura/releases/tag/v1.2.1
[1.2.0]: https://github.com/nokkiee/informatura/releases/tag/v1.2.0
[1.1.0]: https://github.com/nokkiee/informatura/releases/tag/v1.1.0
[1.0.1]: https://github.com/nokkiee/informatura/releases/tag/v1.0.1
[1.0.0]: https://github.com/nokkiee/informatura/releases/tag/v1.0.0
