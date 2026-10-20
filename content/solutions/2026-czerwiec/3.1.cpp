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
    int wynik = 0;
    for (size_t i = 0; i + 4 <= napis.size(); i += 2) { // np-para na i oraz następna na i + 2
        if (napis.substr(i, 2) == napis.substr(i + 2, 2)) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
