WITH zestawienie AS (
  SELECT MONTH(Data) AS miesiac, Ocena, COUNT(*) AS liczba
  FROM Oceny
  GROUP BY miesiac, Ocena
)
SELECT miesiac, Ocena, liczba
FROM zestawienie AS z
WHERE liczba = (SELECT MIN(liczba) FROM zestawienie WHERE miesiac = z.miesiac)
ORDER BY miesiac;
