with open("dane.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

napis = dane[0]
ile = [0] * 10
for znak in napis:
    if znak.isdigit():
        ile[int(znak)] += 1

cyfra = ile.index(max(ile))
print(cyfra, ile[cyfra])
