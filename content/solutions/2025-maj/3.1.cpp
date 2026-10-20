#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int nwd(int a, int b) {
    while (b > 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int main() {
    ifstream plik("dron.txt");
    int a, b;
    int wynik = 0;
    while (plik >> a >> b) {
        if (nwd(abs(a), abs(b)) > 1) wynik++;
    }

    cout << wynik << endl;
    return 0;
}
