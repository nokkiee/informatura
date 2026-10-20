#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("odbiorcy.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int n = dane.size();
    vector<int> odbiorca(n + 1), gdzie(n + 1); // gdzie[p] – komputer, w którym jest pakiet p
    for (int i = 1; i <= n; i++) {
        odbiorca[i] = stoi(dane[i - 1]);
        gdzie[i] = i;
    }

    int runda = 0, pakiet = 0;
    while (pakiet == 0) {
        runda++;
        for (int p = 1; p <= n; p++) gdzie[p] = odbiorca[gdzie[p]];
        for (int p = 1; p <= n; p++) {
            if (gdzie[p] == p) {
                pakiet = p;
                break;
            }
        }
    }

    cout << runda << " " << pakiet << endl;
    return 0;
}
