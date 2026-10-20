#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long n;
    cin >> n;

    // --- Twój algorytm ---
    long long m = 0;
    long long p = 1;
    while (n > 0) {
        long long cyfra = n % 10;
        if (cyfra % 2 != 0) {
            m = m + cyfra * p;
            p = p * 10;
        }
        n = n / 10;
    }

    cout << m << endl;
    return 0;
}
