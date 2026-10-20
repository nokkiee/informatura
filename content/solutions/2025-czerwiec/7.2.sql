SELECT DISTINCT klienci.imie, klienci.nazwisko, klienci.id_klienta
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
WHERE klienci.imie = fryzjerzy.imie
ORDER BY klienci.imie;
