# Bezpieczeństwo

## Wspierane wersje

Poprawki bezpieczeństwa trafiają do najnowszego wydania. Jeśli masz starszą wersję, zaktualizuj ją
z [Releases](https://github.com/nokkiee/informatura/releases/latest).

| Wersja | Wsparcie |
|---|---|
| najnowsze wydanie | ✅ |
| starsze wydania | ❌ |

## Jak zgłosić lukę

**Nie zgłaszaj luk bezpieczeństwa w publicznych Issues.** Użyj prywatnego zgłoszenia na GitHubie:
zakładka **Security → Report a vulnerability** w tym repozytorium. Zgłoszenie zobaczy tylko opiekun
projektu.

W zgłoszeniu napisz:

- czego dotyczy luka i jakie może mieć skutki,
- jak ją odtworzyć (wersja programu, system, kroki, ewentualnie plik albo kod),
- jeśli wiesz – jak można ją naprawić.

Postaram się odpowiedzieć w ciągu kilku dni. Gdy luka się potwierdzi, przygotuję poprawkę i nowe
wydanie, a w opisie wydania podziękuję za zgłoszenie (o ile nie wolisz pozostać anonimowy).

## Jak działa program (co jest, a co nie jest luką)

- **Kod uruchamiasz na swoim komputerze.** Programy w Pythonie, C++ i Javie wpisane w edytorze są
  uruchamiane lokalnie zainstalowanym kompilatorem albo interpreterem, z Twoimi uprawnieniami, w
  folderze roboczym zadania – tak samo, jak gdybyś uruchomił je z terminala. Nie są zamknięte w
  piaskownicy, więc uruchamiaj tylko kod, który rozumiesz (np. nie wklejaj w ciemno kodu z internetu).
  Samo to nie jest luką.
- **Program nie łączy się z internetem** i nie wysyła żadnych danych. Linki do stron otwierają się w
  Twojej przeglądarce. Postępy, kod i ustawienia są zapisywane tylko na Twoim komputerze.
- **Pliki instalacyjne nie są podpisane cyfrowo.** Pobieraj je tylko z
  [Releases](https://github.com/nokkiee/informatura/releases) w tym repozytorium.

Za lukę uważamy na przykład: wykonanie kodu albo poleceń bez Twojej wiedzy (np. przez treść zadania,
plik z danymi albo zapisany stan programu), dostęp do plików spoza folderu programu i folderu
roboczego bez Twojego działania albo obejście zabezpieczeń okna programu (Content Security Policy,
izolacja kontekstu).
