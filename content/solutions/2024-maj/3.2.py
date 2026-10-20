with open("skrot.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

ile = 0
najwieksza = 0
for liczba in dane:
    # skrót nie istnieje, gdy wszystkie cyfry są parzyste
    if all(int(c) % 2 == 0 for c in liczba):
        ile += 1
        najwieksza = max(najwieksza, int(liczba))

print(ile)
print(najwieksza)
