SELECT nazwa_lazika
FROM Laziki
WHERE wsp_ladowania LIKE '%S, %'
  AND nr_lazika IN (SELECT nr_lazika FROM Pomiary WHERE wspolrzedne LIKE '%N, %')
  AND nr_lazika IN (SELECT nr_lazika FROM Pomiary WHERE wspolrzedne LIKE '%S, %');
