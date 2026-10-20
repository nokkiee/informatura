with open("dane.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

napis = dane[0]
ile = {}  # liczba wystąpień każdej np-pary
for i in range(0, len(napis), 2):
    para = napis[i:i + 2]
    ile[para] = ile.get(para, 0) + 1

wynik = "".join(sorted(ile, key=lambda para: ile[para]))

print(wynik)
