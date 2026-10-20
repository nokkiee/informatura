SELECT Fotoradar.IdFotoradaru
FROM Fotoradar
LEFT JOIN Rejestr ON Rejestr.IdFotoradaru = Fotoradar.IdFotoradaru
WHERE Rejestr.IdFotoradaru IS NULL;
