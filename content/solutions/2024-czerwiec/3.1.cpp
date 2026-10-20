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

    int wynik = 0;
    for (string slowo : dane) {
        for (size_t i = 0; i + 2 < slowo.size(); i++) {
            if (slowo[i] == 'k' && slowo[i + 2] == 't') {
                wynik++;
                break;
            }
        }
    }

    cout << wynik << endl;
    return 0;
}
