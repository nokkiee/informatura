SELECT Laziki.nazwa_lazika, MIN(Pomiary.data_pomiaru) AS pierwszy, MAX(Pomiary.data_pomiaru) AS ostatni
FROM Pomiary
JOIN Laziki ON Laziki.nr_lazika = Pomiary.nr_lazika
GROUP BY Laziki.nr_lazika, Laziki.nazwa_lazika
ORDER BY DATEDIFF(MAX(Pomiary.data_pomiaru), MIN(Pomiary.data_pomiaru)) DESC
LIMIT 1;
