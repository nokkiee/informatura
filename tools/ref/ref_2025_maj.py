import os, sqlite3, math, re
from collections import defaultdict, Counter
from datetime import date, timedelta
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2025-maj')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]

def przestaw(n, cnt):
    cnt[0] += 1
    r = n % 100; a = r // 10; b = r % 10; n //= 100
    if n > 0: return a + 10 * b + 100 * przestaw(n, cnt)
    return a + 10 * b if a > 0 else b
for n in [316498, 43657688, 154005710, 998877665544321]:
    c = [0]; print('1.1', n, przestaw(n, c), c[0])
VAL = {'o': 0, '+': 1, '*': 2}
for f in ['symbole_przyklad.txt', 'symbole.txt']:
    L = [l.strip() for l in lines(f)]
    print('2.1', f, [s for s in L if s == s[::-1]])
    sq = []
    for i in range(1, len(L) - 1):
        for j in range(1, 11):
            ch = L[i][j]
            if all(L[i + di][j + dj] == ch for di in (-1, 0, 1) for dj in (-1, 0, 1)): sq.append((i + 1, j + 1))
    print('2.2', f, len(sq), sq)
    v = [sum(VAL[c] * 3 ** (11 - k) for k, c in enumerate(s)) for s in L]
    m = max(v); print('2.3', f, m, L[v.index(m)])
    s = sum(v); t = ''
    x = s
    while x: t = 'o+*'[x % 3] + t; x //= 3
    print('2.4', f, s, t)
for f in ['dron_przyklad.txt', 'dron.txt']:
    P = [tuple(map(int, l.split())) for l in lines(f)]
    print('3.1', f, sum(1 for a, b in P if math.gcd(abs(a), abs(b)) > 1))
    pts = []; x = y = 0
    for a, b in P: x += a; y += b; pts.append((x, y))
    print('3.2a', f, sum(1 for x, y in pts if 0 < x < 5000 and 0 < y < 5000))
    S = set(pts); trip = []
    for i in range(len(pts)):
        for j in range(i + 1, len(pts)):
            (x1, y1), (x2, y2) = pts[i], pts[j]
            if (x1 + x2) % 2 == 0 and (y1 + y2) % 2 == 0 and ((x1 + x2) // 2, (y1 + y2) // 2) in S and ((x1 + x2) // 2, (y1 + y2) // 2) not in (pts[i], pts[j]):
                trip.append((pts[i], ((x1 + x2) // 2, (y1 + y2) // 2), pts[j]))
    print('3.2b', f, trip)
rows = [l.split('\t') for l in lines('martianeum.txt')]
print('6 head', rows[:2])
rows = rows[1:]
tm = sum(float(r[2].replace(',', '.')) for r in rows)
mart = 0.0
for d, ob, m, z in rows:
    m = float(m.replace(',', '.')); z = float(z.replace(',', '.'))
    if z >= 1: mart += m * z / 100
print('6.1', round(tm, 4), round(mart, 4))
by = defaultdict(list)
for d, ob, m, z in rows: by[ob].append(float(m.replace(',', '.')))
print('6.2', min(by, key=lambda k: sum(by[k]) / len(by[k])))
d0 = date(2033, 3, 3); wk = defaultdict(float)
for d, ob, m, z in rows:
    dd = date(*map(int, d.split('-'))); wk[(dd - d0).days // 7] += float(m.replace(',', '.'))
b = max(wk, key=wk.get); print('6.3', d0 + timedelta(days=7 * b), round(wk[b], 4))
yr = defaultdict(Counter)
for d, ob, m, z in rows: yr[ob][d[:4]] += 1
print('6.4 Aeolis', dict(yr['Aeolis']), 'Tharsis', dict(yr['Tharsis']))
st = 0.0; cnt = 0; first = last = None
for d, ob, m, z in rows:
    m = float(m.replace(',', '.')); z = float(z.replace(',', '.'))
    if z >= 1: st += m * z / 100
    if st >= 100 - 1e-9:
        st -= 100; cnt += 1; first = first or d; last = d
print('6.5', cnt, first, last)
db = sqlite3.connect(':memory:')
for t in ['laziki', 'obszary', 'pomiary']:
    L = [l.split('\t') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[int(x) if x.isdigit() else x for x in r] for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('7 heads', [lines(t + '.txt')[:2] for t in ['laziki', 'obszary', 'pomiary']])
print('7.1', q("select nazwa_obszaru, sum(ilosc) s from pomiary join obszary using(kod_obszaru) where glebokosc<=100 group by kod_obszaru order by s desc limit 2"))
print('7.2', q("select nazwa_lazika, min(data_pomiaru), max(data_pomiaru), julianday(max(data_pomiaru))-julianday(min(data_pomiaru)) d from pomiary join laziki using(nr_lazika) group by nr_lazika order by d desc limit 2"))
print('7.3', q("select nazwa_obszaru from obszary where kod_obszaru not in (select kod_obszaru from pomiary join laziki using(nr_lazika) where cast(substr(data_pomiaru,1,4) as int)=rok_wyslania) order by nazwa_obszaru"))
print('7.4', q("select nazwa_lazika from laziki l where wsp_ladowania like '%S,%' and exists(select 1 from pomiary p where p.nr_lazika=l.nr_lazika and wspolrzedne like '%N,%') and exists(select 1 from pomiary p where p.nr_lazika=l.nr_lazika and wspolrzedne like '%S,%')"))
