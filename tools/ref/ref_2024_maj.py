import os, sqlite3, math
from collections import defaultdict, Counter
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2024-maj')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]

def alg(n):
    b, c, cnt = 1, 0, 0
    while n > 0:
        a = n % 10; n //= 10
        if a % 2 == 0: c += b * (a // 2)
        else: c += b; cnt += 1
        b *= 10
    return c, cnt
for n in [33658, 542102, 87654321012345678, int('3'*6 + '6'*6 + '9'*6)]: print('2.x', n, alg(n))

def skrot(n):
    m, p = 0, 1
    while n > 0:
        d = n % 10
        if d % 2: m += d * p; p *= 10
        n //= 10
    return m
for f in ['skrot_przyklad.txt', 'skrot.txt']:
    L = [int(x) for x in lines(f)]; no = [x for x in L if skrot(x) == 0]
    print('3.2', f, len(no), max(no))
for f in ['skrot2_przyklad.txt', 'skrot2.txt']:
    L = [int(x) for x in lines(f)]
    print('3.3', f, [x for x in L if math.gcd(x, skrot(x)) == 7])

for f in ['liczby_przyklad.txt', 'liczby.txt']:
    a, b = [list(map(int, l.split())) for l in lines(f)]
    print('4.1', f, sum(1 for p in a if any(x % p == 0 for x in b)))
    print('4.2', f, sorted(a, reverse=True)[100])
    cnt = Counter(a); ok = []
    for x in b:
        c = Counter(); y = x
        for p in sorted(cnt):
            while y % p == 0 and c[p] < cnt[p]: y //= p; c[p] += 1
        if y == 1: ok.append(x)
    print('4.3', f, ok)
    best = None; n = len(a); pre = [0]
    for v in a: pre.append(pre[-1] + v)
    for i in range(n):
        for j in range(i + 50, n + 1):
            avg = (pre[j] - pre[i]) / (j - i)
            if best is None or avg > best[0] + 1e-12: best = (avg, j - i, a[i], i)
    print('4.4', f, best)

rows = [l.split('\t') for l in lines('jablka.txt')]
price = {l.split('\t')[0]: float(l.split('\t')[1].replace(',', '.')) for l in lines('cennik.txt')}
print('7 first', rows[0], list(price.items())[:3])
z = defaultdict(int)
for d, o, k, nip, kg in rows:
    if k == 'Z': z[nip] += int(kg)
print('7.1', sorted(z.items(), key=lambda x: -x[1])[:4])
rev = defaultdict(float); tot = 0
for d, o, k, nip, kg in rows:
    r = price[o] * int(kg); rev[o] += r; tot += r
print('7.2', round(tot, 2), max(rev, key=rev.get))
mon = defaultdict(lambda: defaultdict(int))
for d, o, k, nip, kg in rows: mon[int(d[5:7])][o] += int(kg)
print('7.3', [(m, max(mon[m].items(), key=lambda x: x[1])) for m in sorted(mon)])
cum = defaultdict(int); cnt = 0; disc = 0
for d, o, k, nip, kg in rows:
    kg = int(kg); cum[nip] += kg
    if cum[nip] >= 20000: cnt += 1; disc += 0.10 * kg
    elif cum[nip] >= 15000: cnt += 1; disc += 0.05 * kg
print('7.4', cnt, round(disc, 2))

db = sqlite3.connect(':memory:')
for t in ['kierowcy', 'taryfikator', 'rejestr']:
    L = [l.split(';') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[int(x) if x.isdigit() else x for x in r] for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('8.1', q("select Imie, Nazwisko, sum(Kwota) s from rejestr join kierowcy using(IdOsoby) join taryfikator using(IdWykroczenia) group by IdOsoby order by s desc limit 2"))
print('8.2', q("select substr(Data,6,2) m, sum(Punkty) s from rejestr join taryfikator using(IdWykroczenia) where IdWykroczenia between 3 and 6 group by m order by s limit 2"))
print('8.3', q("select NrRejestracyjny, Imie, Nazwisko from kierowcy where IdOsoby not in (select IdOsoby from rejestr) order by NrRejestracyjny"))
