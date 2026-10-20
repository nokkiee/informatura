SELECT IdSprzedawcy, MONTH(DataTransakcji) AS miesiac, COUNT(DISTINCT IdSklepu) AS sklepy
FROM Transakcje
WHERE IdSprzedawcy IS NOT NULL
GROUP BY IdSprzedawcy, miesiac
ORDER BY sklepy DESC
LIMIT 1;
