with open("skrot2.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def nwd(a, b):
    while b > 0:
        a, b = b, a % b
    return a


for liczba in dane:
    n = int(liczba)
    m = int("".join(c for c in liczba if int(c) % 2 == 1))  # nieparzysty skrót
    if nwd(n, m) == 7:
        print(n)
