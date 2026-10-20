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
    ifstream plik("skrot2.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    for (string liczba : dane) {
        string skrot = "";
        for (char c : liczba)
            if ((c - '0') % 2 == 1) skrot += c;
        int n = stoi(liczba), m = stoi(skrot);
        if (nwd(n, m) == 7) cout << n << endl;
    }
    return 0;
}
