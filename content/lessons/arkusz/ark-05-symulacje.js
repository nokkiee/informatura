import { md } from '../lib.js';
import { ZBIORNIK } from './dane.js';

// A: day, B: rainfall, C: water at the end of the day, D: days in a row without rain;
// row 2 is "day 0" with the starting state; parameters in F1:G4
const PARAMS = [
  ['pojemnosc_l', 350],
  ['stan_poczatkowy_l', 120],
  ['podlewanie_l', 45],
  ['dach_m2', 15],
];
const STAN = '=MAKS(0;MIN($G$1;C{p}+B{r}*$G$4)-$G$3)';
const SERIA = '=JEŻELI(B{r}=0;D{p}+1;0)';
function build(filled) {
  const rows = [['dzien', 'opad_mm', 'stan_l', 'seria_bez_deszczu', null, ...PARAMS[0]]];
  rows.push([0, null, 120, 0, null, ...PARAMS[1]]);
  ZBIORNIK.slice(1).forEach(([d, o], i) => {
    const r = i + 3;
    const fill = (f) => f.replaceAll('{r}', r).replaceAll('{p}', r - 1);
    const extra = PARAMS[i + 2] ? [null, ...PARAMS[i + 2]] : [];
    rows.push([d, o, filled ? fill(STAN) : null, filled ? fill(SERIA) : null, ...extra]);
  });
  return rows;
}
const data = build(false);
const policzone = build(true);

export default {
  title: 'Symulacje dzień po dniu i serie',
  summary: 'Stan „na koniec dnia” liczony z poprzedniego wiersza, parametry w osobnych komórkach, ograniczenia MIN / MAKS, najdłuższe serie, pierwszy dzień spełniający warunek.',
  minutes: 40,
  sheet: { data },
  intro: md`
    - jak modelować coś, co zmienia się z dnia na dzień (zbiornik, magazyn, staw, liczba osób),
    - dlaczego parametry trzyma się w osobnych komórkach,
    - jak ograniczyć wartość z góry i z dołu (\`MIN\`, \`MAKS\`),
    - jak liczyć **serie** – najdłuższy ciąg kolejnych dni spełniających warunek,
    - jak znaleźć pierwszy dzień, w którym coś się wydarzyło.
  `,
  steps: [
    {
      title: 'Model dzień po dniu',
      body: md`
        Najtrudniejsze zadania z arkusza na maturze to **symulacje**: coś ma stan (woda w stawie, towar w magazynie, liczba kuracjuszy), który każdego dnia zmienia się według reguł. Klucz: **wiersz = dzień**, a stan na koniec dnia liczy się ze **stanu z poprzedniego wiersza**.

        Przykład w tej lekcji – zbiornik na deszczówkę:
        - pojemność **350 l**, na początku (dzień 0) jest w nim **120 l**,
        - deszcz spływa z dachu o powierzchni **15 m²**: każdy milimetr opadu to 15 litrów (1 mm na 1 m² = 1 litr),
        - nadmiar ponad pojemność się przelewa i ginie,
        - każdego dnia, **po** dopływie wody, ogród podlewa się **45 l** – a jeśli wody jest mniej, zużywa się tyle, ile jest.

        ~~~sheet 8
        ~~~

        Wiersz 2 to **dzień 0** ze stanem początkowym. Dzięki temu formuła dla dnia 1 (wiersz 3) może wyglądać tak samo jak dla każdego kolejnego dnia – odwołuje się do wiersza wyżej.

        > **Wskazówka:** Parametry (pojemność, zużycie, powierzchnia) trzymaj w osobnych komórkach (tu F1:G4) i odwołuj się do nich adresami bezwzględnymi. Zadania maturalne często mają kolejne części typu „a gdyby zbiornik miał 500 l?” – wtedy zmieniasz jedną komórkę zamiast poprawiać formuły.
      `,
    },
    {
      title: 'Formuła stanu: MIN i MAKS',
      body: md`
        Rozpisz regułę na kroki dla jednego dnia (wiersz 3, dzień 1):

        1. woda po deszczu: \`C2 + B3*$G$4\` (stan wczorajszy + opad · dach),
        2. przelew – nie więcej niż pojemność: \`MIN($G$1; …)\`,
        3. podlewanie – odejmij 45 l, ale nie zejdź poniżej zera: \`MAKS(0; … - $G$3)\`.

        Razem:

        ~~~excel
        =MAKS(0;MIN($G$1;C2+B3*$G$4)-$G$3)
        ~~~

        \`MIN(górna_granica; x)\` obcina wartość z góry, \`MAKS(0; x)\` – z dołu. To najczęstsza para w symulacjach.

        ~~~excel run
        =MAKS(0;MIN($G$1;120+B3*$G$4)-$G$3)
        =MIN(350;300+12*15)
        ~~~

        Pierwsza formuła to stan na koniec dnia 1: 120 + 1·15 = 135, po podlaniu 90 l. Druga pokazuje przelew: 300 + 180 = 480, ale zbiornik mieści 350.

        > **Uwaga:** Kolejność kroków ma znaczenie! „Najpierw podlewanie, potem deszcz” da inne wyniki niż „najpierw deszcz, potem podlewanie”. Czytaj treść zadania słowo po słowie i trzymaj się kolejności z opisu.

        Gdy reguła jest bardziej złożona (np. podlewanie tylko w dni bez deszczu), rozbij ją na **kilka kolumn**: dopływ, stan po dopływie, zużycie, stan końcowy. Każdą kolumnę łatwo sprawdzić ręcznie na pierwszych wierszach.
      `,
    },
    {
      title: 'Serie kolejnych dni',
      body: md`
        *„Ile trwał najdłuższy okres kolejnych dni bez deszczu?”* – kolumna pomocnicza **licznika serii**: jeśli dziś nie padało, seria = wczorajsza seria + 1, w przeciwnym razie 0.

        ~~~excel
        =JEŻELI(B3=0;D2+1;0)
        ~~~

        W kolumnie D powstaje ciąg 0, 1, 2, 0, 0, …, a **największa** wartość w kolumnie to długość najdłuższej serii. Koniec tej serii jest w wierszu z maksimum, a początek – o (długość − 1) wierszy wcześniej.

        Ten sam schemat działa dla dowolnego warunku: „kolejne dni ze wzrostem temperatury” (\`=JEŻELI(B3>B2;D2+1;0)\`), „kolejne dni, w których magazyn był pełny” itd.

        > **Na maturze:** Zadanie z maja 2026 („Staw”) pyta właśnie o najdłuższy ciąg dni bez opadów – osobno dla każdego miesiąca. Wtedy licznik trzeba też **zerować na początku miesiąca**: \`=JEŻELI(ORAZ(B3=0;MIESIĄC(A3)=MIESIĄC(A2));D2+1;JEŻELI(B3=0;1;0))\`.
      `,
    },
    {
      title: 'Pierwszy dzień i zliczanie',
      body: md`
        Gdy kolumny symulacji są policzone, odpowiedzi to proste formuły na nich. W tej tabeli kolumny C i D są już wypełnione formułami z poprzednich kroków:

        - **ile dni** zbiornik był pusty na koniec dnia: \`=LICZ.JEŻELI(C3:C32;0)\`,
        - **pierwszy dzień**, w którym był pusty: \`=PODAJ.POZYCJĘ(0;C3:C32;0)\` – pozycja w zakresie od dnia 1, więc to od razu numer dnia (przy datach: \`INDEKS(A3:A32;…)\`),
        - **największy stan** i kiedy był: \`MAKS\` i \`PODAJ.POZYCJĘ(MAKS(…);…;0)\`,
        - **pierwszy dzień, w którym stan przekroczył próg**: kolumna pomocnicza \`=JEŻELI(C3>300;1;0)\` i \`PODAJ.POZYCJĘ(1;…;0)\`.

        > **Wskazówka:** Pytanie typu „jaka najmniejsza pojemność wystarczy, żeby…” rozwiązuje się, zmieniając parametr i obserwując wynik – ręcznie albo metodą połowienia (spróbuj 500, potem 250, potem 375…). Właśnie po to parametry są w osobnych komórkach.
      `,
    },
  ],
  quiz: [
    {
      type: 'input',
      q: md`Na początku dnia w zbiorniku jest 340 l (pojemność 350 l). Spadło 4 mm deszczu (dach 15 m²), potem podlano ogród (45 l). Ile litrów jest w zbiorniku na koniec dnia?`,
      answer: '305',
      explain: md`340 + 4·15 = 400, ale zbiornik mieści 350 – nadmiar się przelewa. 350 − 45 = 305.`,
    },
    {
      type: 'choice',
      q: md`Po co w tabeli symulacji wiersz „dzień 0” ze stanem początkowym?`,
      options: [
        'żeby formuła dla pierwszego dnia była taka sama jak dla kolejnych i dało się ją po prostu skopiować',
        'bo arkusz nie pozwala zaczynać danych od wiersza 2',
        'żeby wykres zaczynał się od zera',
        'nie ma znaczenia – to tylko ozdoba',
      ],
      answer: 0,
      explain: md`Każdy dzień liczy stan z wiersza powyżej. Gdy nad pierwszym dniem jest wiersz ze stanem początkowym, jedna formuła działa dla całej kolumny.`,
    },
    {
      type: 'tf',
      q: md`Oceń prawdziwość zdań.`,
      items: [
        { text: '`MIN(350; x)` ogranicza wartość x z góry do 350.', answer: true },
        { text: '`MAKS(0; x)` sprawia, że wynik nigdy nie jest ujemny.', answer: true },
        { text: 'Licznik serii `=JEŻELI(B3=0;D2+1;0)` daje w każdym wierszu długość całej serii, do której należy ten dzień.', answer: false },
        { text: 'Kolejność reguł (np. najpierw deszcz, potem podlewanie) może zmienić wynik symulacji.', answer: true },
      ],
      explain: md`
        - Tak.
        - Tak.
        - Nie – licznik pokazuje, który to **kolejny** dzień serii (długość do tej pory). Długość całej serii widać dopiero w jej ostatnim dniu – stąd \`MAKS\` kolumny.
        - Tak – np. przy pełnym zbiorniku „najpierw podlewanie” zrobi miejsce na deszcz.
      `,
    },
    {
      type: 'sheet',
      q: md`W kolumnie C policz **stan zbiornika na koniec każdego dnia** według reguł z lekcji (parametry w G1:G4, stan na koniec dnia 0 jest w C2). Wpisz formułę dla **C3** – zostanie skopiowana do C3:C32.`,
      cell: 'C3',
      fill: 'C3:C32',
      solution: '=MAKS(0;MIN($G$1;C2+B3*$G$4)-$G$3)',
      explain: md`\`=MAKS(0;MIN($G$1;C2+B3*$G$4)-$G$3)\`: stan wczorajszy (\`C2\` – względny, przesuwa się) plus deszcz, obcięty do pojemności, minus podlewanie, nie mniej niż 0. Parametry z adresami bezwzględnymi.`,
    },
    {
      type: 'sheet',
      q: md`W kolumnie D policz **licznik serii dni bez deszczu** (dla dnia 0 w D2 jest 0). Wpisz formułę dla **D3** – zostanie skopiowana do D3:D32.`,
      cell: 'D3',
      fill: 'D3:D32',
      solution: '=JEŻELI(B3=0;D2+1;0)',
      explain: md`\`=JEŻELI(B3=0;D2+1;0)\` – dzień bez deszczu przedłuża serię z poprzedniego wiersza, dzień z deszczem ją zeruje.`,
    },
    {
      type: 'sheet',
      q: md`Kolumny C i D są już policzone. W komórce **K1** podaj długość **najdłuższej serii** kolejnych dni bez deszczu.`,
      data: policzone,
      cell: 'K1',
      solution: '=MAKS(D3:D32)',
      expect: 4,
      explain: md`\`=MAKS(D3:D32)\` → 4 (dni 9–12).`,
    },
    {
      type: 'sheet',
      q: md`Kolumny C i D są już policzone. W komórce **K2** podaj, **ile dni** zakończyło się **pustym** zbiornikiem.`,
      data: policzone,
      cell: 'K2',
      solution: '=LICZ.JEŻELI(C3:C32;0)',
      expect: 12,
      explain: md`\`=LICZ.JEŻELI(C3:C32;0)\` → 12. Pierwszy taki dzień to \`=PODAJ.POZYCJĘ(0;C3:C32;0)\` → dzień 3.`,
    },
  ],
  practice: ['2026-maj/7.2', '2026-maj/7.3', '2024-czerwiec/7.2', '2024-czerwiec/7.3', '2025-czerwiec/6.2', '2026-czerwiec/7.4', '2025-maj/6.5', '2023-czerwiec/6.4'],
};
