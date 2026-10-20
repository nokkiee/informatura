SELECT YEAR(wizyty.data_szczepienia) AS rok, MONTH(wizyty.data_szczepienia) AS miesiac, COUNT(*) AS liczba_osob
FROM wizyty
JOIN szczepionki ON szczepionki.kod_szczepionki = wizyty.kod_szczepionki
WHERE wizyty.numer_dawki = szczepionki.liczba_dawek
GROUP BY rok, miesiac
ORDER BY liczba_osob DESC
LIMIT 1;
