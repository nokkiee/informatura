with open("slowa.txt") as plik:
    dane = [wiersz.strip() for wiersz in plik]


def rot13(slowo):
    return "".join(chr((ord(c) - ord("a") + 13) % 26 + ord("a")) for c in slowo)


wynik = 0
najdluzsze = ""
for slowo in dane:
    if rot13(slowo) == slowo[::-1]:
        wynik += 1
        if len(slowo) > len(najdluzsze):
            najdluzsze = slowo

print(wynik)
print(najdluzsze)
