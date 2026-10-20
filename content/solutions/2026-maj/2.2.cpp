#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    long long a;
    cin >> a;
    long long b;
    cin >> b;

    // --- Twój algorytm ---
    long long p = 0;
    long long w_pamieci = 0; // przeniesienie z poprzedniej kolumny
    while (a > 0) {
        long long suma = a % 10 + b % 10 + w_pamieci;
        if (suma >= 10) {
            w_pamieci = 1;
            p = p + 1;
        } else {
            w_pamieci = 0;
        }
        a = a / 10;
        b = b / 10;
    }

    cout << p << endl;
    return 0;
}
