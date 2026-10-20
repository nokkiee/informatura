n = int(input())

# --- Twój algorytm ---
b = 0
poprzednia = -1
while n > 0:
    cyfra = n % 2
    if cyfra != poprzednia:
        b = b + 1
    poprzednia = cyfra
    n = n // 2

print(b)
