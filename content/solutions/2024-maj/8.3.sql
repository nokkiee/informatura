SELECT NrRejestracyjny, Imie, Nazwisko
FROM Kierowcy
WHERE IdOsoby NOT IN (SELECT IdOsoby FROM Rejestr)
ORDER BY NrRejestracyjny;
