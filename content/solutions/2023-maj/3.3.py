with open("pi.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def rosnaco_malejacy(c):
    # część rosnąca c[0:k] i malejąca c[k:], każda co najmniej z 2 elementów
    for k in range(2, len(c) - 1):
        rosnie = all(c[i] < c[i + 1] for i in range(k - 1))
        maleje = all(c[i] > c[i + 1] for i in range(k, len(c) - 1))
        if rosnie and maleje:
            return True
    return False


cyfry = [int(c) for c in dane]
wynik = 0
for i in range(len(cyfry) - 5):
    if rosnaco_malejacy(cyfry[i:i + 6]):
        wynik += 1

print(wynik)
