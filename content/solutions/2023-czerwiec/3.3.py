with open("anagram.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = 0
for i in range(len(dane) - 1):
    roznica = abs(int(dane[i], 2) - int(dane[i + 1], 2))
    if roznica > wynik:
        wynik = roznica

print(bin(wynik)[2:])
