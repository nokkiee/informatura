SELECT kod_szczepionki, COUNT(*) AS liczba_dawek
FROM wizyty
GROUP BY kod_szczepionki
ORDER BY liczba_dawek DESC;
