#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <algorithm>
using namespace std;

int main() {
    ifstream plik("liczby.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    vector<int> pierwsze;
    int x;
    istringstream w1(dane[0]);
    while (w1 >> x) pierwsze.push_back(x);
    sort(pierwsze.begin(), pierwsze.end(), greater<int>());
    int wynik = pierwsze[100]; // sto pierwsza od największej

    cout << wynik << endl;
    return 0;
}
