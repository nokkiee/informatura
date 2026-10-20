SELECT Klienci.Imie, Klienci.Nazwisko, COUNT(*) AS liczba_transakcji
FROM Transakcje
JOIN Klienci ON Klienci.IdKlienta = Transakcje.IdKlienta
GROUP BY Klienci.IdKlienta, Klienci.Imie, Klienci.Nazwisko
ORDER BY liczba_transakcji DESC
LIMIT 1;
