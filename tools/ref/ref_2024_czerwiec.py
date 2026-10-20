import os, sqlite3, math
from collections import defaultdict, Counter
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2024-czerwiec')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]

def corner(w, k, n):
    b = bin(n)[2:]; return b[(w * k - 1) % len(b)]
print('1.1', bin(179)[2:], [''.join(bin(179)[2:][(i*5+j) % 8] for j in range(5)) for i in range(4)], corner(5, 3, 19))
def F(x, c):
    c[0] += 1
    return 0 if x == 0 else 2 + F(x // 2, c)
for x in [3, 16, 35]:
    c = [0]; print('2.1', x, F(x, c), c[0])
vals = [x for x in range(0, 2000) if F(x, [0]) == 18]; print('2.2', min(vals), max(vals))
import re
def rot13(s): return ''.join(chr((ord(ch) - 97 + 13) % 26 + 97) for ch in s)
for f in ['slowa_przyklad.txt', 'slowa.txt']:
    W = [l.strip() for l in lines(f)]
    print('3.1', f, sum(1 for w in W if re.search(r'k.t', w)))
    p = [w for w in W if rot13(w) == w[::-1]]; print('3.2', f, len(p), max(p, key=len))
    print('3.3', f, [w for w in W if max(Counter(w).values()) * 2 >= len(w)])
# 4.1
odb = [3, 1, 6, 5, 4, 5]; pos = list(range(1, 7))
for r in range(1, 5):
    pos = [odb[p - 1] for p in pos]; print('4.1 round', r, pos)
for f in ['odbiorcy_przyklad.txt', 'odbiorcy.txt']:
    o = [int(x) for x in lines(f)]; n = len(o)
    print('4.2', f, sum(1 for c in range(1, n + 1) if c not in set(o)))
    pos = list(range(1, n + 1)); r = 0; ans = None
    while ans is None and r < 5000:
        r += 1; pos = [o[p - 1] for p in pos]
        back = [i + 1 for i, p in enumerate(pos) if p == i + 1]
        if back: ans = (r, back[0])
    print('4.3', f, ans)
    pos = list(range(1, n + 1)); res = []
    for r in range(1, 9):
        pos = [o[p - 1] for p in pos]
        if r in (1, 2, 4, 8): res.append(max(Counter(pos).values()))
    print('4.4', f, res)
rows = [l.split('\t') for l in lines('uzdrowisko.txt')[1:]]
mon = defaultdict(int)
for d, a, b in rows: mon[int(d[5:7])] += int(a)
print('7.1', dict(mon))
cur = 10000; first = None; best = (0, None)
for d, a, b in rows:
    cur += int(a) - int(b)
    if cur > 11000 and first is None: first = d
    if cur > best[0]: best = (cur, d)
print('7.2', first, best)
def sim(bottles):
    cur = 10000; firstd = None; days = 0
    for d, a, b in rows:
        cur += int(a) - int(b)
        need = cur * 0.4
        if 3900 >= need:
            bottles += int((3900 - need) // 5 + 1e-9)
        else:
            miss = need - 3900; nb = math.ceil(miss / 5 - 1e-9)
            if nb > bottles:
                days += 1; firstd = firstd or d; bottles = 0
            else: bottles -= nb
    return firstd, days
print('7.3', sim(120))
lo = 0
while sim(lo)[1] > 0: lo += 1
print('7.3c', lo)
db = sqlite3.connect(':memory:')
for t in ['szczepionki', 'wizyty']:
    L = [l.split('\t') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", L[1:])
q = lambda s: db.execute(s).fetchall()
print('8 headers', [l.split('\t') for l in lines('wizyty.txt')[:2]])
print('8.1', q("select kod_szczepionki, count(*) c from wizyty group by kod_szczepionki order by c desc"))
print('8.2', q("select count(distinct pesel), count(distinct case when cast(substr(pesel,10,1) as int)%2=0 then pesel end) from wizyty where kod_szczepionki='sz12_3d'"))
print('8.3', q("select substr(data_szczepienia,1,7) m, count(*) c from wizyty w join szczepionki s using(kod_szczepionki) where cast(w.numer_dawki as int)=cast(s.liczba_dawek as int) group by m order by c desc limit 3"))
