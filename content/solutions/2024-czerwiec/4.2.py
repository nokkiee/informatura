with open("odbiorcy.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

odbiorcy = set(int(x) for x in dane)  # komputery, które coś dostają
wynik = len(dane) - len(odbiorcy)

print(wynik)
