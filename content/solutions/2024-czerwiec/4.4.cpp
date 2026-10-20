#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
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

    for (int runda = 1; runda <= 8; runda++) {
        for (int p = 1; p <= n; p++) gdzie[p] = odbiorca[gdzie[p]];
        if (runda == 1 || runda == 2 || runda == 4 || runda == 8) {
            vector<int> ile(n + 1, 0); // ile pakietów jest w każdym komputerze
            for (int p = 1; p <= n; p++) ile[gdzie[p]]++;
            cout << *max_element(ile.begin(), ile.end()) << " ";
        }
    }
    cout << endl;
    return 0;
}
