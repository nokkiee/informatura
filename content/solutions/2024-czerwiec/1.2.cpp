#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long w;
    cin >> w;
    long long k;
    cin >> k;
    long long n;
    cin >> n;

    // --- Twój algorytm ---
    long long x = 0;
    long long dl = 0; // liczba cyfr zapisu binarnego n
    long long pom = n;
    while (pom > 0) {
        pom = pom / 2;
        dl = dl + 1;
    }
    long long poz = (w * k - 1) % dl; // która cyfra (licząc od lewej, od 0) trafi do prawego dolnego rogu
    for (long long i = 0; i < dl - 1 - poz; i++) {
        n = n / 2; // usuwamy cyfry stojące na prawo od niej
    }
    x = n % 2;

    cout << x << endl;
    return 0;
}
