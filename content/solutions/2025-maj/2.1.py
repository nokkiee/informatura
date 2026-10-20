with open("symbole.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

for napis in dane:
    if napis == napis[::-1]:
        print(napis)
