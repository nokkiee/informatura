#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("anagram.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;
    for (size_t i = 0; i + 1 < dane.size(); i++) {
        int roznica = abs(stoi(dane[i], nullptr, 2) - stoi(dane[i + 1], nullptr, 2));
        if (roznica > wynik) wynik = roznica;
    }

    string binarnie = "";
    while (wynik > 0) {
        binarnie = char('0' + wynik % 2) + binarnie;
        wynik /= 2;
    }
    cout << binarnie << endl;
    return 0;
}
