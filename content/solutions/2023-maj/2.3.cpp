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

    int wynik = 0; // numer wiersza z największą liczbą
    for (int i = 1; i < (int)dane.size(); i++) {
        if (stoi(dane[i], nullptr, 2) > stoi(dane[wynik], nullptr, 2)) wynik = i;
    }

    cout << dane[wynik] << endl;
    return 0;
}
