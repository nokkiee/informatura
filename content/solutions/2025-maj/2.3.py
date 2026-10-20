with open("symbole.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

CYFRA = {"o": 0, "+": 1, "*": 2}


def wartosc(napis):
    w = 0
    for znak in napis:
        w = w * 3 + CYFRA[znak]
    return w


wynik = max(dane, key=wartosc)

print(wartosc(wynik), wynik)
