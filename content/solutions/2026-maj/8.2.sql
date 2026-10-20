SELECT Plec, COUNT(*) AS liczba
FROM Klienci
WHERE IdKlienta NOT IN (SELECT IdKlienta FROM Transakcje)
GROUP BY Plec;
