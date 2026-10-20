with open("bin.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = 0
for liczba in dane:
    bloki = 1
    for i in range(1, len(liczba)):
        if liczba[i] != liczba[i - 1]:
            bloki += 1
    if bloki <= 2:
        wynik += 1

print(wynik)
