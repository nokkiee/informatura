SELECT urzadzenia.typ_u, COUNT(*) AS liczba_instalacji
FROM instalacje
JOIN urzadzenia ON urzadzenia.kod_u = instalacje.kod_u
GROUP BY urzadzenia.typ_u;
