with open("mapa.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

miasta = [list(map(int, wiersz.split())) for wiersz in dane]  # [x, y, ludność]
n = len(miasta)

najmniejsza = 10 ** 9
pary = []
for i in range(n):
    for j in range(i + 1, n):
        d = abs(miasta[i][0] - miasta[j][0]) + abs(miasta[i][1] - miasta[j][1])
        if d < najmniejsza:
            najmniejsza = d
            pary = [(i + 1, j + 1)]
        elif d == najmniejsza:
            pary.append((i + 1, j + 1))

print(najmniejsza)
for a, b in pary:
    print(a, b)
