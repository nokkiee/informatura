with open("slowa.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

wynik = 0
for slowo in dane:
    for i in range(len(slowo) - 2):
        if slowo[i] == "k" and slowo[i + 2] == "t":
            wynik += 1
            break

print(wynik)
