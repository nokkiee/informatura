with open("anagram.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def silnia(k):
    wynik = 1
    for i in range(2, k + 1):
        wynik *= i
    return wynik


def anagramy(liczba):
    # pierwsza cyfra to zawsze 1, pozostałe cyfry można ustawić na tyle sposobów
    zera = liczba.count("0")
    jedynki = len(liczba) - 1 - zera
    return silnia(len(liczba) - 1) // (silnia(zera) * silnia(jedynki))


osmiocyfrowe = [liczba for liczba in dane if len(liczba) == 8]
najwiecej = max(anagramy(liczba) for liczba in osmiocyfrowe)
for liczba in osmiocyfrowe:
    if anagramy(liczba) == najwiecej:
        print(liczba)
