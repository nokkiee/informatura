#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

vector<int> cyfry;

// długość najdłuższego ciągu rosnąco-malejącego od pozycji start (0, gdy takiego nie ma)
int najdluzszyOd(int start) {
    int n = cyfry.size();
    int koniec = start + 1;
    while (koniec < n && cyfry[koniec] > cyfry[koniec - 1]) koniec++;
    int najlepszy = 0;
    // część rosnąca: start … k-1, część malejąca: od k
    for (int k = start + 2; k <= koniec; k++) {
        int m = k + 1;
        while (m < n && cyfry[m] < cyfry[m - 1]) m++;
        if (m - k >= 2) najlepszy = max(najlepszy, m - start);
    }
    return najlepszy;
}

int main() {
    ifstream plik("pi.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    for (string c : dane) cyfry.push_back(stoi(c));
    int pozycja = 0, dlugosc = 0;
    for (int i = 0; i < (int)cyfry.size(); i++) {
        int d = najdluzszyOd(i);
        if (d > dlugosc) {
            dlugosc = d;
            pozycja = i;
        }
    }

    cout << pozycja + 1 << endl;
    for (int i = pozycja; i < pozycja + dlugosc; i++) cout << dane[i];
    cout << endl;
    return 0;
}
