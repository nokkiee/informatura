with open("slowa.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

for slowo in dane:
    najczestsza = max(slowo.count(c) for c in slowo)
    if 2 * najczestsza >= len(slowo):
        print(slowo)
