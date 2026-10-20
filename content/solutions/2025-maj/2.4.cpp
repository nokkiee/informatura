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

    const string SYMBOL = "o+*";
    long long suma = 0;
    for (string napis : dane) {
        long long w = 0;
        for (char znak : napis) w = w * 3 + SYMBOL.find(znak);
        suma += w;
    }

    string zapis = "";
    for (long long x = suma; x > 0; x /= 3) zapis = SYMBOL[x % 3] + zapis;

    cout << suma << " " << zapis << endl;
    return 0;
}
