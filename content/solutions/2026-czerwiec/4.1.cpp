#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("mapa.txt");
    vector<int> x, y, ludnosc;
    int a, b, c;
    while (plik >> a >> b >> c) {
        x.push_back(a);
        y.push_back(b);
        ludnosc.push_back(c);
    }

    int nr = 0;
    for (size_t i = 0; i < ludnosc.size(); i++)
        if (ludnosc[i] > ludnosc[nr]) nr = i;

    cout << nr + 1 << " " << ludnosc[nr] << endl;
    return 0;
}
