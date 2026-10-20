SELECT MONTH(Rejestr.Data) AS miesiac, SUM(Taryfikator.Punkty) AS punkty
FROM Rejestr
JOIN Taryfikator ON Taryfikator.IdWykroczenia = Rejestr.IdWykroczenia
WHERE Rejestr.IdWykroczenia BETWEEN 3 AND 6
GROUP BY miesiac
ORDER BY punkty
LIMIT 1;
