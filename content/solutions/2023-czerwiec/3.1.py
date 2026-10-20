with open("anagram.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

zrownowazone = 0
prawie = 0
for liczba in dane:
    zera = liczba.count("0")
    jedynki = liczba.count("1")
    if zera == jedynki:
        zrownowazone += 1
    elif abs(zera - jedynki) == 1:
        prawie += 1

print(zrownowazone)
print(prawie)
