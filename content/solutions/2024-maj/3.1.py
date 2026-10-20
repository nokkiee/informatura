n = int(input())

# --- Twój algorytm ---
m = 0
p = 1
while n > 0:
    cyfra = n % 10
    if cyfra % 2 != 0:
        m = m + cyfra * p
        p = p * 10
    n = n // 10

print(m)
