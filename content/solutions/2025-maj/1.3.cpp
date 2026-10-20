#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long n;
    cin >> n;

    // --- Twój algorytm ---
    long long w = 0;
    long long p = 1; // kolejne potęgi 100
    while (n > 0) {
        long long r = n % 100;
        long long a = r / 10;
        long long b = r % 10;
        if (n > 9) {
            w = w + p * a + 10 * p * b; // zamiana dwóch ostatnich cyfr miejscami
        } else {
            w = w + p * b; // została jedna cyfra
        }
        n = n / 100;
        p = p * 100;
    }

    cout << w << endl;
    return 0;
}
