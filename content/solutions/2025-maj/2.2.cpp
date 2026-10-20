#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("symbole.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    vector<pair<int, int>> srodki;
    for (int i = 1; i + 1 < (int)dane.size(); i++) {
        for (int j = 1; j + 1 < (int)dane[i].size(); j++) {
            // wszystkie 9 pól kwadratu o środku (i, j) mają ten sam symbol co środek
            bool takieSame = true;
            for (int di = -1; di <= 1; di++)
                for (int dj = -1; dj <= 1; dj++)
                    if (dane[i + di][j + dj] != dane[i][j]) takieSame = false;
            if (takieSame) srodki.push_back({i + 1, j + 1});
        }
    }

    cout << srodki.size() << endl;
    for (auto [w, p] : srodki) cout << w << " " << p << endl;
    return 0;
}
