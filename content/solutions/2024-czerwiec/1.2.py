w = int(input())
k = int(input())
n = int(input())

# --- Twój algorytm ---
x = 0
dl = 0  # liczba cyfr zapisu binarnego n
pom = n
while pom > 0:
    pom = pom // 2
    dl = dl + 1
poz = (w * k - 1) % dl  # która cyfra (licząc od lewej, od 0) trafi do prawego dolnego rogu
for i in range(dl - 1 - poz):
    n = n // 2  # usuwamy cyfry stojące na prawo od niej
x = n % 2

print(x)
