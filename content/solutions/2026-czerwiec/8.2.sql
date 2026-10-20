SELECT Id_Naucz
FROM Nauczyciele
WHERE Id_Naucz NOT IN (
  SELECT Id_Naucz
  FROM Oceny
  WHERE Ocena = 1 AND Data BETWEEN '2023-12-01' AND '2023-12-31'
);
