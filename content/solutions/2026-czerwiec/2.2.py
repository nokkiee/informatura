n = int(input())
T = list(map(int, input().split()))

# --- Twój algorytm ---
k = 0
for d in range(1, n):  # sprawdzamy każde możliwe k = d
    podobna = True
    for i in range(d):  # T[1..d] i T[n-d+1..n], w kodzie indeksy od 0
        if T[i] != T[n - d + i]:
            podobna = False
    if podobna:
        k = d

print(k)
