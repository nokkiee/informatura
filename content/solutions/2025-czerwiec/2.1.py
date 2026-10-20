k = int(input())

# --- Twój algorytm ---
a = 0
b = 0
dlugosc = 0  # liczba cyfr k
x = k
while x > 0:
    x = x // 10
    dlugosc = dlugosc + 1
potega = 1
for i in range(dlugosc // 2):
    b = b + potega * (k % 10)  # przenosimy ostatnią cyfrę k do b
    k = k // 10
    potega = potega * 10
a = k

print(a)
print(b)
