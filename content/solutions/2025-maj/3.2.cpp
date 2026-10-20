#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <set>
using namespace std;

int main() {
    ifstream plik("dron.txt");
    vector<pair<int, int>> punkty;
    int a, b, x = 0, y = 0;
    while (plik >> a >> b) {
        x += a;
        y += b;
        punkty.push_back({x, y});
    }

    // a) punkty ściśle wewnątrz kwadratu
    int wynik = 0;
    for (auto [px, py] : punkty)
        if (0 < px && px < 5000 && 0 < py && py < 5000) wynik++;
    cout << wynik << endl;

    // b) para punktów, której środek też jest jednym z punktów
    set<pair<int, int>> zbior(punkty.begin(), punkty.end());
    for (size_t i = 0; i < punkty.size(); i++) {
        for (size_t j = i + 1; j < punkty.size(); j++) {
            auto [x1, y1] = punkty[i];
            auto [x2, y2] = punkty[j];
            if ((x1 + x2) % 2 == 0 && (y1 + y2) % 2 == 0) {
                pair<int, int> srodek = {(x1 + x2) / 2, (y1 + y2) / 2};
                if (zbior.count(srodek) && srodek != punkty[i]) {
                    cout << x1 << " " << y1 << endl;
                    cout << srodek.first << " " << srodek.second << endl;
                    cout << x2 << " " << y2 << endl;
                }
            }
        }
    }
    return 0;
}
