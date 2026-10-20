#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>
#include <algorithm>
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
    map<string, int> ile; // liczba wystąpień każdej np-pary
    for (size_t i = 0; i < napis.size(); i += 2) ile[napis.substr(i, 2)]++;

    vector<pair<int, string>> pary; // (liczba wystąpień, para)
    for (auto [para, liczba] : ile) pary.push_back({liczba, para});
    sort(pary.begin(), pary.end());

    for (auto [liczba, para] : pary) cout << para;
    cout << endl;
    return 0;
}
