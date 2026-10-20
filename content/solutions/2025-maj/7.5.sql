SELECT DISTINCT Producent.nazwa
FROM Producent
JOIN Laziki ON Laziki.kod_producenta = Producent.kod_producenta
JOIN Pomiary ON Pomiary.nr_lazika = Laziki.nr_lazika
JOIN Obszary ON Obszary.kod_obszaru = Pomiary.kod_obszaru
WHERE Obszary.nazwa_obszaru = 'Arcadia' AND YEAR(Pomiary.data_pomiaru) = 2060;
