#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("pi.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;
    for (size_t i = 0; i + 1 < dane.size(); i++) {
        int fragment = stoi(dane[i]) * 10 + stoi(dane[i + 1]);
        if (fragment > 90) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
