import os, sqlite3, math, re
from collections import defaultdict, Counter
from datetime import datetime
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2025-czerwiec')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]

calls = [0]; adds = [0]
def f(a, b):
    calls[0] += 1
    if b == 0: return 0
    k = b % 10; w = f(a, b // 10); w *= 10
    while k > 0: w += a; k -= 1; adds[0] += 1
    return w
for a, b in [(42, 2), (4, 125), (103, 104)]: print('1.1', a, b, f(a, b))
calls[0] = 0; f(987654321, 123456789); print('1.2', calls[0])
for a, b in [(2024, 1000), (2024, 1234)]:
    adds[0] = 0; f(a, b); print('1.3', a, b, adds[0])
def half(k):
    s = str(k); n = len(s) // 2; return int(s[:n]), int(s[n:])
for fn in ['liczby1_przyklad.txt', 'liczby1.txt']:
    L = [int(x) for x in lines(fn)]
    print('2.2', fn, sum(1 for k in L if math.gcd(*half(k)) == 1))
def kap(n):
    s = str(n * n); return sum(1 for i in range(1, len(s)) if int(s[:i]) + int(s[i:]) <= n)
for fn in ['liczby2_przyklad.txt', 'liczby2.txt']:
    L = [int(x) for x in lines(fn)]
    m = max(kap(x) for x in L); print('2.3', fn, m, [x for x in L if kap(x) == m])
for fn in ['dane_przyklad.txt', 'dane.txt']:
    s = open(os.path.join(D, fn), encoding='utf-8').read().strip()
    nums = re.findall(r'\d+', s)
    print('3.1', fn, sum(1 for x in nums if x.startswith('50')))
    c = Counter(ch for ch in s if ch.isdigit()); d = max(c, key=c.get); print('3.2', fn, d, c[d])
    tel = [x for x in nums if len(x) == 9]
    print('3.3', fn, [x for x in tel if x[0] == '5'])
    m = min(len(set(x)) for x in tel); print('3.4', fn, [x for x in tel if len(set(x)) == m])
rows = [l.split('\t') for l in lines('fotowoltaika.txt')]
print('6 head', rows[:2]); rows = rows[1:]
fl = lambda x: float(x.replace(',', '.'))
print('6.1', round(sum(fl(r[4]) - fl(r[5]) + fl(r[6]) for r in rows), 4), 'jan', round(sum(fl(r[4]) - fl(r[5]) + fl(r[6]) for r in rows if r[0][5:7] == '01'), 4))
best = (0, None); cur = 1; start = 0
for i in range(1, len(rows)):
    if int(rows[i][3]) <= int(rows[i-1][3]) and fl(rows[i][4]) >= fl(rows[i-1][4]): cur += 1
    else: cur = 1; start = i
    if cur > best[0]: best = (cur, rows[start][0])
print('6.2', best)
grp = defaultdict(list)
for r in rows:
    t1 = datetime.strptime(r[1], '%H:%M:%S'); t2 = datetime.strptime(r[2], '%H:%M:%S')
    h = int((t2 - t1).total_seconds() // 3600); grp[h].append((fl(r[4]), fl(r[5]), fl(r[6])))
for h in sorted(grp): v = grp[h]; print('6.3', h, [round(sum(x[i] for x in v) / len(v), 6) for i in range(3)])
def konto(start):
    st = start; low = 0; mn = st
    for r in rows:
        st += 0.8 * fl(r[5]) - fl(r[6])
        if st < 50: low += 1
        mn = min(mn, st)
    return low, mn
print('6.4a', konto(100))
st = 100
for r in rows:
    if r[0][5:7] == '01': st += 0.8 * fl(r[5]) - fl(r[6])
print('6.4 jan check', round(st, 3))
lo = 0
while konto(lo)[1] < 0: lo += 1
print('6.4b', lo)
db = sqlite3.connect(':memory:')
for t in ['klienci', 'fryzjerzy', 'uslugi', 'wizyty']:
    L = [l.split('\t') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[int(x) if x.isdigit() else x for x in r] for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('7 heads', [lines(t + '.txt')[:2] for t in ['klienci', 'fryzjerzy', 'uslugi', 'wizyty']])
print('7.1', q("select imie, nazwisko, sum(cena) s from wizyty join klienci using(id_klienta) join uslugi using(id_uslugi) group by id_klienta order by s desc limit 2"))
print('7.2', q("select distinct k.imie, k.nazwisko, k.id_klienta from wizyty w join klienci k using(id_klienta) join fryzjerzy f using(id_fryzjera) where k.imie=f.imie order by k.imie, k.nazwisko"))
print('7.3', q("select round(sum(cena)*0.1,2) from wizyty join klienci using(id_klienta) join uslugi using(id_uslugi) where emeryt='TAK' and substr(termin,12,5) between '10:00' and '12:00'"))
print('7.4', q("select id_fryzjera, imie from fryzjerzy where id_fryzjera in (select id_fryzjera from wizyty where substr(termin,6,2)='04') and id_fryzjera not in (select id_fryzjera from wizyty join uslugi using(id_uslugi) where substr(termin,6,2)='04' and nazwa='Strzyzenie meskie') order by id_fryzjera"))
