with open("symbole.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

CYFRA = {"o": 0, "+": 1, "*": 2}
SYMBOL = "o+*"

suma = 0
for napis in dane:
    w = 0
    for znak in napis:
        w = w * 3 + CYFRA[znak]
    suma += w

zapis = ""
x = suma
while x > 0:
    zapis = SYMBOL[x % 3] + zapis
    x //= 3

print(suma, zapis)
