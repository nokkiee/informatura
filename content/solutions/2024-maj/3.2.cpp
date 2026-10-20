#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("skrot.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int ile = 0, najwieksza = 0;
    for (string liczba : dane) {
        // skrót nie istnieje, gdy wszystkie cyfry są parzyste
        bool parzyste = true;
        for (char c : liczba)
            if ((c - '0') % 2 != 0) parzyste = false;
        if (parzyste) {
            ile++;
            najwieksza = max(najwieksza, stoi(liczba));
        }
    }

    cout << ile << endl;
    cout << najwieksza << endl;
    return 0;
}
