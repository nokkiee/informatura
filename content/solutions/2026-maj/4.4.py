with open("korpo.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]

n = len(dane)
szef = [0] + [int(x) for x in dane]  # szef[i] – bezpośredni przełożony pracownika i
ilu = [0] * (n + 1)  # ilu[i] – liczba przełożonych pracownika i
for i in range(2, n + 1):
    ilu[i] = ilu[szef[i]] + 1  # numer szefa jest mniejszy, więc ilu[szef[i]] jest już policzone

najwiecej = max(ilu)
print(najwiecej, ilu.count(najwiecej))
