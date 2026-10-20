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

wynik = 0
for liczba in liczby:
    if liczba.startswith("50"):
        wynik += 1

print(wynik)
