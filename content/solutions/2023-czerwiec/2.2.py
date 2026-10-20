def czy_mniejszy(n, s, k1, k2):
    i = k1
    j = k2
    while i <= n and j <= n:
        if s[i - 1] == s[j - 1]:
            i += 1
            j += 1
        elif s[i - 1] < s[j - 1]:
            return True
        else:
            return False
    return j <= n


for nazwa in ["slowa1.txt", "slowa2.txt", "slowa3.txt"]:
    with open(nazwa) as plik:
        dane = [wiersz.strip() for wiersz in plik]
    n = int(dane[0])
    s = dane[1]
    k1, k2 = map(int, dane[2].split())
    print(nazwa, "TAK" if czy_mniejszy(n, s, k1, k2) else "NIE")
