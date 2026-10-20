with open("dane.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

napis = dane[0]
pary = [napis[i:i + 2] for i in range(0, len(napis), 2)]  # kolejne np-pary

wynik = 0
for i in range(len(pary) - 1):
    if pary[i] == pary[i + 1]:
        wynik += 1

print(wynik)
