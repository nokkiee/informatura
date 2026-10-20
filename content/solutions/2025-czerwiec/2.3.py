with open("liczby2.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def stopien(n):
    kwadrat = str(n * n)
    ile = 0
    for i in range(1, len(kwadrat)):  # cięcie po i-tej cyfrze
        if int(kwadrat[:i]) + int(kwadrat[i:]) <= n:
            ile += 1
    return ile


najlepszy = -1
liczba = 0
for wiersz in dane:
    n = int(wiersz)
    s = stopien(n)
    if s > najlepszy:
        najlepszy = s
        liczba = n

print(najlepszy)
print(liczba)
