SELECT gry.nazwa, ROUND(AVG(oceny.ocena), 2) AS srednia
FROM gry
JOIN oceny ON oceny.id_gry = gry.id_gry
WHERE gry.kategoria = 'imprezowa'
GROUP BY gry.id_gry, gry.nazwa
ORDER BY gry.nazwa;
