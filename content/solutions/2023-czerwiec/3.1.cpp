#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("anagram.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int zrownowazone = 0, prawie = 0;
    for (string liczba : dane) {
        int zera = 0, jedynki = 0;
        for (char c : liczba) {
            if (c == '0') zera++;
            else jedynki++;
        }
        if (zera == jedynki) zrownowazone++;
        else if (abs(zera - jedynki) == 1) prawie++;
    }

    cout << zrownowazone << endl;
    cout << prawie << endl;
    return 0;
}
