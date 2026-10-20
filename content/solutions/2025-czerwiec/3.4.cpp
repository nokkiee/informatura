#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("dane.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    string napis = dane[0];
    vector<string> liczby; // wszystkie ukryte liczby, jako napisy (zera z przodu zostają)
    string biezaca = "";
    for (char znak : napis + " ") {
        if (isdigit(znak)) {
            biezaca += znak;
        } else if (!biezaca.empty()) {
            liczby.push_back(biezaca);
            biezaca = "";
        }
    }

    vector<string> telefony;
    for (string liczba : liczby)
        if (liczba.size() == 9) telefony.push_back(liczba);

    // liczba różnych cyfr w numerze
    auto rozne = [](const string &t) {
        bool byla[10] = {false};
        int ile = 0;
        for (char c : t) {
            if (!byla[c - '0']) ile++;
            byla[c - '0'] = true;
        }
        return ile;
    };
    int najmniej = 10;
    for (string t : telefony) najmniej = min(najmniej, rozne(t));
    for (string t : telefony)
        if (rozne(t) == najmniej) cout << t << endl;
    return 0;
}
