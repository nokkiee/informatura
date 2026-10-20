#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long n;
    cin >> n;

    // --- Twój algorytm ---
    long long b = 0;
    long long poprzednia = -1;
    while (n > 0) {
        long long cyfra = n % 2;
        if (cyfra != poprzednia) {
            b = b + 1;
        }
        poprzednia = cyfra;
        n = n / 2;
    }

    cout << b << endl;
    return 0;
}
