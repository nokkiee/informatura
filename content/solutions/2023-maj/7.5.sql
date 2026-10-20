SELECT SUM(sklep.cena) AS do_zaplaty
FROM gry
JOIN sklep ON sklep.id_gry = gry.id_gry
WHERE gry.kategoria = 'logiczna' AND sklep.promocja = true;
