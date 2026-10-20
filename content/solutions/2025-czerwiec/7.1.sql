SELECT klienci.imie, klienci.nazwisko, SUM(uslugi.cena) AS wydatki
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
GROUP BY klienci.id_klienta, klienci.imie, klienci.nazwisko
ORDER BY wydatki DESC
LIMIT 1;
