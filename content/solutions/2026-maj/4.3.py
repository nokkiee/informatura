with open("korpo.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

n = len(dane)
podwladni = [0] * (n + 1)  # liczba bezpośrednich podwładnych każdego pracownika
for x in dane:
    if int(x) > 0:
        podwladni[int(x)] += 1

pracownik = podwladni.index(max(podwladni))
print(pracownik, podwladni[pracownik])
