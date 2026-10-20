with open("pi.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

cyfry = [int(c) for c in dane]
n = len(cyfry)


def najdluzszy_od(start):
    # długość najdłuższego ciągu rosnąco-malejącego od pozycji start (0, gdy takiego nie ma)
    koniec = start + 1
    while koniec < n and cyfry[koniec] > cyfry[koniec - 1]:
        koniec += 1
    najlepszy = 0
    # część rosnąca: start … k-1, część malejąca: od k
    for k in range(start + 2, koniec + 1):
        m = k + 1
        while m < n and cyfry[m] < cyfry[m - 1]:
            m += 1
        if m - k >= 2:
            najlepszy = max(najlepszy, m - start)
    return najlepszy


pozycja = 0
dlugosc = 0
for i in range(n):
    d = najdluzszy_od(i)
    if d > dlugosc:
        dlugosc = d
        pozycja = i

print(pozycja + 1)
print("".join(dane[pozycja:pozycja + dlugosc]))
