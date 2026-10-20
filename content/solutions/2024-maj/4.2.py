with open("liczby.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

pierwsze = [int(x) for x in dane[0].split()]
pierwsze.sort(reverse=True)
wynik = pierwsze[100]  # sto pierwsza od największej

print(wynik)
