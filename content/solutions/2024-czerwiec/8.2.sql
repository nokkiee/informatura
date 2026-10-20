SELECT COUNT(DISTINCT pesel) AS pacjenci,
       COUNT(DISTINCT CASE WHEN SUBSTR(pesel, 10, 1) IN ('0', '2', '4', '6', '8') THEN pesel END) AS kobiety
FROM wizyty
WHERE kod_szczepionki = 'sz12_3d';
