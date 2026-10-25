// Lessons ("Lekcje"): every matura section explained step by step. Each lesson ends with a quiz,
// each section with a test of everything in it. The lessons, their examples and exercises are
// written for the app (they are not exam tasks); each lesson links to real exam tasks on its
// topic ("practice").
//
// A lesson lives in content/lessons/<section>/<id>.js, the section test in .../test.js.

export default [
  {
    id: 'programowanie',
    title: 'Programowanie',
    icon: 'code',
    desc: 'Od pierwszego programu do rozwiązania zadania maturalnego na plikach z danymi – w [[python: Pythonie]][[cpp: C++]][[java: Javie]].',

    lessons: ['prog-01-start', 'prog-02-warunki-petle', 'prog-03-pliki', 'prog-04-napisy', 'prog-05-listy-slowniki', 'prog-06-funkcje-cyfry', 'prog-07-zadanie-maturalne'],
  },
  {
    id: 'algorytmy',
    title: 'Algorytmika',
    icon: 'brain',
    desc: 'Pseudokod, śledzenie algorytmów, rekurencja, liczby pierwsze, sortowanie, szyfry i zapis algorytmu na maturze.',
    lessons: ['alg-01-pseudokod', 'alg-02-cyfry-systemy', 'alg-03-liczby', 'alg-04-rekurencja', 'alg-05-szukanie-sortowanie', 'alg-06-teksty-szyfry', 'alg-07-zlozonosc-zapis'],
  },
  {
    id: 'bazy',
    title: 'Bazy danych',
    icon: 'db',
    desc: 'Relacyjna baza danych i SQL: wybieranie, grupowanie, łączenie tabel, daty i podzapytania.',
    lessons: ['sql-01-model', 'sql-02-select', 'sql-03-grupowanie', 'sql-04-join', 'sql-05-funkcje-podzapytania', 'sql-06-matura'],
  },
  {
    id: 'arkusz',
    title: 'Arkusz kalkulacyjny',
    icon: 'grid',
    desc: 'Formuły z polskimi funkcjami, adresowanie, daty, wyszukiwanie, tabele przestawne, symulacje i wykresy.',
    lessons: ['ark-01-podstawy', 'ark-02-funkcje-warunkowe', 'ark-03-tekst-daty', 'ark-04-wyszukiwanie-zestawienia', 'ark-05-symulacje', 'ark-06-wykresy-matura'],
  },
  {
    id: 'teoria',
    title: 'Teoria',
    icon: 'binary',
    desc: 'Zadania bez komputera: systemy liczbowe, działania pisemne, bity i logika, sieci, bezpieczeństwo, grafika i prawo.',
    lessons: ['teo-01-systemy', 'teo-02-dzialania', 'teo-03-bity-logika-kolory', 'teo-04-sieci', 'teo-05-bezpieczenstwo', 'teo-06-grafika-prawo'],
  },
];
