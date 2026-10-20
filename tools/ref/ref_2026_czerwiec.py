import os, sqlite3, math, re
from collections import defaultdict, Counter
D = os.path.join(os.path.dirname(__file__), '..', '..', 'content', 'data', '2026-czerwiec')
def lines(name): return [l.rstrip('\r\n') for l in open(os.path.join(D, name), encoding='utf-8') if l.strip()]
def szyfr(T, k):
    n = len(T); a = n // k; c = n - a; S = [''] * (n + 1)
    for i in range(1, n + 1):
        if i % k == 0: b = i // k; S[n - a + b] = T[i - 1]
        else: S[c] = T[i - 1]; c -= 1
    return ''.join(S[1:])
print('1.1', szyfr('defragmentacja', 3), szyfr('tropikalny', 5), szyfr('serwer', 7), szyfr('serwer', 1))
def kpod(T):
    n = len(T)
    for k in range(n - 1, -1, -1):
        if T[:k] == T[n - k:]: return k
for T in [[1,2,1,1,2,1,1], [1,2,2], [2,2,2], [1,2,3,4], [3,5,3,5,3,5,3,5,3,5]]: print('2.x', T, kpod(T))
def isprime(x):
    if x < 2: return False
    i = 2
    while i * i <= x:
        if x % i == 0: return False
        i += 1
    return True
for fn in ['dane_przyklad.txt', 'dane.txt']:
    s = open(os.path.join(D, fn)).read().strip()
    P = [s[i:i+2] for i in range(0, len(s), 2)]
    print('3.1', fn, sum(1 for i in range(len(P) - 1) if P[i] == P[i+1]))
    best = ''
    pre = [0]
    for ch in s: pre.append(pre[-1] + ord(ch))
    for i in range(0, len(s), 2):
        for j in range(i + 2, len(s) + 1, 2):
            if j - i > len(best) and isprime(pre[j] - pre[i]): best = s[i:j]
    print('3.2', fn, len(best), best[:60], '...', best[-20:])
    c = Counter(P); print('3.3', fn, ''.join(sorted(c, key=c.get)))
for fn in ['mapa_przyklad.txt', 'mapa.txt']:
    M = [tuple(map(int, l.split())) for l in lines(fn)]
    i = max(range(len(M)), key=lambda i: M[i][2]); print('4.1', fn, i + 1, M[i][2])
    dm = min(abs(M[a][0]-M[b][0]) + abs(M[a][1]-M[b][1]) for a in range(len(M)) for b in range(a+1, len(M)))
    print('4.2', fn, dm, [(a+1, b+1) for a in range(len(M)) for b in range(a+1, len(M)) if abs(M[a][0]-M[b][0]) + abs(M[a][1]-M[b][1]) == dm])
    best = None
    for a in range(1, 600):
        pop = sum(w for x, y, w in M if 0 < x < a and 0 < y < a)
        if pop / (a * a) > 2: best = (a, pop)
    print('4.3', fn, best)
rows = [l.split('\t') for l in lines('dostawy.txt')]
print('7 head', rows[:2]); rows = rows[1:]
day = defaultdict(int)
for nr, d, dost, kg in rows: day[d] += int(kg)
b = max(day, key=day.get); print('7.1', b, day[b])
pairs = Counter((d, dost) for nr, d, dost, kg in rows); print('7.2', sum(1 for v in pairs.values() if v == 2))
mon = defaultdict(int)
for nr, d, dost, kg in rows: mon[int(d[3:5])] += int(kg)
print('7.3', dict(mon))
days = list(dict.fromkeys(d for nr, d, dost, kg in rows))
def sim(cap):
    st = 5000; best = (0, None); full = True
    for d in days:
        if st >= cap: st -= cap
        else: full = False; st = 0
        st += day[d]
        if st > best[0]: best = (st, d)
    return best, full
print('7.4', sim(3900)[0])
c = 3900
while not sim(c)[1]: c -= 1
print('7.5', c, sim(c + 1)[1])
db = sqlite3.connect(':memory:')
for t in ['uczniowie', 'nauczyciele', 'oceny']:
    L = [l.split('\t') for l in lines(t + '.txt')]
    db.execute(f"create table {t} ({', '.join(L[0])})")
    db.executemany(f"insert into {t} values ({','.join('?'*len(L[0]))})", [[int(x) if x.isdigit() else x for x in r] for r in L[1:]])
q = lambda s: db.execute(s).fetchall()
print('8 heads', [lines(t + '.txt')[:2] for t in ['uczniowie', 'nauczyciele', 'oceny']])
print('8.1', q("select Plec, round(avg(Ocena),2) from oceny join uczniowie using(Id_Ucznia) join nauczyciele using(Id_Naucz) where Przedmiot='matematyka' group by Plec"))
print('8.2', q("select Id_Naucz from nauczyciele where Id_Naucz not in (select Id_Naucz from oceny where Ocena=1 and Data between '2023-12-01' and '2023-12-31') order by Id_Naucz"))
res = q("select cast(substr(Data,6,2) as int) m, Ocena, count(*) c from oceny group by m, Ocena")
by = defaultdict(list)
for m, o, c in res: by[m].append((c, o))
print('8.3', [(m, min(v)[1], min(v)[0]) for m, v in sorted(by.items())])
