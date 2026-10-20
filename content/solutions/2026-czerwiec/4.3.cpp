#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("mapa.txt");
    vector<long long> x, y, ludnosc;
    long long a, b, c;
    while (plik >> a >> b >> c) {
        x.push_back(a);
        y.push_back(b);
        ludnosc.push_back(c);
    }

    long long razem = 0; // ludność całej I ćwiartki
    for (size_t i = 0; i < x.size(); i++)
        if (x[i] > 0 && y[i] > 0) razem += ludnosc[i];

    long long bok = 0, wynik = 0;
    for (long long d = 1; 2 * d * d < razem; d++) { // przy większym boku gęstość na pewno nie przekroczy 2
        long long suma = 0;
        for (size_t i = 0; i < x.size(); i++)
            if (0 < x[i] && x[i] < d && 0 < y[i] && y[i] < d) suma += ludnosc[i]; // bez miast na krawędziach
        if (suma > 2 * d * d) { // gęstość suma / d² > 2, bez dzielenia
            bok = d;
            wynik = suma;
        }
    }

    cout << bok << " " << wynik << endl;
    return 0;
}
