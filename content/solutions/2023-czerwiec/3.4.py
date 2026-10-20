with open("anagram.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

bez_zera = 0
najlepsza = 0
najwieksza_suma = -1
for liczba in dane:
    dziesietnie = str(int(liczba, 2))
    if "0" not in dziesietnie:
        bez_zera += 1
    suma = sum(int(c) for c in set(dziesietnie))
    if suma > najwieksza_suma:
        najwieksza_suma = suma
        najlepsza = dziesietnie

print(bez_zera)
print(najlepsza)
