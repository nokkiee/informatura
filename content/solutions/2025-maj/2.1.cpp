#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("symbole.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    for (string napis : dane) {
        string odwrocony(napis.rbegin(), napis.rend());
        if (napis == odwrocony) cout << napis << endl;
    }
    return 0;
}
