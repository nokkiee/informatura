#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

// najdłuższe słowo, które jest początkiem s1 i końcem s2 albo początkiem s2 i końcem s1
int prefiksosufiks(const string &s1, const string &s2) {
    int najdluzszy = 0;
    int n = min(s1.size(), s2.size());
    for (int d = 1; d <= n; d++) {
        if (s1.substr(0, d) == s2.substr(s2.size() - d) || s2.substr(0, d) == s1.substr(s1.size() - d)) najdluzszy = d;
    }
    return najdluzszy;
}

int main() {
    ifstream plik("pary.txt");
    string s1, s2;
    while (plik >> s1 >> s2) {
        int d = prefiksosufiks(s1, s2);
        if (d >= 5) cout << s1 << " " << s2 << " " << d << endl;
    }
    return 0;
}
