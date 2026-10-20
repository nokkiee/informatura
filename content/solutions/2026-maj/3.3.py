with open("pary.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def prefiksosufiks(s1, s2):
    # najdłuższe słowo, które jest początkiem s1 i końcem s2 albo początkiem s2 i końcem s1
    najdluzszy = 0
    for d in range(1, min(len(s1), len(s2)) + 1):
        if s1[:d] == s2[-d:] or s2[:d] == s1[-d:]:
            najdluzszy = d
    return najdluzszy


for wiersz in dane:
    s1, s2 = wiersz.split()
    d = prefiksosufiks(s1, s2)
    if d >= 5:
        print(s1, s2, d)
