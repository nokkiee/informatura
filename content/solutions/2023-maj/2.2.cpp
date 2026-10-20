#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("bin.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;
    for (string liczba : dane) {
        int bloki = 1;
        for (size_t i = 1; i < liczba.size(); i++) {
            if (liczba[i] != liczba[i - 1]) bloki++;
        }
        if (bloki <= 2) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
