with open("dane.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

napis = dane[0]
n = len(napis)


def pierwsza(x):
    if x < 2:
        return False
    d = 2
    while d * d <= x:
        if x % d == 0:
            return False
        d += 1
    return True


suma = [0]  # suma[i] – suma kodów pierwszych i znaków
for znak in napis:
    suma.append(suma[-1] + ord(znak))

najdluzszy = ""
for i in range(0, n, 2):  # fragment zaczyna się na początku np-pary…
    for j in range(i + 2, n + 1, 2):  # …i kończy na końcu np-pary
        if j - i > len(najdluzszy) and pierwsza(suma[j] - suma[i]):
            najdluzszy = napis[i:j]

print(najdluzszy)
