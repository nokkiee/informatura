#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("slowa.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    for (string slowo : dane) {
        int ile[26] = {0};
        int najczestsza = 0;
        for (char c : slowo) {
            ile[c - 'a']++;
            najczestsza = max(najczestsza, ile[c - 'a']);
        }
        if (2 * najczestsza >= (int)slowo.size()) cout << slowo << endl;
    }
    return 0;
}
