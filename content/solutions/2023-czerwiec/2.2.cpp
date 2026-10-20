#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

bool czy_mniejszy(int n, const string &s, int k1, int k2) {
    int i = k1, j = k2;
    while (i <= n && j <= n) {
        if (s[i - 1] == s[j - 1]) {
            i++;
            j++;
        } else if (s[i - 1] < s[j - 1]) {
            return true;
        } else {
            return false;
        }
    }
    return j <= n;
}

int main() {
    for (string nazwa : {"slowa1.txt", "slowa2.txt", "slowa3.txt"}) {
        ifstream plik(nazwa);
        int n, k1, k2;
        string s;
        plik >> n >> s >> k1 >> k2;
        cout << nazwa << " " << (czy_mniejszy(n, s, k1, k2) ? "TAK" : "NIE") << endl;
    }
    return 0;
}
