with open("mapa.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

miasta = [list(map(int, wiersz.split())) for wiersz in dane]  # [x, y, ludność]

nr = 0
for i in range(len(miasta)):
    if miasta[i][2] > miasta[nr][2]:
        nr = i

print(nr + 1, miasta[nr][2])
