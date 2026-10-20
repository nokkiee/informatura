with open("dron.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

punkty = []
x = 0
y = 0
for wiersz in dane:
    a, b = map(int, wiersz.split())
    x += a
    y += b
    punkty.append((x, y))

# a) punkty ściśle wewnątrz kwadratu
wynik = sum(1 for (x, y) in punkty if 0 < x < 5000 and 0 < y < 5000)
print(wynik)

# b) para punktów, której środek też jest jednym z punktów
zbior = set(punkty)
for i in range(len(punkty)):
    for j in range(i + 1, len(punkty)):
        (x1, y1), (x2, y2) = punkty[i], punkty[j]
        if (x1 + x2) % 2 == 0 and (y1 + y2) % 2 == 0:
            srodek = ((x1 + x2) // 2, (y1 + y2) // 2)
            if srodek in zbior and srodek != punkty[i]:
                print(x1, y1)
                print(*srodek)
                print(x2, y2)
