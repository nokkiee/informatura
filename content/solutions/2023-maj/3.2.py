with open("pi.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

ile = [0] * 100
for i in range(len(dane) - 1):
    ile[int(dane[i] + dane[i + 1])] += 1

najrzadszy = 0
najczestszy = 0
for f in range(100):
    if ile[f] < ile[najrzadszy]:
        najrzadszy = f
    if ile[f] > ile[najczestszy]:
        najczestszy = f

print(f"{najrzadszy:02d} {ile[najrzadszy]}")
print(f"{najczestszy:02d} {ile[najczestszy]}")
