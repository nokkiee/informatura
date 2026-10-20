with open("odbiorcy.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

n = len(dane)
odbiorca = [0] + [int(x) for x in dane]  # odbiorca[i] – odbiorca komputera i (od 1)
gdzie = list(range(n + 1))  # gdzie[p] – komputer, w którym jest pakiet p

runda = 0
pakiet = 0
while pakiet == 0:
    runda += 1
    for p in range(1, n + 1):
        gdzie[p] = odbiorca[gdzie[p]]
    for p in range(1, n + 1):
        if gdzie[p] == p:
            pakiet = p
            break

print(runda, pakiet)
