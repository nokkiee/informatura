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

    for (string liczba : dane) {
        int p = stoi(liczba, nullptr, 2);
        int wynik = p ^ (p / 2);
        string binarnie = "";
        while (wynik > 0) {
            binarnie = char('0' + wynik % 2) + binarnie;
            wynik /= 2;
        }
        cout << binarnie << endl;
    }
    return 0;
}
