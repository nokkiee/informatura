SELECT COUNT(DISTINCT id_gracza) AS liczba_graczy
FROM oceny
WHERE id_gracza NOT IN (
  SELECT id_gracza FROM oceny WHERE stan = 'posiada'
);
