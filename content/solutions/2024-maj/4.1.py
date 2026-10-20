with open("liczby.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

pierwsze = [int(x) for x in dane[0].split()]
liczby = [int(x) for x in dane[1].split()]

wynik = 0
for p in pierwsze:
    if any(x % p == 0 for x in liczby):
        wynik += 1

print(wynik)
