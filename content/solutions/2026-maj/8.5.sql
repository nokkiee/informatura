SELECT DISTINCT Produkty.IdProduktu, Produkty.Nazwa
FROM Opis_transakcji
JOIN Produkty ON Produkty.IdProduktu = Opis_transakcji.IdProduktu
JOIN Kategorie ON Kategorie.IdKategorii = Produkty.IdKategorii
WHERE Kategorie.NazwaKategorii = 'spozywcze' AND Produkty.Opis LIKE '%do ekspresu kolbowego%';
