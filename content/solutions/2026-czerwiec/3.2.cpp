#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

bool pierwsza(int x) {
    if (x < 2) return false;
    for (int d = 2; d * d <= x; d++)
        if (x % d == 0) return false;
    return true;
}

int main() {
    ifstream plik("dane.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    string napis = dane[0];
    int n = napis.size();
    vector<int> suma(n + 1, 0); // suma[i] – suma kodów pierwszych i znaków
    for (int i = 0; i < n; i++) suma[i + 1] = suma[i] + napis[i];

    string najdluzszy = "";
    for (int i = 0; i < n; i += 2) {             // fragment zaczyna się na początku np-pary…
        for (int j = i + 2; j <= n; j += 2) {    // …i kończy na końcu np-pary
            if (j - i > (int)najdluzszy.size() && pierwsza(suma[j] - suma[i])) najdluzszy = napis.substr(i, j - i);
        }
    }

    cout << najdluzszy << endl;
    return 0;
}
