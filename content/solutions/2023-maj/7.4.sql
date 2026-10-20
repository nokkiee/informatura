WITH zestawienie AS (
  SELECT CASE
           WHEN gracze.wiek <= 19 THEN 'juniorzy'
           WHEN gracze.wiek <= 49 THEN 'seniorzy'
           ELSE 'weterani'
         END AS kategoria_wiekowa,
         gry.nazwa,
         COUNT(*) AS liczba_ocen
  FROM oceny
  JOIN gracze ON gracze.id_gracza = oceny.id_gracza
  JOIN gry ON gry.id_gry = oceny.id_gry
  GROUP BY kategoria_wiekowa, gry.id_gry, gry.nazwa
)
SELECT kategoria_wiekowa, nazwa, liczba_ocen
FROM zestawienie AS z
WHERE liczba_ocen = (
  SELECT MAX(liczba_ocen) FROM zestawienie WHERE kategoria_wiekowa = z.kategoria_wiekowa
);
