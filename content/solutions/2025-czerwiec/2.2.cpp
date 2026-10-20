#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int nwd(int a, int b) {
    while (b > 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main() {
    ifstream plik("liczby1.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;
    for (string liczba : dane) {
        int polowa = liczba.size() / 2;
        int a = stoi(liczba.substr(0, polowa));
        int b = stoi(liczba.substr(polowa));
        if (nwd(a, b) == 1) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
