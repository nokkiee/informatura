#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

// część rosnąca c[0..k-1] i malejąca c[k..], każda co najmniej z 2 elementów
bool rosnacoMalejacy(const vector<int> &c) {
    int n = c.size();
    for (int k = 2; k <= n - 2; k++) {
        bool rosnie = true, maleje = true;
        for (int i = 0; i + 1 < k; i++)
            if (c[i] >= c[i + 1]) rosnie = false;
        for (int i = k; i + 1 < n; i++)
            if (c[i] <= c[i + 1]) maleje = false;
        if (rosnie && maleje) return true;
    }
    return false;
}

int main() {
    ifstream plik("pi.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int wynik = 0;
    for (size_t i = 0; i + 6 <= dane.size(); i++) {
        vector<int> okno;
        for (size_t j = i; j < i + 6; j++) okno.push_back(stoi(dane[j]));
        if (rosnacoMalejacy(okno)) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
