a = int(input())
b = int(input())

# --- Twój algorytm ---
p = 0
w_pamieci = 0  # przeniesienie z poprzedniej kolumny
while a > 0:
    suma = a % 10 + b % 10 + w_pamieci
    if suma >= 10:
        w_pamieci = 1
        p = p + 1
    else:
        w_pamieci = 0
    a = a // 10
    b = b // 10

print(p)
