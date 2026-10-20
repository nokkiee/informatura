SELECT Obszary.nazwa_obszaru, SUM(Pomiary.ilosc) AS woda
FROM Pomiary
JOIN Obszary ON Obszary.kod_obszaru = Pomiary.kod_obszaru
WHERE Pomiary.glebokosc <= 100
GROUP BY Obszary.kod_obszaru, Obszary.nazwa_obszaru
ORDER BY woda DESC
LIMIT 1;
