SELECT DISTINCT wizyty.id_klienta
FROM wizyty
JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
JOIN salony ON salony.id_salonu = fryzjerzy.id_salonu
WHERE salony.nazwa_salonu = 'Magnolia';
