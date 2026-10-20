#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <map>
using namespace std;

int main() {
    ifstream plik("liczby.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    map<long long, int> ile; // ile razy każda liczba pierwsza występuje w pierwszym wierszu
    vector<long long> liczby;
    long long x;
    istringstream w1(dane[0]), w2(dane[1]);
    while (w1 >> x) ile[x]++;
    while (w2 >> x) liczby.push_back(x);

    for (long long y : liczby) {
        long long reszta = y;
        for (auto [p, k] : ile) {
            while (k > 0 && reszta % p == 0) {
                reszta /= p;
                k--;
            }
        }
        if (reszta == 1) cout << y << endl;
    }
    return 0;
}
