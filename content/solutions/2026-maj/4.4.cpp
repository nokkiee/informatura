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
    vector<int> ilu(n + 1, 0); // ilu[i] – liczba przełożonych pracownika i
    for (int i = 2; i <= n; i++) {
        int szef = stoi(dane[i - 1]);
        ilu[i] = ilu[szef] + 1; // numer szefa jest mniejszy, więc ilu[szef] jest już policzone
    }

    int najwiecej = 0, ile = 0;
    for (int i = 1; i <= n; i++) {
        if (ilu[i] > najwiecej) {
            najwiecej = ilu[i];
            ile = 0;
        }
        if (ilu[i] == najwiecej) ile++;
    }
    cout << najwiecej << " " << ile << endl;
    return 0;
}
