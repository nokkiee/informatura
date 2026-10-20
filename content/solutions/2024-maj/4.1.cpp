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

    vector<long long> pierwsze, liczby;
    long long x;
    istringstream w1(dane[0]), w2(dane[1]);
    while (w1 >> x) pierwsze.push_back(x);
    while (w2 >> x) liczby.push_back(x);

    int wynik = 0;
    for (long long p : pierwsze) {
        bool dzieli = false;
        for (long long y : liczby)
            if (y % p == 0) dzieli = true;
        if (dzieli) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
