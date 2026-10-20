SELECT nazwa_obszaru
FROM Obszary
WHERE kod_obszaru NOT IN (
  SELECT Pomiary.kod_obszaru
  FROM Pomiary
  JOIN Laziki ON Laziki.nr_lazika = Pomiary.nr_lazika
  WHERE YEAR(Pomiary.data_pomiaru) = Laziki.rok_wyslania
);
