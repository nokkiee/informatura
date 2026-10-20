with open("dane.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

napis = dane[0]
liczby = []  # wszystkie ukryte liczby, jako napisy (zera z przodu zostają)
biezaca = ""
for znak in napis + " ":
    if znak.isdigit():
        biezaca += znak
    elif biezaca:
        liczby.append(biezaca)
        biezaca = ""

telefony = [liczba for liczba in liczby if len(liczba) == 9]
najmniej = min(len(set(t)) for t in telefony)
for t in telefony:
    if len(set(t)) == najmniej:
        print(t)
