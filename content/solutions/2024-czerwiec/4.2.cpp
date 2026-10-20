#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("odbiorcy.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int n = dane.size();
    vector<bool> dostaje(n + 1, false); // czy komputer jest czyimś odbiorcą
    for (string x : dane) dostaje[stoi(x)] = true;
    int wynik = 0;
    for (int i = 1; i <= n; i++)
        if (!dostaje[i]) wynik++;

    cout << wynik << endl;
    return 0;
}
