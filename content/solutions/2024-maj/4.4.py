with open("liczby.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

a = [int(x) for x in dane[0].split()]
n = len(a)
suma = [0]  # suma[i] = a[0] + … + a[i-1]
for x in a:
    suma.append(suma[-1] + x)

najlepsza = -1
dlugosc = 0
poczatek = 0
for i in range(n):
    for j in range(i + 50, n + 1):
        srednia = (suma[j] - suma[i]) / (j - i)
        if srednia > najlepsza:
            najlepsza = srednia
            dlugosc = j - i
            poczatek = i

print(najlepsza, dlugosc, a[poczatek])
