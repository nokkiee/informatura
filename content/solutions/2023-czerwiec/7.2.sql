SELECT urzadzenia.producent_u, COUNT(*) AS liczba_instalacji
FROM instalacje
JOIN urzadzenia ON urzadzenia.kod_u = instalacje.kod_u
WHERE YEAR(instalacje.data_i) = 2019 AND MONTH(instalacje.data_i) = 2
GROUP BY urzadzenia.producent_u
ORDER BY liczba_instalacji DESC
LIMIT 1;
