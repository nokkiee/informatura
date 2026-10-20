#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
using namespace std;

int main() {
    ifstream plik("liczby.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    vector<long long> a;
    long long x;
    istringstream w1(dane[0]);
    while (w1 >> x) a.push_back(x);
    int n = a.size();
    vector<long long> suma(n + 1, 0); // suma[i] = a[0] + … + a[i-1]
    for (int i = 0; i < n; i++) suma[i + 1] = suma[i] + a[i];

    double najlepsza = -1;
    int dlugosc = 0, poczatek = 0;
    for (int i = 0; i < n; i++) {
        for (int j = i + 50; j <= n; j++) {
            double srednia = (double)(suma[j] - suma[i]) / (j - i);
            if (srednia > najlepsza) {
                najlepsza = srednia;
                dlugosc = j - i;
                poczatek = i;
            }
        }
    }

    cout.precision(10);
    cout << najlepsza << " " << dlugosc << " " << a[poczatek] << endl;
    return 0;
}
