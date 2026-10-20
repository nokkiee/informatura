#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int stopien(long long n) {
    string kwadrat = to_string(n * n);
    int ile = 0;
    for (size_t i = 1; i < kwadrat.size(); i++) { // cięcie po i-tej cyfrze
        if (stoll(kwadrat.substr(0, i)) + stoll(kwadrat.substr(i)) <= n) ile++;
    }
    return ile;
}

int main() {
    ifstream plik("liczby2.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int najlepszy = -1;
    long long liczba = 0;
    for (string w : dane) {
        long long n = stoll(w);
        int s = stopien(n);
        if (s > najlepszy) {
            najlepszy = s;
            liczba = n;
        }
    }

    cout << najlepszy << endl;
    cout << liczba << endl;
    return 0;
}
