with open("symbole.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

srodki = []
for i in range(1, len(dane) - 1):
    for j in range(1, len(dane[i]) - 1):
        # wszystkie 9 pól kwadratu o środku (i, j) mają ten sam symbol co środek
        if all(dane[i + di][j + dj] == dane[i][j] for di in (-1, 0, 1) for dj in (-1, 0, 1)):
            srodki.append((i + 1, j + 1))

print(len(srodki))
for wiersz, pozycja in srodki:
    print(wiersz, pozycja)
