with open("mapa.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

miasta = [list(map(int, wiersz.split())) for wiersz in dane]  # [x, y, ludność]
razem = sum(p for x, y, p in miasta if x > 0 and y > 0)  # ludność całej I ćwiartki

bok = 0
ludnosc = 0
a = 1
while 2 * a * a < razem:  # przy większym boku gęstość na pewno nie przekroczy 2
    suma = sum(p for x, y, p in miasta if 0 < x < a and 0 < y < a)  # bez miast na krawędziach
    if suma > 2 * a * a:  # gęstość suma / a² > 2, bez dzielenia
        bok = a
        ludnosc = suma
    a += 1

print(bok, ludnosc)
