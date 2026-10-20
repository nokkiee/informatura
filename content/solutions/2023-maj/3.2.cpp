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

    int ile[100] = {0};
    for (size_t i = 0; i + 1 < dane.size(); i++) {
        ile[stoi(dane[i]) * 10 + stoi(dane[i + 1])]++;
    }

    int najrzadszy = 0, najczestszy = 0;
    for (int f = 0; f < 100; f++) {
        if (ile[f] < ile[najrzadszy]) najrzadszy = f;
        if (ile[f] > ile[najczestszy]) najczestszy = f;
    }

    cout << (najrzadszy < 10 ? "0" : "") << najrzadszy << " " << ile[najrzadszy] << endl;
    cout << (najczestszy < 10 ? "0" : "") << najczestszy << " " << ile[najczestszy] << endl;
    return 0;
}
