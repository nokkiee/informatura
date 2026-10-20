with open("slowa4.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

for wiersz in dane:
    n, s = wiersz.split()
    najmniejszy = s
    for k in range(len(s)):
        if s[k:] < najmniejszy:
            najmniejszy = s[k:]
    print(najmniejszy)
