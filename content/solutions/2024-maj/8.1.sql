SELECT Kierowcy.Imie, Kierowcy.Nazwisko, SUM(Taryfikator.Kwota) AS suma_kwot
FROM Rejestr
JOIN Kierowcy ON Kierowcy.IdOsoby = Rejestr.IdOsoby
JOIN Taryfikator ON Taryfikator.IdWykroczenia = Rejestr.IdWykroczenia
GROUP BY Kierowcy.IdOsoby, Kierowcy.Imie, Kierowcy.Nazwisko
ORDER BY suma_kwot DESC
LIMIT 1;
