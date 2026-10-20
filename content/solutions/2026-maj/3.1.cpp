#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int f(const string &s) {
    int suma = 0;
    for (char c : s) suma += c;
    return suma;
}

int main() {
    ifstream plik("pary.txt");
    string s1, s2, para1, para2;
    int najwieksza = -1;
    while (plik >> s1 >> s2) {
        int roznica = abs(f(s1) - f(s2));
        if (roznica > najwieksza) {
            najwieksza = roznica;
            para1 = s1;
            para2 = s2;
        }
    }

    cout << para1 << " " << para2 << " " << najwieksza << endl;
    return 0;
}
