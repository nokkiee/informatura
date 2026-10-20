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

    int wynik = 0;
    for (string liczba : liczby)
        if (liczba.substr(0, 2) == "50") wynik++;

    cout << wynik << endl;
    return 0;
}
