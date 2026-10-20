with open("liczby.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

pierwsze = [int(x) for x in dane[0].split()]
liczby = [int(x) for x in dane[1].split()]

ile = {}  # ile razy każda liczba pierwsza występuje w pierwszym wierszu
for p in pierwsze:
    ile[p] = ile.get(p, 0) + 1

for x in liczby:
    reszta = x
    for p, k in ile.items():
        while k > 0 and reszta % p == 0:
            reszta //= p
            k -= 1
    if reszta == 1:
        print(x)
