import os, sqlite3, math, re
from collections import defaultdict, Counter
from datetime import date, timedelta
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2026-maj')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]
def A(m, n, calls):
    if n == 1: return m
    if n % 2 == 0: calls.append((2*m, n//2)); return A(2*m, n//2, calls)
    calls.append((m, (n-1)//2)); return 2*A(m, (n-1)//2, calls) + m
for m, n in [(3, 9), (32, 32), (10, 15), (1, 2**100 + 1), (1, 777), (2*10**6, 256*10**6)]:
    c = []; v = A(m, n, c); print('1.x', m, n if n < 10**9 else 'big', v if v < 10**20 else 'big', len(c), c[:6])
def carries(a, b):
    p = 0; w = 0
    while a > 0: s = a % 10 + b % 10 + w; w = 1 if s >= 10 else 0; p += w; a //= 10; b //= 10
    return p
for a, b in [(27732, 72619), (37932, 12528), (88765, 11111), (456789, 222222)]: print('2.1', a, b, carries(a, b))
for fn in ['pary_przyklad.txt', 'pary.txt']:
    P = [l.split() for l in lines(fn)]
    f = lambda s: sum(map(ord, s))
    b = max(P, key=lambda p: abs(f(p[0]) - f(p[1]))); print('3.1', fn, b, abs(f(b[0]) - f(b[1])))
    W = lambda a, c: sum(min(a.count(x), c.count(x)) for x in set(a))
    b = max(P, key=lambda p: W(*p)); print('3.2', fn, b, W(*b))
    def ps(a, c):
        best = 0
        for L in range(1, min(len(a), len(c)) + 1):
            if a[:L] == c[-L:] or c[:L] == a[-L:]: best = L
        return best
    print('3.3', fn, [(p[0], p[1], ps(*p)) for p in P if ps(*p) >= 5])
for fn in ['korpo_przyklad.txt', 'korpo.txt']:
    par = [int(x) for x in lines(fn)]; n = len(par)
    kids = Counter(par[1:])
    print('4.2', fn, sum(1 for i in range(1, n + 1) if kids[i] == 0))
    m = max(kids.values()); print('4.3', fn, min(i for i in kids if kids[i] == m), m)
    depth = [0] * (n + 1)
    for i in range(2, n + 1): depth[i] = depth[par[i-1]] + 1
    md = max(depth); print('4.4', fn, md, depth.count(md))
rows = [l.split('\t') for l in lines('staw.txt')]
print('7 head', rows[:2]); rows = rows[1:]
mon = defaultdict(list)
for d, t, o in rows: mon[int(d[5:7])].append(float(t.replace(',', '.')))
print('7.1', [round(sum(v) / len(v), 1) for m, v in sorted(mon.items())])
dry = {}
for m in range(1, 13):
    cur = best = 0
    for d, t, o in rows:
        if int(d[5:7]) != m: continue
        cur = cur + 1 if int(o) == 0 else 0; best = max(best, cur)
    dry[m] = best
print('7.2', dry)
def sim(fish):
    area = 2000.0; d = date(2023, 3, 1); day = 1; first = None; mx = area
    while d <= date(2023, 8, 31):
        if area > 7500 and first is None: first = (day, d)
        mx = max(mx, area)
        # day: fish eat, Friday catch; night: growth
        area -= fish * 0.25
        if d.weekday() == 4: area -= 60
        area = max(area, 0)
        area *= 1.0175
        area = min(area, 10000)
        d += timedelta(days=1); day += 1
    return first, mx
print('7.3', sim(80)[0])
d = date(2023, 3, 1); area = 2000.0
while d < date(2023, 4, 30):
    area -= 80 * 0.25
    if d.weekday() == 4: area -= 60
    area *= 1.0175; d += timedelta(days=1)
print('7 check 30.04', round(area / 100, 2))
f = 0
while sim(f)[1] > 5000: f += 1
print('7.4', f)
db = sqlite3.connect(':memory:')
for t in ['klienci', 'transakcje', 'opis_transakcji']:
    L = [l.split('\t') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[(int(x) if x.isdigit() else (float(x.replace(',', '.')) if re.match(r'^\d+,\d+$', x) else (None if x == '' else x))) for x in r] + [None] * (len(L[0]) - len(r)) for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('8 heads', [lines(t + '.txt')[:3] for t in ['klienci', 'transakcje', 'opis_transakcji']])
print('8.1', q("select Imie, Nazwisko, count(*) c from transakcje join klienci using(IdKlienta) group by IdKlienta order by c desc limit 3"))
print('8.2', q("select Plec, count(*) from klienci where IdKlienta not in (select IdKlienta from transakcje) group by Plec"))
print('8.3', q("select count(distinct IdSklepu), round(sum(Cena*Liczba),2) from transakcje join opis_transakcji using(IdTransakcji) where IdSprzedawcy is null"))
print('8.4', q("select IdSprzedawcy, substr(DataTransakcji,4,2) m, count(distinct IdSklepu) c from transakcje where IdSprzedawcy is not null group by IdSprzedawcy, m order by c desc limit 3"))
