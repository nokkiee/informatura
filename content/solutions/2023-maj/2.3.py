with open("bin.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = dane[0]
for liczba in dane:
    if int(liczba, 2) > int(wynik, 2):
        wynik = liczba

print(wynik)
