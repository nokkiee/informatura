with open("liczby1.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def nwd(a, b):
    while b > 0:
        a, b = b, a % b
    return a


wynik = 0
for liczba in dane:
    polowa = len(liczba) // 2
    a = int(liczba[:polowa])
    b = int(liczba[polowa:])
    if nwd(a, b) == 1:
        wynik += 1

print(wynik)
