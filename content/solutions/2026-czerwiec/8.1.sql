SELECT Uczniowie.Plec, ROUND(AVG(Oceny.Ocena), 2) AS srednia
FROM Oceny
JOIN Uczniowie ON Uczniowie.Id_Ucznia = Oceny.Id_Ucznia
JOIN Nauczyciele ON Nauczyciele.Id_Naucz = Oceny.Id_Naucz
WHERE Nauczyciele.Przedmiot = 'matematyka'
GROUP BY Uczniowie.Plec;
