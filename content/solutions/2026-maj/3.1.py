with open("pary.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def f(s):
    return sum(ord(c) for c in s)


najwieksza = -1
para = ""
for wiersz in dane:
    s1, s2 = wiersz.split()
    roznica = abs(f(s1) - f(s2))
    if roznica > najwieksza:
        najwieksza = roznica
        para = wiersz

print(para, najwieksza)
