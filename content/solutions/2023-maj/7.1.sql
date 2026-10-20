SELECT gry.nazwa, COUNT(*) AS liczba_ocen
FROM oceny
JOIN gry ON gry.id_gry = oceny.id_gry
GROUP BY gry.id_gry, gry.nazwa
ORDER BY liczba_ocen DESC
LIMIT 1;
