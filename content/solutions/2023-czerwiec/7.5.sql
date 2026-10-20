SELECT firmy.nazwa, COUNT(*) AS liczba_instalacji
FROM firmy
JOIN instalacje ON instalacje.id_firmy = firmy.id_firmy
GROUP BY firmy.id_firmy, firmy.nazwa
ORDER BY liczba_instalacji DESC;
