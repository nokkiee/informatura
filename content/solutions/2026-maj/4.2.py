with open("korpo.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

przelozeni = set(int(x) for x in dane) - {0}  # pracownicy, którzy mają podwładnych
wynik = len(dane) - len(przelozeni)

print(wynik)
