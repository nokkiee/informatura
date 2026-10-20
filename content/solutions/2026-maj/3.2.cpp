#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("pary.txt");
    string s1, s2, para1, para2;
    int najwieksza = -1;
    while (plik >> s1 >> s2) {
        int ile1[26] = {0}, ile2[26] = {0};
        for (char c : s1) ile1[c - 'a']++;
        for (char c : s2) ile2[c - 'a']++;
        int suma = 0;
        for (int i = 0; i < 26; i++) suma += min(ile1[i], ile2[i]);
        if (suma > najwieksza) {
            najwieksza = suma;
            para1 = s1;
            para2 = s2;
        }
    }

    cout << para1 << " " << para2 << " " << najwieksza << endl;
    return 0;
}
