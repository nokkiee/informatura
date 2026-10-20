def czy_mniejszy(n, s, k1, k2):
    i = k1
    j = k2
    while i <= n and j <= n:
        if s[i - 1] == s[j - 1]:
            i = i + 1
            j = j + 1
        elif s[i - 1] < s[j - 1]:
            return True
        else:
            return False
    return j <= n


n = int(input())
s = input().strip()

# --- Twój algorytm ---
T = []
for i in range(1, n + 1):
    T.append(i)
# sortowanie bąbelkowe, porównujące sufiksy funkcją czy_mniejszy
for i in range(n - 1):
    for j in range(n - 1 - i):
        if not czy_mniejszy(n, s, T[j], T[j + 1]):
            x = T[j]
            T[j] = T[j + 1]
            T[j + 1] = x

print(*T)
