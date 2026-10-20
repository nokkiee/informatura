SELECT DISTINCT fryzjerzy.id_fryzjera, fryzjerzy.imie
FROM wizyty
JOIN fryzjerzy ON fryzjerzy.id_fryzjera = wizyty.id_fryzjera
WHERE MONTH(wizyty.termin) = 4
  AND fryzjerzy.id_fryzjera NOT IN (
    SELECT wizyty.id_fryzjera
    FROM wizyty
    JOIN uslugi ON uslugi.id_uslugi = wizyty.id_uslugi
    WHERE MONTH(wizyty.termin) = 4 AND uslugi.nazwa = 'Strzyzenie meskie'
  )
ORDER BY fryzjerzy.id_fryzjera;
