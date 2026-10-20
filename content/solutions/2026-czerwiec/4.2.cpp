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

    int n = x.size();
    int najmniejsza = 1000000000;
    vector<pair<int, int>> pary;
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int d = abs(x[i] - x[j]) + abs(y[i] - y[j]);
            if (d < najmniejsza) {
                najmniejsza = d;
                pary.clear();
            }
            if (d == najmniejsza) pary.push_back({i + 1, j + 1});
        }
    }

    cout << najmniejsza << endl;
    for (auto [p, q] : pary) cout << p << " " << q << endl;
    return 0;
}
