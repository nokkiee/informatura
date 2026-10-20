#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long k;
    cin >> k;

    // --- Twój algorytm ---
    long long a = 0;
    long long b = 0;
    long long dlugosc = 0; // liczba cyfr k
    long long x = k;
    while (x > 0) {
        x = x / 10;
        dlugosc = dlugosc + 1;
    }
    long long potega = 1;
    for (long long i = 0; i < dlugosc / 2; i++) {
        b = b + potega * (k % 10); // przenosimy ostatnią cyfrę k do b
        k = k / 10;
        potega = potega * 10;
    }
    a = k;

    cout << a << endl;
    cout << b << endl;
    return 0;
}
