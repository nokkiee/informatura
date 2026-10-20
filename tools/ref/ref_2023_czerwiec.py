import os, sqlite3
from collections import defaultdict
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2023-czerwiec')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]

def iloczyn(x, y, cnt):
    if y == 1: return x
    k = y // 2; z = iloczyn(x, k, cnt)
    if y % 2 == 0: cnt[0] += 1; return z + z
    cnt[0] += 2; return x + z + z
for x, y in [(9, 11), (8, 32), (2, 47), (112, 112)]:
    c = [0]; iloczyn(x, y, c); print('1.2', x, y, c[0])
def trace(x, y, n=1):
    if y == 1: print('1.1', n, x, y, '-', '-', x); return x
    k = y // 2; z = trace(x, k, n + 1); w = z + z if y % 2 == 0 else x + z + z
    print('1.1', n, x, y, k, z, w); return w
trace(10, 45)

def czy_mn(s, k1, k2):
    n = len(s); i, j = k1, k2
    while i <= n and j <= n:
        if s[i-1] == s[j-1]: i += 1; j += 1
        elif s[i-1] < s[j-1]: return True
        else: return False
    return j <= n
for f in ['sufiks_1.txt', 'sufiks_2.txt', 'slowa1.txt', 'slowa2.txt', 'slowa3.txt']:
    L = lines(f); s = L[1].strip(); k1, k2 = map(int, L[2].split())
    print('2.2', f, 'TAK' if czy_mn(s, k1, k2) else 'NIE')
for f in ['sufiks_4.txt', 'slowa4.txt']:
    for l in lines(f):
        n, s = l.split(); print('2.4', f, min(s[i:] for i in range(len(s))))

for f in ['przyklad.txt', 'anagram.txt']:
    L = [l.strip() for l in lines(f)]
    z = sum(1 for s in L if s.count('0') == s.count('1'))
    pz = sum(1 for s in L if abs(s.count('0') - s.count('1')) == 1)
    print('3.1', f, z, pz)
    from math import comb
    def anag(s):  # numbers with same multiset of digits starting with 1
        o, zz = s.count('1'), s.count('0'); return comb(o - 1 + zz, zz)
    e8 = [s for s in L if len(s) == 8]; m = max(anag(s) for s in e8)
    print('3.2', f, [s for s in e8 if anag(s) == m])
    v = [int(s, 2) for s in L]
    print('3.3', f, bin(max(abs(v[i] - v[i+1]) for i in range(len(v) - 1)))[2:])
    print('3.4', f, sum(1 for x in v if '0' not in str(x)), max(v, key=lambda x: (sum(set(map(int, str(x)))), -v.index(x))))

# 6: fotowoltaika
rows = [l.split('\t') for l in lines('fotowoltaika.txt')[1:]]
print('6 first rows', rows[:2], rows[-1])
day = defaultdict(float); zero = defaultdict(int); hourgen = defaultdict(list)
for d, p, g in rows:
    date, hh = d.split(); p = float(p.replace(',', '.')); g = float(g.replace(',', '.'))
    day[date] += g; h = int(hh.split(':')[0])
    if p == 0: zero[h] += 1
    hourgen[h].append(g)
b = max(day, key=day.get); print('6.1', b, round(day[b], 4))
h = max(zero, key=zero.get); print('6.2', h, zero[h])
print('6.3', {h: round(sum(v)/len(v), 4) for h, v in sorted(hourgen.items())})
# 6.4: April, hours 10..15: per hour need p+g used; panels generate g/18 each; need extra panels so that for each hour gen >= consumption
import math
need = 0
for d, p, g in rows:
    date, hh = d.split(); h = int(hh.split(':')[0])
    if date.split('.')[1] == '04' and 10 <= h <= 15:
        p = float(p.replace(',', '.')); g = float(g.replace(',', '.'))
        if p > 0:
            if g == 0: print('6.4 no sun', d); continue
            per = g / 18; need = max(need, math.ceil(p / per - 1e-9))
print('6.4', need)

db = sqlite3.connect(':memory:')
for t, f in [('kraje', 'kraje.txt'), ('urzadzenia', 'urzadzenia.txt'), ('instalacje', 'instalacje.txt')]:
    L = [l.split('\t') for l in lines(f)]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[int(x) if x.isdigit() else x for x in r] for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('7 headers', [l.split('\t') for l in lines('instalacje.txt')[:2]])
print('7.1', q("select typ_u, count(*) from instalacje join urzadzenia using(kod_u) group by typ_u"))
print('7.2', q("select producent_u, count(*) c from instalacje join urzadzenia using(kod_u) where substr(data_i,4,7)='02.2019' group by producent_u order by c desc limit 3"))
print('7.3', q("select nazwa_k, count(*) c, round(count(*)*1000000.0/ludnosc_k,2) r from instalacje join kraje using(kod_k) where ludnosc_k>=1000000 group by kod_k order by r desc limit 6"))
print('7.4', q("select kod_u, nazwa_u, count(distinct kod_k) c from instalacje join urzadzenia using(kod_u) where typ_u='Tablet' group by kod_u order by c desc limit 3"))
