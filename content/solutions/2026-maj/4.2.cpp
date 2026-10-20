#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("korpo.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int n = dane.size();
    vector<bool> maPodwladnych(n + 1, false);
    for (string x : dane) maPodwladnych[stoi(x)] = true;
    int wynik = 0;
    for (int i = 1; i <= n; i++)
        if (!maPodwladnych[i]) wynik++;

    cout << wynik << endl;
    return 0;
}
