#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

string rot13(string slowo) {
    for (char &c : slowo) c = (c - 'a' + 13) % 26 + 'a';
    return slowo;
}

int main() {
    ifstream plik("slowa.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;
    string najdluzsze = "";
    for (string slowo : dane) {
        string odwrocone(slowo.rbegin(), slowo.rend());
        if (rot13(slowo) == odwrocone) {
            wynik++;
            if (slowo.size() > najdluzsze.size()) najdluzsze = slowo;
        }
    }

    cout << wynik << endl;
    cout << najdluzsze << endl;
    return 0;
}
