with open("pi.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = 0
for i in range(len(dane) - 1):
    fragment = int(dane[i] + dane[i + 1])
    if fragment > 90:
        wynik += 1

print(wynik)
