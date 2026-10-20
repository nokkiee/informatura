#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

long long wartosc(const string &napis) {
    long long w = 0;
    for (char znak : napis) w = w * 3 + (znak == 'o' ? 0 : znak == '+' ? 1 : 2);
    return w;
}

int main() {
    ifstream plik("symbole.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    string wynik = dane[0];
    for (string napis : dane)
        if (wartosc(napis) > wartosc(wynik)) wynik = napis;

    cout << wartosc(wynik) << " " << wynik << endl;
    return 0;
}
