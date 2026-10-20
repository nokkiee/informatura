#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("dane.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    string napis = dane[0];
    int ile[10] = {0};
    for (char znak : napis)
        if (isdigit(znak)) ile[znak - '0']++;

    int cyfra = 0;
    for (int c = 1; c < 10; c++)
        if (ile[c] > ile[cyfra]) cyfra = c;
    cout << cyfra << " " << ile[cyfra] << endl;
    return 0;
}
