#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long n;
    cin >> n;
    vector<long long> T(n);
    for (auto &x : T) cin >> x;

    // --- Twój algorytm ---
    long long k = 0;
    for (long long d = 1; d < n; d++) { // sprawdzamy każde możliwe k = d
        bool podobna = true;
        for (long long i = 0; i < d; i++) { // T[1..d] i T[n-d+1..n], w kodzie indeksy od 0
            if (T[i] != T[n - d + i]) podobna = false;
        }
        if (podobna) k = d;
    }

    cout << k << endl;
    return 0;
}
