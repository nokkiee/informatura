#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("slowa4.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    for (string w : dane) {
        string s = w.substr(w.find(' ') + 1);
        string najmniejszy = s;
        for (size_t k = 0; k < s.size(); k++) {
            if (s.substr(k) < najmniejszy) najmniejszy = s.substr(k);
        }
        cout << najmniejszy << endl;
    }
    return 0;
}
