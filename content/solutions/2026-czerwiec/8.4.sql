SELECT Kategorie.Nazwa_Kategorii, COUNT(Oceny.Id_Oceny) AS liczba_ocen
FROM Kategorie
JOIN Oceny ON Oceny.Id_Kategorii = Kategorie.Id_Kategorii
GROUP BY Kategorie.Id_Kategorii, Kategorie.Nazwa_Kategorii;
