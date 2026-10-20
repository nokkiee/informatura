#include <iostream>
#include <fstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    ifstream plik("anagram.txt");
    vector<string> dane;
    string wiersz;
    while (getline(plik, wiersz)) {
        if (!wiersz.empty() && wiersz.back() == '\r') wiersz.pop_back();
        dane.push_back(wiersz);
    }

    int bezZera = 0, najwiekszaSuma = -1;
    string najlepsza = "";
    for (string liczba : dane) {
        string dziesietnie = to_string(stoi(liczba, nullptr, 2));
        if (dziesietnie.find('0') == string::npos) bezZera++;
        bool byla[10] = {false};
        int suma = 0;
        for (char c : dziesietnie) {
            if (!byla[c - '0']) suma += c - '0';
            byla[c - '0'] = true;
        }
        if (suma > najwiekszaSuma) {
            najwiekszaSuma = suma;
            najlepsza = dziesietnie;
        }
    }

    cout << bezZera << endl;
    cout << najlepsza << endl;
    return 0;
}
