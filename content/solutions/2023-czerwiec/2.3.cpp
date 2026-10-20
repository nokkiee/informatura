#include <iostream>
#include <string>
#include <vector>
using namespace std;

bool czy_mniejszy(long long n, const string &s, long long k1, long long k2) {
    long long i = k1, j = k2;
    while (i <= n && j <= n) {
        if (s[i - 1] == s[j - 1]) {
            i = i + 1;
            j = j + 1;
        } else if (s[i - 1] < s[j - 1]) {
            return true;
        } else {
            return false;
        }
    }
    return j <= n;
}

int main() {
    long long n;
    cin >> n;
    string s;
    cin >> s;

    // --- Twój algorytm ---
    vector<long long> T = {};
    for (long long i = 1; i <= n; i++) T.push_back(i);
    // sortowanie bąbelkowe, porównujące sufiksy funkcją czy_mniejszy
    for (long long i = 0; i < n - 1; i++) {
        for (long long j = 0; j < n - 1 - i; j++) {
            if (!czy_mniejszy(n, s, T[j], T[j + 1])) {
                long long x = T[j];
                T[j] = T[j + 1];
                T[j + 1] = x;
            }
        }
    }

    for (size_t i = 0; i < T.size(); i++) cout << T[i] << (i + 1 < T.size() ? " " : "");
    cout << endl;
    return 0;
}
