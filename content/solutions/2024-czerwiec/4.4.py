with open("odbiorcy.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

n = len(dane)
odbiorca = [0] + [int(x) for x in dane]  # odbiorca[i] – odbiorca komputera i (od 1)
gdzie = list(range(n + 1))  # gdzie[p] – komputer, w którym jest pakiet p

wyniki = []
for runda in range(1, 9):
    for p in range(1, n + 1):
        gdzie[p] = odbiorca[gdzie[p]]
    if runda in (1, 2, 4, 8):
        ile = [0] * (n + 1)  # ile pakietów jest w każdym komputerze
        for p in range(1, n + 1):
            ile[gdzie[p]] += 1
        wyniki.append(max(ile))

print(*wyniki)
