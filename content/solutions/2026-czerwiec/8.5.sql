SELECT Oceny.Id_Ucznia
FROM Oceny
JOIN Kategorie ON Kategorie.Id_Kategorii = Oceny.Id_Kategorii
WHERE Kategorie.Nazwa_Kategorii = 'sprawdzian' AND Oceny.Ocena = 6
GROUP BY Oceny.Id_Ucznia
ORDER BY COUNT(*) DESC
LIMIT 1;
