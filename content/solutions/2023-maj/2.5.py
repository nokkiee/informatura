with open("bin.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

for liczba in dane:
    p = int(liczba, 2)
    wynik = p ^ (p // 2)
    print(bin(wynik)[2:])
