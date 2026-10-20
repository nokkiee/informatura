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
    vector<int> podwladni(n + 1, 0); // liczba bezpośrednich podwładnych każdego pracownika
    for (string x : dane)
        if (stoi(x) > 0) podwladni[stoi(x)]++;

    int pracownik = 1;
    for (int i = 2; i <= n; i++)
        if (podwladni[i] > podwladni[pracownik]) pracownik = i;
    cout << pracownik << " " << podwladni[pracownik] << endl;
    return 0;
}
