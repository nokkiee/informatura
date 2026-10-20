with open("pary.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

najwieksza = -1
para = ""
for wiersz in dane:
    s1, s2 = wiersz.split()
    suma = 0
    for litera in "abcdefghijklmnopqrstuvwxyz":
        suma += min(s1.count(litera), s2.count(litera))
    if suma > najwieksza:
        najwieksza = suma
        para = wiersz

print(para, najwieksza)
