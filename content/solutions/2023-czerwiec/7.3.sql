SELECT kraje.nazwa_k, ROUND(COUNT(*) * 1000000.0 / kraje.ludnosc_k, 2) AS na_milion
FROM instalacje
JOIN kraje ON kraje.kod_k = instalacje.kod_k
WHERE kraje.ludnosc_k >= 1000000
GROUP BY kraje.kod_k, kraje.nazwa_k, kraje.ludnosc_k
ORDER BY na_milion DESC
LIMIT 5;
