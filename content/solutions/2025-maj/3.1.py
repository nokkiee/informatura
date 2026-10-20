with open("dron.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def nwd(a, b):
    while b > 0:
        a, b = b, a % b
    return a


wynik = 0
for wiersz in dane:
    a, b = map(int, wiersz.split())
    if nwd(abs(a), abs(b)) > 1:
        wynik += 1

print(wynik)
