# Reference solutions for Matura maj 2023 — used only to verify bundled data vs the official key.
import os, sys, sqlite3
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2023-maj')
def lines(name): return [l.strip() for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]

def blocks(s): return 1 + sum(1 for i in range(1, len(s)) if s[i] != s[i-1])
for f in ['bin_przyklad.txt', 'bin.txt']:
    L = lines(f)
    print(f, '2.2', sum(1 for s in L if blocks(s) <= 2), '2.3', max(L, key=lambda s: int(s, 2)))
    out = [bin(int(s, 2) ^ (int(s, 2) >> 1))[2:] for s in L]
    if f == 'bin_przyklad.txt':
        print('  2.5 example matches file:', out == lines('odp_bin_przyklad.txt'))
    else:
        print('  2.5', ' '.join(out))

def rm(seq):
    n = len(seq)
    for k in range(2, n - 1):
        if all(seq[i] < seq[i+1] for i in range(k-1)) and all(seq[i] > seq[i+1] for i in range(k, n-1)):
            return True
    return False
for f in ['pi_przyklad.txt', 'pi.txt']:
    d = [int(x) for x in lines(f)]
    frags = [d[i]*10 + d[i+1] for i in range(len(d)-1)]
    c = [0]*100
    for x in frags: c[x] += 1
    mn = min(range(100), key=lambda x: (c[x], x)); mx = min(range(100), key=lambda x: (-c[x], x))
    cnt6 = sum(1 for i in range(len(d)-5) if rm(d[i:i+6]))
    n = len(d); I = [1]*n; Dd = [1]*n
    for m in range(1, n): I[m] = I[m-1] + 1 if d[m] > d[m-1] else 1
    for m in range(n-2, -1, -1): Dd[m] = Dd[m+1] + 1 if d[m] > d[m+1] else 1
    L, i = max(((I[m] + Dd[m+1], m - I[m] + 1) for m in range(n-1) if I[m] >= 2 and Dd[m+1] >= 2), key=lambda t: (t[0], -t[1]))
    print(f, '3.1', sum(1 for x in frags if x > 90), '3.2', f'{mn:02d} {c[mn]} / {mx:02d} {c[mx]}', '3.3', cnt6, '3.4', i+1, ''.join(map(str, d[i:i+L])))

# --- 6: owoce
rows = [l.split('\t') for l in lines('owoce.txt')[1:]]
from collections import defaultdict
mon = defaultdict(lambda: [0, 0, 0])
cnt62 = 0
for r in rows:
    m = int(r[0].split('.')[1]); v = list(map(int, r[1:4]))
    for k in range(3): mon[m][k] += v[k]
    if v[2] > v[0] and v[2] > v[1]: cnt62 += 1
print('6.1', dict(mon)); print('6.2', cnt62)
st = [0, 0, 0]; kinds = defaultdict(int); kg = defaultdict(int)
names = ['malin', 'truskawek', 'porzeczek']
for r in rows:
    v = list(map(int, r[1:4]))
    st = [st[k] + v[k] for k in range(3)]
    a, b = sorted(range(3), key=lambda k: -st[k])[:2]
    amt = min(st[a], st[b]); key = tuple(sorted((a, b)))
    kinds[key] += 1; kg[key] += amt
    st[a] -= amt; st[b] -= amt
print('6.3', dict(kinds)); print('6.4', dict(kg))

# --- 7: gry/gracze/oceny in sqlite
db = sqlite3.connect(':memory:')
for t in ['gry', 'gracze', 'oceny']:
    L = [l.split('\t') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[int(x) if x.isdigit() else x for x in r] for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('7.1', q("select g.nazwa, count(*) c from oceny o join gry g using(id_gry) group by id_gry order by c desc limit 3"))
print('7.2', q("select g.nazwa, round(avg(ocena),2) from oceny o join gry g using(id_gry) where kategoria='imprezowa' group by g.id_gry order by g.nazwa"))
print('7.3', q("select count(distinct id_gracza) from oceny where id_gracza not in (select id_gracza from oceny where stan='posiada')"))
for lo, hi, name in [(0, 19, 'juniorzy'), (20, 49, 'seniorzy'), (50, 200, 'weterani')]:
    r = q(f"select g.nazwa, count(*) c from oceny o join gracze p using(id_gracza) join gry g using(id_gry) where wiek between {lo} and {hi} group by id_gry order by c desc limit 3")
    print('7.4', name, r)
