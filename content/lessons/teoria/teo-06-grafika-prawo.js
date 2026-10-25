import { md, code } from '../lib.js';

export default {
  title: 'Grafika, pliki i prawo autorskie',
  summary: 'Grafika rastrowa i wektorowa, rozdzielczość i głębia koloru, rozmiar obrazu i dźwięku, formaty plików i kompresja, prawo autorskie i licencje.',
  minutes: 30,
  intro: md`
    - czym różni się grafika rastrowa od wektorowej,
    - jak policzyć rozmiar nieskompresowanego obrazu i dźwięku,
    - cechy popularnych formatów (BMP, PNG, JPG, GIF, SVG) i różnica między kompresją stratną a bezstratną,
    - podstawy prawa autorskiego i najważniejsze rodzaje licencji.
  `,
  steps: [
    {
      title: 'Raster i wektor',
      body: md`
        **Grafika rastrowa (bitmapowa)** to siatka **pikseli**, każdy z własnym kolorem (zdjęcia, skany). Powiększona traci jakość – widać „schodki”.

        **Grafika wektorowa** opisuje obraz **figurami** (linie, krzywe, wielokąty, tekst) i ich parametrami. Można ją dowolnie powiększać bez utraty jakości – nadaje się do logo, schematów, czcionek. Format: SVG (a także PDF z grafiką wektorową).

        **Rozdzielczość** obrazu rastrowego to liczba pikseli (np. 1920 × 1080). **Głębia koloru** to liczba bitów na piksel:
        - 1 bit – 2 kolory (czarno-biały),
        - 8 bitów – 256 kolorów (np. z palety),
        - 24 bity – 2²⁴ ≈ 16,7 mln kolorów (po bajcie na R, G, B),
        - 32 bity – 24 bity koloru + 8 bitów przezroczystości (kanał alfa).

        **Rozmiar nieskompresowanego obrazu** = szerokość · wysokość · bity na piksel / 8 (w bajtach). Obraz 1920 × 1080 w 24 bitach: 1920 · 1080 · 3 = **6 220 800 B** ≈ 5,9 MiB.

        Podobnie **dźwięk**: częstotliwość próbkowania · bity na próbkę · liczba kanałów · czas / 8. Minuta stereo, 44,1 kHz, 16 bitów: 44 100 · 16 · 2 · 60 / 8 = 10 584 000 B ≈ 10 MB.
      `,
    },
    {
      title: 'Formaty i kompresja',
      body: md`
        **Kompresja bezstratna** zmniejsza plik tak, że da się odtworzyć dokładnie oryginał (ZIP, PNG, FLAC). **Stratna** usuwa szczegóły mało widoczne/słyszalne dla człowieka – plik jest dużo mniejszy, ale oryginału nie da się odtworzyć (JPG, MP3, większość wideo).

        | format | typ | kompresja | kolory / cechy |
        |---|---|---|---|
        | **BMP** | raster | zwykle brak | pełne kolory, duże pliki |
        | **PNG** | raster | bezstratna | pełne kolory, **przezroczystość** (kanał alfa) |
        | **JPG / JPEG** | raster | **stratna** | pełne kolory, **brak przezroczystości**; dobry do zdjęć |
        | **GIF** | raster | bezstratna | **najwyżej 256 kolorów**, animacje, przezroczystość jednego koloru |
        | **SVG** | wektor | – | skalowanie bez utraty jakości |

        Typowe pułapki z pytań prawda/fałsz:
        - GIF **nie** zapisze zdjęcia w 16 mln kolorów bez straty (ma limit 256 kolorów),
        - JPG **nie** obsługuje przezroczystości,
        - wielokrotne zapisywanie JPG pogarsza jakość (każdy zapis to kolejna kompresja stratna).

        > **Na maturze:** Pytania o formaty graficzne (np. czerwiec 2025: GIF, JPG, przezroczystość) wymagają znajomości tej tabeli.
      `,
    },
    {
      title: 'Prawo autorskie',
      body: md`
        **Utwór** to każdy przejaw twórczości o indywidualnym charakterze – tekst, zdjęcie, muzyka, **program komputerowy**, grafika. Ochrona prawna powstaje **automatycznie** z chwilą ustalenia utworu (zapisania, nagrania), **bez żadnych formalności** – rejestracji, znaku ©, opłat.

        Prawa autora dzielą się na:
        - **osobiste** – autorstwo, oznaczenie utworu nazwiskiem, nienaruszalność treści; są **bezterminowe** i nie można ich sprzedać ani się ich zrzec,
        - **majątkowe** – prawo do korzystania z utworu i zarabiania na nim (rozpowszechnianie, kopiowanie, sprzedaż); można je **przenieść** (sprzedać) albo udzielić **licencji**; wygasają zwykle **70 lat** po śmierci autora.

        **Programy komputerowe** są chronione podobnie jak utwory literackie, ale z węższym **dozwolonym użytkiem**: wolno m.in. zrobić kopię zapasową, jeśli jest potrzebna do korzystania z programu, ale nie wolno go swobodnie kopiować znajomym „do użytku osobistego”, tak jak np. płyty z muzyką.

        **Plagiat** to przypisanie sobie autorstwa cudzego utworu. Cytat jest dozwolony – w uzasadnionym zakresie i z podaniem autora i źródła.
      `,
    },
    {
      title: 'Licencje',
      body: md`
        **Licencja** to umowa określająca, jak wolno korzystać z utworu (programu). Najważniejsze rodzaje:

        | licencja | co wolno |
        |---|---|
        | **komercyjna** (np. BOX, OEM) | używać po zakupie, na warunkach umowy; OEM – przypisana do sprzętu, z którym ją kupiono |
        | **freeware** | używać za darmo (ale zwykle bez prawa do modyfikacji i sprzedaży) |
        | **shareware / trial** | wypróbować przez pewien czas lub z ograniczeniami, potem trzeba zapłacić |
        | **open source** (np. **GPL**, MIT) | używać, poznawać kod źródłowy, modyfikować i rozpowszechniać; GPL wymaga, by zmodyfikowane wersje też były na GPL (**copyleft**) |
        | **domena publiczna** | wszystko – prawa majątkowe wygasły lub autor się ich zrzekł |
        | **Creative Commons** | zależnie od oznaczeń: **BY** – podaj autora, **SA** – udostępniaj na tych samych warunkach, **NC** – bez użytku komercyjnego, **ND** – bez utworów zależnych (zmian) |

        Przykład: zdjęcie na licencji **CC BY-NC** możesz wykorzystać na szkolnej stronie z podaniem autora, ale nie w reklamie sklepu.

        > **Uwaga:** „Darmowe” nie znaczy „bez praw autorskich” – freeware też ma licencję, która może np. zabraniać użytku w firmie. A kod open source też ma autora i licencję, której warunków trzeba przestrzegać.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Ile **bajtów** zajmie nieskompresowany obraz o rozdzielczości 800 × 600 pikseli i głębi koloru **8 bitów** na piksel?`,
      answer: String((800 * 600 * 8) / 8),
      explain: md`800 · 600 · 8 bitów / 8 = 480 000 bajtów (każdy piksel to 1 bajt).`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań o formatach graficznych.`,
      items: [
        { text: 'Format GIF pozwala zapisać zdjęcie w 16 milionach kolorów bez utraty informacji o kolorach.', answer: false },
        { text: 'W plikach JPG stosuje się kompresję stratną.', answer: true },
        { text: 'Format PNG obsługuje przezroczystość.', answer: true },
        { text: 'Grafikę wektorową można powiększać bez utraty jakości.', answer: true },
      ],
      explain: md`
        - Nie – GIF ma najwyżej 256 kolorów.
        - Tak.
        - Tak – ma kanał alfa.
        - Tak – to opis figur, a nie siatka pikseli.
      `,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań o prawie autorskim.`,
      items: [
        { text: 'Utwór jest chroniony prawem autorskim dopiero po zarejestrowaniu go w urzędzie.', answer: false },
        { text: 'Programy komputerowe są utworami chronionymi prawem autorskim.', answer: true },
        { text: 'Autorskie prawa osobiste można sprzedać.', answer: false },
        { text: 'Licencja GPL pozwala modyfikować program, ale zmienione wersje też trzeba udostępniać na GPL.', answer: true },
      ],
      explain: md`
        - Nie – ochrona powstaje automatycznie, bez formalności.
        - Tak.
        - Nie – osobiste są niezbywalne; sprzedać (przenieść) można prawa **majątkowe**.
        - Tak – to tzw. copyleft.
      `,
    },
    {
      type: 'choice',
      q: md`Zdjęcie jest na licencji **CC BY-NC**. Co wolno z nim zrobić?`,
      options: [
        'umieścić na szkolnej stronie (niekomercyjnie), podając autora',
        'użyć w płatnej reklamie, podając autora',
        'opublikować jako własne, bez podawania autora',
        'sprzedawać odbitki',
      ],
      answer: 0,
      explain: md`BY – trzeba podać autora; NC – bez użytku komercyjnego. Reklama i sprzedaż to użytek komercyjny, a pominięcie autora łamie warunek BY.`,
    },
    {
      type: 'code',
      q: md`Wczytaj szerokość \`w\`, wysokość \`h\` (w pikselach) i głębię koloru \`b\` (bity na piksel). Wypisz rozmiar nieskompresowanego obrazu w **bajtach**, zaokrąglony **w górę** do pełnego bajtu (gdy liczba bitów nie dzieli się przez 8).`,
      tests: [
        { input: '1920 1080 24\n', output: '6220800\n' },
        { input: '800 600 8\n', output: '480000\n' },
        { input: '3 3 1\n', output: '2\n' },
        { input: '1 1 1\n', output: '1\n' },
        { input: '1000 1000 32\n', output: '4000000\n' },
        { input: '7 5 4\n', output: '18\n' },
      ],
      solution: {
        python: code`
          w, h, b = map(int, input().split())
          bity = w * h * b
          print((bity + 7) // 8)
        `,
        cpp: code`
          #include <iostream>
          using namespace std;

          int main() {
              long long w, h, b;
              cin >> w >> h >> b;
              long long bity = w * h * b;
              cout << (bity + 7) / 8 << endl;
              return 0;
          }
        `,
        java: code`
          import java.util.*;

          public class Main {
              public static void main(String[] args) {
                  Scanner sc = new Scanner(System.in);
                  long w = sc.nextLong(), h = sc.nextLong(), b = sc.nextLong();
                  long bity = w * h * b;
                  System.out.println((bity + 7) / 8);
              }
          }
        `,
      },
      explain: md`Liczba bitów to \`w · h · b\`; dzielenie przez 8 **w górę** to \`(bity + 7) div 8\` – sztuczka, która działa dla liczb całkowitych bez zaokrąglania liczb rzeczywistych. Obraz 3 × 3 w 1 bicie ma 9 bitów, czyli potrzebuje 2 bajtów.`,
    },
  ],
  practice: ['2025-czerwiec/4', '2024-czerwiec/5', '2023-czerwiec/5'],
};
