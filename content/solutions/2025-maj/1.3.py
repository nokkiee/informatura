n = int(input())

# --- Twój algorytm ---
w = 0
p = 1  # kolejne potęgi 100
while n > 0:
    r = n % 100
    a = r // 10
    b = r % 10
    if n > 9:
        w = w + p * a + 10 * p * b  # zamiana dwóch ostatnich cyfr miejscami
    else:
        w = w + p * b  # została jedna cyfra
    n = n // 100
    p = p * 100

print(w)
