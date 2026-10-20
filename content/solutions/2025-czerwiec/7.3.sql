SELECT SUM(uslugi.cena * 0.1) AS rabaty
FROM wizyty
JOIN klienci ON klienci.id_klienta = wizyty.id_klienta
JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
WHERE klienci.emeryt = 'TAK'
  AND SUBSTR(wizyty.termin, 12, 5) BETWEEN '10:00' AND '12:00';
