SELECT urzadzenia.kod_u, urzadzenia.nazwa_u, COUNT(DISTINCT instalacje.kod_k) AS liczba_krajow
FROM instalacje
JOIN urzadzenia ON urzadzenia.kod_u = instalacje.kod_u
WHERE urzadzenia.typ_u = 'Tablet'
GROUP BY urzadzenia.kod_u, urzadzenia.nazwa_u
ORDER BY liczba_krajow DESC
LIMIT 1;
