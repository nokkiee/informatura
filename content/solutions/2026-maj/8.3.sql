SELECT
  (SELECT COUNT(DISTINCT IdSklepu) FROM Transakcje WHERE IdSprzedawcy IS NULL) AS sklepy,
  (SELECT ROUND(SUM(Cena * Liczba), 2)
   FROM Opis_transakcji
   WHERE IdTransakcji IN (SELECT IdTransakcji FROM Transakcje WHERE IdSprzedawcy IS NULL)) AS kwota;
